// Tilt-guide and best-pick prose, one key per rendered sentence (#365, E13).
//
// These are the strings the results surface still composed in English after the
// first E13 pass keyed the outcome card, the ranking prose and the matrix
// chrome: the two noon labels drawn inside the sun-path SVG, the winter-tilt
// gloss, the daylight title, the "cheapest compared / safest pick" suffix on
// the best-pick card, and the two site-specific tilt takeaways that only render
// near the equator or inside the polar night.
//
// They live beside RESULT_COPY rather than inside it for one reason: RESULT_COPY
// is already 240 keys wide and this is a bounded family (nine strings) with its
// own test. Both are spread into LOCALES, so a render site calls t() and never
// knows which module the sentence came from.
//
// Placeholders use {braces} and are substituted by translate(); a translation
// must keep every placeholder of its English source, which
// tests/result-copy-i18n.test.mjs enforces for this table too.
export const TILT_COPY = {
  en: {
    resSunPathTitle: "Sun path for {compass}-facing panels at {tilt}° tilt",
    resSunPathSummerNoon: "☀️ Summer Noon: {deg}° ({h}h)",
    resSunPathWinterNoon: "❄️ Winter Noon: {deg}° ({h}h)",
    resSunPathSnowNote: "Sheds snow & captures low winter midday sun",
    resSunPathDaylightTitle: "☀️ Daylight & Seasonal Swing",
    resBestCheapest: " — cheapest compared",
    resBestSafest: " — safest pick",
    resTiltTakeawayEquator:
      "Near the equator the sun sits almost overhead year-round, so angle barely changes the harvest — a modest ~10° tilt exists mainly so tropical rain washes off dust. Spend your effort on keeping panels clean, not on precision aiming. (Flat loses only ~{loss}% here.)",
    resTiltTakeawayPolar:
      "At high latitude ({lat}°), winter brings polar night (0h direct sun). A steep array (~{tilt}°) sheds snow and catches low shoulder rays — flat panels would forfeit ~{loss}% of the year's harvest, so precise mounting genuinely pays off here, backed by adequate battery reserve.",
  },
  es: {
    resSunPathTitle:
      "Recorrido solar para paneles orientados al {compass} con ~{tilt}° de inclinación",
    resSunPathSummerNoon: "☀️ Mediodía de verano: {deg}° ({h} h)",
    resSunPathWinterNoon: "❄️ Mediodía de invierno: {deg}° ({h} h)",
    resSunPathSnowNote:
      "Evacúa la nieve y capta el bajo sol de mediodía en invierno",
    resSunPathDaylightTitle: "☀️ Horas de luz y oscilación estacional",
    resBestCheapest: " — la más barata de las comparadas",
    resBestSafest: " — la opción más segura",
    resTiltTakeawayEquator:
      "Cerca del ecuador el sol queda casi vertical todo el año, así que el ángulo apenas cambia la cosecha: una inclinación modesta de ~10° existe sobre todo para que la lluvia tropical arrastre el polvo. Dedica el esfuerzo a mantener los paneles limpios, no a apuntar con precisión. (En plano solo se pierde ~{loss}% aquí.)",
    resTiltTakeawayPolar:
      "En latitudes altas ({lat}°), el invierno trae noche polar (0 h de sol directo). Un campo inclinado (~{tilt}°) evacúa la nieve y capta los rayos bajos de temporada; en plano se perdería ~{loss}% de la cosecha anual, así que aquí el montaje preciso compensa de verdad, con reserva de batería suficiente.",
  },
  pt: {
    resSunPathTitle:
      "Percurso solar para painéis virados a {compass} com ~{tilt}° de inclinação",
    resSunPathSummerNoon: "☀️ Meio-dia de verão: {deg}° ({h} h)",
    resSunPathWinterNoon: "❄️ Meio-dia de inverno: {deg}° ({h} h)",
    resSunPathSnowNote:
      "Liberta a neve e apanha o sol baixo do meio-dia de inverno",
    resSunPathDaylightTitle: "☀️ Horas de luz e oscilação sazonal",
    resBestCheapest: " — a mais barata entre as comparadas",
    resBestSafest: " — a opção mais segura",
    resTiltTakeawayEquator:
      "Perto do equador o sol fica quase a pino todo o ano, por isso o ângulo quase não altera a colheita: uma inclinação modesta de ~10° serve sobretudo para a chuva tropical lavar o pó. Concentre o esforço em manter os painéis limpos, não em apontar com precisão. (Plano perde apenas ~{loss}% aqui.)",
    resTiltTakeawayPolar:
      "Em latitudes altas ({lat}°), o inverno traz noite polar (0 h de sol direto). Um conjunto inclinado (~{tilt}°) liberta a neve e apanha os raios baixos de temporada: em plano perder-se-ia ~{loss}% da colheita anual, por isso aqui a montagem precisa compensa mesmo, com reserva de bateria adequada.",
  },
  fr: {
    resSunPathTitle:
      "Course du soleil pour des panneaux orientés {compass} avec une inclinaison de ~{tilt}°",
    resSunPathSummerNoon: "☀️ Midi d'été : {deg}° ({h} h)",
    resSunPathWinterNoon: "❄️ Midi d'hiver : {deg}° ({h} h)",
    resSunPathSnowNote:
      "Évacue la neige et capte le soleil bas du midi d'hiver",
    resSunPathDaylightTitle: "☀️ Durée du jour et variation saisonnière",
    resBestCheapest: " — la moins chère des options comparées",
    resBestSafest: " — l'option la plus sûre",
    resTiltTakeawayEquator:
      "Près de l'équateur, le soleil est presque à la verticale toute l'année : l'angle ne change donc presque rien à la récolte — une inclinaison modeste de ~10° sert surtout à ce que la pluie tropicale lave la poussière. Misez sur des panneaux propres plutôt que sur un pointage de précision. (À plat, on ne perd que ~{loss}% ici.)",
    resTiltTakeawayPolar:
      "Aux hautes latitudes ({lat}°), l'hiver apporte la nuit polaire (0 h de soleil direct). Un champ incliné (~{tilt}°) évacue la neige et capte les rayons rasants — à plat, on perdrait ~{loss}% de la récolte annuelle : un montage précis se justifie vraiment ici, avec une réserve de batterie suffisante.",
  },
  de: {
    resSunPathTitle:
      "Sonnenbahn für {compass}-ausgerichtete Module bei ~{tilt}° Neigung",
    resSunPathSummerNoon: "☀️ Sonnenhöchststand im Sommer: {deg}° ({h} h)",
    resSunPathWinterNoon: "❄️ Sonnenhöchststand im Winter: {deg}° ({h} h)",
    resSunPathSnowNote:
      "Räumt Schnee ab und fängt die tiefe Wintersonne am Mittag",
    resSunPathDaylightTitle: "☀️ Tageslicht und jahreszeitliche Schwankung",
    resBestCheapest: " — die günstigste im Vergleich",
    resBestSafest: " — die sicherste Wahl",
    resTiltTakeawayEquator:
      "Nahe am Äquator steht die Sonne fast das ganze Jahr über senkrecht, der Winkel ändert die Ernte also kaum — eine bescheidene Neigung von ~10° dient vor allem dazu, dass tropischer Regen den Staub abspült. Setzen Sie auf saubere Module statt auf exaktes Ausrichten. (Flach verliert hier nur ~{loss}%.)",
    resTiltTakeawayPolar:
      "In hohen Breiten ({lat}°) bringt der Winter die Polarnacht (0 h direktes Sonnenlicht). Ein steiles Feld (~{tilt}°) räumt Schnee ab und fängt die flachen Strahlen — flach verliert man ~{loss}% der Jahresernte, präzise Montage lohnt hier also wirklich, mit ausreichender Batteriereserve.",
  },
  nl: {
    resSunPathTitle:
      "Zonbaan voor panelen op het {compass} bij ~{tilt}° helling",
    resSunPathSummerNoon: "☀️ Zonshoogte in de zomer: {deg}° ({h} u)",
    resSunPathWinterNoon: "❄️ Zonshoogte in de winter: {deg}° ({h} u)",
    resSunPathSnowNote:
      "Schuift sneeuw weg en vangt de lage winterzon rond het middaguur",
    resSunPathDaylightTitle: "☀️ Daglicht en seizoensverschil",
    resBestCheapest: " — de goedkoopste van de vergeleken opties",
    resBestSafest: " — de veiligste keuze",
    resTiltTakeawayEquator:
      "Bij de evenaar staat de zon bijna het hele jaar recht boven, dus de hoek verandert de opbrengst nauwelijks — een bescheiden helling van ~10° dient vooral om tropische regen het stof te laten wegspoelen. Steek uw moeite in schone panelen, niet in precisie richten. (Plat verliest hier maar ~{loss}%.)",
    resTiltTakeawayPolar:
      "Op hoge breedte ({lat}°) brengt de winter poolnacht (0 u direct zonlicht). Een steil veld (~{tilt}°) schuift sneeuw weg en vangt de lage stralen — plat zou ~{loss}% van de jaaropbrengst verliezen, dus nauwkeurig monteren loont hier echt, met voldoende accureserve.",
  },
  ar: {
    resSunPathTitle: "مسار الشمس للألواح المواجهة لـ {compass} بميل ~{tilt}°",
    resSunPathSummerNoon: "☀️ ظهيرة الصيف: {deg}° ({h} ساعة)",
    resSunPathWinterNoon: "❄️ ظهيرة الشتاء: {deg}° ({h} ساعة)",
    resSunPathSnowNote: "يزيل الثلج ويلتقط شمس الظهيرة المنخفضة في الشتاء",
    resSunPathDaylightTitle: "☀️ ساعات النهار وتغيّر الفصول",
    resBestCheapest: " — الأرخص بين الخيارات المقارنة",
    resBestSafest: " — الخيار الأكثر أمانًا",
    resTiltTakeawayEquator:
      "قرب خط الاستواء تكون الشمس شبه عمودية طوال السنة، لذا لا يكاد الزاوية تغيّر الحصاد — والميل المتواضع ~10° غايته أساسًا أن يغسل مطر المدارس الغبار. ركّز جهدك على نظافة الألواح لا على دقة التوجيه. (السطح المستوي لا يخسر هنا سوى ~{loss}%.)",
    resTiltTakeawayPolar:
      "في خطوط العرض العالية ({lat}°) يجلب الشتاء الليل القطبي (0 ساعة شمس مباشرة). والمصفوفة الشديدة الميل (~{tilt}°) تزيل الثلج وتلتقط الأشعة المنخفضة — والسطح المستوي يخسر ~{loss}% من حصاد السنة، لذا يستحق التثبيت الدقيق هنا فعلًا، مع احتياطي بطارية كافٍ.",
  },
};
