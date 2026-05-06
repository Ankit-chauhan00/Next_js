"use server";

import Answers, { IAnswersDoc } from "@/database/answers.model";
import { createAnswerParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { AnswerServerSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routs";

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

    const [newAnswer] = await Answers.create([{
        author: userId,
        question: questionId,
        content,

    }], {session});

    if(!newAnswer) throw new Error("failed to create an answer");

    question.answers += 1;
    await question.save({session});

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId))
    return {success: true, data: JSON.parse(JSON.stringify(newAnswer))

    }

  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
