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
// import { ArrowLeft, X, Scan, Trash2, Plus, Minus, Edit, Play, CheckCircle, Barcode } from "lucide-react";

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

// // Sample parts for manual entry in reload mode
// const SAMPLE_PARTS = [
//   "PART006", "PART007", "PART008", "PART009", "PART010",
//   "PART011", "PART012", "PART013", "PART014", "PART015"
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

// // Interface for existing ORT record
// interface ExistingORTRecord {
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

// const ORTLabPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedRecord = location.state?.record as TestRecord | undefined;
//   const reloadMode = location.state?.reloadMode || false;
//   const existingRecord = location.state?.existingRecord as ExistingORTRecord | undefined;

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
//   const [isReloadMode, setIsReloadMode] = useState(reloadMode);
//   const [manualPartInput, setManualPartInput] = useState("");
//   const [availableSampleParts, setAvailableSampleParts] = useState<string[]>(SAMPLE_PARTS);
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

//   // Handle reload mode initialization
//   useEffect(() => {
//     if (reloadMode && existingRecord) {
//       setIsReloadMode(true);

//       // Pre-fill the form with existing record data
//       setSerialNumber(existingRecord.ortLab.serialNumber);
//       setSelectedPartNumbers(existingRecord.ortLab.partNumbers);
//       setScannedPartNumbers(existingRecord.ortLab.scannedPartNumbers);

//       // Filter out parts that are already in the existing record
//       const existingPartsSet = new Set(existingRecord.ortLab.partNumbers);
//       const filteredSampleParts = SAMPLE_PARTS.filter(part => !existingPartsSet.has(part));
//       setAvailableSampleParts(filteredSampleParts);

//       toast({
//         title: "Reload Mode Activated",
//         description: `Adding parts to existing document: ${existingRecord.documentNumber}`,
//         duration: 3000,
//       });
//     }
//   }, [reloadMode, existingRecord]);

//   // Load used parts and parts summary from localStorage on component mount
//   useEffect(() => {
//     const loadData = () => {
//       try {
//         const existingORTData = localStorage.getItem("ortLabRecords");
//         if (existingORTData) {
//           const ortRecords = JSON.parse(existingORTData);
//           const usedPartsMap: UsedParts = {};

//           // ⭐ NEW: Group records by serial number for proper aggregation
//           const serialGroupMap = new Map<string, any[]>();

//           ortRecords.forEach((record: any) => {
//             if (record.ortLab && record.ortLab.serialNumber && record.ortLab.partNumbers) {
//               const serial = record.ortLab.serialNumber;

//               // Group records by serial
//               if (!serialGroupMap.has(serial)) {
//                 serialGroupMap.set(serial, []);
//               }
//               serialGroupMap.get(serial)!.push(record);
//             }
//           });

//           // ⭐ NEW: Process each serial group to aggregate all parts
//           const summary: PartsSummary[] = [];

//           serialGroupMap.forEach((records, serial) => {
//             // Aggregate all parts across all records for this serial
//             const allPartsSet = new Set<string>();
//             const allAssignedPartsSet = new Set<string>();
//             let recordId = 0;

//             records.forEach((record: any) => {
//               // Collect all part numbers
//               record.ortLab.partNumbers.forEach((part: string) => allPartsSet.add(part));

//               // Collect all assigned parts from all split rows
//               const assignedInRecord = record.ortLab.splitRows?.flatMap((row: any) => row.assignedParts) || [];
//               assignedInRecord.forEach((part: string) => allAssignedPartsSet.add(part));

//               recordId = record.ortLabId || record.id; // Use the latest record ID
//             });

//             const allParts = Array.from(allPartsSet);
//             const allAssignedParts = Array.from(allAssignedPartsSet);
//             const unassignedParts = allParts.filter(part => !allAssignedPartsSet.has(part));

//             // Add to used parts map
//             if (!usedPartsMap[serial]) {
//               usedPartsMap[serial] = [];
//             }
//             usedPartsMap[serial] = allParts;

//             // Add aggregated summary for this serial
//             summary.push({
//               serialNumber: serial,
//               availableParts: allParts,
//               assignedParts: allAssignedParts,
//               unassignedParts: unassignedParts,
//               recordId: recordId
//             });
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
//     // Get the summary for this serial (which now aggregates all records)
//     const summary = partsSummary.find(s => s.serialNumber === serial);

//     if (summary) {
//       // Filter out parts that are already assigned in ANY record for this serial
//       return allParts.filter(part => !summary.assignedParts.includes(part));
//     }

//     // If no summary exists yet, all parts are available
//     return allParts;
//   };

//   // Get unassigned part numbers (parts not assigned to any row yet)
//   const getUnassignedPartNumbers = () => {
//     const assignedParts = splitRows.flatMap(row => row.assignedParts);
//     return selectedPartNumbers.filter(part => !assignedParts.includes(part));
//   };

//   // Check if a serial number has all parts assigned
//   const isSerialComplete = (serial: string): boolean => {
//     const summary = partsSummary.find(s => s.serialNumber === serial);
//     if (!summary) return false;

//     // ⭐ A serial is complete when there are no unassigned parts
//     return summary.unassignedParts.length === 0 && summary.availableParts.length > 0;
//   };
//   // Get completion status for a serial number
//   const getSerialCompletionStatus = (serial: string): { complete: boolean; assigned: number; total: number } => {
//     const summary = partsSummary.find(s => s.serialNumber === serial);
//     if (!summary) return { complete: false, assigned: 0, total: 0 };

//     return {
//       complete: summary.unassignedParts.length === 0,
//       assigned: summary.assignedParts.length,
//       total: summary.availableParts.length
//     };
//   };

//   // Handle physical barcode scanner input
//   // const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
//   //   if (e.key === 'Enter') {
//   //     e.preventDefault();

//   //     const barcodeData = barcodeInput.trim();
//   //     if (barcodeData) {
//   //       processBarcodeData(barcodeData);
//   //       setBarcodeInput("");

//   //       // Auto-refocus for next scan
//   //       setTimeout(() => {
//   //         if (barcodeInputRef.current) {
//   //           barcodeInputRef.current.focus();
//   //         }
//   //       }, 100);
//   //     }
//   //   }
//   // };

//   const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();

//       const barcodeData = barcodeInput.trim();
//       if (barcodeData) {
//         processBarcodeData(barcodeData);
//         setBarcodeInput(""); // Clear input after processing

