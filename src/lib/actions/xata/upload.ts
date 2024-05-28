"use server";

import { ERR_AUTH_EXPIRED, FILE_SIZE_LIMIT } from "@/lib/constants";
import { db, xata } from "@/lib/db";
import { FileCategoryType, XataFileType } from "@/lib/db/schema/file";
import { stringSchema } from "@/lib/db/zod/utils";
import { logger } from "@/lib/logger";
import { getUserAuth, isAdmin } from "@/lib/lucia/utils";
import rateLimit from "@/lib/rateLimit";
import { ApiReturn } from "@/lib/types";
import { getExtension, getFileName, getTimeMs, readableFileSize } from "@/lib/utils";
import { FileWithPath } from "@mantine/dropzone";
import crypto from "crypto";
import { isString } from "lodash";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const limiter = rateLimit({
  uniqueTokenPerInterval: 200,
  interval: getTimeMs(10, "minute"),
});

export type returnStuff = {
  success: number;
  file: XataFileType | string;
  id?: string;
  duplicate?: boolean;
};

export async function uploadFile_xata(form: FormData, category: FileCategoryType): Promise<returnStuff> {
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

    // if size > file size limit
    if (file.size > FILE_SIZE_LIMIT)
      return {
        success: 0,
        file: `Error: File size limit exceeded (Max is ${readableFileSize(FILE_SIZE_LIMIT)}`,
      };

    // Check if file already exists
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const existingFile = await db.query.M_File.findFirst({
      where: (fields, { eq }) => eq(fields.originalHash, fileHash),
    });
    if (existingFile) return { success: 1, file: existingFile.file, id: existingFile.id, duplicate: true };

    // Save the file to the server
    // https://xata.io/docs/sdk/file-attachments#record-apis
    const xata_record = await xata.db.file.create({
      category,
      originalHash: fileHash,
      file: {
        base64Content: buffer.toString("base64"),
        enablePublicUrl: !privateUpload,
      },
    });

    return {
      success: 1,
      file: {
        id: xata_record.id,
        name: xata_record.file!.name ?? fileName,
        mediaType: xata_record.file!.mediaType ?? extension,
        enablePublicUrl: xata_record.file!.enablePublicUrl,
        size: xata_record.file!.size ?? file.size,
        version: xata_record.xata!.version,
        url: xata_record.file!.url,
        attributes: xata_record.file!.attributes ?? {},
      },
      id: xata_record.id,
    };
  } catch (error) {
    logger.error(error, "Error uploading file");
    return { success: 0, file: "Error uploading file" };
  }
}

export const addFile = async (form: FormData): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const category = stringSchema.parse(form.get("category")) as FileCategoryType;
    const upload = await uploadFile_xata(form, category);

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

export const editFile = async (form: FormData): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringSchema.parse(form.get("id")) as string;
    const name = stringSchema.parse(form.get("name")) as string;
    const category = stringSchema.parse(form.get("category")) as FileCategoryType;

    const data = await xata.db.file.update(id, {
      category,
      file: {
        name,
      },
    });

    logger.info(data, "File edited");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Success! Edit File" : "Error editing file" };
  } catch (error) {
    logger.error(error, "Error editing File");
    return { success: 0, message: "Error! " + error };
  }
};

export const deleteMedia = async (form: FormData): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringSchema.parse(form.get("id")) as string;
    const data = await xata.db.file.delete(id);

    logger.info(data, "Media deleted");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Success! Media deleted" : "Error deleting media" };
  } catch (error) {
    logger.error(error, "Error deleting media");
    return { success: 0, message: "Error! " + error };
  }
};

export const deleteMediaBulk = async (form: FormData): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const ids = JSON.parse(stringSchema.parse(form.get("id"))) as string[];
    const data = await xata.db.file.delete(ids);

    logger.info(data, "Media deleted");
    revalidatePath("/dashboard/media");
    return { success: !!data, message: data ? "Success! Media deleted" : "Error deleting media" };
  } catch (error) {
    logger.error(error, "Error deleting media");
    return { success: 0, message: "Error! " + error };
  }
};

export const handleMediaUpload = async (form: FormData) => {
  const file = form.get("file") as FileWithPath | string;
  if (!file) return { fileId: null }; // no file uploaded

  const currentFileId = form.get("currentFile") as string;

  // string, means no new file uploaded
  if (isString(file)) {
    // null means user wants to delete / remove the thumbnail
    if (file === "null") {
      if (currentFileId) {
        const temp = new FormData();
        temp.append("csrf_token", form.get("csrf_token") as string);
        temp.append("id", currentFileId);
        deleteMedia(temp);
      }
      return { fileId: null };
    }

    // no new file uploaded, return the current file id
    return { fileId: currentFileId };
  }

  // If the input is not a string, upload the file
  const upload_res = await uploadFile_xata(form, form.get("category") as FileCategoryType);
  if (!upload_res.success) return { fileId: null };

  // remove old file if not duplicate
  const temp = new FormData();
  temp.append("csrf_token", form.get("csrf_token") as string);
  temp.append("id", currentFileId);
  if (!upload_res.duplicate) deleteMedia(temp);
  return { fileId: upload_res.id ?? null };
};
