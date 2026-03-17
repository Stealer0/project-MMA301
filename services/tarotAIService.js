import axios from "axios";

const API_KEY = "AIzaSyDXCGV6_o0xfaeRQTIhFA2hVdvyhW9eEuI";

export const getTarotInsight = async (cardTitle, meaning) => {

  const prompt = `
Bạn là một reader Tarot.

Người dùng rút được lá bài:
${cardTitle}

Ý nghĩa cơ bản:
${meaning}

Hãy viết một lời giải thích tarot ngắn gọn cho hôm nay.
- Giọng văn tích cực
- 3 câu
- Tiếng Việt
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
    console.log(error);
    return "Không thể tạo AI insight.";
  }
};