import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, RefreshCw, Database, FileSpreadsheet } from 'lucide-react';

// Import Excel files from src/data folder
import AEQUS_Data from '../data/AEQUS_Data.xlsx';

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
  const [numberOfDays, setNumberOfDays] = useState(30);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const tests = await loadRunningTestsSync();
      await loadLocalExcelFileWithTests(selectedFile, tests);
    };

    initializeData();
  }, []);

  const loadRunningTestsSync = () => {
    return new Promise((resolve) => {
      try {
        const storedRecords = localStorage.getItem('stage2Records');
        if (storedRecords) {
          const recordsArray = JSON.parse(storedRecords);
          const tests = [];

          if (Array.isArray(recordsArray)) {
            recordsArray.forEach(record => {
              if (record.testRecords && Array.isArray(record.testRecords)) {
                record.testRecords.forEach(test => {
                  const machines = [];
                  if (test.machineEquipment && test.machineEquipment.trim() !== '' && test.machineEquipment.trim() !== '-') {
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

  const loadRunningTests = () => {
    return new Promise((resolve) => {
      try {
        const storedRecords = localStorage.getItem('stage2Records');
        if (storedRecords) {
          const recordsArray = JSON.parse(storedRecords);
          const tests = [];

          if (Array.isArray(recordsArray)) {
            recordsArray.forEach(record => {
              if (record.testRecords && Array.isArray(record.testRecords)) {
                record.testRecords.forEach(test => {
                  const machines = [];
                  if (test.machineEquipment && test.machineEquipment.trim() !== '' && test.machineEquipment.trim() !== '-') {
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

  const normalizeEquipmentName = (name) => {
    if (!name) return null;
    let normalized = name.trim().replace(/\s+/g, ' ');

    const exactEquipmentNames = [
      'CKVI', 'CKV1', 'Instron', 'UTM', 'ASI Immersion', 'Ocean Immersion',
      'Pool Immersion', 'Tap Immersion', 'Foot Survivability',
      'Taber Linear Abrasion', 'Rock Tumble', 'Salt Spray',
      'Heat Soak', 'UV', 'Hardness machine', 'Thermal cycle',
      'Random Drop', 'Out source'
    ];

    for (const equipment of exactEquipmentNames) {
      if (normalized.toLowerCase() === equipment.toLowerCase()) {
        return equipment;
      }
    }

    const equipmentVariations = {
      'asi immersion': 'ASI Immersion',
      'ckv1': 'CKV1',
      'ckvi': 'CKVI',
      'foot survivability': 'Foot Survivability',
      'ocean immersion': 'Ocean Immersion',
      'pool immersion': 'Pool Immersion',
      'tap immersion': 'Tap Immersion',
      'taber linear abrasion': 'Taber Linear Abrasion',
      'tc': null,
      'utm': 'UTM',
      'instron': 'Instron',
      'heat soak': 'Heat Soak',
      'salt spray': 'Salt Spray',
      'rock tumble': 'Rock Tumble',
      'random drop': 'Random Drop',
      'thermal cycle': 'Thermal cycle',
      'uv': 'UV',
      'hardness machine': 'Hardness machine',
      'out source': null,
      'om': null,
      'r': null,
    };

    const lowerNormalized = normalized.toLowerCase();
    if (equipmentVariations[lowerNormalized] !== undefined) {
      return equipmentVariations[lowerNormalized];
    }

    const invalidValues = ['om', 'om drop', 'r', 'tc', ''];
    if (invalidValues.includes(lowerNormalized) || lowerNormalized.length <= 1) {
      return null;
    }

    return normalized.toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const splitCombinedEquipment = (equipmentName) => {
    const result = [];
    if (!equipmentName) return result;

    const name = equipmentName.trim();

    if (name.toLowerCase().includes('ckvi+random drop') || name.toLowerCase().includes('ckv1+random drop')) {
      result.push('CKVI');
      result.push('Random Drop');
      return result;
    }

    if (name.toLowerCase().includes('thermal cycle+instron')) {
      result.push('Thermal cycle');
      result.push('Instron');
      return result;
    }

    const separators = ['+', 'and', '&'];
    for (const separator of separators) {
      if (name.includes(separator)) {
        const parts = name.split(separator)
          .map(part => normalizeEquipmentName(part))
          .filter((part) => part !== null && part !== '');

        if (parts.length > 0) {
          parts.forEach(part => {
            if (!result.includes(part)) {
              result.push(part);
            }
          });
          return result;
        }
      }
    }

    const normalized = normalizeEquipmentName(name);
    if (normalized) {
      result.push(normalized);
    }

    return result;
  };

  const generateDateHeaders = (days) => {
    const headers = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      headers.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`,
        dayOfMonth: date.getDate()
      });
    }

    return headers;
  };

  const parseExcelDataWithTests = (jsonData, tests) => {
    const equipmentMap = new Map();
    const validEquipmentNames = new Set();

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 8) continue;

      const equipment1 = row[5] ? row[5].toString().trim() : '';
      const equipment2 = row[6] ? row[6].toString().trim() : '';

      if (equipment1 && equipment1 !== '' && equipment1 !== '-') {
        const equipmentList = splitCombinedEquipment(equipment1);
        equipmentList.forEach(eqName => {
          if (eqName) validEquipmentNames.add(eqName);
        });
      }

      if (equipment2 && equipment2 !== '' && equipment2 !== '-' && equipment2 !== equipment1) {
        const equipmentList = splitCombinedEquipment(equipment2);
        equipmentList.forEach(eqName => {
          if (eqName) validEquipmentNames.add(eqName);
        });
      }
    }

    validEquipmentNames.forEach(eqName => {
      if (!equipmentMap.has(eqName)) {
        equipmentMap.set(eqName, {
          chamber: eqName,
          tests: []
        });
      }
    });

    tests.forEach(test => {
      let testMachineName = test.machine;

      const machineVariations = {
        'ckv1': 'CKV1',
        'ckvi': 'CKVI',
        'asi immersion': 'ASI Immersion',
        'foot survivability': 'Foot Survivability',
        'ocean immersion': 'Ocean Immersion',
        'taber': 'Taber Linear Abrasion',
        'tap immersion': 'Tap Immersion',
        'utm': 'UTM',
        'pool immersion': 'Pool Immersion',
        'rock tumble': 'Rock Tumble',
        'salt spray': 'Salt Spray',
        'heat soak': 'Heat Soak',
        'hardness machine': 'Hardness machine',
        'thermal cycle': 'Thermal cycle',
        'random drop': 'Random Drop',
        'uv': 'UV'
      };

      const lowerMachine = testMachineName.toLowerCase();
      for (const [key, value] of Object.entries(machineVariations)) {
        if (lowerMachine.includes(key)) {
          testMachineName = value;
          break;
        }
      }

      const normalizedTestMachine = normalizeEquipmentName(testMachineName);

      if (normalizedTestMachine && equipmentMap.has(normalizedTestMachine)) {
        const equipment = equipmentMap.get(normalizedTestMachine);
        equipment.tests.push(test);
      } else if (normalizedTestMachine &&
        normalizedTestMachine !== 'TC' &&
        normalizedTestMachine !== 'Out source' &&
        !normalizedTestMachine.toLowerCase().includes('om') &&
        normalizedTestMachine !== 'R') {
        equipmentMap.set(normalizedTestMachine, {
          chamber: normalizedTestMachine,
          tests: [test]
        });
      }
    });

    const result = Array.from(equipmentMap.values())
      .map(eq => ({
        chamber: eq.chamber,
        tests: eq.tests
      }))
      .sort((a, b) => a.chamber.localeCompare(b.chamber));

    return result.length > 0 ? result : getSampleData();
  };

  const getSampleData = () => {
    return [
      { chamber: 'Hardness machine', tests: [] },
      { chamber: 'Heat Soak', tests: [] },
      { chamber: 'Salt Spray', tests: [] },
      { chamber: 'UV', tests: [] },
      { chamber: 'Instron', tests: [] }
    ];
  };

  const loadLocalExcelFileWithTests = async (filePath, tests) => {
    setLoading(true);

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedData = parseExcelDataWithTests(jsonData, tests);
      setData(parsedData);

      const fileInfo = availableFiles.find(f => f.path === filePath);
      setFileName(`${fileInfo?.name || 'Excel File'} (${sheetName})`);
      setDataSource('local');
      setSelectedFile(filePath);

    } catch (error) {
      console.error('Error loading Excel file:', error);
      setData(getSampleData());
      setFileName('Error loading file - showing sample data');
      setDataSource('sample');
    } finally {
      setLoading(false);
    }
  };

  const dateHeaders = generateDateHeaders(numberOfDays);
  const totalDays = numberOfDays;

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Equipment Schedule Gantt Chart</h2>
              <p className="text-sm text-gray-600">Timeline view of equipment testing schedules</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className="mr-2">
              <label className="text-xs text-gray-600 mr-2">Timeline:</label>
              <select
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="relative mr-2">
              <select
                value={selectedFile}
                onChange={(e) => loadLocalExcelFileWithTests(e.target.value, runningTests)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {availableFiles.map((file, index) => (
                  <option key={index} value={file.path}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading Excel data...</p>
          </div>
        ) : (
          <>
            {/* Gantt Chart */}
            <div className="overflow-x-auto border-t">
              <div style={{ minWidth: '1200px' }}>
                {/* Header Row */}
                <div className="flex border-b bg-gray-50">
                  <div className="w-64 p-4 border-r font-semibold text-sm text-gray-700">
                    Equipment / Machine
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 flex">
                      {dateHeaders.map((header, idx) => (
                        <div
                          key={idx}
                          className="flex-1 text-center py-2 border-r border-gray-200"
                        >
                          <div className="text-[10px] font-semibold text-gray-700">{header.dayName}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{header.dateStr}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data Rows */}
                {data.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex border-b hover:bg-blue-50 transition-colors">
                    <div className="w-64 p-4 border-r bg-white font-medium text-sm text-gray-800 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      {row.chamber}
                    </div>

                    <div className="flex-1 relative h-20 bg-gradient-to-r from-white to-gray-50">
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {dateHeaders.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-gray-100"></div>
                        ))}
                      </div>

                      {/* Available bar (full width in green) */}
                      <div
                        className="absolute top-2 bottom-2 rounded-lg"
                        style={{
                          left: '0%',
                          width: '100%',
                          backgroundColor: '#81c784'
                        }}
                      ></div>

                      {/* Test bars (overlay in red) */}
                      {row.tests.map((test, testIdx) => {
                        const testStart = new Date(test.startDateTime || test.submittedAt);
                        testStart.setHours(0, 0, 0, 0);
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const daysFromStart = Math.floor((testStart - today) / (1000 * 60 * 60 * 24));
                        const testDurationDays = Math.ceil(test.duration / 24);
                        
                        const leftPercent = (daysFromStart / totalDays) * 100;
                        const widthPercent = (testDurationDays / totalDays) * 100;

                        if (leftPercent + widthPercent < 0 || leftPercent > 100) {
                          return null;
                        }

                        const adjustedLeft = Math.max(0, leftPercent);
                        const adjustedWidth = Math.min(100 - adjustedLeft, widthPercent + Math.min(0, leftPercent));

                        const endDate = new Date(testStart);
                        endDate.setDate(endDate.getDate() + testDurationDays);

                        return (
                          <div
                            key={testIdx}
                            className="absolute top-2 bottom-2 rounded-lg flex flex-col items-center justify-center text-white text-xs font-medium shadow-md transition-all hover:shadow-lg cursor-pointer z-10"
                            style={{
                              left: `${adjustedLeft}%`,
                              width: `${adjustedWidth}%`,
                              backgroundColor: '#e57373',
                              minWidth: '30px'
                            }}
                            title={`${test.testName}\nDuration: ${test.duration}h (${testDurationDays} days)\nFrom: ${testStart.toLocaleDateString()}\nTo: ${endDate.toLocaleDateString()}`}
                          >
                            {adjustedWidth > 8 && (
                              <div className="px-2 text-center">
                                <div className="font-semibold text-[11px] truncate">{test.testName}</div>
                                <div className="text-[9px] opacity-90 mt-0.5">
                                  {testStart.getDate()} {testStart.toLocaleDateString('en-US', { month: 'short' })} - {endDate.getDate()} {endDate.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                                <div className="text-[9px] opacity-80">{testDurationDays}d</div>
                              </div>
                            )}
                            {adjustedWidth <= 8 && adjustedWidth > 3 && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white/90"></div>
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
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 rounded-lg" style={{ backgroundColor: '#e57373' }}></div>
                    <span className="text-sm text-gray-700">Testing / In Use</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Showing {numberOfDays} days • {runningTests.length} active test(s)
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