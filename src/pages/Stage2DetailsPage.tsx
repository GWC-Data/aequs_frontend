// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Eye, Edit, Trash2, FlaskConical } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "@/components/ui/use-toast";
// import { X } from "lucide-react";

// interface Stage2Record {
//   testLocation: string;
//   submissionPartDate: string; // Changed from testStartDate
//   sampleConfig: string;
//   remarks: string; // Changed from "remark" to "remarks"
//   status: string;
//   project: string; // Single project string, not array
//   line: string; // Single line string, not array
//   quantity: string;
//   id: number;
//   createdAt: string;
//   testStartDate?: string; // Optional now
//   testCompletionDate?: string; // Optional now
//   stage2: {
//     processStage: string;
//     type: string;
//     testName: string;
//     testCondition: string;
//     requiredQty: string;
//     equipment: string;
//     checkpoint: number;
//     project: string;
//     lines: string[];
//     selectedParts: string[] | Record<string, string[]>; // Can be array or object
//     startTime: string;
//     endTime: string;
//     remark: string;
//     submittedAt: string;
//     testMode?: "single" | "multi";
//   }
//   detailsBox: {
//     color: string;
//   }
// }

// const Stage2DetailRecords: React.FC = () => {
//   const [stage2Records, setStage2Records] = React.useState<Stage2Record[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [selectedRecord, setSelectedRecord] = React.useState<Stage2Record | null>(null);
//   const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
//   const [recordToDelete, setRecordToDelete] = React.useState<Stage2Record | null>(null);
//   const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
//   const [editingRecord, setEditingRecord] = React.useState<Stage2Record | null>(null);
//   const [editForm, setEditForm] = React.useState({
//     color: "",
//     testLocation: "",
//     testStartDate: "",
//     testCompletionDate: "",
//     sampleConfig: "",
//     status: "",
//     processStage: "",
//     type: "",
//     project: "",
//     testName: "",
//     testCondition: "",
//     requiredQty: "",
//     equipment: "",
//     projects: [] as string[],
//     lines: [] as string[],
//     selectedParts: [] as string[],
//     startTime: "",
//     endTime: "",
//     remark: ""
//   });

//   // ORT Lab data for edit modal
//   const [ortLabRecords, setOrtLabRecords] = React.useState<any[]>([]);
//   const [availableProjects, setAvailableProjects] = React.useState<string[]>([]);
//   const [availableLines, setAvailableLines] = React.useState<string[]>([]);
//   const [availableParts, setAvailableParts] = React.useState<string[]>([]);

//   const navigate = useNavigate();

//   React.useEffect(() => {
//     loadStage2Records();
//     loadORTLabRecords();
//   }, []);

//   const loadORTLabRecords = () => {
//     try {
//       const storedRecords = localStorage.getItem("ortLabRecords");

//       if (storedRecords) {
//         const records = JSON.parse(storedRecords);
//         setOrtLabRecords(records);

//         // Extract unique Projects from updated structure
//         const projectSet = new Set<string>();

//         records.forEach((record: any) => {
//           if (record.project) {
//             projectSet.add(record.project);
//           }
//         });

//         setAvailableProjects(Array.from(projectSet));
//       }
//     } catch (error) {
//       console.error("Error loading ORT Lab records:", error);
//     }
//   };


//   const loadStage2Records = () => {
//     try {
//       const storedRecords = localStorage.getItem("stage2Records");
//       if (storedRecords) {
//         const records = JSON.parse(storedRecords);
//         console.log(records);

//         // Transform records to match our interface
//         const transformedRecords = records.map((record: any) => ({
//           ...record,
//           // Ensure colour is properly mapped
//           colour: record.detailsBox.color || record.color || "",
//           // Map single project to projectName
//           project: record.stage2.project || record.project || "",
//           // Map line to line (single)
//           line: record.line || "",
//           // Map projects array from stage2 if exists
//           stage2: {
//             ...record.stage2,
//             // Ensure lines is an array (from JSON it's already array)
//             lines: record.stage2?.lines || [],
//             // Ensure project is single string
//             project: record.stage2?.project || record.project || "",
//           }
//         }));

//         setStage2Records(Array.isArray(transformedRecords) ? transformedRecords : []);
//       } else {
//         setStage2Records([]);
//       }
//     } catch (error) {
//       console.error("Error loading stage 2 records:", error);
//       setStage2Records([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = (record: Stage2Record) => {
//     setSelectedRecord(record);
//     setIsDetailModalOpen(true);
//   };

//   // const handleEdit = (record: Stage2Record) => {
//   //   setEditingRecord(record);

//   //   const selectedProject = record.stage2.project ? [record.stage2.project] : [];
//   //   const selectedLines = Array.isArray(record.stage2.lines) ? record.stage2.lines : [];
//   //   console.log(selectedLines);

//   //   const selectedParts = Array.isArray(record.stage2.selectedParts)
//   //     ? record.stage2.selectedParts.map((part: any) =>
//   //       typeof part === "string" ? part : part.part
//   //     )
//   //     : [];
//   //   console.log(selectedLines);

//   //   setEditForm({
//   //     color: record.detailsBox.color,
//   //     testLocation: record.testLocation,
//   //     testStartDate: record.testStartDate || "",
//   //     testCompletionDate: record.testCompletionDate || "",
//   //     sampleConfig: record.sampleConfig,
//   //     status: record.status,
//   //     processStage: record.stage2.processStage,
//   //     type: record.stage2.type,
//   //     testName: record.stage2.testName,
//   //     project: record.stage2.project, // single value
//   //     testCondition: record.stage2.testCondition,
//   //     requiredQty: record.stage2.requiredQty,
//   //     equipment: record.stage2.equipment,
//   //     projects: selectedProject,
//   //     lines: selectedLines,
//   //     selectedParts: selectedParts,
//   //     startTime: record.stage2.startTime || "",
//   //     endTime: record.stage2.endTime || "",
//   //     remark: record.stage2.remark || ""
//   //   });

