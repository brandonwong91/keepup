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
import { Input } from "~/components/ui/input";

const ExerciseDetailCard = () => {
  const { exercise, refetchExercises, updateExercise } = useWorkoutStore(
    (state) => state
  );
  const { title, exerciseSets, id } = exercise;
  const removeExercise = api.workout.deleteExercise.useMutation({
    onSuccess: () => {
      console.log("Workout removed successfully");
      refetchExercises;
    },
    onError: (error) => {
      console.error("Failed to remove exercise", error);
    },
  });

  const updateExerciseApi = api.workout.updateExercise.useMutation({
    onSuccess: () => {
      console.log("Workout updated successfully");
      refetchExercises;
    },
    onError: (error) => {
      console.error("Failed to update exercise", error);
    },
  });

  const handleRemoveExercise = async (id: string) => {
    const variables = {
      id,
    };
    await removeExercise.mutate(variables);
  };

  const handleUpdateExercise = async () => {
    const variables = {
      id,
      title,
      exerciseSets,
    };
    await updateExerciseApi.mutate(variables);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    updateExercise({
      ...exercise,
      title: newTitle,
    }); // Update the workout title using the store function
  };

  const groupedExerciseSets = groupByMMDD(exerciseSets);
  function groupByMMDD(sets: ExerciseSet[]) {
    return sets.reduce((groupedSets: Record<string, ExerciseSet[]>, set) => {
      const date = format(new Date(set.createdAt as Date), "MM-dd");
      if (!groupedSets[date]) {
        groupedSets[date] = [];
      } else {
        groupedSets[date]?.push(set);
      }
      return groupedSets;
    }, {});
  }

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>
          <Input
            placeholder="title"
            value={title}
            onChange={handleTitleChange}
          />
        </CardTitle>
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
        <CardFooter className="flex justify-between p-0">
          {id !== "" && (
            <Button
              onClick={() => handleRemoveExercise(id)}
              variant={"destructive"}
              size={"sm"}
            >
              Remove
            </Button>
          )}
          <Button onClick={() => handleUpdateExercise()} size={"sm"}>
            {id !== "" ? "Save" : "Add"}
          </Button>
        </CardFooter>
      </CardHeader>
    </Card>
  );
};

export default ExerciseDetailCard;
