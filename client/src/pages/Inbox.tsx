import { useAnnouncements } from "@/hooks/use-announcements";
import { Loader2, Bell, AlertTriangle, Info, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Inbox() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: announcements, isLoading } = useAnnouncements();

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
          dot: 'bg-rose-400',
          label: isRtl ? 'عاجل' : 'Urgent',
        };
      case 'important':
        return {
          icon: Bell,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
          dot: 'bg-amber-400',
          label: isRtl ? 'مهم' : 'Important',
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10 border-blue-500/20',
          dot: 'bg-blue-400',
          label: isRtl ? 'عام' : 'General',
        };
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white" data-testid="text-inbox-title">
              {isRtl ? 'الأخبار والإعلانات' : 'News & Announcements'}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {isRtl ? 'آخر التحديثات والإعلانات من الإدارة' : 'Latest updates and announcements from admin'}
            </p>
          </div>
        </div>
      </motion.div>

      {(!announcements || announcements.length === 0) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12 text-center"
          data-testid="text-no-announcements"
        >
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground text-lg">
            {isRtl ? 'لا توجد إعلانات حالياً' : 'No announcements yet'}
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {isRtl ? 'ستظهر الإعلانات الجديدة هنا' : 'New announcements will appear here'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, idx) => {
            const config = getPriorityConfig(announcement.priority);
            const Icon = config.icon;
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card rounded-2xl p-6 border ${config.bg} hover:border-opacity-50 transition-all duration-300`}
                data-testid={`card-announcement-${announcement.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-lg font-bold text-white" data-testid={`text-announcement-title-${announcement.id}`}>
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid={`text-announcement-body-${announcement.id}`}>
                      {announcement.body}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-3">
                      {format(new Date(announcement.createdAt!), 'PPP p')}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
