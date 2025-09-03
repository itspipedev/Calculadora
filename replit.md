# Calculadora Avanzada - Aplicación Full-Stack

## Descripción General

Esta es una aplicación de calculadora web full-stack profesional construida con tecnologías modernas. Incluye una calculadora básica y científica avanzada con múltiples funcionalidades profesionales.

## Funcionalidades Principales

### Calculadora Básica
- Operaciones aritméticas fundamentales (suma, resta, multiplicación, división)
- Interfaz neomórfica moderna y responsive
- Validación de entrada en tiempo real
- Manejo profesional de errores
- Formato automático de números grandes y pequeños

### Calculadora Científica
- **Operaciones Exponenciales**: Potencia (x^y), raíz cuadrada, raíz cúbica
- **Logaritmos**: Logaritmo natural (ln), logaritmo base 10, logaritmo personalizado
- **Trigonometría**: sin, cos, tan, arcsin, arccos, arctan con soporte DEG/RAD
- **Funciones Hiperbólicas**: sinh, cosh, tanh
- **Constantes Matemáticas**: π (pi), e (euler), φ (golden ratio), τ (tau)
- **Operaciones Especiales**: factorial, valor absoluto, redondeo, módulo, porcentaje

### Sistema de Memoria
- **MS (Memory Store)**: Guardar valor actual en memoria
- **MR (Memory Recall)**: Recuperar valor de memoria
- **M+ (Memory Add)**: Sumar al valor en memoria
- **M- (Memory Subtract)**: Restar del valor en memoria
- **MC (Memory Clear)**: Limpiar memoria
- Indicador visual del estado de memoria

### Historial de Cálculos
- Registro automático de todas las operaciones realizadas
- Persistencia en localStorage del navegador
- Interfaz visual con scroll para revisar operaciones pasadas
- Click en entradas del historial para reutilizar resultados
- Límite de 100 entradas para optimizar rendimiento

### Exportación de Datos
- **Formato CSV**: Para análisis en Excel/Sheets
- **Formato JSON**: Para integración con otras aplicaciones
- Descarga automática de archivos con timestamps

### Interfaz de Usuario Avanzada
- **Modo Dual**: Alternancia entre calculadora básica y científica
- **Tema Neomórfico**: Diseño moderno con sombras y profundidad
- **Responsive**: Optimizado para móviles, tablets y escritorio
- **Animaciones**: Efectos visuales suaves y profesionales
- **Notificaciones Toast**: Feedback inmediato para el usuario

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for consistent theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework for REST API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Validation**: Zod for runtime type validation and schema definitions
- **Storage**: In-memory storage implementation with interface for future database integration
- **Development**: Hot reload support with tsx for TypeScript execution

### Data Storage Solutions
- **Current**: In-memory storage using Map data structures for development
- **Future-Ready**: Drizzle ORM configured for PostgreSQL with Neon database support
- **Migrations**: Database schema management through Drizzle Kit
- **Session**: Prepared for PostgreSQL session storage with connect-pg-simple

### Authentication and Authorization
- **Infrastructure**: Session-based authentication setup ready for implementation
- **Security**: Cookie-based sessions with PostgreSQL session store configuration
- **User Management**: User schema defined with username/password authentication model

### External Dependencies
- **Database**: Neon serverless PostgreSQL (configured but not actively used)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development**: Replit-specific tooling for development environment integration
- **Fonts**: Google Fonts integration (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)

The architecture follows a monorepo structure with shared schemas between client and server, ensuring type safety across the full stack. The application is containerized for easy deployment and uses modern development practices like path aliases and absolute imports.