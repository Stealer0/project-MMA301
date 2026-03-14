import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { db } from "../database/db";
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = () => {
    const rows = db.getAllSync(
      `SELECT * FROM predictions ORDER BY id DESC`
    );
    setHistory(rows);
  };

  const clearHistory = () => {
    Alert.alert(
      "Xóa lịch sử",
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử bói toán không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: () => {
            db.runSync(`DELETE FROM predictions`);
            loadHistory();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={32} color="#CB9F42" />
          <Text style={styles.title}>Lịch Sử</Text>
        </View>
        
        {history.length > 0 && (
          <TouchableOpacity style={styles.deleteButton} onPress={clearHistory}>
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#332D41" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptySub}>Những câu chuyện của bạn sẽ được lưu ở đây.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <View style={styles.numberBadge}>
                <Text style={styles.badgeText}>{item.result_number.toString().padStart(2, '0')}</Text>
              </View>
              <View style={styles.textContent}>
                <Text style={styles.questionText} numberOfLines={2}>{item.question}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A09EAD" />
            </View>
          )}
        />
      )}
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CB9F42',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: '#1B1924',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#332D41',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A88028',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeText: {
    color: '#0A0910',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContent: {
    flex: 1,
    marginRight: 10,
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateText: {
    color: '#A09EAD',
    fontSize: 12,
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
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});
