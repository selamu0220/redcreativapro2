# Sistema de Gestión de Documentos - API Documentation

Este sistema permite a los usuarios crear, organizar y gestionar sus documentos generados por IA en carpetas.

## Estructura de Datos

### DocumentData
```typescript
interface DocumentData {
  id: string;                    // ID único del documento
  title: string;                 // Título del documento
  content: string;               // Contenido del documento
  userEmail: string;             // Email del usuario propietario
  folderId?: string;             // ID de la carpeta (opcional, null = raíz)
  createdAt: string;             // Fecha de creación (ISO string)
  updatedAt: string;             // Fecha de última actualización
  type: 'escritor-ia' | 'correos-ia' | 'prompts' | 'other'; // Tipo de documento
}
```

### FolderData
```typescript
interface FolderData {
  id: string;                    // ID único de la carpeta
  name: string;                  // Nombre de la carpeta
  userEmail: string;             // Email del usuario propietario
  parentFolderId?: string;       // ID de la carpeta padre (opcional, null = raíz)
  createdAt: string;             // Fecha de creación
  updatedAt: string;             // Fecha de última actualización
}
```

## APIs de Documentos

### GET /api/documents
Obtiene los documentos del usuario.

**Parámetros de consulta:**
- `email` (requerido): Email del usuario
- `folderId` (opcional): ID de la carpeta específica

**Ejemplo:**
```bash
GET /api/documents?email=usuario@ejemplo.com&folderId=folder_123
```

**Respuesta:**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "title": "Mi Documento",
      "content": "Contenido del documento...",
      "userEmail": "usuario@ejemplo.com",
      "folderId": "folder_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "type": "escritor-ia"
    }
  ]
}
```

### POST /api/documents
Crea un nuevo documento.

**Cuerpo de la petición:**
```json
{
  "title": "Título del documento",
  "content": "Contenido del documento",
  "userEmail": "usuario@ejemplo.com",
  "folderId": "folder_123", // opcional
  "type": "escritor-ia"
}
```

### PUT /api/documents
Actualiza un documento existente.

**Cuerpo de la petición:**
```json
{
  "id": "doc_123",
  "title": "Nuevo título", // opcional
  "content": "Nuevo contenido", // opcional
  "folderId": "nueva_carpeta" // opcional
}
```

### DELETE /api/documents
Elimina un documento.

**Parámetros de consulta:**
- `id` (requerido): ID del documento

**Ejemplo:**
```bash
DELETE /api/documents?id=doc_123
```

### GET /api/documents/[id]
Obtiene un documento específico por ID.

**Ejemplo:**
```bash
GET /api/documents/doc_123
```

## APIs de Carpetas

### GET /api/folders
Obtiene las carpetas del usuario.

**Parámetros de consulta:**
- `email` (requerido): Email del usuario
- `parentFolderId` (opcional): ID de la carpeta padre
- `includeStructure` (opcional): Si es 'true', incluye documentos en la respuesta

**Ejemplo con estructura completa:**
```bash
GET /api/folders?email=usuario@ejemplo.com&includeStructure=true
```

**Respuesta con estructura:**
```json
{
  "folders": [
    {
      "id": "folder_123",
      "name": "Mis Documentos",
      "userEmail": "usuario@ejemplo.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "documents": [
    {
      "id": "doc_123",
      "title": "Documento en raíz",
      "content": "...",
      "userEmail": "usuario@ejemplo.com",
      "type": "escritor-ia",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/folders
Crea una nueva carpeta.

**Cuerpo de la petición:**
```json
{
  "name": "Nueva Carpeta",
  "userEmail": "usuario@ejemplo.com",
  "parentFolderId": "folder_parent" // opcional
}
```

### PUT /api/folders
Actualiza una carpeta existente.

**Cuerpo de la petición:**
```json
{
  "id": "folder_123",
  "name": "Nuevo nombre", // opcional
  "parentFolderId": "nueva_carpeta_padre" // opcional
}
```

### DELETE /api/folders
Elimina una carpeta y todo su contenido.

**Parámetros de consulta:**
- `id` (requerido): ID de la carpeta

**Ejemplo:**
```bash
DELETE /api/folders?id=folder_123
```

**Nota:** Al eliminar una carpeta, se eliminan automáticamente:
- Todos los documentos dentro de la carpeta
- Todas las subcarpetas y su contenido (recursivamente)

### GET /api/folders/[id]
Obtiene una carpeta específica por ID.

**Ejemplo:**
```bash
GET /api/folders/folder_123
```

## Ejemplos de Uso

### 1. Crear una carpeta y un documento
```javascript
// 1. Crear carpeta
const folderResponse = await fetch('/api/folders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Mis Textos de IA',
    userEmail: 'usuario@ejemplo.com'
  })
});
const { folder } = await folderResponse.json();

// 2. Crear documento en la carpeta
const docResponse = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Artículo sobre IA',
    content: 'La inteligencia artificial está transformando...',
    userEmail: 'usuario@ejemplo.com',
    folderId: folder.id,
    type: 'escritor-ia'
  })
});
```

### 2. Obtener estructura completa del usuario
```javascript
const response = await fetch('/api/folders?email=usuario@ejemplo.com&includeStructure=true');
const { folders, documents } = await response.json();

console.log('Carpetas en raíz:', folders);
console.log('Documentos en raíz:', documents);
```

### 3. Mover un documento a otra carpeta
```javascript
const response = await fetch('/api/documents', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'doc_123',
    folderId: 'nueva_carpeta_id'
  })
});
```

## Archivos de Datos

El sistema utiliza archivos JSON para almacenar los datos:
- `data/documents.json`: Almacena todos los documentos
- `data/folders.json`: Almacena todas las carpetas
- `data/users.json`: Datos de usuarios (existente)
- `data/usage.json`: Estadísticas de uso (existente)

## Características del Sistema

1. **Organización jerárquica**: Carpetas pueden contener subcarpetas
2. **Eliminación en cascada**: Al eliminar una carpeta se elimina todo su contenido
3. **Filtrado por usuario**: Cada usuario solo ve sus propios documentos y carpetas
4. **Tipos de documento**: Clasificación automática según el origen (escritor-ia, correos-ia, etc.)
5. **Timestamps**: Seguimiento de creación y modificación
6. **IDs únicos**: Generación automática de identificadores únicos