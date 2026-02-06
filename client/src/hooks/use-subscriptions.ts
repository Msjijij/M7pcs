import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertSubscription } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSubscriptions() {
  return useQuery({
    queryKey: [api.subscriptions.list.path],
    queryFn: async () => {
      const res = await fetch(api.subscriptions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return api.subscriptions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const res = await fetch(api.subscriptions.create.path, {
        method: api.subscriptions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 402) {
          throw new Error("INSUFFICIENT_FUNDS");
        }
        const error = await res.json();
        throw new Error(error.message || "Failed to purchase subscription");
      }
      return api.subscriptions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.getMe.path] }); // Balance update
      toast({
        title: "Purchase Successful",
        description: "Subscription request sent. Waiting for admin activation.",
        className: "bg-green-900 border-green-800 text-green-100"
      });
    },
  });
}

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, adminComment }: { id: number, status: 'active' | 'expired', adminComment?: string }) => {
      const url = buildUrl(api.subscriptions.activate.path, { id });
      const res = await fetch(url, {
        method: api.subscriptions.activate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to activate subscription");
      return api.subscriptions.activate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      toast({ title: "Updated", description: "Subscription status updated." });
    },
  });
}
