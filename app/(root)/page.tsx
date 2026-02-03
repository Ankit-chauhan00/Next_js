import HomeFilter from "@/components/filters/HomeFilter"
import LocalSearch from "@/components/search/LocalSearch"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routs"
import Link from "next/link"



const Home = async () => {
 

  return (
    <>
    <section className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4">
      <h1 className="h1-bold ">All Question</h1>

      <Button className="primary-gradient main-h-10.25 px-4 py-5 text-light-900" asChild>
        <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
      </Button>
    </section>

    <section className="mt-11">
      <LocalSearch
      route='/'
      imgSrc='/icons/search.svg'
      placeholder = "Search question..."
      otherClasses="flex-1"
      />
    </section>

    <HomeFilter/>

    <div className="mt-10 flex w-full flex-col gap-6">
      <p>Question Card 1</p>
      <p>Question Card 2</p>
      <p>Question Card 3</p>
      <p>Question Card 4</p>
    </div>
    </>
  )
}

export default Home