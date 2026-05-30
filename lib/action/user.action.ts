"use server";

import {
  ActionResponse,
  Answer,
  Badges,
  ErrorResponse,
  PaginatedSearchParams,
  Questions,
  Tagg,
  Users,
} from "@/types/global";
import action from "../handlers/action";
import {
  DeleteUserAnswerSchema,
  DeleteUserQuestionSchema,
  GetUserAnswerSchema,
  GetUserquestionSchema,
  getUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import { PipelineStage, QueryFilter, Types } from "mongoose";
import { Answers, Collection, Question, Tag, TagQuestion, User, Vote } from "@/database";
import {
  DeleteUserAnswerPArams,
  DeletUserQuestionParams,
  GetUserAnswersParams,
  GetUserParams,
  GetUserQuestionParams,
  GetUserTagsParams,
} from "@/types/action";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { CreateIntaction } from "./intraction.action";
import { assignBadges } from "../utils";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: Users[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = params;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: QueryFilter<typeof User> = {};

  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery);

    const users = await User.find(filterQuery).sort(sortCriteria).skip(skip).limit(limit);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(
  params: GetUserParams
): Promise<ActionResponse<{ user: Users; totalQuestions: number; totalAnswers: number }>> {
  const validationResult = await action({ params, schema: getUserSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { userId } = params;
  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not Found");

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalAnswers = await Answers.countDocuments({ author: userId });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestion(
  params: GetUserQuestionParams
): Promise<ActionResponse<{ questions: Questions[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserquestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const totalQuestions = await Question.countDocuments({ author: userId });

    const questions = await Question.find({ author: userId })
      .populate("tags", "name")
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserAnswers(
  params: GetUserAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: GetUserAnswerSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const totalAnswers = await Answers.countDocuments({ author: userId });

    const answers = await Answers.find({ author: userId }).populate("author", "_id name image").skip(skip).limit(limit);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTags(
  params: GetUserTagsParams
): Promise<ActionResponse<{ tags: { _id: string; name: string; count: number }[] }>> {
  const validationResult = await action({
    params,
    schema: GetUserTagsSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { userId } = params;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      { $unwind: "$tagInfo" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: "$tagInfo._id",
          name: "$tagInfo.name",
          count: 1,
        },
      },
    ];

    const tags = await Question.aggregate(pipeline);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteUserQuestion(params: DeletUserQuestionParams): Promise<ActionResponse> {
  const validatedResult = await action({
    params,
    schema: DeleteUserQuestionSchema,
    authorize: true,
  });

  if (validatedResult instanceof Error) return handleError(validatedResult) as ErrorResponse;

  const { questionId } = validatedResult.params!;
  const { user } = validatedResult.session!;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error("Question not Found");

    if (question.author.toString() !== user?.id) throw new Error("You are not Authorized to delete this questions");

    const questionAuthorId = question.author.toString();

    // Delete reference from collection
    await Collection.deleteMany({ question: questionId }).session(session);

    // Delete Reference from Tag

    await TagQuestion.deleteMany({ question: questionId }).session(session);

    //For all Tags of Question, find them and reduce their count
    if (question.tags.length > 0) {
      await Tag.updateMany({ _id: { $in: question.tags } }, { $inc: { question: -1 } }, { session });
    }

    // Remove all Vots of the Question
    await Vote.deleteMany({
      actionId: questionId,
      actionTypes: "question",
    }).session(session);

    // Remove all answer an d their votes of the question
    const answers = await Answers.find({ question: questionId }).session(session);

    if (answers.length > 0) {
      await Answers.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer.id) },
        actionType: "answer",
      }).session(session);
    }

    // Delete question
    await Question.findByIdAndDelete(questionId).session(session);

    // Commit transaction
    await session.commitTransaction();

    // calling intraction
    after(async () => {
      await CreateIntaction({
        action: "delete",
        actionId: questionId,
        actionTarget: "question",
        authorId: questionAuthorId,
      });
    });

    session.endSession();

    // Revalidate to reflect immediate changes on UI
    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteUserAnswer(params: DeleteUserAnswerPArams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteUserAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { answerId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const answer = await Answers.findById(answerId);
    if (!answer) throw new Error("Answer not Found");

    if (answer.author.toString() !== user?.id) throw new Error("You are not Authorized");

    const answerAuthorId = answer.author.toString();

    // reduce the question answer count by 1
    await Question.findByIdAndUpdate(answer.question, { $inc: { answer: -1 } }, { new: true });

    // delete votes associated with the  associated answer
    await Vote.deleteMany({ actionId: answerId, actionType: "answer" });

    // delete answer
    await Answers.findByIdAndDelete(answerId);

    after(async () => {
      await CreateIntaction({
        action: "delete",
        actionId: answerId,
        actionTarget: "answer",
        authorId: answerAuthorId,
      });
    });

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function GetUserStats(
  params: GetUserParams
): Promise<ActionResponse<{ totalQuestion: number; totalAnswer: number; badges: Badges }>> {
  const validationResult = await action({
    params,
    schema: getUserSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { userId } = params;

  try {
    const [questionStats] = await Question.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const [answerStats] = await Answers.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const badges = assignBadges({
      criteria: [
        { type: "ANSWER_COUNT", count: answerStats.count },
        { type: "QUESTION_COUNT", count: questionStats.count },
        {
          type: "QUESTION_UPVOTES",
          count: questionStats.upvotes + answerStats.upvotes,
        },
        { type: "TOTAL_VIEWS", count: questionStats.views },
      ],
    });

    return {
      success: true,
      data: {
        totalQuestion: questionStats.count,
        totalAnswer: answerStats.count,
        badges,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
