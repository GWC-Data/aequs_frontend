
// import React, { useRef, useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast";
// import { ArrowLeft, X, Scan, Trash2, Plus, Minus, Edit, Play } from "lucide-react";

// interface TestRecord {
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
// }

// // Static barcode data for testing
// const STATIC_BARCODE_DATA = [
//   "SN001:PART001,PART002,PART003,PART004,PART005"
// ];

// // Interface for used parts tracking
// interface UsedParts {
//   [serialNumber: string]: string[];
// }

// // Interface for ORT records
// interface ORTRecord {
//   ortLab: {
//     date: string;
//     serialNumber: string;
//     partNumbers: string[];
//     scannedPartNumbers: string[];
//     splitRows: {
//       quantity: string;
//       buildProject: string;
//       line: string;
//       color: string;
//       remark: string;
//       assignedParts: string[];
//     }[];
//     remark: string;
//     submittedAt: string;
//   };
// }

// // Build/Project options
// const BUILD_PROJECT_OPTIONS = [
//   "PRQ/ProjectAA",
//   "PRB/ProjectBB"
// ];

// // Line options
// const LINE_OPTIONS = [
//   "Line1",
//   "Line2"
// ];

// // Color options
// const COLOR_OPTIONS = [
//   "NDA-XX",
//   "LB-XX",
//   "SD-XX"
// ];

// // Interface for split row
// interface SplitRow {
//   id: string;
//   quantity: string;
//   buildProject: string;
//   line: string;
//   color: string;
//   remark: string;
//   assignedParts: string[];
// }

// // Interface for parts summary table
// interface PartsSummary {
//   serialNumber: string;
//   availableParts: string[];
//   assignedParts: string[];
//   unassignedParts: string[];
//   recordId: number;
// }

// const ORTLabPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedRecord = location.state?.record as TestRecord | undefined;

//   const [ortForm, setOrtForm] = useState({
//     date: new Date().toISOString().split('T')[0],
//     remark: ""
//   });

//   const [serialNumber, setSerialNumber] = useState("");
//   const [scannedPartNumbers, setScannedPartNumbers] = useState<string[]>([]);
//   const [selectedPartNumbers, setSelectedPartNumbers] = useState<string[]>([]);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [usedParts, setUsedParts] = useState<UsedParts>({});
//   const [partsSummary, setPartsSummary] = useState<PartsSummary[]>([]);
//   const [showSummaryTable, setShowSummaryTable] = useState(false);
//   const barcodeInputRef = useRef<HTMLInputElement>(null);

//   // Split management
//   const [splitRows, setSplitRows] = useState<SplitRow[]>([
//     {
//       id: '1',
//       quantity: '',
//       buildProject: '',
//       line: '',
//       color: '',
//       remark: '',
//       assignedParts: []
//     }
//   ]);

//   // Auto-focus on barcode input
//   useEffect(() => {
//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//   }, []);

//   // Load used parts and parts summary from localStorage on component mount
//   useEffect(() => {
//     const loadData = () => {
//       try {
//         const existingORTData = localStorage.getItem("ortLabRecords");
//         if (existingORTData) {
//           const ortRecords = JSON.parse(existingORTData);
//           const usedPartsMap: UsedParts = {};
//           const summary: PartsSummary[] = [];

//           ortRecords.forEach((record: any) => {
//             if (record.ortLab && record.ortLab.serialNumber && record.ortLab.partNumbers) {
//               const serial = record.ortLab.serialNumber;
//               const parts = record.ortLab.partNumbers;

//               if (!usedPartsMap[serial]) {
//                 usedPartsMap[serial] = [];
//               }
//               usedPartsMap[serial] = [...new Set([...usedPartsMap[serial], ...parts])];

//               // Calculate assigned and unassigned parts for summary
//               const assignedParts = record.ortLab.splitRows?.flatMap((row: any) => row.assignedParts) || [];
//               const unassignedParts = parts.filter((part: string) => !assignedParts.includes(part));

//               summary.push({
//                 serialNumber: serial,
//                 availableParts: parts,
//                 assignedParts: assignedParts,
//                 unassignedParts: unassignedParts,
//                 recordId: record.id
//               });
//             }
//           });

//           setUsedParts(usedPartsMap);
//           setPartsSummary(summary);
//         }
//       } catch (error) {
//         console.error("Error loading data:", error);
//       }
//     };

//     loadData();
//   }, []);

//   // Get available (unused) part numbers for current serial
//   const getAvailablePartNumbers = (allParts: string[], serial: string) => {
//     const usedPartsForSerial = usedParts[serial] || [];
//     return allParts.filter(part => !usedPartsForSerial.includes(part));
//   };

//   // Get unassigned part numbers (parts not assigned to any row yet)
//   const getUnassignedPartNumbers = () => {
//     const assignedParts = splitRows.flatMap(row => row.assignedParts);
//     return selectedPartNumbers.filter(part => !assignedParts.includes(part));
//   };

//   // Handle physical barcode scanner input
//   const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();

//       const barcodeData = barcodeInput.trim();
//       if (barcodeData) {
//         processBarcodeData(barcodeData);
//         setBarcodeInput("");

//         // Auto-refocus for next scan
//         setTimeout(() => {
//           if (barcodeInputRef.current) {
//             barcodeInputRef.current.focus();
//           }
//         }, 100);
//       }
//     }
//   };

//   // Process barcode data from physical scanner
//   const processBarcodeData = (data: string) => {
//     if (!data.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Invalid Barcode",
//         description: "Scanned data is empty",
//         duration: 2000,
//       });
//       return;
//     }

//     try {
//       let serial = "";
//       let partNumbers: string[] = [];

//       // Check if input is a static barcode from our test data
//       const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
//         barcode.split(':')[0] === data.toUpperCase()
//       );

//       if (staticBarcode) {
//         const parts = staticBarcode.split(':');
//         serial = parts[0].trim();
//         if (parts.length > 1) {
//           partNumbers = parts[1].split(',')
//             .map(p => p.trim())
//             .filter(p => p.length > 0);
//         }
//       }
//       // Format 1: SERIAL:PART1,PART2,PART3
//       else if (data.includes(':') && data.includes(',')) {
//         const parts = data.split(':');
//         serial = parts[0].trim();

//         if (parts.length > 1) {
//           partNumbers = parts[1].split(',')
//             .map(p => p.trim())
//             .filter(p => p.length > 0);
//         }
//       }
//       // Format 2: SERIAL:PART1 (single part)
//       else if (data.includes(':') && !data.includes(',')) {
//         const parts = data.split(':');
//         serial = parts[0].trim();
//         if (parts.length > 1) {
//           partNumbers = [parts[1].trim()];
//         }
//       }
//       // Format 3: JSON format from smart scanners
//       else if (data.startsWith('{') && data.endsWith('}')) {
//         try {
//           const parsedData = JSON.parse(data);
//           serial = parsedData.serial || parsedData.Serial || parsedData.SN || "";
//           partNumbers = Array.isArray(parsedData.parts) ? parsedData.parts
//             : Array.isArray(parsedData.partNumbers) ? parsedData.partNumbers
//               : parsedData.part ? [parsedData.part]
//                 : [];
//         } catch (jsonError) {
//           console.error("JSON parse error:", jsonError);
//           serial = data.trim();
//         }
//       }
//       // Format 4: Simple serial number only
//       else {
//         serial = data.trim();
//       }

//       // Validate serial number
//       if (!serial) {
//         toast({
//           variant: "destructive",
//           title: "Invalid Barcode Format",
//           description: "No serial number found in scanned data",
//           duration: 3000,
//         });
//         return;
//       }

//       // Set serial number
//       setSerialNumber(serial);

//       if (partNumbers.length > 0) {
//         // Get available (unused) parts for this serial
//         const availableParts = getAvailablePartNumbers(partNumbers, serial);

