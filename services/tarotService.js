import { db } from "../database/db";

export const drawDailyCard = () => {





  const number = Math.floor(Math.random() * 9) + 1;

  const today = new Date().toISOString();

  db.runSync(
    "INSERT INTO tarot_history (number, date) VALUES (?, ?)",
    [number, today]
  );

  return number;

};

export const canUnlockWeekly = () => {

  const result = db.getAllSync(`
    SELECT date 
    FROM tarot_history 
    ORDER BY date DESC 
    LIMIT 7
  `);

  return result.length === 7;
};

// ✅ FIX: dùng subquery để lấy 7 cái mới nhất, rồi đảo lại ASC
// Trước: ORDER BY date DESC → [CN, T7, T6, T5, T4, T3, T2] — sai thứ tự
// Sau:   subquery DESC + outer ASC → [T2, T3, T4, T5, T6, T7, CN] — đúng
export const getLast7Cards = () => {

  const result = db.getAllSync(`
    SELECT number FROM (
      SELECT number, date
      FROM tarot_history
      ORDER BY date DESC
      LIMIT 7
    )
    ORDER BY date ASC
  `);

  return result.map(item => item.number);

};

export const resetTarotWeek = () => {
  db.runSync("DELETE FROM tarot_history");
};