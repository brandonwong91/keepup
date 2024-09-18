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
        date: z.string().optional(),
        exercises: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              order: z.number().optional(), // order is optional
              exerciseSets: z
                .array(
                  z.object({
                    id: z.string().optional(), // ExerciseSet ID (optional, new sets won't have this)
                    rep: z.string(),
                    weight: z.string(),
                  })
                )
                .optional(), // ExerciseSets are optional
            })
          )
          .optional(), // Exercises are optional
      })
    )
    .mutation(async ({ input, ctx: { prisma, userId } }) => {
      const { id, title, date, exercises } = input;

      const workoutUpdateData = { title, updatedAt: new Date() };

      // If no exercises or date is provided, just update the workout title.
      if (!exercises || exercises.length === 0 || !date) {
        return prisma.workout.update({
          where: { id },
          data: workoutUpdateData,
        });
      }

      // Parse the input date to get the start and end of the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Handle exerciseSets for each exercise based on the date
      for (const exercise of exercises) {
        const { id: exerciseId, exerciseSets } = exercise;

        // 1. Find existing exercise sets for this exercise on the given date
        const existingSets = await prisma.exerciseSet.findMany({
          where: {
            exerciseId,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        });

        const existingIds = new Set(existingSets.map((set) => set.id));
        const inputIds = new Set(
          (exerciseSets || []).map((set) => set.id).filter(Boolean) as string[]
        );

        // Check if all sets should be deleted (i.e., input exerciseSets is undefined or empty)
        if (!exerciseSets || exerciseSets.length === 0) {
          await prisma.exerciseSet.deleteMany({
            where: {
              exerciseId,
              createdAt: { gte: startOfDay, lte: endOfDay },
            },
          });
          continue; // Skip further processing for this exercise since all sets are removed
        }

        // 2. Update or create sets from the input
        for (const { id: setId, rep, weight } of exerciseSets) {
          if (setId && existingIds.has(setId)) {
            // Update existing set
            await prisma.exerciseSet.update({
              where: { id: setId },
              data: { rep, weight, updatedAt: new Date() },
            });
          } else {
            // Create new set
            await prisma.exerciseSet.create({
              data: {
                rep,
                weight,
                createdAt: new Date(),
                exerciseId,
                userId,
              },
            });
          }
        }

        // 3. Delete any sets that are in the database but not in the input
        const setsToDelete = [...existingIds].filter((id) => !inputIds.has(id));
        if (setsToDelete.length > 0) {
          await prisma.exerciseSet.deleteMany({
            where: { id: { in: setsToDelete } },
          });
        }
      }

      // 4. Finally, update the workout title
      return prisma.workout.update({
        where: { id },
        data: workoutUpdateData,
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
        date: z.string().transform((str) => new Date(str)), // Input as string, transformed to date
      })
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;

      // Convert the input date string to local time
      const localDate = new Date(date);

      // Get start and end of the day in local time
      const startOfDayLocal = new Date(localDate);
      startOfDayLocal.setHours(0, 0, 0, 0); // Start of the local day

      const endOfDayLocal = new Date(localDate);
      endOfDayLocal.setHours(23, 59, 59, 999); // End of the local day

      // Convert local time to UTC for comparison with the database
      const startOfDayUTC = new Date(startOfDayLocal.toISOString());
      const endOfDayUTC = new Date(endOfDayLocal.toISOString());

      // Query to find workouts based on the date range and userId
      const workouts = await ctx.prisma.workout.findMany({
        where: {
          userId: ctx.userId, // Ensure we're only fetching the current user's workouts
          exercises: {
            some: {
              exerciseSets: {
                some: {
                  createdAt: {
                    gte: startOfDayUTC,
                    lte: endOfDayUTC,
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

      // Filter exerciseSets to only include those created on the specified date
      const filteredWorkouts = workouts.map((workout) => ({
        ...workout,
        exercises: workout.exercises.map((exercise) => ({
          ...exercise,
          exerciseSets: exercise.exerciseSets.filter(
            (set) =>
              new Date(set.createdAt) >= startOfDayUTC &&
              new Date(set.createdAt) <= endOfDayUTC
          ),
        })),
      }));

      return filteredWorkouts;
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
  getAllStats: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.stat.findMany({
      where: {
        userId: ctx.userId,
      },
      include: {
        statSets: true,
      },
    });
  }),
  createStat: privateProcedure
    .input(
      z.object({
        title: z.string(),
        unit: z.string().optional(),
        statSets: z
          .array(
            z.object({
              createdAt: z.date(),
              value: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, unit, statSets } = input;

      // Create the stat
      const newStat = await ctx.prisma.stat.create({
        data: {
          title,
          unit,
          createdAt: new Date().toISOString(), // Ensure createdAt is included
          userId: ctx.userId, // Ensure userId is included
          statSets: statSets
            ? {
                create: statSets.map(({ createdAt, value }) => ({
                  value,
                  createdAt,
                  userId: ctx.userId,
                })),
              }
            : undefined, // Only include statSets if provided
        },
      });

      return { success: true, stat: newStat };
    }),
  updateStat: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        unit: z.string().optional(),
        statSets: z
          .array(
            z.object({
              id: z.string(),
              createdAt: z.date(),
              value: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, title, unit, statSets } = input;

      // Fetch existing stat sets from the database
      const existingStatSets = await ctx.prisma.statSet.findMany({
        where: { statSetId: id },
      });

      // Identify stat sets to delete
      const setsToDelete = existingStatSets.filter(
        (existingSet) =>
          !statSets?.some((incomingSet) => incomingSet.id === existingSet.id)
      );

      // Map the incoming statSets for upsert
      const mapStatSets = (
        sets: {
          id: string;
          createdAt?: Date;
          value: string;
        }[]
      ) => {
        return sets.map(({ id, createdAt, value }) => ({
          where: { id: id.length === 24 ? id : new ObjectId().toString() }, // Use empty string if id is not provided
          create: {
            value,
            createdAt: createdAt!,
            userId: ctx.userId,
          },
          update: {
            value,
            createdAt,
            userId: ctx.userId,
          },
        }));
      };

      // Update the stat and handle statSets
      await ctx.prisma.stat.update({
        where: { id },
        data: {
          title,
          unit,
          statSets: statSets
            ? {
                upsert: mapStatSets(statSets),
                deleteMany: {
                  id: { in: setsToDelete.map((set) => set.id) }, // Delete sets that are not in the incoming array
                },
              }
            : undefined, // Only include statSets if provided
        },
      });

      return { success: true };
    }),
  deleteStat: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.statSet.deleteMany({
        where: {
          statSetId: input.id,
        },
      });

      await ctx.prisma.stat.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
