# 🍽️ Menú QR — Sistema de pedidos para restaurante

Aplicación para que los clientes escaneen un código QR en la mesa, vean el menú, armen su pedido y lo envíen por WhatsApp, y para que el restaurante gestione pedidos, menú y ventas desde un panel.

Todo vive en **un solo proyecto Next.js** (`frontend/`): las páginas y también la API (`app/api/*`), que se despliega en Vercel como funciones. La base de datos es Postgres en Supabase.

```
frontend/
├── app/            → páginas (landing, /menu, /favoritos, /admin/*) y la API (app/api/*)
├── components/     → interfaz
├── lib/            → api.ts (cliente), server/ (código solo de servidor: Prisma, JWT, correo)
└── prisma/         → esquema, migraciones y seed de la base de datos
```

---

## 1. Qué incluye

- Landing, menú por categorías con buscador, carrito y pedido por **WhatsApp** (mesa por QR, domicilio o recoger en el local).
- Panel `/admin`: tablero de pedidos, vista de cocina, editor de productos, estadísticas de ventas por rango de fechas, borrado de pedidos.
- **Planes** (Básico / Medio / Premium) que habilitan o deshabilitan funcionalidades, gestionados por una cuenta `superadmin` en `/admin/superadmin`.
- Autenticación JWT, contraseñas con `bcrypt`, validación de datos en servidor.
- Aviso por correo de pedidos nuevos (opcional, con SMTP).
- Modo demo sin base de datos: si no se define `NEXT_PUBLIC_API_URL`, todo funciona con `localStorage`.

---

## 2. Cómo funciona la lectura del menú

- El menú público (categorías, productos activos y configuración no sensible) se lee **directo de Supabase** con la llave pública, para cargar al instante. Lo que esa llave puede leer lo limita RLS en la base (migración `lectura_publica_menu`): no ve pedidos, usuarios ni el correo de notificación.
- Todo lo demás (login, pedidos, panel, estadísticas) pasa por la API propia `/api/*`.
- Si Supabase no está configurado o falla, el menú se pide a `/api` como respaldo.

---

## 3. Instalación local

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3000` — o `http://localhost:3000/menu?mesa=8` para simular el QR de la mesa 8.

Sin variables de entorno corre en **modo demo** (localStorage; usuarios `admin` / `admin123` y `superadmin` / `superadmin123`).

Para usar una base de datos real, crea `frontend/.env.local`:

```env
# Base de datos. Con Supabase: DATABASE_URL = "Connection pooling" (puerto 6543,
# con ?pgbouncer=true&connection_limit=1) y DIRECT_URL = "Direct connection" (5432).
# Con un Postgres normal, usa la misma cadena en ambas.
DATABASE_URL="postgresql://usuario:password@localhost:5432/restaurante"
DIRECT_URL="postgresql://usuario:password@localhost:5432/restaurante"
JWT_SECRET="un-secreto-largo-y-aleatorio"

# Activa el modo con base de datos. "/api" = la API del propio proyecto.
NEXT_PUBLIC_API_URL=/api

# Opcionales
NEXT_PUBLIC_WHATSAPP_NUMBER=573115243043   # sin "+" ni espacios
NEXT_PUBLIC_RESTAURANT_NAME="Oriental Kitchen"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
RESTAURANT_EMAIL=cocina@tu-restaurante.com
```

Luego aplica las migraciones y carga el menú:

```bash
npx prisma migrate deploy
npx prisma db seed      # 11 categorías, 51 productos, usuarios admin y superadmin
```

El seed es seguro de repetir (usa upsert). Crea `admin` / `admin123` y `superadmin` / `superadmin123`: **cambia las contraseñas apenas entres**.

---

## 4. API (`app/api/*`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/salud` | Comprobación de estado |
| POST | `/api/auth/login` | Login, devuelve JWT |
| PATCH | `/api/auth/clave` | Cambiar la propia contraseña (JWT) |
| GET | `/api/categorias` | Lista categorías |
| GET | `/api/productos` | Productos activos (`?categoria=`) |
| GET | `/api/productos/todos` | Incluye inactivos (admin, plan Premium) |
| POST / PUT / DELETE | `/api/productos[/:id]` | Editor de productos (admin, plan Premium) |
| POST | `/api/pedidos` | Crear pedido (público; no disponible en plan Básico) |
| GET | `/api/pedidos` | Listar pedidos (admin) |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado (admin) |
| DELETE | `/api/pedidos/:id` | Borrar un pedido (admin) |
| DELETE | `/api/pedidos` | Borrar todo el historial (admin) |
| GET | `/api/pedidos/estadisticas` | Ventas por rango de fechas, máx. 31 días (admin, plan Premium) |
| GET | `/api/configuracion` | Plan y datos del negocio |
| PATCH | `/api/configuracion` | Cambiar el plan (solo superadmin) |

---

## 5. Despliegue en producción

**Vercel** (frontend + API) y **Supabase** (Postgres). No hay un servidor aparte que se duerma.

1. **Supabase**: crea el proyecto y copia las dos cadenas del botón **Connect → ORM → Prisma** (`DATABASE_URL` con pooler, `DIRECT_URL` directa).
2. **Base de datos**: desde tu máquina, con esas variables definidas, corre `npx prisma migrate deploy` y `npx prisma db seed` dentro de `frontend/`.
3. **Vercel**: importa el repo con *Root Directory* `frontend` y define estas variables (Production y Preview, las secretas como *Sensitive*):
   - `DATABASE_URL` (con `?pgbouncer=true&connection_limit=1`), `DIRECT_URL`, `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL=/api`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_RESTAURANT_NAME`
   - opcionales: `SMTP_*`, `RESTAURANT_EMAIL`
4. La lectura pública desde Supabase usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (llave *publishable*, pública por diseño), ya definidas en `frontend/.env.production`.
5. Cada `git push` a `main` redespliega. Las migraciones **no** se aplican solas: corre `npx prisma migrate deploy` cuando agregues una.

**Notas**
- Vercel Hobby es para uso no comercial; un negocio real debería evaluar el plan Pro.
- Si cambias `JWT_SECRET`, las sesiones abiertas del panel se cierran y hay que entrar de nuevo.

---

## 6. Planes

| Plan | Incluye |
|---|---|
| **Básico** | Menú digital por QR (sin pedidos) |
| **Medio** | + Pedidos por WhatsApp (mesa, domicilio y recoger) |
| **Premium** | + Estadísticas de ventas, editor de productos, soporte prioritario |

Las restricciones se aplican en el frontend (se ocultan botones) **y** en la API (responde 403), así que no basta con llamar la API directamente.

---

## 7. Seguridad

- Contraseñas con `bcrypt`; JWT con expiración de 12 h verificado en cada ruta protegida.
- Validación con `zod` en servidor (nombre solo letras, teléfono y mesa solo números).
- RLS en todas las tablas: la llave pública de Supabase solo puede leer lo estrictamente necesario del menú.
- Secretos solo en variables de entorno, nunca en el código.

## 8. Siguientes pasos sugeridos

- Subir imágenes de productos a un bucket (Supabase Storage / Cloudinary) en vez de archivos estáticos.
- Notificaciones en tiempo real en el panel (hoy se refresca por polling cada 4 s).
