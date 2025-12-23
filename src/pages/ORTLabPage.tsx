import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Save, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface NoReasonModal {
  isOpen: boolean;
  rowId: number | null;
  reason: string;
}

interface ORTSubmissionData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  sessionNumber: number;
  parts: Array<{
    id: string;
    partNumber: string;
    serialNumber: string;
    scanStatus: 'OK' | 'Cosmetic' | 'Not OK';
    scannedAt: string;
    location: string;
  }>;
  project: string;
  build: string;
  colour: string;
  anoType: string;
  source: string;
  reason: string;
  oqcApprovedBy?: string;
  oqcApprovedAt?: string;
  submittedAt?: string;
  totalParts: number;
  serialNumber: string;
  partNumbers: string[];
  rawBarcodeData?: string;
  submitted?: boolean;
  totalQuantity:number;
}

interface OqcRecord {
  id: number;
  ticketCode: string;
  totalQuantity: number;
  anoType: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  status: string;
  sessions: Array<any>;
  createdAt: string;
  oqcApproved: boolean;
  oqcApprovedBy?: string;
  oqcApprovedAt?: string;
}

interface TableRow {
  id: number;
  ticketCode: string;
  sessionId: string;
  sessionNumber: number;
  partsBeingSent: number;
  received: "Yes" | "No" | "";
  date?: string;
  shiftTime?: string;
  detailsBox: {
    totalQuantity: number;
    ticketCodeRaised: string;
    dateShiftTime: string;
    project: string;
    batch: string;
    color: string;
    assemblyOQCAno: string;
    reason: string;
    oqcApprovedBy?: string;
    oqcApprovedAt?: string;
  };
  inventoryRemarks: string;
  stage2Enabled: boolean;
  status: string;
  movedToStage2?: boolean;
  movedToStage2At?: string;
  partNumbers: string[];
  totalQuantity: number;
}

