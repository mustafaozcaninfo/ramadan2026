'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Volume2,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { areNotificationsEnabled, enableNotifications, disableNotifications, type NotificationPermission } from '@/lib/notifications';

export default function TestPage() {
  const t = useTranslations('notifications');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'checking' | 'registered' | 'not-supported' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default',
      });
    } else {
      setNotificationPermission({
        granted: false,
        denied: false,
        default: false,
      });
    }

    // Check Service Worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setServiceWorkerStatus('registered');
        } else {
          setServiceWorkerStatus('not-supported');
        }
      }).catch(() => {
        setServiceWorkerStatus('error');
      });
    } else {
      setServiceWorkerStatus('not-supported');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setTestResult('❌ Bu tarayıcı bildirimleri desteklemiyor');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission({
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      });
      
      if (permission === 'granted') {
        setTestResult('✅ Bildirim izni verildi!');
      } else {
        setTestResult('❌ Bildirim izni reddedildi');
      }
    } catch (error) {
      setTestResult(`❌ Hata: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotificationNow = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      setTestResult('⚠️ Önce bildirim izni verin!');
      return;
    }

    setIsLoading(true);
    setTestResult('');

    try {
      // Send notification
      const notification = new Notification('İftar Vakti!', {
        body: 'İftar vakti geldi - Test bildirimi',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-iftar-now',
        requireInteraction: false,
      });

      setTestResult('✅ Bildirim gönderildi!');

      // Play azan sound
      try {
        const audio = new Audio('/azan.mp3');
        audio.volume = 0.8;
        
        audio.onplay = () => {
          setTestResult((prev) => prev + '\n🔊 Ezan çalıyor...');
        };
        
        audio.onended = () => {
          setTestResult((prev) => prev + '\n✅ Ezan bitti');
        };
        
        audio.onerror = () => {
          setTestResult((prev) => prev + '\n⚠️ Ezan sesi çalınamadı (bazı tarayıcılar ses izni gerektirir)');
        };
        
        await audio.play();
      } catch (error) {
        setTestResult((prev) => prev + '\n⚠️ Ezan sesi çalınamadı');
      }
    } catch (error) {
      setTestResult(`❌ Bildirim gönderilemedi: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification15min = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      setTestResult('⚠️ Önce bildirim izni verin!');
      return;
    }

    setIsLoading(true);
    try {
      new Notification('15 dakika kaldı', {
        body: '15 dakika sonra İftar vakti - Test bildirimi',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-15min',
      });
      setTestResult('✅ 15 dakika bildirimi gönderildi!');
    } catch (error) {
      setTestResult(`❌ Bildirim gönderilemedi: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAzanSound = async () => {
    setIsLoading(true);
    setTestResult('');
    try {
      const audio = new Audio('/azan.mp3');
      audio.volume = 0.8;
      
      audio.onplay = () => {
        setTestResult('🔊 Ezan çalıyor...');
      };
      
      audio.onended = () => {
        setTestResult('✅ Ezan bitti');
      };
      
      audio.onerror = () => {
        setTestResult('⚠️ Ezan sesi çalınamadı');
      };
      
      await audio.play();
    } catch (error) {
      setTestResult(`❌ Ezan çalınamadı: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = () => {
    if (areNotificationsEnabled()) {
      disableNotifications();
      setTestResult('🔕 Bildirimler kapatıldı');
    } else {
      enableNotifications();
      setTestResult('🔔 Bildirimler açıldı');
    }
  };

  return (
    <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 safe-area-inset-top">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-ramadan-green to-ramadan-gold bg-clip-text text-transparent">
            🔔 Test Sayfası
          </h1>
          <LanguageSwitcher />
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Notification Permission Status */}
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Bildirim İzni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationPermission?.granted ? (
                  <Badge className="bg-ramadan-green text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    İzin Verildi
                  </Badge>
                ) : notificationPermission?.denied ? (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="w-3 h-3 mr-1" />
                    Reddedildi
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-600 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Bekleniyor
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Service Worker Status */}
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Service Worker
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceWorkerStatus === 'registered' ? (
                  <Badge className="bg-ramadan-green text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Aktif
                  </Badge>
                ) : serviceWorkerStatus === 'checking' ? (
                  <Badge className="bg-yellow-600 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Kontrol Ediliyor...
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="w-3 h-3 mr-1" />
                    Desteklenmiyor
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Bildirim Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Bildirimler</span>
                <Badge className={areNotificationsEnabled() ? 'bg-ramadan-green' : 'bg-slate-600'}>
                  {areNotificationsEnabled() ? 'Açık' : 'Kapalı'}
                </Badge>
              </div>
              <Button
                onClick={toggleNotifications}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {areNotificationsEnabled() ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Bildirimleri Kapat
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Bildirimleri Aç
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Buttons */}
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Test Butonları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={requestPermission}
                variant="default"
                className="w-full"
                disabled={isLoading || notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                Bildirim İzni İste
              </Button>

              <Button
                onClick={testNotificationNow}
                variant="default"
                className="w-full bg-ramadan-gold hover:bg-ramadan-gold/90 text-slate-900"
                disabled={isLoading || !notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                Şimdi Bildirim Gönder (Ezan ile)
              </Button>

              <Button
                onClick={testNotification15min}
                variant="outline"
                className="w-full"
                disabled={isLoading || !notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                15 Dakika Bildirimi Test
              </Button>

              <Button
                onClick={testAzanSound}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Sadece Ezan Sesi Test
              </Button>
            </CardContent>
          </Card>

          {/* Test Result */}
          {testResult && (
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Test Sonucu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-300 whitespace-pre-line">
                  {testResult}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Nasıl Çalışıyor?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>• <strong>15 dakika önce:</strong> &ldquo;15 dakika kaldı&rdquo; bildirimi</p>
              <p>• <strong>10 dakika önce:</strong> &ldquo;10 dakika kaldı&rdquo; bildirimi</p>
              <p>• <strong>5 dakika önce:</strong> &ldquo;5 dakika kaldı&rdquo; bildirimi</p>
              <p>• <strong>Tam zamanında:</strong> &ldquo;Sahur Vakti!&rdquo; / &ldquo;İftar Vakti!&rdquo; bildirimi + <strong>Ezan sesi çalar</strong></p>
              <p className="pt-2 text-xs text-slate-400">
                📱 iPhone&apos;da test için: Uygulamayı home screen&apos;e ekleyin ve bildirim izni verin.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </main>
  );
}
