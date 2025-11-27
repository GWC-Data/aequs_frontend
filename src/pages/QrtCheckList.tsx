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
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface TestRecord {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  submissionPartDate: string;
  sampleConfig: string;
  status: string;
  id: number;
  createdAt: string;
}

const LiveTestProgress: React.FC = () => {
  const [testRecords, setTestRecords] = React.useState<TestRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkedItems, setCheckedItems] = React.useState<{ [key: number]: boolean }>({});
  const [editingRecord, setEditingRecord] = React.useState<TestRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
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

  const handleEdit = (record: TestRecord) => {
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    try {
      const updatedRecords = testRecords.map((record) =>
        record.id === editingRecord.id ? editingRecord : record
      );

      setTestRecords(updatedRecords);
      localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
      setIsEditModalOpen(false);
      setEditingRecord(null);

      toast({
        title: "✅ Record Updated",
        description: `Record has been updated successfully!`,
        duration: 3000,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the record. Please try again.",
        duration: 3000,
      });
      console.error("Error updating record:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleInputChange = (field: keyof TestRecord, value: string) => {
    if (!editingRecord) return;
    setEditingRecord(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleStage2Click = (record: TestRecord) => {
    // Navigate to Stage 2 page with record data
    navigate("/stage2-form", { state: { record } });
  };

  const handleORTLabClick = (record: TestRecord) => {
    // Navigate to ORT Lab page with record data - row will NOT be removed
    navigate("/ort-lab-form", { state: { record } });
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

  // Check if any record has "Received" status
  const hasReceivedStatus = testRecords.some(record => record.status === "Received");

  return (
    <>
      <Card className="mt-6 max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
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
                    {hasReceivedStatus && (
                      <>
                        <TableHead className="font-semibold text-center w-[120px]">Stage 2</TableHead>
                        <TableHead className="font-semibold text-center w-[120px]">ORT Lab</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={hasReceivedStatus ? 8 : 6}
                        className="text-center py-8 text-gray-500"
                      >
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
                              <div className="text-xs text-gray-500">
                                Doc: {record.documentNumber} • {record.testLocation}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.projectName}</TableCell>
                        <TableCell className="text-xs">
                          <div>Submission part date: {new Date(record.submissionDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Edit
                              size={18}
                              className="cursor-pointer text-yellow-600 hover:text-yellow-800"
                              onClick={() => handleEdit(record)}
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
                        {hasReceivedStatus && (
                          <>
                            <TableCell className="text-center">
                              {record.status === "Received" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleORTLabClick(record)}
                                  className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                >
                                  ORT Lab
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.status === "Received" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStage2Click(record)}
                                  className="bg-[#e0413a] text-white hover:bg-[#c53730] hover:text-white"
                                >
                                  Stage 2
                                </Button>
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit Test Record</DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 bg-white">
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  value={editingRecord.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title</Label>
                <Input
                  id="documentTitle"
                  value={editingRecord.documentTitle}
                  onChange={(e) => handleInputChange('documentTitle', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={editingRecord.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={editingRecord.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testLocation">Test Location</Label>
                <Input
                  id="testLocation"
                  value={editingRecord.testLocation}
                  onChange={(e) => handleInputChange('testLocation', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionPartDate">Submission Part Date</Label>
                <Input
                  id="submissionPartDate"
                  type="date"
                  value={editingRecord.submissionPartDate}
                  onChange={(e) => handleInputChange('submissionPartDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleConfig">Sample Configuration</Label>
                <Input
                  id="sampleConfig"
                  value={editingRecord.sampleConfig}
                  onChange={(e) => handleInputChange('sampleConfig', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingRecord.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="In-progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveTestProgress;