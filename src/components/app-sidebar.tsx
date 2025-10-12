import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogOut, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Link } from "react-router-dom"
import { useCurrentMatch } from "@/hooks/useCurrentMatch"; // import the hook
import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
let data = {
  navMain: [
    {
      title: "Profile",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Account Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Classes",
      url: "course-page",
      items: [
        {
          title: "Math",
          url: "/tutor-dashboard/courses/math/:id",
        },
        {
          title: "Science",
          url: "#",
          isActive: true,
        },
        {
          title: "English",
          url: "#",
        },
        {
          title: "Filipino",
          url: "#",
        },
        {
          title: "Title 1",
          url: "#",
        },
        {
          title: "Title 2",
          url: "#",
        },
      ],
    },
    {
      title: "Meetings",
      url: "#",
      items: [
        {
          title: "Schedule",
          url: "#",
        },
        {
          title: "Join",
          url: "/join/:matchId",
        },
        {
          title: "History",
          url: "#",
        },
        {
          title: "Title 1",
          url: "learner-dashboard/chats",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "Customize",
          url: "#",
        },
        {
          title: "Themes",
          url: "#",
        },
        {
          title: "Update",
          url: "#",
        },
        {
          title: "About",
          url: "#",
        },
        {
          title: "Title 1",
          url: "#",
        },
      ],
    },
    {
      title: "Meet and Match",
      url: "/matchmaking",
      items: [
        {
          title: "Find a Tutor/Tutee",
          url: "/matchmaking",
        },
      ],
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const matchId = useCurrentMatch(); // get current matchId dynamically

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    else window.location.href = "/";
  };

  // override the Join URL dynamically
  const navMain = data.navMain.map((section) => {
    if (section.title === "Meetings") {
      return {
        ...section,
        items: section.items.map((item) => {
          if (item.title === "Join") {
            return { ...item, url: matchId ? `/join/${matchId}` : "#" };
          }
          return item;
        }),
      };
    }
    return section;
  });

  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Mentorae</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>

      {/* Main Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={subItem.isActive}
                            >
                              <Link
                                to={subItem.url}
                                className="rounded bg-secondary px-4 py-2 hover:bg-secondary/80"
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
      <div className="mt-auto p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
