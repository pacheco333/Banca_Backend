const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'Cajero123';
  
  // Hash que está en la BD (del SQL que te di)
  const hashEnBD = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  
  console.log('=====================================');
  console.log('TEST DE CONTRASEÑA');
  console.log('=====================================');
  console.log('Contraseña a probar:', password);
  console.log('Hash en BD:', hashEnBD);
  console.log('');
  
  const resultado = await bcrypt.compare(password, hashEnBD);
  
  if (resultado) {
    console.log('✅ LA CONTRASEÑA ES CORRECTA');
    console.log('El hash en la BD coincide con "Cajero123"');
  } else {
    console.log('❌ LA CONTRASEÑA NO COINCIDE');
    console.log('El hash en la BD NO es válido para "Cajero123"');
    console.log('');
    console.log('Generando nuevo hash...');
    const nuevoHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash:', nuevoHash);
    console.log('');
    console.log('SQL para actualizar:');
    console.log(`UPDATE usuarios SET contrasena = '${nuevoHash}' WHERE correo = 'maria.cajero@bancauno.com';`);
  }
  console.log('=====================================');
}

testPassword();
