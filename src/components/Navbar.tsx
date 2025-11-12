import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4  relative ">

            {/* For small screens (< md) */}
      <div className="block md:hidden">
        <SidebarTrigger className="" />
      </div>

        {/* For medium and above (≥ md) */}
        <div className="hidden md:flex border p-2 rounded-full absolute left-[-24px] bg-white hover:bg-[#e0413a] hover:text-white">
          <SidebarTrigger className="" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Add additional navbar items here */}
          </div>
        </div>
      </div>
    </header>
  );
}