//   //   updateAvailableLinesAndParts(selectedProject, selectedLines);

//   //   setIsEditModalOpen(true);
//   // };

//   const handleEdit = (record: Stage2Record) => {
//     setEditingRecord(record);

//     const selectedProject = record.stage2.project ? [record.stage2.project] : [];
//     const selectedLines = Array.isArray(record.stage2.lines) ? record.stage2.lines : [];

//     // Handle both single and multi test mode parts
//     let selectedParts: string[] = [];

//     if (Array.isArray(record.stage2.selectedParts)) {
//       // Single test mode
//       selectedParts = record.stage2.selectedParts;
//     } else if (typeof record.stage2.selectedParts === 'object') {
//       // Multi test mode - flatten all parts
//       selectedParts = Object.values(record.stage2.selectedParts).flat();
//     }

//     setEditForm({
//       color: record.detailsBox.color,
//       testLocation: record.testLocation,
//       testStartDate: record.testStartDate || "",
//       testCompletionDate: record.testCompletionDate || "",
//       sampleConfig: record.sampleConfig,
//       status: record.status,
//       processStage: record.stage2.processStage,
//       type: record.stage2.type,
//       testName: record.stage2.testName,
//       project: record.stage2.project,
//       testCondition: record.stage2.testCondition,
//       requiredQty: record.stage2.requiredQty,
//       equipment: record.stage2.equipment,
//       projects: selectedProject,
//       lines: selectedLines,
//       selectedParts: selectedParts, // Flattened parts
//       startTime: record.stage2.startTime || "",
//       endTime: record.stage2.endTime || "",
//       remark: record.stage2.remark || ""
//     });

//     updateAvailableLinesAndParts(selectedProject, selectedLines);
//     setIsEditModalOpen(true);
//   };

//   const updateAvailableLinesAndParts = (selectedProjects: string[], selectedLines: string[]) => {
//     if (selectedProjects.length > 0) {

//       const lines = new Set<string>();
//       const parts: string[] = [];

//       ortLabRecords.forEach((record: any) => {

//         if (selectedProjects.includes(record.project)) {
//           if (record.line) {
//             lines.add(record.line);
//           }

//           if (record.ortLab?.scannedParts) {
//             const filteredParts = record.ortLab.scannedParts
//               .filter((sp: any) =>
//                 selectedLines.length === 0 || selectedLines.includes(record.line)
//               )
//               .map((sp: any) => sp.partNumber);

//             parts.push(...filteredParts);
//           }
//         }
//       });

//       setAvailableLines(Array.from(lines));
//       setAvailableParts(parts);

//     } else {
//       setAvailableLines([]);
//       setAvailableParts([]);
//     }
//   };


//   const handleEditInputChange = (field: keyof typeof editForm, value: string | string[]) => {
//     setEditForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleEditProjectSelection = (project: string) => {
//     setEditForm(prev => {
//       const isSelected = prev.projects.includes(project);
//       const newProjects = isSelected
//         ? prev.projects.filter(p => p !== project)
//         : [...prev.projects, project];

//       // Update available lines and parts when projects change
//       updateAvailableLinesAndParts(newProjects, prev.lines);

//       return {
//         ...prev,
//         projects: newProjects
//       };
//     });
//   };

//   const handleEditLineSelection = (line: string) => {
//     setEditForm(prev => {
//       const isSelected = prev.lines.includes(line);
//       const newLines = isSelected
//         ? prev.lines.filter(l => l !== line)
//         : [...prev.lines, line];

//       // Update available parts when lines change
//       updateAvailableLinesAndParts(prev.projects, newLines);

//       return {
//         ...prev,
//         lines: newLines
//       };
//     });
//   };

//   const handleEditPartSelection = (part: string) => {
//     setEditForm(prev => {
//       const isSelected = prev.selectedParts.includes(part);
//       return {
//         ...prev,
//         selectedParts: isSelected
//           ? prev.selectedParts.filter(p => p !== part)
//           : [...prev.selectedParts, part]
//       };
//     });
//   };

//   const removeEditProject = (project: string) => {
//     setEditForm(prev => {
//       const newProjects = prev.projects.filter(p => p !== project);
//       updateAvailableLinesAndParts(newProjects, prev.lines);
//       return {
//         ...prev,
//         projects: newProjects
//       };
//     });
//   };

//   const removeEditLine = (line: string) => {
//     setEditForm(prev => {
//       const newLines = prev.lines.filter(l => l !== line);
//       updateAvailableLinesAndParts(prev.projects, newLines);
//       return {
//         ...prev,
//         lines: newLines
//       };
//     });
//   };

//   const removeEditPart = (part: string) => {
//     setEditForm(prev => ({
//       ...prev,
//       selectedParts: prev.selectedParts.filter(p => p !== part)
//     }));
//   };

//   // const handleSaveEdit = () => {
//   //   if (!editingRecord) return;

//   //   // Validation
//   //   if (editForm.selectedParts.length === 0) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Validation Error",
//   //       description: "At least one part must be selected.",
//   //       duration: 3000,
//   //     });
//   //     return;
//   //   }