//         // Auto-refocus for next scan
//         setTimeout(() => {
//           if (barcodeInputRef.current) {
//             barcodeInputRef.current.focus();
//           }
//         }, 100);
//       }
//     }
//   };


//   // NEW: Handle manual part input for reload mode
//   const handleManualPartInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();

//       const part = manualPartInput.trim().toUpperCase();
//       if (part) {
//         addManualPart(part);
//         setManualPartInput("");
//       }
//     }
//   };

//   // NEW: Add manual part
//   const addManualPart = (part: string) => {
//     if (selectedPartNumbers.includes(part)) {
//       toast({
//         variant: "destructive",
//         title: "Duplicate Part",
//         description: `Part ${part} is already added`,
//         duration: 2000,
//       });
//       return;
//     }

//     const newParts = [...selectedPartNumbers, part];
//     setSelectedPartNumbers(newParts);
//     setScannedPartNumbers(newParts);

//     toast({
//       title: "Part Added",
//       description: `Part ${part} added successfully`,
//       duration: 2000,
//     });
//   };

//   // NEW: Add sample part
//   const addSamplePart = (part: string) => {
//     if (selectedPartNumbers.includes(part)) {
//       toast({
//         variant: "destructive",
//         title: "Duplicate Part",
//         description: `Part ${part} is already added`,
//         duration: 2000,
//       });
//       return;
//     }

//     const newParts = [...selectedPartNumbers, part];
//     setSelectedPartNumbers(newParts);
//     setScannedPartNumbers(newParts);

//     // Remove from available sample parts
//     setAvailableSampleParts(prev => prev.filter(p => p !== part));

//     toast({
//       title: "Sample Part Added",
//       description: `Part ${part} added successfully`,
//       duration: 2000,
//     });
//   };

//   // NEW: Add multiple sample parts at once
//   const addMultipleSampleParts = (count: number) => {
//     const partsToAdd = availableSampleParts.slice(0, count);

//     if (partsToAdd.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Parts Available",
//         description: "No more sample parts available to add",
//         duration: 2000,
//       });
//       return;
//     }

//     const newParts = [...selectedPartNumbers, ...partsToAdd];
//     setSelectedPartNumbers(newParts);
//     setScannedPartNumbers(newParts);

//     // Remove from available sample parts
//     setAvailableSampleParts(prev => prev.slice(count));

//     toast({
//       title: "Sample Parts Added",
//       description: `${partsToAdd.length} sample parts added successfully`,
//       duration: 3000,
//     });
//   };

//   // Process barcode data from physical scanner
//   // const processBarcodeData = (data: string) => {
//   //   if (!data.trim()) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Invalid Barcode",
//   //       description: "Scanned data is empty",
//   //       duration: 2000,
//   //     });
//   //     return;
//   //   }

//   //   try {
//   //     let serial = "";
//   //     let partNumbers: string[] = [];

//   //     // Check if input is a static barcode from our test data
//   //     const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
//   //       barcode.split(':')[0] === data.toUpperCase()
//   //     );

//   //     if (staticBarcode) {
//   //       const parts = staticBarcode.split(':');
//   //       serial = parts[0].trim();
//   //       if (parts.length > 1) {
//   //         partNumbers = parts[1].split(',')
//   //           .map(p => p.trim())
//   //           .filter(p => p.length > 0);
//   //       }
//   //     }
//   //     // Format 1: SERIAL:PART1,PART2,PART3
//   //     else if (data.includes(':') && data.includes(',')) {
//   //       const parts = data.split(':');
//   //       serial = parts[0].trim();

//   //       if (parts.length > 1) {
//   //         partNumbers = parts[1].split(',')
//   //           .map(p => p.trim())
//   //           .filter(p => p.length > 0);
//   //       }
//   //     }
//   //     // Format 2: SERIAL:PART1 (single part)
//   //     else if (data.includes(':') && !data.includes(',')) {
//   //       const parts = data.split(':');
//   //       serial = parts[0].trim();
//   //       if (parts.length > 1) {
//   //         partNumbers = [parts[1].trim()];
//   //       }
//   //     }
//   //     // Format 3: JSON format from smart scanners
//   //     else if (data.startsWith('{') && data.endsWith('}')) {
//   //       try {
//   //         const parsedData = JSON.parse(data);
//   //         serial = parsedData.serial || parsedData.Serial || parsedData.SN || "";
//   //         partNumbers = Array.isArray(parsedData.parts) ? parsedData.parts
//   //           : Array.isArray(parsedData.partNumbers) ? parsedData.partNumbers
//   //             : parsedData.part ? [parsedData.part]
//   //               : [];
//   //       } catch (jsonError) {
//   //         console.error("JSON parse error:", jsonError);
//   //         serial = data.trim();
//   //       }
//   //     }
//   //     // Format 4: Simple serial number only
//   //     else {
//   //       serial = data.trim();
//   //     }

//   //     // Validate serial number
//   //     if (!serial) {
//   //       toast({
//   //         variant: "destructive",
//   //         title: "Invalid Barcode Format",
//   //         description: "No serial number found in scanned data",
//   //         duration: 3000,
//   //       });
//   //       return;
//   //     }

//   //     // Check if this serial is already complete
//   //     if (isSerialComplete(serial)) {
//   //       const status = getSerialCompletionStatus(serial);
//   //       toast({
//   //         variant: "default",
//   //         title: "✅ All Parts Already Scanned",
//   //         description: `Serial ${serial} is complete! ${status.assigned}/${status.total} parts assigned.`,
//   //         duration: 4000,
//   //       });
//   //       return;
//   //     }

//   //     // Set serial number
//   //     setSerialNumber(serial);

//   //     // Check if this serial already exists in our records
//   //     const existingSummary = partsSummary.find(summary => summary.serialNumber === serial);

//   //     if (existingSummary) {
//   //       // Serial exists - show remaining unassigned parts
//   //       const remainingParts = existingSummary.unassignedParts;
//   //       const status = getSerialCompletionStatus(serial);

//   //       if (remainingParts.length > 0) {
//   //         setScannedPartNumbers(remainingParts);
//   //         setSelectedPartNumbers(remainingParts);
//   //         toast({
//   //           title: "🔄 Continuing with Existing Serial",
//   //           description: `Serial: ${serial} - ${remainingParts.length} unassigned parts remaining (${status.assigned}/${status.total} already assigned)`,
//   //           duration: 4000,
//   //         });
//   //       } else {
//   //         // This should not happen due to earlier check, but just in case
//   //         setScannedPartNumbers([]);
//   //         setSelectedPartNumbers([]);
//   //         toast({
//   //           title: "✅ All Parts Already Assigned",
//   //           description: `Serial: ${serial} - All ${status.total} parts have been assigned`,
//   //           duration: 3000,
//   //         });
//   //       }
//   //     } else if (partNumbers.length > 0) {
//   //       // New serial number - get available (unused) parts
//   //       const availableParts = getAvailablePartNumbers(partNumbers, serial);

