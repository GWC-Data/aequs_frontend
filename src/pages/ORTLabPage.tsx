// import React, { useRef, useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "@/components/ui/use-toast";
// import { ArrowLeft, X, Scan, Trash2, CheckCircle, Barcode } from "lucide-react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
//   quantity: number;
//   project: string[];
//   line: string;
//   colour: string;
//   remarks: string;
// }

// interface ORTLabPageLocationState {
//   record: TestRecord;
//   reloadMode?: boolean;
//   existingRecord?: any;
// }

// // Static barcode data for testing
// const STATIC_BARCODE_DATA = [
//   "SN001:PART001,PART002,PART003,PART004,PART005"
// ];

// // Static additional parts for reload mode
// const ADDITIONAL_PARTS = [
//   { id: 6, partNumber: "PART006" },
//   { id: 7, partNumber: "PART007" },
//   { id: 8, partNumber: "PART008" },
//   { id: 9, partNumber: "PART009" },
//   { id: 10, partNumber: "PART010" },
// ];

// interface ScannedPart {
//   serialNumber: string;
//   partNumber: string;
//   scannedAt: Date;
// }

// const ORTLabPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const locationState = location.state as ORTLabPageLocationState | undefined;
//   const selectedRecord = locationState?.record;
//   const reloadMode = locationState?.reloadMode || false;
//   const existingRecord = locationState?.existingRecord;

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [serialNumber, setSerialNumber] = useState("");
//   const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [isScanning, setIsScanning] = useState(false);
//   const [showScanner, setShowScanner] = useState(false);
//   const barcodeInputRef = useRef<HTMLInputElement>(null);
//   const [isReloadMode, setIsReloadMode] = useState(false);
//   const [existingORTRecord, setExistingORTRecord] = useState<any>(null);
//   const [selectedAdditionalParts, setSelectedAdditionalParts] = useState<string[]>([]);

//   // Auto-focus on barcode input
//   useEffect(() => {
//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//   }, []);

//   // Load existing scanned parts if in reload mode
//   useEffect(() => {
//     if (reloadMode && existingRecord) {
//       setIsReloadMode(true);
//       setExistingORTRecord(existingRecord);

//       // Load existing scanned parts
//       if (existingRecord.ortLab?.scannedParts) {
//         setScannedParts(existingRecord.ortLab.scannedParts.map((part: any) => ({
//           ...part,
//           scannedAt: new Date(part.scannedAt)
//         })));
//         setSerialNumber(existingRecord.ortLab.serialNumber || "");
//       }

//       toast({
//         title: "Reload Mode Active",
//         description: `Loaded ${existingRecord.ortLab?.scannedParts?.length || 0} existing parts. You can now add more parts.`,
//         duration: 4000,
//       });
//     }
//   }, [reloadMode, existingRecord]);

//   // Handle barcode input from physical scanner
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

//   // Process barcode data
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
//       // Format 3: Simple serial number only
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

//       // Check if we've reached the required quantity (skip in reload mode)
//       const requiredQuantity = selectedRecord?.quantity || 0;
//       if (!isReloadMode && scannedParts.length >= requiredQuantity) {
//         toast({
//           variant: "destructive",
//           title: "Quantity Limit Reached",
//           description: `Required quantity is ${requiredQuantity}. All parts have been scanned.`,
//           duration: 3000,
//         });
//         return;
//       }

//       // Add scanned parts
//       const newParts: ScannedPart[] = partNumbers.map(part => ({
//         serialNumber: serial,
//         partNumber: part,
//         scannedAt: new Date()
//       }));

//       // Replace the parts addition section with:
//       // Check how many more parts we can add
//       const remainingCapacity = isReloadMode
//         ? 999 // Allow unlimited additional parts in reload mode
//         : requiredQuantity - scannedParts.length;
//       const partsToAdd = newParts.slice(0, remainingCapacity);

//       if (partsToAdd.length > 0) {
//         setScannedParts(prev => [...prev, ...partsToAdd]);

//         const messagePrefix = isReloadMode ? "Additional" : "";
//         toast({
//           title: `${messagePrefix} Parts Scanned`,
//           description: `Added ${partsToAdd.length} part(s) to serial ${serial}${isReloadMode ? ' (Reload Mode)' : ''}`,
//           duration: 2000,
//         });

//         // Check if we reached required quantity (only in normal mode)
//         if (!isReloadMode && scannedParts.length + partsToAdd.length >= requiredQuantity) {
//           toast({
//             title: "All Parts Scanned!",
//             description: `All ${requiredQuantity} parts have been scanned successfully.`,
//             duration: 3000,
//           });
//         }
//       } else {
//         toast({
//           variant: "destructive",
//           title: "Cannot Add More Parts",
//           description: `Required quantity ${requiredQuantity} already reached.`,
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

