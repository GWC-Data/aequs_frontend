// import { Input } from "@/components/ui/input";
// import { Check } from "lucide-react";
// import React from "react";
// // Form Component
// interface TestData {
//   testName: string;
//   documentNumber: string;
//   documentTitle: string;
//   projectName: string;
//   color: string;
//   testLocation: string;
//   sampleQty: string;
//   testStartDate: string;
//   testCompletionDate: string;
//   sampleConfig: string;
//   testCondition: string;
//   status: string;
// }

// const TestForm: React.FC = () => {
//   const [formData, setFormData] = React.useState<TestData>({
//     testName: "",
//     documentNumber: "",
//     documentTitle: "",
//     projectName: "",
//     color: "",
//     testLocation: "",
//     sampleQty: "",
//     testStartDate: "",
//     testCompletionDate: "",
//     sampleConfig: "",
//     testCondition: "",
//     status: "",
//   });

//   // Load existing data from localStorage on component mount
//   React.useEffect(() => {
//     const storedData = localStorage.getItem("testRecords");
//     if (storedData) {
//       console.log("Existing records:", JSON.parse(storedData));
//     }
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Get existing data from localStorage
//     const existingData = localStorage.getItem("testRecords");
//     const records = existingData ? JSON.parse(existingData) : [];
    
//     // Add new record
//     const newRecord = {
//       ...formData,
//       id: Date.now(), // Add unique ID
//       createdAt: new Date().toISOString()
//     };
    
//     records.push(newRecord);
    
//     // Save back to localStorage
//     localStorage.setItem("testRecords", JSON.stringify(records));
    
//     // Reset form
//     setFormData({
//       testName: "",
//       documentNumber: "",
//       documentTitle: "",
//       projectName: "",
//       color: "",
//       testLocation: "",
//       sampleQty: "",
//       testStartDate: "",
//       testCompletionDate: "",
//       sampleConfig: "",
//       testCondition: "",
//       status: "",
//     });

//     alert("Data saved successfully!");
    
//     // Log current records
//     console.log("All records:", records);
//   };

//   return (
//     <div className="max-w-6xl mx-auto  mt-6">
//     <div className="px-6 py-4 border  rounded-lg ">
//       <h1 className="text-2xl font-bold mb-6 text-center">Test Data Form</h1>
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Test Name</label>
//             <Input
//               type="text"
//               name="testName"
//               value={formData.testName}
//               onChange={handleInputChange}
//               placeholder="Enter test name"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Document Number</label>
//             <Input
//               type="text"
//               name="documentNumber"
//               value={formData.documentNumber}
//               onChange={handleInputChange}
//               placeholder="Enter document number"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Document Title</label>
//             <Input
//               type="text"
//               name="documentTitle"
//               value={formData.documentTitle}
//               onChange={handleInputChange}
//               placeholder="Enter document title"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Project Name</label>
//             <Input
//               type="text"
//               name="projectName"
//               value={formData.projectName}
//               onChange={handleInputChange}
//               placeholder="Enter project name"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Color</label>
//             <Input
//               type="text"
//               name="color"
//               value={formData.color}
//               onChange={handleInputChange}
//               placeholder="Enter color"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Test Location</label>
//             <Input
//               type="text"
//               name="testLocation"
//               value={formData.testLocation}
//               onChange={handleInputChange}
//               placeholder="Enter test location"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Sample Quantity</label>
//             <Input
//               type="number"
//               name="sampleQty"
//               value={formData.sampleQty}
//               onChange={handleInputChange}
//               placeholder="Enter sample quantity"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Test Start Date</label>
//             <Input
//               type="date"
//               name="testStartDate"
//               value={formData.testStartDate}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Test Completion Date</label>
//             <Input
//               type="date"
//               name="testCompletionDate"
//               value={formData.testCompletionDate}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Sample Config Overview</label>
//             <Input
//               type="text"
//               name="sampleConfig"
//               value={formData.sampleConfig}
//               onChange={handleInputChange}
//               placeholder="Enter sample configuration"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Test Condition</label>
//             <Input
//               type="text"
//               name="testCondition"
//               value={formData.testCondition}
//               onChange={handleInputChange}
//               placeholder="Enter test condition"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-medium">Status</label>
//             <Input
//               type="text"
//               name="status"
//               value={formData.status}
//               onChange={handleInputChange}
//               placeholder="Enter status"
//               required
//             />
//           </div>
//         </div>
//          <div className="flex justify-end">
//           <button
//           type="submit"
//           className=" flex items-center  w-fit border rounded-full bg-white text-black py-2 px-4  hover:bg-[#EE161F] hover:text-white transition-colors"
//         >
//           <Check className="w-5 h-5" />
//           <span>Submit</span>
//         </button>
//          </div>
       
//       </form>

//       {/* Display stored records */}
//       {/* <div className="mt-8">
//         <h2 className="text-xl font-bold mb-4">Stored Records</h2>
//         <button
//           onClick={() => {
//             const records = localStorage.getItem("testRecords");
//             if (records) {
//               console.log("All records:", JSON.parse(records));
//               alert("Check console for stored records");
//             } else {
//               alert("No records found");
//             }
//           }}
//           className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
//         >
//           View Stored Records (Console)
//         </button>
//       </div> */}
//     </div>
//     </div>
//   );
// };

// export default TestForm;

import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";

// Form Component
interface TestData {
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
}

