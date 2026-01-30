import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsApi, statsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { 
  Settings as SettingsIcon, Database, Download, Upload, Lock, 
  Banknote, Mountain, Sparkles, Plus, X, Users, Calendar, 
  FileText, Clock, Loader2, Check, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  
  // Form states
  const [visitPrice, setVisitPrice] = useState('');
  const [retreatPrice, setRetreatPrice] = useState('');
  const [practices, setPractices] = useState([]);
  const [newPractice, setNewPractice] = useState('');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Backup/Restore
  const [restoring, setRestoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, statsRes] = await Promise.all([
        settingsApi.get(),
        statsApi.getDatabaseStats()
      ]);
      
      setSettings(settingsRes.data);
      setDbStats(statsRes.data);
      
      // Set form values
      setVisitPrice(settingsRes.data.default_visit_price || 15000);
      setRetreatPrice(settingsRes.data.default_retreat_price || 30000);
      setPractices(settingsRes.data.practices || []);
    } catch (err) {
      toast.error('Не удалось загрузить настройки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await settingsApi.update({
        default_visit_price: parseInt(visitPrice) || 15000,
        default_retreat_price: parseInt(retreatPrice) || 30000,
        practices: practices
      });
      toast.success('Настройки сохранены');
    } catch (err) {
      toast.error('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPractice = () => {
    if (newPractice.trim() && !practices.includes(newPractice.trim())) {
      setPractices([...practices, newPractice.trim()]);
      setNewPractice('');
    }
  };

  const handleRemovePractice = (practice) => {
    setPractices(practices.filter(p => p !== practice));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    
    try {
      setChangingPassword(true);
      await settingsApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Не удалось изменить пароль');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      const response = await settingsApi.getBackup();
      const backup = response.data;
      
      // Create and download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kinesio-backup-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Резервная копия скачана');
    } catch (err) {
      toast.error('Не удалось создать резервную копию');
    } finally {
      setDownloading(false);
    }
  };

  const handleRestoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Close dialog immediately to prevent UI issues
    setRestoreDialogOpen(false);
    
    try {
      setRestoring(true);
      const text = await file.text();
      const backup = JSON.parse(text);
      
      // Validate backup structure
      if (!backup.clients || !backup.visits || !backup.retreats) {
        throw new Error('Неверный формат файла резервной копии');
      }
      
      await settingsApi.restore({
        clients: backup.clients,
        visits: backup.visits,
        retreats: backup.retreats,
        settings: backup.settings
      });
      
      toast.success('Данные успешно восстановлены');
      fetchData(); // Refresh stats
    } catch (err) {
      toast.error(err.message || 'Не удалось восстановить данные');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };
  
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="container-responsive py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[hsl(var(--primary))]" />
          Настройки
        </h1>
        <p className="text-muted-foreground mt-1">Управление приложением и данными</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Statistics */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[hsl(var(--primary))]" />
              Статистика базы данных
            </CardTitle>
            <CardDescription>Информация о хранимых данных</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{dbStats?.clients_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Клиентов</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{dbStats?.visits_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Визитов</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mountain className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{dbStats?.retreats_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Ретритов</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{dbStats?.total_records || 0}</p>
                  <p className="text-xs text-muted-foreground">Всего записей</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2">
              {dbStats?.oldest_record && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Начало работы:
                  </span>
                  <span className="font-medium">{dayjs(dbStats.oldest_record).format('D MMMM YYYY')}</span>
                </div>
              )}
              {dbStats?.last_update && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Последнее обновление:
                  </span>
                  <span className="font-medium">{dayjs(dbStats.last_update).format('D MMM YYYY, HH:mm')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[hsl(var(--primary))]" />
              Резервное копирование
            </CardTitle>
            <CardDescription>Создание и восстановление резервных копий</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Скачать резервную копию
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Сохраните все данные (клиенты, визиты, ретриты) в JSON файл
              </p>
              <Button onClick={handleDownloadBackup} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Скачать backup
              </Button>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                Восстановить из копии
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Внимание: это заменит все текущие данные!
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-amber-300 hover:bg-amber-100">
                    <Upload className="w-4 h-4 mr-2" />
                    Восстановить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Восстановить данные?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие удалит все текущие данные и заменит их данными из резервной копии. 
                      Это действие нельзя отменить.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md">
                        {restoring ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Выбрать файл'
                        )}
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreBackup}
                          className="hidden"
                          disabled={restoring}
                        />
                      </label>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Default Prices */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[hsl(var(--primary))]" />
              Цены по умолчанию
            </CardTitle>
            <CardDescription>Стандартные цены для новых записей</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visit-price" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Цена визита (₽)
              </Label>
              <Input
                id="visit-price"
                type="number"
                min="0"
                step="500"
                value={visitPrice}
                onChange={(e) => setVisitPrice(e.target.value)}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retreat-price" className="flex items-center gap-2">
                <Mountain className="w-4 h-4" />
                Цена ретрита (₽)
              </Label>
              <Input
                id="retreat-price"
                type="number"
                min="0"
                step="500"
                value={retreatPrice}
                onChange={(e) => setRetreatPrice(e.target.value)}
                placeholder="30000"
              />
            </div>
            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Сохранить цены
            </Button>
          </CardContent>
        </Card>

        {/* Practices Management */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
              Список практик
            </CardTitle>
            <CardDescription>Управление доступными практиками</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {practices.map((practice) => (
                <Badge
                  key={practice}
                  variant="secondary"
                  className="text-sm py-1 px-3 flex items-center gap-1"
                >
                  {practice}
                  <button
                    onClick={() => handleRemovePractice(practice)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newPractice}
                onChange={(e) => setNewPractice(e.target.value)}
                placeholder="Новая практика..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddPractice()}
              />
              <Button onClick={handleAddPractice} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Сохранить практики
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="card-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[hsl(var(--primary))]" />
              Изменить пароль
            </CardTitle>
            <CardDescription>Обновите пароль для входа в систему</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleChangePassword} 
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Изменить пароль
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="container-responsive py-8">
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