//   //   try {
//   //     const updatedRecord: Stage2Record = {
//   //       ...editingRecord,
//   //       detailsBox: {
//   //         color: editForm.color
//   //       },
//   //       testLocation: editForm.testLocation,
//   //       testStartDate: editForm.testStartDate,
//   //       testCompletionDate: editForm.testCompletionDate,
//   //       sampleConfig: editForm.sampleConfig,
//   //       status: editForm.status,
//   //       stage2: {
//   //         ...editingRecord.stage2,
//   //         processStage: editForm.processStage,
//   //         type: editForm.type,
//   //         testName: editForm.testName,
//   //         testCondition: editForm.testCondition,
//   //         requiredQty: editForm.requiredQty,
//   //         equipment: editForm.equipment,
//   //         project: editForm.project,
//   //         lines: editForm.lines,
//   //         selectedParts: editForm.selectedParts,
//   //         startTime: editForm.startTime,
//   //         endTime: editForm.endTime,
//   //         remark: editForm.remark,
//   //         submittedAt: editingRecord.stage2.submittedAt
//   //       }
//   //     };

//   //     const updatedRecords = stage2Records.map(record =>
//   //       record.id === editingRecord.id ? updatedRecord : record
//   //     );

//   //     setStage2Records(updatedRecords);
//   //     localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

//   //     setIsEditModalOpen(false);
//   //     setEditingRecord(null);

//   //   } catch (error) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Update Failed",
//   //       description: "There was an error updating the record. Please try again.",
//   //       duration: 3000,
//   //     });
//   //     console.error("Error updating record:", error);
//   //   }
//   // };

//   const handleSaveEdit = () => {
//     if (!editingRecord) return;

//     // Validation
//     if (editForm.selectedParts.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "At least one part must be selected.",
//         duration: 3000,
//       });
//       return;
//     }

//     try {
//       // Preserve the original selectedParts structure for multi-test mode
//       let updatedSelectedParts: string[] | Record<string, string[]>;

//       if (editingRecord.stage2.testMode === 'multi' &&
//         typeof editingRecord.stage2.selectedParts === 'object') {
//         // Keep the original multi-test structure, but update with new parts if needed
//         // For now, we'll convert to the edited flat array
//         // You can enhance this to maintain the test-part mapping
//         updatedSelectedParts = editForm.selectedParts;
//       } else {
//         // Single test mode - simple array
//         updatedSelectedParts = editForm.selectedParts;
//       }

//       const updatedRecord: Stage2Record = {
//         ...editingRecord,
//         detailsBox: {
//           color: editForm.color
//         },
//         testLocation: editForm.testLocation,
//         testStartDate: editForm.testStartDate,
//         testCompletionDate: editForm.testCompletionDate,
//         sampleConfig: editForm.sampleConfig,
//         status: editForm.status,
//         stage2: {
//           ...editingRecord.stage2,
//           processStage: editForm.processStage,
//           type: editForm.type,
//           testName: editForm.testName,
//           testCondition: editForm.testCondition,
//           requiredQty: editForm.requiredQty,
//           equipment: editForm.equipment,
//           project: editForm.project,
//           lines: editForm.lines,
//           selectedParts: updatedSelectedParts, // Use the preserved structure
//           startTime: editForm.startTime,
//           endTime: editForm.endTime,
//           remark: editForm.remark,
//           submittedAt: editingRecord.stage2.submittedAt,
//           testMode: editingRecord.stage2.testMode // Preserve test mode
//         }
//       };

//       const updatedRecords = stage2Records.map(record =>
//         record.id === editingRecord.id ? updatedRecord : record
//       );

//       setStage2Records(updatedRecords);
//       localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

//       toast({
//         title: "Success",
//         description: "Record updated successfully.",
//         duration: 3000,
//       });

//       setIsEditModalOpen(false);
//       setEditingRecord(null);

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Update Failed",
//         description: "There was an error updating the record. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error updating record:", error);
//     }
//   };

//   const handleCancelEdit = () => {
//     setIsEditModalOpen(false);
//     setEditingRecord(null);
//   };

//   const handleDelete = (record: Stage2Record) => {
//     setRecordToDelete(record);
//     setIsDeleteModalOpen(true);
//   };

//   const confirmDelete = () => {
//     if (!recordToDelete) return;

//     try {
//       const updatedRecords = stage2Records.filter(
//         (record) => record.id !== recordToDelete.id
//       );
//       setStage2Records(updatedRecords);
//       localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Delete Failed",
//         description: "There was an error deleting the record. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error deleting record:", error);
//     } finally {
//       setIsDeleteModalOpen(false);
//       setRecordToDelete(null);
//     }
//   };

