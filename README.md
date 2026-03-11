# FocusLife

Aplicación de productividad y organización personal construida con Next.js y Supabase.

## Características

- 📅 **Calendario** — Gestión de eventos y agenda
- ✅ **Tareas** — Lista de tareas con prioridades y categorías
- 🎯 **Objetivos** — Seguimiento de metas personales
- 📔 **Diario** — Diario personal con 20 estados de ánimo y búsqueda por fecha
- 📚 **Biblioteca** — Colección cultural (películas, series, libros, música) con portadas y adjuntos
- 📁 **Colecciones** — Listas personalizadas con subida de archivos y fotos
- ⚙️ **Ajustes** — Temas (claro/oscuro), colores de acento, tamaño de texto
- 🔐 **Autenticación** — Login, registro y recuperación de contraseña via Supabase Auth

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, CSS Modules
- **Backend**: Supabase (Auth, Database, Storage)
- **Diseño**: Liquid Glass / Glassmorphism
- **Deploy**: Vercel

## Setup local

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon/pública de Supabase |

## Deploy en Vercel

1. Conecta este repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`
