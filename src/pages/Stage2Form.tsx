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
import { Eye, Edit, Trash2, FlaskConical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

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

const Stage2Records: React.FC = () => {
  const [stage2Records, setStage2Records] = React.useState<Stage2Record[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = React.useState<Stage2Record | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<Stage2Record | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadStage2Records();
  }, []);

  const loadStage2Records = () => {
    try {
      const storedRecords = localStorage.getItem("stage2Records");
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        setStage2Records(Array.isArray(records) ? records : []);
      } else {
        setStage2Records([]);
      }
    } catch (error) {
      console.error("Error loading stage 2 records:", error);
      setStage2Records([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: Stage2Record) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (record: Stage2Record) => {
    // Navigate to edit page or open edit modal
    console.log("Edit record:", record);
    toast({
      title: "Edit Functionality",
      description: "Edit feature will be implemented here",
      duration: 3000,
    });
  };

  const handleDelete = (record: Stage2Record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;

    try {
      const updatedRecords = stage2Records.filter(
        (record) => record.id !== recordToDelete.id
      );
      setStage2Records(updatedRecords);
      localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

      toast({
        title: "✅ Record Deleted",
        description: `Record ${recordToDelete.documentNumber} has been deleted successfully!`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the record. Please try again.",
        duration: 3000,
      });
      console.error("Error deleting record:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleViewAuthor = (record: Stage2Record) => {
    navigate("/author", { state: { record } });
  };

  const parseMultipleValues = (value: string) => {
    return value.split(",").map(item => item.trim()).filter(item => item);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "bg-blue-100 text-blue-800";
      case "In-progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Stage 2 Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Loading records...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Stage 2 Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border h-[400px] overflow-y-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold w-[60px] text-center">#</TableHead>
                    <TableHead className="font-semibold">Document Info</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Process Stage</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">View Details</TableHead>
                    <TableHead className="font-semibold text-center w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stage2Records.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No stage 2 records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stage2Records.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="text-sm text-gray-500 text-center">
                          {index + 1}
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
                              <div className="font-medium text-sm">
                                {record.documentNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.documentTitle}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.projectName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.stage2.processStage}
                        </TableCell>
                        <TableCell className="text-sm">
                          {record.stage2.type}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              className="h-8 w-8 mr-10"
                              title="View TestInfo"
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAuthor(record)}
                              className="h-8 w-8 p-0 text-blue-600"
                              title="Move to Testing"
                            >
                              <FlaskConical  size={16} />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="h-8 w-8 p-0 text-yellow-600"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Button> */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record)}
                              className="h-8 w-8 p-0 text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </Button>
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

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Stage 2 Record Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <h3 className="md:col-span-2 font-semibold text-lg mb-2">Basic Information</h3>
                <div>
                  <label className="text-sm font-medium text-gray-500">Document Number</label>
                  <p className="text-sm">{selectedRecord.documentNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Document Title</label>
                  <p className="text-sm">{selectedRecord.documentTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Name</label>
                  <p className="text-sm">{selectedRecord.projectName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant="secondary" className={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>

              {/* Stage 2 Details */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">Stage 2 Configuration</h3>

                {/* Process Stage and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Process Stage</label>
                    <p className="text-sm font-medium">{selectedRecord.stage2.processStage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm font-medium">{selectedRecord.stage2.type}</p>
                  </div>
                </div>

                {/* Test Names */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Test Names</label>
                  <div className="space-y-2">
                    {parseMultipleValues(selectedRecord.stage2.testName).map((testName, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{testName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Conditions */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Test Conditions</label>
                  <div className="space-y-2">
                    {parseMultipleValues(selectedRecord.stage2.testCondition).map((condition, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Quantities */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Required Quantities</label>
                  <div className="space-y-2">
                    {parseMultipleValues(selectedRecord.stage2.requiredQty).map((qty, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Equipment</label>
                  <div className="space-y-2">
                    {parseMultipleValues(selectedRecord.stage2.equipment).map((equipment, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <span className="text-sm flex-1">{equipment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submission Info */}
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500">Submitted At</label>
                  <p className="text-sm">
                    {new Date(selectedRecord.stage2.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete record <strong>{recordToDelete?.documentNumber}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Stage2Records;