import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface SplitRow {
  quantity: string;
  buildProject: string;
  line: string;
  color: string;
  remark: string;
  assignedParts: string[];
}

interface ORTLabRecord {
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
  ortLab: {
    date: string;
    serialNumber: string;
    partNumbers: string[];
    scannedPartNumbers: string[];
    splitRows: SplitRow[];
    remark: string;
    submittedAt: string;
  };
}

const ORTLabDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ortRecords, setOrtRecords] = useState<ORTLabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ORTLabRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadORTRecords();
  }, []);

  const loadORTRecords = () => {
    try {
      const storedRecords = localStorage.getItem("ortLabRecords");
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        setOrtRecords(Array.isArray(records) ? records : []);
      } else {
        setOrtRecords([]);
      }
    } catch (error) {
      console.error("Error loading ORT Lab records:", error);
      setOrtRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: ORTLabRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleDelete = (record: ORTLabRecord) => {
    if (window.confirm("Are you sure you want to delete this ORT Lab record?")) {
      const updatedRecords = ortRecords.filter((r) => r.id !== record.id);
      setOrtRecords(updatedRecords);
      localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));
      
      toast({
        title: "✅ Record Deleted",
        description: "ORT Lab record has been deleted successfully",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading ORT Lab records...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">ORT Lab Records</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold w-[50px]">#</TableHead>
                  <TableHead className="font-semibold">Document No.</TableHead>
                  <TableHead className="font-semibold">Project Name</TableHead>
                  <TableHead className="font-semibold">Serial Number</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Total Parts</TableHead>
                  <TableHead className="font-semibold">Splits</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ortRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No ORT Lab records found
                    </TableCell>
                  </TableRow>
                ) : (
                  ortRecords.map((record, index) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-500">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.documentNumber}
                      </TableCell>
                      <TableCell className="text-sm">{record.projectName}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.ortLab.serialNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.ortLab.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          {record.ortLab.partNumbers.length} parts
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          {record.ortLab.splitRows.length} split(s)
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Eye
                            size={18}
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewDetails(record)}
                            title="View Details"
                          />
                          <Trash2
                            size={18}
                            className="cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(record)}
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
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>ORT Lab Record Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">Record Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Document Number:</span>
                    <p className="text-gray-800">{selectedRecord.documentNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Project Name:</span>
                    <p className="text-gray-800">{selectedRecord.projectName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Test Location:</span>
                    <p className="text-gray-800">{selectedRecord.testLocation}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date:</span>
                    <p className="text-gray-800">
                      {new Date(selectedRecord.ortLab.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Serial Number:</span>
                    <p className="text-gray-800 font-mono">{selectedRecord.ortLab.serialNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted At:</span>
                    <p className="text-gray-800">
                      {new Date(selectedRecord.ortLab.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Split Rows Details */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 text-blue-800">
                  Split Assignments ({selectedRecord.ortLab.splitRows.length} Split(s))
                </h3>
                <div className="space-y-4">
                  {selectedRecord.ortLab.splitRows.map((row, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700">Split #{index + 1}</h4>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {row.assignedParts.length} parts
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Quantity:</span>
                          <p className="text-gray-800 font-medium">{row.quantity}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Build/Project:</span>
                          <p className="text-gray-800">{row.buildProject}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Line:</span>
                          <p className="text-gray-800">{row.line}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Color:</span>
                          <p className="text-gray-800 font-medium">{row.color}</p>
                        </div>
                      </div>

                      {/* Individual Split Remark */}
                      {row.remark && (
                        <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                          <span className="font-medium text-gray-600 text-sm">Split Remark:</span>
                          <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                            {row.remark}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-medium text-gray-600 text-sm">Assigned Parts:</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {row.assignedParts.map((part, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Parts Summary */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-3 text-green-800">
                  All Parts ({selectedRecord.ortLab.partNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedRecord.ortLab.partNumbers.map((part, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overall Remarks */}
              {/* {selectedRecord.ortLab.remark && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-2">Overall Remarks</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {selectedRecord.ortLab.remark}
                  </p>
                </div>
              )} */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ORTLabDetailsPage;