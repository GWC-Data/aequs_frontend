import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Ticket, 
  Calendar, 
  Clock, 
  Scan, 
  Eye, 
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  ListTree
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoredBarcodeData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  serialNumber: string;
  partNumbers: string[];
  totalParts: number;
  rawBarcodeData?: string;
  submitted?: boolean;
  submittedAt?: string;
}

interface TicketSummary {
  ticketCode: string;
  totalQuantity: number;
  assignedParts: number;
  remainingParts: number;
  assignments: StoredBarcodeData[];
  // New fields from header data
  assemblyAno?: string;
  source?: string;
  reason?: string;
  project?: string;
  build?: string;
  colour?: string;
  dateTime?: string;
}

interface ExpandedRows {
  [ticketCode: string]: boolean; // Ticket expand state
  [assignmentId: string]: boolean; // Assignment expand state
}

const TicketAssignmentsTable: React.FC = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState<StoredBarcodeData[]>([]);
  const [ticketSummaries, setTicketSummaries] = useState<TicketSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [storageKey] = useState("ticketBarcodeAssignments");
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
  const [newPartNumber, setNewPartNumber] = useState("");
  const [addingToAssignment, setAddingToAssignment] = useState<string | null>(null);

  useEffect(() => {
    loadAllAssignments();
  }, []);

  const loadAllAssignments = () => {
    try {
      setIsLoading(true);
      const stored = localStorage.getItem(storageKey);
      const assignments: StoredBarcodeData[] = stored ? JSON.parse(stored) : [];
      setAllAssignments(assignments);
      processTicketSummaries(assignments);
     
      toast({
        title: "Data Loaded",
        description: `Loaded ${assignments.length} assignment(s)`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error loading assignments:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: "Failed to load assignment data",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processTicketSummaries = (assignments: StoredBarcodeData[]) => {
    // Group assignments by ticket
    const ticketMap = new Map<string, StoredBarcodeData[]>();
   
    assignments.forEach(assignment => {
      const ticketKey = assignment.ticketCode;
      if (!ticketMap.has(ticketKey)) {
        ticketMap.set(ticketKey, []);
      }
      ticketMap.get(ticketKey)?.push(assignment);
    });

    // Load OQC data to get total quantities and header info
    const oqcData = localStorage.getItem("testRecords");
    const oqcRecords = oqcData ? JSON.parse(oqcData) : [];
   
    const summaries: TicketSummary[] = Array.from(ticketMap.entries()).map(([ticketCode, assignments]) => {
      const oqcRecord = oqcRecords.find((record: any) => record.ticketCode === ticketCode);
      const totalQuantity = oqcRecord?.totalQuantity || 0;
      const assignedParts = assignments.reduce((sum, assignment) => sum + assignment.totalParts, 0);
      const remainingParts = Math.max(0, totalQuantity - assignedParts);
     
      return {
        ticketCode,
        totalQuantity,
        assignedParts,
        remainingParts,
        assemblyAno: oqcRecord?.assemblyAno,
        source: oqcRecord?.source,
        reason: oqcRecord?.reason,
        project: oqcRecord?.project,
        build: oqcRecord?.build,
        colour: oqcRecord?.colour,
        dateTime: oqcRecord?.dateTime,
        assignments: assignments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      };
    });

    // Sort by ticket code
    setTicketSummaries(summaries.sort((a, b) => a.ticketCode.localeCompare(b.ticketCode)));
  };

  const toggleTicketExpand = (ticketCode: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [ticketCode]: !prev[ticketCode]
    }));
  };

  const toggleAssignmentExpand = (assignmentId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleAddPart = (assignmentId: string) => {
    if (!newPartNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a part number",
        duration: 3000,
      });
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
     
      const assignments: StoredBarcodeData[] = JSON.parse(stored);
     
      // Find and update the specific assignment
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.id === assignmentId) {
          const updatedPartNumbers = [...assignment.partNumbers, newPartNumber.trim()];
          const updatedRawData = assignment.rawBarcodeData 
            ? `${assignment.rawBarcodeData},${newPartNumber.trim()}`
            : newPartNumber.trim();
           
          return {
            ...assignment,
            partNumbers: updatedPartNumbers,
            totalParts: updatedPartNumbers.length,
            rawBarcodeData: updatedRawData,
            submitted: false, // Reset submitted status when adding parts
            submittedAt: undefined
          };
        }
        return assignment;
      });
     
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedAssignments));
     
      // Update state
      setAllAssignments(updatedAssignments);
      processTicketSummaries(updatedAssignments);
      setNewPartNumber("");
      setAddingToAssignment(null);
     
      toast({
        title: "Part Added",
        description: `Added part ${newPartNumber.trim()} to assignment`,
        duration: 3000,
      });
     
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add part",
        duration: 3000,
      });
    }
  };

  const filteredSummaries = ticketSummaries.filter(summary => {
    const matchesSearch = summary.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.assignments.some(assignment =>
        assignment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.partNumbers.some(part => part.toLowerCase().includes(searchTerm.toLowerCase()))
      );
   
    const matchesDate = !dateFilter ||
      summary.assignments.some(assignment =>
        assignment.timestamp.split('T')[0] === dateFilter
      ) ||
      summary.dateTime === dateFilter;
   
    return matchesSearch && matchesDate;
  });

  const handleScanClick = (ticketCode: string) => {
    const oqcData = localStorage.getItem("testRecords");
    if (oqcData) {
      const records = JSON.parse(oqcData);
      const ticketRecord = records.find((record: any) => record.ticketCode === ticketCode);
      if (ticketRecord) {
        navigate("/barcode-scanner", {
          state: {
            record: ticketRecord,
            fromTable: true
          }
        });
      }
    }
  };

  const goToScanner = (ticketCode: string, assignmentId?: string) => {
    const oqcData = localStorage.getItem("testRecords");
    if (oqcData) {
      const records = JSON.parse(oqcData);
      const ticketRecord = records.find((record: any) => record.ticketCode === ticketCode);
      if (ticketRecord) {
        navigate("/barcode-scanner", {
          state: {
            record: ticketRecord,
            assignmentId: assignmentId,
            fromTable: true
          }
        });
      }
    }
  };

  const handleSubmitSession = (assignmentId: string, ticketCode: string) => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
     
      const assignments: StoredBarcodeData[] = JSON.parse(stored);
     
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            submitted: true,
            submittedAt: new Date().toISOString()
          };
        }
        return assignment;
      });
     
      localStorage.setItem(storageKey, JSON.stringify(updatedAssignments));
     
      setAllAssignments(updatedAssignments);
      processTicketSummaries(updatedAssignments);
     
      toast({
        title: "Session Submitted",
        description: `Scanning session for ${ticketCode} has been submitted successfully`,
        duration: 3000,
      });
     
    } catch (error) {
      console.error("Error submitting session:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Failed to submit scanning session",
        duration: 3000,
      });
    }
  };

  const getTotalRowsForTicket = (ticket: TicketSummary) => {
    let totalRows = 1; // Header row
    
    // Add rows for each assignment
    ticket.assignments.forEach(assignment => {
      totalRows += 1; // Assignment row
      if (expandedRows[assignment.id]) {
        totalRows += assignment.partNumbers.length; // Part rows
      }
    });
    
    // Add scan row if needed
    if (ticket.remainingParts > 0) {
      totalRows += 1;
    }
    
    return totalRows;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Search Tickets
              </Label>
              <Input
                id="search"
                placeholder="Search by ticket code, serial, or part number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Filter by Date
              </Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setExpandedRows({});
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              <Button
                variant="outline"
                onClick={loadAllAssignments}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListTree className="h-5 w-5" />
              Ticket Assignments
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {filteredSummaries.length} tickets • {allAssignments.length} sessions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-32">Ticket Code</TableHead>
                  <TableHead className="w-24">Project</TableHead>
                  <TableHead className="w-24">Build</TableHead>
                  <TableHead className="w-24">Total Qty</TableHead>
                  <TableHead className="w-24">Scanned</TableHead>
                  <TableHead className="w-24">Remaining</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="w-48">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No ticket assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSummaries.flatMap((ticket) => {
                    const rows = [];
                    
                    // Ticket Header Row
                    rows.push(
                      <TableRow key={`ticket-${ticket.ticketCode}`} className="bg-gray-50 hover:bg-gray-100">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTicketExpand(ticket.ticketCode)}
                            className="h-6 w-6 p-0"
                          >
                            {expandedRows[ticket.ticketCode] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-blue-600" />
                            {ticket.ticketCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {ticket.project || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50">
                            {ticket.build || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg">{ticket.totalQuantity}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            ticket.assignedParts === ticket.totalQuantity
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }>
                            {ticket.assignedParts}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${
                            ticket.remainingParts === 0
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}>
                            {ticket.remainingParts > 0 ? ticket.remainingParts : "Complete"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              ticket.remainingParts === 0
                                ? 'bg-green-500'
                                : ticket.assignedParts > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-300'
                            }`} />
                            <span className="text-sm">
                              {ticket.remainingParts === 0
                                ? "Completed"
                                : ticket.assignedParts > 0
                                ? "In Progress"
                                : "Not Started"
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleTicketExpand(ticket.ticketCode)}
                              className="flex items-center gap-1"
                            >
                              {expandedRows[ticket.ticketCode] ? "Collapse" : "Expand"}
                            </Button>
                            {ticket.remainingParts > 0 && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleScanClick(ticket.ticketCode)}
                                className="flex items-center gap-1"
                              >
                                <Scan className="h-3 w-3" />
                                Scan
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );

                    // Expanded Content - Assignment Rows
                    if (expandedRows[ticket.ticketCode]) {
                      ticket.assignments.forEach((assignment, assignmentIndex) => {
                        // Assignment Row
                        rows.push(
                          <TableRow
                            key={assignment.id}
                            className={`${assignment.submitted ? 'bg-green-50' : 'bg-blue-50'} hover:${assignment.submitted ? 'bg-green-100' : 'bg-blue-100'}`}
                          >
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAssignmentExpand(assignment.id)}
                                  className="h-5 w-5 p-0"
                                >
                                  {expandedRows[assignment.id] ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                                <span className="text-sm font-medium">Session {assignmentIndex + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell colSpan={2}>
                              <div className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {new Date(assignment.timestamp).toLocaleDateString()}
                                  <span className="text-gray-400">•</span>
                                  {new Date(assignment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{assignment.totalParts} parts</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">SN: {assignment.serialNumber}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {assignment.submittedAt
                                  ? `Submitted: ${new Date(assignment.submittedAt).toLocaleDateString()}`
                                  : "Pending"
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                assignment.submitted
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                              }>
                                {assignment.submitted ? "Submitted" : "Scanning"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => goToScanner(ticket.ticketCode, assignment.id)}
                                  className="flex items-center gap-1 h-7"
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </Button>
                                {!assignment.submitted && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSubmitSession(assignment.id, ticket.ticketCode)}
                                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1 h-7"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Submit
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );

                        // Expanded Parts List
                        if (expandedRows[assignment.id]) {
                          assignment.partNumbers.forEach((partNumber, partIndex) => {
                            rows.push(
                              <TableRow key={`${assignment.id}-part-${partIndex}`} className="hover:bg-gray-50">
                                <TableCell></TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 ml-12">
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                    <span className="text-sm text-gray-600">{partNumber}</span>
                                  </div>
                                </TableCell>
                                <TableCell colSpan={7}>
                                  <div className="text-sm text-gray-500">Part {partIndex + 1} of {assignment.totalParts}</div>
                                </TableCell>
                              </TableRow>
                            );
                          });

                          // Add Part Input Row
                          rows.push(
                            <TableRow key={`${assignment.id}-add-part`} className="bg-gray-50">
                              <TableCell></TableCell>
                              <TableCell colSpan={8}>
                                <div className="flex items-center gap-2 ml-12">
                                  {addingToAssignment === assignment.id ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <Input
                                        placeholder="Enter part number..."
                                        value={newPartNumber}
                                        onChange={(e) => setNewPartNumber(e.target.value)}
                                        className="w-64 h-8 text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddPart(assignment.id)}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddPart(assignment.id)}
                                        className="h-8 bg-green-600 hover:bg-green-700"
                                      >
                                        Add
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setAddingToAssignment(null);
                                          setNewPartNumber("");
                                        }}
                                        className="h-8"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setAddingToAssignment(assignment.id)}
                                      className="h-7 text-sm"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add More Parts
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      });

                      // Add New Scan Row if remaining parts
                      // if (ticket.remainingParts > 0) {
                      //   rows.push(
                      //     <TableRow key={`new-scan-${ticket.ticketCode}`} className="bg-orange-50 hover:bg-orange-100">
                      //       <TableCell></TableCell>
                      //       <TableCell colSpan={8}>
                      //         <div className="flex items-center justify-between">
                      //           <div className="flex items-center gap-2">
                      //             <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      //             <span className="font-medium text-orange-700">
                      //               {ticket.remainingParts} parts remaining to scan
                      //             </span>
                      //           </div>
                      //           <Button
                      //             variant="default"
                      //             size="sm"
                      //             onClick={() => handleScanClick(ticket.ticketCode)}
                      //             className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
                      //           >
                      //             <Scan className="h-3 w-3" />
                      //             Start New Scan Session
                      //           </Button>
                      //         </div>
                      //       </TableCell>
                      //     </TableRow>
                      //   );
                      // }
                    }
                    
                    return rows;
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketAssignmentsTable;