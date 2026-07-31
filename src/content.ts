import { PROJECT_IDS } from './route-manifest'
import type { Locale, LocaleContent, LocalizedCaseStudy, ProjectId, ProjectMedia } from './types'

export const sharedProjectMedia = {
  'xtts-fine-tuning': { base: 'xtts-signal', width: 1440, height: 960 },
  'face-tracking': { base: 'vision-tracking', width: 1440, height: 960 },
  'speech-transcription': { base: 'speech-transcription', width: 1440, height: 960 },
  'gender-classification': { base: 'gender-classifier', width: 1440, height: 960 },
} as const satisfies Record<ProjectId, ProjectMedia>

export const localeContent = {
  tr: {
    locale: 'tr',
    languageName: 'Türkçe',
    seo: {
      homeTitle: 'Mehmet Tüysüz | Yapay zekâ ve sistemler',
      homeDescription: 'Mehmet Tüysüz’ün yapay zekâ, görüntü, ses ve model sistemleri üzerine seçili çalışmaları.',
      ogDescription: 'Yapay zekâ, gerçek zamanlı algı ve model sistemleri üzerine seçili çalışmalar.',
      ogLocale: 'tr_TR',
      ogImageAlt: 'Mehmet Tüysüz kişisel site önizlemesi',
      notFoundTitle: 'Sayfa bulunamadı | Mehmet Tüysüz',
      notFoundDescription: 'Aradığınız sayfa bulunamadı.',
    },
    aria: {
      skipHome: 'Ana içeriğe geç',
      skipProject: 'Proje detayına geç',
      mainNav: 'Ana menü',
      homeLink: 'Mehmet Tüysüz ana sayfa',
      languageGroup: 'Dil seçimi',
      openProject: (title) => `${title} detayını aç`,
      ongoingList: 'Devam eden çalışmalar listesi',
      expertiseList: 'Çalışma alanları',
    },
    nav: { about: 'Hakkımda', projects: 'Projeler', contact: 'İletişim' },
    hero: {
      title: 'Mehmet Tüysüz',
      intro: 'Yapay zekâ, gerçek zamanlı algı ve özel donanım arasında çalışan sistemler geliştiriyorum.',
      projectsCta: 'Projeler',
    },
    about: {
      title: 'Hakkımda',
      intro: [
        'Adım Mehmet. 18 yaşındayım; liseyi yeni bitirdim ve üniversite sınavına hazırlanıyorum. Yaklaşık dört yıldır merak ettiğim fikirleri kendi kendime öğrenerek projelere dönüştürüyorum.',
        'Computer Vision, LLM fine-tuning, inference ve model optimizasyonu üzerine çalıştım. MCP tabanlı araçları ve agentic coding akışlarını bir araya getiriyorum. Kodun her satırını tek başıma yazmaktan çok, problemi tanımlama, doğru araçları yönlendirme, deneme ve ortaya çıkan sistemi iyileştirme tarafına odaklanıyorum.',
        'Uygulamalar ve küçük web siteleri de yaptım. Çalışmalarımın çoğu merak için başladı ve kendi bilgisayarımda kaldı. Bu site, ürettiklerimi ilk kez düzenli biçimde paylaştığım yer.',
      ],
      expertise: [
        { title: 'Görüntü ve modeller', body: 'Computer Vision, yüz analizi ve gerçek zamanlı görüntü pipeline’ları.' },
        { title: 'Model çalışmaları', body: 'LLM fine-tuning, inference ve model optimizasyonu.' },
        { title: 'Agentic sistemler', body: 'MCP araç entegrasyonları, coding-agent akışları ve çoklu uzman orkestrasyonu.' },
      ],
    },
    projectsSection: {
      title: 'Seçili projeler',
      intro: 'Ses, görüntü ve model sistemlerinden dört çalışma.',
      inspect: 'İncele',
    },
    projects: {
      'xtts-fine-tuning': {
        slug: 'xtts-v2-fine-tuning',
        title: 'XTTS-v2 üzerinde kapsamlı fine-tuning',
        shortTitle: 'XTTS-v2 fine-tuning',
        summary: 'Türkçe tek konuşmacılı bir veri seti üzerinde XTTS-v2’yi özelleştiren, veri seçiminden 24 kHz inference’a uzanan deneysel bir ses arşivi oluşturdum.',
        alt: 'Ses dalgalarını çağrıştıran katmanlı yüzeylerden oluşan soyut editoryal görsel',
        what: '359 WAV’lık arşivi inceleyip 183 kaydı, toplam yaklaşık 15 dakika 25 saniyelik seçili konuşma olarak hazırladım. GPT ve audio-token katmanlarını fine-tune ettim; 24 kHz inference ile AudioSR denemelerini aynı akışta topladım.',
        why: 'Mayıs 2025 civarında başladığımda XTTS-v2, Türkçe bilen en güçlü TTS seçeneklerinden biriydi. Buna rağmen uygulanabilir ve güncel bir fine-tuning hattı yoktu. Bulduğum örnekler eski, kırık veya terk edilmiş olduğu için doğrudan çalışmıyordu. Bu yüzden az veriyle de yeniden çalıştırılabilen eğitim ve inference akışını kendim kurdum. Amacım, veri hazırlamadan checkpoint yönetimine ve inference’a kadar bütün adımların yeniden üretilebilir olmasıydı.',
        result: 'One-shot benzetimden farklı olarak, sesi eğitim boyunca daha derinlemesine klonlayabilen deneysel bir model ortaya çıktı. Kısıtlı veriyle kendi kullanımımda iyi sonuç verdi. İki saatten fazla temiz veriyle muhtemelen daha güçlü bir sonuç potansiyeli olduğunu düşünüyorum. Yine de eğitim aşamalarında kapatılması gereken eksikler var.',
      },
      'face-tracking': {
        slug: 'gercek-zamanli-yuz-takibi',
        title: 'Gerçek zamanlı yüz tanıma ve takip sistemi',
        shortTitle: 'Yüz tanıma ve takip',
        summary: 'Tek kare kararları yerine kalite katmanları ve çoklu kare kanıtı kullanan gerçek zamanlı yüz tanıma ve takip prototipi geliştirdim.',
        alt: 'Anonim yüz formlarının kamera kareleri boyunca hareket izini gösteren editoryal takip görseli',
        what: 'Çift detector yaklaşımını ByteTrack izleme ile birleştirdim. Kaliteye göre seçilen yüz temsillerini FAISS üzerinde eşleyip tek kare yerine çoklu kare uzlaşmasıyla karar verdim; bilinmeyen yüzleri kümelere ayırıp zamanla güncellenen prototiplerle ele aldım.',
        why: 'Bulanıklık, poz ve ışık değişimleri tek karede güvenilir kimlik kararı vermeyi zorlaştırıyor. Sistemin hareket boyunca kimliği koruması ve belirsiz örnekleri aceleyle etiketlememesi gerekiyordu.',
        result: 'Kalite katmanları, çoklu kare kararı ve bilinmeyen yüz kümelerini birlikte ele alan bütünleşik bir araştırma prototipi oluştu. Kendi kullanım testlerimde düşük ışıkta ve aynı anda birden fazla kişiyi tanıma senaryolarında yüksek başarı gösterdi. Bu kişisel bir gözlem; eşik kalibrasyonu, standart testler ve tekrarlanabilir değerlendirme hâlâ açık çalışma alanları.',
      },
      'speech-transcription': {
        slug: 'ses-tanima-transkripsiyon',
        title: 'Ses tanıma ve transkripsiyon sistemi',
        shortTitle: 'Ses tanıma ve transkripsiyon',
        summary: 'Konuşmayı alan, işleyen ve okunabilir metne dönüştüren akışı farklı kayıt koşullarında anlaşılır sonuç verecek biçimde ele aldım.',
        alt: 'Konuşmadan metne geçişi çağrıştıran kesilmiş şeritler ve ses izlerinden oluşan soyut görsel',
        what: 'Ses girişini parçalara ayıran, konuşmayı çözen ve çıktıyı okunabilir bir metin akışına dönüştüren uçtan uca bir düzen kurdum.',
        why: 'Gerçek kayıtlar temiz stüdyo sesi gibi davranmıyor. Gürültü, duraklama ve farklı konuşma ritimleri karşısında metnin takip edilebilir kalmasını hedefledim.',
        result: 'Ses tanıma ve transkripsiyon akışını uçtan uca anlamak için hazırladığım dar kapsamlı bir entegrasyon çalışmasıydı. Başlangıç seviyesinde yeniden kurulabilecek ölçekte olması, sonraki daha karmaşık ses projeleri için temiz bir temel oluşturmamı sağladı.',
      },
      'gender-classification': {
        slug: 'cinsiyet-siniflandirma-modeli',
        title: 'Gerçek zamanlı cinsiyet sınıflandırma modeli',
        shortTitle: 'Cinsiyet sınıflandırma modeli',
        summary: 'Canlı yüz akışında çalışan kompakt bir sınıflandırıcı geliştirdim. Model, güven düşük olduğunda zorla karar vermek yerine çıktıyı “belirsiz” olarak bırakıyor.',
        alt: 'Gri tonlu kadın yüzü ile arkasında sıralanan altı CNN özellik katmanından oluşan teknik kompozisyon',
        what: '100×100 gri crop alan, altı katmanlı kompakt CNN’i hazırlayıp gerçek zamanlı yüz pipeline’ına entegre ettim. Düşük güvenli çıktıyı “belirsiz” olarak koruyan karar eşiği ekledim.',
        why: 'Hazır bir modeli kör kullanmak yerine, pipeline’ın gecikme ve kontrol gereksinimine uyan, emin olmadığı örnekte zorla sınıf üretmeyen bir bileşen istedim.',
        result: 'Çalışan yaklaşık 15 MB model canlı pipeline’da kullanılıyor. Sonraki açık işler veri dengesi, karar eşiği kalibrasyonu ve ölçülebilir doğrulama.',
      },
    },
    ongoing: {
      eyebrow: 'Şu anda',
      title: 'Devam eden çalışmalar',
      intro: 'Şu anda odağımda olan üç çalışma hattı.',
      items: [
        'XTTS-v2 eğitim kodundaki eksikleri kapatıyor; veri hazırlama, checkpoint ve inference akışını daha tekrarlanabilir hâle getiriyorum.',
        'Birden fazla kişinin aynı anda konuştuğu kayıtlarda sesleri ayırıp her konuşmacıyı ayrı anlamlandıran bir katman geliştiriyorum.',
        'Wallpaper Engine’e alternatif, masaüstünü statik bir arka planın ötesine taşıyan daha hafif ve etkileşimli bir araç geliştiriyorum.',
      ],
    },
    footer: {
      identity: 'Ses, görüntü ve donanım sistemleri geliştiriyorum.',
      pages: 'Sayfalar',
      links: 'Bağlantılar',
      ongoing: 'Devam eden çalışmalar',
      email: 'E-posta',
      copyright: '© 2026 Mehmet Tüysüz.',
    },
    detail: {
      context: 'Seçili çalışma',
      what: 'Ne yaptım',
      why: 'Neden yaptım',
      result: 'Sonuç',
      close: 'Kapat',
      backHome: 'Ana sayfaya dön',
    },
    notFound: {
      eyebrow: 'Sayfa bulunamadı',
      title: 'Burada bir sayfa yok.',
      body: 'Bağlantı değişmiş veya yanlış yazılmış olabilir.',
      backHome: 'Ana sayfaya dön',
    },
    language: { tr: 'Türkçe', en: 'English', current: 'Seçili dil' },
  },
  en: {
    locale: 'en',
    languageName: 'English',
    seo: {
      homeTitle: 'Mehmet Tüysüz | AI and systems',
      homeDescription: 'Selected work by Mehmet Tüysüz across AI, computer vision, speech, and model systems.',
      ogDescription: 'Selected work across AI, real-time perception, speech, and model systems.',
      ogLocale: 'en_US',
      ogImageAlt: 'Preview of Mehmet Tüysüz’s personal site',
      notFoundTitle: 'Page not found | Mehmet Tüysüz',
      notFoundDescription: 'The page you were looking for could not be found.',
    },
    aria: {
      skipHome: 'Skip to main content',
      skipProject: 'Skip to project details',
      mainNav: 'Main navigation',
      homeLink: 'Mehmet Tüysüz home',
      languageGroup: 'Language selection',
      openProject: (title) => `Open details for ${title}`,
      ongoingList: 'Ongoing work list',
      expertiseList: 'Areas of work',
    },
    nav: { about: 'About', projects: 'Projects', contact: 'Contact' },
    hero: {
      title: 'Mehmet Tüysüz',
      intro: 'I build systems across AI, real-time perception, and custom hardware.',
      projectsCta: 'Projects',
    },
    about: {
      title: 'About',
      intro: [
        'I’m Mehmet, 18. I recently finished high school and I’m preparing for the university entrance exam. For about four years, I’ve been teaching myself by turning the ideas I’m curious about into working projects.',
        'I’ve worked on computer vision, LLM fine-tuning, inference, and model optimization. I also connect MCP-based tools with agentic coding workflows. Rather than writing every line alone, I focus on defining the problem, directing the right tools, testing the result, and improving the system.',
        'I’ve built apps and small websites too. Most of this work began out of curiosity and stayed on my own computer. This is the first site where I’m sharing it in an organized way.',
      ],
      expertise: [
        { title: 'Vision and models', body: 'Computer vision, face analysis, and real-time image pipelines.' },
        { title: 'Model work', body: 'LLM fine-tuning, inference, and model optimization.' },
        { title: 'Agentic systems', body: 'MCP tool integrations, coding-agent workflows, and multi-specialist orchestration.' },
      ],
    },
    projectsSection: {
      title: 'Selected projects',
      intro: 'Four studies across speech, vision, and model systems.',
      inspect: 'View project',
    },
    projects: {
      'xtts-fine-tuning': {
        slug: 'xtts-v2-fine-tuning',
        title: 'Extensive fine-tuning on XTTS-v2',
        shortTitle: 'XTTS-v2 fine-tuning',
        summary: 'I built an experimental Turkish voice archive around XTTS-v2 adapted on a single-speaker dataset, covering data selection through 24 kHz inference.',
        alt: 'Abstract editorial artwork built from layered surfaces that suggest audio waves',
        what: 'I reviewed an archive of 359 WAV files and selected 183 recordings, totaling about 15 minutes and 25 seconds of speech. I fine-tuned the GPT and audio-token layers, then brought 24 kHz inference and AudioSR experiments into the same workflow.',
        why: 'When I started around May 2025, XTTS-v2 was one of the strongest TTS options with Turkish support. There was still no current, practical fine-tuning pipeline I could apply directly. The examples I found were outdated, broken, or abandoned, so I built a low-data training and inference workflow myself, from data preparation through checkpoint handling and reproducible inference.',
        result: 'Unlike one-shot imitation, the experimental model learns the voice more deeply throughout training. It gave me good results in my own use despite the limited data. I think more than two hours of clean recordings could probably unlock much stronger potential, but parts of the training workflow still need to be closed and tested.',
      },
      'face-tracking': {
        slug: 'real-time-face-tracking',
        title: 'Real-time face recognition and tracking',
        shortTitle: 'Face recognition and tracking',
        summary: 'I built a real-time face recognition and tracking prototype that relies on quality tiers and evidence across multiple frames instead of a single-frame decision.',
        alt: 'Editorial tracking artwork showing anonymous face forms moving across camera frames',
        what: 'I paired two detector paths with ByteTrack. Quality-filtered embeddings are matched through FAISS, then resolved with consensus across multiple frames rather than one image. Unknown faces are clustered and handled through prototypes that can be updated over time.',
        why: 'Blur, pose, and lighting shifts make identity decisions from a single frame unreliable. The system needed to preserve identity through movement and avoid labeling uncertain samples too quickly.',
        result: 'The result is an integrated research prototype that combines quality tiers, multi-frame decisions, and unknown-face clusters. In my own use it performed strongly in low light and while recognizing several people at once. That is a personal observation, not a benchmark; threshold calibration, standardized tests, and repeatable evaluation remain open work.',
      },
      'speech-transcription': {
        slug: 'speech-recognition-transcription',
        title: 'Speech recognition and transcription system',
        shortTitle: 'Speech recognition and transcription',
        summary: 'I explored the full path from recorded speech to readable text, with an emphasis on keeping the output understandable across different recording conditions.',
        alt: 'Abstract artwork of cut strips and audio traces suggesting a transition from speech to text',
        what: 'I assembled an end-to-end flow that segments audio input, resolves speech, and turns the result into a readable stream of text.',
        why: 'Real recordings do not behave like clean studio audio. I wanted the text to remain easy to follow through noise, pauses, and different speaking rhythms.',
        result: 'I kept this integration deliberately narrow so I could understand the speech-recognition and transcription flow end to end. Its beginner-rebuildable scale gave me a clean base for the more complex audio projects that followed.',
      },
      'gender-classification': {
        slug: 'gender-classification-model',
        title: 'Real-time gender classification model',
        shortTitle: 'Gender classification model',
        summary: 'I built a compact classifier for a live face pipeline. When confidence is low, it keeps the output uncertain instead of forcing a class.',
        alt: 'Technical composition showing a grayscale woman’s face followed by six CNN feature layers',
        what: 'I prepared a compact six-block CNN that receives a 100×100 grayscale crop and integrated it into the real-time face pipeline. I added a decision threshold that preserves low-confidence output as uncertain.',
        why: 'Rather than use an off-the-shelf model blindly, I wanted a component that fit the pipeline’s latency and control needs and did not force a class when it was unsure.',
        result: 'The working model is about 15 MB and runs inside the live pipeline. The next open tasks are data balance, threshold calibration, and measurable validation.',
      },
    },
    ongoing: {
      eyebrow: 'In progress',
      title: 'Ongoing work',
      intro: 'Three tracks currently holding my attention.',
      items: [
        'I’m closing gaps in the XTTS-v2 training code and making data preparation, checkpoints, and inference more repeatable.',
        'I’m building a layer that separates overlapping voices in multi-speaker recordings and interprets each speaker independently.',
        'I’m developing a lighter, interactive alternative to Wallpaper Engine that takes the desktop beyond a static background.',
      ],
    },
    footer: {
      identity: 'I build systems across speech, vision, and custom hardware.',
      pages: 'Pages',
      links: 'Links',
      ongoing: 'Ongoing work',
      email: 'Email',
      copyright: '© 2026 Mehmet Tüysüz.',
    },
    detail: {
      context: 'Selected work',
      what: 'What I built',
      why: 'Why I built it',
      result: 'Result',
      close: 'Close',
      backHome: 'Back to home',
    },
    notFound: {
      eyebrow: 'Page not found',
      title: 'There’s nothing here.',
      body: 'The link may have changed or been entered incorrectly.',
      backHome: 'Back to home',
    },
    language: { tr: 'Türkçe', en: 'English', current: 'Current language' },
  },
} as const satisfies Record<Locale, LocaleContent>

export function getLocaleContent(locale: Locale): LocaleContent {
  return localeContent[locale]
}

export function getProject(locale: Locale, projectId: ProjectId): LocalizedCaseStudy {
  return { id: projectId, ...localeContent[locale].projects[projectId], ...sharedProjectMedia[projectId] }
}

export function getProjects(locale: Locale): readonly LocalizedCaseStudy[] {
  return PROJECT_IDS.map((projectId) => getProject(locale, projectId))
}
