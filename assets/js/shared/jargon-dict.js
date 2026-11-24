// Plain-language explanations for terms that appear in sizing results.
// Keep entries short enough for a tap tooltip and honest enough to stand alone.
export const JARGON = Object.freeze({
  kWh: {
    short: "energy used",
    long: "A kWh is a unit of energy: roughly what a 1,000-watt appliance uses in one hour.",
  },
  Wh: {
    short: "a small energy unit",
    long: "A Wh is one thousandth of a kWh. The calculator uses it for hour-by-hour arithmetic.",
  },
  kW: {
    short: "power size",
    long: "A kW is how fast electricity is being made or used. More kW means more appliances can run at once.",
  },
  DoD: {
    short: "how much of a battery we use",
    long: "Depth of discharge is the share of a battery emptied before it is recharged. Leaving a reserve usually helps it last longer.",
  },
  Ah: {
    short: "battery charge quantity",
    long: "Amp-hours describe electrical charge. Battery makers use them alongside voltage to describe stored energy.",
  },
  inverter: {
    short: "the electricity translator",
    long: "An inverter changes battery or panel electricity into the kind your appliances use, and may also charge the battery.",
  },
  MPPT: {
    short: "panel harvest controller",
    long: "MPPT is electronics that keeps panels operating near their most productive voltage as sunlight changes.",
  },
  autonomy: {
    short: "days without sun",
    long: "Autonomy is how long the battery can keep chosen loads running when panels make little or no energy.",
  },
  roundTripEfficiency: {
    short: "energy lost while storing",
    long: "Round-trip efficiency is the share of energy you get back after charging and discharging a battery.",
  },
  cycleLife: {
    short: "battery lifetime",
    long: "Cycle life is an estimate of how many full-use equivalents a battery can deliver before it loses capacity.",
  },
  usableCapacity: {
    short: "energy we can safely use",
    long: "Usable capacity leaves the reserve that protects the battery from damaging over-discharge.",
  },
  soiling: {
    short: "dust and dirt losses",
    long: "Soiling is the sunlight a panel loses when dust, pollen, salt, or grime covers it.",
  },
  derates: {
    short: "real-world loss factors",
    long: "Derates account for heat, dust, wiring, mismatched panels, and other losses between sunlight and useful electricity.",
  },
  NOCT: {
    short: "panel heat reference",
    long: "NOCT is a standard reference for estimating how warm a working panel becomes in sunlight.",
  },
  temperatureCoefficient: {
    short: "heat-related panel loss",
    long: "The temperature coefficient estimates how panel output changes as the panel gets hotter or colder.",
  },
  systemVoltage: {
    short: "battery bank voltage",
    long: "System voltage is the battery bank's electrical pressure. Higher voltage usually means less current in the cables.",
  },
  string: {
    short: "a series-connected group",
    long: "A string is a group of batteries or panels connected in series so their voltages add together.",
  },
  BMS: {
    short: "battery safety electronics",
    long: "A battery-management system watches cell voltage and temperature and can stop unsafe charging or discharging.",
  },
  LCOE: {
    short: "long-run energy price",
    long: "Levelized cost of energy spreads equipment, replacements, and delivered energy across the system's modeled life.",
  },
  paybackPeriod: {
    short: "time to recover cost",
    long: "The payback period is how long modeled bill savings take to equal the equipment cost. It is not a promise.",
  },
  tariff: {
    short: "your electricity price",
    long: "A tariff is the price your utility or generator charges for each unit of energy.",
  },
  unmetHours: {
    short: "hours needing backup",
    long: "Unmet hours are the hours the modeled panels and battery could not fully serve the selected load.",
  },
  reliabilityTier: {
    short: "how much backup you want",
    long: "A reliability tier sets how many hours per year may need a generator or grid connection.",
  },
  gridTie: {
    short: "solar while staying connected",
    long: "Grid-tie means the utility remains available when solar does not cover the load.",
  },
  offGrid: {
    short: "independent from the utility",
    long: "Off-grid means panels and storage must cover the load, with a generator or another backup for rare shortfalls.",
  },
});

export const JARGON_TERMS = Object.freeze(Object.keys(JARGON));

