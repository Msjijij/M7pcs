import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const DISCORD_API = "https://discord.com/api/v10";
const ADMIN_IDS = [
  "1125880459579109407",
  "1131700999250264135",
  "1061025903079063672",
];

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const pgStore = connectPg(session);
  const ttl = 7 * 24 * 60 * 60 * 1000;

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl,
        tableName: "sessions",
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: ttl,
        sameSite: "lax",
      },
    })
  );

  app.get("/api/login", (req, res) => {
    const redirect = `https://${req.get("host")}/api/callback`;
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify email");
    res.redirect(url.toString());
  });

  app.get("/api/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) return res.redirect("/");

      const redirect = `https://${req.get("host")}/api/callback`;

      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID!,
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirect,
        }),
      });

      if (!tokenRes.ok) {
        console.error("Discord token error:", await tokenRes.text());
        return res.redirect("/");
      }

      const { access_token } = await tokenRes.json();

      const userRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userRes.ok) return res.redirect("/");
      const d = await userRes.json();

      const isAdminId = ADMIN_IDS.includes(d.id);
      const avatar = d.avatar
        ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=256`
        : null;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, d.id));

      if (!existing) {
        await db.insert(users).values({
          id: d.id,
          username: d.username,
          email: d.email || null,
          firstName: d.global_name || d.username,
          profileImageUrl: avatar,
          role: isAdminId ? "admin" : "customer",
          isAdmin: isAdminId,
        });
      } else {
        const updates: Record<string, any> = {
          username: d.username,
          firstName: d.global_name || d.username,
          profileImageUrl: avatar,
          updatedAt: new Date(),
        };
        if (d.email) updates.email = d.email;
        if (isAdminId) {
          updates.role = "admin";
          updates.isAdmin = true;
        }
        await db.update(users).set(updates).where(eq(users.id, d.id));
      }

      req.session.userId = d.id;
      req.session.save(() => res.redirect("/dashboard"));
    } catch (err) {
      console.error("Discord auth error:", err);
      res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId));
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.isBanned) return res.status(403).json({ message: "Account banned" });
    res.json(user);
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.session.userId));
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.isBanned) return res.status(403).json({ message: "Account banned" });
  next();
};
