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

const Workout = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { workouts, setWorkout, setWorkouts, setRefetchWorkouts } =
    useWorkoutStore((state) => state);

  const query = api.workout.getAll.useQuery();

  useEffect(() => {
    if (query.data && query.isFetched) {
      console.log(query.data);
      const transformedData = query.data.map(
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
      setRefetchWorkouts(query.refetch);
      const mergedWorkouts = [...transformedData.reverse()];

      setTimeout(() => {
        setWorkouts(mergedWorkouts);
      }, 300);
    }
  }, [query.data]);

  const handleShowWorkoutCard = () => {};

  return (
    <div className="grid gap-4 pt-4">
      <div className="flex flex-col items-center justify-center pt-4 md:flex-row">
        <Calendar
          selected={date}
          onDayClick={setDate}
          className="-z-[10] flex rounded-md"
        />
        <Card className="h-full w-64">
          <CardHeader>
            <CardTitle>{date?.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nothing here yet...</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="flex flex-col gap-4 ">
          <Button className="w-full" onClick={handleShowWorkoutCard}>
            Add Workout
          </Button>
          <ScrollArea className="h-72 w-60 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Workouts
              </h4>
              {query.isLoading && (
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
            </div>
          </ScrollArea>
        </div>
        <WorkoutCard />
      </div>
    </div>
  );
};

export default Workout;
