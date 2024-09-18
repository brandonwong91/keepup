import { PlusIcon } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkoutStore } from "./state";
import { Separator } from "~/components/ui/separator";

const ExerciseTab = ({ isLoading }: { isLoading: boolean }) => {
  const { exercises, setExercise, clearExercise } = useWorkoutStore(
    (state) => state
  );
  const handleShowExerciseCard = () => {
    clearExercise();
  };
  return (
    <Card>
      <ScrollArea className="h-72 w-60">
        <div className="p-4">
          <CardHeader className="mb-4 flex flex-row place-items-center justify-start p-0 align-middle">
            <div className="mt-1 pr-2 text-sm font-medium leading-none">
              Exercises
            </div>
            <Button
              size="icon"
              className="h-5 w-5 self-start"
              onClick={handleShowExerciseCard}
            >
              <PlusIcon />
            </Button>
          </CardHeader>
          {isLoading && (
            <div className="flex flex-col gap-6">
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
              <Skeleton className="h-[16px] w-full rounded-full" />
            </div>
          )}
          {exercises && exercises.length > 0 ? (
            exercises
              .sort((a, b) => a.title.localeCompare(b.title))
              .map(({ title, id, exerciseSets, ...remaining }) => (
                <div key={id}>
                  <div
                    className="cursor-pointer text-sm"
                    onClick={() =>
                      setExercise({
                        id,
                        exerciseSets,
                        title,
                        order: exerciseSets.length + 1,
                        ...remaining,
                      })
                    }
                  >
                    {title}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))
          ) : (
            <div className="text-sm text-secondary-foreground">
              No exercises found...
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ExerciseTab;
