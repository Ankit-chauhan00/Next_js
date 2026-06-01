import { formatNumber } from "@/lib/utils";
import { Badges } from "@/types/global";
import Image from "next/image";
import React from "react";

interface Props {
  totalQuestions: number;
  totalAnswers: number;
  badges: Badges;
  reputationPoints: number;
}

interface StatsCardProps {
    imgUrl: string;
    value: number;
    title: string;
}

const StatsCard = ({imgUrl, value, title}: StatsCardProps) => (
  <div className="light-border background-light900_dark200 justify-start drop-shadow-light-400 flex flex-wrap items-center  gap-4 rounded-md border p-6">
    <Image
    src={imgUrl}
    alt={title}
    height={50}
    width={40}
    />
    <div className="">
        <p className="paragraph-semibold text-dark200_light900">{value}</p>
        <p className="body-medium text-dark400_light900">{title}</p>
    </div>
  </div>
);

const Stats = ({ totalQuestions, totalAnswers, badges, reputationPoints }: Props) => {
  return (
    <div className="mt-3">
      <h4 className="h3-semibold text-dark200_light900">
        Stats{" "}
        <span className="small-semibold primary-text-gradient">
          {formatNumber(reputationPoints)}
        </span>
      </h4>

      <div className="xs:grid-cols-2 mt-5 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="light-border background-light900_dark200 drop-shadow-light-400 flex flex-wrap items-center justify-center gap-4 rounded-md border p-6">
          <div className="">
            <p className="paragraph-semibold text-dark200_light800">{formatNumber(totalQuestions)}</p>
            <p className="body-medium text-dark400_light700">Questions</p>
          </div>

          <div className="">
            <p className="paragraph-semibold text-dark200_light800">{formatNumber(totalAnswers)}</p>
            <p className="body-medium text-dark400_light700">Answers</p>
          </div>
        </div>

        <StatsCard 
        imgUrl="/icons/gold-medal.svg"
        value={badges.GOLD}
        title="Gold Badges"
        />

        <StatsCard 
        imgUrl="/icons/silver-medal.svg"
        value={badges.SILVER}
        title="Silver Badges"
        />
        <StatsCard 
        imgUrl="/icons/bronze-medal.svg"
        value={badges.BRONZE}
        title="Bronze Badges"
        />
      </div>
    </div>
  );
};

export default Stats;
