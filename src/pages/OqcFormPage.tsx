import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import React from "react";
// Form Component
interface TestData {
  testName: string;
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

const TestForm: React.FC = () => {
  const [formData, setFormData] = React.useState<TestData>({
    testName: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      testName: "",
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

    alert("Data saved successfully!");
    
    // Log current records
    console.log("All records:", records);
  };

  return (
    <div className="max-w-6xl mx-auto  mt-6">
    <div className="px-6 py-4 border  rounded-lg ">
      <h1 className="text-2xl font-bold mb-6 text-center">Test Data Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Name</label>
            <Input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleInputChange}
              placeholder="Enter test name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Number</label>
            <Input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleInputChange}
              placeholder="Enter document number"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Document Title</label>
            <Input
              type="text"
              name="documentTitle"
              value={formData.documentTitle}
              onChange={handleInputChange}
              placeholder="Enter document title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="Enter color"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Location</label>
            <Input
              type="text"
              name="testLocation"
              value={formData.testLocation}
              onChange={handleInputChange}
              placeholder="Enter test location"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sample Quantity</label>
            <Input
              type="number"
              name="sampleQty"
              value={formData.sampleQty}
              onChange={handleInputChange}
              placeholder="Enter sample quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Start Date</label>
            <Input
              type="date"
              name="testStartDate"
              value={formData.testStartDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Completion Date</label>
            <Input
              type="date"
              name="testCompletionDate"
              value={formData.testCompletionDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sample Config Overview</label>
            <Input
              type="text"
              name="sampleConfig"
              value={formData.sampleConfig}
              onChange={handleInputChange}
              placeholder="Enter sample configuration"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Condition</label>
            <Input
              type="text"
              name="testCondition"
              value={formData.testCondition}
              onChange={handleInputChange}
              placeholder="Enter test condition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              placeholder="Enter status"
              required
            />
          </div>
        </div>
         <div className="flex justify-end">
          <button
          type="submit"
          className=" flex items-center  w-fit border rounded-full bg-white text-black py-2 px-4  hover:bg-[#EE161F] hover:text-white transition-colors"
        >
          <Check className="w-5 h-5" />
          <span>Submit</span>
        </button>
         </div>
       
      </form>

      {/* Display stored records */}
      {/* <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Stored Records</h2>
        <button
          onClick={() => {
            const records = localStorage.getItem("testRecords");
            if (records) {
              console.log("All records:", JSON.parse(records));
              alert("Check console for stored records");
            } else {
              alert("No records found");
            }
          }}
          className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
        >
          View Stored Records (Console)
        </button>
      </div> */}
    </div>
    </div>
  );
};

export default TestForm;