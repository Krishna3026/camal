
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical, Calendar, User, Flag, Edit, Trash2, Users } from "lucide-react"
import { Task, User as AuthUser, TeamMember } from "@/lib/data"
import { format, formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type TaskCardProps = {
  task: Task
  user: AuthUser
  teamMembers: TeamMember[]
  onSelectTask: (task: Task) => void
  onEditTask: (task: Task) => void
};

const priorityStyles = {
  low: "border-green-500/80 bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "border-yellow-500/80 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  high: "border-red-500/80 bg-red-500/10 text-red-600 dark:text-red-400",
}

const statusStyles = {
  todo: "bg-gray-400/10 text-gray-500",
  "in-progress": "bg-blue-400/10 text-blue-500",
  review: "bg-purple-400/10 text-purple-500",
  done: "bg-green-400/10 text-green-500",
}

export function TaskCard({ task, user, teamMembers, onSelectTask, onEditTask }: TaskCardProps) {
  const assignee = teamMembers.find(tm => tm.id === task.assignedTo);
  const collaborators = task.collaborators?.map(cId => teamMembers.find(tm => tm.id === cId)).filter(Boolean) as TeamMember[] || [];
  const isManager = user.role === 'manager';

  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== 'done';

  return (
    <div className="[perspective:1000px] group">
        <Card 
            className="transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 group-hover:[transform:rotateX(2deg)_rotateY(-2deg)] flex flex-col justify-between h-full"
        >
          <CardHeader onClick={() => onSelectTask(task)} className="cursor-pointer">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="font-headline text-lg leading-tight">{task.title}</CardTitle>
              {isManager && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditTask(task); }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 cursor-pointer" onClick={() => onSelectTask(task)}>
             <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${priorityStyles[task.priority]} capitalize font-semibold`}>
                        <Flag className="mr-1 h-3 w-3" />
                        {task.priority}
                    </Badge>
                     <Badge variant="outline" className={`${statusStyles[task.status]} capitalize font-semibold`}>
                        {task.status.replace('-', ' ')}
                    </Badge>
                </div>
                {assignee && (
                    <div className="flex items-center gap-1.5" title={`Assigned to ${assignee.name}`}>
                      <Avatar className="h-6 w-6">
                        <AvatarImage asChild src={assignee.avatar} alt={assignee.name}>
                          <Image src={assignee.avatar} alt={assignee.name} width={24} height={24} data-ai-hint="person face" />
                        </AvatarImage>
                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{assignee.name.split(' ')[0]}</span>
                    </div>
                )}
             </div>
             <div>
                <Progress value={task.progress} className="h-2" />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">{task.progress}% complete</span>
                </div>
             </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground justify-between items-end cursor-pointer" onClick={() => onSelectTask(task)}>
            <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className={isOverdue ? "text-destructive font-semibold" : ""}>
                    {isOverdue ? 'Overdue' : 'Due'} {formatDistanceToNow(dueDate, { addSuffix: true })}
                </span>
            </div>
             {collaborators.length > 0 && (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div className="flex -space-x-2">
                        <TooltipProvider>
                        {collaborators.map(c => (
                            <Tooltip key={c.id}>
                                <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6 border-2 border-background">
                                        <AvatarImage src={c.avatar} alt={c.name} />
                                        <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{c.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </TooltipProvider>
                    </div>
                </div>
            )}
          </CardFooter>
        </Card>
    </div>
  )
}
