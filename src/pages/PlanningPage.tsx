import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, User, Shield, Activity } from "lucide-react";
import { flaskData, FlaskItem } from "@/data/flaskData";

// Define types for local storage response
interface Stage2Record {
  processStage: string;
  type: string;
  testName: string;
  testCondition: string;
  requiredQty: string;
  equipment: string;
  project: string;
  startTime: string;
  endTime: string;
  remark: string;
  submittedAt: string;
  testMode?: "single" | "multi";
  selectedParts?: any;
}

interface LocalStorageResponse {
  documentNumber: string;
  projectName: string;
  submissionDate: string;
  status: string;
  id: number;
  createdAt: string;
  stage2?: Stage2Record;
  completedAt: string;
  quantity: string;
  detailsBox?: {
    project: string;
    batch: string;
  };
  ticketCode: string;
}

const PlanningModule = () => {
  const [userMode, setUserMode] = useState("admin");
  const [stage2Records, setStage2Records] = useState<LocalStorageResponse[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [machineStatuses, setMachineStatuses] = useState<{ [key: string]: { [date: string]: string } }>({});
  const [editingCell, setEditingCell] = useState<{ machineKey: string, date: string } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load stage2 records and machine statuses from localStorage
  useEffect(() => {
    const loadStage2Records = () => {
      try {
        const storedData = localStorage.getItem('stage2Records');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setStage2Records(Array.isArray(parsedData) ? parsedData : [parsedData]);
        }

        // Load machine statuses
        const storedStatuses = localStorage.getItem('machineStatuses');
        if (storedStatuses) {
          setMachineStatuses(JSON.parse(storedStatuses));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadStage2Records();
    window.addEventListener('storage', loadStage2Records);
    return () => window.removeEventListener('storage', loadStage2Records);
  }, []);

  // Generate days in the current month
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      if (userMode === "admin" && date > today) {
        continue;
      }

      days.push({
        day,
        date,
        dateStr: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return days;
  }, [currentMonth, userMode]);

  // Build schedule data from stage2Records
  const scheduleData = useMemo(() => {
    const data: any[] = [];

    stage2Records.forEach((record, index) => {
      if (record.stage2) {
        const stage2 = record.stage2;
        
        // Handle both single and multi test modes
        if (stage2.testMode === "single") {
          // Single test mode - simple split
          const testNames = stage2.testName?.split(',').map(t => t.trim()) || [];
          const equipment = stage2.equipment?.split(',').map(e => e.trim()) || [];
          const testConditions = stage2.testCondition?.split(',').map(c => c.trim()) || [];
          const requiredQtys = stage2.requiredQty?.split(',').map(q => q.trim()) || [];

          for (let i = 0; i < testNames.length; i++) {
            data.push({
              slNo: data.length + 1,
              projectBuild: `${record.detailsBox?.project || "N/A"} - ${record.detailsBox?.batch || "N/A"}`,
              testName: testNames[i] || "N/A",
              testCondition: testConditions[i] || testConditions[0] || "RT",
              qty: requiredQtys[i] || requiredQtys[0] || "N/A",
              machineEquipment: equipment[i] || equipment[0] || "N/A",
              startDate: stage2.startTime?.split('T')[0] || record.createdAt?.split('T')[0] || "",
              endDate: stage2.endTime?.split('T')[0] || record.completedAt?.split('T')[0] || "",
              status: record.status || "Scheduled",
              documentNumber: record.ticketCode || record.id?.toString(),
              stage2: stage2
            });
          }
        } else {
          // Multi test mode - handle comma-separated values
          const testNames = stage2.testName?.split(',').map(t => t.trim()) || [];
          const equipment = stage2.equipment?.split(',').map(e => e.trim()) || [];
          const testConditions = stage2.testCondition?.split(',').map(c => c.trim()) || [];
          const requiredQtys = stage2.requiredQty?.split(',').map(q => q.trim()) || [];

          for (let i = 0; i < testNames.length; i++) {
            data.push({
              slNo: data.length + 1,
              projectBuild: `${record.detailsBox?.project || "N/A"} - ${record.detailsBox?.batch || "N/A"}`,
              testName: testNames[i] || "N/A",
              testCondition: testConditions[i] || testConditions[0] || "RT",
              qty: requiredQtys[i] || requiredQtys[0] || "N/A",
              machineEquipment: equipment[i] || equipment[0] || "N/A",
              startDate: stage2.startTime?.split('T')[0] || record.createdAt?.split('T')[0] || "",
              endDate: stage2.endTime?.split('T')[0] || record.completedAt?.split('T')[0] || "",
              status: record.status || "Scheduled",
              documentNumber: record.ticketCode || record.id?.toString(),
              stage2: stage2
            });
          }
        }
      }
    });

    return data;
  }, [stage2Records]);

  // Check if a date falls within a task's range
  const isDateInRange = (dateStr: string, startTime: string, endTime: string) => {
    if (!startTime || !endTime) return false;
    
    const date = new Date(dateStr);
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Set to start/end of day for proper comparison
    date.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return date >= start && date <= end;
  };

  // Build machine status data
  const machineStatusData = useMemo(() => {
    const machines: any[] = [];

    flaskData.forEach((item: FlaskItem, index: number) => {
      const machineKey = `${item.equipment}-${item.testName}`;

      // Find matching records for this machine
      const matchingRecords = stage2Records.filter(record => {
        if (!record.stage2) return false;
        const stage2 = record.stage2;
        
        // Handle both single and multi modes
        const storedTestNames = stage2.testName?.split(',').map(t => t.trim()) || [];
        const storedEquipment = stage2.equipment?.split(',').map(e => e.trim()) || [];
        
        const testNameMatch = storedTestNames.some(name => name === item.testName?.trim());
        const equipmentMatch = storedEquipment.some(eq => eq === item.equipment?.trim());
        
        return testNameMatch && equipmentMatch;
      });

      // Check which records are currently occupying this machine
      const occupiedRecords = matchingRecords.filter(r => {
        if (!r.stage2) return false;
        // Occupied if status is Received or In Progress AND time range includes current date
        const isStatusOccupied = r.status === "Received" || r.status === "In Progress" || r.status === "Scheduled";
        if (!isStatusOccupied) return false;
        
        // For each day in the month, check if this record occupies the machine
        return monthDays.some(day => {
          return r.stage2?.startTime && r.stage2?.endTime && 
                 isDateInRange(day.dateStr, r.stage2.startTime, r.stage2.endTime);
        });
      });

      const isOccupied = occupiedRecords.length > 0;

      // Get overall status for the machine
      let overallStatus = "Occupied";

      if (isOccupied) {
        overallStatus = "Occupied";
      } else if (machineStatuses[machineKey]) {
        // Check if admin has set any status
        const dateStatuses = Object.values(machineStatuses[machineKey] || {});
        if (dateStatuses.length > 0) {
          const statusCounts: { [key: string]: number } = {};
          dateStatuses.forEach((s: string) => {
            statusCounts[s] = (statusCounts[s] || 0) + 1;
          });

          const mostFrequent = Object.keys(statusCounts).reduce((a, b) =>
            statusCounts[a] > statusCounts[b] ? a : b
          );
          overallStatus = mostFrequent;
        }
      }

      // Check if there are any records at all for this machine
      if (matchingRecords.length === 0 && !machineStatuses[machineKey]) {
        overallStatus = "Available";
      }

      machines.push({
        slNo: index + 1,
        machineKey: machineKey,
        equipment: item.equipment,
        processStage: item.processStage,
        type: item.type,
        testName: item.testName,
        testCondition: item.testCondition,
        requiredQty: item.requiredQty,
        status: overallStatus,
        currentProject: occupiedRecords[0]?.detailsBox?.project || "-",
        documentNumber: occupiedRecords[0]?.ticketCode || "",
        allMatchingRecords: matchingRecords
      });
    });

    return machines;
  }, [stage2Records, machineStatuses, monthDays]);

  // Check machine status for a specific date
  const getMachineStatusForDate = (machine: any, dateStr: string) => {
    const today = new Date(dateStr);
    today.setHours(0, 0, 0, 0);

    // Check all matching records for occupancy on this specific date
    for (const record of machine.allMatchingRecords || []) {
      if (record.stage2?.startTime && record.stage2?.endTime) {
        const startDate = new Date(record.stage2.startTime);
        const endDate = new Date(record.stage2.endTime);

        // Check if today is within the occupied range
        if (today >= startDate && today <= endDate) {
          // Check if the record status indicates occupancy
          if (record.status === "Received" || record.status === "In Progress" || record.status === "Scheduled") {
            return {
              status: "Occupied",
              record,
              isOccupiedByRecord: true
            };
          }
        }
      }
    }

    // Check if admin has manually set a status for this date
    if (machineStatuses[machine.machineKey] && machineStatuses[machine.machineKey][dateStr]) {
      return {
        status: machineStatuses[machine.machineKey][dateStr],
        record: null,
        isOccupiedByRecord: false
      };
    }

    // Default to Available if no record occupies it and no admin status set
    // But if there are no records at all, it's Idle
    if (machine.allMatchingRecords.length === 0) {
      return {
        status: "Available",
        record: null,
        isOccupiedByRecord: false
      };
    }

    return {
      status: "Occupied",
      record: null,
      isOccupiedByRecord: false
    };
  };

  const handleCellStatusChange = (machineKey: string, date: string, newStatus: string) => {
    const updatedStatuses = { ...machineStatuses };

    if (!updatedStatuses[machineKey]) {
      updatedStatuses[machineKey] = {};
    }

    if (newStatus === "Available") {
      updatedStatuses[machineKey][date] = "Available";
    } else if (newStatus === "Idle") {
      updatedStatuses[machineKey][date] = "Idle";
    }

    setMachineStatuses(updatedStatuses);
    localStorage.setItem('machineStatuses', JSON.stringify(updatedStatuses));
    setEditingCell(null);
  };

  // Fix for edit icon click bug
  const handleCellClick = (machineKey: string, date: string, isOccupiedByRecord: boolean) => {
    if (isOccupiedByRecord) return;
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Set editing cell immediately
    setEditingCell({ machineKey, date });
  };

  const handleSelectBlur = () => {
    // Small delay to prevent immediate closing
    clickTimeoutRef.current = setTimeout(() => {
      setEditingCell(null);
    }, 100);
  };

  const getMachineCellColor = (status: string, isOccupiedByRecord?: boolean) => {
    if (isOccupiedByRecord) {
      return "bg-red-500";
    }

    switch (status) {
      case "Occupied":
        return "bg-red-400";
      case "Available":
        return "bg-green-400";
      case "Idle":
        return "bg-blue-400";
      default:
        return "bg-gray-400";
    }
  };

  const getCellColor = (dateStr: string, startDate: string, endDate: string, status: string) => {
    if (!isDateInRange(dateStr, startDate, endDate)) return "";

    switch (status) {
      case "Scheduled":
        return "bg-blue-400";
      case "Received":
        return "bg-yellow-400";
      case "In Progress":
        return "bg-orange-400";
      case "Completed":
        return "bg-pink-400";
      default:
        return "bg-gray-400";
    }
  };

  const refreshStage2Records = () => {
    try {
      const storedData = localStorage.getItem('stage2Records');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setStage2Records(Array.isArray(parsedData) ? parsedData : [parsedData]);
        alert(`Refreshed! Loaded ${Array.isArray(parsedData) ? parsedData.length : 1} records`);
      } else {
        alert("No records found in localStorage");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      alert("Error refreshing data");
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Testing Planning Module</h1>
            <p className="text-sm text-gray-500">Monthly schedule view with machine availability timeline</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
              <Button
                onClick={() => setUserMode("user")}
                className={`flex items-center gap-2 ${userMode === "user" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
                size="sm"
              >
                <User className="h-4 w-4" />
                User Mode
              </Button>
              <Button
                onClick={() => setUserMode("admin")}
                className={`flex items-center gap-2 ${userMode === "admin" ? "bg-red-600 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
                size="sm"
              >
                <Shield className="h-4 w-4" />
                Admin Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Machine Availability Table - Admin Only */}
        {userMode === "admin" && (
          <Card className="shadow-sm rounded-xl border-l-4 border-l-purple-600">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Machine Availability Timeline - All Machines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Legend */}
              <div className="flex gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-red-500 border border-gray-300"></div>
                  <span className="text-sm text-gray-700">Occupied (Test in Progress)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-green-400 border border-gray-300"></div>
                  <span className="text-sm text-gray-700">Available (Ready for Use)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 bg-blue-400 border border-gray-300"></div>
                  <span className="text-sm text-gray-700">Idle (Never Used / No Records)</span>
                </div>
              </div>

              {/* Machine Status Gantt Chart Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th className="border border-gray-400 p-2 sticky left-0 bg-gray-700 z-10 min-w-[50px]">Sl No</th>
                      <th className="border border-gray-400 p-2 min-w-[120px]">Equipment</th>
                      <th className="border border-gray-400 p-2 min-w-[120px]">Process Stage</th>
                      <th className="border border-gray-400 p-2 min-w-[80px]">Type</th>
                      <th className="border border-gray-400 p-2 min-w-[150px]">Test Name</th>
                      <th className="border border-gray-400 p-2 min-w-[120px]">Test Condition</th>
                      <th className="border border-gray-400 p-2 min-w-[100px]">Required Qty</th>
                      <th className="border border-gray-400 p-2 min-w-[80px]">Status</th>
                      <th className="border border-gray-400 p-2 min-w-[120px]">Current Project</th>
                      {monthDays.map((day) => (
                        <th key={day.dateStr} className="border border-gray-400 p-1 min-w-[35px] text-center">
                          <div className="flex flex-col items-center">
                            <div className="font-normal text-[10px]">{day.dayName}</div>
                            <div className="font-semibold">{day.day}</div>
                            <div className="font-normal text-[10px]">{currentMonth.getMonth() + 1}-{currentMonth.getFullYear().toString().slice(-2)}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {machineStatusData.map((machine, index) => {
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-center sticky left-0 bg-white z-10">{machine.slNo}</td>
                          <td className="border border-gray-300 p-2 font-medium">{machine.equipment}</td>
                          <td className="border border-gray-300 p-2">{machine.processStage}</td>
                          <td className="border border-gray-300 p-2">{machine.type}</td>
                          <td className="border border-gray-300 p-2">{machine.testName}</td>
                          <td className="border border-gray-300 p-2">{machine.testCondition}</td>
                          <td className="border border-gray-300 p-2">{machine.requiredQty}</td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex justify-center items-center gap-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${machine.status === "Occupied"
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : machine.status === "Available"
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                <span className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${machine.status === "Occupied" ? "bg-red-500" :
                                    machine.status === "Available" ? "bg-green-500" : "bg-blue-500"
                                    }`}></div>
                                  {machine.status}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            {machine.status === "Occupied" ? (
                              <div>
                                <div className="font-medium">{machine.currentProject}</div>
                                {machine.documentNumber && (
                                  <div className="text-[10px] text-gray-500">Doc: {machine.documentNumber}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </td>
                          {monthDays.map((day) => {
                            const { status, record, isOccupiedByRecord } = getMachineStatusForDate(machine, day.dateStr);
                            const cellColor = getMachineCellColor(status, isOccupiedByRecord);
                            const isEditing = editingCell?.machineKey === machine.machineKey && editingCell?.date === day.dateStr;

                            return (
                              <td
                                key={day.dateStr}
                                className={`border border-gray-300 p-0 ${cellColor} relative group`}
                                title={`${status}: ${machine.equipment} - ${machine.testName}${record ? ` (${record.detailsBox?.project})` : ''}`}
                                onClick={() => handleCellClick(machine.machineKey, day.dateStr, isOccupiedByRecord)}
                              >
                                {isEditing ? (
                                  <select
                                    className="w-full h-full text-[10px] border-0 p-1 appearance-none bg-white"
                                    value={status === "Occupied" ? "Available" : status}
                                    onChange={(e) => handleCellStatusChange(machine.machineKey, day.dateStr, e.target.value)}
                                    onBlur={handleSelectBlur}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="Available">Available</option>
                                    <option value="Idle">Idle</option>
                                  </select>
                                ) : (
                                  <div className="h-6 w-full flex items-center justify-center cursor-pointer">
                                    {status === "Occupied" ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-white">●</span>
                                        {record && (
                                          <span className="text-[8px] text-white bg-black bg-opacity-50 px-0.5 rounded mt-0.5">
                                            {record.ticketCode?.slice(-4) || record.id}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className={`text-[10px] text-white bg-black bg-opacity-50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isOccupiedByRecord ? 'hidden' : ''}`}>
                                        ✏️
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Machine Status Summary */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="text-sm text-gray-600">Occupied Machines</div>
                  <div className="text-2xl font-bold text-red-600">
                    {machineStatusData.filter(m => m.status === "Occupied").length}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600">Available Machines</div>
                  <div className="text-2xl font-bold text-green-600">
                    {machineStatusData.filter(m => m.status === "Available").length}
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Idle Machines</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {machineStatusData.filter(m => m.status === "Idle").length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Month Navigation and Schedule Timeline */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {userMode === "admin" ? "Schedule Timeline (Past & Current Days)" : "Schedule Timeline (All Days)"}
              </CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={refreshStage2Records}>
                  Refresh Data
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-lg min-w-[140px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Legend */}
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-blue-400 border border-gray-300"></div>
                <span className="text-sm text-gray-700">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-yellow-400 border border-gray-300"></div>
                <span className="text-sm text-gray-700">Received</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-orange-400 border border-gray-300"></div>
                <span className="text-sm text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-pink-400 border border-gray-300"></div>
                <span className="text-sm text-gray-700">Completed</span>
              </div>
            </div>

            {/* Gantt Chart Table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="border border-gray-400 p-2 sticky left-0 bg-gray-700 z-10 min-w-[50px]">Sl no</th>
                    <th className="border border-gray-400 p-2 min-w-[120px]">Project & Build</th>
                    <th className="border border-gray-400 p-2 min-w-[150px]">Test Name</th>
                    <th className="border border-gray-400 p-2 min-w-[100px]">Test Condition</th>
                    <th className="border border-gray-400 p-2 min-w-[60px]">Qty</th>
                    <th className="border border-gray-400 p-2 min-w-[120px]">Machine / Equipment</th>
                    <th className="border border-gray-400 p-2 min-w-[100px] bg-cyan-600">Start date</th>
                    <th className="border border-gray-400 p-2 min-w-[100px] bg-cyan-600">End date</th>
                    {monthDays.map((day) => (
                      <th key={day.dateStr} className="border border-gray-400 p-1 min-w-[35px] text-center">
                        <div className="flex flex-col items-center">
                          <div className="font-normal text-[10px]">{day.dayName}</div>
                          <div className="font-semibold">{day.day}</div>
                          <div className="font-normal text-[10px]">{currentMonth.getMonth() + 1}-{currentMonth.getFullYear().toString().slice(-2)}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.length > 0 ? (
                    scheduleData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-center sticky left-0 bg-white z-10">{row.slNo}</td>
                        <td className="border border-gray-300 p-2">{row.projectBuild}</td>
                        <td className="border border-gray-300 p-2">{row.testName}</td>
                        <td className="border border-gray-300 p-2">{row.testCondition}</td>
                        <td className="border border-gray-300 p-2 text-center">{row.qty}</td>
                        <td className="border border-gray-300 p-2">{row.machineEquipment}</td>
                        <td className="border border-gray-300 p-2 text-center bg-cyan-100">{row.startDate}</td>
                        <td className="border border-gray-300 p-2 text-center bg-cyan-100">{row.endDate}</td>
                        {monthDays.map((day) => {
                          const cellColor = getCellColor(day.dateStr, row.startDate, row.endDate, row.status);
                          return (
                            <td
                              key={day.dateStr}
                              className={`border border-gray-300 p-1 ${cellColor}`}
                              title={cellColor ? `${row.status}: ${row.testName}` : ''}
                            >
                              <div className="h-6"></div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8 + monthDays.length} className="border border-gray-300 p-8 text-center text-gray-500">
                        No scheduled tests found. Please add test records in localStorage.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600">Total Scheduled</div>
                <div className="text-2xl font-bold text-blue-600">
                  {scheduleData.filter(r => r.status === "Scheduled").length}
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-sm text-gray-600">Received</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {scheduleData.filter(r => r.status === "Received").length}
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-sm text-gray-600">In Progress</div>
                <div className="text-2xl font-bold text-orange-600">
                  {scheduleData.filter(r => r.status === "In Progress").length}
                </div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-pink-600">
                  {scheduleData.filter(r => r.status === "Completed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanningModule;