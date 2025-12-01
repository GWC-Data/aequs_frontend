import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { testData } from "@/data/testData";
import { useEffect, useState } from "react";

interface Stage2Record {
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
  stage2: {
    processStage: string;
    type: string;
    testName: string;
    testCondition: string;
    requiredQty: string;
    equipment: string;
    submittedAt: string;
  };
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

  const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);

  // Load stage2Records from localStorage
  useEffect(() => {
    const loadStage2Records = () => {
      try {
        const storedRecords = localStorage.getItem('stage2Records');
        if (storedRecords) {
          const records = JSON.parse(storedRecords);
          setStage2Records(Array.isArray(records) ? records : []);
        } else {
          setStage2Records([]);
        }
      } catch (error) {
        console.error('Error loading stage2 records:', error);
        setStage2Records([]);
      }
    };

    loadStage2Records();
    window.addEventListener("storage", loadStage2Records);
    return () => window.removeEventListener("storage", loadStage2Records);
  }, []);

  // Calculate stats from stage2Records
  useEffect(() => {
    const calculateStats = () => {
      try {
        const calculatedStats: Stats = {
          totalProducts: stage2Records.length,
          activeTests: stage2Records.reduce((count, record) => {
            // Count number of tests based on testName (comma separated)
            const testCount = record.stage2.testName.split(',').length;
            return count + testCount;
          }, 0),
          onTime: stage2Records.filter((record) => record.status === 'Completed').length,
          overdue: stage2Records.filter((record) => {
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

    calculateStats();
  }, [stage2Records]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Completed": "bg-green-500 hover:bg-green-600 text-white",
      "Overdue": "bg-red-500 hover:bg-red-600 text-white",
      "Warning": "bg-yellow-500 hover:bg-yellow-600 text-white",
      "Received": "bg-blue-500 hover:bg-blue-600 text-white"
    };

    const className = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pending"];
    return <Badge className={className}>{status}</Badge>;
  };

  // Function to get value for table cell or return '-'
  const getTableCellValue = (record: Stage2Record, column: string): string => {
    switch (column) {
      case 'project':
        return record.projectName || '-';
      case 'testType':
        return record.stage2.type || '-';
      case 'build':
        return record.documentNumber || '-';
      case 'testName':
        return record.stage2.testName || '-';
      case 'testCondition':
        return record.stage2.testCondition || '-';
      case 'duration':
        // Calculate duration between start and completion dates
        if (record.testStartDate && record.testCompletionDate) {
          const start = new Date(record.testStartDate);
          const end = new Date(record.testCompletionDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays} days`;
        }
        return '-';
      case 'qty':
        return record.stage2.requiredQty || '-';
      case 'startTime':
        return record.testStartDate ? new Date(record.testStartDate).toLocaleDateString() : '-';
      case 'tentativeEnd':
        return record.testCompletionDate ? new Date(record.testCompletionDate).toLocaleDateString() : '-';
      case 'operatorLoaded':
        return '-'; // Not available in stage2 data
      case 'operatorUnload':
        return '-'; // Not available in stage2 data
      case 'checkPoint':
        return record.stage2.processStage || '-';
      case 'remaining':
        // Calculate remaining days
        if (record.testCompletionDate) {
          const completionDate = new Date(record.testCompletionDate);
          const today = new Date();
          const diffTime = completionDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? `${diffDays} days` : 'Overdue';
        }
        return '-';
      case 'status':
        return record.status || '-';
      default:
        return '-';
    }
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
                  {/* <TableBody>
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
                  </TableBody> */}
                  <TableBody>
                    {stage2Records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={14} className="text-center py-8 text-gray-500">
                          No test records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      stage2Records.flatMap((record) => {
                        // Split the multiple values by comma
                        const testNames = record.stage2.testName.split(',').map(name => name.trim());
                        const testConditions = record.stage2.testCondition.split(',').map(condition => condition.trim());
                        const requiredQtys = record.stage2.requiredQty.split(',').map(qty => qty.trim());

                        // Get the maximum length to handle different number of items
                        const maxLength = Math.max(testNames.length, testConditions.length, requiredQtys.length);

                        // Create rows for each test item
                        return Array.from({ length: maxLength }).map((_, index) => (
                          <TableRow key={`${record.id}-${index}`} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {record.projectName || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="whitespace-nowrap">
                                {record.stage2.type || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.documentNumber || '-'}</TableCell>
                            <TableCell>{testNames[index] || '-'}</TableCell>
                            <TableCell className="text-sm">{testConditions[index] || '-'}</TableCell>
                            <TableCell>{getTableCellValue(record, 'duration')}</TableCell>
                            <TableCell>{requiredQtys[index] || '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {getTableCellValue(record, 'startTime')}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {getTableCellValue(record, 'tentativeEnd')}
                            </TableCell>
                            <TableCell>{getTableCellValue(record, 'operatorLoaded')}</TableCell>
                            <TableCell>{getTableCellValue(record, 'operatorUnload')}</TableCell>
                            <TableCell className="text-sm">{record.stage2.processStage || '-'}</TableCell>
                            <TableCell className="font-medium">
                              {getTableCellValue(record, 'remaining')}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status || '-')}</TableCell>
                          </TableRow>
                        ));
                      })
                    )}
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