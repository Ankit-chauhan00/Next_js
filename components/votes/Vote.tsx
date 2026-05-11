"use client";

import { formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  upvotes: number;
  hasupVotes: boolean;
  downvotes: number;
  hasdownVotes: boolean;
}

const Vote = ({ upvotes, hasupVotes, downvotes, hasdownVotes }: Props) => {
  const session = useSession();
  const userId = session.data?.user?.id;

  const [isLoading, setisLoading] = useState(false);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) return toast.error("please login to vote only loggedin users can Vote");
    setisLoading(true);

    try {
      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasupVotes ? "added" : "removed"} successfully`
          : `Downvote ${!hasdownVotes ? "added" : "removed"} successfully`;

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
          src={hasupVotes ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
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
          src={hasdownVotes ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
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
