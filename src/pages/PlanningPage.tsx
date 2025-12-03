// import { useState, useMemo, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar, Clock, Search, AlertCircle, CheckCircle2, PlayCircle, Edit, Trash2, Plus, Eye, User, Shield, Activity, AlertTriangle } from "lucide-react";
// import { flaskData, FlaskItem } from "@/data/flaskData";

// // Define types for local storage response
// interface Stage2Record {
//   processStage: string;
//   type: string;
//   testName: string;
//   testCondition: string;
//   requiredQty: string;
//   equipment: string;
//   projects: string[];
//   lines: string[];
//   selectedParts: string[];
//   startTime: string;
//   endTime: string;
//   remark: string;
//   submittedAt: string;
// }

// interface LocalStorageResponse {
//   documentNumber: string;
//   documentTitle: string;
//   projectName: string;
//   color: string;
//   testLocation: string;
//   submissionDate: string;
//   sampleConfig: string;
//   status: string;
//   id: number;
//   createdAt: string;
//   stage2?: Stage2Record;
//   forms: any;
//   completedAt: string;
//   sharedImages: any;
//   sampleQty: string;
//   testCompletionDate: string;
//   completedTests: string[];
// }

// const PlanningModule = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [priorityFilter, setPriorityFilter] = useState("all");
//   const [dateFilter, setDateFilter] = useState("all");
//   const [userMode, setUserMode] = useState("admin");
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [editingTest, setEditingTest] = useState(null);
//   const [showMachineStatus, setShowMachineStatus] = useState(false);
//   const [stage2Records, setStage2Records] = useState<LocalStorageResponse[]>([]);

//   const [formData, setFormData] = useState({
//     project: "",
//     documentNumber: "",
//     testName: "",
//     equipment: "",
//     scheduledDate: "",
//     scheduledTime: "",
//     duration: "",
//     priority: "Medium",
//     status: "Scheduled",
//     sampleQty: "",
//     testLocation: "",
//     testCondition: ""
//   });

//   const [upcomingTests, setUpcomingTests] = useState([
//     {
//       id: "TST-001",
//       project: "Automotive Component A",
//       documentNumber: "DOC-2024-001",
//       testName: "Salt Spray Test",
//       equipment: "Salt Spray Chamber #1",
//       scheduledDate: "2024-11-25",
//       scheduledTime: "09:00 AM",
//       duration: "48 hours",
//       priority: "High",
//       status: "Scheduled",
//       sampleQty: 5,
//       testLocation: "Lab A",
//       testCondition: "ASTM B117"
//     },
//     {
//       id: "TST-002",
//       project: "Electronics Module B",
//       documentNumber: "DOC-2024-002",
//       testName: "Thermal Cycle Test",
//       equipment: "Thermal Chamber #2",
//       scheduledDate: "2024-11-25",
//       scheduledTime: "02:00 PM",
//       duration: "24 hours",
//       priority: "Medium",
//       status: "Scheduled",
//       sampleQty: 3,
//       testLocation: "Lab B",
//       testCondition: "-40°C to 85°C"
//     }
//   ]);

//   const stage2Record = JSON.parse(localStorage.getItem('stage2Records') || '[]');
//   console.log(stage2Record)

//   // Create machine cards and separate into occupied (left) and available (right)
//   const { occupiedMachines, availableMachines } = useMemo(() => {
//     const occupied: any[] = [];
//     const available: any[] = [];

//     flaskData.forEach((item: FlaskItem, index: number) => {
//       // Find matching records in localStorage for this specific test
//       const matchingRecords = stage2Record.filter(record => {
//         const stage2 = record.stage2;
//         if (!stage2) return false;

//         return (
//           stage2.testName?.trim() === item.testName?.trim() &&
//           stage2.equipment?.trim() === item.equipment?.trim() &&
//           stage2.type?.trim() === item.type?.trim()
//         );
//       });


//       // Check status of matching records - ONLY consider "Received" or "In Progress" as occupied
//       const receivedRecords = matchingRecords.filter(r => r.status === "Received");
//       const inProgressRecords = matchingRecords.filter(r => r.status === "In Progress");
//       const completedRecords = matchingRecords.filter(r => r.status === "Completed");

//       const hasReceived = receivedRecords.length > 0;
//       const hasInProgress = inProgressRecords.length > 0;
//       const hasCompleted = completedRecords.length > 0;

//       // Machine is OCCUPIED only if status is "Received" or "In Progress"
//       const isOccupied = hasReceived || hasInProgress;
//       const isAvailable = !isOccupied;

//       const machineData = {
//         id: `M${String(index + 1).padStart(3, '0')}`,
//         name: item.equipment,
//         location: "Lab A",
//         capacity: 20,
//         processStage: item.processStage,
//         type: item.type,
//         testName: item.testName,
//         testCondition: item.testCondition,
//         requiredQty: item.requiredQty,
//         matchingRecords: matchingRecords,
//         isOccupied: isOccupied,
//         isAvailable: isAvailable,
//         status: isOccupied ? "occupied" : "available",
//         hasCompleted: hasCompleted
//       };

//       if (isOccupied) {
//         occupied.push(machineData);
//       } else {
//         available.push(machineData);
//       }
//     });

//     return { occupiedMachines: occupied, availableMachines: available };
//   }, [stage2Record]);
//   // Get unique machines for dropdown (only available ones)
//   const getAvailableMachinesForDropdown = () => {
//     const uniqueMachines = new Map();

