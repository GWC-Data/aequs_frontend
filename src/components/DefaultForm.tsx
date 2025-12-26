import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, Plus, AlertCircle, Image as ImageIcon, Play, Pause, Clock } from "lucide-react";

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
interface AssignedPart {
    id: string;
    partNumber: string;
    serialNumber: string;
    location: string;
    scanStatus: string;
    assignedToTest: string;
}

interface LoadedPart {
    partNumber: string;
    serialNumber: string;
    ticketCode: string;
    testId: string;
    testName: string;
    loadedAt: string;
    scanStatus: string;
    duration: string;
    cosmeticImages?: string[];
    nonCosmeticImages?: string[];
    hasImages?: boolean;
}

interface MachineTest {
    id: string;
    testName: string;
    duration: string;
    status: number;
    statusText: string;
    requiredQty: number;
    allocatedParts: number;
    remainingQty: number;
    alreadyAllocated: number;
}

interface MachineDetails {
    machine: string;
    ticketCode: string;
    project: string;
    build: string;
    colour: string;
    totalTests: number;
    tests: MachineTest[];
    estimatedDuration: number;
}

interface MachineLoadData {
    loadId: number;
    chamber: string;
    parts: LoadedPart[];
    totalParts: number;
    machineDetails: MachineDetails;
    loadedAt: string;
    estimatedCompletion: string;
    duration: number;
    testRecords?: LoadedPart[]; // For backward compatibility
}

interface ChildTest {
    id: string;
    name: string;
    machineEquipment: string;
    timing: string;
    isCompleted: boolean;
    startTime?: string;
    endTime?: string;
    status: 'pending' | 'active' | 'completed';
    dependsOnPrevious?: boolean;
    previousTestId?: string;
    requiresImages?: boolean;
}

interface TestRecord {
    testId: string;
    testName: string;
    processStage: string;
    testIndex: number;
    testCondition: string;
    requiredQuantity: string;
    specification: string;
    machineEquipment: string;
    machineEquipment2: string;
    timing: string;
    startDateTime: string;
    endDateTime: string;
    assignedParts: AssignedPart[];
    assignedPartsCount: number;
    remark: string;
    status: string;
    submittedAt: string;
    testResults?: FormRow[];
    childTests?: ChildTest[];
    currentChildTestIndex?: number;
}

interface Stage2Record {
    id: number;
    submissionId: string;
    ticketId: number;
    ticketCode: string;
    totalQuantity: number;
    anoType: string;
    source: string;
    reason: string;
    project: string;
    build: string;
    colour: string;
    processStage: string;
    selectedTestNames: string[];
    testRecords: TestRecord[];
    formData: any;
    submittedAt: string;
    version: string;
    testingStatus?: string;
    machineLoadData?: MachineLoadData; // New field for machine load data
}

// Enhanced FormRow interface
interface FormRow {
    id: number;
    srNo: number;
    testDate: string;
    config: string;
    sampleId: string;
    status: string;
    partNumber: string;
    serialNumber: string;
    childTestId?: string;
    childTestName?: string;
    cosmeticImage?: string;
    nonCosmeticImage?: string;
    croppedImage?: string;
    regionLabel?: string;
    finalNonCosmeticImage?: string;
    finalCroppedNonCosmeticImage?: string;
    finalCosmeticImage?: string; // NEW: For second round cosmetic image
    cosmeticImages?: string[];
    nonCosmeticImages?: string[];
    croppedImages?: string[];
    finalCosmeticImages?: string[]; // NEW: For second round multiple cosmetic images
    [key: string]: any;
}

// Custom Column interface
interface CustomColumn {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image';
    options?: string[];
}

// Enhanced FormData interface
interface FormData {
    testName: string;
    processStage: string;
    testCondition: string;
    date: string;
    specification: string;
    machineEquipment: string;
    machineEquipment2: string;
    timing: string;
    sampleQty: string;
    rows: FormRow[];
    remark?: string;
    customColumns?: CustomColumn[];
    childTests?: ChildTest[];
    currentChildTestIndex?: number;
    [key: string]: any;
}

interface FormsState {
    [key: string]: FormData;
}

interface SharedImagesByPart {
    [partNumber: string]: {
        cosmetic: string[];
        nonCosmetic: string[];
        childTestImages: {
            [childTestId: string]: {
                cosmetic: string[];
                nonCosmetic: string[];
            };
        };
        finalCosmeticImages?: string[]; // NEW: For second round cosmetic images
        finalNonCosmeticImages?: string[]; // NEW: For second round non-cosmetic images
    };
}

interface CroppedRegion {
    id: number;
    data: string;
    label: string;
    category: any;
    rect: any;
    partNumber?: string;
    childTestId?: string;
    isFinal?: boolean; // NEW: To differentiate final round images
}

// Timer Status Interface
interface TimerStatus {
    remainingSeconds: number;
    isRunning: boolean;
    startTime?: string;
    stopTime?: string;
    lastUpdated?: string;
}

interface TestTimerState {
    [testName: string]: TimerStatus;
}

// DefaultForm Component
interface DefaultFormProps {
    formData: FormData;
    updateFormField: (field: string, value: any) => void;
    updateRowField: (rowId: number, field: string, value: string) => void;
    addRow: (partNumber?: string) => void;
    selectedParts: AssignedPart[];
    checkpointHours: number;
    formKey: string;
    timerState: TimerStatus; // Updated interface
    onTimerToggle: () => void;
    croppedRegions: CroppedRegion[];
    isSecondRound?: boolean;
    currentChildTest?: ChildTest;
    onChildTestComplete: () => void;
    onChildTestChange: (childTestIndex: number) => void;
    machineLoadData?: MachineLoadData;
    loadImagesFromStorage: (partNumber: string) => { cosmeticImages: string[], nonCosmeticImages: string[], finalCosmeticImages?: string[], finalNonCosmeticImages?: string[] };
    projectType?: string; // NEW: To determine project type (Flash, Hulk, etc.)
    handleFinalImageUpload: (partNumber: string, type: 'cosmetic' | 'nonCosmetic', file: File, childTestId?: string) => void; // NEW: For final round uploads
}

