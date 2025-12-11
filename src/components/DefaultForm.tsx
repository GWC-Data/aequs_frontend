import React, { useState, useEffect } from "react";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    ticketCode: string;
    projectName: string;
    color: string;
    testLocation: string;
    submissionDate: string;
    sampleConfig: string;
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
        checkpoint?: number;
        project: string[];
        lines: string[];
        selectedParts: string[] | Record<string, string[]>; // Updated: Can be array or object
        startTime: string;
        endTime: string;
        remark: string;
        submittedAt: string;
        testMode?: string; // Added: single or multi
    };
    forms?: any;
    completedTests?: string[];
    timerData?: {
        [formKey: string]: {
            remainingSeconds: number;
            isRunning: boolean;
            startedAt?: string;
        };
    };
}

interface FormRow {
    id: number;
    srNo: number;
    testDate: string;
    config: string;
    sampleId: string;
    status: string;
    partId: string;
    part?: string;
    cosmeticImage?: string;
    nonCosmeticImage?: string;
    croppedImage?: string;
    regionLabel?: string;
    finalNonCosmeticImage?: string;
    finalCroppedNonCosmeticImage?: string;
    [key: string]: any;
}

interface CustomColumn {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image';
    options?: string[];
}

interface FormData {
    testName: string;
    ers: string;
    testCondition: string;
    date: string;
    failureCriteria: string[];
    testStage: string;
    project: string;
    sampleQty: string;
    rows: FormRow[];
    customColumns?: CustomColumn[];
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
    partId?: string;
}

interface Stage {
    id: number;
    name: string;
    icon: any;
    formKey?: string;
    testType: 'default';
}

