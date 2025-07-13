import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-2 text-3xl font-headline font-bold text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                    <path d="M4.5 15.5L3 21"></path>
                    <path d="M19.5 15.5L21 21"></path>
                    <path d="M13 8.5c0-2.5-1.5-4-3.5-4s-3.5 1.5-3.5 4"></path>
                    <path d="M12.5 11.5L14 15.5H5L6.5 11.5Z"></path>
                    <path d="M18 11.5c0-2.5-1.5-4-3.5-4"></path>
                    <path d="M17.5 11.5L19 15.5"></path>
                </svg>
                <span>Camal</span>
            </div>
            <p className="text-muted-foreground">Welcome back! Please sign in to your account.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
