
"use client"

import { useAuth } from "@/context/auth-context"
import { teamMembers, users, type TeamMember, type User } from "@/lib/data"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, Mail, Phone, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import React from "react"

export default function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { user: currentUser, loading } = useAuth()
    const { toast } = useToast()

    const person = [...users, ...teamMembers].find(p => p.id === id)

    const [name, setName] = React.useState(person?.name || "")
    const [phone, setPhone] = React.useState((person as any).phone || "")
    const [avatar, setAvatar] = React.useState(person?.avatar || "")

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-background"><div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div></div>
    }
    
    if (!person) {
        notFound();
    }
    
    const canEdit = currentUser?.id === person.id || (currentUser?.role === 'manager');
    
    const handleSave = () => {
        // Here you would typically call an API to save the changes.
        // For this demo, we'll just show a toast.
        toast({
            title: "Profile Saved",
            description: `${name}'s profile has been updated.`,
        })
    }

    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-primary/20">
                                <AvatarImage src={avatar} alt={name} />
                                <AvatarFallback className="text-3xl">{name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="space-y-1">
                             <CardTitle className="font-headline text-3xl">{name}</CardTitle>
                             <CardDescription className="text-base">{person.email}</CardDescription>
                             <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground pt-1">
                                <Briefcase className="h-4 w-4" />
                                <span>{(person as any).role}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Contact Number</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1 234 567 890" disabled={!canEdit} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/image.png" disabled={!canEdit} />
                    </div>
                </CardContent>
                {canEdit && (
                    <CardFooter>
                        <Button onClick={handleSave} className="ml-auto bg-accent hover:bg-accent/90">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
