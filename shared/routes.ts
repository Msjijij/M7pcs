import { z } from 'zod';
import { insertProductSchema, insertSubscriptionSchema, insertTopupSchema, insertAnnouncementSchema, products, subscriptions, topups, users, announcements, activityLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === PRODUCTS (Public/Admin) ===
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },

  // === TOPUPS ===
  topups: {
    list: { // Admin lists all, User lists own
      method: 'GET' as const,
      path: '/api/topups',
      responses: {
        200: z.array(z.custom<typeof topups.$inferSelect>()),
      },
    },
    create: { // User request
      method: 'POST' as const,
      path: '/api/topups',
      input: insertTopupSchema.extend({
        amount: z.coerce.number().min(100), // Min 1 SAR
      }),
      responses: {
        201: z.custom<typeof topups.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    approve: { // Admin only
      method: 'PATCH' as const,
      path: '/api/topups/:id/approve',
      input: z.object({ status: z.enum(['approved', 'rejected']), adminComment: z.string().optional() }),
      responses: {
        200: z.custom<typeof topups.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === SUBSCRIPTIONS ===
  subscriptions: {
    list: { // Admin lists all, User lists own
      method: 'GET' as const,
      path: '/api/subscriptions',
      responses: {
        200: z.array(z.custom<typeof subscriptions.$inferSelect>().and(z.object({ product: z.custom<typeof products.$inferSelect>() }))),
      },
    },
    create: { // User buy
      method: 'POST' as const,
      path: '/api/subscriptions',
      input: insertSubscriptionSchema.extend({
        productId: z.coerce.number(),
      }),
      responses: {
        201: z.custom<typeof subscriptions.$inferSelect>(),
        400: errorSchemas.validation,
        402: z.object({ message: z.string() }), // Payment Required (Insufficient Balance)
      },
    },
    activate: { // Admin activate
      method: 'PATCH' as const,
      path: '/api/subscriptions/:id/activate',
      input: z.object({ status: z.enum(['active', 'expired']), adminComment: z.string().optional() }),
      responses: {
        200: z.custom<typeof subscriptions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === USERS (Admin) ===
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    getMe: {
      method: 'GET' as const,
      path: '/api/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.notFound,
      },
    },
    updateRole: {
      method: 'PATCH' as const,
      path: '/api/users/:id/role',
      input: z.object({ role: z.enum(['customer', 'admin']) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateBalance: {
      method: 'PATCH' as const,
      path: '/api/users/:id/balance',
      input: z.object({ amount: z.number(), reason: z.string().optional() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === ACTIVITY LOGS ===
  activityLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/activity-logs',
      responses: {
        200: z.array(z.custom<typeof activityLogs.$inferSelect>()),
      },
    },
  },

  // === ANNOUNCEMENTS ===
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements',
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements',
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/announcements/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
