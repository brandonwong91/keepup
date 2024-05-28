import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import ExerciseCard, { ExerciseSet } from "./ExerciseCard";

interface Exercise {
  title: string;
  sets: ExerciseSet[];
}

const WorkoutCard = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>
          <Input placeholder="title" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant={"secondary"}>Add exercise</Button>

        {exercises.map(({ title, sets }) => {
          return <ExerciseCard />;
        })}
        <ExerciseCard />
      </CardContent>
      <CardFooter>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
