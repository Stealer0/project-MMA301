import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from "react-native";
import axios from "axios";
import { db } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../components/CustomAlert";

const GEMINI_API_KEY = "AIzaSyBCDqMmDVolhpqtkIKbD8XwGB1IrpWwyvY";

export default function FortuneScreen() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const calculateNumber = (text) => {
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      sum += text.charCodeAt(i);
    }
    return sum % 100;
  };

  const askAI = async (number) => {
    const prompt = `
User asked: ${question}
Numerology number: ${number}

Bạn là một chuyên gia Thần số học huyền bí. Hãy viết một lời tiên tri ngắn gọn (khoảng 2-3 câu), súc tích, mang hơi hướm phép thuật và bí ẩn bằng tiếng Việt để giải đáp vấn đề của người dùng dựa trên con số này.
`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(
        "GEMINI API ERROR (Fortune):",
        error.response ? error.response.data : error.message,
      );
      return "Các vì sao đang mờ mịt, xin hãy thử lại sau.";
    }
  };

  const generate = async () => {
    if (!question.trim()) {
      showAlert(
        "Thiếu câu hỏi",
        "Vui lòng nhập câu hỏi của bạn để các vì sao dẫn lối!",
        "warning",
      );
      return;
    }

    const number = calculateNumber(question);
    setLoading(true);
    const message = await askAI(number);
    setLoading(false);
    setResult({ number, message });

    const date = new Date().toLocaleDateString();

    db.runSync(
      `INSERT INTO predictions (question,result_number,message,date) VALUES (?,?,?,?)`,
      [question, number, message, date],
    );

    db.runSync(`INSERT INTO number_logs (number,date) VALUES (?,?)`, [
      number,
      date,
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Ionicons
            name="sparkles"
            size={40}
            color="#CB9F42"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.title}>BÓI SỐ HUYỀN BÍ</Text>
          <Text style={styles.subtitle}>Kể cho tôi chuyện bạn gặp hôm nay</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Hôm nay bạn gặp chuyện gì? Ví dụ: Tôi gặp lại người yêu cũ ở quán cafe..."
            placeholderTextColor="#777"
            value={question}
            onChangeText={setQuestion}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#0A0910" />
          ) : (
            <>
              <Ionicons
                name="paper-plane-outline"
                size={20}
                color="#0A0910"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Khám phá con số</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBadge}>
              <Text style={styles.resultNumber}>
                {result.number.toString().padStart(2, "0")}
              </Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#110F19",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CB9F42",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A09EAD",
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#1B1924",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#332D41",
    marginBottom: 24,
    padding: 16,
  },
  textArea: {
    color: "#FFF",
    fontSize: 16,
    height: 120,
  },
  button: {
    width: "100%",
    backgroundColor: "#A88028",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#0A0910",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    width: "100%",
    marginTop: 40,
    backgroundColor: "#1B1924",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CB9F42",
  },
  resultBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0A0910",
    borderWidth: 2,
    borderColor: "#CB9F42",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -35,
  },
  resultNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#CB9F42",
  },
  resultMessage: {
    color: "#F0E6D2",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