//         setScannedPartNumbers(availableParts);

//         if (availableParts.length > 0) {
//           // Auto-select all available parts
//           setSelectedPartNumbers(availableParts);
//           toast({
//             title: "✅ Barcode Scanned Successfully",
//             description: `Serial: ${serial}, ${availableParts.length} available part(s) loaded`,
//             duration: 3000,
//           });
//         } else {
//           setSelectedPartNumbers([]);
//           toast({
//             title: "⚠️ All Parts Already Used",
//             description: `Serial: ${serial} - All parts from this barcode are already used in previous records`,
//             duration: 3000,
//           });
//         }
//       } else {
//         setScannedPartNumbers([]);
//         setSelectedPartNumbers([]);
//         toast({
//           title: "✅ Serial Number Scanned",
//           description: `Serial: ${serial} - No parts found in barcode`,
//           duration: 3000,
//         });
//       }

//     } catch (error) {
//       console.error("Barcode processing error:", error);
//       toast({
//         variant: "destructive",
//         title: "Scan Error",
//         description: "Failed to process barcode data. Please check the format.",
//         duration: 3000,
//       });
//     }
//   };

//   // Manual serial number input fallback
//   const handleManualSerialInput = (value: string) => {
//     setSerialNumber(value);
//     setScannedPartNumbers([]);
//     setSelectedPartNumbers([]);
//     setSplitRows([{
//       id: '1',
//       quantity: '',
//       buildProject: '',
//       line: '',
//       color: '',
//       remark: '',
//       assignedParts: []
//     }]);
//   };

//   // Clear all scanned data
//   const clearScannedData = () => {
//     setSerialNumber("");
//     setScannedPartNumbers([]);
//     setSelectedPartNumbers([]);
//     setBarcodeInput("");
//     setSplitRows([{
//       id: '1',
//       quantity: '',
//       buildProject: '',
//       line: '',
//       color: '',
//       remark: '',
//       assignedParts: []
//     }]);

//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }

//     toast({
//       title: "Data Cleared",
//       description: "All scanned data has been cleared",
//       duration: 2000,
//     });
//   };

//   // Test with static barcode data
//   const testWithStaticBarcode = (barcode: string) => {
//     setBarcodeInput(barcode);
//     processBarcodeData(barcode);
//     setBarcodeInput("");
//   };

//   // Add a new split row
//   const addSplitRow = () => {
//     const newId = (splitRows.length + 1).toString();
//     setSplitRows([...splitRows, {
//       id: newId,
//       quantity: '',
//       buildProject: '',
//       line: '',
//       color: '',
//       remark: '',
//       assignedParts: []
//     }]);
//   };

//   // Remove a split row
//   const removeSplitRow = (id: string) => {
//     if (splitRows.length === 1) {
//       toast({
//         variant: "destructive",
//         title: "Cannot Remove",
//         description: "At least one row is required",
//         duration: 2000,
//       });
//       return;
//     }
//     setSplitRows(splitRows.filter(row => row.id !== id));
//   };

//   // Update split row field
//   const updateSplitRow = (id: string, field: keyof SplitRow, value: string) => {
//     setSplitRows(splitRows.map(row =>
//       row.id === id ? { ...row, [field]: value } : row
//     ));
//   };

//   // Auto-assign parts based on quantities
//   const autoAssignParts = () => {
//     if (selectedPartNumbers.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Parts Available",
//         description: "Please scan and select parts first",
//         duration: 2000,
//       });
//       return;
//     }

//     // Validate quantities
//     const totalQuantity = splitRows.reduce((sum, row) => {
//       const qty = parseInt(row.quantity) || 0;
//       return sum + qty;
//     }, 0);

//     if (totalQuantity === 0) {
//       toast({
//         variant: "destructive",
//         title: "Invalid Quantities",
//         description: "Please enter quantities for the rows",
//         duration: 2000,
//       });
//       return;
//     }

//     if (totalQuantity > selectedPartNumbers.length) {
//       toast({
//         variant: "destructive",
//         title: "Insufficient Parts",
//         description: `Total quantity (${totalQuantity}) exceeds available parts (${selectedPartNumbers.length})`,
//         duration: 3000,
//       });
//       return;
//     }

//     // Assign parts to rows based on quantity
//     let currentIndex = 0;
//     const updatedRows = splitRows.map(row => {
//       const qty = parseInt(row.quantity) || 0;
//       const assignedParts = selectedPartNumbers.slice(currentIndex, currentIndex + qty);
//       currentIndex += qty;
//       return { ...row, assignedParts };
//     });

//     setSplitRows(updatedRows);

//     toast({
//       title: "✅ Parts Assigned",
//       description: `${totalQuantity} parts have been assigned to ${splitRows.length} row(s)`,
//       duration: 3000,
//     });
//   };

//   // Form handling functions
//   const handleORTInputChange = (field: keyof typeof ortForm, value: string) => {
//     setOrtForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleORTSubmit = () => {
//     if (!selectedRecord) return;

//     // Validate basic fields
//     if (!ortForm.date) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Form",
//         description: "Please fill in the date field.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (!serialNumber) {
//       toast({
//         variant: "destructive",
//         title: "Missing Serial Number",
//         description: "Please scan or enter a serial number.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (selectedPartNumbers.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Part Numbers",
//         description: "Please scan and select parts.",
//         duration: 2000,
//       });
//       return;
//     }

//     // Validate split rows
//     const invalidRows = splitRows.filter(row =>
//       !row.quantity || !row.buildProject || !row.line || !row.color || row.assignedParts.length === 0
//     );

//     if (invalidRows.length > 0) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Split Rows",
//         description: "Please complete all rows (Quantity, Build/Project, Line, Color) and assign parts.",
//         duration: 3000,
//       });
//       return;
//     }

//     // Check if all selected parts are assigned
//     const totalAssigned = splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0);
//     if (totalAssigned !== selectedPartNumbers.length) {
//       toast({
//         variant: "destructive",
//         title: "Parts Not Fully Assigned",
//         description: `${selectedPartNumbers.length - totalAssigned} parts are not assigned. Please use "Auto-Assign Parts" button.`,
//         duration: 3000,
//       });
//       return;
//     }

//     try {
//       const ortLabData = {
//         ...selectedRecord,
//         ortLab: {
//           date: ortForm.date,
//           serialNumber: serialNumber,
//           partNumbers: selectedPartNumbers,
//           scannedPartNumbers: scannedPartNumbers,
//           splitRows: splitRows.map(row => ({
//             quantity: row.quantity,
//             buildProject: row.buildProject,
//             line: row.line,
//             color: row.color,
//             remark: row.remark,
//             assignedParts: row.assignedParts
//           })),
//           remark: ortForm.remark,
//           submittedAt: new Date().toISOString()
//         }
//       };

//       const existingORTData = localStorage.getItem("ortLabRecords");
//       const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];

//       ortRecords.push(ortLabData);
//       localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));

//       // Update used parts in state
//       setUsedParts(prev => {
//         const newUsedParts = { ...prev };
//         if (!newUsedParts[serialNumber]) {
//           newUsedParts[serialNumber] = [];
//         }
//         newUsedParts[serialNumber] = [...new Set([...newUsedParts[serialNumber], ...selectedPartNumbers])];
//         return newUsedParts;
//       });

//       // Update parts summary
//       const assignedParts = splitRows.flatMap(row => row.assignedParts);
//       const unassignedParts = selectedPartNumbers.filter(part => !assignedParts.includes(part));

//       setPartsSummary(prev => [...prev, {
//         serialNumber: serialNumber,
//         availableParts: selectedPartNumbers,
//         assignedParts: assignedParts,
//         unassignedParts: unassignedParts,
//         recordId: selectedRecord.id
//       }]);

