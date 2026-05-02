import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { signInWithOAuthSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import  mongoose  from "mongoose";
import z from "zod";
import  slugify  from "slugify";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    const body = await request.json();
    console.log("OAuth request body:", JSON.stringify(body, null, 2));
    
    const {provider, providerAccountId, user} = body;

    await dbConnect();

    const session  = await mongoose.startSession();
    // atomic function either full or nothing
    await  session.startTransaction();


    // if we try to create an account -> Fails
    // we try to create a user  -> fails

    try {
        const validateData = signInWithOAuthSchema.safeParse({provider, providerAccountId, user});

        if(!validateData.success){
            const formattedError = z.treeifyError(validateData.error);
            throw new ValidationError(formattedError);
        }

        const {name, username, email, image} = user;
        console.log("Destructured values:", {name, username, email, image});

        const slugifiedUsername = slugify(username, {
            lower: true,
            strict: true,
            trim: true,
        })

        let  existingUser = await User.findOne({email}).session(session);

        if(!existingUser){
            [existingUser] = await User.create(
                [{name, username: slugifiedUsername, email, image}],
                { session}
            );
        }else {
            const updatedData: {name?: string; image?: string } = {};

            if(existingUser.name !==  name) updatedData.name = name;
            if(existingUser.image !== image) updatedData.image = image;

            if(Object.keys(updatedData).length > 0){
                await User.updateOne({_id: existingUser._id}, {$set: updatedData}).session(session);
            }
        }
        
        const existingAccount = await Account.findOne({userId: existingUser._id, provider, providerAccountId}).session(session);

        if(!existingAccount){
            await Account.create(
                [{userId: existingUser._id, name, image, provider, providerAccountId}],
                {session}
            );
        } else {
            console.log("Account already exists");
        }

        await session.commitTransaction();

        return NextResponse.json({success: true});

    } catch (error : unknown) {
        await session.abortTransaction();
        return handleError(error,'api') as APIErrorResponse;
    }
    finally{
        session.endSession();
    }

}