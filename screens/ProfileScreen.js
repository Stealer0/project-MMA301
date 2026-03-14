import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { db } from "../database/db";
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const save = () => {
    if (!name || !day || !month || !year) {
      alert("Vui lòng điền đủ thông tin");
      return;
    }
    db.runSync(
      `INSERT INTO users (name,birth_day,birth_month,birth_year) VALUES (?,?,?,?)`,
      [name, parseInt(day), parseInt(month), parseInt(year)],
    );
    setName("");
    setDay("");
    setMonth("");
    setYear("");
    alert("Đã lưu hồ sơ thành công!");
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

          <TouchableOpacity style={styles.saveButton} onPress={save}>
            <Text style={styles.saveButtonText}>Lưu hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 60,
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
