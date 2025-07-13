"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import type { Task } from "@/lib/data"
import type { ChartConfig } from "@/components/ui/chart"

type ProgressOverviewProps = {
  tasks: Task[];
};

const chartConfig: ChartConfig = {
  tasks: {
    label: "Tasks",
  },
  todo: {
    label: "To Do",
    color: "hsl(var(--chart-4))",
  },
  "in-progress": {
    label: "In Progress",
    color: "hsl(var(--chart-2))",
  },
  done: {
    label: "Done",
    color: "hsl(var(--chart-1))",
  },
  review: {
    label: "Review",
    color: "hsl(var(--chart-3))",
  },
}

export function ProgressOverview({ tasks }: ProgressOverviewProps) {
  const taskStatusData = [
    { status: "todo", count: tasks.filter(t => t.status === 'todo').length, fill: "var(--color-todo)" },
    { status: "in-progress", count: tasks.filter(t => t.status === 'in-progress').length, fill: "var(--color-in-progress)" },
    { status: "done", count: tasks.filter(t => t.status === 'done').length, fill: "var(--color-done)" },
    { status: "review", count: tasks.filter(t => t.status === 'review').length, fill: "var(--color-review)" },
  ];
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Task Status Distribution</CardTitle>
          <CardDescription>A look at the current state of all tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
             <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={taskStatusData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    strokeWidth={5}
                  >
                      {taskStatusData.map((entry) => (
                        <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                      ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Team Productivity</CardTitle>
          <CardDescription>Monthly task completion rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
             <ResponsiveContainer width="100%" height={200}>
                <BarChart accessibilityLayer data={taskStatusData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="status"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      // @ts-ignore
                      tickFormatter={(value) => chartConfig[value]?.label}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={8}>
                        {taskStatusData.map((entry) => (
                            <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                        ))}
                    </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
