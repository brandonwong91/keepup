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

const Workout = () => {
  const previousDateRef = useRef<Date | undefined>(undefined);
  const {
    workouts,
    exercises,
    setWorkout,
    setWorkouts,
    setExercises,
    setRefetchWorkouts,
    setRefetchExercises,
    showTab,
    setShowTab,
    setExercise,
    clearWorkout,
    clearExercise,
    workoutDates,
    setWorkoutDates,
    selectedDate,
    setSelectedDate,
  } = useWorkoutStore((state) => state);

  const queryWorkouts = api.workout.getAllWorkouts.useQuery();
  const queryExercises = api.workout.getAllExercises.useQuery();
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
            </TabsList>

            <TabsContent value="workouts">
              <Card>
                <ScrollArea className="h-72 w-60 p-4">
                  <CardHeader className="mb-4 flex flex-row place-items-center justify-start p-0 align-middle">
                    <div className="mt-1 pr-2 text-sm font-medium leading-none">
                      Workouts
                    </div>
                    <Button
                      size="icon"
                      className="h-5 w-5 self-start"
                      onClick={handleShowWorkoutCard}
                    >
                      <PlusIcon />
                    </Button>
                  </CardHeader>
                  {(queryWorkouts.isLoading || queryWorkouts.isFetching) && (
                    <div className="flex flex-col gap-6">
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                      <Skeleton className="h-[16px] w-full rounded-full" />
                    </div>
                  )}
                  {workouts.length > 0 ? (
                    workouts.map(({ title, id, exercises }) => (
                      <div key={id}>
                        <div
                          className="cursor-pointer text-sm"
                          onClick={() =>
                            setWorkout({
                              id,
                              title,
                              exercises,
                            })
                          }
                        >
                          {title}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-secondary-foreground">
                      No workouts found...
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="exercises">
              <Card>
                <ScrollArea className="h-72 w-60">
                  <div className="p-4">
                    <CardHeader className="mb-4 flex flex-row place-items-center justify-start p-0 align-middle">
                      <div className="mt-1 pr-2 text-sm font-medium leading-none">
                        Exercises
                      </div>
                      <Button
                        size="icon"
                        className="h-5 w-5 self-start"
                        onClick={handleShowExerciseCard}
                      >
                        <PlusIcon />
                      </Button>
                    </CardHeader>
                    {(queryExercises.isLoading ||
                      queryExercises.isFetching) && (
                      <div className="flex flex-col gap-6">
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                        <Skeleton className="h-[16px] w-full rounded-full" />
                      </div>
                    )}
                    {exercises && exercises.length > 0 ? (
                      exercises
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map(({ title, id, exerciseSets, ...remaining }) => (
                          <div key={id}>
                            <div
                              className="cursor-pointer text-sm"
                              onClick={() =>
                                setExercise({
                                  id,
                                  exerciseSets,
                                  title,
                                  order: exerciseSets.length + 1,
                                  ...remaining,
                                })
                              }
                            >
                              {title}
                            </div>
                            <Separator className="my-2" />
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-secondary-foreground">
                        No exercises found...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="pt-0 md:pt-12">
          {showTab === "workouts" && <WorkoutCard />}
          {showTab === "exercises" && <ExerciseDetailCard />}
        </div>
      </div>
    </div>
  );
};

export default Workout;
