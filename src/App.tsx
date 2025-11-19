import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import OqcformPage from "./pages/OqcFormPage";
import QrtCheckList from "./pages/QrtCheckList";
import Author from "./pages/Author";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Stage2Form from "./pages/Stage2Form";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-hidden bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/oqcpage" element={<OqcformPage />} />
                  <Route path="/qrtchecklist" element={<QrtCheckList />} />
                  <Route path="/author" element={<Author />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/stage2" element={<Stage2Form />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;