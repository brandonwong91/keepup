import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useWorkoutStore } from "./state";

const ExerciseDetailCard = () => {
  const { exercise } = useWorkoutStore((state) => state);
  const { title, exerciseSets } = exercise;
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardContent>
          {exerciseSets.map(({ id, rep, weight }) => {
            return <div key={id}>{`Reps: ${rep}, Weight: ${weight}`}</div>;
          })}
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default ExerciseDetailCard;
