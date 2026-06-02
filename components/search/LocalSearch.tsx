"use client";

import Image from "next/image";
import { Input } from "../ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { formUrlQuery, removeKeysformUrlQuery } from "@/constants/url";
import  { useEffect, useState } from "react";

interface props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  iconPosition?: "left" | "right";
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses, iconPosition = "left" }: props) => {
  // installing library query-string as the params are difficul to understand and to remove the
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get("query") || "";
  const router = useRouter();
  const [searchQuery, setsearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.replace(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysformUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });
          router.replace(newUrl, { scroll: false });
        }
      }
    }, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, pathname, route, router, searchParams]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && <Image src={imgSrc} height={24} width={24} alt="Searc" className="cursor-pointer" />}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setsearchQuery(e.target.value);
        }}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
      {iconPosition === "right" && <Image src={imgSrc} height={24} width={24} alt="Searc" className="cursor-pointer" />}
    </div>
  );
};

export default LocalSearch;
