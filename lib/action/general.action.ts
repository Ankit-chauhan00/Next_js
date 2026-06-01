"use server";

import { ErrorResponse } from "@/types/global";
import handleError from "../handlers/error";
import action from "../handlers/action";
import { GlobalSearchSchema } from "../validation";
import { Answers, Question, Tag, User } from "@/database";
import { globalSearchParams } from "@/types/action";

export async function globalSearch(params: globalSearchParams) {
  try {
    console.log("QUERY", params);

    const validatedResult = await action({
      params,
      schema: GlobalSearchSchema,
    });

    if (validatedResult instanceof Error) return handleError(validatedResult) as ErrorResponse;

    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };

    let results = [];

    const modelsAndType = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answers, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    const typeLower = type?.toLowerCase();

    const SearchableTypes = ["question", "answer", "user", "tag"];

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // If no type is specified, search in all models
      for (const { model, searchField, type } of modelsAndType) {
        const queryResults = await model.find({ [searchField]: regexQuery }).limit(2);

        results.push(
          ...queryResults.map((item) => ({
            title: type === "answer" ? `Answers containing ${query}` : item[searchField],
            type,
            id: type === "answer" ? item.question : item._id,
          }))
        );
      }
    } else {
      // Search in the specified model type
      const modelInfo = modelsAndType.find((item) => item.type === type);

      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      const queryResults = await modelInfo.model.find({ [modelInfo.searchField]: regexQuery }).limit(8);

      results = queryResults.map((item) => ({
        title: type === "answer" ? `Answers containing ${query}` : item[modelInfo.searchField],
        type,
        id: type === "answer" ? item.question : item._id,
      }));
    }

    console.log("RESULT", results);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(results)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
