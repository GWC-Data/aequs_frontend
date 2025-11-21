// import React from "react";
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
// import { toast } from "@/components/ui/use-toast";
// import { flaskData } from "@/data/flaskData";
// import { ArrowLeft, X } from "lucide-react";

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

// const Stage2Page: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedRecord = location.state?.record as TestRecord | undefined;

//   const [filteredData, setFilteredData] = React.useState<typeof flaskData>([]);
//   const [availableTestNames, setAvailableTestNames] = React.useState<string[]>([]);
//   const [stage2Form, setStage2Form] = React.useState({
//     processStage: "",
//     type: "",
//     testName: "",
//     testCondition: "",
//     requiredQty: "",
//     equipment: ""
//   });

//   const [serialNumber, setSerialNumber] = React.useState("");
//   const [scannedPartNumbers, setScannedPartNumbers] = React.useState<string[]>([]);
//   const [selectedPartNumbers, setSelectedPartNumbers] = React.useState<string[]>([]);
//   const [barcodeInput, setBarcodeInput] = React.useState("");

//   React.useEffect(() => {
//     if (!selectedRecord) {
//       toast({
//         variant: "destructive",
//         title: "No Record Selected",
//         description: "Please select a record from the Live Test Checklist.",
//         duration: 3000,
//       });
//       navigate("/");
//     }
//   }, [selectedRecord, navigate]);

//   // Handle barcode scanner input
//   const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       processBarcodeData(barcodeInput);
//       setBarcodeInput("");
//     }
//   };

//   const processBarcodeData = (data: string) => {
//     if (!data.trim()) return;

//     // Parse barcode data - assuming format: SERIAL:partNumber1,partNumber2,partNumber3
//     // Adjust this parsing logic based on your actual barcode format
//     const parts = data.split(':');
    
//     if (parts.length >= 2) {
//       const serial = parts[0].trim();
//       const partNumbers = parts[1].split(',').map(p => p.trim()).filter(p => p);
      
//       setSerialNumber(serial);
//       setScannedPartNumbers(prev => {
//         const combined = [...prev, ...partNumbers];
//         return Array.from(new Set(combined)); // Remove duplicates
//       });
      
//       toast({
//         title: "✅ Barcode Scanned",
//         description: `Serial: ${serial}, Parts: ${partNumbers.join(', ')}`,
//         duration: 2000,
//       });
//     } else {
//       // If format doesn't match, treat entire input as serial number
//       setSerialNumber(data.trim());
//       toast({
//         title: "✅ Serial Number Scanned",
//         description: `Serial: ${data.trim()}`,
//         duration: 2000,
//       });
//     }
//   };

//   const handlePartNumberSelection = (partNumber: string) => {
//     setSelectedPartNumbers(prev => {
//       if (prev.includes(partNumber)) {
//         return prev.filter(p => p !== partNumber);
//       } else {
//         return [...prev, partNumber];
//       }
//     });
//   };

//   const removeSelectedPartNumber = (partNumber: string) => {
//     setSelectedPartNumbers(prev => prev.filter(p => p !== partNumber));
//   };

//   const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
//   const types = Array.from(new Set(flaskData.map(item => item.type)));

//   const handleStage2InputChange = (field: keyof typeof stage2Form, value: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     // Filter data when both processStage and type are selected
//     if (field === "processStage" || field === "type") {
//       const { processStage, type } = field === "processStage"
//         ? { processStage: value, type: stage2Form.type }
//         : { processStage: stage2Form.processStage, type: value };

//       if (processStage && type) {
//         const matchedData = flaskData.filter(
//           item => item.processStage === processStage && item.type === type
//         );

//         setFilteredData(matchedData);

//         // Extract unique test names for the dropdown
//         const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
//         setAvailableTestNames(testNames);

//         // Clear other fields when process stage or type changes
//         setStage2Form(prev => ({
//           ...prev,
//           testName: "",
//           testCondition: "",
//           requiredQty: "",
//           equipment: ""
//         }));
//       } else {
//         setFilteredData([]);
//         setAvailableTestNames([]);
//         setStage2Form(prev => ({
//           ...prev,
//           testName: "",
//           testCondition: "",
//           requiredQty: "",
//           equipment: ""
//         }));
//       }
//     }

//     // When test name is selected, auto-populate equipment
//     if (field === "testName" && value) {
//       const selectedTest = filteredData.find(item => item.testName === value);
//       if (selectedTest) {
//         setStage2Form(prev => ({
//           ...prev,
//           equipment: selectedTest.equipment
//         }));
//       }
//     }
//   };

//   const handleStage2Submit = () => {
//     if (!selectedRecord) return;

//     if (!stage2Form.testName || !stage2Form.requiredQty || !stage2Form.processStage || !stage2Form.type || !stage2Form.testCondition) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Form",
//         description: "Please fill in all required fields.",
//         duration: 2000,
//       });
//       return;
//     }

//     try {
//       const stage2Data = {
//         ...selectedRecord,
//         stage2: {
//           processStage: stage2Form.processStage,
//           type: stage2Form.type,
//           testName: stage2Form.testName,
//           testCondition: stage2Form.testCondition,
//           requiredQty: stage2Form.requiredQty,
//           equipment: stage2Form.equipment,
//           serialNumber: serialNumber,
//           partNumbers: selectedPartNumbers,
//           submittedAt: new Date().toISOString()
//         }
//       };

//       const existingStage2Data = localStorage.getItem("stage2Records");
//       const stage2Records = existingStage2Data ? JSON.parse(existingStage2Data) : [];

//       stage2Records.push(stage2Data);
//       localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

//       // Remove from testRecords
//       const existingTestRecords = localStorage.getItem("testRecords");
//       if (existingTestRecords) {
//         const testRecords = JSON.parse(existingTestRecords);
//         const updatedTestRecords = testRecords.filter(
//           (record: TestRecord) => record.id !== selectedRecord.id
//         );
//         localStorage.setItem("testRecords", JSON.stringify(updatedTestRecords));
//       }

//       console.log("Stage 2 submitted:", stage2Data);

