
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Search, Filter, Eye, Edit2, Trash2, CheckCircle, XCircle, Clock, Plus, Download, Upload, FileEdit, ChevronDown, ChevronRight, List, Save, AlertCircle, ArrowRight } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';

// Interfaces
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
  status: string;
  totalQuantity?: number;
  movedToStage2At?: string;
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
}

interface TestAllocation {
  id: string;
  testName: string;
  allocatedParts: number;           // Original allocation (static - never changes)
  currentAllocatedParts: number;    // Dynamic - decreases as parts are scanned
  requiredQty: number;
  testCondition: string;
  specification: string;
  machineEquipment: string;
  machineEquipment2: string;        // Added for child rows
  time: string;
  status: number;
  notes?: string;
  isExpanded?: boolean;             // Added for expansion state
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
  matchedProcessStage?: string;
}

interface SavedAllocation extends TicketAllocationData {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface ParsedProcessStage {
  type: string;
  project: string;
  reason: string;
  original: string;
}

interface ExcelTestConfiguration {
  "Processes Stage": string;
  "Test Name": string;
  "Test Condition": string;
  "Qty": string;
  "Specification": string;
  "Machine / Eqipment": string;
  "Machine / Eqipment-2": string;
  "Time": string;
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

// Master Excel file path
const MASTER_EXCEL_PATH = '/master_sheet.xlsx';


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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

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

// ADD THESE TWO NEW FUNCTIONS HERE:

// Helper function to check if test name has multiple tests (contains +)
const hasMultipleTests = (testName: string): boolean => {
  return testName.includes('+');
};

// Helper function to split test name by +
const splitTestName = (testName: string): string[] => {
  if (!testName) return [];

  return testName
    .split('+')
    .map(name => name.trim())
    .filter(name => name.length > 0);
};

// Helper function to split combined machine list (KEEP THIS EXISTING FUNCTION)
const splitMachineList = (machineString: string): string[] => {

  if (!machineString) return [];

  // Split by common separators: +, /, ,, ;
  const separators = /[+/,;]/;
  return machineString
    .split(separators)
    .map(machine => machine.trim())
    .filter(machine => machine.length > 0);
};

// Helper function to combine machine lists from master sheet
const combineMachineLists = (machine1: string, machine2: string): string => {
  const machines = [];
  if (machine1) machines.push(machine1);
  if (machine2) machines.push(machine2);

  // Remove duplicates and join with " + "
  return [...new Set(machines)].filter(Boolean).join(" + ");
};

// Helper function to get combined duration (take the first valid duration)
const getCombinedDuration = (time: string): string => {
  if (!time) return "";

  // Extract numeric value and unit
  const match = time.match(/(\d+(?:\.\d+)?)\s*(hr|hour|h)?/i);
  if (match) {
    const value = match[1];
    const unit = match[2]?.toLowerCase() || 'hr';
    return `${value} ${unit}`;
  }
  return time;
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
  const [masterTestConfigs, setMasterTestConfigs] = useState<TestConfiguration[]>([]);
  const [availableProcessStages, setAvailableProcessStages] = useState<ParsedProcessStage[]>([]);
  const [loadingMasterSheet, setLoadingMasterSheet] = useState(false);
  const [newTestData, setNewTestData] = useState({
    testName: '',
    requiredQty: 0,
    testCondition: '',
    specification: '',
    machineEquipment: '',
    machineEquipment2: '',
    time: '',
    allocatedParts: ''
  });
  const [sopLinks, setSopLinks] = useState<{ [key: number]: string }>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Load tickets, allocations, and master sheet on mount
  useEffect(() => {
    loadTickets();
    loadSavedAllocations();
    loadMasterExcelSheet();
  }, []);

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterAnoType, filterProject, tickets]);

  // Helper function to check reason matches (handles qualification variations)
  const reasonMatches = useCallback((masterReason: string, ticketReason: string): boolean => {
    if (!masterReason || !ticketReason) return false;

    const masterLower = masterReason.toLowerCase().trim();
    const ticketLower = ticketReason.toLowerCase().trim();

    // Direct match
    if (masterLower === ticketLower) return true;

    // Handle NPI exact match
    if (masterLower === 'npi' && ticketLower === 'npi') return true;
    if (masterLower === 'mp' && ticketLower === 'mp') return true;

    // Handle qualification variations (including Line/Machine qualification)
    if ((masterLower === 'line/machine qualification' ||
      masterLower === 'line qualification' ||
      masterLower === 'machine qualification') &&
      (ticketLower === 'line qualification' ||
        ticketLower === 'machine qualification' ||
        ticketLower === 'qualification')) {
      return true;
    }

    // All qualification types match each other
    const isQualification = (reason: string) =>
      reason.includes('qualification') || reason === 'qualification';

    if (isQualification(masterLower) && isQualification(ticketLower)) {
      return true;
    }

    return false;
  }, []);

  // Helper function to check project matches (handles FLASH ↔ LIGHT equivalence)
  const projectMatches = useCallback((masterProject: string, ticketProject: string): boolean => {
    if (!masterProject || !ticketProject) return false;

    const masterLower = masterProject.toLowerCase();
    const ticketLower = ticketProject.toLowerCase();

    // Direct match
    if (masterLower === ticketLower) return true;

    // FLASH ↔ LIGHT equivalence
    if ((masterLower.includes('flash') || masterLower.includes('light')) &&
      (ticketLower.includes('flash') || ticketLower.includes('light'))) {
      return true;
    }

    // For "Flash/Light" format in master sheet
    if (masterLower.includes('flash/light') || masterLower.includes('light/flash')) {
      if (ticketLower.includes('flash') || ticketLower.includes('light')) {
        return true;
      }
    }

    return false;
  }, []);

  // Parse process stage string into components
  const parseProcessStage = useCallback((processStage: string): ParsedProcessStage => {
    if (!processStage) return { type: '', project: '', reason: '', original: processStage };

    // Clean the string - remove extra spaces and normalize
    const cleanedStage = processStage.trim();

    // Split by spaces and filter out empty strings
    const parts = cleanedStage.split(/\s+/).filter(p => p.trim());

    if (parts.length < 2) {
      return {
        type: parts[0]?.toUpperCase() || '',
        project: '',
        reason: '',
        original: cleanedStage
      };
    }

    const type = parts[0]?.toUpperCase() || '';
    let project = '';
    let reason = '';

    // Special handling for HULK: type + reason only (no project)
    if (type === 'HULK') {
      // HULK format: "HULK NPI", "HULK MP", "HULK Line/Machine Qualification"
      reason = parts.slice(1).join(' ');
    } else {
      // For other types (ANO, ASSEMBLY): type + project + reason
      // Handle "ANO Flash/Light NPI" format - project is "Flash/Light", reason is "NPI"
      if (parts[1]?.includes('/')) {
        project = parts[1] || '';
        reason = parts.slice(2).join(' ');
      } else {
        // Handle "ANO FLASH NPI" format
        project = parts[1] || '';
        reason = parts.slice(2).join(' ');
      }
    }

    return {
      type,
      project,
      reason,
      original: cleanedStage
    };
  }, []);

  // Find matching process stage for a ticket
  const findMatchingProcessStage = useCallback((ticket: Stage1Record, processStages: ParsedProcessStage[]): ParsedProcessStage | null => {
    const ticketAnoType = ticket.detailsBox.assemblyOQCAno?.toUpperCase() || '';
    const ticketProject = ticket.detailsBox.project || '';
    const ticketReason = ticket.detailsBox.reason || '';

    // Filter by anoType first
    const matchingTypeStages = processStages.filter(stage => stage.type === ticketAnoType);

    if (matchingTypeStages.length === 0) {
      console.warn(`No process stages found for anoType: ${ticketAnoType}`);
      return null;
    }

    // SPECIAL HANDLING FOR HULK: Only match on project + reason, IGNORE anoType
    if (ticketProject.toUpperCase() === 'HULK') {
      console.log('HULK TICKET DETECTED - Matching on Project + Reason ONLY (ignoring anoType)');

      // Filter stages where type is HULK (from master sheet)
      const hulkStages = processStages.filter(stage => stage.type === 'HULK');

      // Format ticket reason for matching
      let formattedTicketReason = ticketReason.toLowerCase().trim();

      // Convert qualification variations to unified format
      if (formattedTicketReason.includes('line qualification') ||
        formattedTicketReason.includes('machine qualification')) {
        formattedTicketReason = 'line/machine qualification';
      }

      // Try exact match first, then use reasonMatches logic
      const exactMatch = hulkStages.find(stage =>
        stage.reason.toLowerCase() === formattedTicketReason
      );

      if (exactMatch) return exactMatch;

      const matchingStages = hulkStages.filter(stage =>
        reasonMatches(stage.reason, formattedTicketReason)
      );

      if (matchingStages.length > 0) return matchingStages[0];

      return null;
    }

    // For ANO/ASSEMBLY types (requires anoType + project + reason)
    if (ticketAnoType === 'ANO' || ticketAnoType === 'ASSEMBLY') {
      console.log('ANO/ASSEMBLY Matching:', {
        ticketAnoType,
        ticketProject,
        ticketReason,
        availableStages: matchingTypeStages.map(s => s.original)
      });

      // Format ticket qualification reason if needed
      let formattedTicketReason = ticketReason.toLowerCase().trim();
      if (formattedTicketReason.includes('line qualification') ||
        formattedTicketReason.includes('machine qualification')) {
        formattedTicketReason = 'line/machine qualification';
      }

      const matchingStages = matchingTypeStages.filter(stage => {
        // Check project match with FLASH/LIGHT equivalence
        const projectMatch = projectMatches(stage.project, ticketProject);

        // Check reason match with qualification variations
        const reasonMatch = reasonMatches(stage.reason, formattedTicketReason);

        if (projectMatch && reasonMatch) {
          console.log('Stage matches:', {
            stage: stage.original,
            stageProject: stage.project,
            stageReason: stage.reason,
            ticketProject,
            ticketReason,
            formattedTicketReason,
            projectMatch,
            reasonMatch
          });
        }

        return projectMatch && reasonMatch;
      });

      if (matchingStages.length > 0) {
        console.log('Found ANO/ASSEMBLY match:', matchingStages[0].original);
        return matchingStages[0];
      }

      console.warn(`No matching ANO/ASSEMBLY process stage found for ticket:`, {
        ticketCode: ticket.ticketCode,
        anoType: ticketAnoType,
        project: ticketProject,
        reason: ticketReason,
        formattedReason: formattedTicketReason,
        availableStages: matchingTypeStages.map(s => ({
          original: s.original,
          parsed: { type: s.type, project: s.project, reason: s.reason }
        }))
      });
    }

    return null;
  }, [projectMatches, reasonMatches]);

  // Validate master sheet formats
  useEffect(() => {
    if (masterTestConfigs.length > 0) {
      console.log('=== MASTER SHEET VALIDATION ===');

      // Get all unique process stages
      const uniqueStages = Array.from(
        new Set(masterTestConfigs.map(config => config.processStage))
      );

      // Parse each stage
      const parsedStages = uniqueStages.map(stage => parseProcessStage(stage));

      // Group by type
      const byType = {
        ANO: parsedStages.filter(s => s.type === 'ANO'),
        ASSEMBLY: parsedStages.filter(s => s.type === 'ASSEMBLY'),
        HULK: parsedStages.filter(s => s.type === 'HULK')
      };

      console.log('ANO formats:', byType.ANO.map(s => s.original));
      console.log('ASSEMBLY formats:', byType.ASSEMBLY.map(s => s.original));
      console.log('HULK formats:', byType.HULK.map(s => s.original));

      // Check for expected formats
      const expectedHulkFormats = ['HULK NPI', 'HULK MP', 'HULK LINE/MACHINE QUALIFICATION'];
      const missingHulkFormats = expectedHulkFormats.filter(expected =>
        !byType.HULK.some(stage =>
          stage.original.toUpperCase() === expected.toUpperCase()
        )
      );

      if (missingHulkFormats.length > 0) {
        console.warn('Missing HULK formats in master sheet:', missingHulkFormats);
      }
    }
  }, [masterTestConfigs, parseProcessStage]);

