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
import { useWorkoutStore, Workout } from "./state";
import NewExerciseCard from "./NewExerciseCard";
import { api } from "~/utils/api";

const WorkoutCard = () => {
  const {
    addWorkoutTitle,
    workout,
    showNewExercise,
    setShowNewExercise,
    exercises,
    refetchWorkouts,
    clearWorkout,
  } = useWorkoutStore((state) => state);
  const removeWorkoutApi = api.workout.delete.useMutation({
    onSuccess: () => {
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      console.error("Failed to remove workout", error);
    },
  });
  const updateWorkoutApi = api.workout.update.useMutation({
    onSuccess: () => {
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      console.error("Failed to update workout", error);
    },
  });
  const addWorkoutApi = api.workout.create.useMutation({
    onSuccess: () => {
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      console.error("Failed to create workout", error);
    },
  });
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    addWorkoutTitle(newTitle); // Update the workout title using the store function
  };

  const handleRemoveWorkout = async (id: string) => {
    const variables = {
      id,
    };
    await removeWorkoutApi.mutate(variables);
    clearWorkout();
  };

  const handleSaveWorkout = async (workout: Workout) => {
    const { id, title } = workout;
    const variables = {
      id,
      title,
    };

    if (workout.id === "") {
      await addWorkoutApi.mutate(variables);
    } else {
      await updateWorkoutApi.mutate(variables);
    }
    clearWorkout();
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
        {workout.id !== "" && (
          <Button
            onClick={() => handleRemoveWorkout(workout.id)}
            variant={"destructive"}
          >
            Remove
          </Button>
        )}
        <Button
          onClick={() => handleSaveWorkout(workout)}
          disabled={workout.title === ""}
        >
          {workout.id !== "" ? "Save" : "Add"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCard;
