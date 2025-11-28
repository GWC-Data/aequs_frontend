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
import { X } from "lucide-react";

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
    projects: string[];
    lines: string[];
    selectedParts: Array<{ part: string; color: string }> | string[];
    startTime: string;
    endTime: string;
    remark: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<Stage2Record | null>(null);
  const [editForm, setEditForm] = React.useState({
    documentNumber: "",
    documentTitle: "",
    projectName: "",
    color: "",
    testLocation: "",
    testStartDate: "",
    testCompletionDate: "",
    sampleConfig: "",
    status: "",
    processStage: "",
    type: "",
    testName: "",
    testCondition: "",
    requiredQty: "",
    equipment: "",
    projects: [] as string[],
    lines: [] as string[],
    selectedParts: [] as string[],
    startTime: "",
    endTime: "",
    remark: ""
  });
  
  // ORT Lab data for edit modal
  const [ortLabRecords, setOrtLabRecords] = React.useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = React.useState<string[]>([]);
  const [availableLines, setAvailableLines] = React.useState<string[]>([]);
  const [availableParts, setAvailableParts] = React.useState<string[]>([]);
  
  const navigate = useNavigate();

  React.useEffect(() => {
    loadStage2Records();
    loadORTLabRecords();
  }, []);

  const loadORTLabRecords = () => {
    try {
      const storedRecords = localStorage.getItem("ortLabRecords");
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        setOrtLabRecords(records);
        
        // Extract all unique projects
        const projects = new Set<string>();
        records.forEach((record: any) => {
          record.ortLab.splitRows.forEach((row: any) => {
            projects.add(row.buildProject);
          });
        });
        setAvailableProjects(Array.from(projects));
      }
    } catch (error) {
      console.error("Error loading ORT Lab records:", error);
    }
  };

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
    setEditingRecord(record);
    setEditForm({
      documentNumber: record.documentNumber,
      documentTitle: record.documentTitle,
      projectName: record.projectName,
      color: record.color,
      testLocation: record.testLocation,
      testStartDate: record.testStartDate,
      testCompletionDate: record.testCompletionDate,
      sampleConfig: record.sampleConfig,
      status: record.status,
      processStage: record.stage2.processStage,
      type: record.stage2.type,
      testName: record.stage2.testName,
      testCondition: record.stage2.testCondition,
      requiredQty: record.stage2.requiredQty,
      equipment: record.stage2.equipment,
      projects: Array.isArray(record.stage2.projects) ? record.stage2.projects : [],
      lines: Array.isArray(record.stage2.lines) ? record.stage2.lines : [],
      selectedParts: Array.isArray(record.stage2.selectedParts)
        ? record.stage2.selectedParts.map((part: any) =>
          typeof part === 'string' ? part : part.part
        )
        : [],
      startTime: record.stage2.startTime || "",
      endTime: record.stage2.endTime || "",
      remark: record.stage2.remark || ""
    });
    
    // Update available lines and parts based on selected projects
    updateAvailableLinesAndParts(
      Array.isArray(record.stage2.projects) ? record.stage2.projects : [],
      Array.isArray(record.stage2.lines) ? record.stage2.lines : []
    );
    
    setIsEditModalOpen(true);
  };

  const updateAvailableLinesAndParts = (selectedProjects: string[], selectedLines: string[]) => {
    if (selectedProjects.length > 0) {
      const lines = new Set<string>();
      const parts: string[] = [];

      ortLabRecords.forEach((record: any) => {
        record.ortLab.splitRows.forEach((row: any) => {
          if (selectedProjects.includes(row.buildProject)) {
            lines.add(row.line);
            
            // If specific lines are selected, filter parts by those lines
            if (selectedLines.length > 0) {
              if (selectedLines.includes(row.line)) {
                parts.push(...row.assignedParts);
              }
            } else {
              // Otherwise, show all parts from selected projects
              parts.push(...row.assignedParts);
            }
          }
        });
      });

      setAvailableLines(Array.from(lines));
      setAvailableParts(parts);
    } else {
      setAvailableLines([]);
      setAvailableParts([]);
    }
  };

  const handleEditInputChange = (field: keyof typeof editForm, value: string | string[]) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditProjectSelection = (project: string) => {
    setEditForm(prev => {
      const isSelected = prev.projects.includes(project);
      const newProjects = isSelected
        ? prev.projects.filter(p => p !== project)
        : [...prev.projects, project];
      
      // Update available lines and parts when projects change
      updateAvailableLinesAndParts(newProjects, prev.lines);
      
      return {
        ...prev,
        projects: newProjects
      };
    });
  };

  const handleEditLineSelection = (line: string) => {
    setEditForm(prev => {
      const isSelected = prev.lines.includes(line);
      const newLines = isSelected
        ? prev.lines.filter(l => l !== line)
        : [...prev.lines, line];
      
      // Update available parts when lines change
      updateAvailableLinesAndParts(prev.projects, newLines);
      
      return {
        ...prev,
        lines: newLines
      };
    });
  };

  const handleEditPartSelection = (part: string) => {
    setEditForm(prev => {
      const isSelected = prev.selectedParts.includes(part);
      return {
        ...prev,
        selectedParts: isSelected
          ? prev.selectedParts.filter(p => p !== part)
          : [...prev.selectedParts, part]
      };
    });
  };

  const removeEditProject = (project: string) => {
    setEditForm(prev => {
      const newProjects = prev.projects.filter(p => p !== project);
      updateAvailableLinesAndParts(newProjects, prev.lines);
      return {
        ...prev,
        projects: newProjects
      };
    });
  };

  const removeEditLine = (line: string) => {
    setEditForm(prev => {
      const newLines = prev.lines.filter(l => l !== line);
      updateAvailableLinesAndParts(prev.projects, newLines);
      return {
        ...prev,
        lines: newLines
      };
    });
  };

  const removeEditPart = (part: string) => {
    setEditForm(prev => ({
      ...prev,
      selectedParts: prev.selectedParts.filter(p => p !== part)
    }));
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    // Validation
    if (editForm.selectedParts.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one part must be selected.",
        duration: 3000,
      });
      return;
    }

    try {
      const updatedRecord: Stage2Record = {
        ...editingRecord,
        documentNumber: editForm.documentNumber,
        documentTitle: editForm.documentTitle,
        projectName: editForm.projectName,
        color: editForm.color,
        testLocation: editForm.testLocation,
        testStartDate: editForm.testStartDate,
        testCompletionDate: editForm.testCompletionDate,
        sampleConfig: editForm.sampleConfig,
        status: editForm.status,
        stage2: {
          ...editingRecord.stage2,
          processStage: editForm.processStage,
          type: editForm.type,
          testName: editForm.testName,
          testCondition: editForm.testCondition,
          requiredQty: editForm.requiredQty,
          equipment: editForm.equipment,
          projects: editForm.projects,
          lines: editForm.lines,
          selectedParts: editForm.selectedParts,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          remark: editForm.remark,
          submittedAt: editingRecord.stage2.submittedAt
        }
      };

      const updatedRecords = stage2Records.map(record =>
        record.id === editingRecord.id ? updatedRecord : record
      );

      setStage2Records(updatedRecords);
      localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

      setIsEditModalOpen(false);
      setEditingRecord(null);

      toast({
        title: "✅ Record Updated",
        description: `Record ${editForm.documentNumber} has been updated successfully!`,
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
    navigate("/form-default", { state: { record } });
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
                        colSpan={8}
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
                              className="h-8 w-8 p-0"
                              title="View Details"
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
                              <FlaskConical size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              className="h-8 w-8 p-0 text-yellow-600"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Button>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Stage 2 Record - Complete Details</DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Document Number</label>
                    <p className="text-sm font-semibold">{selectedRecord.documentNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Document Title</label>
                    <p className="text-sm">{selectedRecord.documentTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project Name</label>
                    <p className="text-sm">{selectedRecord.projectName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Color</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-gray-400"
                        style={{
                          backgroundColor: selectedRecord.color,
                        }}
                      ></div>
                      <p className="text-sm">{selectedRecord.color}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Test Location</label>
                    <p className="text-sm">{selectedRecord.testLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge variant="secondary" className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sample Configuration</label>
                    <p className="text-sm">{selectedRecord.sampleConfig}</p>
                  </div>
                </div>
              </div>

              {/* ORT Lab Data Selection */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-lg mb-4 text-blue-800">ORT Lab Data Selection</h3>

                {/* Selected Projects */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Selected Projects</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedRecord.stage2.projects) && selectedRecord.stage2.projects.length > 0 ? (
                      selectedRecord.stage2.projects.map((project, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {project}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No projects selected</p>
                    )}
                  </div>
                </div>

                {/* Selected Lines */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Selected Lines</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedRecord.stage2.lines) && selectedRecord.stage2.lines.length > 0 ? (
                      selectedRecord.stage2.lines.map((line, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {line}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No lines selected</p>
                    )}
                  </div>
                </div>

                {/* Selected Parts */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Selected Parts ({selectedRecord.stage2.selectedParts?.length || 0})</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedRecord.stage2.selectedParts) && selectedRecord.stage2.selectedParts.length > 0 ? (
                      selectedRecord.stage2.selectedParts.map((part, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 font-mono">
                          {typeof part === 'string' ? part : part.part}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No parts selected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 2 Configuration */}
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-lg mb-4 text-green-800">Stage 2 Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Process Stage</label>
                    <p className="text-sm font-semibold">{selectedRecord.stage2.processStage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <p className="text-sm font-semibold">{selectedRecord.stage2.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Test Name</label>
                    <p className="text-sm">{selectedRecord.stage2.testName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Test Condition</label>
                    <p className="text-sm">{selectedRecord.stage2.testCondition}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Equipment</label>
                    <p className="text-sm">{selectedRecord.stage2.equipment}</p>
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="font-semibold text-lg mb-4 text-yellow-800">Timing Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Time</label>
                    <p className="text-sm">
                      {selectedRecord.stage2.startTime ? selectedRecord.stage2.startTime : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Time</label>
                    <p className="text-sm">
                      {selectedRecord.stage2.endTime ? selectedRecord.stage2.endTime : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted At</label>
                    <p className="text-sm">
                      {new Date(selectedRecord.stage2.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {selectedRecord.stage2.remark && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">Remarks</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedRecord.stage2.remark}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit Stage 2 Record</DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Document Number <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.documentNumber}
                    onChange={(e) => handleEditInputChange('documentNumber', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Document Title <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.documentTitle}
                    onChange={(e) => handleEditInputChange('documentTitle', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Project Name <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.projectName}
                    onChange={(e) => handleEditInputChange('projectName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => handleEditInputChange('color', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Test Location</label>
                  <input
                    type="text"
                    value={editForm.testLocation}
                    onChange={(e) => handleEditInputChange('testLocation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Received">Received</option>
                    <option value="In-progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Stage 2 Configuration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Process Stage <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.processStage}
                    onChange={(e) => handleEditInputChange('processStage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Type <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.type}
                    onChange={(e) => handleEditInputChange('type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Test Names <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.testName}
                    onChange={(e) => handleEditInputChange('testName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Test Conditions <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.testCondition}
                    onChange={(e) => handleEditInputChange('testCondition', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Equipment <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={editForm.equipment}
                    onChange={(e) => handleEditInputChange('equipment', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    disabled={true}
                  />
                </div>

                {/* Projects */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-600">
                      Projects ({editForm.projects.length} selected)
                    </label>
                  </div>
                  
                  {/* Available Projects to Add */}
                  {availableProjects.filter(p => !editForm.projects.includes(p)).length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Add Projects:</label>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border">
                        {availableProjects
                          .filter(p => !editForm.projects.includes(p))
                          .map((project) => (
                            <button
                              key={project}
                              onClick={() => handleEditProjectSelection(project)}
                              className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-50 transition-colors"
                            >
                              + {project}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Projects */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Selected Projects:</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {editForm.projects.length > 0 ? (
                        editForm.projects.map((project) => (
                          <div
                            key={project}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{project}</span>
                            <button
                              onClick={() => removeEditProject(project)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              title="Remove project"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No projects selected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lines */}
                {availableLines.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600">
                        Lines ({editForm.lines.length} selected)
                      </label>
                    </div>
                    
                    {/* Available Lines to Add */}
                    {availableLines.filter(l => !editForm.lines.includes(l)).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Add Lines:</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border">
                          {availableLines
                            .filter(l => !editForm.lines.includes(l))
                            .map((line) => (
                              <button
                                key={line}
                                onClick={() => handleEditLineSelection(line)}
                                className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors"
                              >
                                + {line}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Lines */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Selected Lines:</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                        {editForm.lines.length > 0 ? (
                          editForm.lines.map((line) => (
                            <div
                              key={line}
                              className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{line}</span>
                              <button
                                onClick={() => removeEditLine(line)}
                                className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                title="Remove line"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No lines selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Parts */}
                {availableParts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600">
                        Parts ({editForm.selectedParts.length} selected) <span className="text-red-600">*</span>
                      </label>
                    </div>
                    
                    {/* Available Parts to Add */}
                    {availableParts.filter(p => !editForm.selectedParts.includes(p)).length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Add Parts:</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border max-h-[150px] overflow-y-auto">
                          {availableParts
                            .filter(p => !editForm.selectedParts.includes(p))
                            .map((part) => (
                              <button
                                key={part}
                                onClick={() => handleEditPartSelection(part)}
                                className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm font-mono hover:bg-purple-50 transition-colors"
                              >
                                + {part}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Parts */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Selected Parts:</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem] max-h-[200px] overflow-y-auto">
                        {editForm.selectedParts.length > 0 ? (
                          editForm.selectedParts.map((part) => (
                            <div
                              key={part}
                              className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-mono"
                            >
                              <span>{part}</span>
                              <button
                                onClick={() => removeEditPart(part)}
                                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                title="Remove part"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No parts selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ORT Lab Data Selection in Edit Modal */}
              <div className="p-4 space-y-4">
                {/* <h3 className="font-semibold text-lg text-blue-800">ORT Lab Data Selection</h3> */}
                
                
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