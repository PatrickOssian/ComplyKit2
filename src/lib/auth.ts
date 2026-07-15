import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/client";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
