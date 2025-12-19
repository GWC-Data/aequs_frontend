import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Search, Filter, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, Plus, Download, Upload, FileEdit, ChevronDown, List, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ortTestReport } from '@/data/OrtTestReport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Stage1Record {
  id: number;
  ticketCode: string;
  sessionId: string;
  sessionNumber: number;
  date: string;
  detailsBox: {
    totalQuantity: number;
    ticketCodeRaised: string;
    dateShiftTime: string;
    project: string;
    assemblyOQCAno: string;
    batch: string;
    color: string;
    reason: string;
  };
  inventoryRemarks: string;
  movedToStage2: boolean;
  partNumbers: string[];
  partsBeingSent: number;
  received: string;
  shiftTime: string;
  stage2Enabled: boolean;
  status: number;
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
  anoType?: string;
}

interface TestAllocation {
  id: string;
  testName: string;
  allocatedParts: number;
  requiredQty: number;
  testCondition: string;
  specification: string;
  machineEquipment: string;
  time: string;
  status: number;
  notes?: string;
}

interface TicketAllocationData {
  ticketCode: string;
  totalQuantity: number;
  location: string;
  project: string;
  anoType: string;
  build: string;
  colour: string;
  testAllocations: TestAllocation[];
  processStage: string;
  reason: string;
  remainingParts: number;
}

interface SavedAllocation extends TicketAllocationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// LocalStorage key for allocations
const ALLOCATIONS_STORAGE_KEY = 'ticket_allocations_array';

// Status options
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'Failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
];

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
    anoType: item["Processes Stage"].includes("ANO") ? "ANO" :
      item["Processes Stage"].includes("ELECTRO") ? "ELECTRO" : ""
  }));
};

// LocalStorage utility functions for array storage
const saveAllocationToStorage = (allocation: TicketAllocationData): void => {
  try {
    const allocations = getAllocationsFromStorage();
    
    const savedAllocation: SavedAllocation = {
      ...allocation,
      id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Check if allocation for this ticket already exists
    const existingIndex = allocations.findIndex(a => a.ticketCode === allocation.ticketCode);
    
    if (existingIndex >= 0) {
      // Update existing allocation
      savedAllocation.createdAt = allocations[existingIndex].createdAt;
      allocations[existingIndex] = savedAllocation;
    } else {
      // Add new allocation
      allocations.push(savedAllocation);
    }
    
    localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(allocations));
    
    toast({
      title: "Allocation Saved",
      description: `Allocation saved for ticket ${allocation.ticketCode}`,
      duration: 2000,
    });
    
  } catch (error) {
    console.error('Failed to save allocation:', error);
    toast({
      variant: "destructive",
      title: "Save Failed",
      description: "Failed to save allocation to storage",
      duration: 2000,
    });
    throw error;
  }
};

const getAllocationsFromStorage = (): SavedAllocation[] => {
  try {
    const data = localStorage.getItem(ALLOCATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load allocations:', error);
    return [];
  }
};

const getAllocationByTicket = (ticketCode: string): SavedAllocation | null => {
  const allocations = getAllocationsFromStorage();
  return allocations.find(allocation => allocation.ticketCode === ticketCode) || null;
};

const deleteAllocationFromStorage = (ticketCode: string): void => {
  try {
    const allocations = getAllocationsFromStorage();
    const filteredAllocations = allocations.filter(allocation => allocation.ticketCode !== ticketCode);
    
    localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(filteredAllocations));
    
    toast({
      title: "Allocation Deleted",
      description: `Allocation removed for ticket ${ticketCode}`,
      duration: 2000,
    });
  } catch (error) {
    console.error('Failed to delete allocation:', error);
  }
};

const clearAllAllocations = (): void => {
  localStorage.removeItem(ALLOCATIONS_STORAGE_KEY);
  toast({
    title: "All Allocations Cleared",
    description: "All allocation data has been removed",
    duration: 2000,
  });
};

