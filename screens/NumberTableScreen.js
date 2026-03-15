import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Alert, Modal, Linking } from "react-native";
import { db } from "../database/db";
import NumberBar from "../components/NumberBar";
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/CustomAlert";
import { Calendar } from 'react-native-calendars';

export default function NumberTableScreen() {
  const [numbers, setNumbers] = useState([]);
  const [inputNumbers, setInputNumbers] = useState("");
  const [points, setPoints] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [availableDates, setAvailableDates] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", type: "info" });
  const [showCalendar, setShowCalendar] = useState(false);
  const [teacherPhone, setTeacherPhone] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState("");

  useEffect(() => {
    loadAvailableDates();
    loadNumbers(selectedDate);
    loadSettings();
  }, [selectedDate]);

  const loadSettings = () => {
    try {
      // Create settings table if not exists (quick fix since db.js is central but I can do it here too)
      db.execSync(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
      const row = db.getFirstSync(`SELECT value FROM settings WHERE key = 'teacher_phone'`);
      if (row) {
        setTeacherPhone(row.value);
        setTempPhone(row.value);
      }
    } catch (e) {
      console.log('Error loading settings', e);
    }
  };

  const saveTeacherPhone = () => {
    try {
      db.runSync(`INSERT OR REPLACE INTO settings (key, value) VALUES ('teacher_phone', ?)`, [tempPhone]);
      setTeacherPhone(tempPhone);
      setShowPhoneModal(false);
      showAlert("Thành công", "Đã lưu số điện thoại của Thầy", "success");
    } catch (e) {
      showAlert("Lỗi", "Không thể lưu số điện thoại", "error");
    }
  };

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const loadAvailableDates = () => {
    const rows = db.getAllSync(`SELECT DISTINCT date FROM number_logs ORDER BY date DESC`);
    const dateList = rows.map(r => r.date);
    setAvailableDates(dateList);
  };

  const loadNumbers = (date) => {
    const rows = db.getAllSync(
      `SELECT number, COUNT(*) as count FROM number_logs WHERE date = ? GROUP BY number ORDER BY count DESC`,
      [date]
    );
    setNumbers(rows);
  };

  const addNumbers = () => {
    if (!inputNumbers.trim()) {
      showAlert("Thiếu dữ liệu", "Vui lòng nhập số!", "warning");
      return;
    }

    const numStrings = inputNumbers.split(",");
    const date = new Date().toLocaleDateString();

    let addedCount = 0;
    let invalidNumbers = [];
    let outOfRangeNumbers = [];

    for (let str of numStrings) {
      const trimmed = str.trim();
      if (!trimmed) continue;

      // Regex to strictly allow only integers (no decimals, no extra chars)
      if (!/^\d+$/.test(trimmed)) {
        invalidNumbers.push(trimmed);
        continue;
      }

      const parsedNum = parseInt(trimmed);
      if (parsedNum < 1 || parsedNum > 99) {
        outOfRangeNumbers.push(trimmed);
        continue;
      }

      for (let i = 0; i < points; i++) {
        db.runSync(
          `INSERT INTO number_logs (number,date) VALUES (?,?)`,
          [parsedNum, date]
        );
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setInputNumbers("");
      Keyboard.dismiss();
      loadAvailableDates();
      loadNumbers(selectedDate);
      
      let msg = `Đã thêm thành công ${addedCount} lượt số!`;
      if (invalidNumbers.length > 0 || outOfRangeNumbers.length > 0) {
        msg += "\n\nLưu ý: Một số số bị bỏ qua do không hợp lệ hoặc ngoài phạm vi 1-99.";
      }
      showAlert("Thành công", msg, "success");
    } else {
      let errorMsg = "Không tìm thấy số hợp lệ để thêm.";
      if (outOfRangeNumbers.length > 0) {
        errorMsg = "Số phải nằm trong khoảng từ 01 đến 99.";
      } else if (invalidNumbers.length > 0) {
        errorMsg = "Vui lòng chỉ nhập số nguyên, không chứa ký tự đặc biệt hoặc dấu thập phân.";
      }
      showAlert("Lỗi dữ liệu", errorMsg, "error");
    }
  };

  const deleteNumber = (number, date) => {
    try {
      db.runSync(`DELETE FROM number_logs WHERE number = ? AND date = ?`, [number, date]);
      loadNumbers(selectedDate);
      loadAvailableDates();
    } catch (e) {
      console.log('Error deleting number', e);
    }
  };

  const sendToTeacher = () => {
    if (numbers.length === 0) {
      showAlert("Lỗi", "Không có dữ liệu số nào để gửi", "warning");
      return;
    }
    if (!teacherPhone) {
      setShowPhoneModal(true);
      return;
    }

    let message = "Dạ thưa thầy, con gửi thầy danh sách các vị trí cần nhờ thầy xem giúp duyên lành hôm nay ạ:\n\n";
    numbers.forEach((item) => {
      message += `${item.number}: quẻ ${item.count}\n\n`;
    });
    message += "Nhờ thầy soi giúp con xem cung nào sáng nhất để con biết đường mà hướng theo ạ. Con cảm ơn thầy!";

    const url = `sms:${teacherPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => {
      showAlert("Lỗi", "Không thể mở ứng dụng tin nhắn", "error");
    });
  };

  const clearAll = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa tất cả bản ghi của ngày này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa hết",
          style: "destructive",
          onPress: () => {
            db.runSync(`DELETE FROM number_logs WHERE date = ?`, [selectedDate]);
            loadNumbers(selectedDate);
            loadAvailableDates();
            showAlert("Thành công", "Đã xóa toàn bộ số của ngày này", "success");
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>GHI CHÚ</Text>
            <Text style={styles.cuteDateText}>
              {selectedDate === new Date().toLocaleDateString() ? "Hôm nay" : selectedDate}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowCalendar(true)} 
              style={styles.calendarButtonSmall}
            >
              <Ionicons name="calendar-outline" size={20} color="#CB9F42" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.todayButton} 
              onPress={() => setSelectedDate(new Date().toLocaleDateString())}
            >
              <Text style={styles.todayButtonText}>Hôm nay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showCalendar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Tra cứu lịch sử</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Calendar
              theme={{
                backgroundColor: '#1E1B29',
                calendarBackground: '#1E1B29',
                textSectionTitleColor: '#CB9F42',
                selectedDayBackgroundColor: '#CB9F42',
                selectedDayTextColor: '#110F19',
                todayTextColor: '#CB9F42',
                dayTextColor: '#FFF',
                textDisabledColor: '#332D41',
                monthTextColor: '#CB9F42',
                arrowColor: '#CB9F42',
              }}
              onDayPress={(day) => {
                const dateObj = new Date(day.timestamp);
                const formattedDate = dateObj.toLocaleDateString();
                setSelectedDate(formattedDate);
                setShowCalendar(false);
              }}
              markedDates={{
                [new Date().toISOString().split('T')[0]]: { selected: true }
              }}
              maxDate={new Date().toISOString().split('T')[0]}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Nhập số nguyên (01-99, cách nhau bằng dấu phẩy)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 05, 12, 88"
          placeholderTextColor="#555"
          value={inputNumbers}
          onChangeText={setInputNumbers}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.actionRow}>
          <Text style={styles.labelInLine}>Quẻ: </Text>
          <View style={styles.pointControl}>
            <TouchableOpacity onPress={() => setPoints(Math.max(1, points - 1))} style={styles.circleBtn}>
              <Text style={styles.circleBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.pointValue}>{points}</Text>
            <TouchableOpacity onPress={() => setPoints(points + 1)} style={styles.circleBtn}>
              <Text style={styles.circleBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addNumbers}>
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        {numbers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color="#332D41" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>Chưa có số nào</Text>
            <Text style={styles.emptySub}>Nhập số ở trên để thêm vào bảng</Text>
          </View>
        ) : (
          <>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTotalText}>
                {numbers.length} SỐ • {numbers.reduce((acc, curr) => acc + curr.count, 0)} QUẺ
              </Text>
              <View style={styles.headerRightActions}>
                <TouchableOpacity style={styles.sendTeacherBtn} onPress={sendToTeacher}>
                  <Ionicons name="paper-plane-outline" size={16} color="#0A0910" />
                  <Text style={styles.sendTeacherText}>Gửi Thầy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.configBtn} onPress={() => { setTempPhone(teacherPhone); setShowPhoneModal(true); }}>
                  <Ionicons name="settings-outline" size={18} color="#A09EAD" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}>
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.clearAllText}>Xóa hết</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Số</Text>
              <Text style={[styles.columnHeader, { flex: 1.5, textAlign: 'center' }]}>Ngày</Text>
              <Text style={[styles.columnHeader, { flex: 0.8, textAlign: 'right' }]}>Quẻ</Text>
              <Text style={[styles.columnHeader, { flex: 0.7 }]}></Text>
            </View>

            <FlatList
              data={numbers}
              keyExtractor={(item, index) => `${item.number}-${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 0.5, color: '#A09EAD' }]}>{index + 1}</Text>
                  <Text style={[styles.cellText, { flex: 1, color: '#CB9F42', fontWeight: 'bold', fontSize: 18 }]}>{item.number}</Text>
                  <Text style={[styles.cellText, { flex: 1.5, textAlign: 'center', color: '#A09EAD' }]}>{item.date || selectedDate}</Text>
                  <Text style={[styles.cellText, { flex: 0.8, textAlign: 'right', fontWeight: 'bold' }]}>{item.count}</Text>
                  <TouchableOpacity style={{ flex: 0.7, alignItems: 'center' }} onPress={() => deleteNumber(item.number, selectedDate)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>

      <Modal visible={showPhoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.phoneModal}>
            <Text style={styles.modalTitle}>Cài đặt số điện thoại</Text>
            <Text style={styles.modalSub}>Nhập số điện thoại của Thầy để gửi tin nhắn</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="VD: 0987654321"
              placeholderTextColor="#555"
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPhoneModal(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveTeacherPhone}>
                <Text style={styles.modalSaveText}>Lưu lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#110F19',
    padding: 20,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTotalText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendTeacherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CB9F42',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sendTeacherText: {
    color: '#0A0910',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  configBtn: {
    padding: 6,
    backgroundColor: '#1B1924',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#332D41',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
  },
  clearAllText: {
    color: '#FF6B6B',
    marginLeft: 6,
    fontSize: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(203, 159, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(203, 159, 66, 0.2)',
    marginRight: 10,
  },
  todayButton: {
    backgroundColor: 'rgba(203, 159, 66, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 159, 66, 0.3)',
  },
  todayButtonText: {
    color: '#CB9F42',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CB9F42',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 2,
  },
  cuteDateText: {
    fontSize: 12,
    color: '#A09EAD',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phoneModal: {
    backgroundColor: '#1E1B29',
    borderRadius: 24,
    width: '90%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#332D41',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#CB9F42',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalSub: {
    color: '#A09EAD',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#0A0910',
    width: '100%',
    borderWidth: 1,
    borderColor: '#332D41',
    borderRadius: 12,
    color: '#FFF',
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1B1924',
    borderRadius: 12,
  },
  modalCancelText: {
    color: '#A09EAD',
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#CB9F42',
    borderRadius: 12,
  },
  modalSaveText: {
    color: '#0A0910',
    fontWeight: 'bold',
  },
  calendarModal: {
    backgroundColor: '#1E1B29',
    borderRadius: 20,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#332D41',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#332D41',
  },
  calendarTitle: {
    color: '#CB9F42',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#A09EAD',
  },
  inputCard: {
    backgroundColor: '#1B1924',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#332D41',
    padding: 16,
    marginBottom: 24,
  },
  label: {
    color: '#A09EAD',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A0910',
    borderWidth: 1,
    borderColor: '#332D41',
    borderRadius: 12,
    color: '#FFF',
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelInLine: {
    color: '#A09EAD',
    fontSize: 16,
  },
  pointControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0910',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1B1924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnText: {
    color: '#A09EAD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  addButton: {
    backgroundColor: '#A88028',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#0A0910',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#CB9F42',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySub: {
    color: '#A09EAD',
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#332D41',
    paddingBottom: 10,
    marginBottom: 10,
  },
  columnHeader: {
    color: '#A09EAD',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1B1924',
  },
  cellText: {
    color: '#FFF',
    fontSize: 14,
  }
});