//       toast({
//         title: "✅ Stage 2 Submitted",
//         description: `Stage 2 data has been saved successfully!`,
//         duration: 3000,
//       });

//       navigate("/");

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Submission Failed",
//         description: "There was an error saving the Stage 2 data. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error saving Stage 2 data:", error);
//     }
//   };

//   const isStage2SubmitEnabled = () => {
//     return stage2Form.processStage &&
//       stage2Form.type &&
//       stage2Form.testName &&
//       stage2Form.testCondition &&
//       stage2Form.requiredQty &&
//       stage2Form.equipment &&
//       serialNumber &&
//       selectedPartNumbers.length > 0;
//   };

//   if (!selectedRecord) {
//     return null;
//   }

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
//         <CardHeader className="bg-[#e0413a] text-white">
//           <CardTitle className="text-2xl">Stage 2 - Test Configuration</CardTitle>
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

//           {/* Stage 2 Form */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Barcode Scanner Input */}
//             <div className="space-y-2 md:col-span-2">
//               <Label htmlFor="barcodeInput" className="text-base">
//                 Scan Barcode <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="barcodeInput"
//                 value={barcodeInput}
//                 onChange={(e) => setBarcodeInput(e.target.value)}
//                 onKeyDown={handleBarcodeInput}
//                 placeholder="Focus here and scan barcode (Press Enter after scanning)"
//                 className="h-11 font-mono"
//                 autoFocus
//               />
//               <p className="text-xs text-gray-500">
//                 Expected format: SERIAL:partNumber1,partNumber2,partNumber3
//               </p>
//             </div>

//             {/* Serial Number Display */}
//             <div className="space-y-2">
//               <Label htmlFor="serialNumber" className="text-base">
//                 Serial Number <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="serialNumber"
//                 value={serialNumber}
//                 readOnly
//                 placeholder="Serial number will appear here after scanning"
//                 className="h-11 bg-gray-50 font-mono"
//               />
//             </div>

//             {/* Part Numbers Selection */}
//             <div className="space-y-2">
//               <Label htmlFor="partNumbers" className="text-base">
//                 Select Part Numbers <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 onValueChange={handlePartNumberSelection}
//                 disabled={scannedPartNumbers.length === 0}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select part numbers from scanned data" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {scannedPartNumbers.map((partNumber) => (
//                     <SelectItem key={partNumber} value={partNumber}>
//                       {partNumber}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {scannedPartNumbers.length === 0 && (
//                 <p className="text-xs text-gray-500">
//                   Part numbers will appear here after scanning barcode
//                 </p>
//               )}
//             </div>

//             {/* Selected Part Numbers Display */}
//             {selectedPartNumbers.length > 0 && (
//               <div className="space-y-2 md:col-span-2">
//                 <Label className="text-base">Selected Part Numbers</Label>
//                 <div className="flex flex-wrap gap-2">
//                   {selectedPartNumbers.map((partNumber) => (
//                     <div
//                       key={partNumber}
//                       className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                     >
//                       <span className="font-mono">{partNumber}</span>
//                       <button
//                         onClick={() => removeSelectedPartNumber(partNumber)}
//                         className="hover:bg-blue-200 rounded-full p-0.5"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Process Stage Dropdown */}
//             <div className="space-y-2">
//               <Label htmlFor="processStage" className="text-base">
//                 Process Stage <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.processStage}
//                 onValueChange={(value) => handleStage2InputChange('processStage', value)}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Process Stage" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {processStages.map((stage) => (
//                     <SelectItem key={stage} value={stage}>
//                       {stage}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Type Dropdown */}
//             <div className="space-y-2">
//               <Label htmlFor="type" className="text-base">
//                 Type <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.type}
//                 onValueChange={(value) => handleStage2InputChange('type', value)}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {types.map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Test Name Dropdown */}
//             <div className="space-y-2">
//               <Label htmlFor="testName" className="text-base">
//                 Test Name <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.testName}
//                 onValueChange={(value) => handleStage2InputChange('testName', value)}
//                 disabled={availableTestNames.length === 0}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Test Name" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableTestNames.map((name) => (
//                     <SelectItem key={name} value={name}>
//                       {name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Test Condition */}
//             <div className="space-y-2">
//               <Label htmlFor="testCondition" className="text-base">
//                 Test Condition <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="testCondition"
//                 value={stage2Form.testCondition}
//                 onChange={(e) => handleStage2InputChange('testCondition', e.target.value)}
//                 placeholder="Enter test condition"
//                 className="h-11"
//               />
//             </div>

//             {/* Required Quantity */}
//             <div className="space-y-2">
//               <Label htmlFor="requiredQty" className="text-base">
//                 Required Quantity <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="requiredQty"
//                 value={stage2Form.requiredQty}
//                 onChange={(e) => handleStage2InputChange('requiredQty', e.target.value)}
//                 placeholder="Enter required quantity"
//                 className="h-11"
//               />
//             </div>

//             {/* Equipment */}
//             <div className="space-y-2">
//               <Label htmlFor="equipment" className="text-base">
//                 Equipment
//               </Label>
//               <Input
//                 id="equipment"
//                 value={stage2Form.equipment}
//                 onChange={(e) => handleStage2InputChange('equipment', e.target.value)}
//                 placeholder="Equipment (auto-filled)"
//                 disabled={true}
//                 className="h-11 bg-gray-50"
//               />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/")}
//               className="px-6"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleStage2Submit}
//               disabled={!isStage2SubmitEnabled()}
//               className="bg-[#e0413a] text-white hover:bg-[#c53730] px-6"
//             >
//               Submit Stage 2
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Stage2Page;



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
// import { flaskData } from "@/data/flaskData";
// import { ArrowLeft, X, Scan, Trash2, CheckCircle } from "lucide-react";

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

// interface UsedParts {
//   [serialNumber: string]: string[];
// }

// const Stage2Page: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedRecord = location.state?.record as TestRecord | undefined;

