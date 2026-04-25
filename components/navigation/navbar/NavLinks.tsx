'use client'
import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"
import React from "react";



const NavLinks = ({isMobileNav = false, userId}: { isMobileNav ? : boolean, userId ?: string }) => {

  const pathname = usePathname();
  return (
    <>{sidebarLinks.map((items)=>{
      const isActive = (pathname.includes(items.route) &&  items.route.length > 1) || pathname ===  items.route;

      if(items.route === '/profile'){
        if(userId)
          items.route = `${items.route}/${userId}`
      }

      const linkComponent = (
        <Link href={items.route} key={items.label} className={cn(isActive ? 'primary-gradient rounded-lg text-light-900' : 'text-dark300_light900', 'flex items-center justify-start gap-4 bg-transparent p-4')}>
          <Image 
          src={items.imgURL}
          alt={items.label}
          height={20}
          width={20}
          className={cn({"invert-colors": "base-medium"})}
          />
          <p className={cn(isActive ? 'base-bold':'base-medium', !isMobileNav && "max-lg:hidden")}>{items.label}</p>
        </Link>
      );
      return isMobileNav ? (
        <SheetClose asChild key={items.route}>
          {linkComponent}
        </SheetClose>
      ) :<React.Fragment key={items.route}>{linkComponent}</React.Fragment>
    })}</>
  )
}

export default NavLinks