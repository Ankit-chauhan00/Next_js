import { PaginatedSearchParams } from "./global";

interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}
interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}
interface getTagQuestionParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}

interface IncrementViewsParams {
  questionId: string;
}

interface createAnswerParams {
  questionId: string;
  content: string;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}

interface CreateVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}
interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

type HasVotedparams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface hasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface CollectionBasedParams {
  questionId: string;
}

interface GetUserParams {
  userId: string;
}

interface GetUserQuestionParams extends Omit<PaginatedSearchParams, "query" | "filter"| "sort"> {
userId: string;
}

interface GetUserAnswersParams extends PaginatedSearchParams {
  userId: string;
}

interface GetUserTagsParams {
  userId: string;
}
