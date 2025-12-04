// import { useState, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Package, TestTube, Upload, TrendingUp, Search, Clock, CheckCircle2, AlertCircle, Activity, Calendar, Filter } from "lucide-react";
// import { Progress } from "@/components/ui/progress";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [timeFilter, setTimeFilter] = useState("all"); // "today", "week", "month", "year", "all"
//   const navigate = useNavigate();

//   const testRecords = JSON.parse(localStorage.getItem('stage2Records') || '[]');

//   // Function to parse equipment data from stage2Records - ONLY for Under Testing status
//   const getMachineDetails = () => {
//     const machineDetails = [];

//     testRecords.forEach((record: any) => {
//       if (record.status === "Received" && record.stage2 && record.stage2.equipment) {
//         const equipmentList = record.stage2.equipment.split(',').map((equipment: string) => equipment.trim());

//         equipmentList.forEach((equipment: string, index: number) => {
//           const testNames = record.stage2.testName ? record.stage2.testName.split(',').map((name: string) => name.trim()) : [];

//           machineDetails.push({
//             id: `${record.id}-${index}`,
//             machineName: equipment,
//             project: record.projectName,
//             documentNumber: record.documentNumber,
//             status: record.status,
//             testName: testNames[index] || '-',
//             processStage: record.stage2.processStage || '-',
//             requiredQty: record.stage2.requiredQty ? record.stage2.requiredQty.split(',')[index]?.trim() : '-',
//             testCondition: record.stage2.testCondition ? record.stage2.testCondition.split(',')[index]?.trim() : '-',
//             testStartDate: record.testStartDate,
//             testCompletionDate: record.testCompletionDate
//           });
//         });
//       }
//     });

//     return machineDetails;
//   };

//   // Get machine details (only for Under Testing status)
//   const machineDetails = getMachineDetails();

//   // Helper function to filter records by time period
//   const filterRecordsByTime = (records: any[], period: string) => {
//     const now = new Date();

