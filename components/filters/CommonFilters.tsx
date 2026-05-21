"use client";

// This is a client-rendered component, so searchParams cannot be accessed
// using `await searchParams` like in server components.

// Flow:
// Root/Page -> CommonFilters

// Here we take the selected filter value (newest, popular, etc.)
// from the Select component and push it into the URL as a query param.

// Example:
// /questions?filter=newest

// Then in the page/server component, we extract the filter value
// from searchParams and pass it to getQuestions(),
// where the database filtering and sorting logic is applied.

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { formUrlQuery } from "@/constants/url";

interface Filters {
  name: string;
  value: string;
}

interface Props {
  filters: Filters[];
  otherClasses: string;
  containerClasses?: string;
}

const CommonFilters = ({ filters, otherClasses = "", containerClasses = "" }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsFilter = searchParams.get("filter");

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={cn("relative", containerClasses)}>
      <Select onValueChange={handleUpdateParams} defaultValue={paramsFilter || ""}>
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5",
            otherClasses
          )}
          aria-label="Filter options"
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilters;
