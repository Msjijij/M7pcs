import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.shop": "Shop",
      "nav.dashboard": "Dashboard",
      "nav.transactions": "Transactions",
      "nav.inbox": "News",
      "nav.admin": "Admin",
      "nav.leaderboard": "Leaderboard",
      "nav.logout": "Logout",
      "nav.login": "Login with Discord",
      "home.hero.title": "Luxury Device Management",
      "home.hero.sub": "Automated, secure, and professional subscription management.",
      "home.getStarted": "Get Started",
      "shop.title": "Available Plans",
      "shop.buyNow": "Buy Now",
      "shop.deviceId": "Enter Device ID",
      "shop.confirm": "Confirm Purchase",
      "dashboard.balance": "Balance",
      "dashboard.topup": "Top Up",
      "dashboard.activeSubs": "Active Subscriptions",
      "dashboard.history": "History",
      "dashboard.status.pending": "Pending",
      "dashboard.status.active": "Active",
      "dashboard.status.expired": "Expired",
      "admin.title": "Admin Dashboard",
      "admin.pendingTopups": "Pending Topups",
      "admin.pendingSubs": "Pending Activations",
      "admin.approve": "Approve",
      "admin.reject": "Reject",
      "admin.activate": "Activate",
      "common.sar": "SAR",
      "transactions.title": "Transactions",
      "transactions.subtitle": "Track all your top-ups and purchases",
      "transactions.totalTopups": "Total Top-ups",
      "transactions.totalPurchases": "Total Purchases",
      "transactions.noTransactions": "No transactions yet",
      "transactions.filterAll": "All",
      "transactions.filterTopups": "Top-ups",
      "transactions.filterPurchases": "Purchases",
      "inbox.title": "News & Announcements",
      "inbox.subtitle": "Latest updates and announcements from admin",
      "inbox.noAnnouncements": "No announcements yet",
      "inbox.newAppear": "New announcements will appear here"
    }
  },
  ar: {
    translation: {
      "nav.home": "الرئيسية",
      "nav.shop": "المتجر",
      "nav.dashboard": "لوحة التحكم",
      "nav.transactions": "المعاملات",
      "nav.inbox": "الأخبار",
      "nav.admin": "الإدارة",
      "nav.leaderboard": "المتصدرين",
      "nav.logout": "تسجيل خروج",
      "nav.login": "دخول بالديسكورد",
      "home.hero.title": "إدارة أجهزة احترافية",
      "home.hero.sub": "أتمتة، أمان، وإدارة اشتراكات باحترافية عالية.",
      "home.getStarted": "ابدأ الآن",
      "shop.title": "الباقات المتاحة",
      "shop.buyNow": "شراء الآن",
      "shop.deviceId": "أدخل رقم الجهاز",
      "shop.confirm": "تأكيد الشراء",
      "dashboard.balance": "الرصيد",
      "dashboard.topup": "شحن الرصيد",
      "dashboard.activeSubs": "الاشتراكات الفعالة",
      "dashboard.history": "السجل",
      "dashboard.status.pending": "بانتظار التفعيل",
      "dashboard.status.active": "فعال",
      "dashboard.status.expired": "منتهي",
      "admin.title": "لوحة تحكم الإدارة",
      "admin.pendingTopups": "طلبات الشحن",
      "admin.pendingSubs": "بانتظار التفعيل",
      "admin.approve": "موافقة",
      "admin.reject": "رفض",
      "admin.activate": "تفعيل",
      "common.sar": "ريال",
      "transactions.title": "المعاملات",
      "transactions.subtitle": "تتبع جميع عمليات الشحن والمشتريات",
      "transactions.totalTopups": "إجمالي الشحن",
      "transactions.totalPurchases": "إجمالي المشتريات",
      "transactions.noTransactions": "لا توجد معاملات بعد",
      "transactions.filterAll": "الكل",
      "transactions.filterTopups": "الشحن",
      "transactions.filterPurchases": "المشتريات",
      "inbox.title": "الأخبار والإعلانات",
      "inbox.subtitle": "آخر التحديثات والإعلانات من الإدارة",
      "inbox.noAnnouncements": "لا توجد إعلانات حالياً",
      "inbox.newAppear": "ستظهر الإعلانات الجديدة هنا"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
