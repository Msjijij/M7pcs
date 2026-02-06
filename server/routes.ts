import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.get(api.products.list.path, async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const product = await storage.getProduct(Number(req.params.id));
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post(api.products.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to create product" });
    }
  });

  app.get(api.topups.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role === 'admin') {
        return res.json(await storage.getTopups());
      }
      return res.json(await storage.getTopups(user?.id));
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch topups" });
    }
  });

  app.post(api.topups.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.topups.create.input.parse(req.body);
      if (input.amount <= 0) return res.status(400).json({ message: "Amount must be positive" });
      const topup = await storage.createTopup(req.session.userId, input);
      res.status(201).json(topup);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to create topup" });
    }
  });

  app.patch(api.topups.approve.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const { status, adminComment } = api.topups.approve.input.parse(req.body);
      const topup = await storage.getTopup(Number(req.params.id));
      if (!topup) return res.status(404).json({ message: "Topup not found" });

      if (topup.status !== 'pending') return res.status(400).json({ message: "Topup already processed" });

      if (status === 'approved') {
        const targetUser = await storage.getUser(topup.userId);
        if (targetUser) {
          await storage.updateUser(targetUser.id, { balance: targetUser.balance + topup.amount });
        }
      }

      const updated = await storage.updateTopup(topup.id, { status, adminComment });
      await storage.createActivityLog(user.id, `topup_${status}`, 'topup', String(topup.id), JSON.stringify({ userId: topup.userId, amount: topup.amount }));
      res.json(updated);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to update topup" });
    }
  });

  app.get(api.subscriptions.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role === 'admin') {
        return res.json(await storage.getSubscriptions());
      }
      return res.json(await storage.getSubscriptions(user?.id));
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post(api.subscriptions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(401).json({ message: "User not found" });

      const input = api.subscriptions.create.input.parse(req.body);
      const product = await storage.getProduct(input.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (!product.isActive) return res.status(400).json({ message: "Product is not available" });

      if (user.balance < product.price) {
        return res.status(402).json({ message: "Insufficient balance" });
      }

      await storage.updateUser(user.id, {
        balance: user.balance - product.price,
        totalSpent: (user.totalSpent || 0) + product.price,
      });
      const sub = await storage.createSubscription(user.id, input);
      res.status(201).json(sub);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to create subscription" });
    }
  });

  app.patch(api.subscriptions.activate.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const { status, adminComment } = api.subscriptions.activate.input.parse(req.body);
      const sub = await storage.getSubscription(Number(req.params.id));
      if (!sub) return res.status(404).json({ message: "Subscription not found" });

      const updates: any = { status, adminComment };
      if (status === 'active' && sub.status !== 'active') {
        const now = new Date();
        updates.startDate = now;
        const product = await storage.getProduct(sub.productId);
        if (product) {
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + product.durationDays);
          updates.endDate = endDate;
        }
      }

      const updated = await storage.updateSubscription(sub.id, updates);
      await storage.createActivityLog(user.id, `subscription_${status}`, 'subscription', String(sub.id), JSON.stringify({ userId: sub.userId, deviceId: sub.deviceId }));
      res.json(updated);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to update subscription" });
    }
  });

  app.patch('/api/subscriptions/:id/dates', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const sub = await storage.getSubscription(Number(req.params.id));
      if (!sub) return res.status(404).json({ message: "Subscription not found" });

      const { startDate, endDate } = req.body;
      const updates: any = {};
      if (startDate) updates.startDate = new Date(startDate);
      if (endDate) updates.endDate = new Date(endDate);

      const updated = await storage.updateSubscription(sub.id, updates);
      await storage.createActivityLog(user.id, 'subscription_dates_edit', 'subscription', String(sub.id), JSON.stringify({ startDate, endDate }));
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to update subscription dates" });
    }
  });

  app.delete('/api/subscriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const sub = await storage.getSubscription(Number(req.params.id));
      if (!sub) return res.status(404).json({ message: "Subscription not found" });

      await storage.deleteSubscription(sub.id);
      await storage.createActivityLog(user.id, 'subscription_delete', 'subscription', String(sub.id), JSON.stringify({ userId: sub.userId, deviceId: sub.deviceId }));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to delete subscription" });
    }
  });

  app.patch('/api/subscriptions/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.session.userId);
      if (admin?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const sub = await storage.getSubscription(Number(req.params.id));
      if (!sub) return res.status(404).json({ message: "Subscription not found" });
      if (sub.status === 'expired') return res.status(400).json({ message: "Subscription already expired" });

      const updated = await storage.updateSubscription(sub.id, { status: 'expired', adminComment: 'Cancelled by admin' });
      await storage.createActivityLog(admin.id, 'subscription_cancel', 'subscription', String(sub.id), JSON.stringify({ deviceId: sub.deviceId, userId: sub.userId }));
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to cancel subscription" });
    }
  });

  app.get(api.users.getMe.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get(api.users.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });
      const usersList = await storage.getUsers();
      res.json(usersList);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.session.userId);
      if (admin?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const { role } = api.users.updateRole.input.parse(req.body);
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.id === admin.id) return res.status(400).json({ message: "Cannot change own role" });

      const updated = await storage.updateUser(targetUser.id, { role, isAdmin: role === 'admin' });
      await storage.createActivityLog(admin.id, 'role_change', 'user', targetUser.id, JSON.stringify({ from: targetUser.role, to: role }));
      res.json(updated);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to update role" });
    }
  });

  app.patch('/api/users/:id/balance', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.session.userId);
      if (admin?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const { amount, reason } = api.users.updateBalance.input.parse(req.body);
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });

      const newBalance = targetUser.balance + amount;
      if (newBalance < 0) return res.status(400).json({ message: "Balance cannot go below zero" });

      const updated = await storage.updateUser(targetUser.id, { balance: newBalance });
      await storage.createActivityLog(admin.id, 'balance_adjustment', 'user', targetUser.id, JSON.stringify({ amount, reason: reason || '', previousBalance: targetUser.balance, newBalance }));
      res.json(updated);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to adjust balance" });
    }
  });

  app.patch('/api/users/:id/ban', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.session.userId);
      if (admin?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.id === admin.id) return res.status(400).json({ message: "Cannot ban yourself" });

      const { banned } = req.body;
      const updated = await storage.updateUser(targetUser.id, { isBanned: !!banned });
      await storage.createActivityLog(admin.id, banned ? 'user_ban' : 'user_unban', 'user', targetUser.id, JSON.stringify({ username: targetUser.username }));
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to update ban status" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const admin = await storage.getUser(req.session.userId);
      if (admin?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.id === admin.id) return res.status(400).json({ message: "Cannot delete yourself" });

      await storage.deleteUser(targetUser.id);
      await storage.createActivityLog(admin.id, 'user_delete', 'user', targetUser.id, JSON.stringify({ username: targetUser.username }));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to delete user" });
    }
  });

  app.get('/api/leaderboard', async (_req, res) => {
    try {
      const topSpenders = await storage.getTopSpenders(10);
      res.json(topSpenders);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get(api.activityLogs.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });
      const logs = await storage.getActivityLogs(100);
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  app.get('/api/export/:type', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });

      const type = req.params.type;
      const escapeCSV = (val: any) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      if (type === 'users') {
        const data = await storage.getUsers();
        const headers = ['ID', 'Username', 'First Name', 'Email', 'Role', 'Balance (SAR)', 'Total Spent (SAR)', 'Banned', 'Created At'];
        const csv = [headers.join(','), ...data.map(u => [u.id, u.username || '', u.firstName || '', u.email || '', u.role, (u.balance / 100).toFixed(2), ((u.totalSpent || 0) / 100).toFixed(2), u.isBanned ? 'Yes' : 'No', u.createdAt || ''].map(escapeCSV).join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=users_${Date.now()}.csv`);
        return res.send(csv);
      } else if (type === 'subscriptions') {
        const subs = await storage.getSubscriptions();
        const headers = ['ID', 'User ID', 'Product', 'Device ID', 'Status', 'Start Date', 'End Date', 'Created At'];
        const csv = [headers.join(','), ...subs.map(s => [s.id, s.userId, s.product.name, s.deviceId, s.status, s.startDate || '', s.endDate || '', s.createdAt || ''].map(escapeCSV).join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=subscriptions_${Date.now()}.csv`);
        return res.send(csv);
      } else if (type === 'topups') {
        const data = await storage.getTopups();
        const headers = ['ID', 'User ID', 'Amount (SAR)', 'Status', 'Proof URL', 'Created At'];
        const csv = [headers.join(','), ...data.map(t => [t.id, t.userId, (t.amount / 100).toFixed(2), t.status, t.proofUrl || '', t.createdAt || ''].map(escapeCSV).join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=topups_${Date.now()}.csv`);
        return res.send(csv);
      }

      res.status(400).json({ message: "Invalid export type. Use 'users', 'subscriptions', or 'topups'" });
    } catch (e: any) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.get(api.announcements.list.path, async (_req, res) => {
    try {
      const items = await storage.getAnnouncements();
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post(api.announcements.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });
      const input = api.announcements.create.input.parse(req.body);
      const announcement = await storage.createAnnouncement(user.id, input);
      res.status(201).json(announcement);
    } catch (e: any) {
      if (e instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: e.errors });
      res.status(500).json({ message: e.message || "Failed to create announcement" });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user?.role !== 'admin') return res.status(403).json({ message: "Admin only" });
      const announcement = await storage.getAnnouncement(Number(req.params.id));
      if (!announcement) return res.status(404).json({ message: "Announcement not found" });
      await storage.deleteAnnouncement(announcement.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to delete announcement" });
    }
  });

  try {
    const productsList = await storage.getProducts();
    if (productsList.length === 0) {
      console.log("Seeding products...");
      await storage.createProduct({ name: "الخطة الذهبية (سنة) | Golden Plan (1 Year)", description: "وصول كامل لجميع الخدمات | Full access to all services", price: 35000, durationDays: 365, isActive: true });
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  return httpServer;
}
