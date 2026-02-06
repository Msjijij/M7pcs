import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Hook to fetch the FULL user object (including balance, role) from our API
// distinct from the auth integration's useAuth which might only have claims
export function useAppUser() {
  return useQuery({
    queryKey: [api.users.getMe.path],
    queryFn: async () => {
      const res = await fetch(api.users.getMe.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return api.users.getMe.responses[200].parse(await res.json());
    },
    retry: false,
  });
}
