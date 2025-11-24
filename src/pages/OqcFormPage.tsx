import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { toast } from "@/components/ui/use-toast";


// Form Component
interface TestData {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  color: string;
  testLocation: string;
  submissionDate: string;
  sampleConfig: string;
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
    documentNumber: "",
    documentTitle: "",
    projectName: "",
    color: "",
    testLocation: "",
    submissionDate: "",
    sampleConfig: "",
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
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
        documentNumber: "",
        documentTitle: "",
        projectName: "",
        color: "",
        testLocation: "",
        submissionDate: "",
        sampleConfig: "",
        status: "",
      });

      setIsDropdownOpen(false);

      // Success toast with more details
      toast({
        title: "✅ Record Created",
        description: `Record has been saved successfully!`,
        duration: 3000,
      });

      // Log current records
      console.log("All records:", records);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving the test data. Please try again.",
        duration: 3000,
      });
      console.error("Error saving test data:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold mb-6">Test Data Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Submission Part Date <span className="text-red-600">*</span>
              </label>
              <Input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
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
