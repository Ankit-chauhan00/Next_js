"use client";

import { toggelSaveQuestion } from "@/lib/action/collection.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const SaveQuestion = ({ questionId }: { questionId: string }) => {
  const session = useSession();
  const userId = session?.data?.user?.id;

  const [isLoading, setisLoading] = useState(false);
  let hasSaved = false;

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId) return toast.error("you need to be Loggedin to save a Question");

    setisLoading(true);

    try {
      const { success, data, error } = await toggelSaveQuestion({ questionId });

      if (!success) throw new Error(error?.message || "An Error Occured");

      toast.success(`Question ${data?.saved ? "saved" : "unsaved"} successfully`);
      hasSaved = !hasSaved;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An Error occured");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="save question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
