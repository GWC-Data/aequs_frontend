// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "@/components/ui/use-toast";
// import { Save, ArrowRight, CheckCircle } from "lucide-react";
// // Add these imports for the modal
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";

// // Add this interface for modal state
// interface NoReasonModal {
//   isOpen: boolean;
//   rowId: number | null;
//   reason: string;
// }

// // Define the incoming assignment format from OQC System
// interface ORTSubmissionData {
//   id: string;
//   timestamp: string;
//   ticketId: number;
//   ticketCode: string;
//   sessionNumber: number;
//   parts: Array<{
//     id: string;
//     partNumber: string;
//     serialNumber: string;
//     scanStatus: 'OK' | 'Cosmetic' | 'Not OK';
//     scannedAt: string;
//     location: string;
//   }>;
//   project: string;
//   build: string;
//   colour: string;
//   anoType: string;
//   source: string;
//   reason: string;
//   oqcApprovedBy?: string;
//   oqcApprovedAt?: string;
//   submittedAt?: string;
//   totalParts: number;
//   serialNumber: string;
//   partNumbers: string[];
//   rawBarcodeData?: string;
//   submitted?: boolean;
// }

// // Define OQC record structure (from "testRecords")
// interface OqcRecord {
//   id: number;
//   ticketCode: string;
//   totalQuantity: number;
//   anoType: string;
//   source: string;
//   reason: string;
//   project: string;
//   build: string;
//   colour: string;
//   dateTime: string;
//   status: string;
//   sessions: Array<any>;
//   createdAt: string;
//   oqcApproved: boolean;
//   oqcApprovedBy?: string;
//   oqcApprovedAt?: string;
// }

// // Table row interface for ORT Lab
// interface TableRow {
//   id: number;
//   ticketCode: string;
//   sessionId: string;
//   sessionNumber: number;
//   partsBeingSent: number;
//   received: "Yes" | "No" | "Partial" | "";
//   date?: string;
//   shiftTime?: string;
//   detailsBox: {
//     totalQuantity: number;
//     ticketCodeRaised: string;
//     dateShiftTime: string;
//     project: string;
//     batch: string;
//     color: string;
//     assemblyOQCAno: string;
//     reason: string;
//     oqcApprovedBy?: string;
//     oqcApprovedAt?: string;
//   };
//   inventoryRemarks: string;
//   stage2Enabled: boolean;
//   status: string;
// }

// const ORTLabPage = () => {
//   const navigate = useNavigate();
//   const [tableData, setTableData] = useState<TableRow[]>([]);
//   const [loading, setLoading] = useState(true);
//   // Add modal state
//   const [noReasonModal, setNoReasonModal] = useState<NoReasonModal>({
//     isOpen: false,
//     rowId: null,
//     reason: ""
//   });

//   // Load data from localStorage on mount
//   useEffect(() => {
//     loadORTSubmissions();
//   }, []);

//   const loadORTSubmissions = () => {
//     try {
//       setLoading(true);

//       // Load ORT submissions from localStorage
//       const ortSubmissionsStr = localStorage.getItem("ort_lab_submissions");
//       let ortSubmissions: ORTSubmissionData[] = ortSubmissionsStr
//         ? JSON.parse(ortSubmissionsStr)
//         : [];

//       console.log("Loaded ORT submissions:", ortSubmissions);

//       // If no submissions in array, check single submission
//       if (ortSubmissions.length === 0) {
//         const singleSubmissionStr = localStorage.getItem("ort_lab_submission");
//         if (singleSubmissionStr) {
//           ortSubmissions = [JSON.parse(singleSubmissionStr)];
//           console.log("Loaded single ORT submission:", ortSubmissions[0]);
//         }
//       }

//       // Filter only submissions that are marked as submitted
//       ortSubmissions = ortSubmissions.filter(item =>
//         item.submitted === true
//       );

//       if (ortSubmissions.length === 0) {
//         console.log("No submitted ORT submissions found");
//         setTableData([]);
//         setLoading(false);
//         return;
//       }

//       // Load OQC records for additional details
//       const oqcDataStr = localStorage.getItem("testRecords");
//       const oqcRecords: OqcRecord[] = oqcDataStr ? JSON.parse(oqcDataStr) : [];

//       // Create a map for quick lookup
//       const oqcMap = new Map<string, OqcRecord>();
//       oqcRecords.forEach(record => {
//         oqcMap.set(record.ticketCode, record);
//       });

//       // Load existing Stage 1 data to preserve user inputs
//       const stage1DataStr = localStorage.getItem("stage1TableData");
//       const stage1Data: TableRow[] = stage1DataStr ? JSON.parse(stage1DataStr) : [];
//       const stage1Map = new Map(
//         stage1Data.map(row => [row.sessionId, row])
//       );

//       // Filter out already processed sessions
//       const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
//       const processedSessionIds = new Set<string>(
//         processedSessionsStr ? JSON.parse(processedSessionsStr) : []
//       );

//       // Generate table rows
//       const rows: TableRow[] = ortSubmissions
//         .filter(submission => !processedSessionIds.has(submission.id))
//         .map((submission, index) => {
//           const oqcRecord = oqcMap.get(submission.ticketCode);

