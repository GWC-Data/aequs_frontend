 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import DateTimePicker from '@/components/DatePicker';
import { flaskData } from '@/data/flaskData';
 
interface TestRecord {
  ticketCode: string;
  documentTitle: string;
  project: string;
  color: string;
  testLocation: string;
  testStartDate: string;
  testCompletionDate: string;
  sampleConfig: string;
  status: string;
  id: number;
  createdAt: string;
}
 
interface OqcRecord {
  ticketCode: string;
  totalQuantity: string;
  assemblyAno: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  id: number;
  createdAt: string;
  barcodeAssignments?: Array<{
    id: string;
    timestamp: string;
    ticketId: number;
    ticketCode: string;
    serialNumber: string;
    partNumbers: string[];
    totalParts: number;
    rawBarcodeData?: string;  
  }>;
  assignedParts?: number;
  lastUpdated?: string;
}
 
interface ORTLabRecord {
  ticketCode: string;
  documentTitle: string;
  project: string;
  testLocation: string;
  submissionPartDate: string;
  sampleConfig: string;
  remarks: string;
  status: string;
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
 
const Stage2FormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;
  const [testMode, setTestMode] = useState<'single' | 'multi'>('single');
  const [filteredData, setFilteredData] = useState<typeof flaskData>([]);
  const [availableTestNames, setAvailableTestNames] = useState<string[]>([]);
  const [ortLabRecords, setOrtLabRecords] = useState<ORTLabRecord[]>([]);
 
  useEffect(() => {
    const stored = localStorage.getItem("ortLabRecords");
    if (stored) {
      try {
        const records: ORTLabRecord[] = JSON.parse(stored);
        setOrtLabRecords(records);
      } catch (err) {
        console.error("Failed to parse ORT records", err);
      }
    }
  }, []);
 
