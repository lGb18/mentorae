import CoursePage from "@/components/course-page"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function FilipinoSubject() {
  return (
  
    <SidebarInset className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-2xl font-bold">Filipino</h1>
      </header>

      {/* Main area for course/editor */}
      <main className="flex-1 overflow-auto p-6">
        <CoursePage subject="filipino" />
      </main>
    </SidebarInset>
  )
}
