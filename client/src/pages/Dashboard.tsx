import { useAppUser } from "@/hooks/use-app-user";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useTopups, useCreateTopup } from "@/hooks/use-topups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, Wallet, History, Smartphone, Calendar, Plus, Clock, Timer, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getRank } from "@/lib/ranks";

function CountdownTimer({ endDate }: { endDate: string }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculate() {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const units = [
    { label: isRtl ? "يوم" : "Days", value: timeLeft.days },
    { label: isRtl ? "ساعة" : "Hrs", value: timeLeft.hours },
    { label: isRtl ? "دقيقة" : "Min", value: timeLeft.minutes },
    { label: isRtl ? "ثانية" : "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2" data-testid="countdown-timer">
      {units.map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-primary">{String(unit.value).padStart(2, "0")}</span>
          </div>
          <span className="text-[9px] text-muted-foreground mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: user, isLoading: isUserLoading } = useAppUser();
  const { data: subscriptions, isLoading: isSubsLoading } = useSubscriptions();
  const { data: topups, isLoading: isTopupsLoading } = useTopups();
  const createTopup = useCreateTopup();
  const rank = getRank(user?.totalSpent || 0);

  const [topupOpen, setTopupOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  if (isUserLoading || isSubsLoading || isTopupsLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  }

  const handleTopup = async () => {
    try {
      await createTopup.mutateAsync({
        amount: parseFloat(amount) * 100,
        proofUrl: proofUrl || undefined
      });
      setTopupOpen(false);
      setAmount("");
      setProofUrl("");
    } catch (e) {
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} p-8 opacity-5`}>
            <Wallet className="w-48 h-48 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2" data-testid="text-welcome">
            {isRtl ? `${user?.firstName}` : `Welcome, ${user?.firstName}`}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {isRtl ? 'إدارة اشتراكاتك ومحفظتك بأمان.' : 'Manage your subscriptions and wallet securely.'}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${rank.bgClass} border ${rank.borderClass}`}>
              <Trophy className={`w-3.5 h-3.5 ${rank.textClass}`} />
              <span className={`text-xs font-bold ${rank.textClass}`} data-testid="text-dashboard-rank">{rank.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isRtl ? `إجمالي المصروف: ${((user?.totalSpent || 0) / 100).toFixed(2)} ر.س` : `Total spent: ${((user?.totalSpent || 0) / 100).toFixed(2)} SAR`}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-secondary/40 border-primary/20"
        >
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Wallet className="w-6 h-6" />
            <span className="font-medium">{t("dashboard.balance")}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-6 font-mono" data-testid="text-dashboard-balance">
            {((user?.balance || 0) / 100).toFixed(2)} <span className="text-lg text-muted-foreground">{t("common.sar")}</span>
          </div>
          <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/10" data-testid="button-topup">
                <Plus className="w-4 h-4" />
                {t("dashboard.topup")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0f1e] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-primary">{isRtl ? 'إضافة رصيد' : 'Add Funds'}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {isRtl ? 'تقديم طلب شحن رصيد. سيتم إضافة المبلغ بعد موافقة الإدارة.' : 'Submit a top-up request. Funds will be added after admin approval.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{isRtl ? 'المبلغ (ريال)' : 'Amount (SAR)'}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="100"
                    data-testid="input-topup-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? 'رابط إثبات الدفع (اختياري)' : 'Payment Proof URL (Optional)'}</Label>
                  <Input
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    className="bg-black/20 border-white/10 text-white"
                    placeholder="https://imgur.com/..."
                    data-testid="input-topup-proof"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? 'ارفع صورة الإيصال وضع الرابط هنا.' : 'Upload your transfer receipt to an image host and paste the link here.'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleTopup} disabled={!amount || createTopup.isPending} className="bg-primary text-primary-foreground" data-testid="button-submit-topup">
                  {createTopup.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isRtl ? 'إرسال الطلب' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl">
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg" data-testid="tab-subscriptions">
            {t("dashboard.activeSubs")}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg" data-testid="tab-history">
            {t("dashboard.history")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptions?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isRtl ? 'لا يوجد اشتراكات حالياً.' : 'No active subscriptions found.'}</p>
              </div>
            )}
            {subscriptions?.map((sub) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={sub.id}
              >
                <Card className="glass-card hover-glow transition-all duration-500" data-testid={`card-subscription-${sub.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl font-bold text-white line-clamp-1">{sub.product.name}</CardTitle>
                      <StatusBadge status={sub.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group transition-colors hover:bg-white/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Smartphone className="w-4 h-4 text-primary/70" />
                          <span>{isRtl ? 'رقم الجهاز' : 'Device ID'}</span>
                        </div>
                        <span className="font-mono text-white select-all" data-testid={`text-device-${sub.id}`}>{sub.deviceId}</span>
                      </div>

                      {sub.status === 'pending_activation' && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-amber-300">
                            {isRtl ? 'بانتظار موافقة الإدارة...' : 'Awaiting admin approval...'}
                          </span>
                        </div>
                      )}

                      {sub.status === 'active' && sub.endDate && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Timer className="w-4 h-4 text-primary/70" />
                            <span>{isRtl ? 'الوقت المتبقي' : 'Time Remaining'}</span>
                          </div>
                          <CountdownTimer endDate={sub.endDate.toString()} />
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5 text-primary/70" />
                              <span className="text-xs">{isRtl ? 'ينتهي في' : 'Expires'}</span>
                            </div>
                            <span className="text-xs text-white font-medium">
                              {format(new Date(sub.endDate), 'PPP')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} data-testid="table-topup-history">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="p-4 font-medium">{isRtl ? 'النوع' : 'Type'}</th>
                    <th className="p-4 font-medium">{isRtl ? 'المبلغ' : 'Amount'}</th>
                    <th className="p-4 font-medium">{isRtl ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topups?.map((topup) => (
                    <tr key={topup.id} className="hover:bg-white/5 transition-colors" data-testid={`row-topup-${topup.id}`}>
                      <td className="p-4 text-white">{format(new Date(topup.createdAt!), 'PP p')}</td>
                      <td className="p-4 text-muted-foreground">{isRtl ? 'شحن رصيد' : 'Top Up'}</td>
                      <td className="p-4 font-mono font-medium text-emerald-400">
                        +{(topup.amount / 100).toFixed(2)} {t("common.sar")}
                      </td>
                      <td className="p-4"><StatusBadge status={topup.status} /></td>
                    </tr>
                  ))}
                  {topups?.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{isRtl ? 'لا توجد معاملات بعد' : 'No transactions yet'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