//   const [filteredData, setFilteredData] = useState<typeof flaskData>([]);
//   const [availableTestNames, setAvailableTestNames] = useState<string[]>([]);
//   const [stage2Form, setStage2Form] = useState({
//     processStage: "",
//     type: "",
//     testName: "",
//     testCondition: "",
//     requiredQty: "",
//     equipment: "",
//     startTime: "",
//     endTime: "",
//     remark: ""
//   });

//   const [serialNumber, setSerialNumber] = useState("");
//   const [scannedPartNumbers, setScannedPartNumbers] = useState<string[]>([]);
//   const [selectedPartNumbers, setSelectedPartNumbers] = useState<string[]>([]);
//   const [usedParts, setUsedParts] = useState<UsedParts>({});
  
//   // Real-time barcode scanner state
//   const [barcodeBuffer, setBarcodeBuffer] = useState("");
//   const [isScanning, setIsScanning] = useState(false);
//   const [lastScanTime, setLastScanTime] = useState(0);
//   const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const barcodeInputRef = useRef<HTMLInputElement>(null);

//   // Constants for barcode scanner detection
//   const SCAN_TIMEOUT = 100; // ms - time window to detect rapid keypresses from scanner
//   const MIN_BARCODE_LENGTH = 3; // Minimum characters for a valid barcode
//   const SCAN_COMPLETE_DELAY = 50; // ms - delay after last character to process barcode

//   // Load used parts from localStorage
//   useEffect(() => {
//     const loadUsedParts = () => {
//       try {
//         const existingStage2Data = localStorage.getItem("stage2Records");
//         if (existingStage2Data) {
//           const stage2Records = JSON.parse(existingStage2Data);
//           const usedPartsMap: UsedParts = {};
          
//           stage2Records.forEach((record: any) => {
//             if (record.stage2?.serialNumber && record.stage2?.partNumbers) {
//               const serial = record.stage2.serialNumber;
//               const parts = record.stage2.partNumbers;
              
//               if (!usedPartsMap[serial]) {
//                 usedPartsMap[serial] = [];
//               }
//               usedPartsMap[serial] = [...new Set([...usedPartsMap[serial], ...parts])];
//             }
//           });
          
//           setUsedParts(usedPartsMap);
//         }
//       } catch (error) {
//         console.error("Error loading used parts:", error);
//       }
//     };

//     loadUsedParts();
//   }, []);

//   // Real-time barcode scanner listener
//   useEffect(() => {
//     let buffer = "";
//     let lastKeyTime = Date.now();

//     const handleKeyPress = (e: KeyboardEvent) => {
//       const currentTime = Date.now();
//       const timeDiff = currentTime - lastKeyTime;

//       // If input is focused and it's a regular input, let it handle normally
//       const activeElement = document.activeElement;
//       if (activeElement && 
//           (activeElement.tagName === 'INPUT' || 
//            activeElement.tagName === 'TEXTAREA' || 
//            activeElement.tagName === 'SELECT') &&
//           activeElement.id !== 'barcode-scanner-input') {
//         return;
//       }

//       // Detect Enter key (scanner typically sends Enter at the end)
//       if (e.key === 'Enter') {
//         e.preventDefault();
        
//         if (buffer.length >= MIN_BARCODE_LENGTH) {
//           console.log("📦 Barcode scanned:", buffer);
//           setIsScanning(true);
//           processBarcodeData(buffer.trim());
          
//           // Show scanning indicator briefly
//           setTimeout(() => setIsScanning(false), 500);
//         }
        
//         buffer = "";
//         lastKeyTime = currentTime;
//         return;
//       }

//       // Detect rapid keypresses (typical of barcode scanners)
//       // Scanners type much faster than humans (typically < 50ms between chars)
//       if (timeDiff > SCAN_TIMEOUT) {
//         // Reset buffer if too much time passed (human typing)
//         buffer = "";
//       }

//       // Only capture alphanumeric and common barcode characters
//       if (/^[a-zA-Z0-9:,\-_]$/.test(e.key)) {
//         e.preventDefault();
//         buffer += e.key;
//         lastKeyTime = currentTime;
        
//         // Auto-focus the barcode input to show what's being scanned
//         if (barcodeInputRef.current) {
//           barcodeInputRef.current.value = buffer;
//         }
//       }
//     };

//     // Add global keypress listener
//     window.addEventListener('keypress', handleKeyPress);
    
//     // Cleanup
//     return () => {
//       window.removeEventListener('keypress', handleKeyPress);
//     };
//   }, []);

//   // Get available (unused) part numbers for current serial
//   const getAvailablePartNumbers = (allParts: string[], serial: string) => {
//     const usedPartsForSerial = usedParts[serial] || [];
//     return allParts.filter(part => !usedPartsForSerial.includes(part));
//   };

//   const unselectedPartNumbers = scannedPartNumbers.filter(
//     partNumber => !selectedPartNumbers.includes(partNumber)
//   );

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

//     console.log("🔍 Processing barcode:", data);

//     try {
//       let serial = "";
//       let partNumbers: string[] = [];

//       // Format 1: SERIAL:PART1,PART2,PART3
//       if (data.includes(':') && data.includes(',')) {
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
//             : parsedData.part ? [parsedData.part]
//             : [];
//         } catch (jsonError) {
//           console.error("JSON parse error:", jsonError);
//           serial = data.trim();
//         }
//       }
//       // Format 4: Pipe-separated (SERIAL|PART1|PART2|PART3)
//       else if (data.includes('|')) {
//         const parts = data.split('|').map(p => p.trim());
//         if (parts.length > 0) {
//           serial = parts[0];
//           partNumbers = parts.slice(1);
//         }
//       }
//       // Format 5: Semicolon-separated (SERIAL;PART1;PART2;PART3)
//       else if (data.includes(';')) {
//         const parts = data.split(';').map(p => p.trim());
//         if (parts.length > 0) {
//           serial = parts[0];
//           partNumbers = parts.slice(1);
//         }
//       }
//       // Format 6: Tab-separated (from some enterprise scanners)
//       else if (data.includes('\t')) {
//         const parts = data.split('\t').map(p => p.trim());
//         if (parts.length > 0) {
//           serial = parts[0];
//           partNumbers = parts.slice(1).filter(p => p.length > 0);
//         }
//       }
//       // Format 7: Simple serial number only
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
//             description: `Serial: ${serial}, ${availableParts.length} available part(s) auto-selected`,
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

