import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

const InspectionDataViewer = () => {
    // State for data and filters
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [ticketCodes, setTicketCodes] = useState([]);

    // Filter state
    const [filters, setFilters] = useState({
        ticketCode: '',
        fromDate: '',
        toDate: ''
    });

    // Load data from localStorage on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Extract unique ticket codes for dropdown
    useEffect(() => {
        if (records.length > 0) {
            const uniqueTickets = [...new Set(records.flatMap(record =>
                record.testRecords?.map(test => test.ticketCode) || []
            ).filter(Boolean))];
            setTicketCodes(uniqueTickets.sort());
        }
    }, [records]);

    // Apply filters whenever filters or records change
    useEffect(() => {
        applyFilters();
    }, [filters, records]);

    const loadData = () => {
        try {
            const storedData = localStorage.getItem('stage2Records');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setRecords(Array.isArray(parsedData) ? parsedData : [parsedData]);
            } else {
                setRecords([]);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            setRecords([]);
        }
    };

    const applyFilters = () => {
        let filtered = [...records];

        // Filter by ticket code
        if (filters.ticketCode) {
            filtered = filtered.filter(record =>
                record.testRecords?.some(test => test.ticketCode === filters.ticketCode)
            );
        }

        // Filter by date range
        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            filtered = filtered.filter(record => {
                const recordDate = new Date(record.loadedAt || record.completedAt);
                return recordDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999); // Include entire day
            filtered = filtered.filter(record => {
                const recordDate = new Date(record.loadedAt || record.completedAt);
                return recordDate <= toDate;
            });
        }

        setFilteredRecords(filtered);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            ticketCode: '',
            fromDate: '',
            toDate: ''
        });
    };

    // Function to export single row as Excel
    // const exportSingleRowToExcel = (record) => {
    //     try {
    //         // Create a workbook with just this record
    //         const workbook = XLSX.utils.book_new();

    //         // Process the single record using similar logic as provided exportAllStage2DataToExcel
    //         const recordsByTest = {};

    //         // Check if this record has testRecords (your new structure)
    //         if (record.testRecords && Array.isArray(record.testRecords)) {
    //             // Process each test in testRecords
    //             record.testRecords.forEach((testRecord, testIndex) => {
    //                 const testName = testRecord.testName || "Unknown Test";

    //                 // Split test name by '+' to handle combined tests
    //                 const individualTests = testName.split('+').map(t => t.trim());

    //                 individualTests.forEach(individualTest => {
    //                     if (!recordsByTest[individualTest]) {
    //                         recordsByTest[individualTest] = [];
    //                     }

    //                     recordsByTest[individualTest].push({
    //                         record,
    //                         testIndex,
    //                         testRecord,
    //                         originalTestName: testName
    //                     });
    //                 });
    //             });
    //         }

    //         const testNames = Object.keys(recordsByTest).sort();

    //         if (testNames.length === 0) {
    //             alert("No test data found in this record to export.");
    //             return;
    //         }

    //         // Create worksheets for each test
    //         testNames.forEach((testName) => {
    //             const records = recordsByTest[testName];

    //             // Create worksheet data with structured format
    //             const wsData = [];

    //             records.forEach((item, recordIdx) => {
    //                 const { record, testIndex, testRecord, originalTestName } = item;

    //                 if (testRecord) {
    //                     // Add separator between records (only if multiple tests)
    //                     if (recordIdx > 0) {
    //                         wsData.push(Array(17).fill('')); // Empty row
    //                     }

    //                     // Extract data from testRecord
    //                     const assignedParts = testRecord.assignedParts || [];
    //                     const testResults = testRecord.testResults || [];
    //                     const currentTestName = testName; // Use the individual test name

    //                     // Row 1: Test Name, EHS, Test Condition, Date
    //                     wsData.push([
    //                         'Test Name :-',
    //                         currentTestName,
    //                         '',
    //                         'EHS :-',
    //                         testRecord.machineEquipment || "N/A",
    //                         '',
    //                         '',
    //                         'Test condition:-',
    //                         testRecord.testCondition || "RT",
    //                         '',
    //                         '',
    //                         'Date:-',
    //                         testRecord.submittedAt ? new Date(testRecord.submittedAt).toLocaleDateString() : record.dateTime || 'N/A',
    //                         '', '', '', ''
    //                     ]);

    //                     // Row 2: Failure Criteria, Test Stage, Project, Sample Qty
    //                     wsData.push([
    //                         'Specification:',
    //                         testRecord.specification || 'N/A',
    //                         '',
    //                         'Test Stage:-',
    //                         testRecord.processStage || 'N/A',
    //                         '',
    //                         '',
    //                         'Project:-',
    //                         record.project || 'N/A',
    //                         '',
    //                         '',
    //                         'Sample Qty:-',
    //                         testRecord.requiredQuantity || assignedParts.length,
    //                         '', '', '', ''
    //                     ]);

    //                     // Row 3: Section header - Cosmetic Inspection
    //                     wsData.push([
    //                         'Cosmetic Inspection',
    //                         '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    //                     ]);

    //                     // Row 4: Main column headers - WITH DYNAMIC TEST NAME
    //                     wsData.push([
    //                         'Sr.No',
    //                         'Test date',
    //                         'Assigned Parts',
    //                         'Visual',
    //                         'T0 Picture',
    //                         '',
    //                         `After ${currentTestName}`,
    //                         '',
    //                         `After ${currentTestName}`,
    //                         '',
    //                         'Cosmetic Inspection',
    //                         '',
    //                         'Status',
    //                         '', '', '', ''
    //                     ]);

    //                     // Row 5: Sub-headers
    //                     wsData.push([
    //                         '',
    //                         '',
    //                         '',
    //                         '',
    //                         'Cosmetic',
    //                         'Non-cosmetic',
    //                         'Cosmetic',
    //                         'Non-cosmetic',
    //                         'Cosmetic',
    //                         'Non-cosmetic',
    //                         'Pre-test',
    //                         'Post-test',
    //                         '',
    //                         '', '', '', ''
    //                     ]);

    //                     // Data rows for each assigned part
    //                     if (assignedParts.length > 0) {
    //                         assignedParts.forEach((part, idx) => {
    //                             const result = testResults.find(r => r.partNumber === part.partNumber || r.sampleId === part.serialNumber);

    //                             wsData.push([
    //                                 idx + 1,
    //                                 result?.testDate || testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
    //                                 part.partNumber || part.serialNumber || `Part ${idx + 1}`,
    //                                 part.scanStatus === 'OK' ? 'Ok' : (part.scanStatus || 'N/A'),
    //                                 result?.cosmeticImage ? 'Image' : '',
    //                                 result?.nonCosmeticImage ? 'Image' : '',
    //                                 '',
    //                                 '',
    //                                 '',
    //                                 '',
    //                                 'No damage found on the foot',
    //                                 'No damage found on the foot',
    //                                 result?.status || 'Pending',
    //                                 '', '', '', ''
    //                             ]);
    //                         });
    //                     } else {
    //                         // Add at least one empty row
    //                         wsData.push([
    //                             1,
    //                             testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
    //                             'N/A',
    //                             'N/A',
    //                             '', '', '', '', '', '',
    //                             'No parts assigned',
    //                             '',
    //                             'N/A',
    //                             '', '', '', ''
    //                         ]);
    //                     }
    //                 }
    //             });

    //             // Create worksheet from array of arrays
    //             const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    //             // Apply merges (similar logic as original)
    //             const merges = [];
    //             let currentRow = 0;

    //             records.forEach((item, recordIdx) => {
    //                 if (recordIdx > 0) {
    //                     currentRow++;
    //                 }

    //                 // Row 1 merges
    //                 merges.push(
    //                     { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } },
    //                     { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } },
    //                     { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } },
    //                     { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }
    //                 );
    //                 currentRow++;

    //                 // Row 2 merges
    //                 merges.push(
    //                     { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } },
    //                     { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } },
    //                     { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } },
    //                     { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }
    //                 );
    //                 currentRow++;

    //                 // Row 3 merge
    //                 merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 16 } });
    //                 currentRow++;

    //                 // Row 4 merges
    //                 merges.push(
    //                     { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 5 } },
    //                     { s: { r: currentRow, c: 6 }, e: { r: currentRow, c: 7 } },
    //                     { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 9 } },
    //                     { s: { r: currentRow, c: 10 }, e: { r: currentRow, c: 11 } }
    //                 );
    //                 currentRow += 2;

    //                 // Count data rows
    //                 const { testRecord } = item;
    //                 const selectedParts = testRecord?.assignedParts || [];
    //                 currentRow += Math.max(selectedParts.length, 1);
    //             });

    //             worksheet['!merges'] = merges;

    //             // Set column widths
    //             worksheet['!cols'] = [
    //                 { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
    //                 { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
    //                 { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 5 }, { wch: 5 },
    //                 { wch: 5 }, { wch: 5 }
    //             ];

    //             // Add borders to all cells
    //             const range = XLSX.utils.decode_range(worksheet['!ref']);
    //             for (let R = range.s.r; R <= range.e.r; ++R) {
    //                 for (let C = range.s.c; C <= range.e.c; ++C) {
    //                     const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    //                     if (!worksheet[cellAddress]) continue;

    //                     if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
    //                     worksheet[cellAddress].s.border = {
    //                         top: { style: 'thin', color: { rgb: '000000' } },
    //                         bottom: { style: 'thin', color: { rgb: '000000' } },
    //                         left: { style: 'thin', color: { rgb: '000000' } },
    //                         right: { style: 'thin', color: { rgb: '000000' } }
    //                     };
    //                 }
    //             }

    //             // Sanitize sheet name
    //             let sheetName = testName.replace(/[:\\\/\?\*\[\]]/g, '_').substring(0, 31);
    //             let finalSheetName = sheetName;
    //             let counter = 1;
    //             while (workbook.SheetNames.includes(finalSheetName)) {
    //                 finalSheetName = `${sheetName.substring(0, 28)}_${counter}`;
    //                 counter++;
    //             }

    //             XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
    //         });

    //         // Generate filename with record ID
    //         const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    //         const recordId = record.loadId || record.id || 'record';
    //         const filename = `Inspection_Report_${recordId}_${timestamp}.xlsx`;

    //         XLSX.writeFile(workbook, filename);
    //     } catch (error) {
    //         console.error('Error exporting single row:', error);
    //         alert('Error exporting report. Please try again.');
    //     }
    // };

    // Updated exportSingleRowToExcel function with ticket code grouping and proper EHS mapping
    // const exportSingleRowToExcel = (record) => {
    //     try {
    //         // Create a workbook
    //         const workbook = XLSX.utils.book_new();
    //         const recordsByTicketAndTest: {
    //             [key: string]: {
    //                 ticketCode: string;
    //                 testName: string;
    //                 records: Array<{
    //                     record: any;
    //                     testIndex: number | null;
    //                     testRecord: any;
    //                     originalTestName: string;
    //                 }>;
    //             };
    //         } = {};

    //         // Check if this record has testRecords (your new structure)
    //         if (record.testRecords && Array.isArray(record.testRecords)) {
    //             // Process each test in testRecords
    //             record.testRecords.forEach((testRecord, testIndex) => {
    //                 const testName = testRecord.testName || "Unknown Test";
    //                 const ticketCode = testRecord.ticketCode || "Unknown Ticket";

    //                 // Create a composite key for ticket + test
    //                 const key = `${ticketCode}_${testName}`;

    //                 if (!recordsByTicketAndTest[key]) {
    //                     recordsByTicketAndTest[key] = {
    //                         ticketCode,
    //                         testName,
    //                         records: []
    //                     };
    //                 }

    //                 recordsByTicketAndTest[key].records.push({
    //                     record,
    //                     testIndex,
    //                     testRecord,
    //                     originalTestName: testName
    //                 });
    //             });
    //         } else {
    //             // Fallback for old structure
    //             const stage2 = record.stage2 || {};
    //             const ticketCode = record.ticketCode || stage2.ticketCode || "Unknown Ticket";
    //             const testMode = stage2.testMode || "single";

    //             if (testMode === "single") {
    //                 const testName = stage2.testName || "Unknown Test";
    //                 const key = `${ticketCode}_${testName}`;

    //                 if (!recordsByTicketAndTest[key]) {
    //                     recordsByTicketAndTest[key] = {
    //                         ticketCode,
    //                         testName,
    //                         records: []
    //                     };
    //                 }

    //                 recordsByTicketAndTest[key].records.push({
    //                     record,
    //                     testIndex: null,
    //                     testRecord: null,
    //                     originalTestName: testName
    //                 });
    //             } else {
    //                 const testNames = Array.isArray(stage2.testName)
    //                     ? stage2.testName
    //                     : (stage2.testName || "").split(',').map((t) => t.trim());

    //                 testNames.forEach((testName, index) => {
    //                     if (!testName) return;
    //                     const key = `${ticketCode}_${testName}`;

    //                     if (!recordsByTicketAndTest[key]) {
    //                         recordsByTicketAndTest[key] = {
    //                             ticketCode,
    //                             testName,
    //                             records: []
    //                         };
    //                     }

    //                     recordsByTicketAndTest[key].records.push({
    //                         record,
    //                         testIndex: index,
    //                         testRecord: null,
    //                         originalTestName: testName
    //                     });
    //                 });
    //             }
    //         }

    //         const sheetGroups = Object.values(recordsByTicketAndTest);

    //         if (sheetGroups.length === 0) {
    //             alert("No test data found in this record to export.");
    //             return;
    //         }

    //         // Create worksheets for each ticket+test group
    //         sheetGroups.forEach((group, groupIndex) => {
    //             const { ticketCode, testName, records } = group;
    //             const wsData = [];

    //             // Split test name by '+' for combined tests
    //             const individualTests = testName.split('+').map(t => t.trim());

    //             individualTests.forEach((individualTest, testIdx) => {
    //                 records.forEach((item, recordIdx) => {
    //                     const { record, testIndex, testRecord } = item;

    //                     // Get project and machine details
    //                     const project = record.project || record.machineDetails?.project || "N/A";
    //                     const machine = record.machineDetails?.machine || record.chamber || "N/A";

    //                     // Add separator between different tests in combined test
    //                     if (testIdx > 0 || recordIdx > 0) {
    //                         wsData.push(Array(17).fill('')); // Empty row
    //                     }

    //                     if (testRecord) {
    //                         // New structure
    //                         const assignedParts = testRecord.assignedParts || [];
    //                         const testResults = testRecord.testResults || [];
    //                         const currentTestName = individualTest;

    //                         // Row 1: Test Name, EHS (using machine), Test Condition, Date
    //                         wsData.push([
    //                             'Test Name :-',
    //                             currentTestName,
    //                             '',
    //                             'EHS :-',
    //                             machine, // Updated: Using machine instead of machineEquipment
    //                             '',
    //                             '',
    //                             'Test condition:-',
    //                             testRecord.testCondition || "RT",
    //                             '',
    //                             '',
    //                             'Date:-',
    //                             testRecord.submittedAt ? new Date(testRecord.submittedAt).toLocaleDateString() : record.dateTime || 'N/A',
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 2: Failure Criteria, Test Stage, Project, Sample Qty
    //                         wsData.push([
    //                             'Specification:',
    //                             testRecord.specification || 'N/A',
    //                             '',
    //                             'Test Stage:-',
    //                             testRecord.processStage || 'N/A',
    //                             '',
    //                             '',
    //                             'Project:-',
    //                             project, // Updated: Using project from record
    //                             '',
    //                             '',
    //                             'Sample Qty:-',
    //                             testRecord.requiredQuantity || assignedParts.length,
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 3: Section header - Cosmetic Inspection
    //                         wsData.push([
    //                             'Cosmetic Inspection',
    //                             '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    //                         ]);

    //                         // Row 4: Main column headers - WITH DYNAMIC TEST NAME
    //                         wsData.push([
    //                             'Sr.No',
    //                             'Test date',
    //                             'Assigned Parts',
    //                             'Visual',
    //                             'T0 Picture',
    //                             '',
    //                             `After ${currentTestName}`,
    //                             '',
    //                             `After ${currentTestName}`,
    //                             '',
    //                             'Cosmetic Inspection',
    //                             '',
    //                             'Status',
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 5: Sub-headers
    //                         wsData.push([
    //                             '',
    //                             '',
    //                             '',
    //                             '',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Pre-test',
    //                             'Post-test',
    //                             '',
    //                             '', '', '', ''
    //                         ]);

    //                         // Data rows for each assigned part
    //                         if (assignedParts.length > 0) {
    //                             assignedParts.forEach((part, idx) => {
    //                                 const result = testResults.find(r => r.partNumber === part.partNumber || r.sampleId === part.serialNumber);

    //                                 wsData.push([
    //                                     idx + 1,
    //                                     result?.testDate || testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
    //                                     part.partNumber || part.serialNumber || `Part ${idx + 1}`,
    //                                     part.scanStatus === 'OK' ? 'Ok' : (part.scanStatus || 'N/A'),
    //                                     result?.cosmeticImage ? 'Image' : '',
    //                                     result?.nonCosmeticImage ? 'Image' : '',
    //                                     '',
    //                                     '',
    //                                     '',
    //                                     '',
    //                                     'No damage found on the foot',
    //                                     'No damage found on the foot',
    //                                     result?.status || 'Pending',
    //                                     '', '', '', ''
    //                                 ]);
    //                             });
    //                         } else {
    //                             // Add at least one empty row
    //                             wsData.push([
    //                                 1,
    //                                 testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
    //                                 'N/A',
    //                                 'N/A',
    //                                 '', '', '', '', '', '',
    //                                 'No parts assigned',
    //                                 '',
    //                                 'N/A',
    //                                 '', '', '', ''
    //                             ]);
    //                         }
    //                     } else {
    //                         // Old structure handling
    //                         const stage2 = record.stage2 || {};
    //                         const testMode = stage2.testMode || "single";

    //                         // Extract test-specific data
    //                         let equipment, requiredQty, testCondition, selectedParts;
    //                         let currentTestName = individualTest;

    //                         if (testMode === "single" || testIndex === null) {
    //                             equipment = stage2.equipment || "N/A";
    //                             requiredQty = stage2.requiredQty || "N/A";
    //                             testCondition = stage2.testCondition || "N/A";
    //                             selectedParts = Array.isArray(stage2.selectedParts)
    //                                 ? stage2.selectedParts
    //                                 : [];
    //                         } else {
    //                             const equipmentList = Array.isArray(stage2.equipment)
    //                                 ? stage2.equipment
    //                                 : (stage2.equipment || "").split(',').map((e) => e.trim());
    //                             const qtyList = Array.isArray(stage2.requiredQty)
    //                                 ? stage2.requiredQty
    //                                 : (stage2.requiredQty || "").split(',').map((q) => q.trim());
    //                             const conditionList = Array.isArray(stage2.testCondition)
    //                                 ? stage2.testCondition
    //                                 : (stage2.testCondition || "").split(',').map((c) => c.trim());

    //                             equipment = equipmentList[testIndex] || "N/A";
    //                             requiredQty = qtyList[testIndex] || "N/A";
    //                             testCondition = conditionList[testIndex] || "N/A";

    //                             if (stage2.selectedParts && typeof stage2.selectedParts === 'object') {
    //                                 const parts = stage2.selectedParts[individualTest];
    //                                 selectedParts = Array.isArray(parts) ? parts : [];
    //                             } else {
    //                                 selectedParts = [];
    //                             }
    //                         }

    //                         // Row 1: Test Name, EHS (using machine), Test Condition, Date
    //                         wsData.push([
    //                             'Test Name :-',
    //                             currentTestName,
    //                             '',
    //                             'EHS :-',
    //                             machine, // Updated: Using machine
    //                             '',
    //                             '',
    //                             'Test condition:-',
    //                             testCondition,
    //                             '',
    //                             '',
    //                             'Date:-',
    //                             record.stage2?.submittedAt ? new Date(record.stage2.submittedAt).toLocaleDateString() : record.testStartDate || 'N/A',
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 2: Failure Criteria, Test Stage, Project, Sample Qty
    //                         wsData.push([
    //                             'Specification:',
    //                             stage2.checkpoint ? `Checkpoint ${stage2.checkpoint}` : 'N/A',
    //                             '',
    //                             'Test Stage:-',
    //                             stage2.processStage || 'N/A',
    //                             '',
    //                             '',
    //                             'Project:-',
    //                             project, // Updated: Using project from record
    //                             '',
    //                             '',
    //                             'Sample Qty:-',
    //                             requiredQty,
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 3: Section header - Cosmetic Inspection
    //                         wsData.push([
    //                             'Cosmetic Inspection',
    //                             '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    //                         ]);

    //                         // Row 4: Main column headers - WITH DYNAMIC TEST NAME
    //                         wsData.push([
    //                             'Sr.No',
    //                             'Test date',
    //                             'Parts',
    //                             'Visual',
    //                             'T0 Picture',
    //                             '',
    //                             `After ${currentTestName}`,
    //                             '',
    //                             `After ${currentTestName}`,
    //                             '',
    //                             'Cosmetic Inspection',
    //                             '',
    //                             'Status',
    //                             '', '', '', ''
    //                         ]);

    //                         // Row 5: Sub-headers
    //                         wsData.push([
    //                             '',
    //                             '',
    //                             '',
    //                             '',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Cosmetic',
    //                             'Non-cosmetic',
    //                             'Pre-test',
    //                             'Post-test',
    //                             '',
    //                             '', '', '', ''
    //                         ]);

    //                         // Data rows for each selected part
    //                         if (selectedParts.length > 0) {
    //                             selectedParts.forEach((partId, idx) => {
    //                                 wsData.push([
    //                                     idx + 1,
    //                                     record.testStartDate || new Date().toLocaleDateString(),
    //                                     partId,
    //                                     'Ok',
    //                                     '', '', '', '', '', '',
    //                                     'No damage found on the foot',
    //                                     'No damage found on the foot',
    //                                     'Pass',
    //                                     '', '', '', ''
    //                                 ]);
    //                             });
    //                         } else {
    //                             // Add at least one empty row
    //                             wsData.push([
    //                                 1,
    //                                 record.testStartDate || new Date().toLocaleDateString(),
    //                                 'N/A',
    //                                 'N/A',
    //                                 '', '', '', '', '', '',
    //                                 'No parts assigned',
    //                                 '',
    //                                 'N/A',
    //                                 '', '', '', ''
    //                             ]);
    //                         }
    //                     }
    //                 });
    //             });

    //             // Create worksheet from array of arrays
    //             const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    //             // Apply merges
    //             const merges = [];
    //             let currentRow = 0;

    //             // Group records by their position in wsData
    //             let processedGroups = 0;
    //             records.forEach((item, recordIdx) => {
    //                 const { testRecord, originalTestName } = item;
    //                 const individualTests = originalTestName.split('+').map(t => t.trim());

    //                 individualTests.forEach((individualTest, testIdx) => {
    //                     if (processedGroups > 0) {
    //                         currentRow++; // Skip separator row
    //                     }

    //                     // Row 1 merges
    //                     merges.push(
    //                         { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } },
    //                         { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } },
    //                         { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } },
    //                         { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }
    //                     );
    //                     currentRow++;

    //                     // Row 2 merges
    //                     merges.push(
    //                         { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } },
    //                         { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } },
    //                         { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } },
    //                         { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }
    //                     );
    //                     currentRow++;

    //                     // Row 3 merge
    //                     merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 16 } });
    //                     currentRow++;

    //                     // Row 4 merges
    //                     merges.push(
    //                         { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 5 } },
    //                         { s: { r: currentRow, c: 6 }, e: { r: currentRow, c: 7 } },
    //                         { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 9 } },
    //                         { s: { r: currentRow, c: 10 }, e: { r: currentRow, c: 11 } }
    //                     );
    //                     currentRow += 2; // Skip header and subheader rows

    //                     // Count data rows
    //                     let selectedParts = [];
    //                     if (testRecord) {
    //                         // New structure
    //                         selectedParts = testRecord.assignedParts || [];
    //                     } else {
    //                         // Old structure
    //                         const stage2 = item.record?.stage2 || {};
    //                         const testMode = stage2.testMode || "single";

    //                         if (testMode === "single") {
    //                             selectedParts = Array.isArray(stage2.selectedParts) ? stage2.selectedParts : [];
    //                         } else {
    //                             if (stage2.selectedParts && typeof stage2.selectedParts === 'object') {
    //                                 const parts = stage2.selectedParts[individualTest];
    //                                 selectedParts = Array.isArray(parts) ? parts : [];
    //                             }
    //                         }
    //                     }

    //                     currentRow += Math.max(selectedParts.length, 1);
    //                     processedGroups++;
    //                 });
    //             });

    //             worksheet['!merges'] = merges;

    //             // Set column widths
    //             worksheet['!cols'] = [
    //                 { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 12 },
    //                 { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
    //                 { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 5 }, { wch: 5 },
    //                 { wch: 5 }, { wch: 5 }
    //             ];

    //             // Add borders to all cells
    //             const range = XLSX.utils.decode_range(worksheet['!ref']);
    //             for (let R = range.s.r; R <= range.e.r; ++R) {
    //                 for (let C = range.s.c; C <= range.e.c; ++C) {
    //                     const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    //                     if (!worksheet[cellAddress]) continue;

    //                     if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
    //                     worksheet[cellAddress].s.border = {
    //                         top: { style: 'thin', color: { rgb: '000000' } },
    //                         bottom: { style: 'thin', color: { rgb: '000000' } },
    //                         left: { style: 'thin', color: { rgb: '000000' } },
    //                         right: { style: 'thin', color: { rgb: '000000' } }
    //                     };
    //                 }
    //             }

    //             // Create sheet name with ticket code and test name
    //             const sheetBaseName = `${ticketCode}_${testName}`.replace(/[:\\\/\?\*\[\]]/g, '_').substring(0, 31);
    //             let finalSheetName = sheetBaseName;
    //             let counter = 1;
    //             while (workbook.SheetNames.includes(finalSheetName)) {
    //                 finalSheetName = `${sheetBaseName.substring(0, 28)}_${counter}`;
    //                 counter++;
    //             }

    //             XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
    //         });

    //         // Generate filename with ticket code
    //         const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    //         const recordId = record.loadId || record.id || 'record';
    //         const primaryTicket = sheetGroups[0]?.ticketCode || 'report';
    //         const filename = `Inspection_Report_${primaryTicket}_${timestamp}.xlsx`;

    //         XLSX.writeFile(workbook, filename);
    //     } catch (error) {
    //         console.error('Error exporting single row:', error);
    //         alert('Error exporting report. Please try again.');
    //     }
    // };

    const exportSingleRowToExcel = (record) => {
        try {
            // Load all records from localStorage to check for existing data
            const allRecords = JSON.parse(localStorage.getItem('stage2Records') || '[]');

            // Create a workbook
            const workbook = XLSX.utils.book_new();

            // Define the type for sheet groups
            interface SheetGroup {
                ticketCode: string;
                testName: string;
                parts: any[];
                records: any[];
            }

            const recordsByTicketAndTest: { [key: string]: SheetGroup } = {};

            // Process ALL records, not just the current one
            allRecords.forEach((currentRecord) => {
                // Check if this record has testRecords
                if (currentRecord.testRecords && Array.isArray(currentRecord.testRecords)) {
                    // Process each test in testRecords
                    currentRecord.testRecords.forEach((testRecord) => {
                        const testName = testRecord.testName || "Unknown Test";
                        const ticketCode = testRecord.ticketCode || "Unknown Ticket";

                        // Create a composite key for ticket + test
                        const key = `${ticketCode}_${testName}`;

                        if (!recordsByTicketAndTest[key]) {
                            recordsByTicketAndTest[key] = {
                                ticketCode,
                                testName,
                                parts: [],
                                records: []
                            };
                        }

                        // Add the testRecord itself as it contains the part information
                        // Note: Based on your data, testRecords IS the array of parts
                        // So we should add the testRecord items directly
                        recordsByTicketAndTest[key].parts.push({
                            partNumber: testRecord.partNumber,
                            serialNumber: testRecord.serialNumber,
                            ticketCode: testRecord.ticketCode,
                            testName: testRecord.testName,
                            loadedAt: testRecord.loadedAt,
                            scanStatus: testRecord.scanStatus,
                            duration: testRecord.duration,
                            record: currentRecord,
                            testRecord: testRecord
                        });

                        recordsByTicketAndTest[key].records.push({
                            record: currentRecord,
                            testRecord,
                            originalTestName: testName
                        });
                    });
                }
                // Also check if record has parts array at root level
                else if (currentRecord.parts && Array.isArray(currentRecord.parts)) {
                    currentRecord.parts.forEach((part) => {
                        const testName = part.testName || "Unknown Test";
                        const ticketCode = part.ticketCode || "Unknown Ticket";

                        const key = `${ticketCode}_${testName}`;

                        if (!recordsByTicketAndTest[key]) {
                            recordsByTicketAndTest[key] = {
                                ticketCode,
                                testName,
                                parts: [],
                                records: []
                            };
                        }

                        recordsByTicketAndTest[key].parts.push({
                            partNumber: part.partNumber,
                            serialNumber: part.serialNumber,
                            ticketCode: part.ticketCode,
                            testName: part.testName,
                            loadedAt: part.loadedAt,
                            scanStatus: part.scanStatus,
                            duration: part.duration,
                            record: currentRecord,
                            testRecord: part
                        });

                        recordsByTicketAndTest[key].records.push({
                            record: currentRecord,
                            testRecord: part,
                            originalTestName: testName
                        });
                    });
                }
            });

            const sheetGroups = Object.values(recordsByTicketAndTest);

            if (sheetGroups.length === 0) {
                alert("No test data found to export.");
                return;
            }

            // Create worksheets for each ticket+test group
            sheetGroups.forEach((group) => {
                const { ticketCode, testName, parts, records } = group;
                const wsData = [];

                // Get project and machine from first record
                const firstRecord = records[0]?.record;
                const project = firstRecord?.project || firstRecord?.machineDetails?.project || "N/A";
                const machine = firstRecord?.machineDetails?.machine || firstRecord?.chamber || "N/A";
                const firstTestRecord = records[0]?.testRecord;

                // Row 1: Test Name, EHS (using machine), Test Condition, Date
                wsData.push([
                    'Test Name :-',
                    testName,
                    '',
                    'EHS :-',
                    machine,
                    '',
                    '',
                    'Test condition:-',
                    'RT', // Default value
                    '',
                    '',
                    'Date:-',
                    firstTestRecord?.loadedAt
                        ? new Date(firstTestRecord.loadedAt).toLocaleDateString()
                        : new Date().toLocaleDateString(),
                    '', '', '', ''
                ]);

                // Row 2: Specification, Test Stage, Project, Sample Qty
                wsData.push([
                    'Specification:',
                    'N/A',
                    '',
                    'Test Stage:-',
                    'N/A',
                    '',
                    '',
                    'Project:-',
                    project,
                    '',
                    '',
                    'Sample Qty:-',
                    parts.length,
                    '', '', '', ''
                ]);

                // Row 3: Section header - Cosmetic Inspection
                wsData.push([
                    'Cosmetic Inspection',
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                ]);

                // Row 4: Main column headers
                wsData.push([
                    'Sr.No',
                    'Test date',
                    'Assigned Parts',
                    'Visual',
                    'T0 Picture',
                    '',
                    `After ${testName}`,
                    '',
                    `After ${testName}`,
                    '',
                    'Cosmetic Inspection',
                    '',
                    'Status',
                    '', '', '', ''
                ]);

                // Row 5: Sub-headers
                wsData.push([
                    '',
                    '',
                    '',
                    '',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Pre-test',
                    'Post-test',
                    '',
                    '', '', '', ''
                ]);

                // Data rows for each part
                if (parts.length > 0) {
                    parts.forEach((part, idx) => {
                        const partNumber = part.partNumber || `Part-${idx + 1}`;
                        const serialNumber = part.serialNumber || '';
                        const displayPart = partNumber + (serialNumber ? ` (${serialNumber})` : '');

                        // Set Excel cell format to text to prevent scientific notation
                        wsData.push([
                            idx + 1, // Sr.No
                            part.loadedAt
                                ? new Date(part.loadedAt).toLocaleDateString()
                                : new Date().toLocaleDateString(), // Test date
                            { t: 's', v: displayPart, s: { alignment: { horizontal: 'left' } } }, // Assigned Parts as text
                            part.scanStatus === 'OK' ? 'Ok' : (part.scanStatus || 'N/A'), // Visual
                            '', // T0 Picture Cosmetic
                            '', // T0 Picture Non-cosmetic
                            '', // After test Cosmetic
                            '', // After test Non-cosmetic
                            '', // After test Cosmetic (2nd)
                            '', // After test Non-cosmetic (2nd)
                            'No damage found on the foot', // Pre-test
                            'No damage found on the foot', // Post-test
                            part.scanStatus === 'OK' ? 'Pass' : 'Fail', // Status
                            '', '', '', '' // Empty cells for spacing
                        ]);
                    });
                } else {
                    // If no parts found, show records as individual rows
                    records.forEach((item, idx) => {
                        wsData.push([
                            idx + 1,
                            new Date().toLocaleDateString(),
                            `Record ${idx + 1}`,
                            'N/A',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            'No parts assigned',
                            '',
                            'N/A',
                            '', '', '', ''
                        ]);
                    });
                }

                // Create worksheet from array of arrays
                const worksheet = XLSX.utils.aoa_to_sheet(wsData, { cellStyles: true });

                // Apply merges for the entire sheet
                const merges = [
                    // Row 1 merges
                    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
                    { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
                    { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } },
                    { s: { r: 0, c: 12 }, e: { r: 0, c: 16 } },

                    // Row 2 merges
                    { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } },
                    { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } },
                    { s: { r: 1, c: 8 }, e: { r: 1, c: 10 } },
                    { s: { r: 1, c: 12 }, e: { r: 1, c: 16 } },

                    // Row 3 merge (Cosmetic Inspection header)
                    { s: { r: 2, c: 0 }, e: { r: 2, c: 16 } },

                    // Row 4 merges (main headers)
                    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } },
                    { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } },
                    { s: { r: 3, c: 8 }, e: { r: 3, c: 9 } },
                    { s: { r: 3, c: 10 }, e: { r: 3, c: 11 } }
                ];

                worksheet['!merges'] = merges;

                // Set column widths
                worksheet['!cols'] = [
                    { wch: 8 },   // Sr.No
                    { wch: 12 },  // Test date
                    { wch: 20 },  // Assigned Parts
                    { wch: 10 },  // Visual
                    { wch: 12 },  // Cosmetic (T0)
                    { wch: 15 },  // Non-cosmetic (T0)
                    { wch: 12 },  // Cosmetic (After test 1)
                    { wch: 15 },  // Non-cosmetic (After test 1)
                    { wch: 12 },  // Cosmetic (After test 2)
                    { wch: 15 },  // Non-cosmetic (After test 2)
                    { wch: 25 },  // Pre-test
                    { wch: 25 },  // Post-test
                    { wch: 10 },  // Status
                    { wch: 5 },   // Extra columns
                    { wch: 5 },
                    { wch: 5 },
                    { wch: 5 }
                ];

                // Format column C (Assigned Parts) as text to prevent scientific notation
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                for (let R = 5; R <= range.e.r; R++) { // Start from row 5 (first data row)
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 2 }); // Column C (index 2)
                    if (worksheet[cellAddress]) {
                        // Ensure it's formatted as text
                        worksheet[cellAddress].t = 's'; // String type
                        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
                        worksheet[cellAddress].s.numFmt = '@'; // Text format
                    }
                }

                // Add borders to all cells
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) continue;

                        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
                        worksheet[cellAddress].s.border = {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } }
                        };
                    }
                }

                // Create sheet name with ticket code and test name
                const sheetBaseName = `${testName}`.replace(/[:\\\/\?\*\[\]]/g, '_').substring(0, 31);
                let finalSheetName = sheetBaseName;
                let counter = 1;
                while (workbook.SheetNames.includes(finalSheetName)) {
                    finalSheetName = `${sheetBaseName.substring(0, 28)}_${counter}`;
                    counter++;
                }

                XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
            });

            // Generate filename with ticket code
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
            const primaryTicket = sheetGroups[0]?.ticketCode || 'report';
            const filename = `Inspection_Report_${primaryTicket}_${timestamp}.xlsx`;

            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Error exporting single row:', error);
            alert('Error exporting report. Please try again.');
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate total parts in filtered records
    const totalParts = useMemo(() => {
        return filteredRecords.reduce((sum, record) => sum + (record.totalParts || 0), 0);
    }, [filteredRecords]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Report Dashboard
                    </h1>
                    {/* <p className="text-gray-600">
                        View and filter inspection records from stage 2 testing
                    </p> */}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Records</p>
                                <p className="text-2xl font-bold text-gray-800">{records.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Filtered Records</p>
                                <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Parts</p>
                                <p className="text-2xl font-bold text-gray-800">{totalParts}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Ticket Code Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ticket Code
                            </label>
                            <div className="relative">
                                <select
                                    name="ticketCode"
                                    value={filters.ticketCode}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                                >
                                    <option value="">All Ticket Codes</option>
                                    {ticketCodes.map((code) => (
                                        <option key={code} value={code}>
                                            {code}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* From Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        {/* To Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Active Filters */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {filters.ticketCode && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Ticket: {filters.ticketCode}
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, ticketCode: '' }))}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.fromDate && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                From: {filters.fromDate}
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, fromDate: '' }))}
                                    className="ml-2 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.toDate && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                To: {filters.toDate}
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, toDate: '' }))}
                                    className="ml-2 text-purple-600 hover:text-purple-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Inspection Records</h2>
                            <span className="text-sm text-gray-600">
                                Showing {filteredRecords.length} of {records.length} records
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Load ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Chamber
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Parts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Loaded At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Completed At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Download
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                <p className="text-lg font-medium">No records found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr
                                            key={record.loadId}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {record.loadId || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{record.chamber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(record.totalParts || 0) > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {record.totalParts || 0} parts
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${record.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : record.status === 'In Progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {record.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(record.loadedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(record.completedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => exportSingleRowToExcel(record)}
                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                    Export
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    {filteredRecords.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Last updated: {new Date().toLocaleTimeString()}
                                </p>
                                <button
                                    onClick={() => {
                                        const rawExportAllStage2DataToExcel = exportAllStage2DataToExcel;
                                        rawExportAllStage2DataToExcel();
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Export All Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {/* <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Data is loaded from localStorage under the key "stage2Records"</p>
                    <p className="mt-1">Filters are applied dynamically without page reload</p>
                </div> */}
            </div>
        </div>
    );
};

// Your provided exportAllStage2DataToExcel function (copied exactly as provided)
const exportAllStage2DataToExcel = () => {
    const rawRecords = JSON.parse(localStorage.getItem('stage2Records') || '[]');

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
        alert("No data available to export.");
        return;
    }

    const workbook = XLSX.utils.book_new();
    const recordsByTest = {};

    // Process each record
    rawRecords.forEach((record) => {
        // Check if this record has testRecords (your new structure)
        if (record.testRecords && Array.isArray(record.testRecords)) {
            // Process each test in testRecords
            record.testRecords.forEach((testRecord, testIndex) => {
                const testName = testRecord.testName || "Unknown Test";

                // Split test name by '+' to handle combined tests
                const individualTests = testName.split('+').map(t => t.trim());

                individualTests.forEach(individualTest => {
                    if (!recordsByTest[individualTest]) {
                        recordsByTest[individualTest] = [];
                    }

                    recordsByTest[individualTest].push({
                        record,
                        testIndex,
                        testRecord,
                        originalTestName: testName // Keep original combined name
                    });
                });
            });
        } else {
            // Fallback to old structure (for backward compatibility)
            const stage2 = record.stage2 || {};
            const testMode = stage2.testMode || "single";

            if (testMode === "single") {
                const testName = stage2.testName || "Unknown Test";

                // Split test name by '+' to handle combined tests
                const individualTests = testName.split('+').map(t => t.trim());

                individualTests.forEach(individualTest => {
                    if (!recordsByTest[individualTest]) {
                        recordsByTest[individualTest] = [];
                    }
                    recordsByTest[individualTest].push({
                        record,
                        testIndex: null,
                        testRecord: null,
                        originalTestName: testName
                    });
                });
            } else {
                const testNames = Array.isArray(stage2.testName)
                    ? stage2.testName
                    : (stage2.testName || "").split(',').map((t) => t.trim());

                testNames.forEach((testName, index) => {
                    if (!testName) return;

                    // Split test name by '+' to handle combined tests
                    const individualTests = testName.split('+').map(t => t.trim());

                    individualTests.forEach(individualTest => {
                        if (!recordsByTest[individualTest]) {
                            recordsByTest[individualTest] = [];
                        }
                        recordsByTest[individualTest].push({
                            record,
                            testIndex: index,
                            testRecord: null,
                            originalTestName: testName
                        });
                    });
                });
            }
        }
    });

    const testNames = Object.keys(recordsByTest).sort();

    if (testNames.length === 0) {
        alert("No test data found to export.");
        return;
    }

    // Create worksheets for each test
    testNames.forEach((testName) => {
        const records = recordsByTest[testName];

        // Create worksheet data with structured format
        const wsData = [];

        records.forEach((item, recordIdx) => {
            const { record, testIndex, testRecord, originalTestName } = item;

            // For new structure (testRecords)
            if (testRecord) {
                // Add separator between records
                if (recordIdx > 0) {
                    wsData.push(Array(17).fill('')); // Empty row
                }

                // Extract data from testRecord
                const assignedParts = testRecord.assignedParts || [];
                const testResults = testRecord.testResults || [];
                const currentTestName = testName; // Use the individual test name

                // Row 1: Test Name, EHS, Test Condition, Date
                wsData.push([
                    'Test Name :-',
                    currentTestName,
                    '',
                    'EHS :-',
                    testRecord.machineEquipment || "N/A",
                    '',
                    '',
                    'Test condition:-',
                    testRecord.testCondition || "RT",
                    '',
                    '',
                    'Date:-',
                    testRecord.submittedAt ? new Date(testRecord.submittedAt).toLocaleDateString() : record.dateTime || 'N/A',
                    '', '', '', ''
                ]);

                // Row 2: Failure Criteria, Test Stage, Project, Sample Qty
                wsData.push([
                    'Specification:',
                    testRecord.specification || 'N/A',
                    '',
                    'Test Stage:-',
                    testRecord.processStage || 'N/A',
                    '',
                    '',
                    'Project:-',
                    record.project || 'N/A',
                    '',
                    '',
                    'Sample Qty:-',
                    testRecord.requiredQuantity || assignedParts.length,
                    '', '', '', ''
                ]);

                // Row 3: Section header - Cosmetic Inspection
                wsData.push([
                    'Cosmetic Inspection',
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                ]);

                // Row 4: Main column headers - WITH DYNAMIC TEST NAME
                wsData.push([
                    'Sr.No',
                    'Test date',
                    'Assigned Parts',
                    'Visual',
                    'T0 Picture',
                    '',
                    `After ${currentTestName}`, // Dynamic test name here
                    '',
                    `After ${currentTestName}`, // Dynamic test name here
                    '',
                    'Cosmetic Inspection',
                    '',
                    'Status',
                    '', '', '', ''
                ]);

                // Row 5: Sub-headers
                wsData.push([
                    '',
                    '',
                    '',
                    '',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Pre-test',
                    'Post-test',
                    '',
                    '', '', '', ''
                ]);

                // Data rows for each assigned part
                if (assignedParts.length > 0) {
                    assignedParts.forEach((part, idx) => {
                        // Find corresponding test result for this part
                        const result = testResults.find(r => r.partNumber === part.partNumber || r.sampleId === part.serialNumber);

                        wsData.push([
                            idx + 1,
                            result?.testDate || testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
                            part.partNumber || part.serialNumber || `Part ${idx + 1}`,
                            part.scanStatus === 'OK' ? 'Ok' : (part.scanStatus || 'N/A'),
                            result?.cosmeticImage ? 'Image' : '', // Cosmetic (T0)
                            result?.nonCosmeticImage ? 'Image' : '', // Non-cosmetic (T0)
                            '', // Cosmetic (After test 1)
                            '', // Non-cosmetic (After test 1)
                            '', // Cosmetic (After test 2)
                            '', // Non-cosmetic (After test 2)
                            'No damage found on the foot',
                            'No damage found on the foot',
                            result?.status || 'Pending',
                            '', '', '', ''
                        ]);
                    });
                } else {
                    // Add at least one empty row
                    wsData.push([
                        1,
                        testRecord.startDateTime?.split('T')[0] || record.dateTime || new Date().toLocaleDateString(),
                        'N/A',
                        'N/A',
                        '', '', '', '', '', '',
                        'No parts assigned',
                        '',
                        'N/A',
                        '', '', '', ''
                    ]);
                }
            } else {
                // Old structure handling (keep existing logic)
                const stage2 = record.stage2 || {};
                const testMode = stage2.testMode || "single";

                // Extract test-specific data
                let testType, equipment, requiredQty, testCondition, selectedParts;
                let currentTestName = testName; // Use the individual test name

                if (testMode === "single" || testIndex === null) {
                    testType = stage2.type || "N/A";
                    equipment = stage2.equipment || "N/A";
                    requiredQty = stage2.requiredQty || "N/A";
                    testCondition = stage2.testCondition || "N/A";
                    selectedParts = Array.isArray(stage2.selectedParts)
                        ? stage2.selectedParts
                        : [];
                } else {
                    const typeList = Array.isArray(stage2.type)
                        ? stage2.type
                        : (stage2.type || "").split(',').map((t) => t.trim());
                    const equipmentList = Array.isArray(stage2.equipment)
                        ? stage2.equipment
                        : (stage2.equipment || "").split(',').map((e) => e.trim());
                    const qtyList = Array.isArray(stage2.requiredQty)
                        ? stage2.requiredQty
                        : (stage2.requiredQty || "").split(',').map((q) => q.trim());
                    const conditionList = Array.isArray(stage2.testCondition)
                        ? stage2.testCondition
                        : (stage2.testCondition || "").split(',').map((c) => c.trim());

                    testType = typeList[testIndex] || "N/A";
                    equipment = equipmentList[testIndex] || "N/A";
                    requiredQty = qtyList[testIndex] || "N/A";
                    testCondition = conditionList[testIndex] || "N/A";

                    if (stage2.selectedParts && typeof stage2.selectedParts === 'object') {
                        const parts = stage2.selectedParts[originalTestName];
                        selectedParts = Array.isArray(parts) ? parts : [];
                    } else {
                        selectedParts = [];
                    }
                }

                // Add separator between records
                if (recordIdx > 0) {
                    wsData.push(Array(17).fill('')); // Empty row
                }

                // Row 1: Test Name, EHS, Test Condition, Date
                wsData.push([
                    'Test Name :-',
                    currentTestName,
                    '',
                    'EHS :-',
                    equipment,
                    '',
                    '',
                    'Test condition:-',
                    testCondition,
                    '',
                    '',
                    'Date:-',
                    record.stage2?.submittedAt ? new Date(record.stage2.submittedAt).toLocaleDateString() : record.testStartDate || 'N/A',
                    '', '', '', ''
                ]);

                // Row 2: Failure Criteria, Test Stage, Project, Sample Qty
                wsData.push([
                    'Specification:',
                    stage2.checkpoint ? `Checkpoint ${stage2.checkpoint}` : 'N/A',
                    '',
                    'Test Stage:-',
                    stage2.processStage || 'N/A',
                    '',
                    '',
                    'Project:-',
                    stage2.project || record.detailsBox?.project || 'N/A',
                    '',
                    '',
                    'Sample Qty:-',
                    requiredQty,
                    '', '', '', ''
                ]);

                // Row 3: Section header - Cosmetic Inspection
                wsData.push([
                    'Cosmetic Inspection',
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                ]);

                // Row 4: Main column headers - WITH DYNAMIC TEST NAME
                wsData.push([
                    'Sr.No',
                    'Test date',
                    'Parts',
                    'Visual',
                    'T0 Picture',
                    '',
                    `After ${currentTestName}`, // Dynamic test name here
                    '',
                    `After ${currentTestName}`, // Dynamic test name here
                    '',
                    'Cosmetic Inspection',
                    '',
                    'Status',
                    '', '', '', ''
                ]);

                // Row 5: Sub-headers
                wsData.push([
                    '',
                    '',
                    '',
                    '',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Cosmetic',
                    'Non-cosmetic',
                    'Pre-test',
                    'Post-test',
                    '',
                    '', '', '', ''
                ]);

                // Data rows for each selected part
                if (selectedParts.length > 0) {
                    selectedParts.forEach((partId, idx) => {
                        wsData.push([
                            idx + 1,
                            record.testStartDate || new Date().toLocaleDateString(),
                            partId,
                            'Ok',
                            '', // Cosmetic (T0)
                            '', // Non-cosmetic (T0)
                            '', // Cosmetic (After test 1)
                            '', // Non-cosmetic (After test 1)
                            '', // Cosmetic (After test 2)
                            '', // Non-cosmetic (After test 2)
                            'No damage found on the foot',
                            'No damage found on the foot',
                            'Pass',
                            '', '', '', ''
                        ]);
                    });
                } else {
                    // Add at least one empty row
                    wsData.push([
                        1,
                        record.testStartDate || new Date().toLocaleDateString(),
                        'N/A',
                        'N/A',
                        '', '', '', '', '', '',
                        'No parts assigned',
                        '',
                        'N/A',
                        '', '', '', ''
                    ]);
                }
            }
        });

        // Create worksheet from array of arrays
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Apply merges
        const merges = [];
        let currentRow = 0;

        records.forEach((item, recordIdx) => {
            if (recordIdx > 0) {
                currentRow++; // Skip separator row
            }

            // Row 1 merges: Test Name row
            merges.push(
                { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } }, // Test name value
                { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } }, // EHS value
                { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } }, // Test condition value
                { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }  // Date value
            );
            currentRow++;

            // Row 2 merges: Failure criteria row
            merges.push(
                { s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } }, // Failure criteria value
                { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 6 } }, // Test Stage value
                { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 10 } }, // Project value
                { s: { r: currentRow, c: 12 }, e: { r: currentRow, c: 16 } }  // Sample Qty value
            );
            currentRow++;

            // Row 3 merge: Cosmetic Inspection header
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 16 } });
            currentRow++;

            // Row 4 merges: Main column headers
            merges.push(
                { s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 5 } },   // T0 Picture
                { s: { r: currentRow, c: 6 }, e: { r: currentRow, c: 7 } },   // After [TestName] - first occurrence
                { s: { r: currentRow, c: 8 }, e: { r: currentRow, c: 9 } },   // After [TestName] - second occurrence
                { s: { r: currentRow, c: 10 }, e: { r: currentRow, c: 11 } }  // Cosmetic Inspection
            );
            currentRow += 2; // Skip to data rows (header + subheader)

            // Count data rows
            const { record, testIndex, testRecord, originalTestName } = item;
            let selectedParts = [];

            if (testRecord) {
                // New structure
                selectedParts = testRecord.assignedParts || [];
            } else {
                // Old structure
                const stage2 = record.stage2 || {};
                if (testIndex === null) {
                    selectedParts = Array.isArray(stage2.selectedParts) ? stage2.selectedParts : [];
                } else {
                    if (stage2.selectedParts && typeof stage2.selectedParts === 'object') {
                        const parts = stage2.selectedParts[originalTestName];
                        selectedParts = Array.isArray(parts) ? parts : [];
                    }
                }
            }

            currentRow += Math.max(selectedParts.length, 1);
        });

        worksheet['!merges'] = merges;

        // Set column widths
        worksheet['!cols'] = [
            { wch: 8 },   // Sr.No
            { wch: 12 },  // Test date
            { wch: 20 },  // Sample I'd
            { wch: 10 },  // Visual
            { wch: 12 },  // Cosmetic (T0)
            { wch: 15 },  // Non-cosmetic (T0)
            { wch: 12 },  // Cosmetic (After test 1)
            { wch: 15 },  // Non-cosmetic (After test 1)
            { wch: 12 },  // Cosmetic (After test 2)
            { wch: 15 },  // Non-cosmetic (After test 2)
            { wch: 25 },  // Pre-test
            { wch: 25 },  // Post-test
            { wch: 10 },  // Status
            { wch: 5 },   // Extra columns for spacing
            { wch: 5 },
            { wch: 5 },
            { wch: 5 }
        ];

        // Add borders to all cells with data
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress]) continue;

                if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
                worksheet[cellAddress].s.border = {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                };
            }
        }

        // Sanitize sheet name
        let sheetName = testName.replace(/[:\\\/\?\*\[\]]/g, '_').substring(0, 31);
        let finalSheetName = sheetName;
        let counter = 1;
        while (workbook.SheetNames.includes(finalSheetName)) {
            finalSheetName = `${sheetName.substring(0, 28)}_${counter}`;
            counter++;
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, finalSheetName);
    });

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `ORT_TestReports_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
};

export default InspectionDataViewer;