//   // Test with static barcode data
//   const testWithStaticBarcode = (barcode: string) => {
//     setBarcodeInput(barcode);
//     processBarcodeData(barcode);
//     setBarcodeInput("");
//   };

//   // Clear all scanned data
//   const clearScannedData = () => {
//     setSerialNumber("");
//     setScannedParts([]);
//     setBarcodeInput("");
//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//     toast({
//       title: "Data Cleared",
//       description: "All scanned data has been cleared",
//       duration: 2000,
//     });
//   };

//   // Start/Stop camera scanner
//   const startScanner = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" }
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setIsScanning(true);
//         setShowScanner(true);
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//       toast({
//         variant: "destructive",
//         title: "Camera Error",
//         description: "Unable to access camera. Please check permissions.",
//         duration: 3000,
//       });
//     }
//   };

//   const stopScanner = () => {
//     if (videoRef.current?.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       stream.getTracks().forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
//     setIsScanning(false);
//     setShowScanner(false);
//   };

//   // Toggle additional part selection
//   const toggleAdditionalPart = (partNumber: string) => {
//     setSelectedAdditionalParts(prev => {
//       if (prev.includes(partNumber)) {
//         return prev.filter(p => p !== partNumber);
//       } else {
//         return [...prev, partNumber];
//       }
//     });
//   };

//   // Check if a part is already scanned
//   const isPartAlreadyScanned = (partNumber: string) => {
//     return scannedParts.some(part => part.partNumber === partNumber);
//   };

//   // Add selected additional parts to scanned parts
//   const addSelectedAdditionalParts = () => {
//     if (selectedAdditionalParts.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Parts Selected",
//         description: "Please select at least one part to add.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (!serialNumber) {
//       toast({
//         variant: "destructive",
//         title: "Serial Number Required",
//         description: "Please scan or enter a serial number first.",
//         duration: 2000,
//       });
//       return;
//     }

//     // Create new scanned parts from selection
//     const newParts: ScannedPart[] = selectedAdditionalParts.map(partNumber => ({
//       serialNumber: serialNumber,
//       partNumber: partNumber,
//       scannedAt: new Date()
//     }));

//     setScannedParts(prev => [...prev, ...newParts]);

//     toast({
//       title: "Additional Parts Added",
//       description: `Successfully added ${newParts.length} additional part(s) to serial ${serialNumber}`,
//       duration: 2000,
//     });

//     // Clear selection
//     setSelectedAdditionalParts([]);
//   };

//   const handleORTSubmit = () => {
//     if (!selectedRecord) return;

//     const requiredQuantity = selectedRecord.quantity;

//     // In reload mode, just need at least one part
//     // In normal mode, need all required parts
//     if (!isReloadMode && scannedParts.length < requiredQuantity) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Scanning",
//         description: `Only ${scannedParts.length} of ${requiredQuantity} parts scanned. Please scan all required parts.`,
//         duration: 3000,
//       });
//       return;
//     }

//     if (isReloadMode && scannedParts.length === existingORTRecord?.ortLab?.scannedParts?.length) {
//       toast({
//         variant: "destructive",
//         title: "No New Parts Added",
//         description: "Please scan at least one new part before submitting.",
//         duration: 3000,
//       });
//       return;
//     }

//     try {
//       // Retrieve existing ORT records
//       const existingORTData = localStorage.getItem("ortLabRecords");
//       const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];

//       if (isReloadMode && existingORTRecord) {
//         // UPDATE existing record
//         const updatedORTData = {
//           ...existingORTRecord,
//           ortLab: {
//             ...existingORTRecord.ortLab,
//             serialNumber: serialNumber,
//             scannedParts: scannedParts,
//             totalParts: scannedParts.length,
//             lastUpdatedAt: new Date().toISOString(),
//             updateCount: (existingORTRecord.ortLab?.updateCount || 0) + 1
//           }
//         };

//         // Find and update the existing record
//         const updatedRecords = ortRecords.map((record: any) =>
//           record.ortLabId === existingORTRecord.ortLabId ? updatedORTData : record
//         );

//         localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));

//         toast({
//           title: "ORT Lab Updated!",
//           description: `Record updated with ${scannedParts.length} total parts (added ${scannedParts.length - (existingORTRecord.ortLab?.scannedParts?.length || 0)} new parts).`,
//           duration: 4000,
//         });

//         // Navigate back to QRT checklist
//         navigate("/stage2", {
//           state: {
//             record: selectedRecord,
//             ortData: updatedORTData
//           }
//         });

