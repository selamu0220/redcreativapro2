
import { kv } from '@vercel/kv';
import { Pool } from 'pg';

// Un caché para mantener los pools de conexiones de base de datos activos.
// La clave es el userId, el valor es el objeto Pool.
const connectionPools = new Map<string, Pool>();

/**
 * Recupera un pool de conexiones de base de datos para un usuario específico.
 *
 * Primero intenta encontrar un pool existente en el caché. Si no lo encuentra,
 * obtiene la cadena de conexión de la base de datos del usuario desde Vercel KV,
 * crea un nuevo pool de conexiones con ella y la almacena en el caché
 * para futuras solicitudes.
 *
 * @param userId - El ID del usuario para quien se obtiene la conexión a la base de datos.
 * @returns Una promesa que se resuelve en un objeto pg.Pool.
 * @throws Un error si no se encuentra la configuración de la base de datos del usuario.
 */
export async function getDbConnection(userId: string): Promise<Pool> {
  // 1. Comprobar si ya existe un pool de conexiones para este usuario.
  if (connectionPools.has(userId)) {
    return connectionPools.get(userId)!;
  }

  // 2. Si no, obtener la cadena de conexión de la base de datos desde Vercel KV.
  // Se espera que la clave en KV sea `db:user:<userId>`.
  const connectionString = await kv.get<string>(`db:user:${userId}`);

  if (!connectionString) {
    throw new Error(`Configuration de base de données pour l'utilisateur ${userId} non trouvée.`);
  }

  // 3. Crear un nuevo pool de conexiones.
  const pool = new Pool({
    connectionString,
    // Configuraciones recomendadas para entornos sin servidor
    max: 1,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });

  // 4. Almacenar el nuevo pool en el caché.
  connectionPools.set(userId, pool);

  return pool;
}