//   //       setScannedPartNumbers(availableParts);

//   //       if (availableParts.length > 0) {
//   //         // Auto-select all available parts
//   //         setSelectedPartNumbers(availableParts);
//   //         toast({
//   //           title: "✅ New Serial Scanned",
//   //           description: `Serial: ${serial}, ${availableParts.length} available part(s) loaded`,
//   //           duration: 3000,
//   //         });
//   //       } else {
//   //         setSelectedPartNumbers([]);
//   //         toast({
//   //           title: "⚠️ All Parts Already Used",
//   //           description: `Serial: ${serial} - All parts from this barcode are already used in previous records`,
//   //           duration: 3000,
//   //         });
//   //       }
//   //     } else {
//   //       // Serial only, no parts
//   //       setScannedPartNumbers([]);
//   //       setSelectedPartNumbers([]);
//   //       toast({
//   //         title: "✅ Serial Number Scanned",
//   //         description: `Serial: ${serial} - No parts found in barcode`,
//   //         duration: 3000,
//   //       });
//   //     }

//   //   } catch (error) {
//   //     console.error("Barcode processing error:", error);
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Scan Error",
//   //       description: "Failed to process barcode data. Please check the format.",
//   //       duration: 3000,
//   //     });
//   //   }
//   // };

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

//       // [Keep existing parsing logic - same as before]
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
//       else if (data.includes(':') && data.includes(',')) {
//         const parts = data.split(':');
//         serial = parts[0].trim();
//         if (parts.length > 1) {
//           partNumbers = parts[1].split(',')
//             .map(p => p.trim())
//             .filter(p => p.length > 0);
//         }
//       }
//       else if (data.includes(':') && !data.includes(',')) {
//         const parts = data.split(':');
//         serial = parts[0].trim();
//         if (parts.length > 1) {
//           partNumbers = [parts[1].trim()];
//         }
//       }
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
//       else {
//         serial = data.trim();
//       }

//       if (!serial) {
//         toast({
//           variant: "destructive",
//           title: "Invalid Barcode Format",
//           description: "No serial number found in scanned data",
//           duration: 3000,
//         });
//         return;
//       }

//       // ⭐ CRITICAL: Check completion using aggregated data
//       if (isSerialComplete(serial)) {
//         const status = getSerialCompletionStatus(serial);
//         toast({
//           variant: "default",
//           title: "✅ Serial Already Complete",
//           description: `Serial ${serial} has all parts assigned (${status.assigned}/${status.total}). No further scanning needed.`,
//           duration: 4000,
//         });
//         setBarcodeInput("");
//         return;
//       }

//       setSerialNumber(serial);

//       // ⭐ Get aggregated summary for this serial
//       const existingSummary = partsSummary.find(summary => summary.serialNumber === serial);

//       if (existingSummary) {
//         // Serial exists - show remaining unassigned parts from aggregated data
//         const remainingParts = existingSummary.unassignedParts;
//         const status = getSerialCompletionStatus(serial);

//         if (remainingParts.length > 0) {
//           setScannedPartNumbers(remainingParts);
//           setSelectedPartNumbers(remainingParts);
//           toast({
//             title: "🔄 Continuing with Existing Serial",
//             description: `Serial: ${serial} - ${remainingParts.length} unassigned parts remaining (${status.assigned}/${status.total} already assigned)`,
//             duration: 4000,
//           });
//         } else {
//           setScannedPartNumbers([]);
//           setSelectedPartNumbers([]);
//           toast({
//             title: "✅ All Parts Already Assigned",
//             description: `Serial: ${serial} - All ${status.total} parts have been assigned`,
//             duration: 3000,
//           });
//         }
//       } else if (partNumbers.length > 0) {
//         // New serial number - all parts are available
//         setScannedPartNumbers(partNumbers);
//         setSelectedPartNumbers(partNumbers);
//         toast({
//           title: "✅ New Serial Scanned",
//           description: `Serial: ${serial}, ${partNumbers.length} available part(s) loaded`,
//           duration: 3000,
//         });
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
//   // const handleManualSerialInput = (value: string) => {
//   //   // Check if this serial is already complete
//   //   if (isSerialComplete(value)) {
//   //     const status = getSerialCompletionStatus(value);
//   //     toast({
//   //       variant: "default",
//   //       title: "✅ All Parts Already Scanned",
//   //       description: `Serial ${value} is complete! ${status.assigned}/${status.total} parts assigned.`,
//   //       duration: 4000,
//   //     });
//   //     return;
//   //   }

//   //   setSerialNumber(value);

//   //   // Check if this serial exists in records
//   //   const existingSummary = partsSummary.find(summary => summary.serialNumber === value);
//   //   if (existingSummary && existingSummary.unassignedParts.length > 0) {
//   //     setScannedPartNumbers(existingSummary.unassignedParts);
//   //     setSelectedPartNumbers(existingSummary.unassignedParts);
//   //     const status = getSerialCompletionStatus(value);
//   //     toast({
//   //       title: "Existing Serial Loaded",
//   //       description: `Loaded ${existingSummary.unassignedParts.length} unassigned parts (${status.assigned}/${status.total} already assigned)`,
//   //       duration: 2000,
//   //     });
//   //   } else {
//   //     setScannedPartNumbers([]);
//   //     setSelectedPartNumbers([]);
//   //   }

//   //   setSplitRows([{
//   //     id: '1',
//   //     quantity: '',
//   //     buildProject: '',
//   //     line: '',
//   //     color: '',
//   //     remark: '',
//   //     assignedParts: []
//   //   }]);
//   // };

//   const handleManualSerialInput = (value: string) => {
//     // ⭐ CRITICAL FIX: Check if serial is complete FIRST
//     if (isSerialComplete(value)) {
//       const status = getSerialCompletionStatus(value);
//       toast({
//         variant: "default",
//         title: "✅ Serial Already Complete",
//         description: `Serial ${value} has all parts assigned (${status.assigned}/${status.total}). No further action needed.`,
//         duration: 4000,
//       });

//       // ⭐ IMPORTANT: Don't set the serial number - block the action
//       return; // Exit function completely
//     }

