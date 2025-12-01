// import React, { useEffect, useState } from "react";
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
// import { ArrowLeft, X } from "lucide-react";
// import DateTimePicker from "@/components/DatePicker";

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

// interface SplitRow {
//   quantity: string;
//   buildProject: string;
//   line: string;
//   assignedParts: string[];
// }

// interface ORTLabRecord {
//   documentNumber: string;
//   id: number;
//   ortLab: {
//     date: string;
//     serialNumber: string;
//     partNumbers: string[];
//     splitRows: SplitRow[];
//     remark: string;
//     submittedAt: string;
//   };
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
//     checkpoint: "",
//     startDateTime: "",
//     endDateTime: "",
//     remark: "",
//     projects: [] as string[],
//     lines: [] as string[],
//     selectedParts: [] as string[]
//   });

//   // ORT Lab data
//   const [ortLabRecords, setOrtLabRecords] = useState<ORTLabRecord[]>([]);
//   const [availableProjects, setAvailableProjects] = useState<string[]>([]);
//   const [availableLines, setAvailableLines] = useState<string[]>([]);
//   const [availableParts, setAvailableParts] = useState<string[]>([]);

//   // Load ORT Lab records on component mount
//   useEffect(() => {
//     loadORTLabRecords();
//   }, []);

//   const loadORTLabRecords = () => {
//     try {
//       const storedRecords = localStorage.getItem("ortLabRecords");
//       if (storedRecords) {
//         const records: ORTLabRecord[] = JSON.parse(storedRecords);
//         setOrtLabRecords(records);

//         // Extract unique projects
//         const projects = new Set<string>();
//         records.forEach(record => {
//           record.ortLab.splitRows.forEach(row => {
//             projects.add(row.buildProject);
//           });
//         });
//         setAvailableProjects(Array.from(projects));
//       }
//     } catch (error) {
//       console.error("Error loading ORT Lab records:", error);
//     }
//   };

//   // Update lines when projects change
//   useEffect(() => {
//     if (stage2Form.projects.length > 0) {
//       const lines = new Set<string>();
//       const parts: string[] = [];

//       ortLabRecords.forEach(record => {
//         record.ortLab.splitRows.forEach(row => {
//           if (stage2Form.projects.includes(row.buildProject)) {
//             lines.add(row.line);
//             parts.push(...row.assignedParts);
//           }
//         });
//       });

//       setAvailableLines(Array.from(lines));
//       setAvailableParts(parts);

//       // Reset lines and parts when projects change
//       setStage2Form(prev => ({
//         ...prev,
//         lines: [],
//         selectedParts: []
//       }));
//     } else {
//       setAvailableLines([]);
//       setAvailableParts([]);
//       setStage2Form(prev => ({
//         ...prev,
//         lines: [],
//         selectedParts: []
//       }));
//     }
//   }, [stage2Form.projects, ortLabRecords]);

//   // Filter parts when lines change
//   useEffect(() => {
//     if (stage2Form.projects.length > 0 && stage2Form.lines.length > 0) {
//       const parts: string[] = [];

//       ortLabRecords.forEach(record => {
//         record.ortLab.splitRows.forEach(row => {
//           if (stage2Form.projects.includes(row.buildProject) &&
//             stage2Form.lines.includes(row.line)) {
//             parts.push(...row.assignedParts);
//           }
//         });
//       });

//       setAvailableParts(parts);

//       // Reset selected parts when lines change
//       setStage2Form(prev => ({
//         ...prev,
//         selectedParts: []
//       }));
//     } else if (stage2Form.projects.length > 0) {
//       // If only projects are selected, show all parts from selected projects
//       const parts: string[] = [];
//       ortLabRecords.forEach(record => {
//         record.ortLab.splitRows.forEach(row => {
//           if (stage2Form.projects.includes(row.buildProject)) {
//             parts.push(...row.assignedParts);
//           }
//         });
//       });
//       setAvailableParts(parts);
//     } else {
//       setAvailableParts([]);
//     }
//   }, [stage2Form.lines, stage2Form.projects, ortLabRecords]);

//   // Form handling functions
//   const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
//   const types = Array.from(new Set(flaskData.map(item => item.type)));

//   // const handleStage2InputChange = (field: keyof typeof stage2Form, value: string | string[]) => {
//   //   setStage2Form(prev => ({
//   //     ...prev,
//   //     [field]: value
//   //   }));

//   //   if (field === "processStage" || field === "type") {
//   //     const { processStage, type } = field === "processStage"
//   //       ? { processStage: value as string, type: stage2Form.type }
//   //       : { processStage: stage2Form.processStage, type: value as string };

//   //     if (processStage && type) {
//   //       const matchedData = flaskData.filter(
//   //         item => item.processStage === processStage && item.type === type
//   //       );

//   //       setFilteredData(matchedData);
//   //       const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
//   //       setAvailableTestNames(testNames);

//   //       setStage2Form(prev => ({
//   //         ...prev,
//   //         testName: "",
//   //         testCondition: "",
//   //         requiredQty: "",
//   //         equipment: ""
//   //       }));
//   //     } else {
//   //       setFilteredData([]);
//   //       setAvailableTestNames([]);
//   //       setStage2Form(prev => ({
//   //         ...prev,
//   //         testName: "",
//   //         testCondition: "",
//   //         requiredQty: "",
//   //         equipment: ""
//   //       }));
//   //     }
//   //   }

//   //   if (field === "testName" && value) {
//   //     const selectedTest = filteredData.find(item => item.testName === value);
//   //     if (selectedTest) {
//   //       setStage2Form(prev => ({
//   //         ...prev,
//   //         equipment: selectedTest.equipment
//   //       }));
//   //     }
//   //   }
//   // };


//   const handleStage2InputChange = (field: keyof typeof stage2Form, value: string | string[]) => {
//     setStage2Form(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     if (field === "processStage" || field === "type") {
//       const { processStage, type } = field === "processStage"
//         ? { processStage: value as string, type: stage2Form.type }
//         : { processStage: stage2Form.processStage, type: value as string };

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
//           equipment: selectedTest.equipment,
//           testCondition: selectedTest.testCondition || "",
//         }));
//       }
//     }
//   };


//   const handleProjectSelection = (project: string) => {
//     setStage2Form(prev => {
//       const isSelected = prev.projects.includes(project);
//       return {
//         ...prev,
//         projects: isSelected
//           ? prev.projects.filter(p => p !== project)
//           : [...prev.projects, project]
//       };
//     });
//   };

//   const handleLineSelection = (line: string) => {
//     setStage2Form(prev => {
//       const isSelected = prev.lines.includes(line);
//       return {
//         ...prev,
//         lines: isSelected
//           ? prev.lines.filter(l => l !== line)
//           : [...prev.lines, line]
//       };
//     });
//   };

//   const handlePartSelection = (partNumber: string) => {
//     setStage2Form(prev => {
//       const isSelected = prev.selectedParts.includes(partNumber);
//       return {
//         ...prev,
//         selectedParts: isSelected
//           ? prev.selectedParts.filter(p => p !== partNumber)
//           : [...prev.selectedParts, partNumber]
//       };
//     });
//   };

//   const removeSelectedProject = (project: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       projects: prev.projects.filter(p => p !== project)
//     }));
//   };

//   const removeSelectedLine = (line: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: prev.lines.filter(l => l !== line)
//     }));
//   };

//   const removeSelectedPart = (partNumber: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: prev.selectedParts.filter(p => p !== partNumber)
//     }));
//   };

//   const selectAllProjects = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       projects: [...availableProjects]
//     }));
//   };

//   const clearAllProjects = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       projects: []
//     }));
//   };

//   const selectAllLines = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: [...availableLines]
//     }));
//   };

//   const clearAllLines = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: []
//     }));
//   };

//   const selectAllParts = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: [...availableParts]
//     }));
//   };

//   const clearAllParts = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: []
//     }));
//   };

//   const handleStage2Submit = () => {
//     if (!selectedRecord) return;

//     if (!stage2Form.testName || !stage2Form.processStage ||
//       !stage2Form.type || !stage2Form.testCondition) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Form",
//         description: "Please fill in all required fields.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (stage2Form.projects.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "Missing Project",
//         description: "Please select at least one project from ORT Lab data.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (stage2Form.selectedParts.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Parts Selected",
//         description: "Please select at least one part.",
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
//           checkpoint: Number(stage2Form.checkpoint) ,
//           projects: stage2Form.projects,
//           lines: stage2Form.lines,
//           selectedParts: stage2Form.selectedParts,
//           startTime: stage2Form.startDateTime,
//           endTime: stage2Form.endDateTime,
//           remark: stage2Form.remark,
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

//       toast({
//         title: "✅ Stage 2 Submitted",
//         description: `Stage 2 data has been saved successfully!`,
//         duration: 3000,
//       });

//       navigate("/stage2");

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
//       // stage2Form.requiredQty &&
//       stage2Form.equipment &&
//       stage2Form.checkpoint &&
//       stage2Form.projects.length > 0 &&
//       stage2Form.selectedParts.length > 0;
//   };

//   if (!selectedRecord) {
//     return null;
//   }

//   const unselectedProjects = availableProjects.filter(
//     project => !stage2Form.projects.includes(project)
//   );

//   const unselectedLines = availableLines.filter(
//     line => !stage2Form.lines.includes(line)
//   );

//   const unselectedParts = availableParts.filter(
//     part => !stage2Form.selectedParts.includes(part)
//   );
//   function Time12Hour({ label, value, onChange }) {
//     const [time, setTime] = React.useState(value?.split(" ")[0] || "");
//     const [period, setPeriod] = React.useState(value?.split(" ")[1] || "AM");

//     const handleTimeChange = (t) => {
//       setTime(t);
//       onChange(`${t} ${period}`);
//     };

//     const handlePeriodChange = (p) => {
//       setPeriod(p);
//       onChange(`${time} ${p}`);
//     };

//     return (
//       <div className="space-y-2">
//         <Label className="text-base">{label}</Label>

//         <div className="flex gap-2">
//           <Input
//             type="time"
//             value={time}
//             onChange={(e) => handleTimeChange(e.target.value)}
//             className="h-11"
//           />

//           <select
//             className="border rounded px-2"
//             value={period}
//             onChange={(e) => handlePeriodChange(e.target.value)}
//           >
//             <option>AM</option>
//             <option>PM</option>
//           </select>
//         </div>
//       </div>
//     );
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



//           {/* Stage 2 Form Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

//             <div className="space-y-2">
//               <Label htmlFor="testCondition" className="text-base">
//                 Test Condition <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="testCondition"
//                 value={stage2Form.testCondition}
//                 onChange={(e) => handleStage2InputChange('testCondition', e.target.value)}
//                 placeholder="Test condition (auto-filled)"
//                 className="h-11"
//                 disabled={true}
//               />
//             </div>


//             {/* <div className="space-y-2">
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
//             </div> */}

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

//             <div className="space-y-2">
//               <Label htmlFor="checkpoint" className="text-base">
//                 CheckPoint <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="checkpoint"
//                 type="number"
//                 value={stage2Form.checkpoint}
//                 onChange={(e) => handleStage2InputChange('checkpoint', e.target.value)}
//                 placeholder="Enter the Hours"
//                 className="h-11"
//               />
//             </div>

//             <DateTimePicker
//               label="Start Date & Time"
//               value={stage2Form.startDateTime}
//               onChange={(val) => handleStage2InputChange("startDateTime", val)}
//             />

//             <DateTimePicker
//               label="End Date & Time"
//               value={stage2Form.endDateTime}
//               onChange={(val) => handleStage2InputChange("endDateTime", val)}
//             />


//             {/* <div className="space-y-2"></div> */}
//             <div className="space-y-2">
//               {/* Projects Selection */}
//               <div className="space-y-4 mb-6">
//                 <div className="flex justify-between items-center">
//                   <Label htmlFor="projects" className="text-base">
//                     Projects <span className="text-red-600">*</span>
//                   </Label>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={selectAllProjects}
//                       disabled={stage2Form.projects.length === availableProjects.length}
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={clearAllProjects}
//                       disabled={stage2Form.projects.length === 0}
//                     >
//                       Clear All
//                     </Button>
//                   </div>
//                 </div>
//                 <Select
//                   onValueChange={handleProjectSelection}
//                   disabled={unselectedProjects.length === 0}
//                 >
//                   <SelectTrigger className="h-11">
//                     <SelectValue placeholder={
//                       unselectedProjects.length === 0
//                         ? "All projects selected"
//                         : `Select from ${unselectedProjects.length} available project(s)`
//                     } />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {unselectedProjects.map((project) => (
//                       <SelectItem key={project} value={project}>
//                         {project}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <p className="text-xs text-gray-500">
//                   {stage2Form.projects.length} of {availableProjects.length} projects selected
//                 </p>

//                 {/* Selected Projects Display */}
//                 {stage2Form.projects.length > 0 && (
//                   <div className="space-y-2">
//                     <Label className="text-base flex items-center gap-2">
//                       Selected Projects
//                       <span className="text-sm font-normal text-gray-500">
//                         ({stage2Form.projects.length} selected)
//                       </span>
//                     </Label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                       {stage2Form.projects.map((project) => (
//                         <div
//                           key={project}
//                           className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           <span>{project}</span>
//                           <button
//                             onClick={() => removeSelectedProject(project)}
//                             className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
//                             title="Remove project"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Lines Selection */}
//               {availableLines.length > 0 && (
//                 <div className="space-y-4 mb-6">
//                   <div className="flex justify-between items-center">
//                     <Label htmlFor="lines" className="text-base">
//                       Lines
//                     </Label>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={selectAllLines}
//                         disabled={stage2Form.lines.length === availableLines.length}
//                       >
//                         Select All
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearAllLines}
//                         disabled={stage2Form.lines.length === 0}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                   </div>
//                   <Select
//                     onValueChange={handleLineSelection}
//                     disabled={unselectedLines.length === 0}
//                   >
//                     <SelectTrigger className="h-11">
//                       <SelectValue placeholder={
//                         unselectedLines.length === 0
//                           ? "All lines selected"
//                           : `Select from ${unselectedLines.length} available line(s)`
//                       } />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {unselectedLines.map((line) => (
//                         <SelectItem key={line} value={line}>
//                           {line}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500">
//                     {stage2Form.lines.length} of {availableLines.length} lines selected
//                   </p>

//                   {/* Selected Lines Display */}
//                   {stage2Form.lines.length > 0 && (
//                     <div className="space-y-2">
//                       <Label className="text-base flex items-center gap-2">
//                         Selected Lines
//                         <span className="text-sm font-normal text-gray-500">
//                           ({stage2Form.lines.length} selected)
//                         </span>
//                       </Label>
//                       <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                         {stage2Form.lines.map((line) => (
//                           <div
//                             key={line}
//                             className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span>{line}</span>
//                             <button
//                               onClick={() => removeSelectedLine(line)}
//                               className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
//                               title="Remove line"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Parts Selection */}
//               {availableParts.length > 0 && (
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <Label htmlFor="parts" className="text-base">
//                       Select Parts <span className="text-red-600">*</span>
//                     </Label>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={selectAllParts}
//                         disabled={stage2Form.selectedParts.length === availableParts.length}
//                       >
//                         Select All
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearAllParts}
//                         disabled={stage2Form.selectedParts.length === 0}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                   </div>
//                   <Select
//                     onValueChange={handlePartSelection}
//                     disabled={unselectedParts.length === 0}
//                   >
//                     <SelectTrigger className="h-11">
//                       <SelectValue placeholder={
//                         unselectedParts.length === 0
//                           ? "All parts selected"
//                           : `Select from ${unselectedParts.length} available part(s)`
//                       } />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {unselectedParts.map((part) => (
//                         <SelectItem key={part} value={part}>
//                           <span className="font-mono">{part}</span>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500">
//                     {stage2Form.selectedParts.length} of {availableParts.length} parts selected
//                   </p>

//                   {/* Selected Parts Display */}
//                   {stage2Form.selectedParts.length > 0 && (
//                     <div className="space-y-2">
//                       <Label className="text-base flex items-center gap-2">
//                         Selected Parts
//                         <span className="text-sm font-normal text-gray-500">
//                           ({stage2Form.selectedParts.length} selected)
//                         </span>
//                       </Label>
//                       <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                         {stage2Form.selectedParts.map((part) => (
//                           <div
//                             key={part}
//                             className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span className="font-mono">{part}</span>
//                             <button
//                               onClick={() => removeSelectedPart(part)}
//                               className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
//                               title="Remove part"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* <div className="space-y-2 md:col-span-2">
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
//             </div> */}
//             {/* ORT Lab Data Selection Section */}

//           </div>



//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 mt-8 pt-2">
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

// import React, { useEffect, useState } from "react";
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
// import { ArrowLeft, X } from "lucide-react";
// import DateTimePicker from "@/components/DatePicker";

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

// interface SplitRow {
//   quantity: string;
//   buildProject: string;
//   line: string;
//   assignedParts: string[];
// }

// interface ORTLabRecord {
//   documentNumber: string;
//   documentTitle: string;
//   projectName: string;
//   testLocation: string;
//   submissionPartDate: string;
//   sampleConfig: string;
//   remarks: string;
//   status: string;
//   project: string[]; // Changed from nested structure
//   line: string;
//   colour: string;
//   quantity: string;
//   id: number;
//   createdAt: string;
//   ortLabId: number;
//   ortLab: {
//     submissionId: number;
//     date: string;
//     serialNumber: string;
//     scannedParts: {
//       serialNumber: string;
//       partNumber: string;
//       scannedAt: string;
//     }[];
//     totalParts: number;
//     requiredQuantity: string;
//     submittedAt: string;
//   };
// }

