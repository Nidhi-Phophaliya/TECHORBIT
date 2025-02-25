"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

interface Props {
  userId: string;
}

const PostThread = ({ userId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  const [files, setFiles] = useState<File[]>([]);
  const [image, setImage] = useState<string>("");
  const { startUpload } = useUploadThing("media");

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        setImage(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    let imageUrl = "";

    if (image) {
      const hasImageChanged = isBase64Image(image);

      if (hasImageChanged) {
        const imgRes = await startUpload(files);

        if (imgRes && imgRes[0].url) {
          imageUrl = imgRes[0].url;
        }
      }
    }

    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
      image: imageUrl,
    });

    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormItem className="flex items-center gap-4">
          <FormLabel className="account-form_image-label">
            {image ? (
              <Image
                src={image}
                alt="thread image"
                width={96}
                height={96}
                priority
                className="object-contain"
              />
            ) : (
              <Image
                src="/assets/profile.svg"
                alt="thread image"
                width={24}
                height={24}
                className="object-contain"
              />
            )}
          </FormLabel>
          <FormControl className="flex-1 text-base-semibold text-gray-200">
            <Input
              type="file"
              accept="image/*"
              placeholder="Add thread image"
              className="account-form_image-input"
              onChange={handleImage}
            />
          </FormControl>
        </FormItem>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  );
};

export default PostThread;
