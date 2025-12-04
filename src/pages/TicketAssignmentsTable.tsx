import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw, Ticket, Calendar, Clock, Scan, Eye, CheckCircle } from "lucide-react";
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
  submitted?: boolean; // Track submission status
}
 
interface TicketSummary {
  ticketCode: string;
  totalQuantity: number;
  assignedParts: number;
  remainingParts: number;
  assignments: StoredBarcodeData[];
}
 
const TicketAssignmentsTable: React.FC = () => {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState<StoredBarcodeData[]>([]);
  const [ticketSummaries, setTicketSummaries] = useState<TicketSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [storageKey] = useState("ticketBarcodeAssignments");
 
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
 
    // Load OQC data to get total quantities
    const oqcData = localStorage.getItem("Oqcformdata");
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
        assignments: assignments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      };
    });
 
    // Sort by ticket code
    setTicketSummaries(summaries.sort((a, b) => a.ticketCode.localeCompare(b.ticketCode)));
  };
 
  const filteredSummaries = ticketSummaries.filter(summary => {
    const matchesSearch = summary.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.assignments.some(assignment =>
        assignment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
   
    const matchesDate = !dateFilter ||
      summary.assignments.some(assignment =>
        assignment.timestamp.split('T')[0] === dateFilter
      );
   
    return matchesSearch && matchesDate;
  });
 
  const handleScanClick = (ticketCode: string) => {
    const oqcData = localStorage.getItem("Oqcformdata");
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
    const oqcData = localStorage.getItem("Oqcformdata");
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
      // Get current assignments from localStorage
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
     
      const assignments: StoredBarcodeData[] = JSON.parse(stored);
     
      // Find and update the specific assignment
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
     
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedAssignments));
     
      // Update state
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
    // Each assignment gets one row, plus one row for scanning if needed
    return ticket.assignments.length + (ticket.remainingParts > 0 ? 1 : 0);
  };
 
  const getRemainingAfterAssignment = (ticket: TicketSummary, assignmentIndex: number) => {
    let cumulativeAssigned = 0;
   
    // Calculate cumulative assigned parts up to this assignment
    for (let i = 0; i <= assignmentIndex; i++) {
      cumulativeAssigned += ticket.assignments[i].totalParts;
    }
   
    const remainingAfter = Math.max(0, ticket.totalQuantity - cumulativeAssigned);
    return remainingAfter;
  };
 
  const isTicketCompleted = (ticket: TicketSummary) => {
    return ticket.remainingParts === 0;
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
      {/* <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Search Tickets
              </Label>
              <Input
                id="search"
                placeholder="Search by ticket code or serial number..."
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
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
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
      </Card> */}
 
      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ticket Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Ticket Code</TableHead>
                  <TableHead className="w-24">Total Quantity</TableHead>
                  <TableHead className="w-24">Parts Scanned</TableHead>
                  <TableHead className="w-24">Remaining</TableHead>
                  <TableHead className="w-40">Date & Time</TableHead>
                  <TableHead className="w-48">Status & Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No ticket assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSummaries.flatMap((ticket) => {
                    const rows = [];
                   
                    // Add rows for each assignment (scan session)
                    ticket.assignments.forEach((assignment, index) => {
                      const isFirstAssignment = index === 0;
                      const remainingAfter = getRemainingAfterAssignment(ticket, index);
                      const isLastAssignment = index === ticket.assignments.length - 1;
                     
                      rows.push(
                        <TableRow
                          key={assignment.id}
                          className={assignment.submitted ? 'bg-green-50' : 'bg-blue-50'}
                        >
                          {isFirstAssignment ? (
                            <>
                              <TableCell
                                rowSpan={getTotalRowsForTicket(ticket)}
                                className="font-bold align-top"
                              >
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4 text-blue-600" />
                                  {ticket.ticketCode}
                                </div>
                              </TableCell>
                              <TableCell
                                rowSpan={getTotalRowsForTicket(ticket)}
                                className="align-top"
                              >
                                <div className="font-bold text-lg">
                                  {isTicketCompleted(ticket) ? ticket.totalQuantity: ticket.totalQuantity}
                                </div>
                              </TableCell>
                            </>
                          ) : null}
                         
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                assignment.submitted
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                              }>
                                {assignment.totalParts} parts
                              </Badge>
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className={`font-semibold ${
                              remainingAfter === 0 ? 'text-green-600' :
                              remainingAfter > 0 ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {remainingAfter > 0 ? remainingAfter : (remainingAfter === 0 ? "Complete" : "-")}
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(assignment.timestamp).toLocaleDateString()}
                              <Clock className="h-3 w-3 ml-2" />
                              {new Date(assignment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToScanner(ticket.ticketCode, assignment.id)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              {!assignment.submitted && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSubmitSession(assignment.id, ticket.ticketCode)}
                                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Submit
                                </Button>
                              )}
                              {assignment.submitted && (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                  Submitted
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    });
                   
                    // Add scan row if there are remaining parts
                    if (ticket.remainingParts > 0) {
                      const hasAssignments = ticket.assignments.length > 0;
                     
                      rows.push(
                        <TableRow key={`scan-${ticket.ticketCode}`} className="bg-orange-50">
                          {!hasAssignments ? (
                            <>
                              <TableCell className="font-bold">
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4 text-blue-600" />
                                  {ticket.ticketCode}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-lg">{ticket.totalQuantity}</div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              {/* Empty cells for rowspan alignment */}
                              <TableCell className="hidden"></TableCell>
                              <TableCell className="hidden"></TableCell>
                            </>
                          )}
                         
                          <TableCell>
                            <div className="text-orange-600 font-medium">
                              {ticket.remainingParts} to scan
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className={`font-semibold text-orange-600`}>
                              {ticket.remainingParts}
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              Ready for scanning
                            </div>
                          </TableCell>
                         
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleScanClick(ticket.ticketCode)}
                                className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                              >
                                <Scan className="h-3 w-3" />
                                Scan Next Batch
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
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
 