// const Stage2Page: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const selectedRecord = location.state?.record as TestRecord | undefined;
//   const [testMode, setTestMode] = useState<'single' | 'multi'>('single');
//   const [filteredData, setFilteredData] = useState<typeof flaskData>([]);
//   const [availableTestNames, setAvailableTestNames] = useState<string[]>([]);
//   const [stage2Form, setStage2Form] = useState({
//     processStage: [] as string[],
//     type: [] as string[],
//     testName: [] as string[], // Changed to array
//     testCondition: [] as string[], // Changed to array
//     requiredQty: "",
//     equipment: [] as string[], // Changed to array
//     checkpoint: "",
//     startDateTime: "",
//     endDateTime: "",
//     remark: "",
//     projects: [] as string[],
//     lines: [] as string[],
//     selectedParts: [] as string[]
//   });

//   // ORT Lab data
//   const [ortLabRecords, setOrtLabRecords] = useState<ORTLabRecord[]>([]);
//   const [availableProjects, setAvailableProjects] = useState<string[]>([]);
//   const [availableLines, setAvailableLines] = useState<string[]>([]);
//   const [availableParts, setAvailableParts] = useState<string[]>([]);

//   // Load ORT Lab records on component mount
//   useEffect(() => {
//     loadORTLabRecords();
//   }, []);

//   const loadORTLabRecords = () => {
//     try {
//       const storedRecords = localStorage.getItem("ortLabRecords");
//       if (storedRecords) {
//         const records: ORTLabRecord[] = JSON.parse(storedRecords);
//         setOrtLabRecords(records);

//         // Extract unique projects from the project array
//         const projects = new Set<string>();
//         records.forEach(record => {
//           if (record.project && Array.isArray(record.project)) {
//             record.project.forEach(proj => {
//               if (proj && proj.trim() !== '') {
//                 projects.add(proj);
//               }
//             });
//           }
//         });
//         setAvailableProjects(Array.from(projects));
//       }
//     } catch (error) {
//       console.error("Error loading ORT Lab records:", error);
//     }
//   };

//   // Update lines when projects change
//   useEffect(() => {
//     if (stage2Form.projects.length > 0) {
//       const lines = new Set<string>();
//       const parts: string[] = [];

//       ortLabRecords.forEach(record => {
//         // Check if record has any of the selected projects
//         const hasSelectedProject = record.project?.some(proj =>
//           stage2Form.projects.includes(proj)
//         );

//         if (hasSelectedProject) {
//           // Add line if it exists
//           if (record.line && record.line.trim() !== '') {
//             lines.add(record.line);
//           }

//           // Add scanned parts
//           if (record.ortLab?.scannedParts) {
//             record.ortLab.scannedParts.forEach(part => {
//               if (part.partNumber && part.partNumber.trim() !== '') {
//                 parts.push(part.partNumber);
//               }
//             });
//           }
//         }
//       });

//       setAvailableLines(Array.from(lines));
//       setAvailableParts([...new Set(parts)]); // Remove duplicates

//       // Reset lines and parts when projects change
//       setStage2Form(prev => ({
//         ...prev,
//         lines: [],
//         selectedParts: []
//       }));
//     } else {
//       setAvailableLines([]);
//       setAvailableParts([]);
//       setStage2Form(prev => ({
//         ...prev,
//         lines: [],
//         selectedParts: []
//       }));
//     }
//   }, [stage2Form.projects, ortLabRecords]);

//   // Filter parts when lines change
//   useEffect(() => {
//     if (stage2Form.projects.length > 0) {
//       const parts: string[] = [];

//       ortLabRecords.forEach(record => {
//         // Check if record has any of the selected projects
//         const hasSelectedProject = record.project?.some(proj =>
//           stage2Form.projects.includes(proj)
//         );

//         // Check if line matches (if lines are selected)
//         const hasSelectedLine = stage2Form.lines.length === 0 ||
//           (record.line && stage2Form.lines.includes(record.line));

//         if (hasSelectedProject && hasSelectedLine) {
//           // Add scanned parts
//           if (record.ortLab?.scannedParts) {
//             record.ortLab.scannedParts.forEach(part => {
//               if (part.partNumber && part.partNumber.trim() !== '') {
//                 parts.push(part.partNumber);
//               }
//             });
//           }
//         }
//       });

//       const uniqueParts = [...new Set(parts)];
//       setAvailableParts(uniqueParts);

//       // Reset selected parts when filter changes
//       if (stage2Form.lines.length > 0 || stage2Form.projects.length > 0) {
//         setStage2Form(prev => ({
//           ...prev,
//           selectedParts: []
//         }));
//       }
//     } else {
//       setAvailableParts([]);
//     }
//   }, [stage2Form.lines, stage2Form.projects, ortLabRecords]);

//   // Form handling functions
//   const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
//   const types = Array.from(new Set(flaskData.map(item => item.type)));

//   const handleStage2InputChange = (field: keyof typeof stage2Form, value: string | string[]) => {
//     setStage2Form(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     if (field === "processStage" || field === "type") {
//       const { processStage, type } = field === "processStage"
//         ? { processStage: value as string, type: stage2Form.type }
//         : { processStage: stage2Form.processStage, type: value as string };

//       if (processStage && type) {
//         const matchedData = flaskData.filter(
//           item => item.processStage === processStage && item.type === type
//         );

//         setFilteredData(matchedData);
//         const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
//         setAvailableTestNames(testNames);

//         setStage2Form(prev => ({
//           ...prev,
//           testName: [],
//           testCondition: [],
//           requiredQty: "",
//           equipment: []
//         }));
//       } else {
//         setFilteredData([]);
//         setAvailableTestNames([]);
//         setStage2Form(prev => ({
//           ...prev,
//           testName: [],
//           testCondition: [],
//           requiredQty: "",
//           equipment: []
//         }));
//       }
//     }

//     if (field === "testName") {
//       if (testMode === 'single' && typeof value === 'string') {
//         // Single test mode
//         const selectedTest = filteredData.find(item => item.testName === value);
//         if (selectedTest) {
//           setStage2Form(prev => ({
//             ...prev,
//             testName: [value],
//             equipment: [selectedTest.equipment],
//             testCondition: [selectedTest.testCondition || ""],
//           }));
//         }
//       } else if (testMode === 'multi' && Array.isArray(value)) {
//         // Multi test mode
//         const equipmentList: string[] = [];
//         const conditionList: string[] = [];

//         value.forEach(testName => {
//           const test = filteredData.find(item => item.testName === testName);
//           if (test) {
//             equipmentList.push(test.equipment);
//             conditionList.push(test.testCondition || "");
//           }
//         });

//         setStage2Form(prev => ({
//           ...prev,
//           testName: value,
//           equipment: equipmentList,
//           testCondition: conditionList,
//         }));
//       }
//     }
//   };

//   const handleTestNameSelection = (testName: string) => {
//     if (testMode === 'single') {
//       handleStage2InputChange('testName', testName);
//     } else {
//       setStage2Form(prev => {
//         const isSelected = prev.testName.includes(testName);
//         const newTestNames = isSelected
//           ? prev.testName.filter(t => t !== testName)
//           : [...prev.testName, testName];

//         // Auto-update equipment and test conditions
//         const equipmentList: string[] = [];
//         const conditionList: string[] = [];

//         newTestNames.forEach(name => {
//           const test = filteredData.find(item => item.testName === name);
//           if (test) {
//             equipmentList.push(test.equipment);
//             conditionList.push(test.testCondition || "");
//           }
//         });

//         return {
//           ...prev,
//           testName: newTestNames,
//           equipment: equipmentList,
//           testCondition: conditionList,
//         };
//       });
//     }
//   };

//   const removeSelectedTestName = (testName: string) => {
//     setStage2Form(prev => {
//       const newTestNames = prev.testName.filter(t => t !== testName);

//       // Auto-update equipment and test conditions
//       const equipmentList: string[] = [];
//       const conditionList: string[] = [];

//       newTestNames.forEach(name => {
//         const test = filteredData.find(item => item.testName === name);
//         if (test) {
//           equipmentList.push(test.equipment);
//           conditionList.push(test.testCondition || "");
//         }
//       });

//       return {
//         ...prev,
//         testName: newTestNames,
//         equipment: equipmentList,
//         testCondition: conditionList,
//       };
//     });
//   };

//   const selectAllTestNames = () => {
//     const allTestNames = availableTestNames;
//     const equipmentList: string[] = [];
//     const conditionList: string[] = [];

//     allTestNames.forEach(name => {
//       const test = filteredData.find(item => item.testName === name);
//       if (test) {
//         equipmentList.push(test.equipment);
//         conditionList.push(test.testCondition || "");
//       }
//     });

//     setStage2Form(prev => ({
//       ...prev,
//       testName: allTestNames,
//       equipment: equipmentList,
//       testCondition: conditionList,
//     }));
//   };

//   const clearAllTestNames = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       testName: [],
//       equipment: [],
//       testCondition: [],
//     }));
//   };

