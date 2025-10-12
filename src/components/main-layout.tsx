// MainLayout.tsx
import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar"; // <-- import provider

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}

