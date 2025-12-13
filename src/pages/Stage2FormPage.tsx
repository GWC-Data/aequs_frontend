import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import DateTimePicker from '@/components/DatePicker';

interface OQCTicketRecord {
  id: number;
  ticketCode: string;
  totalQuantity: string;
  anoType: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  status: string;
  sessions: Array<{
    id: string;
    sessionNumber: number;
    timestamp: string;
    parts: Array<{
      id: string;
      partNumber: string;
      serialNumber: string;
      scanStatus: string;
      scannedAt: string;
      location: string;
    }>;
    submitted: boolean;
    sentToORT: boolean;
    submittedAt: string;
  }>;
  createdAt: string;
  oqcApproved: boolean;
}

interface ORTLabSubmission {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  sessionNumber: number;
  parts: Array<{
    id: string;
    partNumber: string;
    serialNumber: string;
    scanStatus: string;
    scannedAt: string;
    location: string;
  }>;
  project: string;
  build: string;
  colour: string;
  anoType: string;
  source: string;
  reason: string;
  totalParts: number;
  serialNumber: string;
  partNumbers: string[];
  rawBarcodeData: string;
  submitted: boolean;
}

interface TestConfiguration {
  processStage: string;
  testName: string;
  testCondition: string;
  qty: string;
  specification: string;
  machineEquipment: string;
  machineEquipment2: string;
  qty2: string;
  anoType: string;
}

// Sample test data - you can move this to a separate file
const testConfigurations: TestConfiguration[] = [
  {
    processStage: "ANO Flash NPI",
    testName: "Ano Hardness",
    testCondition: "RT",
    qty: "10pcs/build",
    specification: "<300 HV0.05",
    machineEquipment: "Hardness machine",
    machineEquipment2: "Hardness machine",
    qty2: "24",
    anoType: "ANO"
  },
  {
    processStage: "ANO Flash NPI",
    testName: "Ano Adhesion",
    testCondition: "RT",
    qty: "10pcs/build",
    specification: ">5B",
    machineEquipment: "Tape test kit",
    machineEquipment2: "Tape test kit",
    qty2: "24",
    anoType: "ANO"
  },
  {
    processStage: "Electro Flash NPI",
    testName: "Electro Thickness",
    testCondition: "RT",
    qty: "10pcs/build",
    specification: "8-12μm",
    machineEquipment: "Coating thickness gauge",
    machineEquipment2: "Coating thickness gauge",
    qty2: "24",
    anoType: "ELECTRO"
  }
  // Add more configurations as needed
];

