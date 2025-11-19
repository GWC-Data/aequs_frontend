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
// import { Checkbox } from "@/components/ui/checkbox";
// import { Eye, Edit, Trash2 } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
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

// const LiveTestProgress: React.FC = () => {
//   const [testRecords, setTestRecords] = React.useState<TestRecord[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [checkedItems, setCheckedItems] = React.useState<{ [key: number]: boolean }>({});
//   const [editingRecord, setEditingRecord] = React.useState<TestRecord | null>(null);
//   const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
//   const navigate = useNavigate();

//   React.useEffect(() => {
//     const loadTestRecords = () => {
//       try {
//         const storedRecords = localStorage.getItem("testRecords");
//         if (storedRecords) {
//           const records = JSON.parse(storedRecords);
//           setTestRecords(Array.isArray(records) ? records : []);
//         } else {
//           setTestRecords([]);
//         }
//       } catch (error) {
//         console.error("Error loading test records:", error);
//         setTestRecords([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTestRecords();
//     window.addEventListener("storage", loadTestRecords);
//     return () => window.removeEventListener("storage", loadTestRecords);
//   }, []);

//   const handleCheck = (id: number) => {
//     setCheckedItems((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const handleDelete = (id: number) => {
//     const updatedRecords = testRecords.filter((record) => record.id !== id);
//     setTestRecords(updatedRecords);
//     localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
//   };

//   const handleView = (id: number) => {
//     navigate(`/author`);
//   };

//   const handleEdit = (record: TestRecord) => {
//     setEditingRecord({ ...record });
//     setIsEditModalOpen(true);
//   };

//   // const handleSaveEdit = () => {
//   //   if (!editingRecord) return;

//   //   const updatedRecords = testRecords.map((record) =>
//   //     record.id === editingRecord.id ? editingRecord : record
//   //   );

//   //   setTestRecords(updatedRecords);
//   //   localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
//   //   setIsEditModalOpen(false);
//   //   setEditingRecord(null);
//   // };


//   const handleSaveEdit = () => {
//     if (!editingRecord) return;

//     try {
//       const updatedRecords = testRecords.map((record) =>
//         record.id === editingRecord.id ? editingRecord : record
//       );

//       setTestRecords(updatedRecords);
//       localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
//       setIsEditModalOpen(false);
//       setEditingRecord(null);

//       // Success toast
//       toast({
//         title: "✅ Record Updated",
//         description: `Record has been updated successfully!`,
//         duration: 3000,
//       });

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

//   const handleInputChange = (field: keyof TestRecord, value: string) => {
//     if (!editingRecord) return;

//     setEditingRecord(prev => prev ? { ...prev, [field]: value } : null);
//   };

