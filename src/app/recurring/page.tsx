"use client";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { CalendarIcon, CopyCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

const Recurring = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(13);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="container grid grid-cols-1 justify-center gap-4 p-4 md:grid-cols-3">
      <Card className="w-fit">
        <Calendar />
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>Payments</div>
          <Button variant={"destructive"} size={"sm"}>
            Uncheck all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4" />
                      <span>{`Due by`}</span>

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
              </div>
              <Input placeholder="e.g. Tag"></Input>
              <Input placeholder="e.g. Bank"></Input>
              <Input placeholder="e.g. 300"></Input>
              <Button size={"icon"} variant={"link"}>
                <PlusCircledIcon />
              </Button>
            </div>
            {/* <Progress value={progress} className="ml-6 w-[95%]" /> */}
          </div>
          <Separator className="my-4" />
          <div className="flex flex-col">
            <div>
              <Badge>SGD</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4" />
                      <span>{`Due by`}</span>

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
              </div>
              <Input placeholder="e.g. Tag"></Input>
              <Input placeholder="e.g. Bank"></Input>
              <Input placeholder="e.g. 300"></Input>
              <Button size={"icon"} variant={"link"}>
                <CopyCheck className="w-4" />
              </Button>
            </div>
            <div className="flex justify-end">Total</div>
            <div className="flex items-center gap-2 opacity-50">
              <Checkbox id="terms" />
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4" />
                      <span>{`Due by`}</span>

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
              </div>
              <Input placeholder="e.g. Tag"></Input>
              <Input placeholder="e.g. Bank"></Input>
              <Input placeholder="e.g. 300"></Input>
              <Button size={"icon"} variant={"link"}>
                <PlusCircledIcon />
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Recurring;
