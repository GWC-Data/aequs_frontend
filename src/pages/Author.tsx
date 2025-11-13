import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Camera, Download } from "lucide-react";

const REFERENCE_IMAGE_PATH = "/assets/yellow.png";

export default function TestFormWithCropper() {
  const [formData, setFormData] = useState({
    testName: "Heat Soak",
    frs: "",
    moduleNumber: "099-95562 N199 & Q80-1654",
    testCondition: "65°C/90%RH",
    date: "",
    failureCriteria: "Any sample with corrosion spot ≥250 μm",
    testStage: "After Assy",
    project: "Light Blue",
    sampleQty: "32",
  });

  const [cosmeticImage, setCosmeticImage] = useState(null);
  const [nonCosmeticImage, setNonCosmeticImage] = useState(null);
  const [cvLoaded, setCvLoaded] = useState(false);
  const [regions, setRegions] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [showCroppedPreview, setShowCroppedPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imageFormat] = useState("png");
  const [imageQuality] = useState(1.0);

  // Table state for cosmetic inspection
  const [tableRows, setTableRows] = useState([
    { 
      id: 1, 
      srNo: 1, 
      sampleId: "", 
      startDate: "", 
      endDate: "", 
      t0Cosmetic: null, 
      t0NonCosmetic: null, 
      t168Cosmetic: null, 
      t168NonCosmetic: null, 
      status: "Pass" 
    },
    { 
      id: 2, 
      srNo: 2, 
      sampleId: "", 
      startDate: "", 
      endDate: "", 
      t0Cosmetic: null, 
      t0NonCosmetic: null, 
      t168Cosmetic: null, 
      t168NonCosmetic: null, 
      status: "" 
    },
  ]);

  // Load OpenCV
  useEffect(() => {
    // Check if OpenCV is already loaded
    if (window.cv && window.cv.Mat) {
      console.log("✅ OpenCV.js already loaded");
      setCvLoaded(true);
      loadReferenceImage();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="opencv.js"]');
    if (existingScript) {
      existingScript.onload = () => {
        if (window.cv && window.cv.onRuntimeInitialized) {
          window.cv.onRuntimeInitialized = () => {
            console.log("✅ OpenCV.js loaded");
            setCvLoaded(true);
            loadReferenceImage();
          };
        }
      };
      return;
    }

    // Load new script
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;
    script.id = "opencv-script";
    script.onload = () => {
      if (window.cv) {
        window.cv.onRuntimeInitialized = () => {
          console.log("✅ OpenCV.js loaded");
          setCvLoaded(true);
          loadReferenceImage();
        };
      }
    };
    script.onerror = () => {
      console.error("Failed to load OpenCV.js");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: Don't remove script as it might be used by other instances
      // Just clear the callback
      if (window.cv && window.cv.onRuntimeInitialized) {
        window.cv.onRuntimeInitialized = null;
      }
    };
  }, []);

  const loadReferenceImage = () => {
    if (!window.cv || !window.cv.Mat) {
      console.warn("OpenCV not ready yet");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const cv = window.cv;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
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
        console.log(`✅ Loaded ${boxes.length} regions from template`);

        src.delete(); hsv.delete(); mask.delete(); lower.delete(); upper.delete();
        contours.delete(); hierarchy.delete();
      } catch (err) {
        console.error("Error processing reference:", err);
      }
    };
    img.onerror = () => {
      console.warn("Could not load reference image from:", REFERENCE_IMAGE_PATH);
      console.info("You can still manually upload and process images");
    };
    img.src = REFERENCE_IMAGE_PATH;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (id, field, value) => {
    setTableRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const processNonCosmeticImage = (file) => {
    if (!regions.length || !cvLoaded) {
      alert("Template not loaded yet. Please wait...");
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
          ctx.drawImage(img, 0, 0);
          
          const src = cv.imread(canvas);
          const newCroppedImages = [];
          
          regions.forEach((rect, i) => {
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
              const cropCtx = cropCanvas.getContext("2d", { alpha: true });
              cropCtx.imageSmoothingEnabled = false;
              
              cv.imshow(cropCanvas, roi);
              
              const croppedData = cropCanvas.toDataURL(imageFormat === "png" ? "image/png" : "image/jpeg", imageQuality);
              
              newCroppedImages.push({
                id: i,
                data: croppedData,
                name: `region_${i + 1}.${imageFormat}`,
                width, height
              });
              
              roi.delete();
            } catch (err) {
              console.error(`Error cropping region ${i}:`, err);
            }
          });

          setCroppedImages(newCroppedImages);
          setShowCroppedPreview(true);
          src.delete();
        } catch (err) {
          console.error("Error processing image:", err);
          alert("Failed to process image");
        } finally {
          setProcessing(false);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (type, file) => {
    if (type === "cosmetic") {
      setCosmeticImage(URL.createObjectURL(file));
    } else {
      setNonCosmeticImage(URL.createObjectURL(file));
      processNonCosmeticImage(file);
    }
  };

  const addTableRow = () => {
    const newId = Math.max(...tableRows.map(r => r.id)) + 1;
    setTableRows([...tableRows, {
      id: newId,
      srNo: tableRows.length + 1,
      sampleId: "",
      startDate: "",
      endDate: "",
      t0Cosmetic: null,
      t0NonCosmetic: null,
      t168Cosmetic: null,
      t168NonCosmetic: null,
      status: ""
    }]);
  };

  const handleCellImageUpload = (rowId, field, file) => {
    const imageUrl = URL.createObjectURL(file);
    handleTableChange(rowId, field, imageUrl);
  };

  const downloadAllCroppedImages = () => {
    croppedImages.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = img.data;
        link.download = img.name;
        link.click();
      }, index * 100);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        
          <h1 className="text-xl font-bold text-center">Test Form - FRS Inspection</h1>

        {/* Form Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Test Name</label>
              <input
                name="testName"
                value={formData.testName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Heat Soak"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">FRS</label>
              <input
                name="frs"
                value={formData.frs}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Module Number</label>
              <input
                name="moduleNumber"
                value={formData.moduleNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="099-95562 N199 & Q80-1654"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Test Condition</label>
              <input
                name="testCondition"
                value={formData.testCondition}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="65°C/90%RH"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sample Quantity</label>
              <input
                name="sampleQty"
                value={formData.sampleQty}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="32"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Failure Criteria</label>
              <textarea
                name="failureCriteria"
                value={formData.failureCriteria}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Any sample with corrosion spot ≥250 μm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Test Stage</label>
              <input
                name="testStage"
                value={formData.testStage}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="After Assy"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <input
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Light Blue"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Image Upload Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cosmetic Image Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Upload className="text-blue-600" size={16} />
                </div>
                <h3 className="font-semibold text-gray-800">Cosmetic Image</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Upload a single cosmetic image manually</p>
              
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                {cosmeticImage ? (
                  <div className="relative w-full h-full">
                    <img src={cosmeticImage} alt="Cosmetic" className="w-full h-full object-contain p-2" />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCosmeticImage(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">Click to upload cosmetic image</span>
                    <span className="text-xs text-gray-400 block mt-1">Supports JPG, PNG, etc.</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleFileUpload("cosmetic", e.target.files[0])}
                />
              </label>
            </div>

            {/* Non-Cosmetic Image Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Camera className="text-green-600" size={16} />
                </div>
                <h3 className="font-semibold text-gray-800">Non-Cosmetic Image</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Upload image with yellow labels - will auto-crop into {regions.length} regions
              </p>
              
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors bg-gray-50 relative">
                {processing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <span className="font-semibold">Processing...</span>
                    </div>
                  </div>
                )}
                
                {nonCosmeticImage ? (
                  <div className="relative w-full h-full">
                    <img src={nonCosmeticImage} alt="Non-Cosmetic" className="w-full h-full object-contain p-2" />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNonCosmeticImage(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="mx-auto mb-2 text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">Click to upload non-cosmetic image</span>
                    <span className="text-xs text-gray-400 block mt-1">Auto-cropping enabled</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && handleFileUpload("nonCosmetic", e.target.files[0])}
                  disabled={processing || !cvLoaded}
                />
              </label>
              
              <div className="mt-2 text-xs">
                {!cvLoaded ? (
                  <div className="text-amber-600 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600 mr-1"></div>
                    Loading OpenCV library...
                  </div>
                ) : regions.length > 0 ? (
                  <div className="text-green-600">✅ Template loaded with {regions.length} regions</div>
                ) : (
                  <div className="text-amber-600">⚠️ Template not available, using fallback</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cosmetic Inspection Table */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Cosmetic Inspection</h2>
            <button
              onClick={addTableRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <span className="mr-1">+</span> Add Row
            </button>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold">SR No.</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Sample ID</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">Start Date</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">End Date</th>
                  
                  <th className="border border-gray-300 p-3 text-center font-semibold bg-blue-50" colSpan="2">
                    T0 Pictures
                  </th>
                  
                  <th className="border border-gray-300 p-3 text-center font-semibold bg-green-50" colSpan="2">
                    T168 Pictures
                  </th>
                  
                  <th className="border border-gray-300 p-3 text-left font-semibold">Status</th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-3"></th>
                  <th className="border border-gray-300 p-3"></th>
                  <th className="border border-gray-300 p-3"></th>
                  <th className="border border-gray-300 p-3"></th>
                  
                  <th className="border border-gray-300 p-2 text-center font-medium bg-blue-50 text-blue-700">
                    Cosmetic
                  </th>
                  <th className="border border-gray-300 p-2 text-center font-medium bg-blue-50 text-blue-700">
                    Non-Cosmetic
                  </th>
                  
                  <th className="border border-gray-300 p-2 text-center font-medium bg-green-50 text-green-700">
                    Cosmetic
                  </th>
                  <th className="border border-gray-300 p-2 text-center font-medium bg-green-50 text-green-700">
                    Non-Cosmetic
                  </th>
                  
                  <th className="border border-gray-300 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id} className={row.id % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 p-3 text-center font-medium">{row.srNo}</td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={row.sampleId}
                        onChange={(e) => handleTableChange(row.id, "sampleId", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter sample ID"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="date"
                        value={row.startDate}
                        onChange={(e) => handleTableChange(row.id, "startDate", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="date"
                        value={row.endDate}
                        onChange={(e) => handleTableChange(row.id, "endDate", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    
                    {/* T0 Cosmetic */}
                    <td className="border border-gray-300 p-2">
                      <label className="cursor-pointer flex flex-col items-center">
                        {row.t0Cosmetic ? (
                          <div className="relative">
                            <img src={row.t0Cosmetic} alt="T0 Cosmetic" className="h-16 w-16 object-cover rounded border" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleTableChange(row.id, "t0Cosmetic", null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 transition-colors">
                            <Upload size={20} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleCellImageUpload(row.id, "t0Cosmetic", e.target.files[0])}
                        />
                        <span className="text-xs text-gray-500 mt-1">T0 Cosmetic</span>
                      </label>
                    </td>
                    
                    {/* T0 Non-Cosmetic */}
                    <td className="border border-gray-300 p-2">
                      <label className="cursor-pointer flex flex-col items-center">
                        {row.t0NonCosmetic ? (
                          <div className="relative">
                            <img src={row.t0NonCosmetic} alt="T0 Non-Cosmetic" className="h-16 w-16 object-cover rounded border" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleTableChange(row.id, "t0NonCosmetic", null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 transition-colors">
                            <Upload size={20} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleCellImageUpload(row.id, "t0NonCosmetic", e.target.files[0])}
                        />
                        <span className="text-xs text-gray-500 mt-1">T0 Non-Cosmetic</span>
                      </label>
                    </td>
                    
                    {/* T168 Cosmetic */}
                    <td className="border border-gray-300 p-2">
                      <label className="cursor-pointer flex flex-col items-center">
                        {row.t168Cosmetic ? (
                          <div className="relative">
                            <img src={row.t168Cosmetic} alt="T168 Cosmetic" className="h-16 w-16 object-cover rounded border" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleTableChange(row.id, "t168Cosmetic", null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-green-400 transition-colors">
                            <Upload size={20} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleCellImageUpload(row.id, "t168Cosmetic", e.target.files[0])}
                        />
                        <span className="text-xs text-gray-500 mt-1">T168 Cosmetic</span>
                      </label>
                    </td>
                    
                    {/* T168 Non-Cosmetic */}
                    <td className="border border-gray-300 p-2">
                      <label className="cursor-pointer flex flex-col items-center">
                        {row.t168NonCosmetic ? (
                          <div className="relative">
                            <img src={row.t168NonCosmetic} alt="T168 Non-Cosmetic" className="h-16 w-16 object-cover rounded border" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleTableChange(row.id, "t168NonCosmetic", null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-green-400 transition-colors">
                            <Upload size={20} />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleCellImageUpload(row.id, "t168NonCosmetic", e.target.files[0])}
                        />
                        <span className="text-xs text-gray-500 mt-1">T168 Non-Cosmetic</span>
                      </label>
                    </td>
                    
                    <td className="border border-gray-300 p-2">
                      <select
                        value={row.status}
                        onChange={(e) => handleTableChange(row.id, "status", e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          row.status === "Pass" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : row.status === "Fail"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="">Select Status</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cropped Images Preview Modal */}
        {showCroppedPreview && croppedImages.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-semibold text-gray-800">
                  Auto-Cropped Regions ({croppedImages.length} found)
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadAllCroppedImages}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download All
                  </button>
                  <button
                    onClick={() => setShowCroppedPreview(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {croppedImages.map((img) => (
                    <div key={img.id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                      <div className="text-sm font-medium mb-2 text-center text-gray-700">
                        Region {img.id + 1}
                        <div className="text-xs text-gray-500 mt-1">
                          {img.width}×{img.height}px
                        </div>
                      </div>
                      <img 
                        src={img.data} 
                        alt={`Region ${img.id + 1}`}
                        className="w-full h-32 object-contain border rounded bg-gray-50 mb-2"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = img.data;
                          link.download = img.name;
                          link.click();
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Download size={14} className="mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div> 
            </div>
          </div>
        )}
      </div>
    </div>
  );
}