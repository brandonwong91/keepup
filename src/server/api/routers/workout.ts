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
      const { input } = opts;
      return opts.ctx.prisma.workout.create({
        data: {
          title: input.title,
          userId: opts.ctx.userId,
        },
      });
    }),
});
