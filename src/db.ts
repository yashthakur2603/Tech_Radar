import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'jobs.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    cvContent TEXT NOT NULL,
    targetRole TEXT NOT NULL,
    result TEXT, -- JSON string
    error TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(jobId) REFERENCES jobs(id)
  );
`);

export interface Job {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    cvContent: string;
    targetRole: string;
    result: string | null;
    error: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    jobId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const createJob = (id: string, cvContent: string, targetRole: string) => {
    const stmt = db.prepare('INSERT INTO jobs (id, status, cvContent, targetRole) VALUES (?, ?, ?, ?)');
    stmt.run(id, 'pending', cvContent, targetRole);
};

export const updateJobStatus = (id: string, status: string, result: string | null = null, error: string | null = null) => {
    const stmt = db.prepare('UPDATE jobs SET status = ?, result = ?, error = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, result, error, id);
};

export const getJob = (id: string): Job | undefined => {
    const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
    return stmt.get(id) as Job | undefined;
};

export const getPendingJobs = (): Job[] => {
    const stmt = db.prepare("SELECT * FROM jobs WHERE status = 'pending' ORDER BY createdAt ASC");
    return stmt.all() as Job[];
};

export const createNotification = (id: string, jobId: string, message: string) => {
    const stmt = db.prepare('INSERT INTO notifications (id, jobId, message) VALUES (?, ?, ?)');
    stmt.run(id, jobId, message);
};

export const getUnreadNotifications = (): Notification[] => {
    const stmt = db.prepare("SELECT * FROM notifications WHERE isRead = 0 ORDER BY createdAt DESC");
    return stmt.all() as Notification[];
};

export const markNotificationsRead = () => {
    const stmt = db.prepare('UPDATE notifications SET isRead = 1 WHERE isRead = 0');
    stmt.run();
};

export default db;
