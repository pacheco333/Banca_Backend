import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'sql204.infinityfree.com',
  user: 'if0_40491480',          
  password: 'N41fdfo0V1NqI',           
  database: 'if0_40491480_banca_uno',
  //port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
