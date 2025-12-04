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
  totalQuantity: number | string;
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
  
  // Track the current part index for each serial number
  const [serialPartIndex, setSerialPartIndex] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (ticketRecord) {
      setCurrentTicket(ticketRecord);
    } else {
      loadLatestTicket();
    }
  }, []);

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

  const getTotalQuantity = () => {
    if (!currentTicket) return 0;
    const quantity = currentTicket.totalQuantity;
    return typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  };

  const getTicketId = () => {
    if (!currentTicket) return 0;
    return currentTicket.id || 0;
  };

  const getTicketCode = () => {
    if (!currentTicket) return "";
    return currentTicket.ticketCode || "";
  };

  const parseBarcodeData = (data: string): { serialNumber: string; partNumbers: string[] } => {
    let serialNumber = "";
    let partNumbers: string[] = [];

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
    else if (data.includes(':') && data.includes(',')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = parts[1].split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
    }
    else if (data.includes(':') && !data.includes(',')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = [parts[1].trim()];
      }
    }
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

      // Get the current index for this serial number
      const currentIndex = serialPartIndex[serialNumber] || 0;
      
      // Check if we've exhausted all parts for this serial
      if (currentIndex >= partNumbers.length) {
        toast({
          variant: "destructive",
          title: "All Parts Scanned",
          description: `All ${partNumbers.length} parts from serial ${serialNumber} have been scanned.`,
          duration: 3000,
        });
        return;
      }

      // Get only the next part based on current index
      const nextPart = partNumbers[currentIndex];
      const partsToUse = [nextPart];

      // Update the index for next scan
      setSerialPartIndex(prev => ({
        ...prev,
        [serialNumber]: currentIndex + 1
      }));

      if (scannedBarcode && scannedBarcode.serialNumber === serialNumber) {
        // Same serial - add the new part to existing parts
        const newBarcode: ScannedBarcode = {
          serialNumber,
          partNumbers: [...scannedBarcode.partNumbers, ...partsToUse],
          scannedAt: new Date()
        };
        setScannedBarcode(newBarcode);
        
        toast({
          title: "Part Added",
          description: `Added ${nextPart} (Part ${currentIndex + 1} of ${partNumbers.length}) to serial ${serialNumber}`,
          duration: 2000,
        });
      } else if (scannedBarcode && scannedBarcode.serialNumber !== serialNumber) {
        // Different serial - ask to replace
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
        // First scan
        const newBarcode: ScannedBarcode = {
          serialNumber,
          partNumbers: partsToUse,
          scannedAt: new Date()
        };
        setScannedBarcode(newBarcode);
        
        toast({
          title: "Part Scanned",
          description: `Scanned ${nextPart} (Part ${currentIndex + 1} of ${partNumbers.length}) from serial ${serialNumber}`,
          duration: 2000,
        });
      }

      const newTotalAssigned = alreadyAssignedParts + partsToUse.length;
      if (newTotalAssigned >= totalQuantity) {
        toast({
          title: "✅ Ticket Requirement Met!",
          description: `All ${totalQuantity} parts have been assigned to ticket ${getTicketCode()}`,
          duration: 4000,
        });
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

  const testWithStaticBarcode = (serialNumber: string) => {
    if (disabled || !currentTicket) return;
    
    processBarcode(serialNumber);
  };

  const clearScannedData = () => {
    setBarcodeInput("");
    setScannedBarcode(null);
    // Reset the part index when clearing
    setSerialPartIndex({});
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
    processBarcode(testBarcode);
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
      // Reset the index for this serial when removing
      setSerialPartIndex(prev => {
        const newIndex = { ...prev };
        delete newIndex[serialNumber];
        return newIndex;
      });
      toast({
        title: "Removed",
        description: `Serial ${serialNumber} removed`,
        duration: 2000,
      });
    }
  };

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
      const fromTable = location.state?.fromTable;
      
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

      if (fromTable) {
        saveScanSession(scannedBarcode);
      }

      const existingData = localStorage.getItem(storageKey);
      const allAssignments = existingData ? JSON.parse(existingData) : [];
      allAssignments.push(submissionData);
      localStorage.setItem(storageKey, JSON.stringify(allAssignments));

      setStoredEntries(prev => [...prev, submissionData]);
      updateOqcRecordWithAssignment(submissionData);

      toast({
        title: "✅ Parts Assigned to Ticket!",
        description: `${scannedBarcode.partNumbers.length} parts from serial ${scannedBarcode.serialNumber} assigned to ticket ${getTicketCode()}`,
        duration: 3000,
      });

      // Clear the index for this serial after successful submission
      setSerialPartIndex(prev => {
        const newIndex = { ...prev };
        delete newIndex[scannedBarcode.serialNumber];
        return newIndex;
      });

      clearScannedData();

      if (fromTable) {
        setTimeout(() => {
          navigate("/tickets");
        }, 1500);
      } else {
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
      const existingData = localStorage.getItem(storageKey);
      if (existingData) {
        const allAssignments = JSON.parse(existingData);
        const filteredAssignments = allAssignments.filter(
          (entry: StoredBarcodeData) => entry.ticketId !== getTicketId()
        );
        localStorage.setItem(storageKey, JSON.stringify(filteredAssignments));
      }
      
      setStoredEntries([]);
      // Reset all indices when clearing all data
      setSerialPartIndex({});
      
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

  const assignedParts = storedEntries.reduce((total, entry) => total + entry.totalParts, 0);
  const totalQuantity = getTotalQuantity();
  const remainingParts = Math.max(0, totalQuantity - assignedParts);

  if (!currentTicket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 mb-4">No active ticket found.</div>
            <Button onClick={() => navigate("/")} className="bg-[#e0413a] text-white hover:bg-[#ad322c]">
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
                <p className="text-sm text-gray-500">Assign parts to OQC ticket (Sequential Scanning)</p>
              </div>
            </div>
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Scan Barcode (Sequential Mode)</h3>
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
                Test Barcode (Click multiple times to scan parts sequentially):
              </Label>
              <div className="flex flex-wrap gap-2">
                {STATIC_BARCODE_DATA.map((barcode, index) => {
                  const serialNumber = barcode.split(':')[0];
                  const currentIndex = serialPartIndex[serialNumber] || 0;
                  const totalParts = barcode.split(':')[1]?.split(',').length || 0;
                  
                  return (
                    <Button
                      key={`test-barcode-${barcode}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => testWithStaticBarcode(serialNumber)}
                      className="text-xs font-mono"
                      disabled={disabled || assignedParts >= totalQuantity || currentIndex >= totalParts}
                    >
                      {serialNumber} ({currentIndex}/{totalParts})
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Click the button multiple times - each click scans one part sequentially
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    </>                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {storedEntries.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">
                  Assigned Barcodes
                </h3>
                <p className="text-sm text-gray-500">
                  {assignedParts} parts assigned to ticket {getTicketCode()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllStoredData}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {storedEntries.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      Serial: <span className="font-mono">{entry.serialNumber}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Parts: </span>
                      <span className="font-mono text-sm">
                        {entry.partNumbers.slice(0, 3).join(', ')}
                        {entry.partNumbers.length > 3 && `... (+${entry.partNumbers.length - 3} more)`}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {entry.totalParts} parts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/tickets")}
          className="border-gray-300 hover:bg-gray-50"
        >
          View All Tickets
        </Button>
        
        <div className="flex gap-3">
          {clearButton && scannedBarcode && (
            <Button
              variant="outline"
              onClick={clearScannedData}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Scanner
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;