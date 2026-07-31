import type { CaseStudy } from './types'

export const aboutContent = {
  intro: [
    'Adım Mehmet. 18 yaşındayım; liseyi yeni bitirdim ve üniversite sınavına hazırlanıyorum. Yaklaşık dört yıldır merak ettiğim fikirleri kendi kendime öğrenerek projelere dönüştürüyorum.',
    'Computer Vision, LLM fine-tuning, inference ve model optimizasyonu üzerine çalıştım. MCP tabanlı araçları ve agentic coding akışlarını bir araya getiriyorum. Kodun her satırını tek başıma yazmaktan çok, problemi tanımlama, doğru araçları yönlendirme, deneme ve ortaya çıkan sistemi iyileştirme tarafına odaklanıyorum.',
    'Uygulamalar ve küçük web siteleri de yaptım. Çalışmalarımın çoğu merak için başladı ve kendi bilgisayarımda kaldı. Bu site, ürettiklerimi ilk kez düzenli biçimde paylaştığım yer.',
  ],
  expertise: [
    {
      title: 'Görüntü ve modeller',
      body: 'Computer Vision, yüz analizi ve gerçek zamanlı görüntü pipeline’ları.',
    },
    {
      title: 'Model çalışmaları',
      body: 'LLM fine-tuning, inference ve model optimizasyonu.',
    },
    {
      title: 'Agentic sistemler',
      body: 'MCP araç entegrasyonları, coding-agent akışları ve çoklu uzman orkestrasyonu.',
    },
  ],
} as const