//           // Check if this submission has existing saved data
//           const existingRow = stage1Map.get(submission.id);

//           const fallbackDetails = {
//             totalQuantity: submission.totalParts,
//             ticketCodeRaised: submission.ticketCode,
//             dateShiftTime: new Date(submission.timestamp).toLocaleString(),
//             project: submission.project || "N/A",
//             batch: submission.build || "N/A",
//             color: submission.colour || "N/A",
//             assemblyOQCAno: submission.anoType || "N/A",
//             reason: submission.reason || "N/A",
//             oqcApprovedBy: submission.oqcApprovedBy,
//             oqcApprovedAt: submission.oqcApprovedAt
//           };

//           const detailsBox = oqcRecord
//             ? {
//               totalQuantity: oqcRecord.totalQuantity || submission.totalParts,
//               ticketCodeRaised: oqcRecord.ticketCode,
//               dateShiftTime: oqcRecord.dateTime || new Date(submission.timestamp).toLocaleDateString(),
//               project: oqcRecord.project || "N/A",
//               batch: oqcRecord.build || "N/A",
//               color: oqcRecord.colour || "N/A",
//               assemblyOQCAno: oqcRecord.anoType || "N/A",
//               reason: oqcRecord.reason || "N/A",
//               oqcApprovedBy: oqcRecord.oqcApprovedBy,
//               oqcApprovedAt: oqcRecord.oqcApprovedAt
//             }
//             : fallbackDetails;

//           // Restore previous state if exists, otherwise create new row
//           return existingRow ? {
//             ...existingRow,
//             id: index + 1,
//           } : {
//             id: index + 1,
//             ticketCode: submission.ticketCode,
//             sessionId: submission.id,
//             sessionNumber: submission.sessionNumber,
//             partsBeingSent: submission.totalParts,
//             received: "",
//             inventoryRemarks: "",
//             stage2Enabled: false,
//             status: "Pending",
//             detailsBox,
//           };
//         })
//         .filter(row => row.status !== "Received"); // Filter out "Received" status records

//       setTableData(rows);
//       setLoading(false);

//     } catch (error) {
//       console.error("Error loading ORT submissions:", error);
//       toast({
//         variant: "destructive",
//         title: "Load Error",
//         description: "Failed to load ORT Lab submissions.",
//         duration: 3000,
//       });
//       setTableData([]);
//       setLoading(false);
//     }
//   };

//   const handleNoButtonClick = (id: number) => {
//     setNoReasonModal({
//       isOpen: true,
//       rowId: id,
//       reason: ""
//     });
//   };

//   const handleNoReasonChange = (value: string) => {
//     setNoReasonModal(prev => ({
//       ...prev,
//       reason: value
//     }));
//   };


//   const handleSaveNoReason = () => {
//     if (!noReasonModal.rowId || !noReasonModal.reason.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Please enter a reason",
//         duration: 3000,
//       });
//       return;
//     }

//     // Update the table data with "No" and the reason
//     setTableData((prevData) =>
//       prevData.map((row) => {
//         if (row.id === noReasonModal.rowId) {
//           return {
//             ...row,
//             received: "No",
//             status: "Not Received",
//             date: undefined,
//             shiftTime: undefined,
//             stage2Enabled: false,
//             inventoryRemarks: `Not Received - Reason: ${noReasonModal.reason}`
//           };
//         }
//         return row;
//       })
//     );

//     // Close modal
//     setNoReasonModal({
//       isOpen: false,
//       rowId: null,
//       reason: ""
//     });

//     toast({
//       title: "Marked as Not Received",
//       description: "Reason has been saved",
//       duration: 2000,
//     });
//   };

//   const handleCancelNoReason = () => {
//     setNoReasonModal({
//       isOpen: false,
//       rowId: null,
//       reason: ""
//     });
//   };


//   const handlePartialButtonClick = (id: number) => {
//     // Find the row that was clicked
//     const row = tableData.find(row => row.id === id);
//     if (!row) return;

//     // Save current table state
//     localStorage.setItem("stage1TableData", JSON.stringify(tableData));

//     // Store partial receipt info to be used by OQC system
//     const partialReceiptInfo = {
//       isPartial: true,
//       ticketCode: row.ticketCode,
//       sessionNumber: row.sessionNumber,
//       receivedQuantity: row.partsBeingSent,
//       requiredQuantity: row.detailsBox.totalQuantity,
//       timestamp: new Date().toISOString(),
//       // ADD these details from the row
//       project: row.detailsBox.project,
//       build: row.detailsBox.batch,
//       colour: row.detailsBox.color,
//       anoType: row.detailsBox.assemblyOQCAno,
//       source: row.detailsBox.reason,
//       reason: row.detailsBox.reason,
//       totalQuantity: row.detailsBox.totalQuantity
//     };

//     localStorage.setItem('partialReceiptInfo', JSON.stringify(partialReceiptInfo));

