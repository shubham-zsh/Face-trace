export const PORT = 5555;
export const MONGODB_KEY = process.env.MONGODB_KEY || "mongodb://127.0.0.1:27017/facetrace";
export const HF_TOKEN = process.env.HF_TOKEN || "";
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