//   const handleViewAuthor = (record: Stage2Record) => {
//     navigate("/form-default", { state: { record } });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Received":
//         return "bg-blue-100 text-blue-800";
//       case "In-progress":
//         return "bg-yellow-100 text-yellow-800";
//       case "Completed":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-bold">Stage 2 Records</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border h-[300px] flex items-center justify-center">
//             <div className="text-gray-500">Loading records...</div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card className="mt-6 max-w-6xl mx-auto">
//         <CardHeader>
//           <CardTitle className="text-lg font-bold">Stage 2 Records</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border h-[400px] overflow-y-auto">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader className="sticky top-0 bg-white">
//                   <TableRow className="bg-gray-50">
//                     <TableHead className="font-semibold w-[60px] text-center">#</TableHead>
//                     <TableHead className="font-semibold">Document Info</TableHead>
//                     <TableHead className="font-semibold">Project</TableHead>
//                     <TableHead className="font-semibold">Process Stage</TableHead>
//                     <TableHead className="font-semibold">Type</TableHead>
//                     <TableHead className="font-semibold">Status</TableHead>
//                     <TableHead className="font-semibold">View Details</TableHead>
//                     <TableHead className="font-semibold text-center w-[150px]">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {stage2Records.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={8}
//                         className="text-center py-8 text-gray-500"
//                       >
//                         No stage 2 records found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     stage2Records.map((record, index) => (
//                       <TableRow
//                         key={record.id}
//                         className="hover:bg-gray-50"
//                       >
//                         <TableCell className="text-sm text-gray-500 text-center">
//                           {index + 1}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <div
//                               className="h-3 w-3 rounded-full flex-shrink-0"
//                               style={{
//                                 backgroundColor: record.detailsBox.color || "#6b7280", // Changed from record.color
//                               }}
//                             ></div>
//                             <div>
//                               {/* Show colour text */}
//                               <div className="text-xs text-gray-500">
//                                 Colour: {record.detailsBox.color}
//                               </div>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           {record.project}
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           {record.stage2.processStage}
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           {record.stage2.type}
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="secondary" className={getStatusColor(record.status)}>
//                             {record.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-sm">
//                           <div className="flex items-center justify-center">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleViewDetails(record)}
//                               className="h-8 w-8 p-0"
//                               title="View Details"
//                             >
//                               <Eye size={16} />
//                             </Button>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <div className="flex items-center justify-center gap-2">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleViewAuthor(record)}
//                               className="h-8 w-8 p-0 text-blue-600"
//                               title="Move to Testing"
//                             >
//                               <FlaskConical size={16} />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleEdit(record)}
//                               className="h-8 w-8 p-0 text-yellow-600"
//                               title="Edit"
//                             >
//                               <Edit size={16} />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleDelete(record)}
//                               className="h-8 w-8 p-0 text-red-600"
//                               title="Delete"
//                             >
//                               <Trash2 size={16} />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Detail Modal */}
//       <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>Stage 2 Record - Complete Details</DialogTitle>
//           </DialogHeader>

//           {selectedRecord && (
//             <div className="space-y-6 py-4">
//               {/* Basic Information */}
//               <div className="p-4 border rounded-lg bg-gray-50">
//                 <h3 className="font-semibold text-lg mb-4 text-gray-800">Basic Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Project Name</label>
//                     <p className="text-sm">{selectedRecord.project}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Colour</label>
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="h-4 w-4 rounded-full border border-gray-400"
//                         style={{
//                           backgroundColor: selectedRecord.detailsBox.color, // Changed from color
//                         }}
//                       ></div>
//                       <p className="text-sm">{selectedRecord.detailsBox.color}</p>
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Test Location</label>
//                     <p className="text-sm">{selectedRecord.testLocation}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Status</label>
//                     <Badge variant="secondary" className={getStatusColor(selectedRecord.status)}>
//                       {selectedRecord.status}
//                     </Badge>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Sample Configuration</label>
//                     <p className="text-sm">{selectedRecord.sampleConfig}</p>
//                   </div>
//                 </div>
//               </div>


//               {/* ORT Lab Data Selection */}
//               <div className="p-4 border rounded-lg bg-blue-50">
//                 <h3 className="font-semibold text-lg mb-4 text-blue-800">ORT Lab Data Selection</h3>

//                 {/* Selected Project (single) */}
//                 <div className="mb-4">
//                   <label className="text-sm font-medium text-gray-600 mb-2 block">Selected Project</label>
//                   <div className="flex flex-wrap gap-2">
//                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//                       {selectedRecord.project}
//                     </Badge>
//                   </div>
//                 </div>

//                 {/* Selected Lines */}
//                 <div className="mb-4">
//                   <label className="text-sm font-medium text-gray-600 mb-2 block">Selected Lines</label>
//                   <div className="flex flex-wrap gap-2">
//                     {Array.isArray(selectedRecord.stage2.lines) && selectedRecord.stage2.lines.length > 0 ? (
//                       selectedRecord.stage2.lines.map((line, index) => (
//                         <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
//                           {line}
//                         </Badge>
//                       ))
//                     ) : (
//                       <p className="text-sm text-gray-500">No lines selected</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Selected Parts */}
//                 {/* Replace the existing "Selected Parts" section with this enhanced version */}
//                 <div>
//                   <label className="text-sm font-medium text-gray-600 mb-2 block">
//                     Selected Parts ({
//                       Array.isArray(selectedRecord.stage2.selectedParts)
//                         ? selectedRecord.stage2.selectedParts.length
//                         : Object.values(selectedRecord.stage2.selectedParts).flat().length
//                     })
//                   </label>

//                   {/* Single Test Mode - Simple List */}
//                   {Array.isArray(selectedRecord.stage2.selectedParts) ? (
//                     <div className="flex flex-wrap gap-2">
//                       {selectedRecord.stage2.selectedParts.map((part, index) => (
//                         <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 font-mono">
//                           {part}
//                         </Badge>
//                       ))}
//                     </div>
//                   ) : (
//                     /* Multi Test Mode - Grouped by Test */
//                     <div className="space-y-4">
//                       {Object.entries(selectedRecord.stage2.selectedParts).map(([testName, parts], testIndex) => (
//                         <div key={testIndex} className="p-3 bg-white rounded-lg border border-purple-200">
//                           <div className="flex items-center gap-2 mb-2">
//                             {/* <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded">
//                               Test {testIndex + 1}
//                             </span> */}
//                             <span className="text-sm font-medium text-gray-700">{testName}</span>
//                             {/* <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
//                               {(parts as string[]).length} parts
//                             </Badge> */}
//                           </div>
//                           <div className="flex flex-wrap gap-2 justify-start items-start">
//                             {(parts as string[]).map((part, partIndex) => (
//                               <Badge
//                                 key={partIndex}
//                                 variant="secondary"
//                                 className="bg-purple-50 text-purple-800 font-mono text-xs"
//                               >
//                                 {part}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Add this at the beginning of Stage 2 Configuration grid */}
//               <div>
//                 <label className="text-sm font-medium text-gray-600">Test Mode</label>
//                 <Badge variant="secondary" className={
//                   selectedRecord.stage2.testMode === 'multi'
//                     ? 'bg-blue-100 text-blue-800'
//                     : 'bg-gray-100 text-gray-800'
//                 }>
//                   {selectedRecord.stage2.testMode === 'multi' ? 'Multi Test' : 'Single Test'}
//                 </Badge>
//               </div>

