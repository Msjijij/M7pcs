import { useAppUser } from "@/hooks/use-app-user";
import { useTopups } from "@/hooks/use-topups";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2, ArrowUpRight, ArrowDownRight, Wallet, ShoppingCart, Filter } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type TransactionType = "all" | "topup" | "purchase";

interface Transaction {
  id: string;
  type: "topup" | "purchase";
  amount: number;
  status: string;
  date: Date;
  details: string;
  deviceId?: string;
}

export default function Transactions() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: user, isLoading: isUserLoading } = useAppUser();
  const { data: topups, isLoading: isTopupsLoading } = useTopups();
  const { data: subscriptions, isLoading: isSubsLoading } = useSubscriptions();
  const [filter, setFilter] = useState<TransactionType>("all");

  if (isUserLoading || isTopupsLoading || isSubsLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  }

  const transactions: Transaction[] = [
    ...(topups?.map(t => ({
      id: `topup-${t.id}`,
      type: "topup" as const,
      amount: t.amount,
      status: t.status,
      date: new Date(t.createdAt!),
      details: t.proofUrl ? (isRtl ? 'شحن رصيد (مع إثبات)' : 'Wallet Top-Up (with proof)') : (isRtl ? 'شحن رصيد' : 'Wallet Top-Up'),
    })) || []),
    ...(subscriptions?.map(s => ({
      id: `sub-${s.id}`,
      type: "purchase" as const,
      amount: s.product ? s.product.price : 0,
      status: s.status,
      date: new Date(s.createdAt!),
      details: s.product?.name || (isRtl ? 'اشتراك' : 'Subscription'),
      deviceId: s.deviceId,
    })) || []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  const totalTopups = (topups?.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0);
  const totalPurchases = (subscriptions?.reduce((sum, s) => sum + (s.product?.price || 0), 0) || 0);

  const filters: { value: TransactionType; label: string }[] = [
    { value: "all", label: isRtl ? "الكل" : "All" },
    { value: "topup", label: isRtl ? "الشحن" : "Top-ups" },
    { value: "purchase", label: isRtl ? "المشتريات" : "Purchases" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white" data-testid="text-transactions-title">
          {isRtl ? 'المعاملات' : 'Transactions'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRtl ? 'تتبع جميع عمليات الشحن والمشتريات' : 'Track all your top-ups and purchases'}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-900/5"
          data-testid="card-total-topups"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-emerald-400 font-medium">{isRtl ? 'إجمالي الشحن' : 'Total Top-ups'}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            +{(totalTopups / 100).toFixed(2)} <span className="text-sm text-muted-foreground">{t("common.sar")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-rose-500/10 to-rose-900/5"
          data-testid="card-total-purchases"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-sm text-rose-400 font-medium">{isRtl ? 'إجمالي المشتريات' : 'Total Purchases'}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            -{(totalPurchases / 100).toFixed(2)} <span className="text-sm text-muted-foreground">{t("common.sar")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-amber-900/5"
          data-testid="card-current-balance"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-primary font-medium">{t("dashboard.balance")}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            {((user?.balance || 0) / 100).toFixed(2)} <span className="text-sm text-muted-foreground">{t("common.sar")}</span>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        {filters.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "ghost"}
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
            data-testid={`button-filter-${f.value}`}
          >
            {f.label}
          </Button>
        ))}
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground" data-testid="text-no-transactions">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{isRtl ? 'لا توجد معاملات بعد' : 'No transactions yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group"
                data-testid={`row-transaction-${tx.id}`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'topup' 
                      ? 'bg-emerald-500/15 text-emerald-400' 
                      : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {tx.type === 'topup' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{tx.details}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(tx.date, 'PP p')}
                      </span>
                      {tx.deviceId && (
                        <span className="text-xs font-mono text-primary/70 bg-primary/10 px-2 py-0.5 rounded-md">
                          {tx.deviceId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-3 flex-shrink-0 ${isRtl ? 'mr-4' : 'ml-4'}`}>
                  <StatusBadge status={tx.status} />
                  <span className={`font-mono font-bold text-sm whitespace-nowrap ${
                    tx.type === 'topup' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'topup' ? '+' : '-'}{(tx.amount / 100).toFixed(2)} {t("common.sar")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
