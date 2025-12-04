 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@//components/ui/button";
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
import { Save, ArrowRight } from "lucide-react";
 
// Keep your existing TableRow interface
interface TableRow {
  id: number;
  ticketCode: string;
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
  };
  inventoryRemarks: string;
  stage2Enabled: boolean;
}
 
// Define the incoming assignment format
interface StoredBarcodeData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  serialNumber: string;
  partNumbers: string[];
  totalParts: number;
  rawBarcodeData?: string;
  // Optional: isSubmitted, submittedAt — we ignore these for Stage 1
}
 
// Define OQC record structure (from "Oqcformdata")
interface OqcRecord {
  ticketCode: string;
  totalQuantity: string; // note: it's string in your data
  assemblyAno: string;
  source: string;
  reason: string;
  project: string;
  build: string;      // this is your "batch" equivalent
  colour: string;     // UK spelling — from your data
  dateTime: string;   // e.g., "2025-12-03"
  id: number;
  createdAt: string;
  barcodeAssignments?: any[];
  assignedParts?: number;
  lastUpdated?: string;
}
 
const ORTLabPage = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableRow[]>([]);
 
  // Load data from localStorage on mount
  useEffect(() => {
    loadTableDataFromStorage();
  }, []);
 
  const loadTableDataFromStorage = () => {
    try {
      // Load barcode assignments
      const barcodeAssignmentsStr = localStorage.getItem("ticketBarcodeAssignments");
      const barcodeAssignments: StoredBarcodeData[] = barcodeAssignmentsStr
        ? JSON.parse(barcodeAssignmentsStr)
        : [];
 
      if (barcodeAssignments.length === 0) {
        setTableData([]);
        return;
      }
 
      // Load OQC data for detailsBox
      const oqcDataStr = localStorage.getItem("Oqcformdata");
      const oqcRecords: OqcRecord[] = oqcDataStr ? JSON.parse(oqcDataStr) : [];
 
      // Build a map for fast lookup by ticketCode
      const oqcMap = new Map<string, OqcRecord>();
      oqcRecords.forEach(record => {
        oqcMap.set(record.ticketCode, record);
      });
 
      // Generate table rows
      const rows: TableRow[] = barcodeAssignments.map((assignment, index) => {
        const oqcRecord = oqcMap.get(assignment.ticketCode);
 
        // Map OQC fields to detailsBox using your actual schema
        const fallbackDetails = {
          totalQuantity: assignment.totalParts,
          ticketCodeRaised: assignment.ticketCode,
          dateShiftTime: "N/A",
          project: "N/A",
          batch: "N/A",
          color: "N/A",
          assemblyOQCAno: "N/A",
          reason: "N/A",
        };
 
        const detailsBox = oqcRecord
          ? {
            totalQuantity: Number(oqcRecord.totalQuantity) || assignment.totalParts,
            ticketCodeRaised: oqcRecord.ticketCode,
            // Combine date and (assumed) shift — you don't have shift, so just date
            dateShiftTime: oqcRecord.dateTime || "N/A",
            project: oqcRecord.project || "N/A",
            // Use 'build' as 'batch' (since you don't have batch field)
            batch: oqcRecord.build || "N/A",
            // Use 'colour' (UK spelling in your data)
            color: oqcRecord.colour || "N/A",
            // Combine assemblyAno (you don't have OQC/Ano separate)
            assemblyOQCAno: oqcRecord.assemblyAno || "N/A",
            reason: oqcRecord.reason || "N/A",
          }
          : fallbackDetails;
 
        return {
          id: index + 1,
          ticketCode: assignment.ticketCode,
          partsBeingSent: assignment.totalParts,
          received: "",
          inventoryRemarks: "",
          stage2Enabled: false,
          detailsBox,
        };
      });
 
      setTableData(rows);
    } catch (error) {
      console.error("Error loading data for ORT Lab:", error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load barcode assignment data.",
        duration: 3000,
      });
      setTableData([]);
    }
  };
 
  // Get current shift time
  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning Shift (6 AM - 2 PM)";
    if (hour >= 14 && hour < 22) return "Afternoon Shift (2 PM - 10 PM)";
    return "Night Shift (10 PM - 6 AM)";
  };
 
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };
 
  const handleReceivedChange = (id: number, value: "Yes" | "No") => {
    setTableData((prevData) =>
      prevData.map((row) => {
        if (row.id === id) {
          if (value === "Yes") {
            return {
              ...row,
              received: value,
              date: getCurrentDate(),
              shiftTime: getCurrentShift(),
            };
          } else {
            return {
              ...row,
              received: value,
              date: undefined,
              shiftTime: undefined,
              stage2Enabled: false,
            };
          }
        }
        return row;
      })
    );
  };
 
  const handleInventoryRemarksChange = (id: number, value: string) => {
    setTableData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, inventoryRemarks: value } : row))
    );
  };
 
  const handleSave = () => {
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
 
    const updatedData = tableData.map((row) => ({
      ...row,
      stage2Enabled: row.received === "Yes" && row.inventoryRemarks.trim() !== "",
    }));
 
    setTableData(updatedData);
    localStorage.setItem("stage1TableData", JSON.stringify(updatedData));
 
    toast({
      title: "Data Saved Successfully",
      description: `Saved ${updatedData.filter((r) => r.stage2Enabled).length} record(s) with Stage 2 enabled`,
      duration: 2000,
    });
  };
 
  const handleStage2Navigate = (row: TableRow) => {
    localStorage.setItem("stage1TableData", JSON.stringify(tableData));
    navigate("/stage2-form", {
      state: {
        record: row,
        fromStage1: true,
      },
    });
    toast({
      title: "Navigating to Stage 2",
      description: `Opening Stage 2 for ticket ${row.ticketCode}`,
      duration: 2000,
    });
  };
 
  return (
    <div className="mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              ORT Received Ticket - Stage 1
            </CardTitle>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Data
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ORT receives the ticket and to say just received.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {tableData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No barcode assignments found in storage.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-bold text-gray-700 border">Ticket Code</TableHead>
                    <TableHead className="font-bold text-gray-700 border">Parts Being Sent</TableHead>
                    <TableHead className="font-bold text-gray-700 border">Received (Yes/No)</TableHead>
                    <TableHead className="font-bold text-gray-700 border">Date</TableHead>
                    <TableHead className="font-bold text-gray-700 border">Shift/Time</TableHead>
                    <TableHead className="font-bold text-gray-700 border min-w-[300px]">Details Box</TableHead>
                    <TableHead className="font-bold text-gray-700 border min-w-[200px]">Inventory Remarks</TableHead>
                    <TableHead className="font-bold text-gray-700 border">Stage 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      <TableCell className="border font-medium">{row.ticketCode}</TableCell>
                      <TableCell className="border text-center font-semibold">{row.partsBeingSent}</TableCell>
                      <TableCell className="border">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant={row.received === "Yes" ? "default" : "outline"}
                            onClick={() => handleReceivedChange(row.id, "Yes")}
                            className={row.received === "Yes" ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            ✓ Yes
                          </Button>
                          <Button
                            size="sm"
                            variant={row.received === "No" ? "default" : "outline"}
                            onClick={() => handleReceivedChange(row.id, "No")}
                            className={row.received === "No" ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            ✗ No
                          </Button>
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
                            <span className="font-semibold text-gray-600">• Project,color:</span>
                            <span className="font-medium">
                              {row.detailsBox.project}, {row.detailsBox.batch}, {row.detailsBox.color}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-semibold text-gray-600">• Assembly/OQC/Ano, reason:</span>
                            <span className="font-medium">
                              {row.detailsBox.assemblyOQCAno}, {row.detailsBox.reason}
                            </span>
                          </div>
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
                          <p className="text-xs text-red-500 mt-1">Required</p>
                        )}
                      </TableCell>
                      <TableCell className="border text-center">
                        {row.stage2Enabled ? (
                          <Button
                            size="sm"
                            onClick={() => handleStage2Navigate(row)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Stage 2
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Save to enable</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
 
          {/* Summary Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-800">{tableData.length}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Received</p>
                <p className="text-2xl font-bold text-green-600">
                  {tableData.filter((r) => r.received === "Yes").length}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Not Received</p>
                <p className="text-2xl font-bold text-red-600">
                  {tableData.filter((r) => r.received === "No").length}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-600">Stage 2 Ready</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {tableData.filter((r) => r.stage2Enabled).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
 
export default ORTLabPage;
 