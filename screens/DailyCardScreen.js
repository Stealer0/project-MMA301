import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { drawDailyCard, canUnlockWeekly } from "../services/tarotService";
import { cards } from "../data/card";
import { getTarotInsight } from "../services/tarotAIService";
import { useFocusEffect } from "@react-navigation/native";

const COLORS = {
  bg: "#0D0B14",
  surface: "#16121F",
  card: "#1E1830",
  cardHighlight: "#251D3A",
  border: "#2E2848",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDim: "#7A5E28",
  accent: "#7B5EA7",
  accentLight: "#A07BD4",
  textPrimary: "#F0E6D3",
  textSecondary: "#9B8FA8",
  textMuted: "#5C536A",
};

// Mystical symbol per number
const NUMBER_SYMBOLS = {
  1: "☀", 2: "☽", 3: "✦", 4: "◈", 5: "⊕",
  6: "♡", 7: "⊛", 8: "∞", 9: "◉",
};

export default function DailyCardScreen({ navigation }) {
  const [card, setCard] = useState(null);
  const [revealed, setRevealed] = useState(false);
const [aiInsight, setAiInsight] = useState("");
const [loadingAI, setLoadingAI] = useState(false);
const [isWeeklyReady, setIsWeeklyReady] = useState(false);

useFocusEffect(
  useCallback(() => {
    setIsWeeklyReady(canUnlockWeekly());
  }, [])
);
  const handleDraw = async () => {

  const number = drawDailyCard();
if (number === null) {
    setAiInsight("🔮 Bạn đã rút đủ 7 lá bài trong tuần. Hãy xem phần phân tích tuần trước khi rút tiếp.");
    return;
  }
  setCard(number);
  setRevealed(true);

  setLoadingAI(true);

  const insight = await getTarotInsight(
    cards[number].title,
    cards[number].meaning
  );

  setAiInsight(insight);
  setLoadingAI(false);
};
const handleReset = () => {
  setCard(null);
  setRevealed(false);
  setAiInsight("");
  setLoadingAI(false);
};
  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Stars background decoration */}
      <View style={styles.starsRow}>
        {["·", "✦", "·", "·", "✦", "·", "✦", "·", "·"].map((s, i) => (
          <Text key={i} style={[styles.star, { opacity: 0.2 + (i % 3) * 0.15 }]}>{s}</Text>
        ))}
      </View>

      {/* Title area */}
      <View style={styles.titleArea}>
        <Text style={styles.eyebrow}>✦ ✦ ✦</Text>
        <Text style={styles.title}>Numerology Tarot</Text>
        <Text style={styles.subtitle}>Lá bài số học hôm nay</Text>
      </View>

      {/* Card Display */}
      {!revealed ? (
        // Face down card
        <View style={styles.cardFaceDown}>
          <View style={styles.cardInner}>
            <Text style={styles.cardBackSymbol}>✦</Text>
            <View style={styles.cardBackPattern}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.cardBackRing, {
                  width: 60 + i * 40,
                  height: 60 + i * 40,
                  borderRadius: (60 + i * 40) / 2,
                  opacity: 0.15 - i * 0.03,
                }]} />
              ))}
            </View>
            <Text style={styles.cardBackText}>Chạm để khám phá</Text>
          </View>
        </View>
      ) : (
        // Revealed card
        <View style={styles.cardRevealed}>
          <View style={styles.cardRevealedInner}>
            {/* Top symbol */}
            <Text style={styles.symbolSmall}>{NUMBER_SYMBOLS[card] || "✦"}</Text>

            {/* Number */}
            <View style={styles.numberContainer}>
              <Text style={styles.numberDisplay}>{card}</Text>
            </View>

            {/* Divider */}
            <View style={styles.cardDivider}>
              <View style={styles.cardDividerLine} />
              <Text style={styles.cardDividerDot}>◈</Text>
              <View style={styles.cardDividerLine} />
            </View>

            {/* Card title */}
            <Text style={styles.cardTitle}>
              {cards[card]?.title || "Bí Ẩn"}
            </Text>

            {/* Bottom symbol */}
            <Text style={styles.symbolSmall}>{NUMBER_SYMBOLS[card] || "✦"}</Text>
          </View>
        </View>
      )}

      {/* Meaning */}
      {card && cards[card] && (
        <View style={styles.meaningCard}>
          <Text style={styles.meaningLabel}>Ý Nghĩa</Text>
          <Text style={styles.meaningText}>{cards[card].meaning}</Text>
        </View>
      )}

      {loadingAI ? (
  <Text style={styles.aiLoading}>AI đang đọc lá bài của bạn...</Text>
) : (
  aiInsight !== "" && (
    <View style={styles.aiCard}>
      <Text style={styles.aiTitle}>✨ AI Insight</Text>
      <Text style={styles.aiText}>{aiInsight}</Text>
    </View>
  )
)}
      

      {/* Buttons */}
      {!revealed ? (
        <View style={{ width: "100%", gap: 12 }}>
          <TouchableOpacity style={styles.drawButton} onPress={handleDraw} activeOpacity={0.8}>
            <Text style={styles.drawButtonIcon}>✦</Text>
            <Text style={styles.drawButtonText}>Rút Lá Bài Hôm Nay</Text>
            <Text style={styles.drawButtonIcon}>✦</Text>
          </TouchableOpacity>
          
          {isWeeklyReady && (
            <TouchableOpacity 
              style={[styles.weeklyButton, { flex: 0, width: "100%" }]} 
              onPress={() => navigation.navigate("WeeklyReport")} 
              activeOpacity={0.8}
            >
              <Text style={styles.weeklyButtonText}>📜  Báo Cáo Tuần</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>↺  Rút Lại</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.weeklyButton} 
            onPress={() => navigation.navigate("WeeklyReport")} 
            activeOpacity={0.8}
          >
            <Text style={styles.weeklyButtonText}>📜  Báo Cáo Tuần</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    minHeight: "100%",
  },

  // Stars
  starsRow: {
    position: "absolute",
    top: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
  },
  star: {
    color: COLORS.gold,
    fontSize: 12,
  },

  // Title
  titleArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  eyebrow: {
    fontSize: 14,
    color: COLORS.goldDim,
    letterSpacing: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: COLORS.goldLight,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Face down card
  cardFaceDown: {
    width: 180,
    height: 280,
    marginBottom: 24,
  },
  cardInner: {
    flex: 1,
    backgroundColor: COLORS.cardHighlight,
    borderWidth: 1.5,
    borderColor: COLORS.goldDim,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardBackSymbol: {
    fontSize: 32,
    color: COLORS.goldDim,
    position: "absolute",
    zIndex: 2,
  },
  cardBackPattern: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBackRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  cardBackText: {
    position: "absolute",
    bottom: 20,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // Revealed card
  cardRevealed: {
    width: 180,
    height: 280,
    marginBottom: 24,
  },
  cardRevealedInner: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  symbolSmall: {
    fontSize: 20,
    color: COLORS.goldDim,
  },
  numberContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
  },
  numberDisplay: {
    fontSize: 36,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: COLORS.goldLight,
  },
  cardDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
  },
  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  cardDividerDot: {
    color: COLORS.goldDim,
    fontSize: 10,
    marginHorizontal: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 1,
  },

  // Meaning
  meaningCard: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 18,
    marginBottom: 24,
  },
  meaningLabel: {
    fontSize: 11,
    color: COLORS.goldDim,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 10,
    fontFamily: "Georgia",
  },
  meaningText: {
    fontSize: 14,
    fontFamily: "Georgia",
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Draw button
  drawButton: {
    flexDirection: "row",
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  drawButtonIcon: {
    fontSize: 14,
    color: COLORS.bg,
  },
  drawButtonText: {
    fontSize: 15,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: COLORS.bg,
    letterSpacing: 1,
  },

  // Reset button
  resetButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: "Georgia",
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  weeklyButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.goldDim,
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  weeklyButtonText: {
    fontSize: 14,
    fontFamily: "Georgia",
    color: COLORS.goldLight,
    letterSpacing: 1,
  },
  aiCard: {
  width: "100%",
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 6,
  padding: 18,
  marginBottom: 24,
},

aiTitle: {
  fontSize: 12,
  color: COLORS.gold,
  letterSpacing: 2,
  marginBottom: 10,
  fontWeight: "600",
},

aiText: {
  fontSize: 14,
  color: COLORS.textSecondary,
  lineHeight: 22,
},

aiLoading: {
  color: COLORS.textMuted,
  marginTop: 10,
},
});