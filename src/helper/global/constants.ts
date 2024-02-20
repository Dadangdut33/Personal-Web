/**
 * Prod or dev mode
 */ export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * server
 */
// https://api.dadangdut33.codes
export const domain = ".codes";
export const analyticsPublicId = "lWYjsDUg";
export const trackingId = "de9022cd-16b7-4cb7-917c-956d5ae0dc6e";
export const SERVER = ___prod___ ? `https://witty-fox-train.cyclic.app` : "http://localhost:42069";
export const SERVER_V1 = SERVER + "/v1";
export const SERVER_LOCAL = ___prod___ ? `https://dadangdut33${domain}/api` : "http://localhost:3000/api";
export const SERVER_LOCAL_V1 = SERVER_LOCAL + "/v1";
