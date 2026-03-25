'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { MenuButton } from '@/components/MenuButton';
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Volume2,
  Smartphone,
  Activity,
  Wifi,
  WifiOff,
  ClipboardCopy,
  RefreshCw
} from 'lucide-react';
import { areNotificationsEnabled, enableNotifications, disableNotifications, type NotificationPermission } from '@/lib/notifications';

export default function TestPage() {
  const t = useTranslations('notifications');
  const locale = useLocale() as 'tr' | 'en' | 'ar';
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'checking' | 'registered' | 'not-supported' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasNotificationApi, setHasNotificationApi] = useState(false);
  const [hasPushManager, setHasPushManager] = useState(false);
  const [hasSwController, setHasSwController] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>('');
  const [notificationsEnabledUI, setNotificationsEnabledUI] = useState(false);
  const copy = {
    tr: {
      browserUnsupported: '❌ Bu tarayıcı bildirimleri desteklemiyor',
      permissionGranted: '✅ Bildirim izni verildi!',
      permissionDenied: '❌ Bildirim izni reddedildi',
      errorPrefix: '❌ Hata',
      grantPermissionFirst: '⚠️ Önce bildirim izni verin!',
      notificationSent: '✅ Bildirim gönderildi!',
      azanPlaying: '🔊 Ezan çalıyor...',
      azanEnded: '✅ Ezan bitti',
      azanCannotPlayDetailed: '⚠️ Ezan sesi çalınamadı (bazı tarayıcılar ses izni gerektirir)',
      azanCannotPlay: '⚠️ Ezan sesi çalınamadı',
      notificationSendFailed: '❌ Bildirim gönderilemedi',
      azanPlayFailed: '❌ Ezan çalınamadı',
      fifteenTitle: '15 dakika kaldı',
      fifteenBody: '15 dakika sonra İftar vakti - Test bildirimi',
      fifteenSent: '✅ 15 dakika bildirimi gönderildi!',
      notificationsOff: '🔕 Bildirimler kapatıldı',
      notificationsOn: '🔔 Bildirimler açıldı',
      headerTitle: '🔔 Test Sayfası',
      headerSubtitle: 'Notification ve Service Worker doğrulama paneli',
      permissionCard: 'Bildirim İzni',
      permissionAllowed: 'İzin Verildi',
      permissionRejected: 'Reddedildi',
      permissionPending: 'Bekleniyor',
      serviceWorker: 'Service Worker',
      swActive: 'Aktif',
      swChecking: 'Kontrol Ediliyor...',
      swUnsupported: 'Desteklenmiyor',
      settingsTitle: 'Bildirim Ayarları',
      notificationsLabel: 'Bildirimler',
      on: 'Açık',
      off: 'Kapalı',
      disableBtn: 'Bildirimleri Kapat',
      enableBtn: 'Bildirimleri Aç',
      testButtonsTitle: 'Test Butonları',
      askPermission: 'Bildirim İzni İste',
      sendNow: 'Şimdi Bildirim Gönder (Ezan ile)',
      test15: '15 Dakika Bildirimi Test',
      testAzan: 'Sadece Ezan Sesi Test',
      resultTitle: 'Test Sonucu',
      infoTitle: 'ℹ️ Nasıl Çalışıyor?',
      info15: '• 15 dakika önce: “15 dakika kaldı” bildirimi',
      info10: '• 10 dakika önce: “10 dakika kaldı” bildirimi',
      info5: '• 5 dakika önce: “5 dakika kaldı” bildirimi',
      infoNow: '• Tam zamanında: “Sahur Vakti!” / “İftar Vakti!” bildirimi + ezan sesi',
      iphoneNote: '📱 iPhone test: Uygulamayı ana ekrana ekleyin ve bildirim izni verin.',
      overviewTitle: 'Genel Durum',
      overviewSubtitle: 'Canlı capability görünümü ve hızlı teşhis araçları',
      capabilityTitle: 'Yetenek Durumu',
      quickActionsTitle: 'Hızlı Aksiyonlar',
      refreshDiagnostics: 'Durumu Yenile',
      quickHealthCheck: 'Hızlı Sağlık Kontrolü',
      copyDiagnostics: 'Tanı JSON Kopyala',
      diagnosticsCopied: '✅ Tanı verisi kopyalandı',
      diagnosticsCopyFailed: '❌ Tanı verisi kopyalanamadı',
      diagnosticsRefreshed: '✅ Durum yenilendi',
      capNotificationApi: 'Notification API',
      capPushApi: 'PushManager',
      capServiceWorker: 'Service Worker',
      capSwController: 'SW Controller',
      capOnline: 'Ağ Durumu',
      capStandalone: 'PWA Standalone',
      lastChecked: 'Son kontrol',
      supported: 'Destekleniyor',
      unsupported: 'Desteklenmiyor',
      controlled: 'Bağlı',
      notControlled: 'Bağlı değil',
      online: 'Çevrimiçi',
      offline: 'Çevrimdışı',
      enabledState: 'Açık',
      disabledState: 'Kapalı',
    },
    en: {
      browserUnsupported: '❌ This browser does not support notifications',
      permissionGranted: '✅ Notification permission granted!',
      permissionDenied: '❌ Notification permission denied',
      errorPrefix: '❌ Error',
      grantPermissionFirst: '⚠️ Please grant notification permission first!',
      notificationSent: '✅ Notification sent!',
      azanPlaying: '🔊 Azan is playing...',
      azanEnded: '✅ Azan ended',
      azanCannotPlayDetailed: '⚠️ Could not play azan sound (some browsers require audio permission)',
      azanCannotPlay: '⚠️ Could not play azan sound',
      notificationSendFailed: '❌ Failed to send notification',
      azanPlayFailed: '❌ Failed to play azan',
      fifteenTitle: '15 minutes remaining',
      fifteenBody: '15 minutes until Iftar - Test notification',
      fifteenSent: '✅ 15-minute notification sent!',
      notificationsOff: '🔕 Notifications disabled',
      notificationsOn: '🔔 Notifications enabled',
      headerTitle: '🔔 Test Page',
      headerSubtitle: 'Notification and Service Worker verification panel',
      permissionCard: 'Notification Permission',
      permissionAllowed: 'Granted',
      permissionRejected: 'Denied',
      permissionPending: 'Pending',
      serviceWorker: 'Service Worker',
      swActive: 'Active',
      swChecking: 'Checking...',
      swUnsupported: 'Not supported',
      settingsTitle: 'Notification Settings',
      notificationsLabel: 'Notifications',
      on: 'On',
      off: 'Off',
      disableBtn: 'Disable Notifications',
      enableBtn: 'Enable Notifications',
      testButtonsTitle: 'Test Buttons',
      askPermission: 'Request Notification Permission',
      sendNow: 'Send Notification Now (with Azan)',
      test15: 'Test 15-Min Notification',
      testAzan: 'Test Azan Sound Only',
      resultTitle: 'Test Result',
      infoTitle: 'ℹ️ How it works',
      info15: '• 15 min before: “15 minutes remaining” notification',
      info10: '• 10 min before: “10 minutes remaining” notification',
      info5: '• 5 min before: “5 minutes remaining” notification',
      infoNow: '• On time: “Suhoor Time!” / “Iftar Time!” notification + azan sound',
      iphoneNote: '📱 iPhone test: Add app to Home Screen and grant notification permission.',
      overviewTitle: 'Overview',
      overviewSubtitle: 'Live capability status and quick diagnostic tools',
      capabilityTitle: 'Capability Status',
      quickActionsTitle: 'Quick Actions',
      refreshDiagnostics: 'Refresh Status',
      quickHealthCheck: 'Quick Health Check',
      copyDiagnostics: 'Copy Diagnostics JSON',
      diagnosticsCopied: '✅ Diagnostics copied',
      diagnosticsCopyFailed: '❌ Failed to copy diagnostics',
      diagnosticsRefreshed: '✅ Status refreshed',
      capNotificationApi: 'Notification API',
      capPushApi: 'PushManager',
      capServiceWorker: 'Service Worker',
      capSwController: 'SW Controller',
      capOnline: 'Network',
      capStandalone: 'PWA Standalone',
      lastChecked: 'Last checked',
      supported: 'Supported',
      unsupported: 'Unsupported',
      controlled: 'Controlled',
      notControlled: 'Not controlled',
      online: 'Online',
      offline: 'Offline',
      enabledState: 'On',
      disabledState: 'Off',
    },
    ar: {
      browserUnsupported: '❌ هذا المتصفح لا يدعم الإشعارات',
      permissionGranted: '✅ تم منح إذن الإشعارات!',
      permissionDenied: '❌ تم رفض إذن الإشعارات',
      errorPrefix: '❌ خطأ',
      grantPermissionFirst: '⚠️ الرجاء منح إذن الإشعارات أولاً!',
      notificationSent: '✅ تم إرسال الإشعار!',
      azanPlaying: '🔊 يتم تشغيل الأذان...',
      azanEnded: '✅ انتهى الأذان',
      azanCannotPlayDetailed: '⚠️ تعذر تشغيل صوت الأذان (قد تتطلب بعض المتصفحات إذن الصوت)',
      azanCannotPlay: '⚠️ تعذر تشغيل صوت الأذان',
      notificationSendFailed: '❌ تعذر إرسال الإشعار',
      azanPlayFailed: '❌ تعذر تشغيل الأذان',
      fifteenTitle: 'متبقي 15 دقيقة',
      fifteenBody: 'متبقي 15 دقيقة على الإفطار - إشعار اختبار',
      fifteenSent: '✅ تم إرسال إشعار 15 دقيقة!',
      notificationsOff: '🔕 تم إيقاف الإشعارات',
      notificationsOn: '🔔 تم تفعيل الإشعارات',
      headerTitle: '🔔 صفحة الاختبار',
      headerSubtitle: 'لوحة التحقق من الإشعارات وService Worker',
      permissionCard: 'إذن الإشعارات',
      permissionAllowed: 'مسموح',
      permissionRejected: 'مرفوض',
      permissionPending: 'قيد الانتظار',
      serviceWorker: 'Service Worker',
      swActive: 'نشط',
      swChecking: 'جارٍ التحقق...',
      swUnsupported: 'غير مدعوم',
      settingsTitle: 'إعدادات الإشعارات',
      notificationsLabel: 'الإشعارات',
      on: 'مفعّل',
      off: 'متوقف',
      disableBtn: 'إيقاف الإشعارات',
      enableBtn: 'تفعيل الإشعارات',
      testButtonsTitle: 'أزرار الاختبار',
      askPermission: 'طلب إذن الإشعارات',
      sendNow: 'إرسال إشعار الآن (مع الأذان)',
      test15: 'اختبار إشعار 15 دقيقة',
      testAzan: 'اختبار صوت الأذان فقط',
      resultTitle: 'نتيجة الاختبار',
      infoTitle: 'ℹ️ كيف يعمل',
      info15: '• قبل 15 دقيقة: إشعار “متبقي 15 دقيقة”',
      info10: '• قبل 10 دقائق: إشعار “متبقي 10 دقائق”',
      info5: '• قبل 5 دقائق: إشعار “متبقي 5 دقائق”',
      infoNow: '• عند الوقت: إشعار “وقت السحور!” / “وقت الإفطار!” + صوت الأذان',
      iphoneNote: '📱 لاختبار iPhone: أضف التطبيق للشاشة الرئيسية واسمح بالإشعارات.',
      overviewTitle: 'نظرة عامة',
      overviewSubtitle: 'عرض حي للقدرات وأدوات تشخيص سريعة',
      capabilityTitle: 'حالة القدرات',
      quickActionsTitle: 'إجراءات سريعة',
      refreshDiagnostics: 'تحديث الحالة',
      quickHealthCheck: 'فحص صحة سريع',
      copyDiagnostics: 'نسخ تشخيص JSON',
      diagnosticsCopied: '✅ تم نسخ التشخيص',
      diagnosticsCopyFailed: '❌ تعذر نسخ التشخيص',
      diagnosticsRefreshed: '✅ تم تحديث الحالة',
      capNotificationApi: 'واجهة Notification',
      capPushApi: 'PushManager',
      capServiceWorker: 'Service Worker',
      capSwController: 'SW Controller',
      capOnline: 'الشبكة',
      capStandalone: 'وضع PWA',
      lastChecked: 'آخر فحص',
      supported: 'مدعوم',
      unsupported: 'غير مدعوم',
      controlled: 'مرتبط',
      notControlled: 'غير مرتبط',
      online: 'متصل',
      offline: 'غير متصل',
      enabledState: 'مفعّل',
      disabledState: 'متوقف',
    },
  }[locale];

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
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    setHasNotificationApi(typeof window !== 'undefined' && 'Notification' in window);
    setHasPushManager(typeof window !== 'undefined' && 'PushManager' in window);
    setNotificationsEnabledUI(areNotificationsEnabled());
    setHasSwController(
      typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller
    );
    setIsStandalone(
      typeof window !== 'undefined' &&
        (window.matchMedia?.('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true)
    );
    setLastCheckedAt(new Date().toLocaleTimeString());

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const refreshDiagnostics = async () => {
    setIsLoading(true);
    try {
      const nextOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const nextHasNotificationApi = typeof window !== 'undefined' && 'Notification' in window;
      const nextHasPushManager = typeof window !== 'undefined' && 'PushManager' in window;
      const nextHasSwController =
        typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;
      const nextIsStandalone =
        typeof window !== 'undefined' &&
        (window.matchMedia?.('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true);
      setIsOnline(nextOnline);
      setHasNotificationApi(nextHasNotificationApi);
      setHasPushManager(nextHasPushManager);
      setNotificationsEnabledUI(areNotificationsEnabled());
      setHasSwController(nextHasSwController);
      setIsStandalone(nextIsStandalone);
      let nextSwStatus: 'checking' | 'registered' | 'not-supported' | 'error' = serviceWorkerStatus;
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          nextSwStatus = registration ? 'registered' : 'not-supported';
          setServiceWorkerStatus(nextSwStatus);
        } catch {
          nextSwStatus = 'error';
          setServiceWorkerStatus('error');
        }
      } else {
        nextSwStatus = 'not-supported';
        setServiceWorkerStatus(nextSwStatus);
      }
      setLastCheckedAt(new Date().toLocaleTimeString());
      setTestResult(
        [
          copy.diagnosticsRefreshed,
          `• Notification API: ${nextHasNotificationApi ? copy.supported : copy.unsupported}`,
          `• PushManager: ${nextHasPushManager ? copy.supported : copy.unsupported}`,
          `• Service Worker: ${nextSwStatus}`,
          `• ${copy.capOnline}: ${nextOnline ? copy.online : copy.offline}`,
        ].join('\n')
      );
    } catch (error) {
      setTestResult(`${copy.errorPrefix}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickHealthCheck = () => {
    const checks = [
      { ok: hasNotificationApi, label: copy.capNotificationApi },
      { ok: hasPushManager, label: copy.capPushApi },
      { ok: serviceWorkerStatus === 'registered', label: copy.capServiceWorker },
      { ok: hasSwController, label: copy.capSwController },
      { ok: isOnline, label: copy.capOnline },
    ];
    const summary = checks
      .map((c) => `${c.ok ? '✅' : '❌'} ${c.label}`)
      .join('\n');
    setTestResult(summary);
  };

  const copyDiagnostics = async () => {
    try {
      const payload = {
        checkedAt: new Date().toISOString(),
        locale,
        notificationPermission,
        notificationsEnabled: notificationsEnabledUI,
        serviceWorkerStatus,
        hasSwController,
        hasNotificationApi,
        hasPushManager,
        isOnline,
        isStandalone,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a',
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setTestResult(copy.diagnosticsCopied);
    } catch {
      setTestResult(copy.diagnosticsCopyFailed);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setTestResult(copy.browserUnsupported);
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
        setTestResult(copy.permissionGranted);
      } else {
        setTestResult(copy.permissionDenied);
      }
    } catch (error) {
      setTestResult(`${copy.errorPrefix}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotificationNow = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      setTestResult(copy.grantPermissionFirst);
      return;
    }

    setIsLoading(true);
    setTestResult('');

    try {
      // Send notification
      const notification = new Notification(t('titleMaghribNow'), {
        body: t('bodyMaghribNow'),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-iftar-now',
        requireInteraction: false,
      });

      setTestResult(copy.notificationSent);

      // Play azan sound
      try {
        const audio = new Audio('/azan.mp3');
        audio.volume = 0.8;
        
        audio.onplay = () => {
          setTestResult((prev) => prev + `\n${copy.azanPlaying}`);
        };
        
        audio.onended = () => {
          setTestResult((prev) => prev + `\n${copy.azanEnded}`);
        };
        
        audio.onerror = () => {
          setTestResult((prev) => prev + `\n${copy.azanCannotPlayDetailed}`);
        };
        
        await audio.play();
      } catch (error) {
        setTestResult((prev) => prev + `\n${copy.azanCannotPlay}`);
      }
    } catch (error) {
      setTestResult(`${copy.notificationSendFailed}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification15min = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      setTestResult(copy.grantPermissionFirst);
      return;
    }

    setIsLoading(true);
    try {
      new Notification(copy.fifteenTitle, {
        body: copy.fifteenBody,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-15min',
      });
      setTestResult(copy.fifteenSent);
    } catch (error) {
      setTestResult(`${copy.notificationSendFailed}: ${error}`);
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
        setTestResult(copy.azanPlaying);
      };
      
      audio.onended = () => {
        setTestResult(copy.azanEnded);
      };
      
      audio.onerror = () => {
        setTestResult(copy.azanCannotPlay);
      };
      
      await audio.play();
    } catch (error) {
      setTestResult(`${copy.azanPlayFailed}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabledUI) {
      disableNotifications();
      setNotificationsEnabledUI(false);
      setTestResult(copy.notificationsOff);
    } else {
      enableNotifications();
      setNotificationsEnabledUI(true);
      setTestResult(copy.notificationsOn);
    }
  };

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 safe-area-inset-top">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {copy.headerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {copy.headerSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <MenuButton locale={locale} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-green" />
                {copy.overviewTitle}
              </CardTitle>
              <p className="text-sm text-slate-400">{copy.overviewSubtitle}</p>
              <p className="text-xs text-slate-500">
                {copy.lastChecked}: {lastCheckedAt || '—'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">{copy.capabilityTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{copy.capNotificationApi}</span>
                  <Badge className={hasNotificationApi ? 'bg-emerald-600' : 'bg-red-600'}>
                    {hasNotificationApi ? copy.supported : copy.unsupported}
                  </Badge>
                </div>
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{copy.capPushApi}</span>
                  <Badge className={hasPushManager ? 'bg-emerald-600' : 'bg-red-600'}>
                    {hasPushManager ? copy.supported : copy.unsupported}
                  </Badge>
                </div>
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{copy.capServiceWorker}</span>
                  <Badge className={serviceWorkerStatus === 'registered' ? 'bg-emerald-600' : 'bg-red-600'}>
                    {serviceWorkerStatus === 'registered' ? copy.enabledState : copy.disabledState}
                  </Badge>
                </div>
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{copy.capSwController}</span>
                  <Badge className={hasSwController ? 'bg-emerald-600' : 'bg-yellow-600'}>
                    {hasSwController ? copy.controlled : copy.notControlled}
                  </Badge>
                </div>
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {copy.capOnline}
                  </span>
                  <Badge className={isOnline ? 'bg-emerald-600' : 'bg-red-600'}>
                    {isOnline ? copy.online : copy.offline}
                  </Badge>
                </div>
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{copy.capStandalone}</span>
                  <Badge className={isStandalone ? 'bg-emerald-600' : 'bg-slate-600'}>
                    {isStandalone ? copy.enabledState : copy.disabledState}
                  </Badge>
                </div>
              </div>
              <h3 className="pt-2 text-sm font-semibold text-slate-300">{copy.quickActionsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={refreshDiagnostics} variant="outline" className="w-full" disabled={isLoading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {copy.refreshDiagnostics}
                </Button>
                <Button onClick={runQuickHealthCheck} variant="outline" className="w-full" disabled={isLoading}>
                  <Activity className="w-4 h-4 mr-2" />
                  {copy.quickHealthCheck}
                </Button>
                <Button onClick={copyDiagnostics} variant="outline" className="w-full" disabled={isLoading}>
                  <ClipboardCopy className="w-4 h-4 mr-2" />
                  {copy.copyDiagnostics}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Notification Permission Status */}
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {copy.permissionCard}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationPermission?.granted ? (
                  <Badge className="bg-brand-green text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {copy.permissionAllowed}
                  </Badge>
                ) : notificationPermission?.denied ? (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="w-3 h-3 mr-1" />
                    {copy.permissionRejected}
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-600 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {copy.permissionPending}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Service Worker Status */}
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {copy.serviceWorker}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceWorkerStatus === 'registered' ? (
                  <Badge className="bg-brand-green text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {copy.swActive}
                  </Badge>
                ) : serviceWorkerStatus === 'checking' ? (
                  <Badge className="bg-yellow-600 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {copy.swChecking}
                  </Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="w-3 h-3 mr-1" />
                    {copy.swUnsupported}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">{copy.settingsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{copy.notificationsLabel}</span>
                <Badge className={notificationsEnabledUI ? 'bg-brand-green' : 'bg-slate-600'}>
                  {notificationsEnabledUI ? copy.on : copy.off}
                </Badge>
              </div>
              <Button
                onClick={toggleNotifications}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {notificationsEnabledUI ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    {copy.disableBtn}
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    {copy.enableBtn}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Buttons */}
          <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">{copy.testButtonsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={requestPermission}
                variant="default"
                className="w-full"
                disabled={isLoading || notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                {copy.askPermission}
              </Button>

              <Button
                onClick={testNotificationNow}
                variant="default"
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-slate-900"
                disabled={isLoading || !notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                {copy.sendNow}
              </Button>

              <Button
                onClick={testNotification15min}
                variant="outline"
                className="w-full"
                disabled={isLoading || !notificationPermission?.granted}
              >
                <Bell className="w-4 h-4 mr-2" />
                {copy.test15}
              </Button>

              <Button
                onClick={testAzanSound}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {copy.testAzan}
              </Button>
            </CardContent>
          </Card>

          {/* Test Result */}
          {testResult && (
            <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">{copy.resultTitle}</CardTitle>
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
              <CardTitle className="text-lg">{copy.infoTitle}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>{copy.info15}</p>
              <p>{copy.info10}</p>
              <p>{copy.info5}</p>
              <p>{copy.infoNow}</p>
              <p className="pt-2 text-xs text-slate-400">
                {copy.iphoneNote}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Navigation />
    </main>
  );
}
