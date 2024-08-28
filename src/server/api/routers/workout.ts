import { ObjectId } from "bson";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
const getCurrentTimestamp = () => new Date().toISOString();

export const workoutRouter = createTRPCRouter({
  getAllWorkouts: privateProcedure.query(({ ctx }) => {
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
  createWorkout: privateProcedure
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
  updateWorkout: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        exercises: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              exerciseSets: z
                .array(
                  z.object({
                    id: z.string(),
                    rep: z.string(),
                    weight: z.string(),
                  })
                )
                .optional(), // exerciseSets is optional
            })
          )
          .optional(), // exercises is optional
      })
    )
    .mutation(async ({ input, ctx: { userId, prisma } }) => {
      const { id, title, exercises } = input;

      // Helper function to map exercise sets
      const mapExerciseSets = (
        exerciseSets?: { id: string; rep: string; weight: string }[]
      ) => {
        return (exerciseSets || []).map(({ rep, weight }) => ({
          rep,
          weight,
          createdAt: getCurrentTimestamp(),
          userId,
        }));
      };

      // Helper function to map exercises for upsert
      const mapExercises = (
        exercises?: {
          id: string;
          title: string;
          exerciseSets?: { id: string; rep: string; weight: string }[];
        }[]
      ) => {
        return (exercises || []).map(({ id, title, exerciseSets }) => ({
          where: { id: id.length === 24 ? id : new ObjectId().toString() },
          create: {
            title,
            createdAt: getCurrentTimestamp(),
            userId,
            exerciseSets: {
              create: mapExerciseSets(exerciseSets),
            },
          },
          update: {
            title,
            exerciseSets: {
              create: mapExerciseSets(exerciseSets),
            },
          },
        }));
      };

      return prisma.workout.update({
        where: { id },
        data: {
          title,
          exercises: {
            upsert: mapExercises(exercises),
          },
          userId,
        },
      });
    }),
  deleteWorkout: privateProcedure
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
  getAllExercises: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        exerciseSets: true,
      },
    });
  }),
  updateExercise: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.exercise.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
        },
      });

      return { success: true };
    }),
  deleteExercise: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.exercise.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
