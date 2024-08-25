import { create } from "zustand";
import Workout from "./page";
import ObjectID from "bson-objectid";

export interface ExerciseSet {
  id: string;
  rep: string;
  weight: string;
}

export interface Exercise {
  id: string;
  title: string;
  exerciseSets: ExerciseSet[] | null;
}

export interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
}

interface WorkoutStore {
  workouts: Workout[];
  workout: Workout;
  showNewExercise: boolean;
  exercises: Exercise[];
  exercise: Exercise;
  exerciseSet: ExerciseSet;
  exerciseSets: ExerciseSet[];
  setWorkout: (workout: Workout) => void;
  setWorkouts: (workouts: Workout[]) => void;
  refetchWorkouts: (() => void) | null;
  setRefetchWorkouts: (refetch: () => void) => void;
  clearWorkout: () => void;

  setShowNewExercise: (show: boolean) => void;

  updateExercise: (exercise: Exercise) => void;
  setExercise: (exercise: Exercise) => void;
  addExercise: (exercise: Exercise) => void;
  setExercises: (exercises: Exercise[]) => void;
  addWorkoutTitle: (title: string) => void;
  addWorkout: (workout: Workout) => void;
  removeWorkout: (id: string) => void;
  updateTitleInExercises: (title: string, id: string) => void;
  removeExercise: (id: string) => void;
  addExerciseSetsToExercises: (exerciseSet: ExerciseSet, id: string) => void;
  setExerciseSetsToExercises: (
    value: string,
    inputType: string,
    setId: string,
    exerciseId: string
  ) => void;
  duplicateExercisesSet: (setId: string, exerciseId: string) => void;
  removeExerciseSet: (setId: string, exerciseId: string) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  workouts: [],
  workout: {
    id: "",
    title: "",
    exercises: [],
  },
  refetchWorkouts: null,
  setRefetchWorkouts: (refetch) => set({ refetchWorkouts: refetch }),
  exercises: [],
  exercise: {
    id: "",
    title: "",
    exerciseSets: [],
  },
  exerciseSet: {
    id: "",
    rep: "",
    weight: "",
  },
  exerciseSets: [],
  showNewExercise: false,
  setWorkout: (workout: Workout) =>
    set({ workout, exercises: workout.exercises }),
  setWorkouts: (workouts: Workout[]) =>
    set((state: WorkoutStore) => ({
      ...state,
      workouts,
    })),
  clearWorkout: () =>
    set({
      workout: {
        id: "",
        title: "",
        exercises: [],
      },
      exercises: [],
      exercise: {
        id: "",
        title: "",
        exerciseSets: [],
      },
      exerciseSets: [],
    }),
  removeWorkout: (id: String) =>
    set((state: WorkoutStore) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
      workout: {
        id: "",
        title: "",
        exercises: [],
      },
    })),
  addWorkoutTitle: (title: string) =>
    set((state: WorkoutStore) => ({
      workout: {
        ...state.workout,
        title: title,
      },
    })),
  updateTitleInExercises: (title: string, id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, title } : exercise
      ),
    })),
  addExerciseSetsToExercises: (exerciseSet: ExerciseSet, id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              exerciseSets: [...exercise.exerciseSets, exerciseSet],
            }
          : exercise
      ),
    })),
  setExerciseSetsToExercises: (
    value: string,
    inputType: string,
    setId: string,
    exerciseId: string
  ) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              exerciseSets: exercise.exerciseSets.map((exerciseSet) =>
                exerciseSet.id === setId
                  ? { ...exerciseSet, [inputType]: value }
                  : exerciseSet
              ),
            }
          : exercise
      ),
    })),
  duplicateExercisesSet: (setId: string, exerciseId: string) =>
    set((state: WorkoutStore) => {
      const existingSet = state.exercises
        .find((exercise) => exercise.id === exerciseId)
        ?.exerciseSets.find((set) => set.id === setId);

      if (existingSet) {
        const copiedSet = {
          id: ObjectID.createFromTime(Date.now()).str, // Use timestamp as UUID
          rep: existingSet.rep,
          weight: existingSet.weight,
        };

        return {
          ...state,
          exercises: state.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  exerciseSets: [...exercise.exerciseSets, copiedSet],
                }
              : exercise
          ),
        };
      }

      return state; // No changes if the set doesn't exist
    }),
  removeExerciseSet: (setId: string, exerciseId: string) => {
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              exerciseSets: exercise.exerciseSets.filter(
                (set) => set.id !== setId
              ),
            }
          : exercise
      ),
    }));
  },
  removeExercise: (id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.filter((exercise) => exercise.id !== id),
    })),
  setShowNewExercise: (show: boolean) =>
    set((state: WorkoutStore) => ({
      ...state,
      showNewExercise: show,
    })),
  addWorkout: (workout: Workout) =>
    set((state: WorkoutStore) => {
      const existingWorkoutIndex = state.workouts.findIndex(
        (w: Workout) => w.id === workout.id
      );
      if (existingWorkoutIndex !== -1) {
        // Workout with the same id exists, so update it
        const updatedWorkouts = [...state.workouts];
        updatedWorkouts[existingWorkoutIndex] = {
          ...workout,
          exercises: state.exercises,
        };
        return {
          ...state,
          workouts: updatedWorkouts,
          workout: {
            id: "",
            title: "",
            exercises: [],
          },
          exercises: [],
          showNewExercise: false,
        };
      } else {
        return {
          ...state,
          workouts: [
            {
              id: ObjectID.createFromTime(Date.now()).str,
              title: workout.title,
              exercises: [...state.exercises, state.exercise],
            },
            ...state.workouts,
          ],
          workout: {
            id: "",
            title: "",
            exercises: [],
          },
          exercises: [],
          showNewExercise: false,
        };
      }
    }),

  setExercise: (exercise: Exercise) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercise,
    })),
  setExercises: (exercises: Exercise[]) => {
    set((state: WorkoutStore) => ({
      ...state,
      exercises,
    }));
  },
  updateExercises: (exercise: Exercise) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((e) =>
        e.id === exercise.id ? exercise : e
      ),
    })),
  addExercise: (exercise: Exercise) =>
    set((state: WorkoutStore) => ({
      exercises: [...state.exercises, exercise],
      exercise: {
        id: "",
        title: "",
        exerciseSets: [],
      },
    })),
  updateExercise: (exercise: Exercise) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercise: {
        ...state.exercise,
        ...exercise,
      },
    })),
}));
