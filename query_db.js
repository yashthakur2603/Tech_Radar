import Database from 'better-sqlite3';
import fs from 'fs';
const db = new Database('./jobs.db');
const rows = db.prepare('SELECT id, status, createdAt, updatedAt, error FROM jobs').all();
let out = '';
rows.forEach(r => {
    out += `ID: ${r.id}, Status: ${r.status}\n`;
    out += `Created: ${r.createdAt}\n`;
    out += `Updated: ${r.updatedAt}\n`;
    if (r.error) out += `Error: ${r.error.substring(0, 100)}...\n`;
    out += '---\n';
});
fs.writeFileSync('db_output_utf8.txt', out, 'utf-8');
