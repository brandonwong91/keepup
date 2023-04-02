import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";

export const listRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          userId: z.string(),
        })
        .nullish()
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.list.findMany({
        where: {
          userId: input?.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        status: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          userId: input.userId,
          name: input.name,
          status: input.status,
        },
      });
    }),
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
