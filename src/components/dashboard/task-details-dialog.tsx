
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task, User, TeamMember } from "@/lib/data"
import { users } from "@/lib/data"
import { format, formatDistanceToNow } from "date-fns"
import { Calendar, User as UserIcon, Flag, MessageSquare, Users, UserPlus, Briefcase } from "lucide-react"
import Image from "next/image"

type TaskDetailsDialogProps = {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUser: User;
  teamMembers: TeamMember[];
  onEdit: (task: Task) => void;
};

const priorityStyles = {
  low: "border-green-500/80 bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "border-yellow-500/80 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  high: "border-red-500/80 bg-red-500/10 text-red-600 dark:text-red-400",
};

export function TaskDetailsDialog({
  task,
  isOpen,
  onOpenChange,
  currentUser,
  teamMembers,
  onEdit,
}: TaskDetailsDialogProps) {
  if (!task) return null;

  const isManager = currentUser.role === 'manager';
  const isLead = currentUser.role === 'lead';
  const assignee = teamMembers.find(tm => tm.id === task.assignedTo);
  const collaborators = task.collaborators?.map(cId => teamMembers.find(tm => tm.id === cId)).filter(Boolean) as TeamMember[];
  const creator = users.find(u => u.id === task.createdBy);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">Due Date</p>
                <p className="text-muted-foreground">{format(new Date(task.dueDate), "MMM d, yyyy")}</p>
              </div>
            </div>
            {assignee && (
                <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Assignee</p>
                        <p className="text-muted-foreground">{assignee.name}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                 <div>
                    <p className="font-semibold">Priority</p>
                    <Badge variant="outline" className={`${priorityStyles[task.priority]} capitalize`}>
                        {task.priority}
                    </Badge>
                </div>
            </div>
             {task.client && (
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Client</p>
                        <p className="text-muted-foreground">{task.client}</p>
                    </div>
                </div>
            )}
            {creator && isManager && (
                 <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Created By</p>
                        <p className="text-muted-foreground">{creator.name} on {format(new Date(task.createdAt), "MMM d")}</p>
                    </div>
                </div>
            )}
            <div className="col-span-full md:col-span-2">
                <p className="font-semibold mb-1">Progress</p>
                <Progress value={task.progress} className="h-2" />
                 <p className="text-xs text-muted-foreground mt-1">{task.progress}%</p>
            </div>
          </div>

          {collaborators && collaborators.length > 0 && (
             <>
             <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center"><Users className="mr-2 h-4 w-4"/> Collaborators</h3>
                <div className="flex flex-wrap gap-2">
                    {collaborators.map(c => (
                        <Badge key={c.id} variant="secondary" className="flex items-center gap-2">
                             <Avatar className="h-5 w-5">
                                <AvatarImage src={c.avatar} alt={c.name} />
                                <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {c.name}
                        </Badge>
                    ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5"/> Progress Updates</h3>
            <div className="relative h-48">
              <ScrollArea className="h-full w-full pr-4 absolute">
                  <div className="space-y-4">
                  {task.updates.length > 0 ? task.updates.map((update) => {
                      const authorDetails = teamMembers.find(tm => tm.name === update.author) || { avatar: '' };
                      return (
                          <div key={update.id} className="flex gap-3">
                              <Avatar>
                                  <AvatarImage asChild src={authorDetails.avatar} alt={update.author} >
                                      <Image src={authorDetails.avatar ?? ''} alt={update.author} width={40} height={40} data-ai-hint="person face" />
                                  </AvatarImage>
                                  <AvatarFallback>{update.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                      <p className="font-semibold">{update.author}</p>

                                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{update.content}</p>
                              </div>
                          </div>
                      )
                  }) : (
                      <p className="text-sm text-center text-muted-foreground py-4">No progress updates yet.</p>
                  )}
                  </div>
              </ScrollArea>
            </div>
            {(isLead || isManager) && (
                <div className="flex flex-col gap-2">
                    <Textarea placeholder={`Add a progress update as ${currentUser.name}...`} />
                    <Button className="self-end bg-accent hover:bg-accent/90">Post Update</Button>
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          {isManager && <Button variant="destructive">Delete Task</Button>}
          {isManager && <Button onClick={() => onEdit(task)}>Edit Task</Button>}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
