// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
// import { testData } from "@/data/testData";
// import { useEffect, useState } from "react";

// // interface Stage2Record {
// //   documentNumber: string;
// //   documentTitle: string;
// //   projectName: string;
// //   color: string;
// //   testLocation: string;
// //   testStartDate: string;
// //   testCompletionDate: string;
// //   sampleConfig: string;
// //   status: string;
// //   id: number;
// //   createdAt: string;
// //   stage2: {
// //     processStage: string;
// //     type: string;
// //     testName: string;
// //     testCondition: string;
// //     requiredQty: string;
// //     equipment: string;
// //     submittedAt: string;
// //   };
// // }

// interface Stage2Record {
//   documentNumber: string;
//   documentTitle: string;
//   projectName: string;
//   color: string;
//   testLocation: string;
//   testStartDate: string;
//   testCompletionDate: string;
//   sampleConfig: string;
//   status: string;
//   id: number;
//   anoType: string;
//   createdAt: string;
//   stage2: {
//     processStage: string;
//     testName: string;
//     testCondition: string;
//     requiredQty: string;
//     equipment: string;
//     submittedAt: string;
//   };
//   // Add testRecords array to the interface
//   testRecords?: Array<{
//     testId: string;
//     testName: string;
//     processStage: string;
//     testIndex: number;
//     testCondition: string;
//     requiredQuantity: string;
//     specification: string;
//     machineEquipment: string;
//     machineEquipment2: string;
//     timing: string;
//     startDateTime: string;
//     endDateTime: string;
//     assignedParts: Array<{
//       id: string;
//       partNumber: string;
//       serialNumber: string;
//       location: string;
//       scanStatus: string;
//       assignedToTest: string;
//     }>;
//     assignedPartsCount: number;
//     calculations: {
//       requiredQtyNumeric: number;
//       totalRequiredQty: number;
//       proportion: string;
//       allocatedParts: number;
//       assignedCount: number;
//       remainingToAssign: number;
//       isComplete: boolean;
//     };
//     remark: string;
//     status: string;
//     submittedAt: string;
//   }>;
// }

// interface Stats {
//   activeTests: number;
//   totalProducts: number;
//   onTime: number;
//   overdue: number;
// }

// const Index = () => {
//   const [stats, setStats] = useState<Stats>({
//     activeTests: 0,
//     totalProducts: 0,
//     onTime: 0,
//     overdue: 0
//   });

//   const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);

//   // Load stage2Records from localStorage
//   useEffect(() => {
//     const loadStage2Records = () => {
//       try {
//         const storedRecords = localStorage.getItem('stage2Records');
//         console.log(storedRecords); ``
//         if (storedRecords) {
//           const records = JSON.parse(storedRecords);
//           setStage2Records(Array.isArray(records) ? records : []);
//         } else {
//           setStage2Records([]);
//         }
//       } catch (error) {
//         console.error('Error loading stage2 records:', error);
//         setStage2Records([]);
//       }
//     };

//     loadStage2Records();
//     window.addEventListener("storage", loadStage2Records);
//     return () => window.removeEventListener("storage", loadStage2Records);
//   }, []);

//   // Calculate stats from stage2Records
//   useEffect(() => {
//     const calculateStats = () => {
//       try {
//         const calculatedStats: Stats = {
//           totalProducts: stage2Records.length,
//           activeTests: stage2Records.reduce((count, record) => {
//             // Count number of tests based on testName (comma separated)
//             const testCount = record.stage2.testName.split(',').length;
//             return count + testCount;
//           }, 0),
//           onTime: stage2Records.filter((record) => record.status === 'Completed').length,
//           overdue: stage2Records.filter((record) => {
//             if (record.status === 'Completed') return false;
//             if (!record.testCompletionDate) return false;

//             const completionDate = new Date(record.testCompletionDate);
//             const today = new Date();
//             return completionDate < today;
//           }).length
//         };

//         setStats(calculatedStats);
//       } catch (error) {
//         console.error('Error calculating stats:', error);
//       }
//     };

