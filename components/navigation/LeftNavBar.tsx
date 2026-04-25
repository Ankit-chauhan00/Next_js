import { auth, signOut } from "@/auth";
import NavLinks from "./navbar/NavLinks";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routs";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

const LeftNavBar = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  console.log("SESSION: ",session);
  console.log(userId);

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-500 sticky top-0 left-0 h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 max-sm:hidden lg:w-66.5 dark:shadow-none">
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks userId={userId} />
      </div>

      <div className="flex flex-col gap-3">
        {
          userId ? (
            <form action={async () =>{
              'use server';

              await signOut();
            }}>
              <Button type="submit" className="base-medium w-fit bg-transparent px-4 py-3">
                <LogOut className="size-5 text-black dark:text-white"/>
                <span className="max-lg:hidden text-dark_300_light900 dark:text-white ">Logout</span>
              </Button>
            </form>
          ): (
            <>
                    <Button className="small-medium btn-secondary min-h-10.25 w-full rounded-lg px-4 py-3 shadow-none" asChild>
          <Link href={ROUTES.SIGN_IN}>
          <Image
          src="/icons/account.svg"
          width={20}
          height={20}
          alt="Account"
          className="invert-colors lg:hidden"
          />
            <span className="primary-text-gradient max-lg:hidden">Log In</span>
          </Link>
        </Button>

        <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none" asChild>
          <Link href={ROUTES.SIGN_UP}>
          <Image
          src="/icons/sign-up.svg"
          width={20}
          height={20}
          alt="Account"
          className="invert-colors lg:hidden"
          />
          <span className="max-lg:hidden">Sign up</span>
          </Link>
        </Button>
            </>
          )
        }
      </div>
    </section>
  );
};

export default LeftNavBar;
