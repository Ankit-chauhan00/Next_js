import { NextResponse } from "next/server";

interface Tagg {
  _id: string;
  name: string;
}

interface Author {
  _id: string;
  name: string;
  image: string;

}

interface Questions {
  _id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  createdAt: Date;
  upvotes: number;
  downvotes: number
  answers: number;
  views: number;
  createdAt: Date;
}



interface SignInWithOauthParam{
  provider: 'github' | 'google',
  providerAccountId: string,
  user: {
    email: string,
    name: string,
    image: string,
    username: string
  }
}

type ActionResponse<T = null> = {
  success : boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string,string[]>;
  };
  status?: number;
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true};
type ErrorResponse = ActionResponse<undefined> & {success: false};

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> =SuccessResponse<T> | ErrorResponse

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string,string>>;
}


interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;  
}

interface Answer {
  _id: string;
  author: Author;
  content: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
}

interface Users {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
}