//     switch (period) {
//       case "today":
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         return records.filter(record => {
//           const recordDate = new Date(record.testStartDate || record.createdDate);
//           return recordDate >= today;
//         });

//       case "week":
//         const weekAgo = new Date();
//         weekAgo.setDate(weekAgo.getDate() - 7);
//         return records.filter(record => {
//           const recordDate = new Date(record.testStartDate || record.createdDate);
//           return recordDate >= weekAgo;
//         });

//       case "month":
//         const monthAgo = new Date();
//         monthAgo.setMonth(monthAgo.getMonth() - 1);
//         return records.filter(record => {
//           const recordDate = new Date(record.testStartDate || record.createdDate);
//           return recordDate >= monthAgo;
//         });

//       case "year":
//         const yearAgo = new Date();
//         yearAgo.setFullYear(yearAgo.getFullYear() - 1);
//         return records.filter(record => {
//           const recordDate = new Date(record.testStartDate || record.createdDate);
//           return recordDate >= yearAgo;
//         });

//       default:
//         return records;
//     }
//   };

//   // Calculate quantity statistics
//   const quantityStats = useMemo(() => {
//     const filteredRecords = filterRecordsByTime(testRecords, timeFilter);

//     // Get ortLabRecords from localStorage
//     const ortLabRecords = JSON.parse(localStorage.getItem('ortLabRecords') || '[]');

//     // Calculate total scanned parts from all ortLabRecords
//     const totalScannedParts = ortLabRecords.reduce((total: number, record: any) => {
//       if (record.ortLab && record.ortLab.scannedPartNumbers) {
//         return total + record.ortLab.scannedPartNumbers.length;
//       }
//       return total;
//     }, 0);

//     // Calculate total selected parts from all stage2Records
//     const totalSelectedParts = testRecords.reduce((total: number, record: any) => {
//       if (record.stage2 && record.stage2.selectedParts) {
//         return total + record.stage2.selectedParts.length;
//       }
//       return total;
//     }, 0);

//     const totalQuantity = filteredRecords.reduce((sum, record) => {
//       return sum + (parseInt(record.sampleQty) || 0);
//     }, 0);

//     const completedQuantity = filteredRecords.reduce((sum, record) => {
//       if (record.status === "Completed") {
//         return sum + (parseInt(record.sampleQty) || 0);
//       }
//       return sum;
//     }, 0);

//     const testingQuantity = filteredRecords.reduce((sum, record) => {
//       if (record.status === "Received" || record.status === "Under Testing") {
//         return sum + (parseInt(record.sampleQty) || 0);
//       }
//       return sum;
//     }, 0);

//     const scheduledQuantity = filteredRecords.reduce((sum, record) => {
//       if (record.status === "Scheduled" || record.status === "In-progress") {
//         return sum + (parseInt(record.sampleQty) || 0);
//       }
//       return sum;
//     }, 0);

//     return {
//       total: totalQuantity,
//       completed: completedQuantity,
//       testing: testingQuantity,
//       scheduled: scheduledQuantity,
//       scannedParts: totalScannedParts,
//       selectedParts: totalSelectedParts // Add selected parts count
//     };
//   }, [testRecords, timeFilter]);

//   const allProducts = testRecords.map((record: any) => {
//     let status = "";
//     let statusColor = "";

//     if (record.status === "Completed") {
//       status = "Completed";
//       statusColor = "bg-green-800";
//     } else if (record.status === "Received") {
//       status = "Under Testing";
//       statusColor = "bg-blue-800";
//     } else if (record.status === "In-progress" || record.status === "In-Progress") {
//       status = "";
//       statusColor = "";
//     } else {
//       status = "Under Testing";
//       statusColor = "bg-blue-800";
//     }

//     return {
//       id: record.documentNumber,
//       batch: record.projectName,
//       owner: record.testLocation,
//       qqc: record.testStartDate,
//       cmr: record.testCompletionDate,
//       testProgress: {
//         completed: record.status === "Completed" ? parseInt(record.sampleQty) : 0,
//         total: parseInt(record.sampleQty)
//       },
//       status,
//       statusColor,
//       sampleQty: parseInt(record.sampleQty) || 0,
//       testStartDate: record.testStartDate
//     };
//   });

//   // Count status for stats
//   const statusCounts = allProducts.reduce((acc: any, product: any) => {
//     if (product.status === 'Under Testing') acc.underTesting++;
//     if (product.status === 'Completed') acc.completed++;
//     if (product.status === 'Scheduled') acc.scheduled++;
//     return acc;
//   }, { underTesting: 0, completed: 0, scheduled: 0 });

//   const stats = {
//     totalProducts: allProducts.length || 0,
//     underTesting: statusCounts.underTesting || 0,
//     completed: statusCounts.completed || 0,
//     scheduled: statusCounts.scheduled || 0
//   };

//   // Get top 5 products (most recent or by some criteria)
//   const topProducts = allProducts.slice(0, 5);

//   // Use topProducts instead of allProducts in filteredProducts
//   const filteredProducts = topProducts.filter((product: { id: string; batch: string; owner: string; status: string; }) => {
//     const matchesSearch = searchQuery === "" ||
//       product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       product.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       product.owner.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesStatus = statusFilter === "all" ||
//       (statusFilter === "testing" && product.status === "Under Testing") ||
//       (statusFilter === "complete" && product.status === "Completed");

//     return matchesSearch && matchesStatus;
//   });

//   const activeTests = [
//     { name: "Salt Spray", status: "not done", statusColor: "bg-gray-700" },
//     { name: "Thermal Cycle", status: "warning", statusColor: "bg-[#e0413a] " },
//     { name: "Drop Test", status: "complete", statusColor: "bg-blue-800" },
//     { name: "Push/Pull", status: "not done", statusColor: "bg-green-800" },
//     { name: "Torque Test", status: "2h", statusColor: "bg-gray-700" }
//   ];

//   const systemStatus = [
//     { name: "Database", status: "Active", statusColor: "bg-green-800" },
//     { name: "Test Equipment", status: "Active", statusColor: "bg-green-800" },
//     { name: "Image Upload", status: "Active", statusColor: "bg-green-800" },
//     { name: "Last Sync", status: "2 min ago", statusColor: "bg-gray-800" }
//   ];

//   const rightSideMenuItems = [
//     {
//       title: "Machine details",
//       subtitle: `${machineDetails.length} Equipment${machineDetails.length !== 1 ? 's' : ''} Under Testing`,
//       data: machineDetails
//     },
//     { title: "Chemicals", subtitle: "and stock details" },
//     { title: "Fixture details" },
//     { title: "Machine availability" },
//     { title: "Daily check points" }
//   ];

//   const handleQuickAction = (action: string) => {
//     alert(`${action} clicked! This would open the respective module.`);
//   };

//   const handleRightMenuClick = (title: string) => {
//     alert(`Navigating to ${title}`);
//   };

//   // Get time filter label
//   const getTimeFilterLabel = () => {
//     switch (timeFilter) {
//       case "today": return "Today";
//       case "week": return "This Week";
//       case "month": return "This Month";
//       case "year": return "This Year";
//       default: return "All Time";
//     }
//   };

//   return (
//     <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
//       <div className="p-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col gap-1">
//           <h1 className="text-3xl font-bold text-gray-800 tracking-tight">ORT Digitalization Dashboard</h1>
//           <p className="text-sm text-gray-500">Real-time product testing and quality control</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Left Section */}
//           <div className="lg:col-span-3 space-y-6">
//             {/* Time Filter */}
//             <Card className="shadow-sm rounded-xl">
//               <CardContent className="pt-6">
//                 <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-gray-400" />
//                     <span className="text-sm font-medium text-gray-700">Time Period:</span>
//                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                       {getTimeFilterLabel()}
//                     </Badge>
//                   </div>
//                   <div className="flex gap-2">
//                     <Select value={timeFilter} onValueChange={setTimeFilter}>
//                       <SelectTrigger className="w-full md:w-[180px] border-gray-300 focus:border-blue-500">
//                         <SelectValue placeholder="Select Period" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Time</SelectItem>
//                         <SelectItem value="today">Today</SelectItem>
//                         <SelectItem value="week">This Week</SelectItem>
//                         <SelectItem value="month">This Month</SelectItem>
//                         <SelectItem value="year">This Year</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Stats - Products Count */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[
//                 { icon: Package, color: "blue", title: "Total Products", value: stats.totalProducts, sub: "+10% vs last month" },
//                 { icon: TestTube, color: "purple", title: "Under Testing", value: stats.underTesting, action: "testing" },
//                 { icon: CheckCircle2, color: "green", title: "Completed", value: stats.completed, action: "complete" },
//                 { icon: Clock, color: "orange", title: "Scheduled", value: stats.scheduled, action: "scheduled" },
//               ].map((item, i) => (
//                 <Card
//                   key={i}
//                   onClick={item.action ? () => setStatusFilter(item.action) : undefined}
//                   className={`border-t-4 border-t-${item.color}-500 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white`}
//                 >
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
//                       <item.icon className="h-4 w-4" /> {item.title}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-3xl font-bold">{item.value}</div>
//                     {item.sub && <p className="text-xs text-green-600 mt-1">{item.sub}</p>}
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Quantity Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[
//                 { icon: Package, color: "indigo", title: "Total Parts", value: quantityStats.scannedParts, sub: "Scanned parts in system" },                // { icon: TestTube, color: "purple", title: "Parts Testing", value: quantityStats.testing, action: "testing" },
//                 // { icon: CheckCircle2, color: "green", title: "Parts Completed", value: quantityStats.completed, action: "complete" },
//                 // { icon: Clock, color: "orange", title: "Parts Scheduled", value: quantityStats.scheduled, action: "scheduled" },
//               ].map((item, i) => (
//                 <Card
//                   key={i}
//                   className={`border-t-4 border-t-${item.color}-500 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white`}
//                 >
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-xs font-semibold text-gray-600 flex items-center gap-2">
//                       <item.icon className="h-4 w-4" /> {item.title}
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-3xl font-bold">{item.value}</div>
//                     <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Search */}
//             <Card className="shadow-sm rounded-xl">
//               <CardContent className="pt-6 space-y-4">
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <div className="flex-1 relative">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       placeholder="Search by Product ID, Batch, or Owner..."
//                       className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                       <SelectTrigger className="w-full md:w-[180px] border-gray-300 focus:border-blue-500">
//                         <SelectValue placeholder="All Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Status</SelectItem>
//                         <SelectItem value="testing">Under Testing</SelectItem>
//                         <SelectItem value="complete">Complete</SelectItem>
//                         <SelectItem value="scheduled">Scheduled</SelectItem>
//                         <SelectItem value="inqueue">In Queue</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {(searchQuery || statusFilter !== "all") && (
//                       <Button variant="outline" className="hover:bg-gray-100" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
//                         Clear
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Active Products */}
//             {/* Active Products */}
//             <Card className="shadow-sm rounded-xl">
//               <CardHeader>
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Activity className="h-5 w-5 text-blue-600" />
//                   Active Products
//                   <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
//                     {getTimeFilterLabel()}
//                   </Badge>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {filteredProducts.map((product, index) => {
//                     // Find the corresponding stage2 record to get selected parts count
//                     const stage2Record = testRecords.find((record: any) => record.documentNumber === product.id);
//                     const selectedPartsCount = stage2Record?.stage2?.selectedParts?.length || 0;
//                     const selectedParts = stage2Record?.stage2?.selectedParts?.join(',') || "None";

//                     return (
//                       <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
//                         <div className="flex items-start justify-between mb-3">
//                           <div>
//                             <h3 className="font-semibold text-lg text-gray-800">{product.id}</h3>
//                             <p className="text-sm text-gray-600">{product.batch || "No batch assigned"}</p>
//                           </div>
//                           <div className="flex flex-col items-end gap-2">
//                             <Badge className={`${product.statusColor} text-white text-xs px-3 py-1`}>{product.status}</Badge>
//                             <Badge variant="outline" className="text-xs bg-gray-50">
//                               Qty: {selectedPartsCount}
//                             </Badge>
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
//                           <div><span className="text-gray-500">👤 Owner:</span> <span className="font-medium">{product.owner}</span></div>
//                           <div><span className="text-gray-500">📅 QQC:</span> <span>{product.qqc || "N/A"}</span></div>
//                           <div><span className="text-gray-500">🕐 CMR:</span> <span>{product.cmr}</span></div>
//                           <div><span className="text-gray-500">📦 Selected Parts:</span> <span className="font-medium">{selectedParts}</span></div>
//                         </div>
//                         <div>
//                           <div className="flex justify-between text-sm mb-1 text-gray-700">
//                             <span>Test Progress</span>
//                             <span className="font-medium">
//                               {product?.testProgress?.completed || 0}/{product?.testProgress?.total || 0} Tests
//                             </span>
//                           </div>
//                           <Progress value={(product.testProgress.completed / product.testProgress.total) * 100} />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Rest of the components remain the same */}
//             {/* Active Tests + Quick Actions */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <Card className="shadow-sm rounded-xl">
//                 <CardHeader>
//                   <CardTitle className="text-base flex items-center gap-2 text-gray-800">
//                     <TrendingUp className="h-5 w-5 text-blue-600" />
//                     Active Tests Overview
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {activeTests.map((test, index) => (
//                       <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition">
//                         <span className="text-sm font-medium text-gray-700">{test.name}</span>
//                         <Badge className={`${test.statusColor} text-white text-xs px-3`}>{test.status}</Badge>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="shadow-sm rounded-xl">
//                 <CardHeader>
//                   <CardTitle className="text-base text-gray-800">⚡ Quick Actions</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg" onClick={() => navigate(`/qrtchecklist`)}>
//                     New Product Check-in
//                   </Button>
//                   <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-lg" onClick={() => navigate(`/oqcpage`)}>
//                     Start New Test
//                   </Button>
//                   <Button className="w-full bg-gray-500 text-white hover:bg-gray-600 rounded-lg" onClick={() => navigate(`/`)}>
//                     View Test Reports
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* System Status */}
//             <Card className="shadow-sm rounded-xl">
//               <CardHeader>
//                 <CardTitle className="text-base text-gray-800">System Status</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {systemStatus.map((item, index) => (
//                     <div key={index} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
//                       <div className="text-sm text-gray-600 mb-2">{item.name}</div>
//                       <Badge className={`${item.statusColor} text-white px-3 py-1 text-xs`}>{item.status}</Badge>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Sidebar */}
//           <div className="space-y-4">
//             {rightSideMenuItems.map((item, index) => (
//               <Card
//                 key={index}
//                 onClick={() => handleRightMenuClick(item.title)}
//                 className="hover:shadow-lg transition-shadow border-l-4 border-l-[#e0413a] bg-white rounded-xl"
//               >
//                 <CardContent className="p-4 space-y-1">
//                   <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
//                   {item.subtitle && <p className="text-xs text-gray-600">{item.subtitle}</p>}

//                   {/* Show machine list for Machine details - ONLY if there are machines under testing */}
//                   {item.title === "Machine details" && item.data && item.data.length > 0 && (
//                     <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
//                       {item.data.map((machine: any, machineIndex: number) => (
//                         <div key={machineIndex} className="flex items-center gap-2 text-xs">
//                           <div className={`w-2 h-2 rounded-full ${machine.status === 'Completed' ? 'bg-green-500' :
//                             machine.status === 'In-progress' ? 'bg-yellow-500' : 'bg-blue-500'
//                             }`}></div>
//                           <span className="truncate">{machine.machineName}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, TestTube, Upload, TrendingUp, Search, Clock, CheckCircle2, AlertCircle, Activity, Calendar, Filter } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const navigate = useNavigate();

  const testRecords = JSON.parse(localStorage.getItem('stage2Records') || '[]');

  // Helper function to extract date only (ignore time)
  const getDateOnly = (dateString: string) => {
    if (!dateString) {
      console.warn('Date string is missing:', dateString);
      return null;
    }

    try {
      // Extract date part before 'T' for ISO format (e.g., "2025-11-25T08:04:54.098Z" -> "2025-11-25")
      const datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      const date = new Date(datePart);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return null;
      }

      date.setHours(0, 0, 0, 0);
      return date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  };

  // Helper function to filter records by time period
  const filterRecordsByTime = (records: any[], period: string) => {

    const now = new Date();

    switch (period) {
      case "today":
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        return records.filter(record => {
          const recordDate = getDateOnly(record.stage2.submittedAt || record.testStartDate || record.createdDate);
          if (!recordDate) return false;
          return recordDate.getTime() === todayStart.getTime();
        });

      case "week":
        const weekStart = new Date();
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return records.filter(record => {
          const recordDate = getDateOnly(record.stage2.submittedAt || record.testStartDate || record.createdDate);
          if (!recordDate) return false;
          return recordDate >= weekStart && recordDate <= weekEnd;
        });

      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        return records.filter(record => {
          const recordDate = getDateOnly(record.stage2.submittedAt || record.testStartDate || record.createdDate);
          if (!recordDate) return false;
          return recordDate >= monthStart && recordDate <= monthEnd;
        });

      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        yearStart.setHours(0, 0, 0, 0);

        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);

        return records.filter(record => {
          const recordDate = getDateOnly(record.stage2.submittedAt || record.testStartDate || record.createdDate);
          if (!recordDate) return false;
          return recordDate >= yearStart && recordDate <= yearEnd;
        });

      default:
        return records;
    }
  };

  // Filter records by time first
  const timeFilteredRecords = useMemo(() => {
    return filterRecordsByTime(testRecords, timeFilter);
  }, [testRecords, timeFilter]);

  // Convert to products format
  const allProducts = useMemo(() => {
    return timeFilteredRecords.map((record: any) => {
      let status = "";
      let statusColor = "";

      if (record.status === "Completed") {
        status = "Completed";
        statusColor = "bg-green-800";
      } else if (record.status === "Received") {
        status = "Under Testing";
        statusColor = "bg-blue-800";
      } else if (record.status === "In-progress" || record.status === "In-Progress") {
        status = "In-Progress";
        statusColor = "bg-yellow-600";
      } else if (record.status === "Scheduled") {
        status = "Scheduled";
        statusColor = "bg-orange-600";
      } else {
        status = "Under Testing";
        statusColor = "bg-blue-800";
      }

      return {
        id: record.documentNumber,
        batch: record.stage2.project,
        owner: record.testLocation,
        qqc: record.testStartDate,
        cmr: record.testCompletionDate,
        testProgress: {
          completed: record.status === "Completed" ? parseInt(record.sampleQty) : 0,
          total: parseInt(record.sampleQty)
        },
        status,
        statusColor,
        sampleQty: parseInt(record.sampleQty) || 0,
        testStartDate: record.testStartDate,
        rawStatus: record.status
      };
    });
  }, [timeFilteredRecords]);

  // Calculate stats based on time-filtered products
  const stats = useMemo(() => {
    const statusCounts = allProducts.reduce((acc: any, product: any) => {
      if (product.status === 'Under Testing') acc.underTesting++;
      if (product.status === 'Completed') acc.completed++;
      if (product.status === 'Scheduled') acc.scheduled++;
      return acc;
    }, { underTesting: 0, completed: 0, scheduled: 0 });

    return {
      totalProducts: allProducts.length || 0,
      underTesting: statusCounts.underTesting || 0,
      completed: statusCounts.completed || 0,
      scheduled: statusCounts.scheduled || 0
    };
  }, [allProducts]);

  // Calculate quantity statistics
  const quantityStats = useMemo(() => {
    const ortLabRecords = JSON.parse(localStorage.getItem('stage2Records') || '[]');

    // 🔹 Count Assigned Parts Across All Records
    const totalAssignedParts = ortLabRecords.reduce((total: number, record: any) => {
      const scannedParts = record.stage2?.selectedParts || [];
      return total + scannedParts.length;
    }, 0);


    const totalSelectedParts = timeFilteredRecords.reduce((total: number, record: any) => {
      if (record.stage2?.selectedParts) {
        return total + record.stage2.selectedParts.length;
      }
      return total;
    }, 0);

    const totalQuantity = timeFilteredRecords.reduce((sum, record) => {
      return sum + (parseInt(record.sampleQty) || 0);
    }, 0);

    const completedQuantity = timeFilteredRecords.reduce((sum, record) => {
      if (record.status === "Completed") {
        return sum + (parseInt(record.sampleQty) || 0);
      }
      return sum;
    }, 0);

    const testingQuantity = timeFilteredRecords.reduce((sum, record) => {
      if (record.status === "Received" || record.status === "Under Testing") {
        return sum + (parseInt(record.sampleQty) || 0);
      }
      return sum;
    }, 0);

    const scheduledQuantity = timeFilteredRecords.reduce((sum, record) => {
      if (record.status === "Scheduled" || record.status === "In-progress") {
        return sum + (parseInt(record.sampleQty) || 0);
      }
      return sum;
    }, 0);

    return {
      total: totalQuantity,
      completed: completedQuantity,
      testing: testingQuantity,
      scheduled: scheduledQuantity,
      scannedParts: totalAssignedParts, // ⬅️ New field
      selectedParts: totalSelectedParts
    };
  }, [timeFilteredRecords]);


  // Function to get machine details from time-filtered records
  // Function to get machine details from time-filtered records
  const machineDetails = useMemo(() => {
    const details: any[] = [];

    timeFilteredRecords.forEach((record: any) => {

      if (
        (record.status === "Received") &&
        record.status !== "Completed" &&
        record.stage2 &&
        record.stage2.equipment
      ) {
        const equipmentList = record.stage2.equipment
          .split(',')
          .map((equipment: string) => equipment.trim());

        equipmentList.forEach((equipment: string, index: number) => {
          const testNames = record.stage2.testName
            ? record.stage2.testName.split(',').map((name: string) => name.trim())
            : [];

          details.push({
            id: `${record.id}-${index}`,
            machineName: equipment,
            project: record.stage2.project,
            status: record.status,
            testName: testNames[index] || '-',
            processStage: record.stage2.processStage || '-',
            requiredQty: record.stage2.requiredQty ? record.stage2.requiredQty.split(',')[index]?.trim() : '-',
            testCondition: record.stage2.testCondition ? record.stage2.testCondition.split(',')[index]?.trim() : '-',
            testStartDate: record.testStartDate,
            testCompletionDate: record.testCompletionDate
          });
        });
      }
    });

    return details;
  }, [timeFilteredRecords]);

  // Apply search and status filters to products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: any) => {
      const matchesSearch = searchQuery === "" ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.owner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "testing" && product.status === "Under Testing") ||
        (statusFilter === "complete" && product.status === "Completed") ||
        (statusFilter === "scheduled" && product.status === "Scheduled") ||
        (statusFilter === "inqueue" && product.status === "In-Progress");

      return matchesSearch && matchesStatus;
    }).slice(0, 5);
  }, [allProducts, searchQuery, statusFilter]);

  const activeTests = [
    { name: "Salt Spray", status: "not done", statusColor: "bg-gray-700" },
    { name: "Thermal Cycle", status: "warning", statusColor: "bg-[#e0413a]" },
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
    {
      title: "Machine details",
      subtitle: `${machineDetails.length} Equipment${machineDetails.length !== 1 ? 's' : ''} Under Testing`,
      data: machineDetails
    },
    { title: "Chemicals", subtitle: "and stock details" },
    { title: "Fixture details" },
    { title: "Machine availability" },
    { title: "Daily check points" }
  ];

  const handleRightMenuClick = (title: string) => {
    alert(`Navigating to ${title}`);
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      default: return "All Time";
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">ORT Digitalization Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time product testing and quality control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Time Filter */}
            <Card className="shadow-sm rounded-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Time Period:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {getTimeFilterLabel()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-full md:w-[180px] border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats - Products Count */}
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

            {/* Quantity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, color: "indigo", title: "Total Parts", value: quantityStats.scannedParts, sub: "Scanned parts in system" },
              ].map((item, i) => (
                <Card
                  key={i}
                  className={`border-t-4 border-t-${item.color}-500 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white`}
                >
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
              </CardContent>
            </Card>

            {/* Active Products */}
            <Card className="shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Active Products
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                    {getTimeFilterLabel()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No products found matching your filters
                    </div>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const stage2Record = timeFilteredRecords.find((record: any) => record.documentNumber === product.id);
                      const selectedPartsCount = stage2Record?.stage2?.selectedParts?.length || 0;
                      const selectedParts = stage2Record?.stage2?.selectedParts?.join(',') || "None";

                      return (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">Project:{product.id}</h3>
                              <p className="text-sm text-gray-600">{product.batch || "No batch assigned"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${product.statusColor} text-white text-xs px-3 py-1`}>{product.status}</Badge>
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                Qty: {selectedPartsCount}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                            <div><span className="text-gray-500">👤 Owner:</span> <span className="font-medium">{product.owner}</span></div>
                            <div><span className="text-gray-500">📅 QQC:</span> <span>{product.qqc || "N/A"}</span></div>
                            <div><span className="text-gray-500">🕐 CMR:</span> <span>{product.cmr}</span></div>
                            <div><span className="text-gray-500">📦 Selected Parts:</span> <span className="font-medium">{selectedParts}</span></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1 text-gray-700">
                              <span>Test Progress</span>
                              <span className="font-medium">
                                {product?.testProgress?.completed || 0}/{product?.testProgress?.total || 0} Tests
                              </span>
                            </div>
                            <Progress value={(product.testProgress.completed / product.testProgress.total) * 100} />
                          </div>
                        </div>
                      );
                    })
                  )}
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
                //onClick={() => handleRightMenuClick(item.title)}
                className="hover:shadow-lg transition-shadow border-l-4 border-l-[#e0413a] bg-white rounded-xl"
              >
                <CardContent className="p-4 space-y-1">
                  <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
                  {item.subtitle && <p className="text-xs text-gray-600">{item.subtitle}</p>}

                  {item.title === "Machine details" && item.data && item.data.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                      {item.data.map((machine: any, machineIndex: number) => (
                        <div key={machineIndex} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${machine.status === 'Completed' ? 'bg-green-500' :
                            machine.status === 'In-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                          <span className="truncate">{machine.machineName}</span>
                        </div>
                      ))}
                    </div>
                  )}
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