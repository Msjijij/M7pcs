import { useQuery } from "@tanstack/react-query";
import { useAppUser } from "@/hooks/use-app-user";
import { Loader2, Trophy, Crown, Medal, Star, Shield, Swords, Target, Gem, Flame, Rocket, Infinity, Sparkles, Footprints } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getRank } from "@/lib/ranks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/models/auth";

const RANK_ICONS: Record<string, any> = {
  Footprints, Shield, Swords, Crown, Target, Gem, Flame, Rocket, Infinity, Sparkles,
};

function PodiumCard({ entry, position, isCurrentUser }: { entry: User; position: number; isCurrentUser: boolean }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const rank = getRank(entry.totalSpent || 0);
  const RankIcon = RANK_ICONS[rank.icon] || Sparkles;

  const configs = [
    { icon: Crown, color: "text-yellow-400", bg: "podium-gold", height: "h-32 sm:h-40", order: "order-1 sm:order-2", label: isRtl ? "المركز الأول" : "1st Place", glow: "shadow-yellow-500/20" },
    { icon: Medal, color: "text-slate-300", bg: "podium-silver", height: "h-24 sm:h-28", order: "order-2 sm:order-1", label: isRtl ? "المركز الثاني" : "2nd Place", glow: "shadow-slate-400/20" },
    { icon: Star, color: "text-amber-600", bg: "podium-bronze", height: "h-20 sm:h-24", order: "order-3", label: isRtl ? "المركز الثالث" : "3rd Place", glow: "shadow-amber-600/20" },
  ];

  const config = configs[position];
  const PositionIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position === 0 ? 0.2 : position === 1 ? 0.1 : 0.3, duration: 0.6 }}
      className={`${config.order} flex flex-col items-center`}
      data-testid={`podium-${position}`}
    >
      <div className="relative mb-3">
        <div className={`${position === 0 ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-2xl ${config.bg} border p-1 shadow-xl ${config.glow}`}>
          <Avatar className="w-full h-full rounded-xl">
            <AvatarImage src={entry.profileImageUrl || undefined} alt={entry.username || entry.firstName || ""} className="rounded-xl" />
            <AvatarFallback className="bg-primary/20 text-primary text-lg sm:text-xl rounded-xl">{(entry.firstName || "U")[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 ${position === 0 ? 'border-yellow-400' : position === 1 ? 'border-slate-300' : 'border-amber-600'} flex items-center justify-center`}>
          <PositionIcon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        {isCurrentUser && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold whitespace-nowrap">
            {isRtl ? "أنت" : "You"}
          </div>
        )}
      </div>

      <div className="text-center mb-2">
        <p className="text-sm font-bold text-white truncate max-w-[120px]">{entry.firstName || entry.username}</p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <RankIcon className={`w-3 h-3 ${rank.textClass}`} />
          <span className={`text-[10px] font-bold ${rank.textClass}`}>{isRtl ? rank.nameAr : rank.name}</span>
        </div>
      </div>

      <div className={`w-full ${config.height} rounded-t-2xl ${config.bg} border border-b-0 flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <span className={`text-2xl sm:text-3xl font-bold ${config.color} relative z-10 font-display`}>
          #{position + 1}
        </span>
        <span className="text-xs sm:text-sm font-mono font-bold text-white relative z-10 mt-1" data-testid={`podium-spent-${position}`}>
          {((entry.totalSpent || 0) / 100).toFixed(0)} <span className="text-[10px] text-white/70">{t("common.sar")}</span>
        </span>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: currentUser } = useAppUser();

  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="space-y-10 sm:space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-medium"
        >
          <Trophy className="w-3.5 h-3.5" />
          {isRtl ? "المتصدرين" : "Leaderboard"}
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" data-testid="text-leaderboard-title">
          {isRtl ? (
            <>
              أفضل <span className="text-gradient">المنفقين</span>
            </>
          ) : (
            <>
              Top <span className="text-gradient">Spenders</span>
            </>
          )}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {isRtl ? "تعرف على أكثر العملاء تميزاً واحصل على رتب حصرية." : "Meet our most valued clients and earn exclusive ranks."}
        </p>
      </motion.div>

      {(!leaderboard || leaderboard.length === 0) ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{isRtl ? "لا توجد بيانات بعد" : "No data yet"}</p>
        </motion.div>
      ) : (
        <>
          {topThree.length > 0 && (
            <div className="max-w-lg mx-auto px-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end">
                {topThree.length > 1 && (
                  <PodiumCard entry={topThree[1]} position={1} isCurrentUser={currentUser?.id === topThree[1].id} />
                )}
                {topThree.length > 0 && (
                  <PodiumCard entry={topThree[0]} position={0} isCurrentUser={currentUser?.id === topThree[0].id} />
                )}
                {topThree.length > 2 && (
                  <PodiumCard entry={topThree[2]} position={2} isCurrentUser={currentUser?.id === topThree[2].id} />
                )}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-2 px-4">
              <div className="section-divider mb-6" />
              {rest.map((entry, index) => {
                const rank = getRank(entry.totalSpent || 0);
                const isCurrentUser = currentUser?.id === entry.id;
                const RankIcon = RANK_ICONS[rank.icon] || Sparkles;
                const position = index + 3;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`relative rounded-xl p-4 border transition-all duration-300 ${
                      isCurrentUser
                        ? "border-primary/30 bg-primary/5"
                        : "border-white/5 bg-white/[0.02]"
                    } hover:border-white/15`}
                    data-testid={`leaderboard-entry-${position}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10">
                        <span className="text-sm font-bold text-muted-foreground font-display">#{position + 1}</span>
                      </div>

                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={entry.profileImageUrl || undefined} alt={entry.username || entry.firstName || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">{(entry.firstName || "U")[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {entry.firstName || entry.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                              {isRtl ? "أنت" : "You"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RankIcon className={`w-3 h-3 ${rank.textClass}`} />
                          <span className={`text-[10px] font-bold ${rank.textClass}`}>
                            {isRtl ? rank.nameAr : rank.name}
                          </span>
                        </div>
                      </div>

                      <div className={`${isRtl ? 'text-left' : 'text-right'} flex-shrink-0`}>
                        <span className="text-sm font-mono font-bold text-primary" data-testid={`text-spent-${position}`}>
                          {((entry.totalSpent || 0) / 100).toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">{t("common.sar")}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${rank.gradientClass}`}
                          style={{ width: `${Math.max(rank.progress, 3)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
