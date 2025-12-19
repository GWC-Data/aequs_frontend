import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Check, Scan, Ticket, Calendar, Search, Filter,
  ChevronRight, ChevronDown, CheckCircle, AlertCircle, XCircle,
  Trash2, ArrowLeft, Edit2, Save, X, Upload, Send,
} from 'lucide-react';

// Types
interface PartInfo {
  id: string;
  partNumber: string;
  serialNumber: string;
  scanStatus: 'Cosmetic OK' | 'Cosmetic Not OK';
  scannedAt: string;
  location: string;
}

interface ScanSession {
  id: string;
  sessionNumber: number;
  timestamp: string;
  parts: PartInfo[];
  submitted: boolean;
  submittedAt?: string;
  sentToORT: boolean;
  sentToORTAt?: string;
}

interface TestRecord {
  id: number;
  ticketCode: string;
  totalQuantity: number;
  anoType: string;
  source: string;
  reason: string;
  project: string;
  build: string;
  colour: string;
  dateTime: string;
  status: string;
  sessions: ScanSession[];
  createdAt: string;
  oqcApproved: boolean;
  oqcApprovedAt?: string;
  oqcApprovedBy?: string;
}

interface TempScannedPart {
  partNumber: string;
  serialNumber: string;
  scanStatus: 'Cosmetic OK' | 'Cosmetic Not OK' | null;
}

// Constants
const ASSEMBLY_ANO_OPTIONS = ["ANO", "ASSEMBLY", "OLEO"];
const SOURCE_OPTIONS_ANO = ["Entire", "Other"];
const SOURCE_OPTIONS_ASSEMBLY = ["Line1", "Line2", "Other"];
const SOURCE_OPTIONS_OLEO = ["Other"];
const PROJECT_OPTIONS = ["FLASH", "LIGHT", "HULK", "AQUA"];
const COLOUR_OPTIONS = ["NDA", "Stardust", "Blue", "N/A"];
const REASON_OPTIONS = ["Line qualification", "Machine qualification", "MP", "NPI", "Other"];

// LocalStorage key
const STORAGE_KEY = 'oqc_ticket_records';

const PROJECT_CODES = {
  'FLASH': 'FLS',
  'LIGHT': 'LGT',
  'HULK': 'HLK',
  'AQUA': 'AQU'
};

const COLOUR_CODES = {
  'NDA': 'NDA',
  'Stardust': 'SD',
  'Light Blue': 'LB',
  'N/A': 'N/A'
};

const ANO_TYPE_CODES = {
  'ANO': 'ANO',
  'ASSEMBLY': 'ASSY',
  'OLEO': 'OLEO'
};


const OQCSystem = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [activeTab, setActiveTab] = useState<'create' | 'scan' | 'tickets'>('create');
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TestRecord | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<{ [key: string]: boolean }>({});
  const [expandedSessions, setExpandedSessions] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  // const [dateFilter, setDateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [buildFilter, setBuildFilter] = useState<string>('All');
  const [colourFilter, setColourFilter] = useState<string>('All');
  const [reasonFilter, setReasonFilter] = useState<string>('All');

  // Form state
  const [formData, setFormData] = useState({
    ticketCode: '',
    totalQuantity: 0,
    anoType: '',
    source: '',
    otherSource: '',
    reason: '',
    otherReason: '',
    project: '',
    build: '',
    colour: '',
    dateTime: new Date().toISOString().split('T')[0],
    status: 'In-Progress'
  });
  const [showOtherSource, setShowOtherSource] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);

  // Scanner state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [tempScannedParts, setTempScannedParts] = useState<TempScannedPart[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Editing state for sessions
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editLocationValue, setEditLocationValue] = useState('');

  // OQC Approval state
  const [oqcApprover, setOqcApprover] = useState('');
  const [showOQCApproval, setShowOQCApproval] = useState<number | null>(null);


  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setTestRecords(parsedData);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setTestRecords([]);
      }
    }
  }, []);

  // Save data to localStorage whenever testRecords changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testRecords));
  }, [testRecords]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getUniqueValues = (records: TestRecord[], key: keyof TestRecord): string[] => {
    const values = records.map(record => record[key]).filter(Boolean) as string[];
    return ['All', ...Array.from(new Set(values))];
  };

  // Generate ticket code
  const generateTicketCode = (project: string, colour: string, anoType: string, build: string, quantity: number) => {
    // Get codes
    const projectCode = PROJECT_CODES[project.toUpperCase()] || 'UNK';
    const colourCode = COLOUR_CODES[colour] || 'UNK';
    const anoCode = ANO_TYPE_CODES[anoType.toUpperCase()] || 'UNK';

    // Pad quantity to 3 digits
    const quantityPadded = String(quantity).padStart(3, '0');

    // Get the next sequence number for this project
    const projectRecords = testRecords.filter(r => r.project === project);
    let maxNumber = 0;

    projectRecords.forEach(record => {
      // Extract the sequence number from existing ticket codes
      // Format: 001_FLS_LB_ANO_BUILD_040
      const match = record.ticketCode?.match(/^(\d+)_/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const sequenceNumber = String(maxNumber + 1).padStart(3, '0');

    // Generate the final ticket code
    return `${sequenceNumber}_${projectCode}_${colourCode}_${anoCode}_${build}_${quantityPadded}`;
  };

  // Update source options based on ANO type
  useEffect(() => {
    switch (formData.anoType) {
      case 'ANO':
        setSourceOptions(SOURCE_OPTIONS_ANO);
        break;
      case 'ASSEMBLY':
        setSourceOptions(SOURCE_OPTIONS_ASSEMBLY);
        break;
      case 'OLEO':
        setSourceOptions(SOURCE_OPTIONS_OLEO);
        break;
      default:
        setSourceOptions([]);
    }
    if (formData.anoType) {
      setFormData(prev => ({ ...prev, source: '', otherSource: '' }));
    }
  }, [formData.anoType]);

  useEffect(() => {
    setShowOtherSource(formData.source === 'Other');
    if (formData.source !== 'Other') {
      setFormData(prev => ({ ...prev, otherSource: '' }));
    }
  }, [formData.source]);

  useEffect(() => {
    setShowOtherReason(formData.reason === 'Other');
    if (formData.reason !== 'Other') {
      setFormData(prev => ({ ...prev, otherReason: '' }));
    }
  }, [formData.reason]);

  // useEffect(() => {
  //   if (formData.project) {
  //     setFormData(prev => ({ ...prev, ticketCode: generateTicketCode(formData.project) }));
  //   }
  // }, [formData.project, testRecords]);

  useEffect(() => {
    if (formData.project && formData.colour && formData.anoType && formData.build && formData.totalQuantity > 0) {
      const newCode = generateTicketCode(
        formData.project,
        formData.colour,
        formData.anoType,
        formData.build,
        formData.totalQuantity
      );
      setFormData(prev => ({ ...prev, ticketCode: newCode }));
    }
  }, [formData.project, formData.colour, formData.anoType, formData.build, formData.totalQuantity, testRecords]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'totalQuantity') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ticketCode || !formData.ticketCode.includes('_')) {
      showNotification('error', 'Please fill all required fields to generate ticket code');
      return;
    }

    const finalSource = formData.source === 'Other' ? formData.otherSource : formData.source;
    const finalReason = formData.reason === 'Other' ? formData.otherReason : formData.reason;

    if (!formData.ticketCode || !formData.totalQuantity || !formData.anoType ||
      !formData.source || !formData.reason || !formData.project ||
      !formData.build || !formData.colour || !formData.dateTime) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    if (formData.source === 'Other' && !formData.otherSource.trim()) {
      showNotification('error', 'Please specify the source when Other is selected');
      return;
    }

    if (formData.reason === 'Other' && !formData.otherReason.trim()) {
      showNotification('error', 'Please specify the reason when Other is selected');
      return;
    }

    const existingTicket = testRecords.find(record => record.ticketCode === formData.ticketCode);
    if (existingTicket) {
      showNotification('error', 'Ticket code already exists. Please check your inputs.');
      return;
    }

    const newRecord: TestRecord = {
      id: Date.now(),
      ticketCode: formData.ticketCode,
      totalQuantity: formData.totalQuantity,
      anoType: formData.anoType,
      source: finalSource,
      reason: finalReason,
      project: formData.project,
      build: formData.build,
      colour: formData.colour,
      dateTime: formData.dateTime,
      status: 'In-Progress',
      sessions: [],
      createdAt: new Date().toISOString(),
      oqcApproved: false
    };

    const updatedRecords = [...testRecords, newRecord];
    setTestRecords(updatedRecords);

    setFormData({
      ticketCode: '',
      totalQuantity: 0,
      anoType: '',
      source: '',
      otherSource: '',
      reason: '',
      otherReason: '',
      project: '',
      build: '',
      colour: '',
      dateTime: new Date().toISOString().split('T')[0],
      status: 'In-Progress'
    });
    setShowOtherSource(false);
    setShowOtherReason(false);
    setSourceOptions([]);

    showNotification('success', `Ticket ${newRecord.ticketCode} created successfully!`);

    setTimeout(() => {
      setActiveTab('tickets');
    }, 1500);
  };

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedTicket) {
      e.preventDefault();
      const barcodeData = barcodeInput.trim();
      if (barcodeData) {
        processBarcode(barcodeData);
        setBarcodeInput('');
      }
    }
  };

  const processBarcode = (data: string) => {
    if (!selectedTicket) return;

    const totalScannedInSession = tempScannedParts.length;
    const totalScannedOverall = selectedTicket.sessions.reduce((sum, session) => sum + session.parts.length, 0);
    const totalScanned = totalScannedInSession + totalScannedOverall;

    if (totalScanned >= selectedTicket.totalQuantity) {
      showNotification('error', `All ${selectedTicket.totalQuantity} parts have been scanned`);
      return;
    }

    const parts = data.split(':');
    const serialNumber = parts[0].trim();
    const partNumber = parts.length > 1 ? parts[1].trim() : `${selectedTicket.project}-P${String(totalScanned + 1).padStart(3, '0')}`;

    // Check for duplicate serial number in current session
    const duplicateInSession = tempScannedParts.find(p => p.serialNumber === serialNumber);
    if (duplicateInSession) {
      showNotification('error', `Duplicate serial number in current session: ${serialNumber}`);
      return;
    }

    // Check for duplicate serial number in all sessions
    const duplicateInAllSessions = selectedTicket.sessions.some(session =>
      session.parts.some(part => part.serialNumber === serialNumber)
    );
    if (duplicateInAllSessions) {
      showNotification('error', `Duplicate serial number in ticket: ${serialNumber}`);
      return;
    }

    const newPart: TempScannedPart = {
      partNumber,
      serialNumber,
      scanStatus: null
    };

    setTempScannedParts(prev => [...prev, newPart]);
    showNotification('success', `Part scanned: ${partNumber}. Please select status.`);
  };

  const handleStatusChange = (index: number, status: 'Cosmetic OK' | 'Cosmetic Not OK') => {
    setTempScannedParts(prev =>
      prev.map((part, i) => i === index ? { ...part, scanStatus: status } : part)
    );
  };


  const handleSaveSession = () => {
    if (!selectedTicket || tempScannedParts.length === 0) return;

    const partialSessionData = JSON.parse(localStorage.getItem('partialReceiptInfo') || 'null');

    const partsWithoutStatus = tempScannedParts.filter(p => !p.scanStatus);
    if (partsWithoutStatus.length > 0) {
      showNotification('error', `Please select status for ${partsWithoutStatus.length} part(s)`);
      return;
    }

    setIsSaving(true);

    const sessionNumber = selectedTicket.sessions.length + 1;
    const newSession: ScanSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionNumber,
      timestamp: new Date().toISOString(),
      parts: tempScannedParts.map((part, idx) => ({
        id: `part-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        partNumber: part.partNumber,
        serialNumber: part.serialNumber,
        scanStatus: part.scanStatus!,
        scannedAt: new Date().toISOString(),
        location: 'home'
      })),
      submitted: false,
      sentToORT: false
    };

    const updatedRecords = testRecords.map(record => {
      if (record.id === selectedTicket.id) {
        const updatedSessions = [...record.sessions, newSession];
        const totalScanned = updatedSessions.reduce((sum, session) => sum + session.parts.length, 0);

        // Check if this is a partial session completion
        const isPartialCompletion = partialSessionData?.isPartial &&
          totalScanned >= partialSessionData.totalQuantity;

        return {
          ...record,
          sessions: updatedSessions,
          status: isPartialCompletion ? 'Ready for OQC Approval' : 'Scanning Complete'
        };
      }
      return record;
    });

    setTestRecords(updatedRecords);

    // Check if partial session is now complete
    const totalScanned = selectedTicket.sessions.reduce((sum, session) => sum + session.parts.length, 0) + tempScannedParts.length;
    const isPartialComplete = partialSessionData?.isPartial &&
      totalScanned >= partialSessionData.totalQuantity;

    if (isPartialComplete) {
      showNotification('success',
        `Partial session completed! All ${partialSessionData.totalQuantity} parts scanned. ` +
        `Session ${sessionNumber} saved. Please submit the session.`
      );

      // Clear partial session data from localStorage
      localStorage.removeItem('ort_lab_submission');
    } else {
      showNotification('success',
        `Session ${sessionNumber} saved with ${tempScannedParts.length} parts! ` +
        `Please submit the session in Tickets tab.`
      );
    }

    setTempScannedParts([]);
    setIsSaving(false);

    setTimeout(() => {
      setActiveTab('tickets');
    }, 1500);
  };

  const handleSubmitSession = (ticketId: number, sessionId: string) => {
    const updatedRecords = testRecords.map(record => {
      if (record.id === ticketId) {
        const updatedSessions = record.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              submitted: true,
              submittedAt: new Date().toISOString()
            };
          }
          return session;
        });

        // Check if all sessions are submitted
        const allSessionsSubmitted = updatedSessions.every(session => session.submitted);
        const totalScanned = updatedSessions.reduce((sum, session) => sum + session.parts.length, 0);
        const allScanned = totalScanned >= record.totalQuantity;

        return {
          ...record,
          sessions: updatedSessions,
          status: allSessionsSubmitted ? 'Ready for OQC Approval' : record.status
        };
      }
      return record;
    });

    setTestRecords(updatedRecords);
    showNotification('success', 'Session submitted successfully!');

    // NEW: Find the submitted session and ticket for ORT Lab data
    const submittedTicket = testRecords.find(t => t.id === ticketId);
    const submittedSession = submittedTicket?.sessions.find(s => s.id === sessionId);

    if (submittedTicket && submittedSession) {
      // Prepare data for ORT Lab
      const ortLabData = {
        id: sessionId,
        timestamp: new Date().toISOString(),
        ticketId: ticketId,
        ticketCode: submittedTicket.ticketCode,
        sessionNumber: submittedSession.sessionNumber,
        parts: submittedSession.parts,
        project: submittedTicket.project,
        build: submittedTicket.build,
        colour: submittedTicket.colour,
        anoType: submittedTicket.anoType,
        source: submittedTicket.source,
        reason: submittedTicket.reason,
        oqcApprovedBy: submittedTicket.oqcApprovedBy,
        oqcApprovedAt: submittedTicket.oqcApprovedAt,
        submittedAt: submittedSession.submittedAt,
        totalParts: submittedSession.parts.length,
        serialNumber: submittedSession.parts.map(p => p.serialNumber).join(', '),
        partNumbers: submittedSession.parts.map(p => p.partNumber),
        rawBarcodeData: submittedSession.parts.map(p => `${p.serialNumber}:${p.partNumber}`).join('; '),
        submitted: true,
        totalQuantity: submittedTicket.totalQuantity
      };

      // Store in localStorage for ORT Lab
      const existingSubmissions = JSON.parse(localStorage.getItem('ort_lab_submissions') || '[]');
      existingSubmissions.push(ortLabData);
      localStorage.setItem('ort_lab_submissions', JSON.stringify(existingSubmissions));

      // Navigate to ORT Lab page after a short delay
      setTimeout(() => {
        navigate('/ort-lab-form');
      }, 1000);
    }
  };

  // NEW: Function to submit all sessions for a ticket
  const handleSubmitAllSessions = (ticketId: number) => {
    const updatedRecords = testRecords.map(record => {
      if (record.id === ticketId) {
        const updatedSessions = record.sessions.map(session => ({
          ...session,
          submitted: true,
          submittedAt: session.submittedAt || new Date().toISOString()
        }));

        const totalScanned = updatedSessions.reduce((sum, session) => sum + session.parts.length, 0);
        const allScanned = totalScanned >= record.totalQuantity;

        return {
          ...record,
          sessions: updatedSessions,
          status: allScanned ? 'Ready for OQC Approval' : 'Partially Submitted'
        };
      }
      return record;
    });

    setTestRecords(updatedRecords);
    showNotification('success', 'All sessions submitted successfully!');
  };

  const handleStartScanning = (ticket: TestRecord) => {
    setSelectedTicket(ticket);
    setTempScannedParts([]);
    setBarcodeInput('');
    setActiveTab('scan');
  };

  const toggleTicketExpand = (ticketCode: string) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketCode]: !prev[ticketCode]
    }));
  };

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleUpdateLocation = (ticketId: number, sessionId: string, partId: string, newLocation: string) => {
    const updatedRecords = testRecords.map(record => {
      if (record.id === ticketId) {
        return {
          ...record,
          sessions: record.sessions.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                parts: session.parts.map(part =>
                  part.id === partId ? { ...part, location: newLocation } : part
                )
              };
            }
            return session;
          })
        };
      }
      return record;
    });
    setTestRecords(updatedRecords);
    setEditingLocation(null);
    showNotification('success', 'Location updated successfully');
  };

  // NEW FUNCTION: Handle OQC Approval
  const handleOQCApproval = (ticketId: number) => {
    if (!oqcApprover.trim()) {
      showNotification('error', 'Please enter your name for OQC approval');
      return;
    }

    const updatedRecords = testRecords.map(record => {
      if (record.id === ticketId) {
        // Check if all sessions are submitted
        const allSessionsSubmitted = record.sessions.every(session => session.submitted);
        if (!allSessionsSubmitted) {
          showNotification('error', 'All sessions must be submitted before OQC approval');
          return record;
        }

        return {
          ...record,
          oqcApproved: true,
          oqcApprovedAt: new Date().toISOString(),
          oqcApprovedBy: oqcApprover,
          status: 'OQC Approved'
        };
      }
      return record;
    });

    setTestRecords(updatedRecords);
    setShowOQCApproval(null);
    setOqcApprover('');
    showNotification('success', 'Ticket approved by OQC successfully!');
  };

  // NEW FUNCTION: Submit session to ORT Lab
  const handleSubmitToORTLab = (ticketId: number, sessionId: string, ticketCode: string) => {
    const ticket = testRecords.find(t => t.id === ticketId);
    const session = ticket?.sessions.find(s => s.id === sessionId);

    if (!ticket || !session) {
      showNotification('error', 'Ticket or session not found');
      return;
    }

    // Check if ticket is OQC approved
    if (!ticket.oqcApproved) {
      showNotification('error', 'Ticket must be OQC approved before sending to ORT Lab');
      return;
    }

    // Check if session is submitted
    if (!session.submitted) {
      showNotification('error', 'Session must be submitted before sending to ORT Lab');
      return;
    }

    // Prepare data for ORT Lab
    const ortLabData = {
      ticketId,
      ticketCode,
      sessionId,
      sessionNumber: session.sessionNumber,
      timestamp: new Date().toISOString(),
      parts: session.parts,
      project: ticket.project,
      build: ticket.build,
      colour: ticket.colour,
      anoType: ticket.anoType,
      source: ticket.source,
      reason: ticket.reason,
      oqcApprovedBy: ticket.oqcApprovedBy,
      oqcApprovedAt: ticket.oqcApprovedAt,
      submittedAt: session.submittedAt
    };

    // Store in localStorage for ORT Lab to access
    localStorage.setItem('ort_lab_submission', JSON.stringify(ortLabData));

    // Update the session to mark as sent to ORT
    const updatedRecords = testRecords.map(record => {
      if (record.id === ticketId) {
        return {
          ...record,
          sessions: record.sessions.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                sentToORT: true,
                sentToORTAt: new Date().toISOString()
              };
            }
            return s;
          })
        };
      }
      return record;
    });

    setTestRecords(updatedRecords);

    // Navigate to ORT Lab form
    navigate('/ort-lab-form');
  };


  const getStatusIcon = (status: 'Cosmetic OK' | 'Cosmetic Not OK' | null) => {
    switch (status) {
      case 'Cosmetic OK': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cosmetic Not OK': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: 'Cosmetic OK' | 'Cosmetic Not OK' | null) => {
    switch (status) {
      case 'Cosmetic OK': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cosmetic Not OK': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // const filteredRecords = testRecords.filter(record => {
  //   const matchesSearch = record.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     record.sessions.some(session =>
  //       session.parts.some(part =>
  //         part.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  //       )
  //     );

  //   const matchesDate = !dateFilter || record.dateTime === dateFilter;

  //   return matchesSearch && matchesDate;
  // });

  const filteredRecords = testRecords.filter(record => {
    const matchesSearch = record.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sessions.some(session =>
        session.parts.some(part =>
          part.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

    // const matchesDate = !dateFilter || record.dateTime === dateFilter;
    const recordDate = new Date(record.dateTime);
    let matchesDate = true;

     if (startDateFilter) {
    const startDate = new Date(startDateFilter);
    if (recordDate < startDate) {
      matchesDate = false;
    }
  }
  
  if (endDateFilter) {
    const endDate = new Date(endDateFilter);
    endDate.setHours(23, 59, 59, 999); // Include entire end day
    if (recordDate > endDate) {
      matchesDate = false;
    }
  }

    // New filter conditions
    const matchesProject = projectFilter === 'All' || record.project === projectFilter;
    const matchesBuild = buildFilter === 'All' || record.build === buildFilter;
    const matchesColour = colourFilter === 'All' || record.colour === colourFilter;
    const matchesReason = reasonFilter === 'All' || record.reason === reasonFilter;

    return matchesSearch && matchesDate && matchesProject && matchesBuild && matchesColour && matchesReason;
  });

  // Function to clear localStorage (for development/testing)
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setTestRecords([]);
      showNotification('success', 'All data cleared from localStorage');
    }
  };

  // Render Create Ticket Tab
  const renderCreateTab = () => (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create New Ticket</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLocalStorage}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Ticket Code <span className="text-red-600">*</span>
                  <span className="text-xs font-normal text-gray-500 ml-2">(Auto-generated)</span>
                </Label>
                <Input
                  type="text"
                  value={formData.ticketCode}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Select project to generate code"
                />
              </div> */}

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Ticket Code <span className="text-red-600">*</span>
                  <span className="text-xs font-normal text-gray-500 ml-2">(Auto-generated)</span>
                </Label>
                <Input
                  type="text"
                  value={formData.ticketCode}
                  readOnly
                  className="bg-gray-50 font-mono"
                  placeholder="Fill all fields to generate code"
                />
                {formData.ticketCode && (
                  <div className="text-sm text-blue-600 font-mono mt-1">
                    Format: {formData.ticketCode.replace(/^_|_$/g, '')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Total Quantity <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  name="totalQuantity"
                  value={formData.totalQuantity || ''}
                  onChange={handleInputChange}
                  placeholder="Enter total quantity"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  ANO/ASSEMBLY/OLEO <span className="text-red-600">*</span>
                </Label>
                <select
                  name="anoType"
                  value={formData.anoType}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select Type --</option>
                  {ASSEMBLY_ANO_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Source <span className="text-red-600">*</span>
                </Label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  required
                  disabled={!formData.anoType}
                >
                  <option value="">-- Select Source --</option>
                  {sourceOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {showOtherSource && (
                  <Input
                    type="text"
                    name="otherSource"
                    value={formData.otherSource}
                    onChange={handleInputChange}
                    placeholder="Please specify source"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Project <span className="text-red-600">*</span>
                </Label>
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {PROJECT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Build <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="text"
                  name="build"
                  value={formData.build}
                  onChange={handleInputChange}
                  placeholder="Enter build"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Colour <span className="text-red-600">*</span>
                </Label>
                <select
                  name="colour"
                  value={formData.colour}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select Colour --</option>
                  {COLOUR_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold uppercase">
                  Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="date"
                  name="dateTime"
                  value={formData.dateTime}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="font-bold uppercase">
                  Reason <span className="text-red-600">*</span>
                </Label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select Reason --</option>
                  {REASON_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {showOtherReason && (
                  <Textarea
                    name="otherReason"
                    value={formData.otherReason}
                    onChange={handleInputChange}
                    placeholder="Please specify the reason"
                    className="min-h-[100px]"
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-red-500 hover:bg-red-600">
                <Check className="w-5 h-5 mr-2" />
                Submit & Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // Render Scan Parts Tab
  const renderScanTab = () => {
    if (!selectedTicket) {
      return (
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-500 mb-4">No ticket selected.</div>
              <Button onClick={() => setActiveTab('tickets')} className="bg-red-500 hover:bg-red-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const totalScannedOverall = selectedTicket.sessions.reduce((sum, session) => sum + session.parts.length, 0);
    const scannedCount = totalScannedOverall + tempScannedParts.length;
    const remainingCount = selectedTicket.totalQuantity - scannedCount;
    const hasUnsubmittedSessions = selectedTicket.sessions.some(session => !session.submitted);

    return (
      <div className="space-y-6 p-4  mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedTicket(null);
                    setTempScannedParts([]);
                    setActiveTab('tickets');
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tickets
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Barcode Scanning</h1>
                  <p className="text-sm text-gray-500">Scan parts for ticket {selectedTicket.ticketCode}</p>
                </div>
              </div>
              {hasUnsubmittedSessions && (
                <Button
                  onClick={() => handleSubmitAllSessions(selectedTicket.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Submit All Sessions
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-blue-700">Ticket Code</div>
                <div className="font-bold text-lg flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  {selectedTicket.ticketCode}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">Required</div>
                <div className="font-bold text-lg">{selectedTicket.totalQuantity}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">Scanned</div>
                <div className="font-bold text-lg text-green-600">{scannedCount}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">Remaining</div>
                <div className={`font-bold text-lg ${remainingCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {remainingCount}
                </div>
              </div>
            </div>

            {/* Show current sessions status */}
            {selectedTicket.sessions.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Current Sessions Status:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.sessions.map(session => (
                    <Badge
                      key={session.id}
                      variant={session.submitted ? "default" : "outline"}
                      className={session.submitted ? "bg-green-600" : "bg-yellow-100 text-yellow-800"}
                    >
                      Session {session.sessionNumber}: {session.parts.length} parts
                      {session.submitted ? " ✓ Submitted" : " ⏳ Pending"}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Save this session first, then submit sessions from the Tickets tab.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Scan Barcode</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcodeInput" className="text-base font-medium">
                  Scanner Input <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="barcodeInput"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  placeholder="Scan barcode or enter manually (Press Enter to scan)"
                  className="h-12 font-mono text-lg border-2 border-blue-300"
                  disabled={remainingCount <= 0}
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  Format: SerialNumber or SerialNumber:PartNumber (Press Enter)
                </p>
              </div>

              {/* <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Test Barcodes:</Label>
                <div className="flex flex-wrap gap-2">
                  {['SN001:PART-001', 'SN002:PART-002', 'SN003:PART-003'].map((barcode, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBarcodeInput(barcode);
                        setTimeout(() => processBarcode(barcode), 100);
                      }}
                      className="text-xs font-mono"
                      disabled={remainingCount <= 0}
                    >
                      {barcode}
                    </Button>
                  ))}
                </div>
              </div> */}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Scan: </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const totalScannedInSession = tempScannedParts.length;
                    const totalScannedOverall = selectedTicket.sessions.reduce((sum, session) => sum + session.parts.length, 0);
                    const nextNumber = totalScannedInSession + totalScannedOverall + 1;
                    const barcode = `SN${String(nextNumber).padStart(3, '0')}:PART-${String(nextNumber).padStart(3, '0')}`;
                    setBarcodeInput(barcode);
                    setTimeout(() => processBarcode(barcode), 100);
                  }}
                  className="text-xs font-mono"
                  disabled={remainingCount <= 0}
                >
                  Scan & Generate
                </Button>
                {/* <p className="text-xs text-gray-500">
                  Click to automatically generate and scan the next sequential barcode
                </p> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {tempScannedParts.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-700">
                    Scanned Parts This Session ({tempScannedParts.length})
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select status for each scanned part
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempScannedParts([])}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>


              <div className="space-y-4">
                {tempScannedParts.map((part, index) => (
                  <div key={`temp-${index}`} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span className="text-blue-600">#{index + 1}</span>
                          <span className="font-mono">{part.partNumber}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Serial: <span className="font-mono">{part.serialNumber}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(part.scanStatus)}>
                        {getStatusIcon(part.scanStatus)}
                        <span className="ml-1">{part.scanStatus || 'Pending'}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Status:</Label>
                      <RadioGroup
                        value={part.scanStatus || ''}
                        onValueChange={(value: 'Cosmetic OK' | 'Cosmetic Not OK') =>
                          handleStatusChange(index, value)
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Cosmetic OK" id={`cosmeticok-${index}`} />
                          <Label htmlFor={`cosmeticok-${index}`} className="flex items-center gap-2 cursor-pointer">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Cosmetic OK
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Cosmetic Not OK" id={`cosmeticnotok-${index}`} />
                          <Label htmlFor={`cosmeticnotok-${index}`} className="flex items-center gap-2 cursor-pointer">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            Cosmetic Not OK
                          </Label>
                        </div>
                        {/* <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Not OK" id={`notok-${index}`} />
                          <Label htmlFor={`notok-${index}`} className="flex items-center gap-2 cursor-pointer">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Not OK
                          </Label>
                        </div> */}
                      </RadioGroup>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t mt-6 flex flex-col gap-4">
                <Button
                  onClick={handleSaveSession}
                  disabled={isSaving || tempScannedParts.length === 0 ||
                    tempScannedParts.some(p => !p.scanStatus)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-sm font-medium self-start"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-5 w-5" />
                      Save Session
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  {tempScannedParts.filter(p => !p.scanStatus).length} part(s) need status selection
                </p>
                <p className="text-sm text-gray-500">
                  Note: Sessions will be saved but need to be submitted separately in the "All Tickets" tab
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTicketsTab = () => {
    // Get unique values for filters
    const uniqueProjects = getUniqueValues(testRecords, 'project');
    const uniqueBuilds = getUniqueValues(testRecords, 'build');
    const uniqueColours = getUniqueValues(testRecords, 'colour');
    const uniqueReasons = getUniqueValues(testRecords, 'reason');

    // Check for partial session data
    const partialSessionData = JSON.parse(localStorage.getItem('partialReceiptInfo') || 'null');
    const hasPartialSession = partialSessionData?.isPartial === true;

    return (
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search field */}
              <div className="space-y-2">
                <Label htmlFor="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Tickets
                </Label>
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <Label htmlFor="projectFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Project
                </Label>
                <select
                  id="projectFilter"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                >
                  {uniqueProjects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              {/* Build Filter */}
              <div className="space-y-2">
                <Label htmlFor="buildFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Build
                </Label>
                <select
                  id="buildFilter"
                  value={buildFilter}
                  onChange={(e) => setBuildFilter(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                >
                  {uniqueBuilds.map(build => (
                    <option key={build} value={build}>{build}</option>
                  ))}
                </select>
              </div>

              {/* Colour Filter */}
              {/* <div className="space-y-2">
                <Label htmlFor="colourFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Colour
                </Label>
                <select
                  id="colourFilter"
                  value={colourFilter}
                  onChange={(e) => setColourFilter(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                >
                  {uniqueColours.map(colour => (
                    <option key={colour} value={colour}>{colour}</option>
                  ))}
                </select>
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="colourFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Colour
                </Label>
                <div className="flex gap-2">
                  <select
                    id="colourFilter"
                    value={colourFilter}
                    onChange={(e) => setColourFilter(e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  >
                    {uniqueColours.map(colour => (
                      <option key={colour} value={colour}>{colour}</option>
                    ))}
                  </select>
                  
                </div>
              </div>


              {/* Reason Filter */}
              {/* <div className="space-y-2">
                <Label htmlFor="reasonFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Reason
                </Label>
                <select
                  id="reasonFilter"
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                >
                  {uniqueReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="reasonFilter" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Reason
                </Label>
                <div className="flex gap-2">
                  <select
                    id="reasonFilter"
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-300 rounded-md"
                  >
                    {uniqueReasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {/* Export Button - Uncomment if needed */}
                  {/* <Button
                  variant="outline"
                  onClick={() => {
                    const dataStr = JSON.stringify(testRecords, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `oqc_tickets_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  title="Export data"
                >
                  <Upload className="h-4 w-4" />
                </Button> */}
                </div>
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  min={startDateFilter} // End date cannot be before start date
                />
              </div>
              <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStartDateFilter('');
                        setEndDateFilter('');
                        setProjectFilter('All');
                        setBuildFilter('All');
                        setColourFilter('All');
                        setReasonFilter('All');
                        setExpandedTickets({});
                        setExpandedSessions({});
                      }}
                      title="Clear all filters"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

              {/* Filter Summary */}
              <div className="md:col-span-2 lg:col-span-5">
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-500">
                    Showing {filteredRecords.length} of {testRecords.length} tickets
                    {(projectFilter !== 'All' || buildFilter !== 'All' || colourFilter !== 'All' || reasonFilter !== 'All') && (
                      <span className="ml-2">
                        • Filtered by:
                        {projectFilter !== 'All' && <span className="ml-1 font-medium">{projectFilter}</span>}
                        {buildFilter !== 'All' && <span className="ml-1 font-medium">{buildFilter}</span>}
                        {colourFilter !== 'All' && <span className="ml-1 font-medium">{colourFilter}</span>}
                        {reasonFilter !== 'All' && <span className="ml-1 font-medium">{reasonFilter}</span>}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {testRecords.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearLocalStorage}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                All Tickets ({testRecords.length})
                {filteredRecords.length !== testRecords.length && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Filtered: {filteredRecords.length})
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Re-Upload button - Only shows when there's partial session data */}
                {hasPartialSession && (
                  <Button
                    onClick={() => {
                      // Find the ticket for the partial session
                      const partialTicket = testRecords.find(t => t.ticketCode === partialSessionData.ticketCode);

                      if (partialTicket) {
                        // Clear all existing sessions for this ticket
                        const updatedRecords = testRecords.map(record => {
                          if (record.id === partialTicket.id) {
                            // Calculate remaining quantity from partial data
                            const receivedQuantity = partialSessionData.receivedQuantity || 0;
                            const remainingQuantity = partialSessionData.totalQuantity - receivedQuantity;

                            // Create fresh ticket with partial session data
                            return {
                              ...record,
                              sessions: [], // Clear all sessions
                              totalQuantity: partialSessionData.totalQuantity,
                              project: partialSessionData.project,
                              build: partialSessionData.build,
                              colour: partialSessionData.colour,
                              anoType: partialSessionData.anoType,
                              source: partialSessionData.source,
                              reason: partialSessionData.reason,
                              status: 'In-Progress', // Reset status
                              // Update the ticket code if different
                              ticketCode: partialSessionData.ticketCode || record.ticketCode
                            };
                          }
                          return record;
                        });

                        setTestRecords(updatedRecords);

                        // Set the updated ticket as selected
                        const updatedTicket = updatedRecords.find(t => t.id === partialTicket.id);
                        setSelectedTicket(updatedTicket);

                        // Clear any temp scanned parts
                        setTempScannedParts([]);
                        setBarcodeInput('');

                        // Navigate to scan tab
                        setActiveTab('scan');

                        // Show notification with remaining count
                        const receivedQty = partialSessionData.receivedQuantity || 0;
                        const totalQty = partialSessionData.totalQuantity;
                        const remaining = totalQty - receivedQty;

                        showNotification('info',
                          `Re-uploading partial session. ${receivedQty}/${totalQty} parts already scanned. ` +
                          `Need to scan ${remaining} more parts. All previous sessions cleared.`
                        );

                        // Clear the partial session data from localStorage
                        localStorage.removeItem('partialReceiptInfo');
                      } else {
                        showNotification('error', 'Ticket not found for partial session. Please create a new ticket.');
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Re-Upload: {partialSessionData.ticketCode}
                  </Button>
                )}
                <Badge variant="outline" className="text-sm">
                  Stored in localStorage
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {testRecords.length === 0 ? (
                  "No tickets found. Create a new ticket to get started."
                ) : (
                  <div>
                    <p>No tickets match the current filters.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setProjectFilter('All');
                        setBuildFilter('All');
                        setColourFilter('All');
                        setReasonFilter('All');
                        setSearchTerm('');
                        setDateFilter('');
                      }}
                      className="mt-2"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRecords.map(ticket => {
                  const totalScanned = ticket.sessions.reduce((sum, session) => sum + session.parts.length, 0);
                  const okCount = ticket.sessions.reduce((sum, session) =>
                    sum + session.parts.filter(p => p.scanStatus === 'Cosmetic OK').length, 0);
                  const cosmeticCount = ticket.sessions.reduce((sum, session) =>
                    sum + session.parts.filter(p => p.scanStatus === 'Cosmetic Not OK').length, 0);
                  // const notOkCount = ticket.sessions.reduce((sum, session) =>
                  //   sum + session.parts.filter(p => p.scanStatus === 'Not OK').length, 0);
                  const isExpanded = expandedTickets[ticket.ticketCode];
                  const hasUnsubmittedSessions = ticket.sessions.some(session => !session.submitted);
                  const allSessionsSubmitted = ticket.sessions.length > 0 && ticket.sessions.every(session => session.submitted);

                  // Check if this ticket has a partial session
                  const isPartialTicket = hasPartialSession && partialSessionData.ticketCode === ticket.ticketCode;

                  return (
                    <Card key={ticket.id} className={`border-2 ${isPartialTicket ? 'border-gray-300' : ''}`}>
                      <CardContent className="p-0">
                        {/* Main Ticket Row */}
                        <div className={`p-4 ${isPartialTicket ? 'bg-white' : 'bg-gray-50'} border-b-2`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTicketExpand(ticket.ticketCode)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </Button>
                              <div>
                                <div className="font-bold text-lg flex items-center gap-2">
                                  <Ticket className={`h-5 w-5 ${isPartialTicket ? 'text-orange-600' : 'text-blue-600'}`} />
                                  {ticket.ticketCode}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {ticket.project} • {ticket.build} • {ticket.colour} • {ticket.anoType} • {ticket.source}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(ticket.createdAt).toLocaleString()}
                                  {ticket.oqcApproved && ticket.oqcApprovedBy && (
                                    <span className="ml-4 text-green-600 font-medium">
                                      ✓ OQC Approved by {ticket.oqcApprovedBy}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-xs text-gray-500">Total Qty</div>
                                <div className="font-bold text-lg">{ticket.totalQuantity}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500">Scanned</div>
                                <div className="font-bold text-lg text-green-600">{totalScanned}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500">Remaining</div>
                                <div className={`font-bold text-lg ${totalScanned >= ticket.totalQuantity ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                  {Math.max(0, ticket.totalQuantity - totalScanned)}
                                </div>
                              </div>

                              {/* <Badge className={
                                ticket.status === 'OQC Approved'
                                  ? 'bg-purple-600 text-white'
                                  : ticket.status === 'Ready for OQC Approval'
                                    ? 'bg-yellow-600 text-white'
                                    : ticket.status === 'Scanning Complete'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-600 text-white'
                              }>
                                {ticket.status}
                              </Badge> */}

                              {showOQCApproval === ticket.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Your name"
                                    value={oqcApprover}
                                    onChange={(e) => setOqcApprover(e.target.value)}
                                    className="h-8 w-32"
                                  />
                                  <Button
                                    onClick={() => handleOQCApproval(ticket.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowOQCApproval(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {ticket.status !== 'OQC Approved' && (
                                    <Button
                                      onClick={() => handleStartScanning(ticket)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Scan className="mr-2 h-4 w-4" />
                                      Scan Parts
                                    </Button>
                                  )}

                                  {/* {hasUnsubmittedSessions && (
                                    <Button
                                      onClick={() => handleSubmitAllSessions(ticket.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Submit All
                                    </Button>
                                  )} */}

                                  {/* {!ticket.oqcApproved && allSessionsSubmitted && ticket.status === 'Ready for OQC Approval' && (
                                    <Button
                                      onClick={() => setShowOQCApproval(ticket.id)}
                                      variant="outline"
                                      className="border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                      OQC Approve
                                    </Button>
                                  )} */}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Summary */}
                          {(okCount > 0 || cosmeticCount > 0) && (
                            <div className="flex gap-2 mt-3">
                              {okCount > 0 && (
                                <Badge className="bg-green-100 text-green-800 border border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Cosmetic OK: {okCount}
                                </Badge>
                              )}
                              {cosmeticCount > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Cosmetic Not Ok: {cosmeticCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expanded Content - Sessions */}
                        {isExpanded && (
                          <div className="p-4">
                            {ticket.sessions.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 text-sm">
                                No scanning sessions yet. Click "Scan Parts" to start scanning.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {ticket.sessions.map((session, sessionIdx) => {
                                  const isSessionExpanded = expandedSessions[session.id];
                                  const sessionOk = session.parts.filter(p => p.scanStatus === 'Cosmetic OK').length;
                                  const sessionCosmetic = session.parts.filter(p => p.scanStatus === 'Cosmetic Not OK').length;
                                  // const sessionNotOk = session.parts.filter(p => p.scanStatus === 'Not OK').length;

                                  return (
                                    <div key={session.id} className="border rounded-lg">
                                      {/* Session Header */}
                                      <div className="p-3 bg-blue-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSessionExpand(session.id)}
                                            className="h-6 w-6 p-0"
                                          >
                                            {isSessionExpanded ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                          </Button>
                                          <div>
                                            <div className="font-semibold text-sm">
                                              Session {session.sessionNumber}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              Saved: {new Date(session.timestamp).toLocaleString()}
                                              {session.submittedAt && (
                                                <span className="ml-4 text-green-600 font-medium">
                                                  ✓ Submitted: {new Date(session.submittedAt).toLocaleString()}
                                                </span>
                                              )}
                                              {session.sentToORT && session.sentToORTAt && (
                                                <span className="ml-4 text-purple-600 font-medium">
                                                  ✓ Sent to ORT Lab
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <Badge variant="outline" className="text-xs">
                                            {session.parts.length} parts
                                          </Badge>
                                          <div className="flex gap-1">
                                            {sessionOk > 0 && (
                                              <Badge className="bg-green-100 text-green-800 text-xs">
                                                OK: {sessionOk}
                                              </Badge>
                                            )}
                                            {sessionCosmetic > 0 && (
                                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                Cosmetic: {sessionCosmetic}
                                              </Badge>
                                            )}
                                            {/* {sessionNotOk > 0 && (
                                              <Badge className="bg-red-100 text-red-800 text-xs">
                                                Not OK: {sessionNotOk}
                                              </Badge>
                                            )} */}
                                          </div>

                                          <div className="flex gap-2">
                                            {!session.submitted ? (
                                              <Button
                                                size="sm"
                                                onClick={() => handleSubmitSession(ticket.id, session.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                <Check className="mr-2 h-3 w-3" />
                                                Submit Session
                                              </Button>
                                            ) : (
                                              <Badge className="bg-green-600 text-white text-xs">
                                                Submitted
                                              </Badge>
                                            )}

                                            {/* Submit to ORT Lab Button */}
                                            {!session.sentToORT && ticket.oqcApproved && session.submitted && (
                                              <Button
                                                onClick={() => handleSubmitToORTLab(ticket.id, session.id, ticket.ticketCode)}
                                                size="sm"
                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                              >
                                                <Send className="mr-2 h-3 w-3" />
                                                Send to ORT Lab
                                              </Button>
                                            )}
                                            {session.sentToORT && (
                                              <Badge className="bg-purple-600 text-white text-xs">
                                                Sent to ORT
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Session Parts Table */}
                                      {isSessionExpanded && (
                                        <div className="p-3">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="w-16">#</TableHead>
                                                <TableHead>Part Number</TableHead>
                                                <TableHead>Serial Number</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Scanned At</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {session.parts.map((part, partIdx) => (
                                                <TableRow key={part.id}>
                                                  <TableCell className="font-medium">
                                                    {partIdx + 1}
                                                  </TableCell>
                                                  <TableCell>
                                                    <span className="font-mono text-sm">
                                                      {part.partNumber}
                                                    </span>
                                                  </TableCell>
                                                  <TableCell>
                                                    <span className="font-mono text-sm">
                                                      {part.serialNumber}
                                                    </span>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge className={getStatusColor(part.scanStatus)}>
                                                      {getStatusIcon(part.scanStatus)}
                                                      <span className="ml-1">{part.scanStatus}</span>
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                    {editingLocation === part.id ? (
                                                      <div className="flex items-center gap-1">
                                                        <Input
                                                          value={editLocationValue}
                                                          onChange={(e) => setEditLocationValue(e.target.value)}
                                                          className="h-7 w-24 text-sm"
                                                          autoFocus
                                                        />
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={() => {
                                                            handleUpdateLocation(ticket.id, session.id, part.id, editLocationValue);
                                                          }}
                                                          className="h-7 w-7 p-0"
                                                        >
                                                          <Save className="h-3 w-3 text-green-600" />
                                                        </Button>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={() => {
                                                            setEditingLocation(null);
                                                            setEditLocationValue('');
                                                          }}
                                                          className="h-7 w-7 p-0"
                                                        >
                                                          <X className="h-3 w-3 text-red-600" />
                                                        </Button>
                                                      </div>
                                                    ) : (
                                                      <div
                                                        className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                                        onClick={() => {
                                                          setEditingLocation(part.id);
                                                          setEditLocationValue(part.location);
                                                        }}
                                                      >
                                                        <span className="text-sm font-medium">{part.location}</span>
                                                        <Edit2 className="h-3 w-3 text-gray-400" />
                                                      </div>
                                                    )}
                                                  </TableCell>
                                                  <TableCell className="text-sm text-gray-600">
                                                    {new Date(part.scannedAt).toLocaleString()}
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white animate-in fade-in slide-in-from-top-5`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-6 font-medium border-b-2 transition-colors ${activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Create Ticket
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className={`py-4 px-6 font-medium border-b-2 transition-colors ${activeTab === 'scan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              disabled={!selectedTicket}
            >
              Scan Parts {selectedTicket && `(${selectedTicket.ticketCode})`}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-6 font-medium border-b-2 transition-colors ${activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              All Tickets ({testRecords.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'scan' && renderScanTab()}
        {activeTab === 'tickets' && renderTicketsTab()}
      </div>
    </div>
  );
};

export default OQCSystem;
