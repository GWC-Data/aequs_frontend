import { Home, List, LogOut, Check, PenTool, Settings, Gauge, Flag, FlaskConical } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import Logo from '../assets/logo.png';
import SmallLogo from '../assets/small_logo.png'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "OQC Form", url: "/oqcpage", icon: List },
  { title: "ORT Check List", url: "/qrtchecklist", icon: Check },
  { title: "Stage 2 Form", url: "/stage2-form", icon: PenTool },
  { title: "Stage 2", url: "/stage2", icon: Flag },
 // { title: "Testing Dynamic", url: "/author", icon: FlaskConical },
  { title: "Testing", url: "/form-default", icon: Settings },
  { title: "ORT Dashboard", url: "/settings", icon: Gauge },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;


  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="px-4 py-2">
          <h1 className={`font-bold transition-all duration-300 ${open ? 'text-2xl' : 'text-lg'}`}>
            {open ? <img src={Logo} alt="" className="w-48 h-20" /> : <img src={SmallLogo} alt="" className="w-20 h-8 object-full" />}
          </h1>

        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-300 ${isActive(item.url)
                      ? 'bg-[#e0413a] text-white hover:bg-[#e0413a] hover:text-white font-semibold'
                      : 'hover:bg-[#e0413a] hover:text-white'
                      }`}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-20 w-20" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-[#e0413a] hover:text-destructive-foreground transition-all duration-300 hover:text-white"
              onClick={() => console.log('Logout clicked')}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