//       } else {
//         // CREATE new record (existing logic)
//         const ortLabId = Date.now();
//         const ortLabData = {
//           ...selectedRecord,
//           ortLabId: ortLabId,
//           ortLab: {
//             submissionId: ortLabId,
//             date: new Date().toISOString().split('T')[0],
//             serialNumber: serialNumber,
//             scannedParts: scannedParts,
//             totalParts: scannedParts.length,
//             requiredQuantity: requiredQuantity,
//             submittedAt: new Date().toISOString(),
//             updateCount: 0
//           }
//         };

//         ortRecords.push(ortLabData);
//         localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));

//         toast({
//           title: "ORT Lab Completed!",
//           description: `${scannedParts.length} parts scanned and assigned successfully.`,
//           duration: 4000,
//         });

//         navigate("/qrtchecklist", {
//           state: {
//             record: selectedRecord,
//             ortData: ortLabData
//           }
//         });
//       }

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Submission Failed",
//         description: "There was an error processing the request. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error:", error);
//     }
//   };

//   if (!selectedRecord) {
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

//   const requiredQuantity = selectedRecord.quantity || 0;
//   const scannedCount = scannedParts.length;
//   const remainingCount = isReloadMode ? 0 : Math.max(0, requiredQuantity - scannedCount);
//   const isComplete = isReloadMode
//     ? scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0)
//     : scannedCount >= requiredQuantity;

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
//           <CardTitle className="text-2xl">
//             ORT Lab - Part Scanning
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="pt-6">
//           {/* Serial Number Input - Show in reload mode */}
//           {isReloadMode && (
//             <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
//               <h3 className="font-semibold text-lg text-purple-800 mb-3 flex items-center gap-2">
//                 <Barcode className="h-5 w-5" />
//                 Serial Number
//               </h3>
//               <div className="space-y-2">
//                 <Label htmlFor="serialNumberInput" className="text-base font-medium">
//                   Serial Number {!serialNumber && <span className="text-red-600">*</span>}
//                 </Label>
//                 <Input
//                   id="serialNumberInput"
//                   value={serialNumber}
//                   onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
//                   placeholder="Enter serial number (e.g., SN001)"
//                   className="h-12 font-mono text-lg border-2 border-purple-300 focus:border-purple-500"
//                 />
//                 {serialNumber && (
//                   <p className="text-sm text-green-600 font-medium">
//                     ✓ Serial Number: {serialNumber}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* OQC Form Data Display */}
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//             <h3 className="font-semibold text-lg mb-3 text-gray-700">
//               OQC Form Data
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-sm font-medium text-gray-500">Quantity Required</Label>
//                 <div className="text-xl font-bold">{selectedRecord.quantity}</div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-sm font-medium text-gray-500">Project(s)</Label>
//                 <div className="flex flex-wrap gap-1">
//                   {Array.isArray(selectedRecord.project) && selectedRecord.project.length > 0 ? (
//                     selectedRecord.project.map((proj, index) => (
//                       <div key={index} className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                         {proj}
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-sm font-medium">{selectedRecord.projectName}</div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-sm font-medium text-gray-500">Line</Label>
//                 <div className="text-sm font-medium">{selectedRecord.line || "N/A"}</div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-sm font-medium text-gray-500">Colour</Label>
//                 <div className="flex items-center">
//                   <div
//                     className="w-4 h-4 rounded-full mr-2 border"
//                     style={{
//                       backgroundColor: selectedRecord.colour === "N/A" ? "#ccc" :
//                         selectedRecord.colour?.includes("NDA") ? "#4f46e5" :
//                           selectedRecord.colour?.includes("LB") ? "#10b981" :
//                             selectedRecord.colour?.includes("SD") ? "#f59e0b" : selectedRecord.color || "#ccc"
//                     }}
//                   />
//                   <span className="text-sm font-medium">{selectedRecord.colour || selectedRecord.color || "N/A"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>


//           {/* Completion Status Banner */}
//           {isComplete && !isReloadMode && (
//             <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//                 <div>
//                   <h3 className="font-semibold text-green-800">All Parts Scanned!</h3>
//                   <p className="text-green-700 text-sm">
//                     {scannedCount} parts have been scanned. Ready to submit.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Reload Mode - Ready to Update Banner */}
//           {isReloadMode && scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0) && (
//             <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <CheckCircle className="h-6 w-6 text-blue-600" />
//                 <div>
//                   <h3 className="font-semibold text-blue-800">Additional Parts Added!</h3>
//                   <p className="text-blue-700 text-sm">
//                     {scannedCount - (existingORTRecord?.ortLab?.scannedParts?.length || 0)} new part(s) added.
//                     Total: {scannedCount} parts. Ready to update.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Progress Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">Required</p>
//                   <p className="text-3xl font-bold">{requiredQuantity}</p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">Scanned</p>
//                   <p className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
//                     {scannedCount}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">Remaining</p>
//                   <p className={`text-3xl font-bold ${remainingCount === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
//                     {remainingCount}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Barcode Scanner Section */}
//           <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
//                 <Scan className="h-5 w-5" />
//                 Barcode Scanner
//               </h3>
//               <Button
//                 variant="outline"
//                 onClick={clearScannedData}
//                 disabled={!serialNumber && scannedParts.length === 0}
//               >
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Clear All
//               </Button>
//             </div>

