import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { db } from "../database/db";
import NumberBar from "../components/NumberBar";
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/CustomAlert";

export default function NumberTableScreen() {
  const [numbers, setNumbers] = useState([]);
  const [inputNumbers, setInputNumbers] = useState("");
  const [points, setPoints] = useState(1);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    loadNumbers();
  }, []);

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const loadNumbers = () => {
    const rows = db.getAllSync(
      `SELECT number,COUNT(*) as count FROM number_logs GROUP BY number ORDER BY count DESC`
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
      loadNumbers();
      showAlert("Thành công", `Đã thêm thành công các số vào bảng!`, "success");
    } else {
      showAlert("Lỗi định dạng", "Không tìm thấy số hợp lệ. Vui lòng nhập định dạng: 12, 34, 56", "error");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="grid" size={36} color="#CB9F42" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>BẢNG SỐ</Text>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={14} /> {new Date().toLocaleDateString('vi-VN')}
        </Text>
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
          <FlatList
            data={numbers}
            keyExtractor={(item, index) => `${item.number}-${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NumberBar
                number={item.number}
                count={item.count}
                max={numbers[0]?.count || 1}
              />
            )}
          />
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
  }
});
