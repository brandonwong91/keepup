import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const workoutRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.workout.findMany({
      where: {
        userId: ctx.userId,
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async (opts) => {
      console.log("server mutate", opts.input);
      const { input } = opts;
      const created = opts.ctx.prisma.workout.create({
        data: {
          title: input.title,
          userId: opts.ctx.userId,
        },
      });
      console.log("created", created);
      return created;
    }),
});
