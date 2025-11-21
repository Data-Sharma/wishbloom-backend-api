import {CorsOptions} from "cors";
import {config} from "./env.config";

const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://wishbloom.com",
  "https://www.wishbloom.com",
];

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};
