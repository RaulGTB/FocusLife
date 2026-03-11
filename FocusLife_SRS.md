# FocusLife — Documento de Especificación de Requisitos de Software (SRS)

> **Versión:** 1.0.0 · **Fecha:** Marzo 2026 · **Estado:** Borrador inicial  
> **Base de datos:** Supabase (PostgreSQL) · **Plataforma:** iOS / Android / Web

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Arquitectura Técnica](#3-arquitectura-técnica)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Personalización e Interfaz de Usuario](#5-personalización-e-interfaz-de-usuario)
6. [Seguridad y Privacidad](#6-seguridad-y-privacidad)
7. [Sincronización y Disponibilidad Offline](#7-sincronización-y-disponibilidad-offline)
8. [Requisitos No Funcionales](#8-requisitos-no-funcionales)
9. [Módulo de Inteligencia Artificial (Fase Futura)](#9-módulo-de-inteligencia-artificial-fase-futura)
10. [Roadmap de Desarrollo](#10-roadmap-de-desarrollo)
11. [Criterios de Aceptación y Pruebas](#11-criterios-de-aceptación-y-pruebas)
12. [Historial de Revisiones](#12-historial-de-revisiones)

---

## 1. Introducción

### 1.1 Propósito del documento

Este documento constituye la Especificación de Requisitos de Software (SRS) para **FocusLife**, una aplicación multiplataforma de productividad y organización personal. Define el alcance completo del sistema, los requisitos funcionales y no funcionales, la arquitectura técnica propuesta y las restricciones de diseño que guiarán el proceso de desarrollo.

Va dirigido a equipos de desarrollo, diseño UX/UI, QA, product management y cualquier stakeholder técnico involucrado en la construcción de la aplicación.

### 1.2 Visión general del producto

FocusLife es una aplicación que combina productividad, organización del día a día y registro personal dentro de una interfaz minimalista, modular e intuitiva. El usuario dispone de dos grandes áreas de trabajo complementarias:

- **Área de Productividad:** Gestión de tiempo, tareas, objetivos y calendario.
- **Área Personal:** Diario íntimo, biblioteca cultural y colecciones personalizadas.

> 💡 **Filosofía de diseño:** «local-first», experiencia fluida y privacidad del usuario como principios guía. Supabase se utilizará como capa de autenticación y sincronización en la nube.

### 1.3 Alcance

FocusLife cubrirá las siguientes capacidades principales:

1. Calendario inteligente con vistas mensual, semanal y diaria.
2. Sistema de tareas y objetivos con progreso visual.
3. Diario personal multimedia con zona privada y estados de ánimo.
4. Biblioteca personal para películas, series, libros y música.
5. Colecciones personalizadas libres ("wishlist", "restaurantes", etc.).
6. Sistema de archivos integrado: imágenes, PDFs, audios y enlaces.
7. Personalización de tema, colores e iconos por sección.
8. Seguridad con PIN/huella y encriptación local opcional.
9. Sincronización cloud mediante Supabase.
10. Exportación de datos en JSON y PDF.
11. Módulo de IA con sugerencias semanales (fase futura).

### 1.4 Definiciones y acrónimos

| Término / Sigla | Definición |
|---|---|
| SRS | Software Requirements Specification — Especificación de Requisitos de Software. |
| RF | Requisito Funcional — describe una función o comportamiento del sistema. |
| RNF | Requisito No Funcional — describe restricciones de calidad del sistema. |
| Supabase | Plataforma BaaS open-source basada en PostgreSQL. Provee autenticación, base de datos, storage y realtime. |
| BaaS | Backend as a Service — infraestructura backend gestionada en la nube. |
| RLS | Row Level Security — políticas de seguridad a nivel de fila en PostgreSQL. |
| JWT | JSON Web Token — estándar de autenticación sin estado. |
| Local-first | Arquitectura en la que los datos se almacenan primero en el dispositivo y se sincronizan opcionalmente con la nube. |
| CRUD | Create, Read, Update, Delete — operaciones básicas sobre datos. |
| MVP | Minimum Viable Product — versión funcional mínima del producto. |
| UI/UX | User Interface / User Experience. |
| API | Application Programming Interface. |
| OTP | One-Time Password — código de verificación de un solo uso. |

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del producto

FocusLife es un producto independiente diseñado para usuarios que buscan centralizar su organización personal y consumo cultural en una sola aplicación cohesionada. No depende de integraciones obligatorias con servicios de terceros, aunque ofrece la posibilidad de adjuntar enlaces externos (Google Maps, Spotify, YouTube, etc.).

La aplicación adopta una arquitectura **mobile-first**, con una capa de sincronización opcional mediante Supabase que permite uso offline completo y sincronización en segundo plano cuando hay conectividad.

### 2.2 Características principales del usuario

El usuario objetivo de FocusLife tiene el siguiente perfil general:

- Edad entre 16 y 40 años, familiarizado con apps de productividad y redes sociales.
- Busca consolidar varias herramientas (calendario, notas, tracker de series/libros) en una sola.
- Valora la privacidad, la personalización estética y la simplicidad de uso.
- Puede tener necesidades de productividad académica, profesional o personal indistintamente.
- Ocasionalmente accede desde web, pero su uso principal es desde móvil.

### 2.3 Restricciones generales

- El sistema debe ser funcional sin conexión a internet (modo offline).
- Los datos sensibles (diario privado, zona bloqueada) deben estar protegidos mediante PIN, biometría y encriptación.
- El diseño debe respetar los principios de accesibilidad WCAG 2.1 nivel AA.
- La aplicación no puede exceder 150 MB de tamaño de instalación inicial.
- El tiempo de carga inicial (cold start) no debe superar los 2 segundos en dispositivos de gama media.
- Supabase se empleará exclusivamente como sistema de autenticación y capa de sincronización cloud, no como única fuente de verdad.

### 2.4 Suposiciones y dependencias

- Se asume que el usuario tiene acceso a un dispositivo iOS (>= 15) o Android (>= 10) o navegador moderno (Chrome, Safari, Firefox).
- Se asume disponibilidad del servicio Supabase para funcionalidades cloud.
- Los archivos adjuntos se almacenan en Supabase Storage para sincronización; localmente se guardan en el sistema de archivos del dispositivo.
- Las notificaciones push dependen del permiso del sistema operativo concedido por el usuario.

---

## 3. Arquitectura Técnica

### 3.1 Stack tecnológico propuesto

| Capa | Tecnología recomendada | Notas |
|---|---|---|
| Frontend móvil | React Native / Expo | Permite iOS + Android desde una sola base de código. |
| Frontend web | React.js / Next.js | Versión web accesible desde navegador. |
| Autenticación | Supabase Auth | Email/contraseña, OTP, OAuth (Google, Apple). |
| Base de datos cloud | Supabase (PostgreSQL) | RLS por usuario. Realtime para sincronización. |
| Base de datos local | SQLite / WatermelonDB | Persistencia offline local-first. |
| Almacenamiento de archivos | Supabase Storage | Imágenes, PDFs, audios sincronizados en cloud. |
| Notificaciones push | Expo Notifications | Local y push notifications. |
| Encriptación | react-native-encrypted-storage | Datos sensibles del diario y zona privada. |
| Exportación PDF | react-native-html-to-pdf | Exportación de entradas del diario. |
| IA (fase futura) | OpenAI API / Claude API | Análisis de hábitos y resúmenes semanales. |

### 3.2 Modelo de datos en Supabase

Todas las tablas incluyen **Row Level Security (RLS)** activado para garantizar que cada usuario acceda únicamente a sus propios datos.

#### 3.2.1 Tablas del Área de Productividad

- **users:** `id`, `email`, `name`, `avatar_url`, `theme`, `accent_color`, `created_at`
- **calendar_events:** `id`, `user_id`, `title`, `description`, `start_date`, `end_date`, `color`, `type` (evento/tarea/deadline/clase), `attachments` (jsonb), `notifications` (jsonb), `created_at`
- **tasks:** `id`, `user_id`, `title`, `description`, `category`, `priority`, `status`, `due_date`, `completed_at`, `attachments` (jsonb), `notes`, `parent_goal_id`, `created_at`
- **goals:** `id`, `user_id`, `title`, `description`, `period` (diario/semanal/mensual), `progress` (int 0-100), `category`, `status`, `created_at`
- **categories:** `id`, `user_id`, `name`, `color`, `icon`, `scope` (tasks/calendar/both), `created_at`

#### 3.2.2 Tablas del Área Personal

- **diary_entries:** `id`, `user_id`, `date`, `content` (text), `mood` (emoji code), `photos` (jsonb), `audios` (jsonb), `links` (jsonb), `pdfs` (jsonb), `is_private` (bool), `created_at`, `updated_at`
- **library_items:** `id`, `user_id`, `type` (movie/series/book/music), `title`, `year`, `author_artist`, `rating` (0-5), `review`, `cover_url`, `trailer_url`, `external_link`, `progress` (jsonb), `tags` (text[]), `created_at`
- **collections:** `id`, `user_id`, `title`, `description`, `icon`, `color`, `cover_url`, `is_private` (bool), `order_index`, `created_at`
- **collection_items:** `id`, `collection_id`, `user_id`, `title`, `description`, `image_url`, `link_url`, `attachments` (jsonb), `notes`, `order_index`, `created_at`

#### 3.2.3 Tablas de sistema

- **user_settings:** `user_id`, `theme` (light/dark/system), `accent_color`, `language`, `notification_prefs` (jsonb), `security_settings` (jsonb), `home_sections` (jsonb), `created_at`, `updated_at`
- **file_attachments:** `id`, `user_id`, `entity_type`, `entity_id`, `file_type` (image/pdf/audio/link), `file_url`, `file_name`, `file_size`, `created_at`
- **sync_queue:** `id`, `user_id`, `operation` (insert/update/delete), `table_name`, `record_id`, `payload` (jsonb), `synced_at`, `created_at`

---

## 4. Requisitos Funcionales

### 4.1 Módulo de Autenticación y Onboarding

Gestiona el acceso seguro al sistema mediante Supabase Auth.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-AU-01 | Registro con email y contraseña | El usuario puede crear cuenta con email, contraseña y nombre. Supabase envía email de verificación. | Alta |
| RF-AU-02 | Inicio de sesión con email/contraseña | Autenticación estándar con JWT gestionado por Supabase Auth. | Alta |
| RF-AU-03 | Login con Google / Apple | OAuth 2.0 mediante Supabase Auth providers. | Alta |
| RF-AU-04 | Recuperación de contraseña | Envío de enlace de reset por email. | Alta |
| RF-AU-05 | Cierre de sesión | Invalidación del token JWT y limpieza de sesión local. | Alta |
| RF-AU-06 | Onboarding interactivo | Flujo de bienvenida de 3-5 pasos que presenta las secciones principales y permite configurar color de acento y tema inicial. | Media |
| RF-AU-07 | Gestión de perfil | El usuario puede editar nombre, avatar y preferencias de idioma. | Media |

### 4.2 Módulo de Calendario Inteligente

Sistema de gestión de eventos y tareas con soporte multimedia y notificaciones.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-CA-01 | Vista mensual del calendario | Muestra el mes completo con indicadores de eventos por día. Navegación entre meses con swipe o botones. | Alta |
| RF-CA-02 | Vista semanal | Muestra la semana en formato timeline horizontal con bloques de tiempo. | Alta |
| RF-CA-03 | Vista diaria | Timeline vertical de 24 horas con eventos posicionados por hora. | Alta |
| RF-CA-04 | Crear evento / tarea | Formulario para añadir título, tipo, fecha/hora, duración, color, descripción y repetición. | Alta |
| RF-CA-05 | Tipos de evento | Soporte para: Evento, Tarea, Quedada, Clase, Deadline. Cada tipo tiene icono y color por defecto personalizables. | Alta |
| RF-CA-06 | Adjuntar archivos a eventos | Posibilidad de adjuntar imágenes, PDFs, audios y enlaces externos a cualquier evento. | Alta |
| RF-CA-07 | Colores personalizables | El usuario asigna colores por tipo de actividad o por evento individual. | Media |
| RF-CA-08 | Notificaciones de eventos | Recordatorios configurables (15 min, 1 hora, 1 día antes). Opcionalmente desactivables. | Alta |
| RF-CA-09 | Eventos recurrentes | Soporte para recurrencia diaria, semanal, mensual y personalizada. | Media |
| RF-CA-10 | Búsqueda de eventos | Búsqueda por título, descripción o fecha dentro del calendario. | Media |
| RF-CA-11 | Arrastrar y soltar eventos | Posibilidad de mover eventos entre días en las vistas semanal y mensual. | Baja |

### 4.3 Módulo de To-Do y Objetivos

Sistema de gestión de tareas diarias con seguimiento de objetivos a distintos plazos.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-TD-01 | Crear tarea diaria | Formulario con título, categoría, prioridad (alta/media/baja), fecha límite, descripción y adjuntos. | Alta |
| RF-TD-02 | Marcar tarea como completada | Check visual animado. La tarea se archiva y suma al progreso del día. | Alta |
| RF-TD-03 | Barra de progreso diario | Indicador visual del % de tareas completadas en el día actual. | Alta |
| RF-TD-04 | Objetivos semanales / mensuales | Crear objetivos con título, descripción, plazo y subtareas vinculadas. | Alta |
| RF-TD-05 | Categorías personalizables | El usuario crea, edita y elimina categorías con nombre, color e icono. | Alta |
| RF-TD-06 | Recordatorios de tareas | Notificaciones configurables por tarea. | Media |
| RF-TD-07 | Notas rápidas en tareas | Campo de texto libre dentro de cada tarea. | Media |
| RF-TD-08 | Adjuntar archivos a tareas | Misma capacidad multimedia que el calendario (imágenes, PDFs, links). | Media |
| RF-TD-09 | Filtros y ordenación | Filtrar por categoría, prioridad, estado y fecha. Ordenar por fecha o prioridad. | Media |
| RF-TD-10 | Resumen semanal de productividad | Vista con tareas completadas vs pendientes por semana, con gráfico simple. | Baja |

### 4.4 Módulo de Diario Personal

Espacio íntimo para registrar pensamientos, recuerdos y estados de ánimo con soporte multimedia completo.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-DI-01 | Crear entrada de diario | Editor de texto enriquecido por día. Soporte para negrita, cursiva, listas y encabezados básicos. | Alta |
| RF-DI-02 | Selector de estado de ánimo | Emojis seleccionables (al menos 8 opciones). Se muestra en el encabezado de la entrada y en el calendario del diario. | Alta |
| RF-DI-03 | Adjuntar fotos | Posibilidad de añadir múltiples imágenes por entrada (galería o cámara). | Alta |
| RF-DI-04 | Adjuntar audios y notas de voz | Grabación de audio desde la app o importación de archivos de audio. | Alta |
| RF-DI-05 | Adjuntar PDFs y enlaces | Links con preview y archivos PDF visualizables dentro de la app. | Media |
| RF-DI-06 | Modo privado con contraseña | La sección del diario puede bloquearse con PIN o biometría independientemente del bloqueo general de la app. | Alta |
| RF-DI-07 | Búsqueda en el diario | Buscar entradas por fecha, palabra clave en el texto, o estado de ánimo. | Alta |
| RF-DI-08 | Vista de calendario del diario | Vista mensual que indica con un punto de color el estado de ánimo de cada día. | Media |
| RF-DI-09 | Exportar entradas | Exportar una o varias entradas como PDF o JSON. | Media |
| RF-DI-10 | Historial de ediciones | Registro de cuándo se editó una entrada (timestamp), sin historial detallado de versiones en MVP. | Baja |

### 4.5 Módulo de Biblioteca Personal

Registro y valoración del consumo cultural del usuario: películas, series, libros y música.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-BI-01 | Añadir película | Formulario: título, año, opinión, valoración (1-5 estrellas), imagen de póster, enlace a tráiler. | Alta |
| RF-BI-02 | Añadir serie | Formulario: título, temporadas vistas, episodios pendientes, estado (viendo/pendiente/vista/abandonada), opinión, favoritos. | Alta |
| RF-BI-03 | Añadir libro | Formulario: título, autor, progreso (%), notas, portada, enlace a Goodreads. | Alta |
| RF-BI-04 | Añadir canción / álbum | Formulario: canción + artista, enlace a Spotify/YouTube, notas personales. | Alta |
| RF-BI-05 | Filtros por tipo | Pestañas o filtro para navegar por películas / series / libros / música. | Alta |
| RF-BI-06 | Filtros por estado y valoración | Filtrar por: pendiente, en progreso, completado, valoración mínima. | Media |
| RF-BI-07 | Búsqueda en biblioteca | Búsqueda por título, autor/artista o etiquetas. | Alta |
| RF-BI-08 | Etiquetas personalizadas | El usuario puede añadir etiquetas libres a cualquier ítem de la biblioteca. | Media |
| RF-BI-09 | Estadísticas de consumo | Panel con: películas vistas, libros leídos, horas de series (estimadas), géneros frecuentes. | Baja |
| RF-BI-10 | Importar desde TMDB / Goodreads | Autocompletar datos del ítem buscando en APIs externas (fase post-MVP). | Baja |

### 4.6 Módulo de Colecciones Personalizadas

Sistema de tableros libres que el usuario puede crear para cualquier tipo de lista o colección.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-CO-01 | Crear colección | Formulario: nombre, descripción, icono (selector), color de acento, imagen de portada. | Alta |
| RF-CO-02 | Gestionar colecciones | Editar, reordenar (drag & drop) y eliminar colecciones. | Alta |
| RF-CO-03 | Añadir ítems a colección | Cada ítem tiene: título, descripción, imagen, enlace, adjuntos, notas. | Alta |
| RF-CO-04 | Reordenar ítems | Drag & drop para cambiar el orden de los ítems dentro de una colección. | Media |
| RF-CO-05 | Marcar ítem como completado / visto | Toggle de estado en ítems de colección (p. ej. "restaurante visitado"). | Media |
| RF-CO-06 | Colecciones privadas | Posibilidad de marcar una colección como privada (requiere desbloqueo). | Media |
| RF-CO-07 | Plantillas predefinidas | Plantillas iniciales sugeridas: Wishlist, Restaurantes, Conciertos, Apps por probar. | Baja |
| RF-CO-08 | Compartir colección | Generar enlace de solo lectura para compartir una colección (fase post-MVP). | Baja |

### 4.7 Módulo de Archivos y Multimedia

Sistema centralizado de gestión de archivos adjuntos accesible desde cualquier sección de la app.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-AR-01 | Subir imágenes | Soporte JPG, PNG, WebP. Compresión automática antes de almacenar. Vista previa inline. | Alta |
| RF-AR-02 | Subir PDFs | Visualizador PDF integrado. Tamaño máximo por archivo: 25 MB. | Alta |
| RF-AR-03 | Grabar y adjuntar audio | Grabadora de notas de voz integrada. Formatos: M4A, MP3. | Alta |
| RF-AR-04 | Adjuntar enlaces externos | Soporte para URLs con preview de metadatos (título, imagen og:image). | Alta |
| RF-AR-05 | Galería de archivos por entidad | Vista de galería de todos los archivos adjuntos de un evento, tarea, entrada de diario o ítem. | Media |
| RF-AR-06 | Biblioteca de medios global | Pantalla centralizada con todos los archivos del usuario, filtrable por tipo y fecha. | Baja |
| RF-AR-07 | Almacenamiento en Supabase Storage | Los archivos se sincronizan con Supabase Storage. En modo offline se guardan localmente y se sincronizan al recuperar conexión. | Alta |

---

## 5. Personalización e Interfaz de Usuario

### 5.1 Sistema de temas y personalización visual

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-PE-01 | Tema claro / oscuro / sistema | Tres modos de color. Por defecto sigue la preferencia del sistema operativo. | Alta |
| RF-PE-02 | Color de acento personalizable | El usuario elige un color de acento de una paleta curada (mínimo 12 opciones). | Alta |
| RF-PE-03 | Colores por categoría / sección | Cada categoría de tareas, tipo de evento y sección personal tiene su propio color. | Alta |
| RF-PE-04 | Iconos personalizables | Selector de iconos (emoji o set de SF Symbols / Material Icons) para secciones y colecciones. | Media |
| RF-PE-05 | Secciones configurables en inicio | El usuario decide qué widgets o secciones aparecen en la pantalla de inicio y en qué orden. | Alta |
| RF-PE-06 | Tamaño de texto | Ajuste de tamaño de fuente en tres niveles: pequeño, normal, grande. | Media |
| RF-PE-07 | Animaciones de transición | Fade y slide suaves entre pantallas. Opción de reducir movimiento para accesibilidad. | Media |

### 5.2 Pantalla de inicio (Dashboard)

La pantalla principal actúa como hub de acceso rápido, completamente personalizable. Los widgets disponibles son:

- **Resumen del día:** tareas pendientes de hoy + eventos del calendario.
- **Progreso diario:** barra circular de tareas completadas.
- **Acceso rápido al diario:** botón flotante para crear entrada rápida.
- **Próximos eventos:** lista de los 3 próximos eventos del calendario.
- **Objetivos en curso:** progreso de objetivos semanales/mensuales activos.
- **Acceso rápido a colecciones:** las 2-3 últimas colecciones usadas.
- **Estado de ánimo reciente:** última entrada del diario con su emoji.

### 5.3 Principios de diseño UI

- Estilo minimalista con tarjetas simples y bordes redondeados.
- Paleta reducida: blanco/negro + un color de acento elegido por el usuario.
- Íconos limpios y consistentes en todo el sistema.
- Animaciones suaves (fade, slide) sin sobrecargar la interfaz.
- Tipografía legible con jerarquía clara entre títulos y cuerpo.
- Espaciado generoso; sin pantallas sobrecargadas de información.

---

## 6. Seguridad y Privacidad

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-SE-01 | Bloqueo de app con PIN | El usuario configura un PIN de 4-6 dígitos para acceder a la app. Bloqueo automático configurable (inmediato, 1 min, 5 min). | Alta |
| RF-SE-02 | Autenticación biométrica | Soporte para Face ID, Touch ID (iOS) y huella dactilar (Android) como alternativa al PIN. | Alta |
| RF-SE-03 | Zona privada con bloqueo independiente | El diario personal y las colecciones marcadas como privadas tienen su propio nivel de bloqueo, adicional al de la app. | Alta |
| RF-SE-04 | Encriptación local de datos sensibles | Los datos del diario en zona privada se almacenan encriptados en el dispositivo usando AES-256. | Alta |
| RF-SE-05 | Tokens JWT seguros | Supabase gestiona tokens JWT con expiración y refresco automático. | Alta |
| RF-SE-06 | Row Level Security en Supabase | Todas las tablas tienen RLS activado. Ningún usuario puede acceder a datos de otro. | Alta |
| RF-SE-07 | HTTPS obligatorio | Toda comunicación con Supabase se realiza sobre TLS 1.2+. | Alta |
| RF-SE-08 | No almacenamiento de contraseñas | Las contraseñas nunca se almacenan en el dispositivo. Supabase Auth gestiona el hash seguro. | Alta |
| RF-SE-09 | Exportación de datos (GDPR) | El usuario puede exportar todos sus datos en formato JSON desde la configuración. | Media |
| RF-SE-10 | Eliminación de cuenta | El usuario puede eliminar su cuenta y todos sus datos de forma permanente e irreversible. | Alta |

---

## 7. Sincronización y Disponibilidad Offline

### 7.1 Estrategia local-first

FocusLife sigue una arquitectura **local-first**: los datos se crean y persisten primero en la base de datos local del dispositivo (SQLite / WatermelonDB) y se sincronizan con Supabase cuando hay conectividad disponible.

> ⚡ **Principio:** la app debe ser 100% funcional sin conexión a internet. La nube es un beneficio adicional, no un requisito operativo.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-SY-01 | Operación offline completa | Todas las funciones CRUD están disponibles sin conexión. Los cambios se encolan localmente. | Alta |
| RF-SY-02 | Sincronización automática | Al detectar conexión, la app sincroniza automáticamente los cambios pendientes en segundo plano. | Alta |
| RF-SY-03 | Resolución de conflictos | En caso de conflicto (edición simultánea en dos dispositivos), se aplica la estrategia last-write-wins con notificación al usuario. | Alta |
| RF-SY-04 | Indicador de estado de sincronización | Icono en la barra de estado que muestra: sincronizado, pendiente de sync, sin conexión. | Media |
| RF-SY-05 | Sync selectiva | El usuario puede configurar si desea sincronizar archivos multimedia o solo datos textuales. | Media |
| RF-SY-06 | Multi-dispositivo | Los datos sincronizados son accesibles desde múltiples dispositivos con la misma cuenta. | Alta |
| RF-SY-07 | Exportar datos como JSON | Exportación completa de todos los datos del usuario en formato JSON estructurado. | Alta |
| RF-SY-08 | Exportar diario como PDF | Generación de PDF con las entradas del diario seleccionadas, incluyendo fotos. | Media |
| RF-SY-09 | Importar datos | Opción de importar datos desde una exportación JSON previa (restauración). | Baja |

---

## 8. Requisitos No Funcionales

### 8.1 Rendimiento

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RNF-RE-01 | Tiempo de cold start | La app debe estar lista en menos de 2 segundos en un dispositivo de gama media (4 GB RAM). | Alta |
| RNF-RE-02 | Tiempo de respuesta UI | Las interacciones táctiles deben responder en menos de 100 ms. Las transiciones entre pantallas en menos de 300 ms. | Alta |
| RNF-RE-03 | Carga de lista larga | Listas de más de 500 ítems deben cargarse usando virtualización sin degradación de performance. | Alta |
| RNF-RE-04 | Tamaño de la app | El bundle de instalación inicial no debe superar 150 MB. | Media |
| RNF-RE-05 | Consumo de batería | La sincronización en segundo plano no debe incrementar el consumo de batería en más de un 5% en uso normal. | Media |

### 8.2 Usabilidad y accesibilidad

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RNF-US-01 | Onboarding en menos de 3 minutos | Un usuario nuevo debe ser capaz de completar el registro y crear su primera tarea en menos de 3 minutos. | Alta |
| RNF-US-02 | Accesibilidad WCAG 2.1 AA | Contraste mínimo 4.5:1, texto redimensionable, etiquetas de accesibilidad en todos los elementos interactivos. | Alta |
| RNF-US-03 | Soporte de gestos nativos | Swipe para navegar entre vistas del calendario, swipe para completar/eliminar tareas. | Media |
| RNF-US-04 | Modo de reducción de movimiento | Respetar la preferencia de sistema "Reducir movimiento" eliminando animaciones complejas. | Media |
| RNF-US-05 | Internacionalización | La app debe soportar español e inglés en la versión inicial. Arquitectura preparada para más idiomas. | Alta |

### 8.3 Fiabilidad y disponibilidad

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RNF-FI-01 | Disponibilidad offline 100% | Las funciones core funcionan sin dependencia de red. | Alta |
| RNF-FI-02 | Backup automático local | La base de datos local se respalda automáticamente cada 24 horas en el almacenamiento interno. | Media |
| RNF-FI-03 | Manejo de errores | Los errores de red y sincronización se tratan de forma silenciosa. El usuario solo es notificado si el error requiere acción. | Alta |
| RNF-FI-04 | Uptime del servicio Supabase | Se asume el SLA de Supabase (99.9%). La app degrada gracefully en caso de no disponibilidad. | Alta |

### 8.4 Mantenibilidad y escalabilidad

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RNF-MA-01 | Arquitectura modular | Cada sección debe ser un módulo independiente para facilitar mantenimiento y expansión. | Alta |
| RNF-MA-02 | Cobertura de tests | Mínimo 70% de cobertura en lógica de negocio. Tests de integración para flujos críticos. | Media |
| RNF-MA-03 | Documentación técnica | Código documentado con JSDoc. README actualizado con instrucciones de setup. | Media |
| RNF-MA-04 | Preparada para IA | La arquitectura de datos debe facilitar la incorporación futura de módulos de análisis e IA. | Media |

---

## 9. Módulo de Inteligencia Artificial (Fase Futura)

Las siguientes funcionalidades de IA se contemplan para versiones posteriores al MVP y están diseñadas para integrarse sin cambios estructurales en la arquitectura de datos.

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-IA-01 | Resumen semanal del diario | Generación automática de un resumen en lenguaje natural de las entradas de diario de la semana. | Baja |
| RF-IA-02 | Detección de patrones de productividad | Análisis de horas de completado de tareas para identificar franjas de mayor productividad personal. | Baja |
| RF-IA-03 | Recomendación de hábitos | Sugerencias de rutinas basadas en el historial de objetivos completados y tasas de éxito. | Baja |
| RF-IA-04 | Clasificación automática de tareas | Propuesta de categoría y prioridad al crear una tarea basándose en el historial del usuario. | Baja |
| RF-IA-05 | Sugerencias en la biblioteca | Recomendación de películas, libros o música basándose en las valoraciones del usuario. | Baja |

### 9.1 Consideraciones técnicas para IA

- Las llamadas a API de IA se realizarán siempre con datos anonimizados o bajo consentimiento explícito del usuario.
- El usuario podrá activar o desactivar el módulo de IA desde la configuración.
- Las sugerencias se presentarán siempre como opcionales; nunca modificarán datos del usuario sin confirmación.
- Se evaluarán modelos ejecutables on-device (Core ML, TensorFlow Lite) para no depender de conectividad.

---

## 10. Roadmap de Desarrollo

| Fase | Nombre | Entregables principales | Duración est. |
|---|---|---|---|
| Fase 0 | Fundamentos | Setup Supabase, autenticación completa, navegación principal, tema claro/oscuro, DB local. | 2-3 semanas |
| Fase 1 | MVP Productividad | Calendario (3 vistas), To-Do list, objetivos, categorías, notificaciones push. | 4-5 semanas |
| Fase 2 | MVP Personal | Diario con multimedia, zona privada, biblioteca (películas/series/libros/música). | 4-5 semanas |
| Fase 3 | Colecciones y Archivos | Colecciones personalizadas, sistema de archivos completo, exportación PDF/JSON. | 3-4 semanas |
| Fase 4 | Sync y Seguridad | Sincronización cloud completa, resolución de conflictos, encriptación local, multi-dispositivo. | 3-4 semanas |
| Fase 5 | Personalización | Iconos personalizables, widgets del inicio, selector de colores ampliado, accesibilidad WCAG. | 2-3 semanas |
| Fase 6 | IA y Analytics | Resumen semanal IA, detección de patrones, recomendaciones de hábitos. | 4-6 semanas |
| Fase 7 | Pulido y Store | QA completo, optimización de rendimiento, publicación en App Store y Google Play. | 3-4 semanas |

**Duración total estimada:** 25-34 semanas (~6-8 meses con equipo de 2-3 desarrolladores.

---

## 11. Criterios de Aceptación y Pruebas

### 11.1 Criterios de aceptación del MVP

#### Autenticación
- Un usuario puede registrarse, verificar su email e iniciar sesión en menos de 2 minutos.
- El login con Google y Apple funciona correctamente en iOS y Android.
- El bloqueo por PIN y biometría funciona en el 100% de los flujos de prueba.

#### Calendario y Tareas
- Un usuario puede crear un evento, añadir una foto adjunta y recibir la notificación en el momento configurado.
- Las 3 vistas del calendario renderizan correctamente más de 100 eventos sin lag perceptible.
- La barra de progreso diario se actualiza en tiempo real al marcar tareas.

#### Diario
- Una entrada del diario con 5 fotos y 1 audio se guarda y recupera correctamente en modo offline.
- La zona privada con PIN independiente bloquea el acceso correctamente al minimizar la app.
- La búsqueda por palabra clave encuentra resultados en menos de 500 ms con 500+ entradas.

#### Sincronización
- Los datos creados en modo offline se sincronizan correctamente al recuperar conexión sin pérdida de datos.
- Los mismos datos son accesibles en dos dispositivos distintos con la misma cuenta en menos de 5 segundos tras la sync.

### 11.2 Tipos de pruebas requeridas

- **Tests unitarios:** lógica de negocio, cálculo de progreso, validaciones de formularios.
- **Tests de integración:** flujos de auth con Supabase, sync online/offline.
- **Tests de UI:** navegación principal, CRUD de cada módulo, encriptación de zona privada.
- **Tests de rendimiento:** cold start, scroll de listas largas, carga de galería multimedia.
- **Tests de accesibilidad:** VoiceOver (iOS), TalkBack (Android), contraste de colores.
- **Tests de seguridad:** inyección SQL, acceso no autorizado a datos de otro usuario (RLS).

---

## 12. Historial de Revisiones

| Versión | Fecha | Descripción | Autor |
|---|---|---|---|
| 1.0.0 | Marzo 2026 | Versión inicial del SRS. Definición completa de todos los módulos, requisitos funcionales y no funcionales, arquitectura Supabase y roadmap. | Equipo FocusLife |

---

*FocusLife SRS — Documento generado en Marzo 2026.*  
*Todos los requisitos sujetos a revisión en fases posteriores de desarrollo.*
