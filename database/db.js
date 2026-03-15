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
   db.execSync(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story TEXT,
      number INTEGER,
      meaning TEXT,
      date TEXT
    );
  `);

  // ⭐ tạo luôn bảng tarot
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tarot_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER,
      date TEXT
    );
  `);
  db.execSync(`
  CREATE TABLE IF NOT EXISTS weekly_insight (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numbers TEXT,
    insight TEXT,
    date TEXT
  );
  `);
  
};

export const insertStory = (story, number, meaning) => {

  db.runSync(
    "INSERT INTO history (story, number, meaning, date) VALUES (?, ?, ?, ?)",
    [story, number, meaning, new Date().toISOString()]
  );

};

export const getHistory = () => {

  return db.getAllSync(
    "SELECT * FROM history ORDER BY id DESC"
  );

};

export const getNumbersOnly = () => {

  return db.getAllSync(
    "SELECT number FROM history"
  );

};

export const insertWeeklyInsight = (numbers, insight) => {

  db.runSync(
    "INSERT INTO weekly_insight (numbers, insight, date) VALUES (?, ?, ?)",
    [
      numbers.join(","),
      insight,
      new Date().toISOString()
    ]
  );

};

export const getWeeklyHistory = () => {

  return db.getAllSync(
    "SELECT * FROM weekly_insight ORDER BY id DESC"
  );

};
export const resetTarotWeek = () => {
  db.runSync("DELETE FROM tarot_history");
};
export const deleteWeeklyInsight = (id) => {
  db.runSync(
    "DELETE FROM weekly_insight WHERE id = ?",
    [id]
  );
};

export const saveInsight = (insight) => {

  db.runSync(
    "INSERT INTO numerology_insight (insight, date) VALUES (?, ?)",
    [insight, new Date().toISOString()]
  );

};

export const getLatestInsight = () => {

  const result = db.getFirstSync(`
    SELECT insight
    FROM numerology_insight
    ORDER BY id DESC
    LIMIT 1
  `);

  return result?.insight || "";
};

export const deleteHistoryItem = (id) => {
  db.runSync("DELETE FROM history WHERE id = ?", [id]);
};