//     // Navigate directly to OQC System All Tickets tab
//     toast({
//       title: "Partial Receipt Initiated",
//       description: `Partial receipt saved for Ticket ${row.ticketCode}. You can continue scanning parts in OQC.`,
//       duration: 2000,
//     });
//   };
//   // Update the handleReceivedChange function to use modal for "No"
//   const handleReceivedChange = (id: number, value: "Yes" | "No" | "Partial") => {
//     if (value === "Yes") {
//       setTableData((prevData) =>
//         prevData.map((row) => {
//           if (row.id === id) {
//             return {
//               ...row,
//               received: value,
//               status: "Received",
//               date: getCurrentDate(),
//               shiftTime: getCurrentShift(),
//             };
//           }
//           return row;
//         })
//       );
//     } else {
//       // Open modal for "No" selection
//       handleNoButtonClick(id);
//     }
//   };

//   // Get current shift time
//   const getCurrentShift = () => {
//     const hour = new Date().getHours();
//     if (hour >= 6 && hour < 14) return "Morning Shift (6 AM - 2 PM)";
//     if (hour >= 14 && hour < 22) return "Afternoon Shift (2 PM - 10 PM)";
//     return "Night Shift (10 PM - 6 AM)";
//   };

//   const getCurrentDate = () => {
//     return new Date().toISOString().split("T")[0];
//   };

//   const handleInventoryRemarksChange = (id: number, value: string) => {
//     setTableData((prevData) =>
//       prevData.map((row) => (row.id === id ? { ...row, inventoryRemarks: value } : row))
//     );
//   };

//   const handleSave = () => {
//     // Validation: ensure all "Yes" rows have inventory remarks
//     const invalidRows = tableData.filter(
//       (row) => row.received === "Yes" && !row.inventoryRemarks.trim()
//     );

//     if (invalidRows.length > 0) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Please fill in Inventory Remarks for all items marked as Received (Yes)",
//         duration: 3000,
//       });
//       return;
//     }

//     // Update stage2Enabled based on valid "Yes" + remarks
//     const updatedData = tableData.map((row) => ({
//       ...row,
//       stage2Enabled: row.received === "Yes" && row.inventoryRemarks.trim() !== "",
//     }));

//     // Save current state
//     localStorage.setItem("stage1TableData", JSON.stringify(updatedData));

//     // Mark received items as processed in OQC records
//     updateOQCStatus(updatedData);

//     // Mark sessions as processed in ORT submissions
//     markSessionsAsProcessed(updatedData);

//     setTableData(updatedData);

//     // Show success toast
//     toast({
//       title: "Data Saved Successfully",
//       description: `Saved ${updatedData.filter((r) => r.received === "Yes").length} received item(s)`,
//       duration: 2000,
//     });
//   };

//   const updateOQCStatus = (updatedData: TableRow[]) => {
//     try {
//       const oqcDataStr = localStorage.getItem("testRecords");
//       if (oqcDataStr) {
//         let oqcRecords: OqcRecord[] = JSON.parse(oqcDataStr);

//         // Update status for received tickets
//         const receivedTicketCodes = new Set(
//           updatedData
//             .filter(row => row.received === "Yes")
//             .map(row => row.ticketCode)
//         );

//         oqcRecords = oqcRecords.map(record => {
//           if (receivedTicketCodes.has(record.ticketCode)) {
//             // Update session sentToORT status
//             const updatedSessions = record.sessions.map(session => {
//               const sessionRow = updatedData.find(row =>
//                 row.ticketCode === record.ticketCode &&
//                 row.sessionNumber === session.sessionNumber
//               );
//               if (sessionRow && sessionRow.received === "Yes") {
//                 return {
//                   ...session,
//                   sentToORT: true,
//                   sentToORTAt: new Date().toISOString()
//                 };
//               }
//               return session;
//             });

//             return {
//               ...record,
//               status: "Received at ORT",
//               sessions: updatedSessions
//             };
//           }
//           return record;
//         });

//         localStorage.setItem("testRecords", JSON.stringify(oqcRecords));
//         console.log("Updated OQC records status:", oqcRecords);
//       }
//     } catch (error) {
//       console.error("Error updating OQC status:", error);
//     }
//   };

//   const markSessionsAsProcessed = (updatedData: TableRow[]) => {
//     try {
//       const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
//       const processedSessionIds: string[] = processedSessionsStr
//         ? JSON.parse(processedSessionsStr)
//         : [];

//       const receivedSessions = updatedData
//         .filter(row => row.received === "Yes")
//         .map(row => row.sessionId);

//       // Add new processed sessions
//       receivedSessions.forEach(sessionId => {
//         if (!processedSessionIds.includes(sessionId)) {
//           processedSessionIds.push(sessionId);
//         }
//       });

//       // localStorage.setItem("processedORTSubmissions", JSON.stringify(processedSessionIds));
//       console.log("Marked sessions as processed:", processedSessionIds);
//     } catch (error) {
//       console.error("Error marking sessions as processed:", error);
//     }
//   };

//   const handleStage2Navigate = (row: TableRow) => {
//     // Save current table state before navigating
//     localStorage.setItem("stage1TableData", JSON.stringify(tableData));

