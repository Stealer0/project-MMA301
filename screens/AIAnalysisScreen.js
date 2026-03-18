import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/db';
import axios from 'axios';
import { isValidDate } from '../utils/validation';

const GEMINI_API_KEY = "AIzaSyA753PGSAHkZJ-lSmXJOZ9LeSGuNIpIfT8";

const letterToNumber = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

const reduceToSingleDigit = (num) => {
  if (!num) return 0;
  let currentNum = parseInt(num, 10);
  while (currentNum > 9) {
    currentNum = currentNum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return currentNum;
};

const calculateNumbers = (name, day, month, year) => {
  const dStr = day.toString();
  const mStr = month.toString();
  const yStr = year.toString();

  // 1. Birthday Number
  const birthday = reduceToSingleDigit(day);

  // 2. Life Path Number
  const lpSum = dStr.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
    mStr.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
    yStr.split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const lifePath = reduceToSingleDigit(lpSum);

  // 4. Destiny Number (calculate 4 first because 3 needs it)
  let dsSum = 0;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  for (let char of cleanName) {
    if (letterToNumber[char]) dsSum += letterToNumber[char];
  }
  const destiny = reduceToSingleDigit(dsSum);

  // 3. Maturity Number
  const maturity = reduceToSingleDigit(lifePath + destiny);

  // 5. Attitude Number
  const attitude = reduceToSingleDigit(parseInt(day) + parseInt(month));

  // 6. Balance Number
  let balSum = 0;
  const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  words.forEach(word => {
    const firstChar = word[0];
    if (letterToNumber[firstChar]) balSum += letterToNumber[firstChar];
  });
  const balance = reduceToSingleDigit(balSum);

  return { birthday, lifePath, maturity, destiny, attitude, balance };
};

const AIAnalysisScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là AI Chuyên gia Thần Số Học. Hãy cho tôi biết ngày sinh và tên đầy đủ của bạn để tôi có thể phân tích chi tiết về con số của bạn.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: true
    }
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const result = db.getAllSync('SELECT * FROM users ORDER BY id DESC LIMIT 1');
      if (result.length > 0) {
        const user = result[0];
        if (user.birth_day) setDay(user.birth_day.toString().padStart(2, '0'));
        if (user.birth_month) setMonth(user.birth_month.toString().padStart(2, '0'));
        if (user.birth_year) setYear(user.birth_year.toString());
        if (user.name) setName(user.name);
      }
    } catch (e) {
      console.log('Error loading user data', e);
    }
  };

  const askGemini = async (prompt) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("GEMINI API ERROR:", error);
      return "Xin lỗi, hiện tại tôi đang gặp khó khăn khi kết nối với các vì sao. Vui lòng thử lại sau.";
    }
  };

  const handleAnalyze = async () => {
    if (!name || !day || !month || !year) {
      alert("Vui lòng nhập đầy đủ Tên và Ngày sinh");
      return;
    }

    if (!isValidDate(day, month, year)) {
      alert("Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      db.runSync(
        'INSERT INTO users (name, birth_day, birth_month, birth_year) VALUES (?, ?, ?, ?)',
        [name, parseInt(day), parseInt(month), parseInt(year)]
      );
    } catch (e) {
      console.log('Error saving user data', e);
    }

    setIsLoading(true);

    const calculatedNumbers = calculateNumbers(name, day, month, year);

    const todayDate = new Date().toLocaleDateString('vi-VN');
    const prompt = `Bạn là một chuyên gia Thần số học chuyên nghiệp, thấu hiểu sâu sắc và có khả năng giải thích dễ hiểu.
    Tôi có một khách hàng tên là ${name}, sinh ngày ${day}/${month}/${year}.
    Ngày hôm nay là: ${todayDate}.
    
    Hãy phân tích chi tiết các chỉ số thần số học của họ:
    - Số Đường Đời: ${calculatedNumbers.lifePath}
    - Số Vận Mệnh: ${calculatedNumbers.destiny}
    - Số Trưởng Thành: ${calculatedNumbers.maturity}
    - Số Thái Độ: ${calculatedNumbers.attitude}
    - Số Cân Bằng: ${calculatedNumbers.balance}
    - Số Ngày Sinh: ${calculatedNumbers.birthday}
    
    Yêu cầu phân tích:
    1. Đưa ra tổng quan về tính cách, điểm mạnh, điểm yếu dựa trên sự kết hợp của các con số này.
    2. Tập trung vào số đường đời và số vận mệnh là 2 chỉ số quan trọng nhất.
    3. Trình bày dạng các đoạn văn ngắn gọn, dễ đọc, mạch lạc (không quá dài dòng). 
    4. Đặc biệt: Hãy kết hợp với năng lượng của ngày hôm nay (${todayDate}) để đưa ra lời khuyên cụ thể và truyền cảm hứng nhất cho tôi ngay lúc này.
    
    Vui lòng viết bằng tiếng Việt, giọng điệu ấm áp, đồng cảm và truyền cảm hứng.`;

    const aiResponse = await askGemini(prompt);

    setIsLoading(false);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#CB9F42" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CHUYÊN GIA AI</Text>
        </View>

        {/* Card: Thông Tin Của Bạn */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Thông Tin Của Bạn</Text>
          </View>
          <Text style={styles.cardSubtitle}>Nhập thông tin để AI phân tích chi tiết</Text>

          <View style={styles.singleInputWrapper}>
            <Text style={styles.inputLabel}>Họ và Tên Đầy Đủ</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="VD: Nguyễn Văn A"
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>Ngày</Text>
              <TextInput style={styles.input} placeholderTextColor="#777" placeholder="31" value={day} onChangeText={setDay} keyboardType="numeric" />
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>Tháng</Text>
              <TextInput style={styles.input} placeholderTextColor="#777" placeholder="12" value={month} onChangeText={setMonth} keyboardType="numeric" />
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.inputLabel}>Năm</Text>
              <TextInput style={styles.input} placeholderTextColor="#777" placeholder="1990" value={year} onChangeText={setYear} keyboardType="numeric" />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.calcBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0A0910" />
            ) : (
              <Text style={styles.calcBtnText}>Phân Tích Bằng AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Card: Phân Tích AI */}
        <View style={styles.cardChat}>
          <Text style={styles.chatTitle}>Phân Tích AI</Text>
          <Text style={styles.chatSubtitle}>Trò chuyện với AI chuyên gia thần số học</Text>

          <View style={styles.chatContainer}>
            {messages.map((msg) => (
              <View key={msg.id} style={styles.messageRow}>
                {msg.isAi && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="planet" size={16} color="#0A0910" />
                  </View>
                )}
                <View style={[styles.messageBubble, msg.isAi ? styles.messageBubbleAi : styles.messageBubbleUser]}>
                  <Text style={[styles.messageText, !msg.isAi && { color: '#FFF' }]}>{msg.text}</Text>
                  <Text style={[styles.messageTime, !msg.isAi && { color: '#BBB' }]}>{msg.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#110F19',
  },
  container: {
    padding: 16,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CB9F42',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardInfo: {
    backgroundColor: '#1B1924',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#332D41',
  },
  cardChat: {
    backgroundColor: '#1B1924',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#332D41',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#CB9F42',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#A09EAD',
    marginBottom: 20,
  },
  singleInputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  inputFull: {
    backgroundColor: '#110F19',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#332D41',
    color: '#FFF',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateInputWrapper: {
    width: '31%',
  },
  input: {
    backgroundColor: '#110F19',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#332D41',
    color: '#FFF',
  },
  calcBtn: {
    backgroundColor: '#A88028',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcBtnText: {
    color: '#0A0910',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CB9F42',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#A09EAD',
    marginBottom: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CB9F42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 16,
  },
  messageBubbleAi: {
    backgroundColor: '#2A263D', // Lighter purple-dark for bot
    borderTopLeftRadius: 4,
  },
  messageBubbleUser: {
    backgroundColor: '#3F51B5', // A blueish accent for user
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    color: '#F0E6D2',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    alignSelf: 'flex-start',
  }
});

export default AIAnalysisScreen;
