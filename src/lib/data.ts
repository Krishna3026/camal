import { collection, getDocs, Firestore } from "firebase/firestore";
import { db } from "./firebase";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'review';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // User ID
  collaborators?: string[]; // User IDs of team members collaborating on the task
  dueDate: string;
  progress: number;
  updates: {
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }[];
  client?: string;
  createdBy: string; // User ID
  createdAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: 'Team Lead' | 'Developer' | 'Designer';
  team: string;
  avatar: string;
  email: string;
  phone?: string;
  tasksCompleted: number;
  tasksInProgress: number;
  project?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'lead';
  avatar: string;
  phone?: string;
};


// Mock Data (will be used as a fallback or for initial setup)
export const users_mock: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'manager@taskflow.com', role: 'manager', avatar: 'https://placehold.co/100x100', phone: '+1-202-555-0176' },
  { id: '2', name: 'Samantha Lee', email: 'lead@taskflow.com', role: 'lead', avatar: 'https://placehold.co/100x100', phone: '+1-202-555-0182' },
];

export const teamMembers_mock: TeamMember[] = [
  { id: '2', name: 'Samantha Lee', role: 'Team Lead', team: 'Frontend', avatar: 'https://placehold.co/100x100', email: 'samantha.l@example.com', phone: '+1-202-555-0182', tasksCompleted: 15, tasksInProgress: 3, project: 'Project Phoenix' },
  { id: '3', name: 'David Chen', role: 'Developer', team: 'Frontend', avatar: 'https://placehold.co/100x100', email: 'david.c@example.com', tasksCompleted: 12, tasksInProgress: 2 },
  { id: '4', name: 'Maria Garcia', role: 'Designer', team: 'Design', avatar: 'https://placehold.co/100x100', email: 'maria.g@example.com', tasksCompleted: 20, tasksInProgress: 1 },
  { id: '5', name: 'Kenji Tanaka', role: 'Developer', team: 'Backend', avatar: 'https://placehold.co/100x100', email: 'kenji.t@example.com', tasksCompleted: 18, tasksInProgress: 4 },
];

export const tasks_mock: Task[] = [
  {
    id: 'TASK-1',
    title: 'Develop Landing Page Animation',
    description: 'Implement the 3D hero animation for the main landing page using spline.',
    status: 'in-progress',
    priority: 'high',
    assignedTo: '2',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 75,
    updates: [
      { id: 'U1', author: 'Samantha Lee', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), content: 'Initial setup and asset integration complete.' },
      { id: 'U2', author: 'Samantha Lee', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), content: 'Animation timeline is 50% done. Facing some issues with easing functions.' }
    ],
    client: "Innovate Inc.",
    createdBy: '1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TASK-2',
    title: 'API Integration for User Profile',
    description: 'Connect the frontend profile page with the backend user endpoints.',
    status: 'done',
    priority: 'high',
    assignedTo: '5',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    updates: [],
    client: "Tech Solutions",
    createdBy: '1',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TASK-3',
    title: 'Design New Dashboard Icons',
    description: 'Create a new set of 3D-style icons for the dashboard widgets.',
    status: 'review',
    priority: 'medium',
    assignedTo: '4',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    updates: [],
    client: "Innovate Inc.",
    createdBy: '2',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TASK-4',
    title: 'Refactor Authentication Module',
    description: 'Update the authentication flow to use the new security protocols.',
    status: 'todo',
    priority: 'medium',
    assignedTo: '3',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 10,
    updates: [],
    createdBy: '2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TASK-5',
    title: 'Setup Staging Environment',
    description: 'Configure the new staging server and deploy the latest build.',
    status: 'in-progress',
    priority: 'low',
    assignedTo: '5',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 40,
    updates: [],
    client: "Tech Solutions",
    createdBy: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];


// Firestore data fetching functions
function isFirestoreInitialized(db: any): db is Firestore {
    return typeof db.collection === 'function';
}

async function getCollectionData<T>(collectionName: string, fallbackData: T[]): Promise<T[]> {
  if (!isFirestoreInitialized(db)) {
    console.warn(`Firestore is not initialized. Using mock data for ${collectionName}.`);
    return fallbackData;
  }
  
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.warn(`No documents found in ${collectionName} collection. Using mock data.`);
      return fallbackData;
    }
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    console.warn(`Falling back to mock data for ${collectionName}.`);
    return fallbackData;
  }
}

export const getUsers = () => getCollectionData<User>('users', users_mock);
export const getTeamMembers = () => getCollectionData<TeamMember>('teamMembers', teamMembers_mock);
export const getTasks = () => getCollectionData<Task>('tasks', tasks_mock);

// Re-exporting mock data for components that might still use it directly during transition
export const users = users_mock;
export const teamMembers = teamMembers_mock;
export const tasks = tasks_mock;
