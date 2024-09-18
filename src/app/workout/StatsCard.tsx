import React, { ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useWorkoutStore } from "./state";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CalendarIcon, CheckIcon, TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import { Separator } from "~/components/ui/separator";
import { api } from "~/utils/api";
import { toast } from "sonner";

const StatsCard = () => {
  const {
    stat,
    setStat,
    addStatSetToStat,
    statSet,
    setStatSet,
    clearStat,
    clearStatSet,
    refetchStats,
  } = useWorkoutStore((state) => state);

  const { id, title, statSets, unit } = stat;
  const [date, setDate] = useState<Date | undefined>(new Date());

  const createStatApi = api.workout.createStat.useMutation({
    onSuccess: () => {
      toast("Stat created successfully");
      if (refetchStats) {
        refetchStats();
      }
    },
    onError: (error) => {
      toast(`Failed to create stat: ${error.message}`);
    },
  });

  const updateStatApi = api.workout.updateStat.useMutation({
    onSuccess: () => {
      toast("Stat updated successfully");
      if (refetchStats) {
        refetchStats();
      }
    },
    onError: (error) => {
      toast(`Failed to update stat: ${error.message}`);
    },
  });

  const removeStatApi = api.workout.deleteStat.useMutation({
    onSuccess: () => {
      toast("Stat removed successfully");
      if (refetchStats) {
        refetchStats();
      }
    },
    onError: (error) => {
      toast(`Failed to remove stat: ${error.message}`);
    },
  });

  const handleStatInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    inputType: "title" | "unit"
  ) => {
    const newTitle = event.target.value;
    setStat({
      ...stat,
      [inputType]: newTitle,
    });
  };

  const handleRemoveStat = async (id: string) => {
    const variables = {
      id,
    };
    await removeStatApi.mutate(variables);
    clearStat();
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    inputType: "value"
  ) => {
    const { value } = event.target;
    setStatSet({
      ...statSet,
      [inputType]: value,
    });
  };

  const handleAddStatSetToStats = () => {
    if (statSet.value) {
      addStatSetToStat({
        id: Date.now().toString(),
        value: statSet.value,
        createdAt: date,
      });
      clearStatSet();
      setDate(undefined);
    }
  };

  const handleAddStat = async () => {
    const variables = {
      id,
      title,
      statSets: statSets.map((s) => {
        return {
          ...s,
          value: s.value,
          createdAt: s.createdAt ?? new Date(),
        };
      }),
      unit: unit ?? undefined,
    };
    if (stat.title) {
    }
    if (stat.id) {
      await updateStatApi.mutate(variables);
    } else {
      await createStatApi.mutate(variables);
    }
    clearStat();
    setDate(undefined);
  };

  const handleDateChange = (setId: string, newDate?: Date) => {
    const updatedSets = stat.statSets.map((set) =>
      setId === set.id ? { ...set, createdAt: newDate } : set
    );
    setStat({ ...stat, statSets: updatedSets });
  };

  const handleAddedInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setId: string
  ) => {
    const updatedSets = stat.statSets.map((set) =>
      set.id === setId ? { ...set, value: event.target.value.trim() } : set
    );
    setStat({ ...stat, statSets: updatedSets });
  };

  const removeStatSetHandler = (setId: string) => {
    const updatedSets = stat.statSets.filter((set) => set.id !== setId);
    setStat({ ...stat, statSets: updatedSets });
  };

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="flex gap-2">
          <Input
            placeholder="title"
            value={stat.title}
            onChange={(e) => handleStatInputChange(e, "title")}
          />
          <Input
            placeholder="unit"
            value={stat.unit}
            onChange={(e) => handleStatInputChange(e, "unit")}
            className="mr-6 w-16"
          />
        </CardTitle>

        {stat.statSets.length > 0 && <Separator />}
      </CardHeader>
      <CardContent>
        <div className="w-38 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "mb-2 w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? `${format(date, "MM-dd")}` : <span>date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            placeholder="value"
            onChange={(e) => handleInputChange(e, "value")}
            value={statSet.value}
            className="w-16"
          />
          <Button
            variant={"link"}
            size={"icon"}
            className="text-green-500"
            onClick={() => handleAddStatSetToStats()}
          >
            <CheckIcon />
          </Button>
        </div>
        {stat.statSets.map(({ id, value, createdAt }) => {
          return (
            createdAt && (
              <div className="w-38 flex gap-2" key={id}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "mb-2 w-full justify-start text-left font-normal"
                        // !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(createdAt, "MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(createdAt)}
                      onSelect={(newDate) => handleDateChange(id, newDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder="value"
                  onChange={(e) => handleAddedInputChange(e, id)}
                  className="w-16"
                  value={value}
                />
                <Button
                  variant={"link"}
                  size={"icon"}
                  className="text-red-500"
                  onClick={() => removeStatSetHandler(id)}
                >
                  <TrashIcon />
                </Button>
              </div>
            )
          );
        })}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() => handleRemoveStat(id)}
          variant={"destructive"}
          size={"sm"}
        >
          Remove
        </Button>

        <Button onClick={handleAddStat} size={"sm"}>
          {stat.id !== "" ? "Save" : "Add"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StatsCard;
