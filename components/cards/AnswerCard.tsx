import Link from "next/link";

import ROUTES from "@/constants/routs";
import { cn, getTimeStamp } from "@/lib/utils";

import { Preview } from "../editor/Preview";
import UserAvatar from "../UserAvatar";
import { Answer } from "@/types/global";
import { Suspense } from "react";
import { hasVoted } from "@/lib/action/vote.action";
import Vote from "../votes/Vote";
import EditDeleteAction from "../users/EditDeleteAction";

interface Props extends Answer {
  containerClasses: string;
  showReadMore: boolean;
  showActionBtn?: boolean;
}

const AnswerCard = ({
  _id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  question,
  containerClasses,
  showReadMore = false,
  showActionBtn,
}: Props) => {
  const hasVotedPromise = hasVoted({ targetId: _id, targetType: "answer" });
  return (
    <article className={cn("light-border border-b py-10 relative", containerClasses)}>
      <span id={`answer-${_id}`} className="hash-span" />

      {
        showActionBtn && (
          <div className="background-light800 flex-center absolute -right-2.5  -top-1  size-9 rounded-full  ">
            <EditDeleteAction type="Answer" itemId={_id}/>
          </div>
        )
      }

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            classname="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link href={ROUTES.PROFILE(author._id)} className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center">
            <p className="body-semibold text-dark300_light700">{author.name ?? "Anonymous"}</p>

            <p className="small-regular text-light400_light500 mt-0.5 ml-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(createdAt)}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Vote
              targetType="answer"
              targetId={_id}
              upvotes={upvotes}
              downvotes={downvotes}
              hasVotedPromise={hasVotedPromise}
            />
          </Suspense>
        </div>
      </div>

      <Preview content={content} />

      {showReadMore && (
        <Link
          href={`/questions/${question}#answer-${_id}`}
          className="body-semibold font-space-grotesk text-primary-500 relative z-10"
        >
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  );
};

export default AnswerCard;
