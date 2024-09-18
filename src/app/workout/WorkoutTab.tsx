import { PlusIcon } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkoutStore } from "./state";
import { Separator } from "~/components/ui/separator";

const WorkoutTab = ({ isLoading }: { isLoading: boolean }) => {
  const { workouts, setWorkout, clearWorkout } = useWorkoutStore(
    (state) => state
  );
  const handleShowWorkoutCard = () => {
    clearWorkout();
  };

  return (
    <Card>
      <ScrollArea className="h-72 w-60 p-4">
        <CardHeader className="mb-4 flex flex-row place-items-center justify-start p-0 align-middle">
          <div className="mt-1 pr-2 text-sm font-medium leading-none">
            Workouts
          </div>
          <Button
            size="icon"
            className="h-5 w-5 self-start"
            onClick={handleShowWorkoutCard}
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
        {workouts.length > 0 ? (
          workouts.map(({ title, id, exercises }) => (
            <div key={id}>
              <div
                className="cursor-pointer text-sm"
                onClick={() =>
                  setWorkout({
                    id,
                    title,
                    exercises,
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
            No workouts found...
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default WorkoutTab;
