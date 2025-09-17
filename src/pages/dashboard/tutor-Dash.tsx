import { AppSidebar }from "@/components/app-sidebar"

export default function TutorDashboard() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar/>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Learner Dashboard</h1>
        <p className="text-muted-foreground">Manage your classes, students, and resources here.</p>
      </main>
    </div>
  )
}
