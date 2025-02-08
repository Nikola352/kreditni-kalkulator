import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;

  let currentDbVersion =
    (
      await db.getFirstAsync<{
        user_version: number;
      }>("PRAGMA user_version")
    )?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
PRAGMA foreign_keys = ON;
CREATE TABLE loan_types (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE loan_options (
  id INTEGER PRIMARY KEY NOT NULL, 
  loanTypeId INTEGER NOT NULL,
  startAmount INTEGER NOT NULL,
  smallInterestRate REAL NOT NULL,
  largeInterestRate REAL NOT NULL,
  FOREIGN KEY (loanTypeId) REFERENCES loan_types (id) ON DELETE CASCADE
);
`);
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
