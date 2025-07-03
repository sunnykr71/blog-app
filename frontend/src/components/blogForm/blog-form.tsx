import {useForm, type UseFormReturn} from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {Input} from "../ui/input";
import {createBlogSchema, type CreateBlogSchema} from "@/schema/blog-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {getSignedPutUrl, uploadFileOnS3} from "@/app/services/s3-service";
import LoadingButton from "../loading-button";
import {useCreateBlogMutation} from "@/app/services/blog-service";
import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Badge} from "../ui/badge";
import ContentFormCard from "./content-form-card";

import Editor from "../editor";

function BlogForm({isEditing}: {isEditing?: boolean}) {
  const [createBlog, {isLoading, isSuccess}] = useCreateBlogMutation();
  const [newTag, setNewTag] = useState("");

  const form: UseFormReturn<CreateBlogSchema> = useForm<CreateBlogSchema>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      coverImage: "",
      title: "",
      description: "",
      content: [],
      tags: [],
    },
  });

  const watchedTags = form.watch("tags") || [];

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.toLowerCase().trim())) {
      form.setValue("tags", [...watchedTags, newTag.toLowerCase().trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (blogData: CreateBlogSchema) => {
    await createBlog(blogData);

    if (isSuccess) {
      form.reset();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const contentType = file.type;
    const fileName = file.name;

    try {
      const {data} = await getSignedPutUrl({fileName, contentType});

      const {url, key} = data;

      await uploadFileOnS3(url, file);

      form.setValue("coverImage", key);
    } catch (error) {
      console.log("s3 error", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing
            ? "Update your blog post details"
            : "Fill in the details to create a new blog post"}
        </p>
      </div>

      <div className="space-y-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 w-full space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Cover Image*</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          placeholder="Cover Image"
                          {...field}
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        {/* <ReactQuill
                          {...field}
                          key={`quill-${field.name}`}
                          id={`quill-${field.name}`}
                          className="bg-input/30 rounded-md border border-input custom-quill min-h-[10rem]"
                        /> */}
                        <Editor
                          field={field}
                          key={`key-${field.name}`}
                          id={`id-${field.name}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>{" "}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({field}) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            {...field}
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addTag())
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <LoadingButton
                    text="Add Tag"
                    onClick={addTag}
                    variant="secondary"
                  />
                </div>

                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <ContentFormCard form={form} />

            <LoadingButton
              size="lg"
              className="w-full"
              text={isEditing ? "Update Blog Post" : "Create Blog Post"}
              loading={isLoading}
              variant="secondary"
              type="submit"
            />
          </form>
        </Form>
      </div>
    </div>
  );
}

export default BlogForm;
