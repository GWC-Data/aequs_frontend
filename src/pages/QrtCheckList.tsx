import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Trash2 } from "lucide-react";

interface TestRecord {
  testName: string;
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
}

const LiveTestProgress: React.FC = () => {
  const [testRecords, setTestRecords] = React.useState<TestRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkedItems, setCheckedItems] = React.useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadTestRecords = () => {
      try {
        const storedRecords = localStorage.getItem("testRecords");
        if (storedRecords) {
          const records = JSON.parse(storedRecords);
          setTestRecords(Array.isArray(records) ? records : []);
        } else {
          setTestRecords([]);
        }
      } catch (error) {
        console.error("Error loading test records:", error);
        setTestRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestRecords();
    window.addEventListener("storage", loadTestRecords);
    return () => window.removeEventListener("storage", loadTestRecords);
  }, []);

  const handleCheck = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = (id: number) => {
    const updatedRecords = testRecords.filter((record) => record.id !== id);
    setTestRecords(updatedRecords);
    localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
  };

  const handleView = (id: number) => {
    navigate(`/author`);
    // navigate(`/view-test/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/author`);
    // navigate(`/edit-test/${id}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <CardTitle className="text-lg font-bold">Live Test Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Loading test records...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 ">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <CardTitle className="text-lg font-bold">Live Test Checklist</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border h-[300px] overflow-y-auto">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold w-[40px] text-center">#</TableHead>
                  <TableHead className="font-semibold w-[40px] text-center">✔</TableHead>
                  <TableHead className="font-semibold">Test Details</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Timeline</TableHead>
                  <TableHead className="font-semibold text-center w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No test records found
                    </TableCell>
                  </TableRow>
                ) : (
                  testRecords.map((record, index) => (
                    <TableRow
                      key={record.id}
                      className={`hover:bg-gray-50 ${checkedItems[record.id] ? "bg-green-50" : ""}`}
                    >
                      <TableCell className="text-sm text-gray-500 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={checkedItems[record.id] || false}
                          onCheckedChange={() => handleCheck(record.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                record.color === "white" ? "#e5e5e5" : record.color || "#6b7280",
                            }}
                          ></div>
                          <div>
                            <div className="font-semibold">{record.testName}</div>
                            <div className="text-xs text-gray-500">
                              Doc: {record.documentNumber} • {record.testLocation}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{record.projectName}</TableCell>
                      <TableCell className="text-xs">
                        <div>Start: {new Date(record.testStartDate).toLocaleDateString()}</div>
                        <div>End: {new Date(record.testCompletionDate).toLocaleDateString()}</div>
                      </TableCell>

                      {/* ✅ Action Column */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Eye
                            size={18}
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => handleView(record.id)}
                            title="View"
                          />
                          <Edit
                            size={18}
                            className="cursor-pointer text-yellow-600 hover:text-yellow-800"
                            onClick={() => handleEdit(record.id)}
                            title="Edit"
                          />
                          <Trash2
                            size={18}
                            className="cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(record.id)}
                            title="Delete"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTestProgress;
