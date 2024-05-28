import { M_Blog, M_BlogRevision, M_Like, M_Project } from "./schema";
import { M_Category } from "./schema/category";
import { M_File } from "./schema/file";
import { M_Shortlink } from "./schema/shortlink";
import { M_Profile, M_User } from "./schema/user";

// Xata automatically adds metadata to each record.
// it also automatically adds id, so the UUID that we define in the schema is actually not inserted by drizzle-orm.
export type XataMetaType = {
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

// ----- Category -----
export type QCategory = typeof M_Category.$inferSelect & { xata: XataMetaType };

// ----- Blog -----
export type QBlog = typeof M_Blog.$inferSelect & { xata: XataMetaType };
export type QBlogRevision = typeof M_BlogRevision.$inferSelect & { xata: XataMetaType };
export type QLike = typeof M_Like.$inferSelect & { xata: XataMetaType };
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
export type QFile = typeof M_File.$inferSelect & { xata: XataMetaType };

// ----- Projects -----
export type QProject = typeof M_Project.$inferSelect & { xata: XataMetaType };
export interface ProjectComplete extends QProject {
  thumbnail: string | null;
  category: string | null;
}

// ----- Shortlink -----
export type QShortlink = typeof M_Shortlink.$inferSelect & { xata: XataMetaType };

// ----- User -----
export type QUser = typeof M_User.$inferSelect & { xata: XataMetaType };
export type QProfile = typeof M_Profile.$inferSelect & { xata: XataMetaType };
export interface ProfileComplete extends QProfile {
  avatar: QFile | null;
}
export interface UserComplete extends Omit<QUser, "hashedPassword"> {
  profile: QProfile | null;
  avatar: QFile | null;
}
