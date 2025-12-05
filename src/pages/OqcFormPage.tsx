import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

// Form Component
interface TestData {
  ticketCode: string;
  totalQuantity: number;
  assemblyAno: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  status: string;
}

const SOURCE_OPTIONS = ["Entire", "Line1", "Line2"];
const PROJECT_OPTIONS = ["FLASH", "LIGHT", "HULK", "AQUA"];
const BUILD_OPTIONS = ["J713", "J813", "N230", "N240"];
const COLOUR_OPTIONS = ["NDA", "LIGHT BLUE"];
const REASON_OPTIONS = [
  "Line qualification",
  "Machine qualification",
  "MP/NPI",
  "Other"
];

const TestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<TestData>({
    ticketCode: "",
    totalQuantity: 0,
    assemblyAno: "",
    source: "",
    reason: "",
    project: "",
    build: "",
    colour: "",
    dateTime: "",
    status: "In-Progress"
  });

  // Load existing data from localStorage on component mount
  React.useEffect(() => {
    const storedData = localStorage.getItem("testRecords");
    const today = new Date().toISOString().split("T")[0];
  setFormData(prev => ({
    ...prev,
    dateTime: today
  }));
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Existing records loaded:", parsedData);
        console.log("Total records count:", parsedData.length);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    } else {
      console.log("No existing records found in localStorage");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number input specifically
    if (name === "totalQuantity") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? 0 : parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  

    try {
      // Validate required fields
      if (!formData.ticketCode || !formData.totalQuantity || !formData.source || 
          !formData.reason || !formData.project || !formData.build || 
          !formData.colour || !formData.dateTime) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields marked with *",
          duration: 3000,
        });
        return;
      }

      // Get existing data from localStorage
      const existingData = localStorage.getItem("testRecords");
      let records = [];
      
      if (existingData) {
        try {
          records = JSON.parse(existingData);
          // Ensure it's an array
          if (!Array.isArray(records)) {
            records = [];
          }
        } catch (error) {
          console.error("Error parsing existing records:", error);
          records = [];
        }
      }
      

        const currentDate = new Date().toISOString().split("T")[0];

const newRecord = {
  ...formData,
  dateTime: currentDate,   // override to always save today's date
  id: Date.now(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

      // Add new record
      // const newRecord = {
      //   ...formData,
      //   id: Date.now(), // Add unique ID
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString()
      // };

      records.push(newRecord);

      // Save back to localStorage
      localStorage.setItem("testRecords", JSON.stringify(records));

      console.log("Record saved successfully:", newRecord);
      console.log("Total records now:", records.length);

      // Reset form
      setFormData({
        ticketCode: "",
        totalQuantity: 0,
        assemblyAno: "",
        source: "",
        reason: "",
        project: "",
        build: "",
        colour: "",
        dateTime: "",
        status: "In-Progress"
      });

      // Success toast
      toast({
        title: "✅ Record Created",
        description: `Ticket ${formData.ticketCode} has been saved successfully!`,
        duration: 3000,
      });

      // Navigate to barcode-scanner after a short delay
      setTimeout(() => {
        navigate("/barcode-scanner", {
          state: {
            record: newRecord,
            allRecords: records
          }
        });
      }, 1000);

    } catch (error) {
      console.error("Error saving test data:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving the test data. Please try again.",
        duration: 3000,
      });
    }
  };

  // Helper function to view all records (for debugging)
  const viewAllRecords = () => {
    const storedData = localStorage.getItem("testRecords");
    if (storedData) {
      const records = JSON.parse(storedData);
      console.log("=== ALL STORED RECORDS ===");
      console.log("Total:", records.length);
      records.forEach((record: any, index: number) => {
        console.log(`Record ${index + 1}:`, record);
      });
      toast({
        title: "Records Logged",
        description: `Found ${records.length} records. Check console for details.`,
        duration: 2000,
      });
    } else {
      console.log("No records found in localStorage");
      toast({
        title: "No Records",
        description: "No records found in localStorage",
        duration: 2000,
      });
    }
  };

  // Helper function to clear all records (for debugging)
  const clearAllRecords = () => {
    if (window.confirm("Are you sure you want to clear ALL records? This cannot be undone.")) {
      localStorage.removeItem("testRecords");
      console.log("All records cleared from localStorage");
      toast({
        variant: "destructive",
        title: "Records Cleared",
        description: "All records have been removed from localStorage.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Test Data Form</h1>
          {/* <div className="flex gap-2">
            <button
              type="button"
              onClick={viewAllRecords}
              className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              title="View all stored records in console"
            >
              View Records ({(() => {
                const stored = localStorage.getItem("testRecords");
                return stored ? JSON.parse(stored).length : 0;
              })()})
            </button>
            <button
              type="button"
              onClick={clearAllRecords}
              className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
              title="Clear all records"
            >
              Clear All
            </button>
          </div> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ticket Code */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Ticket Code <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="ticketCode"
                value={formData.ticketCode}
                onChange={handleInputChange}
                placeholder="Enter ticket code (e.g., @DRI)"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
                required
              />
            </div>

            {/* Total Quantity */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Total Quantity <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                name="totalQuantity"
                value={formData.totalQuantity || ""}
                onChange={handleInputChange}
                placeholder="Enter total quantity"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
                min="1"
              />
            </div>

            {/* Assembly/Ano */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Assembly/Ano <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="assemblyAno"
                value={formData.assemblyAno}
                onChange={handleInputChange}
                placeholder="Auto filled based on RBAC admin access"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
              />
            </div>

            {/* Source (entire/line1/line2) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Source <span className="text-red-600">*</span>
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Source --</option>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Reason <span className="text-red-600">*</span>
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Reason --</option>
                {REASON_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Project <span className="text-red-600">*</span>
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Project --</option>
                {PROJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Build */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Build <span className="text-red-600">*</span>
              </label>
              <select
                name="build"
                value={formData.build}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Build --</option>
                {BUILD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Colour */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Colour <span className="text-red-600">*</span>
              </label>
              <select
                name="colour"
                value={formData.colour}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Colour --</option>
                {COLOUR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Time */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-5 uppercase tracking-wide">
                Date Time <span className="text-red-600">*</span>
              </label>
             <Input
              type="date"
              name="dateTime"
              value={formData.dateTime}
              readOnly
              className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />

            </div>
          </div>

          <div className="flex justify-end gap-4">
            {/* <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center w-fit border border-gray-300 rounded-full bg-white text-gray-700 py-2 px-4 hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              <span>Cancel</span>
            </button> */}
            <button
              type="submit"
              className="flex items-center w-fit border rounded-full bg-[#f35b62] text-white py-2 px-4 hover:bg-[#EE161F] hover:text-white transition-colors"
            >
              <Check className="w-5 h-5 mr-2" />
              <span>Submit & Continue</span>
            </button>
          </div>
        </form>

        {/* Debug Info Panel */}
        {/* <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-2">Debug Information</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Current form data:</p>
            <pre className="bg-white p-2 rounded border text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <p>LocalStorage key: <code className="bg-gray-100 px-1 rounded">testRecords</code></p>
            <p>Records count: <strong>{(() => {
              const stored = localStorage.getItem("testRecords");
              return stored ? JSON.parse(stored).length : 0;
            })()}</strong></p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default TestForm;