//     availableMachines.forEach(machine => {
//       if (!uniqueMachines.has(machine.name)) {
//         uniqueMachines.set(machine.name, {
//           id: machine.id,
//           name: machine.name,
//           location: machine.location,
//           capacity: machine.capacity
//         });
//       }
//     });

//     return Array.from(uniqueMachines.values());
//   };

//   const filteredTests = upcomingTests.filter((test) => {
//     const matchesSearch = searchQuery === "" ||
//       test.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       test.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       test.equipment.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesPriority = priorityFilter === "all" || test.priority.toLowerCase() === priorityFilter.toLowerCase();

//     const matchesDate = dateFilter === "all" ||
//       (dateFilter === "today" && test.scheduledDate === "2024-11-25") ||
//       (dateFilter === "tomorrow" && test.scheduledDate === "2024-11-26") ||
//       (dateFilter === "week" && new Date(test.scheduledDate) <= new Date("2024-12-01"));

//     return matchesSearch && matchesPriority && matchesDate;
//   });

//   const stats = useMemo(() => {
//     const now = new Date();
//     const todayStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

//     // Get start of current week (Sunday)
//     const startOfWeek = new Date(now);
//     startOfWeek.setDate(now.getDate() - now.getDay());
//     startOfWeek.setHours(0, 0, 0, 0);

//     // Get end of current week (Saturday)
//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 6);
//     endOfWeek.setHours(23, 59, 59, 999);

//     // Count submissions today
//     const submittedToday = stage2Record.filter(r => {
//       if (!r.submissionDate) return false;
//       return r.submissionDate === todayStr;
//     }).length;

//     // Count submissions this week
//     const submittedThisWeek = stage2Record.filter(r => {
//       if (!r.submissionDate) return false;
//       const subDate = new Date(r.submissionDate);
//       return subDate >= startOfWeek && subDate <= endOfWeek;
//     }).length;

//     return {
//       totalScheduled: upcomingTests.filter(t => t.status === "Scheduled").length,
//       highPriority: upcomingTests.filter(t => t.priority === "High").length,
//       today: submittedToday,
//       thisWeek: submittedThisWeek,
//       machinesOccupied: occupiedMachines.length,
//       machinesAvailable: availableMachines.length,
//       totalTests: flaskData.length,
//       receivedTests: stage2Record.filter(r => r.status === "Received").length,
//       completedTests: stage2Record.filter(r => r.status === "Completed").length
//     };
//   }, [upcomingTests, occupiedMachines, availableMachines, stage2Record]);

//   const getPriorityColor = (priority) => {
//     switch (priority.toLowerCase()) {
//       case "high": return "bg-red-600";
//       case "medium": return "bg-yellow-600";
//       case "low": return "bg-green-600";
//       default: return "bg-gray-600";
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Scheduled": return "bg-blue-600";
//       case "Ready to Start": return "bg-green-600";
//       case "Pending Approval": return "bg-yellow-600";
//       default: return "bg-gray-600";
//     }
//   };

//   const getMachineStatusColor = (status) => {
//     switch (status) {
//       case "available": return "bg-green-600";
//       case "occupied": return "bg-red-600";
//       default: return "bg-gray-600";
//     }
//   };

//   const getMachineStatusIcon = (status) => {
//     switch (status) {
//       case "available": return <CheckCircle2 className="h-3 w-3" />;
//       case "occupied": return <AlertCircle className="h-3 w-3" />;
//       default: return <CheckCircle2 className="h-3 w-3" />;
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "Scheduled": return <Clock className="h-3 w-3" />;
//       case "Ready to Start": return <PlayCircle className="h-3 w-3" />;
//       case "Pending Approval": return <AlertCircle className="h-3 w-3" />;
//       default: return <CheckCircle2 className="h-3 w-3" />;
//     }
//   };

//   const handleCreateTest = () => {
//     if (!formData.project || !formData.testName || !formData.scheduledDate || !formData.equipment) {
//       alert("Please fill in all required fields");
//       return;
//     }

//     const newTest = {
//       id: `TST-${String(upcomingTests.length + 1).padStart(3, '0')}`,
//       ...formData,
//       sampleQty: parseInt(formData.sampleQty) || 0
//     };

//     setUpcomingTests([...upcomingTests, newTest]);
//     resetForm();
//     setShowCreateModal(false);
//     alert("Test created successfully!");
//   };

//   const handleUpdateTest = () => {
//     if (!editingTest) return;

//     const updatedTests = upcomingTests.map(test =>
//       test.id === editingTest.id ? { ...editingTest, ...formData, sampleQty: parseInt(formData.sampleQty) } : test
//     );

//     setUpcomingTests(updatedTests);
//     resetForm();
//     setEditingTest(null);
//     alert("Test updated successfully!");
//   };

//   const handleDeleteTest = (testId) => {
//     if (window.confirm("Are you sure you want to delete this test?")) {
//       setUpcomingTests(upcomingTests.filter(test => test.id !== testId));
//       alert("Test deleted successfully!");
//     }
//   };

//   const handleEditClick = (test) => {
//     setEditingTest(test);
//     setFormData({
//       project: test.project,
//       documentNumber: test.documentNumber,
//       testName: test.testName,
//       equipment: test.equipment,
//       scheduledDate: test.scheduledDate,
//       scheduledTime: test.scheduledTime,
//       duration: test.duration,
//       priority: test.priority,
//       status: test.status,
//       sampleQty: test.sampleQty.toString(),
//       testLocation: test.testLocation,
//       testCondition: test.testCondition
//     });
//   };

//   const resetForm = () => {
//     setFormData({
//       project: "",
//       documentNumber: "",
//       testName: "",
//       equipment: "",
//       scheduledDate: "",
//       scheduledTime: "",
//       duration: "",
//       priority: "Medium",
//       status: "Scheduled",
//       sampleQty: "",
//       testLocation: "",
//       testCondition: ""
//     });
//     setEditingTest(null);
//     setShowCreateModal(false);
//   };

//   const handleViewDetails = (test) => {
//     alert(`Viewing details for: ${test.testName}\n\nProject: ${test.project}\nDocument: ${test.documentNumber}\nEquipment: ${test.equipment}\nScheduled: ${test.scheduledDate} at ${test.scheduledTime}`);
//   };

//   // Refresh stage2 records
//   // const refreshStage2Records = () => {
//   //   const keys = Object.keys(localStorage);
//   //   const records: LocalStorageResponse[] = [];

//   //   keys.forEach(key => {
//   //     try {
//   //       const item = localStorage.getItem(key);
//   //       if (item) {
//   //         const parsed = JSON.parse(item);
//   //         if (parsed.projectName && parsed.status !== undefined) {
//   //           records.push(parsed);
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.warn(`Error parsing localStorage item ${key}:`, error);
//   //     }
//   //   });

//   //   setStage2Records(records);
//   //   alert(`Refreshed! Loaded ${records.length} records from localStorage`);
//   // };

//   const renderMachineCard = (machine, isOccupied) => (
//     <div key={machine.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start mb-2">
//         <div>
//           <h4 className="font-semibold text-sm text-gray-800">{machine.name}</h4>
//           <p className="text-xs text-gray-500">{machine.testName}</p>
//           <p className="text-xs text-gray-400">{machine.processStage} • {machine.type}</p>
//         </div>
//         <Badge className={`${getMachineStatusColor(machine.status)} text-white text-xs flex items-center gap-1`}>
//           {getMachineStatusIcon(machine.status)}
//           {isOccupied ? "Occupied" : "Available"}
//         </Badge>
//       </div>

//       <div className="space-y-2 text-xs">
//         <div className="flex justify-between">
//           <span className="text-gray-600">Process Stage:</span>
//           <span className="font-medium">{machine.processStage}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Type:</span>
//           <span className="font-medium">{machine.type}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Test Condition:</span>
//           <span className="font-medium">{machine.testCondition}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Required Qty:</span>
//           <span className="font-medium">{machine.requiredQty}</span>
//         </div>

//         {/* Show matching records */}
//         {machine.matchingRecords.length > 0 && (
//           <div className="mt-3 pt-3 border-t">
//             <p className="text-gray-600 font-medium mb-1">
//               {isOccupied ? "Occupied by:" : "Completed by:"}
//             </p>
//             {machine.matchingRecords.map((record, idx) => (
//               <div key={idx} className="text-xs text-gray-700 ml-2 mb-1">
//                 <div className="font-medium">• {record.projectName}</div>
//                 <div className="text-gray-500 ml-2">
//                   Status: <span className={isOccupied ? "text-red-600" : "text-green-600"}>{record.status}</span>
//                   <br />
//                   Document: {record.documentNumber}
//                   {record.completedAt && !isOccupied && (
//                     <>
//                       <br />
//                       Completed: {new Date(record.completedAt).toLocaleDateString()}
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Show if no matching records found */}
//         {machine.matchingRecords.length === 0 && (
//           <div className="mt-2 pt-2 border-t">
//             <p className="text-gray-600 font-medium mb-1 text-blue-600">No matching records</p>
//             <div className="text-xs text-gray-500 ml-2">
//               This test configuration hasn't been recorded in localStorage yet
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
//       <div className="p-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div className="flex flex-col gap-1">
//             <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Testing Planning Module</h1>
//             <p className="text-sm text-gray-500">View and manage upcoming testing schedules with machine availability</p>
//           </div>

