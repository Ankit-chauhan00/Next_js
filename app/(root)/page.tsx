import { auth, signOut } from '@/auth'
import React from 'react'
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routs';

const Home = async () => {
  const session = await auth();
  console.log(session);
  return (
    <>
    <form className='px-10 pt-25'  action={
      async ()=> {
        "use server";
        await signOut({redirectTo: ROUTES.SIGN_IN})
      }
    }>
      <Button type="submit">Log out</Button>
    </form>
    </>
  )
}

export default Home