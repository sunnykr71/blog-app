import type {CreateBlogSchema} from "@/schema/blog-schema";
import {useFieldArray, type UseFormReturn} from "react-hook-form";
import {Label} from "../ui/label";
import {Button} from "../ui/button";
import {Card} from "../ui/card";
import {Plus, Trash2} from "lucide-react";
import {Input} from "../ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {getSignedPutUrl, uploadFileOnS3} from "@/app/services/s3-service";

function ContentImages({
  form,
  contentIndex,
}: {
  form: UseFormReturn<CreateBlogSchema>;
  contentIndex: number;
}) {
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control: form.control,
    name: `content.${contentIndex}.images`,
  });

  const addImage = () => {
    appendImage({
      url: "",
      altText: "",
      caption: "",
      order: imageFields.length + 1,
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
        <Label className="text-sm font-medium">Images</Label>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <Plus className="w-3 h-3 mr-1" />
          Add Image
        </Button>
      </div>

      {imageFields.map((field, imageIndex) => (
        <Card key={field.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Label className="text-xs text-muted-foreground">
              Image {imageIndex + 1}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeImage(imageIndex)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`content.${contentIndex}.images.${imageIndex}.url`}
              render={({field}) => (
                <FormItem>
                  <FormLabel>Image *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder="Image URL"
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
              name={`content.${contentIndex}.images.${imageIndex}.altText`}
              render={({field}) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descriptive alt text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name={`content.${contentIndex}.images.${imageIndex}.caption`}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Image caption" />
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
}

export default ContentImages;
