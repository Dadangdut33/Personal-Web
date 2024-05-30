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
} from "./schema";
import { XataMetaType } from "./utils";

// ----- Category -----
export type QCategory = typeof M_Category.$inferSelect & XataMetaType;

// ----- Blog -----
export type QBlog = typeof M_Blog.$inferSelect & XataMetaType;
export type QBlogRevision = typeof M_BlogRevision.$inferSelect & XataMetaType;
export type QLike = typeof M_Like.$inferSelect & XataMetaType;
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
export type QFile = typeof M_File.$inferSelect & XataMetaType;

// ----- Projects -----
export type QProject = typeof M_Project.$inferSelect & XataMetaType;
export interface ProjectComplete extends QProject {
  thumbnail: string | null;
  category: string | null;
}

// ----- Shortlink -----
export type QShortlink = typeof M_Shortlink.$inferSelect & XataMetaType;

// ----- User -----
export type QUser = typeof M_User.$inferSelect & XataMetaType;
export type QProfile = typeof M_Profile.$inferSelect & XataMetaType;
export interface ProfileComplete extends QProfile {
  avatar: QFile | null;
}

export interface UserComplete extends Omit<QUser, "hashedPassword"> {
  profile: QProfile | null;
  avatar: QFile | null;
}
