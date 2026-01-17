import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsApi, retreatsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Users, Calendar, TrendingUp, Activity, Plus, ArrowRight, Banknote, Gift, Wallet, Sparkles, Mountain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [retreatStats, setRetreatStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [overviewRes, retreatsRes] = await Promise.all([
        statsApi.getOverview(),
        retreatsApi.getStats()
      ]);
      setStats(overviewRes.data);
      setRetreatStats(retreatsRes.data);
    } catch (err) {
      setError('Не удалось загрузить данные');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container-responsive py-8">
        <Card className="card-shadow">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchStats}>Повторить</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const financial = stats?.financial || {};
  const practices = stats?.practices || [];

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]" data-testid="dashboard-title">
            Главная
          </h1>
          <p className="text-muted-foreground mt-1">Обзор вашей практики</p>
        </div>
        <Link to="/clients/new">
          <Button className="btn-press" data-testid="add-client-button">
            <Plus className="w-4 h-4 mr-2" />
            Добавить клиента
          </Button>
        </Link>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <KPICard
          title="Всего клиентов"
          value={stats?.total_clients || 0}
          icon={Users}
          delay="stagger-1"
          testId="kpi-total-clients"
        />
        <KPICard
          title="Визитов за год"
          value={stats?.visits_ytd || 0}
          icon={Calendar}
          delay="stagger-2"
          testId="kpi-visits-ytd"
        />
        <KPICard
          title="За 30 дней"
          value={stats?.visits_last_30 || 0}
          icon={TrendingUp}
          delay="stagger-3"
          testId="kpi-visits-30"
        />
        <KPICard
          title="Активных тем"
          value={stats?.top_topics?.length || 0}
          icon={Activity}
          delay="stagger-4"
          testId="kpi-topics"
        />
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <FinancialCard
          title="Чистая прибыль"
          value={formatCurrency((financial.revenue_ytd || 0) + (financial.tips_ytd || 0) - (financial.retreat_expenses_ytd || 0))}
          subtitle={`Доход: ${formatCurrency((financial.revenue_ytd || 0) + (financial.tips_ytd || 0))} − Расходы: ${formatCurrency(financial.retreat_expenses_ytd || 0)}`}
          icon={Banknote}
          color="primary"
          delay="stagger-1"
          testId="kpi-net-profit-ytd"
        />
        <FinancialCard
          title="Доход за 30 дней"
          value={formatCurrency((financial.revenue_last_30 || 0) + (financial.tips_last_30 || 0))}
          icon={Wallet}
          color="chart-2"
          delay="stagger-2"
          testId="kpi-revenue-30"
        />
        <FinancialCard
          title="Расходы на ретриты"
          value={formatCurrency(financial.retreat_expenses_ytd || 0)}
          subtitle={`Прибыль ретритов: ${formatCurrency(financial.retreat_profit_ytd || 0)}`}
          icon={TrendingUp}
          color="destructive"
          delay="stagger-3"
          testId="kpi-retreat-expenses"
        />
        <FinancialCard
          title="Средний чек"
          value={formatCurrency(financial.avg_check || 0)}
          icon={Gift}
          color="success"
          delay="stagger-4"
          testId="kpi-avg-check"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visits Over Time Chart */}
        <Card className="lg:col-span-4 card-shadow animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg">Визиты по времени</CardTitle>
            <CardDescription>Активность за 12 месяцев</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.visits_over_time?.length > 0 ? (
              <div className="h-64 w-full" data-testid="visits-over-time-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.visits_over_time} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6F0EE" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="hsl(187 45% 38%)" 
                      strokeWidth={2} 
                      dot={false} 
                      name="Визиты"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground" data-testid="chart-empty">
                Пока нет данных о визитах.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card className="lg:col-span-4 card-shadow animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="text-lg">Популярные темы</CardTitle>
            <CardDescription>Самые частые темы визитов</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.top_topics?.length > 0 ? (
              <div className="space-y-3" data-testid="top-topics-list">
                {stats.top_topics.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{topic.topic}</span>
                    <Badge variant="secondary" className="shrink-0">
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Темы ещё не записаны
              </div>
            )}
            <Link to="/statistics" className="block mt-4">
              <Button variant="outline" className="w-full" data-testid="view-all-topics-button">
                Вся статистика
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Practices Statistics */}
        <Card className="lg:col-span-4 card-shadow animate-fade-in-up stagger-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
              Практики за год
            </CardTitle>
            <CardDescription>Статистика применяемых практик</CardDescription>
          </CardHeader>
          <CardContent>
            {practices.length > 0 ? (
              <div className="space-y-3" data-testid="practices-stats-list">
                {practices.map((p) => (
                  <div key={p.practice} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{p.practice}</span>
                    </div>
                    <Badge variant="outline" className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                      {p.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Практики ещё не записаны
              </div>
            )}
            {practices.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Всего применено практик: <span className="font-medium text-foreground">{practices.reduce((sum, p) => sum + p.count, 0)}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retreats Statistics */}
        {retreatStats && (
          <Card className="lg:col-span-12 card-shadow animate-fade-in-up stagger-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Ретриты за год
                </CardTitle>
                <CardDescription>Групповые дыхательные практики</CardDescription>
              </div>
              <Link to="/retreats">
                <Button variant="ghost" size="sm" data-testid="view-retreats-button">
                  Все ретриты
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="retreat-stats">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">{retreatStats.total_retreats}</p>
                  <p className="text-sm text-muted-foreground">Ретритов</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{retreatStats.total_participants}</p>
                  <p className="text-sm text-muted-foreground">Участников</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(retreatStats.total_revenue)}</p>
                  <p className="text-sm text-muted-foreground">Доход</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className={`text-2xl font-bold ${retreatStats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(retreatStats.net_profit)}
                  </p>
                  <p className="text-sm text-muted-foreground">Прибыль</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Visits */}
        <Card className="lg:col-span-12 card-shadow animate-fade-in-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Последние визиты</CardTitle>
              <CardDescription>Недавно записанные визиты</CardDescription>
            </div>
            <Link to="/clients">
              <Button variant="ghost" size="sm" data-testid="view-all-clients-button">
                Все клиенты
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recent_visits?.length > 0 ? (
              <div className="divide-y" data-testid="recent-visits-list">
                {stats.recent_visits.map((visit) => (
                  <div key={visit.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1">
                      <Link 
                        to={`/clients/${visit.client_id}`}
                        className="font-medium text-[hsl(var(--primary))] hover:underline"
                      >
                        {visit.client_name || 'Неизвестный клиент'}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {visit.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {formatCurrency(visit.price ?? 15000)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {dayjs(visit.date).format('D MMMM YYYY')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Визиты ещё не записаны. Добавьте первый визит для отображения здесь.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, delay, testId }) {
  return (
    <Card className={`card-shadow animate-fade-in-up ${delay}`} data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-[hsl(var(--primary))]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialCard({ title, value, subtitle, icon: Icon, color, delay, testId }) {
  return (
    <Card className={`card-shadow animate-fade-in-up ${delay}`} data-testid={testId}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate" title={subtitle}>{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-[hsl(var(--${color})/0.1)] rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
            <Icon className={`w-6 h-6 text-[hsl(var(--${color}))]`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-responsive py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardContent className="py-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardContent className="py-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
