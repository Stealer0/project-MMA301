import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IntroScreen = () => {

  const importantNumbers = [
    {
      title: "Số Ngày Sinh",
      description: "Được tính từ ngày sinh của bạn, con số này tiết lộ những tài năng bẩm sinh, năng khiếu và kỹ năng bạn mang theo khi chào đời.",
      icon: "calendar-outline"
    },
    {
      title: "Số Đường Đời",
      description: "Đây là con số quan trọng nhất, được tính từ ngày sinh của bạn. Nó tiết lộ sứ mệnh, hành trình và bài học chính trong cuộc đời bạn.",
      icon: "map-outline"
    },
    {
      title: "Số Vận Mệnh",
      description: "Tính từ tên đầy đủ của bạn, con số này thể hiện tài năng, khả năng bẩm sinh và điều bạn được định sẵn để làm trong cuộc đời.",
      icon: "star-outline"
    },
    {
      title: "Số Trưởng Thành",
      description: "Được tính từ Số Đường Đời và Số Vận Mệnh, con số này đại diện cho năng lượng tiềm ẩn sẽ nở rộ khi bạn bước vào độ tuổi trưởng thành (thường từ 35-40 tuổi).",
      icon: "trending-up-outline"
    },
    {
      title: "Số Thái Độ",
      description: "Được tính từ ngày và tháng sinh, con số này chỉ ra cách bạn phản ứng với thế giới xung quanh và ấn tượng ban đầu bạn để lại cho người khác.",
      icon: "happy-outline"
    },
    {
      title: "Số Cân Bằng",
      description: "Tính từ các chữ cái đầu tiên trong họ tên của bạn. Con số này là sức mạnh ẩn giúp bạn lấy lại thăng bằng khi đối mặt với khó khăn, thử thách.",
      icon: "construct-outline"
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Ionicons name="sparkles" size={40} color="#CB9F42" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>THẦN SỐ HỌC</Text>
          <Text style={styles.subtitle}>Giới thiệu các chỉ số quan trọng</Text>
        </View>

        <Text style={styles.mainDescription}>
          Thần số học là một hệ thống niềm tin cổ xưa cho rằng các con số có ý nghĩa đặc biệt và ảnh hưởng đến cuộc sống của chúng ta. Dưới đây là 6 chỉ số quan trọng định hình nên con người bạn.
        </Text>

        {importantNumbers.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                 <Ionicons name={item.icon} size={20} color="#CB9F42" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        ))}

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
    paddingTop: 40,
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
    marginBottom: 8,
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
  }
});

export default IntroScreen;