//       // Clear the input field
//       if (barcodeInputRef.current) {
//         barcodeInputRef.current.value = "";
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

//   const handleManualSerialInput = (value: string) => {
//     setSerialNumber(value);
//     setScannedPartNumbers([]);
//     setSelectedPartNumbers([]);
//   };

//   const handlePartNumberSelection = (partNumber: string) => {
//     setSelectedPartNumbers(prev => {
//       if (prev.includes(partNumber)) {
//         return prev.filter(p => p !== partNumber);
//       } else {
//         return [...prev, partNumber];
//       }
//     });
//   };

//   const removeSelectedPartNumber = (partNumber: string) => {
//     setSelectedPartNumbers(prev => prev.filter(p => p !== partNumber));
//   };

//   const clearScannedData = () => {
//     setSerialNumber("");
//     setScannedPartNumbers([]);
//     setSelectedPartNumbers([]);
    
//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.value = "";
//     }
    
//     toast({
//       title: "Data Cleared",
//       description: "All scanned data has been cleared",
//       duration: 2000,
//     });
//   };

//   const selectAllUnselectedParts = () => {
//     setSelectedPartNumbers(prev => [...prev, ...unselectedPartNumbers]);
//   };

//   const deselectAllPartNumbers = () => {
//     setSelectedPartNumbers([]);
//   };

//   // Form handling
//   const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
//   const types = Array.from(new Set(flaskData.map(item => item.type)));

//   const handleStage2InputChange = (field: keyof typeof stage2Form, value: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     if (field === "processStage" || field === "type") {
//       const { processStage, type } = field === "processStage"
//         ? { processStage: value, type: stage2Form.type }
//         : { processStage: stage2Form.processStage, type: value };

//       if (processStage && type) {
//         const matchedData = flaskData.filter(
//           item => item.processStage === processStage && item.type === type
//         );

//         setFilteredData(matchedData);
//         const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
//         setAvailableTestNames(testNames);

//         setStage2Form(prev => ({
//           ...prev,
//           testName: "",
//           testCondition: "",
//           requiredQty: "",
//           equipment: ""
//         }));
//       } else {
//         setFilteredData([]);
//         setAvailableTestNames([]);
//         setStage2Form(prev => ({
//           ...prev,
//           testName: "",
//           testCondition: "",
//           requiredQty: "",
//           equipment: ""
//         }));
//       }
//     }

//     if (field === "testName" && value) {
//       const selectedTest = filteredData.find(item => item.testName === value);
//       if (selectedTest) {
//         setStage2Form(prev => ({
//           ...prev,
//           equipment: selectedTest.equipment
//         }));
//       }
//     }
//   };

//   const handleStage2Submit = () => {
//     if (!selectedRecord) return;

//     if (!stage2Form.testName || !stage2Form.requiredQty || !stage2Form.processStage || !stage2Form.type || !stage2Form.testCondition) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Form",
//         description: "Please fill in all required fields.",
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
//         title: "No Part Numbers Selected",
//         description: "Please select at least one part number.",
//         duration: 2000,
//       });
//       return;
//     }

//     try {
//       const stage2Data = {
//         ...selectedRecord,
//         stage2: {
//           processStage: stage2Form.processStage,
//           type: stage2Form.type,
//           testName: stage2Form.testName,
//           testCondition: stage2Form.testCondition,
//           requiredQty: stage2Form.requiredQty,
//           equipment: stage2Form.equipment,
//           serialNumber: serialNumber,
//           partNumbers: selectedPartNumbers,
//           scannedPartNumbers: scannedPartNumbers,
//           startTime: stage2Form.startTime,
//           endTime: stage2Form.endTime,
//           remark: stage2Form.remark,
//           submittedAt: new Date().toISOString()
//         }
//       };

//       const existingStage2Data = localStorage.getItem("stage2Records");
//       const stage2Records = existingStage2Data ? JSON.parse(existingStage2Data) : [];

//       stage2Records.push(stage2Data);
//       localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

//       setUsedParts(prev => {
//         const newUsedParts = { ...prev };
//         if (!newUsedParts[serialNumber]) {
//           newUsedParts[serialNumber] = [];
//         }
//         newUsedParts[serialNumber] = [...new Set([...newUsedParts[serialNumber], ...selectedPartNumbers])];
//         return newUsedParts;
//       });

//       const existingTestRecords = localStorage.getItem("testRecords");
//       if (existingTestRecords) {
//         const testRecords = JSON.parse(existingTestRecords);
//         const updatedTestRecords = testRecords.filter(
//           (record: TestRecord) => record.id !== selectedRecord.id
//         );
//         localStorage.setItem("testRecords", JSON.stringify(updatedTestRecords));
//       }

//       toast({
//         title: "✅ Stage 2 Submitted",
//         description: `Stage 2 data has been saved successfully!`,
//         duration: 3000,
//       });

//       navigate("/");

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Submission Failed",
//         description: "There was an error saving the Stage 2 data. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error saving Stage 2 data:", error);
//     }
//   };

//   const isStage2SubmitEnabled = () => {
//     return stage2Form.processStage &&
//       stage2Form.type &&
//       stage2Form.testName &&
//       stage2Form.testCondition &&
//       stage2Form.requiredQty &&
//       stage2Form.equipment &&
//       serialNumber &&
//       selectedPartNumbers.length > 0;
//   };

//   if (!selectedRecord) {
//     return null;
//   }

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
//         <CardHeader className="bg-[#e0413a] text-white">
//           <CardTitle className="text-2xl flex items-center gap-2">
//             Stage 2 - Test Configuration
//             {isScanning && (
//               <span className="flex items-center gap-2 text-sm bg-white text-green-600 px-3 py-1 rounded-full animate-pulse">
//                 <Scan className="h-4 w-4" />
//                 Scanning...
//               </span>
//             )}
//           </CardTitle>
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

