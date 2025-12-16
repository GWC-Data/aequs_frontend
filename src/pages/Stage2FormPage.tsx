import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, X } from 'lucide-react';
import DateTimePicker from '@/components/DatePicker';
import { ortTestReport } from '@/data/OrtTestReport';

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
  time: string;
  anoType?: string; // This might not be in ortTestReport
}

// Convert ortTestReport to match TestConfiguration interface
const mapOrtTestReport = (): TestConfiguration[] => {
  return ortTestReport.map(item => ({
    processStage: item["Processes Stage"].trim(),
    testName: item["Test Name"],
    testCondition: item["Test Condition"],
    qty: item["Qty"],
    specification: item["Specification"],
    machineEquipment: item["Machine / Eqipment"],
    machineEquipment2: item["Machine / Eqipment-2"],
    time: item["Timing"],
    // You might need to map anoType based on processStage
    anoType: item["Processes Stage"].includes("ANO") ? "ANO" :
      item["Processes Stage"].includes("ELECTRO") ? "ELECTRO" : ""
  }));
};

console.log(mapOrtTestReport());


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
    testName: [] as string[], // ← now an array
    testCondition: "",
    qty: "",
    specification: "",
    machineEquipment: "",
    machineEquipment2: "",
    time: "",
    availableParts: [] as string[],
    assignedParts: [] as string[],
    startDateTime: "",
    endDateTime: "",
    remark: ""
  });
  const [testCalculations, setTestCalculations] = useState<{
    [testName: string]: {
      requiredQty: number;
      allocatedParts: number;
      assignedParts: string[];
      remainingToAssign: number;
      assignedPartsList: string[];
    }
  }>({});

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
  // Update handleTicketSelect to filter based on anoType
  const handleTicketSelect = (ticketCode: string) => {
    const ticket = availableTickets.find(t => t.ticketCode === ticketCode);
    if (!ticket) return;

    setSelectedTicket(ticket);

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
    const testConfigs = mapOrtTestReport();
    const filteredConfigs = testConfigs.filter(
      config => {
        if (config.anoType) {
          return config.anoType === ticket.anoType;
        } else {
          const isAnoProcess = config.processStage.includes("ANO");
          const isElectroProcess = config.processStage.includes("ELECTRO");

          if (ticket.anoType === "ANO" && isAnoProcess) return true;
          if (ticket.anoType === "ELECTRO" && isElectroProcess) return true;
          return false;
        }
      }
    );

    setFilteredTestConfigs(filteredConfigs);

    // Get unique process stages for this anoType
    const processStages = Array.from(
      new Set(filteredConfigs.map(config => config.processStage))
    );

    // Reset all calculations and assignments
    setTestCalculations({});

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
      testName: [], // Reset test selections
      processStage: processStages.length > 0 ? processStages[0] : "",
      testCondition: "",
      qty: "",
      specification: "",
      machineEquipment: "",
      machineEquipment2: "",
      time: "",
      startDateTime: "",
      endDateTime: "",
      remark: ""
    }));

    // If no parts available, show message
    if (allParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Available",
        description: "This ticket has no submitted parts available for assignment",
        duration: 3000,
      });
    }
  };

  // Handle process stage selection
  const handleProcessStageSelect = (processStage: string) => {
    setStage2Form(prev => ({
      ...prev,
      processStage,
      testName: [],
      testCondition: "",
      qty: "",
      specification: "",
      machineEquipment: "",
      machineEquipment2: "",
      time: ""
    }));
  };

  // Remove the old autoAssignAllParts function and replace it with a simpler version
  const autoAssignAllParts = () => {
    // Just trigger auto-assignment with current calculations
    autoAssignPartsBasedOnCalculations(testCalculations);
  };
  // Add this helper function to extract numeric value from qty string
  const extractNumericQty = (qtyString: string): number => {
    if (!qtyString) return 0;
    const match = qtyString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };


  // const calculateAndAutoAssignParts = (selectedTests: string[]) => {
  //   const selectedConfigs = filteredTestConfigs.filter(
  //     config =>
  //       selectedTests.includes(config.testName) &&
  //       config.processStage === stage2Form.processStage
  //   );

  //   const totalAvailableParts = selectedTicket?.sessions.reduce((total, session) => {
  //     return total + (session.submitted ? session.parts.length : 0);
  //   }, 0) || 0;

  //   const totalRequiredQty = selectedConfigs.reduce((sum, config) => {
  //     return sum + extractNumericQty(config.qty);
  //   }, 0);

  //   console.log("=== CALCULATION START ===");
  //   console.log(`Total Available Parts: ${totalAvailableParts}`);
  //   console.log(`Total Required Qty across all tests: ${totalRequiredQty}`);

  //   // Calculate allocation for each test
  //   const allocations: Array<{
  //     testName: string;
  //     qty: number;
  //     allocatedParts: number;
  //     assignedParts: string[];
  //   }> = [];

  //   selectedConfigs.forEach((config, index) => {
  //     const numericQty = extractNumericQty(config.qty);
  //     const proportion = totalRequiredQty > 0 ? numericQty / totalRequiredQty : 0;
  //     const allocatedPartsRaw = proportion * totalAvailableParts;
  //     const allocatedParts = Math.round(allocatedPartsRaw);

  //     console.log(`\nTest ${index + 1}: ${config.testName}`);
  //     console.log(`  Qty: ${numericQty}pcs (from: ${config.qty})`);
  //     console.log(`  Proportion: ${numericQty} / ${totalRequiredQty} = ${proportion.toFixed(4)}`);
  //     console.log(`  Calculation: ${proportion.toFixed(4)} × ${totalAvailableParts} = ${allocatedPartsRaw.toFixed(2)}`);
  //     console.log(`  Rounded: ${allocatedParts} parts`);

  //     allocations.push({
  //       testName: config.testName,
  //       qty: numericQty,
  //       allocatedParts,
  //       assignedParts: []
  //     });
  //   });

  //   // Adjust rounding differences
  //   let totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
  //   let difference = totalAvailableParts - totalAllocated;

  //   console.log(`\nInitial Total Allocated: ${totalAllocated}`);
  //   console.log(`Difference to distribute: ${difference}`);

  //   if (difference !== 0) {
  //     // Sort by largest rounding error first
  //     const sortedAllocations = [...allocations].sort((a, b) => {
  //       const errorA = Math.abs((a.qty / totalRequiredQty) * totalAvailableParts - a.allocatedParts);
  //       const errorB = Math.abs((b.qty / totalRequiredQty) * totalAvailableParts - b.allocatedParts);
  //       return errorB - errorA;
  //     });

  //     let index = 0;
  //     while (difference > 0) {
  //       sortedAllocations[index].allocatedParts += 1;
  //       difference -= 1;
  //       index = (index + 1) % sortedAllocations.length;
  //     }
  //     while (difference < 0) {
  //       if (sortedAllocations[index].allocatedParts > 0) {
  //         sortedAllocations[index].allocatedParts -= 1;
  //         difference += 1;
  //       }
  //       index = (index + 1) % sortedAllocations.length;
  //     }

  //     console.log(`After adjustment - Total Allocated: ${sortedAllocations.reduce((sum, a) => sum + a.allocatedParts, 0)}`);
  //   }

  //   console.log("\n=== FINAL ALLOCATION ===");
  //   allocations.forEach((alloc, index) => {
  //     console.log(`Test ${index + 1} (${alloc.testName}): ${alloc.allocatedParts} parts`);
  //   });
  //   console.log("=== CALCULATION END ===\n");

  //   return allocations;
  // };

  // Update the calculateAndAutoAssignParts function to ensure proper rounding
  const calculateAndAutoAssignParts = (selectedTests: string[]) => {
    const selectedConfigs = filteredTestConfigs.filter(
      config =>
        selectedTests.includes(config.testName) &&
        config.processStage === stage2Form.processStage
    );

    const totalAvailableParts = selectedTicket?.sessions.reduce((total, session) => {
      return total + (session.submitted ? session.parts.length : 0);
    }, 0) || 0;

    const totalRequiredQty = selectedConfigs.reduce((sum, config) => {
      return sum + extractNumericQty(config.qty);
    }, 0);

    console.log("=== CALCULATION START ===");
    console.log(`Total Available Parts: ${totalAvailableParts}`);
    console.log(`Total Required Qty across all tests: ${totalRequiredQty}`);

    // Calculate allocation for each test
    const allocations: Array<{
      testName: string;
      qty: number;
      allocatedParts: number;
      assignedParts: string[];
    }> = [];

    // First pass: calculate raw allocations with proper rounding
    selectedConfigs.forEach((config, index) => {
      const numericQty = extractNumericQty(config.qty);
      const proportion = totalRequiredQty > 0 ? numericQty / totalRequiredQty : 0;
      const allocatedPartsRaw = proportion * totalAvailableParts;

      // Use Math.round instead of floor+0.5 for better distribution
      let allocatedParts = Math.round(allocatedPartsRaw);

      console.log(`\nTest ${index + 1}: ${config.testName}`);
      console.log(`  Qty: ${numericQty}pcs (from: ${config.qty})`);
      console.log(`  Proportion: ${numericQty} / ${totalRequiredQty} = ${proportion.toFixed(4)}`);
      console.log(`  Calculation: ${proportion.toFixed(4)} × ${totalAvailableParts} = ${allocatedPartsRaw.toFixed(2)}`);
      console.log(`  Rounded: ${allocatedParts} parts`);

      allocations.push({
        testName: config.testName,
        qty: numericQty,
        allocatedParts,
        assignedParts: []
      });
    });

    // Adjust rounding differences - ensure all parts are allocated
    let totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    let difference = totalAvailableParts - totalAllocated;

    console.log(`\nInitial Total Allocated: ${totalAllocated}`);
    console.log(`Difference to distribute: ${difference}`);

    if (difference !== 0) {
      // Distribute remaining parts to tests with highest proportion first
      // But skip tests that got 0 allocation (they might get 1 if we have extra)

      if (difference > 0) {
        // We have extra parts to distribute
        // Sort by which test should get priority (highest proportion first)
        const sortedAllocations = [...allocations].sort((a, b) => {
          const proportionA = a.qty / totalRequiredQty;
          const proportionB = b.qty / totalRequiredQty;
          return proportionB - proportionA; // Highest proportion first
        });

        console.log("Distributing extra parts. Priority order:", sortedAllocations.map(a => a.testName));

        let index = 0;
        while (difference > 0) {
          // If all tests already have at least 1 part, distribute evenly
          // Otherwise, give to tests with 0 allocation first
          const testWithZeroAllocation = sortedAllocations.find(a => a.allocatedParts === 0);
          if (testWithZeroAllocation) {
            testWithZeroAllocation.allocatedParts += 1;
            difference -= 1;
            console.log(`Added 1 part to ${testWithZeroAllocation.testName} (was 0)`);
            // Remove this test from future consideration
            sortedAllocations.splice(sortedAllocations.indexOf(testWithZeroAllocation), 1);
          } else {
            // All tests have at least 1 part, distribute evenly
            sortedAllocations[index].allocatedParts += 1;
            difference -= 1;
            console.log(`Added 1 part to ${sortedAllocations[index].testName}`);
            index = (index + 1) % sortedAllocations.length;
          }
        }
      } else if (difference < 0) {
        // We allocated too many parts, need to reduce
        // Reduce from tests with lowest proportion first
        const sortedAllocations = [...allocations].sort((a, b) => {
          const proportionA = a.qty / totalRequiredQty;
          const proportionB = b.qty / totalRequiredQty;
          return proportionA - proportionB; // Lowest proportion first
        });

        console.log("Reducing over-allocated parts. Priority order:", sortedAllocations.map(a => a.testName));

        let index = 0;
        while (difference < 0) {
          if (sortedAllocations[index].allocatedParts > 0) {
            sortedAllocations[index].allocatedParts -= 1;
            difference += 1;
            console.log(`Removed 1 part from ${sortedAllocations[index].testName}`);
          }
          index = (index + 1) % sortedAllocations.length;
        }
      }

      // Update the allocations array with adjusted values
      allocations.forEach((alloc, i) => {
        const adjustedAlloc = allocations.find(a => a.testName === alloc.testName);
        if (adjustedAlloc) {
          alloc.allocatedParts = adjustedAlloc.allocatedParts;
        }
      });
    }

    // Final verification - ensure we're not allocating 0 to all tests when we have parts
    const totalAfterAdjustment = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    if (totalAfterAdjustment === 0 && totalAvailableParts > 0) {
      // If all tests got 0 but we have parts, give 1 to the test with highest proportion
      const highestProportionTest = allocations.sort((a, b) => {
        const proportionA = a.qty / totalRequiredQty;
        const proportionB = b.qty / totalRequiredQty;
        return proportionB - proportionA;
      })[0];

      if (highestProportionTest) {
        highestProportionTest.allocatedParts = 1;
        console.log(`Adjusted: Gave 1 part to ${highestProportionTest.testName} (all tests had 0)`);
      }
    }

    console.log("\n=== FINAL ALLOCATION ===");
    allocations.forEach((alloc, index) => {
      console.log(`Test ${index + 1} (${alloc.testName}): ${alloc.allocatedParts} parts`);
    });

    console.log("=== CALCULATION END ===\n");

    return allocations;
  };

  // Update handleTestNameSelect to include timing field
  // const handleTestNameSelect = (selectedTests: string[]) => {
  //   const selectedConfigs = filteredTestConfigs.filter(
  //     config =>
  //       selectedTests.includes(config.testName) &&
  //       config.processStage === stage2Form.processStage
  //   );

  //   // Auto-populate comma-separated values from selected tests
  //   const merged = {
  //     testCondition: Array.from(new Set(selectedConfigs.map(c => c.testCondition))).join(", "),
  //     qty: Array.from(new Set(selectedConfigs.map(c => c.qty))).join(", "),
  //     specification: Array.from(new Set(selectedConfigs.map(c => c.specification))).join(", "),
  //     machineEquipment: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment))).join(", "),
  //     machineEquipment2: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment2))).join(", "),
  //     time: Array.from(new Set(selectedConfigs.map(c => c.time))).join(", "),
  //   };

  //   setStage2Form(prev => ({
  //     ...prev,
  //     testName: selectedTests,
  //     ...merged
  //   }));
  // };

  // const handleTestNameSelect = (selectedTests: string[]) => {
  //   // Check if there are available parts
  //   if (stage2Form.availableParts.length === 0) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Parts Available",
  //       description: "Cannot select tests - no parts available for assignment",
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   const selectedConfigs = filteredTestConfigs.filter(
  //     config =>
  //       selectedTests.includes(config.testName) &&
  //       config.processStage === stage2Form.processStage
  //   );

  //   // Calculate allocations
  //   const allocations = calculateAndAutoAssignParts(selectedTests);

  //   // Auto-populate comma-separated values
  //   const merged = {
  //     testCondition: Array.from(new Set(selectedConfigs.map(c => c.testCondition))).join(", "),
  //     qty: Array.from(new Set(selectedConfigs.map(c => c.qty))).join(", "),
  //     specification: Array.from(new Set(selectedConfigs.map(c => c.specification))).join(", "),
  //     machineEquipment: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment))).join(", "),
  //     machineEquipment2: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment2))).join(", "),
  //     time: Array.from(new Set(selectedConfigs.map(c => c.time))).join(", "),
  //   };

  //   // Create a map for test calculations
  //   const calculations: typeof testCalculations = {};
  //   allocations.forEach(alloc => {
  //     calculations[alloc.testName] = {
  //       requiredQty: alloc.qty,
  //       allocatedParts: alloc.allocatedParts,
  //       assignedParts: [],
  //       remainingToAssign: alloc.allocatedParts,
  //       assignedPartsList: []
  //     };
  //   });

  //   console.log("Setting calculations:", calculations);
  //   setTestCalculations(calculations);

  //   // Set form state
  //   setStage2Form(prev => ({
  //     ...prev,
  //     testName: selectedTests,
  //     ...merged
  //   }));

  //   // Auto-assign parts immediately
  //   autoAssignPartsBasedOnCalculations(calculations);
  // };

  const handleTestNameSelect = (selectedTests: string[]) => {
    // Check if there are available parts
    if (stage2Form.availableParts.length === 0 && stage2Form.assignedParts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Parts Available",
        description: "Cannot select tests - no parts available for assignment",
        duration: 3000,
      });
      return;
    }

    const selectedConfigs = filteredTestConfigs.filter(
      config =>
        selectedTests.includes(config.testName) &&
        config.processStage === stage2Form.processStage
    );

    console.log("=== HANDLE TEST SELECTION ===");
    console.log("Selected tests:", selectedTests);
    console.log("Previous selected tests:", stage2Form.testName);

    // If no tests selected, reset everything
    if (selectedTests.length === 0) {
      setTestCalculations({});
      setStage2Form(prev => ({
        ...prev,
        testName: [],
        testCondition: "",
        qty: "",
        specification: "",
        machineEquipment: "",
        machineEquipment2: "",
        time: "",
        // Return all assigned parts back to available
        availableParts: [...prev.availableParts, ...prev.assignedParts],
        assignedParts: []
      }));
      return;
    }

    // Calculate allocations for ALL selected tests (not just new ones)
    const allocations = calculateAndAutoAssignParts(selectedTests);

    // Auto-populate comma-separated values from all selected tests
    const merged = {
      testCondition: Array.from(new Set(selectedConfigs.map(c => c.testCondition))).join(", "),
      qty: Array.from(new Set(selectedConfigs.map(c => c.qty))).join(", "),
      specification: Array.from(new Set(selectedConfigs.map(c => c.specification))).join(", "),
      machineEquipment: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment))).join(", "),
      machineEquipment2: Array.from(new Set(selectedConfigs.map(c => c.machineEquipment2))).join(", "),
      time: Array.from(new Set(selectedConfigs.map(c => c.time))).join(", "),
    };

    // Create NEW calculations based on ALL selected tests
    const newCalculations: typeof testCalculations = {};
    allocations.forEach(alloc => {
      // Check if this test was previously selected and had assigned parts
      const wasPreviouslySelected = stage2Form.testName.includes(alloc.testName);
      const previousCalculation = testCalculations[alloc.testName];

      if (wasPreviouslySelected && previousCalculation && previousCalculation.assignedParts.length > 0) {
        // Test was already selected and had parts assigned
        // Keep the assigned parts but adjust remainingToAssign based on new allocation
        const assignedCount = Math.min(previousCalculation.assignedParts.length, alloc.allocatedParts);
        const remainingToAssign = Math.max(0, alloc.allocatedParts - assignedCount);

        newCalculations[alloc.testName] = {
          requiredQty: alloc.qty,
          allocatedParts: alloc.allocatedParts,
          assignedParts: previousCalculation.assignedParts.slice(0, assignedCount),
          remainingToAssign: remainingToAssign,
          assignedPartsList: previousCalculation.assignedPartsList.slice(0, assignedCount)
        };
      } else {
        // New test selection or test had no assigned parts
        newCalculations[alloc.testName] = {
          requiredQty: alloc.qty,
          allocatedParts: alloc.allocatedParts,
          assignedParts: [],
          remainingToAssign: alloc.allocatedParts,
          assignedPartsList: []
        };
      }
    });

    console.log("New calculations after selection:", newCalculations);
    setTestCalculations(newCalculations);

    // Update form state
    setStage2Form(prev => ({
      ...prev,
      testName: selectedTests,
      ...merged
    }));

    // Recalculate and reassign parts based on new test combination
    setTimeout(() => {
      recalculateAndReassignParts(selectedTests, newCalculations);
    }, 50);
  };

  // Function to recalculate and reassign parts when test selection changes
  const recalculateAndReassignParts = (selectedTests: string[], newCalculations: typeof testCalculations) => {
    if (!selectedTicket || selectedTests.length === 0) return;

    console.log("=== RECALCULATING AND REASSIGNING PARTS ===");

    // Get ALL parts from the ticket
    const totalAvailableParts = selectedTicket.sessions.reduce((total, session) =>
      total + (session.submitted ? session.parts.length : 0), 0);

    // Create array of all parts in the format "PART-001 (SN001)"
    const allPartsFromTicket: string[] = [];
    selectedTicket.sessions
      .filter(session => session.submitted)
      .forEach(session => {
        session.parts.forEach(part => {
          allPartsFromTicket.push(`${part.partNumber} (${part.serialNumber})`);
        });
      });

    console.log("All parts from ticket:", allPartsFromTicket);
    console.log("New calculations to apply:", newCalculations);

    // Create array of tests with their allocation needs
    const testsWithAllocations = Object.entries(newCalculations)
      .map(([testName, calc]) => ({
        testName,
        allocatedParts: calc.allocatedParts,
        assignedSoFar: 0,
        assignedParts: [] as string[]
      }))
      .filter(test => test.allocatedParts > 0)
      .sort((a, b) => b.allocatedParts - a.allocatedParts); // Highest allocation first

    console.log("Tests with allocations:", testsWithAllocations);

    // Calculate total parts needed
    const totalPartsNeeded = testsWithAllocations.reduce((sum, test) => sum + test.allocatedParts, 0);
    console.log(`Total parts needed: ${totalPartsNeeded}, Total available: ${totalAvailableParts}`);

    // Start with fresh assignment - reset all parts
    const remainingParts = [...allPartsFromTicket];
    const finalAssignedParts: string[] = [];

    // Round-robin distribution based on allocation priority
    let distributionComplete = false;
    let round = 0;
    const maxRounds = totalAvailableParts * 2; // Safety limit

    while (!distributionComplete && round < maxRounds && remainingParts.length > 0) {
      distributionComplete = true;

      for (const test of testsWithAllocations) {
        if (test.assignedSoFar < test.allocatedParts && remainingParts.length > 0) {
          const part = remainingParts.shift()!;
          test.assignedSoFar++;
          test.assignedParts.push(part);
          finalAssignedParts.push(part);
          distributionComplete = false;

          console.log(`Round ${round}: Assigned "${part}" to ${test.testName} (${test.assignedSoFar}/${test.allocatedParts})`);
        }
      }

      round++;
    }

    // Update calculations with final assignments
    const updatedCalculations = { ...newCalculations };
    testsWithAllocations.forEach(test => {
      updatedCalculations[test.testName] = {
        ...updatedCalculations[test.testName],
        assignedParts: test.assignedParts,
        assignedPartsList: test.assignedParts,
        remainingToAssign: test.allocatedParts - test.assignedSoFar
      };
    });

    console.log("=== REASSIGNMENT COMPLETE ===");
    testsWithAllocations.forEach(test => {
      console.log(`${test.testName}: ${test.assignedSoFar}/${test.allocatedParts} parts`);
      console.log(`  Assigned parts: ${test.assignedParts.join(", ")}`);
    });
    console.log("Remaining unassigned parts:", remainingParts.length);

    // Update state
    setTestCalculations(updatedCalculations);
    setStage2Form(prev => ({
      ...prev,
      availableParts: remainingParts,
      assignedParts: finalAssignedParts
    }));

    // Show notification
    const newlyAssignedCount = finalAssignedParts.length;
    if (newlyAssignedCount > 0) {
      const testCount = testsWithAllocations.length;
      const verb = testCount === 1 ? 'test' : 'tests';

      toast({
        title: "✅ Parts Reassigned",
        description: `${newlyAssignedCount} parts distributed to ${testCount} ${verb}`,
        duration: 2000,
      });
    }
  };

  // Also update the calculateAndAutoAssignParts to handle incremental selection
  // const calculateAndAutoAssignParts = (selectedTests: string[]) => {
  //   const selectedConfigs = filteredTestConfigs.filter(
  //     config =>
  //       selectedTests.includes(config.testName) &&
  //       config.processStage === stage2Form.processStage
  //   );

  //   const totalAvailableParts = selectedTicket?.sessions.reduce((total, session) => {
  //     return total + (session.submitted ? session.parts.length : 0);
  //   }, 0) || 0;

  //   const totalRequiredQty = selectedConfigs.reduce((sum, config) => {
  //     return sum + extractNumericQty(config.qty);
  //   }, 0);

  //   console.log("\n=== INCREMENTAL CALCULATION ===");
  //   console.log(`Selected ${selectedTests.length} test(s):`, selectedTests);
  //   console.log(`Total Available Parts: ${totalAvailableParts}`);
  //   console.log(`Total Required Qty across selected tests: ${totalRequiredQty}`);

  //   // Calculate allocation for each selected test
  //   const allocations: Array<{
  //     testName: string;
  //     qty: number;
  //     allocatedParts: number;
  //     assignedParts: string[];
  //   }> = [];

  //   selectedConfigs.forEach((config, index) => {
  //     const numericQty = extractNumericQty(config.qty);
  //     const proportion = totalRequiredQty > 0 ? numericQty / totalRequiredQty : 0;
  //     const allocatedPartsRaw = proportion * totalAvailableParts;
  //     const allocatedParts = Math.floor(allocatedPartsRaw + 0.5); // Proper rounding

  //     console.log(`\nTest ${index + 1}: ${config.testName}`);
  //     console.log(`  Qty: ${numericQty}pcs (from: ${config.qty})`);
  //     console.log(`  Proportion: ${numericQty} / ${totalRequiredQty} = ${proportion.toFixed(4)}`);
  //     console.log(`  Calculation: ${proportion.toFixed(4)} × ${totalAvailableParts} = ${allocatedPartsRaw.toFixed(2)}`);
  //     console.log(`  Allocated: ${allocatedParts} parts`);

  //     allocations.push({
  //       testName: config.testName,
  //       qty: numericQty,
  //       allocatedParts,
  //       assignedParts: []
  //     });
  //   });

  //   // Adjust if total allocation doesn't match available parts
  //   let totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
  //   let difference = totalAvailableParts - totalAllocated;

  //   console.log(`\nInitial Total Allocated: ${totalAllocated}`);
  //   console.log(`Difference to distribute: ${difference}`);

  //   if (difference !== 0) {
  //     // Sort by required quantity (highest first) for fair distribution
  //     const sortedAllocations = [...allocations].sort((a, b) => b.qty - a.qty);

  //     if (difference > 0) {
  //       // Add extra parts to tests with highest required quantity
  //       let index = 0;
  //       while (difference > 0) {
  //         sortedAllocations[index].allocatedParts += 1;
  //         difference -= 1;
  //         console.log(`Added 1 part to ${sortedAllocations[index].testName} (highest qty priority)`);
  //         index = (index + 1) % sortedAllocations.length;
  //       }
  //     } else {
  //       // Remove parts from tests with lowest required quantity
  //       let index = 0;
  //       while (difference < 0) {
  //         if (sortedAllocations[index].allocatedParts > 0) {
  //           sortedAllocations[index].allocatedParts -= 1;
  //           difference += 1;
  //           console.log(`Removed 1 part from ${sortedAllocations[index].testName} (lowest qty priority)`);
  //         }
  //         index = (index + 1) % sortedAllocations.length;
  //       }
  //     }
  //   }

  //   console.log("\n=== FINAL ALLOCATION FOR CURRENT SELECTION ===");
  //   allocations.forEach((alloc, index) => {
  //     console.log(`Test ${index + 1} (${alloc.testName}): ${alloc.allocatedParts} parts`);
  //   });

  //   return allocations;
  // };

  // New function for immediate auto-assignment
  // const autoAssignPartsBasedOnCalculations = (calculations: typeof testCalculations) => {
  //   if (!selectedTicket || Object.keys(calculations).length === 0) return;

  //   const availablePartsCopy = [...stage2Form.availableParts];
  //   const assignedParts: string[] = [];
  //   const updatedCalculations = { ...calculations };

  //   console.log("=== IMMEDIATE AUTO ASSIGNMENT ===");
  //   console.log("Available parts:", availablePartsCopy);
  //   console.log("Calculations to apply:", updatedCalculations);

  //   // Create array of tests with allocations
  //   const testsWithAllocations = Object.entries(updatedCalculations)
  //     .map(([testName, calc]) => ({
  //       testName,
  //       allocatedParts: calc.allocatedParts,
  //       assignedSoFar: 0
  //     }))
  //     .filter(test => test.allocatedParts > 0)
  //     .sort((a, b) => b.allocatedParts - a.allocatedParts);

  //   console.log("Tests to assign:", testsWithAllocations);

  //   // Distribute parts using weighted round-robin
  //   let totalAssigned = 0;

  //   // Keep assigning until all tests get their allocation or no parts left
  //   while (availablePartsCopy.length > 0) {
  //     let assignedInThisRound = false;

  //     for (const test of testsWithAllocations) {
  //       if (test.assignedSoFar < test.allocatedParts && availablePartsCopy.length > 0) {
  //         const part = availablePartsCopy.shift()!;
  //         assignedParts.push(part);
  //         totalAssigned++;
  //         test.assignedSoFar++;

  //         // Update calculations
  //         updatedCalculations[test.testName] = {
  //           ...updatedCalculations[test.testName],
  //           assignedParts: [...updatedCalculations[test.testName].assignedParts, part],
  //           assignedPartsList: [...updatedCalculations[test.testName].assignedPartsList, part],
  //           remainingToAssign: test.allocatedParts - test.assignedSoFar
  //         };

  //         console.log(`Assigned "${part}" to ${test.testName}`);
  //         assignedInThisRound = true;
  //       }
  //     }

  //     // If no assignments were made in this round, break
  //     if (!assignedInThisRound) break;
  //   }

  //   console.log("=== ASSIGNMENT COMPLETE ===");
  //   console.log("Total assigned:", totalAssigned);
  //   console.log("Remaining parts:", availablePartsCopy.length);
  //   console.log("Final distribution:", updatedCalculations);

  //   // Update state
  //   setTestCalculations(updatedCalculations);
  //   setStage2Form(prev => ({
  //     ...prev,
  //     availableParts: availablePartsCopy,
  //     assignedParts: [...prev.assignedParts, ...assignedParts]
  //   }));

  //   if (totalAssigned > 0) {
  //     toast({
  //       title: "✅ Parts Auto-Assigned",
  //       description: `${totalAssigned} parts automatically assigned to ${testsWithAllocations.length} test(s)`,
  //       duration: 2000,
  //     });
  //   }
  // };

  const autoAssignPartsBasedOnCalculations = (calculations: typeof testCalculations) => {
    if (!selectedTicket || Object.keys(calculations).length === 0) return;

    const availablePartsCopy = [...stage2Form.availableParts];
    const assignedParts: string[] = [];
    const updatedCalculations = { ...calculations };

    console.log("=== IMMEDIATE AUTO ASSIGNMENT ===");
    console.log("Available parts:", availablePartsCopy);
    console.log("Calculations to apply:", updatedCalculations);

    // Filter out tests with 0 allocation
    const testsWithAllocations = Object.entries(updatedCalculations)
      .map(([testName, calc]) => ({
        testName,
        allocatedParts: calc.allocatedParts,
        assignedSoFar: 0
      }))
      .filter(test => test.allocatedParts > 0) // Only include tests that need parts
      .sort((a, b) => b.allocatedParts - a.allocatedParts);

    console.log("Tests to assign (excluding 0 allocation):", testsWithAllocations);

    // If no tests need parts but we have parts available, check if this is correct
    if (testsWithAllocations.length === 0 && availablePartsCopy.length > 0) {
      console.log("Warning: No tests need parts but parts are available");
      // Don't assign any parts in this case
    }

    // Distribute parts to tests that need them
    let totalAssigned = 0;

    while (availablePartsCopy.length > 0 && testsWithAllocations.length > 0) {
      let assignedInThisRound = false;

      for (const test of testsWithAllocations) {
        if (test.assignedSoFar < test.allocatedParts && availablePartsCopy.length > 0) {
          const part = availablePartsCopy.shift()!;
          assignedParts.push(part);
          totalAssigned++;
          test.assignedSoFar++;

          // Update calculations
          updatedCalculations[test.testName] = {
            ...updatedCalculations[test.testName],
            assignedParts: [...updatedCalculations[test.testName].assignedParts, part],
            assignedPartsList: [...updatedCalculations[test.testName].assignedPartsList, part],
            remainingToAssign: test.allocatedParts - test.assignedSoFar
          };

          console.log(`Assigned "${part}" to ${test.testName}`);
          assignedInThisRound = true;
        }
      }

      // If no assignments were made in this round, break
      if (!assignedInThisRound) break;
    }

    console.log("=== ASSIGNMENT COMPLETE ===");
    console.log("Total assigned:", totalAssigned);
    console.log("Remaining parts:", availablePartsCopy.length);
    console.log("Final distribution:", updatedCalculations);

    // Update state
    setTestCalculations(updatedCalculations);
    setStage2Form(prev => ({
      ...prev,
      availableParts: availablePartsCopy,
      assignedParts: [...prev.assignedParts, ...assignedParts]
    }));

    if (totalAssigned > 0) {
      toast({
        title: "✅ Parts Auto-Assigned",
        description: `${totalAssigned} parts automatically assigned to ${testsWithAllocations.length} test(s)`,
        duration: 2000,
      });
    }
  };


  // Update getAvailableTestNames (no change needed unless used elsewhere differently)
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

  const handleAssignPart = (part: string) => {
    // Find test with highest remaining allocation
    let testToAssign = '';
    let maxRemaining = -1;

    for (const [testName, calculation] of Object.entries(testCalculations)) {
      if (calculation.remainingToAssign > maxRemaining) {
        maxRemaining = calculation.remainingToAssign;
        testToAssign = testName;
      }
    }

    if (!testToAssign || maxRemaining <= 0) {
      toast({
        variant: "destructive",
        title: "Cannot Assign",
        description: "All tests have reached their allocated parts limit",
        duration: 2000,
      });
      return;
    }

    // Auto-assign the part
    setTestCalculations(prev => ({
      ...prev,
      [testToAssign]: {
        ...prev[testToAssign],
        assignedParts: [...prev[testToAssign].assignedParts, part],
        assignedPartsList: [...prev[testToAssign].assignedPartsList, part],
        remainingToAssign: prev[testToAssign].remainingToAssign - 1
      }
    }));

    console.log(`Auto-assigned part "${part}" to test: ${testToAssign}`);

    setStage2Form(prev => ({
      ...prev,
      availableParts: prev.availableParts.filter(p => p !== part),
      assignedParts: [...prev.assignedParts, part],
    }));
    // Remove this line: autoAssignAllParts(); // ❌ Remove this!
  };

  const handleRemovePart = (part: string) => {
    // Reset all assignments
    const updatedCalculations = { ...testCalculations };
    for (const testName in updatedCalculations) {
      updatedCalculations[testName] = {
        ...updatedCalculations[testName],
        assignedParts: [],
        assignedPartsList: [],
        remainingToAssign: updatedCalculations[testName].allocatedParts
      };
    }

    setTestCalculations(updatedCalculations);
    setStage2Form(prev => ({
      ...prev,
      availableParts: [...prev.availableParts, ...prev.assignedParts],
      assignedParts: []
    }));
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalRequiredQty = Object.values(testCalculations).reduce((sum, calc) => sum + calc.requiredQty, 0);
    const totalAllocatedParts = Object.values(testCalculations).reduce((sum, calc) => sum + calc.allocatedParts, 0);
    const totalAssignedParts = Object.values(testCalculations).reduce((sum, calc) => sum + calc.assignedParts.length, 0);
    const totalRemainingToAssign = Object.values(testCalculations).reduce((sum, calc) => sum + calc.remainingToAssign, 0);

    const totalAvailableParts = selectedTicket?.sessions.reduce((total, session) => {
      return total + (session.submitted ? session.parts.length : 0);
    }, 0) || 0;

    return {
      totalRequiredQty,
      totalAllocatedParts,
      totalAssignedParts,
      totalRemainingToAssign,
      totalAvailableParts,
      difference: totalAvailableParts - totalAllocatedParts
    };
  };

  const isFormValid = () => {
    if (!selectedTicket || !stage2Form.processStage || stage2Form.testName.length === 0) {
      return false;
    }

    // Check if all tests have completed their allocation
    const allTestsComplete = Object.values(testCalculations).every(calc =>
      calc.remainingToAssign === 0
    );

    // Also check if we have any unassigned parts that should be assigned
    const totalAvailableParts = selectedTicket?.sessions.reduce((total, session) => {
      return total + (session.submitted ? session.parts.length : 0);
    }, 0) || 0;

    const totalAssignedParts = stage2Form.assignedParts.length;

    // Form is valid if either:
    // 1. All tests have their allocated parts assigned, OR
    // 2. All available parts are assigned (some tests may have 0 allocation)
    const isValid = allTestsComplete || (totalAssignedParts === totalAvailableParts);

    console.log("Form validation:", {
      allTestsComplete,
      totalAssignedParts,
      totalAvailableParts,
      isValid,
      calculations: testCalculations
    });

    return isValid;
  };

  // Get available test names for selected process stage
  // const getAvailableTestNames = () => {
  //   if (!stage2Form.processStage) return [];
  //   return Array.from(
  //     new Set(
  //       filteredTestConfigs
  //         .filter(config => config.processStage === stage2Form.processStage)
  //         .map(config => config.testName)
  //     )
  //   );
  // };

  // Get available process stages
  const getAvailableProcessStages = () => {
    return Array.from(new Set(filteredTestConfigs.map(config => config.processStage)));
  };

  // Handle form submission
  // const handleStage2Submit = () => {
  //   if (!selectedTicket) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Ticket Selected",
  //       description: "Please select a ticket",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   if (!stage2Form.processStage || !stage2Form.testName) {
  //     toast({
  //       variant: "destructive",
  //       title: "Incomplete Form",
  //       description: "Please select Process Stage and Test Name",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   if (stage2Form.assignedParts.length === 0) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Parts Assigned",
  //       description: "Please assign at least one part to the test",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   try {
  //     const stage2Data = {
  //       ...stage2Form,
  //       submittedAt: new Date().toISOString(),
  //       ticketId: selectedTicket.id,
  //       anoType: selectedTicket.anoType
  //     };

  //     // Save to localStorage
  //     const existingData = localStorage.getItem("stage2Records");
  //     const stage2Records = existingData ? JSON.parse(existingData) : [];
  //     stage2Records.push(stage2Data);
  //     localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

  //     // Update session status
  //     const updatedTickets = availableTickets.map(ticket => {
  //       if (ticket.id === selectedTicket.id) {
  //         return {
  //           ...ticket,
  //           sessions: ticket.sessions.map(session => ({
  //             ...session,
  //             sentToORT: true
  //           }))
  //         };
  //       }
  //       return ticket;
  //     });

  //     localStorage.setItem("oqc_ticket_records", JSON.stringify(updatedTickets));
  //     setAvailableTickets(updatedTickets);

  //     toast({
  //       title: "✅ Stage 2 Submitted",
  //       description: `Test configuration has been saved successfully!`,
  //       duration: 3000,
  //     });

  //     navigate("/stage2");
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Submission Failed",
  //       description: "There was an error saving the data. Please try again.",
  //       duration: 3000,
  //     });
  //     console.error("Error saving Stage 2 data:", error);
  //   }
  // };

  // Update the handleStage2Submit to include calculations in saved data
  // const handleStage2Submit = () => {
  //   if (!selectedTicket) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Ticket Selected",
  //       description: "Please select a ticket",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   if (!stage2Form.processStage || stage2Form.testName.length === 0) {
  //     toast({
  //       variant: "destructive",
  //       title: "Incomplete Form",
  //       description: "Please select Process Stage and at least one Test Name",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   const allTestsComplete = Object.values(testCalculations).every(calc =>
  //     calc.remainingToAssign === 0
  //   );

  //   if (!allTestsComplete) {
  //     toast({
  //       variant: "destructive",
  //       title: "Incomplete Allocation",
  //       description: "Please assign all allocated parts to tests",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   try {
  //     const stage2Data = {
  //       ...stage2Form,
  //       submittedAt: new Date().toISOString(),
  //       ticketId: selectedTicket.id,
  //       anoType: selectedTicket.anoType,
  //       // calculations: testCalculations,
  //       // allocationSummary: calculateSummary()
  //     };

  //     // Save to localStorage
  //     const existingData = localStorage.getItem("stage2Records");
  //     const stage2Records = existingData ? JSON.parse(existingData) : [];
  //     stage2Records.push(stage2Data);
  //     localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

  //     // Update session status
  //     const updatedTickets = availableTickets.map(ticket => {
  //       if (ticket.id === selectedTicket.id) {
  //         return {
  //           ...ticket,
  //           sessions: ticket.sessions.map(session => ({
  //             ...session,
  //             sentToORT: true
  //           }))
  //         };
  //       }
  //       return ticket;
  //     });

  //     localStorage.setItem("oqc_ticket_records", JSON.stringify(updatedTickets));
  //     setAvailableTickets(updatedTickets);

  //     toast({
  //       title: "✅ Stage 2 Submitted",
  //       description: `Test configuration has been saved successfully!`,
  //       duration: 3000,
  //     });

  //     navigate("/stage2");
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Submission Failed",
  //       description: "There was an error saving the data. Please try again.",
  //       duration: 3000,
  //     });
  //     console.error("Error saving Stage 2 data:", error);
  //   }
  // };

  // const handleStage2Submit = () => {
  //   if (!selectedTicket) {
  //     toast({
  //       variant: "destructive",
  //       title: "No Ticket Selected",
  //       description: "Please select a ticket",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   if (!stage2Form.processStage || stage2Form.testName.length === 0) {
  //     toast({
  //       variant: "destructive",
  //       title: "Incomplete Form",
  //       description: "Please select Process Stage and at least one Test Name",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   const allTestsComplete = Object.values(testCalculations).every(calc =>
  //     calc.remainingToAssign === 0
  //   );

  //   if (!allTestsComplete) {
  //     toast({
  //       variant: "destructive",
  //       title: "Incomplete Allocation",
  //       description: "Please assign all allocated parts to tests",
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   try {
  //     // Get all parts from the ticket for detailed tracking
  //     const ticketParts = selectedTicket.sessions
  //       .filter(session => session.submitted)
  //       .flatMap(session => session.parts.map(part => ({
  //         id: part.id,
  //         partNumber: part.partNumber,
  //         serialNumber: part.serialNumber,
  //         location: part.location,
  //         scanStatus: part.scanStatus
  //       })));

  //     // Create detailed test records with specific part assignments
  //     const testRecords = stage2Form.testName.map((testName, index) => {
  //       // Find the specific test configuration
  //       const testConfig = filteredTestConfigs.find(
  //         config => config.testName === testName && config.processStage === stage2Form.processStage
  //       );

  //       // Get calculation data for this test
  //       const calculation = testCalculations[testName];

  //       // Get the specific parts assigned to this test
  //       const assignedPartsForTest = calculation?.assignedParts || [];

  //       // Parse assigned parts to extract part/serial numbers
  //       const detailedAssignedParts = assignedPartsForTest.map(partString => {
  //         // partString format: "PART-001 (SN001)"
  //         const match = partString.match(/(.+?)\s*\((.+?)\)/);
  //         if (match) {
  //           return {
  //             partNumber: match[1].trim(),
  //             serialNumber: match[2].trim(),
  //             fullIdentifier: partString
  //           };
  //         }
  //         return {
  //           partNumber: partString,
  //           serialNumber: "",
  //           fullIdentifier: partString
  //         };
  //       });

  //       // Find matching ticket parts for detailed information
  //       const matchedTicketParts = detailedAssignedParts.map(assignedPart => {
  //         const ticketPart = ticketParts.find(p =>
  //           p.partNumber === assignedPart.partNumber &&
  //           p.serialNumber === assignedPart.serialNumber
  //         );

  //         return ticketPart ? {
  //           id: ticketPart.id,
  //           partNumber: ticketPart.partNumber,
  //           serialNumber: ticketPart.serialNumber,
  //           location: ticketPart.location,
  //           scanStatus: ticketPart.scanStatus,
  //           assignedToTest: testName
  //         } : {
  //           partNumber: assignedPart.partNumber,
  //           serialNumber: assignedPart.serialNumber,
  //           location: "Unknown",
  //           scanStatus: "Unknown",
  //           assignedToTest: testName
  //         };
  //       });

  //       return {
  //         // Test identification
  //         testId: `test-${Date.now()}-${index}`,
  //         testName: testName,
  //         processStage: stage2Form.processStage,
  //         testIndex: index + 1,

  //         // Test configuration details
  //         testCondition: testConfig?.testCondition || "",
  //         requiredQuantity: testConfig?.qty || "",
  //         specification: testConfig?.specification || "",
  //         machineEquipment: testConfig?.machineEquipment || "",
  //         machineEquipment2: testConfig?.machineEquipment2 || "",
  //         timing: testConfig?.time || "",

  //         // Date & Time
  //         startDateTime: stage2Form.startDateTime,
  //         endDateTime: stage2Form.endDateTime,

  //         // Assigned parts for this specific test - DETAILED
  //         assignedParts: matchedTicketParts,
  //         assignedPartsCount: matchedTicketParts.length,
  //         // Test-specific remarks
  //         remark: stage2Form.remark,

  //         // Status
  //         status: calculation?.remainingToAssign === 0 ? "Complete" : "Incomplete",
  //         submittedAt: new Date().toISOString()
  //       };
  //     });

  //     // Main stage 2 record
  //     const stage2Data = {
  //       // Record identification
  //       id: Date.now(),
  //       submissionId: `stage2-${Date.now()}`,

  //       // Ticket information
  //       ticketId: selectedTicket.id,
  //       ticketCode: stage2Form.ticketCode,
  //       totalQuantity: selectedTicket.totalQuantity,
  //       anoType: stage2Form.anoType,
  //       source: stage2Form.source,
  //       reason: stage2Form.reason,
  //       project: stage2Form.project,
  //       build: stage2Form.build,
  //       colour: stage2Form.colour,

  //       // Process stage
  //       processStage: stage2Form.processStage,

  //       // All selected test names
  //       selectedTestNames: stage2Form.testName,

  //       // Detailed test records (one per test name)
  //       testRecords: testRecords,

  //       // Form data
  //       formData: {
  //         startDateTime: stage2Form.startDateTime,
  //         endDateTime: stage2Form.endDateTime,
  //         remark: stage2Form.remark,
  //         testCondition: stage2Form.testCondition,
  //         qty: stage2Form.qty,
  //         specification: stage2Form.specification,
  //         machineEquipment: stage2Form.machineEquipment,
  //         machineEquipment2: stage2Form.machineEquipment2,
  //         time: stage2Form.time
  //       },

  //       // Metadata
  //       submittedAt: new Date().toISOString(),
  //       version: "1.0"
  //     };

  //     // Save to localStorage
  //     const existingData = localStorage.getItem("stage2Records");
  //     const stage2Records = existingData ? JSON.parse(existingData) : [];
  //     stage2Records.push(stage2Data);
  //     localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

  //     // Update session status
  //     const updatedTickets = availableTickets.map(ticket => {
  //       if (ticket.id === selectedTicket.id) {
  //         return {
  //           ...ticket,
  //           sessions: ticket.sessions.map(session => ({
  //             ...session,
  //             sentToORT: true
  //           }))
  //         };
  //       }
  //       return ticket;
  //     });

  //     localStorage.setItem("oqc_ticket_records", JSON.stringify(updatedTickets));
  //     setAvailableTickets(updatedTickets);

  //     // Show success message with test-specific details
  //     const assignedPartsCount = Object.values(testCalculations).reduce(
  //       (sum, calc) => sum + calc.assignedParts.length, 0
  //     );

  //     toast({
  //       title: "✅ Stage 2 Submitted Successfully",
  //       description: (
  //         <div className="space-y-1">
  //           <div>{stage2Form.testName.length} test(s) configured</div>
  //           <div>{assignedPartsCount} part(s) assigned across all tests</div>
  //           <div className="text-xs">Data saved with detailed part assignments</div>
  //         </div>
  //       ),
  //       duration: 4000,
  //     });

  //     // Log the structured data for verification
  //     console.log("📋 Stage 2 Data Saved:", {
  //       ticket: stage2Form.ticketCode,
  //       tests: stage2Form.testName,
  //       assignedPartsByTest: testRecords.map(test => ({
  //         testName: test.testName,
  //         assignedParts: test.assignedParts.length,
  //         partsList: test.assignedParts.map(p => p.partNumber)
  //       })),
  //       fullData: stage2Data
  //     });

  //     navigate("/stage2");
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Submission Failed",
  //       description: "There was an error saving the data. Please try again.",
  //       duration: 3000,
  //     });
  //     console.error("Error saving Stage 2 data:", error);
  //   }
  // };
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
 
    if (!stage2Form.processStage || stage2Form.testName.length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please select Process Stage and at least one Test Name",
        duration: 2000,
      });
      return;
    }
 
    const allTestsComplete = Object.values(testCalculations).every(calc =>
      calc.remainingToAssign === 0
    );
 
    if (!allTestsComplete) {
      toast({
        variant: "destructive",
        title: "Incomplete Allocation",
        description: "Please assign all allocated parts to tests",
        duration: 2000,
      });
      return;
    }
 
    try {
      // Get all parts from the ticket for detailed tracking
      const ticketParts = selectedTicket.sessions
        .filter(session => session.submitted)
        .flatMap(session => session.parts.map(part => ({
          id: part.id,
          partNumber: part.partNumber,
          serialNumber: part.serialNumber,
          location: part.location,
          scanStatus: part.scanStatus
        })));
 
      // Fetch ORT Lab (stage1TableData) status for this particular ticket
      const ortLabRecordsData = localStorage.getItem("stage1TableData");
      const ortLabRecords = ortLabRecordsData ? JSON.parse(ortLabRecordsData) : [];
 
      // Find matching ORT Lab record for this ticket to get its status
      let ortLabStatus = "Received"; // Default status
      const matchingOrtLabRecord = ortLabRecords.find((record: any) =>
        record.detailsBox?.ticketCodeRaised === stage2Form.ticketCode ||
        record.ticketCode === stage2Form.ticketCode ||
        record.detailsBox?.project === stage2Form.project
      );
 
      if (matchingOrtLabRecord) {
        ortLabStatus = matchingOrtLabRecord.status || "Received";
        console.log("Found ORT Lab record with status:", ortLabStatus);
      }
 
      // Create detailed test records with specific part assignments
      const testRecords = stage2Form.testName.map((testName, index) => {
        // Find the specific test configuration
        const testConfig = filteredTestConfigs.find(
          config => config.testName === testName && config.processStage === stage2Form.processStage
        );
 
        // Get calculation data for this test
        const calculation = testCalculations[testName];
 
        // Get the specific parts assigned to this test
        const assignedPartsForTest = calculation?.assignedParts || [];
 
        // Parse assigned parts to extract part/serial numbers
        const detailedAssignedParts = assignedPartsForTest.map(partString => {
          // partString format: "PART-001 (SN001)"
          const match = partString.match(/(.+?)\s*\((.+?)\)/);
          if (match) {
            return {
              partNumber: match[1].trim(),
              serialNumber: match[2].trim(),
              fullIdentifier: partString
            };
          }
          return {
            partNumber: partString,
            serialNumber: "",
            fullIdentifier: partString
          };
        });
 
        // Find matching ticket parts for detailed information
        const matchedTicketParts = detailedAssignedParts.map(assignedPart => {
          const ticketPart = ticketParts.find(p =>
            p.partNumber === assignedPart.partNumber &&
            p.serialNumber === assignedPart.serialNumber
          );
 
          return ticketPart ? {
            id: ticketPart.id,
            partNumber: ticketPart.partNumber,
            serialNumber: ticketPart.serialNumber,
            location: ticketPart.location,
            scanStatus: ticketPart.scanStatus,
            assignedToTest: testName
          } : {
            partNumber: assignedPart.partNumber,
            serialNumber: assignedPart.serialNumber,
            location: "Unknown",
            scanStatus: "Unknown",
            assignedToTest: testName
          };
        });
 
        return {
          // Test identification
          testId: `test-${Date.now()}-${index}`,
          testName: testName,
          processStage: stage2Form.processStage,
          testIndex: index + 1,
 
          // Test configuration details
          testCondition: testConfig?.testCondition || "",
          requiredQuantity: testConfig?.qty || "",
          specification: testConfig?.specification || "",
          machineEquipment: testConfig?.machineEquipment || "",
          machineEquipment2: testConfig?.machineEquipment2 || "",
          timing: testConfig?.time || "",
 
          // Date & Time
          startDateTime: stage2Form.startDateTime,
          endDateTime: stage2Form.endDateTime,
 
          // Assigned parts for this specific test - DETAILED
          assignedParts: matchedTicketParts,
          assignedPartsCount: matchedTicketParts.length,
          // Test-specific remarks
          remark: stage2Form.remark,
 
          // Status
          status: calculation?.remainingToAssign === 0 ? "Complete" : "Incomplete",
          submittedAt: new Date().toISOString()
        };
      });
 
      // Main stage 2 record with ORT Lab status carried forward
      const stage2Data = {
        // Record identification
        id: Date.now(),
        submissionId: `stage2-${Date.now()}`,
 
        // Ticket information
        ticketId: selectedTicket.id,
        ticketCode: stage2Form.ticketCode,
        totalQuantity: selectedTicket.totalQuantity,
        anoType: stage2Form.anoType,
        source: stage2Form.source,
        reason: stage2Form.reason,
        project: stage2Form.project,
        build: stage2Form.build,
        colour: stage2Form.colour,
 
        // Process stage
        processStage: stage2Form.processStage,
 
        // All selected test names
        selectedTestNames: stage2Form.testName,
 
        // Detailed test records (one per test name)
        testRecords: testRecords,
 
        // Form data
        formData: {
          startDateTime: stage2Form.startDateTime,
          endDateTime: stage2Form.endDateTime,
          remark: stage2Form.remark,
          testCondition: stage2Form.testCondition,
          qty: stage2Form.qty,
          specification: stage2Form.specification,
          machineEquipment: stage2Form.machineEquipment,
          machineEquipment2: stage2Form.machineEquipment2,
          time: stage2Form.time
        },
 
        // ORT Lab Status carried forward
        ortLabStatus: ortLabStatus,
 
        // Stage 2 status (combine ORT Lab status with Stage 2 completion)
        status: allTestsComplete ? "In-progress" : ortLabStatus,
 
        // Metadata
        submittedAt: new Date().toISOString(),
        version: "1.0"
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
 
      // Show success message
      const assignedPartsCount = Object.values(testCalculations).reduce(
        (sum, calc) => sum + calc.assignedParts.length, 0
      );
 
      toast({
        title: "✅ Stage 2 Submitted Successfully",
        description: (
          <div className="space-y-1">
            <div>{stage2Form.testName.length} test(s) configured</div>
            <div>{assignedPartsCount} part(s) assigned</div>
            <div className="text-xs">Status: {stage2Data.status} (from ORT Lab: {ortLabStatus})</div>
          </div>
        ),
        duration: 4000,
      });
 
      console.log("Stage 2 submitted with ORT Lab status:", {
        ticket: stage2Form.ticketCode,
        ortLabStatus: ortLabStatus
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

                {/* Test Name Multi-Select with Checkboxes */}
                <div className="space-y-2">
                  <Label className="text-base">Test Name <span className="text-red-600">*</span></Label>

                  {/* Display selected test names */}
                  {stage2Form.testName.length > 0 && (
                    <div className="mb-2 p-2 border rounded-md bg-blue-50 flex flex-wrap gap-2">
                      {stage2Form.testName.map(testName => (
                        <span
                          key={testName}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded"
                        >
                          {testName}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = stage2Form.testName.filter(t => t !== testName);
                              handleTestNameSelect(updated);
                            }}
                            className="hover:bg-blue-700 rounded-full p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dropdown with checkboxes */}
                  <div className="relative">
                    <div className="border border-input rounded-md bg-background">
                      <div
                        className="h-11 px-3 py-2 cursor-pointer flex items-center justify-between"
                        onClick={(e) => {
                          const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                          if (dropdown) {
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                          }
                        }}
                      >
                        <span className="text-sm text-gray-600">
                          {stage2Form.testName.length === 0
                            ? 'Select test names...'
                            : `${stage2Form.testName.length} test(s) selected`}
                        </span>
                        <span>▼</span>
                      </div>

                      <div
                        className="absolute z-10 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-y-auto"
                        style={{ display: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getAvailableTestNames().map(testName => (
                          <label
                            key={testName}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={stage2Form.testName.includes(testName)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...stage2Form.testName, testName]
                                  : stage2Form.testName.filter(t => t !== testName);
                                handleTestNameSelect(updated);
                              }}
                              className="mr-2 h-4 w-4"
                            />
                            <span className="text-sm">{testName}</span>
                          </label>
                        ))}
                        {getAvailableTestNames().length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No test names available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                      <Label className="text-base">Time</Label>
                      <Input
                        value={stage2Form.time}
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

              {/* Parts Assignment - Auto Assignment */}
              {stage2Form.availableParts.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Parts Assignment</Label>
                    <Button
                      onClick={autoAssignAllParts}
                      disabled={stage2Form.testName.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Auto Assign All Parts
                    </Button>
                  </div>

                  {/* Auto Assignment Summary */}
                  {stage2Form.testName.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-green-50">
                      <div className="text-center">
                        <Label className="text-xs text-gray-600">Total Parts</Label>
                        <p className="text-lg font-bold text-blue-700">
                          {selectedTicket?.sessions.reduce((total, session) =>
                            total + (session.submitted ? session.parts.length : 0), 0) || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-xs text-gray-600">Will be Assigned</Label>
                        <p className="text-lg font-bold text-green-700">
                          {Object.values(testCalculations).reduce((sum, calc) => sum + calc.allocatedParts, 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-xs text-gray-600">Will be Unassigned</Label>
                        <p className="text-lg font-bold text-orange-700">
                          {Math.max(0, (selectedTicket?.sessions.reduce((total, session) =>
                            total + (session.submitted ? session.parts.length : 0), 0) || 0) -
                            Object.values(testCalculations).reduce((sum, calc) => sum + calc.allocatedParts, 0))}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Available Parts - Read Only */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">
                          Available Parts ({stage2Form.availableParts.length})
                        </Label>
                        <span className="text-xs text-gray-500">Auto-assigned on test selection</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {stage2Form.availableParts.map((part, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded bg-gray-50"
                          >
                            <span className="text-sm">{part}</span>
                            <span className="text-xs text-gray-500">Auto-assign</span>
                          </div>
                        ))}
                        {stage2Form.availableParts.length === 0 && (
                          <p className="text-gray-500 text-sm italic text-center py-4">
                            All parts have been auto-assigned
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Assigned Parts - Read Only */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">
                          Assigned Parts ({stage2Form.assignedParts.length})
                        </Label>
                        {stage2Form.assignedParts.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reset all assignments
                              const updatedCalculations = { ...testCalculations };
                              for (const testName in updatedCalculations) {
                                updatedCalculations[testName] = {
                                  ...updatedCalculations[testName],
                                  assignedParts: [],
                                  assignedPartsList: [],
                                  remainingToAssign: updatedCalculations[testName].allocatedParts
                                };
                              }
                              setTestCalculations(updatedCalculations);
                              setStage2Form(prev => ({
                                ...prev,
                                availableParts: [...prev.availableParts, ...prev.assignedParts],
                                assignedParts: []
                              }));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reset All
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {stage2Form.assignedParts.length > 0 ? (
                          stage2Form.assignedParts.map((part, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded bg-green-50"
                            >
                              <span className="text-sm">{part}</span>
                              <span className="text-xs text-green-600">✓ Auto-assigned</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic text-center py-4">
                            No parts assigned yet. Parts will auto-assign when tests are selected.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auto Assignment Status */}
                  {stage2Form.assignedParts.length > 0 && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800">Auto-Assignment Complete</h4>
                          <p className="text-sm text-green-700 mt-1">
                            {stage2Form.assignedParts.length} parts have been automatically assigned to tests based on the calculated allocation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auto Allocation Summary Section - Show after auto-assignment */}
              {stage2Form.testName.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Allocation Summary</Label>
                    <div className="text-sm text-gray-600">
                      Status: <span className={`font-bold ${isFormValid() ? 'text-green-600' : 'text-orange-600'}`}>
                        {isFormValid() ? 'Ready to Submit' : 'Incomplete'}
                      </span>
                    </div>
                  </div>

                  {/* Final Allocation Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-blue-50">
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Total Parts</Label>
                      <p className="text-lg font-bold text-blue-700">
                        {selectedTicket?.sessions.reduce((total, session) =>
                          total + (session.submitted ? session.parts.length : 0), 0) || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Assigned Parts</Label>
                      <p className="text-lg font-bold text-green-700">
                        {stage2Form.assignedParts.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Unassigned Parts</Label>
                      <p className="text-lg font-bold text-orange-700">
                        {Math.max(0, (selectedTicket?.sessions.reduce((total, session) =>
                          total + (session.submitted ? session.parts.length : 0), 0) || 0) - stage2Form.assignedParts.length)}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-gray-600">Allocation</Label>
                      <p className="text-lg font-bold">
                        {Math.round((stage2Form.assignedParts.length / (selectedTicket?.sessions.reduce((total, session) =>
                          total + (session.submitted ? session.parts.length : 0), 0) || 1)) * 100)}%
                      </p>
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
