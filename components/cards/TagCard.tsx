import ROUTES from "@/constants/routs";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { getDeviconClassname } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface Props {
  _id: string;
  name: string;
  question?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: ()=> void;  
}

const handleClick = (e: React.MouseEvent)=> {
  e.preventDefault();
}

const TagCard = ({_id, name, question, showCount, compact, remove , isButton, handleRemove}: Props) => {

  const iconClass = getDeviconClassname(name)

  const Content = (
    <>
  <Badge className="subtle-medium  background-light800_dark300 text-light400_light500 rounded-md space-x-2 px-4 py-2 uppercase">
        <div className="flex-center spaxe-x-2 gap-1">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>

        {remove && (
          <Image 
          src="/icons/close.svg"
          alt="close icons"
          height={12}
          width={12}
          className="cursor-pointer object-contain invert-0 dark:invert"
          onClick={handleRemove}
          />
        )}
      </Badge>

      {showCount && <p className="small-medium text-dark500_light700">{question}</p>}
      </>
)

if(compact){
  return isButton ? (
    <button onClick={handleClick} className="flex  justify-between gap-2">
      {Content}
    </button>
  ) :
  (
    <Link href={ROUTES.TAG(_id)} className="flex justify-between gap-2">
   {Content}
    </Link>
  );
}
}


export default TagCard