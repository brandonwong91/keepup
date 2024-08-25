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
import ObjectID from "bson-objectid";

const NewExerciseCard = () => {
  const { setShowNewExercise, addExercise, exercise, setExercise } =
    useWorkoutStore((state) => ({
      setShowNewExercise: state.setShowNewExercise,
      addExercise: state.addExercise,
      setExercise: state.setExercise,
      exercise: state.exercise,
    }));
  const [addingSet, setAddingSet] = useState(false);
  const [currentSet, setCurrentSet] = useState({
    rep: "",
    weight: "",
  });
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);

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

  const addExerciseHandler = () => {
    console.log("addExercise", ObjectID.createFromTime(Date.now()).str);
    if (exercise.title) {
      addExercise({
        id: Date.now().toString(),
        title: exercise.title,
        exerciseSets: exerciseSets,
      });
    }
  };

  const addSetHandler = () => {
    if (currentSet.rep && currentSet.weight) {
      const newSet: ExerciseSet = {
        id: ObjectID.createFromTime(Date.now()).str, // Use timestamp as UUID
        rep: currentSet.rep,
        weight: currentSet.weight,
      };
      setExerciseSets((prevSets) => [...prevSets, newSet]);
      setCurrentSet({ rep: "", weight: "" }); // Clear input fields
    }
  };

  const handleAddedInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputType: "rep" | "weight",
    setId: string
  ) => {
    const { value } = event.target;
    setExerciseSets((prevSets) =>
      prevSets.map((set) =>
        set.id === setId ? { ...set, [inputType]: value } : set
      )
    );
  };

  const removeSetHandler = (setId: string) => {
    setExerciseSets((prevSets) => prevSets.filter((set) => set.id !== setId));
  };

  // Handler for copying an existing set
  const copySetHandler = (setId: string) => {
    const existingSet = exerciseSets.find((set) => set.id === setId);
    if (existingSet) {
      const copiedSet: ExerciseSet = {
        id: Date.now().toString(), // Use timestamp as UUID
        rep: existingSet.rep,
        weight: existingSet.weight,
      };
      setExerciseSets((prevSets) => [...prevSets, copiedSet]);
    }
  };
  return (
    <div className="relative">
      <div className="flex flex-col gap-2 rounded border border-gray-200 p-2 text-sm">
        <div className="flex">
          <Input
            type="text"
            placeholder="Exercise"
            className="w-full border-none shadow-none outline-none"
            value={exercise.title}
            onChange={(e) =>
              setExercise({
                ...exercise,
                title: e.target.value,
              })
            }
          />
          <Button
            size={"icon"}
            variant={"link"}
            onClick={() => addExerciseHandler()}
          >
            <CheckIcon />
          </Button>
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
          <div className="flex gap-3">
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
        {exerciseSets.map(({ id, rep, weight }) => (
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
        {exerciseSets.length > 0 && (
          <Button variant="outline" onClick={() => setAddingSet(true)}>
            Complete set
          </Button>
        )}
      </div>
      <div
        className="absolute right-1 top-1 cursor-pointer bg-primary-foreground hover:text-primary/60"
        onClick={() => setShowNewExercise(false)}
      >
        <CrossCircledIcon />
      </div>
    </div>
  );
};

export default NewExerciseCard;
