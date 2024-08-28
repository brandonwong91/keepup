import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ExerciseSet, useWorkoutStore } from "./state";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";

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

  const groupedExerciseSets = groupByMMDD(exerciseSets);
  function groupByMMDD(sets: ExerciseSet[]) {
    return sets.reduce((groupedSets: Record<string, ExerciseSet[]>, set) => {
      const date = format(new Date(set.createdAt as Date), "MM-dd");
      if (!groupedSets[date]) {
        groupedSets[date] = [];
      }
      groupedSets[date].push(set);
      return groupedSets;
    }, {});
  }

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardContent className="w-full p-0">
          {Object.entries(groupedExerciseSets).map(([date, sets]) => (
            <div key={date}>
              <h4>{date}</h4>
              <ul>
                {sets.map(({ id, rep, weight }) => (
                  <li key={id}>{`Reps: ${rep}, Weight: ${weight}`}</li>
                ))}
              </ul>
            </div>
          ))}
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
