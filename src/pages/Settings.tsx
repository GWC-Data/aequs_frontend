import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TestTube, Upload, TrendingUp, Search, Clock, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const stats = {
    totalProducts: 5,
    underTesting: 1,
    completed: 1,
    scheduled: 1
  };

  const allProducts = [
    {
      id: "PROD-2025-001",
      batch: "Batch 2025 Q1 v.22",
      owner: "Assembly Line 1",
      qqc: "2025-05-25 09:00",
      cmr: "2025-05-15 10:35",
      testProgress: { completed: 2, total: 5 },
      status: "Under Testing",
      statusColor: "bg-blue-800"
    },
    {
      id: "PROD-2025-002",
      batch: "Batch 2025 Q1 v.23",
      owner: "Assembly Line 1",
      qqc: "2025-05-25 10:00",
      cmr: "2025-05-15 10:45",
      testProgress: { completed: 5, total: 5 },
      status: "Complete",
      statusColor: "bg-green-800"
    },
    {
      id: "PROD-2025-003",
      batch: "",
      owner: "Assembly Line 1",
      qqc: "2025-05-25 10:00",
      cmr: "2025-05-16 08:30",
      testProgress: { completed: 0, total: 5 },
      status: "Scheduled",
      statusColor: "bg-orange-800"
    },
    {
      id: "PROD-2025-004",
      batch: "Batch 2025 Q1 v.25",
      owner: "Assembly Line 2",
      qqc: "",
      cmr: "2025-05-15 12:35",
      testProgress: { completed: 0, total: 5 },
      status: "In Queue",
      statusColor: "bg-black"
    },
    {
      id: "PROD-2025-005",
      batch: "Batch 2025 Q1 v.26",
      owner: "Assembly Line 2",
      qqc: "2025-05-28 08:00",
      cmr: "2025-05-15 14:30",
      testProgress: { completed: 5, total: 5 },
      status: "Complete",
      statusColor: "bg-green-800"
    }
  ];

  const activeTests = [
    { name: "Salt Spray", status: "not done", statusColor: "bg-gray-700" },
    { name: "Thermal Cycle", status: "warning", statusColor: "bg-[#e0413a] " },
    { name: "Drop Test", status: "complete", statusColor: "bg-blue-800" },
    { name: "Push/Pull", status: "not done", statusColor: "bg-green-800" },
    { name: "Torque Test", status: "2h", statusColor: "bg-gray-700" }
  ];

  const systemStatus = [
    { name: "Database", status: "Active", statusColor: "bg-green-800" },
    { name: "Test Equipment", status: "Active", statusColor: "bg-green-800" },
    { name: "Image Upload", status: "Active", statusColor: "bg-green-800" },
    { name: "Last Sync", status: "2 min ago", statusColor: "bg-gray-800" }
  ];

  const rightSideMenuItems = [
    { title: "Machine details", subtitle: "Equipment Details", subtitle2: "Calibration details", subtitle3: "AMC details" },
    { title: "Chemicals", subtitle: "and stock details" },
    { title: "Fixture details" },
    { title: "Machine availability" },
    { title: "Daily check points" }
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = searchQuery === "" ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "testing" && product.status === "Under Testing") ||
      (statusFilter === "complete" && product.status === "Complete") ||
      (statusFilter === "scheduled" && product.status === "Scheduled") ||
      (statusFilter === "inqueue" && product.status === "In Queue");

    return matchesSearch && matchesStatus;
  });

  const handleQuickAction = (action: string) => {
    alert(`${action} clicked! This would open the respective module.`);
  };

  const handleRightMenuClick = (title: string) => {
    alert(`Navigating to ${title}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">ORT Digitalization Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time product testing and quality control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, color: "blue", title: "Total Products", value: stats.totalProducts, sub: "+10% vs last month" },
                { icon: TestTube, color: "purple", title: "Under Testing", value: stats.underTesting, action: "testing" },
                { icon: CheckCircle2, color: "green", title: "Completed", value: stats.completed, action: "complete" },
                { icon: Clock, color: "orange", title: "Scheduled", value: stats.scheduled, action: "scheduled" },
              ].map((item, i) => (
                <Card
                  key={i}
                  onClick={item.action ? () => setStatusFilter(item.action) : undefined}
                  className={`border-t-4 border-t-${item.color}-500 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <item.icon className="h-4 w-4" /> {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{item.value}</div>
                    {item.sub && <p className="text-xs text-green-600 mt-1">{item.sub}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <Card className="shadow-sm rounded-xl">
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by Product ID, Batch, or Owner..."
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px] border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="testing">Under Testing</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="inqueue">In Queue</SelectItem>
                      </SelectContent>
                    </Select>
                    {(searchQuery || statusFilter !== "all") && (
                      <Button variant="outline" className="hover:bg-gray-100" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                {/* {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500 mt-4 italic">No products found matching your criteria</div>
                ) : (
                  <div className="text-sm text-gray-600 mt-2">Showing {filteredProducts.length} of {allProducts.length} products</div>
                )} */}
              </CardContent>
            </Card>

            {/* Active Products */}
            <Card className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Active Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{product.id}</h3>
                          <p className="text-sm text-gray-600">{product.batch || "No batch assigned"}</p>
                        </div>
                        <Badge className={`${product.statusColor} text-white text-xs px-3 py-1`}>{product.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                        <div><span className="text-gray-500">👤 Owner:</span> <span className="font-medium">{product.owner}</span></div>
                        <div><span className="text-gray-500">📅 QQC:</span> <span>{product.qqc || "N/A"}</span></div>
                        <div><span className="text-gray-500">🕐 CMR:</span> <span>{product.cmr}</span></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-gray-700">
                          <span>Test Progress</span>
                          <span className="font-medium">{product.testProgress.completed}/{product.testProgress.total} Tests</span>
                        </div>
                        <Progress value={(product.testProgress.completed / product.testProgress.total) * 100} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Tests + Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Active Tests Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeTests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition">
                        <span className="text-sm font-medium text-gray-700">{test.name}</span>
                        <Badge className={`${test.statusColor} text-white text-xs px-3`}>{test.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-gray-800">⚡ Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg" onClick={() => navigate(`/qrtchecklist`)}>
                    New Product Check-in
                  </Button>
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-lg" onClick={() => navigate(`/oqcpage`)}>
                    Start New Test
                  </Button>
                  <Button className="w-full bg-gray-500 text-white hover:bg-gray-600 rounded-lg" onClick={() => navigate(`/`)}>
                    View Test Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-gray-800">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {systemStatus.map((item, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                      <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                      <Badge className={`${item.statusColor} text-white px-3 py-1 text-xs`}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {rightSideMenuItems.map((item, index) => (
              <Card
                key={index}
                onClick={() => handleRightMenuClick(item.title)}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#e0413a] bg-white rounded-xl"
              >
                <CardContent className="p-4 space-y-1">
                  <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
                  {item.subtitle && <p className="text-xs text-gray-600">{item.subtitle}</p>}
                  {item.subtitle2 && <p className="text-xs text-gray-600">{item.subtitle2}</p>}
                  {item.subtitle3 && <p className="text-xs text-gray-600">{item.subtitle3}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
