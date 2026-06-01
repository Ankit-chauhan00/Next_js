"use server";

import Answers, { IAnswersDoc } from "@/database/answers.model";
import { createAnswerParams, GetAnswersParams } from "@/types/action";
import { ActionResponse, Answer, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { AnswerServerSchema, GetAnswerSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routs";
import { after } from "next/server";
import { CreateIntaction } from "./intraction.action";

export async function CreateAnswer(params: createAnswerParams): Promise<ActionResponse<IAnswersDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question Not found");

    const [newAnswer] = await Answers.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session }
    );

    if (!newAnswer) throw new Error("failed to create an answer");

    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();

    after(async () => {
      await CreateIntaction({
        action: "post",
        actionId: newAnswer._id.toString(),
        actionTarget: "answer",
        authorId: userId as string,
      });
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(
  params: GetAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean; totalAnswers: number }>> {
  const validationResult = await action({ params, schema: GetAnswerSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId, page = 1, pageSize = 10, filter } = params;

  const skip = (Number(page) - 1) * pageSize;

  const limit = pageSize;

  let sortCritera = {};

  switch (filter) {
    case "latest":
      sortCritera = { createdAt: -1 };
      break;
    case "oldest":
      sortCritera = { createdAt: 1 };
      break;
    case "popular":
      sortCritera = { upvotes: -1 };
      break;
    default:
      sortCritera = { createdAt: -1 };
      break;
  }

  try {
    const totalAnswers = await Answers.countDocuments({ question: questionId });

    const answers = await Answers.find({ question: questionId })
      .populate("author", "_id name image")
      .sort(sortCritera)
      .skip(skip)
      .limit(limit);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
