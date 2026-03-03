import Database from 'better-sqlite3';
const db = new Database('./jobs.db');
const rows = db.prepare('SELECT id, status, createdAt FROM jobs').all();
console.log(JSON.stringify(rows, null, 2));
