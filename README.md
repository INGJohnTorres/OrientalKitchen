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

> Nota honesta: no puedo levantar un servidor Postgres real ni desplegar a Railway/Render/Vercel desde este entorno de chat (no tengo acceso a esas plataformas ni a red para instalar paquetes de terceros). Lo que sí está 100% hecho es el código: el backend completo (Express + Prisma + Postgres) y la conexión automática desde el frontend (`lib/api.ts` cambia de modo demo a modo backend con una sola variable de entorno, sin tocar código). Lo único que falta es la parte de infraestructura — crear las cuentas y darle "deploy" — que tienes que hacer tú (o yo puedo guiarte paso a paso). Si prefieres que alguien más "avanzado" que yo en este momento lo instale y verifique en vivo por ti, **Claude Code** (la app de escritorio/terminal) puede instalar dependencias, levantar Postgres localmente y probar todo de punta a punta.

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

**Ya está hecho — no hay que tocar ningún código.** `frontend/lib/api.ts` detecta automáticamente si `NEXT_PUBLIC_API_URL` está definida:

- **Sin esa variable** → todo funciona en modo demo (localStorage del navegador), como hasta ahora.
- **Con esa variable** (ej. `NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app/api`) → el menú, el carrito, el login admin, el editor de productos y los pedidos empiezan a hablar con la API real / Postgres automáticamente.

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

**Backend → Railway o Render**
1. Sube `backend/` a un repo de GitHub.
2. Crea un servicio nuevo en Railway/Render apuntando a ese repo.
3. Agrega un servicio de PostgreSQL (Railway y Render lo ofrecen con un clic) y copia la `DATABASE_URL` generada a las variables de entorno.
4. Agrega también `JWT_SECRET` (cualquier cadena larga aleatoria) y `CORS_ORIGIN` (la URL de tu frontend en Vercel, ej. `https://oriental-kitchen.vercel.app`).
5. Comando de build: `npm install && npx prisma generate && npx prisma migrate deploy`.
6. Comando de start: `npm run start`.
7. **Siembra el menú real**: una vez desplegado, corre una vez `npx prisma db seed` (Railway/Render permiten ejecutar un comando puntual desde su panel, o hazlo localmente apuntando tu `DATABASE_URL` de producción). Esto carga las 51 categorías/productos reales de Oriental Kitchen desde `prisma/seed-data.json` — incluidas las fotos, precios y variantes tal como están hoy en el menú. Es seguro correrlo más de una vez (usa upsert, no duplica nada).
8. Copia la URL pública que te da Railway/Render (ej. `https://oriental-kitchen-backend.up.railway.app`) — esa + `/api` es tu `NEXT_PUBLIC_API_URL` para el paso 4.

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
