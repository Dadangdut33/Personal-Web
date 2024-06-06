import { ERR_AUTH_EXPIRED } from "@/lib/constants";
import { db } from "@/lib/db";
import { M_Category, M_File, M_Project } from "@/lib/db/schema";
import { ProjectComplete } from "@/lib/db/types";
import { CreateProject, CreateProjectZod, insertProjectSchema } from "@/lib/db/zod/project";
import { logger } from "@/lib/logger";
import { isAdmin } from "@/lib/lucia/utils";
import { ApiReturn, DeleteParams, MediaUpload, TypedFormData } from "@/lib/types";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cache } from "react";

import { handleMediaUpload } from "./file/cloudinary";

const project = getTableColumns(M_Project);
const category = getTableColumns(M_Category);
const thumbnail = getTableColumns(M_File);

export const getProjectById = cache(async (_csrf: string, id: string): Promise<ApiReturn<ProjectComplete>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const [data] = await db
      .select({ ...project, category, thumbnail })
      .from(M_Project)
      .where(eq(M_Project.id, id))
      .leftJoin(M_Category, eq(M_Category.id, M_Project.categoryId))
      .leftJoin(M_File, eq(M_File.id, M_Project.thumbnailId));

    if (!data) return { success: 0, message: "Project not found" };

    return { success: 1, data, message: "Successfully fetched project" };
  } catch (error) {
    logger.error(error, "Error fetching project");
    return { success: 0, message: `An error occured while fetching project ${error}` };
  }
});

export const getAllProjects = cache(async (): Promise<ApiReturn<ProjectComplete[]>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const projects = await db
      .select({ ...project, category, thumbnail })
      .from(M_Project)
      .leftJoin(M_Category, eq(M_Category.id, M_Project.categoryId))
      .leftJoin(M_File, eq(M_File.id, M_Project.thumbnailId));
    return { success: 1, data: projects, message: "Successfully fetched projects" };
  } catch (error) {
    logger.error(error, "Error fetching projects");
    return { success: 0, message: `An error occured while fetching projects ${error}` };
  }
});

export const addProject = async (form: TypedFormData<CreateProject & MediaUpload>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const { fileId } = await handleMediaUpload(form as unknown as TypedFormData<MediaUpload>);
    const parsed = insertProjectSchema.parse({
      title: form.get("title")!,
      description: form.get("description")!,
      categoryId: form.get("categoryId")!,
      thumbnailId: fileId,
      tags: JSON.parse(form.get("tags")!),
      links: JSON.parse(form.get("links")!),
      position: parseInt(form.get("position")!),
      visibility: form.get("visibility")!,
    } satisfies CreateProjectZod);
    const [data] = await db.insert(M_Project).values(parsed).returning();

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    logger.info(data, "Created project");
    return { success: 1, message: "Successfully created project" };
  } catch (error) {
    logger.error(error, "Error creating project");
    return { success: 0, message: `An error occured while creating project ${error}` };
  }
};

export const updateProject = async (form: TypedFormData<CreateProject>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const { fileId } = await handleMediaUpload(form as unknown as TypedFormData<MediaUpload>);
    const parsed = insertProjectSchema.parse({
      id: form.get("id")!,
      title: form.get("title")!,
      description: form.get("description")!,
      categoryId: form.get("categoryId")!,
      thumbnailId: fileId,
      tags: JSON.parse(form.get("tags")!),
      links: JSON.parse(form.get("links")!),
      position: parseInt(form.get("position")!),
      visibility: form.get("visibility")!,
    } satisfies CreateProjectZod);
    const [data] = await db.update(M_Project).set(parsed).where(eq(M_Project.id, parsed.id!)).returning();

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    logger.info(data, "Updated project");
    return { success: 1, message: "Successfully updated project" };
  } catch (error) {
    logger.error(error, "Error updating project");
    return { success: 0, message: `An error occured while updating project ${error}` };
  }
};

export const deleteProject = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get("id")!;
    const [data] = await db.delete(M_Project).where(eq(M_Project.id, id)).returning();

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    logger.info(data, "Deleted project");
    return { success: 1, message: "Successfully deleted project" };
  } catch (error) {
    logger.error(error, "Error deleting project");
    return { success: 0, message: `An error occured while deleting project ${error}` };
  }
};

export const batchDeleteProject = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const ids = JSON.parse(form.get("id")!) as string[];
    const data = await db.delete(M_Project).where(inArray(M_Project.id, ids)).returning();

    revalidatePath("/dashboard/projects");
    revalidatePath("/projects");
    logger.info(data, "Deleted projects");
    return { success: 1, message: "Successfully deleted projects" };
  } catch (error) {
    logger.error(error, "Error deleting projects");
    return { success: 0, message: `An error occured while deleting projects ${error}` };
  }
};
