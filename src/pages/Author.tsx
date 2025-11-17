import React, { useState, useEffect } from "react";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import FootPushOutForm from "@/components/FootPushOutForm";
import ShearTestForm from '@/components/ShearTestForm';
import PullTestCleatForm from '@/components/PullTestCleatForm';
import HeatSoakForm from '@/components/HeatSoakForm';
import SideSnapForm from '@/components/SideSnapForm';

const REFERENCE_IMAGE_PATH = "/assets/sample.jpg";

// Improved OCR simulation based on your image labels
const detectLabelText = (imageData: string, regionId: number): string => {
  // In a real application, this would use Tesseract.js OCR
  // For now, we'll simulate detection based on region order and common patterns
  const labels = [
    "F1", "Cleat 1", "Cleat 2", "Cleat 3", "Cleat 4", "F2",
    "Side snap 1", "Side snap 4", "F4", "F3", 
    "Side snap 2", "Side snap 3"
  ];
  
  // Return label based on region ID (in order of detection)
  return labels[regionId] || `Unknown ${regionId + 1}`;
};

// Improved label to form mapping based on your image
const getLabelCategory = (label: string) => {
  if (!label) return null;
  
  const lower = label.toLowerCase().trim();
  
  // Foot Push Out mapping
  if (lower.includes('f1') || lower.includes('f2') || lower.includes('f3') || lower.includes('f4')) {
    return { form: 'footPushOut', id: label };
  }
  
  // Pull Test Cleat mapping
  if (lower.includes('cleat')) {
    return { form: 'pullTestCleat', id: label };
  }
  
  // Side Snap mapping
  if (lower.includes('side snap')) {
    return { form: 'sidesnap', id: label };
  }
  
  return null;
};

// Define types for better TypeScript support
interface FormRow {
  id: number;
  srNo: number;
  [key: string]: unknown;
}

interface FormData {
  testName: string;
  rows: FormRow[];
  [key: string]: unknown;
}

interface FormsState {
  footPushOut: FormData;
  shearTestSideSnap: FormData;
  pullTestCleat: FormData;
  heatSoak: FormData;
  sidesnap: FormData;
}

interface CroppedRegion {
  id: number;
  data: string;
  label: string;
  category: any;
  rect: any;
}

interface Stage {
  id: number;
  name: string;
  icon: any;
  formKey?: string;
}

// Test name options - must match TestForm.tsx
const TEST_NAME_OPTIONS = [
  { id: 'footPushOut', name: 'Foot Push Out' },
  { id: 'shearTestSideSnap', name: 'Shear Test Side Snap' },
  { id: 'pullTestCleat', name: 'Pull Test Cleat' },
  { id: 'heatSoak', name: 'Heat Soak' },
  { id: 'sidesnap', name: 'Side Snap' },
];

// All available stages
const ALL_STAGES: Stage[] = [
  { id: 0, name: "Image Upload", icon: Upload },
  { id: 1, name: "Foot Push Out", icon: CheckCircle, formKey: "footPushOut" },
  { id: 2, name: "Shear Test", icon: CheckCircle, formKey: "shearTestSideSnap" },
  { id: 3, name: "Pull Test Cleat", icon: CheckCircle, formKey: "pullTestCleat" },
  { id: 4, name: "Heat Soak", icon: CheckCircle, formKey: "heatSoak" },
  { id: 5, name: "Side Snap", icon: CheckCircle, formKey: "sidesnap" },
];

// Extend Window interface for OpenCV
declare global {
  interface Window {
    cv: any;
  }
}

