import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { calendarApi, clientsApi, visitsApi, settingsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Mountain, 
  Plus, Sparkles, Banknote, Clock, X, Loader2, Heart, CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
dayjs.locale('ru');

const AVAILABLE_PRACTICES = ['Коррекция', 'ТСЯ', 'Лепило', 'Ребефинг'];
const DEFAULT_PRICE = 15000;

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

// Get payment status
function getPaymentStatus(price, paymentType) {
  if (price === 0) {
    if (paymentType === 'абонемент') {
      return { label: 'Абонемент', color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Благотворительность', color: 'bg-purple-100 text-purple-700' };
  }
  if (price < DEFAULT_PRICE) return { label: 'Скидка', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Обычный', color: 'bg-green-100 text-green-700' };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventFilter, setEventFilter] = useState('all'); // all, visits, retreats
  const [addVisitOpen, setAddVisitOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (view === 'month') {
        startDate = currentDate.startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
        endDate = currentDate.endOf('month').add(7, 'day').format('YYYY-MM-DD');
      } else if (view === 'week') {
        startDate = currentDate.startOf('isoWeek').format('YYYY-MM-DD');
        endDate = currentDate.endOf('isoWeek').format('YYYY-MM-DD');
      } else {
        startDate = currentDate.format('YYYY-MM-DD');
        endDate = currentDate.format('YYYY-MM-DD');
      }

      const response = await calendarApi.getEvents({
        start_date: startDate,
        end_date: endDate,
        event_type: eventFilter === 'all' ? undefined : eventFilter
      });
      setEvents(response.data.events);
    } catch (err) {
      toast.error('Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, eventFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const navigatePrev = () => {
    if (view === 'month') setCurrentDate(d => d.subtract(1, 'month'));
    else if (view === 'week') setCurrentDate(d => d.subtract(1, 'week'));
    else setCurrentDate(d => d.subtract(1, 'day'));
  };

  const navigateNext = () => {
    if (view === 'month') setCurrentDate(d => d.add(1, 'month'));
    else if (view === 'week') setCurrentDate(d => d.add(1, 'week'));
    else setCurrentDate(d => d.add(1, 'day'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  const handleAddVisit = (date) => {
    setSelectedDate(date);
    setAddVisitOpen(true);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter(event => {
      if (event.type === 'retreat') {
        return dateStr >= event.date && dateStr <= event.end_date;
      }
      return event.date === dateStr;
    });
  };

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="calendar-title">Календарь</h1>
          <p className="text-muted-foreground">Визиты и ретриты</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* View selector */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="rounded-none"
              data-testid="view-month"
            >
              Месяц
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="rounded-none border-x"
              data-testid="view-week"
            >
              Неделя
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="rounded-none"
              data-testid="view-day"
            >
              День
            </Button>
          </div>

          {/* Filter */}
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-36" data-testid="event-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все события</SelectItem>
              <SelectItem value="visits">Только визиты</SelectItem>
              <SelectItem value="retreats">Только ретриты</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrev} data-testid="nav-prev">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext} data-testid="nav-next">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={goToToday} data-testid="nav-today">
            Сегодня
          </Button>
        </div>
        
        <h2 className="text-xl font-semibold capitalize" data-testid="current-period">
          {view === 'month' && currentDate.format('MMMM YYYY')}
          {view === 'week' && `${currentDate.startOf('isoWeek').format('D MMM')} - ${currentDate.endOf('isoWeek').format('D MMM YYYY')}`}
          {view === 'day' && currentDate.format('D MMMM YYYY, dddd')}
        </h2>

        <Button onClick={() => handleAddVisit(currentDate.format('YYYY-MM-DD'))} data-testid="add-event-button">
          <Plus className="w-4 h-4 mr-2" />
          Добавить визит
        </Button>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <CalendarSkeleton view={view} />
      ) : (
        <>
          {view === 'month' && (
            <MonthView 
              currentDate={currentDate} 
              events={events} 
              onDayClick={handleDayClick}
              onAddVisit={handleAddVisit}
              getEventsForDate={getEventsForDate}
            />
          )}
          {view === 'week' && (
            <WeekView 
              currentDate={currentDate} 
              events={events}
              onDayClick={handleDayClick}
              onAddVisit={handleAddVisit}
              getEventsForDate={getEventsForDate}
            />
          )}
          {view === 'day' && (
            <DayView 
              currentDate={currentDate} 
              events={events}
              onAddVisit={handleAddVisit}
              getEventsForDate={getEventsForDate}
            />
          )}
        </>
      )}

      {/* Day Detail Dialog */}
      {selectedDay && (
        <DayDetailDialog 
          date={selectedDay} 
          events={getEventsForDate(dayjs(selectedDay))}
          onClose={() => setSelectedDay(null)}
          onAddVisit={() => { setSelectedDay(null); handleAddVisit(selectedDay); }}
        />
      )}

      {/* Add Visit Dialog */}
      <AddVisitDialog
        open={addVisitOpen}
        onClose={() => setAddVisitOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => { setAddVisitOpen(false); fetchEvents(); }}
      />
    </div>
  );
}

// Month View Component
function MonthView({ currentDate, events, onDayClick, onAddVisit, getEventsForDate }) {
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDay = startOfMonth.startOf('isoWeek');
  const endDay = endOfMonth.endOf('isoWeek');

  const weeks = [];
  let day = startDay;

  while (day.isBefore(endDay) || day.isSame(endDay, 'day')) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = day.add(1, 'day');
    }
    weeks.push(week);
  }

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <Card className="card-shadow">
      <CardContent className="p-0">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((date) => {
              const isToday = date.isSame(dayjs(), 'day');
              const isCurrentMonth = date.isSame(currentDate, 'month');
              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={date.format('YYYY-MM-DD')}
                  className={`
                    min-h-[100px] p-2 border-r last:border-r-0 cursor-pointer
                    hover:bg-muted/50 transition-colors
                    ${!isCurrentMonth ? 'bg-muted/30' : ''}
                  `}
                  onClick={() => onDayClick(date.format('YYYY-MM-DD'))}
                  data-testid={`day-${date.format('YYYY-MM-DD')}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-[hsl(var(--primary))] text-white' : ''}
                      ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                    `}>
                      {date.format('D')}
                    </span>
                    {hasEvents && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddVisit(date.format('YYYY-MM-DD')); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Event indicators */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={`${event.id}-${idx}`}
                        className={`
                          text-xs px-1.5 py-0.5 rounded truncate
                          ${event.type === 'retreat' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                          }
                        `}
                        title={event.title}
                      >
                        {event.type === 'retreat' ? '🏔️' : '👤'} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} ещё
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Week View Component
function WeekView({ currentDate, events, onDayClick, onAddVisit, getEventsForDate }) {
  const startOfWeek = currentDate.startOf('isoWeek');
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    days.push(startOfWeek.add(i, 'day'));
  }

  return (
    <Card className="card-shadow">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 divide-x">
          {days.map((date) => {
            const isToday = date.isSame(dayjs(), 'day');
            const dayEvents = getEventsForDate(date);

            return (
              <div key={date.format('YYYY-MM-DD')} className="min-h-[400px]">
                {/* Day header */}
                <div 
                  className={`p-3 border-b text-center cursor-pointer hover:bg-muted/50 ${isToday ? 'bg-[hsl(var(--primary)/0.1)]' : ''}`}
                  onClick={() => onDayClick(date.format('YYYY-MM-DD'))}
                >
                  <div className="text-sm text-muted-foreground">{date.format('ddd')}</div>
                  <div className={`text-lg font-semibold ${isToday ? 'text-[hsl(var(--primary))]' : ''}`}>
                    {date.format('D')}
                  </div>
                </div>

                {/* Events */}
                <div className="p-2 space-y-2">
                  {dayEvents.map((event, idx) => (
                    <Link
                      key={`${event.id}-${idx}`}
                      to={event.type === 'retreat' ? `/retreats/${event.id}` : `/clients/${event.client_id}`}
                      className={`
                        block p-2 rounded text-xs
                        ${event.type === 'retreat' 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                          : 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]'
                        }
                      `}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.type === 'visit' && (
                        <div className="text-[10px] opacity-70 truncate">{event.client_name}</div>
                      )}
                      {event.type === 'retreat' && (
                        <div className="text-[10px] opacity-70">{event.participant_count} участников</div>
                      )}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => onAddVisit(date.format('YYYY-MM-DD'))}
                    className="w-full p-2 border-2 border-dashed rounded text-xs text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    <Plus className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Day View Component
function DayView({ currentDate, events, onAddVisit, getEventsForDate }) {
  const dayEvents = getEventsForDate(currentDate);
  const isToday = currentDate.isSame(dayjs(), 'day');

  return (
    <div className="space-y-4">
      {/* Day header */}
      <Card className={`card-shadow ${isToday ? 'border-[hsl(var(--primary))]' : ''}`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentDate.format('D MMMM YYYY')}</h3>
              <p className="text-muted-foreground capitalize">{currentDate.format('dddd')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{dayEvents.length}</p>
              <p className="text-sm text-muted-foreground">событий</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events list */}
      {dayEvents.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="py-12">
            <div className="empty-state">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет событий</h3>
              <p className="text-muted-foreground mb-4">На этот день нет запланированных визитов</p>
              <Button onClick={() => onAddVisit(currentDate.format('YYYY-MM-DD'))}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить визит
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event, idx) => (
            <EventCard key={`${event.id}-${idx}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event }) {
  if (event.type === 'retreat') {
    return (
      <Link to={`/retreats/${event.id}`}>
        <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {event.participant_count} участников • {formatCurrency(event.total_revenue)}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-700">Ретрит</Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const status = getPaymentStatus(event.price, event.payment_type);

  return (
    <Link to={`/clients/${event.client_id}`}>
      <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[hsl(var(--primary))]">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[hsl(var(--primary)/0.1)] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{event.client_name}</h4>
              <p className="text-sm text-muted-foreground">{event.title}</p>
              {event.practices?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {event.practices.map(p => (
                    <Badge key={p} variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(event.price)}</p>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Day Detail Dialog
function DayDetailDialog({ date, events, onClose, onAddVisit }) {
  const dateObj = dayjs(date);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dateObj.format('D MMMM YYYY')}</DialogTitle>
          <DialogDescription className="capitalize">{dateObj.format('dddd')}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет событий на этот день
            </div>
          ) : (
            events.map((event, idx) => (
              <EventCard key={`${event.id}-${idx}`} event={event} />
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
          <Button onClick={onAddVisit}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить визит
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Visit Dialog
function AddVisitDialog({ open, onClose, selectedDate, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState('');
  const [date, setDate] = useState(selectedDate || dayjs().format('YYYY-MM-DD'));
  const [topic, setTopic] = useState('');
  const [practices, setPractices] = useState([]);
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [tips, setTips] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(selectedDate || dayjs().format('YYYY-MM-DD'));
      fetchClients();
    }
  }, [open, selectedDate]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientsApi.getAll({ page_size: 1000 });
      setClients(response.data.clients);
    } catch (err) {
      toast.error('Не удалось загрузить клиентов');
    } finally {
      setLoadingClients(false);
    }
  };

  const togglePractice = (practice) => {
    setPractices(prev => 
      prev.includes(practice) 
        ? prev.filter(p => p !== practice)
        : [...prev, practice]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error('Выберите клиента');
      return;
    }

    setLoading(true);
    try {
      await visitsApi.create(selectedClient, {
        date,
        topic,
        practices,
        notes,
        price: parseInt(price) || 0,
        tips: parseInt(tips) || 0
      });
      toast.success('Визит добавлен');
      
      // Reset form
      setSelectedClient('');
      setTopic('');
      setPractices([]);
      setNotes('');
      setPrice(DEFAULT_PRICE);
      setTips(0);
      
      onSuccess();
    } catch (err) {
      toast.error('Не удалось добавить визит');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить визит</DialogTitle>
            <DialogDescription>Запланируйте новый визит клиента</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Client selection */}
            <div className="space-y-2">
              <Label>Клиент</Label>
              {loadingClients ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger data-testid="select-client-calendar">
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

            {/* Date and Topic */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  data-testid="calendar-visit-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Тема</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="например: Стресс"
                  required
                  data-testid="calendar-visit-topic"
                />
              </div>
            </div>

            {/* Price and Tips */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Оплата (₽)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  data-testid="calendar-visit-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Чаевые (₽)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  data-testid="calendar-visit-tips"
                />
              </div>
            </div>

            {/* Practices */}
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
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        border-2 flex items-center gap-1
                        ${isSelected 
                          ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]' 
                          : 'bg-white text-foreground border-border hover:border-[hsl(var(--primary))]'
                        }
                      `}
                    >
                      <Sparkles className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[hsl(var(--primary))]'}`} />
                      {practice}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Заметки</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительные заметки..."
                rows={3}
                data-testid="calendar-visit-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={loading} data-testid="calendar-visit-submit">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Добавить визит
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Calendar Skeleton
function CalendarSkeleton({ view }) {
  if (view === 'month') {
    return (
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-shadow">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
