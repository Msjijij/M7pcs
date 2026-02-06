import { useAppUser } from "@/hooks/use-app-user";
import { useTopups, useApproveTopup } from "@/hooks/use-topups";
import { useSubscriptions, useActivateSubscription } from "@/hooks/use-subscriptions";
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from "@/hooks/use-announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, Check, X, Users, DollarSign, Activity, Megaphone, Trash2, Bell, Search, Download, ShieldCheck, ShieldOff, Wallet, Ban, History, ArrowUpDown, UserX, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: user } = useAppUser();
  const { data: topups } = useTopups();
  const { data: subscriptions } = useSubscriptions();
  const { data: announcements } = useAnnouncements();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allUsers } = useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: activityLogs } = useQuery({
    queryKey: [api.activityLogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.activityLogs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  const approveTopup = useApproveTopup();
  const activateSub = useActivateSubscription();
  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }), credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم تحديث الدور' : 'Role updated' });
    },
    onError: (err: any) => toast({ title: isRtl ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' }),
  });

  const adjustBalance = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      const res = await fetch(`/api/users/${userId}/balance`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, reason }), credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم تعديل الرصيد' : 'Balance adjusted' });
    },
    onError: (err: any) => toast({ title: isRtl ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' }),
  });

  const banUser = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      const res = await fetch(`/api/users/${userId}/ban`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ banned }), credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم تحديث الحظر' : 'Ban status updated' });
    },
    onError: (err: any) => toast({ title: isRtl ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم حذف المستخدم' : 'User deleted' });
    },
    onError: (err: any) => toast({ title: isRtl ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' }),
  });

  const cancelSubscription = useMutation({
    mutationFn: async (subId: number) => {
      const res = await fetch(`/api/subscriptions/${subId}/cancel`, { method: 'PATCH', credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم إلغاء الاشتراك' : 'Subscription cancelled' });
    },
  });

  const deleteSubscription = useMutation({
    mutationFn: async (subId: number) => {
      const res = await fetch(`/api/subscriptions/${subId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم حذف الاشتراك' : 'Subscription deleted' });
    },
  });

  const updateSubDates = useMutation({
    mutationFn: async ({ subId, startDate, endDate }: { subId: number; startDate?: string; endDate?: string }) => {
      const res = await fetch(`/api/subscriptions/${subId}/dates`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate, endDate }), credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activityLogs.list.path] });
      toast({ title: isRtl ? 'تم تعديل التاريخ' : 'Dates updated' });
    },
  });

  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annPriority, setAnnPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [userSearch, setUserSearch] = useState("");
  const [balanceDialogUser, setBalanceDialogUser] = useState<any>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [subFilter, setSubFilter] = useState<"all" | "active" | "pending_activation" | "expired">("all");
  const [datesDialogSub, setDatesDialogSub] = useState<any>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<any>(null);

  if (user?.role !== 'admin') {
    return <div className="p-20 text-center text-red-500 text-xl font-bold">{isRtl ? 'وصول مرفوض' : 'Access Denied'}</div>;
  }

  const pendingTopups = topups?.filter(t => t.status === 'pending') || [];
  const pendingSubs = subscriptions?.filter(s => s.status === 'pending_activation') || [];
  const totalRevenue = (topups?.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0) / 100;
  const activeSubs = subscriptions?.filter(s => s.status === 'active').length || 0;

  const chartData = topups
    ?.filter(t => t.status === 'approved')
    .slice(0, 7)
    .reverse()
    .map((t) => ({ name: format(new Date(t.createdAt!), 'MM/dd'), amount: t.amount / 100 })) || [];

  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) return;
    try {
      await createAnnouncement.mutateAsync({ title: annTitle, body: annBody, priority: annPriority });
      setAnnouncementOpen(false);
      setAnnTitle("");
      setAnnBody("");
      setAnnPriority("normal");
    } catch (e) {}
  };

  const handleBalanceAdjust = async () => {
    if (!balanceDialogUser || !balanceAmount) return;
    const amountHalalas = Math.round(parseFloat(balanceAmount) * 100);
    await adjustBalance.mutateAsync({ userId: balanceDialogUser.id, amount: amountHalalas, reason: balanceReason });
    setBalanceDialogUser(null);
    setBalanceAmount("");
    setBalanceReason("");
  };

  const handleDatesSave = async () => {
    if (!datesDialogSub) return;
    await updateSubDates.mutateAsync({ subId: datesDialogSub.id, startDate: editStartDate || undefined, endDate: editEndDate || undefined });
    setDatesDialogSub(null);
    setEditStartDate("");
    setEditEndDate("");
  };

  const filteredUsers = allUsers?.filter((u: any) => {
    if (!userSearch) return true;
    const search = userSearch.toLowerCase();
    return (u.firstName?.toLowerCase().includes(search) || u.username?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search) || u.id?.toLowerCase().includes(search));
  }) || [];

  const filteredSubs = subscriptions?.filter(s => subFilter === 'all' || s.status === subFilter) || [];

  const handleExport = (type: string) => window.open(`/api/export/${type}`, '_blank');

  const getActionLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'topup_approved': { en: 'Approved Topup', ar: 'موافقة شحن' },
      'topup_rejected': { en: 'Rejected Topup', ar: 'رفض شحن' },
      'subscription_active': { en: 'Activated Subscription', ar: 'تفعيل اشتراك' },
      'subscription_expired': { en: 'Expired Subscription', ar: 'إنهاء اشتراك' },
      'subscription_cancel': { en: 'Cancelled Subscription', ar: 'إلغاء اشتراك' },
      'subscription_delete': { en: 'Deleted Subscription', ar: 'حذف اشتراك' },
      'subscription_dates_edit': { en: 'Edited Sub Dates', ar: 'تعديل تاريخ اشتراك' },
      'role_change': { en: 'Changed Role', ar: 'تغيير صلاحية' },
      'balance_adjustment': { en: 'Adjusted Balance', ar: 'تعديل رصيد' },
      'user_ban': { en: 'Banned User', ar: 'حظر مستخدم' },
      'user_unban': { en: 'Unbanned User', ar: 'رفع حظر مستخدم' },
      'user_delete': { en: 'Deleted User', ar: 'حذف مستخدم' },
    };
    return labels[action]?.[isRtl ? 'ar' : 'en'] || action;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white" data-testid="text-admin-title">{t("admin.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isRtl ? 'نظرة عامة على النظام' : 'System Overview'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground" data-testid="button-new-announcement">
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">{isRtl ? 'إعلان جديد' : 'New Announcement'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#060b18] border-white/10 text-white sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-primary">{isRtl ? 'إعلان جديد' : 'New Announcement'}</DialogTitle>
                <DialogDescription className="text-gray-400">{isRtl ? 'سيتم إرسال هذا الإعلان لجميع المستخدمين' : 'This announcement will be sent to all users'}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{isRtl ? 'العنوان' : 'Title'}</Label>
                  <Input value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="bg-black/30 border-white/10 text-white" placeholder={isRtl ? 'عنوان الإعلان...' : 'Announcement title...'} data-testid="input-announcement-title" />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'المحتوى' : 'Content'}</Label>
                  <Textarea value={annBody} onChange={e => setAnnBody(e.target.value)} className="bg-black/30 border-white/10 text-white min-h-[120px]" placeholder={isRtl ? 'محتوى الإعلان...' : 'Announcement content...'} data-testid="input-announcement-body" />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'الأولوية' : 'Priority'}</Label>
                  <Select value={annPriority} onValueChange={(v: "normal" | "important" | "urgent") => setAnnPriority(v)}>
                    <SelectTrigger className="bg-black/30 border-white/10 text-white" data-testid="select-announcement-priority"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#060b18] border-white/10">
                      <SelectItem value="normal">{isRtl ? 'عام' : 'Normal'}</SelectItem>
                      <SelectItem value="important">{isRtl ? 'مهم' : 'Important'}</SelectItem>
                      <SelectItem value="urgent">{isRtl ? 'عاجل' : 'Urgent'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAnnouncement} disabled={!annTitle.trim() || !annBody.trim() || createAnnouncement.isPending} className="bg-primary text-primary-foreground" data-testid="button-submit-announcement">
                  {createAnnouncement.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isRtl ? 'نشر الإعلان' : 'Publish'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: isRtl ? 'الإيرادات' : 'Revenue', value: `${totalRevenue.toFixed(0)} ${t("common.sar")}`, icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-900/10', testId: 'card-total-revenue' },
          { label: isRtl ? 'فعال' : 'Active', value: activeSubs, icon: Activity, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-900/10', testId: 'card-active-subs' },
          { label: isRtl ? 'معلق' : 'Pending', value: pendingTopups.length + pendingSubs.length, icon: Bell, color: 'text-amber-400', bg: 'from-amber-500/10 to-amber-900/10', testId: 'card-pending-actions' },
          { label: isRtl ? 'المستخدمون' : 'Users', value: allUsers?.length || 0, icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-900/10', testId: 'card-total-users' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className={`glass-card border-none bg-gradient-to-br ${stat.bg}`} data-testid={stat.testId}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
                <CardTitle className={`text-xs font-medium ${stat.color}`}>{stat.label}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent><div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="approvals" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl gap-1 inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="approvals" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-approvals">
              {isRtl ? 'الموافقات' : 'Approvals'}
              {(pendingTopups.length + pendingSubs.length) > 0 && <span className="bg-amber-500/20 text-amber-400 text-xs px-1.5 rounded-full">{pendingTopups.length + pendingSubs.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-subscriptions">{isRtl ? 'الاشتراكات' : 'Subscriptions'}</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-users">{isRtl ? 'المستخدمون' : 'Users'}</TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-announcements">{isRtl ? 'الإعلانات' : 'Announcements'}</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-logs">{isRtl ? 'السجل' : 'Logs'}</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs sm:text-sm" data-testid="tab-analytics">{isRtl ? 'التحليلات' : 'Analytics'}</TabsTrigger>
          </TabsList>
        </div>

        {/* APPROVALS */}
        <TabsContent value="approvals" className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              {t("admin.pendingTopups")}
              {pendingTopups.length > 0 && <span className="text-sm text-primary">({pendingTopups.length})</span>}
            </h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} data-testid="table-pending-topups">
                  <thead className="bg-white/5 text-muted-foreground">
                    <tr>
                      <th className="p-3 sm:p-4">{isRtl ? 'المستخدم' : 'User'}</th>
                      <th className="p-3 sm:p-4">{isRtl ? 'المبلغ' : 'Amount'}</th>
                      <th className="p-3 sm:p-4 hidden sm:table-cell">{isRtl ? 'الإثبات' : 'Proof'}</th>
                      <th className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingTopups.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{isRtl ? 'لا توجد طلبات شحن معلقة' : 'No pending topups'}</td></tr>}
                    {pendingTopups.map((tp) => {
                      const tpUser = allUsers?.find((u: any) => u.id === tp.userId);
                      return (
                        <tr key={tp.id} className="hover:bg-white/5 transition-colors" data-testid={`row-topup-${tp.id}`}>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={tpUser?.profileImageUrl || undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{(tpUser?.firstName || "U")[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-white text-xs sm:text-sm">{tpUser?.username || tpUser?.firstName || tp.userId.slice(0, 8)}</span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 font-bold text-emerald-400">{(tp.amount / 100).toFixed(2)} SAR</td>
                          <td className="p-3 sm:p-4 hidden sm:table-cell">
                            {tp.proofUrl ? <a href={tp.proofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline underline-offset-4 flex items-center gap-1">{isRtl ? 'عرض' : 'View'}<Activity className="w-3 h-3" /></a> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                            <div className="flex items-center gap-2 justify-end">
                              <Button size="sm" variant="destructive" onClick={() => approveTopup.mutate({ id: tp.id, status: 'rejected' })} disabled={approveTopup.isPending} data-testid={`button-reject-topup-${tp.id}`}><X className="w-4 h-4" /></Button>
                              <Button size="sm" className="bg-emerald-600 text-white" onClick={() => approveTopup.mutate({ id: tp.id, status: 'approved' })} disabled={approveTopup.isPending} data-testid={`button-approve-topup-${tp.id}`}><Check className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              {t("admin.pendingSubs")}
              {pendingSubs.length > 0 && <span className="text-sm text-blue-400">({pendingSubs.length})</span>}
            </h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} data-testid="table-pending-subs">
                  <thead className="bg-white/5 text-muted-foreground">
                    <tr>
                      <th className="p-3 sm:p-4">{isRtl ? 'الباقة' : 'Product'}</th>
                      <th className="p-3 sm:p-4">{isRtl ? 'رقم الجهاز' : 'Device ID'}</th>
                      <th className="p-3 sm:p-4 hidden sm:table-cell">{isRtl ? 'التاريخ' : 'Date'}</th>
                      <th className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingSubs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{isRtl ? 'لا توجد طلبات تفعيل' : 'No pending activations'}</td></tr>}
                    {pendingSubs.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors" data-testid={`row-sub-${s.id}`}>
                        <td className="p-3 sm:p-4 text-white font-medium text-xs sm:text-sm">{s.product.name}</td>
                        <td className="p-3 sm:p-4 font-mono text-primary text-xs sm:text-sm">{s.deviceId}</td>
                        <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">{format(new Date(s.createdAt!), 'PP')}</td>
                        <td className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <Button size="sm" className="bg-blue-600 text-white" onClick={() => activateSub.mutate({ id: s.id, status: 'active' })} disabled={activateSub.isPending} data-testid={`button-activate-sub-${s.id}`}>
                            {activateSub.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.activate")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SUBSCRIPTIONS */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              {isRtl ? 'إدارة الاشتراكات' : 'Manage Subscriptions'}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={subFilter} onValueChange={(v: any) => setSubFilter(v)}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white w-[140px] sm:w-[160px]" data-testid="select-sub-filter">
                  <ArrowUpDown className="w-3 h-3" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#060b18] border-white/10">
                  <SelectItem value="all">{isRtl ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="active">{isRtl ? 'فعال' : 'Active'}</SelectItem>
                  <SelectItem value="pending_activation">{isRtl ? 'معلق' : 'Pending'}</SelectItem>
                  <SelectItem value="expired">{isRtl ? 'منتهي' : 'Expired'}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-white/10 text-white gap-1" onClick={() => handleExport('subscriptions')} data-testid="button-export-subs">
                <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">CSV</span>
              </Button>
            </div>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} data-testid="table-all-subs">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="p-3 sm:p-4">{isRtl ? 'الباقة' : 'Product'}</th>
                    <th className="p-3 sm:p-4">{isRtl ? 'الجهاز' : 'Device'}</th>
                    <th className="p-3 sm:p-4">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="p-3 sm:p-4 hidden md:table-cell">{isRtl ? 'الانتهاء' : 'Expires'}</th>
                    <th className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'إجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSubs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{isRtl ? 'لا توجد اشتراكات' : 'No subscriptions'}</td></tr>}
                  {filteredSubs.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors" data-testid={`row-allsub-${s.id}`}>
                      <td className="p-3 sm:p-4 text-white font-medium text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{s.product.name}</td>
                      <td className="p-3 sm:p-4 font-mono text-primary text-xs">{s.deviceId}</td>
                      <td className="p-3 sm:p-4"><StatusBadge status={s.status} /></td>
                      <td className="p-3 sm:p-4 text-muted-foreground text-xs hidden md:table-cell">{s.endDate ? format(new Date(s.endDate), 'PP') : '-'}</td>
                      <td className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => { setDatesDialogSub(s); setEditStartDate(s.startDate ? new Date(s.startDate).toISOString().slice(0, 16) : ""); setEditEndDate(s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : ""); }} title={isRtl ? 'تعديل التاريخ' : 'Edit Dates'} data-testid={`button-edit-dates-${s.id}`}>
                            <CalendarClock className="w-4 h-4" />
                          </Button>
                          {s.status === 'active' && (
                            <Button size="icon" variant="ghost" className="text-amber-400" onClick={() => cancelSubscription.mutate(s.id)} disabled={cancelSubscription.isPending} title={isRtl ? 'إلغاء' : 'Cancel'} data-testid={`button-cancel-sub-${s.id}`}>
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          {s.status === 'pending_activation' && (
                            <Button size="icon" variant="ghost" className="text-blue-400" onClick={() => activateSub.mutate({ id: s.id, status: 'active' })} disabled={activateSub.isPending} title={isRtl ? 'تفعيل' : 'Activate'} data-testid={`button-activate-allsub-${s.id}`}>
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteSubscription.mutate(s.id)} disabled={deleteSubscription.isPending} title={isRtl ? 'حذف' : 'Delete'} data-testid={`button-delete-sub-${s.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
              <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder={isRtl ? 'بحث بالاسم أو المعرف...' : 'Search by name or ID...'} className={`bg-black/30 border-white/10 text-white ${isRtl ? 'pr-10' : 'pl-10'}`} data-testid="input-user-search" />
            </div>
            <Button variant="outline" size="sm" className="border-white/10 text-white gap-1" onClick={() => handleExport('users')} data-testid="button-export-users">
              <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isRtl ? 'تصدير' : 'Export CSV'}</span>
            </Button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} data-testid="table-users">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="p-3 sm:p-4">{isRtl ? 'المستخدم' : 'User'}</th>
                    <th className="p-3 sm:p-4">{isRtl ? 'الرصيد' : 'Balance'}</th>
                    <th className="p-3 sm:p-4">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{isRtl ? 'لا يوجد مستخدمون' : 'No users found'}</td></tr>}
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className={`hover:bg-white/5 transition-colors ${u.isBanned ? 'opacity-50' : ''}`} data-testid={`row-user-${u.id}`}>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={u.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{(u.firstName || "U")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{u.firstName || u.username}</p>
                            <p className="text-xs text-muted-foreground truncate">@{u.username || u.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 font-mono text-emerald-400 text-xs sm:text-sm">{(u.balance / 100).toFixed(2)} {t("common.sar")}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge status={u.role} />
                          {u.isBanned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">{isRtl ? 'محظور' : 'BANNED'}</span>}
                        </div>
                      </td>
                      <td className={`p-3 sm:p-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => setBalanceDialogUser(u)} title={isRtl ? 'تعديل الرصيد' : 'Adjust Balance'} data-testid={`button-balance-${u.id}`}>
                            <Wallet className="w-4 h-4" />
                          </Button>
                          {u.id !== user?.id && (
                            <>
                              {u.role === 'customer' ? (
                                <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => updateRole.mutate({ userId: u.id, role: 'admin' })} disabled={updateRole.isPending} title={isRtl ? 'ترقية لأدمن' : 'Promote'} data-testid={`button-promote-${u.id}`}>
                                  <ShieldCheck className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => updateRole.mutate({ userId: u.id, role: 'customer' })} disabled={updateRole.isPending} title={isRtl ? 'تخفيض لعميل' : 'Demote'} data-testid={`button-demote-${u.id}`}>
                                  <ShieldOff className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className={u.isBanned ? "text-emerald-400" : "text-amber-400"} onClick={() => banUser.mutate({ userId: u.id, banned: !u.isBanned })} disabled={banUser.isPending} title={u.isBanned ? (isRtl ? 'رفع الحظر' : 'Unban') : (isRtl ? 'حظر' : 'Ban')} data-testid={`button-ban-${u.id}`}>
                                <Ban className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteUser(u)} title={isRtl ? 'حذف' : 'Delete'} data-testid={`button-delete-user-${u.id}`}>
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ANNOUNCEMENTS */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              {isRtl ? 'الإعلانات المنشورة' : 'Published Announcements'}
            </h3>
          </div>
          {(!announcements || announcements.length === 0) ? (
            <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{isRtl ? 'لا توجد إعلانات' : 'No announcements published yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 flex items-start justify-between gap-4" data-testid={`card-admin-announcement-${ann.id}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-white">{ann.title}</h4>
                      <StatusBadge status={ann.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{format(new Date(ann.createdAt!), 'PP p')}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground flex-shrink-0" onClick={() => deleteAnnouncement.mutate(ann.id)} disabled={deleteAnnouncement.isPending} data-testid={`button-delete-announcement-${ann.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-cyan-500 rounded-full" />
              {isRtl ? 'سجل النشاط' : 'Activity Log'}
            </h3>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {(!activityLogs || activityLogs.length === 0) ? (
                <div className="p-12 text-center text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>{isRtl ? 'لا يوجد نشاط مسجل بعد' : 'No activity logged yet'}</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="p-3 sm:p-4 flex items-start gap-3 hover:bg-white/5 transition-colors" data-testid={`log-${log.id}`}>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <History className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{getActionLabel(log.action)}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <span className="text-xs text-muted-foreground font-mono">{log.targetType}: {log.targetId.slice(0, 12)}{log.targetId.length > 12 ? '...' : ''}</span>
                          <span className="text-xs text-muted-foreground/60">{format(new Date(log.createdAt!), 'PP p')}</span>
                        </div>
                        {log.metadata && (() => {
                          try {
                            const meta = JSON.parse(log.metadata);
                            return <p className="text-xs text-muted-foreground/80 mt-1 font-mono bg-white/5 rounded-md px-2 py-1 inline-block">{Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>;
                          } catch { return null; }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h3 className="text-lg sm:text-xl font-bold text-white">{isRtl ? 'التحليلات' : 'Analytics'}</h3>
            <Button variant="outline" size="sm" className="border-white/10 text-white gap-1" onClick={() => handleExport('topups')} data-testid="button-export-topups">
              <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">{isRtl ? 'تصدير الشحن' : 'Export Topups'}</span>
            </Button>
          </div>
          <Card className="glass-card border-none p-4 sm:p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base sm:text-lg font-medium text-white">{isRtl ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}</CardTitle>
            </CardHeader>
            <div className="h-[250px] sm:h-[300px] w-full mt-4">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">{isRtl ? 'لا توجد بيانات كافية' : 'Not enough data for chart'}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }} formatter={(value: any) => [`${value} ${t("common.sar")}`, isRtl ? 'المبلغ' : 'Amount']} />
                    <Bar dataKey="amount" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Balance Dialog */}
      <Dialog open={!!balanceDialogUser} onOpenChange={(open) => !open && setBalanceDialogUser(null)}>
        <DialogContent className="bg-[#060b18] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">{isRtl ? 'تعديل الرصيد' : 'Adjust Balance'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {balanceDialogUser && <span>{balanceDialogUser.firstName || balanceDialogUser.username} - {isRtl ? 'الرصيد الحالي:' : 'Current:'} {(balanceDialogUser.balance / 100).toFixed(2)} {t("common.sar")}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'المبلغ (ريال) - موجب للإضافة، سالب للخصم' : 'Amount (SAR) - positive to add, negative to deduct'}</Label>
              <Input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="bg-black/30 border-white/10 text-white" placeholder="100 or -50" data-testid="input-balance-amount" />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? 'السبب (اختياري)' : 'Reason (optional)'}</Label>
              <Input value={balanceReason} onChange={e => setBalanceReason(e.target.value)} className="bg-black/30 border-white/10 text-white" placeholder={isRtl ? 'سبب التعديل...' : 'Reason for adjustment...'} data-testid="input-balance-reason" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBalanceDialogUser(null)} className="text-gray-400">{isRtl ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleBalanceAdjust} disabled={!balanceAmount || adjustBalance.isPending} className="bg-primary text-primary-foreground" data-testid="button-confirm-balance">
              {adjustBalance.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRtl ? 'تأكيد' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dates Dialog */}
      <Dialog open={!!datesDialogSub} onOpenChange={(open) => !open && setDatesDialogSub(null)}>
        <DialogContent className="bg-[#060b18] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">{isRtl ? 'تعديل تاريخ الاشتراك' : 'Edit Subscription Dates'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {datesDialogSub && <span>{isRtl ? 'الجهاز:' : 'Device:'} {datesDialogSub.deviceId}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'تاريخ البدء' : 'Start Date'}</Label>
              <Input type="datetime-local" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} className="bg-black/30 border-white/10 text-white" data-testid="input-start-date" />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? 'تاريخ الانتهاء' : 'End Date'}</Label>
              <Input type="datetime-local" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} className="bg-black/30 border-white/10 text-white" data-testid="input-end-date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDatesDialogSub(null)} className="text-gray-400">{isRtl ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleDatesSave} disabled={(!editStartDate && !editEndDate) || updateSubDates.isPending} className="bg-primary text-primary-foreground" data-testid="button-confirm-dates">
              {updateSubDates.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRtl ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete User Dialog */}
      <Dialog open={!!confirmDeleteUser} onOpenChange={(open) => !open && setConfirmDeleteUser(null)}>
        <DialogContent className="bg-[#060b18] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">{isRtl ? 'تأكيد الحذف' : 'Confirm Deletion'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {isRtl
                ? `هل أنت متأكد من حذف ${confirmDeleteUser?.firstName || confirmDeleteUser?.username}؟ سيتم حذف جميع بياناته.`
                : `Are you sure you want to delete ${confirmDeleteUser?.firstName || confirmDeleteUser?.username}? All their data will be removed.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDeleteUser(null)} className="text-gray-400">{isRtl ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={() => { deleteUser.mutate(confirmDeleteUser.id); setConfirmDeleteUser(null); }} disabled={deleteUser.isPending} data-testid="button-confirm-delete-user">
              {deleteUser.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRtl ? 'حذف نهائي' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
