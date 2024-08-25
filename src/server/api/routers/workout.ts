import { ObjectId } from "bson";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
const getCurrentTimestamp = () => new Date().toISOString();

export const workoutRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.workout.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        exercises: {
          include: {
            exerciseSets: true,
          },
        },
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        title: z.string(),
        exercises: z.array(
          z.object({
            title: z.string(),
          })
        ),
      })
    )
    .mutation(
      async ({ input: { title, exercises }, ctx: { userId, prisma } }) => {
        const mapExercises = (exercises: { title: string }[]) =>
          exercises.map(({ title }) => ({
            title,
            createdAt: getCurrentTimestamp(),
            userId,
          }));

        return prisma.workout.create({
          data: {
            title,
            userId,
            createdAt: getCurrentTimestamp(),
            exercises: {
              create: mapExercises(exercises),
            },
          },
        });
      }
    ),
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        exercises: z.array(
          z.object({
            id: z.string(), // Include id if you want to allow updates to existing exercises
            title: z.string(),
            exerciseSets: z
              .array(
                z.object({
                  id: z.string(), // Include id if you want to allow updates to existing exercise sets
                  rep: z.string(),
                  weight: z.string(),
                })
              )
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx: { userId, prisma } }) => {
      const { id, title, exercises } = input;
      const mapExercises = (
        exercises: {
          id: string;
          title: string;
          // exerciseSets: { id: string; rep: string; weight: string }[];
        }[]
      ) => {
        console.log("update", exercises);
        return exercises.map(({ id, title }) => ({
          where: { id: id.length === 24 ? id : new ObjectId().toString() },
          create: {
            title,
            createdAt: getCurrentTimestamp(),
            userId,
          },
          update: {
            title,
          },
        }));
      };
      return prisma.workout.update({
        where: {
          id,
        },
        data: {
          title,
          exercises: {
            upsert: mapExercises(exercises),
          },
          userId,
        },
      });
    }),
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Unlink exercises from the workout
      await ctx.prisma.exercise.updateMany({
        where: {
          workoutId: input.id,
        },
        data: {
          workoutId: null, // Unlink the exercises from the workout
        },
      });

      // Optionally, you can also delete the workout itself if you want:
      await ctx.prisma.workout.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
