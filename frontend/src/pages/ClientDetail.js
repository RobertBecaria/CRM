import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsApi, visitsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Calendar, Edit, Trash2, Plus, User, FileText, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);

  useEffect(() => {
    fetchClient();
  }, [id]);

  useEffect(() => {
    if (client) {
      fetchVisits();
    }
  }, [client, page, dateFrom, dateTo, topicFilter]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getOne(id);
      setClient(response.data);
    } catch (err) {
      toast.error('Failed to load client');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    try {
      setVisitsLoading(true);
      const response = await visitsApi.getByClient(id, {
        page,
        page_size: 20,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        topic: topicFilter || undefined,
      });
      setVisits(response.data.visits);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error('Failed to load visits');
    } finally {
      setVisitsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      await clientsApi.delete(id);
      toast.success('Client deleted successfully');
      navigate('/clients');
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const handleDeleteVisit = async (visitId) => {
    try {
      await visitsApi.delete(visitId);
      toast.success('Visit deleted');
      fetchVisits();
      fetchClient();
    } catch (err) {
      toast.error('Failed to delete visit');
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTopicFilter('');
    setPage(1);
  };

  const hasFilters = dateFrom || dateTo || topicFilter;

  if (loading) {
    return <ClientDetailSkeleton />;
  }

  return (
    <div className="container-responsive py-8">
      {/* Back button */}
      <Link to="/clients" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Clients
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Client Info Card */}
        <Card className="lg:col-span-4 card-shadow h-fit">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex gap-2">
                <Link to={`/clients/${id}/edit`}>
                  <Button variant="ghost" size="sm" data-testid="edit-client-button">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid="delete-client-button">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete client?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>{client?.first_name} {client?.last_name}</strong> and all their visit records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteClient}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="delete-client-confirm-button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardTitle className="text-2xl mt-4" data-testid="client-name">
              {client?.first_name} {client?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium" data-testid="client-dob">
                {dayjs(client?.dob).format('MMMM D, YYYY')}
              </p>
              <p className="text-sm text-muted-foreground">
                {calculateAge(client?.dob)} years old
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]" data-testid="client-visit-count">
                {client?.visit_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client Since</p>
              <p className="font-medium">
                {dayjs(client?.created_at).format('MMMM D, YYYY')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visits Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visits Header & Filters */}
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Visit History</CardTitle>
                  <CardDescription>Record and view all visits</CardDescription>
                </div>
                <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-press" onClick={() => setEditingVisit(null)} data-testid="add-visit-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Visit
                    </Button>
                  </DialogTrigger>
                  <VisitFormDialog
                    clientId={id}
                    visit={editingVisit}
                    onClose={() => { setVisitDialogOpen(false); setEditingVisit(null); }}
                    onSuccess={() => { fetchVisits(); fetchClient(); }}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4" data-testid="visit-filters">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    data-testid="date-from-filter"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    data-testid="date-to-filter"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Topic</Label>
                  <Input
                    placeholder="Filter by topic"
                    value={topicFilter}
                    onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
                    data-testid="topic-filter"
                  />
                </div>
                {hasFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters-button">
                      <X className="w-4 h-4 mr-1" /> Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visits List */}
          <Card className="card-shadow">
            <CardContent className="py-4">
              {visitsLoading ? (
                <VisitsListSkeleton />
              ) : visits.length === 0 ? (
                <div className="empty-state py-8" data-testid="visits-empty-state">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">
                    {hasFilters ? 'No matching visits' : 'No visits yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasFilters ? 'Try adjusting your filters' : 'Record the first visit for this client'}
                  </p>
                  {!hasFilters && (
                    <Button onClick={() => setVisitDialogOpen(true)} data-testid="empty-add-visit-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Visit
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y" data-testid="visits-list">
                  {visits.map((visit) => (
                    <div key={visit.id} className="py-4 first:pt-0 last:pb-0" data-testid={`visit-${visit.id}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {dayjs(visit.date).format('MMMM D, YYYY')}
                            </span>
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            {visit.topic}
                          </Badge>
                          {visit.notes && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                              {visit.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingVisit(visit); setVisitDialogOpen(true); }}
                            data-testid={`edit-visit-${visit.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid={`delete-visit-${visit.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete visit?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this visit record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVisit(visit.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VisitFormDialog({ clientId, visit, onClose, onSuccess }) {
  const [date, setDate] = useState(visit?.date || dayjs().format('YYYY-MM-DD'));
  const [topic, setTopic] = useState(visit?.topic || '');
  const [notes, setNotes] = useState(visit?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (visit) {
        await visitsApi.update(visit.id, { date, topic, notes });
        toast.success('Visit updated');
      } else {
        await visitsApi.create(clientId, { date, topic, notes });
        toast.success('Visit added');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(visit ? 'Failed to update visit' : 'Failed to add visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{visit ? 'Edit Visit' : 'Add Visit'}</DialogTitle>
          <DialogDescription>
            {visit ? 'Update the visit details' : 'Record a new visit for this client'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="visit-date">Date</Label>
            <Input
              id="visit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              data-testid="visit-date-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-topic">Topic</Label>
            <Input
              id="visit-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Stress, Sleep, Energy"
              required
              data-testid="visit-topic-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-notes">Notes</Label>
            <Textarea
              id="visit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session notes..."
              rows={4}
              data-testid="visit-notes-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} data-testid="visit-form-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {visit ? 'Update' : 'Add'} Visit
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function ClientDetailSkeleton() {
  return (
    <div className="container-responsive py-8">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4">
          <CardContent className="py-6">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VisitsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

function calculateAge(dob) {
  const birthDate = dayjs(dob);
  const today = dayjs();
  return today.diff(birthDate, 'year');
}
