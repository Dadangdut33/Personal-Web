/**
 * Environment
 */
export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * Links
 */
export const ___issue___ = "https://github.com/Dadangdut33/Personal-Web/issues";
export const analyticsLink = "https://eu.umami.is/share/SLXdXO38GBsN0RAy/dadangdut33.vercel.app";

/**
 * Sever
 */
export const ___server___ = ___prod___ ? "https://dadangdut33.vercel.app" : "http://localhost:3000";
export const api_v1 = ___server___ + "/api/v1";

/**
 * Collection name
 */
export const colUser = "users";
export const colProject = "projects";
export const colShortLink = "shortlinks";
export const colBlog = "blogs";
export const colBlogRevision = "blog_revisions";
export const colNote = "notes";
