import React, { ChangeEvent, useState } from "react";
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
import {
  CheckIcon,
  CopyIcon,
  Cross1Icon,
  PlusCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Separator } from "~/components/ui/separator";

const ExerciseDetailCard = () => {
  const {
    exercise,
    refetchExercises,
    updateExercise,
    addExerciseSetsToExercises,
    setExerciseSetsToExercise,
    removeExerciseSetInExercise,
    duplicateExercisesSetInExercise,
  } = useWorkoutStore((state) => state);

  const [addingSet, setAddingSet] = useState(false);
  const [currentSet, setCurrentSet] = useState({
    rep: "",
    weight: "",
  });

  console.log("ex", exercise);

  const { title, exerciseSets, id } = exercise;
  const removeExerciseApi = api.workout.deleteExercise.useMutation({
    onSuccess: () => {
      console.log("Exercise removed successfully");
      if (refetchExercises) {
        refetchExercises();
      }
    },
    onError: (error) => {
      console.error("Failed to remove exercise", error);
    },
  });

  const updateExerciseApi = api.workout.updateExercise.useMutation({
    onSuccess: () => {
      console.log("Exercise updated successfully");
      if (refetchExercises) {
        refetchExercises();
      }
    },
    onError: (error) => {
      console.error("Failed to update exercise", error);
    },
  });

  const handleRemoveExercise = async (id: string) => {
    const variables = {
      id,
    };
    await removeExerciseApi.mutate(variables);
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
      const date = format(new Date(set.createdAt as Date).toString(), "MM-dd");
      if (!groupedSets[date]) {
        groupedSets[date] = [];
      }
      groupedSets[date]?.push(set);

      return groupedSets;
    }, {});
  }

  const addSetHandler = () => {
    if (currentSet.rep && currentSet.weight) {
      const newSet: ExerciseSet = {
        id: Date.now().toString(), // Use timestamp as UUID
        rep: currentSet.rep,
        weight: currentSet.weight,
        createdAt: new Date(),
      };
      console.log("newSet: ", newSet);
      addExerciseSetsToExercises(newSet, id);
      setCurrentSet({ rep: "", weight: "" }); // Clear input fields
    }
  };

  const removeSetHandler = (setId: string) => {
    removeExerciseSetInExercise(setId);
  };

  const copySetHandler = (setId: string) => {
    duplicateExercisesSetInExercise(setId);
  };

  const handleAddedInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputType: "rep" | "weight",
    setId: string
  ) => {
    setExerciseSetsToExercise(event.target.value.trim(), inputType, setId);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputType: "rep" | "weight"
  ) => {
    const { value } = event.target;
    setCurrentSet((prevSet) => ({
      ...prevSet,
      [inputType]: value,
    }));
  };

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
        <CardContent className="flex w-full flex-col gap-y-2 p-0">
          <div className="flex items-center gap-2">
            <Button
              size={"icon"}
              variant={"link"}
              className="h-4 w-4"
              onClick={() => setAddingSet(true)}
            >
              <PlusCircledIcon />
            </Button>
            <div className="static flex gap-3">
              <Button
                variant={"secondary"}
                size="sm"
                className="h-6 w-16"
                disabled
              >
                Rep
              </Button>
              <Button
                variant={"secondary"}
                size="sm"
                className="h-6 w-16"
                disabled
              >
                Weight
              </Button>
            </div>
          </div>
          {addingSet && (
            <div className="flex gap-2 text-xs">
              <Button
                variant={"link"}
                size={"icon"}
                className="text-red-500"
                onClick={() => setAddingSet(false)}
              >
                <Cross1Icon />
              </Button>
              <Input
                placeholder="rep"
                value={currentSet.rep}
                onChange={(e) => handleInputChange(e, "rep")}
              />
              <Input
                placeholder="kg"
                value={currentSet.weight}
                onChange={(e) => handleInputChange(e, "weight")}
              />
              <Button
                variant={"link"}
                size={"icon"}
                className="text-green-500"
                onClick={addSetHandler}
              >
                <CheckIcon />
              </Button>
            </div>
          )}
          <Separator />
          {Object.entries(groupedExerciseSets).map(([date, sets]) => (
            <div key={date} className="pb-1">
              <h4>{date}</h4>
              <ul className="flex flex-col gap-1">
                {sets.map(({ id, rep, weight }) => (
                  <div key={id} className="flex gap-2 text-xs">
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className="text-red-500"
                      onClick={() => removeSetHandler(id)}
                    >
                      <TrashIcon />
                    </Button>
                    <Input
                      value={rep}
                      onChange={(e) => handleAddedInputChange(e, "rep", id)}
                    />
                    <Input
                      value={weight}
                      onChange={(e) => handleAddedInputChange(e, "weight", id)}
                    />
                    <Button
                      variant={"link"}
                      size={"icon"}
                      onClick={() => copySetHandler(id)}
                    >
                      <CopyIcon />
                    </Button>
                  </div>
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
