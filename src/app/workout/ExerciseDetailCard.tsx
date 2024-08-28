import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useWorkoutStore } from "./state";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";

const ExerciseDetailCard = () => {
  const { exercise, refetchWorkouts } = useWorkoutStore((state) => state);
  const { title, exerciseSets, id } = exercise;
  const removeExercise = api.workout.deleteExercise.useMutation({
    onSuccess: () => {
      console.log("Workout removed successfully");
      refetchWorkouts;
    },
    onError: (error) => {
      console.error("Failed to remove workout", error);
    },
  });
  const handleRemoveExercise = async (id: string) => {
    const variables = {
      id,
    };
    await removeExercise.mutate(variables);
  };
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardContent className="w-full p-0">
          {exerciseSets.map(({ id, rep, weight }) => {
            return <div key={id}>{`Reps: ${rep}, Weight: ${weight}`}</div>;
          })}
        </CardContent>
        <CardFooter className="flex p-0">
          {id !== "" && (
            <Button
              onClick={() => handleRemoveExercise(id)}
              variant={"destructive"}
              size={"sm"}
            >
              Remove
            </Button>
          )}
        </CardFooter>
      </CardHeader>
    </Card>
  );
};

export default ExerciseDetailCard;