//   const formatTestName = (testName: string | string[]): string => {
//     if (Array.isArray(testName)) {
//       return testName.join(", ");
//     }
//     return testName;
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardHeader>
//           <div className="flex items-center gap-2">
//             <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//             <CardTitle className="text-lg font-bold">Live Test Progress</CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border h-[300px] flex items-center justify-center">
//             <div className="text-gray-500">Loading test records...</div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       <Card className="mt-6 max-w-6xl mx-auto">
//         <CardHeader>
//           <div className="flex items-center gap-2">
//             <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//             <CardTitle className="text-lg font-bold">Live Test Checklist</CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border h-[300px] overflow-y-auto">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader className="sticky top-0 bg-white">
//                   <TableRow className="bg-gray-50">
//                     <TableHead className="font-semibold w-[40px] text-center">#</TableHead>
//                     <TableHead className="font-semibold w-[40px] text-center">✔</TableHead>
//                     <TableHead className="font-semibold">Test Details</TableHead>
//                     <TableHead className="font-semibold">Project</TableHead>
//                     <TableHead className="font-semibold">Timeline</TableHead>
//                     <TableHead className="font-semibold text-center w-[120px]">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {testRecords.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center py-8 text-gray-500">
//                         No test records found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     testRecords.map((record, index) => (
//                       <TableRow
//                         key={record.id}
//                         className={`hover:bg-gray-50 ${checkedItems[record.id] ? "bg-green-50" : ""}`}
//                       >
//                         <TableCell className="text-sm text-gray-500 text-center">
//                           {index + 1}
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <Checkbox
//                             checked={checkedItems[record.id] || false}
//                             onCheckedChange={() => handleCheck(record.id)}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <div
//                               className="h-3 w-3 rounded-full flex-shrink-0"
//                               style={{
//                                 backgroundColor:
//                                   record.color === "white" ? "#e5e5e5" : record.color || "#6b7280",
//                               }}
//                             ></div>
//                             <div>
//                               {/* <div className="font-semibold">{formatTestName(record.testName)}</div> */}
//                               <div className="text-xs text-gray-500">
//                                 Doc: {record.documentNumber} • {record.testLocation}
//                               </div>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-sm">{record.projectName}</TableCell>
//                         <TableCell className="text-xs">
//                           <div>Start: {new Date(record.testStartDate).toLocaleDateString()}</div>
//                           <div>End: {new Date(record.testCompletionDate).toLocaleDateString()}</div>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <div className="flex items-center justify-center gap-3">
//                             <Eye
//                               size={18}
//                               className="cursor-pointer text-blue-600 hover:text-blue-800"
//                               onClick={() => handleView(record.id)}
//                               title="View"
//                             />
//                             <Edit
//                               size={18}
//                               className="cursor-pointer text-yellow-600 hover:text-yellow-800"
//                               onClick={() => handleEdit(record)}
//                               title="Edit"
//                             />
//                             <Trash2
//                               size={18}
//                               className="cursor-pointer text-red-600 hover:text-red-800"
//                               onClick={() => handleDelete(record.id)}
//                               title="Delete"
//                             />
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

//       {/* Edit Modal */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen} >
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
//           <DialogHeader>
//             <DialogTitle>Edit Test Record</DialogTitle>
//           </DialogHeader>

//           {editingRecord && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 bg-white">
//               {/* Test Name */}
//               {/* <div className="space-y-2">
//                 <Label htmlFor="testName">Test Name</Label>
//                 <Input
//                   id="testName"
//                   value={formatTestName(editingRecord.testName)}
//                   onChange={(e) => handleInputChange('testName', e.target.value)}
//                 />
//               </div> */}

//               {/* Document Number */}
//               <div className="space-y-2">
//                 <Label htmlFor="documentNumber">Document Number</Label>
//                 <Input
//                   id="documentNumber"
//                   value={editingRecord.documentNumber}
//                   onChange={(e) => handleInputChange('documentNumber', e.target.value)}
//                 />
//               </div>

//               {/* Document Title */}
//               <div className="space-y-2">
//                 <Label htmlFor="documentTitle">Document Title</Label>
//                 <Input
//                   id="documentTitle"
//                   value={editingRecord.documentTitle}
//                   onChange={(e) => handleInputChange('documentTitle', e.target.value)}
//                 />
//               </div>

//               {/* Project Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="projectName">Project Name</Label>
//                 <Input
//                   id="projectName"
//                   value={editingRecord.projectName}
//                   onChange={(e) => handleInputChange('projectName', e.target.value)}
//                 />
//               </div>

//               {/* Color */}
//               <div className="space-y-2">
//                 <Label htmlFor="color">Color</Label>
//                 <Input
//                   id="color"
//                   value={editingRecord.color}
//                   onChange={(e) => handleInputChange('color', e.target.value)}
//                 />
//               </div>

//               {/* Test Location */}
//               <div className="space-y-2">
//                 <Label htmlFor="testLocation">Test Location</Label>
//                 <Input
//                   id="testLocation"
//                   value={editingRecord.testLocation}
//                   onChange={(e) => handleInputChange('testLocation', e.target.value)}
//                 />
//               </div>

//               {/* Sample Quantity */}
//               {/* <div className="space-y-2">
//                 <Label htmlFor="sampleQty">Sample Quantity</Label>
//                 <Input
//                   id="sampleQty"
//                   value={editingRecord.sampleQty}
//                   onChange={(e) => handleInputChange('sampleQty', e.target.value)}
//                 />
//               </div> */}

