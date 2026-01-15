import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, User, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.getAll({
        search: search || undefined,
        page,
        page_size: 15,
      });
      setClients(response.data.clients);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
    } catch (err) {
      toast.error('Failed to load clients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (clientId) => {
    try {
      await clientsApi.delete(clientId);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      toast.error('Failed to delete client');
      console.error(err);
    }
  };

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]" data-testid="clients-page-title">
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">
            {total} {total === 1 ? 'client' : 'clients'} total
          </p>
        </div>
        <Link to="/clients/new">
          <Button className="btn-press" data-testid="add-client-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="card-shadow mb-6">
        <CardContent className="py-4">
          <div className="relative" data-testid="client-filters">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={handleSearch}
              className="pl-10 pr-10"
              data-testid="client-search-input"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="clear-search-button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="card-shadow">
        {loading ? (
          <CardContent className="py-6">
            <ClientsTableSkeleton />
          </CardContent>
        ) : clients.length === 0 ? (
          <CardContent className="py-12">
            <div className="empty-state" data-testid="clients-empty-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {search ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {search
                  ? 'Try adjusting your search term'
                  : 'Add your first client to start tracking their visits'
                }
              </p>
              {!search && (
                <Link to="/clients/new">
                  <Button data-testid="empty-add-client-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Client
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table data-testid="clients-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="table-row-hover cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                      data-testid={`client-row-${client.id}`}
                    >
                      <TableCell className="font-medium">
                        {client.first_name} {client.last_name}
                      </TableCell>
                      <TableCell>
                        {dayjs(client.dob).format('MMM D, YYYY')}
                      </TableCell>
                      <TableCell>
                        {calculateAge(client.dob)} years
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link to={`/clients/${client.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`edit-client-${client.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteClientDialog
                            clientName={`${client.first_name} ${client.last_name}`}
                            onConfirm={() => handleDelete(client.id)}
                            clientId={client.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                  data-testid={`client-card-${client.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {client.first_name} {client.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {dayjs(client.dob).format('MMM D, YYYY')} ({calculateAge(client.dob)} years)
                      </p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/clients/${client.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteClientDialog
                        clientName={`${client.first_name} ${client.last_name}`}
                        onConfirm={() => handleDelete(client.id)}
                        clientId={client.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    data-testid="prev-page-button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    data-testid="next-page-button"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function DeleteClientDialog({ clientName, onConfirm, clientId }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid={`delete-client-${clientId}`}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete client?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{clientName}</strong> and all their visit records. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-client-cancel-button">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="delete-client-confirm-button"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ClientsTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
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
