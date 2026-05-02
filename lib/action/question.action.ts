"use server";

import { ActionResponse, ErrorResponse, Questions} from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema, EditQuestionSchema, getQuestionSchema } from "../validation";
import mongoose from "mongoose";
import Question from "@/database/question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion from "@/database/tagQuestion.model";
import dbConnect from "../mongoose";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<Questions>> {
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
    await session.endSession();
  }
}

export async function editQuestion( params: EditQuestionParams): Promise<ActionResponse<Questions>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  })

  if(validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const {title, content, tags, questionId} = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();


  try {
    const question = await Question.findById(questionId).populate('tags');

    // if there is no question
    if(!question)
      throw new Error("Question Not found");

    if(question.author.toString() !== userId)
      throw new Error("Unauthorized")

    // checking if the fields are modified 
    if(question.title !== title || question.content !== content){
      question.title = title;
      question.content = content;

      await question.save({session});
    }


    const tagsToAdd = tags.filter((tag)=> !question.tags.includes(tag.toLocaleLowerCase()));
    const tagsToRemove = question.tags.filter((tag: ITagDoc )=> !tags.includes(tag.name.toLocaleLowerCase()));

    const newTagDocuments = [];

    if(tagsToAdd.length > 0){
      for (const tag of tags) {
      const existingTags = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { question: 1 } },
        { upsert: true, new: true, session }
      );
      newTagDocuments.push({
        tag: existingTags._id,
        question: questionId,
      });

      question.tags.push(existingTags._id);
    }
    }

    if(tagsToRemove.length > 0){
      const tagsIdToRemove = tagsToRemove.map((tag: ITagDoc)=> tag._id);

      await Tag.updateMany(
        {_id: {$in: tagsIdToRemove}},
        { $inc: {question: -1}},
        {session}
      );

      await TagQuestion.deleteMany(
        {tag: {$in: tagsIdToRemove}, question: questionId},
        {session}
      )

      question.tags = question.tags .filter(
        (tag: ITagDoc)=> !tagsIdToRemove.includes(tag)
      );

      if(newTagDocuments.length >  0) {
        await TagQuestion.insertMany(newTagDocuments, {session});
      }
    }

    await question.save({session});
    await session.commitTransaction();


    return {success: true, data: JSON.parse(JSON.stringify(question))};
    
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}


export async function getQuestion( params: GetQuestionParams): Promise<ActionResponse<Questions>> {
  const validationResult = await action({
    params,
    schema: getQuestionSchema,
    authorize: true,
  })

  if(validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { questionId} = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate("tags").populate("author");

    if(!question) throw new Error("Question not found");


    return { success: true, data: JSON.parse(JSON.stringify(question)) };

  } catch (error) {
    return handleError(error) as ErrorResponse;
  }

 
}
