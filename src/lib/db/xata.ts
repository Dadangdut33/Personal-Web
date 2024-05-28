import { env } from "@/lib/env.mjs";
import { buildClient } from "@xata.io/client";
import type { BaseClientOptions, SchemaInference, XataRecord } from "@xata.io/client";

const tables = [
  {
    name: "file",
    columns: [
      { name: "file", type: "file", file: { defaultPublicAccess: true } },
      { name: "originalHash", type: "string", unique: true },
      { name: "category", type: "string" },
    ],
  },
  {
    name: "user",
    columns: [
      { name: "username", type: "string", unique: true },
      { name: "role", type: "string", notNull: true, defaultValue: "USER" },
      { name: "hashedPassword", type: "string" },
      { name: "twoFactorSecret", type: "string" },
    ],
  },
  {
    name: "user_profile",
    columns: [
      { name: "userId", type: "string", unique: true },
      { name: "avatarId", type: "string" },
      { name: "name", type: "string" },
      { name: "title", type: "string" },
      { name: "description", type: "text" },
    ],
  },
  {
    name: "user_two_factor_backup_codes",
    columns: [
      { name: "userId", type: "string", unique: true },
      { name: "codes", type: "string" },
    ],
  },
  {
    name: "shortlink",
    columns: [
      { name: "url", type: "text" },
      { name: "shorten", type: "text" },
    ],
  },
  {
    name: "project",
    columns: [
      { name: "title", type: "string" },
      { name: "description", type: "text" },
      { name: "categoryId", type: "string" },
      { name: "thumbnailId", type: "string" },
      { name: "tags", type: "json", notNull: true, defaultValue: "[]" },
      { name: "links", type: "json", notNull: true, defaultValue: "[]" },
      { name: "position", type: "int", notNull: true, defaultValue: "0" },
      {
        name: "visibility",
        type: "string",
        notNull: true,
        defaultValue: "DRAFT",
      },
    ],
  },
  {
    name: "category",
    columns: [
      { name: "name", type: "string" },
      { name: "description", type: "text" },
      { name: "type", type: "string" },
    ],
  },
  {
    name: "session",
    columns: [
      { name: "userId", type: "string" },
      { name: "expiresAt", type: "datetime" },
    ],
  },
  {
    name: "session_temp",
    columns: [
      { name: "sessionId", type: "string" },
      { name: "expiresAt", type: "datetime" },
    ],
  },
  {
    name: "blog",
    columns: [
      { name: "title", type: "string" },
      { name: "description", type: "text" },
      { name: "content", type: "json" },
      { name: "categoryId", type: "string" },
      { name: "thumbnailId", type: "string" },
      { name: "authorId", type: "string" },
      { name: "lastEditorId", type: "string" },
      { name: "pinned", type: "bool", notNull: true, defaultValue: "false" },
      { name: "tags", type: "json", notNull: true, defaultValue: "[]" },
      {
        name: "visibility",
        type: "string",
        notNull: true,
        defaultValue: "DRAFT",
      },
    ],
  },
  {
    name: "blog_revision",
    columns: [
      { name: "title", type: "string" },
      { name: "description", type: "text" },
      { name: "content", type: "json" },
      { name: "categoryId", type: "string" },
      { name: "thumbnailId", type: "string" },
      { name: "authorId", type: "string" },
      { name: "lastEditorId", type: "string" },
      { name: "pinned", type: "bool", notNull: true, defaultValue: "false" },
      { name: "blogId", type: "string" },
      { name: "tags", type: "json", notNull: true, defaultValue: "[]" },
      {
        name: "visibility",
        type: "string",
        notNull: true,
        defaultValue: "DRAFT",
      },
      { name: "revision", type: "int" },
    ],
  },
  {
    name: "blog_like",
    columns: [
      { name: "blogId", type: "string", unique: true },
      { name: "likes", type: "int", notNull: true, defaultValue: "0" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type File = InferredTypes["file"];
export type FileRecord = File & XataRecord;

export type User = InferredTypes["user"];
export type UserRecord = User & XataRecord;

export type UserProfile = InferredTypes["user_profile"];
export type UserProfileRecord = UserProfile & XataRecord;

export type UserTwoFactorBackupCodes = InferredTypes["user_two_factor_backup_codes"];
export type UserTwoFactorBackupCodesRecord = UserTwoFactorBackupCodes & XataRecord;

export type Shortlink = InferredTypes["shortlink"];
export type ShortlinkRecord = Shortlink & XataRecord;

export type Project = InferredTypes["project"];
export type ProjectRecord = Project & XataRecord;

export type Category = InferredTypes["category"];
export type CategoryRecord = Category & XataRecord;

export type Session = InferredTypes["session"];
export type SessionRecord = Session & XataRecord;

export type SessionTemp = InferredTypes["session_temp"];
export type SessionTempRecord = SessionTemp & XataRecord;

export type Blog = InferredTypes["blog"];
export type BlogRecord = Blog & XataRecord;

export type BlogRevision = InferredTypes["blog_revision"];
export type BlogRevisionRecord = BlogRevision & XataRecord;

export type BlogLike = InferredTypes["blog_like"];
export type BlogLikeRecord = BlogLike & XataRecord;

export type DatabaseSchema = {
  file: FileRecord;
  user: UserRecord;
  user_profile: UserProfileRecord;
  user_two_factor_backup_codes: UserTwoFactorBackupCodesRecord;
  shortlink: ShortlinkRecord;
  project: ProjectRecord;
  category: CategoryRecord;
  session: SessionRecord;
  session_temp: SessionTempRecord;
  blog: BlogRecord;
  blog_revision: BlogRevisionRecord;
  blog_like: BlogLikeRecord;
};

const DatabaseClient = buildClient();

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient({
    databaseURL: env.DATABASE_URL,
    apiKey: env.XATA_API_KEY,
    branch: env.XATA_BRANCH,
  });

  return instance;
};
