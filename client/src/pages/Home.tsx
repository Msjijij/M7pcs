import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Zap, Lock, CreditCard, Monitor, Headphones, Clock, Wifi, CheckCircle, ArrowRight, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { isAuthenticated } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stats = [
    { value: "350", label: isRtl ? "ريال / سنة" : "SAR / Year", suffix: "" },
    { value: "24/7", label: isRtl ? "دعم متواصل" : "Support", suffix: "" },
    { value: "99.9%", label: isRtl ? "وقت التشغيل" : "Uptime", suffix: "" },
    { value: "1K+", label: isRtl ? "عميل نشط" : "Active Users", suffix: "" },
  ];

  const features = [
    {
      icon: Monitor,
      title: isRtl ? "إدارة متعددة الأجهزة" : "Multi-Device Management",
      description: isRtl ? "إدارة جميع أجهزتك من لوحة تحكم واحدة موحدة." : "Manage all your devices from one unified dashboard.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Zap,
      title: isRtl ? "تفعيل فوري" : "Instant Activation",
      description: isRtl ? "تفعيل سريع بعد الموافقة مع معالجة آلية." : "Rapid activation upon approval with automated processing.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Shield,
      title: isRtl ? "حماية متقدمة" : "Advanced Protection",
      description: isRtl ? "بروتوكولات أمان احترافية لحماية أجهزتك وبياناتك." : "Enterprise-grade security protocols to protect your devices and data.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: CreditCard,
      title: isRtl ? "محفظة ذكية" : "Smart Wallet",
      description: isRtl ? "نظام شحن مرن مع تتبع كامل للمعاملات." : "Flexible top-up system with complete transaction tracking.",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Headphones,
      title: isRtl ? "دعم متميز" : "Premium Support",
      description: isRtl ? "فريق دعم متخصص على مدار الساعة لمساعدتك." : "Dedicated support team available around the clock.",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      icon: Globe,
      title: isRtl ? "واجهة ثنائية اللغة" : "Bilingual Interface",
      description: isRtl ? "دعم كامل للعربية والإنجليزية مع تجربة سلسة." : "Full Arabic & English support with seamless experience.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ];

  const services = [
    {
      title: isRtl ? "اشتراك سنوي" : "Annual Subscription",
      description: isRtl ? "اشتراك كامل لمدة سنة مع كل المميزات" : "Full year subscription with all features",
      status: isRtl ? "متاح" : "Available",
      gradient: "from-primary/20 via-amber-600/10 to-transparent",
    },
    {
      title: isRtl ? "شحن المحفظة" : "Wallet Top-Up",
      description: isRtl ? "اشحن رصيدك بسهولة عبر التحويل البنكي" : "Easily top up via bank transfer",
      status: isRtl ? "فوري" : "Instant",
      gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
    },
    {
      title: isRtl ? "إدارة الأجهزة" : "Device Management",
      description: isRtl ? "تتبع وإدارة جميع أجهزتك المشتركة" : "Track and manage all your subscribed devices",
      status: isRtl ? "24/7" : "24/7",
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
    },
  ];

  return (
    <div className="space-y-0 -mt-8 md:-mt-12">
      <section className="relative pt-16 sm:pt-24 md:pt-32 pb-20 sm:pb-28 md:pb-36 text-center overflow-hidden" data-testid="section-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-primary/15 rounded-full blur-[100px] sm:blur-[150px] -z-10" />
        <div className="absolute top-20 left-10 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[80px] -z-10" />
        <div className={`absolute bottom-20 ${isRtl ? 'left-10' : 'right-10'} w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] -z-10`} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-medium"
            data-testid="badge-hero"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isRtl ? 'منصة حصرية لإدارة الأجهزة' : 'Exclusive Device Management Platform'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            data-testid="text-hero-title"
          >
            {isRtl ? (
              <>
                إدارة أجهزتك
                <br />
                <span className="text-gradient">باحترافية عالية</span>
              </>
            ) : (
              <>
                Premium Device
                <br />
                <span className="text-gradient">Management</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            {isRtl
              ? 'تابع أجهزتك، أدر اشتراكاتك، وحقق أقصى استفادة مع M7 PCs. وصول حصري للأعضاء المعتمدين فقط.'
              : 'Track your devices, manage subscriptions, and maximize performance with M7 PCs. Exclusive access for approved members only.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-6"
          >
            {isAuthenticated ? (
              <>
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto shadow-xl shadow-primary/20 gap-2" data-testid="button-hero-shop">
                    {isRtl ? 'تصفح الباقات' : 'Browse Plans'}
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto border-white/10" data-testid="button-hero-dashboard">
                    {isRtl ? 'لوحة التحكم' : 'Dashboard'}
                  </Button>
                </Link>
              </>
            ) : (
              <a href="/api/login" target="_top">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto shadow-xl shadow-primary/20 gap-2" data-testid="button-hero-login">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  {isRtl ? 'دخول بالديسكورد' : 'Login with Discord'}
                </Button>
              </a>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs sm:text-sm text-muted-foreground/60 flex items-center justify-center gap-2"
          >
            <Lock className="w-3 h-3" />
            {isRtl ? 'الوصول يتطلب موافقة الإدارة' : 'Access requires admin approval'}
          </motion.p>
        </motion.div>
      </section>

      <section className="py-8 sm:py-12" data-testid="section-stats">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="text-center py-4 sm:py-6 px-3 rounded-2xl bg-white/[0.02] border border-white/5"
                data-testid={`stat-${idx}`}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-display">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4" data-testid="section-features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="text-features-title">
              {isRtl ? 'كل ما تحتاجه' : 'Everything You Need'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              {isRtl ? 'أدوات احترافية لإدارة أجهزتك بكفاءة وتحقيق أقصى استفادة.' : 'Professional tools to manage your devices efficiently and maximize performance.'}
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className="group rounded-2xl p-6 sm:p-8 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
                data-testid={`card-feature-${idx}`}
              >
                <div className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4" data-testid="section-services">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="text-services-title">
              {isRtl ? 'خدماتنا' : 'Our Services'}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              {isRtl ? 'حلول متكاملة لإدارة أجهزتك واشتراكاتك بسهولة.' : 'Integrated solutions to manage your devices and subscriptions with ease.'}
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={item}
                className={`group relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br ${service.gradient} border border-white/5 hover:border-white/10 transition-all duration-500`}
                data-testid={`card-service-${idx}`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg font-bold text-white">{service.title}</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 px-4" data-testid="section-cta">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 sm:p-12 md:p-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_60%)] -z-10" />

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-cta-title">
              {isRtl ? 'مستعد للبدء؟' : 'Ready to get started?'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm sm:text-base">
              {isRtl
                ? 'انضم للمجتمع الحصري واستخدم M7 PCs لإدارة أجهزتك وتحقيق أقصى استفادة.'
                : 'Join the exclusive community using M7 PCs to manage devices and maximize performance.'}
            </p>

            {isAuthenticated ? (
              <Link href="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto shadow-xl shadow-primary/20 gap-2" data-testid="button-cta-shop">
                  {isRtl ? 'تصفح الباقات' : 'Browse Plans'}
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </Button>
              </Link>
            ) : (
              <a href="/api/login" target="_top">
                <Button size="lg" className="bg-primary text-primary-foreground text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto shadow-xl shadow-primary/20 gap-2" data-testid="button-cta-login">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  {isRtl ? 'دخول بالديسكورد' : 'Login with Discord'}
                </Button>
              </a>
            )}

            <p className="text-xs text-muted-foreground/60 mt-6 flex items-center justify-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-primary/50" />
              {isRtl ? 'وصول حصري • موافقة يدوية مطلوبة' : 'Exclusive access • Manual approval required'}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