//             <div className="space-y-4">
//               {/* Barcode Input */}
//               <div className="space-y-2">
//                 <Label htmlFor="barcodeInput" className="text-base font-medium">
//                   Scanner Input <span className="text-red-600">*</span>
//                 </Label>
//                 <Input
//                   ref={barcodeInputRef}
//                   id="barcodeInput"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={handleBarcodeInput}
//                   placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
//                   className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
//                   autoFocus
//                   disabled={isComplete}
//                 />
//                 {isComplete && (
//                   <p className="text-sm text-green-600 font-medium">
//                     All parts scanned. Ready to submit.
//                   </p>
//                 )}
//               </div>

//               {/* Test Barcode Buttons */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-gray-700">
//                   Test Barcodes (Click to simulate scan):
//                 </Label>
//                 <div className="flex flex-wrap gap-2">
//                   {STATIC_BARCODE_DATA.map((barcode, index) => (
//                     <Button
//                       key={`test-barcode-${barcode}-${index}`}
//                       variant="outline"
//                       size="sm"
//                       onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
//                       className="text-xs font-mono"
//                       disabled={isComplete}
//                     >
//                       {barcode.split(':')[0]}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               {/* Camera Scanner */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-gray-700">
//                   Camera Scanner:
//                 </Label>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={startScanner}
//                     disabled={showScanner || isComplete}
//                   >
//                     <Scan className="mr-2 h-4 w-4" />
//                     Start Camera Scanner
//                   </Button>
//                   {showScanner && (
//                     <Button
//                       variant="destructive"
//                       onClick={stopScanner}
//                     >
//                       Stop Scanner
//                     </Button>
//                   )}
//                 </div>
//               </div>

//               {/* Scanner Status */}
//               <div className="p-3 bg-white rounded border">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="font-medium text-gray-600">Serial Number:</span>
//                     <p className="font-mono text-blue-700">{serialNumber || "Not scanned"}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Status:</span>
//                     <p className={`font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
//                       {isComplete ? 'Complete' : `${scannedCount}/${requiredQuantity} parts scanned`}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Camera Preview */}
//           {showScanner && (
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
//               <Label className="text-sm font-medium text-gray-700 mb-2 block">
//                 Camera Preview:
//               </Label>
//               <div className="relative rounded-lg overflow-hidden bg-black">
//                 <video
//                   ref={videoRef}
//                   className="w-full h-auto"
//                   autoPlay
//                   playsInline
//                 />
//                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                   <div className="w-64 h-32 border-2 border-green-400 rounded-lg"></div>
//                 </div>
//               </div>
//             </div>
//           )}


//           {/* Additional Parts Section - Only show in reload mode */}
//           {isReloadMode && (
//             <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
//               <div className="mb-4">
//                 <h3 className="font-semibold text-lg text-green-800 flex items-center gap-2">
//                   <Barcode className="h-5 w-5" />
//                   Add Additional Parts (PART006 - PART010)
//                 </h3>
//                 <p className="text-sm text-green-700 mt-1">
//                   Click to select additional parts to add to existing record
//                 </p>
//               </div>

//               {!serialNumber && (
//                 <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
//                   <p className="text-sm text-yellow-800 font-medium">
//                     ⚠️ Please enter or scan a serial number first before selecting additional parts
//                   </p>
//                 </div>
//               )}

//               {/* Additional Parts Grid - 5 Buttons */}
//               <div className="grid grid-cols-5 gap-3 mb-4">
//                 {ADDITIONAL_PARTS.map((part) => {
//                   const isSelected = selectedAdditionalParts.includes(part.partNumber);
//                   const alreadyScanned = isPartAlreadyScanned(part.partNumber);

