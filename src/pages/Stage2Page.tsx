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

interface SplitRow {
  quantity: string;
  buildProject: string;
  line: string;
  assignedParts: string[];
}

interface ORTLabRecord {
  documentNumber: string;
  id: number;
  ortLab: {
    date: string;
    serialNumber: string;
    partNumbers: string[];
    splitRows: SplitRow[];
    remark: string;
    submittedAt: string;
  };
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
        
        // Extract unique projects
        const projects = new Set<string>();
        records.forEach(record => {
          record.ortLab.splitRows.forEach(row => {
            projects.add(row.buildProject);
          });
        });
        setAvailableProjects(Array.from(projects));
      }
    } catch (error) {
      console.error("Error loading ORT Lab records:", error);
    }
  };

  // Update lines when projects change
  useEffect(() => {
    if (stage2Form.projects.length > 0) {
      const lines = new Set<string>();
      const parts: string[] = [];

      ortLabRecords.forEach(record => {
        record.ortLab.splitRows.forEach(row => {
          if (stage2Form.projects.includes(row.buildProject)) {
            lines.add(row.line);
            parts.push(...row.assignedParts);
          }
        });
      });

      setAvailableLines(Array.from(lines));
      setAvailableParts(parts);
      
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

  // Filter parts when lines change
  useEffect(() => {
    if (stage2Form.projects.length > 0 && stage2Form.lines.length > 0) {
      const parts: string[] = [];

      ortLabRecords.forEach(record => {
        record.ortLab.splitRows.forEach(row => {
          if (stage2Form.projects.includes(row.buildProject) && 
              stage2Form.lines.includes(row.line)) {
            parts.push(...row.assignedParts);
          }
        });
      });

      setAvailableParts(parts);
      
      // Reset selected parts when lines change
      setStage2Form(prev => ({
        ...prev,
        selectedParts: []
      }));
    } else if (stage2Form.projects.length > 0) {
      // If only projects are selected, show all parts from selected projects
      const parts: string[] = [];
      ortLabRecords.forEach(record => {
        record.ortLab.splitRows.forEach(row => {
          if (stage2Form.projects.includes(row.buildProject)) {
            parts.push(...row.assignedParts);
          }
        });
      });
      setAvailableParts(parts);
    } else {
      setAvailableParts([]);
    }
  }, [stage2Form.lines, stage2Form.projects, ortLabRecords]);

  // Form handling functions
  const processStages = Array.from(new Set(flaskData.map(item => item.processStage)));
  const types = Array.from(new Set(flaskData.map(item => item.type)));

  const handleStage2InputChange = (field: keyof typeof stage2Form, value: string | string[]) => {
    setStage2Form(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "processStage" || field === "type") {
      const { processStage, type } = field === "processStage"
        ? { processStage: value as string, type: stage2Form.type }
        : { processStage: stage2Form.processStage, type: value as string };

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

  const handleProjectSelection = (project: string) => {
    setStage2Form(prev => {
      const isSelected = prev.projects.includes(project);
      return {
        ...prev,
        projects: isSelected
          ? prev.projects.filter(p => p !== project)
          : [...prev.projects, project]
      };
    });
  };

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

  const removeSelectedProject = (project: string) => {
    setStage2Form(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p !== project)
    }));
  };

  const removeSelectedLine = (line: string) => {
    setStage2Form(prev => ({
      ...prev,
      lines: prev.lines.filter(l => l !== line)
    }));
  };

  const removeSelectedPart = (partNumber: string) => {
    setStage2Form(prev => ({
      ...prev,
      selectedParts: prev.selectedParts.filter(p => p !== partNumber)
    }));
  };

  const selectAllProjects = () => {
    setStage2Form(prev => ({
      ...prev,
      projects: [...availableProjects]
    }));
  };

  const clearAllProjects = () => {
    setStage2Form(prev => ({
      ...prev,
      projects: []
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

  const handleStage2Submit = () => {
    if (!selectedRecord) return;

    if (!stage2Form.testName || !stage2Form.requiredQty || !stage2Form.processStage || 
        !stage2Form.type || !stage2Form.testCondition) {
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
          processStage: stage2Form.processStage,
          type: stage2Form.type,
          testName: stage2Form.testName,
          testCondition: stage2Form.testCondition,
          requiredQty: stage2Form.requiredQty,
          equipment: stage2Form.equipment,
          projects: stage2Form.projects,
          lines: stage2Form.lines,
          selectedParts: stage2Form.selectedParts,
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
    return stage2Form.processStage &&
      stage2Form.type &&
      stage2Form.testName &&
      stage2Form.testCondition &&
      stage2Form.requiredQty &&
      stage2Form.equipment &&
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

        

          {/* Stage 2 Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* <div className="space-y-2">
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
            </div> */}

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
            <div className="space-y-2"></div>
            <div className="space-y-2">
            {/* Projects Selection */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <Label htmlFor="projects" className="text-base">
                  Projects <span className="text-red-600">*</span>
                </Label>
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
              </div>
              <Select
                onValueChange={handleProjectSelection}
                disabled={unselectedProjects.length === 0}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={
                    unselectedProjects.length === 0
                      ? "All projects selected"
                      : `Select from ${unselectedProjects.length} available project(s)`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {unselectedProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {stage2Form.projects.length} of {availableProjects.length} projects selected
              </p>

              {/* Selected Projects Display */}
              {stage2Form.projects.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    Selected Projects
                    <span className="text-sm font-normal text-gray-500">
                      ({stage2Form.projects.length} selected)
                    </span>
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
                  {stage2Form.selectedParts.length} of {availableParts.length} parts selected
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

            {/* <div className="space-y-2 md:col-span-2">
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
            </div> */}
              {/* ORT Lab Data Selection Section */}
       
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