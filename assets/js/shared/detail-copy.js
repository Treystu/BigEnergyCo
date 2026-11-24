// Results-detail copy (#437). The system spec, the BOS checklist, the plain-
// language summary and the appliance picker are all painted by JS, so their
// strings cannot carry a data-i18n hook: every one of them is keyed here and the
// painter calls t(). Appliance NAMES keep their English identity key for data
// lookup and get a display key instead (apXxx), so a translation can never be
// used as a lookup. checks-i18n and tests/locale-chrome.test.mjs hold parity.

export const DETAIL_COPY = {
  en: {
    dAssumpData:
      "Data: {source}, hourly {years}. Derates applied: soiling {soiling}%, wiring {wiring}%, mismatch {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Cell temperature model: NOCT {noct}°C, power temperature coefficient {gamma}%/°C.",
    dAssumpInverter: "Inverter efficiency {eta}%.",
    dAssumpCold:
      "Charging is blocked below the chemistry's cold limit (LFP 0 °C).",
    dAssumpLoad: "Load basis: {basis}.",
    dAssumpCosts:
      "Costs span {basis} ({source}) — the low end is parts before freight, duty and BMS; the high end is shipped retail with BMS and enclosure included.",
    dAssumpOffline:
      "OFFLINE MODE: this run used the bundled typical-year profile for {city} — a close approximation, not your exact site. Re-run online for five years of point-specific weather.",
    dAssumpTariff: "Grid spend assumes {rate} at {kwh} kWh/day.",
    dAssumpNoTariff: "No tariff entered, so payback is not shown.",
    dCapAuto:
      "Capacity model at this site's mean {t}°C: LFP 100%, sodium-ion 85% (LFP voltage settings), lead-acid (AGM) about {agm}% (cold derating where applicable).",
    dCapAgmCold:
      "Cold site: at a mean {t}°C, lead-acid (AGM) is derated to about {pct}% of nameplate capacity; lithium and sodium are unaffected by cold in this model (they charge more slowly instead).",
    dCapScale:
      "At this site's mean {t}°C, {name} delivers about {pct}% of nameplate usable capacity (rate/cold scaling).",
    dCapFull:
      "Capacity model assumes full nameplate usable capacity at this site's mean {t}°C.",
    // Results-detail panel: system spec, BOS checklist, plain-language summary.
    dSecPanels: "Panels",
    dRowArray: "Array",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Space needed",
    dValSpace: "about {area} m² of roof or ground (mounting gaps included)",
    dValPanelsNone:
      "None (battery-only setup — time-of-use arbitrage / peak offset)",
    dSecBatteryBank: "Battery bank",
    dRowSystemVoltage: "System voltage",
    dValVoltage:
      "{volts} V — fits a {kw} kW-class inverter and a {kwh} kWh nameplate bank",
    dRowDiyBuild: "DIY build",
    dValDiy: "{label} × {strings} parallel string(s) = {cells} cells",
    dRowPrebuilt: "Prebuilt alternative",
    dValRetailHead: "{modules} × {label} = {kwh} kWh nameplate",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh nameplate, {pct}% over the ~{target} kWh target",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh nameplate, within {pct}% of the ~{target} kWh target",
    dRowNameplateTarget: "Nameplate target",
    dValNameplate: "~{kwh} kWh at {dod}% usable depth of discharge",
    dValBatteryNone:
      "None (solar-only setup — direct consumption plus grid export)",
    dSecInverter: "Inverter",
    dRowPeakDemand: "Your peak demand",
    dValPeak: "~{kw} kW at once",
    dRowSuggestedClass: "Suggested class",
    dValSuggested: "{kw} kW continuous minimum",
    dRowReferenceUnit: "Reference unit (an example only)",
    dRowSurgeRule: "Surge rule",
    dSurgeNote:
      "Pick a low-frequency unit with ~3× surge if the load includes fridges, pumps, or tools — motor start current hits hard for half a second. Use slow-blow fuses (Class-T) so that same surge does not nuisance-trip them.",
    dSecController: "Charge controller & protection",
    dRowControllerCapacity: "Controller capacity",
    dValController: "{amps} A total — {suggestion}",
    dRowControllerNote: "Controller note",
    dControllerNote:
      "Many low-frequency hybrid inverters have an MPPT charger built in — check its max PV input covers these amps before buying a separate controller.",
    dControllerOne: "one {amps} A MPPT controller",
    dControllerSplit: "split across {n} × 100 A MPPT trackers",
    dRowMainFuse: "Main battery fuse/breaker",
    dValMainFuse: "{amps} A (the bank can pull ~{discharge} A at full load)",
    dRowPvDisconnect: "PV disconnect",
    dSecCable: "Battery-to-inverter cable (copper)",
    dRowRun: "{meters} m run",
    dValCableOk: "{awg} ({mm2} mm²) or larger",
    dValCableShort: "larger than {awg} — shorten the run",
    dSecMounting: "Array mounting & best tilt",
    dRowOrientation: "Array orientation",
    dValFaceSouth: "Face true south (180°) for the most annual sun",
    dValFaceNorth: "Face true north (0°) for the most annual sun",
    dRowYearTilt: "Year-round fixed tilt",
    dValDegrees: "~{deg}° from horizontal",
    dRowWinterTilt: "Winter steep tilt (needed off-grid)",
    dValWinterTilt: "~{deg}° — sheds snow and catches the low winter sun",
    dRowSummerTilt: "Summer tilt (optional)",
    dRowMounting: "Mounting recommendation",
    dValMountSnow:
      "Ground mount strongly recommended: easier snow clearing and seasonal tilt adjustment",
    dValMountRoof: "Roof mount (flush or racked) or ground mount",
    dBosTitle: "Essential balance-of-system and safety checklist",
    dBosRowDisconnect: "DC battery disconnect",
    dBosValDisconnect:
      "Heavy-duty rotary disconnect switch plus a Class-T fuse (or DC-rated breaker) sized to {amps} A, next to the battery positive terminal.",
    dBosRowPvIsolator: "PV array isolator + SPD",
    dBosValPvIsolator:
      "DC-rated 2-pole breaker and a DC surge protective device (lightning arrestor) before the charge controller.",
    dBosRowShunt: "Battery shunt / monitor",
    dBosValShunt:
      "Precision 500 A shunt on the main battery negative for exact state-of-charge tracking (voltage alone is inaccurate on lithium).",
    dBosRowBusbars: "Copper busbars & cables",
    dBosValBusbars:
      "Solid copper busbars for paralleling several batteries; hydraulic hex crimps with dual-wall adhesive heatshrink on every battery cable lug.",
    dBosRowGrounding: "Equipment grounding",
    dBosValGroundPv:
      "Bond the panel mounting rails, lightning arrestors and inverter chassis to a ground rod.",
    dBosValGroundNoPv:
      "Bond the battery rack, inverter chassis and any metal enclosure to a ground rod.",
    dBosRowSplit: "240 V split-phase alert",
    dBosValSplit:
      "Your chosen appliances (deep well pump, heat pump or EV charger) need 240 V split-phase (L1 + L2 + N). Use a native 120/240 V split-phase inverter, or two identical 120 V inverters stacked with a communication cable.",
    dNoteAveragePeak:
      "Inverter sized from average load (no appliance peak entered) — real spikes (kettle, fridge start, pump surge) can be several times higher. Enter appliances for an exact peak.",
    dNotePeakOverMax:
      "Peak {kw} kW is above the largest standard {max} kW class — plan several stacked units, not one {kw} kW box.",
    dNoteNoBattery:
      "No battery in this system, so voltage, bank layout and DC protection are left out.",
    dNoteVolts12:
      "12 V class: fine for RV-scale loads. Above ~1.5 kW continuous, 24 V or 48 V wastes far less copper.",
    dNoteVolts24:
      "24 V class: the middle road — workable to about 3.5 kW continuous.",
    dNoteVolts48:
      "48 V class: what any house-scale system uses — the least current for the same power.",
    dNoteRoundUp:
      "Banks come in whole strings: the smallest {label} build gives ~{provided} kWh for a {ask} kWh ask — the shopping list rounds up, the simulation did not.",
    dNoteFuseOverflow:
      "Full-load battery current (~{amps} A) is above standard fuse ratings — this bank needs parallel strings with per-string protection, designed by an electrician.",
    dDiyAgmLabel: "{series}S strings of 12 V {ah} Ah AGM blocks",
    dDiyCellsLabel: "{series}S strings of {ah} Ah prismatic cells",
    dRetailAgmLabel: "12 V {ah} Ah AGM blocks (no BMS — wire with balancing)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "above the {class} kW reference class — expect several stacked units",
    dReferenceNo48:
      "no 48 V reference applies here — source a {volts} V-class inverter/charger for this bank voltage",
    dEli5Title: "💡 In plain language",
    dEli5Solar: "Solar",
    dEli5Storage: "Storage",
    dEli5Target: "Target",
    dEli5Panels: "{kw} kW of panels",
    dEli5Battery: "{kwh} kWh usable battery",
    dEli5Cut: "{pct}% less grid energy",
    dEli5Reliability: "{pct}% reliability target",
    dEli5NoPanels: "no panels in this option",
    dEli5NoBattery: "no battery in this option",
    dPricePerKwh: "Your price per kWh ({sym}):",
    dStepResult: "4. Your result",
    dCapacitySpectrum: "📊 Capacity spectrum (relative to your selection)",
    dInstallApp: "📲 Install App",
    dInstallAppLong: "📲 Install BigEnergyCo App",
    dReadTerms: "Read full terms →",
    dReadAi: "Read AI disclaimer →",
    dReadPrivacy: "Read privacy note →",
    apRefrigeratorModern: "Refrigerator (modern, mid-size)",
    apRefrigeratorOld: "Refrigerator (old or large)",
    apChestFreezer: "Chest freezer",
    apFan: "Ceiling or desk fan",
    apWindowAc: "Window air conditioner (one room)",
    apSplitAc: "Split air conditioner (whole floor)",
    apMiniSplitHeat: "Mini-split heat pump (heating mode)",
    apMicrowave: "Microwave",
    apKettle: "Electric kettle",
    apCoffee: "Coffee maker",
    apRiceCooker: "Rice cooker",
    apInduction: "Induction cooktop (1 burner)",
    apAirFryer: "Air fryer",
    apLedBulb: "LED light bulb",
    apLedTv: "LED TV",
    apComputer: "Laptop or desktop computer",
    apPhoneCharger: "Phone charger",
    apRouter: "Internet router (always on)",
    apStarlink: "Starlink / satellite internet",
    apWasher: "Washing machine",
    apWaterPump: "Water pump (shallow, pressure tank, 120 V)",
    apDeepWellPump: "Deep well pump (submersible, 240 V)",
    apVacuum: "Vacuum cleaner",
    apIron: "Clothes iron",
    apSpaceHeater: "Space heater (small)",
    apWaterHeater: "Electric water heater (240 V)",
    apPoolPump: "Pool pump",
    apEvCharger: "EV charger (Level 1 trickle, 120 V 12 A)",
    apWorkshopTools: "Workshop tools (table saw / compressor)",
    dValRetailNote:
      "The smallest prebuilt unit in this voltage class is already this size — at this bank the DIY list is the closer match.",
    dRefModel: "{kw} kW low-frequency split-phase",
    dRefNote: "48 V · 3× surge · built-in MPPT",
    dChartGround: "Ground / Horizon",
    dChartFacing: "🧭 Facing {compass}",
    dChartTilt: "~{tilt}° Tilt",
    dMatrixPick: "Select {row} at {col}:",
  },
  es: {
    dAssumpData:
      "Datos: {source}, por horas, {years}. Pérdidas aplicadas: suciedad {soiling}%, cableado {wiring}%, desajuste {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Modelo de temperatura de célula: NOCT {noct}°C, coeficiente de temperatura de potencia {gamma}%/°C.",
    dAssumpInverter: "Rendimiento del inversor {eta}%.",
    dAssumpCold:
      "La carga se bloquea por debajo del límite de frío de la química (LFP 0 °C).",
    dAssumpLoad: "Base de la carga: {basis}.",
    dAssumpCosts:
      "Los costes van de {basis} ({source}): el extremo bajo son piezas antes de flete, aranceles y BMS; el alto es venta minorista enviada con BMS y carcasa incluidas.",
    dAssumpOffline:
      "MODO SIN CONEXIÓN: este cálculo usó el perfil de año típico incluido para {city}, una aproximación cercana, no tu ubicación exacta. Vuelve a ejecutarlo en línea para cinco años de clima de tu punto.",
    dAssumpTariff: "El gasto de red supone {rate} a {kwh} kWh/día.",
    dAssumpNoTariff:
      "No has introducido tarifa, así que no se muestra la amortización.",
    dCapAuto:
      "Modelo de capacidad con la media de {t}°C del sitio: LFP 100%, ion de sodio 85% (ajustes de tensión LFP), plomo-ácido (AGM) unos {agm}% (con reducción por frío cuando aplica).",
    dCapAgmCold:
      "Sitio frío: con una media de {t}°C, el plomo-ácido (AGM) se reduce a unos {pct}% de la capacidad nominal; el litio y el sodio no se ven afectados por el frío en este modelo (cargan más despacio).",
    dCapScale:
      "Con la media de {t}°C del sitio, {name} entrega unos {pct}% de la capacidad útil nominal (escalado por tasa/frío).",
    dCapFull:
      "El modelo de capacidad asume la capacidad útil nominal completa con la media de {t}°C del sitio.",
    dSecPanels: "Paneles",
    dRowArray: "Campo solar",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Espacio necesario",
    dValSpace: "unos {area} m² de tejado o suelo (huecos de montaje incluidos)",
    dValPanelsNone:
      "Ninguno (solo batería — arbitraje por franjas horarias / desplazamiento de punta)",
    dSecBatteryBank: "Banco de baterías",
    dRowSystemVoltage: "Tensión del sistema",
    dValVoltage:
      "{volts} V — encaja con un inversor de clase {kw} kW y un banco de {kwh} kWh nominales",
    dRowDiyBuild: "Montaje DIY",
    dValDiy: "{label} × {strings} hilera(s) en paralelo = {cells} celdas",
    dRowPrebuilt: "Alternativa prefabricada",
    dValRetailHead: "{modules} × {label} = {kwh} kWh nominales",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh nominales, {pct}% por encima del objetivo de ~{target} kWh",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh nominales, dentro del {pct}% del objetivo de ~{target} kWh",
    dRowNameplateTarget: "Objetivo nominal",
    dValNameplate: "~{kwh} kWh con {dod}% de profundidad de descarga útil",
    dValBatteryNone:
      "Ninguna (solo solar — consumo directo más vertido a la red)",
    dSecInverter: "Inversor",
    dRowPeakDemand: "Tu demanda máxima",
    dValPeak: "~{kw} kW a la vez",
    dRowSuggestedClass: "Clase sugerida",
    dValSuggested: "{kw} kW continuos como mínimo",
    dRowReferenceUnit: "Unidad de referencia (solo un ejemplo)",
    dRowSurgeRule: "Regla de pico de arranque",
    dSurgeNote:
      "Elige una unidad de baja frecuencia con ~3× de pico si la carga incluye frigoríficos, bombas o herramientas: la corriente de arranque del motor golpea fuerte durante medio segundo. Usa fusibles lentos (clase T) para que ese mismo pico no los dispare sin motivo.",
    dSecController: "Regulador de carga y protección",
    dRowControllerCapacity: "Capacidad del regulador",
    dValController: "{amps} A en total — {suggestion}",
    dRowControllerNote: "Nota del regulador",
    dControllerNote:
      "Muchos inversores híbridos de baja frecuencia llevan cargador MPPT incorporado: comprueba que su entrada FV máxima cubra estos amperios antes de comprar un regulador aparte.",
    dControllerOne: "un regulador MPPT de {amps} A",
    dControllerSplit: "repartido en {n} × reguladores MPPT de 100 A",
    dRowMainFuse: "Fusible/interruptor principal de batería",
    dValMainFuse:
      "{amps} A (el banco puede tirar ~{discharge} A a plena carga)",
    dRowPvDisconnect: "Desconexión FV",
    dSecCable: "Cable batería-inversor (cobre)",
    dRowRun: "tramo de {meters} m",
    dValCableOk: "{awg} ({mm2} mm²) o mayor",
    dValCableShort: "más de {awg} — acorta el tramo",
    dSecMounting: "Montaje del campo solar y mejor inclinación",
    dRowOrientation: "Orientación del campo",
    dValFaceSouth:
      "Orientado al sur verdadero (180°) para la máxima cosecha anual",
    dValFaceNorth:
      "Orientado al norte verdadero (0°) para la máxima cosecha anual",
    dRowYearTilt: "Inclinación fija todo el año",
    dValDegrees: "~{deg}° respecto a la horizontal",
    dRowWinterTilt:
      "Inclinación pronunciada de invierno (necesaria fuera de red)",
    dValWinterTilt:
      "~{deg}° — evacua la nieve y capta el sol bajo del invierno",
    dRowSummerTilt: "Inclinación de verano (opcional)",
    dRowMounting: "Recomendación de montaje",
    dValMountSnow:
      "Se recomienda encarecidamente montaje en suelo: limpiar la nieve y ajustar la inclinación por temporada es mucho más fácil",
    dValMountRoof: "Montaje en tejado (a ras o con estructura) o en suelo",
    dBosTitle: "Lista esencial de equilibrio de sistema (BOS) y seguridad",
    dBosRowDisconnect: "Desconexión CC de batería",
    dBosValDisconnect:
      "Interruptor rotativo de servicio pesado más un fusible clase T (o interruptor automático apto para CC) dimensionado a {amps} A, junto al borne positivo de la batería.",
    dBosRowPvIsolator: "Aislador de campo FV + SPD",
    dBosValPvIsolator:
      "Interruptor automático bipolar apto para CC y un protector contra sobretensiones CC (pararrayos) antes del regulador de carga.",
    dBosRowShunt: "Derivador / monitor de batería",
    dBosValShunt:
      "Derivador de precisión de 500 A en el negativo principal de la batería para un seguimiento exacto del estado de carga (el voltaje solo no es fiable en litio).",
    dBosRowBusbars: "Barras de cobre y cables",
    dBosValBusbars:
      "Barras de cobre macizo para poner varias baterías en paralelo; engastes hidráulicos hexagonales con funda termorretráctil adhesiva de doble pared en todos los terminales de cable de batería.",
    dBosRowGrounding: "Puesta a tierra del equipo",
    dBosValGroundPv:
      "Une los raíles de montaje de los paneles, los pararrayos y el chasis del inversor a una pica de tierra.",
    dBosValGroundNoPv:
      "Une el bastidor de baterías, el chasis del inversor y cualquier caja metálica a una pica de tierra.",
    dBosRowSplit: "Aviso de fase partida 240 V",
    dBosValSplit:
      "Los aparatos que has elegido (bomba de pozo profundo, bomba de calor o cargador de VE) necesitan 240 V en fase partida (L1 + L2 + N). Usa un inversor nativo de 120/240 V en fase partida, o dos inversores idénticos de 120 V apilados con cable de comunicación.",
    dNoteAveragePeak:
      "Inversor dimensionado con la carga media (no has introducido picos de aparatos): los picos reales (hervidor, arranque del frigorífico, arranque de la bomba) pueden ser varias veces mayores. Introduce los aparatos para un pico exacto.",
    dNotePeakOverMax:
      "El pico de {kw} kW supera la clase estándar más grande de {max} kW: plantea varias unidades apiladas, no una sola caja de {kw} kW.",
    dNoteNoBattery:
      "Este sistema no lleva batería, así que se omiten la tensión, el diseño del banco y la protección CC.",
    dNoteVolts12:
      "Clase 12 V: vale para cargas de autocaravana. Por encima de ~1,5 kW continuos, 24 V o 48 V desperdician mucho menos cobre.",
    dNoteVolts24:
      "Clase 24 V: el término medio — viable hasta unos 3,5 kW continuos.",
    dNoteVolts48:
      "Clase 48 V: lo que usa cualquier sistema de vivienda — la menor corriente para la misma potencia.",
    dNoteRoundUp:
      "Los bancos vienen en hileras completas: el montaje más pequeño de {label} da ~{provided} kWh para una petición de {ask} kWh — la lista de compra redondea hacia arriba, la simulación no.",
    dNoteFuseOverflow:
      "La corriente de batería a plena carga (~{amps} A) supera los valores estándar de fusible: este banco necesita hileras en paralelo con protección por hilera, diseñadas por un electricista.",
    dDiyAgmLabel: "{series}S hileras de bloques AGM de 12 V {ah} Ah",
    dDiyCellsLabel: "{series}S hileras de celdas prismáticas de {ah} Ah",
    dRetailAgmLabel:
      "Bloques AGM de 12 V {ah} Ah (sin BMS — cablear con equilibrado)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "por encima de la clase de referencia de {class} kW — cuenta con varias unidades apiladas",
    dReferenceNo48:
      "aquí no aplica ninguna referencia de 48 V — busca un inversor/cargador de clase {volts} V para esta tensión de banco",
    dEli5Title: "💡 En lenguaje llano",
    dEli5Solar: "Solar",
    dEli5Storage: "Almacenamiento",
    dEli5Target: "Objetivo",
    dEli5Panels: "{kw} kW de paneles",
    dEli5Battery: "{kwh} kWh de batería útil",
    dEli5Cut: "{pct}% menos energía de la red",
    dEli5Reliability: "objetivo de fiabilidad del {pct}%",
    dEli5NoPanels: "sin paneles en esta opción",
    dEli5NoBattery: "sin batería en esta opción",
    dPricePerKwh: "Tu precio por kWh ({sym}):",
    dStepResult: "4. Tu resultado",
    dCapacitySpectrum: "📊 Espectro de capacidad (relativo a tu selección)",
    dInstallApp: "📲 Instalar app",
    dInstallAppLong: "📲 Instalar la app BigEnergyCo",
    dReadTerms: "Leer los términos completos →",
    dReadAi: "Leer el aviso sobre IA →",
    dReadPrivacy: "Leer la nota de privacidad →",
    apRefrigeratorModern: "Frigorífico (moderno, tamaño medio)",
    apRefrigeratorOld: "Frigorífico (antiguo o grande)",
    apChestFreezer: "Arcón congelador",
    apFan: "Ventilador de techo o de mesa",
    apWindowAc: "Aire acondicionado de ventana (una habitación)",
    apSplitAc: "Aire acondicionado split (toda una planta)",
    apMiniSplitHeat: "Bomba de calor mini-split (modo calefacción)",
    apMicrowave: "Microondas",
    apKettle: "Hervidor eléctrico",
    apCoffee: "Cafetera",
    apRiceCooker: "Olla arrocera",
    apInduction: "Placa de inducción (1 fuego)",
    apAirFryer: "Freidora de aire",
    apLedBulb: "Bombilla LED",
    apLedTv: "TV LED",
    apComputer: "Portátil u ordenador de sobremesa",
    apPhoneCharger: "Cargador de móvil",
    apRouter: "Router de internet (siempre encendido)",
    apStarlink: "Starlink / internet por satélite",
    apWasher: "Lavadora",
    apWaterPump: "Bomba de agua (superficial, depósito a presión, 120 V)",
    apDeepWellPump: "Bomba de pozo profundo (sumergible, 240 V)",
    apVacuum: "Aspiradora",
    apIron: "Plancha de ropa",
    apSpaceHeater: "Calefactor de ambiente (pequeño)",
    apWaterHeater: "Termo eléctrico (240 V)",
    apPoolPump: "Bomba de piscina",
    apEvCharger: "Cargador de VE (nivel 1, 120 V 12 A)",
    apWorkshopTools: "Herramientas de taller (sierra de mesa / compresor)",
    dValRetailNote:
      "La unidad prefabricada más pequeña de esta clase de tensión ya tiene este tamaño; para este banco, la lista DIY se acerca más.",
    dRefModel: "{kw} kW de baja frecuencia y fase partida",
    dRefNote: "48 V · 3× pico · MPPT integrado",
    dChartGround: "Suelo / Horizonte",
    dChartFacing: "🧭 Orientado al {compass}",
    dChartTilt: "~{tilt}° de inclinación",
    dMatrixPick: "Elegir {row} con {col}:",
  },
  pt: {
    dAssumpData:
      "Dados: {source}, horários, {years}. Perdas aplicadas: sujidade {soiling}%, cablagem {wiring}%, desajuste {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Modelo de temperatura da célula: NOCT {noct}°C, coeficiente de temperatura de potência {gamma}%/°C.",
    dAssumpInverter: "Eficiência do inversor {eta}%.",
    dAssumpCold:
      "O carregamento é bloqueado abaixo do limite de frio da química (LFP 0 °C).",
    dAssumpLoad: "Base da carga: {basis}.",
    dAssumpCosts:
      "Os custos vão de {basis} ({source}) — o limite baixo são peças antes de frete, direitos e BMS; o alto é retalho enviado com BMS e caixa incluídos.",
    dAssumpOffline:
      "MODO OFFLINE: este cálculo usou o perfil de ano típico incluído para {city} — uma aproximação próxima, não o teu local exato. Repete online para cinco anos de clima do teu ponto.",
    dAssumpTariff: "O gasto de rede assume {rate} a {kwh} kWh/dia.",
    dAssumpNoTariff:
      "Não introduziste tarifa, por isso a amortização não é mostrada.",
    dCapAuto:
      "Modelo de capacidade com a média de {t}°C do local: LFP 100%, ião de sódio 85% (ajustes de tensão LFP), chumbo-ácido (AGM) cerca de {agm}% (com redução por frio quando aplicável).",
    dCapAgmCold:
      "Local frio: com uma média de {t}°C, o chumbo-ácido (AGM) é reduzido a cerca de {pct}% da capacidade nominal; o lítio e o sódio não são afetados pelo frio neste modelo (carregam mais devagar).",
    dCapScale:
      "Com a média de {t}°C do local, {name} entrega cerca de {pct}% da capacidade útil nominal (escalonamento por taxa/frio).",
    dCapFull:
      "O modelo de capacidade assume a capacidade útil nominal completa com a média de {t}°C do local.",
    dSecPanels: "Painéis",
    dRowArray: "Campo solar",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Espaço necessário",
    dValSpace:
      "cerca de {area} m² de telhado ou solo (folgas de montagem incluídas)",
    dValPanelsNone:
      "Nenhum (só bateria — arbitragem por tarifa horária / desvio do pico)",
    dSecBatteryBank: "Banco de baterias",
    dRowSystemVoltage: "Tensão do sistema",
    dValVoltage:
      "{volts} V — serve para um inversor da classe {kw} kW e um banco de {kwh} kWh nominais",
    dRowDiyBuild: "Montagem DIY",
    dValDiy: "{label} × {strings} série(s) em paralelo = {cells} células",
    dRowPrebuilt: "Alternativa pré-fabricada",
    dValRetailHead: "{modules} × {label} = {kwh} kWh nominais",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh nominais, {pct}% acima da meta de ~{target} kWh",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh nominais, dentro de {pct}% da meta de ~{target} kWh",
    dRowNameplateTarget: "Meta nominal",
    dValNameplate: "~{kwh} kWh com {dod}% de profundidade de descarga útil",
    dValBatteryNone: "Nenhuma (só solar — consumo direto mais entrega à rede)",
    dSecInverter: "Inversor",
    dRowPeakDemand: "O teu pico de consumo",
    dValPeak: "~{kw} kW ao mesmo tempo",
    dRowSuggestedClass: "Classe sugerida",
    dValSuggested: "{kw} kW contínuos no mínimo",
    dRowReferenceUnit: "Unidade de referência (apenas um exemplo)",
    dRowSurgeRule: "Regra de pico de arranque",
    dSurgeNote:
      "Escolhe uma unidade de baixa frequência com ~3× de pico se a carga incluir frigoríficos, bombas ou ferramentas: a corrente de arranque do motor é forte durante meio segundo. Usa fusíveis lentos (classe T) para que esse mesmo pico não os dispare sem motivo.",
    dSecController: "Controlador de carga e proteção",
    dRowControllerCapacity: "Capacidade do controlador",
    dValController: "{amps} A no total — {suggestion}",
    dRowControllerNote: "Nota do controlador",
    dControllerNote:
      "Muitos inversores híbridos de baixa frequência já têm carregador MPPT integrado: confirma se a entrada FV máxima cobre estes amperes antes de comprar um controlador à parte.",
    dControllerOne: "um controlador MPPT de {amps} A",
    dControllerSplit: "dividido por {n} × controladores MPPT de 100 A",
    dRowMainFuse: "Fusível/disjuntor principal da bateria",
    dValMainFuse: "{amps} A (o banco pode puxar ~{discharge} A a plena carga)",
    dRowPvDisconnect: "Corte FV",
    dSecCable: "Cabo bateria-inversor (cobre)",
    dRowRun: "troço de {meters} m",
    dValCableOk: "{awg} ({mm2} mm²) ou maior",
    dValCableShort: "maior que {awg} — encurta o troço",
    dSecMounting: "Montagem do campo solar e melhor inclinação",
    dRowOrientation: "Orientação do campo",
    dValFaceSouth: "Virado a sul verdadeiro (180°) para a maior produção anual",
    dValFaceNorth: "Virado a norte verdadeiro (0°) para a maior produção anual",
    dRowYearTilt: "Inclinação fixa todo o ano",
    dValDegrees: "~{deg}° em relação à horizontal",
    dRowWinterTilt: "Inclinação acentuada de inverno (necessária fora da rede)",
    dValWinterTilt: "~{deg}° — limpa a neve e apanha o sol baixo de inverno",
    dRowSummerTilt: "Inclinação de verão (opcional)",
    dRowMounting: "Recomendação de montagem",
    dValMountSnow:
      "Montagem no solo fortemente recomendada: limpar a neve e ajustar a inclinação por estação fica muito mais fácil",
    dValMountRoof: "Montagem no telhado (à face ou com estrutura) ou no solo",
    dBosTitle: "Lista essencial de equilíbrio de sistema (BOS) e segurança",
    dBosRowDisconnect: "Corte CC da bateria",
    dBosValDisconnect:
      "Interruptor rotativo de serviço pesado mais um fusível classe T (ou disjuntor apto para CC) dimensionado a {amps} A, junto ao terminal positivo da bateria.",
    dBosRowPvIsolator: "Isolador do campo FV + SPD",
    dBosValPvIsolator:
      "Disjuntor bipolar apto para CC e um protetor contra sobretensões CC (para-raios) antes do controlador de carga.",
    dBosRowShunt: "Shunt / monitor de bateria",
    dBosValShunt:
      "Shunt de precisão de 500 A no negativo principal da bateria para um acompanhamento exato do estado de carga (a tensão sozinha não é fiável em lítio).",
    dBosRowBusbars: "Barras de cobre e cabos",
    dBosValBusbars:
      "Barras de cobre maciço para ligar várias baterias em paralelo; cravação hidráulica hexagonal com manga termorretrátil adesiva de parede dupla em todos os terminais de cabo de bateria.",
    dBosRowGrounding: "Ligação à terra do equipamento",
    dBosValGroundPv:
      "Liga as calhas de montagem dos painéis, os para-raios e o chassi do inversor a uma haste de terra.",
    dBosValGroundNoPv:
      "Liga o rack de baterias, o chassi do inversor e qualquer caixa metálica a uma haste de terra.",
    dBosRowSplit: "Aviso de fase dividida 240 V",
    dBosValSplit:
      "Os aparelhos que escolheste (bomba de poço profundo, bomba de calor ou carregador de VE) precisam de 240 V em fase dividida (L1 + L2 + N). Usa um inversor nativo de 120/240 V em fase dividida, ou dois inversores idênticos de 120 V empilhados com cabo de comunicação.",
    dNoteAveragePeak:
      "Inversor dimensionado pela carga média (não introduziste picos de aparelhos): os picos reais (chaleira, arranque do frigorífico, arranque da bomba) podem ser várias vezes maiores. Introduz os aparelhos para um pico exato.",
    dNotePeakOverMax:
      "O pico de {kw} kW está acima da maior classe padrão de {max} kW: planeia várias unidades empilhadas, não uma caixa de {kw} kW.",
    dNoteNoBattery:
      "Este sistema não tem bateria, por isso a tensão, o layout do banco e a proteção CC ficam de fora.",
    dNoteVolts12:
      "Classe 12 V: serve para cargas de autocaravana. Acima de ~1,5 kW contínuos, 24 V ou 48 V desperdiçam muito menos cobre.",
    dNoteVolts24:
      "Classe 24 V: o meio-termo — viável até cerca de 3,5 kW contínuos.",
    dNoteVolts48:
      "Classe 48 V: o que qualquer sistema de habitação usa — a menor corrente para a mesma potência.",
    dNoteRoundUp:
      "Os bancos vêm em séries completas: a montagem mais pequena de {label} dá ~{provided} kWh para um pedido de {ask} kWh — a lista de compras arredonda para cima, a simulação não.",
    dNoteFuseOverflow:
      "A corrente de bateria a plena carga (~{amps} A) está acima dos valores padrão de fusível: este banco precisa de séries em paralelo com proteção por série, desenhadas por um eletricista.",
    dDiyAgmLabel: "{series}S séries de blocos AGM de 12 V {ah} Ah",
    dDiyCellsLabel: "{series}S séries de células prismáticas de {ah} Ah",
    dRetailAgmLabel:
      "Blocos AGM de 12 V {ah} Ah (sem BMS — cablagem com balanceamento)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "acima da classe de referência de {class} kW — conta com várias unidades empilhadas",
    dReferenceNo48:
      "aqui não se aplica nenhuma referência de 48 V — procura um inversor/carregador da classe {volts} V para esta tensão de banco",
    dEli5Title: "💡 Em linguagem simples",
    dEli5Solar: "Solar",
    dEli5Storage: "Armazenamento",
    dEli5Target: "Meta",
    dEli5Panels: "{kw} kW de painéis",
    dEli5Battery: "{kwh} kWh de bateria útil",
    dEli5Cut: "{pct}% menos energia da rede",
    dEli5Reliability: "meta de fiabilidade de {pct}%",
    dEli5NoPanels: "sem painéis nesta opção",
    dEli5NoBattery: "sem bateria nesta opção",
    dPricePerKwh: "O teu preço por kWh ({sym}):",
    dStepResult: "4. O teu resultado",
    dCapacitySpectrum: "📊 Espectro de capacidade (relativo à tua seleção)",
    dInstallApp: "📲 Instalar app",
    dInstallAppLong: "📲 Instalar a app BigEnergyCo",
    dReadTerms: "Ler os termos completos →",
    dReadAi: "Ler o aviso sobre IA →",
    dReadPrivacy: "Ler a nota de privacidade →",
    apRefrigeratorModern: "Frigorífico (moderno, tamanho médio)",
    apRefrigeratorOld: "Frigorífico (antigo ou grande)",
    apChestFreezer: "Arca congeladora",
    apFan: "Ventilador de teto ou de mesa",
    apWindowAc: "Ar condicionado de janela (uma divisão)",
    apSplitAc: "Ar condicionado split (andar inteiro)",
    apMiniSplitHeat: "Bomba de calor mini-split (modo aquecimento)",
    apMicrowave: "Micro-ondas",
    apKettle: "Chaleira elétrica",
    apCoffee: "Máquina de café",
    apRiceCooker: "Panela de arroz",
    apInduction: "Placa de indução (1 bico)",
    apAirFryer: "Fritadeira de ar",
    apLedBulb: "Lâmpada LED",
    apLedTv: "TV LED",
    apComputer: "Portátil ou computador de secretária",
    apPhoneCharger: "Carregador de telemóvel",
    apRouter: "Router de internet (sempre ligado)",
    apStarlink: "Starlink / internet por satélite",
    apWasher: "Máquina de lavar roupa",
    apWaterPump: "Bomba de água (superficial, depósito de pressão, 120 V)",
    apDeepWellPump: "Bomba de poço profundo (submersível, 240 V)",
    apVacuum: "Aspirador",
    apIron: "Ferro de engomar",
    apSpaceHeater: "Aquecedor de ambiente (pequeno)",
    apWaterHeater: "Termoacumulador elétrico (240 V)",
    apPoolPump: "Bomba de piscina",
    apEvCharger: "Carregador de VE (nível 1, 120 V 12 A)",
    apWorkshopTools: "Ferramentas de oficina (serra de bancada / compressor)",
    dValRetailNote:
      "A unidade pré-fabricada mais pequena desta classe de tensão já tem este tamanho; para este banco, a lista DIY aproxima-se mais.",
    dRefModel: "{kw} kW de baixa frequência e fase dividida",
    dRefNote: "48 V · 3× pico · MPPT integrado",
    dChartGround: "Solo / Horizonte",
    dChartFacing: "🧭 Voltado a {compass}",
    dChartTilt: "~{tilt}° de inclinação",
    dMatrixPick: "Escolher {row} com {col}:",
  },
  fr: {
    dAssumpData:
      "Données : {source}, horaires, {years}. Pertes appliquées : salissure {soiling}%, câblage {wiring}%, désappariement {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Modèle de température de cellule : NOCT {noct}°C, coefficient de température de puissance {gamma}%/°C.",
    dAssumpInverter: "Rendement de l'onduleur {eta}%.",
    dAssumpCold:
      "La charge est bloquée sous la limite de froid de la chimie (LFP 0 °C).",
    dAssumpLoad: "Base de la charge : {basis}.",
    dAssumpCosts:
      "Les coûts vont de {basis} ({source}) — le bas correspond à des pièces avant fret, droits et BMS ; le haut à du détail livré, BMS et coffret compris.",
    dAssumpOffline:
      "MODE HORS LIGNE : ce calcul a utilisé le profil d'année typique fourni pour {city} — une approximation proche, pas votre site exact. Relancez en ligne pour cinq ans de météo propre à votre point.",
    dAssumpTariff: "La dépense réseau suppose {rate} à {kwh} kWh/jour.",
    dAssumpNoTariff:
      "Aucun tarif saisi, donc le retour sur investissement n'est pas affiché.",
    dCapAuto:
      "Modèle de capacité à la moyenne de {t}°C du site : LFP 100%, sodium-ion 85% (réglages de tension LFP), plomb-acide (AGM) environ {agm}% (déclassement au froid le cas échéant).",
    dCapAgmCold:
      "Site froid : à une moyenne de {t}°C, le plomb-acide (AGM) est déclassé à environ {pct}% de la capacité nominale ; le lithium et le sodium ne sont pas affectés par le froid dans ce modèle (ils chargent plus lentement).",
    dCapScale:
      "À la moyenne de {t}°C du site, {name} délivre environ {pct}% de la capacité utile nominale (mise à l'échelle débit/froid).",
    dCapFull:
      "Le modèle de capacité suppose la pleine capacité utile nominale à la moyenne de {t}°C du site.",
    dSecPanels: "Panneaux",
    dRowArray: "Champ solaire",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Surface nécessaire",
    dValSpace:
      "environ {area} m² de toiture ou de sol (écarts de montage compris)",
    dValPanelsNone:
      "Aucun (batterie seule — arbitrage heures creuses / décalage de pointe)",
    dSecBatteryBank: "Parc de batteries",
    dRowSystemVoltage: "Tension du système",
    dValVoltage:
      "{volts} V — convient à un onduleur de classe {kw} kW et un parc de {kwh} kWh nominaux",
    dRowDiyBuild: "Montage DIY",
    dValDiy: "{label} × {strings} branche(s) en parallèle = {cells} cellules",
    dRowPrebuilt: "Alternative toute faite",
    dValRetailHead: "{modules} × {label} = {kwh} kWh nominaux",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh nominaux, soit {pct}% de plus que l'objectif de ~{target} kWh",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh nominaux, à {pct}% de l'objectif de ~{target} kWh",
    dRowNameplateTarget: "Objectif nominal",
    dValNameplate: "~{kwh} kWh à {dod}% de profondeur de décharge utile",
    dValBatteryNone:
      "Aucune (solaire seul — autoconsommation plus injection sur le réseau)",
    dSecInverter: "Onduleur",
    dRowPeakDemand: "Votre pointe de consommation",
    dValPeak: "~{kw} kW en même temps",
    dRowSuggestedClass: "Classe conseillée",
    dValSuggested: "{kw} kW en continu au minimum",
    dRowReferenceUnit: "Unité de référence (un simple exemple)",
    dRowSurgeRule: "Règle de pointe au démarrage",
    dSurgeNote:
      "Choisissez une unité basse fréquence avec ~3× de pointe si la charge comprend des réfrigérateurs, des pompes ou de l'outillage : le courant de démarrage du moteur frappe fort pendant une demi-seconde. Utilisez des fusibles retardés (classe T) pour que cette même pointe ne les déclenche pas sans raison.",
    dSecController: "Régulateur de charge et protection",
    dRowControllerCapacity: "Capacité du régulateur",
    dValController: "{amps} A au total — {suggestion}",
    dRowControllerNote: "Note sur le régulateur",
    dControllerNote:
      "Beaucoup d'onduleurs hybrides basse fréquence intègrent un chargeur MPPT : vérifiez que son entrée PV maximale couvre ces ampères avant d'acheter un régulateur séparé.",
    dControllerOne: "un régulateur MPPT de {amps} A",
    dControllerSplit: "réparti sur {n} × régulateurs MPPT de 100 A",
    dRowMainFuse: "Fusible/disjoncteur principal de batterie",
    dValMainFuse:
      "{amps} A (le parc peut tirer ~{discharge} A à pleine charge)",
    dRowPvDisconnect: "Sectionnement PV",
    dSecCable: "Câble batterie-onduleur (cuivre)",
    dRowRun: "tronçon de {meters} m",
    dValCableOk: "{awg} ({mm2} mm²) ou plus",
    dValCableShort: "plus gros que {awg} — raccourcissez le tronçon",
    dSecMounting: "Montage du champ solaire et meilleure inclinaison",
    dRowOrientation: "Orientation du champ",
    dValFaceSouth:
      "Plein sud vrai (180°) pour la meilleure production annuelle",
    dValFaceNorth: "Plein nord vrai (0°) pour la meilleure production annuelle",
    dRowYearTilt: "Inclinaison fixe toute l'année",
    dValDegrees: "~{deg}° par rapport à l'horizontale",
    dRowWinterTilt: "Inclinaison forte d'hiver (indispensable hors réseau)",
    dValWinterTilt:
      "~{deg}° — évacue la neige et capte le soleil bas de l'hiver",
    dRowSummerTilt: "Inclinaison d'été (facultative)",
    dRowMounting: "Recommandation de montage",
    dValMountSnow:
      "Montage au sol vivement recommandé : déneigement et réglage saisonnier de l'inclinaison bien plus faciles",
    dValMountRoof: "Montage en toiture (au plus près ou sur châssis) ou au sol",
    dBosTitle: "Liste essentielle d'équilibre du système (BOS) et de sécurité",
    dBosRowDisconnect: "Sectionneur DC de batterie",
    dBosValDisconnect:
      "Interrupteur rotatif renforcé plus un fusible classe T (ou un disjoncteur homologué DC) calibré à {amps} A, près de la borne positive de la batterie.",
    dBosRowPvIsolator: "Sectionneur de champ PV + parafoudre",
    dBosValPvIsolator:
      "Disjoncteur bipolaire homologué DC et un parafoudre DC (protection contre les surtensions) avant le régulateur de charge.",
    dBosRowShunt: "Shunt / moniteur de batterie",
    dBosValShunt:
      "Shunt de précision 500 A sur le négatif principal de la batterie pour un suivi exact de l'état de charge (la tension seule n'est pas fiable au lithium).",
    dBosRowBusbars: "Barres de cuivre et câbles",
    dBosValBusbars:
      "Barres de cuivre massif pour mettre plusieurs batteries en parallèle ; sertissages hexagonaux hydrauliques avec gaine thermorétractable adhésive double paroi sur toutes les cosses de câble de batterie.",
    dBosRowGrounding: "Mise à la terre du matériel",
    dBosValGroundPv:
      "Reliez les rails de montage des panneaux, les parafoudres et le châssis de l'onduleur à un piquet de terre.",
    dBosValGroundNoPv:
      "Reliez le rack de batteries, le châssis de l'onduleur et tout coffret métallique à un piquet de terre.",
    dBosRowSplit: "Alerte phase divisée 240 V",
    dBosValSplit:
      "Les appareils choisis (pompe de puits profonde, pompe à chaleur ou borne de recharge) exigent du 240 V en phase divisée (L1 + L2 + N). Utilisez un onduleur natif 120/240 V en phase divisée, ou deux onduleurs 120 V identiques empilés avec un câble de communication.",
    dNoteAveragePeak:
      "Onduleur dimensionné sur la charge moyenne (aucune pointe d'appareil saisie) : les pointes réelles (bouilloire, démarrage du frigo, démarrage de pompe) peuvent être plusieurs fois plus élevées. Saisissez les appareils pour une pointe exacte.",
    dNotePeakOverMax:
      "La pointe de {kw} kW dépasse la plus grande classe standard de {max} kW : prévoyez plusieurs unités empilées, pas un seul coffret de {kw} kW.",
    dNoteNoBattery:
      "Ce système n'a pas de batterie : tension, agencement du parc et protection DC sont donc omis.",
    dNoteVolts12:
      "Classe 12 V : correct pour des charges de camping-car. Au-delà de ~1,5 kW en continu, 24 V ou 48 V gaspillent bien moins de cuivre.",
    dNoteVolts24:
      "Classe 24 V : le compromis — viable jusqu'à environ 3,5 kW en continu.",
    dNoteVolts48:
      "Classe 48 V : ce qu'utilise toute installation domestique — le moins de courant pour la même puissance.",
    dNoteRoundUp:
      "Les parcs se vendent en branches complètes : le plus petit montage {label} fournit ~{provided} kWh pour une demande de {ask} kWh — la liste d'achat arrondit au-dessus, la simulation non.",
    dNoteFuseOverflow:
      "Le courant batterie à pleine charge (~{amps} A) dépasse les calibres de fusible standard : ce parc exige des branches en parallèle avec protection par branche, conçues par un électricien.",
    dDiyAgmLabel: "{series}S branches de blocs AGM 12 V {ah} Ah",
    dDiyCellsLabel: "{series}S branches de cellules prismatiques {ah} Ah",
    dRetailAgmLabel:
      "Blocs AGM 12 V {ah} Ah (sans BMS — câblage avec équilibrage)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "au-delà de la classe de référence {class} kW — comptez plusieurs unités empilées",
    dReferenceNo48:
      "aucune référence 48 V ne s'applique ici — cherchez un onduleur/chargeur de classe {volts} V pour cette tension de parc",
    dEli5Title: "💡 En clair",
    dEli5Solar: "Solaire",
    dEli5Storage: "Stockage",
    dEli5Target: "Objectif",
    dEli5Panels: "{kw} kW de panneaux",
    dEli5Battery: "{kwh} kWh de batterie utile",
    dEli5Cut: "{pct}% d'énergie réseau en moins",
    dEli5Reliability: "objectif de fiabilité de {pct}%",
    dEli5NoPanels: "aucun panneau dans cette option",
    dEli5NoBattery: "aucune batterie dans cette option",
    dPricePerKwh: "Votre prix par kWh ({sym}) :",
    dStepResult: "4. Votre résultat",
    dCapacitySpectrum: "📊 Spectre de capacité (par rapport à votre choix)",
    dInstallApp: "📲 Installer l'app",
    dInstallAppLong: "📲 Installer l'app BigEnergyCo",
    dReadTerms: "Lire les conditions complètes →",
    dReadAi: "Lire l'avertissement IA →",
    dReadPrivacy: "Lire la note de confidentialité →",
    apRefrigeratorModern: "Réfrigérateur (récent, taille moyenne)",
    apRefrigeratorOld: "Réfrigérateur (ancien ou grand)",
    apChestFreezer: "Congélateur coffre",
    apFan: "Ventilateur de plafond ou de bureau",
    apWindowAc: "Climatiseur de fenêtre (une pièce)",
    apSplitAc: "Climatiseur split (tout un étage)",
    apMiniSplitHeat: "Pompe à chaleur mini-split (mode chauffage)",
    apMicrowave: "Micro-ondes",
    apKettle: "Bouilloire électrique",
    apCoffee: "Cafetière",
    apRiceCooker: "Cuiseur à riz",
    apInduction: "Plaque à induction (1 foyer)",
    apAirFryer: "Friteuse à air",
    apLedBulb: "Ampoule LED",
    apLedTv: "TV LED",
    apComputer: "Ordinateur portable ou de bureau",
    apPhoneCharger: "Chargeur de téléphone",
    apRouter: "Routeur internet (toujours allumé)",
    apStarlink: "Starlink / internet par satellite",
    apWasher: "Lave-linge",
    apWaterPump: "Pompe à eau (de surface, réservoir sous pression, 120 V)",
    apDeepWellPump: "Pompe de puits profond (immergée, 240 V)",
    apVacuum: "Aspirateur",
    apIron: "Fer à repasser",
    apSpaceHeater: "Radiateur d'appoint (petit)",
    apWaterHeater: "Chauffe-eau électrique (240 V)",
    apPoolPump: "Pompe de piscine",
    apEvCharger: "Borne de recharge VE (niveau 1, 120 V 12 A)",
    apWorkshopTools: "Outillage d'atelier (scie sur table / compresseur)",
    dValRetailNote:
      "La plus petite unité toute faite de cette classe de tension fait déjà cette taille ; pour ce parc, la liste DIY correspond mieux.",
    dRefModel: "{kw} kW basse fréquence à phase divisée",
    dRefNote: "48 V · 3× pointe · MPPT intégré",
    dChartGround: "Sol / Horizon",
    dChartFacing: "🧭 Orienté {compass}",
    dChartTilt: "~{tilt}° d'inclinaison",
    dMatrixPick: "Choisir {row} avec {col} :",
  },
  de: {
    dAssumpData:
      "Daten: {source}, stündlich, {years}. Angesetzte Verluste: Verschmutzung {soiling}%, Verkabelung {wiring}%, Fehlanpassung {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Zelltemperaturmodell: NOCT {noct}°C, Leistungstemperaturkoeffizient {gamma}%/°C.",
    dAssumpInverter: "Wechselrichter-Wirkungsgrad {eta}%.",
    dAssumpCold:
      "Laden ist unterhalb der Kältegrenze der Chemie gesperrt (LFP 0 °C).",
    dAssumpLoad: "Lastgrundlage: {basis}.",
    dAssumpCosts:
      "Die Kosten reichen von {basis} ({source}) — unten Teile vor Fracht, Zoll und BMS, oben versandter Handelspreis inklusive BMS und Gehäuse.",
    dAssumpOffline:
      "OFFLINE-MODUS: Diese Berechnung nutzte das mitgelieferte Regeljahr-Profil für {city} — eine gute Näherung, nicht Ihr genauer Standort. Online erneut ausführen für fünf Jahre standortgenaues Wetter.",
    dAssumpTariff: "Die Netzausgaben setzen {rate} bei {kwh} kWh/Tag an.",
    dAssumpNoTariff:
      "Kein Tarif eingegeben, daher wird keine Amortisation gezeigt.",
    dCapAuto:
      "Kapazitätsmodell bei {t}°C Mittelwert am Standort: LFP 100%, Natrium-Ionen 85% (LFP-Spannungseinstellungen), Blei-Säure (AGM) etwa {agm}% (Kälteabschlag wo zutreffend).",
    dCapAgmCold:
      "Kalter Standort: bei {t}°C Mittelwert wird Blei-Säure (AGM) auf etwa {pct}% der Nennkapazität reduziert; Lithium und Natrium sind in diesem Modell kälteunempfindlich (sie laden langsamer).",
    dCapScale:
      "Bei {t}°C Mittelwert am Standort liefert {name} etwa {pct}% der nutzbaren Nennkapazität (Raten-/Kälteskalierung).",
    dCapFull:
      "Das Kapazitätsmodell setzt die volle nutzbare Nennkapazität bei {t}°C Mittelwert am Standort an.",
    dSecPanels: "Module",
    dRowArray: "Solarmodul-Feld",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Benötigte Fläche",
    dValSpace: "etwa {area} m² Dach oder Boden (Montageabstände eingerechnet)",
    dValPanelsNone:
      "Keine (nur Batterie — Tarifzeit-Arbitrage / Spitzenverlagerung)",
    dSecBatteryBank: "Batteriebank",
    dRowSystemVoltage: "Systemspannung",
    dValVoltage:
      "{volts} V — passt zu einem Wechselrichter der {kw}-kW-Klasse und einer Bank mit {kwh} kWh Nennkapazität",
    dRowDiyBuild: "Eigenbau",
    dValDiy: "{label} × {strings} Parallelstrang/-stränge = {cells} Zellen",
    dRowPrebuilt: "Fertige Alternative",
    dValRetailHead: "{modules} × {label} = {kwh} kWh Nennkapazität",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh Nennkapazität, {pct}% über dem Ziel von ~{target} kWh",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh Nennkapazität, innerhalb von {pct}% des Ziels von ~{target} kWh",
    dRowNameplateTarget: "Nennkapazitäts-Ziel",
    dValNameplate: "~{kwh} kWh bei {dod}% nutzbarer Entladetiefe",
    dValBatteryNone:
      "Keine (nur Solar — Eigenverbrauch plus Einspeisung ins Netz)",
    dSecInverter: "Wechselrichter",
    dRowPeakDemand: "Deine Spitzenlast",
    dValPeak: "~{kw} kW gleichzeitig",
    dRowSuggestedClass: "Empfohlene Klasse",
    dValSuggested: "mindestens {kw} kW Dauerleistung",
    dRowReferenceUnit: "Referenzgerät (nur ein Beispiel)",
    dRowSurgeRule: "Anlaufspitzen-Regel",
    dSurgeNote:
      "Wähle ein Niedrigfrequenz-Gerät mit ~3× Anlaufstrom, wenn Kühlschränke, Pumpen oder Werkzeug dazugehören — der Motoranlaufstrom wirkt eine halbe Sekunde lang heftig. Nimm träge Sicherungen (Klasse T), damit dieselbe Spitze sie nicht grundlos auslöst.",
    dSecController: "Laderegler und Schutz",
    dRowControllerCapacity: "Reglerkapazität",
    dValController: "{amps} A gesamt — {suggestion}",
    dRowControllerNote: "Hinweis zum Regler",
    dControllerNote:
      "Viele Niedrigfrequenz-Hybridwechselrichter haben einen MPPT-Lader eingebaut — prüfe, ob der maximale PV-Eingang diese Ampere abdeckt, bevor du einen separaten Regler kaufst.",
    dControllerOne: "ein MPPT-Regler mit {amps} A",
    dControllerSplit: "aufgeteilt auf {n} × 100-A-MPPT-Regler",
    dRowMainFuse: "Hauptsicherung/-trenner der Batterie",
    dValMainFuse: "{amps} A (die Bank zieht bei Volllast ~{discharge} A)",
    dRowPvDisconnect: "PV-Trennung",
    dSecCable: "Batterie-zu-Wechselrichter-Kabel (Kupfer)",
    dRowRun: "{meters} m Strecke",
    dValCableOk: "{awg} ({mm2} mm²) oder dicker",
    dValCableShort: "dicker als {awg} — verkürze die Strecke",
    dSecMounting: "Montage des Modulfelds und beste Neigung",
    dRowOrientation: "Ausrichtung des Felds",
    dValFaceSouth:
      "Nach wahrer Südrichtung (180°) für den höchsten Jahresertrag",
    dValFaceNorth:
      "Nach wahrer Nordrichtung (0°) für den höchsten Jahresertrag",
    dRowYearTilt: "Feste Neigung übers Jahr",
    dValDegrees: "~{deg}° zur Waagerechten",
    dRowWinterTilt: "Steile Winterneigung (nötig ohne Netz)",
    dValWinterTilt: "~{deg}° — wirft Schnee ab und fängt die tiefe Wintersonne",
    dRowSummerTilt: "Sommerneigung (optional)",
    dRowMounting: "Montageempfehlung",
    dValMountSnow:
      "Bodenmontage dringend empfohlen: Schnee räumen und die Neigung je Jahreszeit anpassen ist viel einfacher",
    dValMountRoof: "Dachmontage (bündig oder aufgeständert) oder Bodenmontage",
    dBosTitle: "Wesentliche Systemausgleichs- (BOS-) und Sicherheitsliste",
    dBosRowDisconnect: "DC-Batterietrenner",
    dBosValDisconnect:
      "Schwerlast-Trenndrehschalter plus Klasse-T-Sicherung (oder DC-tauglicher Leistungsschalter) mit {amps} A, direkt am Pluspol der Batterie.",
    dBosRowPvIsolator: "PV-Feld-Trenner + Überspannungsschutz",
    dBosValPvIsolator:
      "DC-tauglicher zweipoliger Leistungsschalter und ein DC-Überspannungsschutz (Blitzschutz) vor dem Laderegler.",
    dBosRowShunt: "Batterie-Shunt / Monitor",
    dBosValShunt:
      "Präzisions-Shunt mit 500 A am Hauptminuspol der Batterie für exakte Ladezustandsverfolgung (Spannung allein ist bei Lithium ungenau).",
    dBosRowBusbars: "Kupferschienen und Kabel",
    dBosValBusbars:
      "Massive Kupferschienen für das Parallelschalten mehrerer Batterien; hydraulische Sechskant-Pressungen mit doppelwandigem Klebeschrumpfschlauch an allen Batteriekabelschuhen.",
    dBosRowGrounding: "Erdung der Geräte",
    dBosValGroundPv:
      "Verbinde Montageschienen der Module, Blitzschutz und Wechselrichtergehäuse mit einem Erdungsstab.",
    dBosValGroundNoPv:
      "Verbinde Batteriegestell, Wechselrichtergehäuse und jedes Metallgehäuse mit einem Erdungsstab.",
    dBosRowSplit: "Hinweis 240-V-Split-Phase",
    dBosValSplit:
      "Deine gewählten Geräte (Tiefbrunnenpumpe, Wärmepumpe oder EV-Lader) brauchen 240 V Split-Phase (L1 + L2 + N). Nimm einen echten 120/240-V-Split-Phase-Wechselrichter oder zwei identische 120-V-Wechselrichter, gestapelt mit Kommunikationskabel.",
    dNoteAveragePeak:
      "Wechselrichter nach Durchschnittslast dimensioniert (kein Geräte-Spitzenwert eingegeben) — echte Spitzen (Wasserkocher, Kühlschrankstart, Pumpenanlauf) können ein Vielfaches betragen. Gib Geräte ein für eine exakte Spitze.",
    dNotePeakOverMax:
      "Die Spitze von {kw} kW liegt über der größten Standardklasse von {max} kW — plane mehrere gestapelte Geräte, nicht eine {kw}-kW-Box.",
    dNoteNoBattery:
      "Dieses System hat keine Batterie, daher entfallen Spannung, Bankaufbau und DC-Schutz.",
    dNoteVolts12:
      "12-V-Klasse: gut für Wohnmobil-Lasten. Über ~1,5 kW Dauerleistung verschwenden 24 V oder 48 V viel weniger Kupfer.",
    dNoteVolts24:
      "24-V-Klasse: der Mittelweg — bis etwa 3,5 kW Dauerleistung machbar.",
    dNoteVolts48:
      "48-V-Klasse: was jedes hausgroße System nutzt — der geringste Strom für dieselbe Leistung.",
    dNoteRoundUp:
      "Bänke gibt es in ganzen Strängen: der kleinste {label}-Aufbau liefert ~{provided} kWh für einen Bedarf von {ask} kWh — die Einkaufsliste rundet auf, die Simulation nicht.",
    dNoteFuseOverflow:
      "Der Batteriestrom bei Volllast (~{amps} A) liegt über den Standardsicherungswerten — diese Bank braucht Parallelstränge mit Schutz je Strang, ausgelegt von einer Elektrofachkraft.",
    dDiyAgmLabel: "{series}S Stränge aus 12-V-{ah}-Ah-AGM-Blöcken",
    dDiyCellsLabel: "{series}S Stränge aus {ah}-Ah-prismatischen Zellen",
    dRetailAgmLabel:
      "12-V-{ah}-Ah-AGM-Blöcke (kein BMS — mit Balancierung verdrahten)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "über der Referenzklasse von {class} kW — rechne mit mehreren gestapelten Geräten",
    dReferenceNo48:
      "hier gilt keine 48-V-Referenz — suche ein Wechselrichter/Ladegerät der {volts}-V-Klasse für diese Bankspannung",
    dEli5Title: "💡 Einfach erklärt",
    dEli5Solar: "Solar",
    dEli5Storage: "Speicher",
    dEli5Target: "Ziel",
    dEli5Panels: "{kw} kW Module",
    dEli5Battery: "{kwh} kWh nutzbare Batterie",
    dEli5Cut: "{pct}% weniger Netzstrom",
    dEli5Reliability: "Zuverlässigkeitsziel von {pct}%",
    dEli5NoPanels: "keine Module in dieser Option",
    dEli5NoBattery: "keine Batterie in dieser Option",
    dPricePerKwh: "Dein Preis pro kWh ({sym}):",
    dStepResult: "4. Dein Ergebnis",
    dCapacitySpectrum: "📊 Kapazitätsspektrum (relativ zu deiner Auswahl)",
    dInstallApp: "📲 App installieren",
    dInstallAppLong: "📲 BigEnergyCo-App installieren",
    dReadTerms: "Vollständige Bedingungen lesen →",
    dReadAi: "KI-Hinweis lesen →",
    dReadPrivacy: "Datenschutzhinweis lesen →",
    apRefrigeratorModern: "Kühlschrank (modern, mittelgroß)",
    apRefrigeratorOld: "Kühlschrank (alt oder groß)",
    apChestFreezer: "Tiefkühltruhe",
    apFan: "Decken- oder Tischventilator",
    apWindowAc: "Fenster-Klimagerät (ein Raum)",
    apSplitAc: "Split-Klimagerät (ganze Etage)",
    apMiniSplitHeat: "Mini-Split-Wärmepumpe (Heizbetrieb)",
    apMicrowave: "Mikrowelle",
    apKettle: "Wasserkocher",
    apCoffee: "Kaffeemaschine",
    apRiceCooker: "Reiskocher",
    apInduction: "Induktionskochfeld (1 Platte)",
    apAirFryer: "Heißluftfritteuse",
    apLedBulb: "LED-Lampe",
    apLedTv: "LED-Fernseher",
    apComputer: "Laptop oder Desktop-PC",
    apPhoneCharger: "Handy-Ladegerät",
    apRouter: "Internet-Router (dauerhaft an)",
    apStarlink: "Starlink / Satelliteninternet",
    apWasher: "Waschmaschine",
    apWaterPump: "Wasserpumpe (oberflächlich, Druckbehälter, 120 V)",
    apDeepWellPump: "Tiefbrunnenpumpe (Tauchpumpe, 240 V)",
    apVacuum: "Staubsauger",
    apIron: "Bügeleisen",
    apSpaceHeater: "Heizlüfter (klein)",
    apWaterHeater: "Elektrischer Warmwasserspeicher (240 V)",
    apPoolPump: "Poolpumpe",
    apEvCharger: "EV-Ladegerät (Level 1, 120 V 12 A)",
    apWorkshopTools: "Werkstattwerkzeug (Tischkreissäge / Kompressor)",
    dValRetailNote:
      "Die kleinste fertige Einheit dieser Spannungsklasse hat bereits diese Größe — bei dieser Bank passt die Eigenbau-Liste besser.",
    dRefModel: "{kw} kW Niedrigfrequenz-Split-Phase",
    dRefNote: "48 V · 3× Anlauf · integrierter MPPT",
    dChartGround: "Boden / Horizont",
    dChartFacing: "🧭 Ausrichtung {compass}",
    dChartTilt: "~{tilt}° Neigung",
    dMatrixPick: "{row} mit {col} wählen:",
  },
  nl: {
    dAssumpData:
      "Gegevens: {source}, per uur, {years}. Toegepaste verliezen: vervuiling {soiling}%, bedrading {wiring}%, mismatching {mismatch}%, MPPT {mppt}%.",
    dAssumpCell:
      "Celtemperatuurmodel: NOCT {noct}°C, temperatuurcoëfficiënt van het vermogen {gamma}%/°C.",
    dAssumpInverter: "Rendement van de omvormer {eta}%.",
    dAssumpCold:
      "Laden is geblokkeerd onder de koudelimiet van de chemie (LFP 0 °C).",
    dAssumpLoad: "Uitgangspunt van de last: {basis}.",
    dAssumpCosts:
      "De kosten lopen van {basis} ({source}) — de onderkant zijn onderdelen vóór vracht, invoerrechten en BMS; de bovenkant is verzonden retail inclusief BMS en behuizing.",
    dAssumpOffline:
      "OFFLINE MODUS: deze berekening gebruikte het meegeleverde typische-jaarprofiel voor {city} — een goede benadering, niet jouw exacte locatie. Voer opnieuw online uit voor vijf jaar locatiespecifiek weer.",
    dAssumpTariff: "De netkosten gaan uit van {rate} bij {kwh} kWh/dag.",
    dAssumpNoTariff:
      "Geen tarief ingevoerd, dus terugverdientijd wordt niet getoond.",
    dCapAuto:
      "Capaciteitsmodel bij een gemiddelde van {t}°C op deze locatie: LFP 100%, natrium-ion 85% (LFP-spanningsinstellingen), lood-zuur (AGM) ongeveer {agm}% (koudecorrectie waar van toepassing).",
    dCapAgmCold:
      "Koude locatie: bij een gemiddelde van {t}°C wordt lood-zuur (AGM) teruggebracht tot ongeveer {pct}% van de nominale capaciteit; lithium en natrium ondervinden in dit model geen hinder van kou (ze laden langzamer).",
    dCapScale:
      "Bij een gemiddelde van {t}°C op deze locatie levert {name} ongeveer {pct}% van de nominale bruikbare capaciteit (schaling op tempo/kou).",
    dCapFull:
      "Het capaciteitsmodel gaat uit van de volledige nominale bruikbare capaciteit bij een gemiddelde van {t}°C op deze locatie.",
    dSecPanels: "Panelen",
    dRowArray: "Zonnepaneelveld",
    dValArray: "{kw} kW → {count} × {watts} W = {actual} kW",
    dRowSpaceNeeded: "Benodigde ruimte",
    dValSpace: "ongeveer {area} m² dak of grond (montageruimte inbegrepen)",
    dValPanelsNone:
      "Geen (alleen batterij — tariefarbitrage / piekverschuiving)",
    dSecBatteryBank: "Batterijbank",
    dRowSystemVoltage: "Systeemspanning",
    dValVoltage:
      "{volts} V — past bij een omvormer van de {kw} kW-klasse en een bank van {kwh} kWh nominaal",
    dRowDiyBuild: "Zelfbouw",
    dValDiy: "{label} × {strings} parallelle streng(en) = {cells} cellen",
    dRowPrebuilt: "Kant-en-klaar alternatief",
    dValRetailHead: "{modules} × {label} = {kwh} kWh nominaal",
    dValRetailOver:
      "{modules} × {label} = {kwh} kWh nominaal, {pct}% boven het doel van ~{target} kWh",
    dValRetailWithin:
      "{modules} × {label} = {kwh} kWh nominaal, binnen {pct}% van het doel van ~{target} kWh",
    dRowNameplateTarget: "Nominaal doel",
    dValNameplate: "~{kwh} kWh bij {dod}% bruikbare ontladingsdiepte",
    dValBatteryNone: "Geen (alleen zon — direct verbruik plus teruglevering)",
    dSecInverter: "Omvormer",
    dRowPeakDemand: "Jouw piekvraag",
    dValPeak: "~{kw} kW tegelijk",
    dRowSuggestedClass: "Aanbevolen klasse",
    dValSuggested: "minimaal {kw} kW continu",
    dRowReferenceUnit: "Referentie-eenheid (alleen een voorbeeld)",
    dRowSurgeRule: "Regel voor aanloopstroom",
    dSurgeNote:
      "Kies een laagfrequent apparaat met ~3× aanloopstroom als de last koelkasten, pompen of gereedschap bevat — de aanloopstroom van een motor slaat een halve seconde hard toe. Gebruik trage zekeringen (klasse T) zodat diezelfde piek ze niet onnodig laat springen.",
    dSecController: "Laadregelaar en beveiliging",
    dRowControllerCapacity: "Capaciteit van de regelaar",
    dValController: "{amps} A totaal — {suggestion}",
    dRowControllerNote: "Opmerking over de regelaar",
    dControllerNote:
      "Veel laagfrequente hybride omvormers hebben een ingebouwde MPPT-lader — controleer of de maximale PV-ingang deze ampères aankan voordat je een aparte regelaar koopt.",
    dControllerOne: "één MPPT-regelaar van {amps} A",
    dControllerSplit: "verdeeld over {n} × MPPT-regelaars van 100 A",
    dRowMainFuse: "Hoofdzekering/schakelaar van de batterij",
    dValMainFuse: "{amps} A (de bank trekt bij vollast ~{discharge} A)",
    dRowPvDisconnect: "PV-ontkoppeling",
    dSecCable: "Kabel batterij-naar-omvormer (koper)",
    dRowRun: "traject van {meters} m",
    dValCableOk: "{awg} ({mm2} mm²) of dikker",
    dValCableShort: "dikker dan {awg} — maak het traject korter",
    dSecMounting: "Montage van het paneelveld en beste helling",
    dRowOrientation: "Oriëntatie van het veld",
    dValFaceSouth: "Op het ware zuiden (180°) voor de hoogste jaaropbrengst",
    dValFaceNorth: "Op het ware noorden (0°) voor de hoogste jaaropbrengst",
    dRowYearTilt: "Vaste helling het hele jaar",
    dValDegrees: "~{deg}° ten opzichte van horizontaal",
    dRowWinterTilt: "Steile winterhelling (nodig buiten het net)",
    dValWinterTilt: "~{deg}° — werpt sneeuw af en vangt de lage winterzon",
    dRowSummerTilt: "Zomerhelling (optioneel)",
    dRowMounting: "Montageadvies",
    dValMountSnow:
      "Grondmontage sterk aanbevolen: sneeuw ruimen en de helling per seizoen bijstellen is veel eenvoudiger",
    dValMountRoof: "Dakmontage (vlak of op frame) of grondmontage",
    dBosTitle: "Essentiële balance-of-system- (BOS-) en veiligheidslijst",
    dBosRowDisconnect: "DC-batterijscheiding",
    dBosValDisconnect:
      "Zware draaischakelaar plus een klasse-T-zekering (of DC-geschikte automaat) van {amps} A, naast de pluspool van de batterij.",
    dBosRowPvIsolator: "PV-veldscheiding + overspanningsbeveiliging",
    dBosValPvIsolator:
      "DC-geschikte tweepolige automaat en een DC-overspanningsbeveiliging (bliksemafleider) vóór de laadregelaar.",
    dBosRowShunt: "Batterijshunt / monitor",
    dBosValShunt:
      "Precisieshunt van 500 A op de hoofdmin van de batterij voor exacte tracking van de laadtoestand (alleen spanning is bij lithium onnauwkeurig).",
    dBosRowBusbars: "Koperen rails en kabels",
    dBosValBusbars:
      "Massief koperen rails om meerdere batterijen parallel te zetten; hydraulische zeshoekige persingen met dubbelwandige kleefkrimpkous op alle batterijkabelschoenen.",
    dBosRowGrounding: "Aarding van de apparatuur",
    dBosValGroundPv:
      "Verbind de montagerails van de panelen, bliksemafleiders en het omvormerchassis met een aardpen.",
    dBosValGroundNoPv:
      "Verbind het batterijrek, het omvormerchassis en elke metalen kast met een aardpen.",
    dBosRowSplit: "Melding 240 V split-fase",
    dBosValSplit:
      "De gekozen apparaten (diepwaterpomp, warmtepomp of EV-lader) vragen 240 V split-fase (L1 + L2 + N). Gebruik een echte 120/240 V split-fase-omvormer, of twee identieke 120 V-omvormers gestapeld met een communicatiekabel.",
    dNoteAveragePeak:
      "Omvormer gedimensioneerd op gemiddelde last (geen apparaatpiek ingevoerd) — echte pieken (waterkoker, koelkaststart, pompaanloop) kunnen vele malen hoger zijn. Voer apparaten in voor een exacte piek.",
    dNotePeakOverMax:
      "De piek van {kw} kW ligt boven de grootste standaardklasse van {max} kW — plan meerdere gestapelde eenheden, niet één kast van {kw} kW.",
    dNoteNoBattery:
      "Dit systeem heeft geen batterij, dus spanning, bankopbouw en DC-beveiliging vervallen.",
    dNoteVolts12:
      "12 V-klasse: prima voor camperlasten. Boven ~1,5 kW continu verspillen 24 V of 48 V veel minder koper.",
    dNoteVolts24:
      "24 V-klasse: de middenweg — haalbaar tot ongeveer 3,5 kW continu.",
    dNoteVolts48:
      "48 V-klasse: wat elk huisformaat systeem gebruikt — de laagste stroom voor hetzelfde vermogen.",
    dNoteRoundUp:
      "Banken komen in hele strengen: de kleinste {label}-opbouw levert ~{provided} kWh voor een vraag van {ask} kWh — de inkooplijst rondt naar boven af, de simulatie niet.",
    dNoteFuseOverflow:
      "De batterijstroom bij vollast (~{amps} A) ligt boven standaard zekeringwaarden — deze bank heeft parallelle strengen met beveiliging per streng nodig, ontworpen door een elektricien.",
    dDiyAgmLabel: "{series}S strengen van 12 V {ah} Ah AGM-blokken",
    dDiyCellsLabel: "{series}S strengen van {ah} Ah prismatische cellen",
    dRetailAgmLabel:
      "12 V {ah} Ah AGM-blokken (geen BMS — bedraden met balanceren)",
    dReferenceUnit: "{model} (~${price}, {note}, {date})",
    dReferenceAbove:
      "boven de referentieklasse van {class} kW — reken op meerdere gestapelde eenheden",
    dReferenceNo48:
      "hier geldt geen 48 V-referentie — zoek een omvormer/lader van de {volts} V-klasse voor deze bankspanning",
    dEli5Title: "💡 In gewone taal",
    dEli5Solar: "Zon",
    dEli5Storage: "Opslag",
    dEli5Target: "Doel",
    dEli5Panels: "{kw} kW aan panelen",
    dEli5Battery: "{kwh} kWh bruikbare batterij",
    dEli5Cut: "{pct}% minder netstroom",
    dEli5Reliability: "betrouwbaarheidsdoel van {pct}%",
    dEli5NoPanels: "geen panelen in deze optie",
    dEli5NoBattery: "geen batterij in deze optie",
    dPricePerKwh: "Jouw prijs per kWh ({sym}):",
    dStepResult: "4. Jouw resultaat",
    dCapacitySpectrum: "📊 Capaciteitsspectrum (ten opzichte van jouw keuze)",
    dInstallApp: "📲 App installeren",
    dInstallAppLong: "📲 BigEnergyCo-app installeren",
    dReadTerms: "Volledige voorwaarden lezen →",
    dReadAi: "AI-vrijwaring lezen →",
    dReadPrivacy: "Privacyverklaring lezen →",
    apRefrigeratorModern: "Koelkast (modern, middelgroot)",
    apRefrigeratorOld: "Koelkast (oud of groot)",
    apChestFreezer: "Diepvrieskist",
    apFan: "Plafond- of tafelventilator",
    apWindowAc: "Raamairco (één kamer)",
    apSplitAc: "Split-airco (hele verdieping)",
    apMiniSplitHeat: "Mini-split warmtepomp (verwarmingsmodus)",
    apMicrowave: "Magnetron",
    apKettle: "Waterkoker",
    apCoffee: "Koffiezetapparaat",
    apRiceCooker: "Rijstkoker",
    apInduction: "Inductiekookplaat (1 pit)",
    apAirFryer: "Airfryer",
    apLedBulb: "LED-lamp",
    apLedTv: "LED-tv",
    apComputer: "Laptop of desktop",
    apPhoneCharger: "Telefoonoplader",
    apRouter: "Internetrouter (altijd aan)",
    apStarlink: "Starlink / satelietinternet",
    apWasher: "Wasmachine",
    apWaterPump: "Waterpomp (boven de grond, drukvat, 120 V)",
    apDeepWellPump: "Diepwaterpomp (onderwater, 240 V)",
    apVacuum: "Stofzuiger",
    apIron: "Strijkijzer",
    apSpaceHeater: "Kachel (klein)",
    apWaterHeater: "Elektrische boiler (240 V)",
    apPoolPump: "Zwembadpomp",
    apEvCharger: "EV-lader (niveau 1, 120 V 12 A)",
    apWorkshopTools: "Gereedschap voor de werkplaats (tafelzaag / compressor)",
    dValRetailNote:
      "De kleinste kant-en-klare eenheid in deze spanningsklasse is al zo groot; bij deze bank past de zelfbouwlijst beter.",
    dRefModel: "{kw} kW laagfrequent split-fase",
    dRefNote: "48 V · 3× piek · ingebouwde MPPT",
    dChartGround: "Grond / Horizon",
    dChartFacing: "🧭 Gericht op {compass}",
    dChartTilt: "~{tilt}° helling",
    dMatrixPick: "{row} met {col} kiezen:",
  },
  ar: {
    dAssumpData:
      "البيانات: {source}، كل ساعة، {years}. الفاقد المطبّق: الأتربة {soiling}%، التوصيلات {wiring}%، عدم التطابق {mismatch}%، MPPT {mppt}%.",
    dAssumpCell:
      "نموذج حرارة الخلية: NOCT {noct}°م، معامل حرارة القدرة {gamma}%/°م.",
    dAssumpInverter: "كفاءة العاكس {eta}%.",
    dAssumpCold: "يُمنع الشحن تحت حد البرودة الخاص بالكيمياء (LFP 0 °م).",
    dAssumpLoad: "أساس الحمل: {basis}.",
    dAssumpCosts:
      "تتراوح التكاليف بين {basis} ({source}) — الحد الأدنى قطع قبل الشحن والرسوم وBMS، والحد الأعلى تجزئة مشحونة تشمل BMS والغلاف.",
    dAssumpOffline:
      "الوضع دون اتصال: استخدم هذا التشغيل ملف السنة النموذجية المضمّن لـ {city} — تقريب قريب لا موقعك الدقيق. أعد التشغيل متصلًا لخمس سنوات من طقس موقعك.",
    dAssumpTariff:
      "يفترض الإنفاق على الشبكة {rate} عند {kwh} كيلوواط·ساعة/يوم.",
    dAssumpNoTariff: "لم تُدخل تعريفة، لذا لا تظهر فترة الاسترداد.",
    dCapAuto:
      "نموذج السعة عند متوسط {t}°م في الموقع: LFP 100%، أيون الصوديوم 85% (إعدادات جهد LFP)، الرصاص-حمض (AGM) نحو {agm}% (مع تخفيض البرودة حيث ينطبق).",
    dCapAgmCold:
      "موقع بارد: عند متوسط {t}°م يُخفَّض الرصاص-حمض (AGM) إلى نحو {pct}% من السعة الاسمية؛ الليثيوم والصوديوم لا يتأثران بالبرودة في هذا النموذج (يشحنان أبطأ).",
    dCapScale:
      "عند متوسط {t}°م في الموقع، يوفّر {name} نحو {pct}% من السعة الاسمية القابلة للاستخدام (تحجيم حسب المعدل/البرودة).",
    dCapFull:
      "يفترض نموذج السعة كامل السعة الاسمية القابلة للاستخدام عند متوسط {t}°م في الموقع.",
    dSecPanels: "الألواح",
    dRowArray: "حقل الألواح",
    dValArray: "{kw} كيلوواط ← {count} × {watts} واط = {actual} كيلوواط",
    dRowSpaceNeeded: "المساحة المطلوبة",
    dValSpace: "نحو {area} م² من السطح أو الأرض (بما في ذلك فراغات التركيب)",
    dValPanelsNone: "لا شيء (بطارية فقط — مراجحة أسعار الوقت / إزاحة الذروة)",
    dSecBatteryBank: "بنك البطاريات",
    dRowSystemVoltage: "جهد النظام",
    dValVoltage:
      "{volts} فولت — يناسب عاكسًا من فئة {kw} كيلوواط وبنكًا بسعة اسمية {kwh} كيلوواط·ساعة",
    dRowDiyBuild: "تركيب ذاتي",
    dValDiy: "{label} × {strings} سلسلة متوازية = {cells} خلية",
    dRowPrebuilt: "بديل جاهز",
    dValRetailHead: "{modules} × {label} = {kwh} كيلوواط·ساعة اسمية",
    dValRetailOver:
      "{modules} × {label} = {kwh} كيلوواط·ساعة اسمية، أي {pct}% فوق هدف ~{target} كيلوواط·ساعة",
    dValRetailWithin:
      "{modules} × {label} = {kwh} كيلوواط·ساعة اسمية، ضمن {pct}% من هدف ~{target} كيلوواط·ساعة",
    dRowNameplateTarget: "الهدف الاسمي",
    dValNameplate: "~{kwh} كيلوواط·ساعة عند عمق تفريغ قابل للاستخدام {dod}%",
    dValBatteryNone: "لا شيء (شمسي فقط — استهلاك مباشر مع تصدير للشبكة)",
    dSecInverter: "العاكس",
    dRowPeakDemand: "ذروة طلبك",
    dValPeak: "~{kw} كيلوواط في وقت واحد",
    dRowSuggestedClass: "الفئة المقترحة",
    dValSuggested: "{kw} كيلوواط مستمر كحد أدنى",
    dRowReferenceUnit: "وحدة مرجعية (مثال فقط)",
    dRowSurgeRule: "قاعدة تيار البدء",
    dSurgeNote:
      "اختر وحدة منخفضة التردد بتيار بدء نحو 3× إذا كانت الأحمال تشمل ثلاجات أو مضخات أو أدوات — تيار بدء المحرك قوي لنصف ثانية. استخدم مصاهر بطيئة (فئة T) حتى لا تفصلها الذروة نفسها بلا داعٍ.",
    dSecController: "منظم الشحن والحماية",
    dRowControllerCapacity: "سعة المنظم",
    dValController: "{amps} أمبير إجمالًا — {suggestion}",
    dRowControllerNote: "ملاحظة المنظم",
    dControllerNote:
      "كثير من العاكسات الهجينة منخفضة التردد تضم شاحن MPPT مدمجًا — تحقق من أن أقصى دخل كهروضوئي يغطي هذه الأمبيرات قبل شراء منظم منفصل.",
    dControllerOne: "منظم MPPT واحد بقدرة {amps} أمبير",
    dControllerSplit: "موزّع على {n} × منظمات MPPT بسعة 100 أمبير",
    dRowMainFuse: "مصهر/قاطع البطارية الرئيسي",
    dValMainFuse:
      "{amps} أمبير (يمكن للبنك سحب ~{discharge} أمبير عند الحمل الكامل)",
    dRowPvDisconnect: "فصل الكهروضوئية",
    dSecCable: "كابل البطارية إلى العاكس (نحاس)",
    dRowRun: "مسار بطول {meters} م",
    dValCableOk: "{awg} ({mm2} مم²) أو أكبر",
    dValCableShort: "أكبر من {awg} — قصّر المسار",
    dSecMounting: "تركيب حقل الألواح وأفضل ميل",
    dRowOrientation: "اتجاه الحقل",
    dValFaceSouth: "باتجاه الجنوب الحقيقي (180°) لأقصى إنتاج سنوي",
    dValFaceNorth: "باتجاه الشمال الحقيقي (0°) لأقصى إنتاج سنوي",
    dRowYearTilt: "ميل ثابت طوال السنة",
    dValDegrees: "~{deg}° عن المستوى الأفقي",
    dRowWinterTilt: "ميل شتوي حاد (ضروري خارج الشبكة)",
    dValWinterTilt: "~{deg}° — يطرد الثلج ويلتقط شمس الشتاء المنخفضة",
    dRowSummerTilt: "ميل صيفي (اختياري)",
    dRowMounting: "توصية التركيب",
    dValMountSnow:
      "يُنصح بشدة بالتركيب الأرضي: تنظيف الثلج وتعديل الميل موسميًا أسهل بكثير",
    dValMountRoof: "تركيب على السطح (ملاصق أو على هيكل) أو على الأرض",
    dBosTitle: "قائمة أساسية لتوازن النظام (BOS) والسلامة",
    dBosRowDisconnect: "فاصل بطارية التيار المستمر",
    dBosValDisconnect:
      "مفتاح دوّار للخدمة الشاقة مع مصهر فئة T (أو قاطع مناسب للتيار المستمر) بسعة {amps} أمبير، قرب طرف البطارية الموجب.",
    dBosRowPvIsolator: "فاصل حقل الكهروضوئية + واقٍ من الصواعق",
    dBosValPvIsolator:
      "قاطع ثنائي القطب مناسب للتيار المستمر وواقٍ من زيادة الجهد (مانعة صواعق) قبل منظم الشحن.",
    dBosRowShunt: "محوّل قياس / مراقب البطارية",
    dBosValShunt:
      "محوّل قياس دقيق 500 أمبير على السالب الرئيسي للبطارية لتتبع دقيق لحالة الشحن (الجهد وحده غير دقيق في الليثيوم).",
    dBosRowBusbars: "قضبان نحاسية وكابلات",
    dBosValBusbars:
      "قضبان نحاسية صلبة لتوصيل عدة بطاريات على التوازي؛ عصر هيدروليكي سداسي مع كماشة حرارية لاصقة مزدوجة الجدار على جميع أطراف كابلات البطارية.",
    dBosRowGrounding: "تأريض المعدات",
    dBosValGroundPv:
      "اربط قضبان تركيب الألواح ومانعات الصواعق وهيكل العاكس بقضيب أرضي.",
    dBosValGroundNoPv:
      "اربط حامل البطاريات وهيكل العاكس وأي صندوق معدني بقضيب أرضي.",
    dBosRowSplit: "تنبيه الطور المنقسم 240 فولت",
    dBosValSplit:
      "الأجهزة التي اخترتها (مضخة بئر عميق أو مضخة حرارية أو شاحن سيارة كهربائية) تحتاج 240 فولت بطور منقسم (L1 + L2 + N). استخدم عاكسًا أصليًا 120/240 فولت بطور منقسم، أو عاكسين متطابقين 120 فولت مركّبين مع كابل اتصال.",
    dNoteAveragePeak:
      "حُدد العاكس من متوسط الحمل (لم تُدخل ذروة أجهزة) — الذروات الحقيقية (غلاية، بدء ثلاجة، بدء مضخة) قد تكون أضعافًا. أدخل الأجهزة لذروة دقيقة.",
    dNotePeakOverMax:
      "ذروة {kw} كيلوواط تتجاوز أكبر فئة قياسية {max} كيلوواط — خطط لعدة وحدات مركّبة، لا صندوقًا واحدًا بقدرة {kw} كيلوواط.",
    dNoteNoBattery:
      "لا توجد بطارية في هذا النظام، لذا يُغفل الجهد وتخطيط البنك وحماية التيار المستمر.",
    dNoteVolts12:
      "فئة 12 فولت: مناسبة لأحمال المركبات الترفيهية. فوق ~1.5 كيلوواط مستمر، يهدر 24 أو 48 فولت نحاسًا أقل بكثير.",
    dNoteVolts24: "فئة 24 فولت: الحل الوسط — عملي حتى نحو 3.5 كيلوواط مستمر.",
    dNoteVolts48:
      "فئة 48 فولت: ما يستخدمه أي نظام بحجم منزل — أقل تيار للقدرة نفسها.",
    dNoteRoundUp:
      "تُباع البنوك بسلاسل كاملة: أصغر بناء {label} يوفر ~{provided} كيلوواط·ساعة لطلب {ask} كيلوواط·ساعة — قائمة الشراء تقرّب لأعلى، أما المحاكاة فلا.",
    dNoteFuseOverflow:
      "تيار البطارية عند الحمل الكامل (~{amps} أمبير) يتجاوز قيم المصاهر القياسية — يحتاج هذا البنك سلاسل متوازية بحماية لكل سلسلة، يصممها كهربائي.",
    dDiyAgmLabel: "{series}S سلاسل من كتل AGM 12 فولت {ah} أمبير·ساعة",
    dDiyCellsLabel: "{series}S سلاسل من خلايا منشورية {ah} أمبير·ساعة",
    dRetailAgmLabel:
      "كتل AGM 12 فولت {ah} أمبير·ساعة (بدون BMS — وصّل مع الموازنة)",
    dReferenceUnit: "{model} (~${price}، {note}، {date})",
    dReferenceAbove: "فوق فئة المرجع {class} كيلوواط — توقع عدة وحدات مركّبة",
    dReferenceNo48:
      "لا ينطبق مرجع 48 فولت هنا — ابحث عن عاكس/شاحن من فئة {volts} فولت لجهد هذا البنك",
    dEli5Title: "💡 بلغة واضحة",
    dEli5Solar: "شمسي",
    dEli5Storage: "تخزين",
    dEli5Target: "الهدف",
    dEli5Panels: "{kw} كيلوواط من الألواح",
    dEli5Battery: "{kwh} كيلوواط·ساعة بطارية قابلة للاستخدام",
    dEli5Cut: "{pct}% طاقة أقل من الشبكة",
    dEli5Reliability: "هدف موثوقية {pct}%",
    dEli5NoPanels: "لا ألواح في هذا الخيار",
    dEli5NoBattery: "لا بطارية في هذا الخيار",
    dPricePerKwh: "سعرك لكل كيلوواط·ساعة ({sym}):",
    dStepResult: "4. نتيجتك",
    dCapacitySpectrum: "📊 طيف السعة (بالنسبة إلى اختيارك)",
    dInstallApp: "📲 تثبيت التطبيق",
    dInstallAppLong: "📲 تثبيت تطبيق BigEnergyCo",
    dReadTerms: "اقرأ الشروط الكاملة ←",
    dReadAi: "اقرأ إخلاء مسؤولية الذكاء الاصطناعي ←",
    dReadPrivacy: "اقرأ ملاحظة الخصوصية ←",
    apRefrigeratorModern: "ثلاجة (حديثة، متوسطة الحجم)",
    apRefrigeratorOld: "ثلاجة (قديمة أو كبيرة)",
    apChestFreezer: "مجمّد صندوقي",
    apFan: "مروحة سقف أو مكتب",
    apWindowAc: "مكيف نافذة (غرفة واحدة)",
    apSplitAc: "مكيف سبليت (طابق كامل)",
    apMiniSplitHeat: "مضخة حرارية ميني سبليت (وضع التدفئة)",
    apMicrowave: "ميكروويف",
    apKettle: "غلاية كهربائية",
    apCoffee: "آلة قهوة",
    apRiceCooker: "طنجرة أرز",
    apInduction: "موقد حثّي (عين واحدة)",
    apAirFryer: "قلاية هوائية",
    apLedBulb: "مصباح LED",
    apLedTv: "تلفاز LED",
    apComputer: "حاسوب محمول أو مكتبي",
    apPhoneCharger: "شاحن هاتف",
    apRouter: "راوتر إنترنت (يعمل دائمًا)",
    apStarlink: "ستارلينك / إنترنت فضائي",
    apWasher: "غسالة ملابس",
    apWaterPump: "مضخة ماء (سطحية، خزان ضغط، 120 فولت)",
    apDeepWellPump: "مضخة بئر عميق (غاطسة، 240 فولت)",
    apVacuum: "مكنسة كهربائية",
    apIron: "مكواة ملابس",
    apSpaceHeater: "مدفأة صغيرة",
    apWaterHeater: "سخان ماء كهربائي (240 فولت)",
    apPoolPump: "مضخة مسبح",
    apEvCharger: "شاحن سيارة كهربائية (مستوى 1، 120 فولت 12 أمبير)",
    apWorkshopTools: "أدوات ورشة (منشار طاولة / ضاغط هواء)",
    dValRetailNote:
      "أصغر وحدة جاهزة في فئة الجهد هذه بهذا الحجم بالفعل — بالنسبة لهذا البنك، قائمة التركيب الذاتي أقرب.",
    dRefModel: "{kw} كيلوواط منخفض التردد بطور منقسم",
    dRefNote: "48 فولت · 3× بدء · MPPT مدمج",
    dChartGround: "الأرض / الأفق",
    dChartFacing: "🧭 باتجاه {compass}",
    dChartTilt: "~{tilt}° ميل",
    dMatrixPick: "اختيار {row} عند {col}:",
  },
};
