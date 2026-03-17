import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

import { getWeeklyInsight } from "../services/weeklyInsightService";
import { getLast7Cards } from "../services/tarotService";

import {
  insertWeeklyInsight,
  getWeeklyHistory,
  resetTarotWeek,
  deleteWeeklyInsight,
} from "../database/db";

const COLORS = {
  bg: "#0D0B14",
  surface: "#16121F",
  card: "#1E1830",
  border: "#2E2848",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "#7A5E28",
  textPrimary: "#F0E6D3",
  textSecondary: "#9B8FA8",
  textMuted: "#5C536A",
  danger: "#8B3A3A",
};

const NUMBER_COLORS = [
  "#C9A84C", "#A07BD4", "#5EA87B", "#A84C6A",
  "#4C7BA8", "#A87B4C", "#7BA84C",
];

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function WeeklyReportScreen() {
  const navigation = useNavigation();
  const [insight, setInsight] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ FIX: đưa numbers vào state thay vì gọi trực tiếp
  // Trước: const numbers = getLast7Cards();  ← chỉ chạy 1 lần khi mount
  // Sau:   dùng useFocusEffect để refresh mỗi khi tab được focus
  const [numbers, setNumbers] = useState(() => getLast7Cards());

  // Refresh cả numbers lẫn history mỗi lần quay lại tab này
  useFocusEffect(
    useCallback(() => {
      setNumbers(getLast7Cards());
      loadHistory();
    }, [])
  );

  const loadHistory = () => {
    const data = getWeeklyHistory();
    setHistory(data);
  };

  const handleDelete = (id) => {
    deleteWeeklyInsight(id);
    loadHistory();
  };

  const handleAnalyze = async () => {
    const result = await getWeeklyInsight();
    setInsight(result);
    insertWeeklyInsight(numbers, result);
    resetTarotWeek();
    // Sau reset, làm mới numbers ngay
    setNumbers(getLast7Cards());
    loadHistory();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.gold} />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerRune}>⊛</Text>
        <Text style={styles.headerTitle}>Weekly Energy Report</Text>
        <Text style={styles.headerSub}>Báo cáo năng lượng tuần</Text>
      </View>

      {/* Cards this week — progress tracker */}
      <View style={styles.progressCard}>
        <View style={styles.progressCardHeader}>
          <Text style={styles.sectionLabel}>Cards this week</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressCurrent}>{numbers.length}</Text>
            <Text style={styles.progressTotal}>/7</Text>
          </View>
        </View>

        <View style={styles.dayTracker}>
          {[...Array(7)].map((_, i) => {
            const filled = i < numbers.length;
            return (
              <View key={i} style={styles.dayCol}>
                <View
                  style={[
                    styles.chip,
                    filled
                      ? { backgroundColor: NUMBER_COLORS[i], borderColor: NUMBER_COLORS[i] }
                      : styles.chipEmpty,
                  ]}
                >
                  <Text style={[styles.chipText, filled ? styles.chipTextFilled : styles.chipTextEmpty]}>
                    {filled ? numbers[i] : "·"}
                  </Text>
                </View>
                <Text style={[styles.dayLabel, filled && styles.dayLabelFilled]}>
                  {DAY_LABELS[i]}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${(numbers.length / 7) * 100}%` }]} />
        </View>
      </View>

      {/* Analyze button */}
      <TouchableOpacity
        style={[styles.analyzeBtn, numbers.length < 7 && styles.analyzeBtnDisabled]}
        onPress={handleAnalyze}
        disabled={numbers.length < 7}
        activeOpacity={0.8}
      >
        <Text style={styles.analyzeBtnIcon}>🔮</Text>
        <Text style={[styles.analyzeBtnText, numbers.length < 7 && styles.analyzeBtnTextMuted]}>
          {numbers.length < 7 ? `Cần thêm ${7 - numbers.length} ngày nữa` : "Analyze My Week"}
        </Text>
      </TouchableOpacity>

      {/* Insight */}
      {insight ? (
        <View style={styles.insightCard}>
          <View style={styles.insightTopBar}>
            <Text style={styles.insightTopBarText}>✦  WEEKLY INSIGHT  ✦</Text>
          </View>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      ) : null}

      {/* Weekly Journal */}
      {history.length > 0 && (
        <>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>📜  Weekly Journal</Text>
            <View style={styles.dividerLine} />
          </View>

          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyAccent} />
              <View style={styles.historyBody}>
                <View style={styles.historyChipRow}>
                  {item.numbers.split(",").map((n, i) => (
                    <View key={i} style={[styles.historyChip, { borderColor: NUMBER_COLORS[i % 7] }]}>
                      <Text style={[styles.historyChipText, { color: NUMBER_COLORS[i % 7] }]}>
                        {n.trim()}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.historyInsight}>{item.insight}</Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>✕  Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingTop: 0, paddingBottom: 48 },

  header: { alignItems: "center", marginBottom: 28 },
  headerRune: { fontSize: 32, color: COLORS.goldDim, marginBottom: 12 },
  headerTitle: {
    fontSize: 24, fontFamily: "Georgia", fontWeight: "700",
    color: COLORS.goldLight, letterSpacing: 2, textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 12, color: COLORS.textSecondary,
    marginTop: 8, letterSpacing: 2, textTransform: "uppercase",
  },

  progressCard: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 4, padding: 20, marginBottom: 16,
  },
  progressCardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2,
    textTransform: "uppercase", fontFamily: "Georgia",
  },
  progressBadge: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  progressCurrent: { fontSize: 26, fontFamily: "Georgia", fontWeight: "700", color: COLORS.goldLight },
  progressTotal: { fontSize: 14, fontFamily: "Georgia", color: COLORS.textMuted, marginBottom: 3 },
  dayTracker: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayCol: { alignItems: "center", gap: 6 },
  chip: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  chipEmpty: { borderColor: COLORS.border },
  chipText: { fontSize: 14, fontFamily: "Georgia", fontWeight: "700" },
  chipTextFilled: { color: COLORS.bg },
  chipTextEmpty: { fontSize: 18, color: COLORS.textMuted, lineHeight: 20 },
  dayLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: "Georgia", letterSpacing: 0.5 },
  dayLabelFilled: { color: COLORS.textSecondary },
  progressBarTrack: { height: 2, backgroundColor: COLORS.border, borderRadius: 1, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: COLORS.gold, borderRadius: 1 },

  analyzeBtn: {
    flexDirection: "row", backgroundColor: COLORS.gold, borderRadius: 4,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
    marginBottom: 20, gap: 10,
  },
  analyzeBtnDisabled: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  analyzeBtnIcon: { fontSize: 16 },
  analyzeBtnText: { fontSize: 14, fontFamily: "Georgia", fontWeight: "700", color: COLORS.bg, letterSpacing: 0.5 },
  analyzeBtnTextMuted: { color: COLORS.textMuted },

  insightCard: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.goldDim,
    borderRadius: 4, overflow: "hidden", marginBottom: 28,
  },
  insightTopBar: { backgroundColor: COLORS.goldDim, paddingVertical: 8, paddingHorizontal: 16, alignItems: "center" },
  insightTopBarText: { fontSize: 11, fontFamily: "Georgia", fontWeight: "700", color: COLORS.bg, letterSpacing: 4 },
  insightText: { fontSize: 14, fontFamily: "Georgia", color: COLORS.textPrimary, lineHeight: 26, padding: 18 },

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { fontSize: 12, fontFamily: "Georgia", color: COLORS.textSecondary, letterSpacing: 1 },

  historyCard: {
    flexDirection: "row", backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 4,
    overflow: "hidden", marginBottom: 12,
  },
  historyAccent: { width: 3, backgroundColor: COLORS.goldDim },
  historyBody: { flex: 1, padding: 16 },
  historyChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  historyChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  historyChipText: { fontSize: 13, fontFamily: "Georgia", fontWeight: "700" },
  historyInsight: { fontSize: 13, fontFamily: "Georgia", color: COLORS.textSecondary, lineHeight: 22, marginBottom: 14 },
  deleteBtn: { alignSelf: "flex-end", paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.danger, borderRadius: 3 },
  deleteBtnText: { fontSize: 12, color: COLORS.danger, letterSpacing: 1, fontFamily: "Georgia" },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 8,
    gap: 4,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 16,
    fontFamily: "Georgia",
  },
});