// Translation overlays are intentionally partial: callers should fall back to
// the English explanation for any missing term, just like the UI locale layer.
export const JARGON_LOCALES = Object.freeze({
  es: {
    kWh: {
      short: "energía usada",
      long: "Un kWh es una unidad de energía: aproximadamente lo que consume un aparato de 1.000 W en una hora.",
    },
    Wh: {
      short: "una unidad pequeña de energía",
      long: "Un Wh es la milésima parte de un kWh. La calculadora lo usa para sumar hora a hora.",
    },
    kW: {
      short: "tamaño de la potencia",
      long: "Un kW indica la rapidez con que se produce o se usa la electricidad. Más kW significa más aparatos funcionando a la vez.",
    },
    DoD: {
      short: "cuánto usamos de la batería",
      long: "La profundidad de descarga es la parte de la batería que se vacía antes de recargarla. Dejar una reserva suele hacer que dure más.",
    },
    Ah: {
      short: "cantidad de carga de la batería",
      long: "Los amperios-hora describen carga eléctrica. Los fabricantes los usan junto a la tensión para describir la energía almacenada.",
    },
    inverter: {
      short: "el traductor de electricidad",
      long: "Un inversor convierte la electricidad de la batería o de los paneles al tipo que usan tus aparatos, y también puede cargar la batería.",
    },
    MPPT: {
      short: "control del rendimiento de los paneles",
      long: "MPPT es la electrónica que mantiene los paneles cerca de su tensión más productiva a medida que cambia la luz.",
    },
    autonomy: {
      short: "días sin sol",
      long: "La autonomía es el tiempo que la batería puede mantener las cargas elegidas cuando los paneles producen poca o ninguna energía.",
    },
    roundTripEfficiency: {
      short: "energía perdida al almacenar",
      long: "El rendimiento de ida y vuelta es la parte de la energía que recuperas tras cargar y descargar una batería.",
    },
    cycleLife: {
      short: "vida útil de la batería",
      long: "La vida en ciclos estima cuántos usos completos puede entregar una batería antes de perder capacidad.",
    },
    usableCapacity: {
      short: "energía que podemos usar con seguridad",
      long: "La capacidad útil deja fuera la reserva que protege la batería de una descarga excesiva.",
    },
    soiling: {
      short: "pérdidas por polvo y suciedad",
      long: "La suciedad es la luz que pierde un panel cuando el polvo, el polen, la sal o la mugre lo cubren.",
    },
    derates: {
      short: "pérdidas del mundo real",
      long: "Los factores de pérdida recogen calor, polvo, cableado, paneles desajustados y otras pérdidas entre la luz y la electricidad útil.",
    },
    NOCT: {
      short: "referencia térmica del panel",
      long: "NOCT es una referencia estándar para estimar cuánto se calienta un panel en funcionamiento bajo el sol.",
    },
    temperatureCoefficient: {
      short: "pérdida del panel por calor",
      long: "El coeficiente de temperatura estima cómo cambia la producción del panel cuando se calienta o se enfría.",
    },
    systemVoltage: {
      short: "tensión del banco de baterías",
      long: "La tensión del sistema es la presión eléctrica del banco de baterías. Más tensión suele significar menos corriente en los cables.",
    },
    string: {
      short: "un grupo en serie",
      long: "Una serie es un grupo de baterías o paneles conectados en serie para que sus tensiones se sumen.",
    },
    BMS: {
      short: "electrónica de seguridad de la batería",
      long: "El sistema de gestión de batería vigila la tensión y la temperatura de las celdas y puede detener cargas o descargas inseguras.",
    },
    LCOE: {
      short: "precio de la energía a largo plazo",
      long: "El coste nivelado de la energía reparte el equipo, los recambios y la energía entregada a lo largo de la vida modelada del sistema.",
    },
    paybackPeriod: {
      short: "tiempo para recuperar el coste",
      long: "La amortización es el tiempo que tardan los ahorros modelados en igualar el coste del equipo. No es una promesa.",
    },
    tariff: {
      short: "tu precio de la electricidad",
      long: "La tarifa es el precio que tu red o tu generador cobra por cada unidad de energía.",
    },
    unmetHours: {
      short: "horas que necesitan respaldo",
      long: "Las horas sin cubrir son las horas en que los paneles y la batería modelados no pudieron servir del todo la carga elegida.",
    },
    reliabilityTier: {
      short: "cuánto respaldo quieres",
      long: "El nivel de fiabilidad fija cuántas horas al año pueden necesitar un generador o la conexión a la red.",
    },
    gridTie: {
      short: "solar sin desconectarte",
      long: "Conectado a la red significa que la compañía sigue disponible cuando la solar no cubre la carga.",
    },
    offGrid: {
      short: "independiente de la compañía",
      long: "Aislado de la red significa que paneles y almacenamiento deben cubrir la carga, con un generador u otro respaldo para fallos puntuales.",
    },
  },
  pt: {
    kWh: {
      short: "energia usada",
      long: "Um kWh é uma unidade de energia: mais ou menos o que um aparelho de 1.000 W consome em uma hora.",
    },
    Wh: {
      short: "uma unidade pequena de energia",
      long: "Um Wh é um milésimo de kWh. A calculadora usa essa unidade para somar hora a hora.",
    },
    kW: {
      short: "tamanho da potência",
      long: "Um kW mostra a rapidez com que a eletricidade é gerada ou usada. Mais kW significa mais aparelhos ligados ao mesmo tempo.",
    },
    DoD: {
      short: "quanto usamos da bateria",
      long: "A profundidade de descarga é a parte da bateria esvaziada antes de recarregar. Deixar uma reserva costuma fazer a bateria durar mais.",
    },
    Ah: {
      short: "quantidade de carga da bateria",
      long: "Ampère-hora descreve carga elétrica. Os fabricantes usam essa medida junto com a tensão para descrever a energia armazenada.",
    },
    inverter: {
      short: "o tradutor de eletricidade",
      long: "O inversor converte a eletricidade da bateria ou dos painéis para o tipo que seus aparelhos usam, e também pode carregar a bateria.",
    },
    MPPT: {
      short: "controle de rendimento dos painéis",
      long: "MPPT é a eletrônica que mantém os painéis perto da tensão mais produtiva conforme a luz muda.",
    },
    autonomy: {
      short: "dias sem sol",
      long: "Autonomia é por quanto tempo a bateria mantém as cargas escolhidas quando os painéis geram pouca ou nenhuma energia.",
    },
    roundTripEfficiency: {
      short: "energia perdida ao armazenar",
      long: "O rendimento de ida e volta é a parte da energia que você recupera depois de carregar e descarregar uma bateria.",
    },
    cycleLife: {
      short: "vida útil da bateria",
      long: "A vida em ciclos estima quantos usos completos uma bateria entrega antes de perder capacidade.",
    },
    usableCapacity: {
      short: "energia que podemos usar com segurança",
      long: "A capacidade útil deixa de fora a reserva que protege a bateria de uma descarga excessiva.",
    },
    soiling: {
      short: "perdas por poeira e sujeira",
      long: "Sujeira é a luz que o painel perde quando poeira, pólen, sal ou crosta cobrem a superfície.",
    },
    derates: {
      short: "perdas do mundo real",
      long: "Os fatores de perda consideram calor, poeira, fiação, painéis desiguais e outras perdas entre a luz e a eletricidade útil.",
    },
    NOCT: {
      short: "referência térmica do painel",
      long: "NOCT é uma referência padrão para estimar o quanto um painel em funcionamento esquenta ao sol.",
    },
    temperatureCoefficient: {
      short: "perda do painel por calor",
      long: "O coeficiente de temperatura estima como a produção do painel muda quando ele esquenta ou esfria.",
    },
    systemVoltage: {
      short: "tensão do banco de baterias",
      long: "A tensão do sistema é a pressão elétrica do banco de baterias. Tensão mais alta costuma significar menos corrente nos cabos.",
    },
    string: {
      short: "um grupo em série",
      long: "Uma série é um grupo de baterias ou painéis ligados em série para que as tensões se somem.",
    },
    BMS: {
      short: "eletrônica de segurança da bateria",
      long: "O sistema de gestão da bateria acompanha tensão e temperatura das células e pode interromper cargas ou descargas inseguras.",
    },
    LCOE: {
      short: "preço da energia no longo prazo",
      long: "O custo nivelado da energia distribui equipamento, substituições e energia entregue ao longo da vida modelada do sistema.",
    },
    paybackPeriod: {
      short: "tempo para recuperar o custo",
      long: "O payback é o tempo que a economia modelada leva para igualar o custo do equipamento. Não é uma promessa.",
    },
    tariff: {
      short: "o seu preço de eletricidade",
      long: "A tarifa é o preço que a distribuidora ou o gerador cobra por cada unidade de energia.",
    },
    unmetHours: {
      short: "horas que precisam de reserva",
      long: "Horas não atendidas são as horas em que os painéis e a bateria modelados não conseguiram servir toda a carga escolhida.",
    },
    reliabilityTier: {
      short: "quanto reserva você quer",
      long: "O nível de confiabilidade define quantas horas por ano podem precisar de gerador ou de rede.",
    },
    gridTie: {
      short: "solar conectado à rede",
      long: "Conectado à rede significa que a distribuidora continua disponível quando a solar não cobre a carga.",
    },
    offGrid: {
      short: "independente da distribuidora",
      long: "Fora da rede significa que painéis e armazenamento precisam cobrir a carga, com gerador ou outra reserva para faltas raras.",
    },
  },
  fr: {
    kWh: {
      short: "énergie consommée",
      long: "Le kWh est une unité d'énergie : à peu près ce que consomme un appareil de 1 000 W en une heure.",
    },
    Wh: {
      short: "une petite unité d'énergie",
      long: "Un Wh est un millième de kWh. Le calculateur s'en sert pour additionner heure par heure.",
    },
    kW: {
      short: "taille de la puissance",
      long: "Un kW indique la vitesse à laquelle l'électricité est produite ou utilisée. Plus de kW signifie plus d'appareils en marche en même temps.",
    },
    DoD: {
      short: "part de batterie utilisée",
      long: "La profondeur de décharge est la part d'une batterie vidée avant recharge. Garder une réserve l'aide souvent à durer plus longtemps.",
    },
    Ah: {
      short: "quantité de charge de la batterie",
      long: "Les ampères-heures décrivent une charge électrique. Les fabricants les utilisent avec la tension pour décrire l'énergie stockée.",
    },
    inverter: {
      short: "le traducteur d'électricité",
      long: "L'onduleur convertit l'électricité de la batterie ou des panneaux dans la forme utilisée par vos appareils, et peut aussi charger la batterie.",
    },
    MPPT: {
      short: "contrôle du rendement des panneaux",
      long: "Le MPPT est l'électronique qui maintient les panneaux près de leur tension la plus productive quand la lumière change.",
    },
    autonomy: {
      short: "jours sans soleil",
      long: "L'autonomie est la durée pendant laquelle la batterie fait tourner les charges choisies quand les panneaux produisent peu ou pas.",
    },
    roundTripEfficiency: {
      short: "énergie perdue au stockage",
      long: "Le rendement aller-retour est la part d'énergie récupérée après charge et décharge d'une batterie.",
    },
    cycleLife: {
      short: "durée de vie de la batterie",
      long: "La durée de vie en cycles estime combien d'usages complets une batterie peut fournir avant de perdre de la capacité.",
    },
    usableCapacity: {
      short: "énergie utilisable sans risque",
      long: "La capacité utile laisse de côté la réserve qui protège la batterie d'une décharge excessive.",
    },
    soiling: {
      short: "pertes dues à la poussière",
      long: "L'encrassement est la lumière qu'un panneau perd quand poussière, pollen, sel ou saleté le recouvrent.",
    },
    derates: {
      short: "pertes réelles",
      long: "Les facteurs de perte couvrent la chaleur, la poussière, le câblage, les panneaux désaccordés et d'autres pertes entre la lumière et l'électricité utile.",
    },
    NOCT: {
      short: "référence thermique du panneau",
      long: "La NOCT est une référence normalisée pour estimer l'échauffement d'un panneau au soleil.",
    },
    temperatureCoefficient: {
      short: "perte du panneau due à la chaleur",
      long: "Le coefficient de température estime comment la production d'un panneau varie quand il chauffe ou refroidit.",
    },
    systemVoltage: {
      short: "tension du parc de batteries",
      long: "La tension du système est la pression électrique du parc de batteries. Une tension plus élevée signifie souvent moins de courant dans les câbles.",
    },
    string: {
      short: "un groupe en série",
      long: "Une chaîne est un groupe de batteries ou de panneaux en série, dont les tensions s'additionnent.",
    },
    BMS: {
      short: "électronique de sécurité de la batterie",
      long: "Le système de gestion de batterie surveille la tension et la température des cellules et peut arrêter une charge ou une décharge dangereuse.",
    },
    LCOE: {
      short: "prix de l'énergie sur la durée",
      long: "Le coût actualisé de l'énergie répartit équipement, remplacements et énergie livrée sur la durée de vie modélisée du système.",
    },
    paybackPeriod: {
      short: "temps de retour sur coût",
      long: "Le temps de retour est la durée nécessaire pour que les économies modélisées égalent le coût du matériel. Ce n'est pas une promesse.",
    },
    tariff: {
      short: "votre prix de l'électricité",
      long: "Le tarif est le prix facturé par le réseau ou le groupe électrogène pour chaque unité d'énergie.",
    },
    unmetHours: {
      short: "heures à couvrir autrement",
      long: "Les heures non couvertes sont celles où les panneaux et la batterie modélisés n'ont pas pu servir toute la charge choisie.",
    },
    reliabilityTier: {
      short: "niveau de secours souhaité",
      long: "Le niveau de fiabilité fixe combien d'heures par an peuvent nécessiter un groupe ou le réseau.",
    },
    gridTie: {
      short: "solaire en restant raccordé",
      long: "Raccordé au réseau signifie que le fournisseur reste disponible quand le solaire ne couvre pas la charge.",
    },
    offGrid: {
      short: "indépendant du réseau",
      long: "Hors réseau signifie que panneaux et stockage doivent couvrir la charge, avec un groupe ou un autre secours pour les rares manques.",
    },
  },
  de: {
    kWh: {
      short: "verbrauchte Energie",
      long: "Eine kWh ist eine Energieeinheit — ungefähr das, was ein Gerät mit 1.000 Watt in einer Stunde verbraucht.",
    },
    Wh: {
      short: "eine kleine Energieeinheit",
      long: "Eine Wh ist ein Tausendstel kWh. Der Rechner nutzt sie für die Stunde-für-Stunde-Rechnung.",
    },
    kW: {
      short: "Größe der Leistung",
      long: "Ein kW zeigt, wie schnell Strom erzeugt oder verbraucht wird. Mehr kW heißt, dass mehr Geräte gleichzeitig laufen können.",
    },
    DoD: {
      short: "wie viel der Batterie wir nutzen",
      long: "Die Entladetiefe ist der Anteil einer Batterie, der vor dem Laden entladen wird. Eine Reserve lässt sie meist länger halten.",
    },
    Ah: {
      short: "Ladungsmenge der Batterie",
      long: "Amperestunden beschreiben elektrische Ladung. Hersteller nutzen sie zusammen mit der Spannung, um gespeicherte Energie anzugeben.",
    },
    inverter: {
      short: "der Stromübersetzer",
      long: "Der Wechselrichter wandelt Strom von der Batterie oder den Panelen in die Form, die deine Geräte brauchen, und kann die Batterie auch laden.",
    },
    MPPT: {
      short: "Ertragsregler der Panele",
      long: "MPPT ist Elektronik, die die Panele bei wechselndem Licht nahe ihrer ertragreichsten Spannung hält.",
    },
    autonomy: {
      short: "Tage ohne Sonne",
      long: "Autonomie ist die Zeit, in der die Batterie gewählte Lasten versorgt, wenn die Panele wenig oder keinen Strom liefern.",
    },
    roundTripEfficiency: {
      short: "Verlust beim Speichern",
      long: "Der Wirkungsgrad über den ganzen Zyklus ist der Anteil der Energie, den du nach Laden und Entladen zurückbekommst.",
    },
    cycleLife: {
      short: "Lebensdauer der Batterie",
      long: "Die Zyklenzahl schätzt, wie viele vollständige Nutzungen eine Batterie liefert, bevor sie Kapazität verliert.",
    },
    usableCapacity: {
      short: "sicher nutzbare Energie",
      long: "Die nutzbare Kapazität lässt die Reserve weg, die die Batterie vor schädlicher Tiefentladung schützt.",
    },
    soiling: {
      short: "Verluste durch Staub und Schmutz",
      long: "Verschmutzung ist das Sonnenlicht, das ein Paneel verliert, wenn Staub, Pollen, Salz oder Schmutz darauf liegen.",
    },
    derates: {
      short: "Verluste aus der Praxis",
      long: "Verlustfaktoren berücksichtigen Wärme, Staub, Verkabelung, ungleiche Panele und andere Verluste zwischen Sonnenlicht und nutzbarem Strom.",
    },
    NOCT: {
      short: "Wärmereferenz des Paneels",
      long: "NOCT ist ein Standardwert, um abzuschätzen, wie warm ein arbeitendes Paneel in der Sonne wird.",
    },
    temperatureCoefficient: {
      short: "wärmebedingter Panelverlust",
      long: "Der Temperaturkoeffizient schätzt, wie sich die Leistung eines Paneels ändert, wenn es wärmer oder kälter wird.",
    },
    systemVoltage: {
      short: "Spannung des Batteriespeichers",
      long: "Die Systemspannung ist der elektrische Druck des Batteriespeichers. Höhere Spannung bedeutet meist weniger Strom in den Kabeln.",
    },
    string: {
      short: "eine in Reihe geschaltete Gruppe",
      long: "Ein Strang ist eine Gruppe von Batterien oder Panelen in Reihenschaltung, deren Spannungen sich addieren.",
    },
    BMS: {
      short: "Sicherheitselektronik der Batterie",
      long: "Ein Batteriemanagementsystem überwacht Zellspannung und Temperatur und kann unsicheres Laden oder Entladen stoppen.",
    },
    LCOE: {
      short: "Energiepreis über die Laufzeit",
      long: "Die Stromgestehungskosten verteilen Geräte, Ersatz und gelieferte Energie über die modellierte Lebensdauer des Systems.",
    },
    paybackPeriod: {
      short: "Zeit bis zum Kostenausgleich",
      long: "Die Amortisationszeit ist, wie lange die modellierten Einsparungen brauchen, um die Gerätekosten zu erreichen. Es ist kein Versprechen.",
    },
    tariff: {
      short: "dein Strompreis",
      long: "Der Tarif ist der Preis, den Netz oder Generator pro Energieeinheit berechnen.",
    },
    unmetHours: {
      short: "Stunden mit Backup-Bedarf",
      long: "Ungedeckte Stunden sind die Stunden, in denen Panele und Batterie die gewählte Last nicht vollständig versorgen konnten.",
    },
    reliabilityTier: {
      short: "wie viel Reserve du willst",
      long: "Eine Zuverlässigkeitsstufe legt fest, wie viele Stunden im Jahr ein Generator oder das Netz nötig sein dürfen.",
    },
    gridTie: {
      short: "Solar mit Netzanschluss",
      long: "Netzgekoppelt heißt, dass das Netz verfügbar bleibt, wenn Solar die Last nicht deckt.",
    },
    offGrid: {
      short: "unabhängig vom Netz",
      long: "Inselbetrieb heißt, Panele und Speicher müssen die Last decken, mit Generator oder anderem Backup für seltene Lücken.",
    },
  },
  nl: {
    kWh: {
      short: "gebruikte energie",
      long: "Een kWh is een eenheid energie: ongeveer wat een apparaat van 1.000 watt in een uur verbruikt.",
    },
    Wh: {
      short: "een kleine energie-eenheid",
      long: "Een Wh is een duizendste kWh. De calculator gebruikt die voor de rekenstap per uur.",
    },
    kW: {
      short: "grootte van het vermogen",
      long: "Een kW laat zien hoe snel elektriciteit wordt opgewekt of gebruikt. Meer kW betekent dat er meer apparaten tegelijk kunnen draaien.",
    },
    DoD: {
      short: "hoeveel we van de batterij gebruiken",
      long: "De ontlaaddiepte is het deel van een batterij dat leeggaat voordat hij wordt geladen. Een reserve laten helpt hem meestal langer mee te gaan.",
    },
    Ah: {
      short: "laadhoeveelheid van de batterij",
      long: "Ampère-uren beschrijven elektrische lading. Fabrikanten gebruiken ze samen met de spanning om opgeslagen energie aan te geven.",
    },
    inverter: {
      short: "de elektriciteitsvertaler",
      long: "Een omvormer zet elektriciteit van de batterij of panelen om naar de vorm die je apparaten gebruiken, en kan de batterij ook laden.",
    },
    MPPT: {
      short: "opbrengstregeling van de panelen",
      long: "MPPT is elektronica die de panelen bij wisselend licht dicht bij hun productiefste spanning houdt.",
    },
    autonomy: {
      short: "dagen zonder zon",
      long: "Autonomie is hoe lang de batterij gekozen lasten kan blijven voeden als de panelen weinig of niets opwekken.",
    },
    roundTripEfficiency: {
      short: "verlies bij het opslaan",
      long: "Het rendement over de hele cyclus is het deel van de energie dat je terugkrijgt na laden en ontladen.",
    },
    cycleLife: {
      short: "levensduur van de batterij",
      long: "De cycluslevensduur schat hoeveel volledige gebruiken een batterij levert voordat hij capaciteit verliest.",
    },
    usableCapacity: {
      short: "energie die we veilig kunnen gebruiken",
      long: "De bruikbare capaciteit laat de reserve weg die de batterij beschermt tegen te diepe ontlading.",
    },
    soiling: {
      short: "verlies door stof en vuil",
      long: "Vervuiling is het zonlicht dat een paneel verliest als stof, pollen, zout of vuil het bedekken.",
    },
    derates: {
      short: "verliezen uit de praktijk",
      long: "Verliesfactoren dekken warmte, stof, bedrading, panelen die niet gelijk zijn en andere verliezen tussen zonlicht en bruikbare stroom.",
    },
    NOCT: {
      short: "warmtereferentie van het paneel",
      long: "NOCT is een standaardwaarde om te schatten hoe warm een werkend paneel in de zon wordt.",
    },
    temperatureCoefficient: {
      short: "warmteverlies van het paneel",
      long: "De temperatuurcoëfficiënt schat hoe de opbrengst van een paneel verandert als het warmer of kouder wordt.",
    },
    systemVoltage: {
      short: "spanning van het batterijpakket",
      long: "De systeemspanning is de elektrische druk van het batterijpakket. Hogere spanning betekent meestal minder stroom in de kabels.",
    },
    string: {
      short: "een in serie geschakelde groep",
      long: "Een string is een groep batterijen of panelen in serie, zodat hun spanningen bij elkaar optellen.",
    },
    BMS: {
      short: "veiligheidselektronica van de batterij",
      long: "Een batterijbeheersysteem houdt celspanning en temperatuur in de gaten en kan onveilig laden of ontladen stoppen.",
    },
    LCOE: {
      short: "energieprijs over de levensduur",
      long: "De gestandaardiseerde energiekosten verdelen apparatuur, vervanging en geleverde energie over de gemodelleerde levensduur van het systeem.",
    },
    paybackPeriod: {
      short: "tijd om de kosten terug te verdienen",
      long: "De terugverdientijd is hoe lang de gemodelleerde besparing nodig heeft om de apparatuurkosten te evenaren. Het is geen belofte.",
    },
    tariff: {
      short: "jouw elektriciteitsprijs",
      long: "Het tarief is de prijs die je netbeheerder of generator per eenheid energie rekent.",
    },
    unmetHours: {
      short: "uren die back-up nodig hebben",
      long: "Onvervulde uren zijn de uren waarin de gemodelleerde panelen en batterij de gekozen last niet volledig konden dekken.",
    },
    reliabilityTier: {
      short: "hoeveel back-up je wilt",
      long: "Een betrouwbaarheidsniveau bepaalt hoeveel uur per jaar een generator of netaansluiting nodig mag zijn.",
    },
    gridTie: {
      short: "zon met netaansluiting",
      long: "Netgekoppeld betekent dat het net beschikbaar blijft wanneer zon de last niet dekt.",
    },
    offGrid: {
      short: "onafhankelijk van het net",
      long: "Off-grid betekent dat panelen en opslag de last moeten dekken, met een generator of andere back-up voor zeldzame tekorten.",
    },
  },
  ar: {
    kWh: {
      short: "الطاقة المستخدمة",
      long: "الكيلوواط ساعة وحدة للطاقة، وهي تقريبًا ما يستهلكه جهاز بقدرة 1000 واط خلال ساعة.",
    },
    Wh: {
      short: "وحدة طاقة صغيرة",
      long: "الواط ساعة جزء من ألف من الكيلوواط ساعة. تستخدمها الحاسبة في الجمع ساعة بساعة.",
    },
    kW: {
      short: "حجم القدرة",
      long: "الكيلوواط يبيّن سرعة إنتاج الكهرباء أو استهلاكها. كلما زاد عدد الكيلوواط أمكن تشغيل أجهزة أكثر في الوقت نفسه.",
    },
    DoD: {
      short: "مقدار ما نستخدمه من البطارية",
      long: "عمق التفريغ هو نسبة ما يُفرَّغ من البطارية قبل إعادة شحنها. ترك احتياطي يساعدها عادة على العمر الأطول.",
    },
    Ah: {
      short: "كمية شحنة البطارية",
      long: "الأمبير ساعة وحدة لقياس الشحنة الكهربائية، ويستخدمها المصنّعون مع الجهد لوصف الطاقة المخزنة.",
    },
    inverter: {
      short: "محوّل الكهرباء",
      long: "يحوّل العاكس كهرباء الألواح أو البطارية إلى النوع الذي تستخدمه أجهزتك، وقد يشحن البطارية أيضًا.",
    },
    MPPT: {
      short: "منظّم إنتاج الألواح",
      long: "هو إلكترونيات تُبقي الألواح قريبة من جهدها الأكثر إنتاجًا مع تغيّر ضوء الشمس.",
    },
    autonomy: {
      short: "أيام بلا شمس",
      long: "الاستقلالية هي المدة التي تستطيع البطارية فيها تشغيل الأحمال المختارة حين تنتج الألواح طاقة قليلة أو معدومة.",
    },
    roundTripEfficiency: {
      short: "الطاقة المفقودة عند التخزين",
      long: "مردود الدورة الكاملة هو نسبة الطاقة التي تستعيدها بعد شحن البطارية وتفريغها.",
    },
    cycleLife: {
      short: "عمر البطارية",
      long: "عمر الدورات تقدير لعدد مرات الاستخدام الكامل التي تقدمها البطارية قبل أن تفقد سعتها.",
    },
    usableCapacity: {
      short: "الطاقة التي يمكن استخدامها بأمان",
      long: "السعة القابلة للاستخدام تستبعد الاحتياطي الذي يحمي البطارية من التفريغ الزائد.",
    },
    soiling: {
      short: "خسائر الغبار والأوساخ",
      long: "الاتساخ هو ضوء الشمس الذي تفقده اللوحة حين يغطيها الغبار أو حبوب اللقاح أو الملح أو الأوساخ.",
    },
    derates: {
      short: "عوامل الفقد الواقعية",
      long: "تأخذ عوامل الفقد في الحسبان الحرارة والغبار والأسلاك واختلاف الألواح وغيرها بين ضوء الشمس والكهرباء المفيدة.",
    },
    NOCT: {
      short: "مرجع حرارة اللوحة",
      long: "هي قيمة مرجعية معيارية لتقدير مدى سخونة اللوحة العاملة تحت الشمس.",
    },
    temperatureCoefficient: {
      short: "فقد اللوحة بسبب الحرارة",
      long: "معامل الحرارة يقدّر كيف يتغير إنتاج اللوحة عند ارتفاع حرارتها أو انخفاضها.",
    },
    systemVoltage: {
      short: "جهد بنك البطاريات",
      long: "جهد النظام هو الضغط الكهربائي لبنك البطاريات. الجهد الأعلى يعني عادة تيارًا أقل في الكابلات.",
    },
    string: {
      short: "مجموعة موصولة على التسلسل",
      long: "السلسلة مجموعة من البطاريات أو الألواح موصولة على التسلسل لتُجمع جهودها.",
    },
    BMS: {
      short: "إلكترونيات سلامة البطارية",
      long: "نظام إدارة البطارية يراقب جهد الخلايا وحرارتها ويستطيع إيقاف الشحن أو التفريغ غير الآمن.",
    },
    LCOE: {
      short: "سعر الطاقة على المدى الطويل",
      long: "التكلفة المعيارية للطاقة توزّع المعدات والاستبدال والطاقة المسلَّمة على عمر النظام المقدَّر.",
    },
    paybackPeriod: {
      short: "مدة استرداد التكلفة",
      long: "مدة الاسترداد هي المدة التي تحتاجها الوفورات المقدَّرة لتساوي تكلفة المعدات. وهي ليست وعدًا.",
    },
    tariff: {
      short: "سعر الكهرباء لديك",
      long: "التعرفة هي السعر الذي تفرضه الشبكة أو المولد لكل وحدة طاقة.",
    },
    unmetHours: {
      short: "ساعات تحتاج إلى احتياطي",
      long: "الساعات غير الملبّاة هي الساعات التي لم تستطع فيها الألواح والبطارية تغطية الحمل المختار بالكامل.",
    },
    reliabilityTier: {
      short: "مقدار الاحتياطي الذي تريده",
      long: "مستوى الموثوقية يحدد عدد الساعات سنويًا التي قد تحتاج مولدًا أو اتصالًا بالشبكة.",
    },
    gridTie: {
      short: "شمس مع البقاء على الشبكة",
      long: "الاتصال بالشبكة يعني بقاء الشبكة متاحة حين لا تغطي الطاقة الشمسية الحمل.",
    },
    offGrid: {
      short: "استقلال عن الشبكة",
      long: "الانفصال عن الشبكة يعني أن الألواح والتخزين يجب أن يغطيا الحمل، مع مولد أو احتياطي آخر للنقص النادر.",
    },
  },
});

export function jargonEntry(term, lang) {
  // Translation overlays are intentionally partial: any term missing from the
  // requested locale falls back to the English explanation, exactly like the
  // UI locale layer. Unknown terms return null so callers can skip wiring.
  if (lang && JARGON_LOCALES[lang]?.[term]) return JARGON_LOCALES[lang][term];
  return JARGON[term] || null;
}

export function explainElement(element, term, lang) {
  const entry = jargonEntry(term, lang);
  if (!element || !entry) return false;
  element.setAttribute("data-eli5", entry.long);
  element.setAttribute("title", `${entry.short}: ${entry.long}`);
  element.setAttribute("tabindex", "0");
  element.setAttribute("aria-label", `${term}: ${entry.long}`);
  return true;
}
