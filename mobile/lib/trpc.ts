import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@sazio-oss/shared";

export const trpc = createTRPCReact<AppRouter>();
