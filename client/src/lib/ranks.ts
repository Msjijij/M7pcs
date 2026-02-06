export interface RankInfo {
  name: string;
  level: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  progress: number;
  nextTier: string;
  remaining: number;
}

const TIERS = [
  { name: "NEWCOMER", min: 0, max: 100, textClass: "text-gray-400", bgClass: "bg-gray-500/10", borderClass: "border-gray-500/30" },
  { name: "BRONZE", min: 100, max: 500, textClass: "text-amber-600", bgClass: "bg-amber-600/10", borderClass: "border-amber-600/30" },
  { name: "SILVER", min: 500, max: 1500, textClass: "text-slate-300", bgClass: "bg-slate-300/10", borderClass: "border-slate-300/30" },
  { name: "GOLD", min: 1500, max: 5000, textClass: "text-yellow-400", bgClass: "bg-yellow-400/10", borderClass: "border-yellow-400/30" },
  { name: "EXPERT", min: 5000, max: 10000, textClass: "text-blue-400", bgClass: "bg-blue-400/10", borderClass: "border-blue-400/30" },
  { name: "ELITE", min: 10000, max: 25000, textClass: "text-purple-400", bgClass: "bg-purple-400/10", borderClass: "border-purple-400/30" },
  { name: "EPIC", min: 25000, max: 50000, textClass: "text-red-400", bgClass: "bg-red-400/10", borderClass: "border-red-400/30" },
  { name: "LEGEND", min: 50000, max: 100000, textClass: "text-orange-400", bgClass: "bg-orange-400/10", borderClass: "border-orange-400/30" },
  { name: "IMMORTAL", min: 100000, max: 250000, textClass: "text-cyan-400", bgClass: "bg-cyan-400/10", borderClass: "border-cyan-400/30" },
  { name: "PRIMEVAL", min: 250000, max: Infinity, textClass: "text-emerald-400", bgClass: "bg-emerald-400/10", borderClass: "border-emerald-400/30" },
];

function toRoman(num: number): string {
  if (num <= 0) return "I";
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let result = "";
  for (const [value, symbol] of map) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result;
}

export function getRank(totalSpentHalalas: number): RankInfo {
  const sarSpent = totalSpentHalalas / 100;

  const tier = TIERS.find(t => sarSpent >= t.min && sarSpent < t.max) || TIERS[0];
  const tierIndex = TIERS.indexOf(tier);
  const tierRange = tier.max === Infinity ? 100000 : tier.max - tier.min;
  const progressInTier = sarSpent - tier.min;
  const progress = Math.min((progressInTier / tierRange) * 100, 100);
  const level = Math.max(1, Math.min(10, Math.ceil((progress / 100) * 10) || 1));

  const nextTier = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1].name : "MAX";
  const remaining = tier.max === Infinity ? 0 : tier.max - sarSpent;

  return {
    name: tier.name,
    level: `${tier.name} ${toRoman(level)}`,
    color: tier.textClass.replace("text-", ""),
    textClass: tier.textClass,
    bgClass: tier.bgClass,
    borderClass: tier.borderClass,
    progress,
    nextTier,
    remaining,
  };
}
