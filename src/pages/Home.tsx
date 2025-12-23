// import React, { useState, useEffect } from 'react';
// import { 
//   Home as HomeIcon,
//   Package, 
//   Clock, 
//   CheckCircle, 
//   BarChart3,
//   Search,
//   Calendar,
//   HardDrive,
//   FileText,
//   Zap,
//   X,
//   ChevronRight,
//   User,
//   Hash,
//   Layers,
//   Target
// } from 'lucide-react';

// // Type definitions (same as before)
// interface TestPart {
//   partNumber: string;
//   serialNumber: string;
//   ticketCode: string;
//   testId: string;
//   testName: string;
//   loadedAt: string;
//   scanStatus: string;
//   duration: string;
// }

// interface MachineTest {
//   id: string;
//   testName: string;
//   duration: string;
//   status: number;
//   statusText: string;
//   requiredQty: number;
//   allocatedParts: number;
//   remainingQty: number;
//   alreadyAllocated: number;
// }

// interface MachineDetails {
//   machine: string;
//   ticketCode: string;
//   project: string;
//   build: string;
//   colour: string;
//   totalTests: number;
//   tests: MachineTest[];
//   estimatedDuration: number;
// }

// interface Stage2Record {
//   loadId: number;
//   chamber: string;
//   parts: TestPart[];
//   totalParts: number;
//   machineDetails: MachineDetails;
//   loadedAt: string;
//   estimatedCompletion: string;
//   duration: number;
//   testRecords: TestPart[];
//   status: string;
//   completedAt?: string;
// }

// interface Stats {
//   totalTests: number;
//   inProgress: number;
//   completed: number;
//   totalParts: number;
//   activeMachines: number;
//   completedToday: number;
// }

// interface TicketGroup {
//   ticketCode: string;
//   project: string;
//   build: string;
//   colour: string;
//   totalLoads: number;
//   totalParts: number;
//   inProgress: number;
//   completed: number;
//   machines: Set<string>;
//   loads: Stage2Record[];
// }

// type FilterStatus = 'all' | 'in-progress' | 'completed';
// type TicketStatus = 'in-progress' | 'completed' | 'mixed' | 'unknown';

// const HomeDashboard: React.FC = () => {
//   const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
//   const [selectedTicket, setSelectedTicket] = useState<TicketGroup | null>(null);
//   const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
//   const [stats, setStats] = useState<Stats>({
//     totalTests: 0,
//     inProgress: 0,
//     completed: 0,
//     totalParts: 0,
//     activeMachines: 0,
//     completedToday: 0
//   });

//   useEffect(() => {
//     loadStage2Records();
//   }, []);

//   useEffect(() => {
//     if (stage2Records.length > 0) {
//       calculateStats();
//     }
//   }, [stage2Records]);

//   const loadStage2Records = (): void => {
//     try {
//       const storedRecords = localStorage.getItem('stage2Records');
//       if (storedRecords) {
//         const recordsArray: Stage2Record[] = JSON.parse(storedRecords);
//         setStage2Records(recordsArray || []);
//       } else {
//         setStage2Records([]);
//       }
//     } catch (error) {
//       console.error('Error loading stage2 records:', error);
//       setStage2Records([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (): void => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     const statsData: Stats = {
//       totalTests: stage2Records.length,
//       inProgress: 0,
//       completed: 0,
//       totalParts: 0,
//       activeMachines: 0,
//       completedToday: 0
//     };

//     const activeMachinesSet = new Set<string>();

//     stage2Records.forEach((record: Stage2Record) => {
//       statsData.totalParts += record.parts?.length || 0;
//       activeMachinesSet.add(record.chamber);
      
//       if (record.status === 'Completed') {
//         statsData.completed++;
        
//         if (record.completedAt) {
//           const completedDate = new Date(record.completedAt);
//           const completedDay = new Date(
//             completedDate.getFullYear(), 
//             completedDate.getMonth(), 
//             completedDate.getDate()
//           );
//           if (completedDay.getTime() === today.getTime()) {
//             statsData.completedToday++;
//           }
//         }
//       } else {
//         statsData.inProgress++;
//       }
//     });

//     setStats({
//       ...statsData,
//       activeMachines: activeMachinesSet.size
//     });
//   };

//   const groupByTicket = (): TicketGroup[] => {
//     const grouped: Record<string, TicketGroup> = {};
    
//     stage2Records.forEach((record: Stage2Record) => {
//       const ticketCode = record.machineDetails?.ticketCode || 'Unknown Ticket';
      
//       if (!grouped[ticketCode]) {
//         grouped[ticketCode] = {
//           ticketCode,
//           project: record.machineDetails?.project || 'Unknown',
//           build: record.machineDetails?.build || 'Unknown',
//           colour: record.machineDetails?.colour || 'Unknown',
//           totalLoads: 0,
//           totalParts: 0,
//           inProgress: 0,
//           completed: 0,
//           machines: new Set<string>(),
//           loads: []
//         };
//       }
      
//       grouped[ticketCode].totalLoads++;
//       grouped[ticketCode].totalParts += record.parts?.length || 0;
//       grouped[ticketCode].machines.add(record.chamber);
      
//       if (record.status === 'Completed') {
//         grouped[ticketCode].completed++;
//       } else {
//         grouped[ticketCode].inProgress++;
//       }
      
//       grouped[ticketCode].loads.push(record);
//     });
    
//     return Object.values(grouped);
//   };

//   const getFilteredTickets = (): TicketGroup[] => {
//     const tickets = groupByTicket();
    
//     let filtered = tickets.filter((ticket: TicketGroup) => 
//       ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ticket.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ticket.build.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     if (filterStatus === 'in-progress') {
//       filtered = filtered.filter((ticket: TicketGroup) => ticket.inProgress > 0);
//     } else if (filterStatus === 'completed') {
//       filtered = filtered.filter((ticket: TicketGroup) => ticket.completed > 0 && ticket.inProgress === 0);
//     }
    
//     return filtered;
//   };

//   const getStatusBadge = (status: TicketStatus): JSX.Element => {
//     switch(status) {
//       case 'in-progress':
//         return (
//           <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
//             <Clock size={12} />
//             In Progress
//           </span>
//         );
//       case 'completed':
//         return (
//           <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
//             <CheckCircle size={12} />
//             Completed
//           </span>
//         );
//       case 'mixed':
//         return (
//           <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//             <Clock size={12} />
//             Mixed
//           </span>
//         );
//       default:
//         return (
//           <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
//             <Clock size={12} />
//             Unknown
//           </span>
//         );
//     }
//   };

//   const getTicketStatus = (ticket: TicketGroup): TicketStatus => {
//     if (ticket.inProgress > 0 && ticket.completed > 0) return 'mixed';
//     if (ticket.inProgress > 0) return 'in-progress';
//     if (ticket.completed > 0) return 'completed';
//     return 'unknown';
//   };

//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatTime = (dateString: string): string => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getDurationText = (duration: number): string => {
//     if (duration >= 24) {
//       const days = Math.floor(duration / 24);
//       const hours = duration % 24;
//       return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
//     }
//     return `${duration}h`;
//   };

//   const handleTicketClick = (ticket: TicketGroup) => {
//     setSelectedTicket(ticket);
//     setShowTicketModal(true);
//   };

//   const closeTicketModal = () => {
//     setShowTicketModal(false);
//     setSelectedTicket(null);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//       </div>
//     );
//   }

//   const filteredTickets = getFilteredTickets();

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <HomeIcon className="text-blue-600" size={32} />
//             <h1 className="text-lg font-bold text-gray-900">Testing Dashboard</h1>
//           </div>
//           <p className="text-gray-600">Overview of all testing activities across machines and tickets</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">Total Tests</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTests}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <BarChart3 className="text-blue-600" size={24} />
//               </div>
//             </div>
//             <div className="mt-4 text-sm text-gray-500">
//               {stats.totalParts} total parts
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">In Progress</p>
//                 <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-lg">
//                 <Clock className="text-yellow-600" size={24} />
//               </div>
//             </div>
//             <div className="mt-4 text-sm text-gray-500">
//               Across {stats.activeMachines} machines
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">Completed</p>
//                 <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <CheckCircle className="text-green-600" size={24} />
//               </div>
//             </div>
//             <div className="mt-4 text-sm text-gray-500">
//               {stats.completedToday} completed today
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500 font-medium">Active Machines</p>
//                 <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeMachines}</p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <HardDrive className="text-purple-600" size={24} />
//               </div>
//             </div>
//             <div className="mt-4 text-sm text-gray-500">
//               Currently running tests
//             </div>
//           </div>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white rounded-xl shadow p-4 mb-6">
//           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//             <div className="flex-1 w-full md:w-auto">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search tickets, projects, builds..."
//                   value={searchTerm}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setFilterStatus('all')}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//               >
//                 All ({stage2Records.length})
//               </button>
//               <button
//                 onClick={() => setFilterStatus('in-progress')}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'in-progress' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//               >
//                 In Progress ({stats.inProgress})
//               </button>
//               <button
//                 onClick={() => setFilterStatus('completed')}
//                 className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//               >
//                 Completed ({stats.completed})
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Tickets List */}
//         <div className="bg-white rounded-xl shadow overflow-hidden">
//           <div className="px-6 py-4 border-b">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-gray-900">Tickets Overview</h2>
//               <span className="text-sm text-gray-500">
//                 {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
//               </span>
//             </div>
//           </div>

//           {filteredTickets.length === 0 ? (
//             <div className="text-center py-12">
//               <Package className="mx-auto text-gray-400" size={48} />
//               <p className="mt-4 text-gray-500">No tickets found</p>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {filteredTickets.map((ticket: TicketGroup, index: number) => (
//                 <div 
//                   key={index} 
//                   className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
//                   onClick={() => handleTicketClick(ticket)}
//                 >
//                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="flex items-center gap-2">
//                           <FileText className="text-blue-500" size={20} />
//                           <h3 className="font-bold text-lg text-gray-900">{ticket.ticketCode}</h3>
//                           <ChevronRight className="text-gray-400" size={16} />
//                         </div>
//                         {getStatusBadge(getTicketStatus(ticket))}
//                       </div>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                         <div>
//                           <p className="text-xs text-gray-500">Project</p>
//                           <p className="font-medium text-gray-900">{ticket.project}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Build</p>
//                           <p className="font-medium text-gray-900">{ticket.build}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Colour</p>
//                           <p className="font-medium text-gray-900">{ticket.colour}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500">Machines</p>
//                           <p className="font-medium text-gray-900">{Array.from(ticket.machines).join(', ')}</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex flex-wrap gap-4">
//                         <div className="flex items-center gap-2 text-sm">
//                           <Package size={16} className="text-gray-400" />
//                           <span className="text-gray-600">{ticket.totalParts} parts</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <Zap size={16} className="text-yellow-400" />
//                           <span className="text-gray-600">{ticket.totalLoads} test loads</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <Clock size={16} className="text-blue-400" />
//                           <span className="text-gray-600">{ticket.inProgress} in progress</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <CheckCircle size={16} className="text-green-400" />
//                           <span className="text-gray-600">{ticket.completed} completed</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="lg:text-right">
//                       <div className="text-sm text-gray-500 mb-2">Last Activity</div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {ticket.loads.length > 0 ? formatDate(ticket.loads[ticket.loads.length - 1].loadedAt) : 'No activity'}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Preview of first load */}
//                   {ticket.loads.length > 0 && (
//                     <div className="mt-4 pt-4 border-t">
//                       <div className="text-sm text-gray-600">
//                         <span className="font-medium">Latest test:</span> {ticket.loads[0].chamber} - {ticket.loads[0].parts.length} part(s)
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Legend */}
//         <div className="mt-6 p-4 bg-white rounded-xl shadow">
//           <h4 className="font-medium text-gray-900 mb-3">Status Legend</h4>
//           <div className="flex flex-wrap gap-4">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//               <span className="text-sm text-gray-600">In Progress - Test currently running</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 rounded-full bg-green-500"></div>
//               <span className="text-sm text-gray-600">Completed - Test finished successfully</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Ticket Details Modal */}
//       {showTicketModal && selectedTicket && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <FileText className="text-blue-600" size={24} />
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">{selectedTicket.ticketCode}</h2>
//                   <p className="text-sm text-gray-600">
//                     {selectedTicket.project} • {selectedTicket.build} • {selectedTicket.colour}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={closeTicketModal}
//                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X size={24} className="text-gray-500" />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
//               <div className="p-6">
//                 {/* Ticket Summary */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                   <div className="bg-blue-50 p-4 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Package className="text-blue-600" size={20} />
//                       <h3 className="font-semibold text-blue-800">Total Parts</h3>
//                     </div>
//                     <p className="text-2xl font-bold text-blue-900">{selectedTicket.totalParts}</p>
//                     <p className="text-sm text-blue-700 mt-1">Across {selectedTicket.totalLoads} test loads</p>
//                   </div>

//                   <div className="bg-yellow-50 p-4 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Clock className="text-yellow-600" size={20} />
//                       <h3 className="font-semibold text-yellow-800">In Progress</h3>
//                     </div>
//                     <p className="text-2xl font-bold text-yellow-900">{selectedTicket.inProgress}</p>
//                     <p className="text-sm text-yellow-700 mt-1">Active test loads</p>
//                   </div>

//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <CheckCircle className="text-green-600" size={20} />
//                       <h3 className="font-semibold text-green-800">Completed</h3>
//                     </div>
//                     <p className="text-2xl font-bold text-green-900">{selectedTicket.completed}</p>
//                     <p className="text-sm text-green-700 mt-1">Finished test loads</p>
//                   </div>

//                   <div className="bg-purple-50 p-4 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <HardDrive className="text-purple-600" size={20} />
//                       <h3 className="font-semibold text-purple-800">Machines Used</h3>
//                     </div>
//                     <p className="text-2xl font-bold text-purple-900">{selectedTicket.machines.size}</p>
//                     <p className="text-sm text-purple-700 mt-1">{Array.from(selectedTicket.machines).join(', ')}</p>
//                   </div>
//                 </div>

//                 {/* Test Loads Details */}
//                 <div className="mb-8">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                     <Zap className="text-yellow-500" size={20} />
//                     Test Loads ({selectedTicket.totalLoads})
//                   </h3>
//                   <div className="space-y-4">
//                     {selectedTicket.loads.map((load: Stage2Record, loadIndex: number) => (
//                       <div key={loadIndex} className="border border-gray-200 rounded-lg overflow-hidden">
//                         <div className={`p-4 ${load.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'}`}>
//                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-3 h-3 rounded-full ${load.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
//                               <div>
//                                 <h4 className="font-bold text-gray-900">{load.chamber}</h4>
//                                 <div className="flex items-center gap-2 mt-1">
//                                   <span className={`px-2 py-1 rounded text-xs font-medium ${load.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                                     {load.status}
//                                   </span>
//                                   <span className="text-sm text-gray-600">
//                                     {load.parts.length} part{load.parts.length !== 1 ? 's' : ''}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="flex flex-wrap gap-4 text-sm">
//                               <div className="flex items-center gap-1">
//                                 <Calendar size={14} className="text-gray-400" />
//                                 <span className="text-gray-700">
//                                   {formatDate(load.loadedAt)} at {formatTime(load.loadedAt)}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Clock size={14} className="text-gray-400" />
//                                 <span className="text-gray-700">{getDurationText(load.duration)}</span>
//                               </div>
//                               {load.completedAt && (
//                                 <div className="flex items-center gap-1">
//                                   <CheckCircle size={14} className="text-green-500" />
//                                   <span className="text-green-700">
//                                     Completed: {formatDate(load.completedAt)}
//                                   </span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Test Details */}
//                         <div className="p-4 bg-white">
//                           <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <Target size={16} className="text-blue-500" />
//                             Test Information
//                           </h5>
//                           {load.machineDetails && (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                               {load.machineDetails.tests.map((test, testIndex) => (
//                                 <div key={testIndex} className="bg-gray-50 p-3 rounded-lg">
//                                   <div className="flex justify-between items-start mb-2">
//                                     <div>
//                                       <h6 className="font-semibold text-gray-900">{test.testName}</h6>
//                                       <p className="text-sm text-gray-600">Duration: {test.duration}h</p>
//                                     </div>
//                                     <span className={`px-2 py-1 rounded text-xs font-medium ${
//                                       test.status === 3 ? 'bg-green-100 text-green-800' :
//                                       test.status === 2 ? 'bg-yellow-100 text-yellow-800' :
//                                       'bg-gray-100 text-gray-800'
//                                     }`}>
//                                       {test.statusText}
//                                     </span>
//                                   </div>
//                                   <div className="grid grid-cols-2 gap-2 text-sm">
//                                     <div>
//                                       <span className="text-gray-500">Required:</span>
//                                       <span className="font-medium ml-1">{test.requiredQty}</span>
//                                     </div>
//                                     <div>
//                                       <span className="text-gray-500">Allocated:</span>
//                                       <span className="font-medium ml-1">{test.alreadyAllocated}/{test.requiredQty}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           )}

//                           {/* Parts List */}
//                           <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                             <Layers size={16} className="text-purple-500" />
//                             Parts ({load.parts.length})
//                           </h5>
//                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                             {load.parts.map((part: TestPart, partIndex: number) => (
//                               <div key={partIndex} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
//                                 <div className="flex items-start justify-between mb-2">
//                                   <div>
//                                     <div className="flex items-center gap-2">
//                                       <Hash size={14} className="text-gray-400" />
//                                       <h6 className="font-semibold text-gray-900">{part.partNumber}</h6>
//                                     </div>
//                                     <div className="flex items-center gap-2 mt-1">
//                                       <User size={14} className="text-gray-400" />
//                                       <span className="text-sm text-gray-600">Serial: {part.serialNumber}</span>
//                                     </div>
//                                   </div>
//                                   <span className={`px-2 py-1 rounded text-xs font-medium ${
//                                     part.scanStatus === 'OK' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                                   }`}>
//                                     {part.scanStatus}
//                                   </span>
//                                 </div>
//                                 <div className="mt-2">
//                                   <p className="text-sm text-gray-700">
//                                     <span className="font-medium">Test:</span> {part.testName}
//                                   </p>
//                                   <p className="text-xs text-gray-500 mt-1">
//                                     Loaded: {formatTime(part.loadedAt)}
//                                   </p>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
//               <button
//                 onClick={closeTicketModal}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomeDashboard;

import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon,
  Package, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Search,
  Calendar,
  HardDrive,
  FileText,
  Zap,
  X,
  Eye,
  ChevronRight,
  Filter,
  Download,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Users,
  Tag,
  Building,
  Layers,
  Target,
  Hash,
  User,
  Copy,
  Check
} from 'lucide-react';

// Type definitions
interface TestPart {
  partNumber: string;
  serialNumber: string;
  ticketCode: string;
  testId: string;
  testName: string;
  loadedAt: string;
  scanStatus: string;
  duration: string;
}

interface MachineTest {
  id: string;
  testName: string;
  duration: string;
  status: number;
  statusText: string;
  requiredQty: number;
  allocatedParts: number;
  remainingQty: number;
  alreadyAllocated: number;
}

interface MachineDetails {
  machine: string;
  ticketCode: string;
  project: string;
  build: string;
  colour: string;
  totalTests: number;
  tests: MachineTest[];
  estimatedDuration: number;
}

interface Stage2Record {
  loadId: number;
  chamber: string;
  parts: TestPart[];
  totalParts: number;
  machineDetails: MachineDetails;
  loadedAt: string;
  estimatedCompletion: string;
  duration: number;
  testRecords: TestPart[];
  status: string;
  completedAt?: string;
}

interface Stats {
  totalTests: number;
  inProgress: number;
  completed: number;
  totalParts: number;
  activeMachines: number;
  completedToday: number;
}

interface TicketGroup {
  ticketCode: string;
  project: string;
  build: string;
  colour: string;
  totalLoads: number;
  totalParts: number;
  inProgress: number;
  completed: number;
  machines: Set<string>;
  loads: Stage2Record[];
}

type FilterStatus = 'all' | 'in-progress' | 'completed';
type TicketStatus = 'in-progress' | 'completed' | 'mixed' | 'unknown';

