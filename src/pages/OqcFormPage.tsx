
// import { Input } from "@/components/ui/input";
// import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
// import React from "react";
// import { toast } from "@/components/ui/use-toast";
// import { useNavigate } from "react-router-dom";

// // Form Component
// interface TestData {
//   documentNumber: string;
//   documentTitle: string;
//   projectName: string;
//   testLocation: string;
//   submissionPartDate: string;
//   sampleConfig: string;
//   remarks: string;
//   status: string;
//   project: string;
//   colour: string;
//   line: string;
//   quantity: number;
// }

// // Test name options - can be extended in the future
// const TEST_NAME_OPTIONS = [
//   { id: 'footPushOut', name: 'Foot Push Out' },
//   { id: 'shearTestSideSnap', name: 'Shear Test Side Snap' },
//   { id: 'pullTestCleat', name: 'Pull Test Cleat' },
//   { id: 'heatSoak', name: 'Heat Soak' },
//   { id: 'sidesnap', name: 'Side Snap' },
// ];

// const PROJECT_OPTIONS = ["Project AA", "Project BB", "Project CC"];
// const LINE_OPTIONS = ["Line 1", "Line 2", "Line 3"];
// const COLOUR_OPTIONS = ["NDA- XX", "LB- XX", "SD XX"];

// const TestForm: React.FC = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = React.useState<TestData>({
//     documentNumber: "",
//     documentTitle: "",
//     projectName: "",
//     testLocation: "",
//     submissionPartDate: "",
//     sampleConfig: "",
//     remarks: "",
//     status: "",
//     project: "",
//     line: "",
//     colour: "",
//     quantity: 0

//   });

//   const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
//   const [isProjectDropdownOpen, setIsProjectDropdownOpen] = React.useState(false);
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

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // Get existing data from localStorage
//       const existingData = localStorage.getItem("testRecords");
//       const records = existingData ? JSON.parse(existingData) : [];

//       // Add new record
//       const newRecord = {
//         ...formData,
//         id: Date.now(), // Add unique ID
//         createdAt: new Date().toISOString()
//       };

//       records.push(newRecord);

//       // Save back to localStorage
//       localStorage.setItem("testRecords", JSON.stringify(records));

//       // Reset form
//       setFormData({
//         documentNumber: "",
//         documentTitle: "",
//         projectName: "",
//         testLocation: "",
//         submissionPartDate: "",
//         sampleConfig: "",
//         remarks: "",
//         status: "",
//         project: "",
//         colour: "",
//         line: "",
//         quantity: 0
//       });

//       setIsDropdownOpen(false);

//       // Success toast with more details
//       toast({
//         title: "✅ Record Created",
//         description: `Record has been saved successfully!`,
//         duration: 3000,
//       });

//       // Navigate to ort-lab-form after a short delay
//       // Log current records
//       setTimeout(() => {
//         console.log("All records:", records);
//         navigate("/ort-lab-form", {
//           state: {
//             record: newRecord // Pass the complete record data
//           }
//         });
//       }, 500);

//       // Log current records
//       console.log("All records:", records);

//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Save Failed",
//         description: "There was an error saving the test data. Please try again.",
//         duration: 3000,
//       });
//       console.error("Error saving test data:", error);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto mt-6">
//       <div className="px-6 py-4">
//         <h1 className="text-2xl font-bold mb-6">Test Data Form</h1>

//         <form onSubmit={handleSubmit} className="space-y-6">

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Document Number <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="documentNumber"
//                 value={formData.documentNumber}
//                 onChange={handleInputChange}
//                 placeholder="Enter document number"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Document Title <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="documentTitle"
//                 value={formData.documentTitle}
//                 onChange={handleInputChange}
//                 placeholder="Enter document title"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Project Name <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="projectName"
//                 value={formData.projectName}
//                 onChange={handleInputChange}
//                 placeholder="Enter project name"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>

//             {/* <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Color <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="color"
//                 value={formData.color}
//                 onChange={handleInputChange}
//                 placeholder="Enter color"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div> */}

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Test Location <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="testLocation"
//                 value={formData.testLocation}
//                 onChange={handleInputChange}
//                 placeholder="Enter test location"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Submission Part Date <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="date"
//                 name="submissionPartDate"
//                 value={formData.submissionPartDate}
//                 onChange={handleInputChange}
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>


//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Sample Configuration Overview <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="sampleConfig"
//                 value={formData.sampleConfig}
//                 onChange={handleInputChange}
//                 placeholder="Enter sample configuration"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Remarks <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="text"
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={handleInputChange}
//                 placeholder="Enter any remarks"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Quantity <span className="text-red-600">*</span>
//               </label>
//               <Input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleInputChange}
//                 placeholder="Enter quantity"
//                 className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
//                 required
//                 min="1"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Project <span className="text-red-600">*</span>
//               </label>

//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
//                   className="h-14 w-full px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 flex items-center justify-between focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm text-left"
//                 >
//                   <span className="truncate">
//                     {formData.project ? formData.project : "Select project"}
//                   </span>
//                   {isProjectDropdownOpen ? (
//                     <ChevronUp className="flex-shrink-0 ml-2" />
//                   ) : (
//                     <ChevronDown className="flex-shrink-0 ml-2" />
//                   )}
//                 </button>

