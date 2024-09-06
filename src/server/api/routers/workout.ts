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
            order: z.number().optional(), // order is optional
            exerciseSets: z.array(
              z.object({
                rep: z.string(),
                weight: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(
      async ({ input: { title, exercises }, ctx: { userId, prisma } }) => {
        const mapExercises = (exercises: { title: string; order?: number }[]) =>
          exercises.map(({ title, order }, index) => ({
            title,
            createdAt: getCurrentTimestamp(),
            order: order ?? index + 1, // Default order
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
              order: z.number().optional(), // order is optional
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
          order?: number;
          exerciseSets?: { id: string; rep: string; weight: string }[];
        }[]
      ) => {
        return (exercises || []).map(
          ({ id, title, exerciseSets, order }, index) => ({
            where: { id: id.length === 24 ? id : new ObjectId().toString() },
            create: {
              title,
              createdAt: getCurrentTimestamp(),
              userId,
              order: order ?? index + 1, // Incremental order
              exerciseSets: {
                create: mapExerciseSets(exerciseSets),
              },
            },
            update: {
              title,
              order: order ?? index + 1, // Incremental order
              exerciseSets: {
                create: mapExerciseSets(exerciseSets),
              },
            },
          })
        );
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
  createExercise: privateProcedure
    .input(
      z.object({
        title: z.string(),
        exerciseSets: z
          .array(
            z.object({
              rep: z.string(),
              weight: z.string(),
              createdAt: z.date().optional(), // Optional, you may not always provide createdAt
            })
          )
          .optional(), // Optional, you may not always provide exerciseSets
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, exerciseSets } = input;

      // Create the exercise
      const newExercise = await ctx.prisma.exercise.create({
        data: {
          title,
          createdAt: new Date().toISOString(), // Ensure createdAt is included
          userId: ctx.userId, // Ensure userId is included
          exerciseSets: exerciseSets
            ? {
                create: exerciseSets.map(({ rep, weight, createdAt }) => ({
                  rep,
                  weight,
                  createdAt: createdAt ? createdAt : new Date().toISOString(),
                  userId: ctx.userId,
                })),
              }
            : undefined, // Only include exerciseSets if provided
        },
      });

      return { success: true, exercise: newExercise };
    }),
  updateExercise: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        exerciseSets: z
          .array(
            z.object({
              id: z.string(),
              rep: z.string(),
              weight: z.string(),
              createdAt: z.date().optional(), // Optional, you may not always update createdAt
            })
          )
          .optional(), // Optional, you may not always update exerciseSets
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, title, exerciseSets } = input;

      // Fetch existing exercise sets from the database
      const existingExerciseSets = await ctx.prisma.exerciseSet.findMany({
        where: { exerciseId: id },
      });

      // Identify exercise sets to delete
      const setsToDelete = existingExerciseSets.filter(
        (existingSet) =>
          !exerciseSets?.some(
            (incomingSet) => incomingSet.id === existingSet.id
          )
      );

      // Map the incoming exerciseSets for upsert
      const mapExerciseSets = (
        sets: {
          id: string;
          rep: string;
          weight: string;
          createdAt?: Date;
        }[]
      ) => {
        return sets.map(({ id, rep, weight, createdAt }) => ({
          where: { id: id.length === 24 ? id : new ObjectId().toString() }, // Use empty string if id is not provided
          create: {
            rep,
            weight,
            createdAt: new Date().toISOString(),
            userId: ctx.userId,
          },
          update: {
            rep,
            weight,
            createdAt: createdAt ? createdAt : new Date().toISOString(),
            userId: ctx.userId,
          },
        }));
      };

      const allExerciseSets = exerciseSets
        ? [...existingExerciseSets, ...exerciseSets]
        : existingExerciseSets;

      let maxWeight = 0;
      let maxWeightDate = new Date().toISOString();

      if (allExerciseSets.length > 0) {
        const maxSet = allExerciseSets.reduce((maxSet, set) => {
          const weight = parseFloat(set.weight);
          if (maxSet) {
            return weight > parseFloat(maxSet.weight) ? set : maxSet;
          }
          return set;
        }, allExerciseSets[0]);

        if (maxSet) {
          maxWeight = parseFloat(maxSet.weight);
          maxWeightDate = maxSet.createdAt
            ? maxSet.createdAt.toISOString()
            : new Date().toISOString();
        }
      }

      // Update the exercise and handle exerciseSets
      await ctx.prisma.exercise.update({
        where: { id },
        data: {
          title,
          maxWeight,
          maxWeightDate,
          exerciseSets: exerciseSets
            ? {
                upsert: mapExerciseSets(exerciseSets),
                deleteMany: {
                  id: { in: setsToDelete.map((set) => set.id) }, // Delete sets that are not in the incoming array
                },
              }
            : undefined, // Only include exerciseSets if provided
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
  getWorkoutsByDate: privateProcedure
    .input(
      z.object({
        date: z.string().transform((str) => new Date(str)),
      })
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;

      // Start and end of the day for the target date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Query to find workouts based on the date range and userId
      const workouts = await ctx.prisma.workout.findMany({
        where: {
          userId: ctx.userId, // Ensure we're only fetching the current user's workouts
          exercises: {
            some: {
              exerciseSets: {
                some: {
                  createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              },
            },
          },
        },
        include: {
          exercises: {
            include: {
              exerciseSets: true,
            },
          },
        },
      });

      return workouts;
    }),
  getWorkoutsByMonth: privateProcedure
    .input(
      z.object({
        date: z.string().transform((str) => new Date(str)),
      })
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;

      // Start and end of the month for the target date
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Query to find workouts based on the month range and userId
      const workouts = await ctx.prisma.workout.findMany({
        where: {
          userId: ctx.userId, // Ensure we're only fetching the current user's workouts
          exercises: {
            some: {
              exerciseSets: {
                some: {
                  createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                  },
                },
              },
            },
          },
        },
        select: {
          exercises: {
            select: {
              exerciseSets: {
                select: {
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      // Extract unique workout dates
      const workoutDates = [
        ...new Set(
          workouts.flatMap((workout) =>
            workout.exercises.flatMap((exercise) =>
              exercise.exerciseSets.map((set) => set.createdAt.toDateString())
            )
          )
        ),
      ];

      return workoutDates;
    }),
});
