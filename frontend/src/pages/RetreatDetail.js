import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { retreatsApi, clientsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Calendar, Edit, Trash2, Plus, Users, Banknote, TrendingDown, TrendingUp, Mountain, Loader2, Receipt, UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
dayjs.locale('ru');

const DEFAULT_RETREAT_PRICE = 30000;

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

// Payment status labels
const PAYMENT_STATUS = {
  paid: { label: 'Оплачено', variant: 'default', icon: Check },
  partial: { label: 'Частично', variant: 'secondary', icon: TrendingDown },
  not_paid: { label: 'Не оплачено', variant: 'outline', icon: X }
};

export default function RetreatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [retreat, setRetreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  const fetchRetreat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await retreatsApi.getOne(id);
      setRetreat(response.data);
    } catch (err) {
      toast.error('Не удалось загрузить ретрит');
      navigate('/retreats');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRetreat();
  }, [fetchRetreat]);

  const handleDeleteRetreat = async () => {
    try {
      await retreatsApi.delete(id);
      toast.success('Ретрит удалён');
      navigate('/retreats');
    } catch (err) {
      toast.error('Не удалось удалить ретрит');
    }
  };

  const handleRemoveParticipant = async (clientId) => {
    try {
      await retreatsApi.removeParticipant(id, clientId);
      toast.success('Участник удалён');
      fetchRetreat();
    } catch (err) {
      toast.error('Не удалось удалить участника');
    }
  };

  const handleRemoveExpense = async (expenseId) => {
    try {
      await retreatsApi.removeExpense(id, expenseId);
      toast.success('Расход удалён');
      fetchRetreat();
    } catch (err) {
      toast.error('Не удалось удалить расход');
    }
  };

  if (loading) {
    return <RetreatDetailSkeleton />;
  }

  const isPast = dayjs(retreat.end_date).isBefore(dayjs(), 'day');
  const isOngoing = dayjs().isBetween(dayjs(retreat.start_date), dayjs(retreat.end_date), 'day', '[]');

  return (
    <div className="container-responsive py-8">
      {/* Back button */}
      <Link to="/retreats" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад к ретритам
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retreat Info Card */}
        <Card className="lg:col-span-4 card-shadow h-fit">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center">
                <Mountain className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid="delete-retreat-button">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить ретрит?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это навсегда удалит <strong>{retreat.name}</strong> и все связанные данные.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteRetreat}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="delete-retreat-confirm"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <CardTitle className="text-2xl" data-testid="retreat-name">
                {retreat.name}
              </CardTitle>
              {isOngoing && <Badge className="bg-green-100 text-green-700">Сейчас</Badge>}
              {isPast && <Badge variant="secondary">Завершён</Badge>}
              {!isPast && !isOngoing && <Badge variant="outline">Предстоит</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Даты проведения
              </p>
              <p className="font-medium" data-testid="retreat-dates">
                {dayjs(retreat.start_date).format('D MMMM')} — {dayjs(retreat.end_date).format('D MMMM YYYY')}
              </p>
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Участники:</span>
                <span className="font-medium">{retreat.total_participants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доход:</span>
                <span className="font-medium text-green-600">{formatCurrency(retreat.total_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Расходы:</span>
                <span className="font-medium text-red-600">{formatCurrency(retreat.total_expenses)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Прибыль:</span>
                <span className={`text-xl font-bold ${retreat.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(retreat.net_profit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Participants Section */}
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Участники
                  </CardTitle>
                  <CardDescription>Клиенты, участвующие в ретрите</CardDescription>
                </div>
                <Dialog open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-press" data-testid="add-participant-button">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить участника
                    </Button>
                  </DialogTrigger>
                  <AddParticipantDialog
                    retreatId={id}
                    existingParticipants={retreat.participants.map(p => p.client_id)}
                    onClose={() => setAddParticipantOpen(false)}
                    onSuccess={fetchRetreat}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {retreat.participants.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Участников пока нет</h3>
                  <p className="text-sm text-muted-foreground mb-4">Добавьте клиентов для участия в ретрите</p>
                </div>
              ) : (
                <div className="divide-y" data-testid="participants-list">
                  {retreat.participants.map((participant) => {
                    const status = PAYMENT_STATUS[participant.payment_status] || PAYMENT_STATUS.not_paid;
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={participant.client_id} className="py-4 first:pt-0 last:pb-0" data-testid={`participant-${participant.client_id}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <Link 
                              to={`/clients/${participant.client_id}`}
                              className="font-medium text-[hsl(var(--primary))] hover:underline"
                            >
                              {participant.client_name}
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-medium">{formatCurrency(participant.payment)}</span>
                              <Badge variant={status.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Dialog open={editingParticipant === participant.client_id} onOpenChange={(open) => setEditingParticipant(open ? participant.client_id : null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`edit-participant-${participant.client_id}`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <EditParticipantDialog
                                retreatId={id}
                                participant={participant}
                                onClose={() => setEditingParticipant(null)}
                                onSuccess={fetchRetreat}
                              />
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid={`remove-participant-${participant.client_id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {participant.client_name} будет удалён из списка участников ретрита.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveParticipant(participant.client_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Расходы
                  </CardTitle>
                  <CardDescription>Затраты на проведение ретрита</CardDescription>
                </div>
                <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="add-expense-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить расход
                    </Button>
                  </DialogTrigger>
                  <AddExpenseDialog
                    retreatId={id}
                    onClose={() => setAddExpenseOpen(false)}
                    onSuccess={fetchRetreat}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {retreat.expenses.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Receipt className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Расходов пока нет</h3>
                  <p className="text-sm text-muted-foreground">Добавьте расходы для учёта затрат</p>
                </div>
              ) : (
                <div className="divide-y" data-testid="expenses-list">
                  {retreat.expenses.map((expense) => (
                    <div key={expense.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between" data-testid={`expense-${expense.id}`}>
                      <div>
                        <p className="font-medium">{expense.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600">{formatCurrency(expense.amount)}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить расход?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Расход "{expense.name}" будет удалён.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveExpense(expense.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-between font-medium">
                    <span>Итого расходов:</span>
                    <span className="text-red-600">{formatCurrency(retreat.total_expenses)}</span>
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

function AddParticipantDialog({ retreatId, existingParticipants, onClose, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [payment, setPayment] = useState(DEFAULT_RETREAT_PRICE);
  const [paymentStatus, setPaymentStatus] = useState('not_paid');
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientsApi.getAll({ page_size: 1000 });
        // Filter out already added participants
        const availableClients = response.data.clients.filter(
          c => !existingParticipants.includes(c.id)
        );
        setClients(availableClients);
      } catch (err) {
        toast.error('Не удалось загрузить клиентов');
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [existingParticipants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error('Выберите клиента');
      return;
    }
    
    setLoading(true);
    try {
      await retreatsApi.addParticipant(retreatId, {
        client_id: selectedClient,
        payment: parseInt(payment) || DEFAULT_RETREAT_PRICE,
        payment_status: paymentStatus
      });
      toast.success('Участник добавлен');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Не удалось добавить участника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Добавить участника</DialogTitle>
          <DialogDescription>
            Выберите клиента и укажите сумму оплаты
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Клиент</Label>
            {loadingClients ? (
              <Skeleton className="h-10 w-full" />
            ) : clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Все клиенты уже добавлены или нет доступных клиентов</p>
            ) : (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger data-testid="select-client">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.last_name} {client.first_name} {client.middle_name || ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment">Оплата (₽)</Label>
              <Input
                id="payment"
                type="number"
                min="0"
                step="1000"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                data-testid="participant-payment-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Статус оплаты</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger data-testid="select-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Оплачено</SelectItem>
                  <SelectItem value="partial">Частично</SelectItem>
                  <SelectItem value="not_paid">Не оплачено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading || !selectedClient} data-testid="add-participant-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Добавить
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditParticipantDialog({ retreatId, participant, onClose, onSuccess }) {
  const [payment, setPayment] = useState(participant.payment);
  const [paymentStatus, setPaymentStatus] = useState(participant.payment_status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await retreatsApi.updateParticipant(retreatId, participant.client_id, {
        client_id: participant.client_id,
        payment: parseInt(payment) || 0,
        payment_status: paymentStatus
      });
      toast.success('Данные обновлены');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Не удалось обновить данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Редактировать оплату</DialogTitle>
          <DialogDescription>
            {participant.client_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-payment">Оплата (₽)</Label>
              <Input
                id="edit-payment"
                type="number"
                min="0"
                step="1000"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                data-testid="edit-payment-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Статус оплаты</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger data-testid="edit-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Оплачено</SelectItem>
                  <SelectItem value="partial">Частично</SelectItem>
                  <SelectItem value="not_paid">Не оплачено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} data-testid="edit-participant-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Сохранить
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function AddExpenseDialog({ retreatId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await retreatsApi.addExpense(retreatId, {
        name,
        amount: parseInt(amount) || 0
      });
      toast.success('Расход добавлен');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Не удалось добавить расход');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Добавить расход</DialogTitle>
          <DialogDescription>
            Укажите название и сумму расхода
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="expense-name">Название</Label>
            <Input
              id="expense-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Аренда помещения"
              required
              data-testid="expense-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Сумма (₽)</Label>
            <Input
              id="expense-amount"
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              required
              data-testid="expense-amount-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} data-testid="add-expense-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Добавить
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function RetreatDetailSkeleton() {
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
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
