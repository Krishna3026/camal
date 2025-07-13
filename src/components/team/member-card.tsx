"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TeamMember } from "@/lib/data"
import { CheckCircle, Edit, MoreVertical, Trash2, Mail, Briefcase, Users } from "lucide-react"
import Image from "next/image"

type MemberCardProps = {
  member: TeamMember;
  isManager: boolean;
};

export function MemberCard({ member, isManager }: MemberCardProps) {
  return (
     <div className="[perspective:1000px] group">
        <Card className="transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl group-hover:[transform:rotateX(2deg)_rotateY(-2deg)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium font-headline">{member.name}</CardTitle>
                {isManager && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage asChild src={member.avatar} alt={member.name} >
                            <Image src={member.avatar} alt={member.name} width={64} height={64} data-ai-hint="person face" />
                        </AvatarImage>
                        <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{member.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{member.team} Team</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{member.tasksCompleted} Completed</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-dashed border-blue-500"></div>
                    <span>{member.tasksInProgress} In Progress</span>
                </div>
            </CardFooter>
        </Card>
     </div>
  )
}