export const caseStudies = [
  {
    slug: 'xtts-v2-fine-tuning',
    title: 'XTTS-v2 üzerinde kapsamlı fine-tuning',
    shortTitle: 'XTTS-v2 fine-tuning',
    summary:
      'Türkçe tek konuşmacılı bir veri seti üzerinde XTTS-v2’yi özelleştiren, veri seçiminden 24 kHz inference’a uzanan deneysel bir ses arşivi oluşturdum.',
    image: {
      base: 'xtts-signal',
      alt: 'Ses dalgalarını çağrıştıran katmanlı kobalt yüzeylerden oluşan soyut editoryal görsel',
      width: 1440,
      height: 960,
    },
    what:
      '359 WAV’lık arşivi inceleyip 183 kaydı, toplam yaklaşık 15 dakika 25 saniyelik seçili konuşma olarak hazırladım. GPT ve audio-token katmanlarını fine-tune ettim; 24 kHz inference ile AudioSR denemelerini aynı akışta topladım.',
    why:
      'Mayıs 2025 civarında başladığımda XTTS-v2, Türkçe bilen en güçlü TTS seçeneklerinden biriydi. Buna rağmen uygulanabilir ve güncel bir fine-tuning hattı yoktu. Bulduğum örnekler eski, kırık veya terk edilmiş olduğu için doğrudan çalışmıyordu. Bu yüzden az veriyle de yeniden çalıştırılabilen eğitim ve inference akışını kendim kurdum. Amacım, veri hazırlamadan checkpoint yönetimine ve inference’a kadar bütün adımların yeniden üretilebilir olmasıydı.',
    result:
      'One-shot benzetimden farklı olarak, sesi eğitim boyunca daha derinlemesine klonlayabilen deneysel bir model ortaya çıktı. Kısıtlı veriyle kendi kullanımımda iyi sonuç verdi. İki saatten fazla temiz veriyle muhtemelen daha güçlü bir sonuç potansiyeli olduğunu düşünüyorum. Yine de eğitim aşamalarında kapatılması gereken eksikler var.',
  },
  {
    slug: 'gercek-zamanli-yuz-takibi',
    title: 'Gerçek zamanlı yüz tanıma ve takip sistemi',
    shortTitle: 'Yüz tanıma ve takip',
    summary:
      'Tek kare kararları yerine kalite katmanları ve çoklu kare kanıtı kullanan gerçek zamanlı yüz tanıma ve takip prototipi geliştirdim.',
    image: {
      base: 'vision-tracking',
      alt: 'Anonim yüz formlarının kamera kareleri boyunca hareket izini gösteren editoryal takip görseli',
      width: 1440,
      height: 960,
    },
    what:
      'Çift detector yaklaşımını ByteTrack izleme ile birleştirdim. Kaliteye göre seçilen yüz temsillerini FAISS üzerinde eşleyip tek kare yerine çoklu kare uzlaşmasıyla karar verdim; bilinmeyen yüzleri kümelere ayırıp zamanla güncellenen prototiplerle ele aldım.',
    why:
      'Bulanıklık, poz ve ışık değişimleri tek karede güvenilir kimlik kararı vermeyi zorlaştırıyor. Sistemin hareket boyunca kimliği koruması ve belirsiz örnekleri aceleyle etiketlememesi gerekiyordu.',
    result:
      'Kalite katmanları, çoklu kare kararı ve bilinmeyen yüz kümelerini birlikte ele alan bütünleşik bir araştırma prototipi oluştu. Kendi kullanım testlerimde düşük ışıkta ve aynı anda birden fazla kişiyi tanıma senaryolarında yüksek başarı gösterdi. Bu kişisel bir gözlem; eşik kalibrasyonu, standart testler ve tekrarlanabilir değerlendirme hâlâ açık çalışma alanları.',
  },
  {
    slug: 'ses-tanima-transkripsiyon',
    title: 'Ses tanıma ve transkripsiyon sistemi',
    shortTitle: 'Ses tanıma ve transkripsiyon',
    summary:
      'Konuşmayı alan, işleyen ve okunabilir metne dönüştüren akışı farklı kayıt koşullarında anlaşılır sonuç verecek biçimde ele aldım.',
    image: {
      base: 'speech-transcription',
      alt: 'Konuşmadan metne geçişi çağrıştıran kesilmiş şeritler ve ses izlerinden oluşan soyut görsel',
      width: 1440,
      height: 960,
    },
    what:
      'Ses girişini parçalara ayıran, konuşmayı çözen ve çıktıyı okunabilir bir metin akışına dönüştüren uçtan uca bir düzen kurdum.',
    why:
      'Gerçek kayıtlar temiz stüdyo sesi gibi davranmıyor. Gürültü, duraklama ve farklı konuşma ritimleri karşısında metnin takip edilebilir kalmasını hedefledim.',
    result:
      'Ses tanıma ve transkripsiyon akışını uçtan uca anlamak için hazırladığım dar kapsamlı bir entegrasyon çalışmasıydı. Başlangıç seviyesinde yeniden kurulabilecek ölçekte olması, sonraki daha karmaşık ses projeleri için temiz bir temel oluşturmamı sağladı.',
  },
  {
    slug: 'cinsiyet-siniflandirma-modeli',
    title: 'Gerçek zamanlı cinsiyet sınıflandırma modeli',
    shortTitle: 'Cinsiyet sınıflandırma modeli',
    summary:
      'Canlı yüz akışında çalışan kompakt bir sınıflandırıcı geliştirdim. Model, güven düşük olduğunda zorla karar vermek yerine çıktıyı “belirsiz” olarak bırakıyor.',
    image: {
      base: 'gender-classifier',
      alt: 'Gri tonlu kadın yüzü ile arkasında sıralanan altı CNN özellik katmanından oluşan teknik kompozisyon',
      width: 1440,
      height: 960,
    },
    what:
      '100×100 gri crop alan, altı katmanlı kompakt CNN’i hazırlayıp gerçek zamanlı yüz pipeline’ına entegre ettim. Düşük güvenli çıktıyı “belirsiz” olarak koruyan karar eşiği ekledim.',
    why:
      'Hazır bir modeli kör kullanmak yerine, pipeline’ın gecikme ve kontrol gereksinimine uyan, emin olmadığı örnekte zorla sınıf üretmeyen bir bileşen istedim.',
    result:
      'Çalışan yaklaşık 15 MB model canlı pipeline’da kullanılıyor. Sonraki açık işler veri dengesi, karar eşiği kalibrasyonu ve ölçülebilir doğrulama.',
  },
] as const satisfies readonly CaseStudy[]

export const ongoingWorkItems = [
  'XTTS-v2 eğitim kodundaki eksikleri kapatıyor; veri hazırlama, checkpoint ve inference akışını daha tekrarlanabilir hâle getiriyorum.',
  'Birden fazla kişinin aynı anda konuştuğu kayıtlarda sesleri ayırıp her konuşmacıyı ayrı anlamlandıran bir katman geliştiriyorum.',
  'Wallpaper Engine’e alternatif, masaüstünü statik bir arka planın ötesine taşıyan daha hafif ve etkileşimli bir araç geliştiriyorum.',
] as const

export function getCaseStudy(slug: string | undefined): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug)
}

export function hasUniqueCaseStudySlugs(studies: readonly CaseStudy[]): boolean {
  return new Set(studies.map(({ slug }) => slug)).size === studies.length
}
