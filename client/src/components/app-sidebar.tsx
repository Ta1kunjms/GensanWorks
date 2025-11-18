import { Home, Users, Briefcase, FileText, GitMerge, BarChart3, Calendar, GraduationCap, Settings, HelpCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Home", url: "/", icon: Home, testId: "nav-home" },
  { title: "Applicants", url: "/applicants", icon: Users, testId: "nav-applicants" },
  { title: "Employers", url: "/employers", icon: Briefcase, testId: "nav-employers" },
  { title: "Jobs", url: "/jobs", icon: FileText, testId: "nav-jobs" },
  { title: "Matching", url: "/matching", icon: GitMerge, testId: "nav-matching" },
  { title: "Reports", url: "/reports", icon: BarChart3, testId: "nav-reports" },
  { title: "Events", url: "/events", icon: Calendar, testId: "nav-events" },
  { title: "Programs", url: "/programs", icon: GraduationCap, testId: "nav-programs" },
];

const bottomMenuItems = [
  { title: "Settings", url: "/settings", icon: Settings, testId: "nav-settings" },
  { title: "Help", url: "/help", icon: HelpCircle, testId: "nav-help" },
  { title: "Logout", url: "/logout", icon: LogOut, testId: "nav-logout" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarContent className="gap-0">
        <SidebarGroup className="py-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={item.testId}
                      className="h-11"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-sidebar-border" />

        <SidebarGroup className="mt-auto py-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={item.testId}
                      className="h-11"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3" data-testid="user-profile">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Tycoon James Flores" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              TF
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-sidebar-foreground truncate" data-testid="user-name">
              Tycoon James Flores
            </span>
            <span className="text-xs text-sidebar-foreground/70 truncate" data-testid="user-role">
              Admin
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
