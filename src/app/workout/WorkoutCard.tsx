import React, { use, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import ExerciseCard from "./ExerciseCard";
import { useWorkoutStore } from "./state";
import NewExerciseCard from "./NewExerciseCard";

const WorkoutCard = () => {
  const {
    addWorkoutTitle,
    workout,
    addWorkout,
    removeWorkout,
    showNewExercise,
    setShowNewExercise,
    exercises,
  } = useWorkoutStore((state) => state);
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    addWorkoutTitle(newTitle); // Update the workout title using the store function
  };

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>
          <Input
            placeholder="title"
            value={workout.title}
            onChange={handleTitleChange}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          variant={"secondary"}
          onClick={() => setShowNewExercise(true)}
          disabled={showNewExercise}
        >
          Add new exercise
        </Button>
        {showNewExercise && <NewExerciseCard />}
        {exercises.length > 0 &&
          exercises.map(({ id, title, exerciseSets }) => (
            <ExerciseCard
              key={id}
              id={id}
              title={title}
              exerciseSets={exerciseSets}
            />
          ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() => addWorkout(workout)}
          disabled={workout.title === ""}
        >
          {workout.id !== "" ? "Save" : "Add"}
        </Button>
        {workout.id !== "" && (
          <Button
            onClick={() => removeWorkout(workout)}
            variant={"destructive"}
          >
            Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
