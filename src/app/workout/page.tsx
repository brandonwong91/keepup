"use client";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import WorkoutCard from "./WorkoutCard";
import { useWorkoutStore } from "./state";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ExerciseDetailCard from "./ExerciseDetailCard";
import { PlusIcon } from "@radix-ui/react-icons";

const Workout = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
  } = useWorkoutStore((state) => state);

  const queryWorkouts = api.workout.getAllWorkouts.useQuery();
  const queryExercises = api.workout.getAllExercises.useQuery();

  useEffect(() => {
    if (queryWorkouts.data && queryWorkouts.isFetched) {
      const transformedData = queryWorkouts.data.map(
        ({ id, title, userId, exercises }) => {
          return {
            id,
            title,
            userId,
            exercises: exercises.map(({ id, title }) => {
              return {
                id,
                title,
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
      setExercises(queryExercises.data);
      setRefetchExercises(queryExercises.refetch);
    }
  }, [queryExercises.data]);

  const handleShowWorkoutCard = () => {
    clearWorkout();
  };
  const handleShowExerciseCard = () => {
    clearExercise();
  };

  return (
    <div className="grid gap-4 pt-4">
      <div className="flex flex-col items-center justify-center pt-4 md:flex-row">
        <Calendar
          selected={date}
          onDayClick={setDate}
          className="flex rounded-md"
        />
        <Card className="h-full w-64">
          <CardHeader>
            <CardTitle>{date?.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nothing here yet...</p>
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
                        .map(({ title, id, exerciseSets }) => (
                          <div key={id}>
                            <div
                              className="cursor-pointer text-sm"
                              onClick={() =>
                                setExercise({
                                  id,
                                  exerciseSets,
                                  title,
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
