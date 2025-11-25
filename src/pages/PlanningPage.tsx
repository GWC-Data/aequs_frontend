import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, AlertCircle, CheckCircle2, PlayCircle, Edit, Trash2, Plus, Eye, User, Shield, Activity, AlertTriangle } from "lucide-react";

const PlanningModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userMode, setUserMode] = useState("admin");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [showMachineStatus, setShowMachineStatus] = useState(false);
  
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
      testCondition: "1.5m height"
    }
  ]);

  // Define all available machines/equipment
  const allMachines = [
    { id: "M001", name: "Salt Spray Chamber #1", location: "Lab A", capacity: 10 },
    { id: "M002", name: "Salt Spray Chamber #2", location: "Lab A", capacity: 8 },
    { id: "M003", name: "Thermal Chamber #1", location: "Lab B", capacity: 6 },
    { id: "M004", name: "Thermal Chamber #2", location: "Lab B", capacity: 6 },
    { id: "M005", name: "Drop Test Machine", location: "Lab A", capacity: 15 },
    { id: "M006", name: "Vibration Shaker #1", location: "Lab C", capacity: 5 },
    { id: "M007", name: "Vibration Shaker #2", location: "Lab C", capacity: 5 },
    { id: "M008", name: "Torque Tester #1", location: "Lab B", capacity: 12 },
    { id: "M009", name: "Torque Tester #2", location: "Lab B", capacity: 12 },
    { id: "M010", name: "Universal Testing Machine", location: "Lab A", capacity: 20 },
    { id: "M011", name: "Hardness Testing Machine", location: "Lab B", capacity: 8 },
    { id: "M012", name: "Heat Sink Testing", location: "Lab C", capacity: 4 }
  ];

  // Calculate machine occupancy status
  const machineStatus = useMemo(() => {
    return allMachines.map(machine => {
      const occupiedTests = upcomingTests.filter(test => 
        test.equipment === machine.name && 
        (test.status === "Scheduled" || test.status === "Ready to Start")
      );
      
      const totalOccupied = occupiedTests.reduce((sum, test) => sum + test.sampleQty, 0);
      const isOccupied = occupiedTests.length > 0;
      const availableCapacity = machine.capacity - totalOccupied;
      const occupancyPercentage = (totalOccupied / machine.capacity) * 100;

      return {
        ...machine,
        isOccupied,
        occupiedBy: occupiedTests,
        totalOccupied,
        availableCapacity,
        occupancyPercentage,
        status: occupancyPercentage >= 100 ? "full" : 
                occupancyPercentage >= 70 ? "busy" : 
                occupancyPercentage > 0 ? "partial" : "available"
      };
    });
  }, [upcomingTests]);

  // Get machine availability for dropdown
  const getAvailableMachines = () => {
    return machineStatus.filter(m => m.status !== "full");
  };

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

  const stats = {
    totalScheduled: upcomingTests.filter(t => t.status === "Scheduled").length,
    highPriority: upcomingTests.filter(t => t.priority === "High").length,
    today: upcomingTests.filter(t => t.scheduledDate === "2024-11-25").length,
    thisWeek: upcomingTests.filter(t => new Date(t.scheduledDate) <= new Date("2024-12-01")).length,
    machinesOccupied: machineStatus.filter(m => m.isOccupied).length,
    machinesAvailable: machineStatus.filter(m => m.status === "available").length
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-600";
      case "medium": return "bg-yellow-600";
      case "low": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "bg-blue-600";
      case "Ready to Start": return "bg-green-600";
      case "Pending Approval": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const getMachineStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-600";
      case "partial": return "bg-blue-600";
      case "busy": return "bg-yellow-600";
      case "full": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getMachineStatusIcon = (status) => {
    switch (status) {
      case "available": return <CheckCircle2 className="h-3 w-3" />;
      case "partial": return <Activity className="h-3 w-3" />;
      case "busy": return <AlertCircle className="h-3 w-3" />;
      case "full": return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle2 className="h-3 w-3" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Scheduled": return <Clock className="h-3 w-3" />;
      case "Ready to Start": return <PlayCircle className="h-3 w-3" />;
      case "Pending Approval": return <AlertCircle className="h-3 w-3" />;
      default: return <CheckCircle2 className="h-3 w-3" />;
    }
  };

  const handleCreateTest = () => {
    if (!formData.project || !formData.testName || !formData.scheduledDate || !formData.equipment) {
      alert("Please fill in all required fields");
      return;
    }

    // Check machine availability
    const selectedMachine = machineStatus.find(m => m.name === formData.equipment);
    const requestedQty = parseInt(formData.sampleQty) || 0;
    
    if (selectedMachine && requestedQty > selectedMachine.availableCapacity) {
      alert(`Warning: Machine capacity exceeded! Available: ${selectedMachine.availableCapacity}, Requested: ${requestedQty}`);
      return;
    }

    const newTest = {
      id: `TST-${String(upcomingTests.length + 1).padStart(3, '0')}`,
      ...formData,
      sampleQty: requestedQty
    };

    setUpcomingTests([...upcomingTests, newTest]);
    resetForm();
    setShowCreateModal(false);
    alert("Test created successfully!");
  };

  const handleUpdateTest = () => {
    if (!editingTest) return;

    const updatedTests = upcomingTests.map(test => 
      test.id === editingTest.id ? { ...editingTest, ...formData, sampleQty: parseInt(formData.sampleQty) } : test
    );

    setUpcomingTests(updatedTests);
    resetForm();
    setEditingTest(null);
    alert("Test updated successfully!");
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      setUpcomingTests(upcomingTests.filter(test => test.id !== testId));
      alert("Test deleted successfully!");
    }
  };

  const handleEditClick = (test) => {
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

  const handleViewDetails = (test) => {
    alert(`Viewing details for: ${test.testName}\n\nProject: ${test.project}\nDocument: ${test.documentNumber}\nEquipment: ${test.equipment}\nScheduled: ${test.scheduledDate} at ${test.scheduledTime}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Testing Planning Module</h1>
            <p className="text-sm text-gray-500">View and manage upcoming testing schedules with machine availability</p>
          </div>
          
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Calendar, color: "blue", title: "Total Scheduled", value: stats.totalScheduled },
            { icon: AlertCircle, color: "red", title: "High Priority", value: stats.highPriority },
            { icon: Clock, color: "green", title: "Today", value: stats.today },
            { icon: CheckCircle2, color: "purple", title: "This Week", value: stats.thisWeek },
            { icon: Activity, color: "orange", title: "Machines Occupied", value: stats.machinesOccupied },
            { icon: CheckCircle2, color: "teal", title: "Machines Available", value: stats.machinesAvailable },
          ].map((item, i) => (
            <Card key={i} className="border-t-4 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <item.icon className="h-4 w-4" /> {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Machine Status Overview - Visible to Admin */}
        {userMode === "admin" && (
          <Card className="shadow-sm rounded-xl border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Machine Availability Status
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMachineStatus(!showMachineStatus)}
                >
                  {showMachineStatus ? "Hide Details" : "Show Details"}
                </Button>
              </div>
            </CardHeader>
            {showMachineStatus && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machineStatus.map((machine) => (
                    <div key={machine.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{machine.name}</h4>
                          <p className="text-xs text-gray-500">{machine.location}</p>
                        </div>
                        <Badge className={`${getMachineStatusColor(machine.status)} text-white text-xs flex items-center gap-1`}>
                          {getMachineStatusIcon(machine.status)}
                          {machine.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{machine.capacity} samples</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Occupied:</span>
                          <span className="font-medium">{machine.totalOccupied} samples</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium text-green-600">{machine.availableCapacity} samples</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Occupancy</span>
                            <span>{Math.round(machine.occupancyPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                machine.status === "full" ? "bg-red-600" :
                                machine.status === "busy" ? "bg-yellow-600" :
                                machine.status === "partial" ? "bg-blue-600" : "bg-green-600"
                              }`}
                              style={{ width: `${Math.min(machine.occupancyPercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Show tests using this machine */}
                        {machine.occupiedBy.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-gray-600 font-medium mb-1">Currently Scheduled:</p>
                            {machine.occupiedBy.map((test, idx) => (
                              <div key={idx} className="text-xs text-gray-700 ml-2">
                                • {test.testName} ({test.sampleQty} samples)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Filters */}
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
                  <label className="text-sm font-medium text-gray-700">Project Name *</label>
                  <Input
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Document Number</label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                    placeholder="DOC-XXXX-XXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Name *</label>
                  <Input
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    placeholder="Enter test name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment *</label>
                  <Select value={formData.equipment} onValueChange={(value) => setFormData({...formData, equipment: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMachines().map((machine) => (
                        <SelectItem key={machine.id} value={machine.name}>
                          {machine.name} - Available: {machine.availableCapacity}/{machine.capacity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.equipment && (
                    <p className="text-xs text-blue-600 mt-1">
                      {machineStatus.find(m => m.name === formData.equipment)?.availableCapacity} samples available
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Date *</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Time</label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 24 hours"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
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
                  <label className="text-sm font-medium text-gray-700">Status</label>
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
                  <label className="text-sm font-medium text-gray-700">Sample Quantity *</label>
                  <Input
                    type="number"
                    value={formData.sampleQty}
                    onChange={(e) => setFormData({...formData, sampleQty: e.target.value})}
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Location</label>
                  <Input
                    value={formData.testLocation}
                    onChange={(e) => setFormData({...formData, testLocation: e.target.value})}
                    placeholder="Lab A, Lab B, etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Condition</label>
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
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Project</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Test Name</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Equipment</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Date</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Time</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Duration</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Samples</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Priority</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Status</th>
                    <th className="text-left p-3 font-semibold text-sm text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <tr key={test.id} className="border-b hover:bg-gray-50 transition-colors text-sm">
                        <td className="p-3 font-medium text-gray-800">{test.project}</td>
                        <td className="p-3 text-gray-800">{test.testName}</td>
                        <td className="p-3 text-gray-600">{test.equipment}</td>
                        <td className="p-3 text-gray-800">{test.scheduledDate}</td>
                        <td className="p-3 text-gray-600">{test.scheduledTime}</td>
                        <td className="p-3 text-gray-600">{test.duration}</td>
                        <td className="p-3 text-gray-800">{test.sampleQty}</td>
                        <td className="p-3">
                          <Badge className={`${getPriorityColor(test.priority)} text-white text-xs px-2 py-1`}>
                            {test.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={`${getStatusColor(test.status)} text-white text-xs px-2 py-1 flex items-center gap-1 w-fit`}>
                            {getStatusIcon(test.status)}
                            {test.status}
                          </Badge>
                        </td>
                        <td className="p-3">
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
                      <td colSpan={10} className="text-center py-8 text-gray-500">
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
              <>
                <Button 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Send Reminders
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={() => setShowMachineStatus(!showMachineStatus)}
                >
                  View Machine Status
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanningModule;