"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import WorkoutCard from "./WorkoutCard";
import { useWorkoutStore } from "./state";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ExerciseDetailCard from "./ExerciseDetailCard";
import { PlusIcon } from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import StatsCard from "./StatsCard";
import WorkoutTab from "./WorkoutTab";
import ExerciseTab from "./ExerciseTab";
import StatTab from "./StatTab";

const Workout = () => {
  const previousDateRef = useRef<Date | undefined>(undefined);
  const {
    workouts,
    setWorkout,
    setWorkouts,
    clearWorkout,
    workoutDates,
    setWorkoutDates,
    selectedDate,
    setSelectedDate,

    exercises,
    setExercises,
    setExercise,
    clearExercise,

    setRefetchWorkouts,
    setRefetchExercises,
    setRefetchStats,

    showTab,
    setShowTab,

    stats,
    setStat,
    setStats,
    clearStat,
  } = useWorkoutStore((state) => state);

  const queryWorkouts = api.workout.getAllWorkouts.useQuery();
  const queryExercises = api.workout.getAllExercises.useQuery();
  const queryStats = api.workout.getAllStats.useQuery();
  const queryWorkoutsByDate = api.workout.getWorkoutsByDate.useQuery({
    date: selectedDate.toString(),
  });
  const queryWorkoutsByMonth = api.workout.getWorkoutsByMonth.useQuery({
    date: selectedDate.toString(),
  });
  useEffect(() => {
    if (queryWorkouts.data && queryWorkouts.isFetched) {
      const transformedData = queryWorkouts.data.map(
        ({ id, title, userId, exercises }) => {
          return {
            id,
            title,
            userId,
            exercises: exercises.map(({ id, title, order }, index) => {
              return {
                id,
                title,
                order: order ?? index + 1,
                exerciseSets: [],
              };
            }),
          };
        }
      );
      setRefetchWorkouts(queryWorkouts.refetch);
      const mergedWorkouts = [...transformedData.reverse()];

      setTimeout(() => {
        setWorkouts(mergedWorkouts);
      }, 300);
    }
  }, [queryWorkouts.data]);

  useEffect(() => {
    if (
      queryExercises.data &&
      queryExercises.isFetched &&
      showTab === "exercises"
    ) {
      setExercises(
        queryExercises.data.map((e) => ({
          ...e,
          order: e.order ?? undefined,
          maxWeight: e.maxWeight ?? 0,
          maxWeightDate: e.maxWeightDate ?? undefined,
        }))
      );
      setRefetchExercises(queryExercises.refetch);
    }
  }, [queryExercises.data]);

  useEffect(() => {
    if (queryStats.data && queryStats.isFetched) {
      setStats(
        queryStats.data.map((s) => ({
          ...s,
          unit: s.unit ?? undefined,
        }))
      );
      setRefetchStats(queryStats.refetch);
    }
  }, [queryStats.data]);
  useEffect(() => {
    if (!selectedDate) return;

    const currentDate = new Date(selectedDate);
    const previousDate = previousDateRef.current;

    // Check if it's the first load or the month has changed
    if (
      !previousDate ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    ) {
      queryWorkoutsByMonth.refetch().then((result) => {
        if (result.data) {
          setWorkoutDates(result.data);
        }
      });
      previousDateRef.current = currentDate; // Update the previous date
    }
  }, [selectedDate, queryWorkoutsByMonth]);

  const handleShowWorkoutCard = () => {
    clearWorkout();
  };
  const handleShowExerciseCard = () => {
    clearExercise();
  };

  const handleSetWorkoutByDate = async () => {
    if (queryWorkoutsByDate.data) {
      setWorkout(queryWorkoutsByDate.data[0] as unknown as any);
    }
  };

  const handleCalendarDayOnClick = (date: Date) => {
    setSelectedDate(date.toString());
    setShowTab("workouts");
    if (!queryWorkoutsByDate.data) {
      clearWorkout();
    }
  };

  return (
    <div className="grid gap-4 pt-4">
      <div className="flex flex-col items-center justify-center pt-4 md:flex-row">
        <Calendar
          selected={new Date(selectedDate) ?? Date.now()}
          onDayClick={handleCalendarDayOnClick}
          className="flex rounded-md"
          highlightedDates={workoutDates?.map((w) => new Date(w))}
        />
        <Card className="h-full w-64">
          <CardHeader>
            <CardTitle>
              {format(new Date(selectedDate ?? Date.now()), "cccc, P")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-1">
            {queryWorkoutsByDate.isFetching ? (
              <Skeleton className="h-[16px] w-full rounded-full" />
            ) : queryWorkoutsByDate.data &&
              queryWorkoutsByDate.data.length > 0 ? (
              queryWorkoutsByDate.data.map((workout) => (
                <Badge key={workout.id} onClick={handleSetWorkoutByDate}>
                  {workout.title}
                </Badge>
              ))
            ) : (
              <p>Nothing here yet...</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 self-center md:flex-row md:items-start">
        <div className="flex gap-4">
          <Tabs defaultValue={showTab}>
            <TabsList className="mb-1">
              <TabsTrigger
                value="workouts"
                onClick={() => {
                  setShowTab("workouts");
                  queryWorkouts.refetch();
                }}
              >
                Workouts
              </TabsTrigger>
              <TabsTrigger
                value="exercises"
                onClick={() => {
                  setShowTab("exercises");
                  queryExercises.refetch();
                }}
              >
                Exercises
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                onClick={() => {
                  setShowTab("stats");
                }}
              >
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workouts">
              <WorkoutTab
                isLoading={queryWorkouts.isLoading || queryWorkouts.isFetching}
              />
            </TabsContent>

            <TabsContent value="exercises">
              <ExerciseTab
                isLoading={
                  queryExercises.isLoading || queryExercises.isFetching
                }
              />
            </TabsContent>

            <TabsContent value="stats">
              <StatTab
                isLoading={queryStats.isLoading || queryStats.isFetching}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="pt-0 md:pt-12">
          {showTab === "workouts" && <WorkoutCard />}
          {showTab === "exercises" && <ExerciseDetailCard />}
          {showTab === "stats" && <StatsCard />}
        </div>
      </div>
    </div>
  );
};

export default Workout;
