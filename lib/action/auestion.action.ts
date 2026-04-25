"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema } from "../validation";
import mongoose from "mongoose";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tagQuestion.model";
import dbConnect from "../mongoose";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: AskQuestionSchema, authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    await dbConnect();
    const [question] = await Question.create([{ title, content, author: userId }], { session });

    if (!question) throw new Error("Failed to create question");

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocument = [];

    for (const tag of tags) {
      const existingTags = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { question: 1 } },
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

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