  // Load master Excel sheet
  const loadMasterExcelSheet = async () => {
    setLoadingMasterSheet(true);
    try {
      const response = await fetch(MASTER_EXCEL_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON with original column names
      const jsonData: ExcelTestConfiguration[] = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel data loaded:', jsonData.slice(0, 5)); // Debug log - first 5 rows

      // Map to TestConfiguration format, handling the differences
      const testConfigs: TestConfiguration[] = jsonData.map((row: ExcelTestConfiguration) => {
        // Clean up process stage - remove leading/trailing spaces
        const processStage = row['Processes Stage']?.toString().trim() || '';

        // Extract numeric quantity from "10pcs/build"
        const qtyString = row['Qty']?.toString() || '';
        const qtyMatch = qtyString.match(/\d+/);
        const numericQty = qtyMatch ? qtyMatch[0] : '0';

        console.log(row.Time)

        return {
          processStage: processStage,
          testName: row['Test Name']?.toString().trim() || '',
          testCondition: row['Test Condition']?.toString().trim() || '',
          qty: numericQty, // Store as just "10" instead of "10pcs/build"
          specification: row['Specification']?.toString().trim() || '',
          machineEquipment: row['Machine / Eqipment-2']?.toString().trim() || '',
          machineEquipment2: row['Machine / Eqipment-2']?.toString().trim() || '',
          time: row.Time
        };
      }).filter(config => config.processStage); // Filter out empty process stages

      setMasterTestConfigs(testConfigs);

      console.log('-----', testConfigs)

      // Parse and store unique process stages
      const uniqueProcessStages = Array.from(
        new Set(testConfigs.map(config => config.processStage))
      );

      const parsedStages = uniqueProcessStages.map(stage => parseProcessStage(stage));
      setAvailableProcessStages(parsedStages);

      console.log('Process stages parsed:', parsedStages.slice(0, 10)); // Debug log

      toast({
        title: "Master Sheet Loaded",
        description: `Loaded ${testConfigs.length} test configurations from ${uniqueProcessStages.length} process stages`,
        duration: 2000,
      });

    } catch (error) {
      console.error('Failed to load master Excel sheet:', error);
      toast({
        variant: "destructive",
        title: "Master Sheet Load Failed",
        description: `Failed to load master test configuration sheet: ${error}`,
        duration: 3000,
      });
    } finally {
      setLoadingMasterSheet(false);
    }
  };

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

  const extractNumericQty = (qtyString: string): number => {
    if (!qtyString) return 0;

    // Handle different formats:
    // "10pcs/build" → 10
    // "5 pcs" → 5
    // "15" → 15
    const match = qtyString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Calculate test allocations for a ticket
  const calculateTestAllocations = useCallback((ticket: Stage1Record): TicketAllocationData | null => {
    if (masterTestConfigs.length === 0) {
      toast({
        variant: "destructive",
        title: "Master Sheet Not Loaded",
        description: "Please wait for master sheet to load",
        duration: 2000,
      });
      return null;
    }

    console.log('=== CALCULATING ALLOCATION FOR TICKET ===');
    console.log('Ticket:', {
      code: ticket.ticketCode,
      anoType: ticket.detailsBox.assemblyOQCAno,
      project: ticket.detailsBox.project,
      reason: ticket.detailsBox.reason,
      quantity: ticket.totalQuantity || ticket.partsBeingSent
    });

    // Find matching process stage
    const matchingStage = findMatchingProcessStage(ticket, availableProcessStages);

    if (!matchingStage) {
      console.error('No matching stage found for ticket:', ticket.ticketCode);
      toast({
        variant: "destructive",
        title: "No Matching Process Stage",
        description: `Could not find matching process stage for ticket ${ticket.ticketCode}`,
        duration: 3000,
      });
      return null;
    }

    console.log('Matched stage:', matchingStage.original);

    // Filter configs for the matched process stage
    const stageConfigs = masterTestConfigs.filter(
      config => config.processStage === matchingStage.original
    );

    // Get all test names for this process stage
    const allTestNames = Array.from(
      new Set(stageConfigs.map(config => config.testName))
    );

    if (allTestNames.length === 0) {
      toast({
        variant: "destructive",
        title: "No Tests Found",
        description: `No test configurations found for process stage: ${matchingStage.original}`,
        duration: 2000,
      });
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
        allocatedParts: allocatedParts,           // Original static value
        currentAllocatedParts: allocatedParts,    // Dynamic - starts same as allocatedParts
        requiredQty: numericQty,
        testCondition: config.testCondition,
        specification: config.specification,
        machineEquipment: config.machineEquipment,
        machineEquipment2: config.machineEquipment2,
        time: config.time,
        status: 1, // Default status
        isExpanded: false
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
          sortedAllocations[index].currentAllocatedParts += 1;
          difference -= 1;
          index = (index + 1) % sortedAllocations.length;
        }
      } else {
        let index = 0;
        while (difference < 0) {
          if (sortedAllocations[index].allocatedParts > 0) {
            sortedAllocations[index].allocatedParts -= 1;
            sortedAllocations[index].currentAllocatedParts -= 1;
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
        highestRequiredTest.currentAllocatedParts = 1;
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
      processStage: matchingStage.original,
      reason: ticket.detailsBox.reason,
      remainingParts,
      matchedProcessStage: matchingStage.original
    };
  }, [masterTestConfigs, availableProcessStages, findMatchingProcessStage]);

  // Handle row expansion
  // Handle row expansion (only for tests with + in name)
  const handleTestNameClick = (testId: string, testName: string) => {
    // Only allow expansion if test name contains +
    if (!hasMultipleTests(testName)) return;

    const newExpandedRows = new Set(expandedRows);

    if (newExpandedRows.has(testId)) {
      newExpandedRows.delete(testId);
    } else {
      // Collapse all other rows first
      newExpandedRows.clear();
      newExpandedRows.add(testId);
    }

    setExpandedRows(newExpandedRows);
  };

  const handleViewAllocation = (ticket: Stage1Record) => {
    // Reset expanded rows when opening modal
    setExpandedRows(new Set());

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
          const allocatedParts = Math.max(1, Math.round(allocatedPartsRaw));
          test.allocatedParts = allocatedParts;
          test.currentAllocatedParts = allocatedParts; // Reset current to match new allocation
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
              sortedTests[index].currentAllocatedParts += 1;
              difference -= 1;
              index = (index + 1) % sortedTests.length;
            }
          } else {
            let index = 0;
            while (difference < 0) {
              if (sortedTests[index].allocatedParts > 1) {
                sortedTests[index].allocatedParts -= 1;
                sortedTests[index].currentAllocatedParts -= 1;
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
    if (!allocationData) return [];

    // Get all tests for the current process stage
    const stageTests = masterTestConfigs.filter(
      config => config.processStage === allocationData.processStage
    );

    const existingTestNames = new Set(allocationData.testAllocations.map(test => test.testName));
    return stageTests.filter(test => !existingTestNames.has(test.testName));
  };

  const handleTestNameSelect = (testName: string) => {
    const stageTests = masterTestConfigs.filter(
      config => config.processStage === allocationData?.processStage
    );
    const selectedTest = stageTests.find(test => test.testName === testName);
    if (selectedTest) {
      const requiredQty = extractNumericQty(selectedTest.qty);
      setNewTestData({
        testName: selectedTest.testName,
        requiredQty: requiredQty,
        testCondition: selectedTest.testCondition,
        specification: selectedTest.specification,
        machineEquipment: selectedTest.machineEquipment,
        machineEquipment2: selectedTest.machineEquipment2,
        time: selectedTest.time,
        allocatedParts: ''
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
        currentAllocatedParts: 0, // Will be calculated below
        requiredQty: newTestData.requiredQty,
        testCondition: newTestData.testCondition,
        specification: newTestData.specification,
        machineEquipment: newTestData.machineEquipment,
        machineEquipment2: newTestData.machineEquipment2,
        time: newTestData.time,
        status: parseInt(newTestData.allocatedParts) || 0,
        isExpanded: false
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
        const allocatedParts = Math.max(1, Math.round(allocatedPartsRaw));
        test.allocatedParts = allocatedParts;
        test.currentAllocatedParts = allocatedParts; // Set current to same as allocated
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
            sortedTests[index].currentAllocatedParts += 1;
            difference -= 1;
            index = (index + 1) % sortedTests.length;
          }
        } else {
          // Remove extra parts from tests with largest rounding errors
          let index = 0;
          while (difference < 0) {
            if (sortedTests[index].allocatedParts > 1) { // Ensure at least 1 part
              sortedTests[index].allocatedParts -= 1;
              sortedTests[index].currentAllocatedParts -= 1;
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
        machineEquipment2: '',
        time: '',
        allocatedParts: ''
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

  // Master sheet loading status
  const renderMasterSheetStatus = () => {
    if (loadingMasterSheet) {
      return (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Loading master Excel sheet from {MASTER_EXCEL_PATH}...
          </AlertDescription>
        </Alert>
      );
    }

    if (masterTestConfigs.length === 0) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Master Excel sheet not loaded. Test allocations cannot be calculated.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Master sheet loaded: {masterTestConfigs.length} test configurations, {availableProcessStages.length} process stages
        </AlertDescription>
      </Alert>
    );
  };

  // Render test allocation rows with expansion
  const renderTestAllocationRows = () => {
    if (!allocationData) return null;

    const rows: JSX.Element[] = [];

    allocationData.testAllocations.forEach((test) => {
      const isExpanded = expandedRows.has(test.id);
      const scannedPartsCount = test.currentAllocatedParts - test.allocatedParts;
      const progressPercentage = test.currentAllocatedParts > 0
        ? ((scannedPartsCount / test.currentAllocatedParts) * 100).toFixed(1)
        : 0;

      // Check if test name has multiple tests (contains +)
      const hasMultipleTestNames = hasMultipleTests(test.testName);
      const individualTestNames = hasMultipleTestNames ? splitTestName(test.testName) : [test.testName];

      // Get individual machines from combined machine list
      const combinedMachines = combineMachineLists(test.machineEquipment, test.machineEquipment2);
      const combinedDuration = getCombinedDuration(test.time);
      console.log('combinedDuration', test.time)

      // Parent Row (collapsed state)
      rows.push(
        <TableRow key={`parent-${test.id}`} className="hover:bg-gray-50">
          {/* Test Name Column - Clickable */}
          {/* Test Name Column - Clickable only if has + */}
          <TableCell className="font-medium">
            <div
              className={`flex items-center ${hasMultipleTestNames ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => hasMultipleTestNames && handleTestNameClick(test.id, test.testName)}
            >
              {hasMultipleTestNames && (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )
              )}
              {!hasMultipleTestNames && <div className="w-6"></div>}
              <span className="font-semibold">{test.testName}</span>
            </div>
            {test.notes && (
              <div className="text-xs text-gray-500 mt-1 ml-6">{test.notes}</div>
            )}
          </TableCell>

          {/* Planned Parts Column */}
          <TableCell>
            <div className="flex flex-col gap-1">
              <div className="font-bold text-xl text-blue-700">
                {test.currentAllocatedParts}
              </div>
              <div className="text-xs text-gray-500">
                planned parts
              </div>
              <div className="text-xs text-blue-600">
                {Math.round((test.allocatedParts / allocationData.totalQuantity) * 100)}% of total
              </div>
            </div>
          </TableCell>

          {/* Status Column - Shows DYNAMIC current status */}
          <TableCell>
            <div className="flex flex-col gap-1">
              <div className="font-bold text-xl text-green-700">
                {test.allocatedParts}
              </div>
              <div className="text-xs text-gray-500">
                remaining
              </div>
              <div className="text-xs text-green-600">
                {Math.round((test.currentAllocatedParts / test.allocatedParts) * 100)}% remaining
              </div>
            </div>
          </TableCell>

          {/* Test Condition Column */}
          <TableCell className="text-sm">
            {test.testCondition}
          </TableCell>

          {/* Combined Machine List Column */}
          <TableCell className="text-sm">
            {combinedMachines}
          </TableCell>

          {/* Combined Duration Column */}
          <TableCell className="text-sm">
            {combinedDuration}
          </TableCell>

          {/* Progress Column */}
          <TableCell>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Progress:</span>
                <span className="text-xs font-medium text-blue-600">
                  {scannedPartsCount}/{test.currentAllocatedParts}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {progressPercentage}% scanned
              </div>
            </div>
          </TableCell>

          {/* Actions Column */}
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
      );

      // Child Rows (expanded state) - Only if test name has + 
      if (isExpanded && hasMultipleTestNames && individualTestNames.length > 1) {
        individualTestNames.forEach((testName, index) => {
          rows.push(
            <TableRow key={`child-${test.id}-${index}`} className="bg-gray-50 hover:bg-gray-100">
              {/* Test Name Column - Indented */}
              <TableCell className="font-medium">
                <div className="flex items-center ml-6">
                  <div className="w-4 mr-2"></div> {/* Spacer for alignment */}
                  <span className="text-gray-600">{testName}</span>
                </div>
              </TableCell>

              {/* Planned Parts Column - Same as parent */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-xl text-blue-700">
                    {test.allocatedParts}
                  </div>
                  <div className="text-xs text-gray-500">
                    planned parts
                  </div>
                </div>
              </TableCell>

              {/* Remaining Parts Column - Same as parent */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-xl text-green-700">
                    {test.currentAllocatedParts}
                  </div>
                  <div className="text-xs text-gray-500">
                    remaining
                  </div>
                </div>
              </TableCell>

              {/* Progress Column - Same as parent */}
              {/* Test Condition Column */}
              <TableCell className="text-sm">
                {test.testCondition}
              </TableCell>

              {/* Machine Name Column - Show combined machines */}
              <TableCell className="text-sm">
                {combinedMachines}
              </TableCell>

              {/* Duration Column */}
              <TableCell className="text-sm">
                {combinedDuration}
              </TableCell>

              {/* Progress Column - Same as parent */}
              <TableCell>                <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Progress:</span>
                  <span className="text-xs font-medium text-blue-600">
                    {scannedPartsCount}/{test.allocatedParts}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {progressPercentage}% scanned
                </div>
              </div>
              </TableCell>
              {/* Actions Column - Empty for child rows */}
              <TableCell className="text-right">
                {/* Child rows are read-only, no actions */}
              </TableCell>
            </TableRow>
          );
        });
      }
    });

    return rows;
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

      {renderMasterSheetStatus()}

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
                                {allocation.testAllocations.reduce((sum, test) => sum + test.currentAllocatedParts, 0)} parts remaining
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
                              disabled={loadingMasterSheet || masterTestConfigs.length === 0}
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
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Test Allocation Details</DialogTitle>
            <DialogDescription>
              {allocationData && hasSavedAllocation(allocationData.ticketCode)
                ? "Viewing saved allocation"
                : "Automatic allocation based on master sheet matching"
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

              {/* Process Stage Matching Info */}
              {allocationData.matchedProcessStage && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <span className="font-semibold">Matched Process Stage:</span> {allocationData.matchedProcessStage}
                    <div className="text-sm mt-1">
                      Based on: {allocationData.anoType} + {allocationData.project} + {allocationData.reason}
                      {allocationData.project.toUpperCase().includes('FLASH') ||
                        allocationData.project.toUpperCase().includes('LIGHT') ?
                        ' (FLASH/LIGHT equivalence applied)' : ''}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

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
                  <Label className="text-xs text-gray-600">Planned Parts</Label>
                  <p className="text-2xl font-bold text-blue-700">
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

              {/* Test Allocation Table with Expansion */}
              <div className="border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-lg">Test Allocations</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddTestDialog(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Test
                    </Button>

                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-semibold">Test Name</TableHead>
                      <TableHead className="font-semibold">Planned Parts</TableHead>
                      <TableHead className="font-semibold">Remaining Parts</TableHead>
                      <TableHead className="font-semibold">Test Condition</TableHead>
                      <TableHead className="font-semibold">Machine List</TableHead>
                      <TableHead className="font-semibold">Duration</TableHead>
                      <TableHead className="font-semibold">Progress</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTestAllocationRows()}
                  </TableBody>
                </Table>
              </div>

              {/* Progress Summary */}
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-3">Allocation Progress Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {allocationData.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Planned Parts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {allocationData.testAllocations.reduce((sum, test) => sum + (test.allocatedParts - test.currentAllocatedParts), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Parts Scanned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-700">
                      {allocationData.testAllocations.reduce((sum, test) => sum + test.currentAllocatedParts, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Parts Remaining</div>
                  </div>
                </div>
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
                  onClick={() => {
                    setExpandedRows(new Set());
                    setShowAllocationModal(false);
                  }}
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
                <Label className="text-xs text-gray-600">Total Planned Parts</Label>
                <p className="text-2xl font-bold text-orange-700">
                  {savedAllocations.reduce((sum, alloc) => sum + alloc.testAllocations.reduce((testSum, test) => testSum + test.allocatedParts, 0), 0)}
                </p>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-green-50">
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Parts Scanned</Label>
                <p className="text-2xl font-bold text-green-700">
                  {savedAllocations.reduce((sum, alloc) => sum +
                    alloc.testAllocations.reduce((testSum, test) =>
                      testSum + (test.allocatedParts - test.currentAllocatedParts), 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-gray-600">Total Parts Remaining</Label>
                <p className="text-2xl font-bold text-blue-700">
                  {savedAllocations.reduce((sum, alloc) => sum +
                    alloc.testAllocations.reduce((testSum, test) =>
                      testSum + test.currentAllocatedParts, 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-gray-600">Overall Progress</Label>
                <p className="text-2xl font-bold text-purple-700">
                  {(() => {
                    const totalPlanned = savedAllocations.reduce((sum, alloc) => sum +
                      alloc.testAllocations.reduce((testSum, test) => testSum + test.allocatedParts, 0), 0);
                    const totalScanned = savedAllocations.reduce((sum, alloc) => sum +
                      alloc.testAllocations.reduce((testSum, test) =>
                        testSum + (test.allocatedParts - test.currentAllocatedParts), 0), 0);
                    return totalPlanned > 0 ? `${((totalScanned / totalPlanned) * 100).toFixed(1)}%` : '0%';
                  })()}
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
                    <TableHead className="font-semibold">Process Stage</TableHead>
                    <TableHead className="font-semibold">No. of Tests</TableHead>
                    <TableHead className="font-semibold">Planned Parts</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedAllocations.length > 0 ? (
                    savedAllocations.map((allocation) => {
                      const totalPlanned = allocation.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0);
                      const totalRemaining = allocation.testAllocations.reduce((sum, test) => sum + test.currentAllocatedParts, 0);
                      const totalScanned = totalPlanned - totalRemaining;
                      const progressPercentage = totalPlanned > 0 ? ((totalScanned / totalPlanned) * 100).toFixed(1) : 0;

                      return (
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
                            <div className="text-sm max-w-xs truncate" title={allocation.processStage}>
                              {allocation.processStage}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50">
                              {allocation.testAllocations.length} tests
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="font-medium text-blue-700">
                                {totalPlanned}
                              </div>
                              <div className="text-xs text-gray-500">
                                planned
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">{totalScanned}/{totalPlanned}</span>
                                <span className="text-xs font-medium text-green-600">{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
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
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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
                {getFilteredAvailableTests().length} available tests for process stage: {allocationData?.processStage}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requiredQty">Machine Build</Label>
                <Input
                  id="requiredQty"
                  type="number"
                  value={newTestData.requiredQty}
                  onChange={(e) => setNewTestData({ ...newTestData, requiredQty: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newTestData.time}
                  onChange={(e) => setNewTestData({ ...newTestData, time: e.target.value })}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="testCondition">Test Condition</Label>
              <Input
                id="testCondition"
                value={newTestData.testCondition}
                onChange={(e) => setNewTestData({ ...newTestData, testCondition: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specification">Specification</Label>
              <Input
                id="specification"
                value={newTestData.specification}
                onChange={(e) => setNewTestData({ ...newTestData, specification: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machineEquipment">Equipment 1</Label>
              <Input
                id="machineEquipment"
                value={newTestData.machineEquipment}
                onChange={(e) => setNewTestData({ ...newTestData, machineEquipment: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machineEquipment2">Equipment 2 (Optional)</Label>
              <Input
                id="machineEquipment2"
                value={newTestData.machineEquipment2}
                onChange={(e) => setNewTestData({ ...newTestData, machineEquipment2: e.target.value })}
                placeholder="e.g., Heat Soak, Instron"
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
                machineEquipment2: '',
                time: '',
                allocatedParts: ''
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
                  onChange={(e) => setEditingTest({ ...editingTest, testName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRequiredQty">Machine Build</Label>
                  <Input
                    id="editRequiredQty"
                    type="number"
                    value={editingTest.requiredQty}
                    onChange={(e) => setEditingTest({ ...editingTest, requiredQty: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTime">Time</Label>
                  <Input
                    id="editTime"
                    value={editingTest.time}
                    onChange={(e) => setEditingTest({ ...editingTest, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTestCondition">Test Condition</Label>
                <Input
                  id="editTestCondition"
                  value={editingTest.testCondition}
                  onChange={(e) => setEditingTest({ ...editingTest, testCondition: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecification">Specification</Label>
                <Input
                  id="editSpecification"
                  value={editingTest.specification}
                  onChange={(e) => setEditingTest({ ...editingTest, specification: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEquipment">Equipment 1</Label>
                <Input
                  id="editEquipment"
                  value={editingTest.machineEquipment}
                  onChange={(e) => setEditingTest({ ...editingTest, machineEquipment: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEquipment2">Equipment 2</Label>
                <Input
                  id="editEquipment2"
                  value={editingTest.machineEquipment2 || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, machineEquipment2: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editingTest.status.toString()}
                  onValueChange={(value) =>
                    setEditingTest({ ...editingTest, status: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pending</SelectItem>
                    <SelectItem value="2">In Progress</SelectItem>
                    <SelectItem value="3">Completed</SelectItem>
                    <SelectItem value="4">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes (Optional)</Label>
                <Input
                  id="editNotes"
                  value={editingTest.notes || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, notes: e.target.value })}
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