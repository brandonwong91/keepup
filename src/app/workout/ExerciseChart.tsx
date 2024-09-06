import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { useWorkoutStore } from "./state";
import { format } from "date-fns";

interface ExerciseChartProps {
  date: string;
  weight: string;
  rep: string;
}

const ExerciseChart = () => {
  const { exercise } = useWorkoutStore((state) => state);

  const mappedExerciseSetsChartData = exercise.exerciseSets.map((set) => ({
    date: format(new Date(set.createdAt as Date), "MM-dd"),
    weight: set.weight,
    rep: set.rep,
  }));

  const getHeaviestWeightPerDate = (exerciseSets: ExerciseChartProps[]) => {
    // Create an object to store the heaviest weight for each date
    const heaviestWeights: { [key: string]: number } = {};

    // Loop through each exercise set
    exerciseSets.forEach((set) => {
      const { date, weight } = set;

      // If the date isn't in the object, or if the current weight is greater than the stored weight for that date, update it
      if (!heaviestWeights[date] || parseInt(weight) > heaviestWeights[date]!) {
        heaviestWeights[date] = parseInt(weight);
      }
    });

    // Convert the object back into an array of { date, weight } objects
    return Object.entries(heaviestWeights).map(([date, weight]) => ({
      date,
      weight,
    }));
  };

  const chartConfig = {
    weight: {
      label: "Weight",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={getHeaviestWeightPerDate(mappedExerciseSetsChartData)}
      >
        <CartesianGrid vertical={false} />

        <ChartTooltip content={<ChartTooltipContent />} />
        {/* <ChartLegend content={<ChartLegendContent />} /> */}
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <Bar dataKey="weight" fill="var(--color-weight)">
          <LabelList offset={2} fontSize={12} position="top" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

export default ExerciseChart;
