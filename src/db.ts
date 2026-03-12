import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'jobs.db');
const db = new Database(dbPath);

// Initialize tables
// The workers/job queues have been deprecated in favor of synchronous real-time requests.
// Keeping an empty initialization routine if we need to add persistence later.
db.exec(`
    -- Database table definitions have been removed for the background worker system
`);

export default db;