//     setSerialNumber(value);

//     // Check if this serial exists in records
//     const existingSummary = partsSummary.find(summary => summary.serialNumber === value);
//     if (existingSummary && existingSummary.unassignedParts.length > 0) {
//       setScannedPartNumbers(existingSummary.unassignedParts);
//       setSelectedPartNumbers(existingSummary.unassignedParts);
//       const status = getSerialCompletionStatus(value);
//       toast({
//         title: "Existing Serial Loaded",
//         description: `Loaded ${existingSummary.unassignedParts.length} unassigned parts (${status.assigned}/${status.total} already assigned)`,
//         duration: 2000,
//       });
//     } else {
//       setScannedPartNumbers([]);
//       setSelectedPartNumbers([]);
//     }

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
//     setManualPartInput("");
//     setSplitRows([{
//       id: '1',
//       quantity: '',
//       buildProject: '',
//       line: '',
//       color: '',
//       remark: '',
//       assignedParts: []
//     }]);

//     // Reset available sample parts in reload mode
//     if (isReloadMode && existingRecord) {
//       const existingPartsSet = new Set(existingRecord.ortLab.partNumbers);
//       const filteredSampleParts = SAMPLE_PARTS.filter(part => !existingPartsSet.has(part));
//       setAvailableSampleParts(filteredSampleParts);
//     } else {
//       setAvailableSampleParts(SAMPLE_PARTS);
//     }

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
//   // const testWithStaticBarcode = (barcode: string) => {
//   //   setBarcodeInput(barcode);
//   //   processBarcodeData(barcode);
//   //   setBarcodeInput("");
//   // };

//   const testWithStaticBarcode = (barcode: string) => {
//     // Extract serial from barcode
//     const serial = barcode.split(':')[0];

//     // ⭐ Check if serial is complete before processing
//     if (isSerialComplete(serial)) {
//       const status = getSerialCompletionStatus(serial);
//       toast({
//         variant: "default",
//         title: "✅ Serial Already Complete",
//         description: `Serial ${serial} has all parts assigned (${status.assigned}/${status.total}). Cannot scan again.`,
//         duration: 4000,
//       });
//       return; // Exit without processing
//     }

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

//   // Handle ORT Submit with reload mode support
//   // const handleORTSubmit = () => {
//   //   if (!selectedRecord && !isReloadMode) return;

//   //   // Validate basic fields
//   //   if (!ortForm.date) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Incomplete Form",
//   //       description: "Please fill in the date field.",
//   //       duration: 2000,
//   //     });
//   //     return;
//   //   }

//   //   if (!serialNumber) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Missing Serial Number",
//   //       description: "Please scan or enter a serial number.",
//   //       duration: 2000,
//   //     });
//   //     return;
//   //   }

//   //   if (selectedPartNumbers.length === 0) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "No Part Numbers",
//   //       description: "Please scan and select parts.",
//   //       duration: 2000,
//   //     });
//   //     return;
//   //   }

//   //   // Validate split rows
//   //   const invalidRows = splitRows.filter(row =>
//   //     !row.quantity || !row.buildProject || !row.line || !row.color || row.assignedParts.length === 0
//   //   );

//   //   if (invalidRows.length > 0) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: "Incomplete Split Rows",
//   //       description: "Please complete all rows (Quantity, Build/Project, Line, Color) and assign parts.",
//   //       duration: 3000,
//   //     });
//   //     return;
//   //   }

//   //   // Check if all selected parts are assigned
//   //   const totalAssigned = splitRows.reduce((sum, row) => sum + row.assignedParts.length, 0);
//   //   const unassignedParts = selectedPartNumbers.filter(part =>
//   //     !splitRows.flatMap(row => row.assignedParts).includes(part)
//   //   );

//   //   try {
//   //     const ortLabId = Date.now();

//   //     let ortLabData;

//   //     if (isReloadMode && existingRecord) {
//   //       // Reload mode: Merge with existing record
//   //       const mergedPartNumbers = [...new Set([...existingRecord.ortLab.partNumbers, ...selectedPartNumbers])];
//   //       const mergedScannedParts = [...new Set([...existingRecord.ortLab.scannedPartNumbers, ...scannedPartNumbers])];
//   //       const mergedSplitRows = [...existingRecord.ortLab.splitRows, ...splitRows.map(row => ({
//   //         quantity: row.quantity,
//   //         buildProject: row.buildProject,
//   //         line: row.line,
//   //         color: row.color,
//   //         remark: row.remark,
//   //         assignedParts: row.assignedParts
//   //       }))];

//   //       ortLabData = {
//   //         ...existingRecord,
//   //         ortLabId: ortLabId,
//   //         ortLab: {
//   //           submissionId: ortLabId,
//   //           date: new Date().toISOString().split('T')[0], // Current date for reload
//   //           serialNumber: serialNumber,
//   //           partNumbers: mergedPartNumbers,
//   //           scannedPartNumbers: mergedScannedParts,
//   //           splitRows: mergedSplitRows,
//   //           remark: ortForm.remark || existingRecord.ortLab.remark,
//   //           submittedAt: new Date().toISOString() // Current timestamp
//   //         }
//   //       };

//   //       // Remove the old record and add the merged record
//   //       const existingORTData = localStorage.getItem("ortLabRecords");
//   //       const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
//   //       const updatedRecords = ortRecords.filter((record: any) =>
//   //         record.ortLabId !== existingRecord.ortLabId
//   //       );

//   //       // Add the merged record
//   //       updatedRecords.push(ortLabData);
//   //       localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

//   //     } else {
//   //       // Normal mode: Create new record
//   //       ortLabData = {
//   //         ...selectedRecord!,
//   //         ortLabId: ortLabId,
//   //         ortLab: {
//   //           submissionId: ortLabId,
//   //           date: ortForm.date,
//   //           serialNumber: serialNumber,
//   //           partNumbers: selectedPartNumbers,
//   //           scannedPartNumbers: scannedPartNumbers,
//   //           splitRows: splitRows.map(row => ({
//   //             quantity: row.quantity,
//   //             buildProject: row.buildProject,
//   //             line: row.line,
//   //             color: row.color,
//   //             remark: row.remark,
//   //             assignedParts: row.assignedParts
//   //           })),
//   //           remark: ortForm.remark,
//   //           submittedAt: new Date().toISOString()
//   //         }
//   //       };

//   //       const existingORTData = localStorage.getItem("ortLabRecords");
//   //       const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
//   //       ortRecords.push(ortLabData);
//   //       localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));
//   //     }

