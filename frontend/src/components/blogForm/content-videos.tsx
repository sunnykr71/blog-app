import type {CreateBlogSchema} from "@/schema/blog-schema";
import {Label} from "@radix-ui/react-label";
import {Controller, useFieldArray, type UseFormReturn} from "react-hook-form";
import {Button} from "../ui/button";
import {Plus, Trash2} from "lucide-react";
import {Card} from "../ui/card";
import {Input} from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {getSignedPutUrl, uploadFileOnS3} from "@/app/services/s3-service";

const ContentVideos = ({
  form,
  contentIndex,
}: {
  form: UseFormReturn<CreateBlogSchema>;
  contentIndex: number;
}) => {
  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({
    control: form.control,
    name: `content.${contentIndex}.videos`,
  });

  const addVideo = () => {
    appendVideo({
      url: "",
      thumbnailUrl: "",
      title: "",
      order: videoFields.length + 1,
    });
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Videos</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVideo}>
          <Plus className="w-3 h-3 mr-1" />
          Add Video
        </Button>
      </div>

      {videoFields.map((field, videoIndex) => (
        <Card key={field.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Label className="text-xs text-muted-foreground">
              Video {videoIndex + 1}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVideo(videoIndex)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`content.${contentIndex}.videos.${videoIndex}.url`}
              render={({field}) => (
                <FormItem>
                  <FormLabel>Video URL *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/video.mp4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`content.${contentIndex}.videos.${videoIndex}.thumbnailUrl`}
              render={({field}) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder="Thumbnail URL"
                      {...field}
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name={`content.${contentIndex}.videos.${videoIndex}.title`}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ContentVideos;