function DefaultForm({
    formData,
    updateFormField,
    updateRowField,
    addRow,
    selectedParts,
    checkpointHours,
    formKey,
    timerState,
    onTimerToggle,
    croppedRegions,
    isSecondRound = false,
    currentChildTest,
    onChildTestComplete,
    onChildTestChange,
    machineLoadData,
    loadImagesFromStorage,
    projectType = "", // Default to Flash
    handleFinalImageUpload
}: DefaultFormProps) {
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumn, setNewColumn] = useState({
        label: '',
        type: 'text' as 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image',
        options: [] as string[]
    });
    const [newOption, setNewOption] = useState('');

    // Format time display
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAddColumn = () => {
        if (!newColumn.label.trim()) return;

        const columnId = newColumn.label.trim().toLowerCase().replace(/\s+/g, '_');

        const customColumn: CustomColumn = {
            id: columnId,
            label: newColumn.label.trim(),
            type: newColumn.type,
            options: newColumn.type === 'select' ? newColumn.options : undefined
        };

        const updatedCustomColumns = [...(formData.customColumns || []), customColumn];
        updateFormField('customColumns', updatedCustomColumns);

        formData.rows.forEach(row => {
            updateRowField(row.id, columnId, '');
        });

        setShowAddColumnModal(false);
        setNewColumn({ label: '', type: 'text', options: [] });
        setNewOption('');
    };

    const addOption = () => {
        if (newOption.trim() && !newColumn.options.includes(newOption.trim())) {
            setNewColumn(prev => ({
                ...prev,
                options: [...prev.options, newOption.trim()]
            }));
            setNewOption('');
        }
    };

    const removeOption = (optionToRemove: string) => {
        setNewColumn(prev => ({
            ...prev,
            options: prev.options.filter(opt => opt !== optionToRemove)
        }));
    };

    const removeCustomColumn = (columnId: string) => {
        const updatedColumns = formData.customColumns?.filter(col => col.id !== columnId) || [];
        updateFormField('customColumns', updatedColumns);
    };

    const handleImageUpload = (rowId: number, imageType: 'cosmetic' | 'nonCosmetic', file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fieldName = imageType === 'cosmetic' ? 'cosmeticImage' : 'nonCosmeticImage';
            updateRowField(rowId, fieldName, e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Function to handle final round image uploads
    const handleFinalRoundImageUpload = (rowId: number, partNumber: string, type: 'cosmetic' | 'nonCosmetic', file: File) => {
        // For second round, clear existing images before uploading new ones
        if (isSecondRound) {
            if (type === 'cosmetic') {
                // Clear cosmetic images for this row
                updateRowField(rowId, 'finalCosmeticImages', JSON.stringify([]));
                updateRowField(rowId, 'finalCosmeticImage', '');
            } else {
                // Clear non-cosmetic images for this row
                updateRowField(rowId, 'nonCosmeticImages', JSON.stringify([]));
                updateRowField(rowId, 'nonCosmeticImage', '');
                updateRowField(rowId, 'croppedImages', JSON.stringify([]));
                updateRowField(rowId, 'croppedImage', '');
                updateRowField(rowId, 'finalNonCosmeticImage', '');
                updateRowField(rowId, 'finalCroppedNonCosmeticImage', '');
            }
        }

        if (type === 'cosmetic') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const currentRow = formData.rows.find(r => r.id === rowId);

                if (currentRow) {
                    // For Hulk project, allow multiple final cosmetic images
                    if (projectType === "Hulk") {
                        const currentFinalImages = currentRow.finalCosmeticImages || [];
                        const updatedFinalImages = [...currentFinalImages, imageUrl];

                        updateRowField(rowId, 'finalCosmeticImages', JSON.stringify(updatedFinalImages));
                        updateRowField(rowId, 'finalCosmeticImage', imageUrl); // Set first image as main
                    } else {
                        // For Flash project, single final cosmetic image
                        updateRowField(rowId, 'finalCosmeticImage', imageUrl);
                    }
                }
            };
            reader.readAsDataURL(file);
        } else {
            // For non-cosmetic final images, call the parent handler
            handleFinalImageUpload(partNumber, type, file, currentChildTest?.id);
        }
    };

    const renderField = (row: FormRow, column: CustomColumn) => {
        const value = row[column.id] || '';

        switch (column.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateRowField(row.id, column.id, e.target.value)}
                        className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => updateRowField(row.id, column.id, e.target.value)}
                        className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => updateRowField(row.id, column.id, e.target.value)}
                        className="w-full min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => updateRowField(row.id, column.id, e.target.value)}
                        className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select</option>
                        {column.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => updateRowField(row.id, column.id, e.target.value)}
                        rows={3}
                        className="w-full min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    />
                );

            case 'image':
                return (
                    <div className="space-y-2">
                        {!value ? (
                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                                <Upload size={20} className="text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-600">Upload Image</span>
                                <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                updateRowField(row.id, column.id, event.target?.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={value}
                                    alt={`${column.label} preview`}
                                    className="w-20 h-20 object-cover border rounded-lg"
                                />
                                <div className="flex gap-1 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        updateRowField(row.id, column.id, event.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            };
                                            input.click();
                                        }}
                                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateRowField(row.id, column.id, '')}
                                        className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    // Filter rows for current child test
    const rowsForCurrentChildTest = formData.rows.filter(row =>
        !currentChildTest || row.childTestId === currentChildTest.id
    );

    // Group filtered rows by partNumber
    const rowsByPart = rowsForCurrentChildTest.reduce((acc, row) => {
        if (!acc[row.partNumber]) {
            acc[row.partNumber] = [];
        }
        acc[row.partNumber].push(row);
        return acc;
    }, {} as Record<string, FormRow[]>);

    const handleCompleteChildTest = () => {
        if (window.confirm(`Are you sure you want to complete "${currentChildTest?.name}"?`)) {
            onChildTestComplete();
        }
    };

    // Function to check if images are already uploaded for a part
    const checkExistingImages = (partNumber: string) => {
        const existingImages = loadImagesFromStorage(partNumber);
        return {
            hasCosmeticImages: existingImages.cosmeticImages.length > 0,
            hasNonCosmeticImages: existingImages.nonCosmeticImages.length > 0,
            hasFinalCosmeticImages: (existingImages.finalCosmeticImages?.length || 0) > 0,
            hasFinalNonCosmeticImages: (existingImages.finalNonCosmeticImages?.length || 0) > 0,
            cosmeticCount: existingImages.cosmeticImages.length,
            nonCosmeticCount: existingImages.nonCosmeticImages.length,
            finalCosmeticCount: existingImages.finalCosmeticImages?.length || 0,
            finalNonCosmeticCount: existingImages.finalNonCosmeticImages?.length || 0
        };
    };

    // Determine if we should split images based on project type
    const shouldSplitImages = () => {
        return projectType === "Flash";
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                {/* Timer Status Display */}
                <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Timer Status</h3>
                            <p className="text-sm text-gray-600">
                                {timerState.isRunning ? (
                                    <span className="text-green-600 flex items-center">
                                        <Play size={16} className="mr-2" />
                                        Running since {timerState.startTime ? new Date(timerState.startTime).toLocaleTimeString() : 'just now'}
                                    </span>
                                ) : timerState.startTime ? (
                                    <span className="text-gray-600 flex items-center">
                                        <Pause size={16} className="mr-2" />
                                        Stopped. Last started: {new Date(timerState.startTime).toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-gray-500">Not started yet</span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`text-2xl font-mono font-bold ${timerState.isRunning ? 'text-green-600' : 'text-gray-700'}`}>
                                {formatTime(timerState.remainingSeconds)}
                            </div>
                            <button
                                type="button"
                                onClick={onTimerToggle}
                                className={`flex items-center w-fit border rounded-md px-4 py-2 font-semibold transition-colors ${timerState.isRunning
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <span>{timerState.isRunning ? 'Stop Timer' : 'Start Timer'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Machine Load Information */}
                {machineLoadData && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Machine Load Information</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Load ID: {machineLoadData.loadId}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Machine/Chamber:</span>
                                <div className="font-semibold">{machineLoadData.chamber}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Total Parts:</span>
                                <div className="font-semibold">{machineLoadData.totalParts}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Loaded At:</span>
                                <div className="font-semibold">
                                    {new Date(machineLoadData.loadedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Estimated Completion:</span>
                                <div className="font-semibold">
                                    {new Date(machineLoadData.estimatedCompletion).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Duration:</span>
                                <div className="font-semibold">{machineLoadData.duration} hours</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Ticket:</span>
                                <div className="font-semibold">{machineLoadData.machineDetails.ticketCode}</div>
                            </div>
                        </div>

                        {/* Image Upload Status */}
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="text-sm font-medium text-purple-800 mb-2">Image Upload Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <span className="text-sm text-gray-600">Parts with pre-uploaded images:</span>
                                    <span className="font-semibold ml-2">
                                        {machineLoadData.parts.filter(p => p.hasImages).length} / {machineLoadData.totalParts}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Total pre-uploaded images:</span>
                                    <span className="font-semibold ml-2">
                                        {machineLoadData.parts.reduce((sum, part) =>
                                            sum + (part.cosmeticImages?.length || 0) + (part.nonCosmeticImages?.length || 0), 0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Child Test Navigation */}
                {formData.childTests && formData.childTests.length > 1 && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Child Tests Progress</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.childTests.map((childTest, index) => (
                                <button
                                    key={childTest.id}
                                    onClick={() => onChildTestChange(index)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${formData.currentChildTestIndex === index
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : childTest.status === 'completed'
                                            ? 'bg-green-100 text-green-700 border-green-300'
                                            : 'bg-gray-100 text-gray-700 border-gray-300'
                                        }`}
                                >
                                    <span className="font-medium">{childTest.name}</span>
                                    {childTest.status === 'completed' && (
                                        <CheckCircle size={16} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current Child Test Header */}
                {currentChildTest && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{formData.testName}</h2>
                                <p className="text-gray-600">
                                    Child Test: <span className="font-semibold text-blue-600">{currentChildTest.name}</span>
                                </p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Machine: {currentChildTest.machineEquipment} | Timing: {currentChildTest.timing} hours
                                </div>
                                <div className="mt-1 text-sm">
                                    <span className="font-semibold">Project Type:</span> {projectType}
                                    {shouldSplitImages() && (
                                        <span className="ml-2 text-blue-600">
                                            (Non-cosmetic images will be split)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {currentChildTest.status !== 'completed' && (
                                    <button
                                        onClick={handleCompleteChildTest}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                                    >
                                        <CheckCircle size={20} />
                                        Complete This Test
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                            <input value={formData.testName} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Specification</label>
                            <input value={formData.specification} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Condition</label>
                            <input value={formData.testCondition} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => updateFormField('date', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Process Stage</label>
                            <input value={formData.processStage} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sample Qty</label>
                            <input value={formData.sampleQty} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Timing (hours)</label>
                            <input value={formData.timing} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                    </div>
                </div>

                {/* Parts Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Parts ({selectedParts.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedParts.map((part, index) => {
                            const existingImages = checkExistingImages(part.partNumber);

                            return (
                                <div key={part.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{part.partNumber}</span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Part {index + 1}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Serial: {part.serialNumber}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Current Rows: {rowsByPart[part.partNumber]?.length || 0}
                                    </div>

                                    {/* Show existing images status */}
                                    {(existingImages.hasCosmeticImages || existingImages.hasNonCosmeticImages || existingImages.hasFinalCosmeticImages || existingImages.hasFinalNonCosmeticImages) && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {existingImages.hasCosmeticImages && (
                                                <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded flex items-center gap-1">
                                                    <ImageIcon size={10} />
                                                    {existingImages.cosmeticCount} cosmetic
                                                </span>
                                            )}
                                            {existingImages.hasNonCosmeticImages && (
                                                <span className="px-1.5 py-0.5 text-xs bg-green-50 text-green-700 rounded flex items-center gap-1">
                                                    <ImageIcon size={10} />
                                                    {existingImages.nonCosmeticCount} non-cosmetic
                                                </span>
                                            )}
                                            {isSecondRound && existingImages.hasFinalCosmeticImages && (
                                                <span className="px-1.5 py-0.5 text-xs bg-purple-50 text-purple-700 rounded flex items-center gap-1">
                                                    <ImageIcon size={10} />
                                                    {existingImages.finalCosmeticCount} final cosmetic
                                                </span>
                                            )}
                                            {isSecondRound && existingImages.hasFinalNonCosmeticImages && (
                                                <span className="px-1.5 py-0.5 text-xs bg-orange-50 text-orange-700 rounded flex items-center gap-1">
                                                    <ImageIcon size={10} />
                                                    {existingImages.finalNonCosmeticCount} final non-cosmetic
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Test Data for {currentChildTest ? currentChildTest.name : 'All Tests'}
                        {isSecondRound && <span className="ml-2 text-red-600">(Second Round)</span>}
                    </h3>
                    <button
                        onClick={() => setShowAddColumnModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Column
                    </button>
                </div>

                {/* Render table for each part */}
                {selectedParts.map((part) => {
                    const existingImages = loadImagesFromStorage(part.partNumber);

                    return (
                        <div key={part.id} className="mb-8">
                            <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-3">
                                <h4 className="font-semibold text-gray-800 flex items-center">
                                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                        {selectedParts.indexOf(part) + 1}
                                    </span>
                                    Part: {part.partNumber} (Serial: {part.serialNumber})
                                    {currentChildTest && (
                                        <span className="ml-2 text-sm text-blue-600 font-normal">
                                            - {currentChildTest.name}
                                        </span>
                                    )}

                                    {/* Show image status badge */}
                                    {(existingImages.cosmeticImages.length > 0 || existingImages.nonCosmeticImages.length > 0 || (isSecondRound && (existingImages.finalCosmeticImages?.length || 0) > 0) || (isSecondRound && (existingImages.finalNonCosmeticImages?.length || 0) > 0)) && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                                            <ImageIcon size={10} />
                                            {isSecondRound ? 'Final images loaded from storage' : 'Images loaded from storage'}
                                        </span>
                                    )}
                                </h4>
                            </div>
                            <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300">
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    SR.No
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Checkpoint Status
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Test Date
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Config
                                                </th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Sample ID
                                                </th>

                                                {/* First Round Images (only show if not second round) */}
                                                {!isSecondRound && (
                                                    <>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Non-Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Cropped Images
                                                        </th>
                                                    </>
                                                )}

                                                {/* Second Round Images */}
                                                {isSecondRound && (
                                                    <>
                                                        {/* First Round Images (Read-only display) */}
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 bg-gray-50">
                                                            Pre Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 bg-gray-50">
                                                            Pre Non-Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 bg-gray-50">
                                                            Pre Cropped Images
                                                        </th>

                                                        {/* Second Round Images */}
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Post Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Post Non-Cosmetic Images
                                                        </th>
                                                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                            Post Cropped Images
                                                        </th>
                                                    </>
                                                )}

                                                {formData.customColumns?.map((column) => (
                                                    <th key={column.id} className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 relative group">
                                                        <div className="flex items-center justify-between">
                                                            <span>{column.label}</span>
                                                            <button
                                                                onClick={() => removeCustomColumn(column.id)}
                                                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                                                title="Remove column"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {rowsByPart[part.partNumber]?.map((row, index) => (
                                                <tr key={row.id} className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                                                    <td className="px-4 py-4 text-center font-semibold text-gray-900 border-r border-gray-200">
                                                        {row.srNo}
                                                    </td>
                                                    <td className="px-4 py-4 text-center border-r border-gray-200">
                                                        {row.testDate && (() => {
                                                            const testStartDate = new Date(row.testDate);
                                                            const checkpointTime = new Date(testStartDate.getTime() + (checkpointHours * 60 * 60 * 1000));
                                                            const now = new Date();
                                                            const hoursElapsed = (now.getTime() - testStartDate.getTime()) / (1000 * 60 * 60);
                                                            const checkpointReached = now >= checkpointTime;

                                                            return (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <div className={`text-xs font-semibold px-2 py-1 rounded ${checkpointReached
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-green-100 text-green-700'
                                                                        }`}>
                                                                        {checkpointReached ? '⚠️ Checkpoint' : '✓ Active'}
                                                                    </div>
                                                                    <div className="text-[10px] text-gray-500">
                                                                        {hoursElapsed.toFixed(1)}h / {checkpointHours}h
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-gray-200">
                                                        <input
                                                            type="date"
                                                            value={row.testDate}
                                                            onChange={(e) => updateRowField(row.id, 'testDate', e.target.value)}
                                                            className="w-full min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-gray-200">
                                                        <input
                                                            value={row.config}
                                                            onChange={(e) => updateRowField(row.id, 'config', e.target.value)}
                                                            className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-gray-200">
                                                        <input
                                                            value={row.sampleId}
                                                            onChange={(e) => updateRowField(row.id, 'sampleId', e.target.value)}
                                                            className="w-full min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>

                                                    {/* First Round Images (only show if not second round) */}
                                                    {!isSecondRound && (
                                                        <>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                                <div className="space-y-2">
                                                                    {/* Show existing cosmetic images from storage first */}
                                                                    {existingImages.cosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {/* <div className="text-xs text-gray-500 mb-1">
                                                                                Pre-uploaded images ({existingImages.cosmeticImages.length}):
                                                                            </div> */}
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {existingImages.cosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"

                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : row.cosmeticImages && row.cosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {row.cosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const input = document.createElement('input');
                                                                                    input.type = 'file';
                                                                                    input.accept = 'image/*';
                                                                                    input.multiple = true;
                                                                                    input.onchange = (e) => {
                                                                                        const files = (e.target as HTMLInputElement).files;
                                                                                        if (files) {
                                                                                            Array.from(files).forEach(file => {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = (event) => {
                                                                                                    const newImage = event.target?.result as string;
                                                                                                    const updatedCosmeticImages = [...(row.cosmeticImages || []), newImage];
                                                                                                    updateRowField(row.id, 'cosmeticImages', JSON.stringify(updatedCosmeticImages));
                                                                                                    updateRowField(row.id, 'cosmeticImage', updatedCosmeticImages[0] || '');
                                                                                                };
                                                                                                reader.readAsDataURL(file);
                                                                                            });
                                                                                        }
                                                                                    };
                                                                                    input.click();
                                                                                }}
                                                                                className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                            >
                                                                                + Add More
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
                                                                            <Upload size={20} className="text-blue-400 mb-2" />
                                                                            <span className="text-sm font-medium text-blue-600">Upload Cosmetic</span>
                                                                            <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const files = e.target.files;
                                                                                    if (files) {
                                                                                        Array.from(files).forEach(file => {
                                                                                            const reader = new FileReader();
                                                                                            reader.onload = (event) => {
                                                                                                const imageUrl = event.target?.result as string;
                                                                                                const updatedCosmeticImages = [...(row.cosmeticImages || []), imageUrl];
                                                                                                updateRowField(row.id, 'cosmeticImages', JSON.stringify(updatedCosmeticImages));
                                                                                                updateRowField(row.id, 'cosmeticImage', updatedCosmeticImages[0] || '');
                                                                                            };
                                                                                            reader.readAsDataURL(file);
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="hidden"
                                                                                multiple
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                                <div className="space-y-2">
                                                                    {/* Show existing non-cosmetic images from storage first */}
                                                                    {existingImages.nonCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {/* <div className="text-xs text-gray-500 mb-1">
                                                                                Pre-uploaded images ({existingImages.nonCosmeticImages.length}):
                                                                            </div> */}
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {existingImages.nonCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Non-Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : row.nonCosmeticImages && row.nonCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {row.nonCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Non-Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const input = document.createElement('input');
                                                                                    input.type = 'file';
                                                                                    input.accept = 'image/*';
                                                                                    input.onchange = (e) => {
                                                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                                                        if (file) {
                                                                                            handleImageUpload(row.id, 'nonCosmetic', file);
                                                                                        }
                                                                                    };
                                                                                    input.click();
                                                                                }}
                                                                                className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                            >
                                                                                + Add More
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:border-green-400 transition-colors bg-green-50">
                                                                            <Upload size={20} className="text-green-400 mb-2" />
                                                                            <span className="text-sm font-medium text-green-600">Upload Non-Cosmetic</span>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        handleImageUpload(row.id, 'nonCosmetic', file);
                                                                                    }
                                                                                }}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[150px]">
                                                                {row.croppedImages && row.croppedImages.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            {row.croppedImages.map((img, imgIndex) => (
                                                                                <div key={imgIndex} className="relative">
                                                                                    <img
                                                                                        src={img}
                                                                                        alt={`Cropped ${imgIndex + 1}`}
                                                                                        className="w-16 h-16 object-contain border rounded-lg"
                                                                                    />
                                                                                    {row.regionLabel && imgIndex === 0 && (
                                                                                        <div className="text-xs text-center font-semibold text-gray-700 mt-1">
                                                                                            {row.regionLabel}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : existingImages.nonCosmeticImages.length > 0 ? (
                                                                    <div className="text-center py-4">
                                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                                        <span className="text-xs text-gray-500">
                                                                            {shouldSplitImages() ? 'Processing cropped images...' : 'No splitting required'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 text-center">No images uploaded</div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    {/* Second Round Images */}
                                                    {isSecondRound && (
                                                        <>
                                                            {/* First Round Cosmetic Images (Read-only) */}
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[150px] bg-gray-50">
                                                                {existingImages.cosmeticImages && existingImages.cosmeticImages.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {/* <div className="text-xs text-gray-500 mb-1">
                                                                            First Round ({existingImages.cosmeticImages.length}):
                                                                        </div> */}
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            {existingImages.cosmeticImages.slice(0, 4).map((img, imgIndex) => (
                                                                                <div key={imgIndex} className="relative group">
                                                                                    <img
                                                                                        src={img}
                                                                                        alt={`First Round Cosmetic ${imgIndex + 1}`}
                                                                                        className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        onClick={() => {
                                                                                            // Open in modal/lightbox if needed
                                                                                            window.open(img, '_blank');
                                                                                        }}
                                                                                    />
                                                                                    {/* <div className="absolute top-0 right-0 bg-blue-600 bg-opacity-75 text-white text-xs px-1 rounded">
                                                                                        {imgIndex + 1}
                                                                                    </div> */}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {existingImages.cosmeticImages.length > 4 && (
                                                                            <div className="text-xs text-gray-500">
                                                                                +{existingImages.cosmeticImages.length - 4} more
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 text-center py-2">No first round images</div>
                                                                )}
                                                            </td>

                                                            {/* First Round Non-Cosmetic Images (Read-only) */}
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[150px] bg-gray-50">
                                                                {existingImages.nonCosmeticImages && existingImages.nonCosmeticImages.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {/* <div className="text-xs text-gray-500 mb-1">
                                                                            First Round ({existingImages.nonCosmeticImages.length}):
                                                                        </div> */}
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            {existingImages.nonCosmeticImages.slice(0, 4).map((img, imgIndex) => (
                                                                                <div key={imgIndex} className="relative group">
                                                                                    <img
                                                                                        src={img}
                                                                                        alt={`First Round Non-Cosmetic ${imgIndex + 1}`}
                                                                                        className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        onClick={() => {
                                                                                            window.open(img, '_blank');
                                                                                        }}
                                                                                    />
                                                                                    {/* <div className="absolute top-0 right-0 bg-green-600 bg-opacity-75 text-white text-xs px-1 rounded">
                                                                                        {imgIndex + 1}
                                                                                    </div> */}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {existingImages.nonCosmeticImages.length > 4 && (
                                                                            <div className="text-xs text-gray-500">
                                                                                +{existingImages.nonCosmeticImages.length - 4} more
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 text-center py-2">No first round images</div>
                                                                )}
                                                            </td>

                                                            {/* First Round Cropped Images (Read-only) */}
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[150px] bg-gray-50">
                                                                {row.croppedImages && row.croppedImages.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {/* <div className="text-xs text-gray-500 mb-1">
                                                                            Cropped ({row.croppedImages.length}):
                                                                        </div> */}
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            {row.croppedImages.slice(0, 4).map((img, imgIndex) => (
                                                                                <div key={imgIndex} className="relative">
                                                                                    <img
                                                                                        src={img}
                                                                                        alt={`First Round Cropped ${imgIndex + 1}`}
                                                                                        className="w-16 h-16 object-contain border rounded-lg cursor-pointer"
                                                                                        onClick={() => {
                                                                                            window.open(img, '_blank');
                                                                                        }}
                                                                                    />
                                                                                    {row.regionLabel && imgIndex === 0 && (
                                                                                        <div className="text-[10px] text-center font-semibold text-gray-700 mt-1 truncate">
                                                                                            {row.regionLabel}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {row.croppedImages.length > 4 && (
                                                                            <div className="text-xs text-gray-500">
                                                                                +{row.croppedImages.length - 4} more
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 text-center py-2">
                                                                        {shouldSplitImages() ? 'No cropped images' : 'N/A'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                                <div className="space-y-2">
                                                                    {/* Show existing final cosmetic images from storage first */}
                                                                    {existingImages.finalCosmeticImages && existingImages.finalCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="text-xs text-gray-500 mb-1">
                                                                                Final cosmetic images ({existingImages.finalCosmeticImages.length}):
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {existingImages.finalCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Final Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : row.finalCosmeticImages && row.finalCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {row.finalCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Final Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            {projectType === "Hulk" && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const input = document.createElement('input');
                                                                                        input.type = 'file';
                                                                                        input.accept = 'image/*';
                                                                                        input.multiple = true;
                                                                                        input.onchange = (e) => {
                                                                                            const files = (e.target as HTMLInputElement).files;
                                                                                            if (files) {
                                                                                                Array.from(files).forEach(file => {
                                                                                                    handleFinalRoundImageUpload(row.id, part.partNumber, 'cosmetic', file);
                                                                                                });
                                                                                            }
                                                                                        };
                                                                                        input.click();
                                                                                    }}
                                                                                    className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                                >
                                                                                    + Add More
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors bg-purple-50">
                                                                            <Upload size={20} className="text-purple-400 mb-2" />
                                                                            <span className="text-sm font-medium text-purple-600">
                                                                                Upload Final Cosmetic
                                                                            </span>
                                                                            <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                multiple={projectType === "Hulk"}
                                                                                onChange={(e) => {
                                                                                    const files = e.target.files;
                                                                                    if (files) {
                                                                                        Array.from(files).forEach(file => {
                                                                                            handleFinalRoundImageUpload(row.id, part.partNumber, 'cosmetic', file);
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                                <div className="space-y-2">
                                                                    {/* Show existing final non-cosmetic images from storage first */}
                                                                    {existingImages.finalNonCosmeticImages && existingImages.finalNonCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="text-xs text-gray-500 mb-1">
                                                                                Final non-cosmetic images ({existingImages.finalNonCosmeticImages.length}):
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {existingImages.finalNonCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Final Non-Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : row.nonCosmeticImages && row.nonCosmeticImages.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="grid grid-cols-2 gap-1">
                                                                                {row.nonCosmeticImages.map((img, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <img
                                                                                            src={img}
                                                                                            alt={`Final Non-Cosmetic ${imgIndex + 1}`}
                                                                                            className="w-16 h-16 object-cover border rounded-lg cursor-pointer"
                                                                                        />
                                                                                        {/* <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                            {imgIndex + 1}
                                                                                        </div> */}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const input = document.createElement('input');
                                                                                    input.type = 'file';
                                                                                    input.accept = 'image/*';
                                                                                    input.onchange = (e) => {
                                                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                                                        if (file) {
                                                                                            handleFinalRoundImageUpload(row.id, part.partNumber, 'nonCosmetic', file);
                                                                                        }
                                                                                    };
                                                                                    input.click();
                                                                                }}
                                                                                className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                                            >
                                                                                + Add More
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors bg-orange-50">
                                                                            <Upload size={20} className="text-orange-400 mb-2" />
                                                                            <span className="text-sm font-medium text-orange-600">Upload Final Non-Cosmetic</span>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        handleFinalRoundImageUpload(row.id, part.partNumber, 'nonCosmetic', file);
                                                                                    }
                                                                                }}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 border-r border-gray-200 min-w-[150px]">
                                                                {row.croppedImages && row.croppedImages.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        <div className="grid grid-cols-2 gap-1">
                                                                            {row.croppedImages.map((img, imgIndex) => (
                                                                                <div key={imgIndex} className="relative">
                                                                                    <img
                                                                                        src={img}
                                                                                        alt={`Final Cropped ${imgIndex + 1}`}
                                                                                        className="w-16 h-16 object-contain border rounded-lg"
                                                                                    />
                                                                                    {row.regionLabel && imgIndex === 0 && (
                                                                                        <div className="text-xs text-center font-semibold text-gray-700 mt-1">
                                                                                            {row.regionLabel}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : existingImages.finalNonCosmeticImages && existingImages.finalNonCosmeticImages.length > 0 ? (
                                                                    <div className="text-center py-4">
                                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                                        <span className="text-xs text-gray-500">
                                                                            {shouldSplitImages() ? 'Processing final cropped images...' : 'No splitting required'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 text-center">No final images uploaded</div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    {formData.customColumns?.map((column) => (
                                                        <td key={column.id} className={`px-4 py-4 border-r border-gray-200 ${column.type === 'image' ? 'min-w-[200px]' : ''}`}>
                                                            {renderField(row, column)}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-4">
                                                        <select
                                                            value={row.status}
                                                            onChange={(e) => updateRowField(row.id, 'status', e.target.value)}
                                                            className={`w-full min-w-[110px] px-3 py-2 border rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${row.status === "Pass" ? "bg-green-50 text-green-700 border-green-200" :
                                                                row.status === "Fail" ? "bg-red-50 text-red-700 border-red-200" :
                                                                    "bg-white border-gray-300 text-gray-700"
                                                                }`}
                                                        >
                                                            <option value="">Select</option>
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
                        </div>
                    );
                })}
            </div>

            {/* Add Column Modal */}
            {showAddColumnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Column</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Column Label
                                </label>
                                <input
                                    type="text"
                                    value={newColumn.label}
                                    onChange={(e) => setNewColumn(prev => ({ ...prev, label: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter column name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Data Type
                                </label>
                                <select
                                    value={newColumn.type}
                                    onChange={(e) => setNewColumn(prev => ({
                                        ...prev,
                                        type: e.target.value as any,
                                        options: e.target.value === 'select' ? [] : undefined
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="select">Dropdown</option>
                                    <option value="textarea">Text Area</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>
                            {newColumn.type === 'select' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Options
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Add option"
                                            />
                                            <button
                                                onClick={addOption}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {newColumn.options.map((option, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                                    <span className="text-sm">{option}</span>
                                                    <button
                                                        onClick={() => removeOption(option)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleAddColumn}
                                disabled={!newColumn.label.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Add Column
                            </button>
                            <button
                                onClick={() => setShowAddColumnModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Main Component
export default function MultiStageTestFormEnhanced() {
    const [currentStage, setCurrentStage] = useState(0);
    const [currentRecord, setCurrentRecord] = useState<Stage2Record | null>(null);
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [isSecondRound, setIsSecondRound] = useState(false);
    const [sharedImagesByPart, setSharedImagesByPart] = useState<SharedImagesByPart>({});
    const [forms, setForms] = useState<FormsState>({});
    const [timerStates, setTimerStates] = useState<TestTimerState>({});
    const [croppedRegions, setCroppedRegions] = useState<CroppedRegion[]>([]);
    const [cvLoaded, setCvLoaded] = useState(false);
    const [hasYellowMarks, setHasYellowMarks] = useState<boolean | null>(null);
    const [processingImages, setProcessingImages] = useState<Record<string, boolean>>({});
    const [projectType, setProjectType] = useState<string>(""); // Default to Flash

    const location = useLocation();
    const navigate = useNavigate();

    // Load timer states from localStorage on component mount
    useEffect(() => {
        const savedTimerStates = localStorage.getItem("testTimerStates");
        if (savedTimerStates) {
            try {
                const parsedStates = JSON.parse(savedTimerStates);
                setTimerStates(parsedStates);
            } catch (error) {
                console.error("Error loading timer states:", error);
            }
        }
    }, []);

    // Save timer states to localStorage whenever they change
    useEffect(() => {
        if (Object.keys(timerStates).length > 0) {
            localStorage.setItem("testTimerStates", JSON.stringify(timerStates));
        }
    }, [timerStates]);

    // Function to load images from localStorage
    const loadImagesFromStorage = (partNumber: string): {
        cosmeticImages: string[],
        nonCosmeticImages: string[],
        finalCosmeticImages?: string[],
        finalNonCosmeticImages?: string[]
    } => {
        try {
            const partImagesData = JSON.parse(localStorage.getItem('partImagesData') || '{}');
            const images = partImagesData[partNumber];

            if (images) {
                return {
                    cosmeticImages: images.cosmeticImages || [],
                    nonCosmeticImages: images.nonCosmeticImages || [],
                    finalCosmeticImages: images.finalCosmeticImages || [],
                    finalNonCosmeticImages: images.finalNonCosmeticImages || []
                };
            }
        } catch (error) {
            console.error('Error loading images from storage:', error);
        }

        return {
            cosmeticImages: [],
            nonCosmeticImages: [],
            finalCosmeticImages: [],
            finalNonCosmeticImages: []
        };
    };

    // Function to automatically process images from localStorage
    const processImagesFromStorage = () => {
        if (!cvLoaded) {
            console.log("OpenCV not loaded yet, waiting...");
            return;
        }

        console.log("Processing images from storage...");

        Object.keys(forms).forEach(formKey => {
            const formData = forms[formKey];
            const currentChildTest = formData.childTests?.[formData.currentChildTestIndex || 0];

            formData.rows.forEach(row => {
                const existingImages = loadImagesFromStorage(row.partNumber);

                // Determine which images to process based on round
                const imagesToProcess = isSecondRound
                    ? existingImages.finalNonCosmeticImages || []
                    : existingImages.nonCosmeticImages || [];

                imagesToProcess.forEach((imageData, index) => {
                    // Only process if not already processed
                    const hasBeenProcessed = row.croppedImages && row.croppedImages.length > index;
                    if (!hasBeenProcessed && imageData && shouldSplitImages(formData.testName)) {
                        console.log(`Processing stored image for part ${row.partNumber}, index ${index}`);

                        // Set processing state for this image
                        setProcessingImages(prev => ({
                            ...prev,
                            [`${row.partNumber}-${index}`]: true
                        }));

                        // Convert base64 to File object
                        const byteString = atob(imageData.split(',')[1]);
                        const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        const blob = new Blob([ab], { type: mimeString });
                        const file = new File([blob], `pre-uploaded-${row.partNumber}-${index}.jpg`, { type: mimeString });

                        // Process the image
                        processStoredImage(file, row.partNumber, formData.testName, row.childTestId || currentChildTest?.id, index, isSecondRound);
                    }
                });
            });
        });
    };

    // Determine if we should split images based on project type
    const shouldSplitImages = (testName?: string) => {
        // If project is Flash, split non-cosmetic images
        // If project is Hulk, don't split
        return projectType === "Flash";
    };

    // Load OpenCV
    useEffect(() => {
        if (window.cv && window.cv.Mat) {
            setCvLoaded(true);
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>('script[src*="opencv.js"]');
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

    // Parse combined test names into child tests with sequential dependency
    const parseChildTests = (testName: string, machineEquipment: string, machineEquipment2: string): ChildTest[] => {
        const tests: ChildTest[] = [];

        if (testName.includes('+')) {
            // Split by '+' and trim
            const testNames = testName.split('+').map(name => name.trim()).filter(name => name);
            const machines = [machineEquipment, machineEquipment2].filter(m => m);

            testNames.forEach((name, index) => {
                const previousTestId = index > 0 ? `child-${Date.now()}-${index - 1}` : undefined;

                tests.push({
                    id: `child-${Date.now()}-${index}`,
                    name: name,
                    machineEquipment: machines[index] || machines[0] || name,
                    timing: "24", // Default timing
                    isCompleted: false,
                    status: index === 0 ? 'active' : 'pending',
                    requiresImages: true, // All child tests require images by default
                    dependsOnPrevious: index > 0, // All tests after first depend on previous
                    previousTestId: previousTestId
                });
            });
        } else {
            // Single test
            tests.push({
                id: `child-${Date.now()}-0`,
                name: testName,
                machineEquipment: machineEquipment,
                timing: "24",
                isCompleted: false,
                status: 'active',
                requiresImages: true
            });
        }

        return tests;
    };

    // Load data from navigation state
    useEffect(() => {
        if (location.state && location.state.record) {
            const record = location.state.record as MachineLoadData;
            console.log("Received machine load data from navigation:", record);

            // Detect project type from machine load data
            const detectedProjectType = record.machineDetails.project.includes("Hulk") ? "Hulk" : "Flash";
            console.log(detectedProjectType);
            setProjectType(detectedProjectType);

            // Create a Stage2Record from the MachineLoadData
            const stage2Record: Stage2Record = {
                id: record.loadId,
                submissionId: `sub-${record.loadId}`,
                ticketId: parseInt(record.loadId.toString().slice(-6)),
                ticketCode: record.machineDetails.ticketCode,
                totalQuantity: record.totalParts,
                anoType: "Not Specified",
                source: "Machine Load",
                reason: "Testing",
                project: record.machineDetails.project,
                build: record.machineDetails.build,
                colour: record.machineDetails.colour,
                processStage: "Stage 2 Testing",
                selectedTestNames: record.machineDetails.tests.map(test => test.testName),
                testRecords: [], // We'll populate this below
                formData: {},
                submittedAt: record.loadedAt,
                version: "1.0",
                testingStatus: "In Testing",
                machineLoadData: record
            };

            // Convert LoadedPart[] to AssignedPart[] for each test
            record.machineDetails.tests.forEach((machineTest, testIndex) => {
                // Get parts assigned to this test
                const testParts = record.parts.filter(part =>
                    part.testId === machineTest.id || part.testName === machineTest.testName
                );

                const assignedParts: AssignedPart[] = testParts.map((part, idx) => ({
                    id: `${machineTest.id}-${idx}`,
                    partNumber: part.partNumber,
                    serialNumber: part.serialNumber,
                    location: record.chamber,
                    scanStatus: part.scanStatus,
                    assignedToTest: machineTest.testName
                }));

                // Create TestRecord for this test
                const testRecord: TestRecord = {
                    testId: machineTest.id,
                    testName: machineTest.testName,
                    processStage: "Stage 2 Testing",
                    testIndex: testIndex + 1,
                    testCondition: "Standard Conditions",
                    requiredQuantity: machineTest.requiredQty.toString(),
                    specification: "Default Specification",
                    machineEquipment: record.chamber,
                    machineEquipment2: "",
                    timing: machineTest.duration,
                    startDateTime: record.loadedAt,
                    endDateTime: record.estimatedCompletion,
                    assignedParts: assignedParts,
                    assignedPartsCount: assignedParts.length,
                    remark: "",
                    status: machineTest.status === 3 ? "Completed" : "In Progress",
                    submittedAt: record.loadedAt,
                    testResults: [],
                    childTests: parseChildTests(
                        machineTest.testName,
                        record.chamber,
                        ""
                    )
                };

                stage2Record.testRecords.push(testRecord);
            });

            setCurrentRecord(stage2Record);

            // Initialize forms from the created record
            const initialForms: FormsState = {};
            const initialSharedImages: SharedImagesByPart = {};

            stage2Record.testRecords.forEach((testRecord, index) => {
                const formKey = `test_${index}`;

                // Parse child tests for combined tests
                const childTests = parseChildTests(
                    testRecord.testName,
                    testRecord.machineEquipment,
                    testRecord.machineEquipment2
                );

                // Initialize timer for each child test from localStorage or default
                childTests.forEach((childTest, childIndex) => {
                    const childTimerKey = `${formKey}_${childTest.id}`;

                    // Try to load timer state from chamberLoads first
                    const savedTimerFromChamber = loadTimerStateFromChamberLoads(
                        record.loadId,
                        childTest.id
                    );

                    if (savedTimerFromChamber) {
                        // Use timer state from chamberLoads
                        setTimerStates(prev => ({
                            ...prev,
                            [childTimerKey]: savedTimerFromChamber
                        }));
                    } else {
                        // Check localStorage testTimerStates as fallback
                        const savedTimerState = timerStates[childTimerKey];
                        const timingHours = parseInt(childTest.timing || "24");

                        if (!savedTimerState) {
                            setTimerStates(prev => ({
                                ...prev,
                                [childTimerKey]: {
                                    remainingSeconds: timingHours * 3600,
                                    isRunning: false
                                }
                            }));
                        }
                    }
                });
                // Initialize rows for each assigned part
                const initialRows: FormRow[] = [];
                if (childTests.length > 0) {
                    testRecord.assignedParts.forEach((part, idx) => {
                        // Load existing images from storage
                        const existingImages = loadImagesFromStorage(part.partNumber);

                        initialRows.push({
                            id: Date.now() + idx,
                            srNo: idx + 1,
                            testDate: new Date().toISOString().split('T')[0],
                            config: "",
                            sampleId: part.serialNumber,
                            status: "Pending",
                            partNumber: part.partNumber,
                            serialNumber: part.serialNumber,
                            childTestId: childTests[0].id,
                            childTestName: childTests[0].name,
                            cosmeticImage: existingImages.cosmeticImages[0] || "",
                            nonCosmeticImage: existingImages.nonCosmeticImages[0] || "",
                            cosmeticImages: existingImages.cosmeticImages,
                            nonCosmeticImages: existingImages.nonCosmeticImages,
                            croppedImage: "",
                            croppedImages: [],
                            regionLabel: "",
                            // For second round, initialize final images
                            finalCosmeticImage: isSecondRound ? (existingImages.finalCosmeticImages?.[0] || "") : "",
                            finalCosmeticImages: isSecondRound ? (existingImages.finalCosmeticImages || []) : [],
                            finalNonCosmeticImage: isSecondRound ? (existingImages.finalNonCosmeticImages?.[0] || "") : "",
                            finalCroppedNonCosmeticImage: ""
                        });
                    });
                }

                initialForms[formKey] = {
                    testName: testRecord.testName,
                    processStage: testRecord.processStage,
                    testCondition: testRecord.testCondition,
                    date: new Date().toISOString().split('T')[0],
                    specification: testRecord.specification,
                    machineEquipment: testRecord.machineEquipment,
                    machineEquipment2: testRecord.machineEquipment2,
                    timing: testRecord.timing,
                    sampleQty: testRecord.requiredQuantity,
                    rows: initialRows,
                    customColumns: [],
                    childTests: childTests,
                    currentChildTestIndex: 0
                };

                // Initialize shared images for each part
                testRecord.assignedParts.forEach(part => {
                    if (!initialSharedImages[part.partNumber]) {
                        initialSharedImages[part.partNumber] = {
                            cosmetic: [],
                            nonCosmetic: [],
                            childTestImages: {}
                        };

                        // For second round, initialize final images arrays
                        if (isSecondRound) {
                            initialSharedImages[part.partNumber].finalCosmeticImages = [];
                            initialSharedImages[part.partNumber].finalNonCosmeticImages = [];
                        }
                    }

                    // Initialize child test images
                    childTests.forEach(childTest => {
                        if (!initialSharedImages[part.partNumber].childTestImages[childTest.id]) {
                            initialSharedImages[part.partNumber].childTestImages[childTest.id] = {
                                cosmetic: [],
                                nonCosmetic: []
                            };
                        }
                    });
                });
            });

            setForms(initialForms);
            setSharedImagesByPart(initialSharedImages);

            console.log("Converted to Stage2Record:", stage2Record);
            console.log("Detected project type:", detectedProjectType);

            // Process images from storage after forms are set
            setTimeout(() => {
                if (cvLoaded) {
                    processImagesFromStorage();
                }
            }, 1000);
        } else {
            console.error("No record found in navigation state");
            alert("No record selected. Please select a record first.");
            navigate(-1);
        }
    }, [location.state, navigate]);

    // Process images from storage when OpenCV loads
    useEffect(() => {
        if (cvLoaded && Object.keys(forms).length > 0) {
            processImagesFromStorage();
        }
    }, [cvLoaded, forms]);

    // Timer countdown effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimerStates(prev => {
                const updated = { ...prev };
                let hasChanges = false;

                Object.keys(updated).forEach(timerKey => {
                    if (updated[timerKey].isRunning && updated[timerKey].remainingSeconds > 0) {
                        updated[timerKey] = {
                            ...updated[timerKey],
                            remainingSeconds: updated[timerKey].remainingSeconds - 1,
                            lastUpdated: new Date().toISOString()
                        };
                        hasChanges = true;

                        // Update chamberLoads every minute (60 seconds)
                        if (updated[timerKey].remainingSeconds % 60 === 0 && currentRecord?.machineLoadData) {
                            const formKey = timerKey.split('_')[0];
                            const formData = forms[formKey];
                            const currentChildTest = formData?.childTests?.[formData.currentChildTestIndex || 0];
                            // Get testId from the timerKey or form data
                            const testId = timerKey.includes('_child-')
                                ? timerKey.split('_')[1]
                                : currentRecord.testRecords[parseInt(formKey.replace('test_', ''))]?.testId;

                            if (testId) {
                                updateChamberLoadsTimer(
                                    currentRecord.machineLoadData.loadId,
                                    testId,
                                    'start',
                                    updated[timerKey]
                                );
                            }
                        }
                    } else if (updated[timerKey].isRunning && updated[timerKey].remainingSeconds === 0) {
                        updated[timerKey] = {
                            ...updated[timerKey],
                            isRunning: false,
                            stopTime: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        };
                        hasChanges = true;

                        // Update chamberLoads when timer completes
                        if (currentRecord?.machineLoadData) {
                            const formKey = timerKey.split('_')[0];
                            const formData = forms[formKey];
                            const currentChildTest = formData?.childTests?.[formData.currentChildTestIndex || 0];
                            // Get testId from the timerKey or form data
                            const testId = timerKey.includes('_child-')
                                ? timerKey.split('_')[1]
                                : currentRecord.testRecords[parseInt(formKey.replace('test_', ''))]?.testId;

                            if (testId) {
                                updateChamberLoadsTimer(
                                    currentRecord.machineLoadData.loadId,
                                    testId,
                                    'stop',
                                    updated[timerKey]
                                );
                            }
                        }

                        // Show alert when timer completes
                        alert(`⏰ Timer completed!`);
                    }
                });

                return hasChanges ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentRecord, forms]);


    // Function to load initial timer state from chamberLoads
    const loadTimerStateFromChamberLoads = (loadId: number, testId: string) => {
        try {
            const chamberLoadsStr = localStorage.getItem('chamberLoads');
            if (!chamberLoadsStr) return null;

            const chamberLoads = JSON.parse(chamberLoadsStr);
            const load = chamberLoads.find((l: any) => l.id === loadId);

            if (!load) return null;

            const test = load.machineDetails.tests.find((t: any) => t.id === testId);

            if (test && test.timerStatus) {
                return {
                    remainingSeconds: test.timerRemainingSeconds || 0,
                    isRunning: test.timerStatus === 'start',
                    startTime: test.timerStartTime,
                    stopTime: test.timerStopTime,
                    lastUpdated: test.timerLastUpdated
                };
            }

            return null;
        } catch (error) {
            console.error('Error loading timer state from chamber loads:', error);
            return null;
        }
    };

    // OpenCV functions
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

    // Enhanced image processing function
    const processNonCosmeticImage = (file: File, partNumber: string, testName: string, childTestId?: string, isFinalRound: boolean = false) => {
        if (!cvLoaded) {
            alert("OpenCV not loaded yet. Please wait...");
            return;
        }

        // Check if we should split images based on project type
        if (!shouldSplitImages(testName) && !isFinalRound) {
            console.log(`Project is ${projectType}, skipping image splitting for non-cosmetic images`);
            // Just upload without processing
            handleSimpleImageUpload(file, partNumber, testName, 'nonCosmetic', childTestId, isFinalRound);
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

                    console.log(`Image for part ${partNumber} has yellow marks: ${hasMarks}`);

                    let detectedRegions: any[] = [];

                    if (hasMarks) {
                        detectedRegions = processImageWithYellowMarks(src, img);
                    } else {
                        detectedRegions = processImageWithoutYellowMarks(src, img);
                    }

                    console.log(`Detected regions for part ${partNumber}:`, detectedRegions);

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
                                rect: { x, y, width, height },
                                partNumber: partNumber,
                                childTestId: childTestId,
                                isFinal: isFinalRound
                            });

                            console.log(`Part ${partNumber} - Region ${i}: ${detectedLabel} → ${category?.form}`);

                            roi.delete();
                        } catch (err) {
                            console.error(`Error cropping region ${i}:`, err);
                        }
                    });

                    // Replace existing cropped regions for this part and child test
                    setCroppedRegions(prev => {
                        const filtered = prev.filter(region =>
                            !(region.partNumber === partNumber && region.childTestId === childTestId && region.isFinal === isFinalRound)
                        );
                        return [...filtered, ...croppedImages];
                    });

                    // Get the image URL for the uploaded file
                    const imageUrl = e.target?.result as string;

                    // Update shared images
                    setSharedImagesByPart(prev => ({
                        ...prev,
                        [partNumber]: {
                            ...prev[partNumber],
                            nonCosmetic: isFinalRound ? [...(prev[partNumber]?.nonCosmetic || [])] : [...(prev[partNumber]?.nonCosmetic || []), imageUrl],
                            childTestImages: {
                                ...prev[partNumber]?.childTestImages,
                                [childTestId || 'default']: {
                                    cosmetic: prev[partNumber]?.childTestImages?.[childTestId || 'default']?.cosmetic || [],
                                    nonCosmetic: isFinalRound
                                        ? [...(prev[partNumber]?.childTestImages?.[childTestId || 'default']?.nonCosmetic || [])]
                                        : [...(prev[partNumber]?.childTestImages?.[childTestId || 'default']?.nonCosmetic || []), imageUrl]
                                }
                            },
                            // For final round, store in final arrays
                            ...(isFinalRound ? {
                                finalNonCosmeticImages: [...(prev[partNumber]?.finalNonCosmeticImages || []), imageUrl]
                            } : {})
                        }
                    }));

                    // Update the form
                    const formKey = `test_${currentTestIndex}`;
                    const formData = forms[formKey];

                    if (formData) {
                        const currentChildTest = formData.childTests?.[formData.currentChildTestIndex || 0];
                        const existingRow = formData.rows.find(row =>
                            row.partNumber === partNumber && row.childTestId === childTestId
                        );

                        if (existingRow) {
                            // For final round, update final images
                            if (isFinalRound) {
                                // Add to finalNonCosmeticImages array
                                const currentFinalNonCosmeticImages = existingRow.nonCosmeticImages || [];
                                const updatedFinalNonCosmeticImages = [...currentFinalNonCosmeticImages, imageUrl];

                                // Add cropped image to croppedImages array
                                const currentCroppedImages = existingRow.croppedImages || [];
                                const updatedCroppedImages = [...currentCroppedImages, croppedImages[0]?.data || ""];

                                const updatedRows = formData.rows.map(row => {
                                    if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                        return {
                                            ...row,
                                            nonCosmeticImages: updatedFinalNonCosmeticImages,
                                            finalNonCosmeticImage: imageUrl, // Set latest as main final image
                                            croppedImages: updatedCroppedImages,
                                            croppedImage: croppedImages[0]?.data || row.croppedImage || "",
                                            finalCroppedNonCosmeticImage: croppedImages[0]?.data || row.finalCroppedNonCosmeticImage || "",
                                            regionLabel: croppedImages[0]?.label || row.regionLabel || "",
                                            testDate: new Date().toISOString().split('T')[0],
                                            status: row.status === "Pending" ? "In Progress" : row.status
                                        };
                                    }
                                    return row;
                                });

                                setForms(prev => ({
                                    ...prev,
                                    [formKey]: {
                                        ...prev[formKey],
                                        rows: updatedRows
                                    }
                                }));
                            } else {
                                // For first round
                                const currentNonCosmeticImages = existingRow.nonCosmeticImages || [];
                                const updatedNonCosmeticImages = [...currentNonCosmeticImages, imageUrl];

                                // Add cropped image to croppedImages array
                                const currentCroppedImages = existingRow.croppedImages || [];
                                const updatedCroppedImages = [...currentCroppedImages, croppedImages[0]?.data || ""];

                                const updatedRows = formData.rows.map(row => {
                                    if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                        return {
                                            ...row,
                                            nonCosmeticImages: updatedNonCosmeticImages,
                                            nonCosmeticImage: imageUrl, // Set latest as main
                                            croppedImages: updatedCroppedImages,
                                            croppedImage: croppedImages[0]?.data || row.croppedImage || "",
                                            regionLabel: croppedImages[0]?.label || row.regionLabel || "",
                                            testDate: new Date().toISOString().split('T')[0],
                                            status: row.status === "Pending" ? "In Progress" : row.status
                                        };
                                    }
                                    return row;
                                });

                                setForms(prev => ({
                                    ...prev,
                                    [formKey]: {
                                        ...prev[formKey],
                                        rows: updatedRows
                                    }
                                }));
                            }
                        }
                    }
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

    // Simple image upload without processing (for Hulk project)
    const handleSimpleImageUpload = (file: File, partNumber: string, testName: string, type: 'cosmetic' | 'nonCosmetic', childTestId?: string, isFinalRound: boolean = false) => {
        setProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const formKey = `test_${currentTestIndex}`;
            const formData = forms[formKey];
            const currentChildTest = formData?.childTests?.[formData.currentChildTestIndex || 0];

            if (formData) {
                const existingRow = formData.rows.find(row =>
                    row.partNumber === partNumber && row.childTestId === childTestId
                );

                if (existingRow) {
                    if (type === 'cosmetic') {
                        if (isFinalRound) {
                            const currentFinalCosmeticImages = existingRow.finalCosmeticImages || [];
                            const updatedFinalCosmeticImages = [...currentFinalCosmeticImages, imageUrl];

                            const updatedRows = formData.rows.map(row => {
                                if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                    return {
                                        ...row,
                                        finalCosmeticImages: updatedFinalCosmeticImages,
                                        finalCosmeticImage: imageUrl,
                                        testDate: new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                }
                                return row;
                            });

                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: updatedRows
                                }
                            }));

                            // Update shared images for final round
                            setSharedImagesByPart(prev => ({
                                ...prev,
                                [partNumber]: {
                                    ...prev[partNumber],
                                    finalCosmeticImages: [...(prev[partNumber]?.finalCosmeticImages || []), imageUrl]
                                }
                            }));
                        } else {
                            const currentCosmeticImages = existingRow.cosmeticImages || [];
                            const updatedCosmeticImages = [...currentCosmeticImages, imageUrl];

                            const updatedRows = formData.rows.map(row => {
                                if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                    return {
                                        ...row,
                                        cosmeticImages: updatedCosmeticImages,
                                        cosmeticImage: imageUrl,
                                        testDate: new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                }
                                return row;
                            });

                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: updatedRows
                                }
                            }));
                        }
                    } else {
                        // For non-cosmetic images in Hulk project (no splitting)
                        if (isFinalRound) {
                            const currentFinalNonCosmeticImages = existingRow.nonCosmeticImages || [];
                            const updatedFinalNonCosmeticImages = [...currentFinalNonCosmeticImages, imageUrl];

                            const updatedRows = formData.rows.map(row => {
                                if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                    return {
                                        ...row,
                                        nonCosmeticImages: updatedFinalNonCosmeticImages,
                                        finalNonCosmeticImage: imageUrl,
                                        testDate: new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                }
                                return row;
                            });

                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: updatedRows
                                }
                            }));

                            // Update shared images for final round
                            setSharedImagesByPart(prev => ({
                                ...prev,
                                [partNumber]: {
                                    ...prev[partNumber],
                                    finalNonCosmeticImages: [...(prev[partNumber]?.finalNonCosmeticImages || []), imageUrl]
                                }
                            }));
                        } else {
                            const currentNonCosmeticImages = existingRow.nonCosmeticImages || [];
                            const updatedNonCosmeticImages = [...currentNonCosmeticImages, imageUrl];

                            const updatedRows = formData.rows.map(row => {
                                if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                    return {
                                        ...row,
                                        nonCosmeticImages: updatedNonCosmeticImages,
                                        nonCosmeticImage: imageUrl,
                                        testDate: new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                }
                                return row;
                            });

                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: updatedRows
                                }
                            }));
                        }
                    }
                }
            }
            setProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    // New function to process stored images
    const processStoredImage = (file: File, partNumber: string, testName: string, childTestId?: string, index: number, isFinalRound: boolean = false) => {
        if (!cvLoaded) {
            console.log("OpenCV not loaded yet");
            return;
        }

        // Check if we should split images based on project type
        if (!shouldSplitImages(testName) && !isFinalRound) {
            console.log(`Project is ${projectType}, skipping image splitting for stored images`);
            return;
        }

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
                        console.error("Could not get canvas context");
                        setProcessingImages(prev => ({
                            ...prev,
                            [`${partNumber}-${index}`]: false
                        }));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);
                    const src = cv.imread(canvas);

                    const srcForDetection = cv.imread(canvas);
                    const hasMarks = detectYellowMarks(srcForDetection);
                    srcForDetection.delete();

                    console.log(`Processing stored image for part ${partNumber} has yellow marks: ${hasMarks}`);

                    let detectedRegions: any[] = [];

                    if (hasMarks) {
                        detectedRegions = processImageWithYellowMarks(src, img);
                    } else {
                        detectedRegions = processImageWithoutYellowMarks(src, img);
                    }

                    console.log(`Detected regions for stored image ${partNumber}:`, detectedRegions);

                    const croppedImages: string[] = [];
                    let regionLabel = "";

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

                            croppedImages.push(croppedData);
                            if (i === 0) {
                                regionLabel = detectedLabel;
                            }

                            console.log(`Part ${partNumber} - Stored Region ${i}: ${detectedLabel} → ${category?.form}`);

                            roi.delete();
                        } catch (err) {
                            console.error(`Error cropping region ${i}:`, err);
                        }
                    });

                    // Update cropped regions
                    setCroppedRegions(prev => {
                        const filtered = prev.filter(region =>
                            !(region.partNumber === partNumber && region.childTestId === childTestId && region.id === index && region.isFinal === isFinalRound)
                        );

                        // Add new cropped regions
                        const newRegions = croppedImages.map((data, i) => ({
                            id: i,
                            data: data,
                            label: regionLabel,
                            category: getLabelCategory(regionLabel),
                            rect: detectedRegions[i] || { x: 0, y: 0, width: 0, height: 0 },
                            partNumber: partNumber,
                            childTestId: childTestId,
                            isFinal: isFinalRound
                        }));

                        return [...filtered, ...newRegions];
                    });

                    // Find and update the correct form and row
                    const formEntries = Object.entries(forms);
                    for (const [formKey, formData] of formEntries) {
                        const updatedRows = formData.rows.map(row => {
                            if (row.partNumber === partNumber && row.childTestId === childTestId) {
                                const currentCroppedImages = row.croppedImages || [];
                                const updatedCroppedImages = [...currentCroppedImages];

                                // Update at the specific index
                                if (croppedImages.length > 0) {
                                    updatedCroppedImages[index] = croppedImages[0]; // Take first cropped region
                                }

                                // For final round, update final cropped images
                                if (isFinalRound) {
                                    return {
                                        ...row,
                                        croppedImages: updatedCroppedImages,
                                        croppedImage: updatedCroppedImages[0] || row.croppedImage || "",
                                        finalCroppedNonCosmeticImage: updatedCroppedImages[0] || row.finalCroppedNonCosmeticImage || "",
                                        regionLabel: regionLabel || row.regionLabel || "",
                                        testDate: row.testDate || new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                } else {
                                    return {
                                        ...row,
                                        croppedImages: updatedCroppedImages,
                                        croppedImage: updatedCroppedImages[0] || row.croppedImage || "",
                                        regionLabel: regionLabel || row.regionLabel || "",
                                        testDate: row.testDate || new Date().toISOString().split('T')[0],
                                        status: row.status === "Pending" ? "In Progress" : row.status
                                    };
                                }
                            }
                            return row;
                        });

                        if (JSON.stringify(formData.rows) !== JSON.stringify(updatedRows)) {
                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: updatedRows
                                }
                            }));
                            break;
                        }
                    }

                    src.delete();
                } catch (err) {
                    console.error("Error processing stored image:", err);
                } finally {
                    // Clear processing state
                    setProcessingImages(prev => ({
                        ...prev,
                        [`${partNumber}-${index}`]: false
                    }));
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (partNumber: string, testName: string, type: 'cosmetic' | 'nonCosmetic', file: File, childTestId?: string) => {
        if (isSecondRound) {
            // For second round, call the final image handler
            handleFinalImageUpload(partNumber, type, file, childTestId);
        } else {
            // For first round
            if (type === 'nonCosmetic') {
                // For non-cosmetic images, process the uploaded file
                processNonCosmeticImage(file, partNumber, testName, childTestId, false);
            } else {
                // For cosmetic images
                handleSimpleImageUpload(file, partNumber, testName, type, childTestId, false);
            }
        }
    };

    // Handler for final round image uploads
    const handleFinalImageUpload = (partNumber: string, type: 'cosmetic' | 'nonCosmetic', file: File, childTestId?: string) => {
        // Auto-clear existing images for this part in second round
        if (isSecondRound) {
            // Clear from shared images
            setSharedImagesByPart(prev => ({
                ...prev,
                [partNumber]: {
                    ...prev[partNumber],
                    // Clear only the specific type
                    ...(type === 'cosmetic' ? {
                        finalCosmeticImages: []
                    } : {
                        finalNonCosmeticImages: []
                    })
                }
            }));

            // Clear from forms for the current test
            const formKey = `test_${currentTestIndex}`;
            const formData = forms[formKey];

            if (formData) {
                const updatedRows = formData.rows.map(row => {
                    if (row.partNumber === partNumber && row.childTestId === childTestId) {
                        if (type === 'cosmetic') {
                            return {
                                ...row,
                                finalCosmeticImage: "",
                                finalCosmeticImages: []
                            };
                        } else {
                            return {
                                ...row,
                                finalNonCosmeticImage: "",
                                finalCroppedNonCosmeticImage: "",
                                // Also clear non-cosmetic images for fresh upload
                                nonCosmeticImages: [],
                                nonCosmeticImage: "",
                                croppedImages: [],
                                croppedImage: "",
                                regionLabel: ""
                            };
                        }
                    }
                    return row;
                });

                setForms(prev => ({
                    ...prev,
                    [formKey]: {
                        ...prev[formKey],
                        rows: updatedRows
                    }
                }));
            }
        }

        if (type === 'nonCosmetic') {
            // For final non-cosmetic images, process if needed
            processNonCosmeticImage(file, partNumber, currentTestRecord?.testName || "", childTestId, true);
        } else {
            // For final cosmetic images, simple upload
            handleSimpleImageUpload(file, partNumber, currentTestRecord?.testName || "", type, childTestId, true);
        }
    };

    const removeImage = (partNumber: string, type: 'cosmetic' | 'nonCosmetic', childTestId?: string, isFinalRound: boolean = false) => {
        setSharedImagesByPart(prev => {
            const updated = { ...prev };

            if (isFinalRound) {
                if (type === 'cosmetic') {
                    updated[partNumber].finalCosmeticImages = [];
                } else {
                    updated[partNumber].finalNonCosmeticImages = [];
                }
            } else {
                if (childTestId && updated[partNumber]?.childTestImages?.[childTestId]) {
                    updated[partNumber].childTestImages[childTestId][type] = [];
                } else {
                    updated[partNumber] = {
                        ...updated[partNumber],
                        [type]: []
                    };
                }
            }

            return updated;
        });

        // Update form rows
        const formKey = `test_${currentTestIndex}`;
        const formData = forms[formKey];

        if (formData) {
            const updatedRows = formData.rows.map(row => {
                if (row.partNumber === partNumber && row.childTestId === childTestId) {
                    if (isFinalRound) {
                        if (type === 'cosmetic') {
                            return {
                                ...row,
                                finalCosmeticImage: "",
                                finalCosmeticImages: []
                            };
                        } else {
                            return {
                                ...row,
                                finalNonCosmeticImage: "",
                                finalCroppedNonCosmeticImage: ""
                            };
                        }
                    } else {
                        if (type === 'cosmetic') {
                            return { ...row, cosmeticImage: "" };
                        } else {
                            return {
                                ...row,
                                nonCosmeticImage: "",
                                croppedImage: "",
                                regionLabel: "",
                                finalNonCosmeticImage: isSecondRound ? "" : row.finalNonCosmeticImage,
                                finalCroppedNonCosmeticImage: isSecondRound ? "" : row.finalCroppedNonCosmeticImage
                            };
                        }
                    }
                }
                return row;
            });

            setForms(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    rows: updatedRows
                }
            }));
        }
    };

    // Form field updates
    const updateFormField = (formKey: string, field: string, value: any) => {
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

    // Add row function
    const addRow = (formKey: string, partNumber?: string) => {
        setForms(prev => {
            const currentForm = prev[formKey];
            const currentChildTestIndex = currentForm.currentChildTestIndex || 0;
            const currentChildTest = currentForm.childTests?.[currentChildTestIndex];

            // Find rows for current child test
            const childTestRows = currentForm.rows.filter(row => row.childTestId === currentChildTest?.id);
            const newId = Math.max(...childTestRows.map(r => r.id), 0) + 1;

            // Find the part to assign the new row to
            const targetPartNumber = partNumber || childTestRows[0]?.partNumber || currentForm.rows[0]?.partNumber;
            const targetPart = currentRecord?.testRecords.find(tr =>
                tr.testName === currentForm.testName
            )?.assignedParts.find(p => p.partNumber === targetPartNumber);

            // Load existing images for the part
            const existingImages = loadImagesFromStorage(targetPartNumber);

            const newRow: FormRow = {
                id: newId,
                srNo: childTestRows.length + 1,
                testDate: new Date().toISOString().split('T')[0],
                config: "",
                sampleId: targetPart ? `${targetPart.partNumber}-${childTestRows.length + 1}` : `Sample-${newId}`,
                status: "Pending",
                partNumber: targetPartNumber || "",
                serialNumber: targetPart?.serialNumber || "",
                childTestId: currentChildTest?.id,
                childTestName: currentChildTest?.name,
                cosmeticImage: existingImages.cosmeticImages[0] || "",
                nonCosmeticImage: existingImages.nonCosmeticImages[0] || "",
                cosmeticImages: existingImages.cosmeticImages,
                nonCosmeticImages: existingImages.nonCosmeticImages,
                croppedImage: "",
                croppedImages: [],
                regionLabel: "",
                // For second round, initialize final images
                finalCosmeticImage: isSecondRound ? (existingImages.finalCosmeticImages?.[0] || "") : "",
                finalCosmeticImages: isSecondRound ? (existingImages.finalCosmeticImages || []) : [],
                finalNonCosmeticImage: isSecondRound ? (existingImages.finalNonCosmeticImages?.[0] || "") : "",
                finalCroppedNonCosmeticImage: ""
            };

            // Add all custom column fields with empty values
            if (currentForm.customColumns) {
                currentForm.customColumns.forEach(col => {
                    newRow[col.id] = '';
                });
            }

            return {
                ...prev,
                [formKey]: {
                    ...currentForm,
                    rows: [...currentForm.rows, newRow]
                }
            };
        });
    };


    const updateChamberLoadsTimer = (loadId: number, testId: string, timerStatus: 'start' | 'stop', timerData: any) => {
        try {
            const chamberLoadsStr = localStorage.getItem('chamberLoads');
            if (!chamberLoadsStr) {
                console.warn('No chamberLoads found in localStorage');
                return;
            }

            const chamberLoads = JSON.parse(chamberLoadsStr);

            // Find the specific load by ID
            const loadIndex = chamberLoads.findIndex((load: any) => load.id === loadId);

            if (loadIndex === -1) {
                console.warn(`Load with ID ${loadId} not found`);
                return;
            }

            // Update the load with timer information
            const updatedLoad = {
                ...chamberLoads[loadIndex],
                timerStatus: timerStatus,
                timerStartTime: timerStatus === 'start' ? timerData.startTime : chamberLoads[loadIndex].timerStartTime,
                timerStopTime: timerStatus === 'stop' ? timerData.stopTime : undefined,
                timerLastUpdated: timerData.lastUpdated,
                timerRemainingSeconds: timerData.remainingSeconds,
                // Update the specific test in machineDetails
                machineDetails: {
                    ...chamberLoads[loadIndex].machineDetails,
                    tests: chamberLoads[loadIndex].machineDetails.tests.map((test: any) => {
                        if (test.id === testId) {
                            return {
                                ...test,
                                timerStatus: timerStatus,
                                timerStartTime: timerStatus === 'start' ? timerData.startTime : test.timerStartTime,
                                timerStopTime: timerStatus === 'stop' ? timerData.stopTime : undefined,
                                timerLastUpdated: timerData.lastUpdated,
                                timerRemainingSeconds: timerData.remainingSeconds,
                                status: timerStatus === 'start' ? 2 : test.status, // 2 = In Progress
                                statusText: timerStatus === 'start' ? 'In Progress' : test.statusText
                            };
                        }
                        return test;
                    })
                }
            };

            // Update the chamber loads array
            chamberLoads[loadIndex] = updatedLoad;

            // Save back to localStorage
            localStorage.setItem('chamberLoads', JSON.stringify(chamberLoads));

            console.log('Chamber loads updated successfully:', updatedLoad);
        } catch (error) {
            console.error('Error updating chamber loads timer:', error);
        }
    };

    const handleTimerToggle = (formKey: string, childTestId?: string) => {
        const timerKey = childTestId ? `${formKey}_${childTestId}` : formKey;
        const currentState = timerStates[timerKey];

        setTimerStates(prev => {
            const now = new Date().toISOString();
            const isStarting = !prev[timerKey]?.isRunning;

            const updatedState = {
                ...prev[timerKey],
                isRunning: isStarting,
                lastUpdated: now
            };

            if (isStarting) {
                // Starting the timer
                updatedState.startTime = now;
                updatedState.stopTime = undefined;
            } else {
                // Stopping the timer
                updatedState.stopTime = now;
            }

            // Update chamberLoads in localStorage
            if (currentRecord?.machineLoadData) {
                const formData = forms[formKey];
                const currentChildTest = formData?.childTests?.[formData.currentChildTestIndex || 0];
                const testId = currentChildTest?.id || currentTestRecord?.testId;

                if (testId) {
                    updateChamberLoadsTimer(
                        currentRecord.machineLoadData.loadId,
                        testId,
                        isStarting ? 'start' : 'stop',
                        updatedState
                    );
                }
            }

            return {
                ...prev,
                [timerKey]: updatedState
            };
        });
    };


    // Handle child test completion
    const handleChildTestComplete = (formKey: string) => {
        setForms(prev => {
            const currentForm = prev[formKey];
            const currentChildTestIndex = currentForm.currentChildTestIndex || 0;
            const childTests = currentForm.childTests || [];

            if (currentChildTestIndex < childTests.length - 1) {
                // Mark current child test as completed and move to next
                const updatedChildTests = [...childTests];
                updatedChildTests[currentChildTestIndex] = {
                    ...updatedChildTests[currentChildTestIndex],
                    isCompleted: true,
                    status: 'completed',
                    endTime: new Date().toISOString()
                };
                updatedChildTests[currentChildTestIndex + 1] = {
                    ...updatedChildTests[currentChildTestIndex + 1],
                    status: 'active',
                    startTime: new Date().toISOString()
                };

                // Create rows for next child test
                const nextChildTest = updatedChildTests[currentChildTestIndex + 1];
                const newRows: FormRow[] = [];

                currentForm.rows
                    .filter(row => row.childTestId === childTests[currentChildTestIndex].id)
                    .forEach((row, idx) => {
                        // Load existing images for the part
                        const existingImages = loadImagesFromStorage(row.partNumber);

                        newRows.push({
                            ...row,
                            id: Date.now() + idx,
                            srNo: idx + 1,
                            testDate: "",
                            childTestId: nextChildTest.id,
                            childTestName: nextChildTest.name,
                            cosmeticImage: existingImages.cosmeticImages[0] || "",
                            nonCosmeticImage: existingImages.nonCosmeticImages[0] || "",
                            cosmeticImages: existingImages.cosmeticImages,
                            nonCosmeticImages: existingImages.nonCosmeticImages,
                            croppedImage: "",
                            croppedImages: [],
                            regionLabel: "",
                            status: "Pending",
                            // For second round, initialize final images
                            finalCosmeticImage: isSecondRound ? (existingImages.finalCosmeticImages?.[0] || "") : "",
                            finalCosmeticImages: isSecondRound ? (existingImages.finalCosmeticImages || []) : [],
                            finalNonCosmeticImage: isSecondRound ? (existingImages.finalNonCosmeticImages?.[0] || "") : "",
                            finalCroppedNonCosmeticImage: ""
                        });
                    });

                return {
                    ...prev,
                    [formKey]: {
                        ...currentForm,
                        childTests: updatedChildTests,
                        currentChildTestIndex: currentChildTestIndex + 1,
                        rows: [...currentForm.rows, ...newRows]
                    }
                };
            } else {
                // Last child test completed
                const updatedChildTests = [...childTests];
                updatedChildTests[currentChildTestIndex] = {
                    ...updatedChildTests[currentChildTestIndex],
                    isCompleted: true,
                    status: 'completed',
                    endTime: new Date().toISOString()
                };

                return {
                    ...prev,
                    [formKey]: {
                        ...currentForm,
                        childTests: updatedChildTests
                    }
                };
            }
        });
    };

    // Handle child test change
    const handleChildTestChange = (formKey: string, childTestIndex: number) => {
        setForms(prev => ({
            ...prev,
            [formKey]: {
                ...prev[formKey],
                currentChildTestIndex: childTestIndex
            }
        }));
    };

    // Save form data
    const saveFormData = () => {
        if (!currentRecord) return false;

        try {
            // Update the current test record with form data
            const updatedTestRecords = currentRecord.testRecords.map((testRecord, index) => {
                const formKey = `test_${index}`;
                const formData = forms[formKey];

                if (!formData) return testRecord;

                // Calculate test status based on rows and child tests
                const rows = formData.rows || [];
                const childTests = formData.childTests || [];
                const allChildTestsCompleted = childTests.every(test => test.isCompleted);

                let status = "Pending";
                if (allChildTestsCompleted && rows.length > 0) {
                    console.log(allChildTestsCompleted, rows.length)
                    status = "Complete";
                } else if (rows.some(row => row.status === "Pass" || row.status === "Fail")) {

                    status = "In Progress";
                }

                return {
                    ...testRecord,
                    status: status,
                    testResults: formData.rows,
                    remark: formData.remark || "",
                    childTests: formData.childTests,
                    currentChildTestIndex: formData.currentChildTestIndex,
                    submittedAt: new Date().toISOString()
                };
            });

            // Update the current record
            const updatedRecord = {
                ...currentRecord,
                testRecords: updatedTestRecords,
                testingStatus: "In Testing"
            };

            setCurrentRecord(updatedRecord);

            console.log("Form data saved:", updatedRecord);
            return true;
        } catch (error) {
            console.error("Error saving form data:", error);
            return false;
        }
    };

    // Get current test record
    const currentTestRecord = currentRecord?.testRecords?.[currentTestIndex];

    // Get parts for current test
    const getPartsForCurrentTest = () => {
        if (!currentTestRecord) return [];
        return currentTestRecord.assignedParts;
    };

    // Render Image Upload Stage
    const renderImageUploadStage = () => {
        if (!currentRecord) return null;

        const currentTestParts = getPartsForCurrentTest();
        const formKey = `test_${currentTestIndex}`;
        const formData = forms[formKey];
        const currentChildTestIndex = formData?.currentChildTestIndex || 0;
        const currentChildTest = formData?.childTests?.[currentChildTestIndex];

        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Step 1: Upload Images by Test
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Current Test: <span className="font-semibold text-blue-600">
                                {currentTestRecord?.testName}
                            </span>
                            {currentChildTest && (
                                <span className="ml-2 text-gray-600">
                                    (Child Test: <span className="font-semibold">{currentChildTest.name}</span>)
                                </span>
                            )}
                        </p>
                        <div className="text-sm text-gray-500 mt-2">
                            Ticket: <span className="font-semibold">{currentRecord.ticketCode}</span> |
                            Project: <span className="font-semibold">{currentRecord.project}</span> |
                            Build: <span className="font-semibold">{currentRecord.build}</span> |
                            Type: <span className="font-semibold">{projectType}</span>
                        </div>
                        {isSecondRound && (
                            <div className="mt-2">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                    Second Round - Upload Final Images
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Test Navigation */}
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700">
                            Test {currentTestIndex + 1} of {currentRecord.testRecords.length}
                        </div>
                        <div className="flex gap-2">
                            {currentRecord.testRecords.map((test, idx) => (
                                <button
                                    key={test.testId}
                                    onClick={() => {
                                        saveFormData();
                                        setCurrentTestIndex(idx);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentTestIndex === idx
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    {test.testName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Machine Load Information - New Section */}
                {currentRecord.machineLoadData && (
                    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Machine Load Information</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Load ID: {currentRecord.machineLoadData.loadId}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <span className="text-sm text-gray-600">Machine/Chamber:</span>
                                <div className="font-semibold">{currentRecord.machineLoadData.chamber}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Total Parts Loaded:</span>
                                <div className="font-semibold">{currentRecord.machineLoadData.totalParts}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Loaded At:</span>
                                <div className="font-semibold">
                                    {new Date(currentRecord.machineLoadData.loadedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Estimated Completion:</span>
                                <div className="font-semibold">
                                    {new Date(currentRecord.machineLoadData.estimatedCompletion).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Duration:</span>
                                <div className="font-semibold">{currentRecord.machineLoadData.duration} hours</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Ticket:</span>
                                <div className="font-semibold">{currentRecord.machineLoadData.machineDetails.ticketCode}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Project:</span>
                                <div className="font-semibold">{currentRecord.machineLoadData.machineDetails.project}</div>
                            </div>
                        </div>

                        {/* Pre-uploaded Images Status */}
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="text-sm font-medium text-purple-800 mb-2">Pre-uploaded Images Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                    <span className="text-sm text-gray-600">Parts with images:</span>
                                    <span className="font-semibold ml-2">
                                        {currentRecord.machineLoadData.parts.filter(p => p.hasImages).length} / {currentRecord.machineLoadData.totalParts}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Cosmetic images:</span>
                                    <span className="font-semibold ml-2">
                                        {currentRecord.machineLoadData.parts.reduce((sum, part) => sum + (part.cosmeticImages?.length || 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Non-cosmetic images:</span>
                                    <span className="font-semibold ml-2">
                                        {currentRecord.machineLoadData.parts.reduce((sum, part) => sum + (part.nonCosmeticImages?.length || 0), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Child Test Progress */}
                {formData?.childTests && formData.childTests.length > 1 && (
                    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Child Tests Progress</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.childTests.map((childTest, index) => {
                                const isLocked = childTest.dependsOnPrevious &&
                                    formData.childTests?.some((test, idx) =>
                                        test.id === childTest.previousTestId &&
                                        test.status !== 'completed' &&
                                        idx < index
                                    );

                                return (
                                    <div
                                        key={childTest.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${currentChildTestIndex === index
                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                            : childTest.status === 'completed'
                                                ? 'bg-green-100 text-green-700 border-green-300'
                                                : isLocked
                                                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                        title={isLocked ? `Complete ${formData.childTests?.[index - 1]?.name} first` : ''}
                                        onClick={() => !isLocked && handleChildTestChange(formKey, index)}
                                    >
                                        <span className="font-medium">{childTest.name}</span>
                                        {childTest.status === 'completed' && (
                                            <CheckCircle size={16} />
                                        )}
                                        {isLocked && !childTest.status && (
                                            <Clock size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Current Test Info Card */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-sm text-gray-600">Test Name:</span>
                            <div className="font-semibold">{currentTestRecord?.testName}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Current Child Test:</span>
                            <div className="font-semibold">{currentChildTest?.name || 'None'}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Assigned Parts:</span>
                            <div className="font-semibold">{currentTestRecord?.assignedPartsCount}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Timing:</span>
                            <div className="font-semibold">{currentChildTest?.timing || currentTestRecord?.timing} hours</div>
                        </div>
                        <div className="col-span-2">
                            <span className="text-sm text-gray-600">Machine Equipment:</span>
                            <div className="font-semibold">{currentChildTest?.machineEquipment || currentTestRecord?.machineEquipment}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Test Condition:</span>
                            <div className="font-semibold">{currentTestRecord?.testCondition}</div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Status:</span>
                            <div className={`font-semibold ${currentChildTest?.status === 'completed' ? "text-green-600" :
                                currentChildTest?.status === 'active' ? "text-yellow-600" :
                                    "text-gray-600"
                                }`}>
                                {currentChildTest?.status?.toUpperCase() || "PENDING"}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 text-sm">
                        <span className="font-semibold">Project Type:</span> {projectType}
                        {shouldSplitImages(currentTestRecord?.testName) ? (
                            <span className="ml-2 text-blue-600">
                                (Non-cosmetic images will be split)
                            </span>
                        ) : (
                            <span className="ml-2 text-green-600">
                                (No image splitting required)
                            </span>
                        )}
                    </div>
                </div>

                {/* Parts for Current Test */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Assigned Parts for {currentChildTest?.name || currentTestRecord?.testName}
                            {isSecondRound && <span className="ml-2 text-red-600">(Second Round - Final Images)</span>}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {currentTestParts.length} Parts
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTestParts.map((part) => {
                            const rowData = formData?.rows?.find(row =>
                                row.partNumber === part.partNumber &&
                                row.childTestId === currentChildTest?.id
                            );
                            const existingImages = loadImagesFromStorage(part.partNumber);

                            return (
                                <div key={part.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-bold text-gray-800 text-lg">{part.partNumber}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${part.scanStatus === 'OK'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {part.scanStatus}
                                                </span>

                                                {/* Show pre-uploaded images badge */}
                                                {(existingImages.cosmeticImages.length > 0 || existingImages.nonCosmeticImages.length > 0 || (isSecondRound && (existingImages.finalCosmeticImages?.length || 0) > 0) || (isSecondRound && (existingImages.finalNonCosmeticImages?.length || 0) > 0)) && (
                                                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                                                        <ImageIcon size={10} />
                                                        {isSecondRound ? 'Final images loaded' : 'Images loaded from storage'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Serial:</span> {part.serialNumber}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-1">
                                                <span className="font-medium">Location:</span> {part.location}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Assigned:</span> {part.assignedToTest}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${rowData?.status === "Pass" ? "bg-green-100 text-green-800" :
                                            rowData?.status === "Fail" ? "bg-red-100 text-red-800" :
                                                rowData?.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-gray-100 text-gray-800"
                                            }`}>
                                            {rowData?.status || "Not Started"}
                                        </span>
                                    </div>

                                    {/* Image Upload Section */}
                                    <div className="space-y-4">
                                        {/* Cosmetic Images */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {isSecondRound ? 'Final Cosmetic Images' : 'Cosmetic Images'}
                                            </label>

                                            {/* Display pre-uploaded cosmetic images */}
                                            {(isSecondRound ? existingImages.finalCosmeticImages : existingImages.cosmeticImages).length > 0 ? (
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-1">
                                                        {isSecondRound ? 'Final ' : 'Pre-uploaded '}images ({(isSecondRound ? existingImages.finalCosmeticImages : existingImages.cosmeticImages).length}):
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {(isSecondRound ? existingImages.finalCosmeticImages : existingImages.cosmeticImages).map((img, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={img}
                                                                    alt={`${isSecondRound ? 'Final Cosmetic' : 'Cosmetic'} ${index + 1}`}
                                                                    className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                />
                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                    {isSecondRound ? 'Final ' : 'Pre-uploaded '} {index + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Images loaded from storage. To add more, upload below:
                                                    </div>
                                                </div>
                                            ) : (isSecondRound ? rowData?.finalCosmeticImages : rowData?.cosmeticImages) && (isSecondRound ? rowData.finalCosmeticImages : rowData.cosmeticImages).length > 0 ? (
                                                <div className="mb-3">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {(isSecondRound ? rowData.finalCosmeticImages : rowData.cosmeticImages).map((img, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={img}
                                                                    alt={`${isSecondRound ? 'Final Cosmetic' : 'Cosmetic'} ${index + 1}`}
                                                                    className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                />
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Remove this specific image
                                                                        const formKey = `test_${currentTestIndex}`;
                                                                        const formData = forms[formKey];

                                                                        if (formData) {
                                                                            const updatedRows = formData.rows.map(row => {
                                                                                if (row.partNumber === part.partNumber && row.childTestId === currentChildTest?.id) {
                                                                                    if (isSecondRound) {
                                                                                        const updatedFinalCosmeticImages = [...(row.finalCosmeticImages || [])];
                                                                                        updatedFinalCosmeticImages.splice(index, 1);

                                                                                        return {
                                                                                            ...row,
                                                                                            finalCosmeticImages: updatedFinalCosmeticImages,
                                                                                            finalCosmeticImage: updatedFinalCosmeticImages[0] || ""
                                                                                        };
                                                                                    } else {
                                                                                        const updatedCosmeticImages = [...(row.cosmeticImages || [])];
                                                                                        updatedCosmeticImages.splice(index, 1);

                                                                                        return {
                                                                                            ...row,
                                                                                            cosmeticImages: updatedCosmeticImages,
                                                                                            cosmeticImage: updatedCosmeticImages[0] || ""
                                                                                        };
                                                                                    }
                                                                                }
                                                                                return row;
                                                                            });

                                                                            setForms(prev => ({
                                                                                ...prev,
                                                                                [formKey]: {
                                                                                    ...prev[formKey],
                                                                                    rows: updatedRows
                                                                                }
                                                                            }));
                                                                        }
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                    title="Remove this image"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                                {/* <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                    {isSecondRound ? 'Final ' : ''}Image {index + 1}
                                                                </div> */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {projectType === "Hulk" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.multiple = true;
                                                                input.onchange = (e) => {
                                                                    const files = (e.target as HTMLInputElement).files;
                                                                    if (files) {
                                                                        Array.from(files).forEach(file => {
                                                                            handleImageUpload(
                                                                                part.partNumber,
                                                                                currentTestRecord!.testName,
                                                                                'cosmetic',
                                                                                file,
                                                                                currentChildTest?.id
                                                                            );
                                                                        });
                                                                    }
                                                                };
                                                                input.click();
                                                            }}
                                                            className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors mt-2"
                                                        >
                                                            + Add More
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    No {isSecondRound ? 'final ' : ''}cosmetic images uploaded yet
                                                </div>
                                            )}

                                            {/* Upload button */}
                                            <label className={`flex items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-100'}`}
                                                style={{
                                                    borderColor: processing ? '#d1d5db' : isSecondRound ? '#a78bfa' : '#93c5fd',
                                                    backgroundColor: processing ? '#f3f4f6' : isSecondRound ? '#f5f3ff' : '#eff6ff'
                                                }}>
                                                <div className="text-center">
                                                    <Upload className={`mx-auto mb-1 ${processing ? 'text-gray-400' : isSecondRound ? 'text-purple-400' : 'text-blue-400'}`} size={20} />
                                                    <span className={`text-sm font-medium ${processing ? 'text-gray-500' : isSecondRound ? 'text-purple-600' : 'text-blue-600'}`}>
                                                        {processing ? 'Processing...' : `Upload ${isSecondRound ? 'Final ' : ''}Cosmetic Image${projectType === "Hulk" ? 's' : ''}`}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">Click to add image{projectType === "Hulk" ? 's' : ''}</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    multiple={projectType === "Hulk"}
                                                    onChange={(e) => {
                                                        if (e.target.files && !processing) {
                                                            Array.from(e.target.files).forEach(file => {
                                                                handleImageUpload(
                                                                    part.partNumber,
                                                                    currentTestRecord!.testName,
                                                                    'cosmetic',
                                                                    file,
                                                                    currentChildTest?.id
                                                                );
                                                            });
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    disabled={processing}
                                                />
                                            </label>

                                            {/* Show total count */}
                                            {((isSecondRound ? existingImages.finalCosmeticImages : existingImages.cosmeticImages).length > 0 || (isSecondRound ? rowData?.finalCosmeticImages : rowData?.cosmeticImages)?.length > 0) && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Total: {(isSecondRound ? existingImages.finalCosmeticImages : existingImages.cosmeticImages).length + ((isSecondRound ? rowData?.finalCosmeticImages : rowData?.cosmeticImages)?.length || 0)} image(s)
                                                </div>
                                            )}
                                        </div>

                                        {/* Non-Cosmetic Images */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {isSecondRound ? 'Final Non-Cosmetic Images' : 'Non-Cosmetic Images'}
                                            </label>

                                            {processing && (
                                                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                                    <span className="text-sm text-blue-600">Processing with OpenCV...</span>
                                                </div>
                                            )}

                                            {/* Only show existing images if NOT in second round */}
                                            {!isSecondRound && existingImages.nonCosmeticImages.length > 0 ? (
                                                <div className="mb-3">
                                                    <div className="text-xs text-gray-500 mb-1">
                                                        Pre-uploaded images
                                                    </div>
                                                    <div className="space-y-4">
                                                        {existingImages.nonCosmeticImages.map((img, index) => {
                                                            const isProcessing = processingImages[`${part.partNumber}-${index}`];
                                                            const rowData = formData?.rows?.find(row =>
                                                                row.partNumber === part.partNumber &&
                                                                row.childTestId === currentChildTest?.id
                                                            );
                                                            const croppedImage = rowData?.croppedImages?.[index];

                                                            return (
                                                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                                                    <div className="flex flex-col md:flex-row gap-4">
                                                                        {/* Original non-cosmetic image */}
                                                                        <div className="flex-1">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={img}
                                                                                    alt={`Non-Cosmetic ${index + 1}`}
                                                                                    className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                                />
                                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                                    Pre-uploaded {index + 1}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Corresponding cropped image */}
                                                                        <div className="flex-1">
                                                                            {croppedImage ? (
                                                                                <div className="h-full flex flex-col justify-center">
                                                                                    <div className="text-xs text-gray-600 mb-1">
                                                                                        <span className="font-semibold">Detected Region:</span> {rowData?.regionLabel || "Processing..."}
                                                                                    </div>
                                                                                    <div className="flex justify-center">
                                                                                        <img
                                                                                            src={croppedImage}
                                                                                            alt={`Cropped ${index + 1}`}
                                                                                            className="w-24 h-24 object-contain border rounded-lg shadow-sm"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ) : isProcessing ? (
                                                                                <div className="h-full flex flex-col items-center justify-center">
                                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                                                                    <span className="text-xs text-gray-500">Processing cropped image...</span>
                                                                                </div>
                                                                            ) : !shouldSplitImages(currentTestRecord?.testName) ? (
                                                                                <div className="h-full flex flex-col items-center justify-center">
                                                                                    <div className="text-xs text-gray-500 text-center">
                                                                                        No splitting required for {projectType} project
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="h-full flex flex-col items-center justify-center">
                                                                                    <div className="text-xs text-gray-500 text-center">
                                                                                        Cropped image will appear here
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Images loaded from storage. To add more, upload below:
                                                    </div>
                                                </div>
                                            ) : (isSecondRound ? rowData?.nonCosmeticImages : rowData?.nonCosmeticImages) && (isSecondRound ? rowData.nonCosmeticImages : rowData.nonCosmeticImages).length > 0 ? (
                                                <div className="mb-3">
                                                    <div className="space-y-4">
                                                        {(isSecondRound ? rowData.nonCosmeticImages : rowData.nonCosmeticImages).map((img, index) => {
                                                            const croppedImage = rowData.croppedImages?.[index];

                                                            return (
                                                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                                                    <div className="flex flex-col md:flex-row gap-4">
                                                                        {/* Original non-cosmetic image */}
                                                                        <div className="flex-1">
                                                                            <div className="relative group">
                                                                                <img
                                                                                    src={img}
                                                                                    alt={`${isSecondRound ? 'Final Non-Cosmetic' : 'Non-Cosmetic'} ${index + 1}`}
                                                                                    className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                                />
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        // Remove this specific image and its cropped version
                                                                                        const formKey = `test_${currentTestIndex}`;
                                                                                        const formData = forms[formKey];

                                                                                        if (formData) {
                                                                                            const updatedRows = formData.rows.map(row => {
                                                                                                if (row.partNumber === part.partNumber && row.childTestId === currentChildTest?.id) {
                                                                                                    const updatedNonCosmeticImages = [...(row.nonCosmeticImages || [])];
                                                                                                    const updatedCroppedImages = [...(row.croppedImages || [])];

                                                                                                    // Remove from both arrays at same index
                                                                                                    updatedNonCosmeticImages.splice(index, 1);
                                                                                                    if (updatedCroppedImages[index]) {
                                                                                                        updatedCroppedImages.splice(index, 1);
                                                                                                    }

                                                                                                    return {
                                                                                                        ...row,
                                                                                                        nonCosmeticImages: updatedNonCosmeticImages,
                                                                                                        nonCosmeticImage: updatedNonCosmeticImages[0] || "",
                                                                                                        croppedImages: updatedCroppedImages,
                                                                                                        croppedImage: updatedCroppedImages[0] || "",
                                                                                                        ...(isSecondRound && {
                                                                                                            finalNonCosmeticImage: updatedNonCosmeticImages[0] || "",
                                                                                                            finalCroppedNonCosmeticImage: updatedCroppedImages[0] || ""
                                                                                                        })
                                                                                                    };
                                                                                                }
                                                                                                return row;
                                                                                            });

                                                                                            setForms(prev => ({
                                                                                                ...prev,
                                                                                                [formKey]: {
                                                                                                    ...prev[formKey],
                                                                                                    rows: updatedRows
                                                                                                }
                                                                                            }));
                                                                                        }
                                                                                    }}
                                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                                    title="Remove this image"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                                    {isSecondRound ? 'Final ' : ''}Image {index + 1}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Corresponding cropped image (if exists) */}
                                                                        <div className="flex-1">
                                                                            {croppedImage && shouldSplitImages(currentTestRecord?.testName) ? (
                                                                                <div className="h-full flex flex-col justify-center">
                                                                                    <div className="text-xs text-gray-600 mb-1">
                                                                                        <span className="font-semibold">Detected Region:</span> {rowData.regionLabel}
                                                                                    </div>
                                                                                    <div className="flex justify-center">
                                                                                        <img
                                                                                            src={croppedImage}
                                                                                            alt={`${isSecondRound ? 'Final Cropped' : 'Cropped'} ${index + 1}`}
                                                                                            className="w-24 h-24 object-contain border rounded-lg shadow-sm"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ) : shouldSplitImages(currentTestRecord?.testName) ? (
                                                                                <div className="h-full flex flex-col items-center justify-center">
                                                                                    <div className="text-xs text-gray-500 text-center">
                                                                                        Cropped image will appear here
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    No {isSecondRound ? 'final ' : ''}non-cosmetic images uploaded yet
                                                </div>
                                            )}

                                            {/* Upload button */}
                                            <label className={`flex items-center justify-center h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-400 hover:bg-green-100'}`}
                                                style={{
                                                    borderColor: processing ? '#d1d5db' : isSecondRound ? '#fdba74' : '#86efac',
                                                    backgroundColor: processing ? '#f3f4f6' : isSecondRound ? '#ffedd5' : '#f0fdf4'
                                                }}>
                                                <div className="text-center">
                                                    <Upload className={`mx-auto mb-1 ${processing ? 'text-gray-400' : isSecondRound ? 'text-orange-400' : 'text-green-400'}`} size={20} />
                                                    <span className={`text-sm font-medium ${processing ? 'text-gray-500' : isSecondRound ? 'text-orange-600' : 'text-green-600'}`}>
                                                        {processing ? 'Processing...' : `Upload ${isSecondRound ? 'Final ' : ''}Non-Cosmetic Image`}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">Click to add {isSecondRound ? 'new ' : ''}image</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0] && !processing) {
                                                            handleImageUpload(
                                                                part.partNumber,
                                                                currentTestRecord!.testName,
                                                                'nonCosmetic',
                                                                e.target.files[0],
                                                                currentChildTest?.id
                                                            );
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    disabled={processing}
                                                />
                                            </label>

                                            {/* Show total count - only for newly uploaded images */}
                                            {(isSecondRound ? rowData?.nonCosmeticImages : rowData?.nonCosmeticImages)?.length > 0 && (
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Total: {(isSecondRound ? rowData?.nonCosmeticImages : rowData?.nonCosmeticImages)?.length || 0} image(s) uploaded
                                                </div>
                                            )}

                                            {/* Show pre-uploaded count only in first round */}
                                            {!isSecondRound && existingImages.nonCosmeticImages.length > 0 && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Pre-uploaded: {existingImages.nonCosmeticImages.length} image(s) from storage
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    {currentTestIndex > 0 && (
                        <button
                            onClick={() => {
                                saveFormData();
                                setCurrentTestIndex(prev => prev - 1);
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-medium transition-colors"
                        >
                            <ChevronLeft size={20} className="mr-2" />
                            Previous Test
                        </button>
                    )}

                    {currentTestIndex < (currentRecord.testRecords.length - 1) ? (
                        <button
                            onClick={() => {
                                saveFormData();
                                setCurrentTestIndex(prev => prev + 1);
                            }}
                            className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
                        >
                            Next Test
                            <ChevronRight size={20} className="ml-2" />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                saveFormData();
                                setCurrentStage(1);
                            }}
                            className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-medium transition-colors"
                        >
                            Continue to Forms
                            <ChevronRight size={20} className="ml-2" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render Form Stage
    const renderFormStage = () => {
        if (!currentTestRecord) return null;

        const formKey = `test_${currentTestIndex}`;
        const formData = forms[formKey];

        if (!formData) return null;

        const currentChildTestIndex = formData.currentChildTestIndex || 0;
        const currentChildTest = formData.childTests?.[currentChildTestIndex];
        const checkpointHours = parseInt(currentChildTest?.timing || currentTestRecord.timing || "24");
        const timerKey = currentChildTest ? `${formKey}_${currentChildTest.id}` : formKey;
        const timerState = timerStates[timerKey] || { remainingSeconds: checkpointHours * 3600, isRunning: false };

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Test Navigation Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-full mx-auto px-6">
                        <div className="flex flex-wrap gap-2 py-4">
                            {currentRecord?.testRecords.map((test, idx) => (
                                <button
                                    key={test.testId}
                                    onClick={() => {
                                        saveFormData();
                                        setCurrentTestIndex(idx);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${currentTestIndex === idx
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {test.testName}
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${currentTestIndex === idx
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {test.assignedPartsCount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Current Test Header */}
                <div className="bg-white border-b border-gray-200 py-4">
                    <div className="max-w-full mx-auto px-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{currentTestRecord.testName}</h2>
                                <p className="text-gray-600 mt-1">
                                    Test {currentTestIndex + 1} of {currentRecord!.testRecords.length} |
                                    <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {currentTestRecord.processStage}
                                    </span>
                                    {currentChildTest && (
                                        <span className="ml-2 text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                                            Current: {currentChildTest.name}
                                        </span>
                                    )}
                                    {isSecondRound && (
                                        <span className="ml-2 text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                                            Second Round
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Project Type: <span className="font-semibold">{projectType}</span>
                                    {shouldSplitImages(currentTestRecord.testName) && (
                                        <span className="ml-2 text-blue-600">
                                            (Non-cosmetic images will be split)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Specification</p>
                                <p className="font-semibold text-gray-800">{currentTestRecord.specification}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <DefaultForm
                    formData={formData}
                    updateFormField={(field, value) => updateFormField(formKey, field, value)}
                    updateRowField={(rowId, field, value) => updateRowField(formKey, rowId, field, value)}
                    addRow={(partNumber) => addRow(formKey, partNumber)}
                    selectedParts={getPartsForCurrentTest()}
                    checkpointHours={checkpointHours}
                    formKey={formKey}
                    timerState={timerState}
                    onTimerToggle={() => handleTimerToggle(formKey, currentChildTest?.id)}
                    croppedRegions={croppedRegions.filter(region => {
                        const testParts = getPartsForCurrentTest().map(p => p.partNumber);
                        return testParts.includes(region.partNumber || '') &&
                            region.childTestId === currentChildTest?.id &&
                            region.isFinal === isSecondRound;
                    })}
                    isSecondRound={isSecondRound}
                    currentChildTest={currentChildTest}
                    onChildTestComplete={() => handleChildTestComplete(formKey)}
                    onChildTestChange={(childTestIndex) => handleChildTestChange(formKey, childTestIndex)}
                    machineLoadData={currentRecord.machineLoadData}
                    loadImagesFromStorage={loadImagesFromStorage}
                    projectType={projectType}
                    handleFinalImageUpload={handleFinalImageUpload}
                />
            </div>
        );
    };


    const handleSubmit = () => {
        const saved = saveFormData();

        if (!saved) {
            alert("Error saving form data. Please try again.");
            return;
        }

        console.log("Submitting form data:", forms);
        console.log("Shared images:", sharedImagesByPart);

        if (isSecondRound) {
            alert("Final submission complete! All test data and images have been recorded.");

            try {
                // Get testingLoadData from localStorage
                const testingLoadDataStr = localStorage.getItem("testingLoadData");

                if (testingLoadDataStr) {
                    const testingLoadData = JSON.parse(testingLoadDataStr);

                    // Update test records with form data and images
                    const updatedTestRecords = testingLoadData.testRecords.map((record: any) => {
                        // Find matching form data for this part
                        const formData = Object.values(forms).find(
                            (form: any) =>
                                form.partNumber === record.partNumber &&
                                form.serialNumber === record.serialNumber
                        );

                        if (formData) {
                            return {
                                ...record,
                                ...formData,
                                cosmeticImage: sharedImagesByPart[record.partNumber] || '',
                                status: "Completed",
                                completedAt: new Date().toISOString(),
                                isCompleted: true
                            };
                        }

                        return record;
                    });

                    // Update the main testingLoadData object
                    const updatedTestingLoadData = {
                        ...testingLoadData,
                        testRecords: updatedTestRecords,
                        status: "Completed",
                        completedAt: new Date().toISOString()
                    };

                    // Save updated testingLoadData back to localStorage
                    localStorage.setItem("testingLoadData", JSON.stringify(updatedTestingLoadData));

                    // Also save to stage2Records for historical tracking
                    const stage2RecordsStr = localStorage.getItem("stage2Records");
                    let stage2Records = stage2RecordsStr ? JSON.parse(stage2RecordsStr) : [];

                    // Check if this load already exists in stage2Records
                    const existingIndex = stage2Records.findIndex(
                        (record: any) => record.loadId === testingLoadData.loadId
                    );

                    if (existingIndex !== -1) {
                        // Update existing record
                        stage2Records[existingIndex] = updatedTestingLoadData;
                    } else {
                        // Add new record
                        stage2Records.push(updatedTestingLoadData);
                    }

                    localStorage.setItem("stage2Records", JSON.stringify(stage2Records));

                    console.log("Updated testingLoadData:", updatedTestingLoadData);
                    console.log("Saved to stage2Records");
                }

                // Navigate back or to success page
                navigate(-1);
            } catch (error) {
                console.error("Error saving data:", error);
                alert("Error saving final data. Please try again.");
            }
        } else {
            alert("Tests completed! You can now upload final non-cosmetic images for the second round.");

            // Save current progress to testingLoadData
            try {
                const testingLoadDataStr = localStorage.getItem("testingLoadData");

                if (testingLoadDataStr) {
                    const testingLoadData = JSON.parse(testingLoadDataStr);

                    const updatedTestRecords = testingLoadData.testRecords.map((record: any) => {
                        const formData = Object.values(forms).find(
                            (form: any) =>
                                form.partNumber === record.partNumber &&
                                form.serialNumber === record.serialNumber
                        );

                        if (formData) {
                            return {
                                ...record,
                                ...formData,
                                status: "First Round Completed"
                            };
                        }

                        return record;
                    });

                    testingLoadData.testRecords = updatedTestRecords;
                    localStorage.setItem("testingLoadData", JSON.stringify(testingLoadData));
                }
            } catch (error) {
                console.error("Error saving first round data:", error);
            }

            // Clear non-cosmetic images from all forms for second round
            setForms(prev => {
                const updatedForms = { ...prev };

                Object.keys(updatedForms).forEach(formKey => {
                    const formData = updatedForms[formKey];

                    // Update all rows to clear non-cosmetic images
                    const updatedRows = formData.rows.map(row => ({
                        ...row,
                        // Clear non-cosmetic images for fresh second round upload
                        nonCosmeticImages: [],
                        nonCosmeticImage: "",
                        croppedImages: [],
                        croppedImage: "",
                        regionLabel: "",
                        // Keep cosmetic images as they might be needed
                        // Initialize final image fields
                        finalNonCosmeticImage: "",
                        finalCroppedNonCosmeticImage: "",
                        finalCosmeticImage: "",
                        finalCosmeticImages: []
                    }));

                    updatedForms[formKey] = {
                        ...formData,
                        rows: updatedRows
                    };
                });

                return updatedForms;
            });

            // Clear cropped regions for fresh start
            setCroppedRegions([]);

            // Move to second round
            setIsSecondRound(true);
            setCurrentStage(0);
            setCurrentTestIndex(0);
        }
    };

    const stages = [
        { id: 0, name: "Image Upload" },
        { id: 1, name: "Test Forms" }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center">
                        {stages.map((stage, index) => (
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
                                            <CheckCircle size={18} />
                                        ) : (
                                            <span className="text-sm font-semibold">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${currentStage === index ? "text-blue-600" : "text-gray-600"
                                        }`}>
                                        {stage.name}
                                    </span>
                                </div>
                                {index < stages.length - 1 && (
                                    <div className={`h-1 w-16 mx-4 transition-colors ${currentStage > index ? "bg-green-500" : "bg-gray-200"
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
                    {currentStage === 1 && renderFormStage()}

                    {/* Navigation Buttons for Form Stage */}
                    {currentStage === 1 && (
                        <div className="p-6 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={() => setCurrentStage(0)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-semibold transition-colors"
                            >
                                <ChevronLeft size={20} className="mr-2" />
                                Back to Image Upload
                            </button>

                            {currentTestIndex < (currentRecord!.testRecords.length - 1) ? (
                                <button
                                    onClick={() => {
                                        saveFormData();
                                        setCurrentTestIndex(prev => prev + 1);
                                        setCurrentStage(0);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-semibold transition-colors"
                                >
                                    Next Test Form
                                    <ChevronRight size={20} className="ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-semibold transition-colors"
                                >
                                    <CheckCircle size={20} className="mr-2" />
                                    {isSecondRound ? 'Submit Final Data' : 'Complete All Tests'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}