import { createTRPCRouter } from "~/server/api/trpc";
import { listRouter } from "./routers/list";
import { itemRouter } from "./routers/item";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  lists: listRouter,
  items: itemRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
