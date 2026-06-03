import fs from "fs";
import path from "path";

const root = path.resolve("src");
const pairs = [
  ["Liste yuklenemedi.", "Liste yüklenemedi."],
  ["Kayit basarisiz.", "Kayıt başarısız."],
  ["Silme basarisiz.", "Silme başarısız."],
  ["Yukleniyor...", "Yükleniyor…"],
  ["Kayit bulunamadi.", "Kayıt bulunamadı."],
  ["Duzenle", "Düzenle"],
  ["Iptal", "İptal"],
  ["Ogrenciler", "Öğrenciler"],
  ["Ogretmenler", "Öğretmenler"],
  ["Ogrenci", "Öğrenci"],
  ["Ogretmen", "Öğretmen"],
  ["Siniflar", "Sınıflar"],
  ["Gec kaldi", "Geç kaldı"],
  ["Islem basarisiz.", "İşlem başarısız."],
  ["Okunmamis:", "Okunmamış:"],
  ["Okunmadi", "Okunmadı"],
  ["Tumunu okundu yap", "Tümünü okundu yap"],
  ["Sayfa bulunamadi", "Sayfa bulunamadı"],
  ["Dashboard'a don", "Ana sayfaya dön"],
  ["Bu kaydi silmek istiyor musun?", "Bu kaydı silmek istiyor musunuz?"],
  ["Ders Programi", "Ders programı"],
  ["Tum gunler", "Tüm günler"],
  ["Yeni satir", "Yeni satır"],
  ["Cakisma ozeti", "Çakışma özeti"],
  ["Program satiri duzenle", "Program satırı düzenle"],
  ["Yeni program satiri", "Yeni program satırı"],
  ["Program satirini sec", "Program satırını seç"],
  ["Program satiri", "Program satırı"],
  ["Tumunu geldi", "Tümünü geldi"],
  ["Tumunu gelmedi", "Tümünü gelmedi"],
  ["Baslik ve icerik zorunlu.", "Başlık ve içerik zorunludur."],
  ["Sinif duyurusu icin sinif secimi zorunlu.", "Sınıf duyurusu için sınıf seçimi zorunludur."],
  ["Bu duyuruyu silmek istiyor musun?", "Bu duyuruyu silmek istiyor musunuz?"],
  ["Baslik", "Başlık"],
  ["Icerik", "İçerik"],
  ["Yayinla", "Yayınla"],
  ["Veli adi", "Veli adı"],
  ["Sinif adi", "Sınıf adı"],
  ["Ders adi ve kodu zorunlu.", "Ders adı ve kodu zorunludur."],
  ["Ders adi", "Ders adı"],
  ["Ad, e-posta ve sinif zorunlu.", "Ad, e-posta ve sınıf zorunludur."],
  ["Ad, e-posta ve brans zorunlu.", "Ad, e-posta ve branş zorunludur."],
  ["Sinif adi, seviye ve kapasite zorunlu.", "Sınıf adı, seviye ve kapasite zorunludur."],
  ["Sinif, ogretmen ve ders secimi zorunlu.", "Sınıf, öğretmen ve ders seçimi zorunludur."],
  ["Bu program satirini silmek istiyor musun?", "Bu program satırını silmek istiyor musunuz?"],
  ["Veri yuklenemedi.", "Veri yüklenemedi."],
  ["Yoklama yuklenemedi.", "Yoklama yüklenemedi."],
  ["Service layer uzerinden", "Servis katmanı üzerinden"],
  ["Mock veri ile CRUD iskeleti.", "Mock veri ile CRUD ekranı."],
  ["Ogrenci atama sonraki adim.", "Öğrenci ataması sonraki adım."],
  [
    "Duyuru olusturma + listeleme (mock). Yeni duyuru bildirim merkezine duser.",
    "Duyuru oluşturma ve listeleme. Yeni duyuru bildirim merkezine düşer."
  ],
  ["Kapsam: genel veya sinif bazli.", "Kapsam: genel veya sınıf bazlı."],
  ["Sinif cakismasi:", "Sınıf çakışması:"],
  ["Ogretmen cakismasi:", "Öğretmen çakışması:"],
  ["Derslik cakismasi:", "Derslik çakışması:"],
  ["baska ders var.", "başka ders var."],
  ["araligiyla cakisiyor.", "aralığıyla çakışıyor."],
  ["Sinif bulunamadi.", "Sınıf bulunamadı."],
  ["Ogretmen bulunamadi.", "Öğretmen bulunamadı."],
  ["Program satiri bulunamadi.", "Program satırı bulunamadı."],
  ["Ders bulunamadi.", "Ders bulunamadı."],
  ["Bu sinifta aktif ogrenci bulunamadi (mock veri).", "Bu sınıfta aktif öğrenci bulunamadı."],
  ["siniftaki aktif ogrenciler icin durum isaretle (mock).", "sınıftaki aktif öğrenciler için durum işaretleyin."],
  ["Secilen sinif:", "Seçilen sınıf:"],
  ["Iletisim", "İletişim"],
  ["Brans", "Branş"],
  ["Yeni ogrenci", "Yeni öğrenci"],
  ["Yeni ogretmen", "Yeni öğretmen"],
  ["Yeni sinif", "Yeni sınıf"],
  ["Sinif duzenle", "Sınıf düzenle"],
  ["Ogretmen duzenle", "Öğretmen düzenle"],
  ["Ogrenci duzenle", "Öğrenci düzenle"],
  ["Ders duzenle", "Ders düzenle"],
  ["Mock CRUD + sinif/ogretmen/derslik cakisma kontrolu (interval overlap).", "Sınıf, öğretmen ve derslik çakışma kontrolü."],
  ["Gun", "Gün"],
  ["Baslangic", "Başlangıç"],
  ["Bitis", "Bitiş"],
  ["Sinif", "Sınıf"],
  ["12-A sinifi icin veli toplantisi Cuma gunu saat 17:00'de.", "12-A sınıfı için veli toplantısı Cuma günü saat 17:00'de."],
  ["Deneme sinavi takvimi guncellendi. Lutfen panelden kontrol edin.", "Deneme sınavı takvimi güncellendi. Lütfen panelden kontrol edin."],
  ["Genel duyuru yayinlandi.", "Genel duyuru yayınlandı."],
  ["Program hatirlatmasi", "Program hatırlatması"],
  ["Yarin 09:00'da Matematik dersi var.", "Yarın 09:00'da Matematik dersi var."],
  ["Admin, mudur ve ogretmen paneli.", "Yönetici, müdür ve öğretmen paneli."],
  ["Ornek:", "Örnek:"],
  ["dosyasini", "dosyasını"],
  ["Ozet", "Özet"],
  ["Form alanlari SRS’deki ogrenci yonetimiyle uyumlu basit bir baslangic.", "Öğrenci kayıt alanları."],
  ["Brans alani UML’deki Teacher.branch ile uyumlu basit bir karsilik.", "Branş bilgisi."],
  ["UML Class entity’sine denk basit alanlar: name + meta (gradeLevel/capacity).", "Sınıf adı, seviye ve kapasite."],
  ["UML Course entity’sine denk basit alanlar: name (+ kod olarak pratik bir ek alan).", "Ders adı ve kodu."],
  ["UML Schedule alanlari: day, start/end, className, teacherId, courseId (+ room pratik alan).", "Gün, saat, sınıf, öğretmen ve ders bilgileri."]
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(js|jsx|md)$/.test(ent.name)) {
      let c = fs.readFileSync(p, "utf8");
      const orig = c;
      for (const [a, b] of pairs) c = c.split(a).join(b);
      if (c !== orig) fs.writeFileSync(p, c, "utf8");
    }
  }
}

walk(root);
console.log("localized");
