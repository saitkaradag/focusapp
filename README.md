# FocusApp - Odaklanma Takibi ve Raporlama Uygulaması

BSM 447 - Mobil Uygulama Geliştirme Dersi Dönem Projesi

## Proje Hakkında
Bu uygulama, Pomodoro tekniği ile odaklanma seansları düzenlemenizi ve dikkat dağınıklığınızı takip etmenizi sağlar. Seans verileriniz kaydedilir ve grafiklerle raporlanır.

## Özellikler
- **Zamanlayıcı**: 25 dakikalık odaklanma sayacı.
- **Kategori Seçimi**: Ders, Kodlama, Proje vb. kategoriler.
- **Dikkat Dağınıklığı Takibi**: Uygulamadan çıkıldığında otomatik tespit.
- **Raporlar**:
  - Günlük ve genel istatistikler.
  - Haftalık odaklanma süresi grafiği.
  - Kategori dağılım grafiği.

## Kurulum ve Çalıştırma

1. **Gereksinimler**: Node.js ve npm yüklü olmalıdır.
2. **Bağımlılıkları Yükle**:
   ```bash
   cd FocusApp
   npm install
   ```
3. **Projeyi Başlat**:
   ```bash
   npx expo start
   ```
   - Android için `a` tuşuna basın veya Expo Go uygulaması ile QR kodunu taratın.

## Kullanılan Teknolojiler
- React Native (Expo)
- React Navigation (Bottom Tabs)
- AsyncStorage (Veri Saklama)
- React Native Chart Kit (Grafikler)

## Geliştirici
- Mustafa Sait KARADAĞ - G221210372
