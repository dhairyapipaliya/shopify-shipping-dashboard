import express from "express";
import session from "express-session";
import pgSessionFactory from "connect-pg-simple";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { env } from "./config/env.js";
import { adminToolsRouter } from "./routes/adminTools.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { ordersRouter } from "./routes/orders.js";
import { shipmentRouter } from "./routes/shipments.js";
import { webhookRouter } from "./routes/webhooks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PgSession = pgSessionFactory(session);
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(session({
  store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use((_req, res, next) => {
  res.locals.baseUrl = env.APP_BASE_URL;
  next();
});

app.use(authRouter);
app.use(dashboardRouter);
app.use(ordersRouter);
app.use(shipmentRouter);
app.use(adminToolsRouter);
app.use(webhookRouter);
