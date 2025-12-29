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
import Author from "./pages/Author";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Stage2FormPage from "./pages/Stage2FormPage";
import DefaultForm from '@/components/DefaultForm'
import Stage2DetailRecords from "./pages/Stage2DetailsPage";
import PlanningModule from "./pages/PlanningPage"
import ORTLabDetailsPage from "./pages/ORTLabDetailPage";
import ORTLabPage from "./pages/ORTLabPage";
import BarcodeScannerPage from "./pages/BarcodeScannerPage";
import TicketAssignmentsTable from "./pages/TicketAssignmentsTable";
import QrtCheckList from "./pages/QrtCheckList";
import ReportDashboard from "./pages/ReportDashboard";
import Home from "./pages/Home";

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
                  {/* <Route path="/" element={<Index />} /> */}
                  <Route path="/oqcpage" element={<OqcformPage />} />
                  <Route path="/barcode-scanner" element={<BarcodeScannerPage />} />
                  <Route path="/tickets" element={<TicketAssignmentsTable />} />
                  <Route path="/author" element={<Author />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/stage2-form" element={<Stage2FormPage />} />
                  <Route path="/stage2" element={<Stage2DetailRecords />} />
                  <Route path="/qrtchecklist" element={<QrtCheckList />} />
                  <Route path="/form-default" element={<DefaultForm />} />
                  <Route path="/planning-detail" element={<PlanningModule />} />
                  <Route path="/ort-lab-details" element={<ORTLabDetailsPage />} />
                  <Route path="/ort-lab-form" element={<ORTLabPage />} />
                  <Route path="/report-dashboard" element={<ReportDashboard />} />
                  <Route path="/home-page" element={<Home/>}/>
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