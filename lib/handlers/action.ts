"use server";

import z, { ZodError } from "zod";
import { ValidationError } from "../http-error";
import { Session } from "next-auth";
import { auth } from "@/auth";
import dbConnect from "../mongoose";

// Generic type T allows flexibility for different input shapes
type ActionOptions<T> = {
    params?: T;                // Input data (e.g. form data, API payload)
    schema?: z.ZodType<T>;     // Optional Zod schema for validation
    authorize?: boolean;       // Whether this action requires authentication
}

async function action<T>({
    params, schema, authorize = false
}: ActionOptions<T>){

    // ✅ Step 1: Validate input if schema is provided
    if (schema && params) {
        try {
            // Parse and validate params against schema
            schema.parse(params);

        } catch (error) {
            // Handle validation errors from Zod
            if (error instanceof ZodError) {

                // Convert Zod error into structured format (Zod v4+)
                const formattedError = z.treeifyError(error);

                // Return custom validation error (instead of throwing)
                return new ValidationError(formattedError);
            }
        }
    }

    // ❗ Ensure params exist (important for TS safety)
  if (!params) {
    return new Error("Params are required");
  }

    // ✅ Step 2: Handle authorization (if required)
    let session: Session | null = null;

    if (authorize) {
        // Get current user session
        session = await auth();

        // If no session, user is not authenticated
        if (!session) {
            return new Error("Unauthorized");
        }
    }

    // ✅ Step 3: Connect to database before performing any DB operation
    await dbConnect();

    // ✅ Step 4: Return validated params + session (if any)
    return { params, session };
}

export default action;