//                 {isProjectDropdownOpen && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-lg">
//                     <div className="p-2 border-b flex justify-end">
//                       <button
//                         type="button"
//                         onClick={() => setIsProjectDropdownOpen(false)}
//                         className="p-1 hover:bg-slate-100 rounded"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                     <div className="max-h-60 overflow-y-auto">
//                       {PROJECT_OPTIONS.map((option) => (
//                         <label
//                           key={option}
//                           className="flex items-center px-4 py-3 hover:bg-slate-100 cursor-pointer"
//                         >
//                           <input
//                             type="radio"
//                             name="project-single"
//                             value={option}
//                             checked={formData.project === option}
//                             onChange={() =>
//                               setFormData((prev) => ({ ...prev, project: option }))
//                             }
//                             className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                           />
//                           <span className="ml-3 font-medium text-slate-700">{option}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>


//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Line <span className="text-red-600">*</span>
//               </label>
//               <div className="relative">
//                 <select
//                   name="line"
//                   value={formData.line}
//                   onChange={handleInputChange}
//                   className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
//                   required
//                 >
//                   <option value="">Select line</option>
//                   {LINE_OPTIONS.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
//                 Colour <span className="text-red-600">*</span>
//               </label>
//               <div className="relative">
//                 <select
//                   name="colour"
//                   value={formData.colour}
//                   onChange={handleInputChange}
//                   className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
//                   required
//                 >
//                   <option value="">Select colour</option>
//                   {COLOUR_OPTIONS.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-bold text-slate-800 mb-1 uppercase tracking-wide">
//                 Status <span className="text-red-600">*</span>
//               </label>
//               <select
//                 type="text"
//                 name="status"
//                 value={formData.status}
//                 onChange={handleInputChange}
//                 className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
//                 required
//               >
//                 <option value="">-- Select Status --</option>
//                 <option value="Received">Received</option>
//                 <option value="Completed">Completed</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className="flex items-center w-fit border rounded-full bg-[#f35b62] text-white py-2 px-4 hover:bg-[#EE161F] hover:text-white transition-colors"
//             >
//               <Check className="w-5 h-5" />
//               <span>Submit</span>
//             </button>
//           </div>
//         </form>
//       </div >
//     </div >
//   );
// };

// export default TestForm;


import { Input } from "@/components/ui/input";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

// Form Component
interface TestData {
  documentNumber: string;
  documentTitle: string;
  projectName: string;
  testLocation: string;
  submissionPartDate: string;
  sampleConfig: string;
  remarks: string;
  status: string;
  project: string;
  colour: string;
  line: string;
  quantity: number;
}

// Test name options - can be extended in the future
const TEST_NAME_OPTIONS = [
  { id: 'footPushOut', name: 'Foot Push Out' },
  { id: 'shearTestSideSnap', name: 'Shear Test Side Snap' },
  { id: 'pullTestCleat', name: 'Pull Test Cleat' },
  { id: 'heatSoak', name: 'Heat Soak' },
  { id: 'sidesnap', name: 'Side Snap' },
];

const PROJECT_OPTIONS = ["Project AA", "Project BB", "Project CC"];
const LINE_OPTIONS = ["Line 1", "Line 2", "Line 3"];
const COLOUR_OPTIONS = ["NDA- XX", "LB- XX", "SD XX"];

const TestForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<TestData>({
    documentNumber: "",
    documentTitle: "",
    projectName: "",
    testLocation: "",
    submissionPartDate: "",
    sampleConfig: "",
    remarks: "",
    status: "",
    project: "",
    line: "",
    colour: "",
    quantity: 0

  });

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = React.useState(false);
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
        testLocation: "",
        submissionPartDate: "",
        sampleConfig: "",
        remarks: "",
        status: "",
        project: "",
        colour: "",
        line: "",
        quantity: 0
      });

      setIsDropdownOpen(false);

      // Success toast with more details
      toast({
        title: "Record Created",
        description: `Record has been saved successfully!`,
        duration: 3000,
      });

      // Navigate to ort-lab-form after a short delay
      // Log current records
      setTimeout(() => {
        console.log("All records:", records);
        navigate("/ort-lab-form", {
          state: {
            record: newRecord // Pass the complete record data
          }
        });
      }, 500);

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

            {/* <div className="space-y-2">
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
            </div> */}

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
                name="submissionPartDate"
                value={formData.submissionPartDate}
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
                Quantity <span className="text-red-600">*</span>
              </label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Project <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="h-14 w-full px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 flex items-center justify-between focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm text-left"
                >
                  <span className="truncate">
                    {formData.project ? formData.project : "Select project"}
                  </span>
                  {isProjectDropdownOpen ? (
                    <ChevronUp className="flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="flex-shrink-0 ml-2" />
                  )}
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-lg">
                    <div className="p-2 border-b flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {PROJECT_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-center px-4 py-3 hover:bg-slate-100 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="project-single"
                            value={option}
                            checked={formData.project === option}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, project: option }))
                            }
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 font-medium text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Line <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  name="line"
                  value={formData.line}
                  onChange={handleInputChange}
                  className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                  required
                >
                  <option value="">Select line</option>
                  {LINE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Colour <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <select
                  name="colour"
                  value={formData.colour}
                  onChange={handleInputChange}
                  className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                  required
                >
                  <option value="">Select colour</option>
                  {COLOUR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-1 uppercase tracking-wide">
                Status <span className="text-red-600">*</span>
              </label>
              <select
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="h-14 w-full px-5 border-2 border-slate-500 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm bg-white appearance-none pr-10"
                required
              >
                <option value="">-- Select Status --</option>
                <option value="Received">Received</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Remarks <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Enter any remarks"
                className="h-14 px-5 border-2 border-slate-300 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                required
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
      </div >
    </div >
  );
};

export default TestForm;