//           {/* Real-Time Barcode Scanner Section */}
//           <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-semibold text-lg text-green-800 flex items-center gap-2">
//                 <Scan className="h-5 w-5 animate-pulse" />
//                 Real-Time Barcode Scanner
//                 <span className="text-xs font-normal text-green-600 bg-white px-2 py-1 rounded">
//                   Ready to Scan
//                 </span>
//               </h3>
//               <Button
//                 variant="outline"
//                 onClick={clearScannedData}
//                 disabled={!serialNumber && scannedPartNumbers.length === 0}
//               >
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Clear All
//               </Button>
//             </div>

//             <div className="space-y-4">
//               {/* Hidden input for barcode capture */}
//               <div className="space-y-2">
//                 <Label className="text-base font-medium text-green-800">
//                   📱 Scan Your Barcode Now
//                 </Label>
//                 <Input
//                   ref={barcodeInputRef}
//                   id="barcode-scanner-input"
//                   placeholder="Barcode will appear here when scanned..."
//                   className="h-12 font-mono text-lg border-2 border-green-400 focus:border-green-600 bg-white"
//                   readOnly
//                 />
//                 <div className="flex items-center gap-2 text-sm text-green-700">
//                   <CheckCircle className="h-4 w-4" />
//                   <span>
//                     <strong>Instructions:</strong> Simply scan your barcode with the physical scanner. 
//                     The system will automatically detect and process it.
//                   </span>
//                 </div>
//               </div>

//               {/* Supported Formats */}
//               <div className="p-3 bg-white rounded border border-green-200">
//                 <p className="text-sm font-medium text-gray-700 mb-2">✅ Supported Barcode Formats:</p>
//                 <ul className="text-xs text-gray-600 space-y-1 ml-4">
//                   <li>• <code className="bg-gray-100 px-1 rounded">SERIAL:PART1,PART2,PART3</code> (Colon + Comma separated)</li>
//                   <li>• <code className="bg-gray-100 px-1 rounded">SERIAL|PART1|PART2</code> (Pipe separated)</li>
//                   <li>• <code className="bg-gray-100 px-1 rounded">SERIAL;PART1;PART2</code> (Semicolon separated)</li>
//                   <li>• <code className="bg-gray-100 px-1 rounded">SERIALNUMBER</code> (Serial only)</li>
//                   <li>• <code className="bg-gray-100 px-1 rounded">{`{"serial":"SN001","parts":["P1","P2"]}`}</code> (JSON format)</li>
//                 </ul>
//               </div>

//               {/* Scanner Status */}
//               <div className="p-3 bg-white rounded border border-green-200">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="font-medium text-gray-600">Serial Number:</span>
//                     <p className="font-mono text-lg text-green-700 font-bold">
//                       {serialNumber || "Waiting for scan..."}
//                     </p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-600">Parts Status:</span>
//                     <p className="text-green-700">
//                       <span className="font-bold">{selectedPartNumbers.length}</span> selected / 
//                       <span className="font-bold"> {scannedPartNumbers.length}</span> available
//                       {serialNumber && usedParts[serialNumber] && usedParts[serialNumber].length > 0 && (
//                         <span className="text-orange-600 block">
//                           ({usedParts[serialNumber].length} already used in other records)
//                         </span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Stage 2 Form */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Serial Number Display */}
//             <div className="space-y-2">
//               <Label htmlFor="serialNumber" className="text-base">
//                 Serial Number <span className="text-red-600">*</span>
//               </Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="serialNumber"
//                   value={serialNumber}
//                   onChange={(e) => handleManualSerialInput(e.target.value)}
//                   placeholder="Auto-filled from scanner or enter manually"
//                   className="h-11 font-mono flex-1"
//                 />
//                 {serialNumber && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setSerialNumber("")}
//                     className="h-11"
//                   >
//                     <X size={16} />
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {/* Part Numbers Selection */}
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <Label htmlFor="partNumbers" className="text-base">
//                   Select Part Numbers <span className="text-red-600">*</span>
//                 </Label>
//                 {unselectedPartNumbers.length > 0 && (
//                   <div className="flex gap-1">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={selectAllUnselectedParts}
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={deselectAllPartNumbers}
//                       disabled={selectedPartNumbers.length === 0}
//                     >
//                       Clear
//                     </Button>
//                   </div>
//                 )}
//               </div>
//               <Select
//                 onValueChange={handlePartNumberSelection}
//                 disabled={unselectedPartNumbers.length === 0}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder={
//                     !serialNumber
//                       ? "Scan serial number first"
//                       : scannedPartNumbers.length === 0 
//                       ? "No available parts for this serial"
//                       : unselectedPartNumbers.length === 0
//                       ? "All available parts selected"
//                       : `Select from ${unselectedPartNumbers.length} available part(s)`
//                   } />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {unselectedPartNumbers.map((partNumber) => (
//                     <SelectItem key={partNumber} value={partNumber}>
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono">{partNumber}</span>
//                         <span className="text-xs text-green-600">(available)</span>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Selected Part Numbers Display */}
//             {selectedPartNumbers.length > 0 && (
//               <div className="space-y-2 md:col-span-2">
//                 <Label className="text-base flex items-center gap-2">
//                   Selected Part Numbers
//                   <span className="text-sm font-normal text-gray-500">
//                     ({selectedPartNumbers.length} selected)
//                   </span>
//                 </Label>
//                 <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border min-h-[3rem]">
//                   {selectedPartNumbers.map((partNumber) => (
//                     <div
//                       key={partNumber}
//                       className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium"
//                     >
//                       <span className="font-mono">{partNumber}</span>
//                       <button
//                         onClick={() => removeSelectedPartNumber(partNumber)}
//                         className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
//                         title="Remove part number"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Process Stage */}
//             <div className="space-y-2">
//               <Label htmlFor="processStage" className="text-base">
//                 Process Stage <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.processStage}
//                 onValueChange={(value) => handleStage2InputChange('processStage', value)}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Process Stage" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {processStages.map((stage) => (
//                     <SelectItem key={stage} value={stage}>
//                       {stage}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Type */}
//             <div className="space-y-2">
//               <Label htmlFor="type" className="text-base">
//                 Type <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.type}
//                 onValueChange={(value) => handleStage2InputChange('type', value)}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {types.map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Test Name */}
//             <div className="space-y-2">
//               <Label htmlFor="testName" className="text-base">
//                 Test Name <span className="text-red-600">*</span>
//               </Label>
//               <Select
//                 value={stage2Form.testName}
//                 onValueChange={(value) => handleStage2InputChange('testName', value)}
//                 disabled={availableTestNames.length === 0}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder="Select Test Name" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableTestNames.map((name) => (
//                     <SelectItem key={name} value={name}>
//                       {name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Test Condition */}
//             <div className="space-y-2">
//               <Label htmlFor="testCondition" className="text-base">
//                 Test Condition <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="testCondition"
//                 value={stage2Form.testCondition}
//                 onChange={(e) => handleStage2InputChange('testCondition', e.target.value)}
//                 placeholder="Enter test condition"
//                 className="h-11"
//               />
//             </div>