//               {/* Stage 2 Configuration */}
//               <div className="p-4 border rounded-lg bg-green-50">
//                 <h3 className="font-semibold text-lg mb-4 text-green-800">Stage 2 Configuration</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Process Stage</label>
//                     <p className="text-sm font-semibold">{selectedRecord.stage2.processStage}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Type</label>
//                     <p className="text-sm font-semibold">{selectedRecord.stage2.type}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Test Name</label>
//                     <p className="text-sm">{selectedRecord.stage2.testName}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Test Condition</label>
//                     <p className="text-sm">{selectedRecord.stage2.testCondition}</p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Equipment</label>
//                     <p className="text-sm">{selectedRecord.stage2.equipment}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Timing Information */}
//               <div className="p-4 border rounded-lg bg-yellow-50">
//                 <h3 className="font-semibold text-lg mb-4 text-yellow-800">Timing Information</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Start Time</label>
//                     <p className="text-sm">
//                       {selectedRecord.stage2.startTime ? selectedRecord.stage2.startTime.split("T")[0] : "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">End Time</label>
//                     <p className="text-sm">
//                       {selectedRecord.stage2.endTime ? selectedRecord.stage2.endTime.split("T")[0] : "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-600">Submitted At</label>
//                     <p className="text-sm">
//                       {new Date(selectedRecord.stage2.submittedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Remarks */}
//               {selectedRecord.stage2.remark && (
//                 <div className="p-4 border rounded-lg bg-gray-50">
//                   <h3 className="font-semibold text-lg mb-2 text-gray-800">Remarks</h3>
//                   <p className="text-sm text-gray-700 whitespace-pre-wrap">
//                     {selectedRecord.stage2.remark}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           <DialogFooter>
//             <Button onClick={() => setIsDetailModalOpen(false)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Modal */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>Edit Stage 2 Record</DialogTitle>
//           </DialogHeader>

//           {editingRecord && (
//             <div className="space-y-6 py-4">
//               {/* Basic Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Project Name <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.project}
//                     onChange={(e) => handleEditInputChange('project', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Colour</label>
//                   <input
//                     type="text"
//                     value={editForm.color}
//                     onChange={(e) => handleEditInputChange('color', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>

//                 {/* <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Test Location</label>
//                   <input
//                     type="text"
//                     value={editForm.testLocation}
//                     onChange={(e) => handleEditInputChange('testLocation', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div> */}

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Status</label>
//                   <select
//                     value={editForm.status}
//                     onChange={(e) => handleEditInputChange('status', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   >
//                     <option value="Received">Received</option>
//                     <option value="In-progress">In Progress</option>
//                     <option value="Completed">Completed</option>
//                   </select>
//                 </div>

//                 {/* Stage 2 Configuration */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Process Stage <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.processStage}
//                     onChange={(e) => handleEditInputChange('processStage', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Type <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.type}
//                     onChange={(e) => handleEditInputChange('type', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Test Names <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.testName}
//                     onChange={(e) => handleEditInputChange('testName', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Test Conditions <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.testCondition}
//                     onChange={(e) => handleEditInputChange('testCondition', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     disabled={true}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-500">Equipment <span className="text-red-600">*</span></label>
//                   <input
//                     type="text"
//                     value={editForm.equipment}
//                     onChange={(e) => handleEditInputChange('equipment', e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     disabled={true}
//                   />
//                 </div>

//                 {/* Projects */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <label className="text-sm font-medium text-gray-600">
//                       Projects ({editForm.projects.length} selected)
//                     </label>
//                   </div>

//                   {/* Available Projects to Add */}
//                   {availableProjects.filter(p => !editForm.projects.includes(p)).length > 0 && (
//                     <div className="space-y-2">
//                       <label className="text-xs text-gray-500">Add Projects:</label>
//                       <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border">
//                         {availableProjects
//                           .filter(p => !editForm.projects.includes(p))
//                           .map((project) => (
//                             <button
//                               key={project}
//                               onClick={() => handleEditProjectSelection(project)}
//                               className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-50 transition-colors"
//                             >
//                               + {project}
//                             </button>
//                           ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Selected Projects */}
//                   <div className="space-y-2">
//                     <label className="text-xs text-gray-500">Selected Projects:</label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                       {editForm.projects.length > 0 ? (
//                         editForm.projects.map((project) => (
//                           <div
//                             key={project}
//                             className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span>{project}</span>
//                             <button
//                               onClick={() => removeEditProject(project)}
//                               className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
//                               title="Remove project"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-sm text-gray-500">No projects selected</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lines */}
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-center">
//                     <label className="text-sm font-medium text-gray-600">
//                       Lines ({editForm.lines.length} selected)
//                     </label>
//                   </div>

//                   {/* Available Lines */}
//                   <div className="space-y-2">
//                     <label className="text-xs text-gray-500">Add Lines:</label>
//                     <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border">
//                       {availableLines.length > 0 ? (
//                         availableLines
//                           .filter(l => !editForm.lines.includes(l))
//                           .map((line) => (
//                             <button
//                               key={line}
//                               onClick={() => handleEditLineSelection(line)}
//                               className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors"
//                             >
//                               + {line}
//                             </button>
//                           ))
//                       ) : (
//                         <p className="text-sm text-gray-400">No lines available</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Selected Lines */}
//                   <div className="space-y-2">
//                     <label className="text-xs text-gray-500">Selected Lines:</label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                       {editForm.lines.length > 0 ? (
//                         editForm.lines.map((line) => (
//                           <div
//                             key={line}
//                             className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span>{line}</span>
//                             <button
//                               onClick={() => removeEditLine(line)}
//                               className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-sm text-gray-500">No lines selected</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>


//                 {/* Parts */}
//                 {/* Parts Section - Enhanced for Multi-Test Mode */}
//                 <div className="col-span-2 space-y-2">
//                   <div className="flex justify-between items-center">
//                     <label className="text-sm font-medium text-gray-600">
//                       Parts ({editForm.selectedParts.length} selected) <span className="text-red-600">*</span>
//                     </label>

//                     {/* Show test mode indicator */}
//                     {editingRecord?.stage2?.testMode === 'multi' && (
//                       <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
//                         Multi-Test Mode
//                       </Badge>
//                     )}
//                   </div>

//                   {/* Show original test-part mapping if multi-test mode */}
//                   {editingRecord?.stage2?.testMode === 'multi' &&
//                     typeof editingRecord.stage2.selectedParts === 'object' && (
//                       <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
//                         <label className="text-xs font-semibold text-blue-800">Original Test Distribution:</label>
//                         {Object.entries(editingRecord.stage2.selectedParts).map(([testName, parts], idx) => (
//                           <div key={idx} className="text-xs text-blue-700 flex items-start gap-2">
//                             <span className="font-medium min-w-[120px]">{testName}:</span>
//                             <span className="text-blue-600">
//                               {(parts as string[]).join(', ')}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                   {/* Available Parts to Add */}
//                   <div className="space-y-2">
//                     <label className="text-xs text-gray-500">Add Parts:</label>
//                     <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border max-h-[150px] overflow-y-auto">
//                       {availableParts.length > 0 ? (
//                         availableParts
//                           .filter(p => !editForm.selectedParts.includes(p))
//                           .map((part) => (
//                             <button
//                               key={part}
//                               onClick={() => handleEditPartSelection(part)}
//                               className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm font-mono hover:bg-purple-50 transition-colors"
//                             >
//                               + {part}
//                             </button>
//                           ))
//                       ) : (
//                         <p className="text-sm text-gray-400">No parts available</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Selected Parts - Now Editable */}
//                   <div className="space-y-2">
//                     <label className="text-xs text-gray-500">Currently Selected Parts (Editable):</label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem] max-h-[200px] overflow-y-auto">
//                       {editForm.selectedParts.length > 0 ? (
//                         editForm.selectedParts.map((part) => (
//                           <div
//                             key={part}
//                             className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-mono"
//                           >
//                             <span>{part}</span>
//                             <button
//                               onClick={() => removeEditPart(part)}
//                               className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
//                               title="Remove part"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-sm text-gray-500">No parts selected</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Warning message for multi-test mode */}
//                   {editingRecord?.stage2?.testMode === 'multi' && (
//                     <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
//                       <strong>Note:</strong> In multi-test mode, editing parts here will update the overall selection.
//                       The original test-to-part mapping shown above is for reference only.
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="outline" onClick={handleCancelEdit}>
//               Cancel
//             </Button>
//             <Button onClick={handleSaveEdit}>
//               Save Changes
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Modal */}
//       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
//         <DialogContent className="max-w-md bg-white">
//           <DialogHeader>
//             <DialogTitle>Confirm Delete</DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p>Are you sure you want to delete record <strong>{recordToDelete?.project}</strong>?</p>
//             <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={confirmDelete}>
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default Stage2DetailRecords;

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
  id: number;
  submissionId: string;
  ticketId: number;
  ticketCode: string;
  totalQuantity: number;
  anoType: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  processStage: string;
  selectedTestNames: string[];
  testRecords: Array<{
    testId: string;
    testName: string;
    processStage: string;
    testIndex: number;
    testCondition: string;
    requiredQuantity: string;
    specification: string;
    machineEquipment: string;
    machineEquipment2: string;
    timing: string;
    startDateTime: string;
    endDateTime: string;
    assignedParts: Array<{
      id: string;
      partNumber: string;
      serialNumber: string;
      location: string;
      scanStatus: string;
      assignedToTest: string;
    }>;
    assignedPartsCount: number;
    remark: string;
    //status: string;
    submittedAt: string;
  }>;
  formData: {
    startDateTime: string;
    endDateTime: string;
    remark: string;
    testCondition: string;
    qty: string;
    specification: string;
    machineEquipment: string;
    machineEquipment2: string;
    time: string;
  };
  ortLabStatus: string; // Add this line
  submittedAt: string;
  version: string;
}

