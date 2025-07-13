

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TeamMember, Task, User } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "../ui/badge"
import React from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  assignedTo: z.string().min(1, "Please assign the task to a team member"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date({ required_error: "A due date is required." }),
  status: z.enum(["todo", "in-progress", "review", "done"]),
  collaborators: z.array(z.string()).optional(),
  client: z.string().optional(),
  isCompleted: z.boolean().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type TaskFormDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  teamMembers: TeamMember[]
  onTaskSubmit: (task: Omit<Task, 'id' | 'updates' | 'progress'>, taskId?: string) => void
  currentUser: User;
  taskToEdit?: Task | null;
}

export function TaskFormDialog({ isOpen, onOpenChange, teamMembers, onTaskSubmit, currentUser, taskToEdit }: TaskFormDialogProps) {
  const { toast } = useToast()
  const isLead = currentUser.role === 'lead';
  const isEditing = !!taskToEdit;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  })

  React.useEffect(() => {
    if (taskToEdit) {
      form.reset({
        ...taskToEdit,
        dueDate: new Date(taskToEdit.dueDate),
        isCompleted: taskToEdit.status === 'done',
      });
    } else {
      form.reset({
        title: "",
        description: "",
        assignedTo: isLead ? currentUser.id : undefined,
        priority: "medium",
        status: "todo",
        collaborators: [],
        client: "",
        dueDate: undefined,
        isCompleted: false,
      });
    }
  }, [taskToEdit, form, isLead, currentUser.id]);
  
  const isCompleted = form.watch("isCompleted");

  React.useEffect(() => {
    if (isCompleted) {
        form.setValue("status", "done");
    } else {
        // if user un-checks, set it back to a sensible default, but only if it was 'done'
        if (form.getValues("status") === 'done') {
            form.setValue("status", "in-progress");
        }
    }
  }, [isCompleted, form]);

  const onSubmit = (data: TaskFormValues) => {
    const { isCompleted, ...restOfData } = data;
    const taskData = { 
      ...restOfData, 
      dueDate: data.dueDate.toISOString(),
      createdBy: taskToEdit?.createdBy || currentUser.id,
      createdAt: taskToEdit?.createdAt || new Date().toISOString(),
    };
    onTaskSubmit(taskData, taskToEdit?.id);
    
    toast({
      title: isEditing ? "Task Updated" : "Task Created",
      description: `"${data.title}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
    })
    
    onOpenChange(false)
  }

  const collaborators = form.watch("collaborators") || [];
  const assignedTo = form.watch("assignedTo");

  const availableMembers = teamMembers.filter(m => 
      !collaborators.includes(m.id) && 
      (isLead ? m.id !== currentUser.id : m.id !== assignedTo)
  );

  const addCollaborator = (memberId: string) => {
    if (!collaborators.includes(memberId)) {
        form.setValue("collaborators", [...collaborators, memberId]);
    }
  }

  const removeCollaborator = (memberId: string) => {
    form.setValue("collaborators", collaborators.filter(id => id !== memberId));
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of the task below.' : 'Fill in the details below to create a new task for your team.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} id="task-form" className="space-y-4 py-4">
                  <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., Design new login page" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                          <Textarea
                          placeholder="Provide a detailed description of the task..."
                          {...field}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  
                  {isLead ? (
                      <FormField
                          control={form.control}
                          name="collaborators"
                          render={() => (
                          <FormItem>
                              <FormLabel>Add Collaborators</FormLabel>
                              <Select onValueChange={(value) => addCollaborator(value)}>
                                  <FormControl>
                                      <SelectTrigger>
                                      <SelectValue placeholder="Select team members to add..." />
                                      </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {availableMembers.map((member) => (
                                      <SelectItem key={member.id} value={member.id}>
                                          {member.name}
                                      </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 pt-2">
                                  {collaborators.map(id => {
                                      const member = teamMembers.find(m => m.id === id);
                                      return member ? (
                                          <Badge key={id} variant="secondary" className="pl-2 pr-1">
                                              {member.name}
                                              <button type="button" onClick={() => removeCollaborator(id)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                                                  <X className="h-3 w-3" />
                                              </button>
                                          </Badge>
                                      ) : null
                                  })}
                              </div>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  ) : (
                      <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Assign To</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                  <SelectTrigger>
                                  <SelectValue placeholder="Select a team member" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                  </SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                  />
                  )}
                  
                  <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Client (Optional)</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., Innovate Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />


                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                              <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant={"outline"}
                                  className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                  )}
                                  >
                                  {field.value ? (
                                      format(field.value, "PPP")
                                  ) : (
                                      <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                              </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  initialFocus
                              />
                              </PopoverContent>
                          </Popover>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={isCompleted}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="todo">To Do</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="review">Review</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </div>
                  
                  <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                          <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                          <FormLabel>
                          Mark as Completed
                          </FormLabel>
                          <FormDescription>
                          This will set the task status to "Done".
                          </FormDescription>
                      </div>
                      </FormItem>
                  )}
                  />
              </form>
            </Form>
        </div>
        <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
            </Button>
            <Button type="submit" form="task-form" className="bg-accent hover:bg-accent/90">{isEditing ? 'Save Changes' : 'Create Task'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
