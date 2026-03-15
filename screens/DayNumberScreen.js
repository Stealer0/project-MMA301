import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import axios from "axios";
import { db } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import CustomAlert from "../components/CustomAlert";

const GEMINI_API_KEY = "AIzaSyAFnPQG-5RcxmdOMeS0riHD2cwFbz3JRDk";

export default function DayNumberScreen({ navigation }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [lifePathNumber, setLifePathNumber] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      checkUserAndGenerate();
    }
  }, [isFocused]);

  const calculateLifePath = (d, m, y) => {
    const sumDigits = (num) =>
      num
        .toString()
        .split("")
        .reduce((acc, val) => acc + parseInt(val), 0);
    let total = sumDigits(d) + sumDigits(m) + sumDigits(y);
    while (total > 11 && total !== 22) {
      total = sumDigits(total);
    }
    return total;
  };

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const checkUserAndGenerate = () => {
    const u = db.getFirstSync(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);

    // If user changed or not yet loaded
    if (
      u &&
      (!user ||
        u.birth_day !== user.birth_day ||
        u.birth_month !== user.birth_month ||
        u.birth_year !== user.birth_year)
    ) {
      setUser(u);
      const lp = calculateLifePath(u.birth_day, u.birth_month, u.birth_year);
      setLifePathNumber(lp);
      setResult(null); // Clear previous result to regenerate
      generate(u, lp);
    } else if (!u) {
      setUser(null);
    } else {
      setUser(u);
    }
  };

  const generate = async (currentUser, lpNum) => {
    const prompt = `
User name: ${currentUser.name}
Birth date: ${currentUser.birth_day}/${currentUser.birth_month}/${currentUser.birth_year}
Life Path Number: ${lpNum}

Đóng vai chuyên gia thần số học và chiêm tinh học. Hãy trả về CHỈ MỘT CHUỖI JSON ĐỊNH DẠNG SAU (không chứa code block \`\`\`json, chỉ chuỗi thô):
{
  "zodiac": "Tên Cung Hoàng Đạo (ví dụ: Xử Nữ)",
  "element": "Nguyên tố (ví dụ: Cung Đất)",
  "dateRange": "Khoảng thời gian (ví dụ: 23/08 - 22/09)",
  "zodiacTraits": ["Tính từ 1", "Tính từ 2", "Tính từ 3"],
  "luckyNumbers": [Số1, Số2, Số3, Số4],
  "luckyMessage": "1 câu ngắn gọn về lời khuyên hôm nay",
  "lifePathTitle": "DANH XƯNG CỦA SỐ CHỦ ĐẠO (VD: NGƯỜI LÃNH ĐẠO)",
  "lifePathTraits": ["Tính từ 1", "Tính từ 2", "Tính từ 3"],
  "lifePathMessage": "1 câu mô tả ngắn về đặc điểm của con số chủ đạo này"
}
`;

    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          },
        },
      );

      let text = response.data.candidates[0].content.parts[0].text;
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const data = JSON.parse(text);
      setResult(data);
    } catch (error) {
      console.error(
        "GEMINI API ERROR (DayNumber):",
        error.response ? error.response.data : error.message,
      );
      showAlert(
        "Lỗi kết nối",
        "Lỗi khi kết nối với các vì sao. Vui lòng thử lại sau.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="person-circle-outline"
          size={60}
          color="#332D41"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.emptyTitle}>Chưa có thông tin</Text>
        <Text style={styles.emptySub}>
          Vui lòng điền thông tin ở mục Hồ sơ trước khi xem Số chủ đạo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="star-outline"
          size={40}
          color="#CB9F42"
          style={{ marginBottom: 10 }}
        />
        <Text style={styles.title}>SỐ CHỦ ĐẠO</Text>
        <Text style={styles.subtitle}>
          Dựa trên ngày sinh: {user.birth_day.toString().padStart(2, "0")}/
          {user.birth_month.toString().padStart(2, "0")}/{user.birth_year}
        </Text>
      </View>

      {/* Navigation to sub-screen */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => navigation.navigate('Fortune')}
        >
          <Ionicons name="home-outline" size={20} color="#0A0910" />
          <Text style={styles.navBtnText}>Bói Số Huyền Bí</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#CB9F42" />
          <Text style={{ color: "#A09EAD", marginTop: 16 }}>
            Đang kết nối với vũ trụ...
          </Text>
        </View>
      ) : result ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Zodiac Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.zodiacIconCircle}>
                <Text style={styles.zodiacIconText}>
                  {result.zodiac.charAt(0)}
                </Text>
              </View>
              <View style={styles.zodiacInfo}>
                <Text style={styles.cardTitle}>{result.zodiac}</Text>
                <Text style={styles.cardSubtitle}>
                  {result.element} • {result.dateRange}
                </Text>
              </View>
            </View>
            <View style={styles.traitsRow}>
              {result.zodiacTraits.map((trait, idx) => (
                <View key={idx} style={styles.traitBadge}>
                  <Text style={styles.traitText}>#{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Lucky Numbers Card */}
          <View style={styles.card}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="moon-outline" size={24} color="#CB9F42" />
              <Text
                style={[
                  styles.cardTitle,
                  { marginLeft: 10, textTransform: "uppercase" },
                ]}
              >
                Số May Mắn Hôm Nay
              </Text>
            </View>
            <View style={styles.luckyNumbersRow}>
              {result.luckyNumbers.map((num, idx) => (
                <View key={idx} style={styles.luckyCircleBorder}>
                  <View style={styles.luckyCircle}>
                    <Text style={styles.luckyNumberText}>{num}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.luckyMessage}>{result.luckyMessage}</Text>
          </View>

          {/* Life Path Card */}
          <View style={[styles.card, { marginBottom: 40 }]}>
            <View style={styles.lifePathRow}>
              <View style={styles.lifePathBadge}>
                <Text style={styles.lifePathBadgeText}>#{lifePathNumber}</Text>
              </View>
              <View style={styles.lifePathInfo}>
                <Text
                  style={[styles.cardTitle, { textTransform: "uppercase" }]}
                >
                  {result.lifePathTitle}
                </Text>
                <Text style={styles.cardSubtitle}>Con số chủ đạo cuộc đời</Text>
              </View>
            </View>
            {result.lifePathTraits && (
              <View style={[styles.traitsRow, { marginBottom: 16 }]}>
                {result.lifePathTraits.map((trait, idx) => (
                  <View key={idx} style={styles.traitBadge}>
                    <Text style={styles.traitText}>#{trait}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.luckyMessage}>{result.lifePathMessage}</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => generate(user, lifePathNumber)}
          >
            <Ionicons name="refresh" size={20} color="#0A0910" />
            <Text style={styles.retryButtonText}>Xem lại số của tôi</Text>
          </TouchableOpacity>
        </View>
      )}

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
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "#CB9F42",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySub: {
    color: "#A09EAD",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#CB9F42",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A09EAD",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#1B1924",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#332D41",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  zodiacIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2A3C24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#82C974",
  },
  zodiacIconText: {
    fontSize: 28,
    color: "#82C974",
    fontWeight: "bold",
  },
  zodiacInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EFEFEF",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#A09EAD",
  },
  traitsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  traitBadge: {
    backgroundColor: "#262233",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  traitText: {
    color: "#A09EAD",
    fontSize: 12,
    fontWeight: "500",
  },
  luckyNumbersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  luckyCircleBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(203, 159, 66, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(203, 159, 66, 0.3)",
  },
  luckyCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2B2519",
    justifyContent: "center",
    alignItems: "center",
  },
  luckyNumberText: {
    color: "#CB9F42",
    fontSize: 20,
    fontWeight: "bold",
  },
  luckyMessage: {
    color: "#EFEFEF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  lifePathRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lifePathBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#2B2519",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#CB9F42",
  },
  lifePathBadgeText: {
    color: "#CB9F42",
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  lifePathInfo: {
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#CB9F42",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#0A0910",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  navBtn: { 
    backgroundColor: '#CB9F42', 
    borderRadius: 12, 
    padding: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  navBtnText: { 
    color: '#0A0910', 
    fontWeight: 'bold', 
    marginLeft: 8, 
    fontSize: 15 
  }
});