const Stage2DetailRecords: React.FC = () => {
  const [stage2Records, setStage2Records] = React.useState<Stage2Record[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = React.useState<Stage2Record | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<Stage2Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<Stage2Record | null>(null);
  const [editForm, setEditForm] = React.useState({
    status: "",
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    loadStage2Records();
  }, []);

  const loadStage2Records = () => {
    try {
      const storedRecords = localStorage.getItem("stage2Records");
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        console.log("Loaded records:", records);

        // Transform records to match our new interface
        const transformedRecords = records.map((record: any) => {
          // Extract status from test records (if all tests are complete)
          const allTestsComplete = record.testRecords?.every(
            (test: any) => test.status === "Complete"
          );

          // Determine overall status
          let overallStatus = "In-progress";
          if (allTestsComplete) {
            overallStatus = "Completed";
          } else if (record.testRecords?.some((test: any) => test.status === "Complete")) {
            overallStatus = "Partially Complete";
          }

          return {
            ...record,
            // Ensure all required fields exist
            id: record.id || Date.now(),
            submissionId: record.submissionId || `stage2-${Date.now()}`,
            ticketId: record.ticketId || 0,
            ticketCode: record.ticketCode || "N/A",
            totalQuantity: record.totalQuantity || 0,
            anoType: record.anoType || "",
            source: record.source || "",
            reason: record.reason || "",
            project: record.project || "",
            build: record.build || "",
            colour: record.colour || "",
            processStage: record.processStage || "",
            selectedTestNames: record.selectedTestNames || [],
            testRecords: record.testRecords || [],
            formData: record.formData || {
              startDateTime: "",
              endDateTime: "",
              remark: "",
              testCondition: "",
              qty: "",
              specification: "",
              machineEquipment: "",
              machineEquipment2: "",
              time: ""
            },
            submittedAt: record.submittedAt || new Date().toISOString(),
            version: record.version || "1.0",
            // Add status for the table display
            status: overallStatus,
          };
        });

        setStage2Records(Array.isArray(transformedRecords) ? transformedRecords : []);
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

  // const handleEdit = (record: Stage2Record) => {
  //   setEditingRecord(record);
  //   setEditForm({
  //     colour: record.colour || "",
  //     remark: record.formData?.remark || "",
  //     status: record.ortLabStatus || "In-progress",
  //   });
  //   setIsEditModalOpen(true);
  // };

  // Update handleEdit function
  const handleEdit = (record: Stage2Record) => {
    setEditingRecord(record);
    setEditForm({
      status: record.ortLabStatus || "Received",
    });
    setIsEditModalOpen(true);
  };
  const handleEditInputChange = (field: 'status', value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // const handleSaveEdit = () => {
  //   if (!editingRecord) return;

  //   try {
  //     // Update the record with edited fields
  //     const updatedRecord: Stage2Record = {
  //       ...editingRecord,
  //       colour: editForm.colour,
  //       formData: {
  //         ...editingRecord.formData,
  //         remark: editForm.remark
  //       },
  //       ortLabStatus: editForm.status
  //     };

  //     const updatedRecords = stage2Records.map(record =>
  //       record.id === editingRecord.id ? updatedRecord : record
  //     );

  //     setStage2Records(updatedRecords);
  //     localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

  //     toast({
  //       title: "Success",
  //       description: "Record updated successfully.",
  //       duration: 3000,
  //     });

  //     setIsEditModalOpen(false);
  //     setEditingRecord(null);

  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Update Failed",
  //       description: "There was an error updating the record. Please try again.",
  //       duration: 3000,
  //     });
  //     console.error("Error updating record:", error);
  //   }
  // };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    // Validation
    if (!editForm.status.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Status is required.",
        duration: 3000,
      });
      return;
    }

    try {
      // Only update the status field
      const updatedRecord: Stage2Record = {
        ...editingRecord,
        ortLabStatus: editForm.status,
      };

      const updatedRecords = stage2Records.map(record =>
        record.id === editingRecord.id ? updatedRecord : record
      );

      setStage2Records(updatedRecords);
      localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));

      toast({
        title: "Success",
        description: `Status updated to "${editForm.status}"`,
        duration: 3000,
      });

      setIsEditModalOpen(false);
      setEditingRecord(null);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating the status. Please try again.",
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
        title: "Success",
        description: "Record deleted successfully.",
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
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Partially Complete":
        return "bg-yellow-100 text-yellow-800";
      case "In-progress":
        return "bg-blue-100 text-blue-800";
      case "Received":
        return "bg-gray-100 text-gray-800";
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
                    <TableHead className="font-semibold">Ticket Code</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Process Stage</TableHead>
                    <TableHead className="font-semibold">Tests</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">View Details</TableHead>
                    <TableHead className="font-semibold text-center w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stage2Records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No stage 2 records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stage2Records.map((record, index) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-gray-500 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {record.ticketCode}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: record.colour === "NDA" ? "#ccc" : record.colour,
                              }}
                            ></div>
                            <span>{record.project}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.processStage}</TableCell>
                        <TableCell className="text-sm">
                          <div className="text-xs">
                            {record.selectedTestNames.length} test(s)
                            <div className="text-gray-500">
                              {record.selectedTestNames.slice(0, 2).join(", ")}
                              {record.selectedTestNames.length > 2 && "..."}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(record.ortLabStatus)}>
                            {record.ortLabStatus}
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
              {/* Basic Ticket Information */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Ticket Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ticket Code</label>
                    <p className="text-sm font-semibold">{selectedRecord.ticketCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project</label>
                    <p className="text-sm">{selectedRecord.project}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Build</label>
                    <p className="text-sm">{selectedRecord.build}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ano Type</label>
                    <p className="text-sm">{selectedRecord.anoType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Colour</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-gray-400"
                        style={{
                          backgroundColor: selectedRecord.colour === "NDA" ? "#ccc" : selectedRecord.colour,
                        }}
                      ></div>
                      <p className="text-sm">{selectedRecord.colour}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Quantity</label>
                    <p className="text-sm">{selectedRecord.totalQuantity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Source</label>
                    <p className="text-sm">{selectedRecord.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reason</label>
                    <p className="text-sm">{selectedRecord.reason}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge variant="secondary" className={getStatusColor(selectedRecord.ortLabStatus)}>
                      {selectedRecord.ortLabStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Process Stage Information */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-lg mb-4 text-blue-800">Process Stage & Test Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Process Stage</label>
                    <p className="text-sm font-semibold">{selectedRecord.processStage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Selected Tests</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRecord.selectedTestNames.map((testName, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {testName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Test Records */}
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-lg mb-4 text-green-800">Test Records ({selectedRecord.testRecords?.length || 0})</h3>
                <div className="space-y-4">
                  {selectedRecord.testRecords?.map((test, index) => (
                    <div key={test.testId} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Test {test.testIndex}: {test.testName}
                          </h4>
                          {/* <Badge variant="secondary" className={`mt-1 ${test.ortLabStatus === "Complete" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {test.ortLabStatus}
                          </Badge> */}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Assigned Parts: {test.assignedPartsCount}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Test Condition</label>
                          <p className="text-sm">{test.testCondition}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Required Quantity</label>
                          <p className="text-sm">{test.requiredQuantity}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Specification</label>
                          <p className="text-sm">{test.specification}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Timing</label>
                          <p className="text-sm">{test.timing}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Equipment</label>
                          <p className="text-sm">{test.machineEquipment}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Equipment 2</label>
                          <p className="text-sm">{test.machineEquipment2}</p>
                        </div>
                      </div>

                      {/* Assigned Parts for this test */}
                      {test.assignedParts && test.assignedParts.length > 0 && (
                        <div className="mt-4">
                          <label className="text-xs font-medium text-gray-500 mb-2 block">
                            Assigned Parts ({test.assignedParts.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {test.assignedParts.map((part, partIndex) => (
                              <Badge key={partIndex} variant="secondary" className="bg-purple-100 text-purple-800 font-mono">
                                {part.partNumber} ({part.serialNumber})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Test Remark */}
                      {test.remark && (
                        <div className="mt-3">
                          <label className="text-xs font-medium text-gray-500">Remark</label>
                          <p className="text-sm text-gray-700">{test.remark}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Start Date</label>
                          <p className="text-sm">
                            {test.startDateTime ? new Date(test.startDateTime).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">End Date</label>
                          <p className="text-sm">
                            {test.endDateTime ? new Date(test.endDateTime).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Form Data */}
              {/* <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="font-semibold text-lg mb-4 text-yellow-800">Overall Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Tests</label>
                    <p className="text-sm font-semibold">{selectedRecord.selectedTestNames.length}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Assigned Parts</label>
                    <p className="text-sm font-semibold">
                      {selectedRecord.testRecords?.reduce((sum, test) => sum + test.assignedPartsCount, 0) || 0}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Specifications</label>
                    <p className="text-sm">{selectedRecord.formData.specification}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Overall Remark</label>
                    <p className="text-sm">{selectedRecord.formData.remark}</p>
                  </div>
                </div>
              </div> */}

              {/* Submission Information */}
              <div className="p-4 border rounded-lg bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submission ID</label>
                    <p className="text-sm font-mono">{selectedRecord.submissionId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted At</label>
                    <p className="text-sm">{new Date(selectedRecord.submittedAt).toLocaleString()}</p>
                  </div>
                  {/* <div>
                    <label className="text-sm font-medium text-gray-600">Version</label>
                    <p className="text-sm">{selectedRecord.version}</p>
                  </div> */}
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

      {/* Edit Modal */}
      {/* <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Edit Stage 2 Record</DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Colour
                  </label>
                  <input
                    type="text"
                    value={editForm.colour}
                    onChange={(e) => handleEditInputChange('colour', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter colour"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="In-progress">In-progress</option>
                    <option value="Partially Complete">Partially Complete</option>
                    <option value="Completed">Completed</option>
                    <option value="Received">Received</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Remark
                  </label>
                  <textarea
                    value={editForm.remark}
                    onChange={(e) => handleEditInputChange('remark', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[80px]"
                    placeholder="Enter remark"
                  />
                </div>
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
      </Dialog> */}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit Record - {editingRecord?.ticketCode}</DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-6 py-4">
              {/* 2-column layout for fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Ticket Code & Project */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Ticket Code
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm font-semibold border border-gray-300">
                    {editingRecord.ticketCode}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Project
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    {editingRecord.project}
                  </div>
                </div>

                {/* Row 2: Process Stage & Tests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Process Stage
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    {editingRecord.processStage}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Tests ({editingRecord.selectedTestNames.length})
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300 min-h-[42px]">
                    <div className="flex flex-wrap gap-1">
                      {editingRecord.selectedTestNames.map((testName, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                          {testName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 3: Colour & ORT Lab Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Colour
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    <div
                      className="h-4 w-4 rounded-full border border-gray-400"
                      style={{
                        backgroundColor: editingRecord.colour === "NDA" ? "#ccc" : editingRecord.colour,
                      }}
                    ></div>
                    <span>{editingRecord.colour}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    ORT Lab Status
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    {editingRecord.ortLabStatus || "Not available"}
                  </div>
                </div>

                {/* Row 4: Total Parts & Submitted At */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Total Assigned Parts
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    {editingRecord.testRecords?.reduce((sum, test) => sum + test.assignedPartsCount, 0) || 0} parts
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Submitted At
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md text-sm border border-gray-300">
                    {new Date(editingRecord.submittedAt).toLocaleString()}
                  </div>
                </div>

                {/* Row 5: Editable Status (full width) */}
                <div className="md:col-span-2 space-y-2 pt-2 border-t mt-2">
                  <label className="text-sm font-medium text-gray-600">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Received">Received</option>
                    <option value="In-progress">In-progress</option>
                    <option value="Partially Complete">Partially Complete</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select the current status of this test record</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              Update Status
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
            <p>Are you sure you want to delete record <strong>{recordToDelete?.ticketCode}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">This action cannot  be undone.</p>
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

export default Stage2DetailRecords;