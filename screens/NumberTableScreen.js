import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Alert } from "react-native";
import { db } from "../database/db";
import NumberBar from "../components/NumberBar";
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/CustomAlert";

export default function NumberTableScreen() {
  const [numbers, setNumbers] = useState([]);
  const [inputNumbers, setInputNumbers] = useState("");
  const [points, setPoints] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [availableDates, setAvailableDates] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    loadAvailableDates();
    loadNumbers(selectedDate);
  }, [selectedDate]);

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const loadAvailableDates = () => {
    const rows = db.getAllSync(`SELECT DISTINCT date FROM number_logs ORDER BY date DESC`);
    const dateList = rows.map(r => r.date);
    if (!dateList.includes(new Date().toLocaleDateString())) {
      dateList.unshift(new Date().toLocaleDateString());
    }
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

    for (let str of numStrings) {
      const parsedNum = parseInt(str.trim());
      if (!isNaN(parsedNum)) {
        for (let i = 0; i < points; i++) {
          db.runSync(
            `INSERT INTO number_logs (number,date) VALUES (?,?)`,
            [parsedNum, date]
          );
          addedCount++;
        }
      }
    }

    if (addedCount > 0) {
      setInputNumbers("");
      Keyboard.dismiss();
      loadAvailableDates();
      loadNumbers(selectedDate);
      showAlert("Thành công", `Đã thêm thành công các số vào bảng!`, "success");
    } else {
      showAlert("Lỗi định dạng", "Không tìm thấy số hợp lệ. Vui lòng nhập định dạng: 12, 34, 56", "error");
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
        <Ionicons name="grid" size={36} color="#CB9F42" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>BẢNG SỐ THEO NGÀY</Text>

        <View style={styles.dateFilterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={availableDates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDate(item)}
                style={[
                  styles.dateChip,
                  selectedDate === item && styles.dateChipActive
                ]}
              >
                <Text style={[
                  styles.dateChipText,
                  selectedDate === item && styles.dateChipTextActive
                ]}>
                  {item === new Date().toLocaleDateString() ? "Hôm nay" : item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.dateListContent}
          />
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.label}>Nhập số (00-99, cách nhau bằng dấu phẩy)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 12, 34, 56"
          placeholderTextColor="#555"
          value={inputNumbers}
          onChangeText={setInputNumbers}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.actionRow}>
          <Text style={styles.labelInLine}>Điểm: </Text>
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
                {numbers.length} SỐ • {numbers.reduce((acc, curr) => acc + curr.count, 0)} ĐIỂM
              </Text>
              <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}>
                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                <Text style={styles.clearAllText}>Xóa hết</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Số</Text>
              <Text style={[styles.columnHeader, { flex: 2, textAlign: 'center' }]}>Ngày</Text>
              <Text style={[styles.columnHeader, { flex: 1, textAlign: 'center' }]}>Điểm</Text>
              <Text style={[styles.columnHeader, { flex: 0.5 }]}></Text>
            </View>

            <FlatList
              data={numbers}
              keyExtractor={(item, index) => `${item.number}-${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 0.5, color: '#A09EAD' }]}>{index + 1}</Text>
                  <Text style={[styles.cellText, { flex: 1, color: '#CB9F42', fontWeight: 'bold', fontSize: 18 }]}>{item.number}</Text>
                  <Text style={[styles.cellText, { flex: 2, textAlign: 'center', color: '#A09EAD' }]}>{item.date || selectedDate}</Text>
                  <Text style={[styles.cellText, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{item.count}</Text>
                  <TouchableOpacity style={{ flex: 0.5, alignItems: 'center' }} onPress={() => deleteNumber(item.number, selectedDate)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>

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
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CB9F42',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
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
  dateFilterContainer: {
    height: 40,
    marginTop: 10,
    width: '100%',
  },
  dateListContent: {
    paddingHorizontal: 10,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1B1924',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#332D41',
    justifyContent: 'center',
    height: 34,
  },
  dateChipActive: {
    backgroundColor: '#CB9F42',
    borderColor: '#CB9F42',
  },
  dateChipText: {
    color: '#A09EAD',
    fontSize: 13,
    fontWeight: '500',
  },
  dateChipTextActive: {
    color: '#0A0910',
    fontWeight: 'bold',
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
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllText: {
    color: '#FF6B6B',
    marginLeft: 6,
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
