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
          createdAt: "asc",
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
      const list = ctx.prisma.list.create({
        data: {
          userId: input.userId,
          name: input.name,
          status: input.status,
        },
      });
      return list;
    }),
});
