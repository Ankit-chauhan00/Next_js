import ROUTES from "@/constants/routs";
import Image from "next/image";
import Link from "next/link";
import { getHotQuestions } from "@/lib/action/question.action";
import DataRenderer from "../DataRenderer";
import { getTopTags } from "@/lib/action/tag.action";
import TagCard from "../cards/TagCard";

const RightNavBar = async () => {

  const [{ success, data: hotQuestions, error },{ success: tagSuccess, data: popularTags, error: tagError }] = await Promise.all([getHotQuestions(), getTopTags()])

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          <DataRenderer
            data={hotQuestions}
            empty={{ title: "No QuestionFound", message: "No Question have been asked yet." }}
            success={success}
            error={error}
            render={(hotQuestions) => (
              <div className="mt-7 flex w-full flex-col gap-[30px]">
                {hotQuestions.map(({ _id, title }) => (
                  <Link
                    key={_id}
                    href={ROUTES.QUESTION(_id)}
                    className="flex cursor-pointer items-center justify-between gap-7"
                  >
                    <p className="body-medium text-dark500_light700 line-clamp-2">{title}</p>

                    <Image
                      src="/icons/chevron-right.svg"
                      alt="chevron"
                      width={20}
                      height={20}
                      className="invert-colors"
                    />
                  </Link>
                ))}
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>

        <div className="mt-7 flex flex-col gap-4">
          <DataRenderer
            data={popularTags}
            empty={{ title: "No Tags Found", message: "No Tags have been created yet." }}
            success={tagSuccess}
            error={tagError}
            render={(tags) => <div className="mt-7 flex w-full flex-col gap-[30px]">{
              tags.map(({_id, name, questions})=>(
                <TagCard
                key={_id}
                _id={_id}
                name={name}
                questions={questions}
                showCount
                compact
                />
              ))
            }</div>}
          />
        </div>
      </div>
    </section>
  );
};

export default RightNavBar;
