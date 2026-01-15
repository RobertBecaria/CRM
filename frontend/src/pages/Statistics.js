import React, { useState, useEffect } from 'react';
import { statsApi, topicsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, Filter, Download, TrendingUp, Users, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const COLORS = ['hsl(172 39% 40%)', 'hsl(187 45% 38%)', 'hsl(266 42% 62%)', 'hsl(38 92% 60%)', 'hsl(155 38% 40%)'];

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
      toast.error('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            Statistics
          </h1>
          <p className="text-muted-foreground mt-1">Year-end summaries and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="year-select" className="text-sm text-muted-foreground">Year:</Label>
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

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
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
                <p className="text-sm text-muted-foreground">Total Visits</p>
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
                <p className="text-sm text-muted-foreground">Unique Topics</p>
                <p className="text-2xl font-bold" data-testid="stats-unique-topics">
                  {summary?.topic_distribution?.length || 0}
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
            <CardTitle className="text-lg">Topic Distribution</CardTitle>
            <CardDescription>Most common visit topics in {year}</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.topic_distribution?.length > 0 ? (
              <div className="h-64" data-testid="topic-distribution-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.topic_distribution.slice(0, 10)} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E6F0EE" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(172 39% 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No topic data for {year}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Pie Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Topic Breakdown</CardTitle>
            <CardDescription>Percentage distribution of topics</CardDescription>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Summaries Table */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Client Summaries - {year}</CardTitle>
          <CardDescription>Visit counts and topics per client</CardDescription>
        </CardHeader>
        <CardContent>
          {summary?.client_summaries?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table data-testid="client-summaries-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                    <TableHead>Top Topics</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.client_summaries.map((client) => (
                    <TableRow key={client.client_id} data-testid={`summary-row-${client.client_id}`}>
                      <TableCell className="font-medium">{client.client_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{client.visit_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.topics.slice(0, 3).map((t) => (
                            <Badge key={t.topic} variant="outline" className="text-xs">
                              {t.topic} ({t.count})
                            </Badge>
                          ))}
                          {client.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{client.topics.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/clients/${client.client_id}`}>
                          <Button variant="ghost" size="sm" data-testid={`view-client-${client.client_id}`}>
                            View
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
              <h3 className="font-medium mb-2">No activity in {year}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No client visits were recorded for this year
              </p>
              <Link to="/clients">
                <Button>View All Clients</Button>
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