//     calculateStats();
//   }, [stage2Records]);

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       "Completed": "bg-green-500 hover:bg-green-600 text-white",
//       "Overdue": "bg-red-500 hover:bg-red-600 text-white",
//       "Warning": "bg-yellow-500 hover:bg-yellow-600 text-white",
//       "Received": "bg-blue-500 hover:bg-blue-600 text-white"
//     };

//     const className = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pending"];
//     return <Badge className={className}>{status}</Badge>;
//   };

//   // Function to get value for table cell or return '-'
//   const getTableCellValue = (record: Stage2Record, column: string): string => {
//     switch (column) {
//       case 'project':
//         return record.projectName || '-';
//       case 'testType':
//         return record.anoType || '-';
//       case 'build':
//         return record.documentNumber || '-';
//       case 'testName':
//         return record.stage2.testName || '-';
//       case 'testCondition':
//         return record.stage2.testCondition || '-';
//       case 'duration':
//         // Calculate duration between start and completion dates
//         if (record.testStartDate && record.testCompletionDate) {
//           const start = new Date(record.testStartDate);
//           const end = new Date(record.testCompletionDate);
//           const diffTime = Math.abs(end.getTime() - start.getTime());
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//           return `${diffDays} days`;
//         }
//         return '-';
//       case 'qty':
//         return record.stage2.requiredQty || '-';
//       case 'startTime':
//         return record.testStartDate ? new Date(record.testStartDate).toLocaleDateString() : '-';
//       case 'tentativeEnd':
//         return record.testCompletionDate ? new Date(record.testCompletionDate).toLocaleDateString() : '-';
//       case 'operatorLoaded':
//         return '-'; // Not available in stage2 data
//       case 'operatorUnload':
//         return '-'; // Not available in stage2 data
//       case 'checkPoint':
//         return record.stage2.processStage || '-';
//       case 'remaining':
//         // Calculate remaining days
//         if (record.testCompletionDate) {
//           const completionDate = new Date(record.testCompletionDate);
//           const today = new Date();
//           const diffTime = completionDate.getTime() - today.getTime();
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//           return diffDays > 0 ? `${diffDays} days` : 'Overdue';
//         }
//         return '-';
//       case 'status':
//         return record.status || '-';
//       default:
//         return '-';
//     }
//   };

