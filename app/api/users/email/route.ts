import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request){
    const {email} = await request.json();
    try {
        await dbConnect();
        const validatedData = UserSchema.partial().safeParse({email});

        if(!validatedData.success){
            const formattedError = z.treeifyError(validatedData.error);
            throw new ValidationError(formattedError);
        }

        const user  = await User.findOne({email});

        if(!user) throw new NotFoundError('User');

        return NextResponse.json({success: true, data: user}, {status: 200});

    } catch (error) {
        return handleError(error,'api') as APIErrorResponse;
    }
}