# Mobile Shop - Frontend Test

Esta aplicación es una mini-tienda de dispositivos móviles desarrollada como prueba técnica frontend.

## Descripción del Proyecto

La aplicación consta de dos vistas principales:
- **Lista de Productos**: Muestra todos los productos disponibles con opciones de filtrado.
- **Detalle de Producto**: Muestra información detallada del producto seleccionado y permite añadirlo al carrito.

## Tecnologías Utilizadas

- React 19
- React Router DOM para navegación
- Redux Toolkit para gestión del estado
- Material UI para componentes y estilos
- IndexedDB para cacheo de datos
- Axios para peticiones HTTP
- Jest y Testing Library para pruebas

## Características Principales

- **Listado de Productos**: Visualización en grid adaptativo según resolución (máximo 4 por fila).
- **Búsqueda**: Filtrado en tiempo real por marca y modelo.
- **Detalle de Producto**: Vista dividida con imagen y especificaciones.
- **Carrito de Compras**: Añadir productos con opciones de color y almacenamiento.
- **Caché**: Almacenamiento local de datos con expiración de 1 hora.
- **Diseño Responsive**: Adaptable a diferentes tamaños de pantalla.

## Estructura del Proyecto

```
mobile-shop/
├── public/                 # Archivos públicos
├── src/                    # Código fuente
│   ├── components/         # Componentes reutilizables
│   │   ├── cart/           # Componentes relacionados con el carrito
│   │   ├── common/         # Componentes comunes (Header, SearchBar, etc.)
│   │   ├── product/        # Componentes de productos
│   │   └── ProductDetail/  # Componentes de detalle de producto
│   ├── pages/              # Páginas principales
│   ├── redux/              # Configuración de Redux
│   │   └── slices/         # Slices para Redux Toolkit
│   ├── services/           # Servicios para API
│   ├── theme/              # Configuración de temas
│   ├── utils/              # Utilidades y cacheo
│   ├── App.jsx             # Componente principal
│   ├── index.jsx           # Punto de entrada
│   └── routes.js           # Configuración de rutas
└── package.json            # Dependencias y scripts
```

## Scripts Disponibles

```bash
# Modo desarrollo
npm start

# Compilación para producción
npm run build

# Ejecución de tests
npm test

# Comprobación de código
npm run lint
```

## API Utilizada

La aplicación se integra con la API disponible en:
```
https://itx-frontend-test.onrender.com/api
```

Endpoints:
- GET /api/product - Listado de productos
- GET /api/product/:id - Detalle de producto
- POST /api/cart - Añadir producto al carrito

## Persistencia de Datos

Se implementa un sistema de cacheo utilizando IndexedDB:
- Los datos obtenidos del API se almacenan localmente.
- La caché expira después de 1 hora.
- Se implementa en utils/productCache.js y utils/cartCache.js.

## Características de la Implementación

1. **ProductList**: Visualización paginada y adaptativa de productos.
2. **ProductDetail**: Vista detallada con todas las especificaciones técnicas.
3. **Carrito**: Funcionalidad completa para añadir productos con diferentes opciones.
4. **Breadcrumbs**: Navegación con indicación de la ubicación actual.
5. **Búsqueda**: Filtrado en tiempo real por marca y modelo.