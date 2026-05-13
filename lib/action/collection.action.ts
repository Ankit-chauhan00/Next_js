"use server";

import { CollectionBasedParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { CollectionBaseSchema } from "../validation";
import handleError from "../handlers/error";
import { Collection, Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routs";
import mongoose from "mongoose";

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

    // !! collection means collection = "A truthy value" so --> !collection(non-zero value) = false and further !false = true
    // this is mainly for converting anything to boolean
    return { success: true, data: { saved: !!collection } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