// Test name options - can be extended in the future
const TEST_NAME_OPTIONS = [
  { id: 'footPushOut', name: 'Foot Push Out' },
  { id: 'shearTestSideSnap', name: 'Shear Test Side Snap' },
  { id: 'pullTestCleat', name: 'Pull Test Cleat' },
  { id: 'heatSoak', name: 'Heat Soak' },
  { id: 'sidesnap', name: 'Side Snap' },
];

const TestForm: React.FC = () => {
  const [formData, setFormData] = React.useState<TestData>({
    testName: [],
    documentNumber: "",
    documentTitle: "",
    projectName: "",
    color: "",
    testLocation: "",
    sampleQty: "",
    testStartDate: "",
    testCompletionDate: "",
    sampleConfig: "",
    testCondition: "",
    status: "In-Progress",
  });

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Load existing data from localStorage on component mount
  React.useEffect(() => {
    const storedData = localStorage.getItem("testRecords");
    if (storedData) {
      console.log("Existing records:", JSON.parse(storedData));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestNameChange = (testId: string) => {
    setFormData(prev => {
      const currentTestNames = prev.testName;
      if (currentTestNames.includes(testId)) {
        return {
          ...prev,
          testName: currentTestNames.filter(id => id !== testId)
        };
      } else {
        return {
          ...prev,
          testName: [...currentTestNames, testId]
        };
      }
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectAllTests = () => {
    setFormData(prev => ({
      ...prev,
      testName: TEST_NAME_OPTIONS.map(test => test.id)
    }));
  };

  const clearAllTests = () => {
    setFormData(prev => ({
      ...prev,
      testName: []
    }));
  };

  const getSelectedTestNames = () => {
    return TEST_NAME_OPTIONS
      .filter(test => formData.testName.includes(test.id))
      .map(test => test.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.testName.length === 0) {
      alert("Please select at least one test name");
      return;
    }
    
    // Get existing data from localStorage
    const existingData = localStorage.getItem("testRecords");
    const records = existingData ? JSON.parse(existingData) : [];
    
    // Add new record
    const newRecord = {
      ...formData,
      id: Date.now(), // Add unique ID
      createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    
    // Save back to localStorage
    localStorage.setItem("testRecords", JSON.stringify(records));
    
    // Reset form
    setFormData({
      testName: [],
      documentNumber: "",
      documentTitle: "",
      projectName: "",
      color: "",
      testLocation: "",
      sampleQty: "",
      testStartDate: "",
      testCompletionDate: "",
      sampleConfig: "",
      testCondition: "",
      status: "",
    });

    setIsDropdownOpen(false);
    alert("Data saved successfully!");
    
    // Log current records
    console.log("All records:", records);
  };

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-6">Test Data Form</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Test Name Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Test Name <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full h-14 px-5 border-2 rounded-xl text-left bg-white transition-all duration-200 flex justify-between items-center font-medium ${
                  formData.testName.length > 0 ? 'border-blue-500' : 'border-gray-300'
                } ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
              >
                <span className="truncate">
                  {formData.testName.length === 0 
                    ? "Select test names..." 
                    : `${formData.testName.length} test(s) selected`}
                </span>
                {isDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {formData.testName.length} selected
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={selectAllTests}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllTests}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Test Options */}
                  <div className="p-2">
                    {TEST_NAME_OPTIONS.map((test) => (
                      <div
                        key={test.id}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          formData.testName.includes(test.id)
                            ? "bg-blue-50 text-blue-900"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleTestNameChange(test.id)}
                      >
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          formData.testName.includes(test.id)
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}>
                          {formData.testName.includes(test.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{test.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Tests Preview */}
            {formData.testName.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {getSelectedTestNames().map((testName, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center"
                    >
                      {testName}
                      <button
                        type="button"
                        onClick={() => handleTestNameChange(formData.testName[index])}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.testName.length === 0 && (
              <p className="text-red-500 text-sm">Please select at least one test name</p>
            )}
          </div>
            <div className="space-y-2">
             <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Document Number <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                placeholder="Enter document number"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Document Title <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="documentTitle"
                value={formData.documentTitle}
                onChange={handleInputChange}
                placeholder="Enter document title"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Project Name <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Color <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Enter color"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Test Location <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="testLocation"
                value={formData.testLocation}
                onChange={handleInputChange}
                placeholder="Enter test location"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Sample Quantity <span className="text-red-600">*</span>
                </label>
              <Input
                type="number"
                name="sampleQty"
                value={formData.sampleQty}
                onChange={handleInputChange}
                placeholder="Enter sample quantity"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Test Start Date <span className="text-red-600">*</span>
                </label>
              <Input
                type="date"
                name="testStartDate"
                value={formData.testStartDate}
                onChange={handleInputChange}
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Test Completion Date <span className="text-red-600">*</span>
                </label>
              <Input
                type="date"
                name="testCompletionDate"
                value={formData.testCompletionDate}
                onChange={handleInputChange}
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Sample Configuration Overview <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="sampleConfig"
                value={formData.sampleConfig}
                onChange={handleInputChange}
                placeholder="Enter sample configuration"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
             <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Test Condition <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="testCondition"
                value={formData.testCondition}
                onChange={handleInputChange}
                placeholder="Enter test condition"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Status <span className="text-red-600">*</span>
                </label>
              <Input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Enter status"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
                disabled
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center w-fit border rounded-full bg-[#f35b62] text-white py-2 px-4 hover:bg-[#EE161F] hover:text-white transition-colors"
            >
              <Check className="w-5 h-5" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestForm;