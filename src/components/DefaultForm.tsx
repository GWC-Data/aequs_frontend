import React, { useState, useEffect } from "react";
import { Upload, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Plus } from "lucide-react";

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
    testDate: string;
    config: string;
    sampleId: string;
    status: string;
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
    addRow: () => void;
}

function DefaultForm({
    formData,
    updateFormField,
    updateRowField,
    addRow
}: DefaultFormProps) {
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumn, setNewColumn] = useState({
        label: '',
        type: 'text' as 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image',
        options: [] as string[]
    });
    const [newOption, setNewOption] = useState('');

    const handleAddColumn = () => {
        if (!newColumn.label.trim()) return;

        // Use the label (converted to a valid ID) instead of auto-generating one
        const columnId = newColumn.label.trim().toLowerCase().replace(/\s+/g, '_');

        const customColumn: CustomColumn = {
            id: columnId, // Use the label-based ID
            label: newColumn.label.trim(),
            type: newColumn.type,
            options: newColumn.type === 'select' ? newColumn.options : undefined
        };

        // Update custom columns
        const updatedCustomColumns = [...(formData.customColumns || []), customColumn];
        updateFormField('customColumns', updatedCustomColumns);

        // Add the new column to ALL existing rows with empty value
        formData.rows.forEach(row => {
            updateRowField(row.id, columnId, '');
        });

        // Reset modal state
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
        // Remove column from customColumns
        const updatedColumns = formData.customColumns?.filter(col => col.id !== columnId) || [];
        updateFormField('customColumns', updatedColumns);

        // Note: We keep the column data in rows to avoid breaking the table structure
        // The data will persist but won't be displayed
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
                console.log(`Image column ${column.id} for row ${row.srNo}:`, value ? `Image data length: ${value.length}` : 'No image');
                return (
                    <div className="space-y-2">
                        {!value ? (
                            // Show upload option when no image is present
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
                            // Show image preview when image is present
                            <div className="relative">
                                <img
                                    src={value}
                                    alt={`${column.label} preview`}
                                    className="w-20 h-20 object-cover border rounded-lg"
                                    onError={(e) => {
                                        console.error('Image failed to load for row', row.id);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    onLoad={() => console.log('Image loaded successfully for row', row.id)}
                                />
                                <div className="flex gap-1 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Replace image
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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-full mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{formData.testName}</h2>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">Hours</label>
                        <input
                            type="text"
                            className="border h-10 w-16 border-gray-300 outline-blue-500 rounded-md px-2"

                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="flex items-center w-fit border rounded-md bg-[#f35b62] text-white p-2 hover:bg-[#EE161F] hover:text-white transition-colors"
                            >
                                <span>Option to start</span>
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

                {/* Table Section */}
                <div className="flex items-center justify-end mb-3">
                    <button
                        onClick={() => setShowAddColumnModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Column
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300">
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-r border-gray-200">
                                        SR.No
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
                                {formData.rows.map((row, index) => (
                                    <tr key={row.id} className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                                        <td className="px-4 py-4 text-center font-semibold text-gray-900 border-r border-gray-200">
                                            {row.srNo}
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

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={addRow}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors shadow-sm"
                    >
                        + Add Row
                    </button>
                </div>
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

    // Load stage2Records from localStorage and initialize forms
    useEffect(() => {
        const storedRecords = localStorage.getItem("stage2Records");
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

                    // Create dynamic stages based on test names
                    const newStages: Stage[] = [];
                    const newForms: FormsState = {};
                    const testSelections: string[] = [];

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

                        // Initialize form data with single row initially and default Image column
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
                                    id: 'image_column',
                                    label: 'Image',
                                    type: 'image'
                                }
                            ],
                            rows: [
                                {
                                    id: 1, srNo: 1, testDate: "", config: "", sampleId: "", status: "Pass", image_column: ""
                                }
                            ]
                        };
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

    // Auto-generate rows based on cropped regions count
    useEffect(() => {
        if (croppedRegions.length > 0) {
            setForms(prev => {
                const updatedForms = { ...prev };

                Object.keys(updatedForms).forEach(formKey => {
                    const currentForm = updatedForms[formKey];
                    const rowCount = croppedRegions.length;

                    // Generate rows based on cropped regions count
                    const newRows = Array.from({ length: rowCount }, (_, index) => {
                        const region = croppedRegions[index];
                        return {
                            id: index + 1,
                            srNo: index + 1,
                            testDate: "",
                            config: "",
                            sampleId: region?.label || `Sample-${index + 1}`,
                            status: "Pass",
                            image_column: region?.data || "", // Auto-populate with cropped image
                            ...(currentForm.customColumns?.reduce((acc, col) => {
                                if (col.id !== 'image_column') {
                                    acc[col.id] = '';
                                }
                                return acc;
                            }, {} as any) || {})
                        };
                    });

                    updatedForms[formKey] = {
                        ...currentForm,
                        rows: newRows
                    };
                });

                return updatedForms;
            });
        }
    }, [croppedRegions]);


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

    // Load OpenCV
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

    // Image processing functions
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

    const handleImageUpload = (type: 'cosmetic' | 'nonCosmetic', file: File) => {
        const imageUrl = URL.createObjectURL(file);
        setSharedImages(prev => ({ ...prev, [type]: imageUrl }));

        if (type === "nonCosmetic") {
            processNonCosmeticImage(file);
        }
    };

    const clearImage = (type: 'cosmetic' | 'nonCosmetic') => {
        setSharedImages(prev => ({ ...prev, [type]: null }));

        if (type === "nonCosmetic") {
            setCroppedRegions([]);
            setHasYellowMarks(null);
        }
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

    // const addRow = (formKey: string) => {
    //     setForms(prev => {
    //         const currentForm = prev[formKey];
    //         const newId = Math.max(...currentForm.rows.map((r: any) => r.id)) + 1;
    //         const newRow = {
    //             id: newId,
    //             srNo: currentForm.rows.length + 1,
    //             ...Object.keys(currentForm.rows[0]).reduce((acc, key) => {
    //                 if (!['id', 'srNo'].includes(key)) {
    //                     (acc as any)[key] = "";
    //                 }
    //                 return acc;
    //             }, {} as any)
    //         };

    //         return {
    //             ...prev,
    //             [formKey]: {
    //                 ...currentForm,
    //                 rows: [...currentForm.rows, newRow]
    //             }
    //         };
    //     });
    // };

    // const handleSubmit = () => {
    //     try {
    //         const storedData = localStorage.getItem("stage2Records");
    //         const records: Stage2Record[] = storedData ? JSON.parse(storedData) : [];

    //         if (records.length > 0 && currentRecord) {
    //             const currentRecordIndex = records.findIndex((r: Stage2Record) => r.id === currentRecord.id);

    //             if (currentRecordIndex !== -1) {
    //                 // Mark all tests as completed
    //                 const completedTests = Object.keys(forms);

    //                 const updatedRecord = {
    //                     ...records[currentRecordIndex], // Use the existing record as base
    //                     forms: {
    //                         ...records[currentRecordIndex].forms, // Keep existing forms
    //                         ...forms // Update with new form data
    //                     },
    //                     status: "Completed",
    //                     completedAt: new Date().toISOString(),
    //                     sharedImages: sharedImages,
    //                     sampleQty: calculateTotalSampleQty(),
    //                     testCompletionDate: new Date().toISOString().split('T')[0],
    //                     completedTests: [
    //                         ...(records[currentRecordIndex].completedTests || []), // Keep existing completed tests
    //                         ...completedTests.filter(test => !records[currentRecordIndex].completedTests?.includes(test)) // Add new ones
    //                     ]
    //                 };

    //                 // Update the record in the array
    //                 records[currentRecordIndex] = updatedRecord;

    //                 // Save back to localStorage with the same key
    //                 localStorage.setItem("stage2Records", JSON.stringify(records));

    //                 console.log("Final Form Data:", updatedRecord);

    //                 // Show success message
    //                 alert("✅ All Forms Completed! Record has been saved successfully");

    //                 // Optional: Navigate away or reset state
    //                 // setCurrentStage(0);
    //                 // setForms({});
    //                 // setSharedImages({ cosmetic: null, nonCosmetic: null });

    //             } else {
    //                 alert("Record Not Found - Current record not found in storage");
    //             }
    //         } else {
    //             alert("No Test Record Found - Please start a new test before submitting forms");
    //         }
    //     } catch (error) {
    //         alert("Submission Failed - There was an error saving the test data. Please try again.");
    //         console.error("Error submitting forms:", error);
    //     }
    // };

    // Helper function to calculate total sample quantity

    const addRow = (formKey: string) => {
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
                status: "Pass"
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

    // const handleSubmit = () => {
    //     try {
    //         const storedData = localStorage.getItem("stage2Records");
    //         const records: Stage2Record[] = storedData ? JSON.parse(storedData) : [];

    //         if (records.length > 0 && currentRecord) {
    //             const currentRecordIndex = records.findIndex((r: Stage2Record) => r.id === currentRecord.id);

    //             if (currentRecordIndex !== -1) {
    //                 const completedTests = Object.keys(forms);

    //                 // Prepare complete form data with all columns
    //                 const formsWithCompleteData: any = {};
    //                 Object.keys(forms).forEach(formKey => {
    //                     const formData = forms[formKey];

    //                     // Get ALL custom columns for this form
    //                     const allCustomColumns = formData.customColumns || [];

    //                     formsWithCompleteData[formKey] = {
    //                         testName: formData.testName,
    //                         ers: formData.ers,
    //                         testCondition: formData.testCondition,
    //                         date: formData.date,
    //                         failureCriteria: formData.failureCriteria,
    //                         testStage: formData.testStage,
    //                         project: formData.project,
    //                         sampleQty: formData.sampleQty,
    //                         customColumns: allCustomColumns, // Save ALL column definitions
    //                         rows: formData.rows.map(row => {
    //                             // Create complete row object
    //                             const completeRow: any = {
    //                                 id: row.id,
    //                                 srNo: row.srNo,
    //                                 testDate: row.testDate,
    //                                 config: row.config,
    //                                 sampleId: row.sampleId,
    //                                 status: row.status
    //                             };

    //                             // Add ALL custom column values (including newly added ones)
    //                             allCustomColumns.forEach(col => {
    //                                 completeRow[col.id] = row[col.id] || '';
    //                             });

    //                             return completeRow;
    //                         })
    //                     };
    //                 });

    //                 const updatedRecord = {
    //                     ...records[currentRecordIndex],
    //                     forms: {
    //                         ...records[currentRecordIndex].forms,
    //                         ...formsWithCompleteData
    //                     },
    //                     status: "Completed",
    //                     completedAt: new Date().toISOString(),
    //                     sharedImages: sharedImages,
    //                     croppedRegions: croppedRegions,
    //                     sampleQty: calculateTotalSampleQty(),
    //                     testCompletionDate: new Date().toISOString().split('T')[0],
    //                     completedTests: [
    //                         ...(records[currentRecordIndex].completedTests || []),
    //                         ...completedTests.filter(test => !records[currentRecordIndex].completedTests?.includes(test))
    //                     ]
    //                 };

    //                 records[currentRecordIndex] = updatedRecord;
    //                 localStorage.setItem("stage2Records", JSON.stringify(records));

    //                 console.log("✅ Complete data saved with all columns:", {
    //                     recordId: updatedRecord.id,
    //                     formsCount: Object.keys(formsWithCompleteData).length,
    //                     tableData: formsWithCompleteData,
    //                     customColumnsPerForm: Object.entries(formsWithCompleteData).map(([key, value]: [string, any]) => ({
    //                         formKey: key,
    //                         columnsCount: value.customColumns?.length || 0,
    //                         columnNames: value.customColumns?.map((c: CustomColumn) => c.label) || []
    //                     }))
    //                 });

    //                 alert("✅ All Forms Completed! Record with all columns has been saved successfully");

    //             } else {
    //                 alert("❌ Record Not Found - Current record not found in storage");
    //             }
    //         } else {
    //             alert("❌ No Test Record Found - Please start a new test before submitting forms");
    //         }
    //     } catch (error) {
    //         alert("❌ Submission Failed - There was an error saving the test data. Please try again.");
    //         console.error("Error submitting forms:", error);
    //     }
    // };

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
                            customColumns: allCustomColumns, // Save ALL column definitions
                            rows: formData.rows.map(row => {
                                // Create complete row object with ALL fields
                                const completeRow: any = {
                                    id: row.id,
                                    srNo: row.srNo,
                                    testDate: row.testDate || "",
                                    config: row.config || "",
                                    sampleId: row.sampleId || "",
                                    status: row.status || "Pass"
                                };

                                // Add ALL custom column values (including newly added text columns)
                                allCustomColumns.forEach(col => {
                                    // Ensure the column value exists in the row, if not set to empty string
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
                        status: "Completed",
                        completedAt: new Date().toISOString(),
                        sharedImages: sharedImages,
                        croppedRegions: croppedRegions,
                        sampleQty: calculateTotalSampleQty(),
                        testCompletionDate: new Date().toISOString().split('T')[0],
                        completedTests: [
                            ...(records[currentRecordIndex].completedTests || []),
                            ...completedTests.filter(test => !records[currentRecordIndex].completedTests?.includes(test))
                        ]
                    };

                    records[currentRecordIndex] = updatedRecord;
                    localStorage.setItem("stage2Records", JSON.stringify(records));

                    console.log("✅ Complete data saved with ALL columns including text columns:", {
                        recordId: updatedRecord.id,
                        formsCount: Object.keys(formsWithCompleteData).length,
                        tableData: formsWithCompleteData,
                        customColumnsPerForm: Object.entries(formsWithCompleteData).map(([key, value]: [string, any]) => ({
                            formKey: key,
                            columnsCount: value.customColumns?.length || 0,
                            columnNames: value.customColumns?.map((c: CustomColumn) => `${c.label} (${c.type})`) || [],
                            sampleRowData: value.rows[0] ? Object.keys(value.rows[0]).filter(k => !['id', 'srNo'].includes(k)) : []
                        }))
                    });

                    alert("✅ All Forms Completed! Record with all columns has been saved successfully");

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
                        {dynamicStages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center p-2 bg-white rounded border">
                                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                                <span className="text-sm font-medium text-gray-700">
                                    {stage.name}
                                    <span className="text-xs ml-2 text-blue-500">
                                        (Default)
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Image Upload UI */}
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
                                        clearImage('cosmetic');
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
                                        clearImage('nonCosmetic');
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
            {croppedRegions.length > 0 && (
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
            )}

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

    const renderCurrentForm = () => {
        if (!currentStageData?.formKey) return null;

        const formKey = currentStageData.formKey;
        const formData = forms[formKey];

        if (!formData) return null;

        return (
            <DefaultForm
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