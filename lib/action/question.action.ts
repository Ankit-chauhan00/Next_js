"use server";

import { ActionResponse, ErrorResponse, PaginatedSearchParams, Questions } from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  getQuestionSchema,
  incrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import mongoose, { QueryFilter, Types } from "mongoose";
import Question, { IQuestionDoc } from "@/database/question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tagQuestion.model";
import dbConnect from "../mongoose";
import {
  CreateQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
  IncrementViewsParams,
  RecommendationParams,
} from "@/types/action";
import { after } from "next/server";
import { CreateIntaction } from "./intraction.action";
import { Intraction } from "@/database";
import { cache } from "react";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<Questions>> {
  const validationResult = await action({ params, schema: AskQuestionSchema, authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  // Validate that userId is a valid MongoDB ObjectID (24 hex chars)
  if (!userId || (typeof userId === "string" && userId.length !== 24)) {
    return handleError(new Error(`Invalid user ID format: expected MongoDB ObjectID, got ${userId}`)) as ErrorResponse;
  }

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert userId to ObjectID explicitly
    const authorId = new mongoose.Types.ObjectId(userId as string);
    const [question] = await Question.create([{ title, content, author: authorId }], { session });

    if (!question) throw new Error("Failed to create question");

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocument = [];

    for (const tag of tags) {
      const existingTags = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTags._id);
      tagQuestionDocument.push({
        tag: existingTags._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocument, { session });

    await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagIds } } }, { session });

    await session.commitTransaction();

    // log the intraction
    after(async () => {
      await CreateIntaction({
        action: "post",
        actionId: question._id.toString(),
        actionTarget: "question",
        authorId: userId as string,
      });
    });

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new Error("Unauthorized");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const tagsToAdd = tags.filter(
      (tag) => !question.tags.some((t: ITagDoc) => t.name.toLowerCase().includes(tag.toLowerCase()))
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) => !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany({ _id: { $in: tagIdsToRemove } }, { $inc: { questions: -1 } }, { session });

      await TagQuestion.deleteMany({ tag: { $in: tagIdsToRemove }, question: questionId }, { session });

      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) => !tagIdsToRemove.some((id: mongoose.Types.ObjectId) => id.equals(tag._id))
      );
    }

    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<Questions>> {
  const validationResult = await action({
    params,
    schema: getQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;

  try {
    await dbConnect();
    const question = await Question.findById(questionId).populate("tags").populate("author", "_id name image");

    if (!question) throw new Error("Question not found");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export const getQuestions = cache(async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Questions[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = await params;

  // example if we are on page 3 then 3-1 = 2 * 10 = 20, we have to skip 20 question to get on that page
  const skip = (Number(page) - 1) * pageSize;

  const limit = Number(pageSize);

  const filterQuery: QueryFilter<typeof Question> = {};

  if (filter === "recommended") return { success: true, data: { questions: [], isNext: false } };

  if (query) {
    filterQuery.$or = [{ title: { $regex: new RegExp(query, "i") } }, { content: { $regex: new RegExp(query, "i") } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;

    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;

    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    await dbConnect();
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: { questions: JSON.parse(JSON.stringify(questions)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
});

export async function incrementViews(params: IncrementViewsParams): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: incrementViewsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;

  try {
    await dbConnect();
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not Found");

    question.views += 1;
    await question.save();

    return { success: true, data: { views: question.views } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Questions[]>> {
  try {
    await dbConnect();

    const question = await Question.find().sort({ views: -1, upvotes: -1 }).limit(5);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getRecommendedQuestion({ userId, query, skip, limit }: RecommendationParams) {
  await dbConnect();
  // get user latest interaction
  const interaction = await Intraction.find({
    user: new Types.ObjectId(userId),
    actionType: "question",
    actions: { $in: ["view", "upvote", "bookmark", "post"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const interactedQuestionIds = interaction.map((i) => i.actionId);

  // get Tags from interacted question

  const intreractedQuestion = await Question.find({
    _id: { $in: interactedQuestionIds },
  }).select("tags");

  // get Unique Tags
  const allTags = intreractedQuestion.flatMap((q) => q.tags.map((tag: Types.ObjectId) => tag.toString()));

  // remove dublicate

  const uniqueTagIds = [...new Set(allTags)];

  const recommendedQuery: QueryFilter<typeof Question> = {
    // exclude interacted questions
    _id: { $nin: interactedQuestionIds },

    // exclude the user's own questions
    author: { $ne: new Types.ObjectId(userId) },

    // include questions with any of the unique tags
    tags: { $in: uniqueTagIds.map((id) => new Types.ObjectId(id)) },
  };

  if (query) {
    recommendedQuery.$or = [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }];
  }

  const total = await Question.countDocuments(recommendedQuery);

  const questions = await Question.find(recommendedQuery)
    .populate("tags", "name")
    .populate("author", "name image")
    .sort({ upvotes: -1, views: -1 }) // prioritizing engagement
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    questions: JSON.parse(JSON.stringify(questions)),
    isNext: total > skip + questions.length,
  };
}