//       // Show summary table
//       setShowSummaryTable(true);

//       toast({
//         title: "✅ ORT Lab Submitted",
//         description: `ORT Lab data with ${splitRows.length} split(s) has been saved successfully!`,
//         duration: 3000,
//       });

//       // Clear form for next entry
//       setSerialNumber("");
//       setScannedPartNumbers([]);
//       setSelectedPartNumbers([]);
//       setSplitRows([{
//         id: '1',
//         quantity: '',
//         buildProject: '',
//         line: '',
//         color: '',
//         remark: '',
//         assignedParts: []
//       }]);
//       setBarcodeInput("");

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Submission Failed",
//         description: "There was an error saving the ORT Lab data. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error saving ORT Lab data:", error);
//     }
//   };

//   // Handle proceed action - navigate to QRT checklist
//   const handleProceed = () => {
//     navigate("/qrtchecklist");
//   };

//   // Handle edit action - reset form with selected parts
//   const handleEdit = (summary: PartsSummary) => {
//     setSerialNumber(summary.serialNumber);
//     setSelectedPartNumbers(summary.availableParts);
//     setScannedPartNumbers(summary.availableParts);
//     setShowSummaryTable(false);

//     // Auto-focus on barcode input
//     setTimeout(() => {
//       if (barcodeInputRef.current) {
//         barcodeInputRef.current.focus();
//       }
//     }, 100);

//     toast({
//       title: "Edit Mode",
//       description: `Now editing parts for serial ${summary.serialNumber}`,
//       duration: 2000,
//     });
//   };

//   // Handle delete action
//   const handleDelete = (serialNumber: string) => {
//     try {
//       const existingORTData = localStorage.getItem("ortLabRecords");
//       if (existingORTData) {
//         const ortRecords = JSON.parse(existingORTData);
//         const updatedRecords = ortRecords.filter((record: any) =>
//           !record.ortLab || record.ortLab.serialNumber !== serialNumber
//         );
//         localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

//         // Update parts summary
//         setPartsSummary(prev => prev.filter(summary => summary.serialNumber !== serialNumber));

//         // Update used parts
//         setUsedParts(prev => {
//           const newUsedParts = { ...prev };
//           delete newUsedParts[serialNumber];
//           return newUsedParts;
//         });

//         toast({
//           title: "✅ Record Deleted",
//           description: `Record for serial ${serialNumber} has been deleted`,
//           duration: 3000,
//         });
//       }
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Delete Failed",
//         description: "There was an error deleting the record",
//         duration: 3000,
//       });
//     }
//   };

//   // const isORTSubmitEnabled = () => {
//   //   const allRowsValid = splitRows.every(row =>
//   //     row.quantity && row.buildProject && row.line && row.color && row.assignedParts.length > 0
//   //   );

//   //   const totalAssigned = splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0);

//   //   return ortForm.date &&
//   //     serialNumber &&
//   //     selectedPartNumbers.length > 0 &&
//   //     allRowsValid &&
//   //     totalAssigned === selectedPartNumbers.length;
//   // };

//   const isORTSubmitEnabled = () => {
//   const allRowsValid = splitRows.every(row =>
//     row.quantity && row.buildProject && row.line && row.color && row.assignedParts.length > 0
//   );

//   return (
//     ortForm.date &&
//     serialNumber &&
//     selectedPartNumbers.length > 0 &&
//     allRowsValid
//   );
// };


//   if (!selectedRecord) {
//     return null;
//   }

//   const unassignedParts = getUnassignedPartNumbers();

//   return (
//     <div className="container mx-auto p-6 max-w-6xl">
//       <Button
//         variant="ghost"
//         onClick={() => navigate("/")}
//         className="mb-4 hover:bg-gray-100"
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         Back to Live Test Checklist
//       </Button>

//       <Card>
//         <CardHeader className="bg-blue-600 text-white">
//           <CardTitle className="text-2xl">ORT Lab Form - Part Splitting</CardTitle>
//         </CardHeader>
//         <CardContent className="pt-6">
//           {/* Record Information */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//             <h3 className="font-semibold text-lg mb-3 text-gray-700">Selected Record Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//               <div>
//                 <span className="font-medium text-gray-600">Document Number:</span>
//                 <p className="text-gray-800">{selectedRecord.documentNumber}</p>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Project Name:</span>
//                 <p className="text-gray-800">{selectedRecord.projectName}</p>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Test Location:</span>
//                 <p className="text-gray-800">{selectedRecord.testLocation}</p>
//               </div>
//             </div>
//           </div>

//           {/* Parts Summary Table - Show after submission */}
//           {showSummaryTable && partsSummary.length > 0 && (
//             <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
//               <h3 className="font-semibold text-lg mb-4 text-green-800">Parts Summary</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-green-100">
//                       <th className="border border-gray-300 px-4 py-2 text-left">Serial Number</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Available Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Assigned Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Unassigned Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {partsSummary.map((summary, index) => (
//                       <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                         <td className="border border-gray-300 px-4 py-2 font-mono">{summary.serialNumber}</td>
//                         <td className="border border-gray-300 px-4 py-2">
//                           <div className="flex flex-wrap gap-1">
//                             {summary.availableParts.map((part, idx) => (
//                               <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                                 {part}
//                               </span>
//                             ))}
//                           </div>
//                         </td>
//                         <td className="border border-gray-300 px-4 py-2">
//                           <div className="flex flex-wrap gap-1">
//                             {summary.assignedParts.map((part, idx) => (
//                               <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
//                                 {part}
//                               </span>
//                             ))}
//                           </div>
//                         </td>
//                         <td className="border border-gray-300 px-4 py-2">
//                           <div className="flex flex-wrap gap-1">
//                             {summary.unassignedParts.map((part, idx) => (
//                               <span key={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
//                                 {part}
//                               </span>
//                             ))}
//                           </div>
//                         </td>
//                         <td className="border border-gray-300 px-4 py-2">
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleEdit(summary)}
//                               className="bg-blue-500 text-white hover:bg-blue-600"
//                             >
//                               <Edit className="h-3 w-3 mr-1" />
//                               Edit
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDelete(summary.serialNumber)}
//                               className="bg-red-500 text-white hover:bg-red-600"
//                             >
//                               <Trash2 className="h-3 w-3 mr-1" />
//                               Delete
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={handleProceed}
//                               className="bg-green-500 text-white hover:bg-green-600"
//                             >
//                               <Play className="h-3 w-3 mr-1" />
//                               Proceed
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Physical Barcode Scanner Section */}
//           {!showSummaryTable && (
//             <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
//                   <Scan className="h-5 w-5" />
//                   Barcode Scanner
//                 </h3>
//                 <Button
//                   variant="outline"
//                   onClick={clearScannedData}
//                   disabled={!serialNumber && scannedPartNumbers.length === 0}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Clear All
//                 </Button>
//               </div>

//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="barcodeInput" className="text-base font-medium">
//                     Scanner Input <span className="text-red-600">*</span>
//                   </Label>
//                   <Input
//                     ref={barcodeInputRef}
//                     id="barcodeInput"
//                     value={barcodeInput}
//                     onChange={(e) => setBarcodeInput(e.target.value)}
//                     onKeyDown={handleBarcodeInput}
//                     placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
//                     className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
//                     autoFocus
//                   />
//                   <p className="text-sm text-blue-700">
//                     💡 <strong>Smart Scanning:</strong> Only shows unused parts for each serial number across all records.
//                   </p>
//                 </div>

