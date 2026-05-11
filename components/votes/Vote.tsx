"use client";

import { createVote } from "@/lib/action/vote.action";
import { formatNumber } from "@/lib/utils";
import { hasVotedResponse } from "@/types/action";
import { ActionResponse } from "@/types/global";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { use, useState } from "react";
import { toast } from "sonner";

interface Props {
  targetType: 'question' | 'answer';
  downvotes: number;
  upvotes: number
  targetId: string
  hasVotedPromise: Promise<ActionResponse<hasVotedResponse>> 
}

const Vote = ({ downvotes,upvotes, hasVotedPromise, targetId, targetType }: Props) => {
  const session = useSession();
  const userId = session.data?.user?.id;

  const {success, data} = use(hasVotedPromise)

  const [isLoading, setisLoading] = useState(false);
  const {hasUpvoted, hasDownvoted} = data || {};

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) return toast.error("please login to vote only loggedin users can Vote");
    setisLoading(true);

    try {

      const result = await createVote({
        targetId,
        targetType,
        voteType,
      })

      if(!result.success) return toast.error('Failed to vote');


      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpvoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasDownvoted? "added" : "removed"} successfully`;

          toast.success(successMessage);
    } catch (error) {
      toast.error("An Error occur while voting please try again later");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={success && hasUpvoted? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="upvotes"
          onClick={() => !isLoading && handleVote("upvote")}
        />

        <div className="flex-center background-light700_dark300 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">{formatNumber(upvotes)}</p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={success && hasDownvoted? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && "opacity-50"}`}
          aria-label="downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />

        <div className="flex-center background-light700_dark300 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">{formatNumber(downvotes)}</p>
        </div>
      </div>
    </div>
  );
};

export default Vote;
