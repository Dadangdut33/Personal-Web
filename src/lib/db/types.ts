import {
  M_Blog,
  M_BlogRevision,
  M_Category,
  M_File,
  M_Like,
  M_Profile,
  M_Project,
  M_Shortlink,
  M_User,
} from "@/lib/db/schema";
import { ProjectLinkIcon } from "@/lib/db/schema/project";
import { Modify } from "@/lib/types";

// ----- Category -----
export type QCategory = typeof M_Category.$inferSelect;

// ----- Blog -----
export type QBlog = typeof M_Blog.$inferSelect;
export type QBlogRevision = typeof M_BlogRevision.$inferSelect;
export type QLike = typeof M_Like.$inferSelect;
export interface BlogComplete extends QBlog {
  thumbnail: QFile | null;
  category: QCategory | null;
  likes: QLike[] | null;
  author: QProfile | null;
  lastEditor: QProfile | null;
}
export interface BlogWithRevision extends QBlog {
  revision: QBlogRevision[] | null;
}

// ----- File -----
export type QFile = typeof M_File.$inferSelect;

// ----- Projects -----
export type QProject = Modify<typeof M_Project.$inferSelect, { links: ProjectLinkIcon[] }>;
export interface ProjectComplete extends QProject {
  thumbnail: string | null;
  category: string | null;
}

// ----- Shortlink -----
export type QShortlink = typeof M_Shortlink.$inferSelect;

// ----- User -----
export type QUser = typeof M_User.$inferSelect;
export type QProfile = typeof M_Profile.$inferSelect;
export interface ProfileComplete extends QProfile {
  avatar: QFile | null;
}

export interface UserComplete extends Omit<QUser, "hashedPassword"> {
  profile: QProfile | null;
  avatar: QFile | null;
}
