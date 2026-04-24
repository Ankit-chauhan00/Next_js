"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { SignInSchema, SignUpSchema } from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
import Account from "@/database/account.model";
import { NotFoundError } from "../http-error";

export async function signUpWithCredentials(params: AuthCredentials): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params;

  const session = await mongoose.startSession();
  session.startTransaction();



  try {
    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new Error("User Alredy Exists");
    }

    const existingUsername = await User.findOne({ username }).session(session);

    if (existingUsername) {
      throw new Error("Username alredy exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // as mongoose accepts array of object or multiple object but if we pass without an single array the option is considered as obejct so error occured
    const [newUser] = await User.create([{ username, name, email }], { session });

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return { success: true };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function signIpWithCredentials(
  params:Pick<AuthCredentials,'email' | 'password'>): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {  email, password } = validationResult.params;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) throw new NotFoundError('USer Not Found');

    const existingAccount = await Account.findOne({provider: "credentials",providerAccountId: email});

    if(!existingAccount) throw new NotFoundError("Account");

    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password
    )

    if(!passwordMatch) throw new Error("Password does not match");

    return {success: true};

  } catch (error) {

    return handleError(error) as ErrorResponse;
  } 
}