import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const recurringRouter = createTRPCRouter({
  getAllPayments: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.payment.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        transactions: true,
      },
    });
  }),
  createPayment: privateProcedure
    .input(
      z.object({
        title: z.string(),
        amount: z.string(),
        dueDate: z.date(),
        completedDate: z.date().optional(),
        tag: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.payment.create({
        data: {
          title: input.title,
          createdAt: input.dueDate,
          userId: ctx.userId,
          tag: input.tag,
          amount: input.amount,
          transactions: input.completedDate
            ? {
                create: {
                  amount: input.amount,
                  userId: ctx.userId,
                  createdAt: input.completedDate,
                },
              }
            : undefined,
        },
      });
    }),
  updatePayment: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        amount: z.string(),
        dueDate: z.date(),
        completedDate: z.date().optional(),
        transactionId: z.string().optional(),
        tag: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Update the payment
      const updatedPayment = await ctx.prisma.payment.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          createdAt: input.dueDate,
          tag: input.tag,
          userId: ctx.userId,
          amount: input.amount,
        },
      });

      // Handle transaction update or creation separately
      if (input.transactionId) {
        // Update the existing transaction
        await ctx.prisma.transaction.update({
          where: {
            id: input.transactionId,
          },
          data: {
            amount: input.amount,
            userId: ctx.userId,
            createdAt: input.completedDate,
          },
        });
      } else if (input.completedDate) {
        // Create a new transaction
        await ctx.prisma.transaction.create({
          data: {
            amount: input.amount,
            userId: ctx.userId,
            createdAt: input.completedDate,
            payment: {
              connect: {
                id: input.id, // Link to the payment by its ID
              },
            },
          },
        });
      }

      return updatedPayment;
    }),
  addTransactionToPayment: privateProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.string(),
        createdAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.payment.update({
        where: {
          id: input.id,
        },
        data: {
          transactions: {
            create: {
              amount: input.amount,
              userId: ctx.userId,
              createdAt: input.createdAt,
            },
          },
        },
      });
    }),
  deletePayment: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.transaction.deleteMany({
        where: {
          transactionId: input.id, // Remove all transactions related to this payment
        },
      });

      return ctx.prisma.payment.delete({
        where: {
          id: input.id,
        },
      });
    }),
  deleteTransaction: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transaction.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateTransaction: privateProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.string().optional(),
        createdAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transaction.update({
        where: {
          id: input.id,
        },
        data: {
          amount: input.amount,
          createdAt: input.createdAt,
        },
      });
    }),
});
