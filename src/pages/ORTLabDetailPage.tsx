// import React, { useState, useEffect } from "react";
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
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Eye, Trash2, RotateCcw } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { toast } from "@/components/ui/use-toast";

// interface SplitRow {
//   quantity: string;
//   buildProject: string;
//   line: string;
//   color: string;
//   remark: string;
//   assignedParts: string[];
// }

// interface ORTLabRecord {
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
//   createdAt: string;
//   ortLabId: number;
//   ortLab: {
//     submissionId: number;
//     date: string;
//     serialNumber: string;
//     partNumbers: string[];
//     scannedPartNumbers: string[];
//     splitRows: SplitRow[];
//     remark: string;
//     submittedAt: string;
//   };
// }

// const ORTLabDetailsPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [ortRecords, setOrtRecords] = useState<ORTLabRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRecord, setSelectedRecord] = useState<ORTLabRecord | null>(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [selectedRecordForReload, setSelectedRecordForReload] = useState<ORTLabRecord | null>(null);

//   useEffect(() => {
//     loadORTRecords();
//   }, []);

//   const loadORTRecords = () => {
//     try {
//       const storedRecords = localStorage.getItem("ortLabRecords");
//       if (storedRecords) {
//         const records = JSON.parse(storedRecords);
//         setOrtRecords(Array.isArray(records) ? records : []);
//       } else {
//         setOrtRecords([]);
//       }
//     } catch (error) {
//       console.error("Error loading ORT Lab records:", error);
//       setOrtRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = (record: ORTLabRecord) => {
//     setSelectedRecord(record);
//     setIsViewModalOpen(true);
//   };

//   const handleDelete = (record: ORTLabRecord) => {
//     if (window.confirm("Are you sure you want to delete this ORT Lab record?")) {
//       const updatedRecords = ortRecords.filter((r) => r.ortLabId !== record.ortLabId);
//       setOrtRecords(updatedRecords);
//       localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

//       toast({
//         title: "✅ Record Deleted",
//         description: "ORT Lab record has been deleted successfully",
//         duration: 3000,
//       });
//     }
//   };

//   // New Reload Parts Functionality
//   const handleReloadParts = (record: ORTLabRecord) => {
//     // Store the selected record for reloading and navigate to ORT Lab page
//     setSelectedRecordForReload(record);

//     // Navigate to ORT Lab page with the record data for reloading
//     navigate("/ort-lab-form", {
//       state: {
//         record: {
//           documentNumber: record.documentNumber,
//           documentTitle: record.documentTitle,
//           projectName: record.projectName,
//           color: record.color,
//           testLocation: record.testLocation,
//           testStartDate: record.testStartDate,
//           testCompletionDate: record.testCompletionDate,
//           sampleConfig: record.sampleConfig,
//           status: record.status,
//           id: record.id,
//           createdAt: record.createdAt
//         },
//         reloadMode: true,
//         existingRecord: record
//       }
//     });
//   };

//   // Function to check if reload is possible (based on document number and existing parts)
//   const canReloadParts = (record: ORTLabRecord) => {
//     // You can add business logic here to determine if reload is allowed
//     // For example, check if the document is still active, not completed, etc.
//     return record.status !== "Completed"; // Example condition
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6 max-w-7xl">
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-center text-gray-500">Loading ORT Lab records...</div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <Button
//         variant="ghost"
//         onClick={() => navigate("/")}
//         className="mb-4 hover:bg-gray-100"
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         Back to Dashboard
//       </Button>

//       <Card>
//         <CardHeader className="bg-blue-600 text-white">
//           <CardTitle className="text-2xl">ORT Lab Records</CardTitle>
//         </CardHeader>
//         <CardContent className="pt-6">
//           <div className="rounded-md border overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-gray-50">
//                   <TableHead className="font-semibold w-[50px]">#</TableHead>
//                   <TableHead className="font-semibold">Document No.</TableHead>
//                   <TableHead className="font-semibold">Project Name</TableHead>
//                   <TableHead className="font-semibold">Serial Number</TableHead>
//                   <TableHead className="font-semibold">Date</TableHead>
//                   <TableHead className="font-semibold">Total Parts</TableHead>
//                   <TableHead className="font-semibold">Splits</TableHead>
//                   <TableHead className="font-semibold">Status</TableHead>
//                   <TableHead className="font-semibold text-center">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {ortRecords.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={9} className="text-center py-8 text-gray-500">
//                       No ORT Lab records found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   ortRecords.map((record, index) => (
//                     <TableRow key={record.ortLabId} className="hover:bg-gray-50">
//                       <TableCell className="text-sm text-gray-500">{index + 1}</TableCell>
//                       <TableCell className="font-mono text-sm">
//                         {record.documentNumber}
//                       </TableCell>
//                       <TableCell className="text-sm">{record.projectName}</TableCell>
//                       <TableCell className="font-mono text-sm">
//                         {record.ortLab.serialNumber}
//                       </TableCell>
//                       <TableCell className="text-sm">
//                         {new Date(record.ortLab.date).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell className="text-sm">
//                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
//                           {
//                             record.ortLab?.splitRows
//                               ?.reduce((total, row) => total + (row.assignedParts?.length || 0), 0)
//                           } parts
//                         </span>
//                       </TableCell>

