"use client"
import * as React from "react"
import {
  CaretSortIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
    ArrowUpDown,
    ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTasks, getTeamMembers, getUsers, type Task, type TeamMember, type User } from "@/lib/data"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

const statusStyles: { [key: string]: string } = {
  todo: "bg-gray-400/10 text-gray-500",
  "in-progress": "bg-blue-400/10 text-blue-500",
  review: "bg-purple-400/10 text-purple-500",
  done: "bg-green-400/10 text-green-500",
}

const priorityStyles: { [key: string]: string } = {
  low: "border-green-500/80 bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "border-yellow-500/80 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  high: "border-red-500/80 bg-red-500/10 text-red-600 dark:text-red-400",
}

const getColumns = (teamMembers: TeamMember[], users: User[]): ColumnDef<Task>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "assignedTo",
    header: "Assignee",
    cell: ({ row }) => {
      const assigneeId = row.getValue("assignedTo") as string
      const assignee = teamMembers.find((m) => m.id === assigneeId)
      return assignee ? (
         <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{assignee.name}</span>
         </div>
      ) : 'N/A'
    },
  },
   {
    accessorKey: "createdBy",
    header: "Creator",
    cell: ({ row }) => {
      const creatorId = row.getValue("createdBy") as string;
      const creator = users.find((u) => u.id === creatorId) || teamMembers.find(u => u.id === creatorId)
      return creator ? (
         <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{creator.name}</span>
         </div>
      ) : 'N/A'
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant="outline" className={`${statusStyles[status]} capitalize`}>{status.replace('-', ' ')}</Badge>
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return <Badge variant="outline" className={`${priorityStyles[priority]} capitalize`}>{priority}</Badge>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Posted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM dd, yyyy"),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    cell: ({ row }) => format(new Date(row.getValue("dueDate")), "MMM dd, yyyy"),
  },
]

export default function TaskHistoryPage() {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [tasksData, teamMembersData, usersData] = await Promise.all([getTasks(), getTeamMembers(), getUsers()]);
        setAllTasks(tasksData);
        setTeamMembers(teamMembersData);
        setUsers(usersData);
        setLoading(false);
    }
    loadData();
  }, []);

  const columns = React.useMemo(() => getColumns(teamMembers, users), [teamMembers, users]);

  const table = useReactTable({
    data: allTasks,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
       pagination: {
           pageSize: 10,
       }
    }
  })

  React.useEffect(() => {
    table.getColumn("assignedTo")?.toggleVisibility(!isMobile);
    table.getColumn("createdBy")?.toggleVisibility(!isMobile);
    table.getColumn("createdAt")?.toggleVisibility(!isMobile);
  }, [isMobile, table]);

  return (
     <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    Task History
                </h2>
                <p className="text-muted-foreground">
                    A complete log of all tasks in the system.
                </p>
            </div>
        </div>
        <div className="w-full">
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            Loading data...
                        </TableCell>
                    </TableRow>
                ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No results.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of{" "}
            {allTasks.length} task(s).
            </div>
            <div className="space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
            </div>
        </div>
        </div>
    </div>
  )
}
