'use client';

import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Beaker, 
  AlertTriangle, 
  ShieldCheck, 
  Power, 
  Terminal, 
  RefreshCw,
  Plus,
  Search,
  Trash2,
  Activity,
  X,
  Check,
  HelpCircle,
  Home,
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  LogIn,
  LogOut,
  BookOpen,
  Users,
  CheckCircle,
  MessageSquare,
  Calendar,
  User,
  ArrowLeft
} from 'lucide-react';
import { useFeatureFlag } from '../lib/feature-flags/useFeatureFlag';
import { FLAGS } from '../lib/feature-flags/flags';

interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  value: any;
  enabled: boolean;
  updatedAt: string;
}

interface RequestItem {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';
  type: string;
  data: {
    subdomain: string;
    targetType: 'A' | 'CNAME';
    targetValue: string;
    description: string;
    link?: string;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  time: string;
  action: string;
  flagKey: string;
  details: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'validate' | 'request' | 'my-requests' | 'blog' | 'admin'>('home');
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Discord login integration
  const [discordUser, setDiscordUser] = useState<{ id: string; username: string; avatarUrl?: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginDiscordId, setLoginDiscordId] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Selected blog post for modal
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Admin sub-tab
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'requests' | 'flags' | 'logs'>('requests');

  // API loading states
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  // Subdomain validation states
  const [validationSubdomain, setValidationSubdomain] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string; code?: string } | null>(null);

