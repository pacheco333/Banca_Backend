import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'banca-uno-santiago2006ortizp-5f86.b.aivencloud.com',
  user: 'avnadmin',          
  password: '',           
  database: 'defaultdb',
  port: 13730,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
