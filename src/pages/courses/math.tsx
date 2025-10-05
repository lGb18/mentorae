import CoursePage from "@/components/course-page"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function MathSubject() {
  return (
    <SidebarProvider>
      {/* 🔹 Flex container for sidebar + content */}
      <div className="flex h-screen">
        {/* 🔹 Sidebar with explicit width */}
        <AppSidebar className="w-64" />

        {/* 🔹 Main content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Math Subject</h1>
          </header>

          {/* Main area for course/editor */}
          <main className="flex-1 overflow-auto p-6">
            <CoursePage subject="Math" />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}



 {/* // (
  //   <div className="p-6">
  //     <h1 className="text-2xl font-bold mb-4">Math - Grade 2</h1>
  //     <p className="text-muted-foreground mb-6">
  //       Here are your lessons and materials for Math in Grade 2.
  //     </p>

  //     <div className="grid gap-4 md:grid-cols-3">
  //       <div className="rounded-lg border p-4 bg-muted/30">Lesson 1 Placeholder</div>
  //       <div className="rounded-lg border p-4 bg-muted/30">Lesson 2 Placeholder</div>
  //       <div className="rounded-lg border p-4 bg-muted/30">Lesson 3 Placeholder</div>
  //     </div>
  //   </div>
  // ) */}