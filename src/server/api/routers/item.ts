import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.delete({
        where: {
          id: input.id,
        },
      });
    }),
  deleteFromListId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.deleteMany({
        where: {
          listId: input.id,
        },
      });
    }),
});
