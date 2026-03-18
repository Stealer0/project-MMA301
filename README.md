# 🔮 Numerology & Tarot Insights

Ứng dụng di động được xây dựng bằng **React Native** và **Expo**, cung cấp các tính năng giải đoán thần số học cá nhân, phân tích cuộc sống bằng trí tuệ nhân tạo (AI) và dự báo qua các lá bài Tarot.

---

## ✨ Tính năng chính

### 🔢 Thần Số Học (Numerology)
- **Số Chủ Đạo:** Khám phá con số cốt lõi và ý nghĩa cuộc đời dựa trên ngày sinh và tên của bạn.
- **Bảng Số Chi Tiết:** Xem phân tích chuyên sâu về các chỉ số năng lượng trong hồ sơ thần số học.
- **Công cụ tính toán (Calculator):** Các công cụ tương tác giúp tính toán nhanh các khía cạnh thần số học khác nhau.

### 🃏 Tarot & Dự Báo
- **Rút Bài Hàng Ngày:** Rút một lá bài mỗi ngày để nhận được lời khuyên và thông điệp cá nhân hóa.
- **Báo Cáo Tuần:** Tổng hợp năng lượng của 7 ngày để đưa ra cái nhìn tổng quan và lời khuyên cho tuần tiếp theo.
- **Bói Số Huyền Bí:** Đặt câu hỏi và nhận giải đáp từ các vì sao thông qua sự kết hợp giữa con số và AI.

### 🤖 Phân Tích Bằng AI (Gemini AI)
- **Thấu Hiểu Chuyên Sâu:** Sử dụng công nghệ **Gemini AI** để phân tích hồ sơ người dùng, mang lại những lời khuyên tâm linh và thực tế đầy cảm hứng.
- **Tương tác thông minh:** Trò chuyện với chuyên gia AI để giải đáp các thắc mắc về vận mệnh và tính cách.

### 👤 Hồ Sơ & Lịch Sử
- **Cá nhân hóa:** Lưu trữ thông tin cá nhân (tên, ngày sinh) để ứng dụng tự động tính toán các chỉ số.
- **Lịch Sử Xem Bài:** Theo dõi lại các lần rút bài Tarot và các phiên phân tích thần số học trước đó.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** [React Native](https://reactnative.dev/) với [Expo](https://expo.dev/)
- **Navigation:** [React Navigation](https://reactnavigation.org/) (Bottom Tabs & Native Stack)
- **Database:** [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) - Lưu trữ dữ liệu cục bộ an toàn.
- **Icons:** [Ionicons](https://ionicons.com/) (qua Expo Vector Icons)
- **Networking:** [Axios](https://axios-http.com/) - Kết nối với dịch vụ Gemini AI.
- **AI Integration:** Google Generative AI (Gemini API).

---

## 📦 Cài Đặt & Chạy Ứng Dụng

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Cài đặt các thư viện bổ trợ:**
   ```bash
   npm install
   ```

3. **Chạy server phát triển:**
   ```bash
   npx expo start
   ```

4. **Chạy trên thiết bị:**
   - Quét mã QR bằng ứng dụng **Expo Go** (Android) hoặc **Camera** (iOS).

---

## 📂 Cấu Trúc Thư Mục

- `screens/`: Chứa các màn hình chính (Calculator, Fortune, Tarot, v.v.).
- `services/`: Xử lý logic API và kết nối với Gemini AI.
- `database/`: Cấu hình SQLite và các hàm tương tác dữ liệu.
- `navigation/`: Cấu hình điều hướng giữa các màn hình.
- `components/`: Các thành phần giao diện (UI) có thể tái sử dụng.
- `data/`: Chứa dữ liệu tĩnh (danh sách các lá bài Tarot, v.v.).
- `utils/`: Các hàm hỗ trợ và logic xử lý chung.

---

*Dự án được phát triển như một phần của môn học MMA301.*
