import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const InspectionDataViewer = () => {
    // State for data and filters
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [ticketCodes, setTicketCodes] = useState([]);
    const [chartImages, setChartImages] = useState({});

    // Refs for chart containers
    const chartContainer1Ref = useRef(null);
    const chartContainer2Ref = useRef(null);

    // Filter state
    const [filters, setFilters] = useState({
        ticketCode: '',
        fromDate: '',
        toDate: ''
    });

    // Test data for the line chart
    const testDataValues = [
        { Time: 0, Displacement: 0, Force: 0 },
        { Time: 0.02, Displacement: 0.0001, Force: 0 },
        { Time: 0.04, Displacement: 0.0012, Force: 0 },
        { Time: 0.06, Displacement: 0.0073, Force: 0.0001 },
        { Time: 0.08, Displacement: 0.015, Force: 0.5 },
        { Time: 0.10, Displacement: 0.025, Force: 1.2 },
        { Time: 0.12, Displacement: 0.035, Force: 2.1 },
        { Time: 0.14, Displacement: 0.045, Force: 3.3 },
        { Time: 0.16, Displacement: 0.055, Force: 4.8 },
        { Time: 0.18, Displacement: 0.065, Force: 6.5 },
        { Time: 0.20, Displacement: 0.075, Force: 8.4 },
        { Time: 0.22, Displacement: 0.085, Force: 10.5 },
        { Time: 0.24, Displacement: 0.095, Force: 12.8 },
        { Time: 0.26, Displacement: 0.105, Force: 15.3 },
        { Time: 0.28, Displacement: 0.115, Force: 18.0 },
        { Time: 0.30, Displacement: 0.125, Force: 20.9 },
        { Time: 0.32, Displacement: 0.135, Force: 24.0 },
        { Time: 0.34, Displacement: 0.145, Force: 27.3 },
        { Time: 0.36, Displacement: 0.155, Force: 30.8 },
        { Time: 0.38, Displacement: 0.165, Force: 34.5 },
        { Time: 0.40, Displacement: 0.175, Force: 38.4 },
        { Time: 0.42, Displacement: 0.185, Force: 42.5 },
        { Time: 0.44, Displacement: 0.195, Force: 46.8 },
        { Time: 0.46, Displacement: 0.205, Force: 51.3 },
        { Time: 0.48, Displacement: 0.215, Force: 56.0 },
        { Time: 0.50, Displacement: 0.225, Force: 60.9 },
        { Time: 0.52, Displacement: 0.235, Force: 66.0 },
        { Time: 0.54, Displacement: 0.245, Force: 71.3 },
        { Time: 0.56, Displacement: 0.255, Force: 76.8 },
        { Time: 0.58, Displacement: 0.265, Force: 82.5 },
        { Time: 0.60, Displacement: 0.275, Force: 88.4 },
        { Time: 0.62, Displacement: 0.285, Force: 94.5 },
        { Time: 0.64, Displacement: 0.295, Force: 100.8 },
        { Time: 0.66, Displacement: 0.305, Force: 107.3 },
        { Time: 0.68, Displacement: 0.315, Force: 114.0 },
        { Time: 0.70, Displacement: 0.325, Force: 120.9 },
        { Time: 0.72, Displacement: 0.335, Force: 128.0 },
        { Time: 0.74, Displacement: 0.345, Force: 135.3 },
        { Time: 0.76, Displacement: 0.355, Force: 142.8 },
        { Time: 0.78, Displacement: 0.365, Force: 150.5 },
        { Time: 0.80, Displacement: 0.375, Force: 158.4 },
        { Time: 0.82, Displacement: 0.385, Force: 166.5 },
        { Time: 0.84, Displacement: 0.395, Force: 174.8 },
        { Time: 0.86, Displacement: 0.405, Force: 183.3 },
        { Time: 0.88, Displacement: 0.415, Force: 192.0 },
        { Time: 0.90, Displacement: 0.425, Force: 200.9 },
        { Time: 0.92, Displacement: 0.435, Force: 210.0 },
        { Time: 0.94, Displacement: 0.445, Force: 219.3 },
        { Time: 0.96, Displacement: 0.455, Force: 228.8 },
        { Time: 0.98, Displacement: 0.465, Force: 238.5 },
        { Time: 1.00, Displacement: 0.475, Force: 248.4 },
        { Time: 1.02, Displacement: 0.485, Force: 258.5 },
        { Time: 1.04, Displacement: 0.495, Force: 268.8 },
        { Time: 1.06, Displacement: 0.505, Force: 279.3 },
        { Time: 1.08, Displacement: 0.515, Force: 290.0 },
        { Time: 1.10, Displacement: 0.525, Force: 300.9 },
        { Time: 1.12, Displacement: 0.535, Force: 312.0 },
        { Time: 1.14, Displacement: 0.545, Force: 323.3 },
        { Time: 1.16, Displacement: 0.555, Force: 334.8 },
        { Time: 1.18, Displacement: 0.565, Force: 346.5 },
        { Time: 1.20, Displacement: 0.575, Force: 358.4 }
    ];

    // Results table data
    const resultsTableRows = [
        {
            serialNo: 1,
            partNo: "J5LHN3000HF0012YT",
            maximumForce: 311.01,
            result: "Pass",
            partLocation: "SS-04",
            operatorName: "Dheer aj",
            shift: "B",
            vendorDetails: "ABC Corporation",
            startDate: "26 December 2025 16:18:18",
            endDate: "26-12-2025 16:18"
        },
        {
            serialNo: 2,
            partNo: "J5LHN3000HF0012YT",
            maximumForce: 198.93,
            result: "Pass",
            partLocation: "SS-02",
            operatorName: "Dheer aj",
            shift: "B",
            vendorDetails: "XYZ Manufacturing",
            startDate: "26 December 2025 16:20:19",
            endDate: "26-12-2025 16:20"
        },
        {
            serialNo: 3,
            partNo: "J5LHN3000HF0012YT",
            maximumForce: 343.91,
            result: "Pass",
            partLocation: "SS-04",
            operatorName: "Dheer aj",
            shift: "B",
            vendorDetails: "DEF Industries",
            startDate: "26 December 2025 16:21:00",
            endDate: "26-12-2025 16:21"
        },
        {
            serialNo: 4,
            partNo: "J5LHN3000HF0013YT",
            maximumForce: 287.45,
            result: "Fail",
            partLocation: "SS-01",
            operatorName: "John Smith",
            shift: "A",
            vendorDetails: "GHI Components",
            startDate: "26 December 2025 14:15:30",
            endDate: "26-12-2025 14:16"
        },
        {
            serialNo: 5,
            partNo: "J5LHN3000HF0014YT",
            maximumForce: 325.67,
            result: "Pass",
            partLocation: "SS-03",
            operatorName: "Jane Doe",
            shift: "C",
            vendorDetails: "JKL Suppliers",
            startDate: "26 December 2025 18:30:45",
            endDate: "26-12-2025 18:31"
        }
    ];

    // Load data from localStorage on component mount
    useEffect(() => {
        createSampleData();
        generateChartImages();
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

    // Function to convert canvas to base64 image
    const canvasToBase64 = (canvas) => {
        return canvas.toDataURL('image/png');
    };

    // Function to generate chart images from canvas
    const generateChartImages = () => {
        // Create a canvas element
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');

        canvas1.width = 800;
        canvas1.height = 400;
        canvas2.width = 800;
        canvas2.height = 400;

        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        // Draw specimen 1 chart
        drawChart(ctx1, testDataValues, "Specimen 1");

        // Draw specimen 2 chart (could be different data)
        drawChart(ctx2, testDataValues.map(d => ({
            ...d,
            Force: d.Force * 0.8 // Example: different data for specimen 2
        })), "Specimen 2");

        // Convert to base64
        setChartImages({
            specimen1: canvasToBase64(canvas1),
            specimen2: canvasToBase64(canvas2)
        });
    };

    // Function to draw chart on canvas
    const drawChart = (ctx, data, title) => {
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Chart dimensions
        const margin = 80;
        const width = ctx.canvas.width - 2 * margin;
        const height = ctx.canvas.height - 2 * margin;

        // Find max values for scaling
        const maxTime = Math.max(...data.map(d => d.Time));
        const maxForce = Math.max(...data.map(d => d.Force));

        // Draw title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, ctx.canvas.width / 2, 40);

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, margin + height);
        ctx.lineTo(margin + width, margin + height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Y-axis label (Force)
        ctx.save();
        ctx.translate(30, margin + height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Force [N]', 0, 0);
        ctx.restore();

        // Draw X-axis label (Displacement)
        ctx.textAlign = 'center';
        ctx.fillText('Displacement [mm]', margin + width / 2, margin + height + 50);

        // Draw Y-axis ticks
        ctx.textAlign = 'right';
        ctx.font = '12px Arial';
        for (let i = 0; i <= 6; i++) {
            const y = margin + height - (i / 6) * height;
            const forceValue = (i / 6) * maxForce;
            ctx.beginPath();
            ctx.moveTo(margin - 5, y);
            ctx.lineTo(margin, y);
            ctx.stroke();
            ctx.fillText(Math.round(forceValue).toString(), margin - 10, y + 4);
        }

        // Draw X-axis ticks
        ctx.textAlign = 'center';
        for (let i = 0; i <= 6; i++) {
            const x = margin + (i / 6) * width;
            ctx.beginPath();
            ctx.moveTo(x, margin + height);
            ctx.lineTo(x, margin + height + 5);
            ctx.stroke();
            ctx.fillText(i.toString(), x, margin + height + 20);
        }

        // Draw line chart
        ctx.beginPath();
        data.forEach((point, index) => {
            const x = margin + (point.Time / maxTime) * width;
            const y = margin + height - (point.Force / maxForce) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw data points
        data.forEach((point) => {
            const x = margin + (point.Time / maxTime) * width;
            const y = margin + height - (point.Force / maxForce) * height;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
        });
    };

    const createExcelWorkbook = async (record) => {
        try {
            // Create a new workbook with ExcelJS
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Inspection System';
            workbook.created = new Date();

            // Add and format sheets
            await addInspectionDataSheet(workbook, record);
            await addTestResultsSheet(workbook);
            await addChartImagesSheet(workbook);

            return workbook;
        } catch (error) {
            console.error('Error creating workbook:', error);
            throw error;
        }
    };

    // Function to add inspection data sheet
    const addInspectionDataSheet = async (workbook, record) => {
        const worksheet = workbook.addWorksheet('Inspection Data');

        // Add title
        worksheet.getCell('A1').value = "INSPECTION DATA REPORT";
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.mergeCells('A1:B1');

        // Add record data
        worksheet.getCell('A3').value = "Load ID:";
        worksheet.getCell('B3').value = record?.loadId || 'N/A';

        worksheet.getCell('A4').value = "Chamber:";
        worksheet.getCell('B4').value = record?.chamber || 'N/A';

        worksheet.getCell('A5').value = "Status:";
        worksheet.getCell('B5').value = record?.status || 'N/A';

        worksheet.getCell('A6').value = "Loaded At:";
        worksheet.getCell('B6').value = formatDate(record?.loadedAt);

        worksheet.getCell('A7').value = "Completed At:";
        worksheet.getCell('B7').value = formatDate(record?.completedAt);

        worksheet.getCell('A8').value = "Duration:";
        worksheet.getCell('B8').value = record?.duration || 'N/A';

        // Machine Details
        worksheet.getCell('A10').value = "MACHINE DETAILS";
        worksheet.getCell('A10').font = { bold: true };

        worksheet.getCell('A11').value = "Machine:";
        worksheet.getCell('B11').value = record?.machineDetails?.machine || 'N/A';

        worksheet.getCell('A12').value = "Machine ID:";
        worksheet.getCell('B12').value = record?.machineDetails?.machineId || 'N/A';

        worksheet.getCell('A13').value = "Project:";
        worksheet.getCell('B13').value = record?.machineDetails?.project || 'N/A';

        // Set column widths
        worksheet.getColumn(1).width = 25;
        worksheet.getColumn(2).width = 40;
    };

    // Function to add test results sheet
    const addTestResultsSheet = async (workbook) => {
        const worksheet = workbook.addWorksheet('Test Results');

        // Add title
        worksheet.getCell('A1').value = "TEST RESULTS SUMMARY";
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.mergeCells('A1:J1');

        // Headers
        const headers = [
            "Serial No",
            "Part No",
            "Maximum Force (N)",
            "Pass / Fail",
            "Part Location",
            "Operator Name",
            "Shift",
            "Vendor Details",
            "Start Date",
            "End Date"
        ];

        const headerRow = worksheet.getRow(3);
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        });

        // Data rows
        resultsTableRows.forEach((row, rowIndex) => {
            const dataRow = worksheet.getRow(rowIndex + 4);

            dataRow.getCell(1).value = row.serialNo;
            dataRow.getCell(2).value = row.partNo;
            dataRow.getCell(3).value = row.maximumForce;

            const resultCell = dataRow.getCell(4);
            resultCell.value = row.result;

            if (row.result === 'Pass') {
                resultCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC6EFCE' }
                };
                resultCell.font = { color: { argb: 'FF006100' }, bold: true };
            } else {
                resultCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' }
                };
                resultCell.font = { color: { argb: 'FF9C0006' }, bold: true };
            }

            dataRow.getCell(5).value = row.partLocation;
            dataRow.getCell(6).value = row.operatorName;
            dataRow.getCell(7).value = row.shift;
            dataRow.getCell(8).value = row.vendorDetails || '';
            dataRow.getCell(9).value = row.startDate || '';
            dataRow.getCell(10).value = row.endDate || '';
        });

        // Set column widths
        const widths = [10, 25, 15, 12, 15, 15, 10, 20, 25, 25];
        widths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });
    };

    const addChartImagesSheet = async (workbook) => {
        const worksheet = workbook.addWorksheet('Force vs Displacement Charts');

        // Add title
        worksheet.getCell('A1').value = "FORCE VS DISPLACEMENT ANALYSIS";
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.mergeCells('A1:C1');

        // Add Specimen 1 title
        worksheet.getCell('A3').value = "Specimen 1";
        worksheet.getCell('A3').font = { bold: true, size: 14 };

        // Embed specimen 1 chart image
        if (chartImages.specimen1) {
            try {
                // Remove the data URL prefix for ExcelJS
                const base64Data = chartImages.specimen1.replace(/^data:image\/\w+;base64,/, '');

                // Create buffer from base64
                const imageId1 = workbook.addImage({
                    base64: base64Data,
                    extension: 'png',
                });

                // Add image to worksheet
                worksheet.addImage(imageId1, {
                    tl: { col: 0, row: 3 },  // Column A, Row 4 (0-based index)
                    br: { col: 9, row: 23 }  // Column J, Row 24
                });
            } catch (error) {
                console.error('Error embedding specimen 1 image:', error);
                worksheet.getCell('A5').value = "Chart image could not be embedded";
            }
        }

        // Add Specimen 2 title
        worksheet.getCell('A30').value = "Specimen 2";
        worksheet.getCell('A30').font = { bold: true, size: 14 };

        // Embed specimen 2 chart image
        if (chartImages.specimen2) {
            try {
                // Remove the data URL prefix
                const base64Data = chartImages.specimen2.replace(/^data:image\/\w+;base64,/, '');

                const imageId2 = workbook.addImage({
                    base64: base64Data,
                    extension: 'png',
                });

                worksheet.addImage(imageId2, {
                    tl: { col: 0, row: 30 },
                    br: { col: 9, row: 50 }
                });
            } catch (error) {
                console.error('Error embedding specimen 2 image:', error);
                worksheet.getCell('A32').value = "Chart image could not be embedded";
            }
        }

        // Set column widths
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 15;
        worksheet.getColumn(3).width = 20;
    };

    const exportSingleRowToExcel = async (record) => {
        try {
            // Generate fresh chart images
            await generateChartImages();

            // Wait a moment for chart generation
            await new Promise(resolve => setTimeout(resolve, 500));

            const workbook = await createExcelWorkbook(record);

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
            const filename = `Test_Report_${record?.loadId || 'unknown'}_${timestamp}.xlsx`;

            // Save the workbook with ExcelJS
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, filename);
        } catch (error) {
            console.error('Error exporting single row:', error);
            alert('Error exporting report. Please try again.');
        }
    };

    // Function to export all data with charts
    const exportAllDataToExcel = async () => {
        try {
            // Generate fresh chart images
            await generateChartImages();

            // Wait a moment for chart generation
            await new Promise(resolve => setTimeout(resolve, 500));

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Inspection System';
            workbook.created = new Date();

            // Add summary sheet
            const summarySheet = workbook.addWorksheet('Summary');

            // Add summary content
            summarySheet.getCell('A1').value = "COMPLETE TEST DATA REPORT";
            summarySheet.getCell('A1').font = { bold: true, size: 16 };
            summarySheet.getCell('A1').alignment = { horizontal: 'center' };
            summarySheet.mergeCells('A1:C1');

            summarySheet.getCell('A3').value = "Generated on:";
            summarySheet.getCell('B3').value = new Date().toLocaleString();

            summarySheet.getCell('A5').value = "Total Records:";
            summarySheet.getCell('B5').value = records.length;

            summarySheet.getCell('A6').value = "Filtered Records:";
            summarySheet.getCell('B6').value = filteredRecords.length;

            summarySheet.getCell('A7').value = "Total Parts:";
            summarySheet.getCell('B7').value = totalParts;

            // Add chart images sheet
            await addChartImagesSheet(workbook);

            // Add data sheet
            const dataSheet = workbook.addWorksheet('All Records');

            // Add headers
            const headers = ["Load ID", "Chamber", "Status", "Parts", "Loaded At", "Completed At"];
            const headerRow = dataSheet.getRow(1);
            headers.forEach((header, index) => {
                const cell = headerRow.getCell(index + 1);
                cell.value = header;
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
            });

            // Add data
            filteredRecords.forEach((record, index) => {
                const row = dataSheet.getRow(index + 2);
                row.getCell(1).value = record.loadId || 'N/A';
                row.getCell(2).value = record.chamber || 'N/A';
                row.getCell(3).value = record.status || 'N/A';
                row.getCell(4).value = record.totalParts || 0;
                row.getCell(5).value = formatDate(record.loadedAt);
                row.getCell(6).value = formatDate(record.completedAt);
            });

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
            const filename = `Complete_Test_Report_${timestamp}.xlsx`;

            // Save the workbook
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(blob, filename);
        } catch (error) {
            console.error('Error exporting all data:', error);
            alert('Error exporting all data. Please try again.');
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

    // Create sample data
    const createSampleData = () => {
        // Placeholder - assign your dynamic data here
        const sampleData = [{
            "loadId": 1767010106171,
            "chamber": "SALT SPRAY",
            "parts": [
                {
                    "partNumber": "PART-001",
                    "serialNumber": "SN001",
                    "ticketCode": "0001_LGT_S_ANO_MP_015",
                    "testId": "test-1767010080932-2",
                    "testName": "Salt Spray (SST)",
                    "loadedAt": "2025-12-29T12:08:26.171Z",
                    "scanStatus": "OK",
                    "duration": "24",
                    "cosmeticImages": [
                        "data:image/webp;base64,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"
                    ],
                    "nonCosmeticImages": [
                        "data:image/jpeg;base64,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"
                    ],
                    "hasImages": true
                }
            ],
            "totalParts": 1,
            "machineDetails": {
                "machine": "SALT SPRAY",
                "ticketCode": "0001_LGT_S_ANO_MP_015",
                "project": "LIGHT",
                "build": "Build",
                "colour": "Stardust",
                "totalTests": 1,
                "tests": [
                    {
                        "id": "test-1767010080932-2",
                        "testName": "Salt Spray (SST)",
                        "duration": "24",
                        "status": 1,
                        "statusText": "Pending",
                        "requiredQty": 3,
                        "allocatedParts": 3,
                        "remainingQty": 3,
                        "alreadyAllocated": 0
                    }
                ],
                "estimatedDuration": 24,
                "machineId": "B2259",
                "machineDescription": "SALT SPRAY"
            },
            "loadedAt": "2025-12-29T12:08:26.171Z",
            "estimatedCompletion": null,
            "duration": 24,
            "testRecords": [
                {
                    "partNumber": "PART-001",
                    "serialNumber": "SN001",
                    "ticketCode": "0001_LGT_S_ANO_MP_015",
                    "testId": "test-1767010080932-2",
                    "testName": "Salt Spray (SST)",
                    "loadedAt": "2025-12-29T12:08:26.171Z",
                    "scanStatus": "OK",
                    "duration": "24",
                    "cosmeticImages": [
                        "data:image/webp;base64,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"
                    ],
                    "nonCosmeticImages": [
                        "data:image/jpeg;base64,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"
                    ],
                    "hasImages": true
                }
            ],
            "timerStatus": "stop",
            "timerStartTime": null,
            "testName": "Salt Spray (SST)",
            "testId": "test-1767010080932-2",
            "status": "Completed",
            "completedAt": "2025-12-29T16:05:22.025Z"
        }]; // Your dynamic data goes here
        setRecords(sampleData);
    };

    // Apply filters
    const applyFilters = () => {
        let filtered = [...records];

        if (filters.ticketCode) {
            filtered = filtered.filter(record =>
                record.testRecords?.some(test => test.ticketCode === filters.ticketCode)
            );
        }

        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            filtered = filtered.filter(record => {
                const recordDate = new Date(record.loadedAt || record.completedAt);
                return recordDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
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

    // Render chart containers (hidden)
    const renderHiddenCharts = () => (
        <div style={{ display: 'none' }}>
            <div ref={chartContainer1Ref} id="chart-container-1">
                <canvas id="chart-canvas-1" width="800" height="400"></canvas>
            </div>
            <div ref={chartContainer2Ref} id="chart-container-2">
                <canvas id="chart-canvas-2" width="800" height="400"></canvas>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Test Data Dashboard
                    </h1>
                    <p className="text-gray-600">View inspection records and export comprehensive reports with charts</p>
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
                                                    Export with Charts
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
                                    onClick={exportAllDataToExcel}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Export All Data with Charts
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Information Panel */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Export Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Single Record Export</h3>
                            <p className="text-sm text-blue-600">
                                Click "Export with Charts" on any row to download an Excel file containing:
                            </p>
                            <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
                                <li>Inspection Data sheet with detailed record information</li>
                                <li>Test Results sheet with color-coded Pass/Fail status</li>
                                <li>Force vs Displacement sheet with embedded chart images</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-800 mb-2">All Data Export</h3>
                            <p className="text-sm text-green-600">
                                Click "Export All Data with Charts" to download a comprehensive Excel file containing:
                            </p>
                            <ul className="mt-2 text-sm text-green-600 list-disc list-inside">
                                <li>Summary sheet with overall statistics</li>
                                <li>All Inspection Data in one table</li>
                                <li>Force vs Displacement charts as embedded images</li>
                                <li>Complete Test Results data</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            {renderHiddenCharts()}
        </div>
    );
};

export default InspectionDataViewer;