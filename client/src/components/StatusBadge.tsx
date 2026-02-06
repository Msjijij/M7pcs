import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStyle = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'approved':
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'pending':
      case 'pending_activation':
      case 'important':
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'expired':
      case 'rejected':
      case 'urgent':
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case 'admin':
        return "bg-primary/10 text-primary border-primary/20";
      case 'customer':
      case 'normal':
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatStatus = (s: string) => {
    return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      getStyle(status),
      className
    )}>
      {formatStatus(status)}
    </span>
  );
}
