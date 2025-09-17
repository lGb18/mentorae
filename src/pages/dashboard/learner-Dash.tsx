import { AppSidebar }from "@/components/app-sidebar"

export default function LearnerDashboard() {
  return (
    
    <div className="flex min-h-screen">
      
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Learner Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here are your courses and progress.</p>
        <AppSidebar/>
      </main>
    </div>
  )
}
