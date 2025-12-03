# ÁNIMA

ÁNIMA es una plataforma experimental de cartografía crítica y patrimonio cultural digital destinada a preservar, visualizar y analizar las animitas de Chile como una forma de patrimonio cultural inmaterial (PCI). El proyecto explora cómo las infraestructuras digitales pueden mediar experiencias devocionales, representar memorias territoriales y correlacionarlas con el entorno social, urbano y geográfico.

El sistema combina datos propios de animitas con capas externas (Overpass, ArcGIS, CSVs, etc.) para crear un entorno interactivo de análisis espacial, GIS y visualización avanzada.

---

## Objetivo académico

El proyecto aborda la pregunta:

"¿De qué forma puede una infraestructura digital preservar el patrimonio cultural intangible en riesgo, usando las animitas como caso para registrar y mediar las experiencias y prácticas asociadas a sus dimensiones patrimoniales, espirituales y de memoria?"

Proyecto desarrollado en el contexto del Magíster de Innovación y Diseño, Universidad Adolfo Ibáñez
Equipo: Felipe Mandiola, Manuel Larraín y Vicente Pino

---

## Características principales

### 1. Mapa interactivo
- Visualización de animitas y capas territoriales.
- Iconografía basada en tipología, causa de muerte y roles sociales.
- Estilos centralizados (colores, iconos, leyendas).

### 2. Análisis GIS integrado
Incluye:
- Buffer
- Clip
- Intersect
- Spatial Join
- Heatmaps
- Rango de tamaños y colores basados en atributos

Los resultados se actualizan dinámicamente sobre el mapa.

### 3. Capas dinámicas
- Lista unificada de animitas, capas de contexto y elementos creados por búsqueda.
- Cada capa contiene:
  - Configuración de estilo
  - Componentes visuales (barras, histogramas, estadísticas)
  - Operaciones GIS propias
- Compatible con:
  - Overpass API
  - ArcGIS FeatureServer
  - GeoJSON y CSV externos

### 4. Componentes de visualización
Cada capa permite agregar elementos como:
- Bar charts (stackeadas por valor y pueden tener breakdowns por otros valores)
- Histogramas (puras barritas verticales en el eje y es conteo)
- Estadísticas agregadas

Configurables con atributos, agrupaciones y operaciones (count, sum, avg, etc.).

### 5. Búsqueda integrada
- Permite buscar calles, áreas, comunas, lugares o capas externas.
- Los resultados se agregan como elementos reutilizables para análisis GIS.
- Cada elemento tiene icono, color, visibilidad y opción de eliminación.
