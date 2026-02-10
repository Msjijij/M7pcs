import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppUser } from "@/hooks/use-app-user";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Search, Package, ShoppingCart, Loader2, Filter, XCircle, Send, Clock, CheckCircle2, ShieldCheck, FileText, Tag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type ResellerCategory = {
  id: number;
  name: string;
  nameAr: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

type ResellerProduct = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  category: ResellerCategory;
  stockCount: number;
  soldCount: number;
};

type ApplicationStatus = {
  status: "none" | "pending" | "approved" | "rejected";
  isAdmin?: boolean;
  application?: {
    id: number;
    reason: string;
    adminNote: string | null;
    createdAt: string;
  };
};

function ResellerApplyForm({ isRtl, onSuccess }: { isRtl: boolean; onSuccess: () => void }) {
  const { toast } = useToast();
  const { data: user } = useAppUser();
  const [discordUsername, setDiscordUsername] = useState(user?.username || "");
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");

  const apply = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reseller/apply", { discordUsername, reason, experience });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isRtl ? "تم إرسال الطلب" : "Application Submitted",
        description: isRtl ? "سيتم مراجعة طلبك من قبل الإدارة" : "Your application will be reviewed by admin",
      });
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: isRtl ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
          {isRtl ? "انضم كموزع" : "Become a Reseller"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {isRtl ? "قدم طلبك للحصول على صلاحية الوصول لمتجر الحسابات الرقمية" : "Apply to get access to the digital accounts marketplace"}
        </p>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-white">{isRtl ? "اسم المستخدم في ديسكورد" : "Discord Username"}</Label>
            <Input
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="username#0000"
              className="bg-black/30 border-white/10 text-white"
              data-testid="input-apply-discord"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">{isRtl ? "لماذا تريد أن تصبح موزع؟" : "Why do you want to become a reseller?"}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRtl ? "اكتب سبب تقديمك..." : "Tell us why you're applying..."}
              className="bg-black/30 border-white/10 text-white min-h-[100px]"
              data-testid="input-apply-reason"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">{isRtl ? "خبرتك السابقة (اختياري)" : "Previous Experience (Optional)"}</Label>
            <Textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={isRtl ? "هل لديك خبرة سابقة في بيع الحسابات الرقمية؟" : "Do you have experience selling digital accounts?"}
              className="bg-black/30 border-white/10 text-white min-h-[80px]"
              data-testid="input-apply-experience"
            />
          </div>
          <Button
            className="w-full"
            disabled={!discordUsername || !reason || apply.isPending}
            onClick={() => apply.mutate()}
            data-testid="button-submit-application"
          >
            {apply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className={isRtl ? "mr-2" : "ml-2"}>{isRtl ? "إرسال الطلب" : "Submit Application"}</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ApplicationPending({ isRtl }: { isRtl: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">
        {isRtl ? "طلبك قيد المراجعة" : "Application Under Review"}
      </h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        {isRtl ? "تم استلام طلبك وسيتم مراجعته من قبل فريق الإدارة. سيتم إعلامك عند الموافقة." : "Your application has been received and is being reviewed by our team. You'll be notified once approved."}
      </p>
    </motion.div>
  );
}

function ApplicationRejected({ isRtl, adminNote, onReapply }: { isRtl: boolean; adminNote?: string | null; onReapply: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">
        {isRtl ? "تم رفض طلبك" : "Application Rejected"}
      </h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
        {isRtl ? "للأسف، تم رفض طلبك للانضمام كموزع." : "Unfortunately, your reseller application was not approved."}
      </p>
      {adminNote && (
        <Card className="bg-black/20 border-white/10 mb-6 text-left">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{isRtl ? "ملاحظة الإدارة:" : "Admin Note:"}</p>
            <p className="text-sm text-white">{adminNote}</p>
          </CardContent>
        </Card>
      )}
      <Button onClick={onReapply} data-testid="button-reapply">
        <FileText className="w-4 h-4" />
        <span className={isRtl ? "mr-2" : "ml-2"}>{isRtl ? "تقديم طلب جديد" : "Apply Again"}</span>
      </Button>
    </motion.div>
  );
}

export default function Reseller() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { data: user } = useAppUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: appStatus, isLoading: appLoading } = useQuery<ApplicationStatus>({
    queryKey: ["/api/reseller/application/status"],
  });

  const isApproved = appStatus?.status === "approved" || appStatus?.isAdmin;

  const { data: categories = [] } = useQuery<ResellerCategory[]>({
    queryKey: ["/api/reseller/categories"],
    enabled: !!isApproved,
  });

  const { data: products = [], isLoading } = useQuery<ResellerProduct[]>({
    queryKey: ["/api/reseller/products"],
    enabled: !!isApproved,
  });

  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (stockFilter === "in_stock" && p.stockCount === 0) return false;
    if (stockFilter === "out_of_stock" && p.stockCount > 0) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCategories = categories.filter(c => c.isActive);

  if (appLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isApproved) {
    if (appStatus?.status === "pending") {
      return <ApplicationPending isRtl={isRtl} />;
    }
    if (appStatus?.status === "rejected" && !showApplyForm) {
      return <ApplicationRejected isRtl={isRtl} adminNote={appStatus?.application?.adminNote} onReapply={() => setShowApplyForm(true)} />;
    }
    return (
      <ResellerApplyForm
        isRtl={isRtl}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/reseller/application/status"] });
          setShowApplyForm(false);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
          {isRtl ? "متجر الحسابات الرقمية" : "Digital Accounts Store"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          {isRtl ? "حسابات رقمية فورية - اشتري واستلم حسابك فوراً" : "Instant digital accounts - buy and receive your account immediately"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0 space-y-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "بحث المنتجات..." : "Search products..."}
              className={`bg-black/30 border-white/10 text-white ${isRtl ? "pr-10" : "pl-10"}`}
              data-testid="input-reseller-search"
            />
          </div>

          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Filter className="w-4 h-4" />
                {isRtl ? "تصفية" : "FILTER"}
              </div>

              <button
                onClick={() => { setSelectedCategory(null); setStockFilter("all"); }}
                className={`w-full text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  !selectedCategory && stockFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
                data-testid="filter-all"
              >
                <span>{isRtl ? "جميع المنتجات" : "All Products"}</span>
                <Badge variant="secondary" className="text-[10px] min-w-[24px] justify-center">{products.filter(p => p.isActive).length}</Badge>
              </button>

              <button
                onClick={() => { setSelectedCategory(null); setStockFilter("in_stock"); }}
                className={`w-full text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  stockFilter === "in_stock" && !selectedCategory ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
                data-testid="filter-in-stock"
              >
                <span>{isRtl ? "متوفر" : "In Stock"}</span>
                <Badge variant="secondary" className="text-[10px] min-w-[24px] justify-center">{products.filter(p => p.isActive && p.stockCount > 0).length}</Badge>
              </button>

              <button
                onClick={() => { setSelectedCategory(null); setStockFilter("out_of_stock"); }}
                className={`w-full text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  stockFilter === "out_of_stock" && !selectedCategory ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
                data-testid="filter-out-of-stock"
              >
                <span>{isRtl ? "نفذ المخزون" : "Out of Stock"}</span>
                <Badge variant="secondary" className="text-[10px] min-w-[24px] justify-center">{products.filter(p => p.isActive && p.stockCount === 0).length}</Badge>
              </button>

              {activeCategories.length > 0 && (
                <>
                  <div className="border-t border-white/10 pt-3 mt-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      {isRtl ? "التصنيفات" : "Categories"}
                    </span>
                  </div>
                  {activeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setStockFilter("all"); }}
                      className={`w-full text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategory === cat.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                      data-testid={`filter-category-${cat.id}`}
                    >
                      <span>{isRtl && cat.nameAr ? cat.nameAr : cat.name}</span>
                      <Badge variant="secondary" className="text-[10px] min-w-[24px] justify-center">
                        {products.filter(p => p.isActive && p.categoryId === cat.id).length}
                      </Badge>
                    </button>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {isRtl
              ? `عرض ${filteredProducts.length} منتج${selectedCategory ? " - " + activeCategories.find(c => c.id === selectedCategory)?.name : ""}`
              : `Showing ${filteredProducts.length} products${selectedCategory ? " - " + activeCategories.find(c => c.id === selectedCategory)?.name : ""}`}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRtl ? "لا توجد منتجات" : "No products found"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  data-testid={`card-reseller-product-${product.id}`}
                >
                  <Card
                    className="bg-black/30 border-white/10 overflow-hidden group hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    onClick={() => setLocation(`/reseller/${product.id}`)}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                          <Package className="w-16 h-16 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={product.stockCount > 0 ? "default" : "destructive"}
                          className={`text-[10px] backdrop-blur-sm ${product.stockCount > 0 ? "bg-emerald-600/90" : "bg-red-600/90"}`}
                        >
                          {product.stockCount > 0
                            ? (isRtl ? `متوفر ${product.stockCount}` : `${product.stockCount} Available`)
                            : (isRtl ? "نفذ المخزون" : "Out of Stock")}
                        </Badge>
                      </div>
                      {product.soldCount > 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-[10px] bg-black/60 backdrop-blur-sm border-white/10">
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {product.soldCount}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-primary/70 uppercase tracking-wider font-medium">
                          {isRtl ? (product.category?.nameAr || product.category?.name) : product.category?.name}
                        </span>
                        <h3 className="font-bold text-white text-base line-clamp-1 mt-0.5" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                      </div>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-product-desc-${product.id}`}>
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-primary font-bold text-xl font-mono" data-testid={`text-product-price-${product.id}`}>
                            {(product.price / 100).toFixed(0)}
                          </span>
                          <span className="text-xs text-muted-foreground">{isRtl ? "ر.س" : "SAR"}</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={product.stockCount === 0}
                          onClick={(e) => { e.stopPropagation(); setLocation(`/reseller/${product.id}`); }}
                          data-testid={`button-buy-${product.id}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className={isRtl ? "mr-1.5" : "ml-1.5"}>
                            {product.stockCount === 0
                              ? (isRtl ? "نفذ" : "Sold Out")
                              : (isRtl ? "شراء" : "Buy")}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
