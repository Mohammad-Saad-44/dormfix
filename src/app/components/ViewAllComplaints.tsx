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
  Edit,
  Trash2,
} from 'lucide-react';
import { Complaint } from '../contexts/ComplaintsContext';

interface ViewAllComplaintsProps {
  complaints: Complaint[];
  onBack: () => void;
  onViewDetails: (complaint: Complaint) => void;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
}

export function ViewAllComplaints({ complaints, onBack, onViewDetails, onEdit, onDelete }: ViewAllComplaintsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Safety check for undefined complaints
  const safeComplaints = complaints || [];

  const filteredComplaints = safeComplaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || complaint.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesUrgency;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
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
      case 'Pending':
        return 'bg-amber-500 text-white border-transparent font-semibold';
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="glass-header sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="glass-button mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              All Complaints
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and filter all maintenance complaints
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <Card className="glass-card">
          <CardHeader className="glass-table-header py-5">
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100 mb-4">
              Filter Complaints
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by ID or category..."
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
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Assigned', label: 'Assigned' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Resolved', label: 'Resolved' },
                ]}
                placeholder="All Statuses"
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
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-mono font-semibold text-blue-700 dark:text-blue-400">{complaint.id}</TableCell>
                      <TableCell className="font-medium">{complaint.category}</TableCell>
                      <TableCell>{complaint.roomNumber}</TableCell>
                      <TableCell>
                        <Badge className={getUrgencyBadge(complaint.urgency)}>
                          {complaint.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(complaint.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {complaint.status === 'Pending' && onEdit && onDelete && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(complaint)}
                                className="glass-button"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(complaint)}
                                className="dark:bg-red-700 dark:hover:bg-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onViewDetails(complaint)}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="lg:hidden max-h-[600px] overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className="glass-card backdrop-blur border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400">{complaint.id}</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{complaint.category}</p>
                        </div>
                        <Badge className={getStatusBadge(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{complaint.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Urgency</p>
                          <Badge className={getUrgencyBadge(complaint.urgency)}>
                            {complaint.urgency}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                          <p className="text-gray-700 dark:text-gray-300">{formatDate(complaint.date)}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        {complaint.status === 'Pending' && onEdit && onDelete && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(complaint)}
                              className="glass-button flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(complaint)}
                              className="dark:bg-red-700 dark:hover:bg-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onViewDetails(complaint)}
                          className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-sm ${complaint.status === 'Pending' && onEdit && onDelete ? '' : 'w-full'}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
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
                  {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of{' '}
                  {filteredComplaints.length} complaints
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
    </div>
  );
}
