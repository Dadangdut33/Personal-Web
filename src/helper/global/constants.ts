/**
 * Prod or dev mode
 */ export const ___prod___ = process.env.NODE_ENV === "production";

/**
 * server
 */
export const domain = "dadangdut33.vercel.app";
export const analyticsPublicId = "lWYjsDUg";
export const trackingId = "ea4851ff-e1ec-48f7-be28-7e17c58aa147";
export const umami_public_link = "https://eu.umami.is/share/SLXdXO38GBsN0RAy/dadangdut33.vercel.app";
export const SERVER = ___prod___ ? `https://expensive-gaiters-eel.cyclic.app/` : "http://localhost:42069";
export const SERVER_V1 = SERVER + "/v1";
export const SERVER_LOCAL = ___prod___ ? `https://${domain}/api` : "http://localhost:3000/api";
export const SERVER_LOCAL_V1 = SERVER_LOCAL + "/v1";
