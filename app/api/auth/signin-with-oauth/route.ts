import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { signInWithOAuthSchema } from "@/lib/validation";
import { APIErrorResponse, ErrorResponse } from "@/types/global";
import mongoose from "mongoose";
import z, { flattenError } from "zod";
import slugify from "slugify";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/http-error";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = signInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success) {
   const formattedError = z.treeifyError(validatedData.error);
    throw new ValidationError(formattedError) ;
    }

    const { name, username, email, image } = user;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create([{ name, username: slugifiedUsername, email, image }], { session });
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne({ _id: existingUser._id }, { $set: updatedData }).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    return handleError(error) as APIErrorResponse;
  } finally {
    session.endSession();
  }
}
