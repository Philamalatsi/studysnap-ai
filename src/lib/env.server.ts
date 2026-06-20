import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

/** Server-only secrets — never import from Client Components. */
export function getServerEnv() {
  const values = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" && value.startsWith("NEXT_PUBLIC_")) {
      throw new Error(`${key} must not use NEXT_PUBLIC_ prefix.`);
    }
  }

  return serverSchema.parse(values);
}