const HomeDashboard: React.FC = () => {
  const [stage2Records, setStage2Records] = useState<Stage2Record[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketGroup | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [copiedTicketCode, setCopiedTicketCode] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    inProgress: 0,
    completed: 0,
    totalParts: 0,
    activeMachines: 0,
    completedToday: 0
  });

  useEffect(() => {
    loadStage2Records();
  }, []);

  useEffect(() => {
    if (stage2Records.length > 0) {
      calculateStats();
    }
  }, [stage2Records]);

  const loadStage2Records = (): void => {
    try {
      const storedRecords = localStorage.getItem('stage2Records');
      if (storedRecords) {
        const recordsArray: Stage2Record[] = JSON.parse(storedRecords);
        setStage2Records(recordsArray || []);
      } else {
        setStage2Records([]);
      }
    } catch (error) {
      console.error('Error loading stage2 records:', error);
      setStage2Records([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (): void => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const statsData: Stats = {
      totalTests: stage2Records.length,
      inProgress: 0,
      completed: 0,
      totalParts: 0,
      activeMachines: 0,
      completedToday: 0
    };

    const activeMachinesSet = new Set<string>();

    stage2Records.forEach((record: Stage2Record) => {
      statsData.totalParts += record.parts?.length || 0;
      activeMachinesSet.add(record.chamber);
      
      if (record.status === 'Completed') {
        statsData.completed++;
        
        if (record.completedAt) {
          const completedDate = new Date(record.completedAt);
          const completedDay = new Date(
            completedDate.getFullYear(), 
            completedDate.getMonth(), 
            completedDate.getDate()
          );
          if (completedDay.getTime() === today.getTime()) {
            statsData.completedToday++;
          }
        }
      } else {
        statsData.inProgress++;
      }
    });

    setStats({
      ...statsData,
      activeMachines: activeMachinesSet.size
    });
  };

  const groupByTicket = (): TicketGroup[] => {
    const grouped: Record<string, TicketGroup> = {};
    
    stage2Records.forEach((record: Stage2Record) => {
      const ticketCode = record.machineDetails?.ticketCode || 'Unknown Ticket';
      
      if (!grouped[ticketCode]) {
        grouped[ticketCode] = {
          ticketCode,
          project: record.machineDetails?.project || 'Unknown',
          build: record.machineDetails?.build || 'Unknown',
          colour: record.machineDetails?.colour || 'Unknown',
          totalLoads: 0,
          totalParts: 0,
          inProgress: 0,
          completed: 0,
          machines: new Set<string>(),
          loads: []
        };
      }
      
      grouped[ticketCode].totalLoads++;
      grouped[ticketCode].totalParts += record.parts?.length || 0;
      grouped[ticketCode].machines.add(record.chamber);
      
      if (record.status === 'Completed') {
        grouped[ticketCode].completed++;
      } else {
        grouped[ticketCode].inProgress++;
      }
      
      grouped[ticketCode].loads.push(record);
    });
    
    return Object.values(grouped);
  };

  const getFilteredTickets = (): TicketGroup[] => {
    const tickets = groupByTicket();
    
    let filtered = tickets.filter((ticket: TicketGroup) => 
      ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.build.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filterStatus === 'in-progress') {
      filtered = filtered.filter((ticket: TicketGroup) => ticket.inProgress > 0);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((ticket: TicketGroup) => ticket.completed > 0 && ticket.inProgress === 0);
    }
    
    return filtered;
  };

  const getStatusBadge = (status: TicketStatus): JSX.Element => {
    switch(status) {
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Mixed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  const getTicketStatus = (ticket: TicketGroup): TicketStatus => {
    if (ticket.inProgress > 0 && ticket.completed > 0) return 'mixed';
    if (ticket.inProgress > 0) return 'in-progress';
    if (ticket.completed > 0) return 'completed';
    return 'unknown';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDurationText = (duration: number): string => {
    if (duration >= 24) {
      const days = Math.floor(duration / 24);
      const hours = duration % 24;
      return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
    }
    return `${duration}h`;
  };

  const handleViewTicket = (ticket: TicketGroup) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicket(null);
  };

  const copyTicketCode = (ticketCode: string) => {
    navigator.clipboard.writeText(ticketCode);
    setCopiedTicketCode(ticketCode);
    setTimeout(() => setCopiedTicketCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HomeIcon className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Testing Dashboard</h1>
                <p className="text-sm text-gray-600">Monitor all testing activities and ticket progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
              <button 
                onClick={loadStage2Records}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Clock size={16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Tests</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalTests}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-700">
                <Package size={14} className="mr-1" />
                {stats.totalParts} total parts
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-yellow-700">
                <HardDrive size={14} className="mr-1" />
                Across {stats.activeMachines} machines
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Completed</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-700">
                <CheckCircle size={14} className="mr-1" />
                {stats.completedToday} today
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Machines</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{stats.activeMachines}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-700">
                <Zap size={14} className="mr-1" />
                Currently testing
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets, projects, builds..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${filterStatus === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                All ({stage2Records.length})
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${filterStatus === 'in-progress' ? 'bg-yellow-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${filterStatus === 'completed' ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Completed ({stats.completed})
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Ticket Overview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredTickets.length} of {groupByTicket().length} tickets
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={18} />
                <span className="text-sm text-gray-500">Sorted by: Latest</span>
              </div>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search or filter to find what you\'re looking for.' : 'No testing records found. Load some tests to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testing Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket: TicketGroup, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-blue-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-gray-900">{ticket.ticketCode}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyTicketCode(ticket.ticketCode);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy ticket code"
                              >
                                {copiedTicketCode === ticket.ticketCode ? (
                                  <Check size={14} className="text-green-500" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Array.from(ticket.machines).slice(0, 2).join(', ')}
                              {ticket.machines.size > 2 && '...'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Building size={12} className="text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">{ticket.project}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Tag size={12} className="mr-1" />
                            {ticket.build} • {ticket.colour}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(getTicketStatus(ticket))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Test Loads:</span>
                            <span className="font-medium">{ticket.totalLoads}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Parts:</span>
                            <span className="font-medium">{ticket.totalParts}</span>
                          </div>
                          <div className="flex gap-2">
                            <div className={`h-1 flex-1 rounded-full ${ticket.inProgress > 0 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${ticket.completed > 0 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.loads.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar size={12} className="mr-1 text-gray-400" />
                              {formatDate(ticket.loads[ticket.loads.length - 1].loadedAt)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {ticket.loads[ticket.loads.length - 1].parts.length} parts loaded
                            </div>
                          </div>
                        ) : (
                          'No activity'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewTicket(ticket)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye size={14} className="mr-1.5" />
                            View Details
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Status Indicators</h4>
            <span className="text-xs text-gray-500">Click view to see detailed information</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-600">In Progress - Active testing</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Completed - All tests finished</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Mixed - Some active, some completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.ticketCode}</h2>
                    <button
                      onClick={() => copyTicketCode(selectedTicket.ticketCode)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Copy ticket code"
                    >
                      {copiedTicketCode === selectedTicket.ticketCode ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Building size={14} />
                      {selectedTicket.project}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      {selectedTicket.build}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {selectedTicket.colour}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(getTicketStatus(selectedTicket))}
                <button
                  onClick={closeTicketModal}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Package className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Parts</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedTicket.totalParts}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Across all test cycles</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <Zap className="text-yellow-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Test Loads</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedTicket.totalLoads}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Individual testing sessions</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedTicket.completed}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Successfully finished tests</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <HardDrive className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Machines</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedTicket.machines.size}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Used for testing</div>
                  </div>
                </div>

                {/* Test Loads Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Layers className="text-blue-500" size={20} />
                      Test Loads
                    </h3>
                    <span className="text-sm text-gray-500">{selectedTicket.loads.length} total</span>
                  </div>

                  <div className="space-y-4">
                    {selectedTicket.loads.map((load: Stage2Record, loadIndex: number) => (
                      <div key={loadIndex} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                        {/* Load Header */}
                        <div className={`p-4 border-b ${load.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${load.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <Target className={load.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'} size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{load.chamber}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${load.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {load.status}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <Package size={12} className="mr-1" />
                                    {load.parts.length} part{load.parts.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center gap-1 text-gray-700">
                                <Calendar size={14} className="text-gray-400" />
                                {formatDate(load.loadedAt)}
                              </div>
                              <div className="flex items-center gap-1 text-gray-700">
                                <Clock size={14} className="text-gray-400" />
                                {getDurationText(load.duration)}
                              </div>
                              {load.completedAt && (
                                <div className="flex items-center gap-1 text-green-700">
                                  <CheckCircle size={14} />
                                  Completed: {formatTime(load.completedAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Test Information */}
                        <div className="p-4 border-b bg-gray-50">
                          <h5 className="font-medium text-gray-700 mb-3">Test Information</h5>
                          {load.machineDetails?.tests?.map((test, testIndex) => (
                            <div key={testIndex} className="mb-3 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-gray-900">{test.testName}</div>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    test.status === 3 ? 'bg-green-100 text-green-800' :
                                    test.status === 2 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {test.statusText}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">{test.duration}h</div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Required: {test.requiredQty}</span>
                                <span>Allocated: {test.alreadyAllocated}/{test.requiredQty}</span>
                                <span>Remaining: {test.remainingQty}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Parts List */}
                        <div className="p-4">
                          <h5 className="font-medium text-gray-700 mb-3">Parts in this Load</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {load.parts.map((part: TestPart, partIndex: number) => (
                              <div key={partIndex} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Hash size={14} className="text-gray-400" />
                                      <span className="font-semibold text-gray-900">{part.partNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <User size={12} />
                                      Serial: {part.serialNumber}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    part.scanStatus === 'OK' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {part.scanStatus}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <div className="text-gray-700 mb-1">
                                    <span className="font-medium">Test:</span> {part.testName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Loaded at {formatTime(part.loadedAt)} • Duration: {part.duration}h
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t bg-white px-6 py-4 flex justify-end">
              <button
                onClick={closeTicketModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;