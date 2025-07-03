import {ContentType, type CreateBlogSchema} from "@/schema/blog-schema";
import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import {Trash2, GripVertical, Image, Video, Type} from "lucide-react";
import {useFieldArray, type UseFormReturn} from "react-hook-form";
import {Input} from "../ui/input";
import {Separator} from "@radix-ui/react-separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import LoadingButton from "../loading-button";
import {Button} from "../ui/button";
import ContentImages from "./content-image";
import ContentVideos from "./content-videos";

import Editor from "../editor";

const contentTypeIcons = {
  TEXT: <Type className="w-4 h-4" />,
  IMAGES: <Image className="w-4 h-4" />,
  VIDEOS: <Video className="w-4 h-4" />,
};

interface ContentFormCardProps {
  form: UseFormReturn<CreateBlogSchema>;
}

function ContentFormCard({form}: ContentFormCardProps) {
  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({
    control: form.control,
    name: "content",
  });

  const watchedContent = form.watch("content");

  const addContent = (type: ContentType) => {
    appendContent({
      type,
      order: contentFields.length + 1,
      title: "",
      description: "",
      images: type === ContentType.IMAGES ? [] : undefined,
      videos: type === ContentType.VIDEOS ? [] : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content Sections</CardTitle>
          <div className="flex gap-2">
            <LoadingButton
              type="button"
              text="Text"
              variant="outline"
              size="sm"
              onClick={() => addContent(ContentType.TEXT)}
            />
            <LoadingButton
              type="button"
              text="Images"
              variant="outline"
              size="sm"
              onClick={() => addContent(ContentType.IMAGES)}
            />
            <LoadingButton
              type="button"
              text="Videos"
              variant="outline"
              size="sm"
              onClick={() => addContent(ContentType.VIDEOS)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contentFields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No content sections yet. Add your first section above.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {contentFields.map((field, index) => (
              <Card key={field.id} className="">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      {
                        contentTypeIcons[
                          watchedContent?.[index]?.type as ContentType
                        ]
                      }
                      <span className="font-medium">
                        {watchedContent?.[index]?.type} Section {index + 1}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContent(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`content.${index}.title`}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Content Title</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Content Title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`content.${index}.description`}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Content Description</FormLabel>
                        <FormControl>
                          <Editor
                            field={field}
                            key={`key-content-${index}`}
                            id={`id-content-${index}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedContent?.[index]?.type === ContentType.IMAGES && (
                    <>
                      <Separator />
                      <ContentImages form={form} contentIndex={index} />
                    </>
                  )}

                  {watchedContent?.[index]?.type === ContentType.VIDEOS && (
                    <>
                      <Separator />
                      <ContentVideos form={form} contentIndex={index} />
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContentFormCard;
