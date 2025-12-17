import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Search, Filter, Eye } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ortTestReport } from '@/data/OrtTestReport';

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
  testName: string;
  allocatedParts: number;
  requiredQty: number;
  testCondition: string;
  specification: string;
  machineEquipment: string;
  time: string;
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
}

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

const TicketViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Stage1Record[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Stage1Record[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Stage1Record | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationData, setAllocationData] = useState<TicketAllocationData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnoType, setFilterAnoType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterAnoType, filterProject, tickets]);

  const loadTickets = () => {
    try {
      const ticketsData = localStorage.getItem("stage1TableData");
      if (ticketsData) {
        const parsedTickets: Stage1Record[] = JSON.parse(ticketsData);
        setTickets(parsedTickets);
        setFilteredTickets(parsedTickets);
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

  const calculateTestAllocations = (ticket: Stage1Record) => {
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
    const selectedTests = allTestNames; // Select all available tests

    // Calculate total required quantity
    const selectedConfigs = stageConfigs.filter(config =>
      selectedTests.includes(config.testName)
    );

    const totalRequiredQty = selectedConfigs.reduce((sum, config) => {
      return sum + extractNumericQty(config.qty);
    }, 0);

    // Calculate allocations for each test
    const allocations: TestAllocation[] = [];

    selectedConfigs.forEach(config => {
      const numericQty = extractNumericQty(config.qty);
      const proportion = totalRequiredQty > 0 ? numericQty / totalRequiredQty : 0;
      const allocatedPartsRaw = proportion * totalAvailableParts;
      let allocatedParts = Math.round(allocatedPartsRaw);

      allocations.push({
        testName: config.testName,
        allocatedParts: allocatedParts,
        requiredQty: numericQty,
        testCondition: config.testCondition,
        specification: config.specification,
        machineEquipment: config.machineEquipment,
        time: config.time
      });
    });

    // Adjust rounding differences
    let totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    let difference = totalAvailableParts - totalAllocated;

    if (difference !== 0) {
      // Sort by largest rounding error first
      const sortedAllocations = [...allocations].sort((a, b) => {
        const errorA = Math.abs((a.requiredQty / totalRequiredQty) * totalAvailableParts - a.allocatedParts);
        const errorB = Math.abs((b.requiredQty / totalRequiredQty) * totalAvailableParts - b.allocatedParts);
        return errorB - errorA;
      });

      if (difference > 0) {
        // Add extra parts
        let index = 0;
        while (difference > 0) {
          sortedAllocations[index].allocatedParts += 1;
          difference -= 1;
          index = (index + 1) % sortedAllocations.length;
        }
      } else {
        // Remove extra parts
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

    // Ensure no test gets 0 allocation when we have parts
    const totalAfterAdjustment = allocations.reduce((sum, alloc) => sum + alloc.allocatedParts, 0);
    if (totalAfterAdjustment === 0 && totalAvailableParts > 0 && allocations.length > 0) {
      // Give 1 part to the test with highest required quantity
      const highestRequiredTest = allocations.sort((a, b) => b.requiredQty - a.requiredQty)[0];
      if (highestRequiredTest) {
        highestRequiredTest.allocatedParts = 1;
      }
    }

    return {
      ticketCode: ticket.ticketCode,
      totalQuantity: totalAvailableParts,
      location: "In-house", // Default location
      project: ticket.detailsBox.project,
      anoType: ticket.detailsBox.assemblyOQCAno,
      build: ticket.detailsBox.batch,
      colour: ticket.detailsBox.color,
      testAllocations: allocations,
      processStage: selectedProcessStage
    };
  };

  const handleViewAllocation = (ticket: Stage1Record) => {
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Received':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>;
      case 'In-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

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
              <Label className="text-sm font-medium">ANO Type</Label>
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

            <div className="space-y-2 flex items-end">
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
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
                  <TableHead className="font-semibold">ANO Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Received Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {ticket.ticketCode}
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
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ticket.date}</div>
                        <div className="text-xs text-gray-500">{ticket.shiftTime}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleViewAllocation(ticket)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Allocation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No tickets found. {searchTerm && 'Try changing your search criteria.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </CardContent>
      </Card>

      {/* Allocation Modal */}
      <Dialog open={showAllocationModal} onOpenChange={setShowAllocationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Test Allocation Details</DialogTitle>
            <DialogDescription>
              Automatic allocation based on test requirements and available parts
            </DialogDescription>
          </DialogHeader>

          {allocationData && (
            <div className="space-y-6">
              {/* Ticket Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-blue-50">
                <div>
                  <Label className="text-xs text-gray-600">Ticket Code</Label>
                  <p className="font-bold text-lg">{allocationData.ticketCode}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Total Quantity</Label>
                  <p className="font-bold text-lg">{allocationData.totalQuantity} parts</p>
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
                  <Label className="text-xs text-gray-600">ANO Type</Label>
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
              </div>

              {/* Allocation Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-green-50">
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Total Tests</Label>
                  <p className="text-2xl font-bold text-blue-700">
                    {allocationData.testAllocations.length}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Parts Allocated</Label>
                  <p className="text-2xl font-bold text-green-700">
                    {allocationData.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-gray-600">Remaining Parts</Label>
                  <p className="text-2xl font-bold text-orange-700">
                    {Math.max(0, allocationData.totalQuantity - 
                      allocationData.testAllocations.reduce((sum, test) => sum + test.allocatedParts, 0))}
                  </p>
                </div>
              </div>

              {/* Test Allocation Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-semibold">Test Name</TableHead>
                      <TableHead className="font-semibold">Required Qty</TableHead>
                      <TableHead className="font-semibold">Allocated Parts</TableHead>
                      <TableHead className="font-semibold">Test Condition</TableHead>
                      <TableHead className="font-semibold">Specification</TableHead>
                      <TableHead className="font-semibold">Equipment</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationData.testAllocations.map((test, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {test.testName}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{test.requiredQty} pcs</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-lg text-green-700">
                              {test.allocatedParts}
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
                        <TableCell className="text-sm max-w-xs truncate">
                          {test.specification}
                        </TableCell>
                        <TableCell className="text-sm">
                          {test.machineEquipment}
                        </TableCell>
                        <TableCell className="text-sm">
                          {test.time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Calculation Notes */}
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-medium text-yellow-800 mb-2">Allocation Calculation Method</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Parts are allocated proportionally based on each test's required quantity</li>
                  <li>• Rounding adjustments ensure all available parts are utilized optimally</li>
                  <li>• Tests with higher requirements get priority in allocation</li>
                  <li>• Unallocated parts (if any) are shown in the summary</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowAllocationModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Navigate to Stage 2 form with this ticket
                    if (selectedTicket) {
                      navigate(`/stage2-form?ticket=${selectedTicket.ticketCode}`);
                    }
                  }}
                  className="bg-[#e0413a] text-white hover:bg-[#c53730]"
                >
                  Proceed to Stage 2
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketViewPage;