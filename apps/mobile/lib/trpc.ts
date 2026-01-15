import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@sazio-oss/api";

export const trpc = createTRPCReact<AppRouter>();
