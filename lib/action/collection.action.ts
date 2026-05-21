"use server";

import { CollectionBasedParams } from "@/types/action";
import { ActionResponse, Collections, ErrorResponse, PaginatedSearchParams } from "@/types/global";
import action from "../handlers/action";
import { CollectionBaseSchema, PaginatedSearchParamsSchema } from "../validation";
import handleError from "../handlers/error";
import { Collection, Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routs";
import mongoose, { PipelineStage } from "mongoose";

export async function toggelSaveQuestion(params: CollectionBasedParams): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  console.log("USER ID: ", userId);
  console.log("QUESTION ID:", questionId);

  try {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not Found");

    const collection = await Collection.findOne({
      question: new mongoose.Types.ObjectId(questionId),
      author: new mongoose.Types.ObjectId(userId),
    });

    if (collection) {
      await Collection.findByIdAndDelete(collection._id);
      revalidatePath(ROUTES.QUESTION(questionId));
      return { success: true, data: { saved: false } };
    }

    // CREATE the collection record when saving
    await Collection.create({
      question: new mongoose.Types.ObjectId(questionId),
      author: new mongoose.Types.ObjectId(userId),
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: { saved: true } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(params: CollectionBasedParams): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await Collection.findOne({
      question: new mongoose.Types.ObjectId(questionId),
      author: new mongoose.Types.ObjectId(userId),
    });

    // collection means collection = "A truthy value" so --> !collection(non-zero value) = false and further !false = true
    // this is mainly for converting anything to boolean
    return { success: true, data: { saved: !!collection } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSavedQuestion(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ collection: Collections[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const userId = validationResult.session?.user?.id;
  const { page = 1, pageSize = 10, query, filter } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    mostrecent: { "question.createdAt": -1 },
    oldest: { "question.createdAt": 1 },
    mostvoted: { "question.upvotes": -1 },
    mostviewed: { "question.views": -1 },
    mostanswered: { "question.answers": -1 },
  };

  const sortCriteria = sortOptions[filter as keyof typeof sortOptions] || { "question.createdAt": -1 };

  try {
    // mongo db aggergation or advance querry similar to sql query
    // we have doen this stuff as we are not fetching question from Question model insted we are getting it from
    // Collection modle we have to execute this entire pipeline that allows to match aggregate the question

    const pipeline: PipelineStage[] = [
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
        },
      },

      { $unwind: "$question" },
      {
        $lookup: {
          from: "users",
          localField: "question.author",
          foreignField: "_id",
          as: "question.author",
        },
      },
      { $unwind: "$question.author" },
      {
        $lookup: {
          from: "tags",
          localField: "question.tags",
          foreignField: "_id",
          as: "question.tags",
        },
      },
    ];

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { "question.title": { $regex: query, $options: "i" } },
            { "question.content": { $regex: query, $options: "i" } },
          ],
        },
      });
    }

    const [totalCount] = await Collection.aggregate([...pipeline, { $count: "count" }]);

    pipeline.push({ $sort: sortCriteria }, { $skip: skip }, { $limit: limit });
    pipeline.push({ $project: { question: 1, author: 1 } });

    const questions = await Collection.aggregate(pipeline);
    const isNext = totalCount.count > skip + questions.length;

    return {
      success: true,
      data: {
        collection: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
