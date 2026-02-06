import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAppUser } from "@/hooks/use-app-user";
import { Shield, LayoutDashboard, ShoppingBag, LogOut, Menu, X, Languages, Receipt, Megaphone, Wallet, Trophy, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getRank } from "@/lib/ranks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { data: user } = useAppUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';
  const isRtl = i18n.language === 'ar';
  const rank = getRank(user?.totalSpent || 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Shield },
    ...(isAuthenticated ? [
      { href: "/shop", label: t("nav.shop"), icon: ShoppingBag },
      { href: "/dashboard", label: t("nav.dashboard"), icon: Wallet },
      { href: "/transactions", label: t("nav.transactions"), icon: Receipt },
      { href: "/inbox", label: t("nav.inbox"), icon: Megaphone },
      { href: "/leaderboard", label: isRtl ? "المتصدرين" : "Leaderboard", icon: Trophy },
    ] : []),
    ...(isAdmin ? [{ href: "/admin", label: t("nav.admin"), icon: LayoutDashboard }] : []),
  ];

  return (
    <div className={`min-h-screen flex flex-col font-body ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className="fixed w-full z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3 group transition-transform duration-500 hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-amber-600 to-amber-900 flex items-center justify-center shadow-xl shadow-primary/20 transition-all duration-500 group-hover:rotate-[360deg] group-hover:shadow-primary/40">
                <Shield className="w-6 h-6 text-primary-foreground drop-shadow-md" />
              </div>
              <span className="font-display text-2xl font-bold tracking-widest text-white">
                M7 <span className="text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">PCs</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 relative py-2 ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                    }`}
                    data-testid={`nav-${link.href.replace("/", "") || "home"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-white/70 hover:text-white gap-2" data-testid="button-language-toggle">
                <Languages className="w-4 h-4" />
                {i18n.language === 'ar' ? 'EN' : 'عربي'}
              </Button>

              {isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 ${isRtl ? 'pr-3 pl-2' : 'pl-3 pr-2'} py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300`}
                    data-testid="button-profile-dropdown"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user.profileImageUrl || undefined} alt={user.username || user.firstName || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">{(user.firstName || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-mono text-primary font-medium">
                      {((user.balance || 0) / 100).toFixed(2)}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-72 bg-[#060b18] border border-white/10 rounded-xl shadow-2xl shadow-black/60 p-4 z-50`}
                        data-testid="dropdown-profile"
                      >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.profileImageUrl || undefined} alt={user.username || user.firstName || ""} />
                            <AvatarFallback className="bg-primary/20 text-primary">{(user.firstName || "U")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{user.firstName || user.username}</p>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{isRtl ? "الرصيد" : "Balance"}</span>
                            <span className="text-sm font-mono font-bold text-primary" data-testid="text-profile-balance">
                              {((user.balance || 0) / 100).toFixed(2)} {t("common.sar")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{isRtl ? "إجمالي المصروف" : "Total Spent"}</span>
                            <span className="text-sm font-mono text-white" data-testid="text-profile-spent">
                              {((user.totalSpent || 0) / 100).toFixed(2)} {t("common.sar")}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold ${rank.textClass}`} data-testid="text-profile-rank">{rank.level}</span>
                            {rank.nextTier !== "MAX" && (
                              <span className="text-[10px] text-muted-foreground">{isRtl ? `التالي: ${rank.nextTier}` : `Next: ${rank.nextTier}`}</span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${rank.bgClass.replace("/10", "/60")}`}
                              style={{ width: `${rank.progress}%` }}
                            />
                          </div>
                          {rank.remaining > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                              {isRtl ? `${rank.remaining.toFixed(0)} ر.س للترقية` : `${rank.remaining.toFixed(0)} SAR to next tier`}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => { setIsProfileOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          data-testid="button-logout"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("nav.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a href="/api/login" target="_top">
                  <Button
                    className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 gap-2"
                    data-testid="button-login"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                    {isRtl ? "دخول بالديسكورد" : "Login with Discord"}
                  </Button>
                </a>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated && user && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{(user.firstName || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-mono text-primary">{((user.balance || 0) / 100).toFixed(0)}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={toggleLanguage} data-testid="button-language-toggle-mobile">
                <Languages className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} data-testid="button-mobile-menu">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-panel border-t border-white/5"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {isAuthenticated && user && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/5 border border-white/10">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">{(user.firstName || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.firstName || user.username}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-primary">{((user.balance || 0) / 100).toFixed(2)} {t("common.sar")}</span>
                        <span className={`text-[10px] font-bold ${rank.textClass}`}>{rank.level}</span>
                      </div>
                    </div>
                  </div>
                )}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                    data-testid={`mobile-nav-${link.href.replace("/", "") || "home"}`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 ${isRtl ? 'text-right' : 'text-left'} mt-4`}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="w-5 h-5" />
                    {t("nav.logout")}
                  </button>
                ) : (
                  <a href="/api/login" target="_top" className="block mt-4">
                    <Button
                      className="w-full bg-primary text-primary-foreground font-semibold gap-2"
                      data-testid="button-mobile-login"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                      {isRtl ? "دخول بالديسكورد" : "Login with Discord"}
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="font-display text-primary text-lg">M7 PCs</p>
          <a href="https://discord.com/invite/M78" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors" data-testid="link-discord-server">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            {isRtl ? 'انضم لسيرفر الديسكورد' : 'Join our Discord'}
          </a>
          <p className="text-muted-foreground text-sm">
            {new Date().getFullYear()} M7 PCs. {isRtl ? 'حلول إدارة الأجهزة المتميزة.' : 'Premium Device Management Solutions.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