const exportAllAllocations = (): void => {
  try {
    const allocations = getAllocationsFromStorage();
    const dataStr = JSON.stringify(allocations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `allocations_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export Successful",
      description: `Exported ${allocations.length} allocations`,
      duration: 2000,
    });
  } catch (error) {
    console.error('Failed to export allocations:', error);
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: "Failed to export allocations",
      duration: 2000,
    });
  }
};

const importAllocations = (event: React.ChangeEvent<HTMLInputElement>): SavedAllocation[] | null => {
  const file = event.target.files?.[0];
  if (!file) return null;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const importedAllocations = JSON.parse(content);
      
      // Validate the structure
      if (Array.isArray(importedAllocations)) {
        // Merge with existing allocations (new ones will overwrite by ticketCode)
        const existingAllocations = getAllocationsFromStorage();
        const mergedAllocations = [...existingAllocations];
        
        importedAllocations.forEach((importedAlloc: SavedAllocation) => {
          const existingIndex = mergedAllocations.findIndex(a => a.ticketCode === importedAlloc.ticketCode);
          if (existingIndex >= 0) {
            mergedAllocations[existingIndex] = importedAlloc;
          } else {
            mergedAllocations.push(importedAlloc);
          }
        });
        
        localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(mergedAllocations));
        
        toast({
          title: "Import Successful",
          description: `Imported ${importedAllocations.length} allocations`,
          duration: 2000,
        });
        
        return mergedAllocations;
      } else {
        throw new Error("Invalid file format - expected array");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import allocations. Invalid file format.",
        duration: 2000,
      });
      return null;
    }
  };
  reader.readAsText(file);
  return null;
};

const TicketViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Stage1Record[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Stage1Record[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Stage1Record | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationData, setAllocationData] = useState<TicketAllocationData | null>(null);
  const [savedAllocations, setSavedAllocations] = useState<SavedAllocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnoType, setFilterAnoType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [editingTest, setEditingTest] = useState<TestAllocation | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [showAllAllocationsDialog, setShowAllAllocationsDialog] = useState(false);
  const [newTestData, setNewTestData] = useState({
    testName: '',
    requiredQty: 0,
    testCondition: '',
    specification: '',
    machineEquipment: '',
    time: '',
    allocatedParts:''
  });
  const [availableTests, setAvailableTests] = useState<TestConfiguration[]>([]);
  const [sopLinks, setSopLinks] = useState<{[key: number]: string}>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load tickets and allocations on mount
  useEffect(() => {
    loadTickets();
    loadSavedAllocations();
  }, []);

  // Load available tests when allocation modal opens
  useEffect(() => {
    if (showAllocationModal && selectedTicket) {
      loadAvailableTests();
    }
  }, [showAllocationModal, selectedTicket]);

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterAnoType, filterProject, tickets]);

  const loadSavedAllocations = () => {
    const allocations = getAllocationsFromStorage();
    setSavedAllocations(allocations);
  };

  const removeDuplicateTickets = (tickets: Stage1Record[]): Stage1Record[] => {
    const seenTicketCodes = new Set<string>();
    const uniqueTickets: Stage1Record[] = [];

    tickets.forEach(ticket => {
      if (!seenTicketCodes.has(ticket.ticketCode)) {
        seenTicketCodes.add(ticket.ticketCode);
        uniqueTickets.push(ticket);
      } else {
        console.warn(`Duplicate ticket code found and skipped: ${ticket.ticketCode}`);
      }
    });

    return uniqueTickets;
  };

  const loadTickets = () => {
    try {
      const ticketsData = localStorage.getItem("stage1TableData");
      if (ticketsData) {
        const parsedTickets: Stage1Record[] = JSON.parse(ticketsData);
        const uniqueTickets = removeDuplicateTickets(parsedTickets);

        setTickets(uniqueTickets);
        setFilteredTickets(uniqueTickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
      toast({
        variant: "destructive",
        title: "Loading Failed",
        description: "Failed to load ticket data",
        duration: 2000,
      });
    }
  };

  const loadAvailableTests = () => {
    if (!selectedTicket) return;
    
    const testConfigs = mapOrtTestReport();
    
    // Filter tests based on ticket's ANO type
    const filteredTests = testConfigs.filter(config => {
      if (config.anoType) {
        return config.anoType === selectedTicket.detailsBox.assemblyOQCAno;
      } else {
        const isAnoProcess = config.processStage.includes("ANO");
        const isElectroProcess = config.processStage.includes("ELECTRO");

        if (selectedTicket.detailsBox.assemblyOQCAno === "ANO" && isAnoProcess) return true;
        if (selectedTicket.detailsBox.assemblyOQCAno === "ELECTRO" && isElectroProcess) return true;
        return false;
      }
    });

    setAvailableTests(filteredTests);
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.detailsBox.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.detailsBox.assemblyOQCAno.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply ANO type filter
    if (filterAnoType !== 'all') {
      filtered = filtered.filter(ticket =>
        ticket.detailsBox.assemblyOQCAno === filterAnoType
      );
    }

    // Apply project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter(ticket =>
        ticket.detailsBox.project === filterProject
      );
    }

    setFilteredTickets(filtered);
  };

  const extractNumericQty = (qtyString: string): number => {
    if (!qtyString) return 0;
    const match = qtyString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const calculateTestAllocations = (ticket: Stage1Record): TicketAllocationData | null => {
    const testConfigs = mapOrtTestReport();
    
    // Get available process stages for this ticket's anoType
    let availableConfigs = testConfigs.filter(config => {
      if (config.anoType) {
        return config.anoType === ticket.detailsBox.assemblyOQCAno;
      } else {
        const isAnoProcess = config.processStage.includes("ANO");
        const isElectroProcess = config.processStage.includes("ELECTRO");

        if (ticket.detailsBox.assemblyOQCAno === "ANO" && isAnoProcess) return true;
        if (ticket.detailsBox.assemblyOQCAno === "ELECTRO" && isElectroProcess) return true;
        return false;
      }
    });

    // Get unique process stages
    const processStages = Array.from(
      new Set(availableConfigs.map(config => config.processStage))
    );
    const selectedProcessStage = processStages.length > 0 ? processStages[0] : "";

    // Filter configs for selected process stage
    const stageConfigs = availableConfigs.filter(
      config => config.processStage === selectedProcessStage
    );

    // Get all test names for this process stage
    const allTestNames = Array.from(
      new Set(stageConfigs.map(config => config.testName))
    );

    if (allTestNames.length === 0) {
      return null;
    }

    const totalAvailableParts = ticket.totalQuantity || ticket.partsBeingSent || 0;
    const selectedTests = allTestNames;

    // Calculate total required quantity
    const selectedConfigs = stageConfigs.filter(config =>
      selectedTests.includes(config.testName)
    );

    const totalRequiredQty = selectedConfigs.reduce((sum, config) => {
      return sum + extractNumericQty(config.qty);
    }, 0);

    // Calculate allocations for each test
    const allocations: TestAllocation[] = [];

    selectedConfigs.forEach((config, index) => {
      const numericQty = extractNumericQty(config.qty);
      const proportion = totalRequiredQty > 0 ? numericQty / totalRequiredQty : 0;
      const allocatedPartsRaw = proportion * totalAvailableParts;
      let allocatedParts = Math.round(allocatedPartsRaw);

      allocations.push({
        id: `test-${Date.now()}-${index}`,
        testName: config.testName,
        allocatedParts: allocatedParts,
        requiredQty: numericQty,
        testCondition: config.testCondition,
        specification: config.specification,
        machineEquipment: config.machineEquipment,
        time: config.time,
        status: allocatedParts
      });
    });

    // Adjust rounding differences
    let totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    let difference = totalAvailableParts - totalAllocated;

    if (difference !== 0) {
      const sortedAllocations = [...allocations].sort((a, b) => {
        const errorA = Math.abs((a.requiredQty / totalRequiredQty) * totalAvailableParts - a.allocatedParts);
        const errorB = Math.abs((b.requiredQty / totalRequiredQty) * totalAvailableParts - b.allocatedParts);
        return errorB - errorA;
      });

      if (difference > 0) {
        let index = 0;
        while (difference > 0) {
          sortedAllocations[index].allocatedParts += 1;
          difference -= 1;
          index = (index + 1) % sortedAllocations.length;
        }
      } else {
        let index = 0;
        while (difference < 0) {
          if (sortedAllocations[index].allocatedParts > 0) {
            sortedAllocations[index].allocatedParts -= 1;
            difference += 1;
          }
          index = (index + 1) % sortedAllocations.length;
        }
      }
    }

    const totalAfterAdjustment = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    if (totalAfterAdjustment === 0 && totalAvailableParts > 0 && allocations.length > 0) {
      const highestRequiredTest = allocations.sort((a, b) => b.requiredQty - a.requiredQty)[0];
      if (highestRequiredTest) {
        highestRequiredTest.allocatedParts = 1;
      }
    }

    const allocatedParts = allocations.reduce((sum, test) => sum + test.allocatedParts, 0);
    const remainingParts = Math.max(0, totalAvailableParts - allocatedParts);

    return {
      ticketCode: ticket.ticketCode,
      totalQuantity: totalAvailableParts,
      location: "In-house",
      project: ticket.detailsBox.project,
      anoType: ticket.detailsBox.assemblyOQCAno,
      build: ticket.detailsBox.batch,
      colour: ticket.detailsBox.color,
      testAllocations: allocations,
      processStage: selectedProcessStage,
      reason: ticket.detailsBox.reason,
      remainingParts
    };
  };

  const handleViewAllocation = (ticket: Stage1Record) => {
    // Check if we have a saved allocation first
    const savedAllocation = getAllocationByTicket(ticket.ticketCode);
    
    if (savedAllocation) {
      // Load saved allocation
      setAllocationData(savedAllocation);
      setSelectedTicket(ticket);
      setShowAllocationModal(true);
    } else {
      // Calculate new allocation
      const allocation = calculateTestAllocations(ticket);
      if (allocation) {
        setAllocationData(allocation);
        setSelectedTicket(ticket);
        setShowAllocationModal(true);
      } else {
        toast({
          variant: "destructive",
          title: "No Tests Available",
          description: `No test configurations found for ${ticket.detailsBox.assemblyOQCAno} type`,
          duration: 2000,
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  // Handler functions for edit/delete
  const handleEditTest = (test: TestAllocation) => {
    setEditingTest(test);
    setShowEditDialog(true);
  };

  const handleDeleteTest = (testId: string) => {
    if (allocationData) {
      const updatedTests = allocationData.testAllocations.filter(test => test.id !== testId);
      const totalAllocated = updatedTests.reduce((sum, test) => sum + test.allocatedParts, 0);
      const remainingParts = Math.max(0, allocationData.totalQuantity - totalAllocated);
      
      setAllocationData({
        ...allocationData,
        testAllocations: updatedTests,
        remainingParts
      });
      
      toast({
        title: "Test Deleted",
        description: "Test has been removed from allocation",
        duration: 2000,
      });
    }
  };

  const handleUpdateTest = (updatedTest: TestAllocation) => {
    if (allocationData) {
      // Update the test
      const updatedTests = allocationData.testAllocations.map(test => 
        test.id === updatedTest.id ? updatedTest : test
      );
      
      // If required quantity changed, recalculate all allocations
      const originalTest = allocationData.testAllocations.find(t => t.id === updatedTest.id);
      if (originalTest && originalTest.requiredQty !== updatedTest.requiredQty) {
        // Recalculate total required quantity
        const totalRequiredQty = updatedTests.reduce((sum, test) => sum + test.requiredQty, 0);
        
        // Recalculate allocations based on new proportions
        updatedTests.forEach(test => {
          const proportion = test.requiredQty / totalRequiredQty;
          const allocatedPartsRaw = proportion * allocationData.totalQuantity;
          test.allocatedParts = Math.max(1, Math.round(allocatedPartsRaw));
        });
        
        // Adjust for rounding differences
        let totalAllocated = updatedTests.reduce((sum, test) => sum + test.allocatedParts, 0);
        let difference = allocationData.totalQuantity - totalAllocated;
        
        if (difference !== 0) {
          const sortedTests = [...updatedTests].sort((a, b) => {
            const errorA = Math.abs((a.requiredQty / totalRequiredQty) * allocationData.totalQuantity - a.allocatedParts);
            const errorB = Math.abs((b.requiredQty / totalRequiredQty) * allocationData.totalQuantity - b.allocatedParts);
            return errorB - errorA;
          });
          
          if (difference > 0) {
            let index = 0;
            while (difference > 0) {
              sortedTests[index].allocatedParts += 1;
              difference -= 1;
              index = (index + 1) % sortedTests.length;
            }
          } else {
            let index = 0;
            while (difference < 0) {
              if (sortedTests[index].allocatedParts > 1) {
                sortedTests[index].allocatedParts -= 1;
                difference += 1;
              }
              index = (index + 1) % sortedTests.length;
            }
          }
        }
      }
      
      const finalAllocated = updatedTests.reduce((sum, test) => sum + test.allocatedParts, 0);
      const remainingParts = Math.max(0, allocationData.totalQuantity - finalAllocated);
      
      setAllocationData({
        ...allocationData,
        testAllocations: updatedTests,
        remainingParts
      });
      
      setShowEditDialog(false);
      setEditingTest(null);
      
      toast({
        title: "Test Updated",
        description: "Test information has been updated and allocations recalculated",
        duration: 2000,
      });
    }
  };

  const getFilteredAvailableTests = () => {
    if (!allocationData) return availableTests;
    
    const existingTestNames = new Set(allocationData.testAllocations.map(test => test.testName));
    return availableTests.filter(test => !existingTestNames.has(test.testName));
  };

  const handleTestNameSelect = (testName: string) => {
    const selectedTest = availableTests.find(test => test.testName === testName);
    if (selectedTest) {
      const requiredQty = extractNumericQty(selectedTest.qty);
      setNewTestData({
        testName: selectedTest.testName,
        requiredQty: requiredQty,
        testCondition: selectedTest.testCondition,
        specification: selectedTest.specification,
        machineEquipment: selectedTest.machineEquipment,
        time: selectedTest.time
      });
    }
  };

  const handleAddNewTest = () => {
    if (allocationData && newTestData.testName && newTestData.requiredQty > 0) {
      // Check if test already exists
      const testExists = allocationData.testAllocations.some(
        test => test.testName === newTestData.testName
      );
      
      if (testExists) {
        toast({
          variant: "destructive",
          title: "Duplicate Test",
          description: "This test is already in the allocation",
          duration: 2000,
        });
        return;
      }

      // Create new test object
      const newTest: TestAllocation = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        testName: newTestData.testName,
        allocatedParts: 0, // Will be calculated below
        requiredQty: newTestData.requiredQty,
        testCondition: newTestData.testCondition,
        specification: newTestData.specification,
        machineEquipment: newTestData.machineEquipment,
        time: newTestData.time,
        status: newTestData.allocatedParts,
      };
      
      // Add new test to the list
      const updatedTests = [...allocationData.testAllocations, newTest];
      
      // Calculate total required quantity including new test
      const totalRequiredQty = updatedTests.reduce((sum, test) => sum + test.requiredQty, 0);
      
      // Calculate allocations based on proportion of required quantity
      updatedTests.forEach(test => {
        // Calculate proportion for each test
        const proportion = test.requiredQty / totalRequiredQty;
        // Calculate allocated parts based on proportion
        const allocatedPartsRaw = proportion * allocationData.totalQuantity;
        // Round to nearest whole number
        test.allocatedParts = Math.max(1, Math.round(allocatedPartsRaw));
      });
      
      // Adjust for rounding differences to ensure total allocated parts equals total available parts
      let totalAllocated = updatedTests.reduce((sum, test) => sum + test.allocatedParts, 0);
      let difference = allocationData.totalQuantity - totalAllocated;
      
      if (difference !== 0) {
        // Sort tests by rounding error (largest error first)
        const sortedTests = [...updatedTests].sort((a, b) => {
          const errorA = Math.abs((a.requiredQty / totalRequiredQty) * allocationData.totalQuantity - a.allocatedParts);
          const errorB = Math.abs((b.requiredQty / totalRequiredQty) * allocationData.totalQuantity - b.allocatedParts);
          return errorB - errorA;
        });
        
        if (difference > 0) {
          // Add extra parts to tests with largest rounding errors
          let index = 0;
          while (difference > 0) {
            sortedTests[index].allocatedParts += 1;
            difference -= 1;
            index = (index + 1) % sortedTests.length;
          }
        } else {
          // Remove extra parts from tests with largest rounding errors
          let index = 0;
          while (difference < 0) {
            if (sortedTests[index].allocatedParts > 1) { // Ensure at least 1 part
              sortedTests[index].allocatedParts -= 1;
              difference += 1;
            }
            index = (index + 1) % sortedTests.length;
          }
        }
      }
      
      // Calculate remaining parts
      const finalAllocated = updatedTests.reduce((sum, test) => sum + test.allocatedParts, 0);
      const remainingParts = Math.max(0, allocationData.totalQuantity - finalAllocated);
      
      // Update allocation data
      setAllocationData({
        ...allocationData,
        testAllocations: updatedTests,
        remainingParts
      });
      
      // Reset form
      setNewTestData({
        testName: '',
        requiredQty: 0,
        testCondition: '',
        specification: '',
        machineEquipment: '',
        time: ''
      });
      setShowAddTestDialog(false);
      
      // Show success message with allocation details
      const allocatedCount = newTest.allocatedParts;
      toast({
        title: "New Test Added",
        description: `${newTest.testName} added with ${allocatedCount} allocated parts`,
        duration: 3000,
      });
    }
  };

  const handleSaveAllocation = () => {
    if (allocationData) {
      try {
        saveAllocationToStorage(allocationData);
        // Update local state
        loadSavedAllocations();
      } catch (error) {
        // Error is already handled in saveAllocationToStorage
      }
    }
  };

  const handleDeleteAllocation = () => {
    if (allocationData) {
      deleteAllocationFromStorage(allocationData.ticketCode);
      // Update local state
      loadSavedAllocations();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedAllocations = JSON.parse(content);
        
        // Validate the structure
        if (Array.isArray(importedAllocations)) {
          // Merge with existing allocations (new ones will overwrite by ticketCode)
          const existingAllocations = getAllocationsFromStorage();
          const mergedAllocations = [...existingAllocations];
          
          importedAllocations.forEach((importedAlloc: SavedAllocation) => {
            const existingIndex = mergedAllocations.findIndex(a => a.ticketCode === importedAlloc.ticketCode);
            if (existingIndex >= 0) {
              mergedAllocations[existingIndex] = importedAlloc;
            } else {
              mergedAllocations.push(importedAlloc);
            }
          });
          
          localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(mergedAllocations));
          setSavedAllocations(mergedAllocations);
          
          toast({
            title: "Import Successful",
            description: `Imported ${importedAllocations.length} allocations`,
            duration: 2000,
          });
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          throw new Error("Invalid file format - expected array");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Failed to import allocations. Invalid file format.",
          duration: 2000,
        });
      }
    };
    reader.readAsText(file);
  };

  const getAnoTypeOptions = () => {
    const anoTypes = Array.from(new Set(tickets.map(t => t.detailsBox.assemblyOQCAno)));
    return anoTypes;
  };

  const getProjectOptions = () => {
    const projects = Array.from(new Set(tickets.map(t => t.detailsBox.project)));
    return projects;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterAnoType('all');
    setFilterProject('all');
  };

  // Check if a ticket has saved allocation
  const hasSavedAllocation = (ticketCode: string) => {
    return savedAllocations.some(allocation => allocation.ticketCode === ticketCode);
  };

  // Get saved allocation for a ticket
  const getSavedAllocation = (ticketCode: string) => {
    return savedAllocations.find(allocation => allocation.ticketCode === ticketCode);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button
          onClick={() => setShowAllAllocationsDialog(true)}
          variant="outline"
          className="gap-2"
        >
          <List className="h-4 w-4" />
          View All Allocations ({savedAllocations.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-[#e0413a] text-white">
          <CardTitle className="text-2xl">Ticket View - Test Allocation</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Stage</Label>
              <select
                value={filterAnoType}
                onChange={(e) => setFilterAnoType(e.target.value)}
                className="w-full h-10 border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Types</option>
                {getAnoTypeOptions().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Project</Label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full h-10 border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Projects</option>
                {getProjectOptions().map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-end">
              <Button
                onClick={resetFilters}
                variant="outline"
                className="flex-1"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              {/* <Button
                onClick={exportAllAllocations}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button> */}
            </div>
          </div>

          {/* Allocation Stats */}
          <div className="mb-4 p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Allocation Storage</h3>
                <p className="text-sm text-blue-600">
                  {savedAllocations.length} tickets have saved allocations (stored in single array)
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {savedAllocations.filter(allocation => 
                    allocation?.testAllocations?.length > 0
                  ).length} Active
                </Badge>
                <Button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear ALL allocations? This cannot be undone.")) {
                      clearAllAllocations();
                      setSavedAllocations([]);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="font-semibold">Ticket Code</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Total Quantity</TableHead>
                  <TableHead className="font-semibold">Stage</TableHead>
                  <TableHead className="font-semibold">Allocation Status</TableHead>
                  <TableHead className="font-semibold">Received Date</TableHead>
                  <TableHead className="font-semibold">SOP Link</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => {
                    const hasSaved = hasSavedAllocation(ticket.ticketCode);
                    const allocation = getSavedAllocation(ticket.ticketCode);
                    
                    return (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {ticket.ticketCode}
                          {hasSaved && allocation && (
                            <div className="text-xs text-green-600 font-normal">
                              Last updated: {new Date(allocation.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{ticket.detailsBox.project}</div>
                          <div className="text-xs text-gray-500">{ticket.detailsBox.batch}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{ticket.totalQuantity || ticket.partsBeingSent}</div>
                          <div className="text-xs text-gray-500">parts</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {ticket.detailsBox.assemblyOQCAno}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasSaved && allocation ? (
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Saved ({allocation.testAllocations.length} tests)
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {allocation.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0)} parts allocated
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Not Saved
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{ticket.date}</div>
                          <div className="text-xs text-gray-500">{ticket.shiftTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="url"
                              placeholder="Enter SOP link"
                              value={sopLinks[ticket.id] || ''}
                              onChange={(e) => setSopLinks(prev => ({
                                ...prev,
                                [ticket.id]: e.target.value
                              }))}
                              className="h-8 text-sm"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleViewAllocation(ticket)}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View Allocation
                            </Button>
                            {hasSaved && (
                              <Button
                                onClick={() => {
                                  setAllocationData(allocation || null);
                                  setSelectedTicket(ticket);
                                  setShowAllocationModal(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No tickets found. {searchTerm && 'Try changing your search criteria.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTickets.length} of {tickets.length} tickets | 
            {savedAllocations.length} tickets with saved allocations
          </div>
        </CardContent>
      </Card>

      {/* Allocation Modal */}
      <Dialog open={showAllocationModal} onOpenChange={setShowAllocationModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Test Allocation Details</DialogTitle>
            <DialogDescription>
              {allocationData && hasSavedAllocation(allocationData.ticketCode) 
                ? "Viewing saved allocation" 
                : "Automatic allocation based on test requirements and available parts"
              }
            </DialogDescription>
          </DialogHeader>

          {allocationData && (
            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-blue-50">
                <div>
                  <Label className="text-xs text-gray-600">Ticket Code</Label>
                  <p className="font-medium text-lg">{allocationData.ticketCode}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Total Quantity</Label>
                  <p className="font-medium text-lg">{allocationData.totalQuantity} parts</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Location</Label>
                  <p className="font-medium">{allocationData.location}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Process Stage</Label>
                  <p className="font-medium">{allocationData.processStage}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Project</Label>
                  <p className="font-medium">{allocationData.project}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Stage</Label>
                  <p className="font-medium">{allocationData.anoType}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Build</Label>
                  <p className="font-medium">{allocationData.build}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Colour</Label>
                  <p className="font-medium">{allocationData.colour}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Reason</Label>
                  <p className="font-medium">{allocationData.reason}</p>
                </div>
              </div>

              {/* Allocation Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-green-50">
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Total Tests</Label>
                  <p className="text-2xl font-bold text-blue-700">
                    {allocationData.testAllocations.length}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Total Parts</Label>
                  <p className="text-2xl font-bold text-gray-700">
                    {allocationData.totalQuantity}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Allocated Parts</Label>
                  <p className="text-2xl font-bold text-green-700">
                    {allocationData.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Remaining Parts</Label>
                  <p className="text-2xl font-bold text-orange-700">
                    {allocationData.remainingParts}
                  </p>
                </div>
              </div>

              {/* Test Allocation Table with Actions */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-lg">Test Allocations</h3>
                  <Button
                    onClick={() => setShowAddTestDialog(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Test
                  </Button>
                </div>
                
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-semibold">Test Name</TableHead>
                      {/* <TableHead className="font-semibold">Machine Build</TableHead> */}
                      <TableHead className="font-semibold">Allocated Parts</TableHead>
                      <TableHead className="font-semibold">Test Condition</TableHead>
                      <TableHead className="font-semibold">Equipment</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationData.testAllocations.map((test) => (
                      <TableRow key={test.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {test.testName}
                          {test.notes && (
                            <div className="text-xs text-gray-500 mt-1">{test.notes}</div>
                          )}
                        </TableCell>
                        {/* <TableCell>
                          <div className="font-medium">{test.requiredQty} pcs</div>
                        </TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-lg text-green-700">
                              {test.status }
                            </div>
                            <div className="text-xs text-gray-500">
                              parts
                            </div>
                          </div>
                          {test.allocatedParts > 0 && (
                            <div className="text-xs text-green-600">
                              {Math.round((test.allocatedParts / allocationData.totalQuantity) * 100)}% of total
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {test.testCondition}
                        </TableCell>
                        <TableCell className="text-sm">
                          {test.machineEquipment}
                        </TableCell>
                        <TableCell className="text-sm">
                          {test.time}h
                        </TableCell>
                        <TableCell>
                          {/* <Badge className={STATUS_OPTIONS.find(s => s.value === test.status)?.color}>
                            {test.status}
                          </Badge> */}
                          {test.allocatedParts}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTest(test)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTest(test.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                {hasSavedAllocation(allocationData.ticketCode) && (
                  <Button
                    variant="outline"
                    onClick={handleDeleteAllocation}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Allocation
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowAllocationModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleSaveAllocation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {hasSavedAllocation(allocationData.ticketCode) ? 'Update Allocation' : 'Save Allocation'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All Allocations Dialog */}
      <Dialog open={showAllAllocationsDialog} onOpenChange={setShowAllAllocationsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">All Saved Allocations</DialogTitle>
            <DialogDescription>
              View and manage all ticket allocations stored in the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-blue-50">
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Allocations</Label>
                <p className="text-2xl font-bold text-blue-700">
                  {savedAllocations.length}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Tickets</Label>
                <p className="text-2xl font-bold text-gray-700">
                  {new Set(savedAllocations.map(a => a.ticketCode)).size}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Tests</Label>
                <p className="text-2xl font-bold text-green-700">
                  {savedAllocations.reduce((sum, alloc) => sum + alloc.testAllocations.length, 0)}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Parts</Label>
                <p className="text-2xl font-bold text-orange-700">
                  {savedAllocations.reduce((sum, alloc) => sum + alloc.totalQuantity, 0)}
                </p>
              </div>
            </div>

            {/* Allocations Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-lg">All Allocation Records</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={exportAllAllocations}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear ALL allocations? This cannot be undone.")) {
                        clearAllAllocations();
                        setSavedAllocations([]);
                      }
                    }}
                    size="sm"
                    variant="outline"
                    className="gap-2 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="font-semibold">Ticket Code</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Total Parts</TableHead>
                    <TableHead className="font-semibold">Stage</TableHead>
                    <TableHead className="font-semibold">No. of Tests</TableHead>
                    <TableHead className="font-semibold">Allocated Parts</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedAllocations.length > 0 ? (
                    savedAllocations.map((allocation) => (
                      <TableRow key={allocation.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {allocation.ticketCode}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{allocation.project}</div>
                          <div className="text-xs text-gray-500">{allocation.build}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{allocation.totalQuantity}</div>
                          <div className="text-xs text-gray-500">parts</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {allocation.anoType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">
                            {allocation.testAllocations.length} tests
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-700">
                            {allocation.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            of {allocation.totalQuantity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(allocation.updatedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(allocation.updatedAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setAllocationData(allocation);
                                setSelectedTicket(tickets.find(t => t.ticketCode === allocation.ticketCode) || null);
                                setShowAllAllocationsDialog(false);
                                setShowAllocationModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Delete allocation for ticket ${allocation.ticketCode}?`)) {
                                  deleteAllocationFromStorage(allocation.ticketCode);
                                  loadSavedAllocations();
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No allocations saved yet. Create allocations for tickets to see them here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAllAllocationsDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Test Dialog */}
      <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
            <DialogDescription>
              Select a test from the dropdown or enter custom test details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name *</Label>
              <Select onValueChange={handleTestNameSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test or enter custom name" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredAvailableTests().map((test, index) => (
                    <SelectItem key={index} value={test.testName}>
                      {test.testName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                {getFilteredAvailableTests().length} available tests
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredQty">Machine Build</Label>
                <Input
                  id="requiredQty"
                  type="number"
                  value={newTestData.requiredQty}
                  onChange={(e) => setNewTestData({...newTestData, requiredQty: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newTestData.time}
                  onChange={(e) => setNewTestData({...newTestData, time: e.target.value})}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCondition">Test Condition</Label>
              <Input
                id="testCondition"
                value={newTestData.testCondition}
                onChange={(e) => setNewTestData({...newTestData, testCondition: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specification">Specification</Label>
              <Input
                id="specification"
                value={newTestData.specification}
                onChange={(e) => setNewTestData({...newTestData, specification: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machineEquipment">Equipment</Label>
              <Input
                id="machineEquipment"
                value={newTestData.machineEquipment}
                onChange={(e) => setNewTestData({...newTestData, machineEquipment: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddTestDialog(false);
              setNewTestData({
                testName: '',
                requiredQty: 0,
                testCondition: '',
                specification: '',
                machineEquipment: '',
                time: ''
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewTest} 
              disabled={!newTestData.testName || newTestData.requiredQty <= 0}
            >
              Add Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>
              Modify test details. Allocations will be recalculated if quantity changes.
            </DialogDescription>
          </DialogHeader>
          {editingTest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editTestName">Test Name</Label>
                <Input
                  id="editTestName"
                  value={editingTest.testName}
                  onChange={(e) => setEditingTest({...editingTest, testName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRequiredQty">Machine Build</Label>
                  <Input
                    id="editRequiredQty"
                    type="number"
                    value={editingTest.requiredQty}
                    onChange={(e) => setEditingTest({...editingTest, requiredQty: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTime">Time</Label>
                  <Input
                    id="editTime"
                    value={editingTest.time}
                    onChange={(e) => setEditingTest({...editingTest, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTestCondition">Test Condition</Label>
                <Input
                  id="editTestCondition"
                  value={editingTest.testCondition}
                  onChange={(e) => setEditingTest({...editingTest, testCondition: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecification">Specification</Label>
                <Input
                  id="editSpecification"
                  value={editingTest.specification}
                  onChange={(e) => setEditingTest({...editingTest, specification: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEquipment">Equipment</Label>
                <Input
                  id="editEquipment"
                  value={editingTest.machineEquipment}
                  onChange={(e) => setEditingTest({...editingTest, machineEquipment: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingTest.status}
                  onValueChange={(value: 'Pending' | 'In Progress' | 'Completed' | 'Failed') => 
                    setEditingTest({...editingTest, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes (Optional)</Label>
                <Input
                  id="editNotes"
                  value={editingTest.notes || ''}
                  onChange={(e) => setEditingTest({...editingTest, notes: e.target.value})}
                  placeholder="Add any notes..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingTest(null);
            }}>
              Cancel
            </Button>
            <Button onClick={() => editingTest && handleUpdateTest(editingTest)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketViewPage;