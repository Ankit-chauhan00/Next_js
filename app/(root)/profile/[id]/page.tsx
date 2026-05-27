import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import ProfileLinks from "@/components/users/ProfileLinks";
import { getUser, getUserQuestion } from "@/lib/action/user.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Stats from "@/components/users/Stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import QuestionCard from "@/components/cards/QuestionCard";
import Pagination from "@/components/Pagination";

const Profile = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize } = await searchParams;

  if (!id) notFound();

  const loggedInUser = await auth();

  const { success, data, error } = await getUser({ userId: id });

  if (!success) {
    return (
      <>
        <div className="h1-bold text-dark100_light900">{error?.message}</div>
      </>
    );
  }

  const { user, totalQuestions, totalAnswers } = data!;

  const { _id, name, image, portfolio, reputation, location, createdAt, username, bio } = user;

  const {
    success: userQuestionSuccess,
    data: userQuestions,
    error: userquestionError,
  } = await getUserQuestion({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const { questions, isNext: hasMoreQuestions } = userQuestions!;
  

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={_id}
            name={name}
            imageUrl={image}
            classname="size-[140px] rounded-full object-cover"
            fallbackClassName="text-6xl font-bolder"
          />
          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{username}</p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {portfolio && <ProfileLinks imageUrl="/icons/links.svg" href={portfolio} title="potfolio" />}
              {location && <ProfileLinks imageUrl="/icons/location.svg" title="potfolio" />}
              {<ProfileLinks imageUrl="/icons/calendar.svg" title={dayjs(createdAt).format("MMMM YYYY")} />}
            </div>

            {bio && <p className="paragraph-regular text-dark400_light700 mt-8">{bio}</p>}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {loggedInUser?.user?.id === id && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark200_light900 min-h-12 min-w-44 px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
      />

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-[2]">
          <TabsList className="background-light800_dark200 flex min-h-[42px] gap-3 p-2">
            <TabsTrigger className="tab border-none" value="top-posts">
              Top Posts
            </TabsTrigger>
            <TabsTrigger className="tab border-0" value="answers">
              {" "}
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-5 flex w-full flex-col gap-6" value="top-posts">
            <DataRenderer
            data={questions}
            empty={EMPTY_QUESTION}
            success={userQuestionSuccess}
            error={error}
            render={()=>
              <div className="flex w-full flex-col gap-6 ">
                {questions.map((question)=>(
                  <QuestionCard key={question._id} question={question} />
                ))}
              </div>
            }
            />
            <Pagination page={page}
            isNext={hasMoreQuestions}/>
          </TabsContent>
          <TabsContent className="mt-5 flex w-full flex-col gap-6" value="answers">
            List of Answers
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
          <div className="mt-7 flex flex-col gap-4">
            <p>List of Tags</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
