import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
  const { providerAccountId } = await request.json();
  try {
    await dbConnect();
    const validatedData = AccountSchema.partial().safeParse({ providerAccountId });

    if (!validatedData.success) {
      const formattedError = z.treeifyError(validatedData.error);
      throw new ValidationError(formattedError);
    }

    // Use lean() to ensure proper serialization of MongoDB ObjectID
    const account = await Account.findOne({ providerAccountId }).lean();

    if (!account) throw new NotFoundError("Account");

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
