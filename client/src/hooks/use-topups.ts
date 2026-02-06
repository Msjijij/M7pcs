import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTopup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTopups() {
  return useQuery({
    queryKey: [api.topups.list.path],
    queryFn: async () => {
      const res = await fetch(api.topups.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch topups");
      return api.topups.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTopup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertTopup) => {
      const res = await fetch(api.topups.create.path, {
        method: api.topups.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit topup");
      }
      return api.topups.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.topups.list.path] });
      toast({
        title: "Request Submitted",
        description: "Your top-up request is pending admin approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useApproveTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminComment }: { id: number, status: 'approved' | 'rejected', adminComment?: string }) => {
      const url = buildUrl(api.topups.approve.path, { id });
      const res = await fetch(url, {
        method: api.topups.approve.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update topup status");
      return api.topups.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.topups.list.path] });
      // Also invalidate user data as balance might have changed
      queryClient.invalidateQueries({ queryKey: [api.users.getMe.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}
