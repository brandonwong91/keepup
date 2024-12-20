import { createTRPCRouter } from "~/server/api/trpc";
import { listRouter } from "./routers/list";
import { itemRouter } from "./routers/item";
import { workoutRouter } from "./routers/workout";
import { recurringRouter } from "./routers/recurring";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  lists: listRouter,
  items: itemRouter,
  workout: workoutRouter,
  recurring: recurringRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