  // New Request Form states
  const [reqSubdomain, setReqSubdomain] = useState('');
  const [reqTargetType, setReqTargetType] = useState<'A' | 'CNAME'>('A');
  const [reqTargetValue, setReqTargetValue] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqLink, setReqLink] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  // Feature flag toggle/edit state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newValueType, setNewValueType] = useState<'boolean' | 'json'>('boolean');
  const [newBoolValue, setNewBoolValue] = useState(false);
  const [newJsonValue, setNewJsonValue] = useState('{\n  "enabled": true\n}');
  const [newEnabled, setNewEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingFlag, setSubmittingFlag] = useState(false);

  // Live log simulation
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      time: new Date(Date.now() - 5 * 60000).toLocaleTimeString('he-IL'),
      action: 'מערכת אותחלה',
      flagKey: 'SYSTEM',
      details: 'מנוע OpenFeature נטען בהצלחה'
    }
  ]);

  const addAuditLog = (action: string, flagKey: string, details: string) => {
    setAuditLogs(prev => [
      {
        time: new Date().toLocaleTimeString('he-IL'),
        action,
        flagKey,
        details
      },
      ...prev.slice(0, 8)
    ]);
  };

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  // Initial user loading
  useEffect(() => {
    const initializeUser = async () => {
      // Restore Discord User if saved
      const storedDiscordUser = localStorage.getItem('mefateach_discord_user');
      const storedUserId = localStorage.getItem('mefateach_user_id');
      
      if (storedDiscordUser) {
        try {
          const parsed = JSON.parse(storedDiscordUser);
          setDiscordUser(parsed);
        } catch (e) {}
      }

      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Fallback guest register
        try {
          const res = await fetch(`${backendUrl}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'אורח מפתח',
              role: 'USER',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.id) {
              setUserId(data.id);
              localStorage.setItem('mefateach_user_id', data.id);
            }
          }
        } catch (e) {
          console.error('Failed to create guest user:', e);
        }
      }
    };
    initializeUser();
    fetchFlags();
    fetchRequests();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoadingFlags(true);
      const response = await fetch(`${backendUrl}/api/feature-flags`);
      if (!response.ok) throw new Error('נכשלה טעינת דגלי תכונות');
      const data = await response.json();
      setFlags(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'שגיאה לא ידועה בטעינת דגלי התכונות');
    } finally {
      setLoadingFlags(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await fetch(`${backendUrl}/api/requests`);
      if (!response.ok) throw new Error('נכשלה טעינת בקשות הדומיינים');
      const data = await response.json();
      const formatted = data.map((r: any) => {
        let parsedData = r.data;
        if (typeof r.data === 'string') {
          try { parsedData = JSON.parse(r.data); } catch(e) {}
        }
        return { ...r, data: parsedData };
      });
      setRequests(formatted);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Discord Login Submission
  const handleDiscordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginDiscordId.trim() || !loginUsername.trim()) {
      setLoginError('נא למלא את כל השדות');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/discord/${loginDiscordId.trim()}?name=${encodeURIComponent(loginUsername.trim())}`);
      if (res.ok) {
        const user = await res.json();
        const discordProfile = {
          id: user.discordId || loginDiscordId.trim(),
          username: user.name || loginUsername.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(loginUsername.trim())}`
        };
        setDiscordUser(discordProfile);
        setUserId(user.id);
        localStorage.setItem('mefateach_user_id', user.id);
        localStorage.setItem('mefateach_discord_user', JSON.stringify(discordProfile));
        setShowLoginModal(false);
        addAuditLog('התחברות דיסקורד', 'AUTH', `משתמש הדיסקורד ${discordProfile.username} התחבר`);
        fetchRequests();
      } else {
        throw new Error('שגיאה בתקשורת עם שרת האימות');
      }
    } catch (err: any) {
      setLoginError(err.message || 'ההתחברות נכשלה, נסה שוב');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setDiscordUser(null);
    localStorage.removeItem('mefateach_discord_user');
    // We keep the raw guest/existing userId or clear it
    addAuditLog('התנתקות דיסקורד', 'AUTH', 'חיבור הדיסקורד הוסר בהצלחה');
  };

  const handleSubdomainValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationSubdomain.trim()) return;

    setValidationLoading(true);
    setValidationResult(null);

    try {
      const res = await fetch(`${backendUrl}/api/requests/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: validationSubdomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      setValidationResult({ valid: false, error: 'לא ניתן ליצור קשר עם שרת האימות' });
    } finally {
      setValidationLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(null);
    setReqSuccess(null);

    if (!reqSubdomain.trim() || !reqTargetValue.trim() || !reqDescription.trim()) {
      setReqError('נא למלא את כל שדות החובה');
      return;
    }

    setReqLoading(true);

    try {
      // 1. Submit request payload
      const submitRes = await fetch(`${backendUrl}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'SUBDOMAIN',
          data: {
            subdomain: reqSubdomain.trim().toLowerCase(),
            targetType: reqTargetType,
            targetValue: reqTargetValue.trim(),
            description: reqDescription.trim(),
            link: reqLink.trim() || undefined,
            reason: reqReason.trim() || undefined,
          },
        }),
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json();
        throw new Error(errData.error || 'נכשלה שליחת הבקשה לבקאנד');
      }

      const created = await submitRes.json();
      setReqSuccess(created.id);
      addAuditLog('יצירת בקשה', reqSubdomain.trim(), 'בקשת רישום דומיין חדשה נשלחה לבדיקה');
      
      // Clear form
      setReqSubdomain('');
      setReqTargetValue('');
      setReqDescription('');
      setReqLink('');
      setReqReason('');
      fetchRequests();
    } catch (err: any) {
      setReqError(err.message || 'שגיאה בשליחת הטופס');
    } finally {
      setReqLoading(false);
    }
  };

  const handleReviewAction = async (requestId: string, action: 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES') => {
    try {
      const response = await fetch(`${backendUrl}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) throw new Error('עדכון הבקשה נכשל');
      
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action } : r));
      addAuditLog('עדכון בקשה', requestId, `סטטוס בקשת הרישום עודכן ל-${action}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      setUpdatingKey(key);
      const response = await fetch(`${backendUrl}/api/feature-flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (!response.ok) throw new Error('עדכון הדגל נכשל');
      
      setFlags(prevFlags =>
        prevFlags.map(flag =>
          flag.key === key ? { ...flag, enabled: !currentEnabled } : flag
        )
      );
      addAuditLog('עדכון דגל', key, `סטטוס הדגל שונה ל-${!currentEnabled ? 'פעיל' : 'כבוי'}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingKey(null);
    }
  };

  const toggleValue = async (key: string, currentValue: boolean) => {
    try {
      setUpdatingKey(key);
      const response = await fetch(`${backendUrl}/api/feature-flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: !currentValue }),
      });

      if (!response.ok) throw new Error('עדכון ערך הדגל נכשל');
      
      setFlags(prevFlags =>
        prevFlags.map(flag =>
          flag.key === key ? { ...flag, value: !currentValue } : flag
        )
      );
      addAuditLog('ערך דגל', key, `הערך שונה ל-${!currentValue}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingKey(null);
    }
  };

  const deleteFlag = async (key: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הדגל "${key}"?`)) return;
    try {
      setUpdatingKey(key);
      const response = await fetch(`${backendUrl}/api/feature-flags/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('מחיקת הדגל נכשלה');
      
      setFlags(prevFlags => prevFlags.filter(flag => flag.key !== key));
      addAuditLog('מחיקת דגל', key, 'דגל התכונה נמחק לצמיתות');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newKey.trim()) {
      setFormError('מפתח הדגל הוא שדה חובה');
      return;
    }

    const keyRegex = /^[a-z0-9-_]+$/;
    if (!keyRegex.test(newKey.trim())) {
      setFormError('המפתח חייב להכיל אותיות קטנות באנגלית, מספרים, מקפים או קווים תחתיים בלבד');
      return;
    }

    let parsedValue: any = newBoolValue;
    if (newValueType === 'json') {
      try {
        parsedValue = JSON.parse(newJsonValue);
      } catch (err) {
        setFormError('ערך ה-JSON אינו תקין');
        return;
      }
    }

    try {
      setSubmittingFlag(true);
      const response = await fetch(`${backendUrl}/api/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey.trim(),
          description: newDescription.trim() || undefined,
          value: parsedValue,
          enabled: newEnabled,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'יצירת הדגל נכשלה');
      }

      const createdFlag = await response.json();
      setFlags(prev => [createdFlag, ...prev]);
      addAuditLog('יצירה', createdFlag.key, `דגל חדש נוצר בהצלחה`);
      
      // Reset
      setNewKey('');
      setNewDescription('');
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmittingFlag(false);
    }
  };

  const userRequestsList = requests.filter(r => r.userId === userId);
  const pendingRequestsQueue = requests.filter(r => r.status === 'PENDING');
  const filteredFlags = flags.filter(flag => 
    flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (flag.description && flag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: '⏳ בבדיקה', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    APPROVED: { label: '🟢 אושר', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    REJECTED: { label: '🔴 נדחה', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    NEEDS_CHANGES: { label: '⚠️ דרוש שינוי', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  };

  // OpenFeature client-side flags evaluations
  const isNewRequestFlowEnabled = useFeatureFlag(FLAGS.ENABLE_NEW_REQUEST_FLOW);
  const isAdminUiEnabled = useFeatureFlag(FLAGS.ENABLE_ADMIN_UI);
  const isStatusBannerEnabled = useFeatureFlag(FLAGS.ENABLE_STATUS_BANNER);
  const isBetaFeaturesEnabled = useFeatureFlag(FLAGS.ENABLE_BETA_FEATURES);

  // Blog data
  const blogPosts: BlogPost[] = [
    {
      id: 'vercel-setup',
      title: 'מדריך: כיצד להגדיר תת-דומיין בחינם עם Vercel',
      excerpt: 'קיבלתם תת-דומיין במפתח.ישראל ואתם רוצים לחבר אותו לפרויקט Vercel שלכם? הנה מדריך שלב אחר שלב.',
      content: 'כאשר אתם מעלים פרויקט ל-Vercel, הוא מקבל כברירת מחדל דומיין תחת vercel.app. כדי להשתמש בתת-דומיין המותאם אישית שלכם ממפתח.ישראל:\n\n1. כנסו ללוח הפרויקטים ב-Vercel ועברו ללשונית Settings -> Domains.\n2. לחצו על Add והקלידו את הדומיין המלא שלכם (למשל myproject.מפתח.ישראל).\n3. העתיקו את ערך ה-CNAME ש-Vercel מספקת (למשל cname.vercel-dns.com).\n4. הגישו את בקשת הרישום שלכם במערכת מפתח.ישראל עם סוג רשומה CNAME והערך שהעתקתם.\n5. לאחר שהמנהלים יאשרו את הבקשה, תהליך העדכון יסתיים תוך מספר דקות והאתר שלכם יהיה זמין בכתובת החדשה!',
      category: 'מדריכים',
      date: '2026-06-20',
      readTime: '3 דקות קריאה',
      author: 'מנהל המערכת'
    },
    {
      id: 'dns-records-explained',
      title: 'הסבר על רשומות DNS: מה ההבדל בין A ל-CNAME?',
      excerpt: 'האם עדיף להשתמש ברשומת A או רשומת CNAME עבור הפניה לתת-דומיין? בואו נעשה סדר.',
      content: 'בבואכם להגדיר הפניה של תת-דומיין, תתבקשו לבחור בין שני סוגי רשומות עיקריים:\n\n• רשומת A (Address Record): מצביעה ישירות על כתובת IP (IPv4) פיזית של שרת (למשל 1.2.3.4). משתמשים בה בעיקר כאשר אתם מארחים את האתר שלכם על שרת VPS עצמאי (כמו DigitalOcean, AWS או Linode).\n\n• רשומת CNAME (Canonical Name): מצביעה על שם דומיין אחר במקום כתובת IP (למשל domains.gitbook.io). היא שימושית ביותר כאשר כתובת ה-IP של שירות האחסון עשויה להשתנות דינמית (כמו בפלטפורמות ענן מודרניות כדוגמת Vercel, Netlify או GitHub Pages).\n\nלסיכום: לפלטפורמות ענן מנוהלות השתמשו ב-CNAME, ולשרתים פרטיים (VPS) השתמשו ב-A.',
      category: 'טכנולוגיה',
      date: '2026-06-15',
      readTime: '4 דקות קריאה',
      author: 'צוות מפתח.ישראל'
    },
    {
      id: 'open-source-israel',
      title: 'פרויקטי קוד פתוח מובילים בישראל לשנת 2026',
      excerpt: 'סקירה מיוחדת של הפרויקטים הישראלים הכי חמים ב-GitHub שאתם חייבים להכיר ולתרום להם.',
      content: 'קהילת המפתחים בישראל ידועה ביצירתיות ובתרומה שלה לעולם הקוד הפתוח. הנה 3 פרויקטים ישראלים בולטים שנשמח אם תבדקו:\n\n1. Novu - פלטפורמה לניהול התראות קוד פתוח שכבשה את קהילת המפתחים העולמית.\n2. CopilotKit - פלטפורמה להוספת רכיבי AI ואסיסטנטים חכמים לאפליקציות React בקלות.\n3. מפתח.ישראל - הפרויקט הקהילתי שלנו! נשמח לתרומות קוד במערכת הרישום ובבוט הדיסקורד כדי לשפר את החוויה לכולם.\n\nקוד פתוח הוא הדרך הטובה ביותר ללמוד, ליצור קשרים מקצועיים ולתרום בחזרה לחברה.',
      category: 'קהילה',
      date: '2026-06-10',
      readTime: '5 דקות קריאה',
      author: 'עורכת הבלוג'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative overflow-hidden animate-fade-in" dir="rtl">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse duration-10000" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse duration-7000" />

      {/* Nav Status Banner controlled by OpenFeature */}
      {isStatusBannerEnabled && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900/80 to-purple-950/80 border-b border-indigo-500/20 text-center py-2 px-4 text-xs font-semibold tracking-wider text-indigo-200">
          🇮🇱 פלטפורמת רישום תת-דומיינים הרשמית למפתחים ישראלים מבית מפתח.ישראל. שירותי ה-DNS פועלים כסדרם.
        </div>
      )}

      {/* Main Header / Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-6 md:py-8">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="p-3 bg-indigo-600/15 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Globe size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-white to-slate-400">
                מפתח.ישראל
              </h1>
              <p className="text-xs text-slate-400 mt-1">פלטפורמת רישום וניהול תת-דומיינים עצמאיים</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <nav className="flex flex-wrap items-center gap-1.5 bg-slate-900/40 p-1 border border-slate-900 rounded-xl">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Home size={15} />
                <span>ראשי</span>
              </button>
              <button
                onClick={() => setActiveTab('validate')}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'validate' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Globe size={15} />
                <span>אימות דומיין</span>
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'request' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Plus size={15} />
                <span>הגשת בקשה</span>
              </button>
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'my-requests' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <CheckCircle2 size={15} />
                <span>הבקשות שלי</span>
                {userRequestsList.length > 0 && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {userRequestsList.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'blog' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BookOpen size={15} />
                <span>בלוג ועדכונים</span>
              </button>
              
              {/* Gated Admin tab */}
              {isAdminUiEnabled && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${activeTab === 'admin' ? 'bg-purple-600 border-purple-500 text-white shadow' : 'border-purple-500/10 text-purple-400 hover:text-purple-300 hover:bg-purple-950/20'}`}
                >
                  <LayoutDashboard size={15} />
                  <span>ניהול מערכת</span>
                </button>
              )}
            </nav>

            {/* Discord Connection Status */}
            <div className="flex items-center">
              {discordUser ? (
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-sm">
                  {discordUser.avatarUrl && (
                    <img src={discordUser.avatarUrl} alt="Discord Avatar" className="w-6 h-6 rounded-full border border-indigo-500/30" />
                  )}
                  <span className="text-slate-200 font-bold font-mono">{discordUser.username}</span>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 p-1 transition-colors" title="התנתק">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-indigo-500/30 transition-all shadow-lg shadow-indigo-600/15"
                >
                  <LogIn size={15} />
                  <span>התחבר עם דיסקורד</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Home/Landing Page Tab */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto py-8">
              <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
                פרויקט קהילתי חופשי 🇮🇱
              </span>
              <h2 className="text-4xl md:text-5xl font-black mt-6 leading-tight bg-clip-text text-transparent bg-gradient-to-l from-white via-slate-200 to-slate-500">
                תת-דומיין עצמאי משלך תחת מפתח.ישראל
              </h2>
              <p className="text-slate-400 text-base md:text-lg mt-6 leading-relaxed">
                מפתח.ישראל מציעה תת-דומיינים בחינם עבור קהילת המפתחים, יוצרי הקוד הפתוח, הפרויקטים האקדמיים והקבוצות הטכנולוגיות בישראל. הפנה את תנועת הגולשים אל שרת האחסון או האתר שלך בקלות ובמהירות.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                <button
                  onClick={() => setActiveTab('request')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/10 w-full sm:w-auto"
                >
                  הגש בקשת תת-דומיין כעת
                </button>
                <button
                  onClick={() => setActiveTab('validate')}
                  className="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-all w-full sm:w-auto"
                >
                  בדוק זמינות דומיין
                </button>
              </div>
            </section>

            {/* Quick Benefits Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-400">
                  <span>100% חינם וללא כוונות רווח</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  השירות מוצע בחינם לחלוטין במטרה לקדם את פיתוח הקוד בישראל ולסייע בהנגשת פרויקטים אישיים לציבור הרחב.
                </p>
              </div>
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-400">
                  <span>ניהול רשומות DNS גמיש</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  אנו תומכים ברשומות מסוג A (כתובות IP) או רשומות מסוג CNAME (הפניה לשרתים קיימים) על מנת לאפשר תאימות לכל פלטפורמה.
                </p>
              </div>
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 transition-all">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-400">
                  <span>תהליך פיקוח ומניעת ספאם</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  כל הבקשות עוברות סינון ראשוני למניעת שימוש לרעה או השתלטות על שמות שמורים, כדי להבטיח את איכות וניקיון השירות.
                </p>
              </div>
            </div>

            {/* Example Section */}
            <section className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">איך נראים הדומיינים שלנו?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {['portfolio', 'react-app', 'hackathon', 'resume'].map(sub => (
                  <div key={sub} className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl text-center font-mono">
                    <span className="text-indigo-400 font-bold">{sub}</span>
                    <span className="text-slate-500">.מפתח.ישראל</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-center">שאלות ותשובות נפוצות</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl">
                  <h4 className="font-bold text-slate-200 mb-2">לכמה זמן תת-הדומיין תקף?</h4>
                  <p className="text-slate-400 text-sm">הדומיין נשאר בבעלותך כל עוד הוא פעיל ומציג תוכן תקין שאינו מפר את תנאי השימוש של השירות.</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl">
                  <h4 className="font-bold text-slate-200 mb-2">האם אוכל לשנות את כתובת ה-IP או השרת בעתיד?</h4>
                  <p className="text-slate-400 text-sm">בוודאי. ניתן לערוך או למחוק את הבקשה שלך ישירות מלוח הבקרה בעזרת מזהה הבקשה שתקבל לאחר ההגשה.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Validate Subdomain Tab */}
        {activeTab === 'validate' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Globe size={22} className="text-indigo-400" />
                <span>כלי אימות ובדיקת זמינות דומיין</span>
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                הכנס את שם תת-הדומיין שתרצה לרשום (אותיות קטנות באנגלית, מספרים ומקפים) כדי לבדוק אם הוא זמין לרישום.
              </p>

              <form onSubmit={handleSubdomainValidation} className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="הקלד שם דומיין (למשל: myapp)"
                      value={validationSubdomain}
                      onChange={(e) => {
                        setValidationSubdomain(e.target.value);
                        setValidationResult(null);
                      }}
                      className="w-full pl-24 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono"
                      dir="ltr"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm font-semibold select-none">
                      .מפתח.ישראל
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={validationLoading || !validationSubdomain.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {validationLoading ? 'בודק...' : 'בדוק זמינות'}
                  </button>
                </div>
              </form>

              {validationResult && (
                <div className={`mt-6 p-5 rounded-xl border ${validationResult.valid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {validationResult.valid ? (
                    <div className="flex items-center gap-3">
                      <Check className="shrink-0" size={20} />
                      <div>
                        <strong className="block text-slate-200">השם זמין לרישום!</strong>
                        <span className="text-xs text-slate-400 mt-1">תוכל לעבור לטאב "הגשת בקשה" כדי לרשום את הדומיין {validationSubdomain}.מפתח.ישראל.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="shrink-0" size={20} />
                      <div>
                        <strong className="block text-slate-200">השם אינו זמין לרישום</strong>
                        <span className="text-xs mt-1 block">{validationResult.error}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subdomain Submission Flow Tab */}
        {activeTab === 'request' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Plus size={22} className="text-indigo-400" />
                <span>הגשת בקשה לתת-דומיין חדש</span>
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                אנא מלא את כל פרטי השרת והפרויקט שלך על מנת שמנהלי השירות יוכלו לבדוק ולאשר את הבקשה שלך.
              </p>

              {reqSuccess ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-4">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-200">הבקשה שלך הוגשה בהצלחה!</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    הבקשה שלך נרשמה במערכת תחת מזהה הבקשה הייחודי הבא. אנא שמור אותו לצורך מעקב:
                  </p>
                  <code className="block bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-900 font-mono text-sm text-indigo-400 max-w-sm mx-auto select-all">
                    {reqSuccess}
                  </code>
                  <button
                    onClick={() => {
                      setReqSuccess(null);
                      setActiveTab('my-requests');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all"
                  >
                    עבור למעקב בקשות
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  {reqError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle size={16} />
                      <span>{reqError}</span>
                    </div>
                  )}

                  {/* Warning if not logged in with Discord */}
                  {!discordUser && (
                    <div className="p-4.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span className="font-bold">לתשומת לבך: אינך מחובר עם חשבון דיסקורד!</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        אתה רשאי להגיש את הבקשה כאורח, אך לא תוכל לעקוב אחריה בקלות בדיסקורד או לקבל עדכוני סטטוס ישירים. 
                        מומלץ להתחבר עם כפתור הדיסקורד בראש העמוד לפני ההגשה.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">שם התת-דומיין המבוקש</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="myapp"
                        value={reqSubdomain}
                        onChange={(e) => setReqSubdomain(e.target.value)}
                        className="w-full pl-24 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                        dir="ltr"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs select-none">
                        .מפתח.ישראל
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">סוג רשומה (Type)</label>
                      <select
                        value={reqTargetType}
                        onChange={(e: any) => setReqTargetType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                      >
                        <option value="A">A (כתובת IP של השרת)</option>
                        <option value="CNAME">CNAME (שם דומיין להפניה)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ערך רשומה (Value)</label>
                      <input
                        type="text"
                        placeholder={reqTargetType === 'A' ? '1.2.3.4' : 'myhost.com'}
                        value={reqTargetValue}
                        onChange={(e) => setReqTargetValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">תיאור קצר של הפרויקט שלך</label>
                    <textarea
                      placeholder="לדוגמה: פורטפוליו אישי המציג עבודות ופרויקטי קוד פתוח..."
                      value={reqDescription}
                      onChange={(e) => setReqDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm min-h-[80px]"
                    />
                  </div>

                  {isBetaFeaturesEnabled && (
                    <div className="space-y-4 pt-4 border-t border-slate-900">
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">אופציות בטא מורחבות</span>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">קישור לפרויקט קיים (גיטהאב / אתר זמני)</label>
                        <input
                          type="text"
                          placeholder="https://github.com/my-project"
                          value={reqLink}
                          onChange={(e) => setReqLink(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm font-mono"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">מדוע נחוץ לך תת-דומיין זה?</label>
                        <textarea
                          placeholder="פרט בקצרה מדוע הדומיין הזה חשוב לפרויקט שלך..."
                          value={reqReason}
                          onChange={(e) => setReqReason(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500 text-sm min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-900">
                    <button
                      type="submit"
                      disabled={reqLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                    >
                      {reqLoading && <RefreshCw size={16} className="animate-spin" />}
                      <span>שלח בקשת רישום</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* User Requests Dashboard Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-indigo-400" />
                  <span>מעקב אחר הבקשות שלי ({userRequestsList.length})</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">כל הבקשות ששלחת מהמכשיר הנוכחי או מקושרות לחשבון הדיסקורד שלך.</p>
              </div>
              <button 
                onClick={fetchRequests}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded-lg border border-slate-800 transition-colors"
                title="רענן נתונים"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {loadingRequests ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-indigo-400" />
                <span>טוען בקשות...</span>
              </div>
            ) : userRequestsList.length === 0 ? (
              <div className="py-16 text-center text-slate-550 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl">
                <ShieldAlert size={36} className="mx-auto mb-4 text-slate-650" />
                <p>לא נמצאו בקשות תת-דומיינים המשויכות אליך.</p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  הגש בקשה ראשונה
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userRequestsList.map((req) => {
                  const status = statusMap[req.status] || { label: req.status, color: 'text-slate-400', bg: 'bg-slate-900' };
                  return (
                    <div key={req.id} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-bold font-mono text-slate-200">{req.data?.subdomain}.מפתח.ישראל</h4>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-slate-450 text-xs mt-2">{req.data?.description || 'אין תיאור זמין'}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mt-4">
                            <span>סוג: <strong>{req.data?.targetType}</strong></span>
                            <span>יעד: <strong>{req.data?.targetValue}</strong></span>
                            <span>מזהה בקשה: <strong>{req.id}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Blog & Updates Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
            <div className="text-center max-w-xl mx-auto mb-10">
              <BookOpen size={36} className="text-indigo-400 mx-auto mb-3" />
              <h3 className="text-2xl font-black">בלוג ועדכוני מפתח.ישראל</h3>
              <p className="text-slate-400 text-xs mt-2">מדריכים, חדשות קהילתיות ועדכונים טכניים לעולם הפיתוח הישראלי.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/25 transition-all group">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mb-4">
                      <span className="bg-indigo-650/15 border border-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-bold">{post.category}</span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-200 mb-3 group-hover:text-indigo-400 transition-colors leading-snug">{post.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{post.excerpt}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-4 text-[10px] text-slate-500">
                    <span>{post.readTime}</span>
                    <button 
                      onClick={() => setSelectedPost(post)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>קרא עוד</span>
                      <ArrowLeft size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && isAdminUiEnabled && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-purple-400">
                  <LayoutDashboard size={22} />
                  <span>ניהול מערכת מפתח.ישראל (Admin Controls)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">מערך בקרה וניטור לניהול דגלי תכונות ובקשות הרישום.</p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex bg-slate-900/60 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setAdminActiveSubTab('requests')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${adminActiveSubTab === 'requests' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  בקשות רישום ({pendingRequestsQueue.length})
                </button>
                <button
                  onClick={() => setAdminActiveSubTab('flags')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${adminActiveSubTab === 'flags' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  דגלי תכונות ({flags.length})
                </button>
                <button
                  onClick={() => setAdminActiveSubTab('logs')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${adminActiveSubTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  יומן פעילויות
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Domain Requests Management */}
            {adminActiveSubTab === 'requests' && (
              <section className="space-y-6">
                {loadingRequests ? (
                  <div className="py-20 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-purple-500" />
                    <span>טוען בקשות להערכה...</span>
                  </div>
                ) : pendingRequestsQueue.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl">
                    <CheckCircle size={32} className="mx-auto mb-4 text-emerald-500/70" />
                    <p>אין בקשות חדשות הממתינות לאישור כרגע.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequestsQueue.map((req) => (
                      <div key={req.id} className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-purple-400 font-mono bg-purple-950/30 px-2 py-0.5 rounded border border-purple-500/15">פנייה: {req.id}</span>
                            <span className="text-xs text-slate-500 font-mono">הוגש ע"י: {req.userId.substring(0, 8)}...</span>
                          </div>
                          <h4 className="text-lg font-bold font-mono text-slate-200">
                            {req.data?.subdomain}.מפתח.ישראל
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{req.data?.description || 'אין תיאור זמין'}</p>
                          <div className="text-xs text-slate-500 space-x-4 space-x-reverse font-mono pt-1">
                            <span>סוג רשומה: <strong className="text-slate-350">{req.data?.targetType}</strong></span>
                            <span>ערך: <strong className="text-slate-350">{req.data?.targetValue}</strong></span>
                            {req.data?.link && (
                              <span>קישור: <a href={req.data.link} target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">{req.data.link.substring(0, 25)}... <ExternalLink size={10} /></a></span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto shrink-0">
                          <button
                            onClick={() => handleReviewAction(req.id, 'APPROVED')}
                            className="flex-1 md:flex-none px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10"
                          >
                            אשר בקשה
                          </button>
                          <button
                            onClick={() => handleReviewAction(req.id, 'NEEDS_CHANGES')}
                            className="flex-1 md:flex-none px-4.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-600/10"
                          >
                            בקש שינוי
                          </button>
                          <button
                            onClick={() => handleReviewAction(req.id, 'REJECTED')}
                            className="flex-1 md:flex-none px-4.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/10"
                          >
                            דחה
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Sub-tab 2: Feature Flags Panel */}
            {adminActiveSubTab === 'flags' && (
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <h4 className="text-md font-bold text-slate-200">דגלי תכונות פעילים במערכת</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="חפש דגל..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-555 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>דגל חדש</span>
                    </button>
                  </div>
                </div>

                {loadingFlags ? (
                  <div className="py-20 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-purple-500" />
                    <span>טוען הגדרות מנוע...</span>
                  </div>
                ) : filteredFlags.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl">
                    <p>לא נמצאו דגלי תכונות תואמים.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFlags.map((flag) => (
                      <div 
                        key={flag.id} 
                        className={`bg-slate-900/40 border p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between ${
                          flag.enabled ? 'border-slate-900 hover:border-slate-800' : 'border-slate-900/60 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <code className="text-indigo-400 font-mono text-xs font-bold bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/15">
                                {flag.key}
                              </code>
                              <h4 className="text-base font-bold text-slate-200 mt-3 leading-snug">
                                {flag.description || 'אין תיאור זמין'}
                              </h4>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleFlag(flag.key, flag.enabled)}
                                disabled={updatingKey === flag.key}
                                className={`p-2 rounded-xl border transition-all ${
                                  flag.enabled
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-slate-800/65 border-slate-700/35 text-slate-400 hover:bg-slate-800'
                                }`}
                              >
                                <Power size={14} />
                              </button>
                              <button
                                onClick={() => deleteFlag(flag.key)}
                                disabled={updatingKey === flag.key}
                                className="p-2 rounded-xl border border-slate-900 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center">
                          <span className="text-xs text-slate-500">
                            עודכן: {new Date(flag.updatedAt).toLocaleDateString('he-IL')}
                          </span>

                          {typeof flag.value === 'boolean' && flag.enabled && (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400">ערך נוכחי:</span>
                              <button
                                onClick={() => toggleValue(flag.key, flag.value)}
                                disabled={updatingKey === flag.key}
                                className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                                  flag.value ? 'bg-indigo-600' : 'bg-slate-700'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    flag.value ? 'translate-x-5' : 'translate-x-1.5'
                                  }`}
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Sub-tab 3: System logs */}
            {adminActiveSubTab === 'logs' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-5 border-b border-slate-900 pb-4">
                  <Activity size={20} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-slate-200">יומן שינויים ופעולות מערכת</h3>
                </div>
                
                <div className="space-y-3.5">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between text-sm py-2.5 border-b border-slate-900 last:border-0 text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">{log.time}</span>
                        <span className="font-bold text-slate-300 min-w-[70px]">{log.action}:</span>
                        <code className="text-indigo-400 text-xs font-mono">{log.flagKey}</code>
                        <span className="text-slate-400 mr-1 hidden md:inline">-</span>
                        <span className="text-slate-400">{log.details}</span>
                      </div>
                      <span className="text-xs text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 self-start md:self-auto mt-2 md:mt-0 font-semibold">בוצע</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-900 text-center text-slate-500 text-xs flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} מפתח.ישראל. כל הזכויות שמורות.</p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/il-labs" target="_blank" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <span>GitHub</span>
              <ExternalLink size={11} />
            </a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">תנאי שימוש</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">סטטוס שרתים</a>
          </div>
        </footer>
      </div>

      {/* Discord Connect Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <LogIn size={20} className="text-indigo-400" />
                <span>התחברות באמצעות דיסקורד</span>
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDiscordLoginSubmit} className="p-6 space-y-5">
              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">מזהה דיסקורד (Discord User ID)</label>
                <input
                  type="text"
                  placeholder="למשל: 1324706681648709746"
                  value={loginDiscordId}
                  onChange={(e) => setLoginDiscordId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                  dir="ltr"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">ניתן למצוא את המזהה על ידי הפעלת Developer Mode בדיסקורד והעתקת המזהה מהפרופיל שלך.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">שם משתמש בדיסקורד (Username)</label>
                <input
                  type="text"
                  placeholder="למשל: israelexample"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-bold transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loginLoading && <RefreshCw size={14} className="animate-spin" />}
                  <span>התחבר כעת</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
              <div>
                <span className="text-[10px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded font-bold">{selectedPost.category}</span>
                <h3 className="text-xl font-bold text-slate-200 mt-2">{selectedPost.title}</h3>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4 text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans border-b border-slate-800/80">
              {selectedPost.content}
            </div>

            <div className="p-6 flex justify-between items-center text-xs text-slate-500 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-400" />
                <span>נכתב על ידי: <strong>{selectedPost.author}</strong></span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Calendar size={14} />
                <span>{selectedPost.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Flag Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/80">
              <h3 className="text-lg font-bold text-slate-200">יצירת דגל תכונה חדש</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFlag} className="p-6 space-y-5">
              {formError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">מפתח הדגל (Flag Key)</label>
                <input
                  type="text"
                  placeholder="לדוגמה: new-feature-enabled"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">תיאור הדגל</label>
                <textarea
                  placeholder="לדוגמה: מפעיל את פריסת הבטא החדשה"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">סוג הערך</label>
                  <select
                    value={newValueType}
                    onChange={(e: any) => setNewValueType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="boolean">בוליאני (Boolean)</option>
                    <option value="json">אובייקט (JSON)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={newEnabled}
                      onChange={(e) => setNewEnabled(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-300 font-bold">מופעל מיד</span>
                  </label>
                </div>
              </div>

              {newValueType === 'boolean' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ערך ברירת מחדל</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setNewBoolValue(true)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        newBoolValue 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBoolValue(false)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        !newBoolValue 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ערך ה-JSON</label>
                  <textarea
                    value={newJsonValue}
                    onChange={(e) => setNewJsonValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono min-h-[100px]"
                    dir="ltr"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-bold transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={submittingFlag}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingFlag && <RefreshCw size={14} className="animate-spin" />}
                  <span>צור דגל</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
