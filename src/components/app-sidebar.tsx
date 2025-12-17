import * as React from "react";

import { Link } from "react-router-dom";
import { Plus, Minus, LogOut, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SidebarUser from "./sidebar-user";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentMatch } from "@/hooks/useCurrentMatch";
import { useEffect, useState, useMemo, useCallback, useRef } from "react"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const matchId = useCurrentMatch()
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const isMounted = useRef(true)
  const hasFetchedSubjects = useRef(false)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch user and role
  useEffect(() => {
    let mounted = true
    
    async function fetchUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted && session?.user?.id) {
          setUserId(session.user.id)
          
          // Fetch role
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
          
          if (mounted && profileData) {
            setUserRole(profileData.role)
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    
    fetchUser()
    
    return () => {
      mounted = false
    }
  }, [])

  // Fetch subjects based on role
  useEffect(() => {
    if (!userId || !userRole || hasFetchedSubjects.current) return
    
    let mounted = true
    
    async function fetchSubjects() {
      try {
        let query
        
        if (userRole === "teacher") {
          // Teachers see their own subjects
          query = supabase
            .from("subjects")
            .select("id, name")
            .eq("tutor_id", userId)
        } else {
          // Students see subjects from matched tutors
          const { data: matches } = await supabase
            .from("matches")
            .select("tutor_id")
            .eq("student_id", userId)
            .eq("status", "active")
          
          if (!matches || matches.length === 0) {
            if (mounted) {
              setSubjects([])
              hasFetchedSubjects.current = true
            }
            return
          }
          
          const tutorIds = matches.map(m => m.tutor_id)
          query = supabase
            .from("subjects")
            .select("id, name")
            .in("tutor_id", tutorIds)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        if (mounted && data) {
          setSubjects(data)
          hasFetchedSubjects.current = true
        }
      } catch (error) {
        console.error("Error fetching subjects:", error)
      }
    }

    fetchSubjects()
    
    return () => {
      mounted = false
    }
  }, [userId, userRole])

  // Memoize navMain based on role
  const navMain = useMemo(() => {
    const baseNav = [
      {
        title: "Profile",
        url: "#",
        items: [
          { title: "Dashboard", url: "/my-profile", isActive: false },
          { title: "Account Settings", url: "/settings", isActive: false },
        ],
      },
      {
        title: "Meet and Match",
        url: "/matchmaking",
        items: [{ title: "Find a Match", url: "/matchmaking", isActive: false }],
      },
    ]

    const coursesNav = {
      title: "Courses",
      url: "#",
      items: [
        // Only show Create Subject for teachers
        ...(userRole === "teacher" ? [{
          title: "+ Create Subject",
          url: "/create-subject",
          isActive: false,
        }] : []),
        ...subjects.map((s) => ({
          title: s.name,
          url: `/courses/${s.name}/${s.id}`,
          isActive: false,
        })),
      ],
    }

    const meetingsNav = {
      title: "Meetings",
      url: "#",
      items: [
        { title: "Schedule", url: "/schedule", isActive: false },
        { title: "Join", url: matchId ? `/join/${matchId}` : "#", isActive: false },
        { title: "History", url: "/history", isActive: false },
        { title: "Chat Messages", url: "/chats", isActive: false },
      ],
    }

    const settingsNav = {
      title: "Settings",
      url: "#",
      items: [
        { title: "Preferences", url: "/preferences", isActive: false },
        { title: "About", url: "/about", isActive: false },
      ],
    }

    return [...baseNav, coursesNav, meetingsNav, settingsNav]
  }, [subjects, matchId, userRole])

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error.message)
    } else {
      window.location.href = "/"
    }
  }, [])

  if (isLoading) {
    return (
      <Sidebar {...props} className="bg-white border-r border-gray-200">
        <SidebarContent className="flex items-center justify-center h-full">
          <div className="text-sm text-gray-500">Loading...</div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar {...props} className="bg-white border-r border-gray-200">
      {/* Header */}
      <SidebarHeader className="px-3 py-3 border-b border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-gray-50 w-full pl-3 py-2 transition-colors">
              <a href="#" className="no-underline w-full flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-1 leading-none min-w-0">
                  <span className="font-semibold text-sm text-gray-900 truncate">Mentorae</span>
                  <span className="text-xs text-gray-500">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Nav */}
      <SidebarContent className="py-3 flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarGroup className="w-full">
          <SidebarMenu className="w-full pl-0">
            {navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible w-full"
              >
                <SidebarMenuItem className="w-full pl-0">
                  <CollapsibleTrigger asChild className="w-full">
                    <SidebarMenuButton className="py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full pl-3 pr-3 flex items-center gap-x-3 transition-colors rounded-md max-w-[14rem] truncate">
                      <span className="truncate flex-1 text-left">{item.title}</span>
                      <Plus className="ml-auto size-4 flex-shrink-0 group-data-[state=open]/collapsible:hidden transition-transform duration-200" />
                      <Minus className="ml-auto size-4 flex-shrink-0 group-data-[state=closed]/collapsible:hidden transition-transform duration-200" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {item.items?.length ? (
                    <CollapsibleContent className="w-full overflow-hidden transition-all duration-300 ease-out">
                      <SidebarMenuSub className="mt-1 w-full pl-0 overflow-hidden">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title} className="w-full pl-0">
                            <SidebarMenuSubButton
                              asChild
                              isActive={subItem.isActive}
                              className="text-sm w-full"
                            >
                              <Link
                                to={subItem.url}
                                className={`block py-2 px-3 rounded-md w-full truncate overflow-hidden whitespace-nowrap ${
                                  subItem.isActive
                                    ? "bg-gray-100 text-gray-900 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarUser />
      <div className="mt-auto border-t border-gray-100 w-full">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm font-normal py-2 px-3 h-auto flex items-center transition-colors rounded-md"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 size-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </Button>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}