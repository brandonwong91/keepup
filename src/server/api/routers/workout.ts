import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

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
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      return opts.ctx.prisma.workout.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
        },
      });
    }),
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      return opts.ctx.prisma.workout.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
