import { ActionResponse, Answer } from "@/types/global";
import React from "react";
import DataRenderer from "../DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "../cards/AnswerCard";
import CommonFilters from "../filters/CommonFilters";
import { AnswerFilters } from "@/constants/filters";

interface Props extends ActionResponse<Answer[]> {
  totalAnswers: number;
}

const AllAnswers = ({ data, success, totalAnswers, error }: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>
       <CommonFilters
       filters={AnswerFilters}
       otherClasses="sm:min-w-32"
       containerClasses="max-xs:w-full "
       />
      </div>

      <DataRenderer
        data={data}
        error={error}
        success={success}
        empty={EMPTY_ANSWERS}
        render={(answers) => answers.map((answers) =>  <AnswerCard key={answers._id} {...answers}/>)}
      />
    </div>
  );
};

export default AllAnswers;
