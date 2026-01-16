import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await clientsApi.getOne(id);
      const client = response.data;
      setFirstName(client.first_name);
      setMiddleName(client.middle_name || '');
      setLastName(client.last_name);
      setDob(client.dob);
      setPhone(client.phone || '');
    } catch (err) {
      toast.error('Не удалось загрузить клиента');
      navigate('/clients');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        dob,
        phone: phone.trim() || null,
      };

      if (isEditing) {
        await clientsApi.update(id, data);
        toast.success('Клиент обновлён');
        navigate(`/clients/${id}`);
      } else {
        const response = await clientsApi.create(data);
        toast.success('Клиент добавлен');
        navigate(`/clients/${response.data.id}`);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Произошла ошибка';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getYearWord = (age) => {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
  };

  if (fetchLoading) {
    return (
      <div className="container-responsive py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="card-shadow">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Загрузка клиента...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8">
      {/* Back button */}
      <Link 
        to={isEditing ? `/clients/${id}` : '/clients'} 
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isEditing ? 'Назад к клиенту' : 'Назад к клиентам'}
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle data-testid="client-form-title">
              {isEditing ? 'Редактировать клиента' : 'Новый клиент'}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Обновите информацию о клиенте' 
                : 'Введите данные клиента для добавления в базу'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="client-form">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванова"
                    required
                    maxLength={100}
                    data-testid="client-last-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Анна"
                    required
                    maxLength={100}
                    data-testid="client-first-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Сергеевна"
                    maxLength={100}
                    data-testid="client-middle-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Дата рождения</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  max={dayjs().format('YYYY-MM-DD')}
                  data-testid="client-dob-input"
                />
                {dob && (
                  <p className="text-sm text-muted-foreground">
                    Возраст: {dayjs().diff(dayjs(dob), 'year')} {getYearWord(dayjs().diff(dayjs(dob), 'year'))}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(isEditing ? `/clients/${id}` : '/clients')}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-press"
                  disabled={loading}
                  data-testid="client-form-submit"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Сохранение...</>
                  ) : (
                    isEditing ? 'Сохранить' : 'Добавить клиента'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
