import AllAnswers from "@/components/answers/AllAnswers";
import TagCard from "@/components/cards/TagCard";
import { Preview } from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/Answerform";
import Metric from "@/components/Metric";
import SaveQuestion from "@/components/questions/SaveQuestion";
import UserAvatar from "@/components/UserAvatar";
import Vote from "@/components/votes/Vote";
import ROUTES from "@/constants/routs";
import { getAnswers } from "@/lib/action/answer.action";
import { hasSavedQuestion } from "@/lib/action/collection.action";
import { getQuestion, incrementViews } from "@/lib/action/question.action";
import { hasVoted } from "@/lib/action/vote.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import { Tagg } from "@/types/global";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { Suspense } from "react";

interface QuestionPageProps {
  params: { id: string };
  searchParams: Promise<Record<string, string>>;
}

const QuestionDetails = async ({ params, searchParams }: QuestionPageProps) => {
  const { id } = await params;
  const { page, pageSize, filter } = await searchParams;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await incrementViews({ questionId: id });
  });

  if (!success || !question) return redirect("/404");
  const {
    success: areAnswersloaded,
    data: AnswersResult,
    error: answersErrors,
  } = await getAnswers({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter: filter || "latest",
  });

  // its a promise not a value as we hanvent awaited it
  const hasVotedPromise = hasVoted({ targetId: question._id, targetType: "question" });

  //
  const hasSavedQuestionPromise = hasSavedQuestion({ questionId: question._id });

  const { author, createdAt, answers, views, tags, content, title } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar id={author._id} name={author.name} classname="size-5.5" fallbackClassName="text-[10px]" />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">{author.name}</p>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Suspense fallback={<div>Loading...</div>}>
              <Vote
                targetType="question"
                targetId={question._id}
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              <SaveQuestion questionId={question._id} hasSavedQuestionPromise={hasSavedQuestionPromise} />
            </Suspense>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{title}</h2>
      </div>

      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tagg) => (
          <TagCard key={tag._id} _id={tag._id as string} name={tag.name} compact />
        ))}
      </div>

      <section className="my-5">
        <AllAnswers
          isNext={AnswersResult?.isNext || false}
          page={Number(page) || 1}
          data={AnswersResult?.answers}
          success={areAnswersloaded}
          error={answersErrors}
          totalAnswers={AnswersResult?.totalAnswers || 0}
        />
      </section>

      <section className="my-5">
        <AnswerForm questionId={question._id} questionTitle={question.title} questionContent={question.content} />
      </section>
    </>
  );
};

export default QuestionDetails;
