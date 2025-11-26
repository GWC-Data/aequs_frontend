import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Search, AlertCircle, CheckCircle2, PlayCircle, Edit, Trash2, Plus, Eye, User, Shield, Activity, AlertTriangle } from "lucide-react";
import { flaskData, FlaskItem } from "@/data/flaskData";

// Define types for local storage response
interface Stage2Record {
  processStage: string;
  type: string;
  testName: string;
  testCondition: string;
  requiredQty: string;
  equipment: string;
  projects: string[];
  lines: string[];
  selectedParts: string[];
  startTime: string;
  endTime: string;
  remark: string;
  submittedAt: string;
}

interface LocalStorageResponse {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  submissionDate: string;
  sampleConfig: string;
  status: string;
  id: number;
  createdAt: string;
  stage2?: Stage2Record;
  forms: any;
  completedAt: string;
  sharedImages: any;
  sampleQty: string;
  testCompletionDate: string;
  completedTests: string[];
}

const PlanningModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userMode, setUserMode] = useState("admin");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [showMachineStatus, setShowMachineStatus] = useState(false);
  const [stage2Records, setStage2Records] = useState<LocalStorageResponse[]>([]);

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
    }
  ]);

  const stage2Record = JSON.parse(localStorage.getItem('stage2Records') || '[]');

  // Create machine cards and separate into occupied (left) and available (right)
  const { occupiedMachines, availableMachines } = useMemo(() => {
    const occupied: any[] = [];
    const available: any[] = [];

    console.log('=== Processing Flask Data ===');
    console.log('Total stage2Records:', stage2Record);

    flaskData.forEach((item: FlaskItem, index: number) => {
      // Find matching records in localStorage for this specific test
      const matchingRecords = stage2Record.filter(record => {
        const stage2 = record.stage2;
        if (!stage2) {
          console.log(`Record ${record.projectName} has no stage2 data`);
          return false;
        }

        // Trim whitespace for comparison
        const testNameMatch = stage2.testName?.trim() === item.testName?.trim();
        const equipmentMatch = stage2.equipment?.trim() === item.equipment?.trim();

        if (testNameMatch && equipmentMatch) {
          console.log('✓ MATCH FOUND:', {
            flaskTest: item.testName,
            flaskEquipment: item.equipment,
            recordProject: record.projectName,
            recordStatus: record.status
          });
        }

        return testNameMatch && equipmentMatch;
      });

      // Check status of matching records - ONLY consider "Received" or "In Progress" as occupied
      const receivedRecords = matchingRecords.filter(r => r.status === "Received");
      const inProgressRecords = matchingRecords.filter(r => r.status === "In Progress");
      const completedRecords = matchingRecords.filter(r => r.status === "Completed");

      const hasReceived = receivedRecords.length > 0;
      const hasInProgress = inProgressRecords.length > 0;
      const hasCompleted = completedRecords.length > 0;

      // Machine is OCCUPIED only if status is "Received" or "In Progress"
      const isOccupied = hasReceived || hasInProgress;
      const isAvailable = !isOccupied;

      const machineData = {
        id: `M${String(index + 1).padStart(3, '0')}`,
        name: item.equipment,
        location: "Lab A",
        capacity: 20,
        processStage: item.processStage,
        type: item.type,
        testName: item.testName,
        testCondition: item.testCondition,
        requiredQty: item.requiredQty,
        matchingRecords: matchingRecords,
        isOccupied: isOccupied,
        isAvailable: isAvailable,
        status: isOccupied ? "occupied" : "available",
        hasCompleted: hasCompleted
      };

      if (isOccupied) {
        console.log(`→ Machine ${item.equipment} is OCCUPIED (${receivedRecords.length} received, ${inProgressRecords.length} in progress)`);
        occupied.push(machineData);
      } else {
        console.log(`→ Machine ${item.equipment} is AVAILABLE (${completedRecords.length} completed, ${matchingRecords.length} total matches)`);
        available.push(machineData);
      }
    });

    console.log('=== Summary ===');
    console.log('Occupied machines:', occupied.length);
    console.log('Available machines:', available.length);

    return { occupiedMachines: occupied, availableMachines: available };
  }, [stage2Record]);
  // Get unique machines for dropdown (only available ones)
  const getAvailableMachinesForDropdown = () => {
    const uniqueMachines = new Map();

    availableMachines.forEach(machine => {
      if (!uniqueMachines.has(machine.name)) {
        uniqueMachines.set(machine.name, {
          id: machine.id,
          name: machine.name,
          location: machine.location,
          capacity: machine.capacity
        });
      }
    });

    return Array.from(uniqueMachines.values());
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
    machinesOccupied: occupiedMachines.length,
    machinesAvailable: availableMachines.length,
    totalTests: flaskData.length,
    receivedTests: stage2Record.filter(r => r.status === "Received").length,
    completedTests: stage2Record.filter(r => r.status === "Completed").length
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
      case "occupied": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getMachineStatusIcon = (status) => {
    switch (status) {
      case "available": return <CheckCircle2 className="h-3 w-3" />;
      case "occupied": return <AlertCircle className="h-3 w-3" />;
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

  // Refresh stage2 records
  const refreshStage2Records = () => {
    const keys = Object.keys(localStorage);
    const records: LocalStorageResponse[] = [];

    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.projectName && parsed.status !== undefined) {
            records.push(parsed);
          }
        }
      } catch (error) {
        console.warn(`Error parsing localStorage item ${key}:`, error);
      }
    });

    setStage2Records(records);
    alert(`Refreshed! Loaded ${records.length} records from localStorage`);
  };

  const renderMachineCard = (machine, isOccupied) => (
    <div key={machine.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-sm text-gray-800">{machine.name}</h4>
          <p className="text-xs text-gray-500">{machine.testName}</p>
          <p className="text-xs text-gray-400">{machine.processStage} • {machine.type}</p>
        </div>
        <Badge className={`${getMachineStatusColor(machine.status)} text-white text-xs flex items-center gap-1`}>
          {getMachineStatusIcon(machine.status)}
          {isOccupied ? "Occupied" : "Available"}
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Process Stage:</span>
          <span className="font-medium">{machine.processStage}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium">{machine.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Test Condition:</span>
          <span className="font-medium">{machine.testCondition}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Required Qty:</span>
          <span className="font-medium">{machine.requiredQty}</span>
        </div>

        {/* Show matching records */}
        {machine.matchingRecords.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-gray-600 font-medium mb-1">
              {isOccupied ? "Occupied by:" : "Completed by:"}
            </p>
            {machine.matchingRecords.map((record, idx) => (
              <div key={idx} className="text-xs text-gray-700 ml-2 mb-1">
                <div className="font-medium">• {record.projectName}</div>
                <div className="text-gray-500 ml-2">
                  Status: <span className={isOccupied ? "text-red-600" : "text-green-600"}>{record.status}</span>
                  <br />
                  Document: {record.documentNumber}
                  {record.completedAt && !isOccupied && (
                    <>
                      <br />
                      Completed: {new Date(record.completedAt).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show if no matching records found */}
        {machine.matchingRecords.length === 0 && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-gray-600 font-medium mb-1 text-blue-600">No matching records</p>
            <div className="text-xs text-gray-500 ml-2">
              This test configuration hasn't been recorded in localStorage yet
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
                <div className="flex gap-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshStage2Records}
                  >
                    Refresh Data
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMachineStatus(!showMachineStatus)}
                  >
                    {showMachineStatus ? "Hide Details" : "Show Details"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showMachineStatus && (
              <CardContent>
                {/* <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Matching Logic:</strong> processStage + type + testName + equipment
                    <br />
                    <strong>Left Side (Occupied):</strong> Status = "Received" or "In Progress"
                    <br />
                    <strong>Right Side (Available):</strong> Status = "Completed" or no matching records
                  </p>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side - Occupied Machines */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-700">Occupied Machines</h3>
                      {/* <Badge className="bg-red-600 text-white ml-2">
                        {occupiedMachines.length}
                      </Badge> */}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {occupiedMachines.length > 0 ? (
                        occupiedMachines.map(machine => renderMachineCard(machine, true))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                          <p>No occupied machines</p>
                          <p className="text-sm">All machines are available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Available Machines */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-700">Available Machines</h3>
                      {/* <Badge className="bg-green-600 text-white ml-2">
                        {availableMachines.length}
                      </Badge> */}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {availableMachines.length > 0 ? (
                        availableMachines.map(machine => renderMachineCard(machine, false))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                          <p>No available machines</p>
                          <p className="text-sm">All machines are occupied</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Rest of your components remain the same */}
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
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Document Number</label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="DOC-XXXX-XXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Name *</label>
                  <Select value={formData.testName} onValueChange={(value) => setFormData({ ...formData, testName: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {flaskData.map((test) => (
                        <SelectItem key={test.testName} value={test.testName}>
                          {test.testName} ({test.equipment})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Equipment *</label>
                  <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMachinesForDropdown().map((machine) => (
                        <SelectItem key={machine.id} value={machine.name}>
                          {machine.name} - Available
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.equipment && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ This machine is available for scheduling
                    </p>
                  )}
                </div>
                {/* Rest of form fields */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Date *</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Time</label>
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 24 hours"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                    onChange={(e) => setFormData({ ...formData, sampleQty: e.target.value })}
                    placeholder="Enter quantity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Location</label>
                  <Input
                    value={formData.testLocation}
                    onChange={(e) => setFormData({ ...formData, testLocation: e.target.value })}
                    placeholder="Lab A, Lab B, etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Condition</label>
                  <Input
                    value={formData.testCondition}
                    onChange={(e) => setFormData({ ...formData, testCondition: e.target.value })}
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

