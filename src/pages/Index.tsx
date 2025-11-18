// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
// import { testData } from "@/data/testData";

// const Index = () => {
//   // Sample data - replace with actual data from API
//   const stats = {
//     activeTests: 8,
//     totalProducts: 30,
//     onTime: 4,
//     overdue: 2
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       "On Time": "bg-green-500 hover:bg-green-600 text-white",
//       "Overdue": "bg-red-500 hover:bg-red-600 text-white",
//       "Warning": "bg-yellow-500 hover:bg-yellow-600 text-white",
//       "Pending": "bg-gray-500 hover:bg-gray-600 text-white"
//     };

//     const className = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pending"];
//     return <Badge className={className}>{status}</Badge>;
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
//                   <TableBody>
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


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { testData } from "@/data/testData";
import { useEffect, useState } from "react";

interface TestRecord {
  testName: string[];
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  sampleQty: string;
  testStartDate: string;
  testCompletionDate: string;
  sampleConfig: string;
  testCondition: string;
  status: string;
  id: number;
  createdAt: string;
  forms: any;
  completedAt?: string;
  sharedImages?: any;
}

interface Stats {
  activeTests: number;
  totalProducts: number;
  onTime: number;
  overdue: number;
}

const Index = () => {
  const [stats, setStats] = useState<Stats>({
    activeTests: 0,
    totalProducts: 0,
    onTime: 0,
    overdue: 0
  });

  // Calculate stats from localStorage
  useEffect(() => {
    const calculateStats = () => {
      try {
        const testRecords: TestRecord[] = JSON.parse(localStorage.getItem('testRecords') || '[]');
        
        const calculatedStats: Stats = {
          totalProducts: testRecords.length,
          activeTests: testRecords.reduce((count, record) => {
            return count + (record.testName ? record.testName.length : 0);
          }, 0),
          onTime: testRecords.filter((record) => record.status === 'Completed').length,
          overdue: testRecords.filter((record) => {
            if (record.status === 'Completed') return false;
            if (!record.testCompletionDate) return false;
            
            const completionDate = new Date(record.testCompletionDate);
            const today = new Date();
            return completionDate < today;
          }).length
        };

        setStats(calculatedStats);
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    // Calculate stats on component mount
    calculateStats();

    // Set up interval to refresh stats periodically (optional)
    const interval = setInterval(calculateStats, 30000); // Refresh every 30 seconds

    // Listen for storage changes (if other tabs modify localStorage)
    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "On Time": "bg-green-500 hover:bg-green-600 text-white",
      "Overdue": "bg-red-500 hover:bg-red-600 text-white",
      "Warning": "bg-yellow-500 hover:bg-yellow-600 text-white",
      "Pending": "bg-gray-500 hover:bg-gray-600 text-white"
    };

    const className = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pending"];
    return <Badge className={className}>{status}</Badge>;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 max-w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-1 bg-red-500 rounded"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Monitoring Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time test progress tracking</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Active Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-900">{stats.activeTests}</div>
              <p className="text-xs text-gray-500 mt-1">Total individual tests running</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-900">{stats.totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">Test records in system</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                On Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">{stats.onTime}</div>
              <p className="text-xs text-gray-500 mt-1">Completed successfully</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-gray-500 mt-1">Past completion date</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Test Progress Table */}
        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-lg font-bold">Live Test Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border h-[300px] overflow-y-auto">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold min-w-[100px]">Project</TableHead>
                      <TableHead className="font-semibold min-w-[140px]">Test Type</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Build</TableHead>
                      <TableHead className="font-semibold min-w-[150px]">Test Name</TableHead>
                      <TableHead className="font-semibold min-w-[140px]">Test Condition</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Duration</TableHead>
                      <TableHead className="font-semibold min-w-[70px]">Qty</TableHead>
                      <TableHead className="font-semibold min-w-[120px]">Start Time</TableHead>
                      <TableHead className="font-semibold min-w-[140px]">Tentative End</TableHead>
                      <TableHead className="font-semibold min-w-[130px]">Operator Loaded</TableHead>
                      <TableHead className="font-semibold min-w-[130px]">Operator Unload</TableHead>
                      <TableHead className="font-semibold min-w-[180px]">Check Point</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Remaining</TableHead>
                      <TableHead className="font-semibold min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testData.map((test, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{test.project}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {test.testType}
                          </Badge>
                        </TableCell>
                        <TableCell>{test.build}</TableCell>
                        <TableCell>{test.testName}</TableCell>
                        <TableCell className="text-sm">{test.testCondition || '-'}</TableCell>
                        <TableCell>{test.duration}</TableCell>
                        <TableCell>{test.qty}</TableCell>
                        <TableCell className="whitespace-nowrap">{test.startTime || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{test.tentativeEnd || '-'}</TableCell>
                        <TableCell>{test.operatorLoaded || '-'}</TableCell>
                        <TableCell>{test.operatorUnload || '-'}</TableCell>
                        <TableCell className="text-sm">{test.checkPoint || '-'}</TableCell>
                        <TableCell className="font-medium">{test.remaining || '-'}</TableCell>
                        <TableCell>{getStatusBadge(test.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;