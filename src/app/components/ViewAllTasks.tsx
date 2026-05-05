import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { CustomSelect } from './CustomSelect';
import {
  ArrowLeft,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { Complaint, useComplaints } from '../contexts/ComplaintsContext';

interface ViewAllTasksProps {
  tasks: Complaint[];
  onBack: () => void;
  onViewDetails: (task: Complaint) => void;
}

export function ViewAllTasks({ tasks, onBack, onViewDetails }: ViewAllTasksProps) {
  const { updateComplaint } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const itemsPerPage = 10;

  // Safety check for undefined tasks
  const safeTasks = tasks || [];

  const filteredTasks = safeTasks.filter((task) => {
    const matchesSearch =
      task.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || task.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-600 text-white border-transparent font-bold px-3 py-1.5';
      case 'Medium':
        return 'bg-orange-500 text-white border-transparent font-semibold px-2.5 py-1';
      case 'Low':
        return 'bg-green-600 text-white border-transparent px-2 py-0.5';
      default:
        return 'bg-slate-500 text-white border-transparent';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-500 text-white border-transparent font-semibold';
      case 'In Progress':
        return 'bg-blue-500 text-white border-transparent font-semibold shadow-sm';
      case 'Resolved':
        return 'bg-emerald-500 text-white border-transparent font-semibold shadow-sm';
      default:
        return 'bg-slate-500 text-white border-transparent';
    }
  };

  const handleResolveClick = (task: Complaint) => {
    setSelectedTask(task);
    setShowResolveDialog(true);
  };

  const handleResolveTask = () => {
    if (!selectedTask) return;
    updateComplaint(selectedTask.id, {
      status: 'Resolved',
      resolvedOn: new Date().toISOString().split('T')[0],
    });
    toast.success(`Task ${selectedTask?.id} marked as resolved`);
    setShowResolveDialog(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="glass-header sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="glass-button mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage all assigned tasks
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <Card className="glass-card">
          <CardHeader className="glass-table-header py-5">
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100 mb-4">
              Filter Tasks
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by ID, student, or room..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="glass-input pl-9"
                />
              </div>
              <CustomSelect
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Plumbing', label: 'Plumbing' },
                  { value: 'Electrical', label: 'Electrical' },
                  { value: 'Internet', label: 'Internet' },
                  { value: 'AC/Fan', label: 'AC/Fan' },
                  { value: 'Other', label: 'Other' },
                ]}
                placeholder="All Categories"
                className="glass-input"
              />
              <CustomSelect
                value={urgencyFilter}
                onValueChange={(value) => {
                  setUrgencyFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Urgencies' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
                placeholder="All Urgencies"
                className="glass-input"
              />
              <CustomSelect
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Assigned', label: 'Assigned' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Resolved', label: 'Resolved' },
                ]}
                placeholder="All Statuses"
                className="glass-input"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono font-semibold text-blue-700 dark:text-blue-400">{task.id}</TableCell>
                      <TableCell className="font-medium">{task.category}</TableCell>
                      <TableCell>{task.roomNumber}</TableCell>
                      <TableCell>{task.studentName}</TableCell>
                      <TableCell>
                        <Badge className={getUrgencyBadge(task.urgency)}>
                          {task.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onViewDetails(task)}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {task.status === 'In Progress' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleResolveClick(task)}
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="lg:hidden max-h-[600px] overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="glass-card backdrop-blur border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400">{task.id}</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{task.category}</p>
                        </div>
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{task.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Room</p>
                          <p className="text-gray-900 dark:text-gray-100">{task.roomNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                          <p className="text-gray-900 dark:text-gray-100">{task.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Urgency</p>
                          <Badge className={getUrgencyBadge(task.urgency)}>
                            {task.urgency}
                          </Badge>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewDetails(task)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {task.status === 'In Progress' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolveClick(task)}
                            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white shadow-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of{' '}
                  {filteredTasks.length} tasks
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="glass-button"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'glass-button'
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="glass-button"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolve Task Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="glass-dialog">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Mark as Resolved</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Confirm that task {selectedTask?.id} has been successfully resolved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDialog(false);
                setSelectedTask(null);
              }}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button onClick={handleResolveTask} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
