"use client";
import React, { useState } from "react";
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
import { useUser } from "@clerk/nextjs";
import { title } from "process";

const Workout = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { workouts, setWorkout, clearWorkout } = useWorkoutStore((state) => ({
    workouts: state.workouts,
    setWorkout: state.setWorkout,
    clearWorkout: state.clearWorkout,
  }));
  const user = useUser();
  // const { data } = api.lists.getAll.useQuery({
  //   userId: user.user?.id ?? "",
  // });
  const { data } = api.workout.getAll.useQuery();
  console.log(data);

  // console.log("data", data);

  const addWorkout = api.workout.create.useMutation({
    onSuccess: () => {
      console.log("Workout created successfully");
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
        <div className="fl ex flex-col gap-4 ">
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
                  <div key={title}>
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
