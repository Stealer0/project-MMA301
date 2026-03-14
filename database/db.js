import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("numerology.db");

export const initDB = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      birth_day INTEGER,
      birth_month INTEGER,
      birth_year INTEGER
    );`
  );

  db.execSync(
    `CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      result_number INTEGER,
      message TEXT,
      date TEXT
    );`
  );

  db.execSync(
    `CREATE TABLE IF NOT EXISTS number_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER,
      date TEXT
    );`
  );
};