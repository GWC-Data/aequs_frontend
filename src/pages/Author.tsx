import React, { useState, useEffect } from "react";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";
import HeatSoakForm from "@/components/HeatSoakForm";
import StandardTestForm from '@/components/StandardTestForm';
import TaberAbrasionForm from "@/components/CS17Taber";
import FootSurvivabilityForm from "@/components/FoodSurvivabilityForm";
import HardnessTestForm from "@/components/HardnessTestForm";
import SaltSprayTestForm from "@/components/SaltSprayTestForm";
import SolarExposureForm from "@/components/SolarExposureForm";
import SteelWoolForm from "@/components/SteelWoolForm";
import STSForm from "@/components/STSForm";
import { toast } from "@/components/ui/use-toast";

// Reference image dimensions
const REFERENCE_IMAGE_WIDTH = 480;
const REFERENCE_IMAGE_HEIGHT = 320;

// Predefined regions
const PREDEFINED_REGIONS = [
  { x: 32, y: 20, width: 60, height: 50, label: "F1" },
  { x: 112, y: 20, width: 50, height: 50, label: "Cleat 1" },
  { x: 170, y: 20, width: 50, height: 50, label: "Cleat 2" },
  { x: 228, y: 20, width: 50, height: 50, label: "Cleat 3" },
  { x: 286, y: 20, width: 50, height: 50, label: "Cleat 4" },
  { x: 360, y: 20, width: 60, height: 50, label: "F2" },
  { x: 32, y: 85, width: 55, height: 45, label: "Side snap 1" },
  { x: 370, y: 85, width: 55, height: 45, label: "Side snap 4" },
  { x: 32, y: 210, width: 55, height: 70, label: "F4" },
  { x: 370, y: 210, width: 55, height: 70, label: "F3" },
  { x: 100, y: 250, width: 60, height: 50, label: "Side snap 2" },
  { x: 280, y: 250, width: 60, height: 50, label: "Side snap 3" },
];

// Enhanced OCR simulation
const detectLabelText = (imageData: string, regionId: number, regions: any[], hasYellowMarks: boolean): string => {
  if (hasYellowMarks) {
    const sortedRegions = [...regions].sort((a, b) => {
      if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
      return a.x - b.x;
    });

    const sortedIndex = sortedRegions.findIndex(region =>
      region.x === regions[regionId].x && region.y === regions[regionId].y
    );

    const labels = [
      "F1", "Cleat 1", "Cleat 2", "Cleat 3", "Cleat 4", "F2",
      "Side snap 1", "Side snap 4", "F4", "F3",
      "Side snap 2", "Side snap 3"
    ];

    return labels[sortedIndex] || `Region ${sortedIndex + 1}`;
  } else {
    const manualLabels = [
      "F1", "Cleat 1", "Cleat 2", "Cleat 3", "Cleat 4", "F2",
      "Side snap 1", "Side snap 4", "F4", "F3",
      "Side snap 2", "Side snap 3"
    ];
    return manualLabels[regionId] || `Region ${regionId + 1}`;
  }
};

// Enhanced label to form mapping
const getLabelCategory = (label: string) => {
  if (!label) return null;

  const lower = label.toLowerCase().trim();

  // Foot Push Out mapping
  if (lower.includes('f1') || lower.includes('f2') || lower.includes('f3') || lower.includes('f4')) {
    return { form: 'footPushOut', id: label.toUpperCase().replace('F', 'F') };
  }

  // Pull Test Cleat mapping
  if (lower.includes('cleat') || lower.includes('clear')) {
    const cleanLabel = label.replace(/clear/gi, 'Cleat');
    return { form: 'pullTestCleat', id: cleanLabel };
  }

  // Side Snap mapping
  if (lower.includes('side snap') || lower.includes('sidesnap')) {
    return { form: 'sidesnap', id: label };
  }

  return null;
};

// Types
interface Stage2Record {
  testName: string[];
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  sampleQty: string;
  testStartDate: string;
  testCompletionDate: string;
  sampleConfig: string;
  testCondition: string;
  status: string;
  id: number;
  createdAt: string;
  stage2: {
    processStage: string;
    type: string;
    testName: string;
    testCondition: string;
    requiredQty: string;
    equipment: string;
    submittedAt: string;
  };
  forms?: any;
  completedTests?: string[];
}

interface FormRow {
  id: number;
  srNo: number;
  [key: string]: unknown;
}

// interface FormData {
//   testName: string;
//   ers: string;
//   partNumber?: string;
//   machineName?: string;
//   testCondition: string;
//   roomTemp?: string;
//   date: string;
//   passCriteria?: string;
//   failureCriteria?: string[];
//   testStage: string;
//   project: string;
//   sampleQty: string;
//   rows: FormRow[];
// }

interface FormData {
  // Common required fields
  testName: string;
  ers: string;
  testCondition: string;
  date: string;
  testStage: string;
  project: string;
  sampleQty: string;
  rows: FormRow[];

  // Allow any additional string properties
  [key: string]: any;
}