//             {/* Required Quantity */}
//             <div className="space-y-2">
//               <Label htmlFor="requiredQty" className="text-base">
//                 Required Quantity <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="requiredQty"
//                 value={stage2Form.requiredQty}
//                 onChange={(e) => handleStage2InputChange('requiredQty', e.target.value)}
//                 placeholder="Enter required quantity"
//                 className="h-11"
//               />
//             </div>

//             {/* Equipment */}
//             <div className="space-y-2">
//               <Label htmlFor="equipment" className="text-base">
//                 Equipment
//               </Label>
//               <Input
//                 id="equipment"
//                 value={stage2Form.equipment}
//                 onChange={(e) => handleStage2InputChange('equipment', e.target.value)}
//                 placeholder="Equipment (auto-filled)"
//                 disabled={true}
//                 className="h-11 bg-gray-50"
//               />
//             </div>

//             {/* Start Time */}
//             <div className="space-y-2">
//               <Label htmlFor="startTime" className="text-base">
//                 Start Time
//               </Label>
//               <Input
//                 id="startTime"
//                 type="time"
//                 value={stage2Form.startTime}
//                 onChange={(e) => handleStage2InputChange('startTime', e.target.value)}
//                 className="h-11"
//               />
//             </div>

//             {/* End Time */}
//             <div className="space-y-2">
//               <Label htmlFor="endTime" className="text-base">
//                 End Time
//               </Label>
//               <Input
//                 id="endTime"
//                 type="time"
//                 value={stage2Form.endTime}
//                 onChange={(e) => handleStage2InputChange('endTime', e.target.value)}
//                 className="h-11"
//               />
//             </div>

//             {/* Remark - Full Width */}
//             <div className="space-y-2 md:col-span-2">
//               <Label htmlFor="remark" className="text-base">
//                 Remarks
//               </Label>
//               <Textarea
//                 id="remark"
//                 value={stage2Form.remark}
//                 onChange={(e) => handleStage2InputChange('remark', e.target.value)}
//                 placeholder="Enter any remarks or comments..."
//                 className="min-h-[100px] resize-vertical"
//               />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/")}
//               className="px-6"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleStage2Submit}
//               disabled={!isStage2SubmitEnabled()}
//               className="bg-[#e0413a] text-white hover:bg-[#c53730] px-6 disabled:opacity-50"
//             >
//               Submit Stage 2
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Stage2Page;


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
import { flaskData } from "@/data/flaskData";
import { ArrowLeft, X, Scan, Trash2 } from "lucide-react";

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
  "SN001:PART001,PART002,PART003,PART004,PART005",
  "SN002:PART006,PART007,PART008",
  "SN003:PART009,PART010",
  "SN004:PART011,PART012,PART013,PART014",
  "SN005:PART015",
  "SN006:PART016,PART017,PART018,PART019,PART020",
  "SN007:PART021,PART022",
  "SN008:PART023,PART024,PART025",
  "SN009:PART026,PART027,PART028,PART029",
  "SN010:PART030"
];

// Interface for used parts tracking
interface UsedParts {
  [serialNumber: string]: string[]; // serialNumber -> array of used part numbers
}

