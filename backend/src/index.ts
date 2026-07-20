import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import categoriasRouter from "./routes/categorias";
import productosRouter from "./routes/productos";
import pedidosRouter from "./routes/pedidos";
import authRouter from "./routes/auth";
import { inicializarSocket } from "./lib/socket";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/api/salud", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/productos", productosRouter);
app.use("/api/pedidos", pedidosRouter);

// Manejador de errores centralizado
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const httpServer = http.createServer(app);
inicializarSocket(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}/api`);
});
