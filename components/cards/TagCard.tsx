import ROUTES from "@/constants/routs";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { getDeviconClassname } from "@/lib/utils";

interface Props {
  _id: string;
  name: string;
  question?: number;
  showCount?: boolean;
  compact?: boolean
}

const TagCard = ({_id, name, question, showCount, compact}: Props) => {

  const iconClass = getDeviconClassname(name)
  return (
    <Link href={ROUTES.TAGS(_id)} className="flex justify-between gap-2">
      <Badge className="subtle-medium  background-light800_dark300 text-light400_light500 rounded-md space-x-2 px-4 py-2 uppercase">
        <div className="flex-center spaxe-x-2 gap-1">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
      </Badge>

      {showCount && <p className="small-medium text-dark500_light700">{question}</p>}
    </Link>
  )
}

export default TagCard