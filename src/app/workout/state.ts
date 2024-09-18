import { create } from "zustand";
import Workout from "./page";

export interface ExerciseSet {
  id: string;
  rep: string;
  weight: string;
  createdAt?: Date;
}

export interface Exercise {
  id: string;
  title: string;
  exerciseSets: ExerciseSet[];
  order?: number;
  maxWeight?: number;
  maxWeightDate?: Date;
}

export interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface StatSet {
  id: string;
  value: string;
  createdAt?: Date;
}

export interface Stat {
  id: string;
  title: string;
  unit?: string;
  statSets: StatSet[];
}

interface WorkoutStore {
  // Workout-related properties and methods
  workouts: Workout[];
  workout: Workout;
  setWorkout: (workout: Workout) => void;
  setWorkouts: (workouts: Workout[]) => void;
  addWorkout: (workout: Workout) => void;
  removeWorkout: (id: string) => void;
  addWorkoutTitle: (title: string) => void;
  clearWorkout: () => void;
  refetchWorkouts: (() => void) | null;
  setRefetchWorkouts: (refetch: () => void) => void;

  // Exercise-related properties and methods
  exercises: Exercise[];
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (id: string) => void;
  updateExercise: (exercise: Exercise) => void;
  clearExercise: () => void;
  refetchExercises: (() => void) | null;
  setRefetchExercises: (refetch: () => void) => void;

  // ExerciseSet-related properties and methods
  exerciseSet: ExerciseSet;
  exerciseSets: ExerciseSet[];
  addExerciseSetsToExercises: (exerciseSet: ExerciseSet, id: string) => void;
  addExerciseSetsToExercise: (exerciseSet: ExerciseSet) => void;
  setExerciseSetsToExercises: (
    value: string,
    inputType: string,
    setId: string,
    exerciseId: string
  ) => void;
  setExerciseSetsToExercise: (
    value: string,
    inputType: string,
    exerciseId: string
  ) => void;
  duplicateExercisesSet: (setId: string, exerciseId: string) => void;
  duplicateExercisesSetInExercise: (setId: string) => void;
  removeExerciseSet: (setId: string, exerciseId: string) => void;
  removeExerciseSetInExercise: (setId: string) => void;

  // UI-related properties and methods
  showNewExercise: boolean;
  setShowNewExercise: (show: boolean) => void;
  showTab: string;
  setShowTab: (tab: string) => void;

  // Date-related properties and methods
  workoutDates: string[];
  setWorkoutDates: (dates: string[]) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Miscellaneous methods
  updateTitleInExercises: (title: string, id: string) => void;

