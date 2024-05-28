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
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import WorkoutCard from "./WorkoutCard";

interface Workout {
  title: string;
}

const Workout = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);

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
          <Button className="w-full">Add Workout</Button>
          <ScrollArea className="h-72 w-60 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                Workouts
              </h4>
              {/* {tags.map((tag) => (
                <>
                  <div key={tag} className="text-sm">
                    {tag}
                  </div>
                  <Separator className="my-2" />
                </>
              ))} */}
              {workouts.length > 0 &&
                workouts.map(({ title }) => (
                  <>
                    <div key={title} className="text-sm">
                      {title}
                    </div>
                    <Separator className="my-2" />
                  </>
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