//   return (
//     <div className="h-full overflow-y-auto">
//       <div className="p-4 space-y-4 max-w-full">
//         {/* Header */}
//         <div className="flex items-center gap-2 mb-2">
//           <div className="h-8 w-1 bg-red-500 rounded"></div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Test Monitoring Dashboard</h1>
//             <p className="text-sm text-gray-500">Real-time test progress tracking</p>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card className="border-l-4 border-l-blue-500">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                 <Clock className="h-4 w-4" />
//                 Active Tests
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-xl font-bold text-gray-900">{stats.activeTests}</div>
//               <p className="text-xs text-gray-500 mt-1">Total individual tests running</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-purple-500">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                 <Package className="h-4 w-4" />
//                 Total Products
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-xl font-bold text-gray-900">{stats.totalProducts}</div>
//               <p className="text-xs text-gray-500 mt-1">Test records in system</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-green-500">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                 <CheckCircle2 className="h-4 w-4" />
//                 On Time
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-xl font-bold text-green-600">{stats.onTime}</div>
//               <p className="text-xs text-gray-500 mt-1">Completed successfully</p>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-red-500">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4" />
//                 Overdue
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
//               <p className="text-xs text-gray-500 mt-1">Past completion date</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Live Test Progress Table */}
//         <Card className="">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//               <CardTitle className="text-lg font-bold">Live Test Progress</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="rounded-md border h-[300px] overflow-y-auto">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-gray-50">
//                       <TableHead className="font-semibold min-w-[100px]">Project</TableHead>
//                       <TableHead className="font-semibold min-w-[140px]">Test Type</TableHead>
//                       <TableHead className="font-semibold min-w-[100px]">Build</TableHead>
//                       <TableHead className="font-semibold min-w-[150px]">Test Name</TableHead>
//                       <TableHead className="font-semibold min-w-[140px]">Test Condition</TableHead>
//                       <TableHead className="font-semibold min-w-[100px]">Duration</TableHead>
//                       <TableHead className="font-semibold min-w-[70px]">Qty</TableHead>
//                       <TableHead className="font-semibold min-w-[120px]">Start Time</TableHead>
//                       <TableHead className="font-semibold min-w-[140px]">Tentative End</TableHead>
//                       <TableHead className="font-semibold min-w-[130px]">Operator Loaded</TableHead>
//                       <TableHead className="font-semibold min-w-[130px]">Operator Unload</TableHead>
//                       <TableHead className="font-semibold min-w-[180px]">Check Point</TableHead>
//                       <TableHead className="font-semibold min-w-[100px]">Remaining</TableHead>
//                       <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   {/* <TableBody>
//                     {testData.map((test, index) => (
//                       <TableRow key={index} className="hover:bg-gray-50">
//                         <TableCell className="font-medium">{test.project}</TableCell>
//                         <TableCell>
//                           <Badge variant="outline" className="whitespace-nowrap">
//                             {test.testType}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>{test.build}</TableCell>
//                         <TableCell>{test.testName}</TableCell>
//                         <TableCell className="text-sm">{test.testCondition || '-'}</TableCell>
//                         <TableCell>{test.duration}</TableCell>
//                         <TableCell>{test.qty}</TableCell>
//                         <TableCell className="whitespace-nowrap">{test.startTime || '-'}</TableCell>
//                         <TableCell className="whitespace-nowrap">{test.tentativeEnd || '-'}</TableCell>
//                         <TableCell>{test.operatorLoaded || '-'}</TableCell>
//                         <TableCell>{test.operatorUnload || '-'}</TableCell>
//                         <TableCell className="text-sm">{test.checkPoint || '-'}</TableCell>
//                         <TableCell className="font-medium">{test.remaining || '-'}</TableCell>
//                         <TableCell>{getStatusBadge(test.status)}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody> */}
//                   <TableBody>
//                     {stage2Records.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={14} className="text-center py-8 text-gray-500">
//                           No test records found
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       stage2Records.flatMap((record) => {
//                         // Check if testRecords exists and has items
//                         if (!record.testRecords || record.testRecords.length === 0) {
//                           // Fall back to stage2 data if testRecords doesn't exist
//                           return (
//                             <TableRow key={record.id} className="hover:bg-gray-50">
//                               <TableCell className="font-medium">
//                                 {record.projectName || '-'}
//                               </TableCell>
//                               <TableCell>
//                                 <Badge variant="outline" className="whitespace-nowrap">
//                                   {record.anoType || '-'}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>{record.documentNumber || '-'}</TableCell>
//                               <TableCell>{record.stage2.testName || '-'}</TableCell>
//                               <TableCell className="text-sm">{record.stage2.testCondition || '-'}</TableCell>
//                               <TableCell>{getTableCellValue(record, 'duration')}</TableCell>
//                               <TableCell>{record.stage2.requiredQty || '-'}</TableCell>
//                               <TableCell className="whitespace-nowrap">
//                                 {getTableCellValue(record, 'startTime')}
//                               </TableCell>
//                               <TableCell className="whitespace-nowrap">
//                                 {getTableCellValue(record, 'tentativeEnd')}
//                               </TableCell>
//                               <TableCell>{getTableCellValue(record, 'operatorLoaded')}</TableCell>
//                               <TableCell>{getTableCellValue(record, 'operatorUnload')}</TableCell>
//                               <TableCell className="text-sm">{record.stage2.processStage || '-'}</TableCell>
//                               <TableCell className="font-medium">
//                                 {getTableCellValue(record, 'remaining')}
//                               </TableCell>
//                               <TableCell>{getStatusBadge(record.status || '-')}</TableCell>
//                             </TableRow>
//                           );
//                         }

//                         // Use testRecords data
//                         return record.testRecords.map((testRecord, index) => (
//                           <TableRow key={`${record.id}-${index}`} className="hover:bg-gray-50">
//                             <TableCell className="font-medium">
//                               {record.projectName || '-'}
//                             </TableCell>
//                             <TableCell>
//                               <Badge variant="outline" className="whitespace-nowrap">
//                                 {record.anoType || '-'}
//                               </Badge>
//                             </TableCell>
//                             <TableCell>{record.documentNumber || '-'}</TableCell>
//                             <TableCell>{testRecord.testName || '-'}</TableCell>
//                             <TableCell className="text-sm">{testRecord.testCondition || '-'}</TableCell>
//                             <TableCell>{getTableCellValue(record, 'duration')}</TableCell>
//                             <TableCell>{testRecord.requiredQuantity || '-'}</TableCell>
//                             <TableCell className="whitespace-nowrap">
//                               {getTableCellValue(record, 'startTime')}
//                             </TableCell>
//                             <TableCell className="whitespace-nowrap">
//                               {getTableCellValue(record, 'tentativeEnd')}
//                             </TableCell>
//                             <TableCell>{getTableCellValue(record, 'operatorLoaded')}</TableCell>
//                             <TableCell>{getTableCellValue(record, 'operatorUnload')}</TableCell>
//                             <TableCell className="text-sm">{testRecord.processStage || record.stage2.processStage || '-'}</TableCell>
//                             <TableCell className="font-medium">
//                               {getTableCellValue(record, 'remaining')}
//                             </TableCell>
//                             <TableCell>{getStatusBadge(testRecord.status || record.status || '-')}</TableCell>
//                           </TableRow>
//                         ));
//                       })
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Index;


import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, Calendar, Clock, User, AlertCircle, Edit, Trash2, CheckCircle, XCircle, Play, Pause, RefreshCw } from 'lucide-react';

const ChamberLoadsDashboard = () => {
  const [chamberLoads, setChamberLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChamber, setSelectedChamber] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [stats, setStats] = useState({
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    totalParts: 0,
    totalDuration: 0
  });

  useEffect(() => {
    loadChamberLoads();
  }, []);

  useEffect(() => {
    filterLoads();
  }, [chamberLoads, searchTerm, selectedChamber, statusFilter, dateRange]);

  const loadChamberLoads = () => {
    setLoading(true);
    try {
      const loads = JSON.parse(localStorage.getItem('chamberLoads') || '[]');
      
      // Sort by loadedAt date (newest first)
      const sortedLoads = loads.sort((a, b) => 
        new Date(b.loadedAt) - new Date(a.loadedAt)
      );
      
      setChamberLoads(sortedLoads);
      
      // Calculate statistics
      calculateStats(sortedLoads);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading chamber loads:', error);
      setLoading(false);
    }
  };

  const calculateStats = (loads) => {
    const statsData = {
      totalLoads: loads.length,
      activeLoads: 0,
      completedLoads: 0,
      totalParts: 0,
      totalDuration: 0,
      chambers: new Set(),
      projects: new Set()
    };

    loads.forEach(load => {
      statsData.totalParts += load.parts?.length || 0;
      statsData.totalDuration += parseFloat(load.duration) || 0;
      
      if (load.chamber) statsData.chambers.add(load.chamber);
      if (load.machineDetails?.project) statsData.projects.add(load.machineDetails.project);
      
      // Determine status
      if (load.status === 'loaded') {
        const estimatedCompletion = new Date(load.estimatedCompletion);
        const now = new Date();
        if (estimatedCompletion > now) {
          statsData.activeLoads++;
        } else {
          statsData.completedLoads++;
        }
      } else if (load.status === 'completed') {
        statsData.completedLoads++;
      }
    });

    setStats({
      ...statsData,
      uniqueChambers: statsData.chambers.size,
      uniqueProjects: statsData.projects.size
    });
  };

  const filterLoads = () => {
    let filtered = [...chamberLoads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(load =>
        load.chamber?.toLowerCase().includes(term) ||
        load.machineDetails?.ticketCode?.toLowerCase().includes(term) ||
        load.machineDetails?.project?.toLowerCase().includes(term) ||
        load.parts?.some(part => 
          part.partNumber?.toLowerCase().includes(term) ||
          part.serialNumber?.toLowerCase().includes(term)
        )
      );
    }

    // Chamber filter
    if (selectedChamber !== 'all') {
      filtered = filtered.filter(load => load.chamber === selectedChamber);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(load => {
          if (load.status === 'loaded') {
            const estimatedCompletion = new Date(load.estimatedCompletion);
            return estimatedCompletion > new Date();
          }
          return false;
        });
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(load => {
          if (load.status === 'completed') return true;
          if (load.status === 'loaded') {
            const estimatedCompletion = new Date(load.estimatedCompletion);
            return estimatedCompletion <= new Date();
          }
          return false;
        });
      }
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch(dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(load => 
        new Date(load.loadedAt) >= startDate
      );
    }

    setFilteredLoads(filtered);
  };

  const getStatusInfo = (load) => {
    const estimatedCompletion = new Date(load.estimatedCompletion);
    const now = new Date();
    const timeRemaining = estimatedCompletion - now;

    if (load.status === 'completed') {
      return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (timeRemaining <= 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle };
    } else if (timeRemaining < 24 * 60 * 60 * 1000) {
      return { label: 'Finishing Soon', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    } else {
      return { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: Play };
    }
  };

  const getUniqueChambers = () => {
    const chambers = new Set();
    chamberLoads.forEach(load => {
      if (load.chamber) chambers.add(load.chamber);
    });
    return Array.from(chambers).sort();
  };

  const formatDuration = (hours) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTimeRemaining = (estimatedCompletion) => {
    const end = new Date(estimatedCompletion);
    const now = new Date();
    const diffMs = end - now;

    if (diffMs <= 0) return 'Completed';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  const handleExportData = (format) => {
    const data = filteredLoads.map(load => ({
      'Load ID': load.id,
      'Chamber': load.chamber,
      'Status': getStatusInfo(load).label,
      'Parts Count': load.parts?.length || 0,
      'Duration (h)': load.duration,
      'Loaded At': formatDateTime(load.loadedAt),
      'Estimated Completion': formatDateTime(load.estimatedCompletion),
      'Ticket Code': load.machineDetails?.ticketCode || 'N/A',
      'Project': load.machineDetails?.project || 'N/A',
      'Build': load.machineDetails?.build || 'N/A',
      'Colour': load.machineDetails?.colour || 'N/A'
    }));

    if (format === 'csv') {
      exportToCSV(data);
    } else if (format === 'json') {
      exportToJSON(data);
    }
  };

  const exportToCSV = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chamber_loads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chamber_loads_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteLoad = (loadId) => {
    if (window.confirm('Are you sure you want to delete this load? This action cannot be undone.')) {
      const updatedLoads = chamberLoads.filter(load => load.id !== loadId);
      localStorage.setItem('chamberLoads', JSON.stringify(updatedLoads));
      loadChamberLoads();
    }
  };

  const handleMarkComplete = (loadId) => {
    const updatedLoads = chamberLoads.map(load => {
      if (load.id === loadId) {
        return { ...load, status: 'completed' };
      }
      return load;
    });
    
    localStorage.setItem('chamberLoads', JSON.stringify(updatedLoads));
    loadChamberLoads();
  };

  const toggleSelectLoad = (loadId) => {
    setSelectedLoads(prev => {
      if (prev.includes(loadId)) {
        return prev.filter(id => id !== loadId);
      } else {
        return [...prev, loadId];
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedLoads.length === 0) {
      alert('Please select loads to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedLoads.length} selected load(s)?`)) {
      const updatedLoads = chamberLoads.filter(load => !selectedLoads.includes(load.id));
      localStorage.setItem('chamberLoads', JSON.stringify(updatedLoads));
      setSelectedLoads([]);
      loadChamberLoads();
    }
  };

  const handleBulkComplete = () => {
    if (selectedLoads.length === 0) {
      alert('Please select loads to mark as complete');
      return;
    }

    if (window.confirm(`Mark ${selectedLoads.length} selected load(s) as complete?`)) {
      const updatedLoads = chamberLoads.map(load => {
        if (selectedLoads.includes(load.id)) {
          return { ...load, status: 'completed' };
        }
        return load;
      });
      
      localStorage.setItem('chamberLoads', JSON.stringify(updatedLoads));
      setSelectedLoads([]);
      loadChamberLoads();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading chamber loads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Chamber Loads Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage and monitor all chamber load activities</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadChamberLoads}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Loads</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalLoads}</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-full">
                  <Calendar className="text-blue-700" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Active Loads</p>
                  <p className="text-2xl font-bold text-green-800">{stats.activeLoads}</p>
                </div>
                <div className="p-2 bg-green-200 rounded-full">
                  <Play className="text-green-700" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.completedLoads}</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-full">
                  <CheckCircle className="text-purple-700" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Total Parts</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.totalParts}</p>
                </div>
                <div className="p-2 bg-yellow-200 rounded-full">
                  <User className="text-yellow-700" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Total Duration</p>
                  <p className="text-2xl font-bold text-red-800">{formatDuration(stats.totalDuration)}</p>
                </div>
                <div className="p-2 bg-red-200 rounded-full">
                  <Clock className="text-red-700" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chambers, parts, tickets..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chamber</label>
              <select
                value={selectedChamber}
                onChange={(e) => setSelectedChamber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Chambers</option>
                {getUniqueChambers().map(chamber => (
                  <option key={chamber} value={chamber}>{chamber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLoads.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Filter className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">
                      {selectedLoads.length} load(s) selected
                    </p>
                    <p className="text-sm text-blue-600">Perform bulk actions on selected items</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={18} />
                    Mark Complete
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLoads.length === filteredLoads.length && filteredLoads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLoads(filteredLoads.map(load => load.id));
                        } else {
                          setSelectedLoads([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chamber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loaded At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket / Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLoads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">No chamber loads found</p>
                        <p className="text-gray-400 mt-2">
                          {chamberLoads.length === 0 
                            ? 'No loads have been created yet. Load parts in the Gantt Chart view.'
                            : 'Try adjusting your filters to see more results.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLoads.map((load) => {
                    const statusInfo = getStatusInfo(load);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={load.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedLoads.includes(load.id)}
                            onChange={() => toggleSelectLoad(load.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{load.chamber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{load.parts?.length || 0} parts</div>
                          <div className="text-xs text-gray-500">
                            {load.parts?.slice(0, 2).map(p => p.partNumber).join(', ')}
                            {load.parts?.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm font-medium">{formatDuration(load.duration)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(load.loadedAt)}</div>
                          <div className="text-xs text-gray-500">
                            Est. complete: {formatDateTime(load.estimatedCompletion)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            statusInfo.label === 'Active' ? 'text-blue-600' :
                            statusInfo.label === 'Finishing Soon' ? 'text-yellow-600' :
                            statusInfo.label === 'Completed' ? 'text-green-600' :
                            'text-red-600'
                          }`}>
                            {calculateTimeRemaining(load.estimatedCompletion)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {load.machineDetails?.ticketCode || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {load.machineDetails?.project || 'N/A'} / {load.machineDetails?.build || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {statusInfo.label !== 'Completed' && (
                              <button
                                onClick={() => handleMarkComplete(load.id)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Mark as complete"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteLoad(load.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete load"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination/Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredLoads.length}</span> of{' '}
                <span className="font-medium">{chamberLoads.length}</span> total loads
              </div>
              <div className="text-sm text-gray-700">
                {stats.uniqueChambers} chambers • {stats.uniqueProjects} projects
              </div>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Export Data</h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Export {filteredLoads.length} load(s) in your preferred format
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleExportData('csv');
                      setShowExportModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={20} />
                    Export as CSV
                  </button>
                  
                  <button
                    onClick={() => {
                      handleExportData('json');
                      setShowExportModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={20} />
                    Export as JSON
                  </button>
                  
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChamberLoadsDashboard;