"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { z} from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useRef, useState } from "react";
import { AnswerSchema } from "@/lib/validation";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { Button } from "../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";

const Editor = dynamic(() => import("@/components/editor"), {
  // Make sure we turn SSR off
  ssr: false,
});

const Answerform = () => {
  const [isSubmitting, setIsSubmitfalse] = useState(false);
  const [isAIsubmitting, setisAIsubmitting] = useState(false);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: standardSchemaResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    console.log(values);
  };

  const editerRef = useRef<MDXEditorMethods>(null);

  return (
    <div className="">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">Write your answer here</h4>
        <Button className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500" disabled={isAIsubmitting}>
          {isAIsubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                alt="Generate Ai Answer"
                width={12}
                height={12}
                className="object-contain"
              />
              Generate Ai Answer
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 flex w-full flex-col gap-10">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flx-col flex w-full gap-3">
                <FormControl className="mt-3.5">
                  <Editor value={field.value} editorRef={editerRef} fieldChange={field.onChange} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" className="primary-gradient w-fit">
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Answerform;
