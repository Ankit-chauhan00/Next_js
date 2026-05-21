import QuestionCard from "@/components/cards/QuestionCard";
import LocalSearch from "@/components/search/LocalSearch";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import ROUTES from "@/constants/routs";
import { getSavedQuestion } from "@/lib/action/collection.action";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CommonFilters from "@/components/filters/CommonFilters";
import { CollectionFilters } from "@/constants/filters";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Collections = async ({ searchParams }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getSavedQuestion({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const loggedInuser = await auth();
  if (!loggedInuser) redirect(ROUTES.SIGN_IN);

  const { collection } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Question</h1>
      <div className="mt-11 flex items-center gap-4">
        <LocalSearch
          route={ROUTES.COLLECTION}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
        <CommonFilters filters={CollectionFilters} otherClasses="min-h-[40px]" containerClasses=""/>
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={collection}
        empty={EMPTY_QUESTION}
        render={(collection) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {collection.map((item) => (
              <QuestionCard key={item._id} question={item.question} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Collections;