const Stage2Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;

  const [filteredData, setFilteredData] = useState<typeof flaskData>([]);
  const [availableTestNames, setAvailableTestNames] = useState<string[]>([]);
  const [stage2Form, setStage2Form] = useState({
    processStage: "",
    type: "",
    testName: "",
    testCondition: "",
    requiredQty: "",
    equipment: "",
    startTime: "",
    endTime: "",
    remark: ""
  });

  const [serialNumber, setSerialNumber] = useState("");
  const [scannedPartNumbers, setScannedPartNumbers] = useState<string[]>([]);
  const [selectedPartNumbers, setSelectedPartNumbers] = useState<string[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [usedParts, setUsedParts] = useState<UsedParts>({});
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Load used parts from localStorage on component mount
  useEffect(() => {
    const loadUsedParts = () => {
      try {
        const existingStage2Data = localStorage.getItem("stage2Records");
        if (existingStage2Data) {
          const stage2Records = JSON.parse(existingStage2Data);
          const usedPartsMap: UsedParts = {};
          
          stage2Records.forEach((record: any) => {
            if (record.stage2 && record.stage2.serialNumber && record.stage2.partNumbers) {
              const serial = record.stage2.serialNumber;
              const parts = record.stage2.partNumbers;
              
              if (!usedPartsMap[serial]) {
                usedPartsMap[serial] = [];
              }
              usedPartsMap[serial] = [...new Set([...usedPartsMap[serial], ...parts])];
            }
          });
          
          setUsedParts(usedPartsMap);
        }
      } catch (error) {
        console.error("Error loading used parts:", error);
      }
    };

    loadUsedParts();
  }, []);

  // Get available (unused) part numbers for current serial
  const getAvailablePartNumbers = (allParts: string[], serial: string) => {
    const usedPartsForSerial = usedParts[serial] || [];
    return allParts.filter(part => !usedPartsForSerial.includes(part));
  };

  // Get unselected part numbers from currently scanned parts
  const unselectedPartNumbers = scannedPartNumbers.filter(
    partNumber => !selectedPartNumbers.includes(partNumber)
  );

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

  // Process barcode data from physical scanner
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

    console.log("Raw barcode data:", data);

    try {
      let serial = "";
      let partNumbers: string[] = [];

      // Check if input is a static barcode from our test data
      const staticBarcode = STATIC_BARCODE_DATA.find(barcode => 
        barcode.split(':')[0] === data.toUpperCase()
      );

      if (staticBarcode) {
        // Use the static barcode data
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

      // Set serial number
      setSerialNumber(serial);
      
      if (partNumbers.length > 0) {
        // Get available (unused) parts for this serial
        const availableParts = getAvailablePartNumbers(partNumbers, serial);
        
        setScannedPartNumbers(availableParts);
        
        if (availableParts.length > 0) {
          // Auto-select all available parts
          setSelectedPartNumbers(availableParts);
          toast({
            title: "✅ Barcode Scanned Successfully",
            description: `Serial: ${serial}, ${availableParts.length} available part(s) auto-selected`,
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
  const handleManualSerialInput = (value: string) => {
    setSerialNumber(value);
    // Clear parts when manually changing serial
    setScannedPartNumbers([]);
    setSelectedPartNumbers([]);
  };

  const handlePartNumberSelection = (partNumber: string) => {
    setSelectedPartNumbers(prev => {
      if (prev.includes(partNumber)) {
        return prev.filter(p => p !== partNumber);
      } else {
        return [...prev, partNumber];
      }
    });
  };

  const removeSelectedPartNumber = (partNumber: string) => {
    setSelectedPartNumbers(prev => prev.filter(p => p !== partNumber));
  };

  // Clear all scanned data
  const clearScannedData = () => {
    setSerialNumber("");
    setScannedPartNumbers([]);
    setSelectedPartNumbers([]);
    setBarcodeInput("");
    
    // Refocus on barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    
    toast({
      title: "Data Cleared",
      description: "All scanned data has been cleared",
      duration: 2000,
    });
  };

  // Quick select all part numbers
  const selectAllPartNumbers = () => {
    setSelectedPartNumbers([...scannedPartNumbers]);
  };

  // Quick deselect all part numbers
  const deselectAllPartNumbers = () => {
    setSelectedPartNumbers([]);
  };

  // Select all unselected parts
  const selectAllUnselectedParts = () => {
    setSelectedPartNumbers(prev => [...prev, ...unselectedPartNumbers]);
  };

  // Test with static barcode data
  const testWithStaticBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
    // Simulate the scan by processing immediately
    processBarcodeData(barcode);
    setBarcodeInput("");
  };

  // Form handling functions
  const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
  const types = Array.from(new Set(flaskData.map(item => item.type)));

  const handleStage2InputChange = (field: keyof typeof stage2Form, value: string) => {
    setStage2Form(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "processStage" || field === "type") {
      const { processStage, type } = field === "processStage"
        ? { processStage: value, type: stage2Form.type }
        : { processStage: stage2Form.processStage, type: value };

      if (processStage && type) {
        const matchedData = flaskData.filter(
          item => item.processStage === processStage && item.type === type
        );

        setFilteredData(matchedData);
        const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
        setAvailableTestNames(testNames);

        setStage2Form(prev => ({
          ...prev,
          testName: "",
          testCondition: "",
          requiredQty: "",
          equipment: ""
        }));
      } else {
        setFilteredData([]);
        setAvailableTestNames([]);
        setStage2Form(prev => ({
          ...prev,
          testName: "",
          testCondition: "",
          requiredQty: "",
          equipment: ""
        }));
      }
    }

    if (field === "testName" && value) {
      const selectedTest = filteredData.find(item => item.testName === value);
      if (selectedTest) {
        setStage2Form(prev => ({
          ...prev,
          equipment: selectedTest.equipment
        }));
      }
    }
  };

  const handleStage2Submit = () => {
    if (!selectedRecord) return;

    if (!stage2Form.testName || !stage2Form.requiredQty || !stage2Form.processStage || !stage2Form.type || !stage2Form.testCondition) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
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
        title: "No Part Numbers Selected",
        description: "Please select at least one part number.",
        duration: 2000,
      });
      return;
    }

    try {
      const stage2Data = {
        ...selectedRecord,
        stage2: {
          processStage: stage2Form.processStage,
          type: stage2Form.type,
          testName: stage2Form.testName,
          testCondition: stage2Form.testCondition,
          requiredQty: stage2Form.requiredQty,
          equipment: stage2Form.equipment,
          serialNumber: serialNumber,
          partNumbers: selectedPartNumbers,
          scannedPartNumbers: scannedPartNumbers,
          startTime: stage2Form.startTime,
          endTime: stage2Form.endTime,
          remark: stage2Form.remark,
          submittedAt: new Date().toISOString()
        }
      };

      const existingStage2Data = localStorage.getItem("stage2Records");
      const stage2Records = existingStage2Data ? JSON.parse(existingStage2Data) : [];

      stage2Records.push(stage2Data);
      localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

      // Update used parts in state
      setUsedParts(prev => {
        const newUsedParts = { ...prev };
        if (!newUsedParts[serialNumber]) {
          newUsedParts[serialNumber] = [];
        }
        newUsedParts[serialNumber] = [...new Set([...newUsedParts[serialNumber], ...selectedPartNumbers])];
        return newUsedParts;
      });

      // Remove from testRecords
      const existingTestRecords = localStorage.getItem("testRecords");
      if (existingTestRecords) {
        const testRecords = JSON.parse(existingTestRecords);
        const updatedTestRecords = testRecords.filter(
          (record: TestRecord) => record.id !== selectedRecord.id
        );
        localStorage.setItem("testRecords", JSON.stringify(updatedTestRecords));
      }

      console.log("Stage 2 submitted:", stage2Data);

      toast({
        title: "Stage 2 Submitted",
        description: `Stage 2 data has been saved successfully!`,
        duration: 3000,
      });

      navigate("/stage2");

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving the Stage 2 data. Please try again.",
        duration: 3000,
      });
      console.error("Error saving Stage 2 data:", error);
    }
  };

  const isStage2SubmitEnabled = () => {
    return stage2Form.processStage &&
      stage2Form.type &&
      stage2Form.testName &&
      stage2Form.testCondition &&
      stage2Form.requiredQty &&
      stage2Form.equipment &&
      serialNumber &&
      selectedPartNumbers.length > 0;
  };

  if (!selectedRecord) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Test Checklist
      </Button> */}

      <Card>
        <CardHeader className="bg-[#e0413a] text-white">
          <CardTitle className="text-2xl">Stage 2 - Test Configuration</CardTitle>
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

          {/* Physical Barcode Scanner Section */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-green-800 flex items-center gap-2">
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
                  className="h-12 font-mono text-lg border-2 border-green-300 focus:border-green-500"
                  autoFocus
                />
                <p className="text-sm text-green-700">
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
                      key={index}
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
                    <p className="font-mono text-green-700">{serialNumber || "Not scanned"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Parts Status:</span>
                    <p className="text-green-700">
                      {selectedPartNumbers.length} selected / {scannedPartNumbers.length} available
                      {serialNumber && usedParts[serialNumber] && (
                        <span className="text-orange-600"> ({usedParts[serialNumber]?.length || 0} already used in other records)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2 Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serial Number Display */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-base">
                Serial Number <span className="text-red-600">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => handleManualSerialInput(e.target.value)}
                  placeholder="Will auto-fill from scanner"
                  className="h-11 font-mono flex-1 bg-green-50"
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

            {/* Part Numbers Selection - Only show available parts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="partNumbers" className="text-base">
                  Select Part Numbers <span className="text-red-600">*</span>
                </Label>
                {unselectedPartNumbers.length > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllUnselectedParts}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAllPartNumbers}
                      disabled={selectedPartNumbers.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
              <Select
                onValueChange={handlePartNumberSelection}
                disabled={unselectedPartNumbers.length === 0}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={
                    !serialNumber
                      ? "Scan serial number first"
                      : scannedPartNumbers.length === 0 
                      ? "No available parts for this serial"
                      : unselectedPartNumbers.length === 0
                      ? "All available parts selected"
                      : `Select from ${unselectedPartNumbers.length} available part(s)`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {unselectedPartNumbers.map((partNumber) => (
                    <SelectItem 
                      key={partNumber} 
                      value={partNumber}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{partNumber}</span>
                        <span className="text-xs text-green-600">(available)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scannedPartNumbers.length > 0 && (
                <p className="text-xs text-gray-500">
                  {selectedPartNumbers.length} of {scannedPartNumbers.length} available parts selected
                  {unselectedPartNumbers.length > 0 && (
                    <span className="text-green-600"> • {unselectedPartNumbers.length} available to select</span>
                  )}
                </p>
              )}
            </div>

            {/* Selected Part Numbers Display */}
            {selectedPartNumbers.length > 0 && (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-base flex items-center gap-2">
                  Selected Part Numbers
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedPartNumbers.length} selected)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border min-h-[3rem]">
                  {selectedPartNumbers.map((partNumber) => (
                    <div
                      key={partNumber}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span className="font-mono">{partNumber}</span>
                      <button
                        onClick={() => removeSelectedPartNumber(partNumber)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        title="Remove part number"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest of the form fields */}
            <div className="space-y-2">
              <Label htmlFor="processStage" className="text-base">
                Process Stage <span className="text-red-600">*</span>
              </Label>
              <Select
                value={stage2Form.processStage}
                onValueChange={(value) => handleStage2InputChange('processStage', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Process Stage" />
                </SelectTrigger>
                <SelectContent>
                  {processStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-base">
                Type <span className="text-red-600">*</span>
              </Label>
              <Select
                value={stage2Form.type}
                onValueChange={(value) => handleStage2InputChange('type', value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testName" className="text-base">
                Test Name <span className="text-red-600">*</span>
              </Label>
              <Select
                value={stage2Form.testName}
                onValueChange={(value) => handleStage2InputChange('testName', value)}
                disabled={availableTestNames.length === 0}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Test Name" />
                </SelectTrigger>
                <SelectContent>
                  {availableTestNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testCondition" className="text-base">
                Test Condition <span className="text-red-600">*</span>
              </Label>
              <Input
                id="testCondition"
                value={stage2Form.testCondition}
                onChange={(e) => handleStage2InputChange('testCondition', e.target.value)}
                placeholder="Enter test condition"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredQty" className="text-base">
                Required Quantity <span className="text-red-600">*</span>
              </Label>
              <Input
                id="requiredQty"
                value={stage2Form.requiredQty}
                onChange={(e) => handleStage2InputChange('requiredQty', e.target.value)}
                placeholder="Enter required quantity"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment" className="text-base">
                Equipment
              </Label>
              <Input
                id="equipment"
                value={stage2Form.equipment}
                onChange={(e) => handleStage2InputChange('equipment', e.target.value)}
                placeholder="Equipment (auto-filled)"
                disabled={true}
                className="h-11 bg-gray-50"
              />
            </div>

            {/* New Fields: Start Time, End Time, and Remark */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-base">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={stage2Form.startTime}
                onChange={(e) => handleStage2InputChange('startTime', e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-base">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={stage2Form.endTime}
                onChange={(e) => handleStage2InputChange('endTime', e.target.value)}
                className="h-11"
              />
            </div>

            {/* Remark field - spans full width */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remark" className="text-base">
                Remarks
              </Label>
              <Textarea
                id="remark"
                value={stage2Form.remark}
                onChange={(e) => handleStage2InputChange('remark', e.target.value)}
                placeholder="Enter any remarks or comments..."
                className="min-h-[100px] resize-vertical"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStage2Submit}
              disabled={!isStage2SubmitEnabled()}
              className="bg-[#e0413a] text-white hover:bg-[#c53730] px-6"
            >
              Submit Stage 2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stage2Page;