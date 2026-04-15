import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
import {z} from "zod";

export async function GET (){
    try {
        await dbConnect();

        const users = await User.find();

        return NextResponse.json({success: true, data: users}, {status: 200});
        
    } catch (error) {
        return handleError(error,"api") as APIErrorResponse
    }
}

// create user

export async function POST(request: Request){
    try {
        await dbConnect();
        const body = await request.json(); 

        const ValidatedData = UserSchema.safeParse(body);

        if(!ValidatedData.success){
            const formattedError = z.treeifyError(ValidatedData.error);
            throw new ValidationError(formattedError);

        }

        const {email,username} = ValidatedData.data;

        const existingUser = await User.findOne({email});

        if(existingUser)
            throw new Error('User alredy Exists');

        const existingUsername = await User.findOne({username});

        if(existingUsername)
            throw new Error('Username alredy exists');

        const newUser = await User.create(ValidatedData.data);

        return NextResponse.json({success: true, data: newUser}, {status: 201});

        
    } catch (error) {
        return handleError(error,'api') as APIErrorResponse;
    }
}