import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Scan, Trash2, Copy, Check, Save, ArrowLeft, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

interface BarcodeScannerProps {
  onBarcodeScanned?: (barcodeData: string, serialNumber: string, partNumbers: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  clearButton?: boolean;
  onClear?: () => void;
  showCamera?: boolean;
  showPartNumbers?: boolean;
  maxParts?: number;
  showSubmitButton?: boolean;
  storageKey?: string;
  onDataSubmitted?: (submittedData: any) => void;
}

interface TestRecord {
  id: number;
  ticketCode: string;
  totalQuantity: number | string; // Allow both number and string
  assemblyAno: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  createdAt: string;
}

interface ScannedBarcode {
  serialNumber: string;
  partNumbers: string[];
  scannedAt: Date;
  id?: string;
}

interface StoredBarcodeData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  serialNumber: string;
  partNumbers: string[];
  totalParts: number;
  rawBarcodeData?: string;
}

const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005,PART006,PART007,PART008,PART009,PART010,PART011,PART012,PART013,PART014,PART015,PART016,PART017,PART018,PART019,PART020"
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeScanned,
  disabled = false,
  autoFocus = true,
  placeholder = "Enter barcode manually or click test buttons (Press Enter to scan)",
  clearButton = true,
  onClear,
  showCamera = true,
  showPartNumbers = true,
  maxParts = 20,
  showSubmitButton = true,
  storageKey = "ticketBarcodeAssignments",
  onDataSubmitted,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRecord = location.state?.record as TestRecord;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [scannedBarcode, setScannedBarcode] = useState<ScannedBarcode | null>(null);
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedEntries, setStoredEntries] = useState<StoredBarcodeData[]>([]);
  const [currentTicket, setCurrentTicket] = useState<TestRecord | null>(null);

  // Load ticket record on component mount
  useEffect(() => {
    if (ticketRecord) {
      setCurrentTicket(ticketRecord);
    } else {
      // Try to load the latest ticket from localStorage if not passed via state
      loadLatestTicket();
    }
  }, []);

  // Load stored data for this specific ticket
  useEffect(() => {
    if (currentTicket) {
      loadStoredDataForTicket();
    }
  }, [currentTicket]);

  useEffect(() => {
    if (autoFocus && barcodeInputRef.current && !disabled) {
      barcodeInputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Load the latest ticket from localStorage
  const loadLatestTicket = () => {
    try {
      const oqcData = localStorage.getItem("Oqcformdata");
      if (oqcData) {
        const records = JSON.parse(oqcData);
        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          setCurrentTicket(latestRecord);
          toast({
            title: "Ticket Loaded",
            description: `Loaded ticket ${latestRecord.ticketCode}`,
            duration: 2000,
          });
        } else {
          toast({
            variant: "destructive",
            title: "No Tickets Found",
            description: "Please create a ticket first.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error loading ticket:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Ticket",
        description: "Could not load ticket data. Please try again.",
        duration: 3000,
      });
    }
  };

  // Load stored data for this specific ticket
  const loadStoredDataForTicket = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const allData = JSON.parse(stored);
        const ticketData = allData.filter((entry: StoredBarcodeData) => 
          entry.ticketId === currentTicket?.id
        );
        setStoredEntries(ticketData);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  // Helper function to safely get total quantity as number
  const getTotalQuantity = () => {
    if (!currentTicket) return 0;
    const quantity = currentTicket.totalQuantity;
    // Handle both string and number types
    return typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  };

  // Helper function to get ticket ID
  const getTicketId = () => {
    if (!currentTicket) return 0;
    return currentTicket.id || 0;
  };

  // Helper function to get ticket code
  const getTicketCode = () => {
    if (!currentTicket) return "";
    return currentTicket.ticketCode || "";
  };

  // Parse barcode data
  const parseBarcodeData = (data: string): { serialNumber: string; partNumbers: string[] } => {
    let serialNumber = "";
    let partNumbers: string[] = [];

    // Check if input is a static barcode from our test data
    const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
      barcode.split(':')[0] === data.toUpperCase()
    );

    if (staticBarcode) {
      const parts = staticBarcode.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = parts[1].split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
    }
    // Format 1: SERIAL:PART1,PART2,PART3
    else if (data.includes(':') && data.includes(',')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = parts[1].split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
    }
    // Format 2: SERIAL:PART1 (single part)
    else if (data.includes(':') && !data.includes(',')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = [parts[1].trim()];
      }
    }
    // Format 3: Simple serial number only
    else {
      serialNumber = data.trim();
    }

    return { serialNumber, partNumbers };
  };

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();

      const barcodeData = barcodeInput.trim();
      if (barcodeData) {
        processBarcode(barcodeData);
        setBarcodeInput("");

        setTimeout(() => {
          if (barcodeInputRef.current && !disabled) {
            barcodeInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  const processBarcode = (data: string) => {
    if (!data.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Barcode",
        description: "Scanned data is empty",
        duration: 2000,
      });
      return;
    }

    if (!currentTicket) {
      toast({
        variant: "destructive",
        title: "No Active Ticket",
        description: "Please create or select a ticket first.",
        duration: 3000,
      });
      return;
    }

    try {
      const { serialNumber, partNumbers } = parseBarcodeData(data);

      if (!serialNumber) {
        toast({
          variant: "destructive",
          title: "Invalid Barcode Format",
          description: "No serial number found in scanned data",
          duration: 3000,
        });
        return;
      }

      const totalQuantity = getTotalQuantity();
      const alreadyAssignedParts = storedEntries.reduce((total, entry) => total + entry.totalParts, 0);
      const remainingQuantity = totalQuantity - alreadyAssignedParts;
      
      if (remainingQuantity <= 0) {
        toast({
          variant: "destructive",
          title: "Quantity Limit Reached",
          description: `All ${totalQuantity} parts have already been assigned to this ticket.`,
          duration: 3000,
        });
        return;
      }

      // Limit parts based on remaining quantity needed
      const allowedParts = Math.min(partNumbers.length, remainingQuantity, maxParts);
      const partsToUse = partNumbers.slice(0, allowedParts);

      if (scannedBarcode && scannedBarcode.serialNumber !== serialNumber) {
        if (window.confirm(`You already have serial ${scannedBarcode.serialNumber} scanned. Do you want to replace it with ${serialNumber}?`)) {
          const newBarcode: ScannedBarcode = {
            serialNumber,
            partNumbers: partsToUse,
            scannedAt: new Date()
          };
          setScannedBarcode(newBarcode);
          
          toast({
            title: "Serial Replaced",
            description: `Replaced serial ${scannedBarcode.serialNumber} with ${serialNumber}`,
            duration: 2000,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Scan Cancelled",
            description: `Keeping existing serial ${scannedBarcode.serialNumber}`,
            duration: 2000,
          });
          return;
        }
      } else {
        const newBarcode: ScannedBarcode = {
          serialNumber,
          partNumbers: partsToUse,
          scannedAt: new Date()
        };
        setScannedBarcode(newBarcode);
        
        toast({
          title: "Barcode Scanned",
          description: `Scanned serial ${serialNumber} with ${partsToUse.length} part(s)`,
          duration: 2000,
        });

        // Check if this completes the ticket requirement
        const newTotalAssigned = alreadyAssignedParts + partsToUse.length;
        if (newTotalAssigned >= totalQuantity) {
          toast({
            title: "✅ Ticket Requirement Met!",
            description: `All ${totalQuantity} parts have been assigned to ticket ${getTicketCode()}`,
            duration: 4000,
          });
        }
      }

      if (onBarcodeScanned) {
        onBarcodeScanned(data, serialNumber, partNumbers);
      }

    } catch (error) {
      console.error("Barcode processing error:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Failed to process barcode data. Please check the format.",
        duration: 3000,
      });
    }
  };

  const testWithStaticBarcode = (barcode: string) => {
    if (disabled || !currentTicket) return;
    
    setBarcodeInput(barcode);
    processBarcode(barcode);
    setBarcodeInput("");
  };

  const clearScannedData = () => {
    setBarcodeInput("");
    setScannedBarcode(null);
    if (onClear) {
      onClear();
    }
    if (barcodeInputRef.current && !disabled) {
      barcodeInputRef.current.focus();
    }
    toast({
      title: "Scanner Cleared",
      description: "Ready for next scan",
      duration: 2000,
    });
  };

  // Add this function after the existing functions (around line 380-420)
const saveScanSession = (scannedBarcode: ScannedBarcode) => {
  try {
    const scanSessionsKey = "ticketScanSessions";
    const existingSessions = localStorage.getItem(scanSessionsKey);
    const allSessions = existingSessions ? JSON.parse(existingSessions) : [];
    
    const newSession = {
      id: `session_${Date.now()}`,
      ticketCode: getTicketCode(),
      ticketId: getTicketId(),
      sessionDate: new Date().toISOString(),
      scannedParts: scannedBarcode.partNumbers.length,
      serialNumber: scannedBarcode.serialNumber,
      partNumbers: scannedBarcode.partNumbers
    };
    
    allSessions.push(newSession);
    localStorage.setItem(scanSessionsKey, JSON.stringify(allSessions));
    
    return newSession;
  } catch (error) {
    console.error("Error saving scan session:", error);
    return null;
  }
};

  const startScanner = async () => {
    if (disabled || !currentTicket) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setShowScanner(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        duration: 3000,
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setShowScanner(false);
  };

  const simulateCameraScan = () => {
    if (disabled || !currentTicket) return;
    
    const testBarcode = STATIC_BARCODE_DATA[0].split(':')[0];
    setBarcodeInput(testBarcode);
    processBarcode(testBarcode);
    setBarcodeInput("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPart(text);
      toast({
        title: "Copied!",
        description: `"${text}" copied to clipboard`,
        duration: 1500,
      });
      setTimeout(() => setCopiedPart(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const removeBarcode = () => {
    if (scannedBarcode) {
      const serialNumber = scannedBarcode.serialNumber;
      setScannedBarcode(null);
      toast({
        title: "Removed",
        description: `Serial ${serialNumber} removed`,
        duration: 2000,
      });
    }
  };

//   const handleSubmit = () => {
//     if (!scannedBarcode || !currentTicket) {
//       toast({
//         variant: "destructive",
//         title: "No Data to Submit",
//         description: "Please scan a barcode first.",
//         duration: 2000,
//       });
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Create submission data linked to ticket
//       const submissionData: StoredBarcodeData = {
//         id: `assign_${Date.now()}`,
//         timestamp: new Date().toISOString(),
//         ticketId: getTicketId(),
//         ticketCode: getTicketCode(),
//         serialNumber: scannedBarcode.serialNumber,
//         partNumbers: scannedBarcode.partNumbers,
//         totalParts: scannedBarcode.partNumbers.length,
//         rawBarcodeData: `${scannedBarcode.serialNumber}:${scannedBarcode.partNumbers.join(',')}`
//       };

//       // Load all assignments
//       const existingData = localStorage.getItem(storageKey);
//       const allAssignments = existingData ? JSON.parse(existingData) : [];

//       // Add new assignment
//       allAssignments.push(submissionData);

//       // Save to localStorage
//       localStorage.setItem(storageKey, JSON.stringify(allAssignments));

//       // Update state
//       setStoredEntries(prev => [...prev, submissionData]);

//       // Also update the OQC form record with barcode assignment
//       updateOqcRecordWithAssignment(submissionData);

//       toast({
//         title: "✅ Parts Assigned to Ticket!",
//         description: `${scannedBarcode.partNumbers.length} parts from serial ${scannedBarcode.serialNumber} assigned to ticket ${getTicketCode()}`,
//         duration: 3000,
//       });

//       // Clear current scan
//       clearScannedData();

//       if (onDataSubmitted) {
//         onDataSubmitted(submissionData);
//       }
//       navigate("/tickets");

//     } catch (error) {
//       console.error("Error saving data:", error);
//       toast({
//         variant: "destructive",
//         title: "Assignment Failed",
//         description: "Failed to assign parts to ticket. Please try again.",
//         duration: 3000,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };



  // Update the original OQC record with barcode assignment


  const handleSubmit = () => {
  if (!scannedBarcode || !currentTicket) {
    toast({
      variant: "destructive",
      title: "No Data to Submit",
      description: "Please scan a barcode first.",
      duration: 2000,
    });
    return;
  }

  setIsSubmitting(true);

  try {
    // Check if we're coming from table (scanning remaining parts)
    const fromTable = location.state?.fromTable;
    
    // Create submission data linked to ticket
    const submissionData: StoredBarcodeData = {
      id: `assign_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ticketId: getTicketId(),
      ticketCode: getTicketCode(),
      serialNumber: scannedBarcode.serialNumber,
      partNumbers: scannedBarcode.partNumbers,
      totalParts: scannedBarcode.partNumbers.length,
      rawBarcodeData: `${scannedBarcode.serialNumber}:${scannedBarcode.partNumbers.join(',')}`
    };

    // Save scan session if from table
    if (fromTable) {
      saveScanSession(scannedBarcode);
    }

    // Load all assignments
    const existingData = localStorage.getItem(storageKey);
    const allAssignments = existingData ? JSON.parse(existingData) : [];

    // Add new assignment
    allAssignments.push(submissionData);

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(allAssignments));

    // Update state
    setStoredEntries(prev => [...prev, submissionData]);

    // Also update the OQC form record with barcode assignment
    updateOqcRecordWithAssignment(submissionData);

    toast({
      title: "✅ Parts Assigned to Ticket!",
      description: `${scannedBarcode.partNumbers.length} parts from serial ${scannedBarcode.serialNumber} assigned to ticket ${getTicketCode()}`,
      duration: 3000,
    });

    // Clear current scan
    clearScannedData();

    // Navigate back to table if from table
    if (fromTable) {
      setTimeout(() => {
        navigate("/tickets");
      }, 1500);
    } else {
      // If not from table, navigate to tickets
      navigate("/tickets");
    }

    if (onDataSubmitted) {
      onDataSubmitted(submissionData);
    }

  } catch (error) {
    console.error("Error saving data:", error);
    toast({
      variant: "destructive",
      title: "Assignment Failed",
      description: "Failed to assign parts to ticket. Please try again.",
      duration: 3000,
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const updateOqcRecordWithAssignment = (assignment: StoredBarcodeData) => {
    try {
      const oqcData = localStorage.getItem("Oqcformdata");
      if (oqcData) {
        const records = JSON.parse(oqcData);
        const updatedRecords = records.map((record: any) => {
          if (record.id === getTicketId()) {
            // Add or update barcode assignments
            const existingAssignments = record.barcodeAssignments || [];
            return {
              ...record,
              barcodeAssignments: [...existingAssignments, assignment],
              assignedParts: (record.assignedParts || 0) + assignment.totalParts,
              lastUpdated: new Date().toISOString()
            };
          }
          return record;
        });
        
        localStorage.setItem("Oqcformdata", JSON.stringify(updatedRecords));
      }
    } catch (error) {
      console.error("Error updating OQC record:", error);
    }
  };

  const clearAllStoredData = () => {
    if (!currentTicket) return;
    
    if (window.confirm("Are you sure you want to clear ALL barcode assignments for this ticket? This action cannot be undone.")) {
      // Remove only assignments for this specific ticket
      const existingData = localStorage.getItem(storageKey);
      if (existingData) {
        const allAssignments = JSON.parse(existingData);
        const filteredAssignments = allAssignments.filter(
          (entry: StoredBarcodeData) => entry.ticketId !== getTicketId()
        );
        localStorage.setItem(storageKey, JSON.stringify(filteredAssignments));
      }
      
      setStoredEntries([]);
      
      // Also clear from OQC record
      const oqcData = localStorage.getItem("Oqcformdata");
      if (oqcData) {
        const records = JSON.parse(oqcData);
        const updatedRecords = records.map((record: any) => {
          if (record.id === getTicketId()) {
            const { barcodeAssignments, assignedParts, ...rest } = record;
            return rest;
          }
          return record;
        });
        localStorage.setItem("Oqcformdata", JSON.stringify(updatedRecords));
      }
      
      toast({
        title: "All Assignments Cleared",
        description: `All barcode assignments for ticket ${getTicketCode()} have been removed.`,
        duration: 2000,
      });
    }
  };

  // Calculate progress
  const assignedParts = storedEntries.reduce((total, entry) => total + entry.totalParts, 0);
  const totalQuantity = getTotalQuantity();
  const remainingParts = Math.max(0, totalQuantity - assignedParts);
  const progressPercentage = totalQuantity > 0 
    ? (assignedParts / totalQuantity) * 100 
    : 0;

  if (!currentTicket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 mb-4">No active ticket found.</div>
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with Ticket Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Form
              </Button>
              <div>
                <h1 className="text-xl font-bold">Barcode Scanner</h1>
                <p className="text-sm text-gray-500">Assign parts to OQC ticket</p>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-blue-700">Ticket Code</div>
              <div className="font-bold text-lg flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                {getTicketCode()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">Required Quantity</div>
              <div className="font-bold text-lg">{totalQuantity}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">Assigned Parts</div>
              <div className="font-bold text-lg text-green-600">{assignedParts}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">Remaining</div>
              <div className={`font-bold text-lg ${remainingParts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {remainingParts}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {/* <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Assignment Progress</span>
              <span>{assignedParts}/{totalQuantity} parts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  progressPercentage >= 100 
                    ? 'bg-green-600' 
                    : progressPercentage >= 75
                    ? 'bg-yellow-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            {assignedParts >= totalQuantity && (
              <div className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                <Check className="h-4 w-4" />
                ✅ All parts assigned to this ticket!
              </div>
            )}
          </div> */}
        </CardContent>
      </Card>

      {/* Barcode Input Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Scan Barcode</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcodeInput" className="text-base font-medium">
                Scanner Input <span className="text-red-600">*</span>
              </Label>
              <Input
                ref={barcodeInputRef}
                id="barcodeInput"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeInput}
                placeholder={placeholder}
                className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
                disabled={disabled}
                autoFocus={autoFocus && !disabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Test Barcodes:
              </Label>
              <div className="flex flex-wrap gap-2">
                {STATIC_BARCODE_DATA.map((barcode, index) => (
                  <Button
                    key={`test-barcode-${barcode}-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
                    className="text-xs font-mono"
                    disabled={disabled || assignedParts >= totalQuantity}
                  >
                    {barcode.split(':')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Scan Display */}
      {scannedBarcode && showPartNumbers && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">
                  Current Scan
                </h3>
                <p className="text-sm text-gray-500">
                  {scannedBarcode.partNumbers.length} parts ready to assign
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeBarcode}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Remove Scan
              </Button>
            </div>

            {/* Serial Number */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-700">Serial Number</div>
                  <div className="font-mono font-bold text-xl">{scannedBarcode.serialNumber}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(scannedBarcode.serialNumber)}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Part Numbers */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">
                  Part Numbers ({scannedBarcode.partNumbers.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(scannedBarcode.partNumbers.join(', '))}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy All
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {scannedBarcode.partNumbers.map((partNumber, index) => (
                  <div
                    key={`${scannedBarcode.serialNumber}-${partNumber}-${index}`}
                    className="relative"
                  >
                    <button
                      onClick={() => copyToClipboard(partNumber)}
                      className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all hover:shadow-sm text-left group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-mono text-sm font-medium truncate">
                          {partNumber}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedPart === partNumber ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Part {index + 1}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            {showSubmitButton && (
              <div className="pt-6 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !scannedBarcode || assignedParts >= totalQuantity}
                  className="w-40 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-5 w-5" />
                      Submit
                    </>
                  )}
                </Button>
                {assignedParts >= totalQuantity && (
                  <p className="text-sm text-center text-green-600 mt-2">
                    Ticket requirement already met
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      {storedEntries.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">
                  Assignment History
                </h3>
                <p className="text-sm text-gray-500">
                  {storedEntries.length} assignment(s) for this ticket
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllStoredData}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {storedEntries.slice().reverse().map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono font-bold">{entry.serialNumber}</div>
                      <div className="text-sm text-gray-600">
                        {entry.totalParts} parts • {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Parts: {entry.partNumbers.slice(0, 3).join(', ')}{entry.partNumbers.length > 3 ? '...' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Assigned
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {clearButton && (
          <Button
            variant="outline"
            onClick={clearScannedData}
            disabled={disabled || !scannedBarcode}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Current Scan
          </Button>
        )}

        {showCamera && (
          <>
            <Button
              variant="outline"
              onClick={startScanner}
              disabled={disabled || showScanner || assignedParts >= totalQuantity}
            >
              <Scan className="mr-2 h-4 w-4" />
              Start Camera Scanner
            </Button>
            
            {showScanner && (
              <>
                <Button
                  variant="destructive"
                  onClick={stopScanner}
                  disabled={disabled}
                >
                  Stop Scanner
                </Button>
                <Button
                  variant="default"
                  onClick={simulateCameraScan}
                  disabled={disabled || assignedParts >= totalQuantity}
                >
                  Simulate Camera Scan
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Camera Preview */}
      {showScanner && showCamera && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Camera Preview:
          </Label>
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="w-full h-auto"
              autoPlay
              playsInline
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-32 border-2 border-green-400 rounded-lg"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Position barcode within the green box for scanning
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;