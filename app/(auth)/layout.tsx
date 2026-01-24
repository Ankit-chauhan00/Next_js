import React, {  ReactNode } from 'react'
import Image from "next/image";
import SocialForm from '@/components/forms/SocialForm';

// background image if definded in global css --background-image-auth-dark: url("/images/auth-dark.png");
 // --background-image-auth-light: url("/images/auth-light.png"); line no 42 and 43 it will be used here for setting the background image

const AuthLayout = ({children}:{children : ReactNode}) => {
  return (
    <main className='flex min-h-screen items-center justify-center   bg-auth-light dark:bg-auth-dark bg-cover bg-center bg-no-repeat px-4 py-10'>

      <section className='light-border background-light800_dark200 shadow-light100_dark100 min-h-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-130 sm:px-8'>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2.5">
            <h1 className='h2-bold text-dark100_light900'>Join DevFlow</h1>
            <p className='paragraph-regular text-dark500_light400'>
              To get your questions answer
            </p>
          </div>
          <Image
          src="/images/site-logo.svg"
          alt="DevFlow logo"
          width={50}
          height={50}
          className='object-contain'
          />
        </div>
        {children}
        <SocialForm/>
        {/* <p>Social Auth</p> */}
      </section>
    </main>
  )
}

export default AuthLayout