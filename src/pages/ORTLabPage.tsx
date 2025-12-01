import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, X, Scan, Trash2, CheckCircle, Barcode } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TestRecord {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  testStartDate: string;
  testCompletionDate: string;
  sampleConfig: string;
  status: string;
  id: number;
  createdAt: string;
  quantity: number;
  project: string[];
  line: string;
  colour: string;
  remarks: string;
}

// Static barcode data for testing
const STATIC_BARCODE_DATA = [
  "SN001:PART001,PART002,PART003,PART004,PART005"
];

interface ScannedPart {
  serialNumber: string;
  partNumber: string;
  scannedAt: Date;
}

const ORTLabPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.record as TestRecord | undefined;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [scannedParts, setScannedParts] = useState<ScannedPart[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on barcode input
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode input from physical scanner
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const barcodeData = barcodeInput.trim();
      if (barcodeData) {
        processBarcodeData(barcodeData);
        setBarcodeInput("");

        // Auto-refocus for next scan
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  // Process barcode data
  const processBarcodeData = (data: string) => {
    if (!data.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Barcode",
        description: "Scanned data is empty",
        duration: 2000,
      });
      return;
    }

    try {
      let serial = "";
      let partNumbers: string[] = [];

      // Check if input is a static barcode from our test data
      const staticBarcode = STATIC_BARCODE_DATA.find(barcode =>
        barcode.split(':')[0] === data.toUpperCase()
      );

      if (staticBarcode) {
        const parts = staticBarcode.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 1: SERIAL:PART1,PART2,PART3
      else if (data.includes(':') && data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = parts[1].split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        }
      }
      // Format 2: SERIAL:PART1 (single part)
      else if (data.includes(':') && !data.includes(',')) {
        const parts = data.split(':');
        serial = parts[0].trim();
        if (parts.length > 1) {
          partNumbers = [parts[1].trim()];
        }
      }
      // Format 3: Simple serial number only
      else {
        serial = data.trim();
      }

      // Validate serial number
      if (!serial) {
        toast({
          variant: "destructive",
          title: "Invalid Barcode Format",
          description: "No serial number found in scanned data",
          duration: 3000,
        });
        return;
      }

      // Set serial number
      setSerialNumber(serial);

      // Check if we've reached the required quantity
      const requiredQuantity = selectedRecord?.quantity || 0;
      if (scannedParts.length >= requiredQuantity) {
        toast({
          variant: "destructive",
          title: "Quantity Limit Reached",
          description: `Required quantity is ${requiredQuantity}. All parts have been scanned.`,
          duration: 3000,
        });
        return;
      }

      // Add scanned parts
      const newParts: ScannedPart[] = partNumbers.map(part => ({
        serialNumber: serial,
        partNumber: part,
        scannedAt: new Date()
      }));

      // Check how many more parts we can add
      const remainingCapacity = requiredQuantity - scannedParts.length;
      const partsToAdd = newParts.slice(0, remainingCapacity);

      if (partsToAdd.length > 0) {
        setScannedParts(prev => [...prev, ...partsToAdd]);
        toast({
          title: "Parts Scanned",
          description: `Added ${partsToAdd.length} part(s) to serial ${serial}`,
          duration: 2000,
        });

        // Check if we reached required quantity
        if (scannedParts.length + partsToAdd.length >= requiredQuantity) {
          toast({
            title: "All Parts Scanned!",
            description: `All ${requiredQuantity} parts have been scanned successfully.`,
            duration: 3000,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Add More Parts",
          description: `Required quantity ${requiredQuantity} already reached.`,
          duration: 3000,
        });
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

  // Test with static barcode data
  const testWithStaticBarcode = (barcode: string) => {
    setBarcodeInput(barcode);
    processBarcodeData(barcode);
    setBarcodeInput("");
  };

  // Clear all scanned data
  const clearScannedData = () => {
    setSerialNumber("");
    setScannedParts([]);
    setBarcodeInput("");
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
    toast({
      title: "Data Cleared",
      description: "All scanned data has been cleared",
      duration: 2000,
    });
  };

  // Start/Stop camera scanner
  const startScanner = async () => {
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

  // Handle ORT Submit
  const handleORTSubmit = () => {
    if (!selectedRecord) return;

    const requiredQuantity = selectedRecord.quantity;
    
    if (scannedParts.length < requiredQuantity) {
      toast({
        variant: "destructive",
        title: "Incomplete Scanning",
        description: `Only ${scannedParts.length} of ${requiredQuantity} parts scanned. Please scan all required parts.`,
        duration: 3000,
      });
      return;
    }

    try {
      const ortLabId = Date.now();
      const ortLabData = {
        ...selectedRecord,
        ortLabId: ortLabId,
        ortLab: {
          submissionId: ortLabId,
          date: new Date().toISOString().split('T')[0],
          serialNumber: serialNumber,
          scannedParts: scannedParts,
          totalParts: scannedParts.length,
          requiredQuantity: requiredQuantity,
          submittedAt: new Date().toISOString()
        }
      };

      // Save to localStorage
      const existingORTData = localStorage.getItem("ortLabRecords");
      const ortRecords = existingORTData ? JSON.parse(existingORTData) : [];
      ortRecords.push(ortLabData);
      localStorage.setItem("ortLabRecords", JSON.stringify(ortRecords));

      // Update test record status
      // const existingTestData = localStorage.getItem("testRecords");
      // if (existingTestData) {
      //   const testRecords = JSON.parse(existingTestData);
      //   const updatedRecords = testRecords.map((record: TestRecord) =>
      //     record.id === selectedRecord.id ? { ...record, status: "ORT Completed" } : record
      //   );
      //   localStorage.setItem("testRecords", JSON.stringify(updatedRecords));
      // }

      toast({
        title: "ORT Lab Completed!",
        description: `${scannedParts.length} parts scanned and assigned successfully.`,
        duration: 4000,
      });

      navigate("/qrtchecklist", { state: { 
      record: selectedRecord,
      ortData: ortLabData 
    }});

      // Navigate back after 2 seconds
      setTimeout(() => navigate("/qrtchecklist"), 1000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error processing the request. Please try again.",
        duration: 3000,
      });
      console.error("Error:", error);
    }
  };

  if (!selectedRecord) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No record selected. Please go back and select a record.</div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredQuantity = selectedRecord.quantity || 0;
  const scannedCount = scannedParts.length;
  const remainingCount = Math.max(0, requiredQuantity - scannedCount);
  const isComplete = scannedCount >= requiredQuantity;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Live Test Checklist
      </Button>

      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">
            ORT Lab - Part Scanning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* OQC Form Data Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              OQC Form Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Quantity Required</Label>
                <div className="text-xl font-bold">{selectedRecord.quantity}</div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Project(s)</Label>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(selectedRecord.project) && selectedRecord.project.length > 0 ? (
                    selectedRecord.project.map((proj, index) => (
                      <div key={index} className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {proj}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm font-medium">{selectedRecord.projectName}</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Line</Label>
                <div className="text-sm font-medium">{selectedRecord.line || "N/A"}</div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Colour</Label>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border"
                    style={{ 
                      backgroundColor: selectedRecord.colour === "N/A" ? "#ccc" : 
                      selectedRecord.colour?.includes("NDA") ? "#4f46e5" :
                      selectedRecord.colour?.includes("LB") ? "#10b981" :
                      selectedRecord.colour?.includes("SD") ? "#f59e0b" : selectedRecord.color || "#ccc"
                    }}
                  />
                  <span className="text-sm font-medium">{selectedRecord.colour || selectedRecord.color || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status Banner */}
          {isComplete && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">All Parts Scanned!</h3>
                  <p className="text-green-700 text-sm">
                    {scannedCount} parts have been scanned. Ready to submit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Required</p>
                  <p className="text-3xl font-bold">{requiredQuantity}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Scanned</p>
                  <p className={`text-3xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                    {scannedCount}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className={`text-3xl font-bold ${remainingCount === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {remainingCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barcode Scanner Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode Scanner
              </h3>
              <Button
                variant="outline"
                onClick={clearScannedData}
                disabled={!serialNumber && scannedParts.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {/* Barcode Input */}
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
                  placeholder="Enter barcode manually or click test buttons below (Press Enter to scan)"
                  className="h-12 font-mono text-lg border-2 border-blue-300 focus:border-blue-500"
                  autoFocus
                  disabled={isComplete}
                />
                {isComplete && (
                  <p className="text-sm text-green-600 font-medium">
                    All parts scanned. Ready to submit.
                  </p>
                )}
              </div>

              {/* Test Barcode Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Test Barcodes (Click to simulate scan):
                </Label>
                <div className="flex flex-wrap gap-2">
                  {STATIC_BARCODE_DATA.map((barcode, index) => (
                    <Button
                      key={`test-barcode-${barcode}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => testWithStaticBarcode(barcode.split(':')[0])}
                      className="text-xs font-mono"
                      disabled={isComplete}
                    >
                      {barcode.split(':')[0]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Camera Scanner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Camera Scanner:
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={startScanner}
                    disabled={showScanner || isComplete}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Camera Scanner
                  </Button>
                  {showScanner && (
                    <Button
                      variant="destructive"
                      onClick={stopScanner}
                    >
                      Stop Scanner
                    </Button>
                  )}
                </div>
              </div>

              {/* Scanner Status */}
              <div className="p-3 bg-white rounded border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Serial Number:</span>
                    <p className="font-mono text-blue-700">{serialNumber || "Not scanned"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isComplete ? 'Complete' : `${scannedCount}/${requiredQuantity} parts scanned`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Preview */}
          {showScanner && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
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
            </div>
          )}

          {/* Scanned Parts Table */}
          {scannedParts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Scanned Parts ({scannedParts.length} of {requiredQuantity})
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Scanned At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scannedParts.map((part, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{part.serialNumber}</TableCell>
                        <TableCell className="font-medium">{part.partNumber}</TableCell>
                        <TableCell>
                          {part.scannedAt.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Scanning Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {scannedCount} / {requiredQuantity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (scannedCount / requiredQuantity) * 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleORTSubmit}
              disabled={!isComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit ORT Lab
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ORTLabPage;