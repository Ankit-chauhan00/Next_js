import { auth } from '@/auth'
import QuestionForm from '@/components/forms/QuestionForm'
import ROUTES from '@/constants/routs';
import { getQuestion } from '@/lib/action/question.action';
import { RouteParams } from '@/types/global';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

const EditQuestion = async ({params}: RouteParams) => {
    const { id }= await params;
    if(!id) return notFound();

  const session = await auth();
  if(!session) return redirect("/sign-in")

    const {data: question, success} = await getQuestion({questionId: id})

    if(!success) return notFound();

    if (!question?.author){ 
        console.log("question auth not found");
        return notFound();
    }
    const isOwner = question.author._id.toString() === session.user?.id;
    if (!isOwner) {
  return redirect(ROUTES.QUESTION(id));
}

  return (
    <>
    <main>
        <QuestionForm question={question} isEdit /> 
    </main>
    </>
  )
}

export default EditQuestion