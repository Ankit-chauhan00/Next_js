"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { use, useState } from "react";
import { toast } from "sonner";
import { ActionResponse } from "@/types/global";
import { toggelSaveQuestion } from "@/lib/action/collection.action";

const SaveQuestion = ({
  questionId,
  hasSavedQuestionPromise,
}: {
  questionId: string;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}) => {
  const session = useSession();
  const userId = session?.data?.user?.id;

  const { data } = use(hasSavedQuestionPromise);

  const initialSaved = data?.saved || false;

  const [hasSaved, setHasSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId) return toast.error("You need to be Logged in First");

    setIsLoading(true);

    try {
      const { success, data, error } = await toggelSaveQuestion({ questionId });

      if (!success) throw new Error(error?.message || "An error occurred");

      // UPDATE local state after successful save
      setHasSaved(data?.saved ?? false);
      toast.success(`Question ${data?.saved ? "saved" : "unsaved"} successfully`);
      console.log("Saved Toggle:", data?.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="Save question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
