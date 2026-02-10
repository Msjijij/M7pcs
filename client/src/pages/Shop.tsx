import { useProducts } from "@/hooks/use-products";
import { useAppUser } from "@/hooks/use-app-user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, Check, Clock, AlertCircle, Shield, Headphones, Zap, ArrowRight, Crown, Sparkles, Wallet, Search, Tag, Percent, CheckCircle2, XCircle, Star, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function Shop() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { data: products, isLoading } = useProducts();
  const { data: user } = useAppUser();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; type: string; value: number; id: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_low" | "price_high" | "duration">("default");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const createSub = useMutation({
    mutationFn: async (data: { productId: number; deviceId: string; couponCode?: string }) => {
      const res = await apiRequest("POST", api.subscriptions.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      setSelectedProduct(null);
      setDeviceId("");
      setCouponCode("");
      setCouponResult(null);
      toast({ title: isRtl ? "تم الشراء بنجاح!" : "Purchase successful!", description: isRtl ? "اشتراكك بانتظار التفعيل" : "Your subscription is pending activation" });
    },
    onError: (error: any) => {
      if (error.message?.includes("Insufficient") || error.message === "INSUFFICIENT_FUNDS") {
        toast({
          title: isRtl ? "الرصيد غير كافي" : "Insufficient Balance",
          description: isRtl ? "رصيدك الحالي لا يكفي لإتمام عملية الشراء." : "Your balance is not enough to complete this purchase.",
          variant: "destructive",
          action: (
            <Button size="sm" variant="outline" onClick={() => setLocation("/dashboard")} className="gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              {isRtl ? "اشحن الآن" : "Top Up Now"}
            </Button>
          ),
        });
      } else {
        toast({ title: isRtl ? "خطأ" : "Error", description: error.message, variant: "destructive" });
      }
    }
  });

  const validateCoupon = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/coupons/validate", { code });
      return res.json();
    },
    onSuccess: (data) => {
      setCouponResult(data);
      setCouponError("");
    },
    onError: (err: any) => {
      setCouponResult(null);
      setCouponError(err.message || (isRtl ? "كوبون غير صالح" : "Invalid coupon"));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const handleBuy = async () => {
    if (!selectedProduct) return;
    await createSub.mutateAsync({
      productId: selectedProduct,
      deviceId,
      couponCode: couponResult ? couponCode : undefined,
    });
  };

  const selectedProd = products?.find(p => p.id === selectedProduct);
  const getDiscountedPrice = () => {
    if (!selectedProd || !couponResult) return selectedProd?.price || 0;
    if (couponResult.type === 'percentage') {
      return selectedProd.price - Math.floor(selectedProd.price * couponResult.value / 100);
    }
    return Math.max(0, selectedProd.price - couponResult.value);
  };

  const filteredProducts = products?.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'duration') return b.durationDays - a.durationDays;
    return 0;
  }) || [];

  const planFeatures = [
    { icon: Check, label: isRtl ? "تفعيل بعد الموافقة" : "Activation after approval" },
    { icon: Shield, label: isRtl ? "حماية متقدمة للجهاز" : "Advanced device protection" },
    { icon: Headphones, label: isRtl ? "دعم فني على مدار الساعة" : "24/7 technical support" },
    { icon: Zap, label: isRtl ? "تحديثات مستمرة" : "Continuous updates" },
    { icon: Clock, label: isRtl ? "مراقبة على مدار الساعة" : "Round-the-clock monitoring" },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
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
          <Crown className="w-3.5 h-3.5" />
          {isRtl ? 'باقات حصرية' : 'Exclusive Plans'}
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" data-testid="text-shop-title">
          {isRtl ? (
            <>{t("shop.title").split(" ")[0]} <span className="text-gradient">{t("shop.title").split(" ").slice(1).join(" ")}</span></>
          ) : (
            <>Available <span className="text-gradient">Plans</span></>
          )}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {isRtl ? 'اختر الباقة المثالية لاحتياجاتك. جميع الباقات تشمل دعماً متميزاً على مدار الساعة.' : 'Select the perfect plan for your needs. All plans include premium 24/7 support.'}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "ابحث عن باقة..." : "Search plans..."}
              className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 ${isRtl ? 'pr-10' : 'pl-10'}`}
              data-testid="input-search-products"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "default", label: isRtl ? "الافتراضي" : "Default" },
              { value: "price_low", label: isRtl ? "الأقل" : "Lowest" },
              { value: "price_high", label: isRtl ? "الأعلى" : "Highest" },
            ].map(opt => (
              <Button
                key={opt.value}
                size="sm"
                variant={sortBy === opt.value ? "default" : "outline"}
                className={sortBy === opt.value ? "bg-primary/20 text-primary border-primary/30" : "border-white/10 text-gray-400"}
                onClick={() => setSortBy(opt.value as any)}
                data-testid={`button-sort-${opt.value}`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            key={product.id}
            className="relative group"
            data-testid={`card-product-${product.id}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      <Star className="w-3 h-3" />
                      {isRtl ? 'الأكثر شعبية' : 'Popular'}
                    </span>
                    {product.category && (
                      <Badge variant="outline" className="text-xs border-white/10 text-gray-400">{product.category}</Badge>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white">{product.name}</h3>
                </div>
                <div className={`text-${isRtl ? 'left' : 'right'} flex-shrink-0`}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-primary gold-glow">{(product.price / 100).toFixed(0)}</span>
                    <span className="text-sm text-primary/80">{t("common.sar")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isRtl ? `لمدة ${product.durationDays} يوم` : `for ${product.durationDays} days`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              <div className="space-y-2.5 mb-8">
                {planFeatures.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3 text-sm" data-testid={`feature-${fIdx}`}>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                      <feature.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-gray-300">{feature.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-primary text-primary-foreground py-5 sm:py-6 text-base font-semibold shadow-lg shadow-primary/20 gap-2"
                  onClick={() => {
                    if (!user) {
                      try { window.top!.location.href = "/api/login"; } catch { window.open("/api/login", "_blank"); }
                      return;
                    }
                    setSelectedProduct(product.id);
                    setCouponCode("");
                    setCouponResult(null);
                    setCouponError("");
                  }}
                  data-testid={`button-buy-${product.id}`}
                >
                  {t("shop.buyNow")}
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-5 sm:py-6 text-base gap-2 border-primary/20 text-primary"
                  onClick={() => setLocation("/dashboard")}
                  data-testid={`button-topup-${product.id}`}
                >
                  <Wallet className="w-4 h-4" />
                  {isRtl ? "اشحن الآن" : "Top Up Now"}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
          <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{isRtl ? 'لا توجد باقات متاحة حالياً' : 'No plans available at the moment'}</p>
          <p className="text-sm mt-2">{isRtl ? 'سيتم إضافة باقات جديدة قريباً' : 'New plans will be added soon'}</p>
        </motion.div>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) { setSelectedProduct(null); setCouponCode(""); setCouponResult(null); setCouponError(""); } }}>
        <DialogContent className="bg-[#060b18] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-display text-primary">{isRtl ? 'معلومات الجهاز' : 'Device Info'}</DialogTitle>
            <DialogDescription className="text-gray-400">{isRtl ? 'أدخل معرّف جهازك للاشتراك' : 'Enter your device identifier to subscribe'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="deviceId" className="text-gray-200">{isRtl ? 'معرّف الجهاز' : 'Device Identifier'}</Label>
              <Input
                id="deviceId"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder={isRtl ? "IMEI / سيريال / MAC / اسم الجهاز" : "IMEI / Serial / MAC / Device Name"}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50"
                data-testid="input-device-id"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {isRtl ? 'أدخل IMEI أو الرقم التسلسلي أو MAC أو أي معرف لجهازك. تأكد من صحته لأنه لا يمكن تغييره لاحقاً.' : 'Enter IMEI, serial number, MAC address, or any device identifier. Make sure it is correct as it cannot be changed later.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                {isRtl ? 'كود الخصم (اختياري)' : 'Coupon Code (optional)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }}
                  placeholder={isRtl ? "أدخل كود الخصم" : "Enter coupon code"}
                  className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 uppercase"
                  data-testid="input-coupon-code"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 text-primary flex-shrink-0"
                  onClick={() => couponCode && validateCoupon.mutate(couponCode)}
                  disabled={!couponCode || validateCoupon.isPending}
                  data-testid="button-validate-coupon"
                >
                  {validateCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Percent className="w-4 h-4" />}
                </Button>
              </div>
              {couponResult && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs" data-testid="text-coupon-valid">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {couponResult.type === 'percentage'
                    ? (isRtl ? `خصم ${couponResult.value}%` : `${couponResult.value}% discount`)
                    : (isRtl ? `خصم ${(couponResult.value / 100).toFixed(0)} ريال` : `${(couponResult.value / 100).toFixed(0)} SAR off`)}
                </div>
              )}
              {couponError && (
                <div className="flex items-center gap-2 text-red-400 text-xs" data-testid="text-coupon-error">
                  <XCircle className="w-3.5 h-3.5" />{couponError}
                </div>
              )}
            </div>

            {selectedProd && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-400">{isRtl ? 'السعر' : 'Price'}</span>
                  <span className="text-white font-medium">{(selectedProd.price / 100).toFixed(2)} {t("common.sar")}</span>
                </div>
                {couponResult && (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-emerald-400">{isRtl ? 'الخصم' : 'Discount'}</span>
                    <span className="text-emerald-400 font-medium">-{((selectedProd.price - getDiscountedPrice()) / 100).toFixed(2)} {t("common.sar")}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="text-white font-bold">{isRtl ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-primary font-bold text-lg gold-glow">{(getDiscountedPrice() / 100).toFixed(2)} {t("common.sar")}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="text-gray-400" data-testid="button-cancel-purchase">
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleBuy}
              disabled={!deviceId || createSub.isPending}
              className="bg-primary text-primary-foreground gap-2"
              data-testid="button-confirm-purchase"
            >
              {createSub.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("shop.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