//     // Navigate to Stage 2 form
//     navigate("/stage2-form", {
//       state: {
//         record: row,
//         fromStage1: true,
//       },
//     });

//     toast({
//       title: "Navigating to Stage 2",
//       description: `Opening Stage 2 for ticket ${row.ticketCode}`,
//       duration: 2000,
//     });
//   };

//   const refreshData = () => {
//     loadORTSubmissions();
//     toast({
//       title: "Data Refreshed",
//       description: "Loaded latest ORT submissions",
//       duration: 2000,
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading ORT Lab submissions...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto p-6 max-w-7xl">
//       <Card>
//         <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
//           <div className="flex justify-between items-center">
//             <div>
//               <CardTitle className="text-2xl font-bold text-gray-800">
//                 ORT Received Ticket - Stage 1
//               </CardTitle>
//               <p className="text-sm text-gray-600 mt-2">
//                 ORT receives the ticket from OQC System. Mark items as received and add inventory remarks.
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 onClick={refreshData}
//                 variant="outline"
//                 className="border-blue-300 text-blue-600 hover:bg-blue-50"
//               >
//                 Refresh
//               </Button>
//               <Button
//                 onClick={handleSave}
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//                 disabled={tableData.length === 0}
//               >
//                 <Save className="mr-2 h-4 w-4" />
//                 Save Data
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-6">
//           {tableData.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                 <CheckCircle className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                 No Pending ORT Submissions
//               </h3>
//               <p className="text-gray-500 mb-4">
//                 All ORT submissions have been processed or there are no new submissions.
//               </p>
//               <p className="text-sm text-gray-400">
//                 New submissions will appear here when sent from the OQC System.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <Badge variant="outline" className="bg-white">
//                       {tableData.length} Pending Submissions
//                     </Badge>
//                     <Badge variant="outline" className="bg-white">
//                       Session {tableData[0]?.sessionNumber || 'N/A'}
//                     </Badge>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     Click "Save Data" after marking items as received
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-gray-100">
//                       <TableHead className="font-bold text-gray-700 border">#</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Ticket Code</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Session</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Parts Being Sent</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Received (Yes/No)</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Date</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Shift/Time</TableHead>
//                       <TableHead className="font-bold text-gray-700 border min-w-[300px]">Details Box</TableHead>
//                       <TableHead className="font-bold text-gray-700 border min-w-[200px]">Inventory Remarks</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Status</TableHead>
//                       <TableHead className="font-bold text-gray-700 border">Stage 2</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {tableData.map((row) => (
//                       <TableRow key={row.id} className="hover:bg-gray-50">
//                         <TableCell className="border font-medium">{row.id}</TableCell>
//                         <TableCell className="border font-medium">
//                           <div className="font-bold text-blue-700">{row.ticketCode}</div>
//                           <div className="text-xs text-gray-500">Session {row.sessionNumber}</div>
//                         </TableCell>
//                         <TableCell className="border text-center">
//                           <Badge variant="outline" className="bg-gray-100">
//                             #{row.sessionNumber}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="border text-center font-semibold">{row.partsBeingSent}</TableCell>
//                         <TableCell className="border">
//                           <div className="flex gap-2 justify-center">
//                             <Button
//                               size="sm"
//                               variant={row.received === "Yes" ? "default" : "outline"}
//                               onClick={() => handleReceivedChange(row.id, "Yes")}
//                               className={row.received === "Yes" ? "bg-green-600 hover:bg-green-700" : ""}
//                             >
//                               ✓ Yes
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant={row.received === "Partial" ? "default" : "outline"}
//                               onClick={() => handlePartialButtonClick(row.id)}
//                               className={row.received === "Partial" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
//                             >
//                               Partial
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant={row.received === "No" ? "default" : "outline"}
//                               onClick={() => handleReceivedChange(row.id, "No")}
//                               className={row.received === "No" ? "bg-red-600 hover:bg-red-700" : ""}
//                             >
//                               ✗ No
//                             </Button>
//                           </div>
//                         </TableCell>
//                         <TableCell className="border">
//                           {row.date ? (
//                             <span className="font-medium text-blue-700">
//                               {new Date(row.date).toLocaleDateString()}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">Auto fetch!</span>
//                           )}
//                         </TableCell>
//                         <TableCell className="border">
//                           {row.shiftTime ? (
//                             <span className="font-medium text-purple-700">{row.shiftTime}</span>
//                           ) : (
//                             <span className="text-gray-400 italic">Auto fetch!</span>
//                           )}
//                         </TableCell>
//                         <TableCell className="border">
//                           <div className="space-y-1 text-xs bg-gray-50 p-3 rounded">
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-gray-600">• Total Quantity:</span>
//                               <span className="font-bold text-blue-700">{row.detailsBox.totalQuantity}</span>
//                             </div>
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-red-600">• Ticket Code Raised:</span>
//                               <span className="font-medium">{row.detailsBox.ticketCodeRaised}</span>
//                             </div>
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-red-600">• Date, SHIFT/time:</span>
//                               <span className="font-medium">{row.detailsBox.dateShiftTime}</span>
//                             </div>
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-gray-600">• Project/Batch/Color:</span>
//                               <span className="font-medium">
//                                 {row.detailsBox.project} / {row.detailsBox.batch} / {row.detailsBox.color}
//                               </span>
//                             </div>
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-gray-600">• Assembly/OQC/Ano:</span>
//                               <span className="font-medium">{row.detailsBox.assemblyOQCAno}</span>
//                             </div>
//                             <div className="flex gap-2">
//                               <span className="font-semibold text-gray-600">• Reason:</span>
//                               <span className="font-medium">{row.detailsBox.reason}</span>
//                             </div>
//                             {row.detailsBox.oqcApprovedBy && (
//                               <div className="flex gap-2 mt-1 pt-1 border-t">
//                                 <span className="font-semibold text-green-600">• OQC Approved by:</span>
//                                 <span className="font-medium">{row.detailsBox.oqcApprovedBy}</span>
//                               </div>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell className="border">
//                           <Input
//                             value={row.inventoryRemarks}
//                             onChange={(e) => handleInventoryRemarksChange(row.id, e.target.value)}
//                             placeholder="Where they are placing..."
//                             className="w-full"
//                             disabled={row.received !== "Yes"}
//                           />
//                           {row.received === "Yes" && !row.inventoryRemarks.trim() && (
//                             <p className="text-xs text-red-500 mt-1">Required for received items</p>
//                           )}
//                         </TableCell>
//                         <TableCell className="border">
//                           <Badge className={
//                             row.status === "Received"
//                               ? "bg-green-100 text-green-800"
//                               : row.status === "Not Received"
//                                 ? "bg-red-100 text-red-800"
//                                 : "bg-gray-100 text-gray-800"
//                           }>
//                             {row.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="border text-center">
//                           {row.stage2Enabled ? (
//                             <Button
//                               size="sm"
//                               onClick={() => handleStage2Navigate(row)}
//                               className="bg-indigo-600 hover:bg-indigo-700 text-white"
//                             >
//                               <ArrowRight className="mr-2 h-4 w-4" />
//                               Stage 2
//                             </Button>
//                           ) : (
//                             <span className="text-xs text-gray-400 italic">
//                               {row.received === "Yes" ? "Add remarks & save" : "Mark as received"}
//                             </span>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* No Reason Modal */}
//       <Dialog open={noReasonModal.isOpen} onOpenChange={handleCancelNoReason}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Mark as Not Received</DialogTitle>
//             <DialogDescription>
//               Please provide a reason for marking this item as Not Received.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="mt-4">
//             <Input
//               value={noReasonModal.reason}
//               onChange={(e) => handleNoReasonChange(e.target.value)}
//               placeholder="Enter reason"
//             />
//           </div>
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={handleCancelNoReason}>
//               Cancel
//             </Button>
//             <Button onClick={handleSaveNoReason}>Save</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// // Add Badge component if not available
// const Badge = ({ children, variant = "default", className = "" }: any) => {
//   const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
//   const variants = {
//     default: "bg-blue-100 text-blue-800",
//     outline: "border border-gray-300 bg-white text-gray-700",
//   };

