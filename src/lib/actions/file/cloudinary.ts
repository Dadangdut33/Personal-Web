"use server";

import { ERR_AUTH_EXPIRED, FILE_SIZE_LIMIT } from "@/lib/constants";
import { db } from "@/lib/db";
import { FileCategoryType } from "@/lib/db/schema/_enum";
import { M_File } from "@/lib/db/schema/file";
import { stringTrimmed } from "@/lib/db/zod/utils";
import { env } from "@/lib/env.mjs";
import { logger } from "@/lib/logger";
import { getUserAuth, isAdmin } from "@/lib/lucia/utils";
import rateLimit from "@/lib/rateLimit";
import { ApiReturn, DeleteParams, MediaUpload, TypedFormData } from "@/lib/types";
import { getExtension, getFileName, getTimeMs, getTypedFormData, readableFileSize } from "@/lib/utils";
import { FileWithPath } from "@mantine/dropzone";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { eq, inArray } from "drizzle-orm";
import { isString } from "lodash";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const limiter = rateLimit({
  uniqueTokenPerInterval: 200,
  interval: getTimeMs(10, "minute"),
});

export type returnStuff = {
  success: number;
  file: UploadApiResponse | string;
  id?: string;
  duplicate?: boolean;
};

export async function uploadFile_cloudinary(
  form: TypedFormData<MediaUpload>,
  category: FileCategoryType
): Promise<returnStuff> {
  try {
    const readOnlyHeader = headers();
    const header = new Headers(readOnlyHeader);
    await limiter.check(header, 200, "UPLOAD_FILE"); // max 200 requests per 10 minutes
  } catch (error) {
    return { success: 0, file: "Too many requests" };
  }

  const { session } = await getUserAuth();
  if (!session) return { success: 0, file: "Error. Unauthorized" };

  let file = form.get("file") as File | string | Blob;
  if (!file) return { success: 0, file: "Error: No files received." };

  const privateUpload = form.get("private") === "true";
  try {
    if (isString(file)) {
      if (file.length < 3) return { success: 0, file: "Error: Invalid file (String too short, not a valid url)" };
      const response = await fetch(file);
      if (!response.ok) return { success: 0, file: "Error: Failed to fetch image." };
      file = await response.blob();
    }

    const fileName = getFileName((file as File).name);
    const extension = getExtension((file as File).name) ?? "unknown";

    if (file.size > FILE_SIZE_LIMIT)
      return {
        success: 0,
        file: `Error: File size limit exceeded (Max is ${readableFileSize(FILE_SIZE_LIMIT)}`,
      };

    // Check if file already exists
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const [existingFile] = await db.select().from(M_File).where(eq(M_File.originalHash, fileHash));
    if (existingFile) return { success: 1, file: existingFile.file, id: existingFile.id, duplicate: true };

    // Save the file to cloudinary
    // https://cloudinary.com/documentation/image_upload_api_reference#upload
    const uploaded = await cloudinary.uploader.upload(buffer.toString("base64"), {
      tags: category,
      folder: `personal-web`,
    });

    // add the file to the database
    const [record] = await db
      .insert(M_File)
      .values({
        originalHash: fileHash,
        uploaderId: session.user.id,
        lastEditorId: session.user.id,
        category,
        file: uploaded,
      })
      .returning({ id: M_File.id });

    return {
      success: 1,
      file: uploaded,
      id: record.id,
    };
  } catch (error) {
    logger.error(error, "Error uploading file");
    return { success: 0, file: "Error uploading file" };
  }
}

export const addFile = async (form: TypedFormData<MediaUpload>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const category = stringTrimmed.parse(form.get("category")) as FileCategoryType;
    const upload = await uploadFile_cloudinary(form, category);

    logger.info(upload, "File added");
    revalidatePath("/dashboard/media");
    return {
      success: upload.success,
      message: upload.success ? "Success! File added" : "Error adding file",
    };
  } catch (error) {
    logger.error(error, "Error adding file");
    return { success: 0, message: "Error! " + error };
  }
};

// only edit the category
export const editFile = async (form: TypedFormData<MediaUpload & { id: string }>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringTrimmed.parse(form.get("id")) as string;
    const category = stringTrimmed.parse(form.get("category")) as FileCategoryType;

    // first find the file
    const [data] = await db.select().from(M_File).where(eq(M_File.id, id));
    if (!data) return { success: 0, message: "Error finding file" };

    await cloudinary.uploader.replace_tag(category, [data.file.public_id]);

    const { tags, ...fileData } = data.file;
    await db
      .update(M_File)
      .set({ category, file: { ...fileData, tags: [category] } })
      .where(eq(M_File.id, id));

    logger.info(data, "File edited");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Successfully edited file!" : "Error on file edit" };
  } catch (error) {
    logger.error(error, "Error editing File");
    return { success: 0, message: "Error! " + error };
  }
};

export const deleteFile = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringTrimmed.parse(form.get("id")) as string;
    // first find the file
    const [data] = await db.select().from(M_File).where(eq(M_File.id, id));
    if (!data) return { success: 0, message: "Error finding file" };

    await cloudinary.uploader.destroy(data.file.public_id);

    // delete the file from the database
    await db.delete(M_File).where(eq(M_File.id, id));

    logger.info(data, "File deleted");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Successfully deleted file" : "Error on file delete" };
  } catch (error) {
    logger.error(error, "Error deleting file");
    return { success: 0, message: "Error! " + error };
  }
};

export const bulkDeleteMedia = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const ids = JSON.parse(stringTrimmed.parse(form.get("id"))) as string[];
    // first find the files
    const data = await db.select().from(M_File).where(inArray(M_File.id, ids));
    if (!data) return { success: 0, message: "Error finding files" };

    await cloudinary.api.delete_resources(data.map((d) => d.file.public_id));

    // delete the files from the database
    await db.delete(M_File).where(inArray(M_File.id, ids));

    logger.info(data, "Files deleted");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Successfully deleted files" : "Error on files delete" };
  } catch (error) {
    logger.error(error, "Error deleting files");
    return { success: 0, message: "Error! " + error };
  }
};

export const handleMediaUpload = async (form: TypedFormData<MediaUpload>) => {
  const file = form.get("file") as FileWithPath | string;
  if (!file) return { fileId: null }; // no file uploaded

  const currentFileId = form.get("currentFile") as string;

  // string, means no new file uploaded
  if (isString(file)) {
    // null means user wants to delete / remove the thumbnail
    if (file === "null") {
      if (currentFileId) {
        const temp = getTypedFormData<DeleteParams>();
        temp.append("csrf_token", form.get("csrf_token")!);
        temp.append("id", currentFileId);
        deleteFile(temp);
      }
      return { fileId: null };
    }

    // no new file uploaded, return the current file id
    return { fileId: currentFileId };
  }

  // If the input is not a string, upload the file
  const upload_res = await uploadFile_cloudinary(form, form.get("category") as FileCategoryType);
  if (!upload_res.success) return { fileId: null };

  // remove old file if not duplicate
  const temp = getTypedFormData<DeleteParams>();
  temp.append("csrf_token", form.get("csrf_token")!);
  temp.append("id", currentFileId);
  if (!upload_res.duplicate) deleteFile(temp);
  return { fileId: upload_res.id ?? null };
};
