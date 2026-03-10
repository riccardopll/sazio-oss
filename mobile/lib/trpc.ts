import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@sazio-oss/shared";

export const {
  TRPCProvider: TRPCContextProvider,
  useTRPC,
  useTRPCClient,
} = createTRPCContext<AppRouter>();
