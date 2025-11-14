import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Cambia si usas otro usuario
  password: 'julian28257',           // Pon tu contraseña de MySQL aquí
  database: 'banca_uno_cris',
  // port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
 