//                       <TableCell className="text-sm">
//                         <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
//                           {record.ortLab.splitRows.length} split(s)
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-sm">
//                         <span className={`px-2 py-1 rounded font-medium ${record.status === "Completed"
//                           ? "bg-green-100 text-green-800"
//                           : "bg-yellow-100 text-yellow-800"
//                           }`}>
//                           {record.status}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <div className="flex items-center justify-center gap-3">
//                           <Eye
//                             size={18}
//                             className="cursor-pointer text-blue-600 hover:text-blue-800"
//                             onClick={() => handleViewDetails(record)}
//                             title="View Details"
//                           />
//                           <RotateCcw
//                             size={18}
//                             className={`cursor-pointer ${canReloadParts(record)
//                               ? "text-green-600 hover:text-green-800"
//                               : "text-gray-400 cursor-not-allowed"
//                               }`}
//                             onClick={() => canReloadParts(record) && handleReloadParts(record)}
//                             title={canReloadParts(record) ? "Reload Parts" : "Cannot reload parts"}
//                           />
//                           <Trash2
//                             size={18}
//                             className="cursor-pointer text-red-600 hover:text-red-800"
//                             onClick={() => handleDelete(record)}
//                             title="Delete"
//                           />
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* View Details Modal - Keep existing implementation */}
//       <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>ORT Lab Record Details</DialogTitle>
//           </DialogHeader>

//           {selectedRecord && (
//             <div className="space-y-6">
//               {/* Basic Information */}
//               <div className="p-4 bg-gray-50 rounded-lg border">
//                 <h3 className="font-semibold text-lg mb-3">Record Information</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="font-medium text-gray-600">Document Number:</span>
//                     <p className="text-gray-800">{selectedRecord.documentNumber}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Project Name:</span>
//                     <p className="text-gray-800">{selectedRecord.projectName}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Test Location:</span>
//                     <p className="text-gray-800">{selectedRecord.testLocation}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Date:</span>
//                     <p className="text-gray-800">
//                       {new Date(selectedRecord.ortLab.date).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Serial Number:</span>
//                     <p className="text-gray-800 font-mono">{selectedRecord.ortLab.serialNumber}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Submitted At:</span>
//                     <p className="text-gray-800">
//                       {new Date(selectedRecord.ortLab.submittedAt).toLocaleString()}
//                     </p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Status:</span>
//                     <p className="text-gray-800 font-medium">{selectedRecord.status}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Split Rows Details */}
//               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <h3 className="font-semibold text-lg mb-3 text-blue-800">
//                   Split Assignments ({selectedRecord.ortLab.splitRows.length} Split(s))
//                 </h3>
//                 <div className="space-y-4">
//                   {selectedRecord.ortLab.splitRows.map((row, index) => (
//                     <div key={index} className="p-4 bg-white rounded-lg border">
//                       <div className="flex items-center justify-between mb-3">
//                         <h4 className="font-semibold text-gray-700">Split #{index + 1}</h4>
//                         <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
//                           {row.assignedParts.length} parts
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
//                         <div>
//                           <span className="font-medium text-gray-600">Quantity:</span>
//                           <p className="text-gray-800 font-medium">{row.quantity}</p>
//                         </div>
//                         <div>
//                           <span className="font-medium text-gray-600">Build/Project:</span>
//                           <p className="text-gray-800">{row.buildProject}</p>
//                         </div>
//                         <div>
//                           <span className="font-medium text-gray-600">Line:</span>
//                           <p className="text-gray-800">{row.line}</p>
//                         </div>
//                         <div>
//                           <span className="font-medium text-gray-600">Color:</span>
//                           <p className="text-gray-800 font-medium">{row.color}</p>
//                         </div>
//                       </div>

//                       {/* Individual Split Remark */}
//                       {row.remark && (
//                         <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
//                           <span className="font-medium text-gray-600 text-sm">Split Remark:</span>
//                           <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
//                             {row.remark}
//                           </p>
//                         </div>
//                       )}

//                       <div>
//                         <span className="font-medium text-gray-600 text-sm">Assigned Parts:</span>
//                         <div className="flex flex-wrap gap-1 mt-2">
//                           {row.assignedParts.map((part, idx) => (
//                             <span
//                               key={idx}
//                               className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono"
//                             >
//                               {part}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* All Parts Summary */}
//               {/* Scanned Parts Summary */}
//               {/* <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <h3 className="font-semibold text-lg mb-3 text-blue-800">
//                   Scanned Parts (
//                   {selectedRecord?.ortLab?.scannedPartNumbers?.length || 0}
//                   )
//                 </h3>

//                 <div className="flex flex-wrap gap-1">
//                   {selectedRecord?.ortLab?.scannedPartNumbers?.map((part, idx) => (
//                     <span
//                       key={idx}
//                       className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono"
//                     >
//                       {part}
//                     </span>
//                   ))}
//                 </div>
//               </div> */}

//               {/* Overall Remarks */}
//               {selectedRecord.ortLab.remark && (
//                 <div className="p-4 bg-gray-50 rounded-lg border">
//                   <h3 className="font-semibold text-lg mb-2">Overall Remarks</h3>
//                   <p className="text-gray-700 text-sm whitespace-pre-wrap">
//                     {selectedRecord.ortLab.remark}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default ORTLabDetailsPage;



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
import { ArrowLeft, Eye, Trash2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface ORTLabRecord {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  testLocation: string;
  submissionPartDate: string;
  sampleConfig: string;
  remarks: string;
  status: string;
  project: string[];
  line: string;
  colour: string;
  quantity: string;
  id: number;
  createdAt: string;
  ortLabId: number;
  ortLab: {
    submissionId: number;
    date: string;
    serialNumber: string;
    scannedParts: {
      serialNumber: string;
      partNumber: string;
      scannedAt: string;
    }[];
    totalParts: number;
    requiredQuantity: string;
    submittedAt: string;
  };
}

const ORTLabDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [ortRecords, setOrtRecords] = useState<ORTLabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ORTLabRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecordForReload, setSelectedRecordForReload] = useState<ORTLabRecord | null>(null);

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
      const updatedRecords = ortRecords.filter((r) => r.ortLabId !== record.ortLabId);
      setOrtRecords(updatedRecords);
      localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

      toast({
        title: "✅ Record Deleted",
        description: "ORT Lab record has been deleted successfully",
        duration: 3000,
      });
    }
  };

  // New Reload Parts Functionality
  const handleReloadParts = (record: ORTLabRecord) => {
    // Store the selected record for reloading and navigate to ORT Lab page
    setSelectedRecordForReload(record);

    // Navigate to ORT Lab page with the record data for reloading
    navigate("/ort-lab-form", {
      state: {
        record: {
          documentNumber: record.documentNumber,
          documentTitle: record.documentTitle,
          projectName: record.projectName,
          color: record.colour,
          testLocation: record.testLocation,
          submissionPartDate: record.submissionPartDate,
          sampleConfig: record.sampleConfig,
          remarks: record.remarks,
          status: record.status,
          project: record.project,
          line: record.line,
          quantity: record.quantity,
          id: record.id,
          createdAt: record.createdAt
        },
        reloadMode: true,
        existingRecord: record
      }
    });
  };

  // Function to check if reload is possible (based on document number and existing parts)
  const canReloadParts = (record: ORTLabRecord) => {
    // You can add business logic here to determine if reload is allowed
    // For example, check if the document is still active, not completed, etc.
    return record.status !== "Completed"; // Example condition
  };

  // Helper function to get total parts from scannedParts
  const getTotalParts = (record: ORTLabRecord) => {
    return record.ortLab?.scannedParts?.length || 0;
  };

  // Helper function to get all part numbers
  const getAllPartNumbers = (record: ORTLabRecord) => {
    return record.ortLab?.scannedParts?.map(part => part.partNumber) || [];
  };

  // Helper function to get all serial numbers
  const getAllSerialNumbers = (record: ORTLabRecord) => {
    const serialNumbers = new Set<string>();
    record.ortLab?.scannedParts?.forEach(part => {
      serialNumbers.add(part.serialNumber);
    });
    return Array.from(serialNumbers);
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
                  <TableHead className="font-semibold">Projects</TableHead>
                  <TableHead className="font-semibold">Serial Number</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Total Parts</TableHead>
                  <TableHead className="font-semibold">Line</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ortRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No ORT Lab records found
                    </TableCell>
                  </TableRow>
                ) : (
                  ortRecords.map((record, index) => (
                    <TableRow key={record.ortLabId} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-500">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.documentNumber}
                      </TableCell>
                      <TableCell className="text-sm">{record.projectName}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {record.project?.slice(0, 3).map((proj, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                            >
                              {proj}
                            </span>
                          ))}
                          {record.project?.length > 3 && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              +{record.project.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.ortLab.serialNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(record.ortLab.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          {getTotalParts(record)} parts
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.line}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={`px-2 py-1 rounded font-medium ${record.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {record.status}
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
                          <RotateCcw
                            size={18}
                            className={`cursor-pointer ${canReloadParts(record)
                              ? "text-green-600 hover:text-green-800"
                              : "text-gray-400 cursor-not-allowed"
                              }`}
                            onClick={() => canReloadParts(record) && handleReloadParts(record)}
                            title={canReloadParts(record) ? "Reload Parts" : "Cannot reload parts"}
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

      {/* View Details Modal - Updated for new structure */}
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
                    <span className="font-medium text-gray-600">Document Title:</span>
                    <p className="text-gray-800">{selectedRecord.documentTitle}</p>
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
                    <span className="font-medium text-gray-600">Submission Date:</span>
                    <p className="text-gray-800">
                      {new Date(selectedRecord.submissionPartDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Sample Config:</span>
                    <p className="text-gray-800">{selectedRecord.sampleConfig}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Line:</span>
                    <p className="text-gray-800">{selectedRecord.line}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Colour:</span>
                    <p className="text-gray-800">{selectedRecord.colour}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Quantity:</span>
                    <p className="text-gray-800">{selectedRecord.quantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className="text-gray-800 font-medium">{selectedRecord.status}</p>
                  </div>
                </div>
              </div>

              {/* Projects Information */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-3 text-blue-800">
                  Projects ({selectedRecord.project?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.project?.map((project, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              {/* ORT Lab Submission Details */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-lg mb-3 text-green-800">
                  ORT Lab Submission
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-600">Submission ID:</span>
                    <p className="text-gray-800 font-mono">{selectedRecord.ortLab.submissionId}</p>
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
                    <span className="font-medium text-gray-600">Total Parts:</span>
                    <p className="text-gray-800">{selectedRecord.ortLab.totalParts}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Required Quantity:</span>
                    <p className="text-gray-800">{selectedRecord.ortLab.requiredQuantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted At:</span>
                    <p className="text-gray-800">
                      {new Date(selectedRecord.ortLab.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Unique Serial Numbers */}
                <div className="mb-4">
                  <span className="font-medium text-gray-600 text-sm">Unique Serial Numbers:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getAllSerialNumbers(selectedRecord).map((serial, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono"
                      >
                        {serial}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scanned Parts */}
                <div>
                  <span className="font-medium text-gray-600 text-sm">Scanned Parts ({getTotalParts(selectedRecord)}):</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getAllPartNumbers(selectedRecord).map((part, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono"
                      >
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Scanned Parts Table */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-lg mb-3 text-yellow-800">
                  Detailed Scanned Parts
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="px-3 py-2 text-left font-medium text-yellow-800">#</th>
                        <th className="px-3 py-2 text-left font-medium text-yellow-800">Serial Number</th>
                        <th className="px-3 py-2 text-left font-medium text-yellow-800">Part Number</th>
                        <th className="px-3 py-2 text-left font-medium text-yellow-800">Scanned At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.ortLab.scannedParts.map((part, index) => (
                        <tr key={index} className="border-b border-yellow-200 hover:bg-yellow-100">
                          <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                          <td className="px-3 py-2 font-mono text-gray-800">{part.serialNumber}</td>
                          <td className="px-3 py-2 font-mono text-gray-800">{part.partNumber}</td>
                          <td className="px-3 py-2 text-gray-700">
                            {new Date(part.scannedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {selectedRecord.remarks && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-2">Remarks</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {selectedRecord.remarks}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ORTLabDetailsPage;