  // Stats
  stat: Stat;
  setStat: (stat: Stat) => void;
  statSet: StatSet;
  setStatSet: (statSet: StatSet) => void;
  clearStat: () => void;
  clearStatSet: () => void;
  stats: Stat[];
  setStats: (stats: Stat[]) => void;
  addStatSetToStat: (statSet: StatSet) => void;
  removeStat: (id: string) => void;
  refetchStats: (() => void) | null;
  setRefetchStats: (refetch: () => void) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  workouts: [],
  workout: {
    id: "",
    title: "",
    exercises: [],
  },
  setWorkout: (workout: Workout) =>
    set({ workout, exercises: workout.exercises }),
  setWorkouts: (workouts: Workout[]) =>
    set((state: WorkoutStore) => ({
      ...state,
      workouts,
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
              id: Date.now().toString(),
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
  addWorkoutTitle: (title: string) =>
    set((state: WorkoutStore) => ({
      workout: {
        ...state.workout,
        title: title,
      },
    })),
  clearWorkout: () =>
    set({
      workout: {
        id: "",
        title: "",
        exercises: [],
      },
      exercises: [],
    }),
  removeExercise: (id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.filter((exercise) => exercise.id !== id),
    })),
  refetchWorkouts: null,
  setRefetchWorkouts: (refetch) => set({ refetchWorkouts: refetch }),
  removeWorkout: (id: String) =>
    set((state: WorkoutStore) => ({
      workouts: state.workouts.filter((w) => w.id !== id),
      workout: {
        id: "",
        title: "",
        exercises: [],
      },
    })),

  // Exercise-related methods
  exercises: [],
  exercise: {
    id: "",
    title: "",
    exerciseSets: [],
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
  setExercise: (exercise: Exercise) => {
    set((state: WorkoutStore) => ({
      ...state,
      exercise,
    }));
  },
  setExercises: (exercises: Exercise[]) => {
    const orderedExercises = exercises.map((exercise, index) => ({
      ...exercise,
      order: index,
    }));
    set((state: WorkoutStore) => ({
      ...state,
      exercises: orderedExercises,
    }));
  },
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
  addExerciseSetsToExercise: (exerciseSet: ExerciseSet) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercise: {
        ...state.exercise,
        exerciseSets: [...state.exercise.exerciseSets, exerciseSet],
      },
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
  setExerciseSetsToExercise: (
    value: string,
    inputType: string,
    setId: string
  ) => {
    set((state: WorkoutStore) => ({
      ...state,
      exercise: {
        ...state.exercise,
        exerciseSets: state.exercise.exerciseSets.map((exerciseSet) =>
          exerciseSet.id === setId
            ? { ...exerciseSet, [inputType]: value }
            : exerciseSet
        ),
      },
    }));
  },
  updateTitleInExercises: (title: string, id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      exercises: state.exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, title } : exercise
      ),
    })),

  duplicateExercisesSetInExercise: (setId: string) =>
    set((state: WorkoutStore) => {
      const existingSet = state.exercise?.exerciseSets.find(
        (set) => set.id === setId
      );

      if (existingSet) {
        const copiedSet = {
          id: Date.now().toString(), // Use timestamp as UUID
          rep: existingSet.rep,
          weight: existingSet.weight,
          createdAt: existingSet.createdAt,
        };

        return {
          ...state,
          exercise: {
            ...state.exercise,
            exerciseSets: [...state.exercise.exerciseSets, copiedSet],
          },
        };
      }

      return state; // No changes if the set doesn't exist
    }),
  clearExercise: () =>
    set({
      exercise: {
        id: "",
        title: "",
        exerciseSets: [],
      },
    }),
  refetchExercises: null,
  setRefetchExercises: (refetch) => set({ refetchExercises: refetch }),

  exerciseSet: {
    id: "",
    rep: "",
    weight: "",
  },
  exerciseSets: [],
  duplicateExercisesSet: (setId: string, exerciseId: string) =>
    set((state: WorkoutStore) => {
      const existingSet = state.exercises
        .find((exercise) => exercise.id === exerciseId)
        ?.exerciseSets.find((set) => set.id === setId);

      if (existingSet) {
        const copiedSet = {
          id: Date.now().toString(), // Use timestamp as UUID
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
  removeExerciseSetInExercise: (setId: string) => {
    set((state: WorkoutStore) => ({
      ...state,
      exercise: {
        ...state.exercise,
        exerciseSets: state.exercise.exerciseSets.filter(
          (set) => set.id !== setId
        ),
      },
    }));
  },
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

  workoutDates: [],
  setWorkoutDates: (dates: string[]) =>
    set((state: WorkoutStore) => ({
      ...state,
      workoutDates: Array.from(new Set([...state.workoutDates, ...dates])),
    })),
  selectedDate: Date().toString(),
  setSelectedDate: (date: string) => {
    set((state: WorkoutStore) => ({
      ...state,
      selectedDate: date,
    }));
  },
  showTab: "workouts",
  setShowTab: (tab: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      showTab: tab,
      exercises: tab === "workouts" ? [] : state.exercises,
    })),
  showNewExercise: false,
  setShowNewExercise: (show: boolean) =>
    set((state: WorkoutStore) => ({
      ...state,
      showNewExercise: show,
    })),

  stat: {
    id: "",
    title: "",
    statSets: [],
    unit: "",
    // Add other properties as needed
  },
  setStat: (stat: Stat) =>
    set((state: WorkoutStore) => ({
      ...state,
      stat,
    })),
  statSet: {
    id: "",
    value: "",
  },
  clearStatSet: () =>
    set((state: WorkoutStore) => ({
      ...state,
      statSet: {
        id: "",
        value: "",
        createdAt: undefined,
      },
    })),
  clearStat: () =>
    set((state: WorkoutStore) => ({
      ...state,
      stat: {
        id: "",
        title: "",
        statSets: [],
        unit: "",
      },
    })),
  setStatSet: (statSet: StatSet) =>
    set((state: WorkoutStore) => ({
      ...state,
      statSet,
    })),

  // Add other properties and methods as needed
  stats: [],
  setStats: (stats: Stat[]) =>
    set((state: WorkoutStore) => ({
      ...state,
      stats,
    })),
  addStatSetToStat: (statSet: StatSet) =>
    set((state: WorkoutStore) => ({
      ...state,
      stat: {
        ...state.stat,
        statSets: [statSet, ...state.stat.statSets],
      },
    })),
  removeStat: (id: string) =>
    set((state: WorkoutStore) => ({
      ...state,
      stats: state.stats.filter((s) => s.id !== id),
    })),
  refetchStats: null,
  setRefetchStats: (refetch) => set({ refetchStats: refetch }),
  // stats: [],
  // updateStats: (stats: Stat[]) => set({ stats }),
  // updateStat: (stat: Stat) => set({ stat }),
  // clearStat: () => set({ stat: { id: "", title: "" } }),
  // // Stat-related methods
  // setStats: (stats: Stat[]) => set({  }),
  // addStat: (stat: Stat) => set({ stats: [...stats, stat] }),
  // removeStat: (id: string) => set({ stats: stats.filter((s) => s.id !== id) }),
  // refetchStats: null,
  // setRefetchStats: (refetch) => set({ refetchStats: refetch }),
}));
