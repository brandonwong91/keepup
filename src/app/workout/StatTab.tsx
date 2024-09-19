import React from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useWorkoutStore } from "./state";
import { Separator } from "~/components/ui/separator";
import { getFormattedDateDifference } from "~/utils/date";
const StatTab = ({ isLoading }: { isLoading: boolean }) => {
  const { stats, setStat, clearStat } = useWorkoutStore((state) => state);

  return (
    <Card>
      <ScrollArea className="h-72 w-60">
        <div className="p-4">
          <CardHeader className="mb-4 flex flex-row place-items-center justify-start p-0 align-middle">
            <div className="mt-1 pr-2 text-sm font-medium leading-none">
              Stats
            </div>
            <Button
              size="icon"
              className="h-5 w-5 self-start"
              onClick={() => {
                clearStat();
              }}
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
          {stats && stats.length > 0 ? (
            stats
              .sort((a, b) => a.title.localeCompare(b.title))
              .map(({ title, id, statSets, unit, ...remaining }) => (
                <div key={id}>
                  <div
                    className="w-full cursor-pointer text-sm"
                    onClick={() =>
                      setStat({
                        id,
                        statSets,
                        title,
                        ...remaining,
                      })
                    }
                  >
                    {title}
                    {statSets.length > 0 &&
                      // Find the latest statSet by comparing createdAt timestamps
                      (() => {
                        const latestStatSet = statSets.reduce(
                          (latest, current) =>
                            new Date(current.createdAt!) >
                            new Date(latest.createdAt!)
                              ? current
                              : latest
                        );

                        return (
                          <div
                            key={latestStatSet.id}
                            className="flex justify-between text-xs italic text-accent-foreground"
                          >
                            <p>{`${latestStatSet.value}${unit}`}</p>
                            <p>
                              {getFormattedDateDifference(
                                latestStatSet.createdAt!
                              )}
                            </p>
                          </div>
                        );
                      })()}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))
          ) : (
            <div className="text-sm text-secondary-foreground">
              No stats found...
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default StatTab;