  // Fetch OQC data and auto-populate project, line, parts on mount
  const [oqcDataLoaded, setOqcDataLoaded] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(50);
 
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
    project: "",
    lines: [] as string[],
    selectedParts: [] as string[],
    ticketCode: selectedRecord?.ticketCode || "TICKET-001"
  });
 
  // 🔥 Load OQC data and populate project, line, parts ONCE on mount — NO PART GENERATION
  useEffect(() => {
    if (!selectedRecord?.ticketCode) return;
 
    const ticketCode = selectedRecord.ticketCode;
    const oqcDataStr = localStorage.getItem("Oqcformdata");
    const oqcRecords: OqcRecord[] = oqcDataStr ? JSON.parse(oqcDataStr) : [];
    console.log(oqcRecords)
    const oqcMatch = oqcRecords.find(rec => rec.ticketCode === ticketCode);
 
    let project = "";
    let lines: string[] = [];
    let selectedParts: string[] = [];
    let qty = 0;
 
    if (oqcMatch) {
      qty = parseInt(oqcMatch.totalQuantity, 10) || 0;
      project = oqcMatch.project || "";
      lines = [oqcMatch.source || ""];
 
      // ✅ ONLY use real partNumbers from barcodeAssignments — NO GENERATION
      const firstAssignment = oqcMatch.barcodeAssignments?.[0];
      if (firstAssignment && Array.isArray(firstAssignment.partNumbers)) {
        selectedParts = firstAssignment.partNumbers
          .filter(p => typeof p === 'string' && p.trim() !== '')
          .map(p => {
            // Convert "PART001" → "Part 001", keep others as-is
            const match = p.match(/^PART(\d+)$/i);
            if (match) {
              const num = parseInt(match[1], 10);
              return `Part ${String(num).padStart(3, '0')}`;
            }
            return p; // e.g., if it's already "Part 001" or custom name
          });
      }
      // ❌ Do NOT fall back to generateParts() — respect real data only
    }
 
    setTotalQuantity(qty);
    setStage2Form(prev => ({
      ...prev,
      project: project || "—",
      lines: lines.length > 0 && lines[0] ? lines : ["—"],
      selectedParts,
      ticketCode
    }));
    setOqcDataLoaded(true);
  }, [selectedRecord?.ticketCode]);
 
  const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
 
  const getFilteredTypes = () => {
    if (stage2Form.processStage.length === 0) return [];
    const filteredTypes = flaskData
      .filter(item => stage2Form.processStage.includes(item.processStage))
      .map(item => item.type);
    return Array.from(new Set(filteredTypes));
  };
 
  const types = getFilteredTypes();
 
  const handleProcessStageSelection = (stage: string) => {
    setStage2Form(prev => {
      if (testMode === 'multi') {
        const isSelected = prev.processStage.includes(stage);
        const newProcessStages = isSelected
          ? prev.processStage.filter(s => s !== stage)
          : [...prev.processStage, stage];
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
      equipment: [],
      requiredQty: ""
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
      equipment: [],
      requiredQty: ""
    }));
    setFilteredData([]);
    setAvailableTestNames([]);
  };
 
  const handleTypeSelection = (type: string) => {
    setStage2Form(prev => {
      if (testMode === 'multi') {
        const isSelected = prev.type.includes(type);
        const newTypes = isSelected
          ? prev.type.filter(t => t !== type)
          : [...prev.type, type];
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
          equipment: [],
          requiredQty: ""
        };
      } else {
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
          equipment: [],
          requiredQty: ""
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
        equipment: [],
        requiredQty: ""
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
      equipment: [],
      requiredQty: ""
    }));
    setFilteredData([]);
    setAvailableTestNames([]);
  };
 
  const handleTestNameSelection = (testName: string) => {
    if (!oqcDataLoaded) return;
 
    if (testMode === 'single') {
      const selectedTest = filteredData.find(item => item.testName === testName);
      if (selectedTest) {
        const equipmentList = selectedTest.equipment.split(',').map(eq => eq.trim());
        const numEquipment = equipmentList.length;
        const qtyPerEquipment = numEquipment > 0 ? Math.ceil(totalQuantity / numEquipment) : 0;
        const requiredQtyStr = Array(numEquipment).fill(qtyPerEquipment).join(', ');
 
        setStage2Form(prev => ({
          ...prev,
          testName: [testName],
          equipment: equipmentList,
          testCondition: [selectedTest.testCondition || ""],
          requiredQty: requiredQtyStr
        }));
      }
    } else {
      setStage2Form(prev => {
        const isSelected = prev.testName.includes(testName);
        const newTestNames = isSelected
          ? prev.testName.filter(t => t !== testName)
          : [...prev.testName, testName];
 
        const equipmentList: string[] = [];
        const conditionList: string[] = [];
 
        newTestNames.forEach(name => {
          const test = filteredData.find(item => item.testName === name);
          if (test) {
            const eqs = test.equipment.split(',').map(eq => eq.trim());
            equipmentList.push(...eqs);
            conditionList.push(...Array(eqs.length).fill(test.testCondition || ""));
          }
        });
 
        const totalEquipment = equipmentList.length;
        const qtyPerEquipment = totalEquipment > 0 ? Math.ceil(totalQuantity / totalEquipment) : 0;
        const requiredQtyStr = Array(totalEquipment).fill(qtyPerEquipment).join(', ');
 
        return {
          ...prev,
          testName: newTestNames,
          equipment: equipmentList,
          testCondition: conditionList,
          requiredQty: requiredQtyStr
        };
      });
    }
  };
 
  const removeSelectedTestName = (testName: string) => {
    setStage2Form(prev => {
      const newTestNames = prev.testName.filter(t => t !== testName);
      if (newTestNames.length === 0) {
        return {
          ...prev,
          testName: [],
          equipment: [],
          testCondition: [],
          requiredQty: ""
        };
      }
 
      const equipmentList: string[] = [];
      const conditionList: string[] = [];
 
      newTestNames.forEach(name => {
        const test = filteredData.find(item => item.testName === name);
        if (test) {
          const eqs = test.equipment.split(',').map(eq => eq.trim());
          equipmentList.push(...eqs);
          conditionList.push(...Array(eqs.length).fill(test.testCondition || ""));
        }
      });
 
      const totalEquipment = equipmentList.length;
      const qtyPerEquipment = totalEquipment > 0 ? Math.ceil(totalQuantity / totalEquipment) : 0;
      const requiredQtyStr = Array(totalEquipment).fill(qtyPerEquipment).join(', ');
 
      return {
        ...prev,
        testName: newTestNames,
        equipment: equipmentList,
        testCondition: conditionList,
        requiredQty: requiredQtyStr
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
        const eqs = test.equipment.split(',').map(eq => eq.trim());
        equipmentList.push(...eqs);
        conditionList.push(...Array(eqs.length).fill(test.testCondition || ""));
      }
    });
 
    const totalEquipment = equipmentList.length;
    const qtyPerEquipment = totalEquipment > 0 ? Math.ceil(totalQuantity / totalEquipment) : 0;
    const requiredQtyStr = Array(totalEquipment).fill(qtyPerEquipment).join(', ');
 
    setStage2Form(prev => ({
      ...prev,
      testName: allTestNames,
      equipment: equipmentList,
      testCondition: conditionList,
      requiredQty: requiredQtyStr
    }));
  };
 
  const clearAllTestNames = () => {
    setStage2Form(prev => ({
      ...prev,
      testName: [],
      equipment: [],
      testCondition: [],
      requiredQty: ""
    }));
  };
 
  const handleStage2Submit = () => {
    if (!selectedRecord) return;
    if (
      stage2Form.processStage.length === 0 ||
      stage2Form.type.length === 0 ||
      stage2Form.testName.length === 0 ||
      stage2Form.testCondition.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        duration: 2000,
      });
      return;
    }
    if (!stage2Form.project) {
      toast({
        variant: "destructive",
        title: "Missing Project",
        description: "Project could not be loaded.",
        duration: 2000,
      });
      return;
    }
    if (stage2Form.selectedParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Selected",
        description: "Parts could not be generated.",
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
          project: stage2Form.project,
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
    return (
      stage2Form.processStage.length > 0 &&
      stage2Form.type.length > 0 &&
      stage2Form.testName.length > 0 &&
      stage2Form.testCondition.length > 0 &&
      stage2Form.equipment.length > 0 &&
      stage2Form.checkpoint !== "" &&
      stage2Form.project !== "" &&
      stage2Form.selectedParts.length > 0
    );
  };
 
  if (!selectedRecord) {
    return null;
  }
 
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
          <div className="space-y-2 md:col-span-2 mb-5">
            <Label htmlFor="testMode" className="text-base">
              Test Mode <span className="text-red-600">*</span>
            </Label>
            <select
              value={testMode}
              onChange={(e) => {
                const value = e.target.value as 'single' | 'multi';
                setTestMode(value);
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
                  project: stage2Form.project,
                  lines: stage2Form.lines,
                  selectedParts: stage2Form.selectedParts,
                  ticketCode: stage2Form.ticketCode
                });
                setFilteredData([]);
                setAvailableTestNames([]);
              }}
              className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
            >
              <option value="single">Single Test</option>
              <option value="multi">Multi Test</option>
            </select>
          </div>
 
          <div className="space-y-2 mb-4">
            <Label className="text-base">Ticket Code <span className="text-red-600">*</span></Label>
            <Input
              value={stage2Form.ticketCode}
              disabled
              className="h-11 bg-gray-100"
            />
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Process Stage */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label className="text-base">Process Stage <span className="text-red-600">*</span></Label>
                <select
                  value={stage2Form.processStage[0] || ""}
                  onChange={(e) => handleProcessStageSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                >
                  <option value="">Select Process Stage</option>
                  {processStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Process Stages <span className="text-red-600">*</span></Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllProcessStages} disabled={stage2Form.processStage.length === processStages.length}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllProcessStages} disabled={stage2Form.processStage.length === 0}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <select
                  onChange={(e) => handleProcessStageSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  disabled={unselectedProcessStages.length === 0}
                >
                  <option value="">
                    {stage2Form.processStage.length === processStages.length
                      ? "All stages selected"
                      : `Select from ${unselectedProcessStages.length} available stage(s)`}
                  </option>
                  {unselectedProcessStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {stage2Form.processStage.length} of {processStages.length} stages selected
                </p>
                {stage2Form.processStage.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Process Stages
                      <span className="text-sm font-normal text-gray-500">({stage2Form.processStage.length} selected)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.processStage.map(stage => (
                        <div key={stage} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {stage}
                          <button onClick={() => removeSelectedProcessStage(stage)} className="hover:bg-blue-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
 
            {/* Type */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label className="text-base">Type <span className="text-red-600">*</span></Label>
                <select
                  value={stage2Form.type[0] || ""}
                  onChange={(e) => handleTypeSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  disabled={stage2Form.processStage.length === 0}
                >
                  <option value="">Select Type</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Types <span className="text-red-600">*</span></Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllTypes} disabled={stage2Form.type.length === types.length || stage2Form.processStage.length === 0}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllTypes} disabled={stage2Form.type.length === 0}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <select
                  onChange={(e) => handleTypeSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  disabled={stage2Form.processStage.length === 0 || unselectedTypes.length === 0}
                >
                  <option value="">
                    {stage2Form.type.length === types.length
                      ? "All types selected"
                      : stage2Form.processStage.length === 0
                        ? "Select process stages first"
                        : `Select from ${unselectedTypes.length} available type(s)`}
                  </option>
                  {unselectedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {stage2Form.type.length} of {types.length} types selected
                </p>
                {stage2Form.type.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Types
                      <span className="text-sm font-normal text-gray-500">({stage2Form.type.length} selected)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.type.map(type => (
                        <div key={type} className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {type}
                          <button onClick={() => removeSelectedType(type)} className="hover:bg-green-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
 
            {/* Test Name */}
            {testMode === 'single' ? (
              <div className="space-y-2">
                <Label className="text-base">Test Name <span className="text-red-600">*</span></Label>
                <select
                  value={stage2Form.testName[0] || ""}
                  onChange={(e) => handleTestNameSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  disabled={availableTestNames.length === 0}
                >
                  <option value="">Select Test Name</option>
                  {availableTestNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Test Names <span className="text-red-600">*</span></Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllTestNames} disabled={stage2Form.testName.length === availableTestNames.length}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllTestNames} disabled={stage2Form.testName.length === 0}>
                      Clear All
                    </Button>
                  </div>
                </div>
                <select
                  onChange={(e) => handleTestNameSelection(e.target.value)}
                  className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  disabled={availableTestNames.filter(n => !stage2Form.testName.includes(n)).length === 0}
                >
                  <option value="">
                    {stage2Form.testName.length === availableTestNames.length
                      ? "All tests selected"
                      : `Select from ${availableTestNames.filter(n => !stage2Form.testName.includes(n)).length} available test(s)`}
                  </option>
                  {availableTestNames
                    .filter(n => !stage2Form.testName.includes(n))
                    .map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">
                  {stage2Form.testName.length} of {availableTestNames.length} tests selected
                </p>
                {stage2Form.testName.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base flex items-center gap-2">
                      Selected Test Names
                      <span className="text-sm font-normal text-gray-500">({stage2Form.testName.length} selected)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border min-h-[3rem]">
                      {stage2Form.testName.map(name => (
                        <div key={name} className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                          {name}
                          <button onClick={() => removeSelectedTestName(name)} className="hover:bg-amber-200 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
 
            <div className="space-y-2">
              <Label className="text-base">
                Test Condition{testMode === 'multi' && 's'} <span className="text-red-600">*</span>
              </Label>
              <Input
                value={stage2Form.testCondition.join(', ')}
                placeholder={`Test condition${testMode === 'multi' ? 's' : ''} (auto-filled)`}
                disabled
                className="h-11"
              />
            </div>
 
            <div className="space-y-2">
              <Label className="text-base">Equipment{testMode === 'multi' && '(s)'}</Label>
              <Input
                value={stage2Form.equipment.join(', ')}
                placeholder={`Equipment${testMode === 'multi' ? '(s)' : ''} (auto-filled)`}
                disabled
                className="h-11 bg-gray-50"
              />
            </div>
 
            <div className="space-y-2">
              <Label className="text-base">Required Quantity per Equipment</Label>
              <Input
                value={stage2Form.requiredQty}
                placeholder={`Auto-calculated based on ${totalQuantity} total parts`}
                disabled
                className="h-11 bg-gray-50"
              />
            </div>
 
            <div className="space-y-2">
              <Label className="text-base">CheckPoint <span className="text-red-600">*</span></Label>
              <Input
                type="number"
                value={stage2Form.checkpoint}
                onChange={(e) => setStage2Form(prev => ({ ...prev, checkpoint: e.target.value }))}
                placeholder="Enter the Hours"
                className="h-11"
              />
            </div>
 
            <DateTimePicker
              label="Start Date & Time"
              value={stage2Form.startDateTime ? new Date(stage2Form.startDateTime) : null}
              onChange={(val) => setStage2Form(prev => ({ ...prev, startDateTime: val ? val.toISOString() : "" }))}
            />
 
            <DateTimePicker
              label="End Date & Time"
              value={stage2Form.endDateTime ? new Date(stage2Form.endDateTime) : null}
              onChange={(val) => setStage2Form(prev => ({ ...prev, endDateTime: val ? val.toISOString() : "" }))}
            />
 
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <Label className="text-base">Project <span className="text-red-600">*</span></Label>
                <Input
                  value={stage2Form.project}
                  disabled
                  className="h-11 bg-gray-100"
                />
              </div>
 
              <div className="space-y-2">
                <Label className="text-base">Line</Label>
                <Input
                  value={stage2Form.lines[0] || "—"}
                  disabled
                  className="h-11 bg-gray-100"
                />
              </div>
 
              <div className="space-y-2">
                <Label className="text-base">Parts <span className="text-red-600">*</span></Label>
                <div className="p-3 bg-gray-50 rounded-lg border min-h-[3rem]">
                  {stage2Form.selectedParts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {stage2Form.selectedParts.map(part => (
                        <span
                          key={part}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-mono"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Loading parts...</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {stage2Form.selectedParts.length} part(s) loaded
                </p>
              </div>
            </div>
          </div>
 
          <div className="flex justify-end gap-4 mt-8 pt-2">
            <Button variant="outline" onClick={() => navigate("/")} className="px-6">
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
 
export default Stage2FormPage;
 