'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import ROUTES from "@/constants/routs";

const SocialForm = () => {

  const handelSignIn = async (provider: 'github' | "google") =>{
    try {
      await signIn(provider,{
        redirectTo: ROUTES.HOME,
        redirect: true,
      } )
    } catch (error) {

      toast.error("signin Failed",{
        description: error instanceof Error ? error.message: "An Error occured during Sign-in"
      })
    }
  }

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button onClick={()=> handelSignIn('github')} className="background-dark400_light900 body-medium text-light text-dark200_light800 rounded-2 min-h-12 flex-1 py-3.5 px-4">
        <Image
          src="/icons/github.svg"
          alt="Github Logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>Log in with Github</span>
      </Button>

      <Button className="background-dark400_light900 body-medium text-light text-dark200_light800 rounded-2 min-h-12 flex-1 px-3.5 px-4">
        <Image src="/icons/google.svg" alt="Google Logo" width={20} height={20} className="mr-2.5 object-contain" />
        <span>login with Google</span>
      </Button>
    </div>
  );
};

export default SocialForm;