export default function MultiStageTestForm() {
  const [currentStage, setCurrentStage] = useState(0);
  const [cvLoaded, setCvLoaded] = useState(false);
  const [regions, setRegions] = useState<unknown[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  
  // Shared images across all forms
  const [sharedImages, setSharedImages] = useState({
    cosmetic: null as string | null,
    nonCosmetic: null as string | null
  });
  
  // Cropped regions with detected labels
  const [croppedRegions, setCroppedRegions] = useState<CroppedRegion[]>([]);
  
  // Form data for all forms
  const [forms, setForms] = useState<FormsState>({
    footPushOut: {
      testName: "Foot Push Out",
      ers: "",
      partNumber: "",
      machineName: "Instron",
      testCondition: "Room Temperature(RT)",
      roomTemp: "RT",
      date: "07-11-2025",
      passCriteria: "Food Push Out > 100N",
      testStage: "After Assy",
      project: "Light_Blue",
      sampleQty: "32",
      rows: [
        { id: 1, srNo: 1, testDate: "", sampleId: "", footNumber: "F1", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "B", 
          glueCondition: "F", criteria: "100", observation: "", forceDeflection: "", 
          displacement: "", status: "Pass" },
        { id: 2, srNo: 2, testDate: "", sampleId: "", footNumber: "F2", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "B", 
          glueCondition: "F", criteria: "100", observation: "", forceDeflection: "", 
          displacement: "", status: "" },
        { id: 3, srNo: 3, testDate: "", sampleId: "", footNumber: "F3", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "B", 
          glueCondition: "F", criteria: "100", observation: "", forceDeflection: "", 
          displacement: "", status: "" },
        { id: 4, srNo: 4, testDate: "", sampleId: "", footNumber: "F4", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "B", 
          glueCondition: "F", criteria: "100", observation: "", forceDeflection: "", 
          displacement: "", status: "" }
      ]
    },
    shearTestSideSnap: {
      testName: "Shear test of Side Snap",
      ers: "",
      partNumber: "089-23089-A",
      machineName: "Instron",
      testCondition: "",
      roomTemp: "RT",
      date: "",
      passCriteria: "Data Collection",
      testStage: "After Assy",
      project: "Light_Blue",
      sampleQty: "32",
      rows: [
        { id: 1, srNo: 1, testDate: "", sampleId: "", ssShear: "", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, criteria: "Data collection", 
          observation: "", forceDeflection: "", displacement: "", status: "Pass" }
      ]
    },
    pullTestCleat: {
      testName: "Pull test of Cleat",
      ers: "089-23089-A",
      machineName: "Instron",
      testCondition: "RT",
      date: "",
      passCriteria: "Clear > 150N",
      testStage: "After Assy",
      project: "Light_Blue",
      sampleQty: "32",
      rows: [
        { id: 1, srNo: 1, testDate: "", sampleId: "", cleatNumber: "Cleat 1", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "A", 
          glueCondition: "B", criteria: "150", observation: "", forceDeflection: "", 
          displacement: "", status: "Pass" },
        { id: 2, srNo: 2, testDate: "", sampleId: "", cleatNumber: "Cleat 2", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "A", 
          glueCondition: "B", criteria: "150", observation: "", forceDeflection: "", 
          displacement: "", status: "" },
        { id: 3, srNo: 3, testDate: "", sampleId: "", cleatNumber: "Cleat 3", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "A", 
          glueCondition: "B", criteria: "150", observation: "", forceDeflection: "", 
          displacement: "", status: "" },
        { id: 4, srNo: 4, testDate: "", sampleId: "", cleatNumber: "Cleat 4", visual: "OK", 
          prePhoto: null, postPhoto: null, partPicture: null, failureMode: "A", 
          glueCondition: "B", criteria: "150", observation: "", forceDeflection: "", 
          displacement: "", status: "" }
      ]
    },
    heatSoak: {
      testName: "Heat Soak",
      ers: "099-35562 N199 & 080-1654-1",
      testCondition: "65°C/90%RH",
      date: "",
      failureCriteria: [
        "Any sample with corrosion spot ≥250 μm",
        "≥2 corrosion spots of any size",
        "Discoloration grade of C or worse in test"
      ],
      testStage: "After Assy",
      project: "Light Blue",
      sampleQty: "32",
      rows: [
        { id: 1, srNo: 1, sampleId: "", startDate: "", endDate: "", 
          t0Cosmetic: null, t0NonCosmetic: null, t168Cosmetic: null, 
          t168NonCosmetic: null, status: "Pass" }
      ]
    },
    sidesnap: {
      testName: "Side Snap Test",
      ers: "",
      partNumber: "",
      machineName: "Instron",
      testCondition: "Room Temperature(RT)",
      roomTemp: "RT",
      date: "",
      passCriteria: "Data Collection",
      testStage: "After Assy",
      project: "Light_Blue",
      sampleQty: "32",
      rows: [
        { 
          id: 1, 
          srNo: 1, 
          testDate: "", 
          sampleId: "", 
          sideSnapNumber: "Side snap 1", 
          visual: "OK", 
          prePhoto: null, 
          postPhoto: null, 
          partPicture: null, 
          failureMode: "", 
          glueCondition: "", 
          criteria: "Data collection", 
          observation: "", 
          forceDeflection: "", 
          displacement: "", 
          status: "" 
        },
        { 
          id: 2, 
          srNo: 2, 
          testDate: "", 
          sampleId: "", 
          sideSnapNumber: "Side snap 2", 
          visual: "OK", 
          prePhoto: null, 
          postPhoto: null, 
          partPicture: null, 
          failureMode: "", 
          glueCondition: "", 
          criteria: "Data collection", 
          observation: "", 
          forceDeflection: "", 
          displacement: "", 
          status: "" 
        },
        { 
          id: 3, 
          srNo: 3, 
          testDate: "", 
          sampleId: "", 
          sideSnapNumber: "Side snap 3", 
          visual: "OK", 
          prePhoto: null, 
          postPhoto: null, 
          partPicture: null, 
          failureMode: "", 
          glueCondition: "", 
          criteria: "Data collection", 
          observation: "", 
          forceDeflection: "", 
          displacement: "", 
          status: "" 
        },
        { 
          id: 4, 
          srNo: 4, 
          testDate: "", 
          sampleId: "", 
          sideSnapNumber: "Side snap 4", 
          visual: "OK", 
          prePhoto: null, 
          postPhoto: null, 
          partPicture: null, 
          failureMode: "", 
          glueCondition: "", 
          criteria: "Data collection", 
          observation: "", 
          forceDeflection: "", 
          displacement: "", 
          status: "" 
        }
      ]
    }
  });

  // Load selected tests from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("testRecords");
    if (storedData) {
      try {
        const records = JSON.parse(storedData);
        // Get the latest record's selected tests
        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          if (latestRecord.testName && Array.isArray(latestRecord.testName) && latestRecord.testName.length > 0) {
            setSelectedTests(latestRecord.testName);
            console.log("Loaded selected tests:", latestRecord.testName);
          }
        }
      } catch (error) {
        console.error("Error parsing test records:", error);
      }
    }
  }, []);

  // Filter stages based on selected tests
  const filteredStages = React.useMemo(() => {
    const imageUploadStage = ALL_STAGES[0]; // Always include image upload stage
    const formStages = ALL_STAGES.slice(1).filter(stage => 
      stage.formKey && selectedTests.includes(stage.formKey)
    );
    return [imageUploadStage, ...formStages];
  }, [selectedTests]);

  // Get current stage data
  const currentStageData = filteredStages[currentStage];

  // Load OpenCV
  useEffect(() => {
    if (window.cv && window.cv.Mat) {
      setCvLoaded(true);
      loadReferenceImage();
      return;
    }

    const existingScript = document.querySelector('script[src*="opencv.js"]');
    if (existingScript) {
      existingScript.onload = () => {
        if (window.cv && window.cv.onRuntimeInitialized) {
          window.cv.onRuntimeInitialized = () => {
            setCvLoaded(true);
            loadReferenceImage();
          };
        }
      };
      return;
    }

    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;
    script.onload = () => {
      if (window.cv) {
        window.cv.onRuntimeInitialized = () => {
          setCvLoaded(true);
          loadReferenceImage();
        };
      }
    };
    document.body.appendChild(script);
  }, []);

  const loadReferenceImage = () => {
    if (!window.cv || !window.cv.Mat) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const cv = window.cv;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imgData);
        
        const hsv = new cv.Mat();
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

        const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 100, 100, 0]);
        const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [40, 255, 255, 255]);
        const mask = new cv.Mat();
        cv.inRange(hsv, lower, upper, mask);

        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let boxes = [];
        const minArea = 100;
        
        for (let i = 0; i < contours.size(); ++i) {
          const rect = cv.boundingRect(contours.get(i));
          const area = rect.width * rect.height;
          if (area >= minArea) boxes.push(rect);
        }

        setRegions(boxes);
        src.delete(); hsv.delete(); mask.delete(); lower.delete(); upper.delete();
        contours.delete(); hierarchy.delete();
      } catch (err) {
        console.error("Error processing reference:", err);
      }
    };
    img.onerror = () => {
      console.warn("Reference image not found, using fallback");
    };
    img.src = REFERENCE_IMAGE_PATH;
  };

  const processNonCosmeticImage = (file: File) => {
    if (!cvLoaded) {
      alert("OpenCV not loaded yet. Please wait...");
      return;
    }

    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const cv = window.cv;
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setProcessing(false);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          const src = cv.imread(canvas);
          
          // Detect yellow regions
          const hsv = new cv.Mat();
          cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
          cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

          const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 100, 100, 0]);
          const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [40, 255, 255, 255]);
          const mask = new cv.Mat();
          cv.inRange(hsv, lower, upper, mask);

          const contours = new cv.MatVector();
          const hierarchy = new cv.Mat();
          cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

          let detectedRegions: any[] = [];
          const minArea = 500;
          
          for (let i = 0; i < contours.size(); ++i) {
            const rect = cv.boundingRect(contours.get(i));
            const area = rect.width * rect.height;
            if (area >= minArea) {
              detectedRegions.push(rect);
            }
          }

          // Sort regions by position (top to bottom, left to right)
          detectedRegions.sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
          });

          // Crop each region
          const croppedImages: CroppedRegion[] = [];
          detectedRegions.forEach((rect, i) => {
            try {
              const x = Math.max(0, Math.min(rect.x, src.cols - 1));
              const y = Math.max(0, Math.min(rect.y, src.rows - 1));
              const width = Math.min(rect.width, src.cols - x);
              const height = Math.min(rect.height, src.rows - y);
              
              if (width <= 0 || height <= 0) return;
              
              const validRect = new cv.Rect(x, y, width, height);
              const roi = src.roi(validRect);
              
              const cropCanvas = document.createElement("canvas");
              cropCanvas.width = width;
              cropCanvas.height = height;
              cv.imshow(cropCanvas, roi);
              
              const croppedData = cropCanvas.toDataURL("image/png", 1.0);
              
              // Improved label detection based on your image
              const detectedLabel = detectLabelText(croppedData, i);
              const category = getLabelCategory(detectedLabel);
              
              croppedImages.push({
                id: i,
                data: croppedData,
                label: detectedLabel,
                category: category,
                rect: rect
              });
              
              roi.delete();
            } catch (err) {
              console.error(`Error cropping region ${i}:`, err);
            }
          });

          setCroppedRegions(croppedImages);
          distributeImagesToForms(croppedImages);
          
          src.delete(); hsv.delete(); mask.delete(); lower.delete(); upper.delete();
          contours.delete(); hierarchy.delete();
        } catch (err) {
          console.error("Error processing image:", err);
          alert("Failed to process image");
        } finally {
          setProcessing(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const distributeImagesToForms = (croppedImages: CroppedRegion[]) => {
    const updatedForms = { ...forms };
    
    console.log("Distributing images to forms:", croppedImages);
    
    croppedImages.forEach(region => {
      if (!region.category) {
        console.log("No category found for region:", region.label);
        return;
      }
      
      const { form, id } = region.category;
      const formData = updatedForms[form as keyof FormsState];
      
      if (!formData) {
        console.log("Form not found:", form);
        return;
      }
      
      console.log(`Distributing ${region.label} to ${form}`);
      
      // Find matching row and add part picture
      formData.rows.forEach((row: any) => {
        const rowId = row.footNumber || row.cleatNumber || row.sideSnapNumber;
        if (rowId && id.toLowerCase().includes(rowId.toLowerCase().replace('-', ' '))) {
          console.log(`Matched ${region.label} with row ${rowId}`);
          row.partPicture = region.data;
        }
      });
    });
    
    setForms(updatedForms);
  };

  const handleImageUpload = (type: 'cosmetic' | 'nonCosmetic', file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSharedImages(prev => ({ ...prev, [type]: imageUrl }));
    
    if (type === "nonCosmetic") {
      processNonCosmeticImage(file);
    }
    
    // Distribute shared images to all forms
    const updatedForms = { ...forms };
    Object.keys(updatedForms).forEach(formKey => {
      (updatedForms[formKey as keyof FormsState].rows as any[]).forEach((row: any) => {
        if (type === "cosmetic") {
          row.prePhoto = imageUrl;
          if (row.t0Cosmetic !== undefined) row.t0Cosmetic = imageUrl;
          if (row.t168Cosmetic !== undefined) row.t168Cosmetic = imageUrl;
        } else {
          row.postPhoto = imageUrl;
          if (row.t0NonCosmetic !== undefined) row.t0NonCosmetic = imageUrl;
          if (row.t168NonCosmetic !== undefined) row.t168NonCosmetic = imageUrl;
        }
      });
    });
    setForms(updatedForms);
  };

  const updateFormField = (formKey: keyof FormsState, field: string, value: string) => {
    setForms(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], [field]: value }
    }));
  };

  const updateRowField = (formKey: keyof FormsState, rowId: number, field: string, value: string) => {
    setForms(prev => ({
      ...prev,
      [formKey]: {
        ...prev[formKey],
        rows: prev[formKey].rows.map(row => 
          row.id === rowId ? { ...row, [field]: value } : row
        )
      }
    }));
  };

  const addRow = (formKey: keyof FormsState) => {
    setForms(prev => {
      const currentForm = prev[formKey];
      const newId = Math.max(...currentForm.rows.map(r => r.id)) + 1;
      const newRow = { 
        id: newId, 
        srNo: currentForm.rows.length + 1,
        ...Object.keys(currentForm.rows[0]).reduce((acc, key) => {
          if (!['id', 'srNo'].includes(key)) {
            (acc as any)[key] = "";
          }
          return acc;
        }, {} as any)
      };
      
      return {
        ...prev,
        [formKey]: {
          ...currentForm,
          rows: [...currentForm.rows, newRow]
        }
      };
    });
  };

  const renderImageUploadStage = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Upload Images</h2>
      
      {/* Selected Tests Display */}
      {selectedTests.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Selected Tests:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTests.map(testId => {
              const test = TEST_NAME_OPTIONS.find(t => t.id === testId);
              return test ? (
                <span key={testId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {test.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cosmetic Image */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Upload className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Cosmetic Image</h3>
              <p className="text-xs text-gray-500">Pre-Photo for all forms</p>
            </div>
          </div>
          
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50">
            {sharedImages.cosmetic ? (
              <div className="relative w-full h-full">
                <img src={sharedImages.cosmetic} alt="Cosmetic" className="w-full h-full object-contain p-2" />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSharedImages(prev => ({ ...prev, cosmetic: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <Upload className="mx-auto mb-3 text-blue-400" size={40} />
                <span className="text-sm font-medium text-gray-700">Upload Cosmetic Image</span>
                <span className="text-xs text-gray-500 block mt-2">JPG, PNG supported</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload("cosmetic", e.target.files[0])}
            />
          </label>
        </div>

        {/* Non-Cosmetic Image */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Upload className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Non-Cosmetic Image</h3>
              <p className="text-xs text-gray-500">Post-Photo + Auto-crop regions</p>
            </div>
          </div>
          
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors bg-green-50 relative">
            {processing && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
                  <span className="font-semibold">Processing & Detecting Labels...</span>
                </div>
              </div>
            )}
            
            {sharedImages.nonCosmetic ? (
              <div className="relative w-full h-full">
                <img src={sharedImages.nonCosmetic} alt="Non-Cosmetic" className="w-full h-full object-contain p-2" />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSharedImages(prev => ({ ...prev, nonCosmetic: null }));
                    setCroppedRegions([]);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <Upload className="mx-auto mb-3 text-green-400" size={40} />
                <span className="text-sm font-medium text-gray-700">Upload Non-Cosmetic Image</span>
                <span className="text-xs text-gray-500 block mt-2">With yellow labels</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload("nonCosmetic", e.target.files[0])}
              disabled={processing || !cvLoaded}
            />
          </label>
          
          <div className="mt-3 text-xs">
            {!cvLoaded ? (
              <div className="text-amber-600 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600 mr-2"></div>
                Loading OpenCV...
              </div>
            ) : (
              <div className="text-green-600">Ready to process</div>
            )}
          </div>
        </div>
      </div>

      {/* Cropped Regions Preview */}
      {croppedRegions.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Detected Regions ({croppedRegions.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {croppedRegions.map((region) => (
              <div key={region.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <img 
                  src={region.data} 
                  alt={region.label}
                  className="w-full h-20 object-contain border rounded bg-gray-50 mb-2"
                />
                <div className="text-xs text-center">
                  <div className="font-semibold text-gray-700">{region.label}</div>
                  <div className="text-gray-500 mt-1">
                    {region.category ? `→ ${region.category.form}` : "Unknown"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={() => setCurrentStage(1)}
          disabled={!sharedImages.cosmetic || !sharedImages.nonCosmetic || selectedTests.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center font-semibold"
        >
          Continue to Forms
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );

  const renderCurrentForm = () => {
    if (!currentStageData?.formKey) return null;

    const formKey = currentStageData.formKey as keyof FormsState;

    switch (formKey) {
      case 'footPushOut':
        return (
          <FootPushOutForm
            formData={forms.footPushOut}
            updateFormField={(field, value) => updateFormField('footPushOut', field, value)}
            updateRowField={(rowId, field, value) => updateRowField('footPushOut', rowId, field, value)}
            addRow={() => addRow('footPushOut')}
          />
        );
      case 'shearTestSideSnap':
        return (
          <ShearTestForm
            formData={forms.shearTestSideSnap}
            updateFormField={(field, value) => updateFormField('shearTestSideSnap', field, value)}
            updateRowField={(rowId, field, value) => updateRowField('shearTestSideSnap', rowId, field, value)}
            addRow={() => addRow('shearTestSideSnap')}
          />
        );
      case 'pullTestCleat':
        return (
          <PullTestCleatForm
            formData={forms.pullTestCleat}
            updateFormField={(field, value) => updateFormField('pullTestCleat', field, value)}
            updateRowField={(rowId, field, value) => updateRowField('pullTestCleat', rowId, field, value)}
            addRow={() => addRow('pullTestCleat')}
          />
        );
      case 'heatSoak':
        return (
          <HeatSoakForm
            formData={forms.heatSoak}
            updateFormField={(field, value) => updateFormField('heatSoak', field, value)}
            updateRowField={(rowId, field, value) => updateRowField('heatSoak', rowId, field, value)}
            addRow={() => addRow('heatSoak')}
          />
        );
      case 'sidesnap':
        return (
          <SideSnapForm
            formData={forms.sidesnap}
            updateFormField={(field, value) => updateFormField('sidesnap', field, value)}
            updateRowField={(rowId, field, value) => updateRowField('sidesnap', rowId, field, value)}
            addRow={() => addRow('sidesnap')}
          />
        );
      default:
        return null;
    }
  };

  const isLastStage = currentStage === filteredStages.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar - Only shows selected forms */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {filteredStages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => setCurrentStage(index)}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStage === index 
                      ? "bg-blue-600 text-white" 
                      : currentStage > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {currentStage > index ? (
                      <CheckCircle size={20} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden md:block ${
                    currentStage === index ? "text-blue-600" : "text-gray-600"
                  }`}>
                    {stage.name}
                  </span>
                </div>
                {index < filteredStages.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStage > index ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg m-4">
          {currentStage === 0 && renderImageUploadStage()}
          
          {currentStage > 0 && renderCurrentForm()}

          {/* Navigation Buttons */}
          {currentStage > 0 && (
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setCurrentStage(currentStage - 1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-semibold"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </button>
              
              {!isLastStage ? (
                <button
                  onClick={() => setCurrentStage(currentStage + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold"
                >
                  Next Form
                  <ChevronRight size={20} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert("All forms completed! Data ready for submission.");
                    console.log("Final Form Data:", forms);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-semibold"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Complete & Submit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Panel (Optional - shows image distribution status) */}
      {currentStage > 0 && croppedRegions.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2 text-blue-600" />
            Image Distribution Status
          </h3>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Regions Detected:</span>
              <span className="font-semibold">{croppedRegions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cosmetic Image:</span>
              <span className={`font-semibold ${sharedImages.cosmetic ? "text-green-600" : "text-red-600"}`}>
                {sharedImages.cosmetic ? "✓ Loaded" : "✗ Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Non-Cosmetic Image:</span>
              <span className={`font-semibold ${sharedImages.nonCosmetic ? "text-green-600" : "text-red-600"}`}>
                {sharedImages.nonCosmetic ? "✓ Loaded" : "✗ Missing"}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Distributed to Forms:</div>
              <div className="space-y-1">
                {['footPushOut', 'shearTestSideSnap', 'pullTestCleat', 'heatSoak', 'sidesnap'].map(formKey => {
                  const form = forms[formKey as keyof FormsState];
                  const hasImages = form.rows.some((row: any) => row.partPicture || row.prePhoto || row.postPhoto);
                  return (
                    <div key={formKey} className="flex justify-between">
                      <span>{form.testName}:</span>
                      <span className={hasImages ? "text-green-600" : "text-gray-400"}>
                        {hasImages ? "✓" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}