//               {/* Test Start Date */}
//               <div className="space-y-2">
//                 <Label htmlFor="testStartDate">Test Start Date</Label>
//                 <Input
//                   id="testStartDate"
//                   type="date"
//                   value={editingRecord.testStartDate}
//                   onChange={(e) => handleInputChange('testStartDate', e.target.value)}
//                 />
//               </div>

//               {/* Test Completion Date */}
//               <div className="space-y-2">
//                 <Label htmlFor="testCompletionDate">Test Completion Date</Label>
//                 <Input
//                   id="testCompletionDate"
//                   type="date"
//                   value={editingRecord.testCompletionDate}
//                   onChange={(e) => handleInputChange('testCompletionDate', e.target.value)}
//                 />
//               </div>

//               {/* Sample Configuration */}
//               <div className="space-y-2">
//                 <Label htmlFor="sampleConfig">Sample Configuration</Label>
//                 <Input
//                   id="sampleConfig"
//                   value={editingRecord.sampleConfig}
//                   onChange={(e) => handleInputChange('sampleConfig', e.target.value)}
//                 />
//               </div>

//               {/* Test Condition */}
//               {/* <div className="space-y-2">
//                 <Label htmlFor="testCondition">Test Condition</Label>
//                 <Input
//                   id="testCondition"
//                   value={editingRecord.testCondition}
//                   onChange={(e) => handleInputChange('testCondition', e.target.value)}
//                 />
//               </div> */}

//               {/* Status Dropdown */}
//               <div className="space-y-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   value={editingRecord.status}
//                   onValueChange={(value) => handleInputChange('status', value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Received">Received</SelectItem>
//                     <SelectItem value="In-progress">In Progress</SelectItem>
//                     <SelectItem value="Completed">Completed</SelectItem>
//                   </SelectContent>
//                 </Select>
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
//     </>
//   );
// };

// export default LiveTestProgress;

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
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";
import { flaskData } from "@/data/flaskData";

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