//   return (
//     <span className={`${baseStyles} ${variants[variant]} ${className}`}>
//       {children}
//     </span>
//   );
// };

// export default ORTLabPage;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Save, ArrowRight, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface NoReasonModal {
  isOpen: boolean;
  rowId: number | null;
  reason: string;
}

interface ORTSubmissionData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  sessionNumber: number;
  parts: Array<{
    id: string;
    partNumber: string;
    serialNumber: string;
    scanStatus: 'OK' | 'Cosmetic' | 'Not OK';
    scannedAt: string;
    location: string;
  }>;
  project: string;
  build: string;
  colour: string;
  anoType: string;
  source: string;
  reason: string;
  oqcApprovedBy?: string;
  oqcApprovedAt?: string;
  submittedAt?: string;
  totalParts: number;
  serialNumber: string;
  partNumbers: string[];
  rawBarcodeData?: string;
  submitted?: boolean;
}

interface OqcRecord {
  id: number;
  ticketCode: string;
  totalQuantity: number;
  anoType: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  status: string;
  sessions: Array<any>;
  createdAt: string;
  oqcApproved: boolean;
  oqcApprovedBy?: string;
  oqcApprovedAt?: string;
}

interface TableRow {
  id: number;
  ticketCode: string;
  sessionId: string;
  sessionNumber: number;
  partsBeingSent: number;
  received: "Yes" | "No" | "Partial" | "";
  date?: string;
  shiftTime?: string;
  detailsBox: {
    totalQuantity: number;
    ticketCodeRaised: string;
    dateShiftTime: string;
    project: string;
    batch: string;
    color: string;
    assemblyOQCAno: string;
    reason: string;
    oqcApprovedBy?: string;
    oqcApprovedAt?: string;
  };
  inventoryRemarks: string;
  stage2Enabled: boolean;
  status: string;
}

const ORTLabPage = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [noReasonModal, setNoReasonModal] = useState<NoReasonModal>({
    isOpen: false,
    rowId: null,
    reason: ""
  });

  useEffect(() => {
    loadORTSubmissions();
  }, []);

  const loadORTSubmissions = () => {
    try {
      setLoading(true);

      const ortSubmissionsStr = localStorage.getItem("ort_lab_submissions");
      let ortSubmissions: ORTSubmissionData[] = ortSubmissionsStr
        ? JSON.parse(ortSubmissionsStr)
        : [];

      console.log("Loaded ORT submissions:", ortSubmissions);

      if (ortSubmissions.length === 0) {
        const singleSubmissionStr = localStorage.getItem("ort_lab_submission");
        if (singleSubmissionStr) {
          ortSubmissions = [JSON.parse(singleSubmissionStr)];
          console.log("Loaded single ORT submission:", ortSubmissions[0]);
        }
      }

      ortSubmissions = ortSubmissions.filter(item =>
        item.submitted === true
      );

      if (ortSubmissions.length === 0) {
        console.log("No submitted ORT submissions found");
        setTableData([]);
        setLoading(false);
        return;
      }

      const oqcDataStr = localStorage.getItem("testRecords");
      const oqcRecords: OqcRecord[] = oqcDataStr ? JSON.parse(oqcDataStr) : [];

      const oqcMap = new Map<string, OqcRecord>();
      oqcRecords.forEach(record => {
        oqcMap.set(record.ticketCode, record);
      });

      const stage1DataStr = localStorage.getItem("stage1TableData");
      const stage1Data: TableRow[] = stage1DataStr ? JSON.parse(stage1DataStr) : [];
      const stage1Map = new Map(
        stage1Data.map(row => [row.sessionId, row])
      );

      const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
      const processedSessionIds = new Set<string>(
        processedSessionsStr ? JSON.parse(processedSessionsStr) : []
      );

      const rows: TableRow[] = ortSubmissions
        .filter(submission => !processedSessionIds.has(submission.id))
        .map((submission, index) => {
          const oqcRecord = oqcMap.get(submission.ticketCode);
          const existingRow = stage1Map.get(submission.id);

          const fallbackDetails = {
            totalQuantity: submission.totalParts,
            ticketCodeRaised: submission.ticketCode,
            dateShiftTime: new Date(submission.timestamp).toLocaleString(),
            project: submission.project || "N/A",
            batch: submission.build || "N/A",
            color: submission.colour || "N/A",
            assemblyOQCAno: submission.anoType || "N/A",
            reason: submission.reason || "N/A",
            oqcApprovedBy: submission.oqcApprovedBy,
            oqcApprovedAt: submission.oqcApprovedAt
          };

          const detailsBox = oqcRecord
            ? {
              totalQuantity: oqcRecord.totalQuantity || submission.totalParts,
              ticketCodeRaised: oqcRecord.ticketCode,
              dateShiftTime: oqcRecord.dateTime || new Date(submission.timestamp).toLocaleDateString(),
              project: oqcRecord.project || "N/A",
              batch: oqcRecord.build || "N/A",
              color: oqcRecord.colour || "N/A",
              assemblyOQCAno: oqcRecord.anoType || "N/A",
              reason: oqcRecord.reason || "N/A",
              oqcApprovedBy: oqcRecord.oqcApprovedBy,
              oqcApprovedAt: oqcRecord.oqcApprovedAt
            }
            : fallbackDetails;

          return existingRow ? {
            ...existingRow,
            id: index + 1,
          } : {
            id: index + 1,
            ticketCode: submission.ticketCode,
            sessionId: submission.id,
            sessionNumber: submission.sessionNumber,
            partsBeingSent: submission.totalParts,
            received: "",
            inventoryRemarks: "",
            stage2Enabled: false,
            status: "Pending",
            detailsBox,
          };
        })
        .filter(row => row.status !== "Received");

      setTableData(rows);
      setLoading(false);

    } catch (error) {
      console.error("Error loading ORT submissions:", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load ORT Lab submissions.",
        duration: 3000,
      });
      setTableData([]);
      setLoading(false);
    }
  };

  const handleNoButtonClick = (id: number) => {
    setNoReasonModal({
      isOpen: true,
      rowId: id,
      reason: ""
    });
  };

  const handleNoReasonChange = (value: string) => {
    setNoReasonModal(prev => ({
      ...prev,
      reason: value
    }));
  };

  const handleSaveNoReason = () => {
    if (!noReasonModal.rowId || !noReasonModal.reason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reason",
        duration: 3000,
      });
      return;
    }

    setTableData((prevData) =>
      prevData.map((row) => {
        if (row.id === noReasonModal.rowId) {
          return {
            ...row,
            received: "No",
            status: "Not Received",
            date: undefined,
            shiftTime: undefined,
            stage2Enabled: false,
            inventoryRemarks: `Not Received - Reason: ${noReasonModal.reason}`
          };
        }
        return row;
      })
    );

    setNoReasonModal({
      isOpen: false,
      rowId: null,
      reason: ""
    });

    toast({
      title: "Marked as Not Received",
      description: "Reason has been saved",
      duration: 2000,
    });
  };

  const handleCancelNoReason = () => {
    setNoReasonModal({
      isOpen: false,
      rowId: null,
      reason: ""
    });
  };

  const handlePartialButtonClick = (id: number) => {
    const row = tableData.find(row => row.id === id);
    if (!row) return;

    // Update the row to mark as Partial
    setTableData((prevData) =>
      prevData.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            received: "Partial",
            status: "Partial Receipt",
            date: getCurrentDate(),
            shiftTime: getCurrentShift(),
          };
        }
        return r;
      })
    );

    localStorage.setItem("stage1TableData", JSON.stringify(tableData));

    const partialReceiptInfo = {
      isPartial: true,
      ticketCode: row.ticketCode,
      sessionNumber: row.sessionNumber,
      receivedQuantity: row.partsBeingSent,
      requiredQuantity: row.detailsBox.totalQuantity,
      timestamp: new Date().toISOString(),
      project: row.detailsBox.project,
      build: row.detailsBox.batch,
      colour: row.detailsBox.color,
      anoType: row.detailsBox.assemblyOQCAno,
      source: row.detailsBox.reason,
      reason: row.detailsBox.reason,
      totalQuantity: row.detailsBox.totalQuantity
    };

    localStorage.setItem('partialReceiptInfo', JSON.stringify(partialReceiptInfo));

    toast({
      title: "Partial Receipt Initiated",
      description: `Partial receipt saved for Ticket ${row.ticketCode}. You can continue scanning parts in OQC.`,
      duration: 2000,
    });
  };

  const handleReceivedChange = (id: number, value: "Yes" | "No" | "Partial") => {
    if (value === "Yes") {
      setTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              received: value,
              status: "Received",
              date: getCurrentDate(),
              shiftTime: getCurrentShift(),
            };
          }
          return row;
        })
      );
    } else if (value === "No") {
      handleNoButtonClick(id);
    }
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning Shift (6 AM - 2 PM)";
    if (hour >= 14 && hour < 22) return "Afternoon Shift (2 PM - 10 PM)";
    return "Night Shift (10 PM - 6 AM)";
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleInventoryRemarksChange = (id: number, value: string) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, inventoryRemarks: value } : row))
    );
  };

  const handleSave = () => {
    const invalidRows = tableData.filter(
      (row) => row.received === "Yes" && !row.inventoryRemarks.trim()
    );

    if (invalidRows.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in Inventory Remarks for all items marked as Received (Yes)",
        duration: 3000,
      });
      return;
    }

    const updatedData = tableData.map((row) => ({
      ...row,
      stage2Enabled: row.received === "Yes" && row.inventoryRemarks.trim() !== "",
    }));

    localStorage.setItem("stage1TableData", JSON.stringify(updatedData));
    updateOQCStatus(updatedData);
    markSessionsAsProcessed(updatedData);
    setTableData(updatedData);

    toast({
      title: "Data Saved Successfully",
      description: `Saved ${updatedData.filter((r) => r.received === "Yes").length} received item(s)`,
      duration: 2000,
    });
  };

  const updateOQCStatus = (updatedData: TableRow[]) => {
    try {
      const oqcDataStr = localStorage.getItem("testRecords");
      if (oqcDataStr) {
        let oqcRecords: OqcRecord[] = JSON.parse(oqcDataStr);

        const receivedTicketCodes = new Set(
          updatedData
            .filter(row => row.received === "Yes")
            .map(row => row.ticketCode)
        );

        oqcRecords = oqcRecords.map(record => {
          if (receivedTicketCodes.has(record.ticketCode)) {
            const updatedSessions = record.sessions.map(session => {
              const sessionRow = updatedData.find(row =>
                row.ticketCode === record.ticketCode &&
                row.sessionNumber === session.sessionNumber
              );
              if (sessionRow && sessionRow.received === "Yes") {
                return {
                  ...session,
                  sentToORT: true,
                  sentToORTAt: new Date().toISOString()
                };
              }
              return session;
            });

            return {
              ...record,
              status: "Received at ORT",
              sessions: updatedSessions
            };
          }
          return record;
        });

        localStorage.setItem("testRecords", JSON.stringify(oqcRecords));
        console.log("Updated OQC records status:", oqcRecords);
      }
    } catch (error) {
      console.error("Error updating OQC status:", error);
    }
  };

  const markSessionsAsProcessed = (updatedData: TableRow[]) => {
    try {
      const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
      const processedSessionIds: string[] = processedSessionsStr
        ? JSON.parse(processedSessionsStr)
        : [];

      const receivedSessions = updatedData
        .filter(row => row.received === "Yes")
        .map(row => row.sessionId);

      receivedSessions.forEach(sessionId => {
        if (!processedSessionIds.includes(sessionId)) {
          processedSessionIds.push(sessionId);
        }
      });

      console.log("Marked sessions as processed:", processedSessionIds);
    } catch (error) {
      console.error("Error marking sessions as processed:", error);
    }
  };

  const handleStage2Navigate = (row: TableRow) => {
    localStorage.setItem("stage1TableData", JSON.stringify(tableData));

    navigate("/stage2-form", {
      state: {
        record: row,
        fromStage1: true,
      },
    });

    toast({
      title: "Navigating to Stage 2",
      description: `Opening Stage 2 for ticket ${row.ticketCode}`,
      duration: 2000,
    });
  };

  const refreshData = () => {
    loadORTSubmissions();
    toast({
      title: "Data Refreshed",
      description: "Loaded latest ORT submissions",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ORT Lab submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                ORT Received Ticket - Stage 1
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                ORT receives the ticket from OQC System. Mark items as received and add inventory remarks.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Refresh
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={tableData.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {tableData.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Pending ORT Submissions
              </h3>
              <p className="text-gray-500 mb-4">
                All ORT submissions have been processed or there are no new submissions.
              </p>
              <p className="text-sm text-gray-400">
                New submissions will appear here when sent from the OQC System.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-white">
                      {tableData.length} Pending Submissions
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Session {tableData[0]?.sessionNumber || 'N/A'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Click "Save Data" after marking items as received
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-gray-700 border">#</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Ticket Code</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Session</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Parts Being Sent</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Received (Yes/No)</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Shift/Time</TableHead>
                      <TableHead className="font-bold text-gray-700 border min-w-[300px]">Details Box</TableHead>
                      <TableHead className="font-bold text-gray-700 border min-w-[200px]">Inventory Remarks</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Stage 2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        <TableCell className="border font-medium">{row.id}</TableCell>
                        <TableCell className="border font-medium">
                          <div className="font-bold text-blue-700">{row.ticketCode}</div>
                          <div className="text-xs text-gray-500">Session {row.sessionNumber}</div>
                        </TableCell>
                        <TableCell className="border text-center">
                          <Badge variant="outline" className="bg-gray-100">
                            #{row.sessionNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="border text-center font-semibold">{row.partsBeingSent}</TableCell>
                        <TableCell className="border">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReceivedChange(row.id, "Yes")}
                              className={
                                row.received === "Yes"
                                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                  : "hover:bg-green-50"
                              }
                            >
                              ✓ Yes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePartialButtonClick(row.id)}
                              className={
                                row.received === "Partial"
                                  ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                                  : "hover:bg-yellow-50"
                              }
                            >
                              Partial
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReceivedChange(row.id, "No")}
                              className={
                                row.received === "No"
                                  ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                  : "hover:bg-red-50"
                              }
                            >
                              ✗ No
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="border">
                          {row.date ? (
                            <span className="font-medium text-blue-700">
                              {new Date(row.date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Auto fetch!</span>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          {row.shiftTime ? (
                            <span className="font-medium text-purple-700">{row.shiftTime}</span>
                          ) : (
                            <span className="text-gray-400 italic">Auto fetch!</span>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          <div className="space-y-1 text-xs bg-gray-50 p-3 rounded">
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Total Quantity:</span>
                              <span className="font-bold text-blue-700">{row.detailsBox.totalQuantity}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-red-600">• Ticket Code Raised:</span>
                              <span className="font-medium">{row.detailsBox.ticketCodeRaised}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-red-600">• Date, SHIFT/time:</span>
                              <span className="font-medium">{row.detailsBox.dateShiftTime}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Project/Batch/Color:</span>
                              <span className="font-medium">
                                {row.detailsBox.project} / {row.detailsBox.batch} / {row.detailsBox.color}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Assembly/OQC/Ano:</span>
                              <span className="font-medium">{row.detailsBox.assemblyOQCAno}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Reason:</span>
                              <span className="font-medium">{row.detailsBox.reason}</span>
                            </div>
                            {row.detailsBox.oqcApprovedBy && (
                              <div className="flex gap-2 mt-1 pt-1 border-t">
                                <span className="font-semibold text-green-600">• OQC Approved by:</span>
                                <span className="font-medium">{row.detailsBox.oqcApprovedBy}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="border">
                          <Input
                            value={row.inventoryRemarks}
                            onChange={(e) => handleInventoryRemarksChange(row.id, e.target.value)}
                            placeholder="Where they are placing..."
                            className="w-full"
                            disabled={row.received !== "Yes"}
                          />
                          {row.received === "Yes" && !row.inventoryRemarks.trim() && (
                            <p className="text-xs text-red-500 mt-1">Required for received items</p>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          <Badge className={
                            row.status === "Received"
                              ? "bg-green-100 text-green-800"
                              : row.status === "Not Received"
                                ? "bg-red-100 text-red-800"
                                : row.status === "Partial Receipt"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="border text-center">
                          {row.stage2Enabled ? (
                            <Button
                              size="sm"
                              onClick={() => handleStage2Navigate(row)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Stage 2
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {row.received === "Yes" ? "Add remarks & save" : "Mark as received"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={noReasonModal.isOpen} onOpenChange={handleCancelNoReason}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Not Received</DialogTitle>
            <DialogDescription>
              Please provide a reason for marking this item as Not Received.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={noReasonModal.reason}
              onChange={(e) => handleNoReasonChange(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancelNoReason}>
              Cancel
            </Button>
            <Button onClick={handleSaveNoReason}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variants = {
    default: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 bg-white text-gray-700",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default ORTLabPage;