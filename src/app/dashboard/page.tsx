
"use client"
import { PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { TaskCard } from "@/components/dashboard/task-card"
import { getTasks, getTeamMembers, tasks as initialTasks, teamMembers as initialTeamMembers } from "@/lib/data"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import type { Task, TeamMember } from "@/lib/data"
import { TaskDetailsDialog } from "@/components/dashboard/task-details-dialog"
import { TaskFormDialog } from "@/components/dashboard/add-task-dialog"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
        const [tasksData, teamMembersData] = await Promise.all([getTasks(), getTeamMembers()]);
        setTasks(tasksData);
        setTeamMembers(teamMembersData);
    }
    loadData();
  }, []);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsDialogOpen(true)
  }

  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false)
    // Delay clearing task to prevent content from disappearing during closing animation
    setTimeout(() => {
      setSelectedTask(null)
    }, 300)
  }

  const handleOpenFormDialog = (task?: Task | null) => {
    setTaskToEdit(task || null);
    setIsFormDialogOpen(true);
    setIsDetailsDialogOpen(false); // Close details if open
  }

  const handleTaskSubmit = (newTaskData: Omit<Task, 'id' | 'updates' | 'progress'>, taskId?: string) => {
    if (taskId) {
        // Editing existing task
        setTasks(prevTasks => prevTasks.map(t => 
            t.id === taskId ? { ...t, ...newTaskData } : t
        ));
    } else {
        // Adding new task
        const brandNewTask: Task = {
            ...newTaskData,
            id: `TASK-${tasks.length + 1}`,
            progress: 0,
            updates: [],
        };
        setTasks(prevTasks => [brandNewTask, ...prevTasks]);
    }
  };

  if (!user) return null

  const isManager = user.role === 'manager';

  const userTasks = isManager
    ? tasks
    : tasks.filter(task => task.assignedTo === user.id || task.collaborators?.includes(user.id))

  const myTasks = tasks.filter(task => task.assignedTo === user.id)

  const filteredTasks = (taskList: Task[]) => {
    if (!searchTerm) return taskList;

    const lowercasedFilter = searchTerm.toLowerCase();
    return taskList.filter(task => {
        const assignee = teamMembers.find(member => member.id === task.assignedTo);
        return (
            task.title.toLowerCase().includes(lowercasedFilter) ||
            (assignee && assignee.name.toLowerCase().includes(lowercasedFilter))
        );
    });
  };

  const renderTaskList = (taskList: Task[]) => {
    const tasksToRender = filteredTasks(taskList);
    if (tasksToRender.length === 0) {
        return <p className="text-muted-foreground text-center col-span-full py-8">No tasks found.</p>
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasksToRender.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                user={user} 
                teamMembers={teamMembers}
                onSelectTask={handleSelectTask}
                onEditTask={handleOpenFormDialog}
            />
        ))}
        </div>
    )
  }

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Welcome back, {user.name.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground">
              Here's a look at your team's progress.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {isManager && (
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tasks or leaders..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             )}
            {(user.role === 'manager' || user.role === 'lead') && (
                  <Button 
                    className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
                    onClick={() => handleOpenFormDialog()}
                  >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Task
                  </Button>
            )}
          </div>
        </div>
        
        {user.role === 'manager' && <ProgressOverview tasks={tasks} />}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {renderTaskList(userTasks)}
          </TabsContent>
          <TabsContent value="my-tasks" className="space-y-4">
            {renderTaskList(myTasks)}
          </TabsContent>
        </Tabs>
      </div>
      <TaskDetailsDialog
          isOpen={isDetailsDialogOpen}
          onOpenChange={handleDetailsDialogClose}
          task={selectedTask}
          currentUser={user}
          teamMembers={teamMembers}
          onEdit={handleOpenFormDialog}
      />
      <TaskFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        teamMembers={teamMembers}
        onTaskSubmit={handleTaskSubmit}
        currentUser={user}
        taskToEdit={taskToEdit}
      />
    </>
  )
}