//   const handleProjectSelection = (project: string) => {
//     setStage2Form(prev => {
//       if (testMode === 'multi') {
//         // In multi-test mode, only allow one project
//         return {
//           ...prev,
//           projects: [project],
//           lines: [], // Reset lines when project changes
//           selectedParts: [] // Reset parts when project changes
//         };
//       } else {
//         // In single-test mode, allow multiple projects
//         const isSelected = prev.projects.includes(project);
//         return {
//           ...prev,
//           projects: isSelected
//             ? prev.projects.filter(p => p !== project)
//             : [...prev.projects, project]
//         };
//       }
//     });
//   };

//   const handleLineSelection = (line: string) => {
//     setStage2Form(prev => {
//       const isSelected = prev.lines.includes(line);
//       return {
//         ...prev,
//         lines: isSelected
//           ? prev.lines.filter(l => l !== line)
//           : [...prev.lines, line]
//       };
//     });
//   };

//   const handlePartSelection = (partNumber: string) => {
//     setStage2Form(prev => {
//       const isSelected = prev.selectedParts.includes(partNumber);
//       return {
//         ...prev,
//         selectedParts: isSelected
//           ? prev.selectedParts.filter(p => p !== partNumber)
//           : [...prev.selectedParts, partNumber]
//       };
//     });
//   };

//   const removeSelectedProject = (project: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       projects: prev.projects.filter(p => p !== project)
//     }));
//   };

//   const removeSelectedLine = (line: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: prev.lines.filter(l => l !== line)
//     }));
//   };

//   const removeSelectedPart = (partNumber: string) => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: prev.selectedParts.filter(p => p !== partNumber)
//     }));
//   };

//   const selectAllProjects = () => {
//     if (testMode === 'single') {
//       setStage2Form(prev => ({
//         ...prev,
//         projects: [...availableProjects]
//       }));
//     }
//   };

//   const clearAllProjects = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       projects: [],
//       lines: [],
//       selectedParts: []
//     }));
//   };


//   const selectAllLines = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: [...availableLines]
//     }));
//   };

//   const clearAllLines = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       lines: []
//     }));
//   };

//   const selectAllParts = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: [...availableParts]
//     }));
//   };

//   const clearAllParts = () => {
//     setStage2Form(prev => ({
//       ...prev,
//       selectedParts: []
//     }));
//   };

//   const handleStage2Submit = () => {
//     if (!selectedRecord) return;

//     if (stage2Form.testName.length === 0 || !stage2Form.processStage ||
//       !stage2Form.type || stage2Form.testCondition.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "Incomplete Form",
//         description: "Please fill in all required fields.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (stage2Form.projects.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "Missing Project",
//         description: "Please select at least one project from ORT Lab data.",
//         duration: 2000,
//       });
//       return;
//     }

//     if (stage2Form.selectedParts.length === 0) {
//       toast({
//         variant: "destructive",
//         title: "No Parts Selected",
//         description: "Please select at least one part.",
//         duration: 2000,
//       });
//       return;
//     }

//     try {
//       const stage2Data = {
//         ...selectedRecord,
//         stage2: {
//           testMode: testMode,
//           processStage: stage2Form.processStage,
//           type: stage2Form.type,
//           testName: stage2Form.testName.join(', '), // Comma-separated
//           testCondition: stage2Form.testCondition.join(', '), // Comma-separated
//           requiredQty: stage2Form.requiredQty,
//           equipment: stage2Form.equipment.join(', '), // Comma-separated
//           checkpoint: Number(stage2Form.checkpoint),
//           projects: stage2Form.projects,
//           lines: stage2Form.lines,
//           selectedParts: stage2Form.selectedParts,
//           startTime: stage2Form.startDateTime,
//           endTime: stage2Form.endDateTime,
//           remark: stage2Form.remark,
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

//       toast({
//         title: "✅ Stage 2 Submitted",
//         description: `Stage 2 data has been saved successfully!`,
//         duration: 3000,
//       });

//       navigate("/stage2");

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
//       stage2Form.testName.length > 0 &&
//       stage2Form.testCondition.length > 0 &&
//       stage2Form.equipment.length > 0 &&
//       stage2Form.checkpoint &&
//       stage2Form.projects.length > 0 &&
//       stage2Form.selectedParts.length > 0;
//   };

//   if (!selectedRecord) {
//     return null;
//   }

//   const unselectedProjects = availableProjects.filter(
//     project => !stage2Form.projects.includes(project)
//   );

//   const unselectedLines = availableLines.filter(
//     line => !stage2Form.lines.includes(line)
//   );

//   const unselectedParts = availableParts.filter(
//     part => !stage2Form.selectedParts.includes(part)
//   );
//   function Time12Hour({ label, value, onChange }) {
//     const [time, setTime] = React.useState(value?.split(" ")[0] || "");
//     const [period, setPeriod] = React.useState(value?.split(" ")[1] || "AM");

//     const handleTimeChange = (t) => {
//       setTime(t);
//       onChange(`${t} ${period}`);
//     };

//     const handlePeriodChange = (p) => {
//       setPeriod(p);
//       onChange(`${time} ${p}`);
//     };

//     return (
//       <div className="space-y-2">
//         <Label className="text-base">{label}</Label>

//         <div className="flex gap-2">
//           <Input
//             type="time"
//             value={time}
//             onChange={(e) => handleTimeChange(e.target.value)}
//             className="h-11"
//           />

//           <select
//             className="border rounded px-2"
//             value={period}
//             onChange={(e) => handlePeriodChange(e.target.value)}
//           >
//             <option>AM</option>
//             <option>PM</option>
//           </select>
//         </div>
//       </div>
//     );
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

//           {/* Test Mode Selection - Add this BEFORE the Process Stage field */}
//           <div className="space-y-2 md:col-span-2 mb-5">
//             <Label htmlFor="testMode" className="text-base">
//               Test Mode <span className="text-red-600">*</span>
//             </Label>
//             <Select
//               value={testMode}
//               onValueChange={(value: 'single' | 'multi') => {
//                 setTestMode(value);
//                 // Reset test-related fields when switching modes
//                 setStage2Form(prev => ({
//                   ...prev,
//                   testName: [],
//                   testCondition: [],
//                   equipment: [],
//                   // If switching to multi-test and multiple projects selected, keep only first one
//                   projects: value === 'multi' && prev.projects.length > 1
//                     ? [prev.projects[0]]
//                     : prev.projects,
//                   lines: [],
//                   selectedParts: []
//                 }));
//               }}
//             >
//               <SelectTrigger className="h-11">
//                 <SelectValue placeholder="Select Test Mode" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="single">Single Test</SelectItem>
//                 <SelectItem value="multi">Multi Test</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Stage 2 Form Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

//             {/* Test Name Selection - Single or Multi */}
//             {testMode === 'single' ? (
//               <div className="space-y-2">
//                 <Label htmlFor="testName" className="text-base">
//                   Test Name <span className="text-red-600">*</span>
//                 </Label>
//                 <Select
//                   value={stage2Form.testName[0] || ""}
//                   onValueChange={handleTestNameSelection}
//                   disabled={availableTestNames.length === 0}
//                 >
//                   <SelectTrigger className="h-11">
//                     <SelectValue placeholder="Select Test Name" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {availableTestNames.map((name) => (
//                       <SelectItem key={name} value={name}>
//                         {name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <Label htmlFor="testName" className="text-base">
//                     Test Names <span className="text-red-600">*</span>
//                   </Label>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={selectAllTestNames}
//                       disabled={stage2Form.testName.length === availableTestNames.length}
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={clearAllTestNames}
//                       disabled={stage2Form.testName.length === 0}
//                     >
//                       Clear All
//                     </Button>
//                   </div>
//                 </div>
//                 <Select
//                   onValueChange={handleTestNameSelection}
//                   disabled={availableTestNames.filter(name => !stage2Form.testName.includes(name)).length === 0}
//                 >
//                   <SelectTrigger className="h-11">
//                     <SelectValue placeholder={
//                       stage2Form.testName.length === availableTestNames.length
//                         ? "All tests selected"
//                         : `Select from ${availableTestNames.filter(name => !stage2Form.testName.includes(name)).length} available test(s)`
//                     } />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {availableTestNames
//                       .filter(name => !stage2Form.testName.includes(name))
//                       .map((name) => (
//                         <SelectItem key={name} value={name}>
//                           {name}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//                 <p className="text-xs text-gray-500">
//                   {stage2Form.testName.length} of {availableTestNames.length} tests selected
//                 </p>

