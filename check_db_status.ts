import Database from 'better-sqlite3';

const db = new Database('jobs.db');
const job = db.prepare('SELECT id, status, error FROM jobs ORDER BY createdAt DESC LIMIT 1;').get();
console.log(JSON.stringify(job, null, 2));
db.close();
