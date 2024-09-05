import {
  CheckIcon,
  TrashIcon,
  Cross1Icon,
  CopyIcon,
  PlusCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import React, { ChangeEvent, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { ExerciseSet, useWorkoutStore } from "./state";
import { api } from "~/utils/api";
import { toast } from "sonner";

const ExerciseCard = ({
  id,
  title,
  exerciseSets,
}: {
  id: string;
  title: string;
  exerciseSets: ExerciseSet[];
}) => {
  const removeWorkout = api.workout.deleteWorkout.useMutation({
    onSuccess: () => {
      toast("Workout removed successfully");
    },
    onError: (error) => {
      toast(`Failed to remove workout ${error.message}`);
    },
  });

  const {
    updateTitleInExercises,
    removeExercise,
    addExerciseSetsToExercises,
    setExerciseSetsToExercises,
    duplicateExercisesSet,
    removeExerciseSet,
  } = useWorkoutStore((state) => state);

  const [addingSet, setAddingSet] = useState(false);
  const [currentSet, setCurrentSet] = useState({
    rep: "",
    weight: "",
  });

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

  const addSetHandler = () => {
    if (currentSet.rep && currentSet.weight) {
      const newSet: ExerciseSet = {
        id: Date.now().toString(), // Use timestamp as UUID
        rep: currentSet.rep,
        weight: currentSet.weight,
      };

      addExerciseSetsToExercises(newSet, id);
      setCurrentSet({ rep: "", weight: "" }); // Clear input fields
    }
  };

  const handleAddedInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputType: "rep" | "weight",
    setId: string
  ) => {
    setExerciseSetsToExercises(event.target.value, inputType, setId, id);
  };

  const removeSetHandler = (setId: string) => {
    removeExerciseSet(setId, id);
  };

  const copySetHandler = (setId: string) => {
    duplicateExercisesSet(setId, id);
  };

  const handleTitleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    updateTitleInExercises(value, id);
  };

  const handleRemoveExercise = async () => {
    const variables = {
      id,
    };
    await removeWorkout.mutate(variables);
    removeExercise(id);
  };

  return (
    <div className="mb-2 flex flex-col gap-2 rounded border border-gray-200 bg-white p-2 text-sm">
      <div className="flex">
        <Input
          type="text"
          placeholder="Exercise"
          className="w-full border-none shadow-none outline-none"
          defaultValue={title}
          onChange={handleTitleOnChange}
        />
        <div
          className="h-fit cursor-pointer pl-1.5 text-primary hover:text-primary/60"
          onClick={handleRemoveExercise}
        >
          <CrossCircledIcon />
        </div>
      </div>
      <Separator />
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
          <Button variant={"secondary"} size="sm" className="h-6 w-16" disabled>
            Rep
          </Button>
          <Button variant={"secondary"} size="sm" className="h-6 w-16" disabled>
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
      {exerciseSets.map(({ id, rep, weight }) => {
        return (
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
        );
      })}
      {exerciseSets.length > 0 && (
        <Button variant="outline" onClick={() => setAddingSet(true)}>
          Complete set
        </Button>
      )}
    </div>
  );
};

export default ExerciseCard;
