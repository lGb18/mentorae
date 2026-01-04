import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar className="flex-shrink-0 w-64 min-w-0" />

        {/* Main content */}
        <main className="flex-1 flex justify-center items-start p-4 overflow-auto min-w-0">
          <div className="w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}



