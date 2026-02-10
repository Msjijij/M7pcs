import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, CreditCard, Settings, UserCog } from "lucide-react";

interface FAQItem {
  id: string;
  category: "general" | "billing" | "technical" | "account";
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what-is-m7",
    category: "general",
    questionEn: "What is M7 PCs?",
    questionAr: "ما هو M7 PCs؟",
    answerEn: "M7 PCs is a premium device subscription and management platform. We provide automated, secure, and professional subscription services for device management, allowing you to purchase plans and manage your devices seamlessly.",
    answerAr: "M7 PCs هو منصة اشتراكات وإدارة أجهزة متميزة. نقدم خدمات اشتراك آلية وآمنة واحترافية لإدارة الأجهزة، مما يتيح لك شراء الباقات وإدارة أجهزتك بسلاسة.",
  },
  {
    id: "how-subscriptions-work",
    category: "general",
    questionEn: "How do subscriptions work?",
    questionAr: "كيف تعمل الاشتراكات؟",
    answerEn: "Browse available plans in the Shop, select a plan, enter your Device ID, and confirm the purchase. The subscription amount will be deducted from your balance. After admin approval, your subscription will be activated and you can track its countdown in your Dashboard.",
    answerAr: "تصفح الباقات المتاحة في المتجر، اختر باقة، أدخل رقم الجهاز، وأكد الشراء. سيتم خصم المبلغ من رصيدك. بعد موافقة الإدارة، سيتم تفعيل اشتراكك ويمكنك تتبع العد التنازلي في لوحة التحكم.",
  },
  {
    id: "how-topup-works",
    category: "billing",
    questionEn: "How does the top-up process work?",
    questionAr: "كيف تعمل عملية شحن الرصيد؟",
    answerEn: "Click the 'Top Up' button in your Dashboard, enter the amount in SAR, optionally attach a payment proof URL (e.g., a transfer receipt), and submit. An admin will review and approve your top-up request, after which the balance will be credited to your account.",
    answerAr: "اضغط على زر 'شحن الرصيد' في لوحة التحكم، أدخل المبلغ بالريال، أرفق رابط إثبات الدفع اختيارياً (مثل إيصال التحويل)، ثم أرسل. سيقوم المسؤول بمراجعة طلبك والموافقة عليه، وبعدها سيتم إضافة الرصيد لحسابك.",
  },
  {
    id: "contact-support",
    category: "general",
    questionEn: "How can I contact support?",
    questionAr: "كيف يمكنني التواصل مع الدعم؟",
    answerEn: "You can reach our support team through the built-in support chat system. Click the support icon to open a ticket, describe your issue, and our team will respond as soon as possible. You can also track your ticket status and history.",
    answerAr: "يمكنك التواصل مع فريق الدعم من خلال نظام الدردشة المدمج. اضغط على أيقونة الدعم لفتح تذكرة، اشرح مشكلتك، وسيرد فريقنا في أقرب وقت ممكن. يمكنك أيضاً تتبع حالة تذكرتك وسجلها.",
  },
  {
    id: "device-id-meaning",
    category: "technical",
    questionEn: "What is a Device ID and where do I find it?",
    questionAr: "ما هو رقم الجهاز وأين أجده؟",
    answerEn: "A Device ID is a unique identifier for your device that is required when purchasing a subscription. You can find it in your device settings or the application installed on your device. Each subscription is linked to a specific Device ID.",
    answerAr: "رقم الجهاز هو معرّف فريد لجهازك مطلوب عند شراء اشتراك. يمكنك العثور عليه في إعدادات جهازك أو التطبيق المثبت على جهازك. كل اشتراك مرتبط برقم جهاز محدد.",
  },
  {
    id: "coupon-usage",
    category: "billing",
    questionEn: "How do I use a coupon code?",
    questionAr: "كيف أستخدم كود الخصم؟",
    answerEn: "During the checkout process when purchasing a subscription, you can enter a coupon code to receive a discount. Coupons can be percentage-based or fixed amount discounts. Each coupon has specific terms including expiry dates and usage limits.",
    answerAr: "أثناء عملية الشراء عند شراء اشتراك، يمكنك إدخال كود خصم للحصول على تخفيض. يمكن أن تكون الكوبونات خصم نسبة مئوية أو مبلغ ثابت. لكل كوبون شروط محددة تشمل تواريخ انتهاء وحدود استخدام.",
  },
  {
    id: "referral-system",
    category: "account",
    questionEn: "How does the referral system work?",
    questionAr: "كيف يعمل نظام الإحالة؟",
    answerEn: "Each user gets a unique referral code. Share your code with friends — when they redeem it, both you and the new user receive a bonus credited to your balance. You can view your referral code and track all uses in your Profile page.",
    answerAr: "كل مستخدم يحصل على كود إحالة فريد. شارك الكود مع أصدقائك — عندما يستخدمونه، ستحصل أنت والمستخدم الجديد على مكافأة تضاف لرصيدكم. يمكنك عرض كود الإحالة وتتبع جميع الاستخدامات في صفحة الملف الشخصي.",
  },
  {
    id: "account-security",
    category: "account",
    questionEn: "How is my account secured?",
    questionAr: "كيف يتم تأمين حسابي؟",
    answerEn: "Your account is protected through our secure authentication system. We use industry-standard encryption for all data transfers. Your balance and transactions are managed securely, and all admin actions are logged for transparency.",
    answerAr: "حسابك محمي من خلال نظام المصادقة الآمن لدينا. نستخدم تشفيراً بمعايير الصناعة لجميع عمليات نقل البيانات. يتم إدارة رصيدك ومعاملاتك بأمان، ويتم تسجيل جميع إجراءات الإدارة لضمان الشفافية.",
  },
  {
    id: "subscription-renewal",
    category: "billing",
    questionEn: "Can I renew my subscription before it expires?",
    questionAr: "هل يمكنني تجديد اشتراكي قبل انتهائه؟",
    answerEn: "Yes, you can purchase a new subscription for the same device at any time. The new subscription will be queued and activated after admin approval. Make sure you have sufficient balance before purchasing.",
    answerAr: "نعم، يمكنك شراء اشتراك جديد لنفس الجهاز في أي وقت. سيتم وضع الاشتراك الجديد في قائمة الانتظار وتفعيله بعد موافقة الإدارة. تأكد من أن لديك رصيد كافٍ قبل الشراء.",
  },
  {
    id: "change-device",
    category: "technical",
    questionEn: "Can I transfer my subscription to another device?",
    questionAr: "هل يمكنني نقل اشتراكي لجهاز آخر؟",
    answerEn: "Subscriptions are tied to a specific Device ID and cannot be transferred automatically. Please contact support if you need to change your device. Our team will assist you with the process.",
    answerAr: "الاشتراكات مرتبطة برقم جهاز محدد ولا يمكن نقلها تلقائياً. يرجى التواصل مع الدعم إذا كنت بحاجة لتغيير جهازك. سيساعدك فريقنا في هذه العملية.",
  },
];

