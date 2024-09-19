import React from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Reorder } from "framer-motion";
import { toast } from "sonner";

const WorkoutCard = () => {
  const {
    addWorkoutTitle,
    clearWorkout,
    exercises,
    refetchWorkouts,
    setShowNewExercise,
    showNewExercise,
    workout,
    addExercise,
    setExercises,
    selectedDate,
  } = useWorkoutStore((state) => state);

  const getAllExercisesApi = api.workout.getAllExercises.useQuery();

  const removeWorkoutApi = api.workout.deleteWorkout.useMutation({
    onSuccess: () => {
      toast("Workout removed successfully!");
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      toast(`Failed to remove workout ${error.message}`);
    },
  });
  const updateWorkoutApi = api.workout.updateWorkout.useMutation({
    onSuccess: () => {
      toast("Workout updated successfully!");
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      toast(`Failed to update workout ${error.message}`);
    },
  });
  // const updateWorkoutByDateApi = api.workout.updateWorkoutByDate.useMutation({
  //   onSuccess: () => {
  //     toast("Workout updated by date successfully!");
  //     if (refetchWorkouts) {
  //       refetchWorkouts();
  //     }
  //   },
  //   onError: (error) => {
  //     toast(`Failed to update workout ${error.message}`);
  //   },
  // });
  const addWorkoutApi = api.workout.createWorkout.useMutation({
    onSuccess: () => {
      toast("Workout created successfully!");
      if (refetchWorkouts) {
        refetchWorkouts();
      }
    },
    onError: (error) => {
      toast(`Failed to create workout ${error.message}`);
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
      title,
      exercises,
    };

    if (id === "") {
      await addWorkoutApi.mutate(variables);
    } else {
      await updateWorkoutApi.mutate({
        id,
        ...variables,
        date: selectedDate,
      });
    }

    clearWorkout();
  };

  const handleSelectExercise = async (value: string) => {
    const exercise = getAllExercisesApi.data?.find(
      (exercise) => exercise.id === value
    );
    if (exercise && !exercises.some((e) => e.id === exercise.id)) {
      addExercise({
        ...exercise,
        exerciseSets: [],
        order: exercises.length + 1,
        maxWeight: 0,
        maxWeightDate: undefined,
      });
    }
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
        <Select onValueChange={handleSelectExercise}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an exercise">
              {exercises.length > 0 && `Exercises added: ${exercises.length}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Exercises</SelectLabel>
              {getAllExercisesApi.data?.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {showNewExercise && <NewExerciseCard />}
        <Reorder.Group axis="y" values={exercises} onReorder={setExercises}>
          {exercises.length > 0 &&
            exercises
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((ex) => {
                const { id, title, exerciseSets } = ex;
                return (
                  <Reorder.Item key={id} value={ex}>
                    <ExerciseCard
                      key={id}
                      id={id}
                      title={title}
                      exerciseSets={exerciseSets}
                    />
                  </Reorder.Item>
                );
              })}
        </Reorder.Group>
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
