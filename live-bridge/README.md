# Hürrem TikTok LIVE bağlantısı

1. Windows'a https://nodejs.org üzerinden Node.js LTS kurun.
2. GitHub deposunu ZIP olarak indirin, ZIP'i açın.
3. `live-bridge/start.bat` dosyasını çift tıklayın. İlk çalıştırmada npm paketleri kurulur.
4. Chrome'da **http://127.0.0.1:8765** adresini açın (GitHub Pages adresini değil).
5. TikTok LIVE Studio'da bu Chrome penceresini **Pencere Yakalama** ile yayına ekleyin veya tarayıcı kaynağına `http://127.0.0.1:8765` yazın.
6. Oyunda **30 sn başlat** ve gerekirse **Müzik aç** düğmelerini kullanın.
7. TikTok hesabı gerçekten LIVE yayında olmalıdır. LIVE/Gifts yetkisi yoksa otomatik hediye alınamaz.

## Test
Tarayıcıdan `http://127.0.0.1:8765/test?user=deneme&gift=rose` adresini açarak kadın katılımcı ekleyin. Diğer testler: `gift=tiktok`, `gift=3-jeton`, `gift=10-hurrem`, `gift=10-kanuni`. Test sayfası yalnızca kendi bilgisayarınızdan çalışır.

## Hediye eşleştirme
`gifts.json` içindeki `gifts` alanı hediye adlarını, `ids` alanı hediye ID'lerini karakterlere bağlar. Değerler `female`, `male`, `mehter`, `hurrem`, `kanuni` olabilir. 3 ve 10 jetonluk hediye isimleri henüz gerçek katalogdan doğrulanmadığı için **geçici test anahtarlarıdır**. Gerçek hediye geldiğinde terminalde adı ve ID'si yazılır. Bunları `gifts.json` içine ekleyip programı yeniden başlatın.

## Notlar
Bu, TikTok'un resmî API'si değil, topluluk tarafından geliştirilen `tiktok-live-connector` kütüphanesidir; TikTok değişikliklerinde bağlantı kesilebilir. Node.js programı açık kalmalıdır. Oyun dosyaları GitHub Pages'ten yerel köprü üzerinden yüklenir; internet bağlantısı gereklidir.
