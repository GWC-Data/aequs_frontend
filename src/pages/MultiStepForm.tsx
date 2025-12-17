import React, { useState, createContext, useContext } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TestForm from './OqcFormPage';
import BarcodeScanner from './BarcodeScannerPage';
import TicketAssignmentsTable from './TicketAssignmentsTable';
import ORTLabPage from './ORTLabPage';
import Stage2FormPage from './Stage2FormPage';
import DefaultForm from '@/components/DefaultForm'

// Workflow Context
interface WorkflowContextType {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  currentStep: number;
  completedSteps: number[];
  completeCurrentStep: () => void;
  workflowData: any;
  setWorkflowData: (data: any) => void;
  updateWorkflowData: (updates: any) => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within MultiStepWorkflow');
  }
  return context;
};

const MultiStepWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [workflowData, setWorkflowData] = useState<any>({
    currentTicket: null,
    allRecords: []
  });

  const steps = [
    { id: 1, name: 'OQC Form', description: 'Create test data record' },
    { id: 2, name: 'Barcode Scanner', description: 'Scan and assign parts' },
    { id: 3, name: 'Ticket Assignment', description: 'View assignments' },
    { id: 4, name: 'ORT Lab', description: 'Receive tickets' },
    { id: 5, name: 'Stage 2 Form', description: 'Test configuration' },
    { id: 6, name: 'Testing', description: 'Image cropper' }
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    if (completedSteps.includes(stepId - 1) || stepId === 1 || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const completeCurrentStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  const updateWorkflowData = (updates: any) => {
    setWorkflowData((prev: any) => ({
      ...prev,
      ...updates
    }));
  };

  const workflowValue: WorkflowContextType = {
    goToNextStep,
    goToPreviousStep,
    goToStep,
    currentStep,
    completedSteps,
    completeCurrentStep,
    workflowData,
    setWorkflowData,
    updateWorkflowData
  };

  return (
    <WorkflowContext.Provider value={workflowValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold text-gray-900">Test Monitoring Workflow</h1>
            <p className="text-sm text-gray-600 mt-1">Complete all steps to process test records</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-3 mb-6">
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1 min-w-[100px]">
                    <button
                      onClick={() => goToStep(step.id)}
                      disabled={!completedSteps.includes(step.id - 1) && step.id !== 1 && !completedSteps.includes(step.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                        completedSteps.includes(step.id)
                          ? 'bg-green-600 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : completedSteps.includes(step.id - 1) || step.id === 1
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {completedSteps.includes(step.id) ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        step.id
                      )}
                    </button>
                    <div className="text-center mt-2">
                      <p className={`text-xs font-medium ${
                        currentStep === step.id ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 mb-8 min-w-[20px] max-w-[60px]">
                      <div className={`h-full rounded transition-all ${
                        completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {currentStep === 1 && <TestForm />}
            {currentStep === 2 && <BarcodeScanner />}
            {currentStep === 3 && <TicketAssignmentsTable />}
            {currentStep === 4 && <ORTLabPage />}
            {currentStep === 5 && <Stage2FormPage />}
            {currentStep === 6 && <DefaultForm />}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="border-gray-300"
              >
                Previous Step
              </Button>
              
              <div className="text-sm text-gray-600 font-medium">
                Step {currentStep} of {steps.length}
              </div>

              <Button
                onClick={goToNextStep}
                disabled={currentStep === steps.length}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === steps.length ? 'Complete Workflow' : 'Next Step'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WorkflowContext.Provider>
  );
};

export default MultiStepWorkflow;