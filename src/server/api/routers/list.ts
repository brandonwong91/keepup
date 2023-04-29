import ObjectID from "bson-objectid";
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
        include: {
          items: true,
        },
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        title: z.string().nullish(),
        items: z
          .object({
            name: z.string(),
          })
          .array(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          title: input.title,
          items: {
            create: input.items.map((item) => ({
              name: item.name,
            })),
          },
          status: "none",
        },
      });
    }),
  update: privateProcedure
    .input(
      z.object({
        name: z.string(),
        id: z.string(),
        title: z.string().nullish(),
        items: z
          .object({
            id: z.string(),
            name: z.string(),
            checked: z.boolean(),
            fields: z
              .object({
                type: z.string().nullish(),
                value: z.string().nullish(),
                unit: z.string().nullish(),
              })
              .array()
              .nullish(),
          })
          .array(),
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
          title: input.title,
          status: "updated",
          items: {
            upsert: input.items.map((item) => {
              return {
                where: {
                  id: item.id.includes("-")
                    ? ObjectID().toHexString()
                    : item.id,
                },
                update: {
                  name: item.name,
                  checked: item.checked,
                  fields: {
                    set: item.fields,
                  },
                },
                create: {
                  name: item.name,
                  checked: item.checked,
                  fields: {
                    set: item.fields,
                  },
                },
              };
            }),
          },
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