//                   return (
//                     <button
//                       key={part.id}
//                       onClick={() => !alreadyScanned && serialNumber && toggleAdditionalPart(part.partNumber)}
//                       disabled={alreadyScanned || !serialNumber}
//                       className={`
//               p-4 rounded-lg border-2 transition-all text-center
//               ${alreadyScanned
//                           ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
//                           : isSelected
//                             ? 'bg-green-500 border-green-600 shadow-lg transform scale-105 cursor-pointer'
//                             : 'bg-white border-green-200 hover:border-green-400 hover:shadow-md hover:scale-102 cursor-pointer'
//                         }
//               ${!serialNumber && !alreadyScanned ? 'opacity-50 cursor-not-allowed' : ''}
//             `}
//                     >
//                       <div className="flex justify-center mb-2">
//                         {alreadyScanned ? (
//                           <CheckCircle className="h-6 w-6 text-green-600" />
//                         ) : isSelected ? (
//                           <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
//                             <CheckCircle className="h-5 w-5 text-green-600" />
//                           </div>
//                         ) : (
//                           <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
//                         )}
//                       </div>
//                       <div className={`font-mono text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
//                         {part.partNumber}
//                       </div>
//                       <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
//                         {part.description}
//                       </div>
//                       {alreadyScanned && (
//                         <div className="text-xs text-green-600 font-medium mt-2">
//                           ✓ Added
//                         </div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Selection Summary and Add Button */}
//               {selectedAdditionalParts.length > 0 && (
//                 <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
//                   <div className="text-sm font-medium text-gray-700">
//                     Selected: <span className="text-green-700 font-bold">{selectedAdditionalParts.length}</span> part(s)
//                     <span className="text-gray-500 ml-2">
//                       ({selectedAdditionalParts.join(', ')})
//                     </span>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setSelectedAdditionalParts([])}
//                     >
//                       Clear Selection
//                     </Button>
//                     <Button
//                       onClick={addSelectedAdditionalParts}
//                       className="bg-green-600 hover:bg-green-700 text-white"
//                     >
//                       <CheckCircle className="mr-2 h-4 w-4" />
//                       Add {selectedAdditionalParts.length} Part(s)
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Quick Stats */}
//               <div className="mt-3 pt-3 border-t border-green-200">
//                 <div className="grid grid-cols-3 gap-4 text-center text-sm">
//                   <div>
//                     <div className="text-gray-500">Available</div>
//                     <div className="text-lg font-bold text-green-700">
//                       {ADDITIONAL_PARTS.length - scannedParts.filter(p =>
//                         ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
//                       ).length}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-500">Selected</div>
//                     <div className="text-lg font-bold text-blue-700">
//                       {selectedAdditionalParts.length}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-gray-500">Already Added</div>
//                     <div className="text-lg font-bold text-gray-700">
//                       {scannedParts.filter(p =>
//                         ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
//                       ).length}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Scanned Parts Table */}
//           {scannedParts.length > 0 && (
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="font-semibold text-lg text-gray-700">
//                   Scanned Parts ({scannedParts.length} {isReloadMode ? 'total' : `of ${requiredQuantity}`})
//                 </h3>
//                 {isReloadMode && existingORTRecord && (
//                   <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
//                     Original: {existingORTRecord.ortLab?.scannedParts?.length || 0} |
//                     New: {scannedParts.length - (existingORTRecord.ortLab?.scannedParts?.length || 0)}
//                   </div>
//                 )}
//               </div>
//               <div className="overflow-x-auto border rounded-lg">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-16">#</TableHead>
//                       <TableHead>Serial Number</TableHead>
//                       <TableHead>Part Number</TableHead>
//                       <TableHead>Description</TableHead>
//                       <TableHead>Scanned At</TableHead>
//                       {isReloadMode && <TableHead>Status</TableHead>}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {scannedParts.map((part, index) => {
//                       const additionalPartDetails = ADDITIONAL_PARTS.find(p => p.partNumber === part.partNumber);
//                       const isNewPart = isReloadMode && index >= (existingORTRecord?.ortLab?.scannedParts?.length || 0);
//                       const isAdditionalPart = additionalPartDetails !== undefined;

//                       return (
//                         <TableRow
//                           key={index}
//                           className={`${isNewPart ? 'bg-green-50' : ''} ${isAdditionalPart ? 'border-l-4 border-l-green-500' : ''}`}
//                         >
//                           <TableCell className="font-medium">{index + 1}</TableCell>
//                           <TableCell className="font-mono text-sm">{part.serialNumber}</TableCell>
//                           <TableCell className="font-semibold text-blue-700">{part.partNumber}</TableCell>
//                           <TableCell className="text-sm text-gray-600">
//                             {additionalPartDetails?.description || `Component ${part.partNumber.replace('PART', '')}`}
//                           </TableCell>
//                           <TableCell className="text-sm">
//                             {part.scannedAt.toLocaleTimeString([], {
//                               hour: '2-digit',
//                               minute: '2-digit',
//                               second: '2-digit'
//                             })}
//                           </TableCell>
//                           {isReloadMode && (
//                             <TableCell>
//                               {isNewPart ? (
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
//                                   ✓ New
//                                 </span>
//                               ) : (
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
//                                   Original
//                                 </span>
//                               )}
//                             </TableCell>
//                           )}
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           )}

