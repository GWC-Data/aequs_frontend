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

interface ChildTest {
    id: string;
    name: string;
    machineEquipment: string;
    timing: string;
    isCompleted: boolean;
    startTime?: string;
    endTime?: string;
    status: 'pending' | 'active' | 'completed';
    requiresImages?: boolean; // Whether this child test requires image upload
    dependsOnPrevious?: boolean; // Whether this test depends on previous test completion
    previousTestId?: string; // ID of the previous test this depends on
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
    cosmeticImages?: string[];
    nonCosmeticImages?: string[];
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
                croppedRegions?: CroppedRegion[];
            };
        };
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
    timerState: {
        remainingSeconds: number;
        isRunning: boolean;
    };
    onTimerToggle: () => void;
    croppedRegions: CroppedRegion[];
    isSecondRound?: boolean;
    currentChildTest?: ChildTest;
    onChildTestComplete: () => void;
    onChildTestChange: (childTestIndex: number) => void;
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
    onChildTestChange
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

    // Check if current child test is locked (depends on previous test)
    const isTestLocked = currentChildTest?.dependsOnPrevious && 
        formData.childTests?.some((test, index) => 
            test.id === currentChildTest.previousTestId && 
            test.status !== 'completed'
        );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                {/* Child Test Navigation */}
                {formData.childTests && formData.childTests.length > 1 && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Child Tests Progress</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.childTests.map((childTest, index) => {
                                const isLocked = childTest.dependsOnPrevious && 
                                    formData.childTests?.some((test, idx) => 
                                        test.id === childTest.previousTestId && 
                                        test.status !== 'completed' &&
                                        idx < index
                                    );
                                
                                return (
                                    <button
                                        key={childTest.id}
                                        onClick={() => !isLocked && onChildTestChange(index)}
                                        disabled={isLocked}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                            formData.currentChildTestIndex === index
                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                : childTest.status === 'completed'
                                                ? 'bg-green-100 text-green-700 border-green-300'
                                                : isLocked
                                                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                        }`}
                                        title={isLocked ? `Complete ${formData.childTests?.[index-1]?.name} first` : ''}
                                    >
                                        <span className="font-medium">{childTest.name}</span>
                                        {childTest.status === 'completed' && (
                                            <CheckCircle size={16} />
                                        )}
                                        {isLocked && !childTest.status && (
                                            <Clock size={16} className="text-gray-400" />
                                        )}
                                    </button>
                                );
                            })}
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
                                    {currentChildTest.dependsOnPrevious && (
                                        <span className="ml-2 text-sm text-yellow-600">
                                            (Requires previous test completion)
                                        </span>
                                    )}
                                </p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Machine: {currentChildTest.machineEquipment} | Timing: {currentChildTest.timing} hours
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`text-2xl font-mono font-bold ${timerState.isRunning ? 'text-green-600' : 'text-gray-700'}`}>
                                        {formatTime(timerState.remainingSeconds)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onTimerToggle}
                                        disabled={isTestLocked}
                                        className={`flex items-center w-fit border rounded-md px-4 py-2 font-semibold transition-colors ${
                                            isTestLocked 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : timerState.isRunning
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        <span>{timerState.isRunning ? 'Stop Timer' : 'Start Timer'}</span>
                                    </button>
                                </div>
                                {currentChildTest.status !== 'completed' && !isTestLocked && (
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
                        {isTestLocked && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <AlertCircle size={20} className="text-yellow-600 mr-2" />
                                    <span className="text-yellow-700">
                                        This test is locked. Please complete the previous test first.
                                    </span>
                                </div>
                            </div>
                        )}
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
                        {selectedParts.map((part, index) => (
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
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Test Data for {currentChildTest ? currentChildTest.name : 'All Tests'}
                        {isTestLocked && (
                            <span className="ml-2 text-sm text-yellow-600 font-normal">
                                (Locked - Complete previous test first)
                            </span>
                        )}
                    </h3>
                    {!isTestLocked && (
                        <button
                            onClick={() => setShowAddColumnModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            Add Column
                        </button>
                    )}
                </div>

                {/* Render table for each part */}
                {selectedParts.map((part) => (
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
                                {isTestLocked && (
                                    <span className="ml-2 text-sm text-yellow-600 font-normal">
                                        (Locked)
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
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Cosmetic Image
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Non-Cosmetic Image
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Cropped Image
                                            </th>
                                            {isSecondRound && (
                                                <>
                                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        Final Non-Cosmetic Image
                                                    </th>
                                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                        Final Cropped Non-Cosmetic Image
                                                    </th>
                                                </>
                                            )}
                                            {formData.customColumns?.map((column) => (
                                                <th key={column.id} className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 relative group">
                                                    <div className="flex items-center justify-between">
                                                        <span>{column.label}</span>
                                                        {!isTestLocked && (
                                                            <button
                                                                onClick={() => removeCustomColumn(column.id)}
                                                                className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 transition-opacity"
                                                                title="Remove column"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
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
                                                        onChange={(e) => !isTestLocked && updateRowField(row.id, 'testDate', e.target.value)}
                                                        disabled={isTestLocked}
                                                        className={`w-full min-w-[140px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            isTestLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 border-r border-gray-200">
                                                    <input
                                                        value={row.config}
                                                        onChange={(e) => !isTestLocked && updateRowField(row.id, 'config', e.target.value)}
                                                        disabled={isTestLocked}
                                                        className={`w-full min-w-[120px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            isTestLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 border-r border-gray-200">
                                                    <input
                                                        value={row.sampleId}
                                                        onChange={(e) => !isTestLocked && updateRowField(row.id, 'sampleId', e.target.value)}
                                                        disabled={isTestLocked}
                                                        className={`w-full min-w-[120px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            isTestLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        {!row.cosmeticImage ? (
                                                            <label className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
                                                                isTestLocked 
                                                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                                                    : 'border-blue-300 bg-blue-50 cursor-pointer hover:border-blue-400'
                                                            }`}>
                                                                <Upload size={20} className={`${isTestLocked ? 'text-gray-400' : 'text-blue-400'} mb-2`} />
                                                                <span className={`text-sm font-medium ${isTestLocked ? 'text-gray-500' : 'text-blue-600'}`}>
                                                                    Upload Cosmetic
                                                                </span>
                                                                {!isTestLocked && (
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleImageUpload(row.id, 'cosmetic', file);
                                                                            }
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                )}
                                                            </label>
                                                        ) : (
                                                            <div className="relative">
                                                                <img
                                                                    src={row.cosmeticImage}
                                                                    alt="Cosmetic"
                                                                    className="w-20 h-20 object-cover border rounded-lg"
                                                                />
                                                                {!isTestLocked && (
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
                                                                                        handleImageUpload(row.id, 'cosmetic', file);
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
                                                                            onClick={() => !isTestLocked && updateRowField(row.id, 'cosmeticImage', '')}
                                                                            className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        {!row.nonCosmeticImage ? (
                                                            <label className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
                                                                isTestLocked 
                                                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                                                    : 'border-green-300 bg-green-50 cursor-pointer hover:border-green-400'
                                                            }`}>
                                                                <Upload size={20} className={`${isTestLocked ? 'text-gray-400' : 'text-green-400'} mb-2`} />
                                                                <span className={`text-sm font-medium ${isTestLocked ? 'text-gray-500' : 'text-green-600'}`}>
                                                                    Upload Non-Cosmetic
                                                                </span>
                                                                {!isTestLocked && (
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
                                                                )}
                                                            </label>
                                                        ) : (
                                                            <div className="relative">
                                                                <img
                                                                    src={row.nonCosmeticImage}
                                                                    alt="Non-Cosmetic"
                                                                    className="w-20 h-20 object-cover border rounded-lg"
                                                                />
                                                                {!isTestLocked && (
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
                                                                                        handleImageUpload(row.id, 'nonCosmetic', file);
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
                                                                            onClick={() => !isTestLocked && updateRowField(row.id, 'nonCosmeticImage', '')}
                                                                            className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 border-r border-gray-200 min-w-[150px]">
                                                    {row.croppedImage ? (
                                                        <div className="space-y-2">
                                                            <img
                                                                src={row.croppedImage}
                                                                alt="Cropped"
                                                                className="w-20 h-20 object-contain border rounded-lg mx-auto"
                                                            />
                                                            {row.regionLabel && (
                                                                <div className="text-xs text-center font-semibold text-gray-700">
                                                                    {row.regionLabel}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-400 text-center">No crop</div>
                                                    )}
                                                </td>
                                                {isSecondRound && (
                                                    <>
                                                        <td className="px-4 py-4 border-r border-gray-200 min-w-[150px]">
                                                            {row.finalNonCosmeticImage ? (
                                                                <div className="space-y-2">
                                                                    <img
                                                                        src={row.finalNonCosmeticImage}
                                                                        alt="Final Non-Cosmetic"
                                                                        className="w-20 h-20 object-contain border rounded-lg mx-auto"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 text-center">No image</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 border-r border-gray-200 min-w-[150px]">
                                                            {row.finalCroppedNonCosmeticImage ? (
                                                                <div className="space-y-2">
                                                                    <img
                                                                        src={row.finalCroppedNonCosmeticImage}
                                                                        alt="Final Cropped"
                                                                        className="w-20 h-20 object-contain border rounded-lg mx-auto"
                                                                    />
                                                                    {row.regionLabel && (
                                                                        <div className="text-xs text-center font-semibold text-gray-700">
                                                                            {row.regionLabel}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 text-center">No crop</div>
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
                                                        onChange={(e) => !isTestLocked && updateRowField(row.id, 'status', e.target.value)}
                                                        disabled={isTestLocked}
                                                        className={`w-full min-w-[110px] px-3 py-2 border rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            isTestLocked 
                                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                                                                : row.status === "Pass" ? "bg-green-50 text-green-700 border-green-200" :
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

                        {!isTestLocked && (
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={() => addRow(part.partNumber)}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    + Add Row for {part.partNumber}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
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
    const [timerStates, setTimerStates] = useState<Record<string, { remainingSeconds: number; isRunning: boolean }>>({});
    const [croppedRegions, setCroppedRegions] = useState<CroppedRegion[]>([]);
    const [cvLoaded, setCvLoaded] = useState(false);
    const [hasYellowMarks, setHasYellowMarks] = useState<boolean | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

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
                const previousTestId = index > 0 ? `child-${Date.now()}-${index-1}` : undefined;
                
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
            const record = location.state.record as Stage2Record;
            console.log("Received record from navigation:", record);
            setCurrentRecord(record);
            
            // Initialize forms from the received record
            const initialForms: FormsState = {};
            const initialSharedImages: SharedImagesByPart = {};
            
            record.testRecords.forEach((testRecord, index) => {
                const formKey = `test_${index}`;
                
                // Parse child tests for combined tests
                const childTests = parseChildTests(
                    testRecord.testName,
                    testRecord.machineEquipment,
                    testRecord.machineEquipment2
                );
                
                // Initialize timer for each child test
                childTests.forEach((childTest, childIndex) => {
                    const childTimerKey = `${formKey}_${childTest.id}`;
                    const timingHours = parseInt(childTest.timing || "24");
                    setTimerStates(prev => ({
                        ...prev,
                        [childTimerKey]: {
                            remainingSeconds: timingHours * 3600,
                            isRunning: false
                        }
                    }));
                });
                
                // Check if test already has results
                if (testRecord.testResults && testRecord.testResults.length > 0) {
                    // Load existing results
                    initialForms[formKey] = {
                        testName: testRecord.testName,
                        processStage: testRecord.processStage,
                        testCondition: testRecord.testCondition,
                        date: testRecord.submittedAt ? new Date(testRecord.submittedAt).toISOString().split('T')[0] : "",
                        specification: testRecord.specification,
                        machineEquipment: testRecord.machineEquipment,
                        machineEquipment2: testRecord.machineEquipment2,
                        timing: testRecord.timing,
                        sampleQty: testRecord.requiredQuantity,
                        remark: testRecord.remark,
                        rows: testRecord.testResults,
                        customColumns: [],
                        childTests: childTests,
                        currentChildTestIndex: testRecord.currentChildTestIndex || 0
                    };
                } else {
                    // Initialize new rows for the first child test only
                    const initialRows: FormRow[] = [];
                    if (childTests.length > 0) {
                        // Only create rows for the first active child test
                        const activeChildTest = childTests.find(test => test.status === 'active');
                        if (activeChildTest) {
                            testRecord.assignedParts.forEach((part, idx) => {
                                initialRows.push({
                                    id: Date.now() + idx,
                                    srNo: idx + 1,
                                    testDate: new Date().toISOString().split('T')[0],
                                    config: "",
                                    sampleId: part.serialNumber,
                                    status: "Pending",
                                    partNumber: part.partNumber,
                                    serialNumber: part.serialNumber,
                                    childTestId: activeChildTest.id,
                                    childTestName: activeChildTest.name,
                                    cosmeticImage: "",
                                    nonCosmeticImage: "",
                                    croppedImage: "",
                                    regionLabel: ""
                                });
                            });
                        }
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
                }
                
                // Initialize shared images for each part
                testRecord.assignedParts.forEach(part => {
                    if (!initialSharedImages[part.partNumber]) {
                        initialSharedImages[part.partNumber] = {
                            cosmetic: [],
                            nonCosmetic: [],
                            childTestImages: {}
                        };
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
        } else {
            console.error("No record found in navigation state");
            alert("No record selected. Please select a record first.");
            navigate(-1);
        }
    }, [location.state, navigate]);

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
                            remainingSeconds: updated[timerKey].remainingSeconds - 1
                        };
                        hasChanges = true;
                    } else if (updated[timerKey].isRunning && updated[timerKey].remainingSeconds === 0) {
                        updated[timerKey] = {
                            ...updated[timerKey],
                            isRunning: false
                        };
                        hasChanges = true;

                        // Show alert when timer completes
                        alert(`⏰ Timer completed!`);
                    }
                });

                return hasChanges ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
    const processNonCosmeticImage = (file: File, partNumber: string, testName: string, childTestId?: string) => {
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
                                childTestId: childTestId
                            });

                            console.log(`Part ${partNumber} - Region ${i}: ${detectedLabel} → ${category?.form}`);

                            roi.delete();
                        } catch (err) {
                            console.error(`Error cropping region ${i}:`, err);
                        }
                    });

                    // Store cropped regions per child test
                    setCroppedRegions(prev => {
                        const filtered = prev.filter(region => 
                            !(region.partNumber === partNumber && region.childTestId === childTestId)
                        );
                        return [...filtered, ...croppedImages];
                    });

                    // Update shared images with cropped regions
                    const imageUrl = e.target?.result as string;
                    setSharedImagesByPart(prev => ({
                        ...prev,
                        [partNumber]: {
                            ...prev[partNumber],
                            nonCosmetic: [...(prev[partNumber]?.nonCosmetic || []), imageUrl],
                            childTestImages: {
                                ...prev[partNumber]?.childTestImages,
                                [childTestId || 'default']: {
                                    cosmetic: prev[partNumber]?.childTestImages?.[childTestId || 'default']?.cosmetic || [],
                                    nonCosmetic: [...(prev[partNumber]?.childTestImages?.[childTestId || 'default']?.nonCosmetic || []), imageUrl],
                                    croppedRegions: croppedImages
                                }
                            }
                        }
                    }));

                    // Update form rows for current test
                    const formKey = `test_${currentTestIndex}`;
                    const formData = forms[formKey];
                    
                    if (formData) {
                        const currentChildTest = formData.childTests?.[formData.currentChildTestIndex || 0];
                        
                        if (isSecondRound) {
                            // Second round: Update existing rows with final images
                            const updatedRows = formData.rows.map((row, index) => {
                                if (row.partNumber === partNumber && row.childTestId === childTestId && croppedImages[index]) {
                                    return {
                                        ...row,
                                        finalNonCosmeticImage: imageUrl,
                                        finalCroppedNonCosmeticImage: croppedImages[index].data,
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
                            // First round: Update existing rows or create new ones
                            const existingRowIndex = formData.rows.findIndex(row => 
                                row.partNumber === partNumber && row.childTestId === childTestId
                            );
                            
                            if (existingRowIndex >= 0) {
                                // Update existing row
                                const updatedRows = [...formData.rows];
                                updatedRows[existingRowIndex] = {
                                    ...updatedRows[existingRowIndex],
                                    nonCosmeticImage: imageUrl,
                                    croppedImage: croppedImages[0]?.data || "",
                                    regionLabel: croppedImages[0]?.label || "",
                                    testDate: new Date().toISOString().split('T')[0],
                                    status: updatedRows[existingRowIndex].status === "Pending" ? "In Progress" : updatedRows[existingRowIndex].status
                                };
                                
                                setForms(prev => ({
                                    ...prev,
                                    [formKey]: {
                                        ...prev[formKey],
                                        rows: updatedRows
                                    }
                                }));
                            } else {
                                // Create new row for this child test
                                const newRow: FormRow = {
                                    id: Date.now(),
                                    srNo: formData.rows.filter(row => row.childTestId === childTestId).length + 1,
                                    testDate: new Date().toISOString().split('T')[0],
                                    config: "",
                                    sampleId: `${partNumber}-${formData.rows.filter(row => row.childTestId === childTestId).length + 1}`,
                                    status: "In Progress",
                                    partNumber: partNumber,
                                    serialNumber: "",
                                    childTestId: childTestId,
                                    childTestName: currentChildTest?.name,
                                    nonCosmeticImage: imageUrl,
                                    croppedImage: croppedImages[0]?.data || "",
                                    regionLabel: croppedImages[0]?.label || ""
                                };
                                
                                setForms(prev => ({
                                    ...prev,
                                    [formKey]: {
                                        ...prev[formKey],
                                        rows: [...prev[formKey].rows, newRow]
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

    // Handle image upload
    const handleImageUpload = (partNumber: string, testName: string, type: 'cosmetic' | 'nonCosmetic', file: File, childTestId?: string) => {
        setProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            
            if (type === 'nonCosmetic') {
                // Process non-cosmetic image with OpenCV
                processNonCosmeticImage(file, partNumber, testName, childTestId);
            } else {
                // Handle cosmetic image normally
                const formKey = `test_${currentTestIndex}`;
                const formData = forms[formKey];
                const currentChildTest = formData?.childTests?.[formData.currentChildTestIndex || 0];
                
                setSharedImagesByPart(prev => ({
                    ...prev,
                    [partNumber]: {
                        ...prev[partNumber],
                        [type]: [...(prev[partNumber]?.[type] || []), imageUrl],
                        childTestImages: {
                            ...prev[partNumber]?.childTestImages,
                            [childTestId || 'default']: {
                                cosmetic: [...(prev[partNumber]?.childTestImages?.[childTestId || 'default']?.cosmetic || []), imageUrl],
                                nonCosmetic: prev[partNumber]?.childTestImages?.[childTestId || 'default']?.nonCosmetic || []
                            }
                        }
                    }
                }));
                
                // Update form rows
                if (formData) {
                    const existingRowIndex = formData.rows.findIndex(row => 
                        row.partNumber === partNumber && row.childTestId === childTestId
                    );
                    
                    if (existingRowIndex >= 0) {
                        // Update existing row
                        const updatedRows = [...formData.rows];
                        updatedRows[existingRowIndex] = {
                            ...updatedRows[existingRowIndex],
                            cosmeticImage: imageUrl,
                            testDate: new Date().toISOString().split('T')[0],
                            status: updatedRows[existingRowIndex].status === "Pending" ? "In Progress" : updatedRows[existingRowIndex].status
                        };
                        
                        setForms(prev => ({
                            ...prev,
                            [formKey]: {
                                ...prev[formKey],
                                rows: updatedRows
                            }
                        }));
                    } else {
                        // Create new row for this child test
                        const newRow: FormRow = {
                            id: Date.now(),
                            srNo: formData.rows.filter(row => row.childTestId === childTestId).length + 1,
                            testDate: new Date().toISOString().split('T')[0],
                            config: "",
                            sampleId: `${partNumber}-${formData.rows.filter(row => row.childTestId === childTestId).length + 1}`,
                            status: "In Progress",
                            partNumber: partNumber,
                            serialNumber: "",
                            childTestId: childTestId,
                            childTestName: currentChildTest?.name,
                            cosmeticImage: imageUrl
                        };
                        
                        setForms(prev => ({
                            ...prev,
                            [formKey]: {
                                ...prev[formKey],
                                rows: [...prev[formKey].rows, newRow]
                            }
                        }));
                    }
                }
                setProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (partNumber: string, type: 'cosmetic' | 'nonCosmetic', childTestId?: string) => {
        setSharedImagesByPart(prev => {
            const updated = { ...prev };
            
            if (childTestId && updated[partNumber]?.childTestImages?.[childTestId]) {
                updated[partNumber].childTestImages[childTestId][type] = [];
            } else {
                updated[partNumber] = {
                    ...updated[partNumber],
                    [type]: []
                };
            }
            
            return updated;
        });
        
        // Update form rows
        const formKey = `test_${currentTestIndex}`;
        const formData = forms[formKey];
        
        if (formData) {
            const updatedRows = formData.rows.map(row => {
                if (row.partNumber === partNumber && row.childTestId === childTestId) {
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
            
            // Check if current child test is locked
            const isLocked = currentChildTest?.dependsOnPrevious && 
                currentForm.childTests?.some((test, index) => 
                    test.id === currentChildTest.previousTestId && 
                    test.status !== 'completed'
                );
            
            if (isLocked) {
                alert(`Cannot add row. Please complete ${currentForm.childTests?.[currentChildTestIndex-1]?.name} first.`);
                return prev;
            }
            
            // Find rows for current child test
            const childTestRows = currentForm.rows.filter(row => row.childTestId === currentChildTest?.id);
            const newId = Math.max(...childTestRows.map(r => r.id), 0) + 1;
            
            // Find the part to assign the new row to
            const targetPartNumber = partNumber || childTestRows[0]?.partNumber || currentForm.rows[0]?.partNumber;
            const targetPart = currentRecord?.testRecords.find(tr => 
                tr.testName === currentForm.testName
            )?.assignedParts.find(p => p.partNumber === targetPartNumber);
            
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
                cosmeticImage: "",
                nonCosmeticImage: "",
                croppedImage: "",
                regionLabel: ""
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

    // Handle timer toggle for child test
    const handleTimerToggle = (formKey: string, childTestId?: string) => {
        const formData = forms[formKey];
        const currentChildTestIndex = formData?.currentChildTestIndex || 0;
        const currentChildTest = formData?.childTests?.[currentChildTestIndex];
        
        // Check if test is locked
        const isLocked = currentChildTest?.dependsOnPrevious && 
            formData.childTests?.some((test, index) => 
                test.id === currentChildTest.previousTestId && 
                test.status !== 'completed'
            );
        
        if (isLocked) {
            alert(`Cannot start timer. Please complete ${formData.childTests?.[currentChildTestIndex-1]?.name} first.`);
            return;
        }
        
        const timerKey = childTestId ? `${formKey}_${childTestId}` : formKey;
        setTimerStates(prev => ({
            ...prev,
            [timerKey]: {
                ...prev[timerKey],
                isRunning: !prev[timerKey]?.isRunning
            }
        }));
    };

    // Handle child test completion
    const handleChildTestComplete = (formKey: string) => {
        setForms(prev => {
            const currentForm = prev[formKey];
            const currentChildTestIndex = currentForm.currentChildTestIndex || 0;
            const childTests = currentForm.childTests || [];
            
            // Check if test is locked
            const isLocked = childTests[currentChildTestIndex]?.dependsOnPrevious && 
                childTests.some((test, index) => 
                    test.id === childTests[currentChildTestIndex].previousTestId && 
                    test.status !== 'completed'
                );
            
            if (isLocked) {
                alert(`Cannot complete test. Please complete ${childTests[currentChildTestIndex-1]?.name} first.`);
                return prev;
            }
            
            if (currentChildTestIndex < childTests.length - 1) {
                // Mark current child test as completed and move to next
                const updatedChildTests = [...childTests];
                updatedChildTests[currentChildTestIndex] = {
                    ...updatedChildTests[currentChildTestIndex],
                    isCompleted: true,
                    status: 'completed',
                    endTime: new Date().toISOString()
                };
                
                // Activate next child test
                const nextChildTestIndex = currentChildTestIndex + 1;
                updatedChildTests[nextChildTestIndex] = {
                    ...updatedChildTests[nextChildTestIndex],
                    status: 'active',
                    startTime: new Date().toISOString()
                };
                
                // Create rows for next child test ONLY when it becomes active
                const nextChildTest = updatedChildTests[nextChildTestIndex];
                const newRows: FormRow[] = [];
                
                // Get rows from previous child test to copy data if needed
                const previousRows = currentForm.rows.filter(row => 
                    row.childTestId === childTests[currentChildTestIndex].id
                );
                
                previousRows.forEach((row, idx) => {
                    // Create new row for next child test with empty images
                    // This ensures each child test has its own separate image uploads
                    newRows.push({
                        ...row,
                        id: Date.now() + idx,
                        srNo: idx + 1,
                        testDate: new Date().toISOString().split('T')[0],
                        childTestId: nextChildTest.id,
                        childTestName: nextChildTest.name,
                        cosmeticImage: "", // Clear images for new child test
                        nonCosmeticImage: "", // Clear images for new child test
                        croppedImage: "", // Clear cropped image
                        regionLabel: "", // Clear region label
                        status: "Pending" // Reset status
                    });
                });
                
                return {
                    ...prev,
                    [formKey]: {
                        ...currentForm,
                        childTests: updatedChildTests,
                        currentChildTestIndex: nextChildTestIndex,
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
        const formData = forms[formKey];
        const childTests = formData?.childTests || [];
        const targetTest = childTests[childTestIndex];
        
        // Check if the test to switch to is locked
        const isLocked = targetTest?.dependsOnPrevious && 
            childTests.some((test, index) => 
                test.id === targetTest.previousTestId && 
                test.status !== 'completed' &&
                index < childTestIndex
            );
        
        if (isLocked) {
            alert(`Cannot switch to ${targetTest.name}. Please complete ${childTests[childTestIndex-1]?.name} first.`);
            return;
        }
        
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

        // Check if current child test is locked
        const isTestLocked = currentChildTest?.dependsOnPrevious && 
            formData?.childTests?.some((test, index) => 
                test.id === currentChildTest.previousTestId && 
                test.status !== 'completed'
            );

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
                            Build: <span className="font-semibold">{currentRecord.build}</span>
                        </div>
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        currentTestIndex === idx
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
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                            currentChildTestIndex === index
                                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                : childTest.status === 'completed'
                                                ? 'bg-green-100 text-green-700 border-green-300'
                                                : isLocked
                                                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                        }`}
                                        title={isLocked ? `Complete ${formData.childTests?.[index-1]?.name} first` : ''}
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
                <div className={`mb-6 p-4 rounded-lg border ${isTestLocked ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
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
                            <div className={`font-semibold ${
                                currentChildTest?.status === 'completed' ? "text-green-600" :
                                currentChildTest?.status === 'active' ? (isTestLocked ? "text-yellow-600" : "text-blue-600") :
                                "text-gray-600"
                            }`}>
                                {isTestLocked ? "LOCKED" : currentChildTest?.status?.toUpperCase() || "PENDING"}
                            </div>
                        </div>
                    </div>
                    {isTestLocked && (
                        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                            <div className="flex items-center">
                                <AlertCircle size={16} className="text-yellow-600 mr-2" />
                                <span className="text-sm text-yellow-700">
                                    This test requires completion of previous test. Please complete "{formData?.childTests?.[currentChildTestIndex-1]?.name}" first.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Parts for Current Test */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Assigned Parts for {currentChildTest?.name || currentTestRecord?.testName}
                            {isTestLocked && (
                                <span className="ml-2 text-sm text-yellow-600 font-normal">
                                    (Locked - Complete previous test first)
                                </span>
                            )}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isTestLocked 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {currentTestParts.length} Parts {isTestLocked ? '(Locked)' : ''}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTestParts.map((part) => {
                            const rowData = formData?.rows?.find(row => 
                                row.partNumber === part.partNumber && 
                                row.childTestId === currentChildTest?.id
                            );
                            
                            return (
                                <div key={part.id} className={`bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
                                    isTestLocked ? 'border-gray-300' : 'border-gray-200'
                                }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-bold text-gray-800 text-lg">{part.partNumber}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    part.scanStatus === 'OK' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {part.scanStatus}
                                                </span>
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
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            rowData?.status === "Pass" ? "bg-green-100 text-green-800" :
                                            rowData?.status === "Fail" ? "bg-red-100 text-red-800" :
                                            rowData?.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                                            isTestLocked ? "bg-gray-100 text-gray-500" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                            {isTestLocked ? "Locked" : rowData?.status || "Not Started"}
                                        </span>
                                    </div>
                                    
                                    {/* Image Upload Section */}
                                    <div className="space-y-4">
                                        {/* Cosmetic Images */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cosmetic Image
                                            </label>
                                            
                                            {/* Display uploaded image */}
                                            {rowData?.cosmeticImage ? (
                                                <div className="mb-2">
                                                    <div className="relative group">
                                                        <img
                                                            src={rowData.cosmeticImage}
                                                            alt="Cosmetic"
                                                            className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(rowData.cosmeticImage, '_blank')}
                                                        />
                                                        {!isTestLocked && (
                                                            <button
                                                                onClick={() => removeImage(part.partNumber, 'cosmetic', currentChildTest?.id)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                title="Remove image"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}
                                            
                                            {/* Upload button */}
                                            <label className={`flex items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors ${
                                                isTestLocked 
                                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                                    : 'border-blue-300 bg-blue-50 cursor-pointer hover:border-blue-400 hover:bg-blue-100'
                                            }`}>
                                                <div className="text-center">
                                                    <Plus className={`${isTestLocked ? 'text-gray-400' : 'text-blue-400'} mx-auto mb-2`} size={24} />
                                                    <span className={`text-sm font-medium ${isTestLocked ? 'text-gray-500' : 'text-blue-600'}`}>
                                                        {rowData?.cosmeticImage ? 'Replace Cosmetic Image' : 'Add Cosmetic Image'}
                                                    </span>
                                                    {isTestLocked && (
                                                        <div className="text-xs text-gray-500 mt-1">Locked</div>
                                                    )}
                                                </div>
                                                {!isTestLocked && (
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleImageUpload(
                                                                    part.partNumber, 
                                                                    currentTestRecord!.testName, 
                                                                    'cosmetic', 
                                                                    e.target.files[0],
                                                                    currentChildTest?.id
                                                                );
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </label>
                                        </div>
                                        
                                        {/* Non-Cosmetic Images */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {isSecondRound ? 'Final Non-Cosmetic Image' : 'Non-Cosmetic Image'}
                                            </label>
                                            
                                            {processing && !isTestLocked && (
                                                <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                                    <span className="text-sm text-blue-600">Processing with OpenCV...</span>
                                                </div>
                                            )}
                                            
                                            {/* Display uploaded image and cropped results */}
                                            {rowData?.nonCosmeticImage && (
                                                <div className="mb-2 space-y-3">
                                                    <div className="relative group">
                                                        <img
                                                            src={rowData.nonCosmeticImage}
                                                            alt="Non-Cosmetic"
                                                            className="w-full h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(rowData.nonCosmeticImage, '_blank')}
                                                        />
                                                        {!isTestLocked && (
                                                            <button
                                                                onClick={() => removeImage(part.partNumber, 'nonCosmetic', currentChildTest?.id)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                title="Remove image"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Show cropped image if available */}
                                                    {rowData.croppedImage && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                <span className="font-semibold">Detected Region:</span> {rowData.regionLabel}
                                                            </p>
                                                            <div className="flex items-center justify-center">
                                                                <img
                                                                    src={rowData.croppedImage}
                                                                    alt="Cropped Region"
                                                                    className="w-20 h-20 object-contain border rounded-lg shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Upload button */}
                                            <label className={`flex items-center justify-center h-24 border-2 border-dashed rounded-lg transition-colors ${
                                                isTestLocked 
                                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                                                    : 'border-green-300 bg-green-50 cursor-pointer hover:border-green-400 hover:bg-green-100'
                                            }`}>
                                                <div className="text-center">
                                                    <Plus className={`${isTestLocked ? 'text-gray-400' : 'text-green-400'} mx-auto mb-2`} size={24} />
                                                    <span className={`text-sm font-medium ${isTestLocked ? 'text-gray-500' : 'text-green-600'}`}>
                                                        {isSecondRound 
                                                            ? (rowData?.finalNonCosmeticImage ? 'Replace Final Non-Cosmetic' : 'Add Final Non-Cosmetic')
                                                            : (rowData?.nonCosmeticImage ? 'Replace Non-Cosmetic' : 'Add Non-Cosmetic Image')
                                                        }
                                                    </span>
                                                    {isTestLocked && (
                                                        <div className="text-xs text-gray-500 mt-1">Locked</div>
                                                    )}
                                                </div>
                                                {!isTestLocked && (
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
                                                        disabled={processing || isTestLocked}
                                                    />
                                                )}
                                            </label>
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                        currentTestIndex === idx
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {test.testName}
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                        currentTestIndex === idx 
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
                               region.childTestId === currentChildTest?.id;
                    })}
                    isSecondRound={isSecondRound}
                    currentChildTest={currentChildTest}
                    onChildTestComplete={() => handleChildTestComplete(formKey)}
                    onChildTestChange={(childTestIndex) => handleChildTestChange(formKey, childTestIndex)}
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
            alert("✅ Final submission complete! All test data and images have been recorded.");
            
            // Here you would typically save to backend/localStorage
            const records = localStorage.getItem("stage2Records");
            if (records) {
                const parsed = JSON.parse(records);
                const updatedRecords = parsed.map((record: Stage2Record) => {
                    if (record.id === currentRecord?.id) {
                        return currentRecord;
                    }
                    return record;
                });
                localStorage.setItem("stage2Records", JSON.stringify(updatedRecords));
            }
            
            // Navigate back or to success page
            navigate(-1);
        } else {
            alert("✅ Tests completed! You can now upload final non-cosmetic images for the second round.");
            setIsSecondRound(true);
            setCurrentStage(0);
            setCurrentTestIndex(0);
        }
    };

    // Create stages array
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
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                                        currentStage === index
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
                                    <span className={`ml-2 text-sm font-medium ${
                                        currentStage === index ? "text-blue-600" : "text-gray-600"
                                    }`}>
                                        {stage.name}
                                    </span>
                                </div>
                                {index < stages.length - 1 && (
                                    <div className={`h-1 w-16 mx-4 transition-colors ${
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