import { AppSidebar }from "@/components/app-sidebar"

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function LearnerDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-2xl font-bold">Learner Dashboard</h1>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-6 p-6">
          <p className="text-muted-foreground">
            Welcome back! Here are your courses and progress.
          </p>

          {/* Example course/progress cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>

          <div className="bg-muted/50 flex-1 rounded-xl min-h-[200px]" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
