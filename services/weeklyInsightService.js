import axios from "axios";
import { getLast7Cards } from "./tarotService";

const API_KEY = "AIzaSyBO6FUddg8-igheSY_6NhvKAPyYc9H45YQ";

export const getWeeklyInsight = async () => {

  const numbers = getLast7Cards();

  if (numbers.length < 7) {
    return "Bạn cần rút bài đủ 7 ngày để xem báo cáo tuần.";

  }

  const prompt = `
Bạn là chuyên gia Thần Số Học.

Người dùng đã rút các con số tarot numerology trong 7 ngày:
${numbers.join(", ")}

Hãy phân tích:
- Xu hướng năng lượng của tuần
- Con số nổi bật nhất
- Lời khuyên cho tuần tới

Trả lời bằng tiếng Việt trong 3-4 câu.
`;

  try {

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {

  console.log("status:", error.response?.status);
  console.log("data:", error.response?.data);
  console.log("message:", error.message);

  return "Không thể phân tích tuần này.";

}

};