//                 {/* Selected Test Names Display */}
//                 {stage2Form.testName.length > 0 && (
//                   <div className="space-y-2">
//                     <Label className="text-base flex items-center gap-2">
//                       Selected Test Names
//                       <span className="text-sm font-normal text-gray-500">
//                         ({stage2Form.testName.length} selected)
//                       </span>
//                     </Label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                       {stage2Form.testName.map((name) => (
//                         <div
//                           key={name}
//                           className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           <span>{name}</span>
//                           <button
//                             onClick={() => removeSelectedTestName(name)}
//                             className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
//                             title="Remove test"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Test Condition - Display only */}
//             <div className="space-y-2">
//               <Label htmlFor="testCondition" className="text-base">
//                 Test Condition {testMode === 'multi' && 's'} <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="testCondition"
//                 value={stage2Form.testCondition.join(', ')}
//                 placeholder={`Test condition${testMode === 'multi' ? 's' : ''} (auto-filled)`}
//                 className="h-11"
//                 disabled={true}
//               />
//             </div>

//             {/* Equipment - Display only */}
//             <div className="space-y-2">
//               <Label htmlFor="equipment" className="text-base">
//                 Equipment {testMode === 'multi' && '(s)'}
//               </Label>
//               <Input
//                 id="equipment"
//                 value={stage2Form.equipment.join(', ')}
//                 placeholder={`Equipment${testMode === 'multi' ? '(s)' : ''} (auto-filled)`}
//                 disabled={true}
//                 className="h-11 bg-gray-50"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="checkpoint" className="text-base">
//                 CheckPoint <span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 id="checkpoint"
//                 type="number"
//                 value={stage2Form.checkpoint}
//                 onChange={(e) => handleStage2InputChange('checkpoint', e.target.value)}
//                 placeholder="Enter the Hours"
//                 className="h-11"
//               />
//             </div>

//             <DateTimePicker
//               label="Start Date & Time"
//               value={stage2Form.startDateTime}
//               onChange={(val) => handleStage2InputChange("startDateTime", val)}
//             />

//             <DateTimePicker
//               label="End Date & Time"
//               value={stage2Form.endDateTime}
//               onChange={(val) => handleStage2InputChange("endDateTime", val)}
//             />


//             {/* <div className="space-y-2"></div> */}
//             <div className="space-y-2">
//               {/* Projects Selection */}
//               {/* Projects Selection */}
//               <div className="space-y-4 mb-6">
//                 <div className="flex justify-between items-center">
//                   <Label htmlFor="projects" className="text-base">
//                     Projects <span className="text-red-600">*</span>
//                     {testMode === 'multi' && (
//                       <span className="text-sm font-normal text-gray-500 ml-2">
//                         (Single project only in multi-test mode)
//                       </span>
//                     )}
//                   </Label>
//                   {testMode === 'single' && (
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={selectAllProjects}
//                         disabled={stage2Form.projects.length === availableProjects.length}
//                       >
//                         Select All
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearAllProjects}
//                         disabled={stage2Form.projects.length === 0}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 <Select
//                   onValueChange={handleProjectSelection}
//                   disabled={testMode === 'multi' && stage2Form.projects.length === 1}
//                   value={testMode === 'multi' ? stage2Form.projects[0] : undefined}
//                 >
//                   <SelectTrigger className="h-11">
//                     <SelectValue placeholder={
//                       testMode === 'multi'
//                         ? (stage2Form.projects.length === 1
//                           ? stage2Form.projects[0]
//                           : "Select one project")
//                         : (unselectedProjects.length === 0
//                           ? "All projects selected"
//                           : `Select from ${unselectedProjects.length} available project(s)`)
//                     } />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {testMode === 'multi' ? (
//                       // Multi-test mode: show all projects
//                       availableProjects.map((project) => (
//                         <SelectItem key={project} value={project}>
//                           {project}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       // Single-test mode: show only unselected projects
//                       unselectedProjects.map((project) => (
//                         <SelectItem key={project} value={project}>
//                           {project}
//                         </SelectItem>
//                       ))
//                     )}
//                   </SelectContent>
//                 </Select>

//                 {testMode === 'single' && (
//                   <p className="text-xs text-gray-500">
//                     {stage2Form.selectedParts.length} of {availableParts.length} available parts selected
//                   </p>
//                 )}

//                 {/* Selected Projects Display */}
//                 {stage2Form.projects.length > 0 && (
//                   <div className="space-y-2">
//                     <Label className="text-base flex items-center gap-2">
//                       Selected Project{testMode === 'single' && 's'}
//                       {testMode === 'single' && (
//                         <span className="text-sm font-normal text-gray-500">
//                           ({stage2Form.projects.length} selected)
//                         </span>
//                       )}
//                     </Label>
//                     <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                       {stage2Form.projects.map((project) => (
//                         <div
//                           key={project}
//                           className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           <span>{project}</span>
//                           <button
//                             onClick={() => removeSelectedProject(project)}
//                             className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
//                             title="Remove project"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Lines Selection */}
//               {availableLines.length > 0 && (
//                 <div className="space-y-4 mb-6">
//                   <div className="flex justify-between items-center">
//                     <Label htmlFor="lines" className="text-base">
//                       Lines
//                     </Label>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={selectAllLines}
//                         disabled={stage2Form.lines.length === availableLines.length}
//                       >
//                         Select All
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearAllLines}
//                         disabled={stage2Form.lines.length === 0}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                   </div>
//                   <Select
//                     onValueChange={handleLineSelection}
//                     disabled={unselectedLines.length === 0}
//                   >
//                     <SelectTrigger className="h-11">
//                       <SelectValue placeholder={
//                         unselectedLines.length === 0
//                           ? "All lines selected"
//                           : `Select from ${unselectedLines.length} available line(s)`
//                       } />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {unselectedLines.map((line) => (
//                         <SelectItem key={line} value={line}>
//                           {line}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500">
//                     {stage2Form.lines.length} of {availableLines.length} lines selected
//                   </p>

//                   {/* Selected Lines Display */}
//                   {stage2Form.lines.length > 0 && (
//                     <div className="space-y-2">
//                       <Label className="text-base flex items-center gap-2">
//                         Selected Lines
//                         <span className="text-sm font-normal text-gray-500">
//                           ({stage2Form.lines.length} selected)
//                         </span>
//                       </Label>
//                       <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                         {stage2Form.lines.map((line) => (
//                           <div
//                             key={line}
//                             className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span>{line}</span>
//                             <button
//                               onClick={() => removeSelectedLine(line)}
//                               className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
//                               title="Remove line"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Parts Selection */}
//               {availableParts.length > 0 && (
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <Label htmlFor="parts" className="text-base">
//                       Select Parts <span className="text-red-600">*</span>
//                     </Label>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={selectAllParts}
//                         disabled={stage2Form.selectedParts.length === availableParts.length}
//                       >
//                         Select All
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={clearAllParts}
//                         disabled={stage2Form.selectedParts.length === 0}
//                       >
//                         Clear All
//                       </Button>
//                     </div>
//                   </div>
//                   <Select
//                     onValueChange={handlePartSelection}
//                     disabled={unselectedParts.length === 0}
//                   >
//                     <SelectTrigger className="h-11">
//                       <SelectValue placeholder={
//                         unselectedParts.length === 0
//                           ? "All parts selected"
//                           : `Select from ${unselectedParts.length} available part(s)`
//                       } />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {unselectedParts.map((part) => (
//                         <SelectItem key={part} value={part}>
//                           <span className="font-mono">{part}</span>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500">
//                     {stage2Form.selectedParts.length} of {availableParts.length} parts selected
//                   </p>

//                   {/* Selected Parts Display */}
//                   {stage2Form.selectedParts.length > 0 && (
//                     <div className="space-y-2">
//                       <Label className="text-base flex items-center gap-2">
//                         Selected Parts
//                         <span className="text-sm font-normal text-gray-500">
//                           ({stage2Form.selectedParts.length} selected)
//                         </span>
//                       </Label>
//                       <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
//                         {stage2Form.selectedParts.map((part) => (
//                           <div
//                             key={part}
//                             className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
//                           >
//                             <span className="font-mono">{part}</span>
//                             <button
//                               onClick={() => removeSelectedPart(part)}
//                               className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
//                               title="Remove part"
//                             >
//                               <X size={14} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* <div className="space-y-2 md:col-span-2">
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
//             </div> */}
//             {/* ORT Lab Data Selection Section */}

//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-4 mt-8 pt-2">
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


import React, { useEffect, useState } from "react";
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
import { ArrowLeft, X } from "lucide-react";
import DateTimePicker from "@/components/DatePicker";

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

