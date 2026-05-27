import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
    imageUrl: string
    href?: string;
    title: string
}

const ProfileLinks = ({ imageUrl, href, title }: Props) => {
  return <div className="flex-center gap-1">
    <Image
    src={imageUrl}
    alt={title}
    width={20}
    height={20}
    />

    {
        href? (
            <Link href={href} target="_blank" rel="noopener noreferrer" className="paragraph-medium text-blue-500">
                {title}
            </Link>
        ): (
            <p className="paragraph-medium text-dark200_light800">
                {title}
            </p>
        )
    }
  </div>
};

export default ProfileLinks;
