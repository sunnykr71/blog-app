import {z} from "zod";
import {requiredString} from "./helper";

export enum ContentType {
  TEXT = "TEXT",
  IMAGES = "IMAGES",
  VIDEOS = "VIDEOS",
}

// Blog schemas
const title = requiredString("Title").max(
  200,
  "Title cannot exceed 200 characters"
);

const coverImage = requiredString("Cover Image").optional();

const description = z
  .string()
  .max(250, "Meta description cannot exceed 250 characters")
  .optional();

const viewCount = z
  .number()
  .int("View count must be an integer")
  .min(0, "View count cannot be negative");

const readTime = z
  .number()
  .int("Read time must be an integer")
  .min(1, "Read time must be at least 1 minute")
  .optional();

// Content schemas
const contentType = z.enum(["TEXT", "IMAGES", "VIDEOS"]);

const contentOrder = z
  .number()
  .int("Order must be an integer")
  .min(0, "Order cannot be negative");

const contentTitle = z
  .string()
  .max(200, "Content title cannot exceed 200 characters")
  .optional();

const contentDescription = z
  .string()
  .max(1000, "Content description cannot exceed 1000 characters")
  .optional();

// Content Image schemas
const imageUrl = requiredString("Image").url(
  "Please provide a valid URL for image"
);

const altText = z
  .string()
  .max(125, "Alt text cannot exceed 125 characters")
  .optional();

const imageCaption = z
  .string()
  .max(200, "Image caption cannot exceed 200 characters")
  .optional();

const imageOrder = z
  .number()
  .int("Image order must be an integer")
  .min(0, "Image order cannot be negative");

// Content Video schemas
const videoUrl = z.string().url("Please provide a valid URL for video");

const thumbnailUrl = z
  .string()
  .url("Please provide a valid URL for thumbnail")
  .optional();

const videoTitle = z
  .string()
  .max(200, "Video title cannot exceed 200 characters")
  .optional();

const duration = z
  .number()
  .int("Duration must be an integer")
  .min(1, "Duration must be at least 1 second")
  .optional();

const videoOrder = z
  .number()
  .int("Video order must be an integer")
  .min(0, "Video order cannot be negative");

// Tag schemas
const tagName = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(50, "Tag name cannot exceed 50 characters")
  .toLowerCase();

// Content Image schema
export const createContentImageSchema = z.object({
  url: imageUrl,
  altText,
  caption: imageCaption,
  order: imageOrder,
});

export const updateContentImageSchema = z.object({
  url: imageUrl.optional(),
  altText,
  caption: imageCaption,
  order: imageOrder.optional(),
});

// Content Video schema
export const createContentVideoSchema = z.object({
  url: videoUrl,
  thumbnailUrl,
  title: videoTitle,
  duration,
  order: videoOrder,
});

export const updateContentVideoSchema = z.object({
  url: videoUrl.optional(),
  thumbnailUrl,
  title: videoTitle,
  duration,
  order: videoOrder.optional(),
});

// Content schema
export const createContentSchema = z.object({
  type: contentType,
  order: contentOrder,
  title: contentTitle,
  description: contentDescription,
  images: z.array(createContentImageSchema).optional(),
  videos: z.array(createContentVideoSchema).optional(),
});

export const updateContentSchema = z.object({
  type: contentType.optional(),
  order: contentOrder.optional(),
  title: contentTitle,
  description: contentDescription,
  images: z.array(updateContentImageSchema).optional(),
  videos: z.array(updateContentVideoSchema).optional(),
});

// Tag schema
export const createTagSchema = z.object({
  name: tagName,
});

// Blog schema
export const createBlogSchema = z.object({
  title,
  coverImage,
  description,
  content: z.array(createContentSchema).optional(),
  tags: z.array(tagName).optional(),
});

export const updateBlogSchema = z.object({
  title: title.optional(),
  coverImage,
  description,
  viewCount: viewCount.optional(),
  readTime,
  content: z.array(updateContentSchema).optional(),
  tags: z.array(tagName).optional(),
});

export type CreateContentImageSchema = z.infer<typeof createContentImageSchema>;
export type UpdateContentImageSchema = z.infer<typeof updateContentImageSchema>;

export type CreateContentVideoSchema = z.infer<typeof createContentVideoSchema>;
export type UpdateContentVideoSchema = z.infer<typeof updateContentVideoSchema>;

export type CreateContentSchema = z.infer<typeof createContentSchema>;
export type UpdateContentSchema = z.infer<typeof updateContentSchema>;

export type CreateTagSchema = z.infer<typeof createTagSchema>;

export type CreateBlogSchema = z.infer<typeof createBlogSchema>;
export type UpdateBlogSchema = z.infer<typeof updateBlogSchema>;
