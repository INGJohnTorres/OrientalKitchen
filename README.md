# 🍽️ Menú QR — Sistema de pedidos para restaurante

Aplicación completa para que los clientes escaneen un código QR en la mesa, vean el menú, armen su pedido y lo envíen directo por WhatsApp (o a la base de datos / panel del restaurante).

Este proyecto tiene dos partes independientes:

```
restaurant-app/
├── frontend/   → Next.js 14 + TypeScript + Tailwind (lo que ve el cliente y el admin)
└── backend/    → Node.js + Express + Prisma + PostgreSQL (API REST)
```

---

## 1. Qué incluye esta entrega

**Frontend (funcional de inmediato, sin backend):**
- Landing con logo, bienvenida y botón "Ver Menú".
- Menú por categorías, con buscador, etiquetas (Nuevo, Picante, Vegetariano, Promoción) y destacados.
- Selector de cantidad, carrito flotante tipo "comanda de cocina".
- Formulario de datos del cliente (nombre, mesa, observaciones, teléfono).
- Resumen de confirmación antes de enviar.
- Envío automático del pedido por **WhatsApp** con el mensaje formateado tal como lo pediste.
- Lectura automática del número de mesa desde la URL: `/menu?mesa=8`.
- Modo oscuro, diseño responsive, animaciones suaves.
- Panel de administración (`/admin`) con login y tablero de pedidos en tiempo real (vía localStorage en esta versión demo — se conecta al backend real cambiando `lib/api.ts`).

**Backend (código completo de referencia, para conectar cuando quieras persistencia real):**
- API REST con Express + TypeScript.
- Prisma ORM + esquema PostgreSQL (Productos, Categorías, Pedidos, DetallePedido, Clientes, Usuarios, Configuración).
- Autenticación JWT para el panel admin.
- Rutas documentadas para productos, categorías, pedidos y auth.
- Envío de correo con Nodemailer (opción 3 de envío de pedido).

> Nota honesta: no puedo instalar dependencias ni levantar un servidor Postgres desde este entorno de chat (no tengo acceso a red ni a una base de datos real). Por eso el frontend funciona de forma autónoma con datos de ejemplo y localStorage, y el backend queda listo, documentado y completo para que lo instales y despliegues en minutos siguiendo los pasos de abajo. Si quieres que lo dejemos corriendo y conectado de punta a punta, **Claude Code** (la app de escritorio/terminal) es el lugar ideal para ese siguiente paso: puede instalar dependencias, levantar Postgres localmente y probar todo en vivo.

---

## 2. Instalación local — Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3000` — o `http://localhost:3000/menu?mesa=8` para simular el QR de la mesa 8.

Variables de entorno (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=573115243043   # número del restaurante, sin "+" ni espacios
NEXT_PUBLIC_RESTAURANT_NAME="Oriental Kitchen"
```

---

## 3. Instalación local — Backend

```bash
cd backend
npm install
cp .env.example .env   # y edita con tus credenciales
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Variables de entorno (`backend/.env`):

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/restaurante"
JWT_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
RESTAURANT_EMAIL=cocina@tu-restaurante.com
```

La API queda disponible en `http://localhost:4000/api`. Endpoints principales:

| Método | Ruta                       | Descripción                          |
|--------|----------------------------|---------------------------------------|
| GET    | /api/categorias            | Lista categorías                      |
| GET    | /api/productos              | Lista productos (filtra por ?categoria=) |
| POST   | /api/productos              | Crear producto (admin, JWT)           |
| PUT    | /api/productos/:id          | Editar producto (admin, JWT)          |
| DELETE | /api/productos/:id          | Eliminar producto (admin, JWT)        |
| POST   | /api/pedidos                | Crear pedido (cliente)                |
| GET    | /api/pedidos                | Listar pedidos (admin, JWT)           |
| PATCH  | /api/pedidos/:id/estado     | Cambiar estado del pedido (admin, JWT)|
| POST   | /api/auth/login             | Login admin, devuelve JWT             |

---

## 4. Conectar el frontend al backend real

En `frontend/lib/api.ts` cambia las funciones que hoy leen `menu-data.ts` (datos de ejemplo) para que hagan `fetch(process.env.NEXT_PUBLIC_API_URL + "/productos")`, etc. Está señalado con comentarios `// TODO: conectar backend` en ese archivo.

---

## 5. Generar el código QR de cada mesa

Cualquier generador de QR (o una librería como `qrcode` en Node) apuntando a:

```
https://tu-dominio.com/menu?mesa=1
https://tu-dominio.com/menu?mesa=2
...
```

El número de mesa se guarda automáticamente en el carrito y viaja en el mensaje de WhatsApp y en el pedido.

---

## 6. Despliegue en producción

**Frontend → Vercel**
1. Sube `frontend/` a un repo de GitHub.
2. Importa el repo en [vercel.com](https://vercel.com).
3. Configura las variables de entorno del paso 2 en el panel de Vercel.
4. Deploy.

**Backend → Railway o Render**
1. Sube `backend/` a un repo de GitHub.
2. Crea un servicio nuevo en Railway/Render apuntando a ese repo.
3. Agrega un servicio de PostgreSQL (Railway y Render lo ofrecen con un clic) y copia la `DATABASE_URL` generada a las variables de entorno.
4. Comando de build: `npm install && npx prisma generate && npx prisma migrate deploy`.
5. Comando de start: `npm run start`.

**PostgreSQL**: usa la base gestionada de Railway/Render, o Supabase/Neon si prefieres.

---

## 7. Seguridad y buenas prácticas ya incluidas

- Contraseñas de admin con hash `bcrypt`.
- JWT con expiración y verificación en middleware.
- Validación de payloads en las rutas del backend.
- CORS configurado explícitamente.
- Variables sensibles solo en `.env` (nunca en el código).
- Sanitización básica de inputs del formulario de pedido.

## 8. Siguientes pasos sugeridos

- Conectar `lib/api.ts` al backend real.
- Subir imágenes de productos a un bucket (S3/Cloudinary) en vez de URLs estáticas.
- Agregar WebSockets (Socket.io) para que el panel admin reciba pedidos nuevos sin recargar — el backend ya expone un hook (`src/lib/socket.ts`) listo para activar.
