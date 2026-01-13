# Avengers

Proyecto Avengers - Aplicación web con Next.js y PostgreSQL

## 🛠️ Stack Técnico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | v24.12.0 | Runtime de JavaScript |
| npm | 11.6.2 | Gestor de paquetes |
| Next.js | 16.1.1 | Framework React con App Router |
| React | 19.2.3 | Biblioteca de UI |
| TypeScript | ^5 | Tipado estático |
| Tailwind CSS | ^4 | Framework de estilos |
| Prisma | 7.2.0 | ORM para PostgreSQL |
| PostgreSQL | - | Base de datos relacional |

## 📁 Estructura del Proyecto

```
Avengers/
├── prisma/
│   └── schema.prisma     # Esquema de la base de datos
├── src/
│   └── app/              # App Router de Next.js
│       ├── layout.tsx    # Layout principal
│       ├── page.tsx      # Página principal
│       └── globals.css   # Estilos globales
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (no commitear)
├── .env.example          # Ejemplo de variables de entorno
└── package.json          # Dependencias del proyecto
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

```bash
npx prisma migrate dev
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## 🔗 Enlaces

- [Repositorio GitHub](https://github.com/AbelCruz27/Avengers)
