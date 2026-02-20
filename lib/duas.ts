/**
 * Dua of the Day - 30 Ramazan gününe özel dualar
 * Her gün Ramazan ile alakalı, faydalı ve sahih dualar
 */

import { getRamadanDay } from './prayer';

export interface Dua {
  id: number;
  tr: {
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
  };
  en: {
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
  };
}

export const duas: Dua[] = [
  {
    id: 1,
    tr: {
      title: 'Ramazan Giriş Duası',
      arabic: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ وَالتَّوْفِيقِ لِمَا تُحِبُّ وَتَرْضَى',
      transliteration: 'Allahumma ahillahu alayna bil-amni wal-iman was-salamati wal-islam wat-tawfiqi lima tuhibbu wa tardha',
      translation: 'Allahım! Bu ayı bize güven, iman, selamet, İslam ve senin sevdiğin ve razı olduğun işlere muvaffakiyetle mübarek kıl.',
    },
    en: {
      title: 'Ramadan Entry Dua',
      arabic: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ وَالتَّوْفِيقِ لِمَا تُحِبُّ وَتَرْضَى',
      transliteration: 'Allahumma ahillahu alayna bil-amni wal-iman was-salamati wal-islam wat-tawfiqi lima tuhibbu wa tardha',
      translation: 'O Allah! Bring this month upon us with security, faith, safety, Islam, and success in what You love and are pleased with.',
    },
  },
  {
    id: 2,
    tr: {
      title: 'İftar Duası',
      arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
      transliteration: 'Allahumma inni laka sumtu wa bika aamantu wa alayka tawakkaltu wa ala rizqika aftartu',
      translation: 'Allahım! Senin için oruç tuttum, sana inandım, sana tevekkül ettim ve senin rızkınla iftar ettim.',
    },
    en: {
      title: 'Iftar Dua',
      arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
      transliteration: 'Allahumma inni laka sumtu wa bika aamantu wa alayka tawakkaltu wa ala rizqika aftartu',
      translation: 'O Allah! I fasted for You, I believe in You, I put my trust in You, and I break my fast with Your sustenance.',
    },
  },
  {
    id: 3,
    tr: {
      title: 'Sahur Niyeti',
      arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
      transliteration: 'Wa bisawmi ghadin nawwaytu min shahri ramadan',
      translation: 'Ramazan ayının yarınki orucuna niyet ettim.',
    },
    en: {
      title: 'Suhoor Intention',
      arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
      transliteration: 'Wa bisawmi ghadin nawwaytu min shahri ramadan',
      translation: 'I intend to fast tomorrow in the month of Ramadan.',
    },
  },
  {
    id: 4,
    tr: {
      title: 'Bağışlanma Duası',
      arabic: 'اللَّهُمَّ إِنَّكَ عُفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allahumma innaka afuwwun tuhibbul-afwa fa\'fu anni',
      translation: 'Allahım! Sen affedicisin, affetmeyi seversin, beni affet.',
    },
    en: {
      title: 'Forgiveness Dua',
      arabic: 'اللَّهُمَّ إِنَّكَ عُفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allahumma innaka afuwwun tuhibbul-afwa fa\'fu anni',
      translation: 'O Allah! You are Forgiving and love forgiveness, so forgive me.',
    },
  },
  {
    id: 5,
    tr: {
      title: 'Kur\'an ile Hidayet Duası',
      arabic: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
      transliteration: 'Allahumma irhamni bil-Quran wajalhu li imaman wa nuran wa huda wa rahmatan',
      translation: 'Allahım! Bana Kur\'an ile merhamet et ve onu benim için önder, nur, hidayet ve rahmet kıl.',
    },
    en: {
      title: 'Quran Guidance Dua',
      arabic: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
      transliteration: 'Allahumma irhamni bil-Quran wajalhu li imaman wa nuran wa huda wa rahmatan',
      translation: 'O Allah! Have mercy on me through the Quran and make it a guide, light, guidance, and mercy for me.',
    },
  },
  {
    id: 6,
    tr: {
      title: 'Rızık ve Bereket Duası',
      arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَمَضَانَ وَبَارِكْ لَنَا فِيمَا رَزَقْتَنَا',
      transliteration: 'Allahumma barik lana fi ramadan wa barik lana fima razaqtana',
      translation: 'Allahım! Ramazan\'da bize bereket ver ve bize verdiğin rızıkta bereket ver.',
    },
    en: {
      title: 'Sustenance and Blessing Dua',
      arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَمَضَانَ وَبَارِكْ لَنَا فِيمَا رَزَقْتَنَا',
      transliteration: 'Allahumma barik lana fi ramadan wa barik lana fima razaqtana',
      translation: 'O Allah! Bless us in Ramadan and bless us in what You have provided us.',
    },
  },
  {
    id: 7,
    tr: {
      title: 'Sabır Duası',
      arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      transliteration: 'Allahumma a\'inni ala dhikrika wa shukrika wa husni ibadatika',
      translation: 'Allahım! Seni zikretmemde, sana şükretmemde ve sana güzel ibadet etmemde bana yardım et.',
    },
    en: {
      title: 'Patience and Worship Dua',
      arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      transliteration: 'Allahumma a\'inni ala dhikrika wa shukrika wa husni ibadatika',
      translation: 'O Allah! Help me to remember You, thank You, and worship You in the best manner.',
    },
  },
  {
    id: 8,
    tr: {
      title: 'Şükür Duası',
      arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ وَالشُّكْرُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ',
      transliteration: 'Allahumma lakal-hamdu wash-shukru kama yanbaghi lijalali wajhika wa azimi sultanika',
      translation: 'Allahım! Celal ve kibriyana ve azametli saltanatına layık hamd ve şükür sanadır.',
    },
    en: {
      title: 'Gratitude Dua',
      arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ وَالشُّكْرُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ',
      transliteration: 'Allahumma lakal-hamdu wash-shukru kama yanbaghi lijalali wajhika wa azimi sultanika',
      translation: 'O Allah! All praise and thanks are due to You as befits the glory of Your face and the greatness of Your majesty.',
    },
  },
  {
    id: 9,
    tr: {
      title: 'Hidayet ve Doğruluk Duası',
      arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي وَالْهَمْنِي التَّقْوَى',
      transliteration: 'Allahumma ihdini wa saddidni wa alhamni at-taqwa',
      translation: 'Allahım! Bana hidayet ver, beni doğrult ve bana takvayı ilham et.',
    },
    en: {
      title: 'Guidance and Righteousness Dua',
      arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي وَالْهَمْنِي التَّقْوَى',
      transliteration: 'Allahumma ihdini wa saddidni wa alhamni at-taqwa',
      translation: 'O Allah! Guide me, make me steadfast, and inspire me with piety.',
    },
  },
  {
    id: 10,
    tr: {
      title: 'Üzüntü ve Kederden Korunma',
      arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ وَالْعَجْزِ وَالْكَسَلِ',
      transliteration: 'Allahumma inni a\'udhu bika minal-hammi wal-huzni wal-ajzi wal-kasal',
      translation: 'Allahım! Senden üzüntü, keder, acizlik ve tembellikten sana sığınıyorum.',
    },
    en: {
      title: 'Protection from Grief',
      arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحُزْنِ وَالْعَجْزِ وَالْكَسَلِ',
      transliteration: 'Allahumma inni a\'udhu bika minal-hammi wal-huzni wal-ajzi wal-kasal',
      translation: 'O Allah! I seek refuge in You from anxiety, sorrow, weakness, and laziness.',
    },
  },
  {
    id: 11,
    tr: {
      title: 'Cennet ve Cehennemden Korunma',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
      transliteration: 'Allahumma inni as\'alukal-jannata wa a\'udhu bika minan-nar',
      translation: 'Allahım! Senden cenneti istiyorum ve cehennemden sana sığınıyorum.',
    },
    en: {
      title: 'Paradise and Refuge from Hell',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
      transliteration: 'Allahumma inni as\'alukal-jannata wa a\'udhu bika minan-nar',
      translation: 'O Allah! I ask You for Paradise and seek refuge in You from the Fire.',
    },
  },
  {
    id: 12,
    tr: {
      title: 'Anne-Baba Duası',
      arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      transliteration: 'Rabbirhamhuma kama rabbayani saghira',
      translation: 'Rabbim! Onlara merhamet et, tıpkı beni küçükken yetiştirdikleri gibi.',
    },
    en: {
      title: 'Dua for Parents',
      arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      transliteration: 'Rabbirhamhuma kama rabbayani saghira',
      translation: 'My Lord! Have mercy upon them as they brought me up when I was small.',
    },
  },
  {
    id: 13,
    tr: {
      title: 'Tövbe Duası',
      arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      transliteration: 'Allahumma ghfir li dhanbi kullah wa tub alayya innaka antat-tawwabur-rahim',
      translation: 'Allahım! Tüm günahımı bağışla ve bana tövbe nasip et. Şüphesiz sen tövbeleri kabul eden ve merhamet edensin.',
    },
    en: {
      title: 'Repentance Dua',
      arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      transliteration: 'Allahumma ghfir li dhanbi kullah wa tub alayya innaka antat-tawwabur-rahim',
      translation: 'O Allah! Forgive all my sins and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.',
    },
  },
  {
    id: 14,
    tr: {
      title: 'İlim ve Faydalı İş Duası',
      arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي',
      transliteration: 'Allahumma nfa\'ni bima allamtani wa allimni ma yanfa\'uni',
      translation: 'Allahım! Bana öğrettiklerinle beni faydalandır ve bana fayda verecek şeyi öğret.',
    },
    en: {
      title: 'Beneficial Knowledge Dua',
      arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي',
      transliteration: 'Allahumma nfa\'ni bima allamtani wa allimni ma yanfa\'uni',
      translation: 'O Allah! Benefit me from what You have taught me and teach me what will benefit me.',
    },
  },
  {
    id: 15,
    tr: {
      title: 'Kadir Gecesi Duası',
      arabic: 'اللَّهُمَّ إِنَّكَ عُفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allahumma innaka afuwwun karimun tuhibbul-afwa fa\'fu anni',
      translation: 'Allahım! Şüphesiz sen affedicisin, kerimsin, affetmeyi seversin; beni affet.',
    },
    en: {
      title: 'Night of Decree Dua',
      arabic: 'اللَّهُمَّ إِنَّكَ عُفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allahumma innaka afuwwun karimun tuhibbul-afwa fa\'fu anni',
      translation: 'O Allah! You are Forgiving, Generous, and love forgiveness; so forgive me.',
    },
  },
  {
    id: 16,
    tr: {
      title: 'Sağlık ve Afiyet Duası',
      arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي',
      transliteration: 'Allahumma afini fi badani, Allahumma afini fi sam\'i, Allahumma afini fi basari',
      translation: 'Allahım! Bedenimde bana afiyet ver. Allahım! Kulağımda bana afiyet ver. Allahım! Gözümde bana afiyet ver.',
    },
    en: {
      title: 'Health and Well-being Dua',
      arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي',
      transliteration: 'Allahumma afini fi badani, Allahumma afini fi sam\'i, Allahumma afini fi basari',
      translation: 'O Allah! Grant me health in my body. O Allah! Grant me health in my hearing. O Allah! Grant me health in my sight.',
    },
  },
  {
    id: 17,
    tr: {
      title: 'İslam Ümmeti Duası',
      arabic: 'اللَّهُمَّ اشْفِ مَرْضَانَا وَارْحَمْ مَوْتَانَا وَاغْفِرْ لَنَا وَلِوَالِدِينَا',
      transliteration: 'Allahumma ashfi mardana wa irham mawtana waghfir lana wa liwalidayna',
      translation: 'Allahım! Hastalarımıza şifa ver, ölülerimize rahmet et, bizi ve anne babamızı bağışla.',
    },
    en: {
      title: 'Dua for the Ummah',
      arabic: 'اللَّهُمَّ اشْفِ مَرْضَانَا وَارْحَمْ مَوْتَانَا وَاغْفِرْ لَنَا وَلِوَالِدِينَا',
      transliteration: 'Allahumma ashfi mardana wa irham mawtana waghfir lana wa liwalidayna',
      translation: 'O Allah! Heal our sick, have mercy on our dead, and forgive us and our parents.',
    },
  },
  {
    id: 18,
    tr: {
      title: 'Rızkın Genişlemesi Duası',
      arabic: 'اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا يَحُولُ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ',
      transliteration: 'Allahumma qsim lana min khashyatika ma yahulu baynana wa bayna ma\'asika',
      translation: 'Allahım! Bize senden öyle bir korku nasip et ki senin günahlarına düşmekten bizi korusun.',
    },
    en: {
      title: 'Provision and Piety Dua',
      arabic: 'اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا يَحُولُ بَيْنَنَا وَبَيْنَ مَعَاصِيكَ',
      transliteration: 'Allahumma qsim lana min khashyatika ma yahulu baynana wa bayna ma\'asika',
      translation: 'O Allah! Grant us such fear of You that comes between us and acts of disobedience to You.',
    },
  },
  {
    id: 19,
    tr: {
      title: 'Hayırlı İşlere Yönelme',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ',
      transliteration: 'Allahumma inni as\'aluka minal-khayri kullihi wa a\'udhu bika minash-sharri kullihi',
      translation: 'Allahım! Senden tüm hayrı istiyorum ve tüm şerden sana sığınıyorum.',
    },
    en: {
      title: 'Seeking All Good',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ',
      transliteration: 'Allahumma inni as\'aluka minal-khayri kullihi wa a\'udhu bika minash-sharri kullihi',
      translation: 'O Allah! I ask You for all good and seek refuge in You from all evil.',
    },
  },
  {
    id: 20,
    tr: {
      title: 'Son On Gün Duası',
      arabic: 'اللَّهُمَّ أَدْخِلْنِي فِي كُلِّ خَيْرٍ وَأَخْرِجْنِي مِنْ كُلِّ شَرٍّ',
      transliteration: 'Allahumma adkhilni fi kulli khayrin wa akhrijni min kulli sharrin',
      translation: 'Allahım! Beni her hayra sok ve beni her şerden çıkar.',
    },
    en: {
      title: 'Last Ten Days Dua',
      arabic: 'اللَّهُمَّ أَدْخِلْنِي فِي كُلِّ خَيْرٍ وَأَخْرِجْنِي مِنْ كُلِّ شَرٍّ',
      transliteration: 'Allahumma adkhilni fi kulli khayrin wa akhrijni min kulli sharrin',
      translation: 'O Allah! Admit me into every good and bring me out of every evil.',
    },
  },
  {
    id: 21,
    tr: {
      title: 'Kalp Huzuru Duası',
      arabic: 'اللَّهُمَّ سَكِّنْ قَلْبِي وَاطْمَئِنَّ نَفْسِي',
      transliteration: 'Allahumma sakkinn qalbi watma\'inn nafsi',
      translation: 'Allahım! Kalbimi sakinleştir ve nefsimi mutmain kıl.',
    },
    en: {
      title: 'Peace of Heart Dua',
      arabic: 'اللَّهُمَّ سَكِّنْ قَلْبِي وَاطْمَئِنَّ نَفْسِي',
      transliteration: 'Allahumma sakkinn qalbi watma\'inn nafsi',
      translation: 'O Allah! Calm my heart and grant my soul tranquility.',
    },
  },
  {
    id: 22,
    tr: {
      title: 'Oruç Tutanlara Dua',
      arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا الصِّيَامَ وَالقِيَامَ وَاجْعَلْنَا مِنَ الْعَتْقَاءِ مِنَ النَّارِ',
      transliteration: 'Allahumma taqabbal minna as-siyama wal-qiyama waj\'alna minal-atqa\'i minan-nar',
      translation: 'Allahım! Oruç ve namazımızı kabul et ve bizi cehennemden azat edilenlerden eyle.',
    },
    en: {
      title: 'Dua for Fasting Acceptance',
      arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا الصِّيَامَ وَالقِيَامَ وَاجْعَلْنَا مِنَ الْعَتْقَاءِ مِنَ النَّارِ',
      transliteration: 'Allahumma taqabbal minna as-siyama wal-qiyama waj\'alna minal-atqa\'i minan-nar',
      translation: 'O Allah! Accept from us our fasting and prayer and make us among those freed from the Fire.',
    },
  },
  {
    id: 23,
    tr: {
      title: 'Dua ve Zikir Duası',
      arabic: 'اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَ مَنْ لَا يَسْأَلُكَ وَأَسْأَلُكَ كُلَّ خَيْرٍ',
      transliteration: 'Allahumma la tahrimna ajra man la yas\'aluka wa as\'aluka kulla khayrin',
      translation: 'Allahım! Senden istemeyenin ecrini bize haram etme ve senden her hayrı istiyorum.',
    },
    en: {
      title: 'Supplication and Remembrance',
      arabic: 'اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَ مَنْ لَا يَسْأَلُكَ وَأَسْأَلُكَ كُلَّ خَيْرٍ',
      transliteration: 'Allahumma la tahrimna ajra man la yas\'aluka wa as\'aluka kulla khayrin',
      translation: 'O Allah! Do not deprive us of the reward of one who does not ask You, and I ask You for all good.',
    },
  },
  {
    id: 24,
    tr: {
      title: 'İbadet Gücü Duası',
      arabic: 'اللَّهُمَّ أَعِنِّي عَلَى صِيَامِهِ وَقِيَامِهِ وَاجْعَلْهُ لِي مُوَافَقًا مَا رَضِيتَهُ',
      transliteration: 'Allahumma a\'inni ala siyamihi wa qiyamihi waj\'alhu li muwafiqan ma radhitahu',
      translation: 'Allahım! Onun orucunda ve namazında bana yardım et ve onu razı olduğun şeye uygun kıl.',
    },
    en: {
      title: 'Strength for Worship Dua',
      arabic: 'اللَّهُمَّ أَعِنِّي عَلَى صِيَامِهِ وَقِيَامِهِ وَاجْعَلْهُ لِي مُوَافَقًا مَا رَضِيتَهُ',
      transliteration: 'Allahumma a\'inni ala siyamihi wa qiyamihi waj\'alhu li muwafiqan ma radhitahu',
      translation: 'O Allah! Help me to fast and pray in it and make it conform to what pleases You.',
    },
  },
  {
    id: 25,
    tr: {
      title: 'Merhamet ve Mağfiret',
      arabic: 'اللَّهُمَّ ارْحَمْنِي وَارْحَمْ وَالِدَيَّ وَارْحَمْ الْمُؤْمِنِينَ',
      transliteration: 'Allahumma irhamni warham walidayya warham al-mu\'minin',
      translation: 'Allahım! Bana merhamet et, anne babama merhamet et ve müminlere merhamet et.',
    },
    en: {
      title: 'Mercy and Forgiveness',
      arabic: 'اللَّهُمَّ ارْحَمْنِي وَارْحَمْ وَالِدَيَّ وَارْحَمْ الْمُؤْمِنِينَ',
      transliteration: 'Allahumma irhamni warham walidayya warham al-mu\'minin',
      translation: 'O Allah! Have mercy on me, have mercy on my parents, and have mercy on the believers.',
    },
  },
  {
    id: 26,
    tr: {
      title: 'Ramazan Sonu Duası',
      arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ وَقِيَامِي فِيهِ قِيَامَ الْقَائِمِينَ',
      transliteration: 'Allahumma ij\'al siyami fihi siyama as-sa\'imin wa qiyami fihi qiyama al-qa\'imin',
      translation: 'Allahım! Bu ayda orucumu gerçek oruç tutanların orucu, namazımı da kılanların namazı gibi kıl.',
    },
    en: {
      title: 'End of Ramadan Dua',
      arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ وَقِيَامِي فِيهِ قِيَامَ الْقَائِمِينَ',
      transliteration: 'Allahumma ij\'al siyami fihi siyama as-sa\'imin wa qiyami fihi qiyama al-qa\'imin',
      translation: 'O Allah! Make my fasting in it the fasting of those who truly fast and my prayer the prayer of those who truly pray.',
    },
  },
  {
    id: 27,
    tr: {
      title: 'Kadir Gecesi İbadeti',
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ فَاعْفُ عَنِّي وَارْحَمْنِي وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
      transliteration: 'Allahumma innaka afuwwun fa\'fu anni warhamni wa anta khayrur-rahimin',
      translation: 'Allahım! Şüphesiz sen affedicisin; beni affet, bana rahmet et. Sen rahmet edenlerin en hayırlısısın.',
    },
    en: {
      title: 'Worship on Night of Decree',
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ فَاعْفُ عَنِّي وَارْحَمْنِي وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
      transliteration: 'Allahumma innaka afuwwun fa\'fu anni warhamni wa anta khayrur-rahimin',
      translation: 'O Allah! You are Forgiving; so forgive me, have mercy on me. You are the Best of the Merciful.',
    },
  },
  {
    id: 28,
    tr: {
      title: 'İhlas ve Samimiyet',
      arabic: 'اللَّهُمَّ اجْعَلْنِي مِنَ الْمُتَّقِينَ وَاجْعَلْنِي مِنَ الْعَامِلِينَ الصَّالِحِينَ',
      transliteration: 'Allahumma ij\'alni minat-taqin waj\'alni minal-amilin as-salihin',
      translation: 'Allahım! Beni takva sahiplerinden ve salih ameller işleyenlerden eyle.',
    },
    en: {
      title: 'Sincerity and Piety',
      arabic: 'اللَّهُمَّ اجْعَلْنِي مِنَ الْمُتَّقِينَ وَاجْعَلْنِي مِنَ الْعَامِلِينَ الصَّالِحِينَ',
      transliteration: 'Allahumma ij\'alni minat-taqin waj\'alni minal-amilin as-salihin',
      translation: 'O Allah! Make me among the pious and among those who do righteous deeds.',
    },
  },
  {
    id: 29,
    tr: {
      title: 'Ramazan Veda Duası',
      arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا وَلا تَحْرِمْنَا وَاجْعَلْنَا مِنَ الْفَائِزِينَ',
      transliteration: 'Allahumma taqabbal minna wa la tahrimna waj\'alna minal-fa\'izin',
      translation: 'Allahım! Bizden kabul et, bizi mahrum etme ve bizi kurtulanlardan eyle.',
    },
    en: {
      title: 'Farewell to Ramadan Dua',
      arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا وَلا تَحْرِمْنَا وَاجْعَلْنَا مِنَ الْفَائِزِينَ',
      transliteration: 'Allahumma taqabbal minna wa la tahrimna waj\'alna minal-fa\'izin',
      translation: 'O Allah! Accept from us, do not deprive us, and make us among the successful.',
    },
  },
  {
    id: 30,
    tr: {
      title: 'Bayram ve Şükür Duası',
      arabic: 'اللَّهُمَّ أَكْمِلْ لَنَا دِينَنَا وَأَتْمِمْ عَلَيْنَا نِعْمَتَكَ وَارْزُقْنَا شُكْرَكَ',
      transliteration: 'Allahumma akmil lana dinana wa atmim alayna ni\'mataka warzuqna shukraka',
      translation: 'Allahım! Dinimizi bizim için tamamla, nimetini üzerimize tamamla ve bize sana şükretmeyi nasip et.',
    },
    en: {
      title: 'Eid and Gratitude Dua',
      arabic: 'اللَّهُمَّ أَكْمِلْ لَنَا دِينَنَا وَأَتْمِمْ عَلَيْنَا نِعْمَتَكَ وَارْزُقْنَا شُكْرَكَ',
      transliteration: 'Allahumma akmil lana dinana wa atmim alayna ni\'mataka warzuqna shukraka',
      translation: 'O Allah! Complete our religion for us, perfect Your favor upon us, and grant us gratitude to You.',
    },
  },
];

/**
 * Ramazan gününe göre günün duasını döndürür (1-30).
 * Ramazan dışında takvim gününe göre döngü yapar.
 */
export function getDuaOfTheDay(locale: 'tr' | 'en' = 'tr'): Dua['tr'] | Dua['en'] {
  const ramadanDay = getRamadanDay();
  const index = ramadanDay !== null
    ? Math.min(Math.max(ramadanDay - 1, 0), duas.length - 1)
    : (new Date().getDate() - 1) % duas.length;
  const dua = duas[index];
  return locale === 'tr' ? dua.tr : dua.en;
}

/**
 * Verilen Ramazan gün numarasına (1-30) göre o günün duasını döndürür.
 * Takvimde gün seçildiğinde kullanılır.
 */
export function getDuaByDay(dayNumber: number, locale: 'tr' | 'en'): Dua['tr'] | Dua['en'] {
  const index = Math.min(Math.max(dayNumber - 1, 0), duas.length - 1);
  const dua = duas[index];
  return locale === 'tr' ? dua.tr : dua.en;
}