//           {/* Progress Summary Cards
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">
//                     {isReloadMode ? "Original Parts" : "Required"}
//                   </p>
//                   <p className="text-3xl font-bold">
//                     {isReloadMode ? (existingORTRecord?.ortLab?.scannedParts?.length || 0) : requiredQuantity}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">
//                     {isReloadMode ? "Total Parts" : "Scanned"}
//                   </p>
//                   <p className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
//                     {scannedCount}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-center">
//                   <p className="text-sm text-gray-500">
//                     {isReloadMode ? "Parts Added" : "Remaining"}
//                   </p>
//                   <p className={`text-3xl font-bold ${isReloadMode
//                     ? 'text-green-600'
//                     : remainingCount === 0 ? 'text-green-600' : 'text-yellow-600'
//                     }`}>
//                     {isReloadMode
//                       ? Math.max(0, scannedCount - (existingORTRecord?.ortLab?.scannedParts?.length || 0))
//                       : remainingCount
//                     }
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </div> */}

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 pt-6 border-t">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/")}
//               className="px-6"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleORTSubmit}
//               disabled={!isComplete}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6"
//             >
//               <CheckCircle className="mr-2 h-4 w-4" />
//               {isReloadMode ? "Update ORT Lab" : "Submit ORT Lab"}
//             </Button>
//           </div>
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
 
interface ORTLabPageLocationState {
  record: TestRecord;
  reloadMode?: boolean;
  existingRecord?: any;
}
 
// Static barcode data for testing
const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005"
];
 
// Static additional parts for reload mode
const ADDITIONAL_PARTS = [
  { id: 6, partNumber: "PART006" },
  { id: 7, partNumber: "PART007" },
  { id: 8, partNumber: "PART008" },
  { id: 9, partNumber: "PART009" },
  { id: 10, partNumber: "PART010" },
];
 
interface ScannedPart {
  serialNumber: string;
  partNumber: string;
  scannedAt: Date;
}
 
const ORTLabPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as ORTLabPageLocationState | undefined;
  const selectedRecord = locationState?.record;
  const reloadMode = locationState?.reloadMode || false;
  const existingRecord = locationState?.existingRecord;
 
  const videoRef = useRef<HTMLVideoElement>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isReloadMode, setIsReloadMode] = useState(false);
  const [existingORTRecord, setExistingORTRecord] = useState<any>(null);
  const [selectedAdditionalParts, setSelectedAdditionalParts] = useState<string[]>([]);
 
  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);
 
  // Load existing scanned parts if in reload mode
  useEffect(() => {
    if (reloadMode && existingRecord) {
      setIsReloadMode(true);
      setExistingORTRecord(existingRecord);
 
      // Load existing scanned parts
      if (existingRecord.ortLab?.scannedParts) {
        setScannedParts(existingRecord.ortLab.scannedParts.map((part: any) => ({
          ...part,
          scannedAt: new Date(part.scannedAt)
        })));
        setSerialNumber(existingRecord.ortLab.serialNumber || "");
      }
 
      toast({
        title: "Reload Mode Active",
        description: `Loaded ${existingRecord.ortLab?.scannedParts?.length || 0} existing parts. You can now add more parts.`,
        duration: 4000,
      });
    }
  }, [reloadMode, existingRecord]);
 
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
 
      // Check if we've reached the required quantity (skip in reload mode)
      const requiredQuantity = selectedRecord?.quantity || 0;
      if (!isReloadMode && scannedParts.length >= requiredQuantity) {
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
 
      // Replace the parts addition section with:
      // Check how many more parts we can add
      const remainingCapacity = isReloadMode
        ? 999 // Allow unlimited additional parts in reload mode
        : requiredQuantity - scannedParts.length;
      const partsToAdd = newParts.slice(0, remainingCapacity);
 
      if (partsToAdd.length > 0) {
        setScannedParts(prev => [...prev, ...partsToAdd]);
 
        const messagePrefix = isReloadMode ? "Additional" : "";
        toast({
          title: `${messagePrefix} Parts Scanned`,
          description: `Added ${partsToAdd.length} part(s) to serial ${serial}${isReloadMode ? ' (Reload Mode)' : ''}`,
          duration: 2000,
        });
 
        // Check if we reached required quantity (only in normal mode)
        if (!isReloadMode && scannedParts.length + partsToAdd.length >= requiredQuantity) {
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
 
  // Toggle additional part selection
  const toggleAdditionalPart = (partNumber: string) => {
    setSelectedAdditionalParts(prev => {
      if (prev.includes(partNumber)) {
        return prev.filter(p => p !== partNumber);
      } else {
        return [...prev, partNumber];
      }
    });
  };
 
  // Check if a part is already scanned
  const isPartAlreadyScanned = (partNumber: string) => {
    return scannedParts.some(part => part.partNumber === partNumber);
  };
 
  // Add selected additional parts to scanned parts
  const addSelectedAdditionalParts = () => {
    if (selectedAdditionalParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Selected",
        description: "Please select at least one part to add.",
        duration: 2000,
      });
      return;
    }
 
    if (!serialNumber) {
      toast({
        variant: "destructive",
        title: "Serial Number Required",
        description: "Please scan or enter a serial number first.",
        duration: 2000,
      });
      return;
    }
 
    // Create new scanned parts from selection
    const newParts: ScannedPart[] = selectedAdditionalParts.map(partNumber => ({
      serialNumber: serialNumber,
      partNumber: partNumber,
      scannedAt: new Date()
    }));
 
    setScannedParts(prev => [...prev, ...newParts]);
 
    toast({
      title: "Additional Parts Added",
      description: `Successfully added ${newParts.length} additional part(s) to serial ${serialNumber}`,
      duration: 2000,
    });
 
    // Clear selection
    setSelectedAdditionalParts([]);
  };
 
  const handleORTSubmit = () => {
    if (!selectedRecord) return;
 
    const requiredQuantity = selectedRecord.quantity;
 
    // In reload mode, just need at least one part
    // In normal mode, need all required parts
    if (!isReloadMode && scannedParts.length < requiredQuantity) {
      toast({
        variant: "destructive",
        title: "Incomplete Scanning",
        description: `Only ${scannedParts.length} of ${requiredQuantity} parts scanned. Please scan all required parts.`,
        duration: 3000,
      });
      return;
    }
 
    if (isReloadMode && scannedParts.length === existingORTRecord?.ortLab?.scannedParts?.length) {
      toast({
        variant: "destructive",
        title: "No New Parts Added",
        description: "Please scan at least one new part before submitting.",
        duration: 3000,
      });
      return;
    }
 
    try {
      // Retrieve existing ORT records
      const existingORTData = localStorage.getItem("ortLabRecords");
      const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
 
      if (isReloadMode && existingORTRecord) {
        // UPDATE existing record
        const updatedORTData = {
          ...existingORTRecord,
          ortLab: {
            ...existingORTRecord.ortLab,
            serialNumber: serialNumber,
            scannedParts: scannedParts,
            totalParts: scannedParts.length,
            lastUpdatedAt: new Date().toISOString(),
            updateCount: (existingORTRecord.ortLab?.updateCount || 0) + 1
          }
        };
 
        // Find and update the existing record
        const updatedRecords = ortRecords.map((record: any) =>
          record.ortLabId === existingORTRecord.ortLabId ? updatedORTData : record
        );
 
        localStorage.setItem("ortLabRecords", JSON.stringify(updatedRecords));
 
        toast({
          title: "ORT Lab Updated!",
          description: `Record updated with ${scannedParts.length} total parts (added ${scannedParts.length - (existingORTRecord.ortLab?.scannedParts?.length || 0)} new parts).`,
          duration: 4000,
        });
 
        // Navigate back to QRT checklist
        navigate("/qrtchecklist", {
          state: {
            record: selectedRecord,
            ortData: updatedORTData
          }
        });
 
      } else {
        // CREATE new record (existing logic)
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
            submittedAt: new Date().toISOString(),
            updateCount: 0
          }
        };
 
        ortRecords.push(ortLabData);
        localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));
 
        toast({
          title: "ORT Lab Completed!",
          description: `${scannedParts.length} parts scanned and assigned successfully.`,
          duration: 4000,
        });
 
        navigate("/qrtchecklist", {
          state: {
            record: selectedRecord,
            ortData: ortLabData
          }
        });
      }
 
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
      <div className="mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No record selected. Please go back and select a record.</div>
            {/* <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }
 
  const requiredQuantity = selectedRecord.quantity || 0;
  const scannedCount = scannedParts.length;
  const remainingCount = isReloadMode ? 0 : Math.max(0, requiredQuantity - scannedCount);
  const isComplete = isReloadMode
    ? scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0)
    : scannedCount >= requiredQuantity;
 
  return (
    <div className="mx-auto p-6 ">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Test Checklist
      </Button>
 
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            ORT Lab - Part Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
 
          {/* Serial Number Input - Show in reload mode */}
          {isReloadMode && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-lg text-purple-800 mb-3 flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Serial Number
              </h3>
              <div className="space-y-2">
                <Label htmlFor="serialNumberInput" className="text-base font-medium">
                  Serial Number {!serialNumber && <span className="text-red-600">*</span>}
                </Label>
                <Input
                  id="serialNumberInput"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="Enter serial number (e.g., SN001)"
                  className="h-12 font-mono text-lg border-2 border-purple-300 focus:border-purple-500"
                />
                {serialNumber && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Serial Number: {serialNumber}
                  </p>
                )}
              </div>
            </div>
          )}
 
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
          {/* {isComplete && !isReloadMode && (
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
          )} */}
 
          {/* Reload Mode - Ready to Update Banner */}
          {isReloadMode && scannedCount > (existingORTRecord?.ortLab?.scannedParts?.length || 0) && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Additional Parts Added!</h3>
                  <p className="text-blue-700 text-sm">
                    {scannedCount - (existingORTRecord?.ortLab?.scannedParts?.length || 0)} new part(s) added.
                    Total: {scannedCount} parts. Ready to update.
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
          <div className="mb-6 p-4 rounded-lg">
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
                {/* {isComplete && (
                  <p className="text-sm text-green-600 font-medium">
                    All parts scanned. Ready to submit.
                  </p>
                )} */}
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
              {/* <div className="p-3 bg-white rounded border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Serial Number: {serialNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isComplete ? 'Complete' : `${scannedCount}/${requiredQuantity} parts scanned`}
                    </p>
                  </div>
                </div>
              </div> */}
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
 
 
          {/* Additional Parts Section - Only show in reload mode */}
          {isReloadMode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-green-800 flex items-center gap-2">
                  <Barcode className="h-5 w-5" />
                  Add Additional Parts (PART006 - PART010)
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Click to select additional parts to add to existing record
                </p>
              </div>
 
              {!serialNumber && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Please enter or scan a serial number first before selecting additional parts
                  </p>
                </div>
              )}
 
              {/* Additional Parts Grid - 5 Buttons */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {ADDITIONAL_PARTS.map((part) => {
                  const isSelected = selectedAdditionalParts.includes(part.partNumber);
                  const alreadyScanned = isPartAlreadyScanned(part.partNumber);
 
                  return (
                    <button
                      key={part.id}
                      onClick={() => !alreadyScanned && serialNumber && toggleAdditionalPart(part.partNumber)}
                      disabled={alreadyScanned || !serialNumber}
                      className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${alreadyScanned
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                          : isSelected
                            ? 'bg-green-500 border-green-600 shadow-lg transform scale-105 cursor-pointer'
                            : 'bg-white border-green-200 hover:border-green-400 hover:shadow-md hover:scale-102 cursor-pointer'
                        }
              ${!serialNumber && !alreadyScanned ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                      <div className="flex justify-center mb-2">
                        {alreadyScanned ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : isSelected ? (
                          <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className={`font-mono text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {part.partNumber}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                        {part.description}
                      </div>
                      {alreadyScanned && (
                        <div className="text-xs text-green-600 font-medium mt-2">
                          Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
 
              {/* Selection Summary and Add Button */}
              {selectedAdditionalParts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-gray-700">
                    Selected: <span className="text-green-700 font-bold">{selectedAdditionalParts.length}</span> part(s)
                    <span className="text-gray-500 ml-2">
                      ({selectedAdditionalParts.join(', ')})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAdditionalParts([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={addSelectedAdditionalParts}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Add {selectedAdditionalParts.length} Part(s)
                    </Button>
                  </div>
                </div>
              )}
 
              {/* Quick Stats */}
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-gray-500">Available</div>
                    <div className="text-lg font-bold text-green-700">
                      {ADDITIONAL_PARTS.length - scannedParts.filter(p =>
                        ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
                      ).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Selected</div>
                    <div className="text-lg font-bold text-blue-700">
                      {selectedAdditionalParts.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Already Added</div>
                    <div className="text-lg font-bold text-gray-700">
                      {scannedParts.filter(p =>
                        ADDITIONAL_PARTS.some(ap => ap.partNumber === p.partNumber)
                      ).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {/* Simple Scanned Parts Display */}
          {scannedParts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-700">
                  Scanned Parts ({scannedParts.length} {isReloadMode ? 'total' : `of ${requiredQuantity}`})
                </h3>
              </div>
 
              <div className="p-4 bg-white border rounded-lg">
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-500">Serial Number</div>
                  <div className="font-mono text-lg font-bold">{serialNumber}</div>
                </div>
 
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Parts</div>
                  <div className="font-mono p-3 bg-gray-50 rounded border text-gray-800">
                    {scannedParts.map(part => part.partNumber).join(', ')}
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
              disabled={!isComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isReloadMode ? "Update ORT Lab" : "Submit ORT Lab"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
 
export default ORTLabPage;
 