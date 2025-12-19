import React, { useState, useEffect } from 'react';
import { RefreshCw, FileSpreadsheet, X, Scan, Search, Info, Clock, Calendar, Grid } from 'lucide-react';

const GanttChart = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [runningTests, setRunningTests] = useState([]);
  const [numberOfDays, setNumberOfDays] = useState(30);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState('');
  const [scannedParts, setScannedParts] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [partInput, setPartInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [machineDetails, setMachineDetails] = useState(null);
  const [chamberLoadingStatus, setChamberLoadingStatus] = useState({});
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [machineAvailability, setMachineAvailability] = useState({});

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      calculateMachineAvailability();
    }
  }, [data]);

  const calculateMachineAvailability = () => {
    const availability = {};
    const chamberLoads = JSON.parse(localStorage.getItem('chamberLoads') || '[]');
    
    data.forEach(row => {
      const machineName = row.chamber;
      const activeLoads = chamberLoads.filter(load => 
        load.chamber === machineName && load.status === 'loaded'
      );
      
      let status = 'available'; // green
      
      // Check if machine is currently loading (in modal)
      if (chamberLoadingStatus[machineName] && selectedChamber === machineName) {
        status = 'loading'; // yellow
      } 
      // Check if machine has active loads
      else if (activeLoads.length > 0) {
        // Check if any load is currently active (not completed)
        const now = new Date();
        const hasActiveLoad = activeLoads.some(load => {
          const loadEnd = new Date(load.estimatedCompletion);
          return loadEnd > now;
        });
        
        if (hasActiveLoad) {
          status = 'occupied'; // red
        } else {
          status = 'available'; // green (all loads completed)
        }
      }
      
      // Count parts in active loads
      const activePartsCount = activeLoads.reduce((sum, load) => sum + load.parts.length, 0);
      
      availability[machineName] = {
        status,
        activeLoads: activeLoads.length,
        activeParts: activePartsCount,
        lastUpdated: new Date().toLocaleTimeString()
      };
    });
    
    setMachineAvailability(availability);
  };

  const initializeData = async () => {
    setLoading(true);
    const tests = await loadRunningTests();
    loadSampleData(tests);
    setLoading(false);
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

  const getSampleData = () => {
    return [
      { chamber: 'Hardness machine', tests: [] },
      { chamber: 'Taber linear abrasion', tests: [] },
      { chamber: 'Heat soak', tests: [] },
      { chamber: 'Salt spray', tests: [] },
      { chamber: 'UV', tests: [] },
      { chamber: 'Out source', tests: [] },
      { chamber: 'CKVI', tests: [] },
      { chamber: 'CKV1', tests: [] },
      { chamber: 'Instron', tests: [] },
      { chamber: 'UTM', tests: [] },
      { chamber: 'ASI Immersion', tests: [] },
      { chamber: 'Ocean Immersion', tests: [] },
      { chamber: 'Pool Immersion', tests: [] },
      { chamber: 'Tap Immersion', tests: [] },
      { chamber: 'Foot Survivability', tests: [] },
      { chamber: 'Rock Tumble', tests: [] },
      { chamber: 'Thermal cycle', tests: [] },
      { chamber: 'Random Drop', tests: [] }
    ];
  };

  const loadSampleData = (tests) => {
    const equipmentMap = new Map();
    const sampleEquipment = getSampleData();

    sampleEquipment.forEach(eq => {
      equipmentMap.set(eq.chamber, {
        chamber: eq.chamber,
        tests: []
      });
    });

    tests.forEach(test => {
      const testMachineName = test.machine;
      
      if (equipmentMap.has(testMachineName)) {
        const equipment = equipmentMap.get(testMachineName);
        equipment.tests.push(test);
      }
    });

    const result = Array.from(equipmentMap.values())
      .sort((a, b) => a.chamber.localeCompare(b.chamber));

    setData(result);
    setFileName('Equipment Schedule Data');
  };

  const normalizeMachineName = (machineName) => {
    if (!machineName) return '';
    const name = machineName.toLowerCase().trim();
    
    const mappings = {
      'hardness machine': 'hardness machine',
      'hardness machine ': 'hardness machine',
      'heat soak': 'heat soak',
      'heat soak ': 'heat soak',
      'salt spray': 'salt spray',
      'salt spray ': 'salt spray',
      'uv': 'uv',
      'uv ': 'uv',
      'taber leanear abbraster': 'taber linear abrasion',
      'taber linear abrasion': 'taber linear abrasion',
      'heat soak + steel rain': 'heat soak',
      'out source': 'out source',
      'out source ': 'out source'
    };
    
    for (const [key, value] of Object.entries(mappings)) {
      if (name.includes(key) || key.includes(name)) {
        return value;
      }
    }
    
    return name;
  };

  const handleLoadChamber = (chamberName) => {
    setSelectedChamber(chamberName);
    setScannedParts([]);
    setPartInput('');
    setSelectedTest('');
    setAvailableTests([]);
    setMachineDetails(null);
    setShowLoadModal(true);
    
    setChamberLoadingStatus(prev => ({
      ...prev,
      [chamberName]: true
    }));
  };

  const handlePartScan = async () => {
    if (!partInput.trim()) {
      alert('Please enter a part number');
      return;
    }

    setScanning(true);
    const partNumber = partInput.trim().toUpperCase();

    try {
      const oqcRecords = JSON.parse(localStorage.getItem('oqc_ticket_records') || '[]');
      let partDetails = null;
      let foundTicketCode = null;

      for (const record of oqcRecords) {
        for (const session of record.sessions || []) {
          const matchingPart = session.parts?.find(part => 
            part.partNumber?.toUpperCase() === partNumber
          );
          
          if (matchingPart) {
            partDetails = {
              partNumber: matchingPart.partNumber,
              serialNumber: matchingPart.serialNumber,
              id: matchingPart.id,
              ticketCode: record.ticketCode,
              project: record.project,
              build: record.build,
              colour: record.colour,
              anoType: record.anoType,
              oqcRecordId: record.id,
              sessionId: session.id,
              sessionNumber: session.sessionNumber
            };
            foundTicketCode = record.ticketCode;
            break;
          }
        }
        if (partDetails) break;
      }

      if (!partDetails) {
        alert(`Part ${partNumber} not found in OQC records!`);
        setScanning(false);
        return;
      }

      const existingLoads = JSON.parse(localStorage.getItem('chamberLoads') || '[]');
      const alreadyLoaded = existingLoads.some(load => 
        load.parts.some(part => part.partNumber === partNumber)
      );

      if (alreadyLoaded) {
        alert(`Part ${partNumber} is already loaded in another chamber!`);
        setScanning(false);
        return;
      }

      const allocations = JSON.parse(localStorage.getItem('ticket_allocations_array') || '[]');
      const normalizedChamber = normalizeMachineName(selectedChamber);
      
      const ticketAllocations = allocations.filter(allocation => 
        allocation.ticketCode === foundTicketCode
      );

      if (ticketAllocations.length === 0) {
        alert(`No allocations found for ticket ${foundTicketCode}`);
        setScanning(false);
        return;
      }

      const matchingTests = [];
      ticketAllocations.forEach(allocation => {
        allocation.testAllocations?.forEach(test => {
          const normalizedMachine = normalizeMachineName(test.machineEquipment || '');
          const isMatch = 
            normalizedMachine === normalizedChamber ||
            normalizedMachine.includes(normalizedChamber) ||
            normalizedChamber.includes(normalizedMachine) ||
            (normalizedChamber === 'heat soak' && 
             (normalizedMachine.includes('heat soak') || normalizedMachine.includes('steel rain')));

          if (isMatch) {
            const allocatedParts = test.allocatedParts || 0;
            const requiredQty = test.requiredQty || 0;
            const remainingToAllocate = allocatedParts;
            
            if (remainingToAllocate > 0) {
              const alreadyAllocated = requiredQty - allocatedParts;
              
              matchingTests.push({
                ...test,
                ticketCode: allocation.ticketCode,
                allocationId: allocation.id,
                project: allocation.project,
                build: allocation.build,
                colour: allocation.colour,
                allocatedParts: allocatedParts,
                requiredQty: requiredQty,
                remainingQty: remainingToAllocate,
                alreadyAllocated: alreadyAllocated,
                statusText: getTestStatusText(test.status) // Changed to getTestStatusText
              });
            }
          }
        });
      });

      if (matchingTests.length === 0) {
        alert(`No available tests found for ${selectedChamber} in ticket ${foundTicketCode} or all tests are fully allocated!`);
        setScanning(false);
        return;
      }

      setAvailableTests(matchingTests);
      if (!selectedTest && matchingTests.length > 0) {
        setSelectedTest(matchingTests[0].id);
      }

      const newScannedPart = {
        id: Date.now(),
        ...partDetails,
        scannedAt: new Date().toLocaleString(),
        availableTests: matchingTests,
        selectedTestId: matchingTests[0]?.id,
        scanStatus: 'OK'
      };

      setScannedParts([...scannedParts, newScannedPart]);
      setPartInput('');
      
      updateMachineDetails(matchingTests);

    } catch (error) {
      console.error('Error scanning part:', error);
      alert('Error scanning part. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // Renamed this function to avoid conflict
  const getTestStatusText = (statusCode) => {
    switch(statusCode) {
      case 1: return 'Pending';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Failed';
      default: return 'Unknown';
    }
  };

  const updateMachineDetails = (tests) => {
    if (tests.length > 0) {
      const firstTest = tests[0];
      const totalDuration = Math.max(...tests.map(t => parseFloat(t.time) || 0));
      
      setMachineDetails({
        machine: selectedChamber,
        ticketCode: firstTest.ticketCode,
        project: firstTest.project,
        build: firstTest.build,
        colour: firstTest.colour,
        totalTests: tests.length,
        tests: tests.map(test => ({
          id: test.id,
          testName: test.testName,
          duration: test.time,
          status: test.status,
          statusText: getTestStatusText(test.status), // Updated reference
          requiredQty: test.requiredQty,
          allocatedParts: test.allocatedParts,
          remainingQty: test.remainingQty,
          alreadyAllocated: test.alreadyAllocated
        })),
        estimatedDuration: totalDuration
      });
    }
  };

  const handleTestSelection = (partId, testId) => {
    setScannedParts(prev => prev.map(part => 
      part.id === partId ? { ...part, selectedTestId: testId } : part
    ));
  };

  const handleRemovePart = (partId) => {
    setScannedParts(scannedParts.filter(part => part.id !== partId));
    
    if (scannedParts.length === 1) {
      setAvailableTests([]);
      setMachineDetails(null);
    }
  };

  const handleConfirmLoad = () => {
    if (scannedParts.length === 0) {
      alert('No parts scanned!');
      return;
    }

    const partsWithoutTests = scannedParts.filter(part => !part.selectedTestId);
    if (partsWithoutTests.length > 0) {
      alert('Please select tests for all parts before loading');
      return;
    }

    const allocations = JSON.parse(localStorage.getItem('ticket_allocations_array') || '[]');
    const updatedAllocations = [...allocations];
    let hasCapacityIssues = false;
    let totalDuration = 0;

    const allocationSummary = {};

    scannedParts.forEach(part => {
      const selectedTest = part.availableTests.find(t => t.id === part.selectedTestId);
      if (selectedTest) {
        const allocationIndex = updatedAllocations.findIndex(a => a.ticketCode === part.ticketCode);
        if (allocationIndex !== -1) {
          const testIndex = updatedAllocations[allocationIndex].testAllocations?.findIndex(
            t => t.id === part.selectedTestId
          );
          
          if (testIndex !== -1) {
            const test = updatedAllocations[allocationIndex].testAllocations[testIndex];
            const remainingToAllocate = test.allocatedParts || 0;
            
            if (remainingToAllocate <= 0) {
              hasCapacityIssues = true;
              alert(`Test "${test.testName}" has no remaining capacity!`);
            }
          }
        }
      }
    });

    if (hasCapacityIssues) {
      return;
    }

    scannedParts.forEach(part => {
      const selectedTest = part.availableTests.find(t => t.id === part.selectedTestId);
      if (selectedTest) {
        const allocationIndex = updatedAllocations.findIndex(a => a.ticketCode === part.ticketCode);
        if (allocationIndex !== -1) {
          const testIndex = updatedAllocations[allocationIndex].testAllocations?.findIndex(
            t => t.id === part.selectedTestId
          );
          
          if (testIndex !== -1) {
            const test = updatedAllocations[allocationIndex].testAllocations[testIndex];
            const oldAllocatedCount = test.allocatedParts || 0;
            const requiredQty = test.requiredQty || 0;
            
            const newAllocatedCount = Math.max(0, oldAllocatedCount - 1);
            updatedAllocations[allocationIndex].testAllocations[testIndex].allocatedParts = newAllocatedCount;
            
            const actuallyAllocatedSoFar = requiredQty - newAllocatedCount;
            
            if (updatedAllocations[allocationIndex].testAllocations[testIndex].status === 1) {
              updatedAllocations[allocationIndex].testAllocations[testIndex].status = 2;
            }
            
            if (!allocationSummary[test.testName]) {
              allocationSummary[test.testName] = {
                count: 0,
                oldValue: oldAllocatedCount,
                newValue: newAllocatedCount,
                requiredQty: requiredQty,
                actuallyAllocated: actuallyAllocatedSoFar
              };
            }
            allocationSummary[test.testName].count++;
            allocationSummary[test.testName].newValue = newAllocatedCount;
            allocationSummary[test.testName].actuallyAllocated = actuallyAllocatedSoFar;
            
            totalDuration = Math.max(totalDuration, parseFloat(test.time) || 0);
          }
        }
      }
    });

    localStorage.setItem('ticket_allocations_array', JSON.stringify(updatedAllocations));

    const loadData = {
      id: Date.now(),
      chamber: selectedChamber,
      parts: scannedParts.map(part => ({
        partNumber: part.partNumber,
        serialNumber: part.serialNumber,
        ticketCode: part.ticketCode,
        testId: part.selectedTestId,
        testName: part.availableTests.find(t => t.id === part.selectedTestId)?.testName || 'Unknown',
        loadedAt: new Date().toISOString(),
        scanStatus: part.scanStatus,
        duration: part.availableTests.find(t => t.id === part.selectedTestId)?.time || 0
      })),
      machineDetails: machineDetails,
      loadedAt: new Date().toISOString(),
      duration: totalDuration,
      status: 'loaded',
      estimatedCompletion: new Date(Date.now() + (totalDuration * 60 * 60 * 1000)).toISOString()
    };

    const existingLoads = JSON.parse(localStorage.getItem('chamberLoads') || '[]');
    existingLoads.push(loadData);
    localStorage.setItem('chamberLoads', JSON.stringify(existingLoads));

    let summary = `Successfully loaded ${scannedParts.length} parts into ${selectedChamber} for ${totalDuration} hours\n\n`;
    summary += 'Allocation Summary:\n';
    
    Object.entries(allocationSummary).forEach(([testName, data]) => {
      summary += `- ${testName}: ${data.count} part(s) allocated. `;
      summary += `Allocated count decreased from ${data.oldValue} to ${data.newValue}. `;
      summary += `Now ${data.actuallyAllocated}/${data.requiredQty} allocated.\n`;
    });

    alert(summary);

    setChamberLoadingStatus(prev => ({
      ...prev,
      [selectedChamber]: false
    }));

    setShowLoadModal(false);
    setScannedParts([]);
    setPartInput('');
    setSelectedTest('');
    
    setTimeout(() => {
      const tests = loadRunningTests();
      loadSampleData(tests);
      calculateMachineAvailability();
    }, 100);
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

  const dateHeaders = generateDateHeaders(numberOfDays);
  const totalDays = numberOfDays;

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#4CAF50'; // Green
      case 'occupied': return '#F44336'; // Red
      case 'loading': return '#FFEB3B'; // Yellow
      default: return '#9E9E9E'; // Grey
    }
  };

  // This is the second getStatusText function (for machine status)
  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'loading': return 'Loading...';
      default: return 'Unknown';
    }
  };

  const renderTableView = () => {
    return (
      <div className="p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Machine / Chamber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Loads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parts in Chamber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => {
                const availability = machineAvailability[row.chamber] || { 
                  status: 'available', 
                  activeLoads: 0, 
                  activeParts: 0,
                  lastUpdated: 'N/A'
                };
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getStatusColor(availability.status) }}
                        ></div>
                        <div className="text-sm font-medium text-gray-900">
                          {row.chamber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        availability.status === 'available' ? 'bg-green-100 text-green-800' :
                        availability.status === 'occupied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusText(availability.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {availability.activeLoads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {availability.activeParts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {availability.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleLoadChamber(row.chamber)}
                        // disabled={availability.status === 'occupied' || availability.status === 'loading'}
                        className={'px-4 py-2 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700'}
                      >
                        {availability.status === 'loading' ? 'Loading...' : 'Load Chamber'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Legend for table view */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status Legend:</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Available - Ready to load</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Occupied - Currently in use</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-600">Loading - Being loaded now</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    return (
      <div className="overflow-x-auto border-t">
        <div style={{ minWidth: '1200px' }}>
          <div className="flex border-b bg-gray-50">
            <div className="w-80 p-4 border-r font-semibold text-sm text-gray-700">
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

          {data.map((row, rowIdx) => {
            const chamberLoads = JSON.parse(localStorage.getItem('chamberLoads') || '[]');
            const activeChamberLoads = chamberLoads.filter(load => 
              load.chamber === row.chamber && 
              load.status === 'loaded'
            ).sort((a, b) => new Date(a.loadedAt) - new Date(b.loadedAt));
            
            return (
              <div key={rowIdx} className="flex border-b hover:bg-blue-50 transition-colors">
                <div className="w-80 p-3 border-r bg-white font-medium text-sm text-gray-800 flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ 
                        backgroundColor: getStatusColor(machineAvailability[row.chamber]?.status || 'available')
                      }}
                    ></div>
                    <span className="truncate">{row.chamber}</span>
                    {activeChamberLoads.length > 0 && (
                      <div className="ml-2 flex items-center text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                        <Clock size={12} className="mr-1" />
                        {activeChamberLoads.length} load(s) • {activeChamberLoads.reduce((sum, load) => sum + load.parts.length, 0)} parts
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 relative h-20 bg-gradient-to-r from-white to-gray-50">
                  <div className="absolute inset-0 flex">
                    {dateHeaders.map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-100"></div>
                    ))}
                  </div>

                  {/* Chamber availability bar - transparent green background */}
                  <div
                    className="absolute top-2 bottom-2 rounded-lg transition-all duration-300 opacity-30"
                    style={{
                      left: '0%',
                      width: '100%',
                      backgroundColor: '#81c784'
                    }}
                  ></div>

                  {/* Existing tests */}
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

                  {/* Loaded parts as yellow bars with precise timing */}
                  {activeChamberLoads.map((load, loadIdx) => {
                    const loadStart = new Date(load.loadedAt);
                    const loadEnd = new Date(load.estimatedCompletion);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Calculate days from today for the start date
                    const loadStartDate = new Date(loadStart);
                    loadStartDate.setHours(0, 0, 0, 0);
                    const daysFromStart = Math.floor((loadStartDate - today) / (1000 * 60 * 60 * 24));
                    
                    // Calculate total duration in days
                    const loadDurationMs = loadEnd - loadStart;
                    const loadDurationDays = loadDurationMs / (1000 * 60 * 60 * 24);
                    
                    // Calculate position based on exact time of day
                    const startHour = loadStart.getHours();
                    const startMinute = loadStart.getMinutes();
                    const startSecond = loadStart.getSeconds();
                    const startFraction = (startHour * 3600 + startMinute * 60 + startSecond) / (24 * 3600); // 0 to 1
                    
                    const leftPercent = (daysFromStart / totalDays) * 100 + (startFraction / totalDays) * 100;
                    const widthPercent = (loadDurationDays / totalDays) * 100;

                    const adjustedLeft = Math.max(0, leftPercent);
                    const adjustedWidth = Math.min(100 - adjustedLeft, widthPercent + Math.min(0, leftPercent));

                    if (adjustedWidth <= 0) return null;

                    // Check for gaps between loads
                    let gapBefore = null;
                    if (loadIdx > 0) {
                      const prevLoad = activeChamberLoads[loadIdx - 1];
                      const prevLoadEnd = new Date(prevLoad.estimatedCompletion);
                      const gapMs = loadStart - prevLoadEnd;
                      
                      if (gapMs > 0) {
                        const gapDays = gapMs / (1000 * 60 * 60 * 24);
                        const gapStartDate = new Date(prevLoadEnd);
                        gapStartDate.setHours(0, 0, 0, 0);
                        const gapDaysFromStart = Math.floor((gapStartDate - today) / (1000 * 60 * 60 * 24));
                        
                        const gapStartHour = prevLoadEnd.getHours();
                        const gapStartMinute = prevLoadEnd.getMinutes();
                        const gapStartSecond = prevLoadEnd.getSeconds();
                        const gapStartFraction = (gapStartHour * 3600 + gapStartMinute * 60 + gapStartSecond) / (24 * 3600);
                        
                        const gapLeftPercent = (gapDaysFromStart / totalDays) * 100 + (gapStartFraction / totalDays) * 100;
                        const gapWidthPercent = (gapDays / totalDays) * 100;
                        
                        const gapAdjustedLeft = Math.max(0, gapLeftPercent);
                        const gapAdjustedWidth = Math.min(100 - gapAdjustedLeft, gapWidthPercent + Math.min(0, gapLeftPercent));
                        
                        if (gapAdjustedWidth > 0.1) { // Only show gaps wider than 0.1% of the total width
                          gapBefore = {
                            left: gapAdjustedLeft,
                            width: gapAdjustedWidth,
                            start: prevLoadEnd,
                            end: loadStart,
                            duration: gapMs / (1000 * 60 * 60)
                          };
                        }
                      }
                    }

                    return (
                      <React.Fragment key={`load-${load.id}`}>
                        {/* Gap before this load (shows as green) */}
                        {gapBefore && (
                          <div
                            className="absolute top-2 bottom-2 transition-all z-10"
                            style={{
                              left: `${gapBefore.left}%`,
                              width: `${gapBefore.width}%`,
                              backgroundColor: '#81c784',
                              minWidth: '1px'
                            }}
                            title={`Available: ${gapBefore.duration.toFixed(2)} hours\nFrom: ${gapBefore.start.toLocaleString()}\nTo: ${gapBefore.end.toLocaleString()}`}
                          >
                            {gapBefore.width > 0.5 && (
                              <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="text-[8px] text-green-700 bg-green-100 px-1 py-0.5 rounded">
                                  {gapBefore.duration.toFixed(1)}h gap
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* The actual load as yellow bar */}
                        <div
                          className="absolute top-2 bottom-2 rounded-lg flex flex-col items-center justify-center text-white text-xs font-medium shadow-md transition-all hover:shadow-lg cursor-pointer z-20 border border-yellow-600"
                          style={{
                            left: `${adjustedLeft}%`,
                            width: `${adjustedWidth}%`,
                            backgroundColor: '#ffeb3b',
                            minWidth: '4px'
                          }}
                          title={`Loaded: ${load.parts.length} part(s)\nStart: ${loadStart.toLocaleString()}\nEnd: ${loadEnd.toLocaleString()}\nDuration: ${load.duration}h\nParts: ${load.parts.map(p => p.partNumber).join(', ')}`}
                        >
                          {adjustedWidth > 3 && (
                            <div className="px-1 text-center">
                              <div className="font-semibold text-[10px] truncate text-yellow-800">
                                {load.parts.length} part{load.parts.length > 1 ? 's' : ''}
                              </div>
                              <div className="text-[8px] text-yellow-700 opacity-90 mt-0.5">
                                {loadStart.getHours().toString().padStart(2, '0')}:{loadStart.getMinutes().toString().padStart(2, '0')}
                              </div>
                              {adjustedWidth > 6 && (
                                <div className="text-[8px] text-yellow-700 opacity-80 mt-0.5">
                                  {load.duration}h
                                </div>
                              )}
                            </div>
                          )}
                          {adjustedWidth <= 3 && adjustedWidth > 1 && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-700/90"></div>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Equipment Schedule Gantt Chart</h2>
              <p className="text-sm text-gray-600">Timeline view of equipment testing schedules</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden mr-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar size={16} />
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid size={16} />
                Table View
              </button>
            </div>

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

            <button
              onClick={async () => {
                setLoading(true);
                const tests = await loadRunningTests();
                loadSampleData(tests);
                setLoading(false);
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
            <p className="mt-4 text-gray-600 font-medium">Loading data...</p>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? renderCalendarView() : renderTableView()}

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
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 rounded-lg" style={{ backgroundColor: '#ffeb3b' }}></div>
                    <span className="text-sm text-gray-700">Loaded Parts</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {viewMode === 'calendar' 
                    ? `Showing ${numberOfDays} days • ${runningTests.length} active test(s)`
                    : `${data.length} machines • Last updated: ${new Date().toLocaleTimeString()}`
                  }
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Load Chamber Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Load Chamber: {selectedChamber}</h3>
                <p className="text-sm text-gray-600 mt-1">Scan parts and select tests</p>
              </div>
              <button
                onClick={() => {
                  setChamberLoadingStatus(prev => ({
                    ...prev,
                    [selectedChamber]: false
                  }));
                  setShowLoadModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Machine Details Section */}
              {machineDetails && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="text-blue-600" size={20} />
                    <h4 className="font-semibold text-blue-800">Machine Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Machine:</span>
                      <span className="font-medium ml-2">{machineDetails.machine}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ticket:</span>
                      <span className="font-medium ml-2">{machineDetails.ticketCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium ml-2">{machineDetails.project} / {machineDetails.build}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Colour:</span>
                      <span className="font-medium ml-2">{machineDetails.colour}</span>
                    </div>
                  </div>
                  {machineDetails.tests.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-600">Available Tests:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {machineDetails.tests.map(test => (
                          <div 
                            key={test.id}
                            className="flex flex-col px-3 py-2 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            title={`${test.testName}\nRequired: ${test.requiredQty} parts\nRemaining to allocate: ${test.remainingQty} parts\nAlready allocated: ${test.alreadyAllocated}/${test.requiredQty}\nStatus: ${test.statusText}`}
                          >
                            <span className="font-semibold">{test.testName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Part Scanning Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Part Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partInput}
                    onChange={(e) => setPartInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePartScan()}
                    placeholder="Enter part number (e.g., PART-001)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handlePartScan}
                    disabled={scanning || !partInput.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {scanning ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Scan size={20} />
                        <span>Scan</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-start text-sm text-gray-500 mt-2">
                  Enter part number to search in OQC records
                </p>
              </div>

              {/* Scanned Parts List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Scanned Parts ({scannedParts.length})
                </h4>
                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                  {scannedParts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No parts scanned yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {scannedParts.map((part) => (
                        <div key={part.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="font-medium text-gray-800 text-lg">{part.partNumber}</div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  part.scanStatus === 'OK' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {part.scanStatus}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-2 space-y-1">
                                <div>Serial: {part.serialNumber} • Ticket: {part.ticketCode}</div>
                                <div>Project: {part.project} | Build: {part.build} | Colour: {part.colour}</div>
                                <div className="text-gray-400 text-xs">Scanned: {part.scannedAt}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemovePart(part.id)}
                              className="text-red-500 hover:text-red-700 transition-colors ml-4"
                              title="Remove part"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setChamberLoadingStatus(prev => ({
                      ...prev,
                      [selectedChamber]: false
                    }));
                    setShowLoadModal(false);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLoad}
                  disabled={scannedParts.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Load ({scannedParts.length} parts)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;