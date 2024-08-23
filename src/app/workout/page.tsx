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

const Workout = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { workouts, setWorkout, setWorkouts, clearWorkout } = useWorkoutStore(
    (state) => ({
      workouts: state.workouts,
      setWorkout: state.setWorkout,
      setWorkouts: state.setWorkouts,
      clearWorkout: state.clearWorkout,
    })
  );

  const query = api.workout.getAll.useQuery(undefined, {});

  console.log(query.data);

  useEffect(() => {
    if (query.data && query.isFetched) {
      // Assuming query.data is an array of workouts

      const transformedData = query.data.map((item) => ({
        id: item.id,
        title: item.title,
        userId: item.userId,
        exercises: [], // Provide a default empty array if exercises are missing
      }));

      const mergedWorkouts = [...transformedData.reverse(), ...workouts];

      // To avoid duplicate entries, you can filter based on unique IDs (assuming each workout has a unique id)
      const uniqueWorkouts = Array.from(
        new Set(mergedWorkouts.map((w) => w.id))
      ).map((id) => mergedWorkouts.find((w) => w.id === id)!);

      setWorkouts(uniqueWorkouts);
    }
  }, [query.data]);

  const addWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      query.refetch();
    },
    onError: (error) => {
      console.error("Failed to create workout", error);
    },
  });
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
          <Button
            className="w-full"
            onClick={async () => {
              clearWorkout();
              const variables = {
                title: Date.now().toString(),
              };

              addWorkout.mutate(variables);
            }}
          >
            Add Workout
          </Button>
          <ScrollArea className="h-72 w-60 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Workouts
              </h4>
              {workouts.length > 0 &&
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
                ))}
              {workouts.length === 0 && (
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