//           <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
//             <Button
//               onClick={() => setUserMode("user")}
//               className={`flex items-center gap-2 ${userMode === "user" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
//               size="sm"
//             >
//               <User className="h-4 w-4" />
//               User Mode
//             </Button>
//             <Button
//               onClick={() => setUserMode("admin")}
//               className={`flex items-center gap-2 ${userMode === "admin" ? "bg-red-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
//               size="sm"
//             >
//               <Shield className="h-4 w-4" />
//               Admin Mode
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           {[
//             { icon: Calendar, color: "blue", title: "Total Scheduled", value: stats.totalScheduled },
//             { icon: AlertCircle, color: "red", title: "High Priority", value: stats.highPriority },
//             { icon: Clock, color: "green", title: "Today", value: stats.today },
//             { icon: CheckCircle2, color: "purple", title: "This Week", value: stats.thisWeek },
//             { icon: Activity, color: "orange", title: "Machines Occupied", value: stats.machinesOccupied },
//             { icon: CheckCircle2, color: "teal", title: "Machines Available", value: stats.machinesAvailable },
//           ].map((item, i) => (
//             <Card key={i} className="border-t-4 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
//                   <item.icon className="h-4 w-4" /> {item.title}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{item.value}</div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Machine Status Overview - Visible to Admin */}
//         {userMode === "admin" && (
//           <Card className="shadow-sm rounded-xl border-l-4 border-l-blue-600">
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Activity className="h-5 w-5 text-blue-600" />
//                   Machine Availability Status
//                 </CardTitle>
//                 <div className="flex gap-2">
//                   {/* <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={refreshStage2Records}
//                   >
//                     Refresh Data
//                   </Button> */}
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setShowMachineStatus(!showMachineStatus)}
//                   >
//                     {showMachineStatus ? "Hide Details" : "Show Details"}
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             {showMachineStatus && (
//               <CardContent>
//                 <div className="max-h-[400px] overflow-y-auto pr-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//                     {occupiedMachines.length > 0 ? (
//                       occupiedMachines.map(machine => renderMachineCard(machine, true))
//                     ) : (
//                       <div className="col-span-3 text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
//                         <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
//                         <p>No occupied machines</p>
//                         <p className="text-sm">All machines are available</p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {availableMachines.length > 0 ? (
//                       availableMachines.map(machine => renderMachineCard(machine, false))
//                     ) : (
//                       <div className="col-span-3 text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
//                         <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
//                         <p>No available machines</p>
//                         <p className="text-sm">All machines are occupied</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//               </CardContent>
//             )}
//           </Card>
//         )}

//         {/* Rest of your components remain the same */}
//         {/* Filters */}
//         <Card className="shadow-sm rounded-xl">
//           <CardContent className="pt-6 space-y-4">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search by project, test name, document number, or equipment..."
//                   className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//                   <SelectTrigger className="w-full md:w-[150px] border-gray-300">
//                     <SelectValue placeholder="Priority" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Priority</SelectItem>
//                     <SelectItem value="high">High</SelectItem>
//                     <SelectItem value="medium">Medium</SelectItem>
//                     <SelectItem value="low">Low</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Select value={dateFilter} onValueChange={setDateFilter}>
//                   <SelectTrigger className="w-full md:w-[150px] border-gray-300">
//                     <SelectValue placeholder="Date Range" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Dates</SelectItem>
//                     <SelectItem value="today">Today</SelectItem>
//                     <SelectItem value="tomorrow">Tomorrow</SelectItem>
//                     <SelectItem value="week">This Week</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 {(searchQuery || priorityFilter !== "all" || dateFilter !== "all") && (
//                   <Button
//                     variant="outline"
//                     className="hover:bg-gray-100"
//                     onClick={() => {
//                       setSearchQuery("");
//                       setPriorityFilter("all");
//                       setDateFilter("all");
//                     }}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {userMode === "admin" && (
//               <div className="flex justify-end">
//                 <Button
//                   onClick={() => setShowCreateModal(true)}
//                   className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
//                 >
//                   <Plus className="h-4 w-4" />
//                   Create New Test
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Create/Edit Modal */}
//         {(showCreateModal || editingTest) && userMode === "admin" && (
//           <Card className="shadow-lg rounded-xl border-2 border-blue-500">
//             <CardHeader className="bg-blue-50">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 {editingTest ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
//                 {editingTest ? "Edit Test" : "Create New Test"}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Project Name *</label>
//                   <Input
//                     value={formData.project}
//                     onChange={(e) => setFormData({ ...formData, project: e.target.value })}
//                     placeholder="Enter project name"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Document Number</label>
//                   <Input
//                     value={formData.documentNumber}
//                     onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
//                     placeholder="DOC-XXXX-XXX"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Test Name *</label>
//                   <Select value={formData.testName} onValueChange={(value) => setFormData({ ...formData, testName: value })}>
//                     <SelectTrigger className="mt-1">
//                       <SelectValue placeholder="Select test" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {flaskData.map((test) => (
//                         <SelectItem key={test.testName} value={test.testName}>
//                           {test.testName} ({test.equipment})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Equipment *</label>
//                   <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
//                     <SelectTrigger className="mt-1">
//                       <SelectValue placeholder="Select equipment" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {getAvailableMachinesForDropdown().map((machine) => (
//                         <SelectItem key={machine.id} value={machine.name}>
//                           {machine.name} - Available
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {formData.equipment && (
//                     <p className="text-xs text-green-600 mt-1">
//                       ✓ This machine is available for scheduling
//                     </p>
//                   )}
//                 </div>
//                 {/* Rest of form fields */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Scheduled Date *</label>
//                   <Input
//                     type="date"
//                     value={formData.scheduledDate}
//                     onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Scheduled Time</label>
//                   <Input
//                     type="time"
//                     value={formData.scheduledTime}
//                     onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Duration</label>
//                   <Input
//                     value={formData.duration}
//                     onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
//                     placeholder="e.g., 24 hours"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Priority</label>
//                   <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
//                     <SelectTrigger className="mt-1">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="High">High</SelectItem>
//                       <SelectItem value="Medium">Medium</SelectItem>
//                       <SelectItem value="Low">Low</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Status</label>
//                   <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
//                     <SelectTrigger className="mt-1">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Scheduled">Scheduled</SelectItem>
//                       <SelectItem value="Ready to Start">Ready to Start</SelectItem>
//                       <SelectItem value="Pending Approval">Pending Approval</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Sample Quantity *</label>
//                   <Input
//                     type="number"
//                     value={formData.sampleQty}
//                     onChange={(e) => setFormData({ ...formData, sampleQty: e.target.value })}
//                     placeholder="Enter quantity"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Test Location</label>
//                   <Input
//                     value={formData.testLocation}
//                     onChange={(e) => setFormData({ ...formData, testLocation: e.target.value })}
//                     placeholder="Lab A, Lab B, etc."
//                     className="mt-1"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Test Condition</label>
//                   <Input
//                     value={formData.testCondition}
//                     onChange={(e) => setFormData({ ...formData, testCondition: e.target.value })}
//                     placeholder="Enter test conditions"
//                     className="mt-1"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3 mt-6">
//                 <Button variant="outline" onClick={resetForm}>
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={editingTest ? handleUpdateTest : handleCreateTest}
//                   className="bg-blue-600 hover:bg-blue-700 text-white"
//                 >
//                   {editingTest ? "Update Test" : "Create Test"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Upcoming Tests Table */}
//         <Card className="shadow-sm rounded-xl">
//           <CardHeader>
//             <CardTitle className="text-lg flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-blue-600" />
//               Upcoming Tests Schedule
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50 border-b">
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Project</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Test Name</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Equipment</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Date</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Time</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Duration</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Samples</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Priority</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Status</th>
//                     <th className="text-left p-3 font-semibold text-sm text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTests.length > 0 ? (
//                     filteredTests.map((test) => (
//                       <tr key={test.id} className="border-b hover:bg-gray-50 transition-colors text-sm">
//                         <td className="p-3 font-medium text-gray-800">{test.project}</td>
//                         <td className="p-3 text-gray-800">{test.testName}</td>
//                         <td className="p-3 text-gray-600">{test.equipment}</td>
//                         <td className="p-3 text-gray-800">{test.scheduledDate}</td>
//                         <td className="p-3 text-gray-600">{test.scheduledTime}</td>
//                         <td className="p-3 text-gray-600">{test.duration}</td>
//                         <td className="p-3 text-gray-800">{test.sampleQty}</td>
//                         <td className="p-3">
//                           <Badge className={`${getPriorityColor(test.priority)} text-white text-xs px-2 py-1`}>
//                             {test.priority}
//                           </Badge>
//                         </td>
//                         <td className="p-3">
//                           <Badge className={`${getStatusColor(test.status)} text-white text-xs px-2 py-1 flex items-center gap-1 w-fit`}>
//                             {getStatusIcon(test.status)}
//                             {test.status}
//                           </Badge>
//                         </td>
//                         <td className="p-3">
//                           <div className="flex items-center gap-2">
//                             {userMode === "admin" ? (
//                               <>
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="hover:bg-blue-50 text-blue-600"
//                                   onClick={() => handleEditClick(test)}
//                                 >
//                                   <Edit className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="hover:bg-red-50 text-red-600"
//                                   onClick={() => handleDeleteTest(test.id)}
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </>
//                             ) : (
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 className="hover:bg-blue-50 text-blue-600"
//                                 onClick={() => handleViewDetails(test)}
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </Button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={10} className="text-center py-8 text-gray-500">
//                         No upcoming tests found matching your filters
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Quick Actions */}
//         <Card className="shadow-sm rounded-xl">
//           <CardHeader>
//             <CardTitle className="text-base">Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className="flex flex-wrap gap-3">
//             <Button
//               variant="outline"
//               className="border-gray-300 hover:bg-gray-50"
//             >
//               Export Schedule
//             </Button>
//             <Button
//               variant="outline"
//               className="border-gray-300 hover:bg-gray-50"
//             >
//               Print Calendar
//             </Button>
//             {userMode === "admin" && (
//               <>
//                 <Button
//                   variant="outline"
//                   className="border-gray-300 hover:bg-gray-50"
//                 >
//                   Send Reminders
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="border-gray-300 hover:bg-gray-50"
//                   onClick={() => setShowMachineStatus(!showMachineStatus)}
//                 >
//                   View Machine Status
//                 </Button>
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default PlanningModule;



import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, X, Scan, Trash2, CheckCircle, Barcode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TestRecord {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  testStartDate: string;
  testCompletionDate: string;
  sampleConfig: string;
  status: string;
  id: number;
  createdAt: string;
  quantity: number;
  project: string[];
  line: string;
  colour: string;
  remarks: string;
}

interface ORTLabPageLocationState {
  record: TestRecord;
  reloadMode?: boolean;
  existingRecord?: any;
}

// Static barcode data for testing
const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005"
];

// Static additional parts for reload mode
const ADDITIONAL_PARTS = [
  { id: 6, partNumber: "PART006" },
  { id: 7, partNumber: "PART007" },
  { id: 8, partNumber: "PART008" },
  { id: 9, partNumber: "PART009" },
  { id: 10, partNumber: "PART010" },
];

interface ScannedPart {
  serialNumber: string;
  partNumber: string;
  scannedAt: Date;
}

const ORTLabPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as ORTLabPageLocationState | undefined;
  const selectedRecord = locationState?.record;
  const reloadMode = locationState?.reloadMode || false;
  const existingRecord = locationState?.existingRecord;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isReloadMode, setIsReloadMode] = useState(false);
  const [existingORTRecord, setExistingORTRecord] = useState<any>(null);
  const [selectedAdditionalParts, setSelectedAdditionalParts] = useState<string[]>([]);

  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Load existing scanned parts if in reload mode
  useEffect(() => {
    if (reloadMode && existingRecord) {
      setIsReloadMode(true);
      setExistingORTRecord(existingRecord);

      // Load existing scanned parts
      if (existingRecord.ortLab?.scannedParts) {
        setScannedParts(existingRecord.ortLab.scannedParts.map((part: any) => ({
          ...part,
          scannedAt: new Date(part.scannedAt)
        })));
        setSerialNumber(existingRecord.ortLab.serialNumber || "");
      }

      toast({
        title: "Reload Mode Active",
        description: `Loaded ${existingRecord.ortLab?.scannedParts?.length || 0} existing parts. You can now add more parts.`,
        duration: 4000,
      });
    }
  }, [reloadMode, existingRecord]);

  // Handle barcode input from physical scanner
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const barcodeData = barcodeInput.trim();
      if (barcodeData) {
        processBarcodeData(barcodeData);
        setBarcodeInput("");

        // Auto-refocus for next scan
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  // Process barcode data
  const processBarcodeData = (data: string) => {
    if (!data.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Barcode",
        description: "Scanned data is empty",
        duration: 2000,
      });
      return;
    }

    try {
      let serial = "";
      let partNumbers: string[] = [];

      // Check if input is a static barcode from our test data
      const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
        barcode.split(':')[0] === data.toUpperCase()
      );

      if (staticBarcode) {
        const parts = staticBarcode.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 1: SERIAL:PART1,PART2,PART3
      else if (data.includes(':') && data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 2: SERIAL:PART1 (single part)
      else if (data.includes(':') && !data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = [parts[1].trim()];
        }
      }
      // Format 3: Simple serial number only
      else {
        serial = data.trim();
      }

      // Validate serial number
      if (!serial) {
        toast({
          variant: "destructive",
          title: "Invalid Barcode Format",
          description: "No serial number found in scanned data",
          duration: 3000,
        });
        return;
      }

      // Set serial number
      setSerialNumber(serial);

      // Check if we've reached the required quantity (skip in reload mode)
      const requiredQuantity = selectedRecord?.quantity || 0;
      if (!isReloadMode && scannedParts.length >= requiredQuantity) {
        toast({
          variant: "destructive",
          title: "Quantity Limit Reached",
          description: `Required quantity is ${requiredQuantity}. All parts have been scanned.`,
          duration: 3000,
        });
        return;
      }

      // Add scanned parts
      const newParts: ScannedPart[] = partNumbers.map(part => ({
        serialNumber: serial,
        partNumber: part,
        scannedAt: new Date()
      }));

      // Replace the parts addition section with:
      // Check how many more parts we can add
      const remainingCapacity = isReloadMode
        ? 999 // Allow unlimited additional parts in reload mode
        : requiredQuantity - scannedParts.length;
      const partsToAdd = newParts.slice(0, remainingCapacity);

      if (partsToAdd.length > 0) {
        setScannedParts(prev => [...prev, ...partsToAdd]);

        const messagePrefix = isReloadMode ? "Additional" : "";
        toast({
          title: `${messagePrefix} Parts Scanned`,
          description: `Added ${partsToAdd.length} part(s) to serial ${serial}${isReloadMode ? ' (Reload Mode)' : ''}`,
          duration: 2000,
        });

        // Check if we reached required quantity (only in normal mode)
        if (!isReloadMode && scannedParts.length + partsToAdd.length >= requiredQuantity) {
          toast({
            title: "All Parts Scanned!",
            description: `All ${requiredQuantity} parts have been scanned successfully.`,
            duration: 3000,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Add More Parts",
          description: `Required quantity ${requiredQuantity} already reached.`,
          duration: 3000,
        });
      }

    } catch (error) {
      console.error("Barcode processing error:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Failed to process barcode data. Please check the format.",
        duration: 3000,
      });
    }
  };

  // Test with static barcode data
  const testWithStaticBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
    processBarcodeData(barcode);
    setBarcodeInput("");
  };

  // Clear all scanned data
  const clearScannedData = () => {
    setSerialNumber("");
    setScannedParts([]);
    setBarcodeInput("");
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    toast({
      title: "Data Cleared",
      description: "All scanned data has been cleared",
      duration: 2000,
    });
  };

  // Start/Stop camera scanner
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setShowScanner(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        duration: 3000,
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setShowScanner(false);
  };

  // Toggle additional part selection
  const toggleAdditionalPart = (partNumber: string) => {
    setSelectedAdditionalParts(prev => {
      if (prev.includes(partNumber)) {
        return prev.filter(p => p !== partNumber);
      } else {
        return [...prev, partNumber];
      }
    });
  };

  // Check if a part is already scanned
  const isPartAlreadyScanned = (partNumber: string) => {
    return scannedParts.some(part => part.partNumber === partNumber);
  };

  // Add selected additional parts to scanned parts
  const addSelectedAdditionalParts = () => {
    if (selectedAdditionalParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Selected",
        description: "Please select at least one part to add.",
        duration: 2000,
      });
      return;
    }

    if (!serialNumber) {
      toast({
        variant: "destructive",
        title: "Serial Number Required",
        description: "Please scan or enter a serial number first.",
        duration: 2000,
      });
      return;
    }

    // Create new scanned parts from selection
    const newParts: ScannedPart[] = selectedAdditionalParts.map(partNumber => ({
      serialNumber: serialNumber,
      partNumber: partNumber,
      scannedAt: new Date()
    }));

    setScannedParts(prev => [...prev, ...newParts]);

    toast({
      title: "Additional Parts Added",
      description: `Successfully added ${newParts.length} additional part(s) to serial ${serialNumber}`,
      duration: 2000,
    });

    // Clear selection
    setSelectedAdditionalParts([]);
  };

  const handleORTSubmit = () => {
    if (!selectedRecord) return;

    const requiredQuantity = selectedRecord.quantity;

    // In reload mode, just need at least one part
    // In normal mode, need all required parts
    if (!isReloadMode && scannedParts.length < requiredQuantity) {
      toast({
        variant: "destructive",
        title: "Incomplete Scanning",
        description: `Only ${scannedParts.length} of ${requiredQuantity} parts scanned. Please scan all required parts.`,
        duration: 3000,
      });
      return;
    }

    if (isReloadMode && scannedParts.length === existingORTRecord?.ortLab?.scannedParts?.length) {
      toast({
        variant: "destructive",
        title: "No New Parts Added",
        description: "Please scan at least one new part before submitting.",
        duration: 3000,
      });
      return;
    }

    try {
      // Retrieve existing ORT records
      const existingORTData = localStorage.getItem("ortLabRecords");
      const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];

      if (isReloadMode && existingORTRecord) {
        // UPDATE existing record
        const updatedORTData = {
          ...existingORTRecord,
          ortLab: {
            ...existingORTRecord.ortLab,
            serialNumber: serialNumber,
            scannedParts: scannedParts,
            totalParts: scannedParts.length,
            lastUpdatedAt: new Date().toISOString(),
            updateCount: (existingORTRecord.ortLab?.updateCount || 0) + 1
          }
        };

        // Find and update the existing record
        const updatedRecords = ortRecords.map((record: any) =>
          record.ortLabId === existingORTRecord.ortLabId ? updatedORTData : record
        );

        localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

        toast({
          title: "ORT Lab Updated!",
          description: `Record updated with ${scannedParts.length} total parts (added ${scannedParts.length - (existingORTRecord.ortLab?.scannedParts?.length || 0)} new parts).`,
          duration: 4000,
        });

        // Navigate back to QRT checklist
        navigate("/qrtchecklist", {
          state: {
            record: selectedRecord,
            ortData: updatedORTData
          }
        });

      } else {
        // CREATE new record (existing logic)
        const ortLabId = Date.now();
        const ortLabData = {
          ...selectedRecord,
          ortLabId: ortLabId,
          ortLab: {
            submissionId: ortLabId,
            date: new Date().toISOString().split('T')[0],
            serialNumber: serialNumber,
            scannedParts: scannedParts,
            totalParts: scannedParts.length,
            requiredQuantity: requiredQuantity,
            submittedAt: new Date().toISOString(),
            updateCount: 0
          }
        };

        ortRecords.push(ortLabData);
        localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));

        toast({
          title: "ORT Lab Completed!",
          description: `${scannedParts.length} parts scanned and assigned successfully.`,
          duration: 4000,
        });

        navigate("/qrtchecklist", {
          state: {
            record: selectedRecord,
            ortData: ortLabData
          }
        });
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error processing the request. Please try again.",
        duration: 3000,
      });
      console.error("Error:", error);
    }
  };

  if (!selectedRecord) {
    return (
      <div className="mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No record selected. Please go back and select a record.</div>
            {/* <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredQuantity = selectedRecord.quantity || 0;
  const scannedCount = scannedParts.length;
  const remainingCount = isReloadMode ? 0 : Math.max(0, requiredQuantity - scannedCount);
  const isComplete = isReloadMode
    ? scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0)
    : scannedCount >= requiredQuantity;

  return (
    <div className="mx-auto p-6 ">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Test Checklist
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            ORT Lab - Part Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">

          {/* Serial Number Input - Show in reload mode */}
          {isReloadMode && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-lg text-purple-800 mb-3 flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Serial Number
              </h3>
              <div className="space-y-2">
                <Label htmlFor="serialNumberInput" className="text-base font-medium">
                  Serial Number {!serialNumber && <span className="text-red-600">*</span>}
                </Label>
                <Input
                  id="serialNumberInput"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="Enter serial number (e.g., SN001)"
                  className="h-12 font-mono text-lg border-2 border-purple-300 focus:border-purple-500"
                />
                {serialNumber && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Serial Number: {serialNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* OQC Form Data Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              OQC Form Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Quantity Required</Label>
                <div className="text-xl font-bold">{selectedRecord.quantity}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Project(s)</Label>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(selectedRecord.project) && selectedRecord.project.length > 0 ? (
                    selectedRecord.project.map((proj, index) => (
                      <div key={index} className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {proj}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm font-medium">{selectedRecord.projectName}</div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Line</Label>
                <div className="text-sm font-medium">{selectedRecord.line || "N/A"}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Colour</Label>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border"
                    style={{
                      backgroundColor: selectedRecord.colour === "N/A" ? "#ccc" :
                        selectedRecord.colour?.includes("NDA") ? "#4f46e5" :
                          selectedRecord.colour?.includes("LB") ? "#10b981" :
                            selectedRecord.colour?.includes("SD") ? "#f59e0b" : selectedRecord.color || "#ccc"
                    }}
                  />
                  <span className="text-sm font-medium">{selectedRecord.colour || selectedRecord.color || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status Banner */}
          {/* {isComplete && !isReloadMode && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">All Parts Scanned!</h3>
                  <p className="text-green-700 text-sm">
                    {scannedCount} parts have been scanned. Ready to submit.
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Reload Mode - Ready to Update Banner */}
          {isReloadMode && scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0) && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Additional Parts Added!</h3>
                  <p className="text-blue-700 text-sm">
                    {scannedCount - (existingORTRecord?.ortLab?.scannedParts?.length || 0)} new part(s) added.
                    Total: {scannedCount} parts. Ready to update.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Required</p>
                  <p className="text-3xl font-bold">{requiredQuantity}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Scanned</p>
                  <p className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                    {scannedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className={`text-3xl font-bold ${remainingCount === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {remainingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barcode Scanner Section */}
          <div className="mb-6 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode Scanner
              </h3>
              <Button
                variant="outline"
                onClick={clearScannedData}
                disabled={!serialNumber && scannedParts.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {/* Barcode Input */}
              <div className="space-y-2">
                <Label htmlFor="barcodeInput" className="text-base font-medium">
                  Scanner Input <span className="text-red-600">*</span>
                </Label>
                <Input
                  ref={barcodeInputRef}
                  id="barcodeInput"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
                  className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
                  autoFocus
                  disabled={isComplete}
                />
                {/* {isComplete && (
                  <p className="text-sm text-green-600 font-medium">
                    All parts scanned. Ready to submit.
                  </p>
                )} */}
              </div>

              {/* Test Barcode Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Test Barcodes (Click to simulate scan):
                </Label>
                <div className="flex flex-wrap gap-2">
                  {STATIC_BARCODE_DATA.map((barcode, index) => (
                    <Button
                      key={`test-barcode-${barcode}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
                      className="text-xs font-mono"
                      disabled={isComplete}
                    >
                      {barcode.split(':')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Camera Scanner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Camera Scanner:
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={startScanner}
                    disabled={showScanner || isComplete}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Camera Scanner
                  </Button>
                  {showScanner && (
                    <Button
                      variant="destructive"
                      onClick={stopScanner}
                    >
                      Stop Scanner
                    </Button>
                  )}
                </div>
              </div>

              {/* Scanner Status */}
              {/* <div className="p-3 bg-white rounded border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Serial Number: {serialNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isComplete ? 'Complete' : `${scannedCount}/${requiredQuantity} parts scanned`}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Camera Preview */}
          {showScanner && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Camera Preview:
              </Label>
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-64 h-32 border-2 border-green-400 rounded-lg"></div>
                </div>
              </div>
            </div>
          )}


          {/* Additional Parts Section - Only show in reload mode */}
          {isReloadMode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-green-800 flex items-center gap-2">
                  <Barcode className="h-5 w-5" />
                  Add Additional Parts (PART006 - PART010)
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Click to select additional parts to add to existing record
                </p>
              </div>

              {!serialNumber && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Please enter or scan a serial number first before selecting additional parts
                  </p>
                </div>
              )}

              {/* Additional Parts Grid - 5 Buttons */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {ADDITIONAL_PARTS.map((part) => {
                  const isSelected = selectedAdditionalParts.includes(part.partNumber);
                  const alreadyScanned = isPartAlreadyScanned(part.partNumber);

                  return (
                    <button
                      key={part.id}
                      onClick={() => !alreadyScanned && serialNumber && toggleAdditionalPart(part.partNumber)}
                      disabled={alreadyScanned || !serialNumber}
                      className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${alreadyScanned
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'bg-green-500 border-green-600 shadow-lg transform scale-105 cursor-pointer'
                            : 'bg-white border-green-200 hover:border-green-400 hover:shadow-md hover:scale-102 cursor-pointer'
                        }
              ${!serialNumber && !alreadyScanned ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                      <div className="flex justify-center mb-2">
                        {alreadyScanned ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : isSelected ? (
                          <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className={`font-mono text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {part.partNumber}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                        {part.description}
                      </div>
                      {alreadyScanned && (
                        <div className="text-xs text-green-600 font-medium mt-2">
                          Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selection Summary and Add Button */}
              {selectedAdditionalParts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-gray-700">
                    Selected: <span className="text-green-700 font-bold">{selectedAdditionalParts.length}</span> part(s)
                    <span className="text-gray-500 ml-2">
                      ({selectedAdditionalParts.join(', ')})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAdditionalParts([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={addSelectedAdditionalParts}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Add {selectedAdditionalParts.length} Part(s)
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-gray-500">Available</div>
                    <div className="text-lg font-bold text-green-700">
                      {ADDITIONAL_PARTS.length - scannedParts.filter(p =>
                        ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
                      ).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Selected</div>
                    <div className="text-lg font-bold text-blue-700">
                      {selectedAdditionalParts.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Already Added</div>
                    <div className="text-lg font-bold text-gray-700">
                      {scannedParts.filter(p =>
                        ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
                      ).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple Scanned Parts Display */}
          {scannedParts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-700">
                  Scanned Parts ({scannedParts.length} {isReloadMode ? 'total' : `of ${requiredQuantity}`})
                </h3>
              </div>

              <div className="p-4 bg-white border rounded-lg">
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-500">Serial Number</div>
                  <div className="font-mono text-lg font-bold">{serialNumber}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Parts</div>
                  <div className="font-mono p-3 bg-gray-50 rounded border text-gray-800">
                    {scannedParts.map(part => part.partNumber).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleORTSubmit}
              disabled={!isComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isReloadMode ? "Update ORT Lab" : "Submit ORT Lab"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ORTLabPage;
