# OptiVision - Sistema de Gestión Óptica

Sistema web profesional para la gestión integral de una óptica. Incluye gestión de pacientes, recetas oftalmológicas, inventario, ventas, pedidos de laboratorio, agenda de citas y reportes.

## Stack Tecnológico

### Frontend
- **React 18** con Vite
- **TailwindCSS** para estilos
- **Framer Motion** para animaciones fluidas
- **Lucide React** para iconos
- **React Router** para navegación
- **Zustand** para estado global
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **React Hot Toast** para notificaciones

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **Prisma ORM** para modelos y consultas
- **JWT** para autenticación
- **Zod** para validación
- **bcryptjs** para hash de contraseñas

## Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── layout/     # Sidebar, Navbar, AppLayout
│   │   │   └── ui/         # Modal, DataTable, StatCard, Badge, etc.
│   │   ├── features/       # Módulos por feature
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── dashboard/  # Dashboard principal
│   │   │   ├── patients/   # CRUD de pacientes
│   │   │   ├── prescriptions/ # Recetas oftalmológicas
│   │   │   ├── inventory/  # Gestión de productos
│   │   │   ├── sales/      # Ventas y tickets
│   │   │   ├── orders/     # Pedidos de laboratorio
│   │   │   ├── appointments/ # Agenda de citas
│   │   │   └── reports/    # Reportes y gráficos
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # API client, formatters
│   │   └── styles/         # CSS con Tailwind
│   └── ...
├── server/                 # Backend Express
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos de base de datos
│   │   └── seed.js         # Datos de prueba
│   └── src/
│       ├── config/         # Database config
│       ├── middleware/      # Auth, validation
│       └── routes/         # API endpoints
└── ...
```

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+

## Instalación y Ejecución

### 1. Configurar la base de datos

Crear una base de datos PostgreSQL y configurar la URL de conexión:

```bash
cd server
cp .env.example .env
# Editar .env con tu DATABASE_URL
```

Variables de entorno del servidor (`.env`):
```
DATABASE_URL="postgresql://user:password@localhost:5432/optica_db"
JWT_SECRET="tu-clave-secreta-jwt"
PORT=3001
```

### 2. Instalar dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurar base de datos

```bash
cd server
npx prisma db push      # Crear tablas
npm run db:seed          # Cargar datos de prueba
```

### 4. Iniciar el proyecto

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

El frontend estará en `http://localhost:5173` y el backend en `http://localhost:3001`.

## Credenciales de Prueba

| Rol          | Email                  | Contraseña |
|--------------|------------------------|------------|
| Admin        | admin@optica.com       | admin123   |
| Vendedor     | vendedor@optica.com    | seller123  |
| Optometrista | doctor@optica.com      | doctor123  |

## Módulos

### Dashboard
- Estadísticas del día con contadores animados
- Ventas recientes
- Próximas citas
- Alertas de stock bajo

### Pacientes
- CRUD completo
- Búsqueda rápida
- Historial de recetas y compras
- Vista detallada con tabs

### Recetas Oftalmológicas
- Registro de OD/OI (SPH, CYL, AXIS)
- Distancia pupilar
- Tipo de lente
- Historial por paciente

### Inventario
- Monturas, lentes, lentes de contacto, accesorios
- Alertas de stock bajo
- Filtros por tipo
- Búsqueda por nombre/marca

### Ventas
- Selección de paciente y productos
- Carrito con cantidades
- Descuentos
- Métodos de pago (efectivo, tarjeta, transferencia)
- Ticket de venta

### Pedidos de Laboratorio
- Estados: Pendiente, En proceso, Listo, Entregado
- Asociación con paciente, receta y producto
- Filtros por estado

### Agenda de Citas
- Vista agrupada por fecha
- Tipos: Examen visual, Consulta, Control, Ajuste
- Estados: Agendada, Completada, Cancelada

### Reportes
- Ventas diarias (gráfico de líneas)
- Ventas mensuales (gráfico de barras)
- Métodos de pago (gráfico de pastel)
- Productos más vendidos

## API Endpoints

| Método | Endpoint               | Descripción                |
|--------|------------------------|----------------------------|
| POST   | /api/auth/login        | Iniciar sesión             |
| POST   | /api/auth/register     | Registro de usuario        |
| GET    | /api/auth/me           | Usuario actual             |
| GET    | /api/patients          | Listar pacientes           |
| POST   | /api/patients          | Crear paciente             |
| GET    | /api/patients/:id      | Detalle de paciente        |
| PUT    | /api/patients/:id      | Actualizar paciente        |
| DELETE | /api/patients/:id      | Eliminar paciente          |
| GET    | /api/prescriptions     | Listar recetas             |
| POST   | /api/prescriptions     | Crear receta               |
| PUT    | /api/prescriptions/:id | Actualizar receta          |
| DELETE | /api/prescriptions/:id | Eliminar receta            |
| GET    | /api/products          | Listar productos           |
| POST   | /api/products          | Crear producto             |
| PUT    | /api/products/:id      | Actualizar producto        |
| DELETE | /api/products/:id      | Desactivar producto        |
| GET    | /api/sales             | Listar ventas              |
| POST   | /api/sales             | Crear venta                |
| GET    | /api/orders            | Listar pedidos             |
| POST   | /api/orders            | Crear pedido               |
| PUT    | /api/orders/:id        | Actualizar pedido          |
| DELETE | /api/orders/:id        | Eliminar pedido            |
| GET    | /api/appointments      | Listar citas               |
| POST   | /api/appointments      | Crear cita                 |
| PUT    | /api/appointments/:id  | Actualizar cita            |
| DELETE | /api/appointments/:id  | Eliminar cita              |
| GET    | /api/suppliers         | Listar proveedores         |
| POST   | /api/suppliers         | Crear proveedor            |
| GET    | /api/dashboard/stats   | Estadísticas del dashboard |
| GET    | /api/dashboard/reports | Datos para reportes        |

## Características UI/UX

- Sidebar colapsable con animaciones
- Dark mode
- Tablas con paginación y skeleton loaders
- Modales con animaciones suaves
- Toast notifications
- Búsqueda con debounce
- Contadores animados en estadísticas
- Transiciones de página con Framer Motion
- Diseño responsive
- Micro-interacciones en hover
