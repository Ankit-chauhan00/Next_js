import Account from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-error";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
import z from "zod";


// GET /api/users/[id]
export async function GET(request : Request, {params } : { params: Promise<{id: string}>}){

    const {id} = await params;

    if(!id) throw new NotFoundError('Account');

    try {
        await dbConnect();

        const account = await Account.findById(id);
        if(!account) throw new NotFoundError("Account");

        return NextResponse.json({success: true, data: account}, {status: 200});


    } catch (error) {
       return handleError(error, 'api') as APIErrorResponse;
    }
}

// DELETE /api/users/[id]
export async function DELETE(request : Request, {params} : {params: Promise<{id: string}>}){

    const {id} = await params;
    if(!id) throw new NotFoundError('Account');

    try {
        await dbConnect();

        const account = await Account.findByIdAndDelete(id);

        if(!account) throw new NotFoundError("Account");

        return NextResponse.json({success: true, data: account}, {status: 200});

    } catch (error) {
        return handleError(error, "api") as APIErrorResponse;
    }
}

// PUT /api/users/[id]
export async function PUT(request : Request, {params}: {params: Promise<{id: string}>}){

    const { id } = await params;
    if(!id) throw new NotFoundError("Account");

    try {
        await dbConnect();

        const body = await request.json();
        const validatedData = AccountSchema.partial().safeParse(body);

        if(!validatedData.success) {
         const formattedError = z.treeifyError(validatedData.error);
         throw new ValidationError(formattedError);
        }

        const updatedAccount = await Account.findByIdAndUpdate(id, validatedData.data,{ new : true});

        if(!updatedAccount) throw new NotFoundError("Account");

        return NextResponse.json({ success: true, data: updatedAccount}, {status: 200});

    } catch (error) {
        return handleError(error,'api') as APIErrorResponse;
    }
}