interface FormsState {
  [key: string]: FormData;
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
  testType: 'heatSoak' | 'standard' | 'taberAbrasion' | 'footSurvivability' | 'hardness' | 'saltSpray' | 'solarExposure' | 'steelWool' | 'sts';
}


// Test configuration
const TEST_CONFIG = {
  heatSoak: {
    formType: 'heatSoak' as const,
    displayName: 'Heat Soak',
    fields: ['testName', 'ers', 'testCondition', 'date', 'failureCriteria', 'testStage', 'project', 'sampleQty']
  },
  standard: {
    formType: 'standard' as const,
    displayName: 'Standard Test',
    fields: ['testName', 'ers', 'partNumber', 'machineName', 'testCondition', 'roomTemp', 'date', 'passCriteria', 'testStage', 'project', 'sampleQty']
  }
};

// All available stages
const ALL_STAGES: Stage[] = [
  { id: 0, name: "Image Upload", icon: Upload, testType: 'standard' },
];

declare global {
  interface Window {
    cv: any;
  }
};


// Test name to component mapping
const testNameToType = (testName: string): Stage['testType'] => {
  const name = testName.toLowerCase();

  if (name.includes('heat soak')) return 'heatSoak';
  if (name.includes('taber') || name.includes('abrasion')) return 'taberAbrasion';
  if (name.includes('foot') && name.includes('survivability')) return 'footSurvivability';
  if (name.includes('hardness')) return 'hardness';
  if (name.includes('salt') && name.includes('spray')) return 'saltSpray';
  if (name.includes('solar') && name.includes('exposure')) return 'solarExposure';
  if (name.includes('steel') && name.includes('wool')) return 'steelWool';
  if (name.includes('sts') || (name.includes('short') && name.includes('term') && name.includes('survivability'))) return 'sts';

  return 'standard'; // default fallback
};

// Component mapping
const formComponents = {
  heatSoak: HeatSoakForm,
  standard: StandardTestForm,
  taberAbrasion: TaberAbrasionForm,
  footSurvivability: FootSurvivabilityForm,
  hardness: HardnessTestForm,
  saltSpray: SaltSprayTestForm,
  solarExposure: SolarExposureForm,
  steelWool: SteelWoolForm,
  sts: STSForm
};

