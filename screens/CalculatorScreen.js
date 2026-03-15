import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../database/db';
import { numerologyNames, numerologyMeaning } from '../utils/numerologyData';
import { isValidDate } from '../utils/validation';

const reduceToSingleDigit = (num) => {
  if (!num) return 0;
  let currentNum = parseInt(num, 10);
  while (currentNum > 9) {
    currentNum = currentNum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return currentNum;
};

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

const CalculatorScreen = ({ navigation }) => {
  // Common states
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [name, setName] = useState('');

  // Results
  const [birthdayNumber, setBirthdayNumber] = useState(null);
  const [lifePathNumber, setLifePathNumber] = useState(null);
  const [destinyNumber, setDestinyNumber] = useState(null);
  const [maturityNumber, setMaturityNumber] = useState(null);
  const [attitudeNumber, setAttitudeNumber] = useState(null);
  const [balanceNumber, setBalanceNumber] = useState(null);
  const [personalYearNumber, setPersonalYearNumber] = useState(null);
  const [personalDayNumber, setPersonalDayNumber] = useState(null);

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

  const saveUserData = () => {
    try {
      db.runSync(
        'INSERT INTO users (name, birth_day, birth_month, birth_year) VALUES (?, ?, ?, ?)',
        [name, parseInt(day) || 1, parseInt(month) || 1, parseInt(year) || 2000]
      );
    } catch (e) {
      console.log('Error saving user data', e);
    }
  };

  const calculateBirthday = () => {
    if (!day) return Alert.alert("Lỗi", "Vui lòng nhập Ngày sinh");
    if (parseInt(day) < 1 || parseInt(day) > 31) return Alert.alert("Lỗi", "Ngày sinh không hợp lệ");
    const result = reduceToSingleDigit(day);
    setBirthdayNumber(result);
    saveUserData();
  };

  const calculateLifePath = () => {
    if (!day || !month || !year) return Alert.alert("Lỗi", "Vui lòng nhập Ngày, Tháng, Năm sinh");
    if (!isValidDate(day, month, year)) return Alert.alert("Lỗi", "Ngày sinh không hợp lệ");
    const sum = day.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      month.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      year.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    setLifePathNumber(reduceToSingleDigit(sum));
    saveUserData();
  };

  const calculateDestiny = () => {
    if (!name) return Alert.alert("Lỗi", "Vui lòng nhập Họ Tên đầy đủ");
    let sum = 0;
    for (let char of name.toLowerCase().replace(/[^a-z]/g, '')) {
      if (letterToNumber[char]) sum += letterToNumber[char];
    }
    setDestinyNumber(reduceToSingleDigit(sum));
    saveUserData();
  };

  const calculateMaturity = () => {
    if (!day || !month || !year || !name) return Alert.alert("Lỗi", "Nhập đủ Ngày, Tháng, Năm sinh và Họ tên!");

    const lpSum = day.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      month.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      year.split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const lp = reduceToSingleDigit(lpSum);

    let dsSum = 0;
    for (let char of name.toLowerCase().replace(/[^a-z]/g, '')) {
      if (letterToNumber[char]) dsSum += letterToNumber[char];
    }
    const ds = reduceToSingleDigit(dsSum);

    setMaturityNumber(reduceToSingleDigit(lp + ds));
    saveUserData();
  };

  const calculateAttitude = () => {
    if (!day || !month) return Alert.alert("Lỗi", "Vui lòng nhập Ngày và Tháng sinh");
    const at = parseInt(day, 10) + parseInt(month, 10);
    setAttitudeNumber(reduceToSingleDigit(at));
    saveUserData();
  };

  const calculateBalance = () => {
    if (!name) return Alert.alert("Lỗi", "Vui lòng nhập Họ tên đầy đủ");
    let balSum = 0;
    const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    words.forEach(word => {
      const firstChar = word[0];
      if (letterToNumber[firstChar]) balSum += letterToNumber[firstChar];
    });
    setBalanceNumber(reduceToSingleDigit(balSum));
    saveUserData();
  };

  const calculatePersonal = () => {
    if (!day || !month) return Alert.alert("Lỗi", "Vui lòng nhập Ngày và Tháng sinh");

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const currentDay = today.getDate();

    // Personal Year = Day + Month + Current Year
    const pySum = day.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      month.split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      currentYear.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const py = reduceToSingleDigit(pySum);
    setPersonalYearNumber(py);

    // Personal Day = Personal Year + Today Day + Today Month
    const pdSum = py +
      currentDay.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0) +
      currentMonth.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    setPersonalDayNumber(reduceToSingleDigit(pdSum));
    saveUserData();
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Navigation to sub-screens */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('AIAnalysis')}>
            <Ionicons name="planet-outline" size={20} color="#0A0910" />
            <Text style={styles.navBtnText}>Chuyên Gia AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('NumberTable')}>
            <Ionicons name="pencil-outline" size={20} color="#0A0910" />
            <Text style={styles.navBtnText}>Ghi Chú</Text>
          </TouchableOpacity>
        </View>

        {/* Card: Số Ngày Sinh */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Ngày Sinh</Text>
          </View>
          <Text style={styles.cardSubtitle}>Con số tiết lộ năng khiếu và kỹ năng bạn mang theo khi chào đời</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput style={styles.input} placeholderTextColor="#777" placeholder="VD: 31" value={day} onChangeText={setDay} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateBirthday}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {birthdayNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {birthdayNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {birthdayNumber} - {numerologyNames[birthdayNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.birthday[birthdayNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Đường Đời */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Đường Đời</Text>
          </View>
          <Text style={styles.cardSubtitle}>Con số này tiết lộ sứ mệnh và hành trình cuộc đời của bạn</Text>
          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Ngày</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="31" value={day} onChangeText={setDay} keyboardType="numeric" /></View>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Tháng</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="12" value={month} onChangeText={setMonth} keyboardType="numeric" /></View>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Năm</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="2003" value={year} onChangeText={setYear} keyboardType="numeric" /></View>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateLifePath}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {lifePathNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {lifePathNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {lifePathNumber} - {numerologyNames[lifePathNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.lifePath[lifePathNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Vận Mệnh */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Vận Mệnh</Text>
          </View>
          <Text style={styles.cardSubtitle}>Thể hiện tài năng bẩm sinh và những gì bạn được định sẵn để làm</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Họ và Tên Đầy Đủ</Text>
            <TextInput style={styles.input} placeholderTextColor="#777" placeholder="VD: Nguyễn Văn A" value={name} onChangeText={setName} />
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateDestiny}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {destinyNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {destinyNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {destinyNumber} - {numerologyNames[destinyNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.destiny[destinyNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Trưởng Thành */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Trưởng Thành</Text>
          </View>
          <Text style={styles.cardSubtitle}>Năng lượng tiềm ẩn sẽ nở rộ khi bạn bước vào độ tuổi trưởng thành</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Họ và Tên Đầy Đủ</Text>
            <TextInput style={styles.input} placeholderTextColor="#777" placeholder="VD: Nguyễn Văn A" value={name} onChangeText={setName} />
          </View>
          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Ngày</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="31" value={day} onChangeText={setDay} keyboardType="numeric" /></View>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Tháng</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="12" value={month} onChangeText={setMonth} keyboardType="numeric" /></View>
            <View style={styles.dateInputWrapper}><Text style={styles.inputLabel}>Năm</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="2003" value={year} onChangeText={setYear} keyboardType="numeric" /></View>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateMaturity}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {maturityNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {maturityNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {maturityNumber} - {numerologyNames[maturityNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.maturity[maturityNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Thái Độ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="happy-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Thái Độ</Text>
          </View>
          <Text style={styles.cardSubtitle}>Cách bạn phản ứng với thế giới và những người xung quanh</Text>
          <View style={styles.dateInputContainer}>
            <View style={[styles.dateInputWrapper, { width: '48%' }]}><Text style={styles.inputLabel}>Ngày</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="31" value={day} onChangeText={setDay} keyboardType="numeric" /></View>
            <View style={[styles.dateInputWrapper, { width: '48%' }]}><Text style={styles.inputLabel}>Tháng</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="12" value={month} onChangeText={setMonth} keyboardType="numeric" /></View>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateAttitude}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {attitudeNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {attitudeNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {attitudeNumber} - {numerologyNames[attitudeNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.attitude[attitudeNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Cân Bằng */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Số Cân Bằng</Text>
          </View>
          <Text style={styles.cardSubtitle}>Sức mạnh ẩn giúp bạn lấy lại thăng bằng khi gặp khó khăn</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Họ và Tên Đầy Đủ</Text>
            <TextInput style={styles.input} placeholderTextColor="#777" placeholder="VD: Nguyễn Văn A" value={name} onChangeText={setName} />
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculateBalance}>
            <Text style={styles.calcBtnText}>Tính Toán</Text>
          </TouchableOpacity>
          {balanceNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Chỉ số: {balanceNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultName}>Số {balanceNumber} - {numerologyNames[balanceNumber]}</Text>
                <Text style={styles.resultDesc}>{numerologyMeaning.balance[balanceNumber]}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card: Số Cá Nhân Theo Thời Gian */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#CB9F42" />
            <Text style={styles.cardTitle}>Năng Lượng Hôm Nay</Text>
          </View>
          <Text style={styles.cardSubtitle}>Kết hợp ngày sinh của bạn và ngày hiện tại để thấy xu hướng của bạn</Text>
          <View style={styles.dateInputContainer}>
            <View style={[styles.dateInputWrapper, { width: '48%' }]}><Text style={styles.inputLabel}>Ngày sinh</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="31" value={day} onChangeText={setDay} keyboardType="numeric" /></View>
            <View style={[styles.dateInputWrapper, { width: '48%' }]}><Text style={styles.inputLabel}>Tháng sinh</Text><TextInput style={styles.inputDate} placeholderTextColor="#777" placeholder="12" value={month} onChangeText={setMonth} keyboardType="numeric" /></View>
          </View>
          <TouchableOpacity style={styles.calcBtn} onPress={calculatePersonal}>
            <Text style={styles.calcBtnText}>Xem Năng Lượng Hôm Nay</Text>
          </TouchableOpacity>

          {personalYearNumber !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Năm Cá Nhân: {personalYearNumber}</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultDesc}>{numerologyMeaning.personalYear[personalYearNumber]}</Text>
              </View>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.resultTitle}>Ngày Cá Nhân: {personalDayNumber}</Text>
                <View style={styles.resultBox}>
                  <Text style={styles.resultDesc}>{numerologyMeaning.personalDay[personalDayNumber]}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#110F19' }, // Dark theme base
  container: { padding: 16, paddingTop: 40 },
  card: {
    backgroundColor: '#1B1924', // Dark card
    borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#332D41',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#CB9F42' },
  cardSubtitle: { fontSize: 14, color: '#A09EAD', marginBottom: 20, lineHeight: 20 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#E0E0E0', marginBottom: 8 },
  input: {
    backgroundColor: '#110F19',
    borderRadius: 8, height: 48, paddingHorizontal: 16, fontSize: 16,
    borderWidth: 1, borderColor: '#332D41', color: '#FFF'
  },
  dateInputContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dateInputWrapper: { width: '31%' },
  inputDate: {
    backgroundColor: '#110F19',
    borderRadius: 8, height: 48, paddingHorizontal: 12, fontSize: 16, textAlign: 'center',
    borderWidth: 1, borderColor: '#332D41', color: '#FFF'
  },
  calcBtn: { backgroundColor: '#A88028', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center' },
  calcBtnText: { color: '#0A0910', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { marginTop: 24, padding: 16, backgroundColor: '#110F19', borderRadius: 12, borderWidth: 1, borderColor: '#CB9F42' },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#CB9F42', marginBottom: 12, textAlign: 'center' },
  resultBox: { borderTopWidth: 1, borderTopColor: '#332D41', paddingTop: 16 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  resultDesc: { fontSize: 14, color: '#F0E6D2', lineHeight: 22, fontStyle: 'italic' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  navBtn: { flex: 1, backgroundColor: '#CB9F42', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { color: '#0A0910', fontWeight: 'bold', marginLeft: 8, fontSize: 13 }
});

export default CalculatorScreen;