//   //     // Update used parts in state
//   //     setUsedParts(prev => {
//   //       const newUsedParts = { ...prev };
//   //       if (!newUsedParts[serialNumber]) {
//   //         newUsedParts[serialNumber] = [];
//   //       }
//   //       newUsedParts[serialNumber] = [...new Set([...newUsedParts[serialNumber], ...selectedPartNumbers])];
//   //       return newUsedParts;
//   //     });

//   //     // Update parts summary - Store only current session data
//   //     const assignedParts = splitRows.flatMap(row => row.assignedParts);

//   //     setPartsSummary(prev => {
//   //       const filtered = prev.filter(summary => summary.recordId !== ortLabId);
//   //       return [...filtered, {
//   //         serialNumber: serialNumber,
//   //         availableParts: selectedPartNumbers,
//   //         assignedParts: assignedParts,
//   //         unassignedParts: unassignedParts,
//   //         recordId: ortLabId
//   //       }];
//   //     });

//   //     // Success message
//   //     toast({
//   //       title: isReloadMode ? "✅ Parts Reloaded Successfully" : "✅ ORT Lab Submitted",
//   //       description: isReloadMode
//   //         ? `Added ${selectedPartNumbers.length} new parts to document ${existingRecord?.documentNumber}`
//   //         : `ORT Lab data with ${splitRows.length} split(s) has been saved successfully!`,
//   //       duration: 4000,
//   //     });

//   //     // Clear form for next entry
//   //     setSerialNumber("");
//   //     setScannedPartNumbers([]);
//   //     setSelectedPartNumbers([]);
//   //     setSplitRows([{
//   //       id: '1',
//   //       quantity: '',
//   //       buildProject: '',
//   //       line: '',
//   //       color: '',
//   //       remark: '',
//   //       assignedParts: []
//   //     }]);
//   //     setBarcodeInput("");
//   //     setManualPartInput("");
//   //     setIsReloadMode(false);

//   //     // Show summary table
//   //     setShowSummaryTable(true);

//   //   } catch (error) {
//   //     toast({
//   //       variant: "destructive",
//   //       title: isReloadMode ? "Reload Failed" : "Submission Failed",
//   //       description: "There was an error processing the request. Please try again.",
//   //       duration: 3000,
//   //     });
//   //     console.error("Error:", error);
//   //   }
//   // };

//   const handleORTSubmit = () => {
//     if (!selectedRecord && !isReloadMode) return;

//     // [Keep all existing validation logic]
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

//     const invalidRows = splitRows.filter(row =>
//       !row.quantity || !row.buildProject || !row.line || !row.color || row.assignedParts.length === 0
//     );

//     if (invalidRows.length > 0) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Split Rows",
//         description: "Please complete all rows and assign parts.",
//         duration: 3000,
//       });
//       return;
//     }

//     try {
//       const ortLabId = Date.now();
//       let ortLabData;

//       if (isReloadMode && existingRecord) {
//         // [Keep existing reload mode logic]
//         const mergedPartNumbers = [...new Set([...existingRecord.ortLab.partNumbers, ...selectedPartNumbers])];
//         const mergedScannedParts = [...new Set([...existingRecord.ortLab.scannedPartNumbers, ...scannedPartNumbers])];
//         const mergedSplitRows = [...existingRecord.ortLab.splitRows, ...splitRows.map(row => ({
//           quantity: row.quantity,
//           buildProject: row.buildProject,
//           line: row.line,
//           color: row.color,
//           remark: row.remark,
//           assignedParts: row.assignedParts
//         }))];

//         ortLabData = {
//           ...existingRecord,
//           ortLabId: ortLabId,
//           ortLab: {
//             submissionId: ortLabId,
//             date: new Date().toISOString().split('T')[0],
//             serialNumber: serialNumber,
//             partNumbers: mergedPartNumbers,
//             scannedPartNumbers: mergedScannedParts,
//             splitRows: mergedSplitRows,
//             remark: ortForm.remark || existingRecord.ortLab.remark,
//             submittedAt: new Date().toISOString()
//           }
//         };

//         const existingORTData = localStorage.getItem("ortLabRecords");
//         const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
//         const updatedRecords = ortRecords.filter((record: any) =>
//           record.ortLabId !== existingRecord.ortLabId
//         );
//         updatedRecords.push(ortLabData);
//         localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

//       } else {
//         // [Keep existing normal mode logic]
//         ortLabData = {
//           ...selectedRecord!,
//           ortLabId: ortLabId,
//           ortLab: {
//             submissionId: ortLabId,
//             date: ortForm.date,
//             serialNumber: serialNumber,
//             partNumbers: selectedPartNumbers,
//             scannedPartNumbers: scannedPartNumbers,
//             splitRows: splitRows.map(row => ({
//               quantity: row.quantity,
//               buildProject: row.buildProject,
//               line: row.line,
//               color: row.color,
//               remark: row.remark,
//               assignedParts: row.assignedParts
//             })),
//             remark: ortForm.remark,
//             submittedAt: new Date().toISOString()
//           }
//         };

//         const existingORTData = localStorage.getItem("ortLabRecords");
//         const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
//         ortRecords.push(ortLabData);
//         localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));
//       }

//       // ⭐ CRITICAL FIX: Reload data from localStorage to recalculate aggregated summary
//       const reloadData = () => {
//         const existingORTData = localStorage.getItem("ortLabRecords");
//         if (existingORTData) {
//           const ortRecords = JSON.parse(existingORTData);
//           const usedPartsMap: UsedParts = {};
//           const serialGroupMap = new Map<string, any[]>();

//           ortRecords.forEach((record: any) => {
//             if (record.ortLab && record.ortLab.serialNumber && record.ortLab.partNumbers) {
//               const serial = record.ortLab.serialNumber;
//               if (!serialGroupMap.has(serial)) {
//                 serialGroupMap.set(serial, []);
//               }
//               serialGroupMap.get(serial)!.push(record);
//             }
//           });

//           const summary: PartsSummary[] = [];

//           serialGroupMap.forEach((records, serial) => {
//             const allPartsSet = new Set<string>();
//             const allAssignedPartsSet = new Set<string>();
//             let recordId = 0;

//             records.forEach((record: any) => {
//               record.ortLab.partNumbers.forEach((part: string) => allPartsSet.add(part));
//               const assignedInRecord = record.ortLab.splitRows?.flatMap((row: any) => row.assignedParts) || [];
//               assignedInRecord.forEach((part: string) => allAssignedPartsSet.add(part));
//               recordId = record.ortLabId || record.id;
//             });

