"use server"
import Intraction, { IIntarctionDoc } from "@/database/intraction.model";
import { CreateInteractionParams, UpdateReputationParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { CreateInteractionSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { User } from "@/database";

export async function CreateIntaction(params: CreateInteractionParams): Promise<ActionResponse<IIntarctionDoc>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { action: actionType, actionId, actionTarget, authorId } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = mongoose.startSession();
  (await session).startTransaction();

  try {
    const [intraction] = await Intraction.create(
      [
        {
          user: userId,
          action: actionType,
          actionId,
          actionType: actionTarget,
        },
      ],
      { session }
    );

    (await session).commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(intraction)) };
  } catch (error) {
    (await session).abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    (await session).endSession();
  }
}

export async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, performerId, authorId } = params!;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;

    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;

    case "post":
      authorPoints = actionType === "question" ? 5 : 10;
      break;

    case "delete":
      authorPoints = actionType === "question" ? -5 : -10;
      break;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(performerId, { inc: { reputation: authorPoints } }, { session });

    return;
  }

  await User.bulkWrite([
    {
      updateOne: {
        filter: { _id: performerId },
        update: { $inc: { reputation: performerPoints } },
      },
    },
    {
      updateOne: {
        filter: { _id: authorId },
        update: { $inc: { reputation: authorPoints } },
      },
    },
  ],{session});
}