const LiveTestProgress: React.FC = () => {
  const [testRecords, setTestRecords] = React.useState<TestRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkedItems, setCheckedItems] = React.useState<{ [key: number]: boolean }>({});
  const [editingRecord, setEditingRecord] = React.useState<TestRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isStage2ModalOpen, setIsStage2ModalOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<TestRecord | null>(null);
  const [filteredData, setFilteredData] = React.useState<typeof flaskData>([]);
  const [stage2Form, setStage2Form] = React.useState({
    processStage: "",
    type: "",
    testName: "",
    testCondition: "",
    requiredQty: "",
    equipment: ""
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadTestRecords = () => {
      try {
        const storedRecords = localStorage.getItem("testRecords");
        if (storedRecords) {
          const records = JSON.parse(storedRecords);
          setTestRecords(Array.isArray(records) ? records : []);
        } else {
          setTestRecords([]);
        }
      } catch (error) {
        console.error("Error loading test records:", error);
        setTestRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestRecords();
    window.addEventListener("storage", loadTestRecords);
    return () => window.removeEventListener("storage", loadTestRecords);
  }, []);

  const handleCheck = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = (id: number) => {
    const updatedRecords = testRecords.filter((record) => record.id !== id);
    setTestRecords(updatedRecords);
    localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
  };

  const handleView = (id: number) => {
    navigate(`/author`);
  };

  const handleEdit = (record: TestRecord) => {
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;

    try {
      const updatedRecords = testRecords.map((record) =>
        record.id === editingRecord.id ? editingRecord : record
      );

      setTestRecords(updatedRecords);
      localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
      setIsEditModalOpen(false);
      setEditingRecord(null);

      toast({
        title: "✅ Record Updated",
        description: `Record has been updated successfully!`,
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

  const handleInputChange = (field: keyof TestRecord, value: string) => {
    if (!editingRecord) return;
    setEditingRecord(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Update the handleStage2Click function to reset filteredData
  const handleStage2Click = (record: TestRecord) => {
    setSelectedRecord(record);
    setIsStage2ModalOpen(true);
    // Reset form when opening modal
    setStage2Form({
      processStage: "",
      type: "",
      testName: "",
      testCondition: "",
      requiredQty: "",
      equipment: ""
    });
    setFilteredData([]);
  };


  // Update the handleStage2InputChange function
  const handleStage2InputChange = (field: keyof typeof stage2Form, value: string) => {
    setStage2Form(prev => ({
      ...prev,
      [field]: value
    }));

    // Filter data when both processStage and type are selected
    if (field === "processStage" || field === "type") {
      const { processStage, type } = field === "processStage"
        ? { processStage: value, type: stage2Form.type }
        : { processStage: stage2Form.processStage, type: value };

      if (processStage && type) {
        const matchedData = flaskData.filter(
          item => item.processStage === processStage && item.type === type
        );

        setFilteredData(matchedData);

        // Auto-populate fields with comma-separated values from all matches
        if (matchedData.length > 0) {
          const testNames = matchedData.map(item => item.testName).join(", ");
          const testConditions = matchedData.map(item => item.testCondition).join(", ");
          const requiredQtys = matchedData.map(item => item.requiredQty).join(", ");
          const equipments = matchedData.map(item => item.equipment).join(", ");

          setStage2Form(prev => ({
            ...prev,
            testName: testNames,
            testCondition: testConditions,
            requiredQty: requiredQtys,
            equipment: equipments
          }));
        } else {
          // Clear fields if no matches
          setStage2Form(prev => ({
            ...prev,
            testName: "",
            testCondition: "",
            requiredQty: "",
            equipment: ""
          }));
        }
      } else {
        // Clear filtered data if either field is empty
        setFilteredData([]);
        setStage2Form(prev => ({
          ...prev,
          testName: "",
          testCondition: "",
          requiredQty: "",
          equipment: ""
        }));
      }
    }
  };

  const handleStage2Submit = () => {
    if (!selectedRecord) return;

    try {
      // Create the stage 2 data object with all fields
      const stage2Data = {
        ...selectedRecord, // Include all existing record data
        stage2: {
          processStage: stage2Form.processStage,
          type: stage2Form.type,
          testName: stage2Form.testName,
          testCondition: stage2Form.testCondition,
          requiredQty: stage2Form.requiredQty,
          equipment: stage2Form.equipment,
          submittedAt: new Date().toISOString()
        }
      };

      // Get existing stage2 records from localStorage
      const existingStage2Data = localStorage.getItem("stage2Records");
      const stage2Records = existingStage2Data ? JSON.parse(existingStage2Data) : [];

      // Add new stage2 record
      stage2Records.push(stage2Data);

      // Save back to localStorage
      localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

      // Also update the main test record status if needed
      const updatedTestRecords = testRecords.map(record =>
        record.id === selectedRecord.id
          ? { ...record, status: "In-progress" } // Optional: update status
          : record
      );

      setTestRecords(updatedTestRecords);
      localStorage.setItem("testRecords", JSON.stringify(updatedTestRecords));

      console.log("Stage 2 submitted:", stage2Data);

      toast({
        title: "✅ Stage 2 Submitted",
        description: `Stage 2 data has been saved successfully!`,
        duration: 3000,
      });

      // Close modal and navigate to /author
      setIsStage2ModalOpen(false);
      //navigate('/author');

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
      stage2Form.equipment;
  };

  // Get unique process stages and types for dropdowns
  const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
  const types = Array.from(new Set(flaskData.map(item => item.type)));

  const formatTestName = (testName: string | string[]): string => {
    if (Array.isArray(testName)) {
      return testName.join(", ");
    }
    return testName;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <CardTitle className="text-lg font-bold">Live Test Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Loading test records...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <CardTitle className="text-lg font-bold">Live Test Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border h-[300px] overflow-y-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold w-[40px] text-center">#</TableHead>
                    <TableHead className="font-semibold w-[40px] text-center">✔</TableHead>
                    <TableHead className="font-semibold">Test Details</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Timeline</TableHead>
                    <TableHead className="font-semibold text-center w-[120px]">Action</TableHead>
                    {testRecords.some(record => record.status === "Received") && (
                      <TableHead className="font-semibold text-center w-[120px]">Stage 2</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={testRecords.some(record => record.status === "Received") ? 7 : 6}
                        className="text-center py-8 text-gray-500"
                      >
                        No test records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    testRecords.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={`hover:bg-gray-50 ${checkedItems[record.id] ? "bg-green-50" : ""}`}
                      >
                        <TableCell className="text-sm text-gray-500 text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={checkedItems[record.id] || false}
                            onCheckedChange={() => handleCheck(record.id)}
                          />
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
                              <div className="text-xs text-gray-500">
                                Doc: {record.documentNumber} • {record.testLocation}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.projectName}</TableCell>
                        <TableCell className="text-xs">
                          <div>Start: {new Date(record.testStartDate).toLocaleDateString()}</div>
                          <div>End: {new Date(record.testCompletionDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            {/* <Eye
                              size={18}
                              className="cursor-pointer text-blue-600 hover:text-blue-800"
                              onClick={() => handleView(record.id)}
                              title="View"
                            /> */}
                            <Edit
                              size={18}
                              className="cursor-pointer text-yellow-600 hover:text-yellow-800"
                              onClick={() => handleEdit(record)}
                              title="Edit"
                            />
                            <Trash2
                              size={18}
                              className="cursor-pointer text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(record.id)}
                              title="Delete"
                            />
                          </div>
                        </TableCell>
                        {testRecords.some(r => r.status === "Received") && (
                          <TableCell className="text-center">
                            {record.status === "Received" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStage2Click(record)}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                              >
                                Stage 2
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit Test Record</DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 bg-white">
              {/* Document Number */}
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Document Number</Label>
                <Input
                  id="documentNumber"
                  value={editingRecord.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                />
              </div>

              {/* Document Title */}
              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title</Label>
                <Input
                  id="documentTitle"
                  value={editingRecord.documentTitle}
                  onChange={(e) => handleInputChange('documentTitle', e.target.value)}
                />
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={editingRecord.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={editingRecord.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              {/* Test Location */}
              <div className="space-y-2">
                <Label htmlFor="testLocation">Test Location</Label>
                <Input
                  id="testLocation"
                  value={editingRecord.testLocation}
                  onChange={(e) => handleInputChange('testLocation', e.target.value)}
                />
              </div>

              {/* Test Start Date */}
              <div className="space-y-2">
                <Label htmlFor="testStartDate">Test Start Date</Label>
                <Input
                  id="testStartDate"
                  type="date"
                  value={editingRecord.testStartDate}
                  onChange={(e) => handleInputChange('testStartDate', e.target.value)}
                />
              </div>

              {/* Test Completion Date */}
              <div className="space-y-2">
                <Label htmlFor="testCompletionDate">Test Completion Date</Label>
                <Input
                  id="testCompletionDate"
                  type="date"
                  value={editingRecord.testCompletionDate}
                  onChange={(e) => handleInputChange('testCompletionDate', e.target.value)}
                />
              </div>

              {/* Sample Configuration */}
              <div className="space-y-2">
                <Label htmlFor="sampleConfig">Sample Configuration</Label>
                <Input
                  id="sampleConfig"
                  value={editingRecord.sampleConfig}
                  onChange={(e) => handleInputChange('sampleConfig', e.target.value)}
                />
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingRecord.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="In-progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Stage 2 Modal */}
      <Dialog open={isStage2ModalOpen} onOpenChange={setIsStage2ModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Stage 2 - Test Configuration</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 bg-white">
            {/* Process Stage Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="processStage">Process Stage *</Label>
              <Select
                value={stage2Form.processStage}
                onValueChange={(value) => handleStage2InputChange('processStage', value)}
              >
                <SelectTrigger>
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

            {/* Type Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={stage2Form.type}
                onValueChange={(value) => handleStage2InputChange('type', value)}
              >
                <SelectTrigger>
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

            {/* Auto-populated fields as comment boxes */}
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name</Label>
              <div className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">
                  {stage2Form.testName || "No test names available"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testCondition">Test Condition</Label>
              <div className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">
                  {stage2Form.testCondition || "No test conditions available"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredQty">Required Quantity</Label>
              <div className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">
                  {stage2Form.requiredQty || "No quantities available"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <div className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-gray-50 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">
                  {stage2Form.equipment || "No equipment available"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStage2ModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStage2Submit}
              disabled={!isStage2SubmitEnabled()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit 
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveTestProgress;