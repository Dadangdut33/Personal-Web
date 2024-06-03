import { M_Category } from "@/lib/db/schema";
import { Modify, csrf } from "@/lib/types";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { stringMeta } from "./utils";

export const insertCategorySchema = createInsertSchema(M_Category);
export type CreateCategoryZod = z.infer<typeof insertCategorySchema>;
export type CreateCategory = Modify<CreateCategoryZod, stringMeta> & csrf;
