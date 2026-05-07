import TagCard from "@/components/cards/TagCard";
import { Preview } from "@/components/editor/Preview";
import Answerform from "@/components/forms/Answerform";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routs";
import { getAnswers } from "@/lib/action/answer.action";
import { getQuestion, incrementViews } from "@/lib/action/question.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import {  Tagg } from "@/types/global";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";


const QuestionDetails = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async()=>{
    await incrementViews({ questionId: id});
  })

  if (!success || !question) return redirect("/404");
  const {success: areAnswersloaded , data: AnswersResult,  error: answersErrors} = await getAnswers({
    questionId: id,
    page:1,
    pageSize: 10, 
    filter: 'latest'
  })

  console.log("Answers", AnswersResult)

  const { author, createdAt, answers, views, tags, content, title } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
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
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>

      <section className="my-5">

        <Answerform questionId ={question._id} />
      </section>
    </>
  );
};

export default QuestionDetails;