const ORTLabPage = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allStage1Data, setAllStage1Data] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [noReasonModal, setNoReasonModal] = useState<NoReasonModal>({
    isOpen: false,
    rowId: null,
    reason: ""
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      setLoading(true);
      
      // Load all existing Stage 1 data from localStorage
      const stage1DataStr = localStorage.getItem("stage1TableData");
      const existingStage1Data: TableRow[] = stage1DataStr ? JSON.parse(stage1DataStr) : [];
      setAllStage1Data(existingStage1Data);
      
      // Load new ORT submissions
      loadORTSubmissions(existingStage1Data);
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load data.",
        duration: 3000,
      });
      setTableData([]);
      setAllStage1Data([]);
      setLoading(false);
    }
  };

  const loadORTSubmissions = (existingStage1Data: TableRow[]) => {
    try {
      const ortSubmissionsStr = localStorage.getItem("ort_lab_submissions");
      let ortSubmissions: ORTSubmissionData[] = ortSubmissionsStr
        ? JSON.parse(ortSubmissionsStr)
        : [];

      if (ortSubmissions.length === 0) {
        const singleSubmissionStr = localStorage.getItem("ort_lab_submission");
        if (singleSubmissionStr) {
          ortSubmissions = [JSON.parse(singleSubmissionStr)];
        }
      }

      // Only get submissions that are submitted
      ortSubmissions = ortSubmissions.filter(item => item.submitted === true);

      if (ortSubmissions.length === 0) {
        setTableData([]);
        setLoading(false);
        return;
      }

      // Get OQC data for details
      const oqcDataStr = localStorage.getItem("testRecords");
      const oqcRecords: OqcRecord[] = oqcDataStr ? JSON.parse(oqcDataStr) : [];
      const oqcMap = new Map<string, OqcRecord>();
      oqcRecords.forEach(record => {
        oqcMap.set(record.ticketCode, record);
      });

      // Get processed sessions
      const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
      const processedSessionIds = new Set<string>(
        processedSessionsStr ? JSON.parse(processedSessionsStr) : []
      );

      // Get sessions already in Stage 1 data
      const existingSessionIds = new Set<string>(
        existingStage1Data.map(row => row.sessionId)
      );

      // Filter to show only:
      // 1. New submissions not processed yet AND
      // 2. Not already in Stage 1 data (to avoid duplicates) AND
      // 3. Not moved to Stage 2
      const newSubmissions = ortSubmissions.filter(submission => 
        !processedSessionIds.has(submission.id) && 
        !existingSessionIds.has(submission.id)
      );

      if (newSubmissions.length === 0) {
        // Show existing Stage 1 data that hasn't been moved to Stage 2
        const pendingRows = existingStage1Data.filter(row => !row.movedToStage2);
        setTableData(pendingRows);
        setLoading(false);
        return;
      }

      // Create new rows for new submissions
      const newRows: TableRow[] = newSubmissions.map((submission, index) => {
        const oqcRecord = oqcMap.get(submission.ticketCode);
        
        const detailsBox = oqcRecord
          ? {
              totalQuantity: oqcRecord.totalQuantity || submission.totalParts,
              ticketCodeRaised: oqcRecord.ticketCode,
              dateShiftTime: oqcRecord.dateTime || new Date(submission.timestamp).toLocaleDateString(),
              project: oqcRecord.project || "N/A",
              batch: oqcRecord.build || "N/A",
              color: oqcRecord.colour || "N/A",
              assemblyOQCAno: oqcRecord.anoType || "N/A",
              reason: oqcRecord.reason || "N/A",
              oqcApprovedBy: oqcRecord.oqcApprovedBy,
              oqcApprovedAt: oqcRecord.oqcApprovedAt
            }
          : {
              totalQuantity: submission.totalParts,
              ticketCodeRaised: submission.ticketCode,
              dateShiftTime: new Date(submission.timestamp).toLocaleString(),
              project: submission.project || "N/A",
              batch: submission.build || "N/A",
              color: submission.colour || "N/A",
              assemblyOQCAno: submission.anoType || "N/A",
              reason: submission.reason || "N/A",
              oqcApprovedBy: submission.oqcApprovedBy,
              oqcApprovedAt: submission.oqcApprovedAt
            };

        return {
          id: existingStage1Data.length + index + 1,
          ticketCode: submission.ticketCode,
          sessionId: submission.id,
          sessionNumber: submission.sessionNumber,
          partsBeingSent: submission.totalParts,
          received: "",
          inventoryRemarks: "",
          stage2Enabled: false,
          status: "Pending",
          detailsBox,
          movedToStage2: false,
          partNumbers: submission.partNumbers || [],
          totalQuantity: submission.totalQuantity
        };
      });

      // Combine existing pending rows with new rows
      const pendingExistingRows = existingStage1Data.filter(row => !row.movedToStage2);
      const combinedRows = [...pendingExistingRows, ...newRows];
      
      setTableData(combinedRows);
      setLoading(false);

    } catch (error) {
      console.error("Error loading ORT submissions:", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load ORT Lab submissions.",
        duration: 3000,
      });
      setTableData([]);
      setLoading(false);
    }
  };

  const handleNoButtonClick = (id: number) => {
    setNoReasonModal({
      isOpen: true,
      rowId: id,
      reason: ""
    });
  };

  const handleNoReasonChange = (value: string) => {
    setNoReasonModal(prev => ({
      ...prev,
      reason: value
    }));
  };

  const handleSaveNoReason = () => {
    if (!noReasonModal.rowId || !noReasonModal.reason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reason",
        duration: 3000,
      });
      return;
    }

    setTableData((prevData) =>
      prevData.map((row) => {
        if (row.id === noReasonModal.rowId) {
          return {
            ...row,
            received: "No",
            status: "Not Received",
            date: undefined,
            shiftTime: undefined,
            stage2Enabled: false,
            inventoryRemarks: `Not Received - Reason: ${noReasonModal.reason}`
          };
        }
        return row;
      })
    );

    setNoReasonModal({
      isOpen: false,
      rowId: null,
      reason: ""
    });

    toast({
      title: "Marked as Not Received",
      description: "Reason has been saved",
      duration: 2000,
    });
  };

  const handleCancelNoReason = () => {
    setNoReasonModal({
      isOpen: false,
      rowId: null,
      reason: ""
    });
  };

  const handleReceivedChange = (id: number, value: "Yes" | "No" | "") => {
    if (value === "Yes") {
      setTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              received: value,
              status: "Received",
              date: getCurrentDate(),
              shiftTime: getCurrentShift(),
            };
          }
          return row;
        })
      );
    } else if (value === "No") {
      handleNoButtonClick(id);
    } else {
      setTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              received: "",
              status: "Pending",
              date: undefined,
              shiftTime: undefined,
              stage2Enabled: false,
            };
          }
          return row;
        })
      );
    }
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning Shift (6 AM - 2 PM)";
    if (hour >= 14 && hour < 22) return "Afternoon Shift (2 PM - 10 PM)";
    return "Night Shift (10 PM - 6 AM)";
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleInventoryRemarksChange = (id: number, value: string) => {
    setTableData((prevData) =>
      prevData.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            inventoryRemarks: value,
            stage2Enabled: false
            // stage2Enabled: row.received === "Yes" && value.trim() !== ""
          };
        }
        return row;
      })
    );
  };

  const handleSave = () => {
    // Validate only rows marked as "Yes" have remarks
    const invalidRows = tableData.filter(
      (row) => row.received === "Yes" && !row.inventoryRemarks.trim()
    );

    if (invalidRows.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in Inventory Remarks for all items marked as Received (Yes)",
        duration: 3000,
      });
      return;
    }

    // Update stage2Enabled based on received status and remarks
    const updatedData = tableData.map((row) => ({
      ...row,
      stage2Enabled: row.received === "Yes" && row.inventoryRemarks.trim() !== "" && !row.movedToStage2,
    }));

    // Save to localStorage
    saveToLocalStorage(updatedData);
    
    // Update OQC status
    updateOQCStatus(updatedData);
    
    // Mark processed sessions
    markSessionsAsProcessed(updatedData);
    
    setTableData(updatedData);

    toast({
      title: "Data Saved Successfully",
      description: `Saved ${updatedData.filter((r) => r.received === "Yes").length} received item(s)`,
      duration: 2000,
    });
  };

  const saveToLocalStorage = (updatedData: TableRow[]) => {
    try {
      // Get all existing data from localStorage
      const stage1DataStr = localStorage.getItem("stage1TableData");
      const allExistingData: TableRow[] = stage1DataStr ? JSON.parse(stage1DataStr) : [];
      
      // Create a map of existing data by sessionId
      const dataMap = new Map<string, TableRow>();
      allExistingData.forEach(row => {
        dataMap.set(row.sessionId, row);
      });
      
      // Update or add new records
      updatedData.forEach(row => {
        dataMap.set(row.sessionId, row);
      });
      
      // Convert back to array
      const mergedData = Array.from(dataMap.values());
      
      // Save to localStorage
      localStorage.setItem("stage1TableData", JSON.stringify(mergedData));
      
      // Also update allStage1Data state
      setAllStage1Data(mergedData);
      
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const updateOQCStatus = (updatedData: TableRow[]) => {
    try {
      const oqcDataStr = localStorage.getItem("testRecords");
      if (oqcDataStr) {
        let oqcRecords: OqcRecord[] = JSON.parse(oqcDataStr);

        const receivedTicketCodes = new Set(
          updatedData
            .filter(row => row.received === "Yes")
            .map(row => row.ticketCode)
        );

        oqcRecords = oqcRecords.map(record => {
          if (receivedTicketCodes.has(record.ticketCode)) {
            const updatedSessions = record.sessions.map(session => {
              const sessionRow = updatedData.find(row =>
                row.ticketCode === record.ticketCode &&
                row.sessionNumber === session.sessionNumber
              );
              if (sessionRow && sessionRow.received === "Yes") {
                return {
                  ...session,
                  sentToORT: true,
                  sentToORTAt: new Date().toISOString()
                };
              }
              return session;
            });

            return {
              ...record,
              status: "Received at ORT",
              sessions: updatedSessions
            };
          }
          return record;
        });

        localStorage.setItem("testRecords", JSON.stringify(oqcRecords));
      }
    } catch (error) {
      console.error("Error updating OQC status:", error);
    }
  };

  const markSessionsAsProcessed = (updatedData: TableRow[]) => {
    try {
      const processedSessionsStr = localStorage.getItem("processedORTSubmissions");
      const processedSessionIds: string[] = processedSessionsStr
        ? JSON.parse(processedSessionsStr)
        : [];

      const receivedSessions = updatedData
        .filter(row => row.received === "Yes")
        .map(row => row.sessionId);

      receivedSessions.forEach(sessionId => {
        if (!processedSessionIds.includes(sessionId)) {
          processedSessionIds.push(sessionId);
        }
      });

      localStorage.setItem("processedORTSubmissions", JSON.stringify(processedSessionIds));
    } catch (error) {
      console.error("Error marking sessions as processed:", error);
    }
  };

  const handleStage2Navigate = (row: TableRow) => {
    try {
      // Update the row to mark as moved to Stage 2
      const updatedRow = {
        ...row,
        movedToStage2: true,
        movedToStage2At: new Date().toISOString()
      };
      
      // Update in tableData (will remove from UI on next load)
      const updatedTableData = tableData.map(item => 
        item.id === row.id ? updatedRow : item
      );
      setTableData(updatedTableData);
      
      // Save updated data to localStorage
      saveToLocalStorage(updatedTableData);
      
      // Navigate to Stage 2
      navigate("/settings", {
        state: {
          record: row,
          fromStage1: true,
          partNumbers: row.partNumbers || []
        },
      });

      toast({
        title: "Moved to Stage 2",
        description: `Ticket ${row.ticketCode} has been moved to Stage 2 testing`,
        duration: 2000,
      });
      
    } catch (error) {
      console.error("Error navigating to Stage 2:", error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Failed to move to Stage 2",
        duration: 3000,
      });
    }
  };

  const refreshData = () => {
    loadAllData();
    toast({
      title: "Data Refreshed",
      description: "Loaded latest ORT submissions",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ORT Lab submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                ORT Received Ticket - Stage 1
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                ORT receives the ticket from OQC System. Mark items as received and add inventory remarks.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total records in system: {allStage1Data.length} | Showing pending: {tableData.length}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={tableData.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {tableData.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Pending ORT Submissions
              </h3>
              <p className="text-gray-500 mb-4">
                All ORT submissions have been processed or there are no new submissions.
              </p>
              <p className="text-sm text-gray-400">
                New submissions will appear here when sent from the OQC System.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-white">
                      {tableData.length} Pending Submissions
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Total in system: {allStage1Data.length}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Click "Save Data" after marking items as received
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-gray-700 border">#</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Ticket Code</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Session</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Parts Being Sent</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Received (Yes/No)</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Shift/Time</TableHead>
                      <TableHead className="font-bold text-gray-700 border min-w-[300px]">Details Box</TableHead>
                      <TableHead className="font-bold text-gray-700 border min-w-[200px]">Inventory Remarks</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 border">Stage 2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        <TableCell className="border font-medium">{row.id}</TableCell>
                        <TableCell className="border font-medium">
                          <div className="font-bold text-blue-700">{row.ticketCode}</div>
                          <div className="text-xs text-gray-500">Session {row.sessionNumber}</div>
                        </TableCell>
                        <TableCell className="border text-center">
                          <Badge variant="outline" className="bg-gray-100">
                            #{row.sessionNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className="border text-center font-semibold">{row.partsBeingSent}</TableCell>
                        <TableCell className="border">
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReceivedChange(row.id, "Yes")}
                                className={
                                  row.received === "Yes"
                                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                    : "hover:bg-green-50"
                                }
                              >
                                ✓ Yes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReceivedChange(row.id, "No")}
                                className={
                                  row.received === "No"
                                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                    : "hover:bg-red-50"
                                }
                              >
                                ✗ No
                              </Button>
                            </div>
                            {/* {row.received && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReceivedChange(row.id, "")}
                                className="text-xs h-6"
                              >
                                Clear
                              </Button>
                            )} */}
                          </div>
                        </TableCell>
                        <TableCell className="border">
                          {row.date ? (
                            <span className="font-medium text-blue-700">
                              {new Date(row.date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Auto fetch!</span>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          {row.shiftTime ? (
                            <span className="font-medium text-purple-700">{row.shiftTime}</span>
                          ) : (
                            <span className="text-gray-400 italic">Auto fetch!</span>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          <div className="space-y-1 text-xs bg-gray-50 p-3 rounded">
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Total Quantity:</span>
                              <span className="font-bold text-blue-700">{row.detailsBox.totalQuantity}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-red-600">• Ticket Code Raised:</span>
                              <span className="font-medium">{row.detailsBox.ticketCodeRaised}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-red-600">• Date, SHIFT/time:</span>
                              <span className="font-medium">{row.detailsBox.dateShiftTime}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Project/Batch/Color:</span>
                              <span className="font-medium">
                                {row.detailsBox.project} / {row.detailsBox.batch} / {row.detailsBox.color}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Assembly/OQC/Ano:</span>
                              <span className="font-medium">{row.detailsBox.assemblyOQCAno}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-semibold text-gray-600">• Reason:</span>
                              <span className="font-medium">{row.detailsBox.reason}</span>
                            </div>
                            {row.detailsBox.oqcApprovedBy && (
                              <div className="flex gap-2 mt-1 pt-1 border-t">
                                <span className="font-semibold text-green-600">• OQC Approved by:</span>
                                <span className="font-medium">{row.detailsBox.oqcApprovedBy}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="border">
                          <Input
                            value={row.inventoryRemarks}
                            onChange={(e) => handleInventoryRemarksChange(row.id, e.target.value)}
                            placeholder="Where they are placing..."
                            className="w-full"
                            disabled={row.received !== "Yes"}
                          />
                          {row.received === "Yes" && !row.inventoryRemarks.trim() && (
                            <p className="text-xs text-red-500 mt-1">Required for received items</p>
                          )}
                        </TableCell>
                        <TableCell className="border">
                          <Badge className={
                            row.status === "Received"
                              ? "bg-green-100 text-green-800"
                              : row.status === "Not Received"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="border text-center">
                          {row.stage2Enabled ? (
                            <Button
                              size="sm"
                              onClick={() => handleStage2Navigate(row)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Submit
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {row.received === "Yes" ? "Add remarks & save" : "Mark as received"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={noReasonModal.isOpen} onOpenChange={handleCancelNoReason}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Not Received</DialogTitle>
            <DialogDescription>
              Please provide a reason for marking this item as Not Received.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={noReasonModal.reason}
              onChange={(e) => handleNoReasonChange(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancelNoReason}>
              Cancel
            </Button>
            <Button onClick={handleSaveNoReason}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variants = {
    default: "bg-blue-100 text-blue-800",
    outline: "border border-gray-300 bg-white text-gray-700",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default ORTLabPage;