const CATEGORIES = [
  { key: "all", labelEn: "All", labelAr: "الكل", icon: HelpCircle },
  { key: "general", labelEn: "General", labelAr: "عام", icon: HelpCircle },
  { key: "billing", labelEn: "Billing", labelAr: "الفواتير", icon: CreditCard },
  { key: "technical", labelEn: "Technical", labelAr: "تقني", icon: Settings },
  { key: "account", labelEn: "Account", labelAr: "الحساب", icon: UserCog },
];

export default function FAQ() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.questionEn.toLowerCase().includes(query) ||
      item.questionAr.includes(query) ||
      item.answerEn.toLowerCase().includes(query) ||
      item.answerAr.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
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
          <HelpCircle className="w-3.5 h-3.5" />
          {isRtl ? "الأسئلة الشائعة" : "FAQ"}
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" data-testid="text-faq-title">
          {isRtl ? (
            <>
              الأسئلة <span className="text-gradient">الشائعة</span>
            </>
          ) : (
            <>
              Frequently Asked <span className="text-gradient">Questions</span>
            </>
          )}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {isRtl
            ? "إجابات على الأسئلة الأكثر شيوعاً حول خدماتنا"
            : "Answers to the most common questions about our services"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-4"
      >
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "ابحث في الأسئلة..." : "Search questions..."}
            className={`bg-white/5 border-white/10 text-white ${isRtl ? "pr-10 text-right" : "pl-10"}`}
            data-testid="input-faq-search"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 flex-wrap px-4"
      >
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                isActive
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
              data-testid={`button-category-${cat.key}`}
            >
              <CatIcon className="w-3 h-3" />
              {isRtl ? cat.labelAr : cat.labelEn}
            </button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-4"
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{isRtl ? "لم يتم العثور على نتائج" : "No results found"}</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3" data-testid="accordion-faq">
            {filteredItems.map((item, index) => {
              const cat = CATEGORIES.find((c) => c.key === item.category);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <AccordionItem
                    value={item.id}
                    className="glass-card rounded-md border border-white/5 px-5 overflow-visible"
                    data-testid={`faq-item-${item.id}`}
                  >
                    <AccordionTrigger className="text-white hover:no-underline py-4 gap-3">
                      <div className={`flex items-center gap-3 flex-1 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-white/10 text-muted-foreground flex-shrink-0">
                          {isRtl ? cat?.labelAr : cat?.labelEn}
                        </Badge>
                        <span className="text-sm font-medium">
                          {isRtl ? item.questionAr : item.questionEn}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={`text-muted-foreground leading-relaxed ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? item.answerAr : item.answerEn}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        )}
      </motion.div>
    </div>
  );
}