export default function MultiStageTestForm() {
  const [currentStage, setCurrentStage] = useState(0);
  const [cvLoaded, setCvLoaded] = useState(false);
  const [regions, setRegions] = useState<unknown[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [hasYellowMarks, setHasYellowMarks] = useState<boolean | null>(null);
  const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Stage2Record | null>(null);
  const [dynamicStages, setDynamicStages] = useState<Stage[]>([]);
  const [selectedTestToResume, setSelectedTestToResume] = useState<string>("");
  const [availableTestsToResume, setAvailableTestsToResume] = useState<{ recordId: number, testName: string, formKey: string, completed: boolean }[]>([]);

  // Shared images across all forms
  const [sharedImages, setSharedImages] = useState({
    cosmetic: null as string | null,
    nonCosmetic: null as string | null
  });

  // Cropped regions with detected labels
  const [croppedRegions, setCroppedRegions] = useState<CroppedRegion[]>([]);

  // Form data for all forms
  const [forms, setForms] = useState<FormsState>({});

  // Load stage2Records from localStorage and initialize forms
  // useEffect(() => {
  //   const storedRecords = localStorage.getItem("stage2Records");
  //   if (storedRecords) {
  //     try {
  //       const records: Stage2Record[] = JSON.parse(storedRecords);
  //       setStage2Records(records);

  //       // Prepare available tests for resume dropdown
  //       const testsToResume: { recordId: number, testName: string, formKey: string, completed: boolean }[] = [];

  //       records.forEach(record => {
  //         if (record.forms) {
  //           Object.keys(record.forms).forEach(formKey => {
  //             const formData = record.forms[formKey];
  //             const isCompleted = record.completedTests?.includes(formKey) || false;
  //             testsToResume.push({
  //               recordId: record.id,
  //               testName: formData.testName,
  //               formKey: formKey,
  //               completed: isCompleted
  //             });
  //           });
  //         }
  //       });

  //       setAvailableTestsToResume(testsToResume);

  //       if (records.length > 0) {
  //         const latestRecord = records[records.length - 1];
  //         setCurrentRecord(latestRecord);

  //         // Parse test names from stage2.testName
  //         const testNames = latestRecord.stage2.testName
  //           .split(',')
  //           .map(name => name.trim())
  //           .filter(name => name.length > 0);

  //         // Create dynamic stages based on test names
  //         const newStages: Stage[] = [];
  //         const newForms: FormsState = {};
  //         const testSelections: string[] = [];

  //         testNames.forEach((testName, index) => {
  //           const isHeatSoak = testName.toLowerCase().includes('heat soak');
  //           const formType = isHeatSoak ? 'heatSoak' : 'standard';
  //           const formKey = `test_${index}`;

  //           testSelections.push(formKey);

  //           // Create stage
  //           newStages.push({
  //             id: index + 1,
  //             name: testName,
  //             icon: CheckCircle,
  //             formKey: formKey,
  //             testType: formType
  //           });

  //           // Initialize form data
  //           if (isHeatSoak) {
  //             newForms[formKey] = {
  //               testName: testName,
  //               ers: latestRecord.stage2.processStage || "",
  //               testCondition: latestRecord.stage2.testCondition || "",
  //               date: "",
  //               failureCriteria: [
  //                 "Any sample with corrosion spot ≥250 μm",
  //                 "≥2 corrosion spots of any size",
  //                 "Discoloration grade of C or worse in test"
  //               ],
  //               testStage: latestRecord.stage2.processStage || "After Assy",
  //               project: latestRecord.projectName || "Light Blue",
  //               sampleQty: latestRecord.sampleQty || "32",
  //               rows: [
  //                 {
  //                   id: 1, srNo: 1, sampleId: "", startDate: "", endDate: "",
  //                   t0Cosmetic: null, t0NonCosmetic: null, t168Cosmetic: null,
  //                   t168NonCosmetic: null, status: "Pass"
  //                 }
  //               ]
  //             };
  //           } else {
  //             newForms[formKey] = {
  //               testName: testName,
  //               ers: latestRecord.stage2.processStage || "",
  //               partNumber: "",
  //               machineName: latestRecord.stage2.equipment?.split(',')[index]?.trim(),
  //               testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim(),
  //               roomTemp: "RT",
  //               date: "",
  //               passCriteria: "Data Collection",
  //               testStage: latestRecord.stage2.processStage || "After Assy",
  //               project: latestRecord.projectName || "Light_Blue",
  //               sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
  //               rows: [
  //                 {
  //                   id: 1, srNo: 1, testDate: "", sampleId: "",
  //                   visual: "OK", prePhoto: null, postPhoto: null,
  //                   partPicture: null, criteria: "Data collection",
  //                   observation: "", forceDeflection: "",
  //                   displacement: "", status: "Pass"
  //                 }
  //               ]
  //             };
  //           }
  //         });

  //         setSelectedTests(testSelections);
  //         setDynamicStages(newStages);
  //         setForms(newForms);
  //       }
  //     } catch (error) {
  //       console.error("Error parsing stage2 records:", error);
  //     }
  //   }
  // }, []);


  useEffect(() => {
    const storedRecords = localStorage.getItem("stage2Records");
    if (storedRecords) {
      try {
        const records: Stage2Record[] = JSON.parse(storedRecords);
        setStage2Records(records);

        // Prepare available tests for resume dropdown
        const testsToResume: { recordId: number, testName: string, formKey: string, completed: boolean, testType: string }[] = [];

        records.forEach(record => {
          if (record.forms) {
            Object.keys(record.forms).forEach(formKey => {
              const formData = record.forms[formKey];
              const isCompleted = record.completedTests?.includes(formKey) || false;
              const testType = testNameToType(formData.testName);

              testsToResume.push({
                recordId: record.id,
                testName: formData.testName,
                formKey: formKey,
                completed: isCompleted,
                testType: testType
              });
            });
          }
        });

        setAvailableTestsToResume(testsToResume);

        if (records.length > 0) {
          const latestRecord = records[records.length - 1];
          setCurrentRecord(latestRecord);

          // Parse test names from stage2.testName
          const testNames = latestRecord.stage2.testName
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);

          // Create dynamic stages based on test names
          const newStages: Stage[] = [];
          const newForms: FormsState = {};
          const testSelections: string[] = [];

          testNames.forEach((testName, index) => {
            const testType = testNameToType(testName);
            const formKey = `test_${index}`;

            testSelections.push(formKey);

            // Create stage
            newStages.push({
              id: index + 1,
              name: testName,
              icon: CheckCircle,
              formKey: formKey,
              testType: testType
            });

            // Initialize form data based on test type
            switch (testType) {
              case 'heatSoak':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  testCondition: latestRecord.stage2.testCondition || "",
                  date: "",
                  failureCriteria: [
                    "Any sample with corrosion spot ≥250 μm",
                    "≥2 corrosion spots of any size",
                    "Discoloration grade of C or worse in test"
                  ],
                  testStage: latestRecord.stage2.processStage || "After Assy",
                  project: latestRecord.projectName || "Light Blue",
                  sampleQty: latestRecord.sampleQty || "32",
                  rows: [
                    {
                      id: 1, srNo: 1, sampleId: "", startDate: "", endDate: "",
                      t0Cosmetic: null, t0NonCosmetic: null, t168Cosmetic: null,
                      t168NonCosmetic: null, status: "Pass"
                    }
                  ]
                };
                break;

              case 'taberAbrasion':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  machineName: latestRecord.stage2.equipment?.split(',')[index]?.trim() || "",
                  failureCriteria: "1-10 cycles > 4, 25-200 cycles > 5",
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                  testStage: latestRecord.stage2.processStage || "After Assy", // Add this line
                  project: latestRecord.projectName || "Light Blue",
                  date: "",
                  testLocation: "",
                  weight: "1000g",
                  cycleSpeed: "25 cycles/min",
                  strokeLength: "1 inch",
                  wearaserType: "",
                  sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  rows: [
                    {
                      id: 1, srNo: 1, testDate: "", config: "", sampleId: "",
                      wearaserRefaced: "", cycleCount: "", visualGrade: "",
                      postTestImage: null, status: ""
                    }
                  ]
                };
                break;
              case 'footSurvivability':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  failureCriteria: "",
                  testStage: latestRecord.stage2.processStage || "After Assy",
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                  project: latestRecord.projectName || "Light Blue",
                  sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  date: "",
                  rows: [
                    {
                      id: 1, srNo: 1, testDate: "", sampleId: "", visual: "",
                      t0Picture: "", afterHeatSoakCosmetic: "", afterHeatSoakNonCosmetic: "",
                      afterFootSurvivabilityCosmetic: "", afterFootSurvivabilityNonCosmetic: "",
                      cosmeticInspectionPreTest: "", cosmeticInspectionPostTest: "", status: ""
                    }
                  ]
                };
                break;

              case 'hardness':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  failureCriteria: "",
                  testStage: latestRecord.stage2.processStage || "After Assy",
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                  project: latestRecord.projectName || "Light Blue",
                  date: "",
                  sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  rows: [
                    {
                      id: 1, srNo: 1, sampleId: "", testDate: "", scale: "",
                      hardness: "", status: ""
                    }
                  ]
                };
                break;

              case 'saltSpray':
                newForms[formKey] = {
                  testDescription: testName,
                  testLocation: "",
                  projectName: latestRecord.projectName || "Light Blue",
                  color: "",
                  sampleSize: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  testStartDate: "",
                  testCompletionDate: "",
                  sampleConfig: "",
                  reportFileName: "",
                  lastCalibration: "",
                  nextCalibration: "",
                  chamberCleanliness: "",
                  lastChamberCleaning: "",
                  fixtureDescription: "",
                  chamberSalinity: "",
                  chamberPH: "",
                  chamberTemperature: "",
                  chamberID: "",
                  labTemperature: "",
                  labHumidity: "",
                  consumablesAvailable: "",
                  samplesLabeled: "",
                  procedureReviewed: "",
                  testStage: latestRecord.stage2.processStage || "After Assy", // Add this
                  rows: [
                    {
                      id: 1, srNo: 1, build: "", doeConfig: "", configNotes: "",
                      alloy: "", vendor: "", formFactor: "", sampleNumber: "",
                      testStartDate: "", testStartTime: "", completionDate: "",
                      completionTime: "", saltSprayTime: "", t0Inspection: "",
                      pittingCorrosionCount: "", pittingDiameter: "", seCorrosionCount: "",
                      seCorrosion: "", otherCorrosion: "", discolorationGrading: "",
                      inspectionNotes: "", status: "", enclosurePhotoT0: null,
                      enclosurePhotoT24: null, cosmeticPhotoT0: null, cosmeticPhotoT24: null,
                      preTestInspection: "", postTestInspection: "", photoStatus: ""
                    }
                  ]
                };
                break;
              case 'solarExposure':
                newForms[formKey] = {
                  testDescription: testName,
                  testLocation: "",
                  projectName: latestRecord.projectName || "Light Blue",
                  color: "",
                  sampleSize: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  testStartDate: "",
                  testCompletionDate: "",
                  sampleConfigOverview: "",
                  reportFileName: "",
                  solarExposureChamber: "",
                  chamberTypeModel: "",
                  lastCalibrationDate: "",
                  nextCalibrationDate: "",
                  lampAge: "",
                  innerFilterAge: "",
                  outerFilterAge: "",
                  filterCombination: "",
                  irradianceProfile: "",
                  blackPanelTemp: "",
                  chamberTemp: "",
                  chamberHumidity: "",
                  waterSpray: "",
                  sourceToSampleDistance: "",
                  samplesLabeled: "",
                  procedureAvailable: "",
                  samplesInspected: "",
                  t0ColorMeasured: "",
                  rows: [
                    {
                      id: 1, srNo: 1, lineNo: 1, partVendor: "", measurementDate: "", week: "",
                      colorMaterialConfig: "", uniqueSampleId: "", measurementRegion: "",
                      testLocation: "", labTempT0: "", labRhT0: "", stdLF2: "",
                      stdAF2: "", stdBF2: "", testCheckpoint: "", labTempCP: "",
                      labRhCP: "", stdLF2CP: "", stdAF2CP: "", stdBF2CP: "",
                      cF2: "", hF2: "", dL: "", dA: "", dB: "", de94: "",
                      dC: "", dH: "", cStd: "", hStd: ""
                    }
                  ]
                };
                break;

              case 'steelWool':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  failureCriteria: "",
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                  machineName: latestRecord.stage2.equipment?.split(',')[index]?.trim() || "",
                  project: latestRecord.projectName || "Light Blue",
                  loadCheckpoint: "75, 125, 250, 500, 1000 grams",
                  rows: [
                    {
                      id: 1, srNo: 1, date: "", config: "", sampleId: "",
                      cycleCount: "", visualGrade: "", postTestImage: "", status: ""
                    }
                  ]
                };
                break;

              case 'sts':
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                  checkpoints: "",
                  date: "",
                  failureCriteria: "- Any sample with corrosion spot ≥250 μm\n- #>2 corrosion spots of any size\n- Discoloration grade of C or worse in test",
                  testStage: latestRecord.stage2.processStage || "After Assy",
                  project: latestRecord.projectName || "Light Blue",
                  sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  testLocation: "",
                  color: "",
                  sampleConfig: "",
                  rows: [
                    {
                      id: 1, srNo: 1, sampleId: "", testDate: "", beforeTestCosmetic: null,
                      beforeTestNonCosmetic: null, afterTestCosmetic: null, afterTestNonCosmetic: null,
                      preTestInspection: "", postTestInspection: "", status: ""
                    }
                  ]
                };
                break;

              default: // standard
                newForms[formKey] = {
                  testName: testName,
                  ers: latestRecord.stage2.processStage || "",
                  partNumber: "",
                  machineName: latestRecord.stage2.equipment?.split(',')[index]?.trim(),
                  testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim(),
                  roomTemp: "RT",
                  date: "",
                  passCriteria: "Data Collection",
                  testStage: latestRecord.stage2.processStage || "After Assy",
                  project: latestRecord.projectName || "Light_Blue",
                  sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                  rows: [
                    {
                      id: 1, srNo: 1, testDate: "", sampleId: "",
                      visual: "OK", prePhoto: null, postPhoto: null,
                      partPicture: null, criteria: "Data collection",
                      observation: "", forceDeflection: "",
                      displacement: "", status: "Pass"
                    }
                  ]
                };
            }
          });

          setSelectedTests(testSelections);
          setDynamicStages(newStages);
          setForms(newForms);
        }
      } catch (error) {
        console.error("Error parsing stage2 records:", error);
      }
    }
  }, []);

  // Handle test resume selection
  const handleTestResume = (testInfo: string) => {
    setSelectedTestToResume(testInfo);

    if (!testInfo) return;

    const [recordId, formKey] = testInfo.split('|');
    const record = stage2Records.find(r => r.id === parseInt(recordId));

    if (record && record.forms && record.forms[formKey]) {
      // Find the stage index for this form
      const stageIndex = dynamicStages.findIndex(stage => stage.formKey === formKey);

      if (stageIndex !== -1) {
        // Set current stage to the selected test
        setCurrentStage(stageIndex + 1); // +1 because stage 0 is image upload

        toast({
          title: "Test Resumed",
          description: `Continuing from ${record.forms[formKey].testName}`,
          duration: 3000,
        });
      }
    }
  };

  // Filter stages based on selected tests
  const filteredStages = React.useMemo(() => {
    const imageUploadStage = ALL_STAGES[0];
    const formStages = dynamicStages.filter(stage =>
      stage.formKey && selectedTests.includes(stage.formKey)
    );
    return [imageUploadStage, ...formStages];
  }, [selectedTests, dynamicStages]);

  // Get current stage data
  const currentStageData = filteredStages[currentStage];

  // Load OpenCV (same as before)
  useEffect(() => {
    if (window.cv && window.cv.Mat) {
      setCvLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="opencv.js"]');
    if (existingScript) {
      existingScript.onload = () => {
        if (window.cv && window.cv.onRuntimeInitialized) {
          window.cv.onRuntimeInitialized = () => {
            setCvLoaded(true);
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
        };
      }
    };
    document.body.appendChild(script);
  }, []);

  // Image processing functions (same as before)
  const detectYellowMarks = (src: any): boolean => {
    try {
      const cv = window.cv;
      const hsv = new cv.Mat();
      cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
      cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

      const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [20, 100, 100, 0]);
      const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [40, 255, 255, 255]);
      const mask = new cv.Mat();
      cv.inRange(hsv, lower, upper, mask);

      const yellowPixels = cv.countNonZero(mask);
      const totalPixels = mask.rows * mask.cols;
      const yellowRatio = yellowPixels / totalPixels;

      hsv.delete(); mask.delete(); lower.delete(); upper.delete();

      return yellowRatio > 0.01;
    } catch (error) {
      console.error("Error detecting yellow marks:", error);
      return false;
    }
  };

  const processImageWithYellowMarks = (src: any, img: HTMLImageElement) => {
    const cv = window.cv;
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

    const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [15, 80, 80, 0]);
    const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [45, 255, 255, 255]);
    const mask = new cv.Mat();
    cv.inRange(hsv, lower, upper, mask);

    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let detectedRegions: any[] = [];
    const minArea = 300;
    const maxArea = 50000;

    for (let i = 0; i < contours.size(); ++i) {
      const rect = cv.boundingRect(contours.get(i));
      const area = rect.width * rect.height;
      const aspectRatio = rect.width / rect.height;
      if (area >= minArea && area <= maxArea && aspectRatio > 0.5 && aspectRatio < 5) {
        detectedRegions.push(rect);
      }
    }

    detectedRegions.sort((a, b) => {
      const rowTolerance = 30;
      if (Math.abs(a.y - b.y) > rowTolerance) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

    hsv.delete();
    mask.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();

    return detectedRegions;
  };

  const processImageWithoutYellowMarks = (src: any, img: HTMLImageElement) => {
    const scaleX = img.width / REFERENCE_IMAGE_WIDTH;
    const scaleY = img.height / REFERENCE_IMAGE_HEIGHT;

    console.log(`Image dimensions: ${img.width}x${img.height}`);
    console.log(`Scale factors: X=${scaleX.toFixed(2)}, Y=${scaleY.toFixed(2)}`);

    const scaledRegions = PREDEFINED_REGIONS.map(region => ({
      x: Math.round(region.x * scaleX),
      y: Math.round(region.y * scaleY),
      width: Math.round(region.width * scaleX),
      height: Math.round(region.height * scaleY),
      label: region.label
    }));

    console.log("Scaled regions:", scaledRegions);
    return scaledRegions;
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
      img.onload = async () => {
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

          const srcForDetection = cv.imread(canvas);
          const hasMarks = detectYellowMarks(srcForDetection);
          srcForDetection.delete();
          setHasYellowMarks(hasMarks);

          console.log(`Image has yellow marks: ${hasMarks}`);

          let detectedRegions: any[] = [];

          if (hasMarks) {
            detectedRegions = processImageWithYellowMarks(src, img);
          } else {
            detectedRegions = processImageWithoutYellowMarks(src, img);
          }

          console.log("Detected regions:", detectedRegions);

          const croppedImages: CroppedRegion[] = [];
          detectedRegions.forEach((rect, i) => {
            try {
              const x = Math.max(0, Math.min(rect.x, src.cols - 1));
              const y = Math.max(0, Math.min(rect.y, src.rows - 1));
              const width = Math.min(rect.width, src.cols - x);
              const height = Math.min(rect.height, src.rows - y);

              if (width <= 0 || height <= 0) {
                console.warn(`Invalid dimensions for region ${i}: ${width}x${height}`);
                return;
              }

              const validRect = new cv.Rect(x, y, width, height);
              const roi = src.roi(validRect);

              const cropCanvas = document.createElement("canvas");
              cropCanvas.width = width;
              cropCanvas.height = height;
              cv.imshow(cropCanvas, roi);

              const croppedData = cropCanvas.toDataURL("image/png", 1.0);

              const detectedLabel = hasMarks
                ? detectLabelText(croppedData, i, detectedRegions, true)
                : rect.label;

              const category = getLabelCategory(detectedLabel);

              croppedImages.push({
                id: i,
                data: croppedData,
                label: detectedLabel,
                category: category,
                rect: { x, y, width, height }
              });

              console.log(`Region ${i}: ${detectedLabel} → ${category?.form} (${x},${y} ${width}x${height})`);

              roi.delete();
            } catch (err) {
              console.error(`Error cropping region ${i}:`, err);
            }
          });

          setCroppedRegions(croppedImages);
          distributeImagesToForms(croppedImages);

          src.delete();
        } catch (err) {
          console.error("Error processing image:", err);
          alert("Failed to process image. Please try again.");
        } finally {
          setProcessing(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const distributeImagesToForms = (croppedImages: CroppedRegion[]) => {
    const updatedForms = JSON.parse(JSON.stringify(forms));

    console.log("Starting image distribution with:", croppedImages);

    let distributionCount = 0;

    // Clear existing part pictures
    Object.keys(updatedForms).forEach(formKey => {
      updatedForms[formKey].rows.forEach((row: any) => {
        row.partPicture = null;
      });
    });

    croppedImages.forEach(region => {
      if (!region.category) {
        console.log("No category found for region:", region.label);
        return;
      }

      const { form, id } = region.category;

      // Find which form key contains this test type
      const targetFormKey = Object.keys(updatedForms).find(key =>
        updatedForms[key].testName.toLowerCase().includes(form.toLowerCase())
      );

      if (!targetFormKey) {
        console.log("Form not found for:", form);
        return;
      }

      const formData = updatedForms[targetFormKey];

      console.log(`Attempting to distribute ${region.label} to ${targetFormKey} form`);

      // Find matching row
      let matched = false;
      formData.rows.forEach((row: any) => {
        const rowId = row.footNumber || row.cleatNumber || row.sideSnapNumber;

        if (rowId) {
          const normalizedRowId = rowId.toString().toLowerCase().replace(/\s+/g, ' ').trim();
          const normalizedRegionId = id.toString().toLowerCase().replace(/\s+/g, ' ').trim();

          console.log(`Comparing: "${normalizedRowId}" with "${normalizedRegionId}"`);

          if (normalizedRowId === normalizedRegionId ||
            normalizedRegionId.includes(normalizedRowId) ||
            normalizedRowId.includes(normalizedRegionId.replace('cleat', 'clear')) ||
            normalizedRowId.includes(normalizedRegionId.replace('clear', 'cleat'))) {

            console.log(`✓ MATCHED: ${region.label} with row ${rowId}`);
            row.partPicture = region.data;
            matched = true;
            distributionCount++;
          }
        }
      });

      if (!matched) {
        console.log(`✗ NO MATCH: ${region.label} in ${targetFormKey}`);
      }
    });

    console.log(`Distribution complete: ${distributionCount} images assigned`);
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
      updatedForms[formKey].rows.forEach((row: any) => {
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

  const updateFormField = (formKey: string, field: string, value: string) => {
    setForms(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], [field]: value }
    }));
  };

  const updateRowField = (formKey: string, rowId: number, field: string, value: string) => {
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

  const addRow = (formKey: string) => {
    setForms(prev => {
      const currentForm = prev[formKey];
      const newId = Math.max(...currentForm.rows.map((r: any) => r.id)) + 1;
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

  const handleSubmit = () => {
    try {
      const storedData = localStorage.getItem("stage2Records");
      const records = storedData ? JSON.parse(storedData) : [];

      if (records.length > 0 && currentRecord) {
        const currentRecordIndex = records.findIndex((r: Stage2Record) => r.id === currentRecord.id);

        if (currentRecordIndex !== -1) {
          // Mark all tests as completed
          const completedTests = Object.keys(forms);

          const updatedRecord = {
            ...currentRecord,
            forms: forms,
            status: "Completed",
            completedAt: new Date().toISOString(),
            sharedImages: sharedImages,
            sampleQty: calculateTotalSampleQty(),
            testCompletionDate: new Date().toISOString().split('T')[0],
            completedTests: completedTests
          };

          records[currentRecordIndex] = updatedRecord;
          localStorage.setItem("stage2Records", JSON.stringify(records));

          toast({
            title: "✅ All Forms Completed!",
            description: `Record ${currentRecord.documentNumber} has been saved successfully`,
            duration: 6000,
          });

          console.log("Final Form Data:", updatedRecord);
        } else {
          toast({
            variant: "destructive",
            title: "Record Not Found",
            description: "Current record not found in storage",
            duration: 3000,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "No Test Record Found",
          description: "Please start a new test before submitting forms",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving the test data. Please try again.",
        duration: 3000,
      });
      console.error("Error submitting forms:", error);
    }
  };

  const calculateTotalSampleQty = (): string => {
    let total = 0;
    Object.keys(forms).forEach(formKey => {
      const form = forms[formKey];
      if (form && form.sampleQty) {
        total += parseInt(form.sampleQty.toString()) || 0;
      }
    });
    return total.toString();
  };

  const renderImageUploadStage = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Upload Images</h2>

      {/* Current Record Info */}
      {currentRecord && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Current Test Record:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Document:</span>
              <div className="font-semibold">{currentRecord.documentNumber}</div>
            </div>
            <div>
              <span className="text-gray-600">Project:</span>
              <div className="font-semibold">{currentRecord.projectName}</div>
            </div>
            <div>
              <span className="text-gray-600">Process Stage:</span>
              <div className="font-semibold">{currentRecord.stage2.processStage}</div>
            </div>
            <div>
              <span className="text-gray-600">Total Tests:</span>
              <div className="font-semibold">{dynamicStages.length}</div>
            </div>
          </div>
        </div>
      )}

      {dynamicStages.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Tests to Complete:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {dynamicStages.map((stage, index) => {
              const getTestTypeColor = (testType: Stage['testType']) => {
                const colors = {
                  heatSoak: 'bg-orange-500',
                  standard: 'bg-blue-500',
                  taberAbrasion: 'bg-purple-500',
                  footSurvivability: 'bg-indigo-500',
                  hardness: 'bg-pink-500',
                  saltSpray: 'bg-red-500',
                  solarExposure: 'bg-yellow-500',
                  steelWool: 'bg-gray-500',
                  sts: 'bg-teal-500'
                };
                return colors[testType] || 'bg-blue-500';
              };

              const getTestTypeText = (testType: Stage['testType']) => {
                const names = {
                  heatSoak: 'Heat Soak',
                  standard: 'Standard',
                  taberAbrasion: 'Taber Abrasion',
                  footSurvivability: 'Foot Survivability',
                  hardness: 'Hardness',
                  saltSpray: 'Salt Spray',
                  solarExposure: 'Solar Exposure',
                  steelWool: 'Steel Wool',
                  sts: 'STS'
                };
                return names[testType] || 'Standard';
              };

              return (
                <div key={stage.id} className="flex items-center p-2 bg-white rounded border">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getTestTypeColor(stage.testType)}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {stage.name}
                    <span className={`text-xs ml-2 ${getTestTypeColor(stage.testType).replace('bg-', 'text-')}`}>
                      ({getTestTypeText(stage.testType)})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of the image upload UI remains the same */}
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
              <p className="text-xs text-gray-500">
                {hasYellowMarks
                  ? "Post-Photo + Auto-crop yellow regions"
                  : "Post-Photo + Crop using reference coordinates"
                }
              </p>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center h-48 cursor-pointer border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors bg-green-50 relative">
            {processing && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
                  <span className="font-semibold">
                    {hasYellowMarks !== null
                      ? (hasYellowMarks ? "Detecting yellow regions..." : "Applying reference coordinates...")
                      : "Analyzing image..."
                    }
                  </span>
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
                    setHasYellowMarks(null);
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
                <span className="text-xs text-gray-500 block mt-2">
                  {hasYellowMarks === null
                    ? "Supports images with or without yellow labels"
                    : hasYellowMarks
                      ? "Yellow marks detected"
                      : "Using reference coordinates"
                  }
                </span>
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
              <div className="text-green-600 flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Ready to process
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cropped Regions Preview */}
      {
        croppedRegions.length > 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle className="text-green-600 mr-2" size={20} />
              Detected Regions ({croppedRegions.length})
              <span className="text-sm font-normal text-gray-600 ml-2">
                {hasYellowMarks ? '(Auto-detected from yellow marks)' : '(Using reference image coordinates)'}
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {croppedRegions.map((region) => (
                <div key={region.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
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
        )
      }

      <div className="flex justify-end mt-8">
        <button
          onClick={() => setCurrentStage(1)}
          disabled={!sharedImages.cosmetic || !sharedImages.nonCosmetic || dynamicStages.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center font-semibold transition-colors"
        >
          Continue to Forms
          <ChevronRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );

  // const renderCurrentForm = () => {
  //   if (!currentStageData?.formKey) return null;

  //   const formKey = currentStageData.formKey;
  //   const formData = forms[formKey];
  //   const testType = currentStageData.testType;

  //   if (!formData) return null;

  //   if (testType === 'heatSoak') {
  //     return (
  //       <HeatSoakForm
  //         formData={formData}
  //         updateFormField={(field, value) => updateFormField(formKey, field, value)}
  //         updateRowField={(rowId, field, value) => updateRowField(formKey, rowId, field, value)}
  //         addRow={() => addRow(formKey)}
  //       />
  //     );
  //   } else {
  //     return (
  //       <StandardTestForm
  //         formData={formData}
  //         updateFormField={(field, value) => updateFormField(formKey, field, value)}
  //         updateRowField={(rowId, field, value) => updateRowField(formKey, rowId, field, value)}
  //         addRow={() => addRow(formKey)}
  //       />
  //     );
  //   }
  // };


  // Updated render function
  const renderCurrentForm = () => {
    if (!currentStageData?.formKey) return null;

    const formKey = currentStageData.formKey;
    const formData = forms[formKey];
    const testType = currentStageData.testType;

    if (!formData) return null;

    const FormComponent = formComponents[testType];

    if (!FormComponent) {
      console.warn(`No form component found for test type: ${testType}`);
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Form Not Available</h3>
          <p className="text-yellow-700">No form component found for test type: {testType}</p>
          <p className="text-yellow-600 text-sm mt-2">Test: {formData.testName || formData.testDescription}</p>
        </div>
      );
    }

    return (
      <FormComponent
        formData={formData}
        updateFormField={(field, value) => updateFormField(formKey, field, value)}
        updateRowField={(rowId, field, value) => updateRowField(formKey, rowId, field, value)}
        addRow={() => addRow(formKey)}
      />
    );
  };

  const isLastStage = currentStage === filteredStages.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* <div className="flex items-center justify-between">
            {filteredStages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setCurrentStage(index)}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentStage === index
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
                  <span className={`ml-2 text-sm font-medium hidden md:block ${currentStage === index ? "text-blue-600" : "text-gray-600"
                    }`}>
                    {stage.name}
                  </span>
                </div>
                {index < filteredStages.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${currentStage > index ? "bg-green-500" : "bg-gray-200"
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div> */}
          <div className="overflow-x-auto" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            <div className="flex items-center min-w-max px-2">
              {filteredStages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div
                    className="flex items-center cursor-pointer flex-shrink-0"
                    onClick={() => setCurrentStage(index)}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${currentStage === index
                      ? "bg-blue-600 text-white"
                      : currentStage > index
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                      }`}>
                      {currentStage > index ? (
                        <CheckCircle size={18} />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`ml-2 text-xs font-medium whitespace-nowrap ${currentStage === index ? "text-blue-600" : "text-gray-600"
                      }`}>
                      {stage.name.length > 20 ? `${stage.name.substring(0, 20)}...` : stage.name}
                    </span>
                  </div>
                  {index < filteredStages.length - 1 && (
                    <div className={`h-1 w-12 mx-3 transition-colors flex-shrink-0 ${currentStage > index ? "bg-green-500" : "bg-gray-200"
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
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
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-semibold transition-colors"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </button>

              {!isLastStage ? (
                <button
                  onClick={() => setCurrentStage(currentStage + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold transition-colors"
                >
                  Next: {filteredStages[currentStage + 1]?.name}
                  <ChevronRight size={20} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-semibold transition-colors"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Complete All Tests
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

