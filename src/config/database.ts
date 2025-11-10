import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Cambia si usas otro usuario
  password: 'bura12325',           // Pon tu contraseña de MySQL aquí
  database: 'banca_uno',
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
