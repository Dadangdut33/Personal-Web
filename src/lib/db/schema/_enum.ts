import { pgEnum } from "drizzle-orm/pg-core";

export const CategoryOption = ["blog", "portofolio"] as const;
export type CategoryType = (typeof CategoryOption)[number];
export const categoryTypeEnum = pgEnum("type", CategoryOption);

export const VisibilityOption = ["draft", "private", "published"] as const;
export type VisibilityType = (typeof VisibilityOption)[number];
export const visibilityEnum = pgEnum("visibility", VisibilityOption);

export const FileCategoryOption = ["project_thumbnail", "blog_thumbnail", "blog_content", "uncategorized"] as const;
export type FileCategoryType = (typeof FileCategoryOption)[number];
export const fileCategoryEnum = pgEnum("file_category", FileCategoryOption);

export const RoleOption = ["user", "admin", "super_admin"] as const;
export type RoleType = (typeof RoleOption)[number];
export const roleEnum = pgEnum("role", RoleOption);