//             const allParts = Array.from(allPartsSet);
//             const allAssignedParts = Array.from(allAssignedPartsSet);
//             const unassignedParts = allParts.filter(part => !allAssignedPartsSet.has(part));

//             if (!usedPartsMap[serial]) {
//               usedPartsMap[serial] = [];
//             }
//             usedPartsMap[serial] = allParts;

//             summary.push({
//               serialNumber: serial,
//               availableParts: allParts,
//               assignedParts: allAssignedParts,
//               unassignedParts: unassignedParts,
//               recordId: recordId
//             });
//           });

//           setUsedParts(usedPartsMap);
//           setPartsSummary(summary);
//         }
//       };

//       // ⭐ Reload and recalculate summary
//       reloadData();

//       toast({
//         title: isReloadMode ? "✅ Parts Reloaded Successfully" : "✅ ORT Lab Submitted",
//         description: isReloadMode
//           ? `Added ${selectedPartNumbers.length} new parts to document ${existingRecord?.documentNumber}`
//           : `ORT Lab data with ${splitRows.length} split(s) has been saved successfully!`,
//         duration: 4000,
//       });

//       // Clear form
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
//       setManualPartInput("");
//       setIsReloadMode(false);

//       setShowSummaryTable(true);

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: isReloadMode ? "Reload Failed" : "Submission Failed",
//         description: "There was an error processing the request. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error:", error);
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

//   const isORTSubmitEnabled = () => {
//     const allRowsValid = splitRows.every(row =>
//       row.quantity && row.buildProject && row.line && row.color && row.assignedParts.length > 0
//     );

//     return (
//       ortForm.date &&
//       serialNumber &&
//       selectedPartNumbers.length > 0 &&
//       allRowsValid
//     );
//   };

//   if (!selectedRecord && !isReloadMode) {
//     return (
//       <div className="container mx-auto p-6 max-w-6xl">
//         <Card>
//           <CardContent className="p-6">
//             <div className="text-center text-gray-500">No record selected. Please go back and select a record.</div>
//             <Button
//               variant="outline"
//               onClick={() => navigate("/")}
//               className="mt-4"
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
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
//         Back to {isReloadMode ? "ORT Lab Records" : "Live Test Checklist"}
//       </Button>

//       <Card>
//         <CardHeader className={`${isReloadMode ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
//           <CardTitle className="text-2xl">
//             {isReloadMode ? '🔄 Reload Parts - ORT Lab Form' : 'ORT Lab Form - Part Splitting'}
//             {isReloadMode && existingRecord && (
//               <div className="text-sm font-normal mt-2">
//                 Document: {existingRecord.documentNumber} | Project: {existingRecord.projectName}
//               </div>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="pt-6">
//           {/* Record Information */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//             <h3 className="font-semibold text-lg mb-3 text-gray-700">
//               {isReloadMode ? 'Existing Record Information' : 'Selected Record Information'}
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//               <div>
//                 <span className="font-medium text-gray-600">Document Number:</span>
//                 <p className="text-gray-800">
//                   {isReloadMode ? existingRecord?.documentNumber : selectedRecord?.documentNumber}
//                 </p>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Project Name:</span>
//                 <p className="text-gray-800">
//                   {isReloadMode ? existingRecord?.projectName : selectedRecord?.projectName}
//                 </p>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Test Location:</span>
//                 <p className="text-gray-800">
//                   {isReloadMode ? existingRecord?.testLocation : selectedRecord?.testLocation}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Completion Status Banner */}
//           {serialNumber && isSerialComplete(serialNumber) && (
//             <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//                 <div>
//                   <h3 className="font-semibold text-green-800">Serial Complete!</h3>
//                   <p className="text-green-700 text-sm">
//                     Serial {serialNumber} has all parts assigned. No further action needed.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Parts Summary Table */}
//           {showSummaryTable && partsSummary.length > 0 && (
//             <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
//               <h3 className="font-semibold text-lg mb-4 text-green-800">Parts Summary - Unassigned Parts Remain</h3>
//               <p className="text-sm text-green-700 mb-4">
//                 ⚠️ Some parts are still unassigned. Please assign all parts before proceeding to QRT Checklist.
//               </p>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-green-100">
//                       <th className="border border-gray-300 px-4 py-2 text-left">Serial Number</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Available Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Assigned Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Unassigned Parts</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
//                       <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {partsSummary.map((summary) => {
//                       const isComplete = summary.unassignedParts.length === 0;
//                       const uniqueKey = `${summary.serialNumber}-${summary.recordId}`;

//                       return (
//                         <tr key={uniqueKey} className="bg-white">
//                           <td className="border border-gray-300 px-4 py-2 font-mono">
//                             <div className="flex items-center gap-2">
//                               {summary.serialNumber}
//                               {isComplete && <CheckCircle className="h-4 w-4 text-green-600" />}
//                             </div>
//                           </td>
//                           <td className="border border-gray-300 px-4 py-2">
//                             <div className="flex flex-wrap gap-1">
//                               {summary.availableParts.map((part, idx) => (
//                                 <span key={`${part}-${idx}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                                   {part}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="border border-gray-300 px-4 py-2">
//                             <div className="flex flex-wrap gap-1">
//                               {summary.assignedParts.map((part, idx) => (
//                                 <span key={`assigned-${part}-${idx}`} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
//                                   {part}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="border border-gray-300 px-4 py-2">
//                             <div className="flex flex-wrap gap-1">
//                               {summary.unassignedParts.map((part, idx) => (
//                                 <span key={`unassigned-${part}-${idx}`} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
//                                   {part}
//                                 </span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="border border-gray-300 px-4 py-2">
//                             {isComplete ? (
//                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                 <CheckCircle className="h-3 w-3 mr-1" />
//                                 Complete
//                               </span>
//                             ) : (
//                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                                 {summary.assignedParts.length}/{summary.availableParts.length} Assigned
//                               </span>
//                             )}
//                           </td>
//                           <td className="border border-gray-300 px-4 py-2">
//                             <div className="flex gap-2">
//                               {!isComplete && (
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => handleEdit(summary)}
//                                   className="bg-blue-500 text-white hover:bg-blue-600"
//                                 >
//                                   <Edit className="h-3 w-3 mr-1" />
//                                   Edit
//                                 </Button>
//                               )}
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleDelete(summary.serialNumber)}
//                                 className="bg-red-500 text-white hover:bg-red-600"
//                               >
//                                 <Trash2 className="h-3 w-3 mr-1" />
//                                 Delete
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={handleProceed}
//                                 className="bg-green-500 text-white hover:bg-green-600"
//                               >
//                                 <Play className="h-3 w-3 mr-1" />
//                                 Proceed
//                               </Button>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
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
//                   {isReloadMode ? 'Manual Parts Entry' : 'Barcode Scanner'}
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
//                 {/* Barcode Input for Normal Mode */}
//                 {!isReloadMode && (
//                   <div className="space-y-2">
//                     <Label htmlFor="barcodeInput" className="text-base font-medium">
//                       Scanner Input <span className="text-red-600">*</span>
//                     </Label>
//                     <Input
//                       ref={barcodeInputRef}
//                       id="barcodeInput"
//                       value={barcodeInput}
//                       onChange={(e) => setBarcodeInput(e.target.value)}
//                       onKeyDown={handleBarcodeInput}
//                       placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
//                       className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
//                       autoFocus
//                       disabled={serialNumber && isSerialComplete(serialNumber)} // ⭐ Disable when complete
//                     />
//                     {serialNumber && isSerialComplete(serialNumber) && (
//                       <p className="text-sm text-green-600 font-medium">
//                         ✅ This serial is complete. Clear the form to scan a new serial.
//                       </p>
//                     )}
//                     <p className="text-sm text-blue-700">
//                       💡 <strong>Smart Scanning:</strong> Only shows unused parts for each serial number across all records.
//                     </p>
//                   </div>
//                 )}

