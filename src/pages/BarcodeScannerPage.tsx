import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Scan, 
  Trash2, 
  Copy, 
  Check, 
  Save, 
  ArrowLeft, 
  Ticket,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

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
  status: string;
  parts: Array<{
    id: string;
    partNumber: string;
    status: string;
    scanStatus: "Cosmetic" | "OK" | "Not OK" | null;
    scannedAt: string | null;
    serialNumber: string;
    location: string;
  }>;
}

interface ScannedPart {
  id: string;
  partNumber: string;
  serialNumber: string;
  scanStatus: "Cosmetic" | "OK" | "Not OK" | null;
  scannedAt: Date;
  location: string;
}

interface StoredBarcodeData {
  id: string;
  timestamp: string;
  ticketId: number;
  ticketCode: string;
  serialNumber: string;
  parts: ScannedPart[];
  totalParts: number;
  rawBarcodeData?: string;
}

const STATIC_BARCODE_DATA = [
  "SN001"
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeScanned,
  disabled = false,
  autoFocus = true,
  placeholder = "Scan barcode or enter manually (Press Enter to scan)",
  clearButton = true,
  onClear,
  showCamera = false,
  showPartNumbers = true,
  maxParts = 20,
  showSubmitButton = true,
  storageKey = "ticketBarcodeAssignments",
  onDataSubmitted,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketRecord = location.state?.record as TestRecord;
  const assignmentId = location.state?.assignmentId;

  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedEntries, setStoredEntries] = useState<StoredBarcodeData[]>([]);
  const [currentTicket, setCurrentTicket] = useState<TestRecord | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  useEffect(() => {
    if (ticketRecord) {
      setCurrentTicket(ticketRecord);
      loadStoredDataForTicket(ticketRecord.id);
    } else {
      loadLatestTicket();
    }
  }, []);

  useEffect(() => {
    if (autoFocus && barcodeInputRef.current && !disabled) {
      barcodeInputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const loadLatestTicket = () => {
    try {
      const testData = localStorage.getItem("testRecords");
      if (testData) {
        const records = JSON.parse(testData);
        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          setCurrentTicket(latestRecord);
          loadStoredDataForTicket(latestRecord.id);
        }
      }
    } catch (error) {
      console.error("Error loading ticket:", error);
    }
  };

  const loadStoredDataForTicket = (ticketId: number) => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const allData = JSON.parse(stored);
        const ticketData = allData.filter((entry: StoredBarcodeData) => 
          entry.ticketId === ticketId
        );
        setStoredEntries(ticketData);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const getTotalQuantity = () => {
    if (!currentTicket) return 0;
    return typeof currentTicket.totalQuantity === 'string' 
      ? parseInt(currentTicket.totalQuantity, 10) 
      : currentTicket.totalQuantity;
  };

  const getAssignedParts = () => {
    return storedEntries.reduce((total, entry) => total + entry.totalParts, 0);
  };

  const getRemainingParts = () => {
    const totalQuantity = getTotalQuantity();
    const assignedParts = getAssignedParts();
    const currentScanned = scannedParts.length;
    return Math.max(0, totalQuantity - assignedParts - currentScanned);
  };

  const parseBarcodeData = (data: string): { serialNumber: string; partNumbers: string[] } => {
    let serialNumber = "";
    let partNumbers: string[] = [];

    if (data.includes(':') && data.includes(',')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = parts[1].split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
    } else if (data.includes(':')) {
      const parts = data.split(':');
      serialNumber = parts[0].trim();
      if (parts.length > 1) {
        partNumbers = [parts[1].trim()];
      }
    } else {
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
    if (!data.trim() || !currentTicket) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a barcode or select a ticket first.",
        duration: 3000,
      });
      return;
    }

    try {
      const { serialNumber, partNumbers } = parseBarcodeData(data);
      
      if (!serialNumber) {
        toast({
          variant: "destructive",
          title: "Invalid Barcode",
          description: "No serial number found.",
          duration: 3000,
        });
        return;
      }

      const remainingParts = getRemainingParts();
      if (remainingParts <= 0) {
        toast({
          variant: "destructive",
          title: "All Parts Scanned",
          description: `All ${getTotalQuantity()} parts have been scanned.`,
          duration: 3000,
        });
        return;
      }

      // Get next pending part from ticket
      const pendingParts = currentTicket.parts.filter(p => p.status === "Pending");
      if (pendingParts.length === 0) {
        toast({
          variant: "destructive",
          title: "No Pending Parts",
          description: "All parts have been scanned.",
          duration: 3000,
        });
        return;
      }

      const nextPart = pendingParts[0];
      
      // Create scanned part without status (status will be selected by user)
      const scannedPart: ScannedPart = {
        id: nextPart.id,
        partNumber: nextPart.partNumber,
        serialNumber,
        scanStatus: null, // Status will be selected by user
        scannedAt: new Date(),
        location: "home"
      };

      setScannedParts(prev => [...prev, scannedPart]);
      
      toast({
        title: "Part Scanned",
        description: `${nextPart.partNumber} scanned with serial ${serialNumber}. Please select status.`,
        duration: 3000,
      });

    } catch (error) {
      console.error("Barcode processing error:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Failed to process barcode.",
        duration: 3000,
      });
    }
  };

  const handleStatusChange = (partId: string, status: "Cosmetic" | "OK" | "Not OK") => {
    setScannedParts(prev => 
      prev.map(part => 
        part.id === partId ? { ...part, scanStatus: status } : part
      )
    );
  };

  const handleSubmit = () => {
    if (scannedParts.length === 0 || !currentTicket) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please scan at least one part.",
        duration: 3000,
      });
      return;
    }

    // Check if all scanned parts have status selected
    const partsWithoutStatus = scannedParts.filter(p => !p.scanStatus);
    if (partsWithoutStatus.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing Status",
        description: `Please select status for ${partsWithoutStatus.length} part(s).`,
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: StoredBarcodeData = {
        id: `assign_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ticketId: currentTicket.id,
        ticketCode: currentTicket.ticketCode,
        serialNumber: scannedParts[0]?.serialNumber || "Unknown",
        parts: scannedParts,
        totalParts: scannedParts.length,
        rawBarcodeData: scannedParts.map(p => p.partNumber).join(',')
      };

      // Update localStorage
      const existingData = localStorage.getItem(storageKey);
      const allAssignments = existingData ? JSON.parse(existingData) : [];
      allAssignments.push(submissionData);
      localStorage.setItem(storageKey, JSON.stringify(allAssignments));

      // Update testRecords with scanned parts
      const testData = localStorage.getItem("testRecords");
      if (testData) {
        const records = JSON.parse(testData);
        const updatedRecords = records.map((record: TestRecord) => {
          if (record.id === currentTicket.id) {
            const updatedParts = record.parts.map(part => {
              const scannedPart = scannedParts.find(sp => sp.id === part.id);
              if (scannedPart) {
                return {
                  ...part,
                  status: "Scanned",
                  scanStatus: scannedPart.scanStatus,
                  scannedAt: new Date().toISOString(),
                  serialNumber: scannedPart.serialNumber,
                  location: scannedPart.location
                };
              }
              return part;
            });

            // Check if all parts are scanned
            const allScanned = updatedParts.every(p => p.status === "Scanned");
            
            return {
              ...record,
              parts: updatedParts,
              status: allScanned ? "Completed" : "In Progress"
            };
          }
          return record;
        });
        localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
      }

      setStoredEntries(prev => [...prev, submissionData]);
      setScannedParts([]);

      toast({
        title: "✅ Parts Submitted!",
        description: `${scannedParts.length} parts saved to ticket ${currentTicket.ticketCode}`,
        duration: 3000,
      });

      // Navigate back to tickets table
      setTimeout(() => {
        navigate("/tickets");
      }, 1500);

    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save scanned parts.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearScannedData = () => {
    setScannedParts([]);
    setBarcodeInput("");
    if (barcodeInputRef.current && !disabled) {
      barcodeInputRef.current.focus();
    }
    toast({
      title: "Scanner Cleared",
      description: "Ready for next scan",
      duration: 2000,
    });
  };

  const getStatusColor = (status: "Cosmetic" | "OK" | "Not OK" | null) => {
    switch (status) {
      case "OK": return "bg-green-100 text-green-800 border-green-200";
      case "Cosmetic": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Not OK": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: "Cosmetic" | "OK" | "Not OK" | null) => {
    switch (status) {
      case "OK": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Cosmetic": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "Not OK": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  if (!currentTicket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 mb-4">No ticket selected.</div>
            <Button onClick={() => navigate("/tickets")} className="bg-[#e0413a] text-white hover:bg-[#ad322c]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedParts = getAssignedParts();
  const totalQuantity = getTotalQuantity();
  const remainingParts = getRemainingParts();

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/tickets")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
              <div>
                <h1 className="text-xl font-bold">Barcode Scanning</h1>
                <p className="text-sm text-gray-500">Scan parts for ticket {currentTicket.ticketCode}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-blue-700">Ticket Code</div>
              <div className="font-bold text-lg flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                {currentTicket.ticketCode}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">Required</div>
              <div className="font-bold text-lg">{totalQuantity}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-700">Scanned</div>
              <div className="font-bold text-lg text-green-600">{assignedParts + scannedParts.length}</div>
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
                disabled={disabled || remainingParts <= 0}
                autoFocus={autoFocus && !disabled}
              />
              <p className="text-sm text-gray-500">
                Press Enter to scan. Each scan will process one part.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Test Barcodes:
              </Label>
              <div className="flex flex-wrap gap-2">
                {STATIC_BARCODE_DATA.map((barcode, index) => (
                  <Button
                    key={`test-barcode-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBarcodeInput(barcode);
                      setTimeout(() => {
                        const event = new KeyboardEvent('keydown', { key: 'Enter' });
                        barcodeInputRef.current?.dispatchEvent(event);
                      }, 100);
                    }}
                    className="text-xs font-mono"
                    disabled={disabled || remainingParts <= 0}
                  >
                    {barcode}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {scannedParts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">
                  Scanned Parts ({scannedParts.length})
                </h3>
                <p className="text-sm text-gray-500">
                  Select status for each scanned part
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearScannedData}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {scannedParts.map((part, index) => (
                <div
                  key={part.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-blue-600">#{index + 1}</span>
                        <span className="font-mono">{part.partNumber}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Serial: <span className="font-mono">{part.serialNumber}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(part.scanStatus)}>
                      {getStatusIcon(part.scanStatus)}
                      <span className="ml-1">{part.scanStatus || "Pending"}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Status:</Label>
                    <RadioGroup
                      value={part.scanStatus || ""}
                      onValueChange={(value: "Cosmetic" | "OK" | "Not OK") => 
                        handleStatusChange(part.id, value)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OK" id={`ok-${part.id}`} />
                        <Label htmlFor={`ok-${part.id}`} className="flex items-center gap-2 cursor-pointer">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          OK
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Cosmetic" id={`cosmetic-${part.id}`} />
                        <Label htmlFor={`cosmetic-${part.id}`} className="flex items-center gap-2 cursor-pointer">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          Cosmetic
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Not OK" id={`notok-${part.id}`} />
                        <Label htmlFor={`notok-${part.id}`} className="flex items-center gap-2 cursor-pointer">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Not OK
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || scannedParts.length === 0 || 
                  scannedParts.some(p => !p.scanStatus)}
                className="w-40 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-3 h-5 w-5" />
                    Submit All Parts
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                {scannedParts.filter(p => !p.scanStatus).length} part(s) need status selection
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {storedEntries.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-700">
                  Previously Scanned Parts
                </h3>
                <p className="text-sm text-gray-500">
                  {assignedParts} parts already assigned to this ticket
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/tickets")}
              >
                <Eye className="mr-2 h-4 w-4" />
                View All Tickets
              </Button>
            </div>

            <div className="space-y-3">
              {storedEntries.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      Session: <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant="outline">{entry.totalParts} parts</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Serial:</span>
                      <span className="font-mono ml-2">{entry.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status Summary:</span>
                      <div className="flex gap-1 mt-1">
                        {entry.parts.filter(p => p.scanStatus === "OK").length > 0 && (
                          <Badge className="bg-green-100 text-green-800">OK: {entry.parts.filter(p => p.scanStatus === "OK").length}</Badge>
                        )}
                        {entry.parts.filter(p => p.scanStatus === "Cosmetic").length > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">Cosmetic: {entry.parts.filter(p => p.scanStatus === "Cosmetic").length}</Badge>
                        )}
                        {entry.parts.filter(p => p.scanStatus === "Not OK").length > 0 && (
                          <Badge className="bg-red-100 text-red-800">Not OK: {entry.parts.filter(p => p.scanStatus === "Not OK").length}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;