const Stage2FormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [availableTickets, setAvailableTickets] = useState<OQCTicketRecord[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<OQCTicketRecord | null>(null);
  const [ortSubmissions, setOrtSubmissions] = useState<ORTLabSubmission[]>([]);
  const [filteredTestConfigs, setFilteredTestConfigs] = useState<TestConfiguration[]>([]);
  
  // Form state
  const [stage2Form, setStage2Form] = useState({
    ticketCode: "",
    project: "",
    build: "",
    colour: "",
    anoType: "",
    source: "",
    reason: "",
    processStage: "",
    testName: "",
    testCondition: "",
    qty: "",
    specification: "",
    machineEquipment: "",
    machineEquipment2: "",
    qty2: "",
    availableParts: [] as string[],
    assignedParts: [] as string[],
    startDateTime: "",
    endDateTime: "",
    remark: ""
  });

  // Load available tickets on mount
  useEffect(() => {
    const loadTickets = () => {
      try {
        const ticketsData = localStorage.getItem("oqc_ticket_records");
        const submissionsData = localStorage.getItem("ort_lab_submissions");
        
        if (ticketsData) {
          const tickets: OQCTicketRecord[] = JSON.parse(ticketsData);
          // Filter tickets with submitted sessions
          const available = tickets.filter(ticket => 
            ticket.sessions.some(session => session.submitted && !session.sentToORT)
          );
          setAvailableTickets(available);
        }
        
        if (submissionsData) {
          const submissions: ORTLabSubmission[] = JSON.parse(submissionsData);
          setOrtSubmissions(submissions);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast({
          variant: "destructive",
          title: "Loading Failed",
          description: "Failed to load ticket data",
          duration: 2000,
        });
      }
    };
    
    loadTickets();
  }, []);

  // Handle ticket selection
  const handleTicketSelect = (ticketCode: string) => {
    const ticket = availableTickets.find(t => t.ticketCode === ticketCode);
    if (!ticket) return;

    setSelectedTicket(ticket);
    
    // Find ORT submission for this ticket
    const submission = ortSubmissions.find(s => s.ticketCode === ticketCode);
    
    // Get all parts from submitted sessions
    const allParts: string[] = [];
    ticket.sessions
      .filter(session => session.submitted)
      .forEach(session => {
        session.parts.forEach(part => {
          allParts.push(`${part.partNumber} (${part.serialNumber})`);
        });
      });

    // Filter test configurations based on anoType
    const filteredConfigs = testConfigurations.filter(
      config => config.anoType === ticket.anoType
    );
    setFilteredTestConfigs(filteredConfigs);

    // Get unique process stages for this anoType
    const processStages = Array.from(
      new Set(filteredConfigs.map(config => config.processStage))
    );

    setStage2Form(prev => ({
      ...prev,
      ticketCode: ticket.ticketCode,
      project: ticket.project,
      build: ticket.build,
      colour: ticket.colour,
      anoType: ticket.anoType,
      source: ticket.source,
      reason: ticket.reason,
      availableParts: allParts,
      assignedParts: [],
      // Auto-select first process stage if available
      processStage: processStages.length > 0 ? processStages[0] : ""
    }));
  };

  // Handle process stage selection
  const handleProcessStageSelect = (processStage: string) => {
    setStage2Form(prev => ({
      ...prev,
      processStage,
      testName: "",
      testCondition: "",
      qty: "",
      specification: "",
      machineEquipment: "",
      machineEquipment2: "",
      qty2: ""
    }));
  };

  // Handle test name selection
  const handleTestNameSelect = (testName: string) => {
    const selectedTest = filteredTestConfigs.find(
      config => config.testName === testName && 
      config.processStage === stage2Form.processStage
    );

    if (selectedTest) {
      setStage2Form(prev => ({
        ...prev,
        testName: selectedTest.testName,
        testCondition: selectedTest.testCondition,
        qty: selectedTest.qty,
        specification: selectedTest.specification,
        machineEquipment: selectedTest.machineEquipment,
        machineEquipment2: selectedTest.machineEquipment2,
        qty2: selectedTest.qty2
      }));
    }
  };

  // Handle part assignment
  const handleAssignPart = (part: string) => {
    setStage2Form(prev => ({
      ...prev,
      availableParts: prev.availableParts.filter(p => p !== part),
      assignedParts: [...prev.assignedParts, part]
    }));
  };

  // Handle part removal
  const handleRemovePart = (part: string) => {
    setStage2Form(prev => ({
      ...prev,
      availableParts: [...prev.availableParts, part],
      assignedParts: prev.assignedParts.filter(p => p !== part)
    }));
  };

  // Get available test names for selected process stage
  const getAvailableTestNames = () => {
    if (!stage2Form.processStage) return [];
    return Array.from(
      new Set(
        filteredTestConfigs
          .filter(config => config.processStage === stage2Form.processStage)
          .map(config => config.testName)
      )
    );
  };

  // Get available process stages
  const getAvailableProcessStages = () => {
    return Array.from(new Set(filteredTestConfigs.map(config => config.processStage)));
  };

  // Handle form submission
  const handleStage2Submit = () => {
    if (!selectedTicket) {
      toast({
        variant: "destructive",
        title: "No Ticket Selected",
        description: "Please select a ticket",
        duration: 2000,
      });
      return;
    }

    if (!stage2Form.processStage || !stage2Form.testName) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please select Process Stage and Test Name",
        duration: 2000,
      });
      return;
    }

    if (stage2Form.assignedParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Assigned",
        description: "Please assign at least one part to the test",
        duration: 2000,
      });
      return;
    }

    try {
      const stage2Data = {
        ...stage2Form,
        submittedAt: new Date().toISOString(),
        ticketId: selectedTicket.id,
        anoType: selectedTicket.anoType
      };

      // Save to localStorage
      const existingData = localStorage.getItem("stage2Records");
      const stage2Records = existingData ? JSON.parse(existingData) : [];
      stage2Records.push(stage2Data);
      localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

      // Update session status
      const updatedTickets = availableTickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            sessions: ticket.sessions.map(session => ({
              ...session,
              sentToORT: true
            }))
          };
        }
        return ticket;
      });

      localStorage.setItem("oqc_ticket_records", JSON.stringify(updatedTickets));
      setAvailableTickets(updatedTickets);

      toast({
        title: "✅ Stage 2 Submitted",
        description: `Test configuration has been saved successfully!`,
        duration: 3000,
      });

      navigate("/stage2");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving the data. Please try again.",
        duration: 3000,
      });
      console.error("Error saving Stage 2 data:", error);
    }
  };

  // Check if form is ready for submission
  const isFormValid = () => {
    return (
      selectedTicket !== null &&
      stage2Form.processStage !== "" &&
      stage2Form.testName !== "" &&
      stage2Form.assignedParts.length > 0
    );
  };

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
          {/* Ticket Selection */}
          <div className="space-y-4 mb-6">
            <Label className="text-base font-semibold">Select Ticket</Label>
            <select
              value={stage2Form.ticketCode}
              onChange={(e) => handleTicketSelect(e.target.value)}
              className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
            >
              <option value="">Select a ticket</option>
              {availableTickets.map(ticket => (
                <option key={ticket.id} value={ticket.ticketCode}>
                  {ticket.ticketCode} - {ticket.project} - {ticket.anoType} 
                  ({ticket.sessions.filter(s => s.submitted).length} submitted sessions)
                </option>
              ))}
            </select>
          </div>

          {selectedTicket && (
            <>
              {/* Ticket Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Project</Label>
                  <p className="font-medium">{stage2Form.project}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Build</Label>
                  <p className="font-medium">{stage2Form.build}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Colour</Label>
                  <p className="font-medium">{stage2Form.colour}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ano Type</Label>
                  <p className="font-medium">{stage2Form.anoType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Source</Label>
                  <p className="font-medium">{stage2Form.source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reason</Label>
                  <p className="font-medium">{stage2Form.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Process Stage Selection */}
                <div className="space-y-2">
                  <Label className="text-base">Process Stage <span className="text-red-600">*</span></Label>
                  <select
                    value={stage2Form.processStage}
                    onChange={(e) => handleProcessStageSelect(e.target.value)}
                    className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">Select Process Stage</option>
                    {getAvailableProcessStages().map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* Test Name Selection */}
                <div className="space-y-2">
                  <Label className="text-base">Test Name <span className="text-red-600">*</span></Label>
                  <select
                    value={stage2Form.testName}
                    onChange={(e) => handleTestNameSelect(e.target.value)}
                    disabled={!stage2Form.processStage}
                    className="h-11 w-full border border-input rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">Select Test Name</option>
                    {getAvailableTestNames().map(testName => (
                      <option key={testName} value={testName}>{testName}</option>
                    ))}
                  </select>
                </div>

                {/* Auto-filled fields */}
                {stage2Form.testName && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base">Test Condition</Label>
                      <Input
                        value={stage2Form.testCondition}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Quantity</Label>
                      <Input
                        value={stage2Form.qty}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base">Specification</Label>
                      <Input
                        value={stage2Form.specification}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Machine / Equipment</Label>
                      <Input
                        value={stage2Form.machineEquipment}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Machine / Equipment-2</Label>
                      <Input
                        value={stage2Form.machineEquipment2}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Qty</Label>
                      <Input
                        value={stage2Form.qty2}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    {/* Date Time Pickers */}
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

                    {/* Remark */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base">Remark</Label>
                      <Input
                        value={stage2Form.remark}
                        onChange={(e) => setStage2Form(prev => ({ ...prev, remark: e.target.value }))}
                        placeholder="Enter remarks"
                        className="h-11"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Parts Assignment */}
              {stage2Form.availableParts.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Label className="text-base font-semibold">Assign Parts to Test</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Available Parts */}
                    <div className="border rounded-lg p-4">
                      <Label className="text-sm font-medium mb-2 block">
                        Available Parts ({stage2Form.availableParts.length})
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {stage2Form.availableParts.map((part, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                          >
                            <span className="text-sm">{part}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignPart(part)}
                            >
                              Assign
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Parts */}
                    <div className="border rounded-lg p-4">
                      <Label className="text-sm font-medium mb-2 block">
                        Assigned Parts ({stage2Form.assignedParts.length})
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {stage2Form.assignedParts.length > 0 ? (
                          stage2Form.assignedParts.map((part, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded bg-blue-50"
                            >
                              <span className="text-sm">{part}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePart(part)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">No parts assigned yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4 mt-8 pt-2">
                <Button variant="outline" onClick={() => navigate("/")} className="px-6">
                  Cancel
                </Button>
                <Button
                  onClick={handleStage2Submit}
                  disabled={!isFormValid()}
                  className="bg-[#e0413a] text-white hover:bg-[#c53730] px-6"
                >
                  Submit Stage 2
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stage2FormPage;