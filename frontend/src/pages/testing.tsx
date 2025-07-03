import {useState} from "react";
import {useForm, useFieldArray, Controller} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Plus, Trash2, GripVertical, Image, Video, Type} from "lucide-react";

// UI Components (shadcn/ui)
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ContentType} from "@/schema/blog-schema";

// Validation Schemas
const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`);

const createContentImageSchema = z.object({
  url: z.string().url("Please provide a valid URL for image"),
  altText: z
    .string()
    .max(125, "Alt text cannot exceed 125 characters")
    .optional(),
  caption: z
    .string()
    .max(200, "Image caption cannot exceed 200 characters")
    .optional(),
  order: z.number().int().min(0).optional().default(0),
});

const createContentVideoSchema = z.object({
  url: z.string().url("Please provide a valid URL for video"),
  thumbnailUrl: z
    .string()
    .url("Please provide a valid URL for thumbnail")
    .optional(),
  title: z
    .string()
    .max(200, "Video title cannot exceed 200 characters")
    .optional(),
  duration: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 second")
    .optional(),
  order: z.number().int().min(0).optional().default(0),
});

const createContentSchema = z.object({
  type: z.enum(["TEXT", "IMAGES", "VIDEOS"]),
  order: z.number().int().min(0),
  title: z
    .string()
    .max(200, "Content title cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Content description cannot exceed 1000 characters")
    .optional(),
  images: z.array(createContentImageSchema).optional(),
  videos: z.array(createContentVideoSchema).optional(),
});

const createBlogSchema = z.object({
  title: requiredString("Title").max(200, "Title cannot exceed 200 characters"),
  coverImage: z.string().optional(),
  description: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .optional(),
  content: z.array(createContentSchema).optional(),
  tags: z.array(z.string().trim().min(1).max(50).toLowerCase()).optional(),
});

// Content Type Icons
const contentTypeIcons = {
  TEXT: <Type className="w-4 h-4" />,
  IMAGES: <Image className="w-4 h-4" />,
  VIDEOS: <Video className="w-4 h-4" />,
};

const BlogForm = ({initialData = null, onSubmit, isEditing = false}) => {
  const [newTag, setNewTag] = useState("");

  const form = useForm({
    resolver: zodResolver(createBlogSchema),
    defaultValues: initialData || {
      title: "",
      coverImage: "",
      description: "",
      content: [],
      tags: [],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = form;

  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({
    control,
    name: "content",
  });

  const watchedContent = watch("content");
  const watchedTags = watch("tags") || [];

  // Handle form submission
  const handleFormSubmit = (data: any) => {
    console.log("Form data:", data);
    if (onSubmit) {
      onSubmit(data);
    }
  };

  // Add new content section
  const addContent = (type: ContentType) => {
    appendContent({
      type,
      order: contentFields.length,
      title: "",
      description: "",
      images: type === ContentType.IMAGES ? [] : undefined,
      videos: type === ContentType.VIDEOS ? [] : undefined,
    });
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.toLowerCase().trim())) {
      setValue("tags", [...watchedTags, newTag.toLowerCase().trim()]);
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Content Image Component
  const ContentImages = ({contentIndex}: {contentIndex: number}) => {
    const {
      fields: imageFields,
      append: appendImage,
      remove: removeImage,
    } = useFieldArray({
      control,
      name: `content.${contentIndex}.images`,
    });

    const addImage = () => {
      appendImage({
        url: "",
        altText: "",
        caption: "",
        order: imageFields.length,
      });
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
              <div>
                <Label
                  htmlFor={`content.${contentIndex}.images.${imageIndex}.url`}
                >
                  Image URL *
                </Label>
                <Controller
                  name={`content.${contentIndex}.images.${imageIndex}.url`}
                  control={control}
                  render={({field}) => (
                    <Input
                      {...field}
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                />
                {errors.content?.[contentIndex]?.images?.[imageIndex]?.url && (
                  <p className="text-sm text-red-500 mt-1">
                    {
                      errors.content[contentIndex].images[imageIndex].url
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor={`content.${contentIndex}.images.${imageIndex}.altText`}
                >
                  Alt Text
                </Label>
                <Controller
                  name={`content.${contentIndex}.images.${imageIndex}.altText`}
                  control={control}
                  render={({field}) => (
                    <Input {...field} placeholder="Descriptive alt text" />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor={`content.${contentIndex}.images.${imageIndex}.caption`}
                >
                  Caption
                </Label>
                <Controller
                  name={`content.${contentIndex}.images.${imageIndex}.caption`}
                  control={control}
                  render={({field}) => (
                    <Input {...field} placeholder="Image caption" />
                  )}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Content Video Component
  const ContentVideos = ({contentIndex}: {contentIndex: number}) => {
    const {
      fields: videoFields,
      append: appendVideo,
      remove: removeVideo,
    } = useFieldArray({
      control,
      name: `content.${contentIndex}.videos`,
    });

    const addVideo = () => {
      appendVideo({
        url: "",
        thumbnailUrl: "",
        title: "",
        order: videoFields.length,
      });
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
              <div>
                <Label
                  htmlFor={`content.${contentIndex}.videos.${videoIndex}.url`}
                >
                  Video URL *
                </Label>
                <Controller
                  name={`content.${contentIndex}.videos.${videoIndex}.url`}
                  control={control}
                  render={({field}) => (
                    <Input
                      {...field}
                      placeholder="https://example.com/video.mp4"
                    />
                  )}
                />
                {errors.content?.[contentIndex]?.videos?.[videoIndex]?.url && (
                  <p className="text-sm text-red-500 mt-1">
                    {
                      errors.content[contentIndex].videos[videoIndex].url
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor={`content.${contentIndex}.videos.${videoIndex}.thumbnailUrl`}
                >
                  Thumbnail URL
                </Label>
                <Controller
                  name={`content.${contentIndex}.videos.${videoIndex}.thumbnailUrl`}
                  control={control}
                  render={({field}) => (
                    <Input
                      {...field}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor={`content.${contentIndex}.videos.${videoIndex}.title`}
                >
                  Video Title
                </Label>
                <Controller
                  name={`content.${contentIndex}.videos.${videoIndex}.title`}
                  control={control}
                  render={({field}) => (
                    <Input {...field} placeholder="Video title" />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor={`content.${contentIndex}.videos.${videoIndex}.duration`}
                >
                  Duration (seconds)
                </Label>
                <Controller
                  name={`content.${contentIndex}.videos.${videoIndex}.duration`}
                  control={control}
                  render={({field}) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="120"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                    />
                  )}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
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
        {/* Basic Blog Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Controller
                name="title"
                control={control}
                render={({field}) => (
                  <Input {...field} placeholder="Enter blog title" />
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Controller
                name="coverImage"
                control={control}
                render={({field}) => (
                  <Input
                    {...field}
                    placeholder="https://example.com/cover-image.jpg"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="description">Meta Description</Label>
              <Controller
                name="description"
                control={control}
                render={({field}) => (
                  <Textarea
                    {...field}
                    placeholder="Brief description for SEO (max 160 characters)"
                    className="resize-none"
                    rows={3}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add Tag
              </Button>
            </div>

            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
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

        {/* Content Sections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content Sections</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContent(ContentType.TEXT)}
                >
                  {contentTypeIcons.TEXT}
                  Text
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContent(ContentType.IMAGES)}
                >
                  {contentTypeIcons.IMAGES}
                  Images
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContent(ContentType.VIDEOS)}
                >
                  {contentTypeIcons.VIDEOS}
                  Videos
                </Button>
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
                  <Card key={field.id} className="border-l-4 border-l-primary">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`content.${index}.title`}>
                            Section Title
                          </Label>
                          <Controller
                            name={`content.${index}.title`}
                            control={control}
                            render={({field}) => (
                              <Input {...field} placeholder="Section title" />
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`content.${index}.order`}>
                            Order
                          </Label>
                          <Controller
                            name={`content.${index}.order`}
                            control={control}
                            render={({field}) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`content.${index}.description`}>
                          Description
                        </Label>
                        <Controller
                          name={`content.${index}.description`}
                          control={control}
                          render={({field}) => (
                            <Textarea
                              {...field}
                              placeholder="Section description"
                              className="resize-none"
                              rows={3}
                            />
                          )}
                        />
                      </div>

                      {watchedContent?.[index]?.type === ContentType.IMAGES && (
                        <>
                          <Separator />
                          <ContentImages contentIndex={index} />
                        </>
                      )}

                      {watchedContent?.[index]?.type === ContentType.VIDEOS && (
                        <>
                          <Separator />
                          <ContentVideos contentIndex={index} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(handleFormSubmit)}>
            {isEditing ? "Update Blog Post" : "Create Blog Post"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Example usage component
export default function BlogFormExample() {
  const handleSubmit = (data: any) => {
    console.log("Blog form submitted:", data);
    // Here you would typically send the data to your API
    alert("Blog form submitted successfully! Check console for details.");
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogForm onSubmit={handleSubmit} />
    </div>
  );
}
