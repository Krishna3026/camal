
"use client"
import { PlusCircle, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemberCard } from "@/components/team/member-card"
import { getTasks, getTeamMembers, type Task, type TeamMember } from "@/lib/data"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useRouter } from "next/navigation"

export default function TeamPage() {
    const { user } = useAuth()
    const [openLeads, setOpenLeads] = useState<string[]>([])
    const router = useRouter();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);

    useEffect(() => {
        async function loadData() {
            const [members, tasks] = await Promise.all([getTeamMembers(), getTasks()]);
            setTeamMembers(members);
            setAllTasks(tasks);
        }
        loadData();
    }, []);

    if (!user) return null;

    const isManager = user.role === 'manager';
    const teamLeads = teamMembers.filter(member => member.role === 'Team Lead');

    const toggleLead = (id: string) => {
        setOpenLeads(prev => prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]);
    }
    
    const handleLeadClick = (leadId: string) => {
        router.push(`/dashboard/profile/${leadId}`);
    }

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Team Management
                    </h2>
                    <p className="text-muted-foreground">
                        Oversee your team leads and members.
                    </p>
                </div>
                {isManager && (
                    <div className="flex items-center space-x-2">
                        <Button className="bg-accent hover:bg-accent/90">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </div>
                )}
            </div>

            {isManager && (
                <div>
                    <h3 className="text-2xl font-bold tracking-tight font-headline mb-4">Team Leads Overview</h3>
                    <div className="space-y-4">
                        {teamLeads.map((lead) => {
                            const leadTasks = allTasks.filter(task => task.assignedTo === lead.id || task.collaborators?.includes(lead.id));
                            const isOpen = openLeads.includes(lead.id);
                            return (
                                <Collapsible key={lead.id} open={isOpen} onOpenChange={() => toggleLead(lead.id)} asChild>
                                    <Card>
                                        <div className="flex items-center justify-between pr-4 hover:bg-muted/50 w-full">
                                            <CollapsibleTrigger asChild className="flex-grow cursor-pointer text-left">
                                                <div className="flex items-center p-4">
                                                    <Avatar className="h-12 w-12 mr-4">
                                                        <AvatarImage asChild src={lead.avatar} alt={lead.name}>
                                                            <Image src={lead.avatar} alt={lead.name} width={48} height={48} data-ai-hint="person face" />
                                                        </AvatarImage>
                                                        <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <CardTitle className="font-headline text-xl">{lead.name}</CardTitle>
                                                        {lead.project && (
                                                            <p className="flex items-center text-muted-foreground"><Briefcase className="mr-2 h-4 w-4" />{lead.project}</p>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="ml-auto">
                                                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        <span className="sr-only">Toggle</span>
                                                    </Button>
                                                </div>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent>
                                            <CardContent>
                                                <h4 className="font-semibold mb-2">Projects & Deadlines:</h4>
                                                <div className="overflow-x-auto">
                                                  <Table>
                                                      <TableHeader>
                                                          <TableRow>
                                                              <TableHead>Task</TableHead>
                                                              <TableHead>Client</TableHead>
                                                              <TableHead>Deadline</TableHead>
                                                              <TableHead>Status</TableHead>
                                                          </TableRow>
                                                      </TableHeader>
                                                      <TableBody>
                                                          {leadTasks.map(task => (
                                                              <TableRow key={task.id} onClick={() => handleLeadClick(lead.id)} className="cursor-pointer">
                                                                  <TableCell className="font-medium">{task.title}</TableCell>
                                                                  <TableCell>{task.client || 'N/A'}</TableCell>
                                                                  <TableCell>{format(new Date(task.dueDate), "MMM dd, yyyy")}</TableCell>
                                                                  <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                                                              </TableRow>
                                                          ))}
                                                      </TableBody>
                                                  </Table>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )
                        })}
                    </div>
                </div>
            )}

            <div>
                 <h3 className="text-2xl font-bold tracking-tight font-headline my-4">Team Directory</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teamMembers.map((member) => (
                        <MemberCard key={member.id} member={member} isManager={isManager} />
                    ))}
                </div>
            </div>
        </div>
    )
}