// DefaultForm Component
interface DefaultFormProps {
    formData: FormData;
    updateFormField: (field: string, value: any) => void;
    updateRowField: (rowId: number, field: string, value: string) => void;
    addRow: (partId?: string) => void;
    selectedParts: string[];
    checkpointHours: number;
    formKey: string;
    timerState: {
        remainingSeconds: number;
        isRunning: boolean;
    };
    onTimerToggle: () => void;
    croppedRegions: CroppedRegion[];
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
    isSecondRound = false
}: DefaultFormProps & { isSecondRound?: boolean }) {
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
            updateRowField(rowId, imageType === 'cosmetic' ? 'cosmeticImage' : 'nonCosmeticImage', e.target?.result as string);
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

    // Group rows by partId
    const rowsByPart = formData.rows.reduce((acc, row) => {
        if (!acc[row.partId]) {
            acc[row.partId] = [];
        }
        acc[row.partId].push(row);
        return acc;
    }, {} as Record<string, FormRow[]>);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{formData.testName}</h2>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">Checkpoint Hours</label>
                        <input
                            type="text"
                            value={checkpointHours}
                            readOnly
                            className="border h-10 w-20 border-gray-300 bg-gray-100 rounded-md px-2 text-center font-semibold"
                        />
                        <div className="flex flex-col items-center gap-2">
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

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                            <input value={formData.testName} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ERS</label>
                            <input value={formData.ers} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Stage</label>
                            <input value={formData.testStage} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
                            <input value={formData.project} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Failure Criteria
                            </label>
                            <input
                                type="text"
                                value={
                                    Array.isArray(formData.failureCriteria)
                                        ? formData.failureCriteria.join(", ")
                                        : formData.failureCriteria || ""
                                }
                                onChange={(e) =>
                                    updateFormField(
                                        "failureCriteria",
                                        e.target.value.split(",").map((v) => v.trim())
                                    )
                                }
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sample Qty</label>
                            <input value={formData.sampleQty} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium" />
                        </div>
                    </div>
                </div>

                {/* Parts Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Parts ({selectedParts.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedParts.map((part, index) => (
                            <div key={part} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">{part}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Part {index + 1}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Rows: {rowsByPart[part]?.length || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Test Data by Part</h3>
                    <button
                        onClick={() => setShowAddColumnModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Column
                    </button>
                </div>

                {/* Render table for each part */}
                {selectedParts.map((part) => (
                    <div key={part} className="mb-8">
                        <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-3">
                            <h4 className="font-semibold text-gray-800 flex items-center">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                    {selectedParts.indexOf(part) + 1}
                                </span>
                                Part: {part}
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

                                            {/* Cosmetic Image Column */}
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Cosmetic Image
                                            </th>

                                            {/* Non-Cosmetic Image Column */}
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Non-Cosmetic Image
                                            </th>

                                            {/* Cropped Image Column - existing */}
                                            <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                Cropped Image
                                            </th>

                                            {/* Final Non-Cosmetic Image Column - Second Round Only */}
                                            {isSecondRound && (
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Final Non-Cosmetic Image
                                                </th>
                                            )}

                                            {/* Final Cropped Non-Cosmetic Image Column - Second Round Only */}
                                            {isSecondRound && (
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                                    Final Cropped Non-Cosmetic Image
                                                </th>
                                            )}

                                            {/* Custom Columns */}
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
                                        {rowsByPart[part]?.map((row, index) => (
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

                                                {/* Cosmetic Image Upload */}
                                                <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        {!row.cosmeticImage ? (
                                                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
                                                                <Upload size={20} className="text-blue-400 mb-2" />
                                                                <span className="text-sm font-medium text-blue-600">Upload Cosmetic</span>
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
                                                            </label>
                                                        ) : (
                                                            <div className="relative">
                                                                <img
                                                                    src={row.cosmeticImage}
                                                                    alt="Cosmetic"
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
                                                                        onClick={() => updateRowField(row.id, 'cosmeticImage', '')}
                                                                        className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Non-Cosmetic Image Upload */}
                                                <td className="px-4 py-4 border-r border-gray-200 min-w-[200px]">
                                                    <div className="space-y-2">
                                                        {!row.nonCosmeticImage ? (
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
                                                        ) : (
                                                            <div className="relative">
                                                                <img
                                                                    src={row.nonCosmeticImage}
                                                                    alt="Non-Cosmetic"
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
                                                                        onClick={() => updateRowField(row.id, 'nonCosmeticImage', '')}
                                                                        className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Cropped Image Column */}
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

                                                {/* Final Non-Cosmetic Image Column - Second Round Only */}
                                                {isSecondRound && (
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
                                                )}

                                                {/* Final Cropped Non-Cosmetic Image Column - Second Round Only */}
                                                {isSecondRound && (
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
                                                )}

                                                {/* Custom Column Fields */}
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

                        <div className="flex justify-end mt-3">
                            <button
                                onClick={() => addRow(part)}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                + Add Row for {part}
                            </button>
                        </div>
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

// All available stages
const ALL_STAGES: Stage[] = [
    { id: 0, name: "Image Upload", icon: Upload, testType: 'default' },
];

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
    const [hasYellowMarks, setHasYellowMarks] = useState<boolean | null>(null);
    const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);
    const [currentRecord, setCurrentRecord] = useState<Stage2Record | null>(null);
    const [dynamicStages, setDynamicStages] = useState<Stage[]>([]);
    const [checkpointAlerts, setCheckpointAlerts] = useState<Record<string, boolean>>({});
    const [availableTestsToResume, setAvailableTestsToResume] = useState<{ recordId: number, testName: string, formKey: string, completed: boolean }[]>([]);
    const [timerStates, setTimerStates] = useState<Record<string, { remainingSeconds: number; isRunning: boolean }>>({});
    const [isSecondRound, setIsSecondRound] = useState(false);

    // Shared images by part
    const [sharedImagesByPart, setSharedImagesByPart] = useState<Record<string, { cosmetic: string | null, nonCosmetic: string | null }>>({});

    // Cropped regions with detected labels
    const [croppedRegions, setCroppedRegions] = useState<CroppedRegion[]>([]);

    // Form data for all forms
    const [forms, setForms] = useState<FormsState>({});
    const navigate = useNavigate();

    // Helper function to get selected parts based on test mode
    const getSelectedPartsArray = (): string[] => {
        if (!currentRecord?.stage2?.selectedParts) return [];

        const selectedParts = currentRecord.stage2.selectedParts;

        // For single test mode - it's already an array
        if (Array.isArray(selectedParts)) {
            return selectedParts;
        }

        // For multi test mode - it's an object, need to flatten
        if (typeof selectedParts === 'object' && selectedParts !== null) {
            // Get unique parts across all tests
            const allParts = new Set<string>();
            Object.values(selectedParts).forEach((parts: any) => {
                if (Array.isArray(parts)) {
                    parts.forEach(part => allParts.add(part));
                }
            });
            return Array.from(allParts);
        }

        return [];
    };

    // Get selected parts as array
    const selectedParts = getSelectedPartsArray();

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

    const isLastStage = currentStage === filteredStages.length - 1;

    // Load stage2Records from localStorage and initialize forms
    useEffect(() => {
        const storedRecords = localStorage.getItem("stage2Records");
        console.log(storedRecords);

        if (storedRecords) {
            try {
                const records: Stage2Record[] = JSON.parse(storedRecords);
                setStage2Records(records);

                // Prepare available tests for resume dropdown
                const testsToResume: { recordId: number, testName: string, formKey: string, completed: boolean }[] = [];

                records.forEach(record => {
                    if (record.forms) {
                        Object.keys(record.forms).forEach(formKey => {
                            const formData = record.forms[formKey];
                            const isCompleted = record.completedTests?.includes(formKey) || false;
                            testsToResume.push({
                                recordId: record.id,
                                testName: formData.testName,
                                formKey: formKey,
                                completed: isCompleted
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

                    // Get checkpoint hours (default to 0 if not available)
                    const checkpointHours = latestRecord.stage2.checkpoint || 0;

                    // Create dynamic stages based on test names
                    const newStages: Stage[] = [];
                    const newForms: FormsState = {};
                    const testSelections: string[] = [];
                    const initialTimerStates: Record<string, { remainingSeconds: number; isRunning: boolean }> = {};

                    testNames.forEach((testName, index) => {
                        const formKey = `test_${index}`;

                        testSelections.push(formKey);

                        // Create stage
                        newStages.push({
                            id: index + 1,
                            name: testName,
                            icon: CheckCircle,
                            formKey: formKey,
                            testType: 'default'
                        });

                        // Initialize timer state for this form
                        const savedTimerData = latestRecord.timerData?.[formKey];
                        if (savedTimerData) {
                            initialTimerStates[formKey] = {
                                remainingSeconds: savedTimerData.remainingSeconds,
                                isRunning: savedTimerData.isRunning
                            };
                        } else {
                            initialTimerStates[formKey] = {
                                remainingSeconds: checkpointHours * 3600, // Convert hours to seconds
                                isRunning: false
                            };
                        }

                        const initialRows: FormRow[] = [];
                        let srNo = 1;

                        // Get parts for this specific test (considering test mode)
                        let partsForThisTest: string[] = [];

                        if (latestRecord.stage2.testMode === 'multi' &&
                            typeof latestRecord.stage2.selectedParts === 'object') {
                            // Multi mode: Get parts for this specific test
                            const testParts = (latestRecord.stage2.selectedParts as Record<string, string[]>)[testName];
                            partsForThisTest = testParts || [];
                        } else {
                            // Single mode or fallback: Use all parts
                            partsForThisTest = getSelectedPartsArray();
                        }

                        // Create one row per part initially
                        partsForThisTest.forEach((part, partIndex) => {
                            initialRows.push({
                                id: srNo,
                                srNo: srNo,
                                testDate: "",
                                config: "",
                                sampleId: `${part}-${srNo}`,
                                status: "Pass",
                                partId: part,
                                cosmeticImage: "",
                                nonCosmeticImage: ""
                            });
                            srNo++;
                        });
                        newForms[formKey] = {
                            testName: testName,
                            ers: latestRecord.stage2.processStage || "",
                            testCondition: latestRecord.stage2.testCondition?.split(',')[index]?.trim() || "",
                            date: "",
                            failureCriteria: ["Data Collection"],
                            testStage: latestRecord.stage2.processStage || "After Assy",
                            project: latestRecord.projectName || "Light_Blue",
                            sampleQty: latestRecord.stage2.requiredQty?.split(',')[index]?.trim() || "32",
                            customColumns: [
                                {
                                    id: 'additional_image_column',
                                    label: 'Additional Image',
                                    type: 'image'
                                }
                            ],
                            rows: initialRows
                        };
                    });

                    setSelectedTests(testSelections);
                    setTimerStates(initialTimerStates);
                    setDynamicStages(newStages);
                    setForms(newForms);

                    // Initialize shared images by part
                    const initialImages: Record<string, { cosmetic: string | null, nonCosmetic: string | null }> = {};
                    selectedParts.forEach(part => {
                        initialImages[part] = { cosmetic: null, nonCosmetic: null };
                    });
                    setSharedImagesByPart(initialImages);
                }
            } catch (error) {
                console.error("Error parsing stage2 records:", error);
            }
        }
    }, []);

    // Timer countdown effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimerStates(prev => {
                const updated = { ...prev };
                let hasChanges = false;

                Object.keys(updated).forEach(formKey => {
                    if (updated[formKey].isRunning && updated[formKey].remainingSeconds > 0) {
                        updated[formKey] = {
                            ...updated[formKey],
                            remainingSeconds: updated[formKey].remainingSeconds - 1
                        };
                        hasChanges = true;
                    } else if (updated[formKey].isRunning && updated[formKey].remainingSeconds === 0) {
                        // Timer completed
                        updated[formKey] = {
                            ...updated[formKey],
                            isRunning: false
                        };
                        hasChanges = true;

                        // Show alert when timer completes
                        const stage = dynamicStages.find(s => s.formKey === formKey);
                        if (stage) {
                            alert(`⏰ Timer completed for ${stage.name}!`);
                        }
                    }
                });

                return hasChanges ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [dynamicStages]);

    // Save timer states to localStorage whenever they change
    useEffect(() => {
        if (currentRecord && Object.keys(timerStates).length > 0) {
            const storedRecords = localStorage.getItem("stage2Records");
            if (storedRecords) {
                try {
                    const records: Stage2Record[] = JSON.parse(storedRecords);
                    const currentRecordIndex = records.findIndex((r: Stage2Record) => r.id === currentRecord.id);

                    if (currentRecordIndex !== -1) {
                        const timerData: Record<string, any> = {};
                        Object.keys(timerStates).forEach(formKey => {
                            timerData[formKey] = {
                                remainingSeconds: timerStates[formKey].remainingSeconds,
                                isRunning: timerStates[formKey].isRunning,
                                startedAt: timerStates[formKey].isRunning ? new Date().toISOString() : undefined
                            };
                        });

                        records[currentRecordIndex] = {
                            ...records[currentRecordIndex],
                            timerData: timerData
                        };

                        localStorage.setItem("stage2Records", JSON.stringify(records));
                    }
                } catch (error) {
                    console.error("Error saving timer states:", error);
                }
            }
        }
    }, [timerStates, currentRecord]);

    // Add this function (around line 650, before useEffect hooks)
    const checkCheckpointAlerts = () => {
        if (!currentRecord?.stage2?.checkpoint) return;

        const checkpointHours = currentRecord.stage2.checkpoint;
        const now = new Date();

        Object.keys(forms).forEach(formKey => {
            const formData = forms[formKey];

            // Check each row for test start date
            formData.rows.forEach(row => {
                if (row.testDate) {
                    const testStartDate = new Date(row.testDate);
                    const checkpointTime = new Date(testStartDate.getTime() + (checkpointHours * 60 * 60 * 1000));

                    // Check if we've reached checkpoint time
                    if (now >= checkpointTime) {
                        const alertKey = `${formKey}_${row.id}_checkpoint`;

                        // Only alert once per row
                        if (!checkpointAlerts[alertKey]) {
                            alert(`⏰ Checkpoint Alert!\n\nTest: ${formData.testName}\nSample: ${row.sampleId}\nPart: ${row.partId}\n\nCheckpoint time (${checkpointHours} hours) has been reached!`);

                            setCheckpointAlerts(prev => ({
                                ...prev,
                                [alertKey]: true
                            }));
                        }
                    }
                }
            });
        });
    };

    // Add this useEffect after the timer countdown effect
    useEffect(() => {
        // Check checkpoints every minute
        const checkpointInterval = setInterval(() => {
            checkCheckpointAlerts();
        }, 60000); // Check every 60 seconds

        // Initial check
        checkCheckpointAlerts();

        return () => clearInterval(checkpointInterval);
    }, [forms, currentRecord, checkpointAlerts]);

    // Handle image upload for specific part
    const handleImageUpload = (partId: string, type: 'cosmetic' | 'nonCosmetic', file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;

            setSharedImagesByPart(prev => ({
                ...prev,
                [partId]: {
                    ...prev[partId],
                    [type]: imageUrl
                }
            }));

            // If cosmetic image, update all rows for this part
            if (type === "cosmetic") {
                Object.keys(forms).forEach(formKey => {
                    const formData = forms[formKey];
                    const rowsForPart = formData.rows.filter(row => row.partId === partId);

                    rowsForPart.forEach(row => {
                        updateRowField(formKey, row.id, 'cosmeticImage', imageUrl);
                    });
                });
            }

            if (type === "nonCosmetic") {
                processNonCosmeticImage(file, partId, imageUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (partId: string, type: 'cosmetic' | 'nonCosmetic') => {
        setSharedImagesByPart(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                [type]: null
            }
        }));

        if (type === "nonCosmetic") {
            // Clear cropped regions for this part if needed
            setCroppedRegions(prev => prev.filter(region => !region.data.includes(partId)));
        }
    };

    const processNonCosmeticImage = (file: File, partId: string, nonCosmeticImageUrl: string) => {
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

                    console.log(`Image for part ${partId} has yellow marks: ${hasMarks}`);

                    let detectedRegions: any[] = [];

                    if (hasMarks) {
                        detectedRegions = processImageWithYellowMarks(src, img);
                    } else {
                        detectedRegions = processImageWithoutYellowMarks(src, img);
                    }

                    console.log(`Detected regions for part ${partId}:`, detectedRegions);

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
                                partId: partId
                            });

                            console.log(`Part ${partId} - Region ${i}: ${detectedLabel} → ${category?.form} (${x},${y} ${width}x${height})`);

                            roi.delete();
                        } catch (err) {
                            console.error(`Error cropping region ${i}:`, err);
                        }
                    });

                    // Replace existing cropped regions for this part
                    setCroppedRegions(prev => {
                        const filtered = prev.filter(region => region.partId !== partId);
                        return [...filtered, ...croppedImages];
                    });

                    // Auto-populate rows based on cropped images
                    Object.keys(forms).forEach(formKey => {
                        const formData = forms[formKey];

                        if (isSecondRound) {
                            // Second round: Update existing rows with final images
                            const updatedRows = formData.rows.map((row, index) => {
                                // Match row by partId and index
                                if (row.partId === partId && croppedImages[index]) {
                                    return {
                                        ...row,
                                        finalNonCosmeticImage: nonCosmeticImageUrl,
                                        finalCroppedNonCosmeticImage: croppedImages[index].data
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
                            // First round: Create new rows as before
                            // Remove existing rows for this part
                            const otherRows = formData.rows.filter(row => row.partId !== partId);

                            // Get cosmetic image for this part
                            const cosmeticImage = sharedImagesByPart[partId]?.cosmetic || '';

                            // Create new rows based on cropped images
                            const newRows = croppedImages.map((croppedImage, index) => {
                                const srNo = otherRows.length + index + 1;
                                const baseRow: any = {
                                    id: Date.now() + index,
                                    srNo: srNo,
                                    testDate: "",
                                    config: "",
                                    sampleId: `${partId}-${index + 1}`,
                                    status: "Pass",
                                    partId: partId,
                                    part: partId,
                                    cosmeticImage: cosmeticImage,
                                    nonCosmeticImage: nonCosmeticImageUrl,
                                    croppedImage: croppedImage.data,
                                    regionLabel: croppedImage.label
                                };

                                // Add all custom column fields with empty values
                                if (formData.customColumns) {
                                    formData.customColumns.forEach(col => {
                                        baseRow[col.id] = '';
                                    });
                                }

                                return baseRow;
                            });

                            // Update forms with new rows
                            setForms(prev => ({
                                ...prev,
                                [formKey]: {
                                    ...prev[formKey],
                                    rows: [...otherRows, ...newRows].map((row, idx) => ({
                                        ...row,
                                        srNo: idx + 1
                                    }))
                                }
                            }));
                        }
                    });

                    setRegions(detectedRegions);
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

    // Rest of the OpenCV functions
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

    const addRow = (formKey: string, partId?: string) => {
        setForms(prev => {
            const currentForm = prev[formKey];
            const newId = Math.max(...currentForm.rows.map((r: any) => r.id)) + 1;

            // Create base row object
            const newRow: any = {
                id: newId,
                srNo: currentForm.rows.length + 1,
                testDate: "",
                config: "",
                sampleId: "",
                status: "Pass",
                partId: partId || currentForm.rows[0]?.partId || selectedParts[0],
                cosmeticImage: "",
                nonCosmeticImage: ""
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

    // Handle timer toggle
    const handleTimerToggle = (formKey: string) => {
        setTimerStates(prev => ({
            ...prev,
            [formKey]: {
                ...prev[formKey],
                isRunning: !prev[formKey].isRunning
            }
        }));
    };

    const handleSubmit = () => {
        try {
            const storedData = localStorage.getItem("stage2Records");
            const records: Stage2Record[] = storedData ? JSON.parse(storedData) : [];

            if (records.length > 0 && currentRecord) {
                const currentRecordIndex = records.findIndex((r: Stage2Record) => r.id === currentRecord.id);

                if (currentRecordIndex !== -1) {
                    const completedTests = Object.keys(forms);

                    // Prepare complete form data with ALL columns including newly added text columns
                    const formsWithCompleteData: any = {};

                    Object.keys(forms).forEach(formKey => {
                        const formData = forms[formKey];

                        // Get ALL custom columns for this form (including newly added ones)
                        const allCustomColumns = formData.customColumns || [];

                        formsWithCompleteData[formKey] = {
                            testName: formData.testName,
                            ers: formData.ers,
                            testCondition: formData.testCondition,
                            date: formData.date,
                            failureCriteria: formData.failureCriteria,
                            testStage: formData.testStage,
                            project: formData.project,
                            sampleQty: formData.sampleQty,
                            customColumns: allCustomColumns,
                            rows: formData.rows.map(row => {
                                // Create complete row object with ALL fields
                                const completeRow: any = {
                                    id: row.id,
                                    srNo: row.srNo,
                                    testDate: row.testDate || "",
                                    config: row.config || "",
                                    sampleId: row.sampleId || "",
                                    status: row.status || "Pass",
                                    partId: row.partId || "",
                                    cosmeticImage: row.cosmeticImage || "",
                                    nonCosmeticImage: row.nonCosmeticImage || "",
                                    croppedImage: row.croppedImage || "",
                                    regionLabel: row.regionLabel || "",
                                    finalNonCosmeticImage: row.finalNonCosmeticImage || "",
                                    finalCroppedNonCosmeticImage: row.finalCroppedNonCosmeticImage || ""
                                };

                                // Add ALL custom column values (including newly added text columns)
                                allCustomColumns.forEach(col => {
                                    completeRow[col.id] = row[col.id] !== undefined ? row[col.id] : '';
                                });

                                return completeRow;
                            })
                        };
                    });

                    const updatedRecord = {
                        ...records[currentRecordIndex],
                        forms: {
                            ...records[currentRecordIndex].forms,
                            ...formsWithCompleteData
                        },
                        status: isSecondRound ? "Completed" : "In Progress",
                        completedAt: new Date().toISOString(),
                        sharedImagesByPart: sharedImagesByPart,
                        croppedRegions: croppedRegions,
                        sampleQty: calculateTotalSampleQty(),
                        testCompletionDate: new Date().toISOString().split('T')[0],
                        completedTests: [
                            ...(records[currentRecordIndex].completedTests || []),
                            ...completedTests.filter(test => !records[currentRecordIndex].completedTests?.includes(test))
                        ],
                        checkpointAlerts: checkpointAlerts,
                    };

                    records[currentRecordIndex] = updatedRecord;
                    localStorage.setItem("stage2Records", JSON.stringify(records));

                    console.log("✅ Complete data saved with part-based structure:", {
                        recordId: updatedRecord.id,
                        formsCount: Object.keys(formsWithCompleteData).length,
                        parts: selectedParts,
                        sharedImagesByPart: sharedImagesByPart
                    });

                    if (isSecondRound) {
                        alert("✅ Final submission complete! Redirecting to settings...");
                        setTimeout(() => {
                            navigate("/settings");
                        }, 1500);
                    } else {
                        alert("✅ All Forms Completed! You can now upload additional non-cosmetic images.");

                        // Clear non-cosmetic images from sharedImagesByPart for fresh uploads
                        const clearedImages: Record<string, { cosmetic: string | null, nonCosmetic: string | null }> = {};
                        Object.keys(sharedImagesByPart).forEach(partId => {
                            clearedImages[partId] = {
                                cosmetic: sharedImagesByPart[partId].cosmetic, // Keep cosmetic images
                                nonCosmetic: null // Clear non-cosmetic images
                            };
                        });
                        setSharedImagesByPart(clearedImages);

                        // Redirect to stage 0 for second round
                        setIsSecondRound(true);
                        setCurrentStage(0);
                    }

                } else {
                    alert("❌ Record Not Found - Current record not found in storage");
                }
            } else {
                alert("❌ No Test Record Found - Please start a new test before submitting forms");
            }
        } catch (error) {
            alert("❌ Submission Failed - There was an error saving the test data. Please try again.");
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

    // Auto-start timer when moving to a form stage
    useEffect(() => {
        if (currentStage > 0 && currentStageData?.formKey) {
            const formKey = currentStageData.formKey;
            const timerState = timerStates[formKey];

            if (timerState && !timerState.isRunning && timerState.remainingSeconds > 0) {
                // Auto-start timer with a small delay to ensure state is ready
                const timer = setTimeout(() => {
                    handleTimerToggle(formKey);
                }, 100);

                return () => clearTimeout(timer);
            }
        }
    }, [currentStage, currentStageData?.formKey]);

    const renderCurrentForm = () => {
        if (!currentStageData?.formKey) return null;

        const formKey = currentStageData.formKey;
        const formData = forms[formKey];

        if (!formData) return null;

        const checkpointHours = currentRecord?.stage2?.checkpoint || 0;
        const timerState = timerStates[formKey] || { remainingSeconds: 0, isRunning: false };

        // Get the test name for this form
        const testName = formData.testName;

        // Get parts for this specific test (considering test mode)
        let partsForThisTest: string[] = [];

        if (currentRecord?.stage2?.testMode === 'multi' &&
            typeof currentRecord.stage2.selectedParts === 'object' &&
            currentRecord.stage2.selectedParts[testName]) {
            // Multi mode: Get parts for this specific test
            partsForThisTest = (currentRecord.stage2.selectedParts as Record<string, string[]>)[testName] || [];
        } else {
            // Single mode: Use all parts
            partsForThisTest = getSelectedPartsArray();
        }

        return (
            <DefaultForm
                formData={formData}
                updateFormField={(field, value) => updateFormField(formKey, field, value)}
                updateRowField={(rowId, field, value) => updateRowField(formKey, rowId, field, value)}
                addRow={(partId) => addRow(formKey, partId)}
                selectedParts={partsForThisTest} // Pass test-specific parts
                checkpointHours={checkpointHours}
                formKey={formKey}
                timerState={timerState}
                onTimerToggle={() => handleTimerToggle(formKey)}
                croppedRegions={croppedRegions}
                isSecondRound={isSecondRound}
            />
        );
    };

    const getPartsForTest = (testName: string): string[] => {
        if (!currentRecord?.stage2?.selectedParts) return [];

        const selectedParts = currentRecord.stage2.selectedParts;

        if (currentRecord.stage2.testMode === 'multi' &&
            typeof selectedParts === 'object' &&
            selectedParts[testName]) {
            // Multi mode: Get parts for this specific test
            return selectedParts[testName] as string[];
        } else if (Array.isArray(selectedParts)) {
            // Single mode: Use all parts
            return selectedParts;
        }

        return [];
    };

    const renderImageUploadStage = () => {
        // Helper to get all unique parts (for single mode or overview)
        const getAllUniqueParts = () => {
            if (!currentRecord?.stage2?.selectedParts) return [];

            const selectedParts = currentRecord.stage2.selectedParts;

            // For single test mode - it's already an array
            if (Array.isArray(selectedParts)) {
                return selectedParts;
            }

            // For multi test mode - it's an object, need to flatten and get unique
            if (typeof selectedParts === 'object' && selectedParts !== null) {
                const allParts = new Set<string>();
                Object.values(selectedParts).forEach((parts: any) => {
                    if (Array.isArray(parts)) {
                        parts.forEach(part => allParts.add(part));
                    }
                });
                return Array.from(allParts);
            }

            return [];
        };

        const allUniqueParts = getAllUniqueParts();

        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Step 1: Upload Images by Part</h2>

                {/* Current Record Info */}
                {currentRecord && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Current Test Record:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Ticket Code:</span>
                                <div className="font-semibold">{currentRecord.ticketCode}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Test Mode:</span>
                                <div className="font-semibold">{currentRecord.stage2.testMode || 'single'}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Process Stage:</span>
                                <div className="font-semibold">{currentRecord.stage2.processStage}</div>
                            </div>
                            <div>
                                <span className="text-gray-600">Total Parts:</span>
                                <div className="font-semibold">{allUniqueParts.length}</div>
                            </div>
                        </div>

                        {/* Show test-specific parts for multi mode */}
                        {currentRecord.stage2.testMode === 'multi' && typeof currentRecord.stage2.selectedParts === 'object' && (
                            <div className="mt-4 pt-4 border-t border-blue-100">
                                <h4 className="font-medium text-blue-700 mb-2">Test Distribution:</h4>
                                {Object.entries(currentRecord.stage2.selectedParts).map(([testName, parts]) => (
                                    <div key={testName} className="text-xs mb-1">
                                        <span className="font-semibold text-blue-600">{testName}:</span>
                                        <span className="ml-2 text-gray-600">{(parts as any[]).length} parts</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Parts Image Upload Section */}
                <div className="space-y-6">
                    {allUniqueParts.map((part, partIndex) => {
                        // Find which tests this part belongs to (for multi mode)
                        const testsForPart: string[] = [];
                        if (currentRecord?.stage2?.testMode === 'multi' &&
                            typeof currentRecord.stage2.selectedParts === 'object') {
                            Object.entries(currentRecord.stage2.selectedParts).forEach(([testName, parts]) => {
                                if ((parts as string[]).includes(part)) {
                                    testsForPart.push(testName);
                                }
                            });
                        }

                        return (
                            <div key={part} className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="font-semibold text-purple-600">{partIndex + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">Part: {part}</h3>
                                        {testsForPart.length > 0 && (
                                            <div className="mt-1">
                                                <span className="text-xs font-medium text-gray-600">Assigned to:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {testsForPart.map(testName => (
                                                        <span key={testName} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                            {testName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`grid ${isSecondRound ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                                    {/* Cosmetic Image for Part - Hidden in second round */}
                                    {!isSecondRound && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center mb-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                    <Upload className="text-blue-600" size={16} />
                                                </div>
                                                <h4 className="font-medium text-gray-700">Cosmetic Image</h4>
                                            </div>

                                            <label className="flex flex-col items-center justify-center h-40 cursor-pointer border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors bg-blue-50">
                                                {sharedImagesByPart[part]?.cosmetic ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={sharedImagesByPart[part].cosmetic!} alt={`Cosmetic ${part}`} className="w-full h-full object-contain p-2" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                clearImage(part, 'cosmetic');
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Upload className="mx-auto mb-2 text-blue-400" size={30} />
                                                        <span className="text-sm font-medium text-gray-700">Upload Cosmetic</span>
                                                        <span className="text-xs text-gray-500 block mt-1">For {part}</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(part, "cosmetic", e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {/* Non-Cosmetic Image for Part */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                                <Upload className="text-green-600" size={16} />
                                            </div>
                                            <h4 className="font-medium text-gray-700">{isSecondRound ? 'Final Non-Cosmetic Image' : 'Non-Cosmetic Image'}</h4>
                                        </div>

                                        <label className="flex flex-col items-center justify-center h-40 cursor-pointer border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors bg-green-50 relative">
                                            {processing && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
                                                    <div className="text-white text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                                        <span className="font-semibold text-xs">Processing...</span>
                                                    </div>
                                                </div>
                                            )}

                                            {sharedImagesByPart[part]?.nonCosmetic ? (
                                                <div className="relative w-full h-full">
                                                    <img src={sharedImagesByPart[part].nonCosmetic!} alt={`Non-Cosmetic ${part}`} className="w-full h-full object-contain p-2" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            clearImage(part, 'nonCosmetic');
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Upload className="mx-auto mb-2 text-green-400" size={30} />
                                                    <span className="text-sm font-medium text-gray-700">Upload Non-Cosmetic</span>
                                                    <span className="text-xs text-gray-500 block mt-1">For {part}</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(part, "nonCosmetic", e.target.files[0])}
                                                disabled={processing || !cvLoaded}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={() => setCurrentStage(1)}
                        disabled={allUniqueParts.length === 0 || dynamicStages.length === 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center font-semibold transition-colors"
                    >
                        Continue to Forms
                        <ChevronRight size={20} className="ml-2" />
                    </button>
                </div>
            </div>
        );
    };


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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
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