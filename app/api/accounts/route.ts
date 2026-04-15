import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { ForbiddenError} from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await dbConnect();

        const account = await Account.find();

        return NextResponse.json({success: true, data: account}, {status: 200})

    } catch (error) {
        return handleError(error,'api') as APIErrorResponse;
    }
}

export async function POST(request: Request){
    try {
        await dbConnect();
        const body  = await request.json();

        const validateData = AccountSchema.parse(body);

        const existingAccount = await Account.findOne({
            provider: validateData.provider,
            providerAccountId: validateData.providerAccountId
        })
        
        if(existingAccount) throw new ForbiddenError("Account with the same provider alredy exists");

        const newAccount = await Account.create(validateData);

        return NextResponse.json({success: true, data: newAccount}, {status: 201})

    } catch (error) {
        return handleError(error, 'api') as APIErrorResponse
    }

}