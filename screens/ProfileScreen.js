import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { db } from "../database/db";
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/CustomAlert";
import { useIsFocused } from '@react-navigation/native';
import { isValidDate } from "../utils/validation";

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", type: "info" });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);

  const loadUserData = () => {
    try {
      const user = db.getFirstSync(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);
      if (user) {
        setName(user.name || "");
        setDay(user.birth_day ? user.birth_day.toString() : "");
        setMonth(user.birth_month ? user.birth_month.toString() : "");
        setYear(user.birth_year ? user.birth_year.toString() : "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const save = () => {
    if (!name || !day || !month || !year) {
      showAlert("Thiếu thông tin", "Vui lòng điền đủ thông tin để lưu hồ sơ.", "warning");
      return;
    }

    if (!isValidDate(day, month, year)) {
      showAlert("Ngày không hợp lệ", "Vui lòng nhập ngày sinh chính xác.", "warning");
      return;
    }

    try {
      // Check if user exists
      const existingUser = db.getFirstSync(`SELECT id FROM users LIMIT 1`);
      
      if (existingUser) {
        // Update existing
        db.runSync(
          `UPDATE users SET name = ?, birth_day = ?, birth_month = ?, birth_year = ? WHERE id = ?`,
          [name, parseInt(day), parseInt(month), parseInt(year), existingUser.id]
        );
      } else {
        // Insert new
        db.runSync(
          `INSERT INTO users (name, birth_day, birth_month, birth_year) VALUES (?, ?, ?, ?)`,
          [name, parseInt(day), parseInt(month), parseInt(year)]
        );
      }
      
      showAlert("Thành công", "Thông tin hồ sơ của bạn đã được lưu lại.", "success");
    } catch (error) {
      console.error("Error saving user data:", error);
      showAlert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại sau.", "error");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={40} color="#CB9F42" />
          </View>
          <Text style={styles.title}>Hồ Sơ</Text>
          <Text style={styles.subtitle}>Thông tin cá nhân của bạn</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Tên của bạn</Text>
          <TextInput 
            style={styles.input}
            value={name} 
            onChangeText={setName} 
            placeholder="Nhập tên của bạn"
            placeholderTextColor="#555"
          />

          <Text style={styles.label}>Ngày sinh</Text>
          <View style={styles.dateContainer}>
            <TextInput 
              style={[styles.input, styles.dateInput]}
              value={day} 
              onChangeText={setDay} 
              placeholder="DD"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput 
              style={[styles.input, styles.dateInput]}
              value={month} 
              onChangeText={setMonth} 
              placeholder="MM"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput 
              style={[styles.input, styles.yearInput]}
              value={year} 
              onChangeText={setYear} 
              placeholder="YYYY"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Lưu hồ sơ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#1B1924', borderWidth: 1, borderColor: '#CB9F42', marginTop: 16 }]} 
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={20} color="#CB9F42" style={{ marginRight: 8 }} />
            <Text style={[styles.saveButtonText, { color: '#CB9F42' }]}>Xem Lịch Sử</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#CB9F42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CB9F42',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A09EAD',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#F0E6D2',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1B1924',
    borderWidth: 1,
    borderColor: '#332D41',
    borderRadius: 12,
    color: '#FFF',
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 0.28,
    textAlign: 'center',
  },
  yearInput: {
    flex: 0.38,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#A88028',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#0A0910',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
