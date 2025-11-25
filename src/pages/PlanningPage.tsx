import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, ChevronRight, AlertCircle, CheckCircle2, PlayCircle, Edit, Trash2, Plus, Eye, User, Shield } from "lucide-react";

const PlanningModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userMode, setUserMode] = useState<"admin" | "user">("admin"); // Toggle between admin and user
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  
  // Form state for creating/editing tests
  const [formData, setFormData] = useState({
    project: "",
    documentNumber: "",
    testName: "",
    equipment: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: "",
    priority: "Medium",
    status: "Scheduled",
    sampleQty: "",
    testLocation: "",
    testCondition: ""
  });

  // Sample data - in real app, this would come from localStorage or API
  const [upcomingTests, setUpcomingTests] = useState([
    {
      id: "TST-001",
      project: "Automotive Component A",
      documentNumber: "DOC-2024-001",
      testName: "Salt Spray Test",
      equipment: "Salt Spray Chamber #1",
      scheduledDate: "2024-11-25",
      scheduledTime: "09:00 AM",
      duration: "48 hours",
      priority: "High",
      status: "Scheduled",
      sampleQty: 5,
      testLocation: "Lab A",
      requiredQty: "3 samples",
      testCondition: "ASTM B117"
    },
    {
      id: "TST-002",
      project: "Electronics Module B",
      documentNumber: "DOC-2024-002",
      testName: "Thermal Cycle Test",
      equipment: "Thermal Chamber #2",
      scheduledDate: "2024-11-25",
      scheduledTime: "02:00 PM",
      duration: "24 hours",
      priority: "Medium",
      status: "Scheduled",
      sampleQty: 3,
      testLocation: "Lab B",
      requiredQty: "2 samples",
      testCondition: "-40°C to 85°C"
    },
    {
      id: "TST-003",
      project: "Connector System C",
      documentNumber: "DOC-2024-003",
      testName: "Drop Test",
      equipment: "Drop Test Machine",
      scheduledDate: "2024-11-26",
      scheduledTime: "10:00 AM",
      duration: "4 hours",
      priority: "High",
      status: "Pending Approval",
      sampleQty: 10,
      testLocation: "Lab A",
      requiredQty: "8 samples",
      testCondition: "1.5m height"
    },
    {
      id: "TST-004",
      project: "Automotive Component A",
      documentNumber: "DOC-2024-001",
      testName: "Vibration Test",
      equipment: "Vibration Shaker #1",
      scheduledDate: "2024-11-27",
      scheduledTime: "11:00 AM",
      duration: "6 hours",
      priority: "Medium",
      status: "Scheduled",
      sampleQty: 4,
      testLocation: "Lab C",
      requiredQty: "3 samples",
      testCondition: "10-2000 Hz"
    },
    {
      id: "TST-005",
      project: "Medical Device D",
      documentNumber: "DOC-2024-004",
      testName: "Torque Test",
      equipment: "Torque Tester #2",
      scheduledDate: "2024-11-28",
      scheduledTime: "09:30 AM",
      duration: "2 hours",
      priority: "Low",
      status: "Scheduled",
      sampleQty: 6,
      testLocation: "Lab B",
      requiredQty: "5 samples",
      testCondition: "5-50 Nm"
    },
    {
      id: "TST-006",
      project: "Electronics Module B",
      documentNumber: "DOC-2024-002",
      testName: "Push/Pull Test",
      equipment: "Universal Testing Machine",
      scheduledDate: "2024-11-29",
      scheduledTime: "01:00 PM",
      duration: "3 hours",
      priority: "High",
      status: "Ready to Start",
      sampleQty: 8,
      testLocation: "Lab A",
      requiredQty: "6 samples",
      testCondition: "50N max force"
    }
  ]);

  // Filter tests based on search and filters
  const filteredTests = upcomingTests.filter((test) => {
    const matchesSearch = searchQuery === "" ||
      test.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.equipment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "all" || test.priority.toLowerCase() === priorityFilter.toLowerCase();

    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && test.scheduledDate === "2024-11-25") ||
      (dateFilter === "tomorrow" && test.scheduledDate === "2024-11-26") ||
      (dateFilter === "week" && new Date(test.scheduledDate) <= new Date("2024-12-01"));

    return matchesSearch && matchesPriority && matchesDate;
  });

  // Calculate summary stats
  const stats = {
    totalScheduled: upcomingTests.filter(t => t.status === "Scheduled").length,
    highPriority: upcomingTests.filter(t => t.priority === "High").length,
    today: upcomingTests.filter(t => t.scheduledDate === "2024-11-25").length,
    thisWeek: upcomingTests.filter(t => new Date(t.scheduledDate) <= new Date("2024-12-01")).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-600";
      case "Ready to Start": return "bg-green-600";
      case "Pending Approval": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Scheduled": return <Clock className="h-3 w-3" />;
      case "Ready to Start": return <PlayCircle className="h-3 w-3" />;
      case "Pending Approval": return <AlertCircle className="h-3 w-3" />;
      default: return <CheckCircle2 className="h-3 w-3" />;
    }
  };

  // Admin functions
  const handleCreateTest = () => {
    if (!formData.project || !formData.testName || !formData.scheduledDate) {
      alert("Please fill in all required fields");
      return;
    }

    const newTest = {
      id: `TST-${String(upcomingTests.length + 1).padStart(3, '0')}`,
      ...formData,
      sampleQty: parseInt(formData.sampleQty) || 0
    };

    setUpcomingTests([...upcomingTests, newTest]);
    resetForm();
    setShowCreateModal(false);
    alert("Test created successfully!");
  };

  const handleUpdateTest = () => {
    if (!editingTest) return;

    const updatedTests = upcomingTests.map(test => 
      test.id === editingTest.id ? { ...editingTest, ...formData } : test
    );

    setUpcomingTests(updatedTests);
    resetForm();
    setEditingTest(null);
    alert("Test updated successfully!");
  };

  const handleDeleteTest = (testId: string) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setUpcomingTests(upcomingTests.filter(test => test.id !== testId));
      alert("Test deleted successfully!");
    }
  };

  const handleEditClick = (test: any) => {
    setEditingTest(test);
    setFormData({
      project: test.project,
      documentNumber: test.documentNumber,
      testName: test.testName,
      equipment: test.equipment,
      scheduledDate: test.scheduledDate,
      scheduledTime: test.scheduledTime,
      duration: test.duration,
      priority: test.priority,
      status: test.status,
      sampleQty: test.sampleQty.toString(),
      testLocation: test.testLocation,
      testCondition: test.testCondition
    });
  };

  const resetForm = () => {
    setFormData({
      project: "",
      documentNumber: "",
      testName: "",
      equipment: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: "",
      priority: "Medium",
      status: "Scheduled",
      sampleQty: "",
      testLocation: "",
      testCondition: ""
    });
    setEditingTest(null);
    setShowCreateModal(false);
  };

  const handleViewDetails = (test: any) => {
    alert(`Viewing details for: ${test.testName}\n\nProject: ${test.project}\nDocument: ${test.documentNumber}\nEquipment: ${test.equipment}\nScheduled: ${test.scheduledDate} at ${test.scheduledTime}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 space-y-6">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Testing Planning Module</h1>
            <p className="text-sm text-gray-500">View and manage upcoming testing schedules</p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
            <Button
              onClick={() => setUserMode("user")}
              className={`flex items-center gap-2 ${userMode === "user" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
              size="sm"
            >
              <User className="h-4 w-4" />
              User Mode
            </Button>
            <Button
              onClick={() => setUserMode("admin")}
              className={`flex items-center gap-2 ${userMode === "admin" ? "bg-red-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
              size="sm"
            >
              <Shield className="h-4 w-4" />
              Admin Mode
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, color: "blue", title: "Total Scheduled", value: stats.totalScheduled, sub: "tests planned" },
            { icon: AlertCircle, color: "red", title: "High Priority", value: stats.highPriority, sub: "urgent tests" },
            { icon: Clock, color: "green", title: "Today", value: stats.today, sub: "tests scheduled" },
            { icon: CheckCircle2, color: "purple", title: "This Week", value: stats.thisWeek, sub: "tests planned" },
          ].map((item, i) => (
            <Card key={i} className={`border-t-4 border-t-${item.color}-500 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <item.icon className="h-4 w-4" /> {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.value}</div>
                <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Admin Actions */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by project, test name, document number, or equipment..."
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-[150px] border-gray-300">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-[150px] border-gray-300">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery || priorityFilter !== "all" || dateFilter !== "all") && (
                  <Button 
                    variant="outline" 
                    className="hover:bg-gray-100" 
                    onClick={() => { 
                      setSearchQuery(""); 
                      setPriorityFilter("all"); 
                      setDateFilter("all");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Admin Only: Create Button */}
            {userMode === "admin" && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingTest) && userMode === "admin" && (
          <Card className="shadow-lg rounded-xl border-2 border-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg flex items-center gap-2">
                {editingTest ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingTest ? "Edit Test" : "Create New Test"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Project Name *</label>
                  <Input
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Document Number</label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                    placeholder="DOC-XXXX-XXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Test Name *</label>
                  <Input
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    placeholder="Enter test name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Equipment</label>
                  <Input
                    value={formData.equipment}
                    onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                    placeholder="Enter equipment name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Scheduled Date *</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Scheduled Time</label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 24 hours"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Ready to Start">Ready to Start</SelectItem>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Sample Quantity</label>
                  <Input
                    type="number"
                    value={formData.sampleQty}
                    onChange={(e) => setFormData({...formData, sampleQty: e.target.value})}
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Test Location</label>
                  <Input
                    value={formData.testLocation}
                    onChange={(e) => setFormData({...formData, testLocation: e.target.value})}
                    placeholder="Lab A, Lab B, etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 text-nowrap">Test Condition</label>
                  <Input
                    value={formData.testCondition}
                    onChange={(e) => setFormData({...formData, testCondition: e.target.value})}
                    placeholder="Enter test conditions"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingTest ? handleUpdateTest : handleCreateTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingTest ? "Update Test" : "Create Test"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Tests Table */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Tests Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[100px]">Project</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[120px]">Document No.</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[150px]">Test Name</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[150px]">Equipment</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[100px]">Scheduled Date</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[100px]">Time</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[80px]">Duration</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[120px]">Test Condition</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[80px]">Samples</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[100px]">Location</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[80px]">Priority</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[120px]">Status</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700 text-nowrap min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <tr key={test.id} className="border-b hover:bg-gray-50 transition-colors text-sm">
                        <td className="p-3 text-nowrap  font-medium text-gray-800">{test.project}</td>
                        <td className="p-3 text-nowrap  text-gray-600">{test.documentNumber}</td>
                        <td className="p-3 text-nowrap  text-gray-800">{test.testName}</td>
                        <td className="p-3 text-nowrap  text-gray-600">{test.equipment}</td>
                        <td className="p-3 text-nowrap  text-gray-800">{test.scheduledDate}</td>
                        <td className="p-3 text-nowrap  text-gray-600">{test.scheduledTime}</td>
                        <td className="p-3 text-nowrap  text-gray-600">{test.duration}</td>
                        <td className="p-3 text-nowrap  text-gray-600 text-xs">{test.testCondition}</td>
                        <td className="p-3 text-nowrap  text-gray-800">{test.sampleQty}</td>
                        <td className="p-3 text-nowrap  text-gray-600">{test.testLocation}</td>
                        <td className="p-3 text-nowrap ">
                          <Badge className={`${getPriorityColor(test.priority)} text-white text-xs px-2 py-1`}>
                            {test.priority}
                          </Badge>
                        </td>
                        <td className="p-3 text-nowrap ">
                          <Badge className={`${getStatusColor(test.status)} text-white text-xs px-2 py-1 flex items-center gap-1 w-fit`}>
                            {getStatusIcon(test.status)}
                            {test.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-nowrap ">
                          <div className="flex items-center gap-2">
                            {userMode === "admin" ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="hover:bg-blue-50 text-blue-600"
                                  onClick={() => handleEditClick(test)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="hover:bg-red-50 text-red-600"
                                  onClick={() => handleDeleteTest(test.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-blue-50 text-blue-600"
                                onClick={() => handleViewDetails(test)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="text-center py-8 text-gray-500">
                        No upcoming tests found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50"
            >
              Export Schedule
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50"
            >
              Print Calendar
            </Button>
            {userMode === "admin" && (
              <Button 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-50"
              >
                Send Reminders
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanningModule;