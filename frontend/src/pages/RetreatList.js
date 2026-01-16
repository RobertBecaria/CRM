import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { retreatsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Mountain, Calendar, Users, Banknote, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function RetreatList() {
  const [retreats, setRetreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchRetreats();
    fetchStats();
  }, []);

  const fetchRetreats = async () => {
    try {
      setLoading(true);
      const response = await retreatsApi.getAll();
      setRetreats(response.data.retreats);
    } catch (err) {
      toast.error('Не удалось загрузить ретриты');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await retreatsApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch retreat stats', err);
    }
  };

  if (loading) {
    return <RetreatListSkeleton />;
  }

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]" data-testid="retreats-title">
            Ретриты
          </h1>
          <p className="text-muted-foreground mt-1">Дыхательные ретриты и групповые сессии</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-press" data-testid="create-retreat-button">
              <Plus className="w-4 h-4 mr-2" />
              Создать ретрит
            </Button>
          </DialogTrigger>
          <CreateRetreatDialog
            onClose={() => setCreateDialogOpen(false)}
            onSuccess={() => { fetchRetreats(); fetchStats(); }}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            title="Ретритов за год"
            value={stats.total_retreats}
            icon={Mountain}
            testId="stat-retreats-count"
          />
          <StatCard
            title="Всего участников"
            value={stats.total_participants}
            icon={Users}
            testId="stat-participants"
          />
          <StatCard
            title="Доход от ретритов"
            value={formatCurrency(stats.total_revenue)}
            icon={Banknote}
            testId="stat-revenue"
          />
          <StatCard
            title="Чистая прибыль"
            value={formatCurrency(stats.net_profit)}
            icon={TrendingUp}
            color={stats.net_profit >= 0 ? 'success' : 'destructive'}
            testId="stat-profit"
          />
        </div>
      )}

      {/* Retreats List */}
      {retreats.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="py-12">
            <div className="empty-state">
              <div className="w-16 h-16 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center mb-4">
                <Mountain className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-lg font-medium mb-2">Ретритов пока нет</h3>
              <p className="text-muted-foreground mb-4">Создайте первый ретрит для начала работы</p>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="empty-create-retreat">
                <Plus className="w-4 h-4 mr-2" />
                Создать первый ретрит
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retreats.map((retreat) => (
            <RetreatCard key={retreat.id} retreat={retreat} />
          ))}
        </div>
      )}
    </div>
  );
}

function RetreatCard({ retreat }) {
  const isPast = dayjs(retreat.end_date).isBefore(dayjs(), 'day');
  const isOngoing = dayjs().isBetween(dayjs(retreat.start_date), dayjs(retreat.end_date), 'day', '[]');

  return (
    <Link to={`/retreats/${retreat.id}`}>
      <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={`retreat-card-${retreat.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
              <Mountain className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            {isOngoing && (
              <Badge className="bg-green-100 text-green-700">Сейчас</Badge>
            )}
            {isPast && (
              <Badge variant="secondary">Завершён</Badge>
            )}
            {!isPast && !isOngoing && (
              <Badge variant="outline">Предстоит</Badge>
            )}
          </div>
          <CardTitle className="text-lg mt-3">{retreat.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {dayjs(retreat.start_date).format('D MMM')} — {dayjs(retreat.end_date).format('D MMM YYYY')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Участники</p>
              <p className="font-medium text-lg">{retreat.total_participants}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Доход</p>
              <p className="font-medium text-lg">{formatCurrency(retreat.total_revenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Расходы</p>
              <p className="font-medium">{formatCurrency(retreat.total_expenses)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Прибыль</p>
              <p className={`font-medium ${retreat.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(retreat.net_profit)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end mt-4 text-[hsl(var(--primary))]">
            <span className="text-sm mr-1">Подробнее</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateRetreatDialog({ onClose, onSuccess }) {
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);

  // Auto-generate retreat name with dates
  const generateRetreatName = () => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return `Ретрит по Дыханию ${start.format('D')}-${end.format('D MMMM YYYY')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const retreatName = generateRetreatName();
      await retreatsApi.create({ name: retreatName, start_date: startDate, end_date: endDate });
      toast.success('Ретрит создан');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Не удалось создать ретрит');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Создать ретрит</DialogTitle>
          <DialogDescription>
            Выберите даты проведения ретрита
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Дата начала</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                data-testid="retreat-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Дата окончания</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                data-testid="retreat-end-date"
              />
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Название ретрита:</p>
            <p className="font-medium" data-testid="retreat-name-preview">{generateRetreatName()}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading} data-testid="retreat-create-submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Создать
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function StatCard({ title, value, icon: Icon, color = 'primary', testId }) {
  return (
    <Card className="card-shadow" data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 bg-[hsl(var(--${color})/0.1)] rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-[hsl(var(--${color}))]`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RetreatListSkeleton() {
  return (
    <div className="container-responsive py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="py-6">
              <Skeleton className="h-12 w-12 rounded-lg mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
