/**
 * Yıldız kataloğu tohum verisi — migration 008 SQL üretimi için.
 * Uygulama çalışma zamanında Supabase'den okur (skyCatalog.ts).
 */
export type ConstellationStarSeed = {
  id: string;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  requiredStardust: number;
  constellationId: string;
  starSortOrder: number;
};

export const CONSTELLATION_STAR_SEEDS: ConstellationStarSeed[] = [
  { id: "hamal", nameTr: "Hamal", nameEn: "Hamal", descriptionTr: "Aries'in en parlak yıldızı", descriptionEn: "Brightest star in Aries", requiredStardust: 100, constellationId: "aries", starSortOrder: 1 },
  { id: "sheratan", nameTr: "Sheratan", nameEn: "Sheratan", descriptionTr: "Aries'in ikinci yıldızı", descriptionEn: "Second star in Aries", requiredStardust: 150, constellationId: "aries", starSortOrder: 2 },
  { id: "mesarthim", nameTr: "Mesarthim", nameEn: "Mesarthim", descriptionTr: "Tarihi çift yıldız", descriptionEn: "Historic double star", requiredStardust: 200, constellationId: "aries", starSortOrder: 3 },
  { id: "botein", nameTr: "Botein", nameEn: "Botein", descriptionTr: "Aries'in dördüncü yıldızı", descriptionEn: "Fourth star in Aries", requiredStardust: 250, constellationId: "aries", starSortOrder: 4 },
  { id: "aldebaran", nameTr: "Aldebaran", nameEn: "Aldebaran", descriptionTr: "Boğanın gözü, turuncu dev", descriptionEn: "Eye of the Bull, orange giant", requiredStardust: 100, constellationId: "taurus", starSortOrder: 1 },
  { id: "elnath", nameTr: "Elnath", nameEn: "Elnath", descriptionTr: "Boğanın kuzey boynuzu", descriptionEn: "Northern horn of the Bull", requiredStardust: 150, constellationId: "taurus", starSortOrder: 2 },
  { id: "alcyone", nameTr: "Alcyone", nameEn: "Alcyone", descriptionTr: "Ülker yıldız kümesinin lideri", descriptionEn: "Leader of the Pleiades", requiredStardust: 180, constellationId: "taurus", starSortOrder: 3 },
  { id: "atlas", nameTr: "Atlas", nameEn: "Atlas", descriptionTr: "Ülker'in parlak üyesi", descriptionEn: "Bright member of Pleiades", requiredStardust: 220, constellationId: "taurus", starSortOrder: 4 },
  { id: "merope", nameTr: "Merope", nameEn: "Merope", descriptionTr: "Ülker'in gizemli yıldızı", descriptionEn: "Mysterious Pleiad", requiredStardust: 270, constellationId: "taurus", starSortOrder: 5 },
  { id: "pollux", nameTr: "Pollux", nameEn: "Pollux", descriptionTr: "İkizlerin parlak olanı", descriptionEn: "The brighter twin", requiredStardust: 100, constellationId: "gemini", starSortOrder: 1 },
  { id: "castor", nameTr: "Castor", nameEn: "Castor", descriptionTr: "Altı yıldızdan oluşan sistem", descriptionEn: "Sextuple star system", requiredStardust: 150, constellationId: "gemini", starSortOrder: 2 },
  { id: "alhena", nameTr: "Alhena", nameEn: "Alhena", descriptionTr: "Gemini'nin üçüncü yıldızı", descriptionEn: "Third brightest in Gemini", requiredStardust: 200, constellationId: "gemini", starSortOrder: 3 },
  { id: "wasat", nameTr: "Wasat", nameEn: "Wasat", descriptionTr: "İkizlerin beli", descriptionEn: "Waist of the twins", requiredStardust: 240, constellationId: "gemini", starSortOrder: 4 },
  { id: "mebsuda", nameTr: "Mebsuda", nameEn: "Mebsuda", descriptionTr: "Sarı süperdev yıldız", descriptionEn: "Yellow supergiant star", requiredStardust: 280, constellationId: "gemini", starSortOrder: 5 },
  { id: "tarf", nameTr: "Tarf", nameEn: "Tarf", descriptionTr: "Cancer'ın en parlak yıldızı", descriptionEn: "Brightest in Cancer", requiredStardust: 100, constellationId: "cancer", starSortOrder: 1 },
  { id: "asellus_b", nameTr: "Asellus Borealis", nameEn: "Asellus Borealis", descriptionTr: "Kuzey eşek yıldızı", descriptionEn: "Northern donkey star", requiredStardust: 160, constellationId: "cancer", starSortOrder: 2 },
  { id: "asellus_a", nameTr: "Asellus Australis", nameEn: "Asellus Australis", descriptionTr: "Güney eşek yıldızı", descriptionEn: "Southern donkey star", requiredStardust: 210, constellationId: "cancer", starSortOrder: 3 },
  { id: "acubens", nameTr: "Acubens", nameEn: "Acubens", descriptionTr: "Yengeçin pençesi", descriptionEn: "The claw of the crab", requiredStardust: 260, constellationId: "cancer", starSortOrder: 4 },
  { id: "regulus", nameTr: "Regulus", nameEn: "Regulus", descriptionTr: "Aslanın kalbi, kraliyet yıldızı", descriptionEn: "Heart of the Lion, royal star", requiredStardust: 300, constellationId: "leo", starSortOrder: 1 },
  { id: "denebola", nameTr: "Denebola", nameEn: "Denebola", descriptionTr: "Aslanın kuyruğu", descriptionEn: "Tail of the Lion", requiredStardust: 360, constellationId: "leo", starSortOrder: 2 },
  { id: "algieba", nameTr: "Algieba", nameEn: "Algieba", descriptionTr: "Aslanın yelesi", descriptionEn: "The Lion's mane", requiredStardust: 420, constellationId: "leo", starSortOrder: 3 },
  { id: "zosma", nameTr: "Zosma", nameEn: "Zosma", descriptionTr: "Aslanın beli", descriptionEn: "Hip of the Lion", requiredStardust: 480, constellationId: "leo", starSortOrder: 4 },
  { id: "adhafera", nameTr: "Adhafera", nameEn: "Adhafera", descriptionTr: "Yelede parlayan yıldız", descriptionEn: "Star in the mane", requiredStardust: 530, constellationId: "leo", starSortOrder: 5 },
  { id: "ras_elased", nameTr: "Ras Elased", nameEn: "Ras Elased", descriptionTr: "Aslanın başı", descriptionEn: "Head of the Lion", requiredStardust: 580, constellationId: "leo", starSortOrder: 6 },
  { id: "spica", nameTr: "Spica", nameEn: "Spica", descriptionTr: "Başak'ın en parlak yıldızı, mavi dev", descriptionEn: "Brightest in Virgo, blue giant", requiredStardust: 300, constellationId: "virgo", starSortOrder: 1 },
  { id: "zavijava", nameTr: "Zavijava", nameEn: "Zavijava", descriptionTr: "Köpeğin havlaması", descriptionEn: "The barking dog", requiredStardust: 370, constellationId: "virgo", starSortOrder: 2 },
  { id: "porrima", nameTr: "Porrima", nameEn: "Porrima", descriptionTr: "İkiz yıldız sistemi", descriptionEn: "Binary star system", requiredStardust: 430, constellationId: "virgo", starSortOrder: 3 },
  { id: "auva", nameTr: "Auva", nameEn: "Auva", descriptionTr: "Virgo'nun delta yıldızı", descriptionEn: "Delta star of Virgo", requiredStardust: 490, constellationId: "virgo", starSortOrder: 4 },
  { id: "vindemiatrix", nameTr: "Vindemiatrix", nameEn: "Vindemiatrix", descriptionTr: "Üzüm hasatçısı", descriptionEn: "The grape harvester", requiredStardust: 550, constellationId: "virgo", starSortOrder: 5 },
  { id: "zubenelgenubi", nameTr: "Zubenelgenubi", nameEn: "Zubenelgenubi", descriptionTr: "Terazi'nin güney kefesi", descriptionEn: "Southern scale of Libra", requiredStardust: 300, constellationId: "libra", starSortOrder: 1 },
  { id: "zubeneschamali", nameTr: "Zubeneschamali", nameEn: "Zubeneschamali", descriptionTr: "Terazi'nin kuzey kefesi", descriptionEn: "Northern scale of Libra", requiredStardust: 380, constellationId: "libra", starSortOrder: 2 },
  { id: "brachium", nameTr: "Brachium", nameEn: "Brachium", descriptionTr: "Terazi'nin kolu", descriptionEn: "Arm of the scales", requiredStardust: 460, constellationId: "libra", starSortOrder: 3 },
  { id: "zubenelhakrabi", nameTr: "Zubenelhakrabi", nameEn: "Zubenelhakrabi", descriptionTr: "Terazi'nin dördüncü yıldızı", descriptionEn: "Fourth star of Libra", requiredStardust: 540, constellationId: "libra", starSortOrder: 4 },
  { id: "antares", nameTr: "Antares", nameEn: "Antares", descriptionTr: "Akrebin kalbi, kızıl süperdev", descriptionEn: "Heart of Scorpion, red supergiant", requiredStardust: 300, constellationId: "scorpio", starSortOrder: 1 },
  { id: "shaula", nameTr: "Shaula", nameEn: "Shaula", descriptionTr: "Akrebin iğnesi", descriptionEn: "The scorpion's sting", requiredStardust: 360, constellationId: "scorpio", starSortOrder: 2 },
  { id: "sargas", nameTr: "Sargas", nameEn: "Sargas", descriptionTr: "Akrebin kuyruğu", descriptionEn: "Tail of the scorpion", requiredStardust: 410, constellationId: "scorpio", starSortOrder: 3 },
  { id: "dschubba", nameTr: "Dschubba", nameEn: "Dschubba", descriptionTr: "Akrebin alnı", descriptionEn: "Forehead of the scorpion", requiredStardust: 460, constellationId: "scorpio", starSortOrder: 4 },
  { id: "graffias", nameTr: "Graffias", nameEn: "Graffias", descriptionTr: "Çift yıldız sistemi", descriptionEn: "Multiple star system", requiredStardust: 510, constellationId: "scorpio", starSortOrder: 5 },
  { id: "alniyat", nameTr: "Alniyat", nameEn: "Alniyat", descriptionTr: "Antares'in yanındaki yıldız", descriptionEn: "Star beside Antares", requiredStardust: 560, constellationId: "scorpio", starSortOrder: 6 },
  { id: "lesath", nameTr: "Lesath", nameEn: "Lesath", descriptionTr: "İğneye yakın yıldız", descriptionEn: "Near the sting", requiredStardust: 600, constellationId: "scorpio", starSortOrder: 7 },
  { id: "rasalhague", nameTr: "Rasalhague", nameEn: "Rasalhague", descriptionTr: "Yılancının başı", descriptionEn: "Head of the serpent bearer", requiredStardust: 300, constellationId: "ophiuchus", starSortOrder: 1 },
  { id: "sabik", nameTr: "Sabik", nameEn: "Sabik", descriptionTr: "Ophiuchus'un ikinci yıldızı", descriptionEn: "Second brightest in Ophiuchus", requiredStardust: 360, constellationId: "ophiuchus", starSortOrder: 2 },
  { id: "zeta_oph", nameTr: "Zeta Ophiuchi", nameEn: "Zeta Ophiuchi", descriptionTr: "Hızlı hareket eden mavi yıldız", descriptionEn: "Fast-moving blue star", requiredStardust: 430, constellationId: "ophiuchus", starSortOrder: 3 },
  { id: "yed_prior", nameTr: "Yed Prior", nameEn: "Yed Prior", descriptionTr: "Yılanı tutan el", descriptionEn: "The hand holding the serpent", requiredStardust: 500, constellationId: "ophiuchus", starSortOrder: 4 },
  { id: "cebalrai", nameTr: "Cebalrai", nameEn: "Cebalrai", descriptionTr: "Çobanın kalbi", descriptionEn: "Heart of the shepherd", requiredStardust: 560, constellationId: "ophiuchus", starSortOrder: 5 },
  { id: "marfik", nameTr: "Marfik", nameEn: "Marfik", descriptionTr: "Yılancının dirseği", descriptionEn: "Elbow of the serpent bearer", requiredStardust: 600, constellationId: "ophiuchus", starSortOrder: 6 },
  { id: "kaus_australis", nameTr: "Kaus Australis", nameEn: "Kaus Australis", descriptionTr: "Yay'ın güney kısmı, en parlak", descriptionEn: "Southern bow, brightest", requiredStardust: 700, constellationId: "sagittarius", starSortOrder: 1 },
  { id: "nunki", nameTr: "Nunki", nameEn: "Nunki", descriptionTr: "Deniz yıldızı", descriptionEn: "Star of the sea", requiredStardust: 800, constellationId: "sagittarius", starSortOrder: 2 },
  { id: "kaus_media", nameTr: "Kaus Media", nameEn: "Kaus Media", descriptionTr: "Yay'ın orta kısmı", descriptionEn: "Middle of the bow", requiredStardust: 900, constellationId: "sagittarius", starSortOrder: 3 },
  { id: "kaus_borealis", nameTr: "Kaus Borealis", nameEn: "Kaus Borealis", descriptionTr: "Yay'ın kuzey kısmı", descriptionEn: "Northern bow", requiredStardust: 950, constellationId: "sagittarius", starSortOrder: 4 },
  { id: "ascella", nameTr: "Ascella", nameEn: "Ascella", descriptionTr: "Yayın koltuk altı", descriptionEn: "Armpit of the archer", requiredStardust: 1000, constellationId: "sagittarius", starSortOrder: 5 },
  { id: "albaldah", nameTr: "Albaldah", nameEn: "Albaldah", descriptionTr: "Şehir yıldızı", descriptionEn: "The city star", requiredStardust: 1100, constellationId: "sagittarius", starSortOrder: 6 },
  { id: "deneb_algedi", nameTr: "Deneb Algedi", nameEn: "Deneb Algedi", descriptionTr: "Oğlak'ın kuyruğu, en parlak", descriptionEn: "Tail of the goat, brightest", requiredStardust: 700, constellationId: "capricorn", starSortOrder: 1 },
  { id: "dabih", nameTr: "Dabih", nameEn: "Dabih", descriptionTr: "Şanslı yıldız", descriptionEn: "The lucky star", requiredStardust: 820, constellationId: "capricorn", starSortOrder: 2 },
  { id: "algedi", nameTr: "Algedi", nameEn: "Algedi", descriptionTr: "Oğlakın boynuzu", descriptionEn: "Horn of the goat", requiredStardust: 940, constellationId: "capricorn", starSortOrder: 3 },
  { id: "nashira", nameTr: "Nashira", nameEn: "Nashira", descriptionTr: "Habercinin şansı", descriptionEn: "Bringer of good news", requiredStardust: 1050, constellationId: "capricorn", starSortOrder: 4 },
  { id: "baten_algiedi", nameTr: "Baten Algiedi", nameEn: "Baten Algiedi", descriptionTr: "Oğlakın karnı", descriptionEn: "Belly of the goat", requiredStardust: 1150, constellationId: "capricorn", starSortOrder: 5 },
  { id: "sadalsuud", nameTr: "Sadalsuud", nameEn: "Sadalsuud", descriptionTr: "En şanslı yıldızların şanslısı", descriptionEn: "Luckiest of the lucky stars", requiredStardust: 700, constellationId: "aquarius", starSortOrder: 1 },
  { id: "sadalmelik", nameTr: "Sadalmelik", nameEn: "Sadalmelik", descriptionTr: "Kralın şanslı yıldızları", descriptionEn: "Lucky stars of the king", requiredStardust: 830, constellationId: "aquarius", starSortOrder: 2 },
  { id: "skat", nameTr: "Skat", nameEn: "Skat", descriptionTr: "Kova taşıyanın bacağı", descriptionEn: "Leg of the water bearer", requiredStardust: 960, constellationId: "aquarius", starSortOrder: 3 },
  { id: "albali", nameTr: "Albali", nameEn: "Albali", descriptionTr: "Yutan yıldız", descriptionEn: "The swallower", requiredStardust: 1080, constellationId: "aquarius", starSortOrder: 4 },
  { id: "ancha", nameTr: "Ancha", nameEn: "Ancha", descriptionTr: "Kalça yıldızı", descriptionEn: "The hip star", requiredStardust: 1180, constellationId: "aquarius", starSortOrder: 5 },
  { id: "eta_piscium", nameTr: "Eta Piscium", nameEn: "Eta Piscium", descriptionTr: "Balık'ın en parlak yıldızı", descriptionEn: "Brightest in Pisces", requiredStardust: 700, constellationId: "pisces", starSortOrder: 1 },
  { id: "alrescha", nameTr: "Alrescha", nameEn: "Alrescha", descriptionTr: "Balıkları bağlayan ip", descriptionEn: "The cord binding the fish", requiredStardust: 840, constellationId: "pisces", starSortOrder: 2 },
  { id: "fumalsamakah", nameTr: "Fumalsamakah", nameEn: "Fumalsamakah", descriptionTr: "Balığın ağzı", descriptionEn: "Mouth of the fish", requiredStardust: 970, constellationId: "pisces", starSortOrder: 3 },
  { id: "torcularis", nameTr: "Torcularis", nameEn: "Torcularis", descriptionTr: "Zeytinyağı presi", descriptionEn: "The olive press", requiredStardust: 1090, constellationId: "pisces", starSortOrder: 4 },
  { id: "revati", nameTr: "Revati", nameEn: "Revati", descriptionTr: "Zenginlik yıldızı", descriptionEn: "Star of wealth", requiredStardust: 1200, constellationId: "pisces", starSortOrder: 5 },
];
