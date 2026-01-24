import React from 'react'
import { Button } from '@/components/ui/button';
import Image from "next/image";

const SocialForm = () => {
  return (
    <div className='mt-10 flex flex-wrap gap-2.5'>
      <Button className='background-dark400_light900 body-medium text-light min-h-12 text-dark200_light800 flex-1 rounded-2 px-4 px-3.5'>
        <Image
        src="/icons/github.svg"
        alt='Github Logo'
        width={20}
        height={20}
        className='invert-colors mr-2.5 object-contain'
        />
        <span>Log in with Github</span>
      </Button>

      <Button className='background-dark400_light900 body-medium text-light min-h-12 text-dark200_light800 flex-1 rounded-2 px-4 px-3.5'>
        <Image
        src="/icons/google.svg"
        alt='Google Logo'
        width={20}
        height={20}
        className=' mr-2.5 object-contain'
        />
        <span>login with Google</span>
      </Button>
    </div>
  )
}

export default SocialForm