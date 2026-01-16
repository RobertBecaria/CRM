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
import { ArrowLeft, Calendar, Edit, Trash2, Plus, User, FileText, X, ChevronLeft, ChevronRight, Loader2, Banknote, Gift, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const DEFAULT_PRICE = 15000;
const AVAILABLE_PRACTICES = ['Коррекция', 'ТСЯ', 'Лепило'];

// Helper function to get payment status
function getPaymentStatus(price) {
  if (price === 0) return { label: 'Благотворительность', variant: 'outline', icon: Heart };
  if (price < DEFAULT_PRICE) return { label: 'Скидка', variant: 'secondary', icon: Gift };
  return { label: 'Обычный', variant: 'default', icon: Banknote };
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

// Helper to format full name
function formatClientName(client) {
  if (!client) return '';
  const parts = [client.last_name, client.first_name];
  if (client.middle_name) parts.push(client.middle_name);
  return parts.join(' ');
}

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
      toast.error('Не удалось загрузить клиента');
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
      toast.error('Не удалось загрузить визиты');
    } finally {
      setVisitsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      await clientsApi.delete(id);
      toast.success('Клиент удалён');
      navigate('/clients');
    } catch (err) {
      toast.error('Не удалось удалить клиента');
    }
  };

  const handleDeleteVisit = async (visitId) => {
    try {
      await visitsApi.delete(visitId);
      toast.success('Визит удалён');
      fetchVisits();
      fetchClient();
    } catch (err) {
      toast.error('Не удалось удалить визит');
    }
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTopicFilter('');
    setPage(1);
  };

  const hasFilters = dateFrom || dateTo || topicFilter;

  // Calculate totals for displayed visits
  const totalRevenue = visits.reduce((sum, v) => sum + (v.price ?? DEFAULT_PRICE), 0);
  const totalTips = visits.reduce((sum, v) => sum + (v.tips ?? 0), 0);

  if (loading) {
    return <ClientDetailSkeleton />;
  }

  const getYearWord = (age) => {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
  };

  return (
    <div className="container-responsive py-8">
      {/* Back button */}
      <Link to="/clients" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад к клиентам
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
                      <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это навсегда удалит <strong>{formatClientName(client)}</strong> и все записи о визитах.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteClient}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="delete-client-confirm-button"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardTitle className="text-2xl mt-4" data-testid="client-name">
              {formatClientName(client)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Дата рождения</p>
              <p className="font-medium" data-testid="client-dob">
                {dayjs(client?.dob).format('D MMMM YYYY')}
              </p>
              <p className="text-sm text-muted-foreground">
                {calculateAge(client?.dob)} {getYearWord(calculateAge(client?.dob))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего визитов</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]" data-testid="client-visit-count">
                {client?.visit_count || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Клиент с</p>
              <p className="font-medium">
                {dayjs(client?.created_at).format('D MMMM YYYY')}
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
                  <CardTitle>История визитов</CardTitle>
                  <CardDescription>Записи всех визитов</CardDescription>
                </div>
                <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-press" onClick={() => setEditingVisit(null)} data-testid="add-visit-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить визит
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
                  <Label className="text-xs text-muted-foreground">С даты</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    data-testid="date-from-filter"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">По дату</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    data-testid="date-to-filter"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Тема</Label>
                  <Input
                    placeholder="Фильтр по теме"
                    value={topicFilter}
                    onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
                    data-testid="topic-filter"
                  />
                </div>
                {hasFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters-button">
                      <X className="w-4 h-4 mr-1" /> Очистить
                    </Button>
                  </div>
                )}
              </div>

              {/* Financial summary for filtered visits */}
              {visits.length > 0 && (
                <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Доход:</span>
                    <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Чаевые:</span>
                    <span className="font-medium">{formatCurrency(totalTips)}</span>
                  </div>
                </div>
              )}
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
                    {hasFilters ? 'Визиты не найдены' : 'Визитов пока нет'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasFilters ? 'Попробуйте изменить фильтры' : 'Запишите первый визит этого клиента'}
                  </p>
                  {!hasFilters && (
                    <Button onClick={() => setVisitDialogOpen(true)} data-testid="empty-add-visit-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить первый визит
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y" data-testid="visits-list">
                  {visits.map((visit) => {
                    const price = visit.price ?? DEFAULT_PRICE;
                    const tips = visit.tips ?? 0;
                    const practices = visit.practices || [];
                    const status = getPaymentStatus(price);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={visit.id} className="py-4 first:pt-0 last:pb-0" data-testid={`visit-${visit.id}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {dayjs(visit.date).format('D MMMM YYYY')}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {visit.topic}
                              </Badge>
                              <Badge variant={status.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </div>
                            {/* Practices badges */}
                            {practices.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {practices.map((practice) => (
                                  <Badge key={practice} variant="outline" className="text-xs bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {practice}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm mb-2">
                              <span className="text-muted-foreground">
                                Оплата: <span className="font-medium text-foreground">{formatCurrency(price)}</span>
                              </span>
                              {tips > 0 && (
                                <span className="text-muted-foreground">
                                  Чаевые: <span className="font-medium text-[hsl(var(--success))]">{formatCurrency(tips)}</span>
                                </span>
                              )}
                            </div>
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
                                  <AlertDialogTitle>Удалить визит?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это навсегда удалит эту запись о визите.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteVisit(visit.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                  <p className="text-sm text-muted-foreground">Страница {page} из {totalPages}</p>
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
  const [practices, setPractices] = useState(visit?.practices || []);
  const [notes, setNotes] = useState(visit?.notes || '');
  const [price, setPrice] = useState(visit?.price ?? DEFAULT_PRICE);
  const [tips, setTips] = useState(visit?.tips ?? 0);
  const [loading, setLoading] = useState(false);

  const status = getPaymentStatus(price);

  const togglePractice = (practice) => {
    setPractices(prev => 
      prev.includes(practice) 
        ? prev.filter(p => p !== practice)
        : [...prev, practice]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { 
        date, 
        topic, 
        practices,
        notes, 
        price: parseInt(price) || 0, 
        tips: parseInt(tips) || 0 
      };
      
      if (visit) {
        await visitsApi.update(visit.id, data);
        toast.success('Визит обновлён');
      } else {
        await visitsApi.create(clientId, data);
        toast.success('Визит добавлен');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(visit ? 'Не удалось обновить визит' : 'Не удалось добавить визит');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{visit ? 'Редактировать визит' : 'Добавить визит'}</DialogTitle>
          <DialogDescription>
            {visit ? 'Обновите данные визита' : 'Запишите новый визит для этого клиента'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit-date">Дата</Label>
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
              <Label htmlFor="visit-topic">Тема</Label>
              <Input
                id="visit-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="например: Стресс, Сон"
                required
                data-testid="visit-topic-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit-price">Оплата (₽)</Label>
              <Input
                id="visit-price"
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000"
                data-testid="visit-price-input"
              />
              <p className="text-xs text-muted-foreground">
                Статус: <Badge variant={status.variant} className="ml-1">{status.label}</Badge>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit-tips">Чаевые (₽)</Label>
              <Input
                id="visit-tips"
                type="number"
                min="0"
                step="100"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="0"
                data-testid="visit-tips-input"
              />
            </div>
          </div>

          {/* Practices Selection */}
          <div className="space-y-2">
            <Label>Практики</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PRACTICES.map((practice) => {
                const isSelected = practices.includes(practice);
                return (
                  <button
                    key={practice}
                    type="button"
                    onClick={() => togglePractice(practice)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      border-2 flex items-center gap-2
                      ${isSelected 
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]' 
                        : 'bg-white text-[hsl(var(--foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                      }
                    `}
                    data-testid={`practice-${practice}`}
                  >
                    <Sparkles className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[hsl(var(--primary))]'}`} />
                    {practice}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Выберите одну или несколько практик
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-notes">Заметки</Label>
            <Textarea
              id="visit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Заметки о сеансе..."
              rows={3}
              data-testid="visit-notes-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} data-testid="visit-form-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {visit ? 'Сохранить' : 'Добавить'}
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
