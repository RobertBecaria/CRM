import React, { useState, useEffect } from 'react';
import { statsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, FileText, Banknote, Gift, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const COLORS = ['hsl(172 39% 40%)', 'hsl(187 45% 38%)', 'hsl(266 42% 62%)', 'hsl(38 92% 60%)', 'hsl(155 38% 40%)'];

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function Statistics() {
  const [year, setYear] = useState(dayjs().year());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableYears] = useState(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  });

  useEffect(() => {
    fetchSummary();
  }, [year]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await statsApi.getYearlySummary(year);
      setSummary(response.data);
    } catch (err) {
      toast.error('Не удалось загрузить статистику');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVisitWord = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'визитов';
    if (lastDigit === 1) return 'визит';
    if (lastDigit >= 2 && lastDigit <= 4) return 'визита';
    return 'визитов';
  };

  if (loading) {
    return <StatisticsSkeleton />;
  }

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]" data-testid="statistics-page-title">
            Статистика
          </h1>
          <p className="text-muted-foreground mt-1">Годовые итоги и аналитика</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="year-select" className="text-sm text-muted-foreground">Год:</Label>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-32" id="year-select" data-testid="stats-year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Активных клиентов</p>
                <p className="text-2xl font-bold" data-testid="stats-active-clients">
                  {summary?.total_clients_active || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--chart-2)/0.1)] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего визитов</p>
                <p className="text-2xl font-bold" data-testid="stats-total-visits">
                  {summary?.total_visits || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--chart-3)/0.1)] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--chart-3))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Уникальных тем</p>
                <p className="text-2xl font-bold" data-testid="stats-unique-topics">
                  {summary?.topic_distribution?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--success)/0.1)] rounded-lg flex items-center justify-center">
                <Banknote className="w-6 h-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Общий доход</p>
                <p className="text-2xl font-bold" data-testid="stats-total-revenue">
                  {formatCurrency(summary?.total_revenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--chart-4)/0.1)] rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-[hsl(var(--chart-4))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего чаевых</p>
                <p className="text-2xl font-bold" data-testid="stats-total-tips">
                  {formatCurrency(summary?.total_tips || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Средний чек</p>
                <p className="text-2xl font-bold" data-testid="stats-avg-check">
                  {formatCurrency(summary?.avg_check || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Topic Distribution Bar Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Распределение тем</CardTitle>
            <CardDescription>Самые частые темы визитов в {year} году</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.topic_distribution?.length > 0 ? (
              <div className="h-64" data-testid="topic-distribution-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.topic_distribution.slice(0, 10)} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E6F0EE" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${value} ${getVisitWord(value)}`, 'Количество']} />
                    <Bar dataKey="count" fill="hsl(172 39% 40%)" radius={[4, 4, 0, 0]} name="Визиты" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Нет данных за {year} год
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Pie Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Структура тем</CardTitle>
            <CardDescription>Процентное распределение тем</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.topic_distribution?.length > 0 ? (
              <div className="h-64" data-testid="topic-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.topic_distribution.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="topic"
                      label={({ topic, percent }) => `${topic} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {summary.topic_distribution.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ${getVisitWord(value)}`, 'Количество']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Summaries Table */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Итоги по клиентам - {year} год</CardTitle>
          <CardDescription>Визиты, доход и темы по каждому клиенту</CardDescription>
        </CardHeader>
        <CardContent>
          {summary?.client_summaries?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table data-testid="client-summaries-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя клиента</TableHead>
                    <TableHead className="text-center">Визиты</TableHead>
                    <TableHead className="text-right">Доход</TableHead>
                    <TableHead className="text-right">Чаевые</TableHead>
                    <TableHead>Главные темы</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.client_summaries.map((client) => (
                    <TableRow key={client.client_id} data-testid={`summary-row-${client.client_id}`}>
                      <TableCell className="font-medium">{client.client_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{client.visit_count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(client.total_revenue || 0)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(client.total_tips || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.topics.slice(0, 3).map((t) => (
                            <Badge key={t.topic} variant="outline" className="text-xs">
                              {t.topic} ({t.count})
                            </Badge>
                          ))}
                          {client.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{client.topics.length - 3} ещё</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/clients/${client.client_id}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-client-${client.client_id}`}>
                            Открыть
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center" data-testid="summaries-empty-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Нет активности в {year} году</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Визиты клиентов за этот год не записаны
              </p>
              <Link to="/clients">
                <Button>Все клиенты</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="container-responsive py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
