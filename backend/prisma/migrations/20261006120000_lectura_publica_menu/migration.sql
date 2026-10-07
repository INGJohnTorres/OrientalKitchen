-- Lectura publica del menu directo desde Supabase (API REST/PostgREST con la
-- llave publica "anon"), para que el menu cargue al instante aunque el
-- backend (Render gratis) este dormido.
--
-- Prisma se conecta como el rol dueño de las tablas, que ignora RLS, asi que
-- el backend sigue funcionando igual. El rol "anon" (cualquiera con la llave
-- publica, que viaja en el frontend) queda limitado a lo estrictamente
-- necesario. Solo corre si existe el rol "anon" (Supabase); en un Postgres
-- normal no hace nada.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    -- Con RLS activo y sin politica, anon/authenticated no ven ni modifican nada.
    ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "productos" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "pedidos" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "detalle_pedidos" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "configuracion" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

    -- Defensa en profundidad: sin privilegios sobre tablas sensibles.
    REVOKE ALL ON "pedidos", "detalle_pedidos", "usuarios", "_prisma_migrations" FROM anon, authenticated;

    -- Solo lectura publica: categorias, productos activos y datos no sensibles
    -- de la configuracion (se excluye correoNotificacion).
    CREATE POLICY "lectura_publica" ON "categorias" FOR SELECT TO anon USING (true);
    CREATE POLICY "lectura_publica" ON "productos" FOR SELECT TO anon USING ("activo" = true);
    CREATE POLICY "lectura_publica" ON "configuracion" FOR SELECT TO anon USING (true);

    REVOKE ALL ON "categorias", "productos", "configuracion" FROM anon, authenticated;
    GRANT SELECT ON "categorias", "productos" TO anon;
    GRANT SELECT ("id", "nombreRestaurante", "logoUrl", "numeroWhatsapp", "plan") ON "configuracion" TO anon;
  END IF;
END
$$;
