import { router } from "./_trpc";
import { itemRouter } from "./api/routers/item";
import { listRouter } from "./api/routers/list";
import { workoutRouter } from "./api/routers/workout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  lists: listRouter,
  items: itemRouter,
  workout: workoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
