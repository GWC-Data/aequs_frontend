import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, RefreshCw, Database, FileSpreadsheet } from 'lucide-react';

// Import Excel files from src/data folder
// Note: You need to update these imports based on your actual file names
import AEQUS_Data  from '../data/AEQUS_Data.xlsx';

const GanttChart = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');
  const [availableFiles, setAvailableFiles] = useState([
    { 
      name: 'AEQUS_Data.xlsx', 
      path: AEQUS_Data,
      description: 'Main equipment schedule data'
    }
  ]);
  const [selectedFile, setSelectedFile] = useState(AEQUS_Data);
  const [runningTests, setRunningTests] = useState([]);

  // Load initial file and running tests when component mounts
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // First: Load running tests from localStorage
      const tests = await loadRunningTestsSync();
      
      // Second: Load Excel with the running tests data
      await loadLocalExcelFileWithTests(selectedFile, tests);
    };
    
    initializeData();
  }, []);

  // Synchronous version that returns tests directly
  const loadRunningTestsSync = () => {
    return new Promise((resolve) => {
      try {
        const storedRecords = localStorage.getItem('stage2Records');
        if (storedRecords) {
          const recordsArray = JSON.parse(storedRecords);
          const tests = [];
          
          // stage2Records is an array, so loop through each record
          if (Array.isArray(recordsArray)) {
            recordsArray.forEach(record => {
              // Extract from testRecords array in each record
              if (record.testRecords && Array.isArray(record.testRecords)) {
                record.testRecords.forEach(test => {
                  // Get machines from both fields
                  const machines = [];
                  if (test.machineEquipment && test.machineEquipment.trim() !== '' && test.machineEquipment.trim() !== '-') {
                    // Split by comma if multiple machines in one field
                    const machineList = test.machineEquipment.split(',').map(m => m.trim()).filter(m => m !== '');
                    machines.push(...machineList);
                  }
                  if (test.machineEquipment2 && test.machineEquipment2.trim() !== '' && test.machineEquipment2.trim() !== '-') {
                    const machineList = test.machineEquipment2.split(',').map(m => m.trim()).filter(m => m !== '');
                    machineList.forEach(m => {
                      if (!machines.includes(m)) {
                        machines.push(m);
                      }
                    });
                  }
                  
                  // Add test for each unique machine
                  machines.forEach(machine => {
                    tests.push({
                      machine: machine,
                      testName: test.testName || 'Test',
                      duration: parseFloat(test.timing) || 0,
                      startDateTime: test.startDateTime || record.submittedAt,
                      submittedAt: record.submittedAt
                    });
                  });
                });
              }
            });
          }
          
          console.log('Loaded running tests:', tests);
          setRunningTests(tests);
          resolve(tests);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Error loading running tests from localStorage:', error);
        resolve([]);
      }
    });
  };

  // Load running tests from localStorage
  const loadRunningTests = () => {
    return new Promise((resolve) => {
      try {
        const storedRecords = localStorage.getItem('stage2Records');
        if (storedRecords) {
          const recordsArray = JSON.parse(storedRecords);
          const tests = [];
          
          // stage2Records is an array, so loop through each record
          if (Array.isArray(recordsArray)) {
            recordsArray.forEach(record => {
              // Extract from testRecords array in each record
              if (record.testRecords && Array.isArray(record.testRecords)) {
                record.testRecords.forEach(test => {
                  // Get machines from both fields
                  const machines = [];
                  if (test.machineEquipment && test.machineEquipment.trim() !== '' && test.machineEquipment.trim() !== '-') {
                    // Split by comma if multiple machines in one field
                    const machineList = test.machineEquipment.split(',').map(m => m.trim()).filter(m => m !== '');
                    machines.push(...machineList);
                  }
                  if (test.machineEquipment2 && test.machineEquipment2.trim() !== '' && test.machineEquipment2.trim() !== '-') {
                    const machineList = test.machineEquipment2.split(',').map(m => m.trim()).filter(m => m !== '');
                    machineList.forEach(m => {
                      if (!machines.includes(m)) {
                        machines.push(m);
                      }
                    });
                  }
                  
                  // Add test for each unique machine
                  machines.forEach(machine => {
                    tests.push({
                      machine: machine,
                      testName: test.testName || 'Test',
                      duration: parseFloat(test.timing) || 0,
                      startDateTime: test.startDateTime || record.submittedAt,
                      submittedAt: record.submittedAt
                    });
                  });
                });
              }
            });
          }
          
          console.log('Loaded running tests (refresh):', tests);
          setRunningTests(tests);
          resolve(tests);
        } else {
          setRunningTests([]);
          resolve([]);
        }
      } catch (error) {
        console.error('Error loading running tests from localStorage:', error);
        setRunningTests([]);
        resolve([]);
      }
    });
  };

  // Function to load Excel file with tests data
  const loadLocalExcelFileWithTests = async (filePath, tests) => {
    setLoading(true);
    
    try {
      // Fetch the file
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Parse the Excel data with the tests
      const parsedData = parseExcelDataWithTests(jsonData, tests);
      setData(parsedData);
      
      // Update UI state
      const fileInfo = availableFiles.find(f => f.path === filePath);
      setFileName(`${fileInfo?.name || 'Excel File'} (${sheetName})`);
      setDataSource('local');
      setSelectedFile(filePath);
      
    } catch (error) {
      console.error('Error loading Excel file:', error);
      // Fallback to sample data
      setData(getSampleData());
      setFileName('Error loading file - showing sample data');
      setDataSource('sample');
    } finally {
      setLoading(false);
    }
  };

  // Function to load Excel file from local path
  const loadLocalExcelFile = async (filePath) => {
    setLoading(true);
    
    try {
      // Fetch the file
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Parse the Excel data
      const parsedData = parseExcelData(jsonData);
      setData(parsedData);
      
      // Update UI state
      const fileInfo = availableFiles.find(f => f.path === filePath);
      setFileName(`${fileInfo?.name || 'Excel File'} (${sheetName})`);
      setDataSource('local');
      setSelectedFile(filePath);
      
    } catch (error) {
      console.error('Error loading Excel file:', error);
      // Fallback to sample data
      setData(getSampleData());
      setFileName('Error loading file - showing sample data');
      setDataSource('sample');
    } finally {
      setLoading(false);
    }
  };

  // Fallback sample data
  const getSampleData = () => {
    return [
      {
        chamber: 'Hardness machine',
        tasks: [
          { start: 1, duration: 5, status: 'running', color: '#81c784' },
          { start: 6, duration: 24, status: 'testing', color: '#e57373', label: 'Ano Hardness: 24h' },
          { start: 30, duration: 17, status: 'running', color: '#81c784' }
        ]
      },
      {
        chamber: 'Heat Soak',
        tasks: [
          { start: 1, duration: 3, status: 'running', color: '#81c784' },
          { start: 4, duration: 72, status: 'testing', color: '#e57373', label: 'Temperature Cycling: 72h' },
          { start: 76, duration: 20, status: 'running', color: '#81c784' },
          { start: 96, duration: 504, status: 'testing', color: '#e57373', label: 'Heat Soak: 504h' }
        ]
      },
      {
        chamber: 'Salt spray',
        tasks: [
          { start: 1, duration: 10, status: 'running', color: '#81c784' },
          { start: 11, duration: 24, status: 'testing', color: '#e57373', label: 'Salt Spray: 24h' },
          { start: 35, duration: 15, status: 'running', color: '#81c784' }
        ]
      },
      {
        chamber: 'UV',
        tasks: [
          { start: 1, duration: 5, status: 'running', color: '#81c784' },
          { start: 6, duration: 600, status: 'testing', color: '#e57373', label: 'UV Exposure: 600h' },
          { start: 606, duration: 10, status: 'running', color: '#81c784' }
        ]
      },
      {
        chamber: 'Instron',
        tasks: [
          { start: 1, duration: 3, status: 'testing', color: '#e57373', label: 'Screw Test: 3h' },
          { start: 4, duration: 2, status: 'running', color: '#81c784' },
          { start: 6, duration: 0.4, status: 'testing', color: '#e57373', label: 'Pull Test: 0.4h' },
          { start: 6.4, duration: 5, status: 'running', color: '#81c784' }
        ]
      }
    ];
  };

  // Parse Excel data into Gantt format with tests
  const parseExcelDataWithTests = (jsonData, tests) => {
    const equipmentMap = new Map();
    let uniqueId = 0;

    // First, collect all unique equipment names from Excel
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 8) continue;

      const equipment1 = row[5] ? row[5].toString().trim() : '';
      const equipment2 = row[6] ? row[6].toString().trim() : '';

      // Add equipment to map if not exists
      if (equipment1 && equipment1 !== '' && equipment1 !== '-') {
        if (!equipmentMap.has(equipment1)) {
          equipmentMap.set(equipment1, {
            chamber: equipment1,
            tasks: []
          });
        }
      }

      if (equipment2 && equipment2 !== '' && equipment2 !== '-' && equipment2 !== equipment1) {
        if (!equipmentMap.has(equipment2)) {
          equipmentMap.set(equipment2, {
            chamber: equipment2,
            tasks: []
          });
        }
      }
    }

    // Now check running tests and add tasks
    tests.forEach(test => {
      if (equipmentMap.has(test.machine)) {
        const equipment = equipmentMap.get(test.machine);
        
        // Add red task bar for running test starting from 0
        equipment.tasks.push({
          start: 0,
          duration: test.duration,
          status: 'testing',
          color: '#e57373',
          label: `${test.testName}: ${test.duration}h`,
          uniqueId: uniqueId++,
          testName: test.testName
        });

        // Add green availability after the test
        equipment.tasks.push({
          start: test.duration,
          duration: Math.max(10, test.duration * 0.5),
          status: 'running',
          color: '#81c784',
          uniqueId: uniqueId++
        });
      } else {
        // If machine from localStorage not in Excel, add it
        equipmentMap.set(test.machine, {
          chamber: test.machine,
          tasks: [
            {
              start: 0,
              duration: test.duration,
              status: 'testing',
              color: '#e57373',
              label: `${test.testName}: ${test.duration}h`,
              uniqueId: uniqueId++,
              testName: test.testName
            },
            {
              start: test.duration,
              duration: Math.max(10, test.duration * 0.5),
              status: 'running',
              color: '#81c784',
              uniqueId: uniqueId++
            }
          ]
        });
      }
    });

    // For machines without running tests, add green availability bars
    equipmentMap.forEach((equipment, machineName) => {
      if (equipment.tasks.length === 0) {
        // Add full green bar for available machines
        equipment.tasks.push({
          start: 0,
          duration: 100,
          status: 'running',
          color: '#81c784',
          uniqueId: uniqueId++
        });
      }
    });

    // Convert to array and sort
    const result = Array.from(equipmentMap.values())
      .map(eq => ({
        chamber: eq.chamber,
        tasks: eq.tasks
      }))
      .sort((a, b) => a.chamber.localeCompare(b.chamber));

    return result.length > 0 ? result : getSampleData();
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setDataSource('uploaded');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Get current running tests
        const tests = await loadRunningTests();
        const parsedData = parseExcelDataWithTests(jsonData, tests);
        
        setData(parsedData);
        setFileName(`${file.name} (${sheetName})`);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error reading Excel file. Please check the format.');
        setLoading(false);
        setDataSource('sample');
        setData(getSampleData());
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      ['Processes Stage', 'Test Name', 'Test Condition', 'Qty', 'Specification', 'Machine / Equipment', 'Machine / Equipment-2', 'Qty'],
      ['ANO Flash NPI', 'Ano Hardness', 'RT', '10pcs/build', '<300 HV0.05', 'Hardness machine', 'Hardness machine', 24],
      ['ANO Flash NPI', '5x5 Delam', 'RT', '10pcs/build', '≥15 Delam counts', 'Out source', 'Out source', 24],
      ['ANO Flash NPI', 'Short Term Survivability (STS)', 'Temp : 85°C', '3pcs/build', '-Any sample with corrosion spot ≥250 μm', 'Heat Soak', 'Heat Soak', 9],
      ['ANO Flash NPI', 'Temperature & Humidity Cycling (THC)', '-20 ~ +65℃ and 90% RH 6 Cycles', '3pcs/build', '-Any sample with corrosion spot ≥250 μm', 'Heat Soak', 'Heat Soak', 72],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 10 }, 
      { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Schedule');
    XLSX.writeFile(wb, 'Equipment_Schedule_Template.xlsx');
  };

  // Calculate max time for scaling
  const getMaxTime = () => {
    if (data.length === 0) return 100;
    return Math.max(...data.flatMap(row => 
      row.tasks.map(task => task.start + task.duration)
    ), 100);
  };

  // Generate time headers
  const getTimeHeaders = () => {
    const maxTime = getMaxTime();
    const headers = [];
    const step = Math.ceil(maxTime / 20);
    
    for (let i = 0; i <= maxTime; i += step) {
      headers.push(`${Math.round(i)}h`);
    }
    
    return headers;
  };

  const timeHeaders = getTimeHeaders();
  const maxTime = getMaxTime();

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Equipment Schedule Timeline</h2>
              <p className="text-sm text-gray-600">Visualize equipment testing schedules</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* File Selector */}
            <div className="relative mr-2">
              <select
                value={selectedFile}
                onChange={(e) => loadLocalExcelFile(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {availableFiles.map((file, index) => (
                  <option key={index} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={async () => {
                const tests = await loadRunningTests();
                await loadLocalExcelFileWithTests(selectedFile, tests);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>

            {/* Upload Button */}
            <label className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer shadow-sm">
              <Upload size={16} />
              Upload
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </label>

            {/* Template Button */}
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-sm"
            >
              <Download size={16} />
              Template
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">{fileName}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    dataSource === 'local' ? 'bg-green-100 text-green-800' :
                    dataSource === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dataSource === 'local' ? 'Local File' : 
                     dataSource === 'uploaded' ? 'Uploaded File' : 'Sample Data'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {data.length} equipment(s) loaded • {runningTests.length} test(s) running
                  </span>
                </div>
              </div>
            </div>
            
            {dataSource === 'local' && (
              <button
                onClick={async () => {
                  const tests = await loadRunningTests();
                  await loadLocalExcelFileWithTests(selectedFile, tests);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Reload
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading Excel data...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we process your equipment schedule</p>
          </div>
        ) : (
          <>
            {/* Gantt Chart */}
            <div className="overflow-x-auto border-t">
              <div className="min-w-[1400px]">
                {/* Header Row */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-64 p-4 border-r font-semibold text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-white">
                    Equipment / Machine
                  </div>
                  <div className="flex-1 flex">
                    <div className="flex-1 text-center p-3 font-semibold text-sm border-b-2 border-blue-300 bg-gradient-to-b from-blue-50 to-white">
                      Time Schedule (hours)
                    </div>
                  </div>
                </div>

                {/* Time Headers */}
                <div className="flex border-b bg-gradient-to-b from-white to-gray-50">
                  <div className="w-64 border-r"></div>
                  <div className="flex-1 flex">
                    {timeHeaders.map((header, idx) => (
                      <div
                        key={idx}
                        className="flex-1 text-center py-3 text-xs font-medium border-r border-gray-200 text-gray-600"
                      >
                        {header}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Rows */}
                {data.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex border-b hover:bg-blue-50 transition-colors">
                    {/* Equipment Name */}
                    <div className="w-64 p-4 border-r bg-white font-medium text-sm text-gray-800 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      {row.chamber}
                    </div>

                    {/* Timeline Grid */}
                    <div className="flex-1 relative h-16 bg-gradient-to-r from-white to-gray-50">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {timeHeaders.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-gray-100 h-full"></div>
                        ))}
                      </div>

                      {/* Task Bars */}
                      {row.tasks.map((task, taskIdx) => {
                        const leftPercent = (task.start / maxTime) * 100;
                        const widthPercent = (task.duration / maxTime) * 100;

                        return (
                          <div
                            key={task.uniqueId || taskIdx}
                            className="absolute top-2 bottom-2 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm transition-all hover:shadow-md cursor-pointer group"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: task.color,
                              minWidth: '4px'
                            }}
                            title={`${task.label || `${task.status}: ${task.duration}h`}\nClick for details`}
                          >
                            {task.label && widthPercent > 8 && (
                              <span className="px-2 truncate group-hover:whitespace-normal group-hover:break-words group-hover:bg-black/80 group-hover:px-2 group-hover:py-1 group-hover:rounded group-hover:z-50">
                                {task.label}
                              </span>
                            )}
                            {(!task.label || widthPercent <= 8) && widthPercent > 3 && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white/80"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 rounded-lg" style={{ backgroundColor: '#81c784' }}></div>
                    <span className="text-sm text-gray-700">Available / Idle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 rounded-lg" style={{ backgroundColor: '#e57373' }}></div>
                    <span className="text-sm text-gray-700">Testing / In Use</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Total timeline: {Math.round(maxTime)} hours • {runningTests.length} active test(s)
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GanttChart;