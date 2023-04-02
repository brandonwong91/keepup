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
        orderBy: [
          {
            updatedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          status: "none",
        },
      });
    }),
  update: privateProcedure
    .input(
      z.object({
        name: z.string(),
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: {
          id: input.id,
        },
        data: {
          userId: ctx.userId,
          name: input.name,
          status: "updated",
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
