import {z} from "zod";

export const requiredString = (fieldName: string) =>
  z
    .string()
    .trim()
    .min(1, {message: `${fieldName} is required`});
