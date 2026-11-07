# Coexistencia Sky

Panel privado para gestionar conexiones de WhatsApp Business mediante Embedded Signup de Meta.

## Desarrollo

1. Copia `.env.example` a `.env`; define `APP_ENCRYPTION_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. Inicia PostgreSQL: `docker compose up -d postgres`.
3. Instala dependencias: `npm install`.
4. Migra y crea el primer administrador: `npm run db:migrate`.
5. Inicia: `npm run dev`.

## Dokploy: todo en uno

1. Sube este proyecto a GitHub, sin `.env`.
2. En Dokploy crea **Compose** desde el repositorio. Dokploy detecta `docker-compose.yml`.
3. En **Environment** pega las variables de `.env`. Deja `DATABASE_URL` como está, salvo que cambies usuario, clave o base de datos PostgreSQL.
4. Pulsa **Deploy**. PostgreSQL, migración y aplicación arrancan juntos.
5. Añade dominio HTTPS al servicio `app`; actualiza `APP_URL` con ese dominio y redeploya.
6. En Meta añade `${APP_URL}/api/webhooks` como callback, usa `FB_VERIFY_TOKEN`, y configura el dominio/OAuth redirect permitido.

El contenedor aplica migraciones en cada arranque. La creación del administrador no se duplica. Después del primer despliegue, elimina `ADMIN_PASSWORD` del entorno Dokploy si no necesitas crear otro administrador.

No se despliega una conexión Meta hasta contar con `FB_APP_ID`, `FB_APP_SECRET` y `FB_CONFIG_ID` de una app aprobada.
