"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const categorias_1 = __importDefault(require("./routes/categorias"));
const productos_1 = __importDefault(require("./routes/productos"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const auth_1 = __importDefault(require("./routes/auth"));
const socket_1 = require("./lib/socket");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
}));
app.use(express_1.default.json());
app.get("/api/salud", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", auth_1.default);
app.use("/api/categorias", categorias_1.default);
app.use("/api/productos", productos_1.default);
app.use("/api/pedidos", pedidos_1.default);
// Manejador de errores centralizado
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor." });
});
const httpServer = http_1.default.createServer(app);
(0, socket_1.inicializarSocket)(httpServer);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}/api`);
});