const Stage2Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;
  const [testMode, setTestMode] = useState<'single' | 'multi'>('single');
  const [filteredData, setFilteredData] = useState<typeof flaskData>([]);
  const [availableTestNames, setAvailableTestNames] = useState<string[]>([]);
  const [stage2Form, setStage2Form] = useState({
    processStage: [] as string[],
    type: [] as string[],
    testName: [] as string[],
    testCondition: [] as string[],
    requiredQty: "",
    equipment: [] as string[],
    checkpoint: "",
    startDateTime: "",
    endDateTime: "",
    remark: "",
    projects: [] as string[],
    lines: [] as string[],
    selectedParts: [] as string[]
  });

  // ORT Lab data
  const [ortLabRecords, setOrtLabRecords] = useState<ORTLabRecord[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [availableLines, setAvailableLines] = useState<string[]>([]);
  const [availableParts, setAvailableParts] = useState<string[]>([]);

  const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));

  // Helper to get filtered types based on selected process stages
  const getFilteredTypes = () => {
    if (stage2Form.processStage.length === 0) return [];

    const filteredTypes = flaskData
      .filter(item => stage2Form.processStage.includes(item.processStage))
      .map(item => item.type);

    return Array.from(new Set(filteredTypes));
  };

  const types = getFilteredTypes();

  // Load ORT Lab records on component mount
  useEffect(() => {
    loadORTLabRecords();
  }, []);

  const loadORTLabRecords = () => {
    try {
      const storedRecords = localStorage.getItem("ortLabRecords");
      if (storedRecords) {
        const records: ORTLabRecord[] = JSON.parse(storedRecords);
        setOrtLabRecords(records);

        // Extract unique projects from the project array
        const projects = new Set<string>();
        records.forEach(record => {
          if (record.project && Array.isArray(record.project)) {
            record.project.forEach(proj => {
              if (proj && proj.trim() !== '') {
                projects.add(proj);
              }
            });
          }
        });
        setAvailableProjects(Array.from(projects));
      }
    } catch (error) {
      console.error("Error loading ORT Lab records:", error);
    }
  };

  // Update lines and parts when projects change
  useEffect(() => {
    if (stage2Form.projects.length > 0) {
      const lines = new Set<string>();
      const parts: string[] = [];

      ortLabRecords.forEach(record => {
        // Check if record has any of the selected projects
        const hasSelectedProject = record.project?.some(proj =>
          stage2Form.projects.includes(proj)
        );

        if (hasSelectedProject) {
          // Add line if it exists
          if (record.line && record.line.trim() !== '') {
            lines.add(record.line);
          }

          // Add scanned parts
          if (record.ortLab?.scannedParts) {
            record.ortLab.scannedParts.forEach(part => {
              if (part.partNumber && part.partNumber.trim() !== '') {
                parts.push(part.partNumber);
              }
            });
          }
        }
      });

      setAvailableLines(Array.from(lines));
      setAvailableParts([...new Set(parts)]); // Remove duplicates

      // Reset lines and parts when projects change
      setStage2Form(prev => ({
        ...prev,
        lines: [],
        selectedParts: []
      }));
    } else {
      setAvailableLines([]);
      setAvailableParts([]);
      setStage2Form(prev => ({
        ...prev,
        lines: [],
        selectedParts: []
      }));
    }
  }, [stage2Form.projects, ortLabRecords]);

  // Update parts when lines change
  useEffect(() => {
    if (stage2Form.projects.length > 0) {
      const parts: string[] = [];

      ortLabRecords.forEach(record => {
        // Check if record has any of the selected projects
        const hasSelectedProject = record.project?.some(proj =>
          stage2Form.projects.includes(proj)
        );

        // Check if line matches (if lines are selected)
        const hasSelectedLine = stage2Form.lines.length === 0 ||
          (record.line && stage2Form.lines.includes(record.line));

        if (hasSelectedProject && hasSelectedLine) {
          // Add scanned parts
          if (record.ortLab?.scannedParts) {
            record.ortLab.scannedParts.forEach(part => {
              if (part.partNumber && part.partNumber.trim() !== '') {
                parts.push(part.partNumber);
              }
            });
          }
        }
      });

      const uniqueParts = [...new Set(parts)];
      setAvailableParts(uniqueParts);

      // Reset selected parts when filter changes
      if (stage2Form.lines.length > 0 || stage2Form.projects.length > 0) {
        setStage2Form(prev => ({
          ...prev,
          selectedParts: []
        }));
      }
    } else {
      setAvailableParts([]);
    }
  }, [stage2Form.lines, stage2Form.projects, ortLabRecords]);

  // Process Stage handlers
  const handleProcessStageSelection = (stage: string) => {
    setStage2Form(prev => {
      if (testMode === 'multi') {
        // In multi-test mode, allow multiple selection
        const isSelected = prev.processStage.includes(stage);
        const newProcessStages = isSelected
          ? prev.processStage.filter(s => s !== stage)
          : [...prev.processStage, stage];

        // If process stages change, reset dependent fields
        return {
          ...prev,
          processStage: newProcessStages,
          type: [],
          testName: [],
          testCondition: [],
          equipment: [],
          requiredQty: ""
        };
      } else {
        // In single-test mode, single selection
        return {
          ...prev,
          processStage: [stage],
          type: [],
          testName: [],
          testCondition: [],
          equipment: [],
          requiredQty: ""
        };
      }
    });
  };

  const removeSelectedProcessStage = (stage: string) => {
    setStage2Form(prev => ({
      ...prev,
      processStage: prev.processStage.filter(s => s !== stage),
      type: [],
      testName: [],
      testCondition: [],
      equipment: []
    }));
    setFilteredData([]);
    setAvailableTestNames([]);
  };

  const selectAllProcessStages = () => {
    if (testMode === 'multi') {
      setStage2Form(prev => ({
        ...prev,
        processStage: [...processStages]
      }));
    }
  };

  const clearAllProcessStages = () => {
    setStage2Form(prev => ({
      ...prev,
      processStage: [],
      type: [],
      testName: [],
      testCondition: [],
      equipment: []
    }));
    setFilteredData([]);
    setAvailableTestNames([]);
  };

  // Type handlers
  const handleTypeSelection = (type: string) => {
    setStage2Form(prev => {
      if (testMode === 'multi') {
        // In multi-test mode, allow multiple selection
        const isSelected = prev.type.includes(type);
        const newTypes = isSelected
          ? prev.type.filter(t => t !== type)
          : [...prev.type, type];

        // Filter data based on selected process stages and types
        const allSelectedProcessStages = prev.processStage;
        const filteredData = flaskData.filter(item =>
          allSelectedProcessStages.includes(item.processStage) &&
          newTypes.includes(item.type)
        );

        setFilteredData(filteredData);
        const testNames = Array.from(new Set(filteredData.map(item => item.testName)));
        setAvailableTestNames(testNames);

        return {
          ...prev,
          type: newTypes,
          testName: [],
          testCondition: [],
          equipment: []
        };
      } else {
        // In single-test mode, single selection
        const filteredData = flaskData.filter(item =>
          prev.processStage[0] === item.processStage && item.type === type
        );

        setFilteredData(filteredData);
        const testNames = Array.from(new Set(filteredData.map(item => item.testName)));
        setAvailableTestNames(testNames);

        return {
          ...prev,
          type: [type],
          testName: [],
          testCondition: [],
          equipment: []
        };
      }
    });
  };

  const removeSelectedType = (type: string) => {
    setStage2Form(prev => {
      const newTypes = prev.type.filter(t => t !== type);

      if (prev.processStage.length > 0 && newTypes.length > 0) {
        const matchedData = flaskData.filter(
          item => prev.processStage.includes(item.processStage) && newTypes.includes(item.type)
        );
        setFilteredData(matchedData);
        const testNames = Array.from(new Set(matchedData.map(item => item.testName)));
        setAvailableTestNames(testNames);
      } else {
        setFilteredData([]);
        setAvailableTestNames([]);
      }

      return {
        ...prev,
        type: newTypes,
        testName: [],
        testCondition: [],
        equipment: []
      };
    });
  };

  const selectAllTypes = () => {
    if (testMode === 'multi' && stage2Form.processStage.length > 0) {
      const filteredTypes = flaskData
        .filter(item => stage2Form.processStage.includes(item.processStage))
        .map(item => item.type);
      const uniqueTypes = Array.from(new Set(filteredTypes));

      setStage2Form(prev => ({
        ...prev,
        type: uniqueTypes
      }));
    }
  };

  const clearAllTypes = () => {
    setStage2Form(prev => ({
      ...prev,
      type: [],
      testName: [],
      testCondition: [],
      equipment: []
    }));
    setFilteredData([]);
    setAvailableTestNames([]);
  };

  // Test Name handlers
  const handleTestNameSelection = (testName: string) => {
    if (testMode === 'single') {
      const selectedTest = filteredData.find(item => item.testName === testName);
      if (selectedTest) {
        setStage2Form(prev => ({
          ...prev,
          testName: [testName],
          equipment: [selectedTest.equipment],
          testCondition: [selectedTest.testCondition || ""],
        }));
      }
    } else {
      setStage2Form(prev => {
        const isSelected = prev.testName.includes(testName);
        const newTestNames = isSelected
          ? prev.testName.filter(t => t !== testName)
          : [...prev.testName, testName];

        // Auto-update equipment and test conditions
        const equipmentList: string[] = [];
        const conditionList: string[] = [];

        newTestNames.forEach(name => {
          const test = filteredData.find(item => item.testName === name);
          if (test) {
            equipmentList.push(test.equipment);
            conditionList.push(test.testCondition || "");
          }
        });

        return {
          ...prev,
          testName: newTestNames,
          equipment: equipmentList,
          testCondition: conditionList,
        };
      });
    }
  };

  const removeSelectedTestName = (testName: string) => {
    setStage2Form(prev => {
      const newTestNames = prev.testName.filter(t => t !== testName);

      // Auto-update equipment and test conditions
      const equipmentList: string[] = [];
      const conditionList: string[] = [];

      newTestNames.forEach(name => {
        const test = filteredData.find(item => item.testName === name);
        if (test) {
          equipmentList.push(test.equipment);
          conditionList.push(test.testCondition || "");
        }
      });

      return {
        ...prev,
        testName: newTestNames,
        equipment: equipmentList,
        testCondition: conditionList,
      };
    });
  };

  const selectAllTestNames = () => {
    const allTestNames = availableTestNames;
    const equipmentList: string[] = [];
    const conditionList: string[] = [];

    allTestNames.forEach(name => {
      const test = filteredData.find(item => item.testName === name);
      if (test) {
        equipmentList.push(test.equipment);
        conditionList.push(test.testCondition || "");
      }
    });

    setStage2Form(prev => ({
      ...prev,
      testName: allTestNames,
      equipment: equipmentList,
      testCondition: conditionList,
    }));
  };

  const clearAllTestNames = () => {
    setStage2Form(prev => ({
      ...prev,
      testName: [],
      equipment: [],
      testCondition: [],
    }));
  };

  // Project handlers
  const handleProjectSelection = (project: string) => {
    setStage2Form(prev => {
      if (testMode === 'multi') {
        // In multi-test mode, only allow one project
        return {
          ...prev,
          projects: [project],
          lines: [],
          selectedParts: []
        };
      } else {
        // In single-test mode, allow multiple projects
        const isSelected = prev.projects.includes(project);
        return {
          ...prev,
          projects: isSelected
            ? prev.projects.filter(p => p !== project)
            : [...prev.projects, project]
        };
      }
    });
  };

  const removeSelectedProject = (project: string) => {
    setStage2Form(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p !== project)
    }));
  };

  const selectAllProjects = () => {
    if (testMode === 'single') {
      setStage2Form(prev => ({
        ...prev,
        projects: [...availableProjects]
      }));
    }
  };

  const clearAllProjects = () => {
    setStage2Form(prev => ({
      ...prev,
      projects: [],
      lines: [],
      selectedParts: []
    }));
  };

  // Line handlers
  const handleLineSelection = (line: string) => {
    setStage2Form(prev => {
      const isSelected = prev.lines.includes(line);
      return {
        ...prev,
        lines: isSelected
          ? prev.lines.filter(l => l !== line)
          : [...prev.lines, line]
      };
    });
  };

  const removeSelectedLine = (line: string) => {
    setStage2Form(prev => ({
      ...prev,
      lines: prev.lines.filter(l => l !== line)
    }));
  };

  const selectAllLines = () => {
    setStage2Form(prev => ({
      ...prev,
      lines: [...availableLines]
    }));
  };

  const clearAllLines = () => {
    setStage2Form(prev => ({
      ...prev,
      lines: []
    }));
  };

  // Part handlers
  const handlePartSelection = (partNumber: string) => {
    setStage2Form(prev => {
      const isSelected = prev.selectedParts.includes(partNumber);
      return {
        ...prev,
        selectedParts: isSelected
          ? prev.selectedParts.filter(p => p !== partNumber)
          : [...prev.selectedParts, partNumber]
      };
    });
  };

  const removeSelectedPart = (partNumber: string) => {
    setStage2Form(prev => ({
      ...prev,
      selectedParts: prev.selectedParts.filter(p => p !== partNumber)
    }));
  };

  const selectAllParts = () => {
    setStage2Form(prev => ({
      ...prev,
      selectedParts: [...availableParts]
    }));
  };

  const clearAllParts = () => {
    setStage2Form(prev => ({
      ...prev,
      selectedParts: []
    }));
  };

  // Helper to get parts count
  const getAvailablePartsCount = () => {
    if (stage2Form.projects.length === 0) return 0;

    let count = 0;
    ortLabRecords.forEach(record => {
      const hasSelectedProject = record.project?.some(proj =>
        stage2Form.projects.includes(proj)
      );

      const hasSelectedLine = stage2Form.lines.length === 0 ||
        (record.line && stage2Form.lines.includes(record.line));

      if (hasSelectedProject && hasSelectedLine) {
        count += record.ortLab?.scannedParts?.length || 0;
      }
    });

    return count;
  };

  const handleStage2Submit = () => {
    if (!selectedRecord) return;

    if (stage2Form.processStage.length === 0 || stage2Form.type.length === 0 ||
      stage2Form.testName.length === 0 || stage2Form.testCondition.length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        duration: 2000,
      });
      return;
    }

    if (stage2Form.projects.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Project",
        description: "Please select at least one project from ORT Lab data.",
        duration: 2000,
      });
      return;
    }

    if (stage2Form.selectedParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Selected",
        description: "Please select at least one part.",
        duration: 2000,
      });
      return;
    }

    try {
      const stage2Data = {
        ...selectedRecord,
        stage2: {
          testMode: testMode,
          processStage: testMode === 'single' ? stage2Form.processStage[0] : stage2Form.processStage.join(', '),
          type: testMode === 'single' ? stage2Form.type[0] : stage2Form.type.join(', '),
          testName: stage2Form.testName.join(', '),
          testCondition: stage2Form.testCondition.join(', '),
          requiredQty: stage2Form.requiredQty,
          equipment: stage2Form.equipment.join(', '),
          checkpoint: Number(stage2Form.checkpoint),
          projects: stage2Form.projects,
          lines: stage2Form.lines,
          selectedParts: stage2Form.selectedParts,
          startTime: stage2Form.startDateTime,
          endTime: stage2Form.endDateTime,
          remark: stage2Form.remark,
          submittedAt: new Date().toISOString()
        }
      };

      const existingStage2Data = localStorage.getItem("stage2Records");
      const stage2Records = existingStage2Data ? JSON.parse(existingStage2Data) : [];

      stage2Records.push(stage2Data);
      localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

      // Remove from testRecords
      const existingTestRecords = localStorage.getItem("testRecords");
      if (existingTestRecords) {
        const testRecords = JSON.parse(existingTestRecords);
        const updatedTestRecords = testRecords.filter(
          (record: TestRecord) => record.id !== selectedRecord.id
        );
        localStorage.setItem("testRecords", JSON.stringify(updatedTestRecords));
      }

      toast({
        title: "✅ Stage 2 Submitted",
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
    return stage2Form.processStage.length > 0 &&
      stage2Form.type.length > 0 &&
      stage2Form.testName.length > 0 &&
      stage2Form.testCondition.length > 0 &&
      stage2Form.equipment.length > 0 &&
      stage2Form.checkpoint &&
      stage2Form.projects.length > 0 &&
      stage2Form.selectedParts.length > 0;
  };

  if (!selectedRecord) {
    return null;
  }

  const unselectedProjects = availableProjects.filter(
    project => !stage2Form.projects.includes(project)
  );

  const unselectedLines = availableLines.filter(
    line => !stage2Form.lines.includes(line)
  );

  const unselectedParts = availableParts.filter(
    part => !stage2Form.selectedParts.includes(part)
  );

  const unselectedProcessStages = processStages.filter(
    stage => !stage2Form.processStage.includes(stage)
  );

  const unselectedTypes = types.filter(
    type => !stage2Form.type.includes(type)
  );

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

          {/* Test Mode Selection */}
          <div className="space-y-2 md:col-span-2 mb-5">
            <Label htmlFor="testMode" className="text-base">
              Test Mode <span className="text-red-600">*</span>
            </Label>
            <Select
              value={testMode}
              onValueChange={(value: 'single' | 'multi') => {
                setTestMode(value);
                // Reset all fields when switching modes
                setStage2Form({
                  processStage: [],
                  type: [],
                  testName: [],
                  testCondition: [],
                  requiredQty: "",
                  equipment: [],
                  checkpoint: "",
                  startDateTime: "",
                  endDateTime: "",
                  remark: "",
                  projects: [],
                  lines: [],
                  selectedParts: []
                });
                setFilteredData([]);
                setAvailableTestNames([]);
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Test Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Test</SelectItem>
                <SelectItem value="multi">Multi Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stage 2 Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Process Stage Selection - Single or Multi */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="processStage" className="text-base">
                  Process Stage <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={stage2Form.processStage[0] || ""}
                  onValueChange={(value) => handleProcessStageSelection(value)}
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
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="processStage" className="text-base">
                    Process Stages <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllProcessStages}
                      disabled={stage2Form.processStage.length === processStages.length}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllProcessStages}
                      disabled={stage2Form.processStage.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <Select
                  onValueChange={handleProcessStageSelection}
                  disabled={unselectedProcessStages.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      stage2Form.processStage.length === processStages.length
                        ? "All stages selected"
                        : `Select from ${unselectedProcessStages.length} available stage(s)`
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {unselectedProcessStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {stage2Form.processStage.length} of {processStages.length} stages selected
                </p>

                {/* Selected Process Stages Display */}
                {stage2Form.processStage.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Process Stages
                      <span className="text-sm font-normal text-gray-500">
                        ({stage2Form.processStage.length} selected)
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.processStage.map((stage) => (
                        <div
                          key={stage}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{stage}</span>
                          <button
                            onClick={() => removeSelectedProcessStage(stage)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            title="Remove process stage"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type Selection - Single or Multi */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="type" className="text-base">
                  Type <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={stage2Form.type[0] || ""}
                  onValueChange={(value) => handleTypeSelection(value)}
                  disabled={stage2Form.processStage.length === 0}
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
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="type" className="text-base">
                    Types <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllTypes}
                      disabled={stage2Form.type.length === types.length || stage2Form.processStage.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllTypes}
                      disabled={stage2Form.type.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <Select
                  onValueChange={handleTypeSelection}
                  disabled={stage2Form.processStage.length === 0 || unselectedTypes.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      stage2Form.type.length === types.length
                        ? "All types selected"
                        : stage2Form.processStage.length === 0
                          ? "Select process stages first"
                          : `Select from ${unselectedTypes.length} available type(s)`
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {unselectedTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {stage2Form.type.length} of {types.length} types selected
                </p>

                {/* Selected Types Display */}
                {stage2Form.type.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Types
                      <span className="text-sm font-normal text-gray-500">
                        ({stage2Form.type.length} selected)
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.type.map((type) => (
                        <div
                          key={type}
                          className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{type}</span>
                          <button
                            onClick={() => removeSelectedType(type)}
                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                            title="Remove type"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test Name Selection - Single or Multi */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="testName" className="text-base">
                  Test Name <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={stage2Form.testName[0] || ""}
                  onValueChange={handleTestNameSelection}
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
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="testName" className="text-base">
                    Test Names <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllTestNames}
                      disabled={stage2Form.testName.length === availableTestNames.length}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllTestNames}
                      disabled={stage2Form.testName.length === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <Select
                  onValueChange={handleTestNameSelection}
                  disabled={availableTestNames.filter(name => !stage2Form.testName.includes(name)).length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      stage2Form.testName.length === availableTestNames.length
                        ? "All tests selected"
                        : `Select from ${availableTestNames.filter(name => !stage2Form.testName.includes(name)).length} available test(s)`
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTestNames
                      .filter(name => !stage2Form.testName.includes(name))
                      .map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {stage2Form.testName.length} of {availableTestNames.length} tests selected
                </p>

                {/* Selected Test Names Display */}
                {stage2Form.testName.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Test Names
                      <span className="text-sm font-normal text-gray-500">
                        ({stage2Form.testName.length} selected)
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.testName.map((name) => (
                        <div
                          key={name}
                          className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{name}</span>
                          <button
                            onClick={() => removeSelectedTestName(name)}
                            className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                            title="Remove test"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test Condition - Display only */}
            <div className="space-y-2">
              <Label htmlFor="testCondition" className="text-base">
                Test Condition {testMode === 'multi' && 's'} <span className="text-red-600">*</span>
              </Label>
              <Input
                id="testCondition"
                value={stage2Form.testCondition.join(', ')}
                placeholder={`Test condition${testMode === 'multi' ? 's' : ''} (auto-filled)`}
                className="h-11"
                disabled={true}
              />
            </div>

            {/* Equipment - Display only */}
            <div className="space-y-2">
              <Label htmlFor="equipment" className="text-base">
                Equipment {testMode === 'multi' && '(s)'}
              </Label>
              <Input
                id="equipment"
                value={stage2Form.equipment.join(', ')}
                placeholder={`Equipment${testMode === 'multi' ? '(s)' : ''} (auto-filled)`}
                disabled={true}
                className="h-11 bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkpoint" className="text-base">
                CheckPoint <span className="text-red-600">*</span>
              </Label>
              <Input
                id="checkpoint"
                type="number"
                value={stage2Form.checkpoint}
                onChange={(e) => setStage2Form(prev => ({ ...prev, checkpoint: e.target.value }))}
                placeholder="Enter the Hours"
                className="h-11"
              />
            </div>

            <DateTimePicker
              label="Start Date & Time"
              value={stage2Form.startDateTime}
              onChange={(val) => setStage2Form(prev => ({ ...prev, startDateTime: val }))}
            />

            <DateTimePicker
              label="End Date & Time"
              value={stage2Form.endDateTime}
              onChange={(val) => setStage2Form(prev => ({ ...prev, endDateTime: val }))}
            />

            {/* ORT Lab Data Selection Section */}
            <div className="space-y-2 md:col-span-2">
              {/* Projects Selection */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <Label htmlFor="projects" className="text-base">
                    Projects <span className="text-red-600">*</span>
                    {testMode === 'multi' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Single project only in multi-test mode)
                      </span>
                    )}
                  </Label>
                  {testMode === 'single' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllProjects}
                        disabled={stage2Form.projects.length === availableProjects.length}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllProjects}
                        disabled={stage2Form.projects.length === 0}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <Select
                  onValueChange={handleProjectSelection}
                  disabled={testMode === 'multi' && stage2Form.projects.length === 1}
                  value={testMode === 'multi' ? stage2Form.projects[0] : undefined}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      testMode === 'multi'
                        ? (stage2Form.projects.length === 1
                          ? stage2Form.projects[0]
                          : "Select one project")
                        : (unselectedProjects.length === 0
                          ? "All projects selected"
                          : `Select from ${unselectedProjects.length} available project(s)`)
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {testMode === 'multi' ? (
                      // Multi-test mode: show all projects
                      availableProjects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))
                    ) : (
                      // Single-test mode: show only unselected projects
                      unselectedProjects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {testMode === 'single' && (
                  <p className="text-xs text-gray-500">
                    {stage2Form.projects.length} of {availableProjects.length} projects selected
                  </p>
                )}

                {/* Selected Projects Display */}
                {stage2Form.projects.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Project{testMode === 'single' && 's'}
                      {testMode === 'single' && (
                        <span className="text-sm font-normal text-gray-500">
                          ({stage2Form.projects.length} selected)
                        </span>
                      )}
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.projects.map((project) => (
                        <div
                          key={project}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{project}</span>
                          <button
                            onClick={() => removeSelectedProject(project)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            title="Remove project"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lines Selection */}
              {availableLines.length > 0 && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="lines" className="text-base">
                      Lines
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllLines}
                        disabled={stage2Form.lines.length === availableLines.length}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllLines}
                        disabled={stage2Form.lines.length === 0}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <Select
                    onValueChange={handleLineSelection}
                    disabled={unselectedLines.length === 0}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={
                        unselectedLines.length === 0
                          ? "All lines selected"
                          : `Select from ${unselectedLines.length} available line(s)`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {unselectedLines.map((line) => (
                        <SelectItem key={line} value={line}>
                          {line}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {stage2Form.lines.length} of {availableLines.length} lines selected
                  </p>

                  {/* Selected Lines Display */}
                  {stage2Form.lines.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base flex items-center gap-2">
                        Selected Lines
                        <span className="text-sm font-normal text-gray-500">
                          ({stage2Form.lines.length} selected)
                        </span>
                      </Label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                        {stage2Form.lines.map((line) => (
                          <div
                            key={line}
                            className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{line}</span>
                            <button
                              onClick={() => removeSelectedLine(line)}
                              className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                              title="Remove line"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Parts Selection */}
              {availableParts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="parts" className="text-base">
                      Select Parts <span className="text-red-600">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllParts}
                        disabled={stage2Form.selectedParts.length === availableParts.length}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllParts}
                        disabled={stage2Form.selectedParts.length === 0}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <Select
                    onValueChange={handlePartSelection}
                    disabled={unselectedParts.length === 0}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={
                        unselectedParts.length === 0
                          ? "All parts selected"
                          : `Select from ${unselectedParts.length} available part(s)`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {unselectedParts.map((part) => (
                        <SelectItem key={part} value={part}>
                          <span className="font-mono">{part}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {stage2Form.selectedParts.length} of {availableParts.length} available parts selected
                    {availableParts.length > 0 && ` (Total in ORT Lab: ${getAvailablePartsCount()})`}
                  </p>

                  {/* Selected Parts Display */}
                  {stage2Form.selectedParts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base flex items-center gap-2">
                        Selected Parts
                        <span className="text-sm font-normal text-gray-500">
                          ({stage2Form.selectedParts.length} selected)
                        </span>
                      </Label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                        {stage2Form.selectedParts.map((part) => (
                          <div
                            key={part}
                            className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span className="font-mono">{part}</span>
                            <button
                              onClick={() => removeSelectedPart(part)}
                              className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                              title="Remove part"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-2">
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