//                 {/* Test Barcode Buttons */}
//                 <div className="space-y-2">
//                   <Label className="text-sm font-medium text-gray-700">
//                     Test Barcodes (Click to simulate scan):
//                   </Label>
//                   <div className="flex flex-wrap gap-2">
//                     {STATIC_BARCODE_DATA.map((barcode, index) => (
//                       <Button
//                         key={index}
//                         variant="outline"
//                         size="sm"
//                         onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
//                         className="text-xs font-mono"
//                       >
//                         {barcode.split(':')[0]}
//                       </Button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Scanner Status */}
//                 <div className="p-3 bg-white rounded border">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="font-medium text-gray-600">Serial Number:</span>
//                       <p className="font-mono text-blue-700">{serialNumber || "Not scanned"}</p>
//                     </div>
//                     <div>
//                       <span className="font-medium text-gray-600">Total Parts Available:</span>
//                       <p className="text-blue-700">
//                         {selectedPartNumbers.length} parts
//                         {serialNumber && usedParts[serialNumber] && (
//                           <span className="text-orange-600"> ({usedParts[serialNumber]?.length || 0} already used)</span>
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Form Fields (only show when not in summary table view) */}
//           {!showSummaryTable && (
//             <>
//               {/* Date Field */}
//               <div className="mb-6 space-y-2">
//                 <Label htmlFor="date" className="text-base">
//                   Date <span className="text-red-600">*</span>
//                 </Label>
//                 <Input
//                   id="date"
//                   type="date"
//                   value={ortForm.date}
//                   onChange={(e) => handleORTInputChange('date', e.target.value)}
//                   className="h-11 max-w-xs"
//                 />
//               </div>

//               {/* Serial Number Display */}
//               <div className="mb-6 space-y-2">
//                 <Label htmlFor="serialNumber" className="text-base">
//                   Serial Number <span className="text-red-600">*</span>
//                 </Label>
//                 <div className="flex gap-2">
//                   <Input
//                     id="serialNumber"
//                     value={serialNumber}
//                     onChange={(e) => handleManualSerialInput(e.target.value)}
//                     placeholder="Will auto-fill from scanner"
//                     className="h-11 font-mono flex-1 max-w-md bg-blue-50"
//                   />
//                   {serialNumber && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setSerialNumber("")}
//                       className="h-11"
//                     >
//                       <X size={16} />
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               {/* Parts Summary */}
//               {selectedPartNumbers.length > 0 && (
//                 <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="font-semibold text-green-800">Available Parts Summary</h3>
//                     <div className="text-sm text-green-700">
//                       Total: <span className="font-bold">{selectedPartNumbers.length}</span> parts
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap gap-1 mt-2">
//                     {selectedPartNumbers.map((part, index) => (
//                       <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
//                         {part}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Split Rows Section */}
//               {selectedPartNumbers.length > 0 && (
//                 <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-lg text-yellow-800">Split Parts Assignment</h3>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={autoAssignParts}
//                         className="bg-green-600 text-white hover:bg-green-700"
//                       >
//                         Auto-Assign Parts
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={addSplitRow}
//                       >
//                         <Plus className="mr-1 h-4 w-4" />
//                         Add Row
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     {splitRows.map((row, index) => (
//                       <div key={row.id} className="p-4 bg-white rounded-lg border border-gray-200">
//                         <div className="flex items-center justify-between mb-3">
//                           <h4 className="font-semibold text-gray-700">Split #{index + 1}</h4>
//                           {splitRows.length > 1 && (
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => removeSplitRow(row.id)}
//                               className="text-red-600 hover:text-red-800 hover:bg-red-50"
//                             >
//                               <Minus className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
//                           <div className="space-y-2">
//                             <Label htmlFor={`quantity-${row.id}`}>
//                               Quantity <span className="text-red-600">*</span>
//                             </Label>
//                             <Input
//                               id={`quantity-${row.id}`}
//                               type="number"
//                               value={row.quantity}
//                               onChange={(e) => updateSplitRow(row.id, 'quantity', e.target.value)}
//                               placeholder="Enter qty"
//                               className="h-11"
//                               min="1"
//                               max={selectedPartNumbers.length}
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor={`buildProject-${row.id}`}>
//                               Build/Project <span className="text-red-600">*</span>
//                             </Label>
//                             <Select
//                               value={row.buildProject}
//                               onValueChange={(value) => updateSplitRow(row.id, 'buildProject', value)}
//                             >
//                               <SelectTrigger className="h-11">
//                                 <SelectValue placeholder="Select" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {BUILD_PROJECT_OPTIONS.map((option) => (
//                                   <SelectItem key={option} value={option}>
//                                     {option}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor={`line-${row.id}`}>
//                               Line <span className="text-red-600">*</span>
//                             </Label>
//                             <Select
//                               value={row.line}
//                               onValueChange={(value) => updateSplitRow(row.id, 'line', value)}
//                             >
//                               <SelectTrigger className="h-11">
//                                 <SelectValue placeholder="Select" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {LINE_OPTIONS.map((option) => (
//                                   <SelectItem key={option} value={option}>
//                                     {option}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor={`color-${row.id}`}>
//                               Color <span className="text-red-600">*</span>
//                             </Label>
//                             <Select
//                               value={row.color}
//                               onValueChange={(value) => updateSplitRow(row.id, 'color', value)}
//                             >
//                               <SelectTrigger className="h-11">
//                                 <SelectValue placeholder="Select color" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {COLOR_OPTIONS.map((option) => (
//                                   <SelectItem key={option} value={option}>
//                                     {option}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </div>

//                           <div className="space-y-2">
//                             <Label>Assigned Parts</Label>
//                             <div className="h-11 px-3 py-2 bg-gray-50 rounded border text-sm flex items-center">
//                               {row.assignedParts.length > 0 ? (
//                                 <span className="text-green-600 font-medium">
//                                   {row.assignedParts.length} parts assigned
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400">No parts assigned</span>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Individual Remark for each split */}
//                         <div className="space-y-2">
//                           <Label htmlFor={`remark-${row.id}`}>
//                             Split Remark
//                           </Label>
//                           <Textarea
//                             id={`remark-${row.id}`}
//                             value={row.remark}
//                             onChange={(e) => updateSplitRow(row.id, 'remark', e.target.value)}
//                             placeholder="Enter remark for this split..."
//                             className="min-h-[60px] resize-vertical"
//                           />
//                         </div>

//                         {/* Show assigned parts */}
//                         {row.assignedParts.length > 0 && (
//                           <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
//                             <Label className="text-xs text-blue-700 mb-1">Assigned Part Numbers:</Label>
//                             <div className="flex flex-wrap gap-1 mt-1">
//                               {row.assignedParts.map((part, idx) => (
//                                 <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
//                                   {part}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Assignment Summary */}
//                   <div className="mt-4 p-3 bg-white rounded border">
//                     <div className="grid grid-cols-3 gap-4 text-sm">
//                       <div>
//                         <span className="font-medium text-gray-600">Total Parts:</span>
//                         <p className="text-lg font-bold text-gray-800">{selectedPartNumbers.length}</p>
//                       </div>
//                       <div>
//                         <span className="font-medium text-gray-600">Assigned:</span>
//                         <p className="text-lg font-bold text-green-600">
//                           {splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0)}
//                         </p>
//                       </div>
//                       <div>
//                         <span className="font-medium text-gray-600">Unassigned:</span>
//                         <p className="text-lg font-bold text-orange-600">{unassignedParts.length}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex justify-end gap-4 pt-6 border-t">
//                 <Button
//                   variant="outline"
//                   onClick={() => navigate("/")}
//                   className="px-6"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleORTSubmit}
//                   disabled={!isORTSubmitEnabled()}
//                   className="bg-blue-600 text-white hover:bg-blue-700 px-6"
//                 >
//                   Submit ORT Lab
//                 </Button>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ORTLabPage;


import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, X, Scan, Trash2, Plus, Minus, Edit, Play, CheckCircle } from "lucide-react";

interface TestRecord {
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
}

// Static barcode data for testing
const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005"
];

