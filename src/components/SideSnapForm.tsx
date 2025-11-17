import React from "react";

interface TestRow {
  id: number;
  srNo: number;
  testDate: string;
  sampleId: string;
  ssShear: string;
  visual: string;
  prePhoto: string | null;
  postPhoto: string | null;
  partPicture: string | null;
  criteria: string;
  observation: string;
  forceDeflection: string;
  displacement: string;
  status: string;
}

interface FormData {
  testName: string;
  ers: string;
  partNumber: string;
  machineName: string;
  testCondition: string;
  roomTemp: string;
  date: string;
  passCriteria: string;
  testStage: string;
  project: string;
  sampleQty: string;
  rows: TestRow[];
}

interface SideSnapFormProps {
  formData: FormData;
  updateFormField: (field: string, value: string) => void;
  updateRowField: (rowId: number, field: string, value: string) => void;
  addRow: () => void;
}

export default function SideSnapForm({ 
  formData, 
  updateFormField, 
  updateRowField, 
  addRow 
}: SideSnapFormProps) {
  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-5 gap-4 mb-6 p-4 border border-gray-300 rounded-lg">
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Test Name:</span>
            <input 
              value={formData.testName}
              onChange={(e) => updateFormField('testName', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Shear Test of Side Snap"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">ERS:</span>
            <input 
              value={formData.ers}
              onChange={(e) => updateFormField('ers', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="001-25550-A"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Part Number:</span>
            <input 
              value={formData.partNumber}
              onChange={(e) => updateFormField('partNumber', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Machine Name:</span>
            <input 
              value={formData.machineName}
              onChange={(e) => updateFormField('machineName', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Test Condition:</span>
            <input 
              value={formData.testCondition}
              onChange={(e) => updateFormField('testCondition', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Room Temp:</span>
            <input 
              value={formData.roomTemp}
              onChange={(e) => updateFormField('roomTemp', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Date:</span>
            <input 
              type="date"
              value={formData.date}
              onChange={(e) => updateFormField('date', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Pass Criteria:</span>
            <input 
              value={formData.passCriteria}
              onChange={(e) => updateFormField('passCriteria', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Test Stage:</span>
            <input 
              value={formData.testStage}
              onChange={(e) => updateFormField('testStage', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Project:</span>
            <input 
              value={formData.project}
              onChange={(e) => updateFormField('project', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Ljuk_1004"
            />
          </div>
        </div>

        {/* Second Header Row */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 border border-gray-300 rounded-lg">
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Press Editorial:</span>
            <input 
              value="16th May 2005"
              readOnly
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Test Shape:</span>
            <input 
              value="John Amy"
              readOnly
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Sample Qty:</span>
            <input 
              value={formData.sampleQty}
              onChange={(e) => updateFormField('sampleQty', e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="10"
            />
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">Range:</span>
            <input 
              value="0-100"
              readOnly
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4">Characteristic Inspection Result</h3>

        {/* Main Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Sr.No</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Test Date</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Sample ID</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">SS.Shear#</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Visual</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Pre-Photo</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Post-Photo</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Part Picture</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Criteria</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Observation</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Force vs Deflection</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Displacement</th>
                <th className="px-3 py-2 text-left font-semibold border border-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {formData.rows.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 border border-gray-300 text-center font-semibold">{row.srNo}</td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      type="date"
                      value={row.testDate}
                      onChange={(e) => updateRowField(row.id, 'testDate', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.sampleId}
                      onChange={(e) => updateRowField(row.id, 'sampleId', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="2561"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.ssShear}
                      onChange={(e) => updateRowField(row.id, 'ssShear', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="15.00"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <select
                      value={row.visual}
                      onChange={(e) => updateRowField(row.id, 'visual', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                    >
                      <option value="">Select</option>
                      <option value="OK">OK</option>
                      <option value="NG">NG</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <div className="flex justify-center">
                      {row.prePhoto ? (
                        <img src={row.prePhoto} alt="Pre" className="h-12 w-12 object-cover rounded border border-gray-300" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <div className="flex justify-center">
                      {row.postPhoto ? (
                        <img src={row.postPhoto} alt="Post" className="h-12 w-12 object-cover rounded border border-gray-300" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <div className="flex justify-center">
                      {row.partPicture ? (
                        <img src={row.partPicture} alt="Part" className="h-12 w-12 object-cover rounded border border-gray-300" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.criteria}
                      onChange={(e) => updateRowField(row.id, 'criteria', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.observation}
                      onChange={(e) => updateRowField(row.id, 'observation', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.forceDeflection}
                      onChange={(e) => updateRowField(row.id, 'forceDeflection', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="36.666"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      value={row.displacement}
                      onChange={(e) => updateRowField(row.id, 'displacement', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Value"
                    />
                  </td>
                  <td className="px-3 py-2 border border-gray-300">
                    <select
                      value={row.status}
                      onChange={(e) => updateRowField(row.id, 'status', e.target.value)}
                      className={`w-full px-2 py-1 border rounded text-sm font-semibold ${
                        row.status === "Pass" ? "bg-green-100 text-green-800 border-green-300" : 
                        row.status === "Fail" ? "bg-red-100 text-red-800 border-red-300" : 
                        "bg-white border-gray-300"
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

        <button
          onClick={addRow}
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          + Add Row
        </button>
      </div>
    </div>
  );
}