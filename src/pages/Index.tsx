// const Index = () => {
//   return (
//     <div className="p-8">
//       <h1 className="mb-4 text-3xl font-bold">Home</h1>
//       <p className="text-muted-foreground mb-6">
//         Welcome to your dashboard! Navigate using the sidebar to explore different sections.
//       </p>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
//           <h3 className="mb-2 text-lg font-semibold">Quick Stats</h3>
//           <p className="text-muted-foreground">View your important metrics at a glance.</p>
//         </div>
//         <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
//           <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
//           <p className="text-muted-foreground">Stay updated with the latest changes.</p>
//         </div>
//         <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
//           <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
//           <p className="text-muted-foreground">Access frequently used features.</p>
//         </div>
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

const Index = () => {
  // Sample data - replace with actual data from your API
  const stats = {
    activeTests: 8,
    totalProducts: 30,
    onTime: 4,
    overdue: 2
  };

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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-1 bg-red-500 rounded"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Monitoring Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time test progress tracking</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeTests}</div>
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
            <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
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
            <div className="text-3xl font-bold text-green-600">{stats.onTime}</div>
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
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Test Progress Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <CardTitle className="text-lg font-semibold">Live Test Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Test Type</TableHead>
                  <TableHead className="font-semibold">Build</TableHead>
                  <TableHead className="font-semibold">Test Name</TableHead>
                  <TableHead className="font-semibold">Test Condition</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Qty</TableHead>
                  <TableHead className="font-semibold">Start Time</TableHead>
                  <TableHead className="font-semibold">Tentative End</TableHead>
                  <TableHead className="font-semibold">Operator Loaded</TableHead>
                  <TableHead className="font-semibold">Operator Unload</TableHead>
                  <TableHead className="font-semibold">Check Point</TableHead>
                  <TableHead className="font-semibold">Remaining</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
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
                    <TableCell className="max-w-[200px]">{test.testName}</TableCell>
                    <TableCell className="max-w-[150px] text-sm">{test.testCondition || '-'}</TableCell>
                    <TableCell>{test.duration}</TableCell>
                    <TableCell>{test.qty}</TableCell>
                    <TableCell className="whitespace-nowrap">{test.startTime || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{test.tentativeEnd || '-'}</TableCell>
                    <TableCell>{test.operatorLoaded || '-'}</TableCell>
                    <TableCell>{test.operatorUnload || '-'}</TableCell>
                    <TableCell className="max-w-[200px] text-sm">{test.checkPoint || '-'}</TableCell>
                    <TableCell className="font-medium">{test.remaining || '-'}</TableCell>
                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;