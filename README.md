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
- Panel de administración (`/admin`) con login y tablero de pedidos: en modo demo vive en localStorage, en producción habla con el backend real solo con definir `NEXT_PUBLIC_API_URL` (sin tocar código, ver sección 4).

**Backend (código completo de referencia, para conectar cuando quieras persistencia real):**
- API REST con Express + TypeScript.
- Prisma ORM + esquema PostgreSQL (Productos, Categorías, Pedidos, DetallePedido, Clientes, Usuarios, Configuración).
- Autenticación JWT para el panel admin.
- Rutas documentadas para productos, categorías, pedidos y auth.
- Envío de correo con Nodemailer (opción 3 de envío de pedido).

> Estado actual: ya está desplegado y en producción — frontend en Vercel, backend en Render, base de datos Postgres en Supabase. La cuenta/proyecto en cada plataforma la tiene que crear el dueño del sitio (no algo que se pueda automatizar desde acá), pero una vez creada, Claude Code sí puede correr las migraciones, sembrar el menú y verificar el login en vivo directamente contra la base real.

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
# Con Supabase: DATABASE_URL es la cadena de "Connection pooling" (puerto
# 6543, con ?pgbouncer=true) y DIRECT_URL es la de "Direct connection"
# (puerto 5432) — ambas salen del botón "Connect" del proyecto en Supabase,
# pestaña ORM → Prisma. Con un Postgres normal (local, Railway, Render),
# usa la misma cadena en las dos variables.
DATABASE_URL="postgresql://usuario:password@localhost:5432/restaurante"
DIRECT_URL="postgresql://usuario:password@localhost:5432/restaurante"
JWT_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
PORT=4000
# Debe incluir el protocolo (https://) y no tener espacios/saltos de línea —
# el middleware cors() compara este valor tal cual contra el header Origin.
# Un valor mal escrito aquí rompe el login del panel admin sin dar más pistas
# que "Failed to fetch" en la consola del navegador.
CORS_ORIGIN="http://localhost:3000"
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

**Ya está hecho — no hay que tocar ningún código.** `frontend/lib/api.ts` detecta automáticamente si `NEXT_PUBLIC_API_URL` está definida:

- **Sin esa variable** → todo funciona en modo demo (localStorage del navegador), como hasta ahora.
- **Con esa variable** (ej. `NEXT_PUBLIC_API_URL=https://oriental-kitchen-backend.onrender.com/api`) → el menú, el carrito, el login admin, el editor de productos y los pedidos empiezan a hablar con la API real / Postgres automáticamente.

Solo tienes que:
1. Desplegar `backend/` (ver sección 6).
2. Agregar `NEXT_PUBLIC_API_URL` en las variables de entorno de tu proyecto en Vercel, apuntando a tu backend desplegado + `/api`.
3. Redesplegar el frontend (Vercel → Deployments → Redeploy) para que tome la variable nueva.

Después de esto, el usuario/clave del panel admin deja de ser el fijo `admin/admin123` del modo demo — se valida contra la tabla `usuarios` de Postgres (sembrada con `admin/admin123` por el seed, cámbiala apenas entres).

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

**Backend → Render**
1. Sube `backend/` (y el `render.yaml` de la raíz del repo) a GitHub.
2. En [render.com](https://render.com) → **New → Blueprint**, conecta el repo. Render detecta `render.yaml` automáticamente y crea el servicio `oriental-kitchen-backend` (build: `npm install && npm run build`, start: `npm start`, health check en `/api/salud`).
3. Rellena las variables marcadas como secretas: `DATABASE_URL`, `DIRECT_URL` (ver sección de Postgres/Supabase abajo), `JWT_SECRET` (cualquier cadena larga aleatoria), `CORS_ORIGIN` (la URL de tu frontend en Vercel **con protocolo**, ej. `https://oriental-kitchen.vercel.app` — sin la `https://` o con espacios/saltos de línea de más, el login del panel admin falla con un simple "Failed to fetch" en consola, sin más pistas) y los `SMTP_*`/`RESTAURANT_EMAIL` si quieres el correo de notificación.
4. `npm start` ya incluye `prisma migrate deploy` antes de arrancar, así que cada deploy aplica las migraciones pendientes solo.
5. **Siembra el menú real**: la primera vez, corre `npx prisma db seed` apuntando a tu `DATABASE_URL`/`DIRECT_URL` de producción (puede ser desde tu máquina, sin necesidad del panel de Render). Esto carga las 11 categorías / 51 productos reales de Oriental Kitchen desde `prisma/seed-data.json` — incluidas las fotos, precios y variantes — y crea el usuario admin (`admin`/`admin123`, cámbiala apenas entres). Es seguro correrlo más de una vez (usa upsert, no duplica nada).
6. Copia la URL pública que te da Render (ej. `https://oriental-kitchen-backend.onrender.com`) — esa + `/api` es tu `NEXT_PUBLIC_API_URL` para el paso anterior.

**PostgreSQL → Supabase**
1. [supabase.com](https://supabase.com) → **New project**, elige nombre, contraseña de base de datos y región.
2. En el dashboard del proyecto, botón **Connect** (arriba) → pestaña **ORM** → **Prisma**: ahí te da ya formateadas las dos cadenas que necesitas — `DATABASE_URL` (connection pooling, puerto 6543) y `DIRECT_URL` (conexión directa, puerto 5432). Prisma necesita las dos: la primera para las queries normales de la app, la segunda porque el pooler (pgbouncer) no soporta las sesiones prolongadas que usan las migraciones.
3. Railway o cualquier otro Postgres gestionado también funciona — en ese caso usa la misma cadena para `DATABASE_URL` y `DIRECT_URL`.

---

## 7. Seguridad y buenas prácticas ya incluidas

- Contraseñas de admin con hash `bcrypt`.
- JWT con expiración y verificación en middleware.
- Validación de payloads en las rutas del backend.
- CORS configurado explícitamente.
- Variables sensibles solo en `.env` (nunca en el código).
- Sanitización básica de inputs del formulario de pedido.

## 8. Siguientes pasos sugeridos

- Subir imágenes de productos a un bucket (S3/Cloudinary) en vez de URLs estáticas.
- Agregar WebSockets (Socket.io) para que el panel admin reciba pedidos nuevos sin recargar — el backend ya expone un hook (`src/lib/socket.ts`) listo para activar.
