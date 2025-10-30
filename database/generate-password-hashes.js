/**
 * Script para generar hashes de contraseñas con bcrypt
 * Ejecutar con: node database/generate-password-hashes.js
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const password = '1234';

async function generateHash() {
  try {
    console.log('Generando hash de contraseña...\n');
    console.log(`Contraseña: "${password}"`);
    console.log(`Salt rounds: ${SALT_ROUNDS}\n`);

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    console.log('Hash generado:');
    console.log(hash);
    console.log('\n📋 Copia este hash y reemplázalo en el archivo:');
    console.log('database/init/01-seed-data.sql');
    console.log('\nBusca: $2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq');
    console.log(`Reemplaza con: ${hash}`);

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log(`\n✅ Verificación: ${isValid ? 'Hash válido' : 'Hash inválido'}`);

  } catch (error) {
    console.error('❌ Error al generar hash:', error);
  }
}

generateHash();
