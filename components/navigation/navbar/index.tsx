import React from 'react'
import  Link  from 'next/link';
import Image from "next/image";
import Theme from './Themes';
import MobileNavigation from './MobileNavigation';
import { auth } from '@/auth'
import UserAvatar from '@/components/UserAvatar';
import GlobalSearch from '@/components/search/GlobalSearch';


//Image is a next component
const Navbar = async () => {

  const session = await auth();


  return (
    <nav className='flex-between background-light900_dark200 fixed z-50 w-full p-6 shdow-light-300 dark:shadow-none sm:px-12'>
      <Link href='/' className="flex items-center gap-1">
      <Image 
      src = "/images/site-logo.svg"
      width={23}
      height={23}
      alt="DevFlow Logo"
      />

      <p className='h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden'>
        Dev <span className='text-primary-500'>Flow</span>
      </p>
      </Link>


      <GlobalSearch/>

      <div className="flex-between gap-3">
        <Theme/>

        {session?.user?.id && (
          <UserAvatar   
          id={session.user.id} 
          name={session.user.name!}
          imageUrl={session.user?.image}
          />
        )}

        <MobileNavigation/>
        </div>
    </nav>
  )
}

export default Navbar