// Interface for used parts tracking
interface UsedParts {
  [serialNumber: string]: string[];
}

// Interface for ORT records
interface ORTRecord {
  ortLab: {
    date: string;
    serialNumber: string;
    partNumbers: string[];
    scannedPartNumbers: string[];
    splitRows: {
      quantity: string;
      buildProject: string;
      line: string;
      color: string;
      remark: string;
      assignedParts: string[];
    }[];
    remark: string;
    submittedAt: string;
  };
}

// Build/Project options
const BUILD_PROJECT_OPTIONS = [
  "PRQ/ProjectAA",
  "PRB/ProjectBB"
];

// Line options
const LINE_OPTIONS = [
  "Line1",
  "Line2"
];

// Color options
const COLOR_OPTIONS = [
  "NDA-XX",
  "LB-XX",
  "SD-XX"
];

// Interface for split row
interface SplitRow {
  id: string;
  quantity: string;
  buildProject: string;
  line: string;
  color: string;
  remark: string;
  assignedParts: string[];
}

// Interface for parts summary table
interface PartsSummary {
  serialNumber: string;
  availableParts: string[];
  assignedParts: string[];
  unassignedParts: string[];
  recordId: number;
}

const ORTLabPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;

  const [ortForm, setOrtForm] = useState({
    date: new Date().toISOString().split('T')[0],
    remark: ""
  });

  const [serialNumber, setSerialNumber] = useState("");
  const [scannedPartNumbers, setScannedPartNumbers] = useState<string[]>([]);
  const [selectedPartNumbers, setSelectedPartNumbers] = useState<string[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [usedParts, setUsedParts] = useState<UsedParts>({});
  const [partsSummary, setPartsSummary] = useState<PartsSummary[]>([]);
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Split management
  const [splitRows, setSplitRows] = useState<SplitRow[]>([
    {
      id: '1',
      quantity: '',
      buildProject: '',
      line: '',
      color: '',
      remark: '',
      assignedParts: []
    }
  ]);

  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Load used parts and parts summary from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const existingORTData = localStorage.getItem("ortLabRecords");
        if (existingORTData) {
          const ortRecords = JSON.parse(existingORTData);
          const usedPartsMap: UsedParts = {};
          const summary: PartsSummary[] = [];

          ortRecords.forEach((record: any) => {
            if (record.ortLab && record.ortLab.serialNumber && record.ortLab.partNumbers) {
              const serial = record.ortLab.serialNumber;
              const parts = record.ortLab.partNumbers;

              if (!usedPartsMap[serial]) {
                usedPartsMap[serial] = [];
              }
              usedPartsMap[serial] = [...new Set([...usedPartsMap[serial], ...parts])];

              // Calculate assigned and unassigned parts for summary
              const assignedParts = record.ortLab.splitRows?.flatMap((row: any) => row.assignedParts) || [];
              const unassignedParts = parts.filter((part: string) => !assignedParts.includes(part));

              summary.push({
                serialNumber: serial,
                availableParts: parts,
                assignedParts: assignedParts,
                unassignedParts: unassignedParts,
                recordId: record.id
              });
            }
          });

          setUsedParts(usedPartsMap);
          setPartsSummary(summary);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Get available (unused) part numbers for current serial
  const getAvailablePartNumbers = (allParts: string[], serial: string) => {
    const usedPartsForSerial = usedParts[serial] || [];
    return allParts.filter(part => !usedPartsForSerial.includes(part));
  };

  // Get unassigned part numbers (parts not assigned to any row yet)
  const getUnassignedPartNumbers = () => {
    const assignedParts = splitRows.flatMap(row => row.assignedParts);
    return selectedPartNumbers.filter(part => !assignedParts.includes(part));
  };

  // Handle physical barcode scanner input
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const barcodeData = barcodeInput.trim();
      if (barcodeData) {
        processBarcodeData(barcodeData);
        setBarcodeInput("");

        // Auto-refocus for next scan
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  // Check if a serial number has all parts assigned
  const isSerialComplete = (serial: string): boolean => {
    const summary = partsSummary.find(s => s.serialNumber === serial);
    return summary ? summary.unassignedParts.length === 0 : false;
  };

  // Get completion status for a serial number
  const getSerialCompletionStatus = (serial: string): { complete: boolean; assigned: number; total: number } => {
    const summary = partsSummary.find(s => s.serialNumber === serial);
    if (!summary) return { complete: false, assigned: 0, total: 0 };

    return {
      complete: summary.unassignedParts.length === 0,
      assigned: summary.assignedParts.length,
      total: summary.availableParts.length
    };
  };

  // Process barcode data from physical scanner
  // const processBarcodeData = (data: string) => {
  //   if (!data.trim()) {
  //     toast({
  //       variant: "destructive",
  //       title: "Invalid Barcode",
  //       description: "Scanned data is empty",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   try {
  //     let serial = "";
  //     let partNumbers: string[] = [];

  //     // Check if input is a static barcode from our test data
  //     const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
  //       barcode.split(':')[0] === data.toUpperCase()
  //     );

  //     if (staticBarcode) {
  //       const parts = staticBarcode.split(':');
  //       serial = parts[0].trim();
  //       if (parts.length > 1) {
  //         partNumbers = parts[1].split(',')
  //           .map(p => p.trim())
  //           .filter(p => p.length > 0);
  //       }
  //     }
  //     // Format 1: SERIAL:PART1,PART2,PART3
  //     else if (data.includes(':') && data.includes(',')) {
  //       const parts = data.split(':');
  //       serial = parts[0].trim();

  //       if (parts.length > 1) {
  //         partNumbers = parts[1].split(',')
  //           .map(p => p.trim())
  //           .filter(p => p.length > 0);
  //       }
  //     }
  //     // Format 2: SERIAL:PART1 (single part)
  //     else if (data.includes(':') && !data.includes(',')) {
  //       const parts = data.split(':');
  //       serial = parts[0].trim();
  //       if (parts.length > 1) {
  //         partNumbers = [parts[1].trim()];
  //       }
  //     }
  //     // Format 3: JSON format from smart scanners
  //     else if (data.startsWith('{') && data.endsWith('}')) {
  //       try {
  //         const parsedData = JSON.parse(data);
  //         serial = parsedData.serial || parsedData.Serial || parsedData.SN || "";
  //         partNumbers = Array.isArray(parsedData.parts) ? parsedData.parts
  //           : Array.isArray(parsedData.partNumbers) ? parsedData.partNumbers
  //             : parsedData.part ? [parsedData.part]
  //               : [];
  //       } catch (jsonError) {
  //         console.error("JSON parse error:", jsonError);
  //         serial = data.trim();
  //       }
  //     }
  //     // Format 4: Simple serial number only
  //     else {
  //       serial = data.trim();
  //     }

  //     // Validate serial number
  //     if (!serial) {
  //       toast({
  //         variant: "destructive",
  //         title: "Invalid Barcode Format",
  //         description: "No serial number found in scanned data",
  //         duration: 3000,
  //       });
  //       return;
  //     }

  //     // Set serial number
  //     setSerialNumber(serial);

  //     if (partNumbers.length > 0) {
  //       // Get available (unused) parts for this serial
  //       const availableParts = getAvailablePartNumbers(partNumbers, serial);

  //       setScannedPartNumbers(availableParts);

  //       if (availableParts.length > 0) {
  //         // Auto-select all available parts
  //         setSelectedPartNumbers(availableParts);
  //         toast({
  //           title: "✅ Barcode Scanned Successfully",
  //           description: `Serial: ${serial}, ${availableParts.length} available part(s) loaded`,
  //           duration: 3000,
  //         });
  //       } else {
  //         setSelectedPartNumbers([]);
  //         toast({
  //           title: "⚠️ All Parts Already Used",
  //           description: `Serial: ${serial} - All parts from this barcode are already used in previous records`,
  //           duration: 3000,
  //         });
  //       }
  //     } else {
  //       setScannedPartNumbers([]);
  //       setSelectedPartNumbers([]);
  //       toast({
  //         title: "✅ Serial Number Scanned",
  //         description: `Serial: ${serial} - No parts found in barcode`,
  //         duration: 3000,
  //       });
  //     }

  //   } catch (error) {
  //     console.error("Barcode processing error:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Scan Error",
  //       description: "Failed to process barcode data. Please check the format.",
  //       duration: 3000,
  //     });
  //   }
  // };

  // Process barcode data from physical scanner - UPDATED LOGIC
 
  const processBarcodeData = (data: string) => {
    if (!data.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Barcode",
        description: "Scanned data is empty",
        duration: 2000,
      });
      return;
    }

    try {
      let serial = "";
      let partNumbers: string[] = [];

      // Check if input is a static barcode from our test data
      const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
        barcode.split(':')[0] === data.toUpperCase()
      );

      if (staticBarcode) {
        const parts = staticBarcode.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 1: SERIAL:PART1,PART2,PART3
      else if (data.includes(':') && data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();

        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 2: SERIAL:PART1 (single part)
      else if (data.includes(':') && !data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = [parts[1].trim()];
        }
      }
      // Format 3: JSON format from smart scanners
      else if (data.startsWith('{') && data.endsWith('}')) {
        try {
          const parsedData = JSON.parse(data);
          serial = parsedData.serial || parsedData.Serial || parsedData.SN || "";
          partNumbers = Array.isArray(parsedData.parts) ? parsedData.parts
            : Array.isArray(parsedData.partNumbers) ? parsedData.partNumbers
              : parsedData.part ? [parsedData.part]
                : [];
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          serial = data.trim();
        }
      }
      // Format 4: Simple serial number only
      else {
        serial = data.trim();
      }

      // Validate serial number
      if (!serial) {
        toast({
          variant: "destructive",
          title: "Invalid Barcode Format",
          description: "No serial number found in scanned data",
          duration: 3000,
        });
        return;
      }

      // Check if this serial is already complete
      if (isSerialComplete(serial)) {
        const status = getSerialCompletionStatus(serial);
        toast({
          variant: "default",
          title: "✅ All Parts Already Scanned",
          description: `Serial ${serial} is complete! ${status.assigned}/${status.total} parts assigned.`,
          duration: 4000,
        });
        return;
      }

      // Set serial number
      setSerialNumber(serial);

      // Check if this serial already exists in our records
      const existingSummary = partsSummary.find(summary => summary.serialNumber === serial);

      if (existingSummary) {
        // Serial exists - show remaining unassigned parts
        const remainingParts = existingSummary.unassignedParts;
        const status = getSerialCompletionStatus(serial);

        if (remainingParts.length > 0) {
          setScannedPartNumbers(remainingParts);
          setSelectedPartNumbers(remainingParts);
          toast({
            title: "🔄 Continuing with Existing Serial",
            description: `Serial: ${serial} - ${remainingParts.length} unassigned parts remaining (${status.assigned}/${status.total} already assigned)`,
            duration: 4000,
          });
        } else {
          // This should not happen due to earlier check, but just in case
          setScannedPartNumbers([]);
          setSelectedPartNumbers([]);
          toast({
            title: "✅ All Parts Already Assigned",
            description: `Serial: ${serial} - All ${status.total} parts have been assigned`,
            duration: 3000,
          });
        }
      } else if (partNumbers.length > 0) {
        // New serial number - get available (unused) parts
        const availableParts = getAvailablePartNumbers(partNumbers, serial);

        setScannedPartNumbers(availableParts);

        if (availableParts.length > 0) {
          // Auto-select all available parts
          setSelectedPartNumbers(availableParts);
          toast({
            title: "✅ New Serial Scanned",
            description: `Serial: ${serial}, ${availableParts.length} available part(s) loaded`,
            duration: 3000,
          });
        } else {
          setSelectedPartNumbers([]);
          toast({
            title: "⚠️ All Parts Already Used",
            description: `Serial: ${serial} - All parts from this barcode are already used in previous records`,
            duration: 3000,
          });
        }
      } else {
        // Serial only, no parts
        setScannedPartNumbers([]);
        setSelectedPartNumbers([]);
        toast({
          title: "✅ Serial Number Scanned",
          description: `Serial: ${serial} - No parts found in barcode`,
          duration: 3000,
        });
      }

    } catch (error) {
      console.error("Barcode processing error:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Failed to process barcode data. Please check the format.",
        duration: 3000,
      });
    }
  };


  // Manual serial number input fallback
  // const handleManualSerialInput = (value: string) => {
  //   setSerialNumber(value);
  //   setScannedPartNumbers([]);
  //   setSelectedPartNumbers([]);
  //   setSplitRows([{
  //     id: '1',
  //     quantity: '',
  //     buildProject: '',
  //     line: '',
  //     color: '',
  //     remark: '',
  //     assignedParts: []
  //   }]);
  // };

  // Manual serial number input fallback
  const handleManualSerialInput = (value: string) => {
    // Check if this serial is already complete
    if (isSerialComplete(value)) {
      const status = getSerialCompletionStatus(value);
      toast({
        variant: "default",
        title: "✅ All Parts Already Scanned",
        description: `Serial ${value} is complete! ${status.assigned}/${status.total} parts assigned.`,
        duration: 4000,
      });
      return;
    }

    setSerialNumber(value);

    // Check if this serial exists in records
    const existingSummary = partsSummary.find(summary => summary.serialNumber === value);
    if (existingSummary && existingSummary.unassignedParts.length > 0) {
      setScannedPartNumbers(existingSummary.unassignedParts);
      setSelectedPartNumbers(existingSummary.unassignedParts);
      const status = getSerialCompletionStatus(value);
      toast({
        title: "Existing Serial Loaded",
        description: `Loaded ${existingSummary.unassignedParts.length} unassigned parts (${status.assigned}/${status.total} already assigned)`,
        duration: 2000,
      });
    } else {
      setScannedPartNumbers([]);
      setSelectedPartNumbers([]);
    }

    setSplitRows([{
      id: '1',
      quantity: '',
      buildProject: '',
      line: '',
      color: '',
      remark: '',
      assignedParts: []
    }]);
  };


  // Clear all scanned data
  const clearScannedData = () => {
    setSerialNumber("");
    setScannedPartNumbers([]);
    setSelectedPartNumbers([]);
    setBarcodeInput("");
    setSplitRows([{
      id: '1',
      quantity: '',
      buildProject: '',
      line: '',
      color: '',
      remark: '',
      assignedParts: []
    }]);

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }

    toast({
      title: "Data Cleared",
      description: "All scanned data has been cleared",
      duration: 2000,
    });
  };

  // Test with static barcode data
  const testWithStaticBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
    processBarcodeData(barcode);
    setBarcodeInput("");
  };

  // Add a new split row
  const addSplitRow = () => {
    const newId = (splitRows.length + 1).toString();
    setSplitRows([...splitRows, {
      id: newId,
      quantity: '',
      buildProject: '',
      line: '',
      color: '',
      remark: '',
      assignedParts: []
    }]);
  };

  // Remove a split row
  const removeSplitRow = (id: string) => {
    if (splitRows.length === 1) {
      toast({
        variant: "destructive",
        title: "Cannot Remove",
        description: "At least one row is required",
        duration: 2000,
      });
      return;
    }
    setSplitRows(splitRows.filter(row => row.id !== id));
  };

  // Update split row field
  const updateSplitRow = (id: string, field: keyof SplitRow, value: string) => {
    setSplitRows(splitRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Auto-assign parts based on quantities
  const autoAssignParts = () => {
    if (selectedPartNumbers.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Available",
        description: "Please scan and select parts first",
        duration: 2000,
      });
      return;
    }

    // Validate quantities
    const totalQuantity = splitRows.reduce((sum, row) => {
      const qty = parseInt(row.quantity) || 0;
      return sum + qty;
    }, 0);

    if (totalQuantity === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantities",
        description: "Please enter quantities for the rows",
        duration: 2000,
      });
      return;
    }

    if (totalQuantity > selectedPartNumbers.length) {
      toast({
        variant: "destructive",
        title: "Insufficient Parts",
        description: `Total quantity (${totalQuantity}) exceeds available parts (${selectedPartNumbers.length})`,
        duration: 3000,
      });
      return;
    }

    // Assign parts to rows based on quantity
    let currentIndex = 0;
    const updatedRows = splitRows.map(row => {
      const qty = parseInt(row.quantity) || 0;
      const assignedParts = selectedPartNumbers.slice(currentIndex, currentIndex + qty);
      currentIndex += qty;
      return { ...row, assignedParts };
    });

    setSplitRows(updatedRows);

    toast({
      title: "✅ Parts Assigned",
      description: `${totalQuantity} parts have been assigned to ${splitRows.length} row(s)`,
      duration: 3000,
    });
  };

  // Form handling functions
  const handleORTInputChange = (field: keyof typeof ortForm, value: string) => {
    setOrtForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add this function to get all parts for a serial number from existing records
  const getAllPartsForSerial = (serial: string): string[] => {
    // Check if we have this serial in our parts summary
    const existingSummary = partsSummary.find(summary => summary.serialNumber === serial);
    if (existingSummary) {
      return existingSummary.availableParts;
    }

    // If not in summary, check localStorage records
    try {
      const existingORTData = localStorage.getItem("ortLabRecords");
      if (existingORTData) {
        const ortRecords = JSON.parse(existingORTData);
        const recordsForSerial = ortRecords.filter((record: any) =>
          record.ortLab && record.ortLab.serialNumber === serial
        );

        if (recordsForSerial.length > 0) {
          // Get all unique parts from all records for this serial
          const allParts = recordsForSerial.flatMap((record: any) => record.ortLab.partNumbers || []) as string[];
          return [...new Set(allParts)];
        }
      }
    } catch (error) {
      console.error("Error getting parts for serial:", error);
    }

    return [];
  };

  // Updated handleORTSubmit function
  const handleORTSubmit = () => {
    if (!selectedRecord) return;

    // Validate basic fields
    if (!ortForm.date) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in the date field.",
        duration: 2000,
      });
      return;
    }

    if (!serialNumber) {
      toast({
        variant: "destructive",
        title: "Missing Serial Number",
        description: "Please scan or enter a serial number.",
        duration: 2000,
      });
      return;
    }

    if (selectedPartNumbers.length === 0) {
      toast({
        variant: "destructive",
        title: "No Part Numbers",
        description: "Please scan and select parts.",
        duration: 2000,
      });
      return;
    }

    // Validate split rows
    const invalidRows = splitRows.filter(row =>
      !row.quantity || !row.buildProject || !row.line || !row.color || row.assignedParts.length === 0
    );

    if (invalidRows.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Split Rows",
        description: "Please complete all rows (Quantity, Build/Project, Line, Color) and assign parts.",
        duration: 3000,
      });
      return;
    }

    // Check if all selected parts are assigned
    const totalAssigned = splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0);
    const unassignedParts = selectedPartNumbers.filter(part =>
      !splitRows.flatMap(row => row.assignedParts).includes(part)
    );


    try {
      // Generate a unique ID for this ORT Lab submission
      const ortLabId = Date.now(); // Unique ID for this specific submission

      const ortLabData = {
        ...selectedRecord,
        ortLabId: ortLabId, // Track new submission entries separately
        ortLab: {
          submissionId: ortLabId, // Unique ID for submission
          date: ortForm.date,
          serialNumber: serialNumber,
          partNumbers: selectedPartNumbers,
          scannedPartNumbers: scannedPartNumbers,
          splitRows: splitRows.map(row => ({
            quantity: row.quantity,
            buildProject: row.buildProject,
            line: row.line,
            color: row.color,
            remark: row.remark,
            assignedParts: row.assignedParts
          })),
          remark: ortForm.remark,
          submittedAt: new Date().toISOString()
        }
      };


      const existingORTData = localStorage.getItem("ortLabRecords");
      const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];

      ortRecords.push(ortLabData);
      localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));

      // Update used parts in state
      setUsedParts(prev => {
        const newUsedParts = { ...prev };
        if (!newUsedParts[serialNumber]) {
          newUsedParts[serialNumber] = [];
        }
        newUsedParts[serialNumber] = [...new Set([...newUsedParts[serialNumber], ...selectedPartNumbers])];
        return newUsedParts;
      });

      // Update parts summary - Store only current session data
      const assignedParts = splitRows.flatMap(row => row.assignedParts);

      setPartsSummary(prev => {
        const filtered = prev.filter(summary => summary.recordId !== ortLabId);

        return [...filtered, {
          serialNumber: serialNumber,
          availableParts: selectedPartNumbers, // Only current session parts
          assignedParts: assignedParts,        // Only current session assigned parts
          unassignedParts: unassignedParts,    // Only current session unassigned parts
          recordId: ortLabId                   // Unique ID for this submission
        }];
      });

      // Check if all parts from THIS SESSION are assigned
      const isNowComplete = unassignedParts.length === 0;

      if (isNowComplete) {
        toast({
          title: "✅ ORT Lab Submitted",
          description: `All ${selectedPartNumbers.length} parts from this session assigned!`,
          duration: 4000,
        });

        // Clear form for next entry
        setSerialNumber("");
        setScannedPartNumbers([]);
        setSelectedPartNumbers([]);
        setSplitRows([{
          id: '1',
          quantity: '',
          buildProject: '',
          line: '',
          color: '',
          remark: '',
          assignedParts: []
        }]);
        setBarcodeInput("");

        // Show summary table
        setShowSummaryTable(true);

      } else {
        // Some parts remain unassigned - show summary table
        setShowSummaryTable(true);

        toast({
          title: "✅ ORT Lab Submitted",
          description: `ORT Lab data saved! ${assignedParts.length} parts assigned, ${unassignedParts.length} parts remain unassigned.`,
          duration: 4000,
        });

        // Clear form for next entry
        setSerialNumber("");
        setScannedPartNumbers([]);
        setSelectedPartNumbers([]);
        setSplitRows([{
          id: '1',
          quantity: '',
          buildProject: '',
          line: '',
          color: '',
          remark: '',
          assignedParts: []
        }]);
        setBarcodeInput("");
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving the ORT Lab data. Please try again.",
        duration: 3000,
      });
      console.error("Error saving ORT Lab data:", error);
    }
  };

  const handleProceed = () => {
    navigate("/qrtchecklist");
  };

  // Handle edit action - reset form with selected parts
  const handleEdit = (summary: PartsSummary) => {
    setSerialNumber(summary.serialNumber);
    setSelectedPartNumbers(summary.availableParts);
    setScannedPartNumbers(summary.availableParts);
    setShowSummaryTable(false);

    // Auto-focus on barcode input
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 100);

    toast({
      title: "Edit Mode",
      description: `Now editing parts for serial ${summary.serialNumber}`,
      duration: 2000,
    });
  };

  // Handle delete action
  const handleDelete = (serialNumber: string) => {
    try {
      const existingORTData = localStorage.getItem("ortLabRecords");
      if (existingORTData) {
        const ortRecords = JSON.parse(existingORTData);
        const updatedRecords = ortRecords.filter((record: any) =>
          !record.ortLab || record.ortLab.serialNumber !== serialNumber
        );
        localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

        // Update parts summary
        setPartsSummary(prev => prev.filter(summary => summary.serialNumber !== serialNumber));

        // Update used parts
        setUsedParts(prev => {
          const newUsedParts = { ...prev };
          delete newUsedParts[serialNumber];
          return newUsedParts;
        });

        toast({
          title: "✅ Record Deleted",
          description: `Record for serial ${serialNumber} has been deleted`,
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "There was an error deleting the record",
        duration: 3000,
      });
    }
  };

  const isORTSubmitEnabled = () => {
    const allRowsValid = splitRows.every(row =>
      row.quantity && row.buildProject && row.line && row.color && row.assignedParts.length > 0
    );

    return (
      ortForm.date &&
      serialNumber &&
      selectedPartNumbers.length > 0 &&
      allRowsValid
    );
  };

  if (!selectedRecord) {
    return null;
  }

  const unassignedParts = getUnassignedPartNumbers();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Test Checklist
      </Button>

      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">ORT Lab Form - Part Splitting</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Record Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Selected Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
            </div>
          </div>

          {/* Completion Status Banner */}
          {serialNumber && isSerialComplete(serialNumber) && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Serial Complete!</h3>
                  <p className="text-green-700 text-sm">
                    Serial {serialNumber} has all parts assigned. No further action needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parts Summary Table */}
          {/* Parts Summary Table */}
          {showSummaryTable && partsSummary.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-lg mb-4 text-green-800">Parts Summary - Unassigned Parts Remain</h3>
              <p className="text-sm text-green-700 mb-4">
                ⚠️ Some parts are still unassigned. Please assign all parts before proceeding to QRT Checklist.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Serial Number</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Available Parts</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Assigned Parts</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Unassigned Parts</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partsSummary.map((summary) => {
                      const isComplete = summary.unassignedParts.length === 0;
                      // Use a combination of serialNumber and recordId for unique key
                      const uniqueKey = `${summary.serialNumber}-${summary.recordId}`;

                      return (
                        <tr key={uniqueKey} className="bg-white">
                          <td className="border border-gray-300 px-4 py-2 font-mono">
                            <div className="flex items-center gap-2">
                              {summary.serialNumber}
                              {isComplete && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {summary.availableParts.map((part, idx) => (
                                // Use part + index for unique key within the part list
                                <span key={`${part}-${idx}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {summary.assignedParts.map((part, idx) => (
                                <span key={`assigned-${part}-${idx}`} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {summary.unassignedParts.map((part, idx) => (
                                <span key={`unassigned-${part}-${idx}`} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {isComplete ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {summary.assignedParts.length}/{summary.availableParts.length} Assigned
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2">
                              {!isComplete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(summary)}
                                  className="bg-blue-500 text-white hover:bg-blue-600"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(summary.serialNumber)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleProceed}
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Proceed
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rest of your existing form code remains the same */}
          {/* Physical Barcode Scanner Section */}
          {!showSummaryTable && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Barcode Scanner
                </h3>
                <Button
                  variant="outline"
                  onClick={clearScannedData}
                  disabled={!serialNumber && scannedPartNumbers.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcodeInput" className="text-base font-medium">
                    Scanner Input <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    ref={barcodeInputRef}
                    id="barcodeInput"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeInput}
                    placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
                    className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
                    autoFocus
                  />
                  <p className="text-sm text-blue-700">
                    💡 <strong>Smart Scanning:</strong> Only shows unused parts for each serial number across all records.
                  </p>
                </div>

                {/* Test Barcode Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Barcodes (Click to simulate scan):
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {STATIC_BARCODE_DATA.map((barcode, index) => (
                      <Button
                        key={`test-barcode-${barcode}-${index}`}
                        variant="outline"
                        size="sm"
                        onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
                        className="text-xs font-mono"
                      >
                        {barcode.split(':')[0]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Scanner Status */}
                <div className="p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Serial Number:</span>
                      <p className="font-mono text-blue-700">{serialNumber || "Not scanned"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Total Parts Available:</span>
                      <p className="text-blue-700">
                        {selectedPartNumbers.length} parts
                        {serialNumber && usedParts[serialNumber] && (
                          <span className="text-orange-600"> ({usedParts[serialNumber]?.length || 0} already used)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields (only show when not in summary table view) */}
          {!showSummaryTable && (
            <>
              {/* Date Field */}
              <div className="mb-6 space-y-2">
                <Label htmlFor="date" className="text-base">
                  Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={ortForm.date}
                  onChange={(e) => handleORTInputChange('date', e.target.value)}
                  className="h-11 max-w-xs"
                />
              </div>

              {/* Serial Number Display */}
              <div className="mb-6 space-y-2">
                <Label htmlFor="serialNumber" className="text-base">
                  Serial Number <span className="text-red-600">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="serialNumber"
                    value={serialNumber}
                    onChange={(e) => handleManualSerialInput(e.target.value)}
                    placeholder="Will auto-fill from scanner"
                    className="h-11 font-mono flex-1 max-w-md bg-blue-50"
                  />
                  {serialNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSerialNumber("")}
                      className="h-11"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Split Rows Section */}
              {selectedPartNumbers.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-yellow-800">Split Parts Assignment</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={autoAssignParts}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Auto-Assign Parts
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSplitRow}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Row
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {splitRows.map((row, index) => (
                      <div key={row.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-700">Split #{index + 1}</h4>
                          {splitRows.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSplitRow(row.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${row.id}`}>
                              Quantity <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              id={`quantity-${row.id}`}
                              type="number"
                              value={row.quantity}
                              onChange={(e) => updateSplitRow(row.id, 'quantity', e.target.value)}
                              placeholder="Enter qty"
                              className="h-11"
                              min="1"
                              max={selectedPartNumbers.length}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`buildProject-${row.id}`}>
                              Build/Project <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={row.buildProject}
                              onValueChange={(value) => updateSplitRow(row.id, 'buildProject', value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {BUILD_PROJECT_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`line-${row.id}`}>
                              Line <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={row.line}
                              onValueChange={(value) => updateSplitRow(row.id, 'line', value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {LINE_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`color-${row.id}`}>
                              Color <span className="text-red-600">*</span>
                            </Label>
                            <Select
                              value={row.color}
                              onValueChange={(value) => updateSplitRow(row.id, 'color', value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {COLOR_OPTIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Assigned Parts</Label>
                            <div className="h-11 px-3 py-2 bg-gray-50 rounded border text-sm flex items-center">
                              {row.assignedParts.length > 0 ? (
                                <span className="text-green-600 font-medium">
                                  {row.assignedParts.length} parts assigned
                                </span>
                              ) : (
                                <span className="text-gray-400">No parts assigned</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Individual Remark for each split */}
                        <div className="space-y-2">
                          <Label htmlFor={`remark-${row.id}`}>
                            Split Remark
                          </Label>
                          <Textarea
                            id={`remark-${row.id}`}
                            value={row.remark}
                            onChange={(e) => updateSplitRow(row.id, 'remark', e.target.value)}
                            placeholder="Enter remark for this split..."
                            className="min-h-[60px] resize-vertical"
                          />
                        </div>

                        {/* Show assigned parts */}
                        {row.assignedParts.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <Label className="text-xs text-blue-700 mb-1">Assigned Part Numbers:</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {row.assignedParts.map((part, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assignment Summary */}
                  <div className="mt-4 p-3 bg-white rounded border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Total Parts:</span>
                        <p className="text-lg font-bold text-gray-800">{selectedPartNumbers.length}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Assigned:</span>
                        <p className="text-lg font-bold text-green-600">
                          {splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Unassigned:</span>
                        <p className="text-lg font-bold text-orange-600">{unassignedParts.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleORTSubmit}
                  disabled={!isORTSubmitEnabled()}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6"
                >
                  Submit ORT Lab
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ORTLabPage;