//                 {/* Manual Parts Entry for Reload Mode */}
//                 {isReloadMode && (
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="manualPartInput" className="text-base font-medium">
//                         Manual Part Entry <span className="text-red-600">*</span>
//                       </Label>
//                       <Input
//                         id="manualPartInput"
//                         value={manualPartInput}
//                         onChange={(e) => setManualPartInput(e.target.value)}
//                         onKeyDown={handleManualPartInput}
//                         placeholder="Enter part number manually (Press Enter to add)"
//                         className="h-12 font-mono text-lg border-2 border-green-300 focus:border-green-500"
//                         autoFocus
//                       />
//                       <p className="text-sm text-green-700">
//                         💡 <strong>Manual Entry:</strong> Enter part numbers manually and press Enter to add them.
//                       </p>
//                     </div>

//                     {/* Sample Parts Section */}
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Quick Add Sample Parts:
//                       </Label>
//                       <div className="flex flex-wrap gap-2 mb-2">
//                         {availableSampleParts.slice(0, 5).map((part) => (
//                           <Button
//                             key={part}
//                             variant="outline"
//                             size="sm"
//                             onClick={() => addSamplePart(part)}
//                             className="text-xs font-mono bg-green-100 hover:bg-green-200"
//                           >
//                             <Barcode className="h-3 w-3 mr-1" />
//                             {part}
//                           </Button>
//                         ))}
//                       </div>

//                       {/* Bulk Add Buttons */}
//                       <div className="flex flex-wrap gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => addMultipleSampleParts(3)}
//                           className="text-xs bg-blue-100 hover:bg-blue-200"
//                         >
//                           Add 3 Sample Parts
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => addMultipleSampleParts(5)}
//                           className="text-xs bg-blue-100 hover:bg-blue-200"
//                         >
//                           Add 5 Sample Parts
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => addMultipleSampleParts(availableSampleParts.length)}
//                           className="text-xs bg-blue-100 hover:bg-blue-200"
//                         >
//                           Add All ({availableSampleParts.length}) Parts
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Test Barcode Buttons (Only show in normal mode) */}
//                 {!isReloadMode && (
//                   <div className="space-y-2">
//                     <Label className="text-sm font-medium text-gray-700">
//                       Test Barcodes (Click to simulate scan):
//                     </Label>
//                     <div className="flex flex-wrap gap-2">
//                       {STATIC_BARCODE_DATA.map((barcode, index) => (
//                         <Button
//                           key={`test-barcode-${barcode}-${index}`}
//                           variant="outline"
//                           size="sm"
//                           onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
//                           className="text-xs font-mono"
//                         >
//                           {barcode.split(':')[0]}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Scanner Status */}
//                 {/* <div className="p-3 bg-white rounded border">
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
//                 </div> */}

//                 {/* Scanner Status */}
//                 <div className="p-3 bg-white rounded border">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <span className="font-medium text-gray-600">Serial Number:</span>
//                       <p className="font-mono text-blue-700">{serialNumber || "Not scanned"}</p>
//                     </div>
//                     <div>
//                       <span className="font-medium text-gray-600">Total Parts:</span>
//                       <p className="text-blue-700">
//                         {selectedPartNumbers.length} parts
//                         {serialNumber && (
//                           <span className="text-orange-600 ml-2">
//                             ({getSerialCompletionStatus(serialNumber).assigned} already assigned out of {getSerialCompletionStatus(serialNumber).total})
//                           </span>
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Rest of the form remains the same */}
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
//                   onClick={() => navigate(isReloadMode ? "/ortlab-details" : "/")}
//                   className="px-6"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleORTSubmit}
//                   disabled={!isORTSubmitEnabled()}
//                   className={`${isReloadMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6`}
//                 >
//                   {isReloadMode ? 'Reload Parts' : 'Submit ORT Lab'}
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
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, X, Scan, Trash2, CheckCircle, Barcode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  quantity: number;
  project: string[];
  line: string;
  colour: string;
  remarks: string;
}

// Static barcode data for testing
const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005"
];

interface ScannedPart {
  serialNumber: string;
  partNumber: string;
  scannedAt: Date;
}

const ORTLabPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode input from physical scanner
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

  // Process barcode data
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
      // Format 3: Simple serial number only
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

      // Set serial number
      setSerialNumber(serial);

      // Check if we've reached the required quantity
      const requiredQuantity = selectedRecord?.quantity || 0;
      if (scannedParts.length >= requiredQuantity) {
        toast({
          variant: "destructive",
          title: "Quantity Limit Reached",
          description: `Required quantity is ${requiredQuantity}. All parts have been scanned.`,
          duration: 3000,
        });
        return;
      }

      // Add scanned parts
      const newParts: ScannedPart[] = partNumbers.map(part => ({
        serialNumber: serial,
        partNumber: part,
        scannedAt: new Date()
      }));

      // Check how many more parts we can add
      const remainingCapacity = requiredQuantity - scannedParts.length;
      const partsToAdd = newParts.slice(0, remainingCapacity);

      if (partsToAdd.length > 0) {
        setScannedParts(prev => [...prev, ...partsToAdd]);
        toast({
          title: "Parts Scanned",
          description: `Added ${partsToAdd.length} part(s) to serial ${serial}`,
          duration: 2000,
        });

        // Check if we reached required quantity
        if (scannedParts.length + partsToAdd.length >= requiredQuantity) {
          toast({
            title: "All Parts Scanned!",
            description: `All ${requiredQuantity} parts have been scanned successfully.`,
            duration: 3000,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Add More Parts",
          description: `Required quantity ${requiredQuantity} already reached.`,
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

  // Test with static barcode data
  const testWithStaticBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
    processBarcodeData(barcode);
    setBarcodeInput("");
  };

  // Clear all scanned data
  const clearScannedData = () => {
    setSerialNumber("");
    setScannedParts([]);
    setBarcodeInput("");
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    toast({
      title: "Data Cleared",
      description: "All scanned data has been cleared",
      duration: 2000,
    });
  };

  // Start/Stop camera scanner
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setShowScanner(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        duration: 3000,
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setShowScanner(false);
  };

  // Handle ORT Submit
  const handleORTSubmit = () => {
    if (!selectedRecord) return;

    const requiredQuantity = selectedRecord.quantity;
    
    if (scannedParts.length < requiredQuantity) {
      toast({
        variant: "destructive",
        title: "Incomplete Scanning",
        description: `Only ${scannedParts.length} of ${requiredQuantity} parts scanned. Please scan all required parts.`,
        duration: 3000,
      });
      return;
    }

    try {
      const ortLabId = Date.now();
      const ortLabData = {
        ...selectedRecord,
        ortLabId: ortLabId,
        ortLab: {
          submissionId: ortLabId,
          date: new Date().toISOString().split('T')[0],
          serialNumber: serialNumber,
          scannedParts: scannedParts,
          totalParts: scannedParts.length,
          requiredQuantity: requiredQuantity,
          submittedAt: new Date().toISOString()
        }
      };

      // Save to localStorage
      const existingORTData = localStorage.getItem("testRecords");
      const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
      ortRecords.push(ortLabData);
      localStorage.setItem("testRecords", JSON.stringify(ortRecords));

      // Update test record status
      // const existingTestData = localStorage.getItem("testRecords");
      // if (existingTestData) {
      //   const testRecords = JSON.parse(existingTestData);
      //   const updatedRecords = testRecords.map((record: TestRecord) =>
      //     record.id === selectedRecord.id ? { ...record, status: "ORT Completed" } : record
      //   );
      //   localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
      // }

      toast({
        title: "ORT Lab Completed!",
        description: `${scannedParts.length} parts scanned and assigned successfully.`,
        duration: 4000,
      });

      navigate("/qrtchecklist", { state: { 
      record: selectedRecord,
      ortData: ortLabData 
    }});

      // Navigate back after 2 seconds
      setTimeout(() => navigate("/qrtchecklist"), 1000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error processing the request. Please try again.",
        duration: 3000,
      });
      console.error("Error:", error);
    }
  };

  if (!selectedRecord) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No record selected. Please go back and select a record.</div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredQuantity = selectedRecord.quantity || 0;
  const scannedCount = scannedParts.length;
  const remainingCount = Math.max(0, requiredQuantity - scannedCount);
  const isComplete = scannedCount >= requiredQuantity;

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
          <CardTitle className="text-2xl">
            ORT Lab - Part Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* OQC Form Data Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              OQC Form Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Quantity Required</Label>
                <div className="text-xl font-bold">{selectedRecord.quantity}</div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Project(s)</Label>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(selectedRecord.project) && selectedRecord.project.length > 0 ? (
                    selectedRecord.project.map((proj, index) => (
                      <div key={index} className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {proj}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm font-medium">{selectedRecord.projectName}</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Line</Label>
                <div className="text-sm font-medium">{selectedRecord.line || "N/A"}</div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Colour</Label>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border"
                    style={{ 
                      backgroundColor: selectedRecord.colour === "N/A" ? "#ccc" : 
                      selectedRecord.colour?.includes("NDA") ? "#4f46e5" :
                      selectedRecord.colour?.includes("LB") ? "#10b981" :
                      selectedRecord.colour?.includes("SD") ? "#f59e0b" : selectedRecord.color || "#ccc"
                    }}
                  />
                  <span className="text-sm font-medium">{selectedRecord.colour || selectedRecord.color || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status Banner */}
          {isComplete && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">All Parts Scanned!</h3>
                  <p className="text-green-700 text-sm">
                    {scannedCount} parts have been scanned. Ready to submit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Required</p>
                  <p className="text-3xl font-bold">{requiredQuantity}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Scanned</p>
                  <p className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                    {scannedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className={`text-3xl font-bold ${remainingCount === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {remainingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barcode Scanner Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode Scanner
              </h3>
              <Button
                variant="outline"
                onClick={clearScannedData}
                disabled={!serialNumber && scannedParts.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {/* Barcode Input */}
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
                  disabled={isComplete}
                />
                {isComplete && (
                  <p className="text-sm text-green-600 font-medium">
                    All parts scanned. Ready to submit.
                  </p>
                )}
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
                      disabled={isComplete}
                    >
                      {barcode.split(':')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Camera Scanner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Camera Scanner:
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={startScanner}
                    disabled={showScanner || isComplete}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Camera Scanner
                  </Button>
                  {showScanner && (
                    <Button
                      variant="destructive"
                      onClick={stopScanner}
                    >
                      Stop Scanner
                    </Button>
                  )}
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
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isComplete ? 'Complete' : `${scannedCount}/${requiredQuantity} parts scanned`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Preview */}
          {showScanner && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Camera Preview:
              </Label>
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-64 h-32 border-2 border-green-400 rounded-lg"></div>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Parts Table */}
          {scannedParts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Scanned Parts ({scannedParts.length} of {requiredQuantity})
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Scanned At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scannedParts.map((part, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{part.serialNumber}</TableCell>
                        <TableCell className="font-medium">{part.partNumber}</TableCell>
                        <TableCell>
                          {part.scannedAt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Scanning Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {scannedCount} / {requiredQuantity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (scannedCount / requiredQuantity) * 100)}%`
                }}
              ></div>
            </div>
          </div>

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
              disabled={!isComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit ORT Lab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ORTLabPage;