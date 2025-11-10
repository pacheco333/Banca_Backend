const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'Cajero123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('=====================================');
  console.log('NUEVO HASH PARA CONTRASEÑA');
  console.log('=====================================');
  console.log('Contraseña:', password);
  console.log('Hash generado:', hash);
  console.log('');
  console.log('SQL para actualizar:');
  console.log(`UPDATE usuarios SET contrasena = '${hash}' WHERE correo = 'maria.cajero@bancauno.com';`);
  console.log('');
  console.log('SQL para TODOS los usuarios:');
  console.log(`UPDATE usuarios SET contrasena = '${hash}';`);
  console.log('=====================================');
}

generarHash();
