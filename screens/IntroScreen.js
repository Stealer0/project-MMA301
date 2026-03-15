import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Platform, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { getLotteryResults } from '../services/lotteryService';

const IntroScreen = () => {
  const [lotteryResult, setLotteryResult] = useState(null);
  const [loadingLottery, setLoadingLottery] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data for mystical elements
  const luckyIndicators = [
    { label: "Màu may mắn", value: "Vàng kim", icon: "color-palette-outline" },
    { label: "Hướng cát tường", value: "Đông Nam", icon: "compass-outline" },
    { label: "Giờ hoàng đạo", value: "09:00 - 11:00", icon: "time-outline" },
  ];

  const oracleMessage = "Vũ trụ đang gửi đến bạn những rung động tích cực. Hãy tin tưởng vào trực giác của mình hôm nay, mọi sự khởi đầu mới đều được bảo hộ.";

  useEffect(() => {
    fetchLottery();
  }, [selectedDate]);

  const fetchLottery = async () => {
    setLoadingLottery(true);
    const results = await getLotteryResults(selectedDate);
    if (results && results.length > 0) {
      setLotteryResult(results[0]);
    } else if (selectedDate) {
      // If no result for selected date, show "not found" state
      setLotteryResult({ province: 'Miền Bắc', special: '-----', date: 'Không có dữ liệu' });
    }
    setLoadingLottery(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>CON SỐ ĐỊNH MỆNH</Text>
          <TouchableOpacity 
            onPress={() => setShowCalendar(true)} 
            style={styles.dateSelectorRow}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={12} color="#CB9F42" style={{ marginRight: 6 }} />
            <Text style={styles.subtitle}>
              {lotteryResult?.date === 'Không có dữ liệu' ? 'Không có dữ liệu' : `Miền Bắc - ${lotteryResult?.date || ""}`}
            </Text>
            <Ionicons name="chevron-down" size={10} color="#A09EAD" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
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
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [selectedDate]: { selected: true }
                }}
                maxDate={new Date().toISOString().split('T')[0]}
              />
            </View>
          </View>
        </Modal>

        {/* Lottery Result Section */}
        <View style={styles.lotterySection}>
          {loadingLottery ? (
            <ActivityIndicator color="#CB9F42" style={{ marginVertical: 40 }} />
          ) : (
            <View style={styles.lotteryFocusItem}>
              <View style={styles.lotteryNumberBgGigantic}>
                <Text style={styles.lotteryNumberGigantic}>{lotteryResult?.special}</Text>
              </View>
              <Text style={styles.lotteryStatus}>Con Số May Mắn Hôm Nay</Text>
            </View>
          )}
        </View>

        {/* Lucky Indicators Section */}
        <View style={styles.indicatorsRow}>
          {luckyIndicators.map((item, index) => (
            <View key={index} style={styles.indicatorCard}>
              <Ionicons name={item.icon} size={20} color="#CB9F42" style={{ marginBottom: 6 }} />
              <Text style={styles.indicatorLabel}>{item.label}</Text>
              <Text style={styles.indicatorValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Oracle Message Section */}
        <View style={styles.oracleSection}>
          <View style={styles.oracleHeader}>
            <Ionicons name="moon-outline" size={18} color="#CB9F42" />
            <Text style={styles.oracleTitle}>THÔNG ĐIỆP VŨ TRỤ</Text>
          </View>
          <Text style={styles.oracleText}>{oracleMessage}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#110F19', // Dark theme matching FortuneScreen
  },
  container: {
    padding: 24,
    paddingTop: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CB9F42", // Gold accent
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  subtitle: {
    fontSize: 14,
    color: "#A09EAD",
  },
  mainDescription: {
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1B1924',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#332D41',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(203, 159, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 159, 66, 0.3)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardDesc: {
    fontSize: 14,
    color: '#A09EAD',
    lineHeight: 22,
  },
  lotterySection: {
    backgroundColor: '#1E1B29',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CB9F42',
    shadowColor: '#CB9F42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lotteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  lotteryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lotteryTitle: {
    fontSize: 14,
    fontWeight: 'BOLD',
    color: '#CB9F42',
    letterSpacing: 0.5,
  },
  lotteryDate: {
    fontSize: 12,
    color: '#A09EAD',
  },
  lotteryList: {
    gap: 12,
  },
  lotteryItem: {
    backgroundColor: '#110F19',
    borderRadius: 12,
    padding: 12,
    width: 130,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#332D41',
  },
  lotteryLabel: {
    fontSize: 12,
    color: '#A09EAD',
    marginBottom: 8,
    fontWeight: '600',
  },
  lotteryNumberBg: {
    backgroundColor: 'rgba(203, 159, 66, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lotteryNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#CB9F42',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  lotteryVerticalList: {
    width: '100%',
    gap: 16,
  },
  lotteryVerticalItem: {
    backgroundColor: '#110F19',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#332D41',
  },
  lotteryNumberBgLarge: {
    backgroundColor: 'rgba(203, 159, 66, 0.1)',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  lotteryNumberGigantic: {
    fontSize: 56,
    fontWeight: '900',
    color: '#CB9F42',
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  lotteryNumberBgGigantic: {
    backgroundColor: 'rgba(203, 159, 66, 0.05)',
    width: '100%',
    paddingVertical: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(203, 159, 66, 0.2)',
  },
  lotteryFocusItem: {
    width: '100%',
    alignItems: 'center',
  },
  lotteryStatus: {
    fontSize: 14,
    color: '#A09EAD',
    marginTop: 20,
    letterSpacing: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  indicatorCard: {
    backgroundColor: '#1E1B29',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#332D41',
  },
  indicatorLabel: {
    fontSize: 10,
    color: '#A09EAD',
    marginBottom: 4,
    textAlign: 'center',
  },
  indicatorValue: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  oracleSection: {
    backgroundColor: 'rgba(203, 159, 66, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(203, 159, 66, 0.2)',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  oracleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  oracleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#CB9F42',
    letterSpacing: 2,
  },
  oracleText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

export default IntroScreen;
