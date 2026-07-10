const MODULE_ID = "cain-ru";
const SYSTEM_ID = "cain";

const SETTINGS = {
  runtime: "translateRuntime",
  compendia: "translateCompendia",
  showOriginalNames: "showOriginalNames"
};

const TRANSLATION_PACK_FILES = [
  "cain.afflictions.json",
  "cain.agendas.json",
  "cain.blasphemies.json",
  "cain.domains.json",
  "cain.homebrew.json",
  "cain.items.json",
  "cain.recreation.json",
  "cain.sin-marks.json",
  "cain.virtues.json"
];

const LANGUAGE_PATH = `modules/${MODULE_ID}/lang/ru.json`;

const ITEM_LOOKUP_FIELDS = [
  "name",
  "system.agendaName",
  "system.task",
  "system.abilityName",
  "system.blasphemyName",
  "system.powerName",
  "system.virtueName",
  "system.afflictionName",
  "system.bodyPartName"
];

const BILINGUAL_SEARCH_FIELDS = [
  ...ITEM_LOOKUP_FIELDS,
  "system.type",
  "system.keywords",
  "system.blasphemyType",
  "system.virtueName",
  "system.sinSource"
];

const TRANSLATED_LOOKUP_ENTRY_KEYS = new Set([
  "name",
  "agendaName",
  "task",
  "abilityName",
  "blasphemyName",
  "powerName",
  "virtueName",
  "afflictionName",
  "bodyPartName"
]);

const ITEM_TYPE_TRANSLATION_HINTS = {
  agenda: ["agendaName"],
  agendaTask: ["task"],
  agendaAbility: ["abilityName", "abilityDescription"],
  blasphemy: ["blasphemyName"],
  blasphemyPower: ["powerName", "powerDescription"],
  sinMark: ["bodyPartName"],
  sinMarkAbility: ["abilityName", "abilityDescription", "bodyPartName"],
  affliction: ["afflictionName", "afflictionDescription"],
  domain: ["domainDescription", "sinSource", "afflictionEffect"],
  item: ["itemType", "description"],
  bond: ["virtueName", "strictures"],
  bondAbility: ["abilityName", "abilityDescription"]
};

const translationState = {
  loaded: false,
  loadPromise: null,
  byOriginalName: new Map(),
  byTranslatedName: new Map(),
  byPackName: new Map()
};

let itemTranslationHooksInstalled = false;

const SKILL_TRANSLATIONS = {
  force: "Сила",
  conditioning: "Подготовка",
  coordination: "Координация",
  covert: "Скрытность",
  interfacing: "Техника",
  investigation: "Расследование",
  surveillance: "Наблюдение",
  negotiation: "Переговоры",
  authority: "Авторитет",
  connection: "Связь",
  psyche: "Психика"
};

const TEXT_TRANSLATIONS = {
  "Global Talismans": "Глобальные талисманы",
  "Delete": "Удалить",
  "Create Tile": "Создать плитку",
  "Delete All Tiles": "Удалить все плитки",
  "Pin": "Закрепить",
  "Add Talisman": "Добавить талисман",
  "Name": "Название",
  "Type": "Тип",
  "Description": "Описание",
  "Source": "Источник",
  "Overview": "Обзор",
  "Skills & Agendas": "Навыки и повестки",
  "XP & Advancements": "Опыт и улучшения",
  "Talismans": "Талисманы",
  "Survival": "Выживание",
  "Did you survive?": "Вы выжили?",
  "Up to 1 from first agenda": "До 1 опыта за первую повестку",
  "You don't seem to have a primary agenda - consider adding one...": "У вас нет основной повестки - стоит добавить ее...",
  "Up to 2 from bold agendas": "До 2 опыта за выделенные повестки",
  "Injuries/Afflictions": "Травмы/поражения",
  "Did you take an injury or affliction?": "Вы получили травму или поражение?",
  "Tasks": "Задачи",
  "Abilities": "Способности",
  "Select Item:": "Выберите предмет:",
  "Add Task to Agenda": "Добавить задачу в повестку",
  "Task": "Задача",
  "Task Description": "Описание задачи",
  "Bold Task (Primary Task)": "Выделенная задача (основная)",
  "Ability": "Способность",
  "Ability Name": "Название способности",
  "Ability Description": "Описание способности",
  "Blasphemy Name": "Название богохульства",
  "Passive": "Пассивная",
  "Powers": "Силы",
  "Create custom content for your CAIN game": "Создавайте собственный контент для игры CAIN",
  "Agenda": "Повестка",
  "Blasphemy": "Богохульство",
  "Bond": "Уза",
  "Bond Abilities": "Способности узы",
  "Afflictions": "Поражения",
  "Items": "Предметы",
  "Sin Marks": "Метки греха",
  "Import/Export": "Импорт/экспорт",
  "History": "История",
  "Settings": "Настройки",
  "Create Agenda": "Создать повестку",
  "Agenda Name": "Название повестки",
  "Agenda Tasks": "Задачи повестки",
  "Add Task": "Добавить задачу",
  "Agenda Abilities": "Способности повестки",
  "Add Ability": "Добавить способность",
  "CAT Formatting Help": "Справка по форматированию CAT",
  "Syntax:": "Синтаксис:",
  "Valid types:": "Допустимые типы:",
  "Modifier:": "Модификатор:",
  "Operations (optional):": "Операции (необязательно):",
  "Examples:": "Примеры:",
  "Create Blasphemy": "Создать богохульство",
  "Add Power": "Добавить силу",
  "Psyche Burst:": "Всплеск психики:",
  "Uses": "Использует",
  "No-Cost Mode": "Режим без затрат",
  "Multiple": "Несколько",
  "Create Standalone Power": "Создать отдельную силу",
  "Power Name": "Название силы",
  "Is Passive Power": "Пассивная сила",
  "Psyche Burst Options": "Параметры всплеска психики",
  "Uses Psyche Burst": "Тратит всплеск психики",
  "Has No-Psyche Mode": "Есть режим без психики",
  "Can Use Multiple Bursts": "Можно тратить несколько всплесков",
  "Keywords": "Ключевые слова",
  "Power Description": "Описание силы",
  "Create Power": "Создать силу",
  "Create Bond (Virtue)": "Создать узу (добродетель)",
  "Bond Name": "Название узы",
  "Virtue Name": "Название добродетели",
  "High Blasphemy Unlock Level": "Уровень открытия высшего богохульства",
  "Level 0 - Immediate": "Уровень 0 - сразу",
  "Level 1": "Уровень 1",
  "Level 2": "Уровень 2",
  "Level 3": "Уровень 3",
  "The bond level at which the associated High Blasphemy is unlocked.": "Уровень узы, на котором открывается связанное высшее богохульство.",
  "Strictures": "Запреты",
  "Add Stricture": "Добавить запрет",
  "Rules that must be followed while bonding with this virtue. Breaking a stricture costs 1d3 stress.": "Правила, которым нужно следовать при связи с этой добродетелью. Нарушение запрета стоит 1d3 стресса.",
  "No strictures added yet. Click \"Add Stricture\" to define the rules of this bond.": "Запреты еще не добавлены. Нажмите «Добавить запрет», чтобы задать правила этой узы.",
  "Bond System Info": "Справка по узам",
  "Permanent Ability": "Постоянная способность",
  "Bond Level Required": "Требуемый уровень узы",
  "Level 1 - 1 Mission Survived": "Уровень 1 - 1 пережитая миссия",
  "Level 2 - 2 Missions Survived": "Уровень 2 - 2 пережитые миссии",
  "Level 3 - 3 Missions Survived (Max)": "Уровень 3 - 3 пережитые миссии (макс.)",
  "Psyche Burst Requirements": "Требования всплеска психики",
  "Requires Psyche Burst": "Требует всплеск психики",
  "Psyche Burst Cost": "Цена во всплесках психики",
  "Set to 0 for \"all remaining Psyche Bursts (minimum 1)\"": "Поставьте 0 для «все оставшиеся всплески психики (минимум 1)».",
  "Create Bond Ability": "Создать способность узы",
  "Create Affliction": "Создать поражение",
  "Affliction Name": "Название поражения",
  "Create Item": "Создать предмет",
  "Item Name": "Название предмета",
  "Quantity": "Количество",
  "Weight": "Вес",
  "Create Sin Mark": "Создать метку греха",
  "Sin Mark Name": "Название метки греха",
  "Sin Mark Abilities": "Способности метки греха",
  "Import & Export Homebrew Content": "Импорт и экспорт хоумбрю-контента",
  "Export Content": "Экспорт контента",
  "Select Items to Export:": "Выберите предметы для экспорта:",
  "Select All": "Выбрать все",
  "No items to export. Create some homebrew content first!": "Нечего экспортировать. Сначала создайте хоумбрю-контент.",
  "Export Folders to World": "Экспортировать папки в мир",
  "Select Folders to Export:": "Выберите папки для экспорта:",
  "Select All Folders": "Выбрать все папки",
  "No folders with homebrew items found.": "Папки с хоумбрю-предметами не найдены.",
  "Import Content": "Импорт контента",
  "Kit Points & Scrip Amount": "Очки снаряжения и скрип",
  "Scrip:": "Скрип:",
  "Gear": "Снаряжение",
  "Name": "Название",
  "Type": "Тип",
  "Kit Points": "Очки снаряжения",
  "Scrip": "Скрип",
  "Right click to clear": "ПКМ: очистить",
  "Cat Level": "Уровень CAT",
  "XP & Advancements": "Опыт и улучшения",
  "Advancements": "Улучшения",
  "Divine Agony": "Божественная агония",
  "Injuries": "Травмы",
  "Stress": "Стресс",
  "Dice Roller": "Бросок кубов",
  "Select Skill": "Выберите навык",
  "Use Divine Agony": "Использовать божественную агонию",
  "Teamwork": "Командная работа",
  "Setup": "Подготовка",
  "Hard": "Сложно",
  "HARD": "СЛОЖНО",
  "RISKY": "РИСК",
  "Extra Dice": "Дополнительные кубы",
  "Roll": "Бросить",
  "ADVANCEMENT": "УЛУЧШЕНИЕ",
  "At the end of each session, answer each question, then mark xp. Cash an advance each time you mark 4.": "В конце каждой сессии ответьте на вопросы и отметьте опыт. Получайте улучшение каждый раз, когда отмечаете 4.",
  "Did you survive?": "Вы выжили?",
  "Did you follow your first agenda item?": "Вы следовали первому пункту своей повестки?",
  "Did you follow at least one bolded agenda item?": "Вы следовали хотя бы одному выделенному пункту повестки?",
  "Did you follow two or more bolded agenda items?": "Вы следовали двум или более выделенным пунктам повестки?",
  "Did you take an injury or affliction?": "Вы получили травму или поражение?",
  "ACTION ASSESSMENT METRIC": "МЕТРИКА ОЦЕНКИ ДЕЙСТВИЯ",
  "SUCCESS": "УСПЕХ",
  "Admin rolls the risk die": "Админ бросает куб риска",
  "Successes on a 6": "Успехи только на 6",
  "Teamwork (Combine highest bonuses)": "Командная работа (объедините лучшие бонусы)",
  "Setup yourself or another: (+1D, -risk, or -hard)": "Подготовить себя или другого: (+1D, -риск или -сложность)",
  "Spend 1 psyche burst to use your powers (+1D)": "Потратьте 1 всплеск психики, чтобы использовать силы (+1D)",
  "Use your abilities": "Используйте способности",
  "Bargain with the Admin (Gain a hook or tradeoff)": "Торгуйтесь с Админом (получите зацепку или компромисс)",
  "Sin Overflow": "Переполнение греха",
  "Roll Sin Marks": "Бросить метки греха",
  "Clear Sin Marks": "Очистить метки греха",
  "EVOLVE": "ЭВОЛЮЦИЯ",
  "Psyche Burst Charges": "Заряды всплеска психики",
  "No Psyche Burst Data": "Нет данных всплеска психики",
  "Using any blasphemy power requires a psyche burst. Some can spend multiple for extra benefit.": "Любая сила богохульства требует всплеск психики. Некоторые силы могут тратить несколько всплесков ради дополнительного эффекта.",
  "You always start a mission with three psyche bursts.": "Вы всегда начинаете миссию с тремя всплесками психики.",
  "Drag or search for agenda to add to your sheet.": "Перетащите или найдите повестку, чтобы добавить ее на лист.",
  "Click \"Add Task\" button below to add custom tasks, or tasks will auto-populate when you add an agenda.": "Нажмите «Добавить задачу», чтобы добавить свою задачу; задачи также заполнятся автоматически при добавлении повестки.",
  "Select abilities from the dropdown below, or they will auto-populate when you add an agenda.": "Выберите способности в списке ниже; они также заполнятся автоматически при добавлении повестки.",
  "Available Abilities:": "Доступные способности:",
  "Blasphemies": "Богохульства",
  "Drag or search for blasphemy to add to your sheet.": "Перетащите или найдите богохульство, чтобы добавить его на лист.",
  "Passives will auto-populate when you add a blasphemy.": "Пассивные эффекты заполнятся автоматически при добавлении богохульства.",
  "Available Powers:": "Доступные силы:",
  "Other Powers": "Другие силы",
  "QUIRK": "ОСОБЕННОСТЬ",
  "Sin": "Грех",
  "SIN": "ГРЕХ",
  "Name:": "Имя:",
  "Type:": "Тип:",
  "Form:": "Форма:",
  "Category:": "Категория:",
  "Quick Actions": "Быстрые действия",
  "Attack a Player": "Атаковать игрока",
  "Afflict a Player": "Наложить поражение на игрока",
  "Use Complication": "Использовать осложнение",
  "Use Threat": "Использовать угрозу",
  "Severe Attack": "Тяжелая атака",
  "Use Domain": "Использовать домен",
  "No talismans are bound to this sin... go add some!": "К этому греху не привязаны талисманы... добавьте их.",
  "Palace / Pressure": "Дворец / давление",
  "Attacks": "Атаки",
  "Domains": "Домены",
  "Palace": "Дворец",
  "Pressure": "Давление",
  "Complications": "Осложнения",
  "Threats": "Угрозы",
  "Attack": "Атака",
  "Severe Ability Questions": "Вопросы тяжелой способности",
  "Trauma Questions": "Вопросы травмы",
  "Biography & Appearance": "Биография и внешность",
  "No domain, drag one here!": "Доменов нет, перетащите сюда один.",
  "Domains are separate items. If you don't see any domains, import them from the Domains compendium first, then drag them here.": "Домены являются отдельными предметами. Если вы не видите доменов, сначала импортируйте их из библиотеки доменов, затем перетащите сюда.",
  "Human": "Человек",
  "Drifter": "Скиталец",
  "Anomaly": "Аномалия",
  "Sin Variant": "Вариант греха",
  "Pseudo-Sin": "Псевдогрех",
  "Binder": "Связующий",
  "Exorcist": "Экзорцист",
  "Mechanical": "Механический",
  "Range:": "Дистанция:",
  "Melee": "Ближняя",
  "Short": "Короткая",
  "Long": "Дальняя",
  "Extreme": "Экстремальная",
  "ATTACK": "АТАКА",
  "REACT": "РЕАКЦИЯ",
  "AFFLICT": "ПОРАЖЕНИЕ",
  "EXECUTION": "КАЗНЬ",
  "Combat": "Бой",
  "Tendencies": "Склонности",
  "Conditional Effects": "Условные эффекты",
  "Behavior": "Поведение",
  "Appearance": "Внешность",
  "GM Notes": "Заметки ведущего",
  "Stress Output": "Выход стресса",
  "Dice Formula": "Формула кубов",
  "On Roll of 1": "При результате 1",
  "On Roll of 2-3": "При результате 2-3",
  "On Roll of 4+": "При результате 4+",
  "Bonus Effect": "Бонусный эффект",
  "Reactions": "Реакции",
  "Attacks With": "Атакует с помощью",
  "Stress Inflicted": "Наносимый стресс",
  "Creates Complication": "Создает осложнение",
  "Creates Threat": "Создает угрозу",
  "Die Roll Attached": "Прикреплен бросок куба",
  "Capabilities": "Возможности",
  "Add Capability": "Добавить возможность",
  "Special Abilities": "Особые способности",
  "Pressure Scaling": "Масштабирование давления",
  "Scales with Pressure": "Масштабируется давлением",
  "Send to Chat": "Отправить в чат",
  "Submit": "Подтвердить",
  "Cancel": "Отмена",
  "Choose": "Выбрать",
  "Add Affliction": "Добавить поражение",
  "Add Custom Clock": "Добавить свой счетчик",
  "Add": "Добавить",
  "Party Rest": "Отдых группы",
  "Start New Hunt": "Начать новую охоту",
  "Start Hunt": "Начать охоту",
  "End Hunt": "Завершить охоту",
  "Reset Mission": "Сбросить миссию",
  "Link Execution Talisman": "Связать талисман казни",
  "Link Tension Talisman": "Связать талисман напряжения",
  "Link Pressure Talisman": "Связать талисман давления",
  "Link": "Связать",
  "Psyche Roll": "Бросок психики",
  "Psyche": "Психика",
  "Use Psyche Burst": "Использовать всплеск психики",
  "Use Burst": "Использовать всплеск",
  "Print Questions": "Вывести вопросы",
  "Severe Attack Roll": "Бросок тяжелой атаки",
  "Dice Rolled:": "Брошенные кубы:",
  "Successes:": "Успехи:",
  "Total Successes:": "Всего успехов:",
  "Number of 1's (Successes):": "Число единиц (успехов):",
  "Number of non-1's:": "Число не-единиц:",
  "Send minions": "Послать прислужников",
  "Ambush the exorcists": "Устроить засаду экзорцистам",
  "Involve authorities": "Вовлечь власти",
  "Separate someone": "Разделить кого-нибудь",
  "Force a difficult choice": "Навязать трудный выбор",
  "Escalate the situation": "Обострить ситуацию",
  "Afflict the exorcists": "Поразить экзорцистов",
  "Start/progress a ticking clock": "Начать или продвинуть таймер",
  "Use a domain": "Использовать домен",
  "Threaten or twist an NPC": "Угрожать NPC или исказить его",
  "Introduce a new obstacle": "Ввести новое препятствие",
  "Briefing": "Брифинг",
  "Arrival": "Прибытие",
  "Tracking": "Выслеживание",
  "Investigation": "Расследование",
  "Preparation": "Подготовка",
  "Execution": "Казнь",
  "Execution successful. Each exorcist earns 5 scrip.": "Казнь успешна. Каждый экзорцист получает 5 скрипов.",
  "Sin spared. Each exorcist earns 3 scrip.": "Грех пощажен. Каждый экзорцист получает 3 скрипа.",
  "Execution failed. Each exorcist loses 1 scrip.": "Казнь провалена. Каждый экзорцист теряет 1 скрип.",
  "Kit and Items": "Снаряжение и предметы",
  "Agendas": "Повестки",
  "Roll Tables": "Таблицы бросков",
  "Opponents & Drifters": "Противники и скитальцы",
  "Virtues (Bonds)": "Добродетели (узы)",
  "Homebrew": "Хоумбрю",
  "Recreation": "Отдых",
  "Lore & Archives": "Лор и архивы",
  "Stats & Advancements": "Характеристики и развитие",
  "Bio & Bonds": "Биография и узы",
  "Biography": "Биография",
  "Bonds": "Узы",
  "Sex": "Пол",
  "Height": "Рост",
  "Weight": "Вес",
  "Hair": "Волосы",
  "Eyes": "Глаза",
  "EXTRA d6 to ROLLS": "Доп. d6 к броскам",
  "Gain 1 XP": "Получить 1 опыт",
  "Lose 1 XP": "Потерять 1 опыт",
  "+1 Max XP": "+1 макс. опыт",
  "-1 Max XP": "-1 макс. опыт",
  "End Session XP": "Опыт за конец сессии",
  "Rest Dice Modifier": "Модификатор кубов отдыха",
  "Roll Rest Dice": "Бросить кубы отдыха",
  "Roll Psyche": "Бросок психики",
  "Roll Psyche (N/A)": "Бросок психики (н/д)",
  "Roll your psyche dice": "Бросить кубы психики",
  "You can always spend a psyche burst to add +1 advantage die to any roll (yours or an ally’s) by using your blasphemies in a creative way.": "Вы всегда можете потратить всплеск психики, чтобы добавить +1 куб преимущества к любому броску своему или союзника, творчески используя свои богохульства.",
  "You can recover them by resting during a hunt (see pg. 38) or through the uses of abilities.": "Вы можете восстановить их отдыхом во время охоты или применением способностей.",
  "You can always use psyche for minor effects such as:": "Психику всегда можно использовать для малых эффектов, например:",
  "producing a faint light or aura around something or someone": "создать слабый свет или ауру вокруг предмета или существа",
  "producing minor force at a distance (like a gust of wind)": "создать слабое воздействие на расстоянии, например порыв ветра",
  "making electrical lights or appliances flicker": "заставить электрические лампы или приборы мерцать",
  "warm or cool the surface of your body": "нагреть или охладить поверхность своего тела",
  "Drag new agenda here to swap": "Перетащите новую повестку сюда, чтобы заменить текущую",
  "Search world agendas to add to sheet...": "Искать повестки мира для добавления на лист...",
  "Search world blasphemies to add to sheet...": "Искать богохульства мира для добавления на лист...",
  "Search world items to add to sheet...": "Искать предметы мира для добавления на лист...",
  "Agenda Image": "Изображение повестки",
  "Blasphemy Image": "Изображение богохульства",
  "Passive": "Пассивная сила",
  "Passives": "Пассивные силы",
  "Select powers from the dropdown below to add them to your blasphemy.": "Выберите силы из списка ниже, чтобы добавить их к богохульству.",
  "Add More Powers (Click to expand)": "Добавить больше сил (нажмите, чтобы раскрыть)",
  "Keywords": "Ключевые слова",
  "Toggle Animation": "Переключить анимацию",
  "Edit this character's copy": "Редактировать копию этого персонажа",
  "Has no-psyche mode": "Есть режим без психики",
  "Uses psyche burst": "Тратит всплеск психики",
  "Can use multiple bursts": "Можно тратить несколько всплесков",
  "No Psyche": "Без психики",
  "Uses Psyche": "Тратит психику",
  "Plus Psyche": "Доп. психика",
  "Pick a virtue to bond with at the start of a mission. Surviving missions increases your bond level (max 3). Bond benefits are permanent even when not actively bonding.": "Выберите добродетель для узы в начале миссии. Пережитые миссии повышают уровень узы (макс. 3). Преимущества узы постоянны, даже когда вы не поддерживаете ее активно.",
  "Virtue:": "Добродетель:",
  "Bond Level:": "Уровень узы:",
  "Strictures:": "Запреты:",
  "Lvl": "Ур.",
  "Permanent": "Постоянная",
  "Requires all remaining Psyche Bursts (min 1)": "Требует все оставшиеся всплески психики (мин. 1)",
  "Psyche Burst(s)": "всплеск(ов) психики",
  "Spend Psyche Burst": "Потратить всплеск психики",
  "View Full Bond": "Открыть полную узу",
  "No bonds assigned. Drag a Bond item here to add one.": "Узы не назначены. Перетащите предмет узы сюда, чтобы добавить.",
  "A sin mark is a physical manifestation of wild power overflow on your body, evidence of your partial transformation into a sin. You can find a list of sin marks, their effects, and their table, on pg. 86. A sin mark is a new, permanent part of your character. It grants new, beneficial power, and grants you new abilities.": "Метка греха - физическое проявление неконтролируемого переполнения силы на вашем теле, признак частичного превращения в грех. Метка греха становится новой постоянной частью персонажа, дает полезную силу и новые способности.",
  "Add a description of what your marks look like...": "Опишите, как выглядят ваши метки...",
  "Current Marks:": "Текущие метки:",
  "No items found": "Предметы не найдены",
  "No agendas found": "Повестки не найдены",
  "No blasphemies found": "Богохульства не найдены",
  "Requires": "Требует",
  "Remove": "Удалить",
  "Use": "Использовать",
  "Quirk — an optional alternate/additive passive from Games for Freaks": "Особенность - необязательная альтернативная/добавочная пассивная сила из Games for Freaks",
  "No more available Abilites": "Больше нет доступных способностей",
  "There are no more selectable powers.": "Больше нет доступных сил для выбора.",
  "None": "Нет",
  "Additional Dice:": "Дополнительные кубы:",
  "Hard Roll (only 6's count as success):": "Сложный бросок (успех только на 6):",
  "No Psyche Burst charges available!": "Нет доступных зарядов всплеска психики!",
  "-- Select a Power --": "-- Выберите силу --",
  "-- Select Common Use --": "-- Выберите обычное применение --",
  "No Cost Mode": "Режим без затрат",
  "1 Burst": "1 всплеск",
  "Multiple Bursts": "Несколько всплесков",
  "Add +1 advantage die to roll": "Добавить +1 куб преимущества к броску",
  "Produce faint light or aura": "Создать слабый свет или ауру",
  "Produce minor force at distance": "Создать слабое воздействие на расстоянии",
  "Make electrical lights flicker": "Заставить электрический свет мерцать",
  "Warm or cool body surface": "Нагреть или охладить поверхность тела",
  "Blast": "Всплеск силы",
  "Blasphemy Power:": "Сила богохульства:",
  "Common Psyche Uses:": "Обычное применение психики:",
  "Or Custom Use:": "Или свое применение:",
  "Number of Bursts to Use:": "Количество всплесков:",
  "Available Psyche Bursts:": "Доступные всплески психики:",
  "Psyche Burst Used": "Всплеск психики использован",
  "Use:": "Применение:",
  "Description:": "Описание:",
  "Please select a power, common use, or enter a custom use!": "Выберите силу, обычное применение или введите свое применение!",
  "This lets you create a new affliction. If your Admin has an existing one in mind, they should add it from the player overview section or by dragging it to you sheet.": "Здесь можно создать новое поражение. Если у ведущего уже есть готовое поражение, он может добавить его из обзора игроков или перетащить на ваш лист.",
  "This lets you create a new task. If you or your Admin has an existing one in mind, they should add by dragging it to you sheet.": "Здесь можно создать новую задачу. Если у вас или ведущего уже есть готовая задача, добавьте ее перетаскиванием на лист.",
  "Bold Task": "Выделенная задача",
  "Dice Modifier:": "Модификатор кубов:",
  "Add or subtract dice based on the following questions:": "Добавьте или уберите кубы по следующим вопросам:",
  "Affliction Roll": "Бросок поражения",
  "Affliction:": "Поражение:",
"Roll:": "Бросок:",
  "Stats & Advancements": "Характеристики и улучшения",
  "Bio & Bonds": "Биография и узы",
  "Kit and Items": "Снаряжение и предметы",
  "Sin": "Грех",
  "SIN": "ГРЕХ",
  "Psyche": "Психика",
  "Use Psyche Burst": "Потратить всплеск психики",
  "Available Abilities": "Доступные способности",
  "Available Abilities:": "Доступные способности:",
  "Available Powers": "Доступные силы",
  "Available Powers:": "Доступные силы:",
  "Other Powers": "Прочие силы",
  "Edit this character": "Редактировать этого персонажа",
  "Passives will auto-populate when you add a blasphemy.": "Пассивные силы появятся автоматически при добавлении богохульства.",
  "Did you survive": "Вы выжили",
  "Did you follow your first agenda item": "Вы следовали первому пункту своей повестки",
  "Did you follow at least one bolded agenda item": "Вы следовали хотя бы одному выделенному пункту повестки",
  "Did you follow two or more bolded agenda items": "Вы следовали двум или более выделенным пунктам повестки",
  "Did you take an injury or affliction": "Вы получили травму или поражение",
  "1 Max XP": "1 макс. опыт",
  "Bond Level": "Уровень узы",
  "Virtue": "Добродетель",
  "Current Marks": "Текущие метки",
  "Roll Psyche (d6)": "Бросок психики (d6)",
  "You can always use psyche for minor effects such as": "Психику всегда можно использовать для малых эффектов, например",
  "Type:": "Тип:",
  "Form:": "Форма:",
  "Category:": "Категория:",
  "Category": "Категория",
  "Quick Actions": "Быстрые действия",
  "Attack a Player": "Атаковать игрока",
  "Afflict a Player": "Наложить поражение на игрока",
  "Use Complication": "Использовать осложнение",
  "Use Threat": "Использовать угрозу",
  "Severe Attack": "Тяжёлая атака",
  "Use Domain": "Использовать домен",
  "No talismans are bound to this sin... go add some!": "К этому греху не привязаны талисманы... добавьте их.",
  "Palace / Pressure": "Дворец / давление",
  "Palace": "Дворец",
  "Pressure": "Давление",
  "Trauma Questions": "Вопросы травмы",
  "Biography & Appearance": "Биография и внешность",
  "Complications": "Осложнения",
  "Threats": "Угрозы",
  "Attack": "Атака",
  "Severe Ability Questions": "Вопросы тяжёлой способности",
  "Q:": "В:",
  "Add Question": "Добавить вопрос",
  "Roll Affliction": "Бросить поражение",
  "Send to Chat": "Отправить в чат",
  "Remove Domain": "Удалить домен",
  "No domain, drag one here!": "Нет домена, перетащите его сюда.",
  "Domains are separate items. If you don't see any domains, import them from the Domains compendium first, then drag them here.": "Домены являются отдельными предметами. Если вы не видите домены, сначала импортируйте их из справочника Domains, затем перетащите сюда.",
  "Deprecated Actor Type:": "Устаревший тип актора:",
  "\"NPC\" has been renamed to \"Sin\". This actor will continue to work, but please use \"Sin\" for new actors.": "\"NPC\" переименован в \"Грех\". Этот актор продолжит работать, но для новых акторов используйте тип \"Грех\".",
  "Ogre": "Огр",
  "Toad": "Жаба",
  "Idol": "Идол",
  "Lord": "Владыка",
  "Hound": "Гончая",
  "Centipede": "Сороконожка",
  "[REDACTED]": "[ЗАСЕКРЕЧЕНО]",
  "Form I/Severed": "Форма I / Отсечённый",
  "Form II/Fused": "Форма II / Слитый",
  "Form III/Bound": "Форма III / Связанный",
  "Opponent Name": "Имя противника",
  "Human": "Человек",
  "Drifter": "Скиталец",
  "Anomaly": "Аномалия",
  "Sin Variant": "Вариант греха",
  "Pseudo-Sin": "Псевдо-грех",
  "Binder": "Связующий",
  "Exorcist": "Экзорцист",
  "Mechanical": "Механический",
  "Subtype": "Подтип",
  "Range:": "Дистанция:",
  "Range": "Дистанция",
  "Melee": "Ближняя",
  "Short": "Короткая",
  "Long": "Дальняя",
  "Extreme": "Экстремальная",
  "ATTACK": "АТАКА",
  "REACT": "РЕАКЦИЯ",
  "AFFLICT": "ПОРАЗИТЬ",
  "Solo": "Одиночка",
  "Group": "Группа",
  "Horde": "Орда",
  "EXECUTION": "КАЗНЬ",
  "Combat": "Бой",
  "A brief description of this opponent...": "Краткое описание этого противника...",
  "Tendencies": "Склонности",
  "It tends to do this thing...": "Он склонен делать это...",
  "Conditional Effects": "Условные эффекты",
  "If you do this, someone gets advantage/disadvantage...": "Если вы делаете это, кто-то получает преимущество/помеху...",
  "Behavior": "Поведение",
  "How does this opponent act?": "Как ведёт себя этот противник?",
  "Appearance": "Внешность",
  "Physical description...": "Физическое описание...",
  "GM Notes": "Заметки ведущего",
  "Lore, plot hooks, secret weaknesses, or session-specific reminders...": "Лор, сюжетные зацепки, тайные слабости или напоминания для сессии...",
  "Stress Output": "Выходной стресс",
  "Dice Formula": "Формула кубов",
  "On Roll of 1": "При броске 1",
  "On Roll of 2-3": "При броске 2-3",
  "On Roll of 4+": "При броске 4+",
  "Bonus Effect": "Бонусный эффект",
  "+1 sin, worm hook, etc.": "+1 грех, зацепка червя и т.п.",
  "Roll Stress": "Бросить стресс",
  "Reactions": "Реакции",
  "Attacks With": "Атакует с помощью",
  "Batons, firearms, claws...": "Дубинки, огнестрел, когти...",
  "Stress Inflicted": "Наносимый стресс",
  "2 stress, 1d6 stress...": "2 стресса, 1d6 стресса...",
  "Creates Complication": "Создаёт осложнение",
  "Kills lights, triggers alarm...": "Гасит свет, запускает тревогу...",
  "Creates Threat": "Создаёт угрозу",
  "Fires weapon, pins target...": "Стреляет, прижимает цель...",
  "Die Roll Attached": "Привязанный бросок куба",
  "On 1-2: extra effect, On 5+: reduced damage...": "На 1-2: доп. эффект, на 5+: сниженный урон...",
  "Drag afflictions here from compendium": "Перетащите поражения сюда из справочника",
  "Capabilities": "Возможности",
  "Capability": "Возможность",
  "Add Capability": "Добавить возможность",
  "Special Abilities": "Особые способности",
  "Trigger": "Триггер",
  "Pressure Scaling": "Масштабирование давления",
  "Scales with Pressure": "Масштабируется давлением",
  "e.g., +CAT at 3+ pressure": "например, +CAT при давлении 3+",
  "Roll Attack": "Бросить атаку",
  "Roll Reaction": "Бросить реакцию",
  "Apply Affliction": "Применить поражение",
  "Source:": "Источник:",
  "Core p.XX, Games for Freaks p.XX": "Основная книга, стр. XX; Games for Freaks, стр. XX",
  "+ Add tag": "+ Добавить тег",
  "Description...": "Описание...",
  "Choose an Exorcist to Attack:": "Выберите экзорциста для атаки:",
  "Choose an Exorcist to Afflict:": "Выберите экзорциста для поражения:",
  "Choose an Exorcist:": "Выберите экзорциста:",
  "Choose a Complication:": "Выберите осложнение:",
  "Choose a Threat:": "Выберите угрозу:",
  "Select domain to use": "Выберите домен",
  "Select exorcist to afflict": "Выберите экзорциста для поражения",
  "No afflictions available to roll.": "Нет поражений для броска.",
  "No afflictions defined for this opponent.": "Для этого противника не заданы поражения.",
  "Affliction item not found. It may have been deleted.": "Предмет поражения не найден. Возможно, он был удалён.",
  "Only affliction items can be dropped here.": "Сюда можно перетаскивать только поражения.",
  "This affliction is already added.": "Это поражение уже добавлено.",
  "Unknown Affliction": "Неизвестное поражение",
  "Nothing selected to send.": "Ничего не выбрано для отправки.",
  "Unknown threat selected": "Выбрана неизвестная угроза.",
  "Domain removed.": "Домен удалён.",
  "Need to add a domain before using quick domain actions!": "Перед быстрыми действиями домена нужно добавить домен.",
  "… +3 dice maximum": "... максимум +3 куба",
  "â€¦ +3 dice maximum": "... максимум +3 куба"
};

const ATTRIBUTE_TRANSLATIONS = {
  "Name": "Название",
  "Bond Name": "Название узы",
  "Ability Name": "Название способности",
  "Describe what this ability does...": "Опишите, что делает эта способность...",
  "Paste Bond Ability UUID here": "Вставьте UUID способности узы",
  "Enter new stricture...": "Введите новый запрет...",
  "Paste Blasphemy Power UUID here": "Вставьте UUID силы богохульства",
  "Enter Ability UUID": "Введите UUID способности",
  "Search world items to add to sheet...": "Искать предметы мира для добавления на лист...",
  "Search world agendas to add to sheet...": "Искать повестки мира для добавления на лист...",
  "Search world blasphemies to add to sheet...": "Искать богохульства мира для добавления на лист...",
  "Add a description of what your marks look like...": "Опишите, как выглядят ваши метки...",
  "Question...": "Вопрос...",
  "Answer...": "Ответ...",
  "Notes about the hunt...": "Заметки об охоте...",
  "Describe your creative use of psyche...": "Опишите творческое применение психики...",
  "Task description...": "Описание задачи...",
  "Ability name...": "Название способности...",
  "Ability description (use {<CAT> type modifier} for CAT formatting)...": "Описание способности (используйте {<CAT> type modifier} для форматирования CAT)...",
  "Enter stricture (e.g., 'Never lie', 'Always help the innocent')...": "Введите запрет (например, «Никогда не лги», «Всегда помогай невинным»)...",
  "Right click to clear": "ПКМ: очистить",
  "Quirk - an optional alternate/additive passive from Games for Freaks": "Особенность - необязательная альтернативная/добавочная пассивная сила из Games for Freaks"
};

function isCain() {
  return game?.system?.id === SYSTEM_ID;
}

function isRussian() {
  return game?.i18n?.lang === "ru";
}

function getSetting(key, fallback) {
  try {
    const settingKey = `${MODULE_ID}.${key}`;
    if (!game.settings.settings.has(settingKey)) return fallback;
    return game.settings.get(MODULE_ID, key);
  } catch (_err) {
    return fallback;
  }
}

function shouldTranslateRuntime() {
  return isCain() && isRussian() && getSetting(SETTINGS.runtime, true);
}

function mergeTranslationsWithPriority(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
      mergeTranslationsWithPriority(target[key], value);
      continue;
    }
    target[key] = value;
  }
  return target;
}

async function applyOwnI18nPriority() {
  if (!isCain() || !isRussian()) return;

  try {
    const response = await fetch(LANGUAGE_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const translations = await response.json();
    game.i18n.translations ??= {};
    mergeTranslationsWithPriority(game.i18n.translations, translations);
  } catch (error) {
    console.warn("CAIN RU | Could not apply high-priority i18n overrides", error);
  }
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function translateDynamic(value) {
  const rollPsyche = value.match(/^Roll Psyche \((.+)\)$/);
  if (rollPsyche) return `Бросок психики (${rollPsyche[1]})`;

  const psycheCost = value.match(/^Requires (.+) Psyche Burst\(s\)$/);
  if (psycheCost) return `Требует ${psycheCost[1]} всплеск(ов) психики`;

  const currentMarks = value.match(/^Current Marks: (.+)$/);
  if (currentMarks) return `Текущие метки: ${currentMarks[1]}`;

  const addedToActor = value.match(/^Added (.+) to (.+)$/);
  if (addedToActor) return `Добавлено: ${addedToActor[1]} -> ${addedToActor[2]}`;

  const agendaSet = value.match(/^Set (.+) as current agenda with (.+) tasks$/);
  if (agendaSet) return `Текущая повестка: ${agendaSet[1]} (${agendaSet[2]} задач)`;

  const blasphemyAdded = value.match(/^Added (.+) with (.+) passive powers?$/);
  if (blasphemyAdded) return `Добавлено: ${blasphemyAdded[1]} (${blasphemyAdded[2]} пассивных сил)`;

  const alreadyAdded = value.match(/^(.+) is already added to this character$/);
  if (alreadyAdded) return `${alreadyAdded[1]} уже добавлено этому персонажу`;

  const notEnoughBursts = value.match(/^Not enough Psyche Bursts! You only have (.+)\.$/);
  if (notEnoughBursts) return `Недостаточно всплесков психики. Доступно только ${notEnoughBursts[1]}.`;

  const usedBurst = value.match(/^Used (.+) Psyche Bursts? for (.+)$/);
  if (usedBurst) return `Потрачено всплесков психики: ${usedBurst[1]} на ${usedBurst[2]}`;

  const rolledSinMark = value.match(/^Rolled Sin Mark: (.+) with ability: (.+)$/);
  if (rolledSinMark) return `Бросок метки греха: ${rolledSinMark[1]}, способность: ${rolledSinMark[2]}`;

  const rollingRest = value.match(/^Rolling Rest Dice: (.+)$/);
  if (rollingRest) return `Бросок кубов отдыха: ${rollingRest[1]}`;

  const diceResults = value.match(/^Dice Results: (.+)$/);
  if (diceResults) return `Результаты кубов: ${diceResults[1]}`;

  const skillRoll = value.match(/^(.+) Roll$/i);
  if (skillRoll) {
    const skill = SKILL_TRANSLATIONS[skillRoll[1].toLowerCase()];
    if (skill) return `Бросок: ${skill}`;
  }

  const dieRoll = value.match(/^Die: (.+)$/);
  if (dieRoll) return `Куб: ${dieRoll[1]}`;

  const actorReaction = value.match(/^(.+) - Reaction$/);
  if (actorReaction) return `${actorReaction[1]} - реакция`;

  const actorStressAttack = value.match(/^(.+) - Stress Attack$/);
  if (actorStressAttack) return `${actorStressAttack[1]} - стресс-атака`;

  const actorAffliction = value.match(/^(.+) - Affliction$/);
  if (actorAffliction) return `${actorAffliction[1]} - поражение`;

  const attacksTarget = value.match(/^(.+) attacks (.+)!$/);
  if (attacksTarget) return `${attacksTarget[1]} атакует ${attacksTarget[2]}!`;

  const afflictsTarget = value.match(/^(.+) afflicts (.+)!$/);
  if (afflictsTarget) return `${afflictsTarget[1]} накладывает поражение на ${afflictsTarget[2]}!`;

  const usesComplication = value.match(/^(.+) uses a Complication!$/);
  if (usesComplication) return `${usesComplication[1]} использует осложнение!`;

  const usesThreat = value.match(/^(.+) uses Threat: (.+)!$/);
  if (usesThreat) return `${usesThreat[1]} использует угрозу: ${translateText(usesThreat[2])}!`;

  const usesBondAbility = value.match(/^(.+) uses a Bond Ability$/);
  if (usesBondAbility) return `${usesBondAbility[1]} использует способность узы`;

  const activatesBondAbility = value.match(/^(.+) activates a Bond Ability!$/);
  if (activatesBondAbility) return `${activatesBondAbility[1]} активирует способность узы!`;

  const level = value.match(/^Level (\d)(?: - (.+))?$/);
  if (level) {
    const suffix = level[2] ? ` - ${translateText(level[2])}` : "";
    return `Уровень ${level[1]}${suffix}`;
  }

  const ability = value.match(/^Ability (\d)(.*)$/);
  if (ability) return `Способность ${ability[1]}${ability[2]}`;

  return null;
}

function translateText(value) {
  const normalized = normalizeText(value);
  if (!normalized) return value;
  return TEXT_TRANSLATIONS[normalized]
    ?? ATTRIBUTE_TRANSLATIONS[normalized]
    ?? translateDynamic(normalized)
    ?? value;
}

function replaceTextNode(node) {
  const original = node.nodeValue;
  const trimmed = normalizeText(original);
  if (!trimmed) return;

  const translated = translateText(trimmed);
  if (translated === trimmed || translated === original) return;

  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  node.nodeValue = `${leading}${translated}${trailing}`;
}

function shouldSkipElement(element) {
  if (!element?.closest) return false;
  return Boolean(element.closest("script, style, code, pre, kbd, samp, textarea, [contenteditable='true']"));
}

function translateAttributes(element) {
  if (!element?.getAttribute) return;
  for (const attr of ["placeholder", "title", "aria-label", "data-tooltip", "data-label", "alt"]) {
    const value = element.getAttribute(attr);
    if (!value) continue;
    const translated = translateText(value);
    if (translated !== value) element.setAttribute(attr, translated);
  }
}

function translateElement(root) {
  if (!shouldTranslateRuntime()) return;
  const element = normalizeElement(root);
  if (!element) return;

  if (element.nodeType === Node.TEXT_NODE) {
    if (!shouldSkipElement(element.parentElement)) replaceTextNode(element);
    return;
  }

  if (element.nodeType !== Node.ELEMENT_NODE) return;
  if (shouldSkipElement(element)) return;

  translateAttributes(element);
  element.querySelectorAll?.("*").forEach((child) => {
    if (!shouldSkipElement(child)) translateAttributes(child);
  });

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkipElement(node.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(replaceTextNode);
}

function normalizeElement(html) {
  if (!html) return null;
  if (html instanceof Node) return html;
  if (typeof jQuery !== "undefined" && html instanceof jQuery) return html[0] ?? null;
  if (Array.isArray(html)) return html.find((node) => node instanceof Node) ?? null;
  if (html[0] instanceof Node) return html[0];
  return null;
}

function observeRuntimeText() {
  if (!shouldTranslateRuntime()) return;
  translateElement(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) translateElement(node);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function normalizeLookup(value) {
  return String(value ?? "").trim().toLowerCase();
}

function addLookupRecord(map, key, record) {
  if (!key) return;
  const records = map.get(key) ?? [];
  records.push(record);
  map.set(key, records);
}

function setByPath(target, path, value) {
  const parts = String(path).split(".");
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    current[part] ??= {};
    current = current[part];
  }
  current[parts.at(-1)] = cloneValue(value);
}

function getByPath(source, path) {
  return String(path).split(".").reduce((value, part) => value?.[part], source);
}

function addSearchTerm(terms, value) {
  if (Array.isArray(value)) {
    for (const item of value) addSearchTerm(terms, item);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) addSearchTerm(terms, item);
    return;
  }
  if (value === undefined || value === null) return;
  const term = normalizeLookup(value);
  if (term) terms.add(term);
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function hasKeys(value) {
  return value && typeof value === "object" && Object.keys(value).length > 0;
}

async function loadTranslationIndex() {
  if (translationState.loaded) return translationState;
  if (translationState.loadPromise) return translationState.loadPromise;

  translationState.loadPromise = (async () => {
    for (const fileName of TRANSLATION_PACK_FILES) {
      const response = await fetch(`modules/${MODULE_ID}/compendium/cain/${fileName}`);
      if (!response.ok) {
        console.warn(`CAIN RU | Could not load translation file ${fileName}`);
        continue;
      }

      const packName = fileName.replace(/^cain\./, "").replace(/\.json$/, "");
      const data = await response.json();
      const mapping = data.mapping ?? {};
      const packMap = new Map();

      for (const [originalName, entry] of Object.entries(data.entries ?? {})) {
        if (!entry || typeof entry !== "object") continue;
        const record = { packName, originalName, mapping, entry };
        const originalKey = normalizeLookup(originalName);
        if (originalKey) {
          packMap.set(originalKey, record);
          addLookupRecord(translationState.byOriginalName, originalKey, record);
        }

        for (const [entryKey, value] of Object.entries(entry)) {
          if (!TRANSLATED_LOOKUP_ENTRY_KEYS.has(entryKey)) continue;
          if (typeof value !== "string") continue;
          const translatedKey = normalizeLookup(value);
          addLookupRecord(translationState.byTranslatedName, translatedKey, record);
        }
      }

      translationState.byPackName.set(packName, packMap);
    }

    translationState.loaded = true;
    return translationState;
  })();

  return translationState.loadPromise;
}

function scoreTranslationRecord(source, record) {
  let score = 0;
  const sourceName = normalizeLookup(source.name);
  if (sourceName && sourceName === normalizeLookup(record.originalName)) score += 30;
  if (sourceName && sourceName === normalizeLookup(record.entry.name)) score += 20;

  const hints = ITEM_TYPE_TRANSLATION_HINTS[source.type] ?? [];
  for (const hint of hints) {
    if (Object.prototype.hasOwnProperty.call(record.entry, hint)) score += 8;
    if (Object.prototype.hasOwnProperty.call(record.mapping, hint)) score += 2;
  }

  for (const field of ITEM_LOOKUP_FIELDS) {
    const value = getByPath(source, field);
    if (!value) continue;
    const entryKey = field.split(".").at(-1);
    if (Object.prototype.hasOwnProperty.call(record.entry, entryKey)) score += 3;
  }

  return score;
}

function chooseTranslationRecord(source, records) {
  if (!records?.length) return null;
  return records
    .map((record) => ({ record, score: scoreTranslationRecord(source, record) }))
    .sort((a, b) => b.score - a.score)[0]?.record ?? null;
}

function getTranslationRecordForData(source) {
  if (!translationState.loaded || !source) return null;
  for (const field of ITEM_LOOKUP_FIELDS) {
    const value = getByPath(source, field);
    const key = normalizeLookup(value);
    if (!key) continue;
    const records = [
      ...(translationState.byOriginalName.get(key) ?? []),
      ...(translationState.byTranslatedName.get(key) ?? [])
    ];
    const record = chooseTranslationRecord(source, records);
    if (record) return record;
  }
  return null;
}

function buildTranslationPatch(source) {
  const record = getTranslationRecordForData(source);
  if (!record) return null;

  const patch = {};
  setByPath(patch, `flags.${MODULE_ID}.search`, buildBilingualSearchData(source, record));
  for (const [entryKey, targetPath] of Object.entries(record.mapping)) {
    if (!Object.prototype.hasOwnProperty.call(record.entry, entryKey)) continue;
    setByPath(patch, targetPath, record.entry[entryKey]);
  }
  return hasKeys(patch) ? patch : null;
}

function buildBilingualSearchData(source, record) {
  const terms = new Set();
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.terms);
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.originalName);
  addSearchTerm(terms, record.originalName);

  for (const field of BILINGUAL_SEARCH_FIELDS) addSearchTerm(terms, getByPath(source, field));
  for (const key of TRANSLATED_LOOKUP_ENTRY_KEYS) addSearchTerm(terms, record.entry?.[key]);
  for (const key of ["itemType", "keywords", "blasphemyType"]) addSearchTerm(terms, record.entry?.[key]);

  return {
    originalName: record.originalName,
    terms: Array.from(terms)
  };
}

function applyTranslationToDocument(document) {
  if (!document?.toObject || !document?.updateSource || document.documentName !== "Item") return false;
  const patch = buildTranslationPatch(document.toObject());
  if (!patch) return false;

  try {
    document.updateSource(patch);
    return true;
  } catch (error) {
    console.warn(`CAIN RU | Could not apply runtime translation to ${document.name}`, error);
    return false;
  }
}

function applyRuntimeItemTranslations() {
  if (!translationState.loaded) return;

  for (const item of game.items ?? []) applyTranslationToDocument(item);
  for (const actor of game.actors ?? []) {
    for (const item of actor.items ?? []) applyTranslationToDocument(item);
  }
}

function applyRuntimeActorTranslations(actor) {
  if (!translationState.loaded || !actor?.items) return;
  for (const item of actor.items) applyTranslationToDocument(item);
}

function getSearchTermsForData(source) {
  const terms = new Set();
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.terms);
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.originalName);
  for (const field of BILINGUAL_SEARCH_FIELDS) addSearchTerm(terms, getByPath(source, field));

  const record = getTranslationRecordForData(source);
  if (record) {
    addSearchTerm(terms, record.originalName);
    for (const key of TRANSLATED_LOOKUP_ENTRY_KEYS) addSearchTerm(terms, record.entry?.[key]);
    for (const key of ["itemType", "keywords", "blasphemyType"]) addSearchTerm(terms, record.entry?.[key]);
  }

  return Array.from(terms);
}

function getSearchTermsForDocument(document) {
  const source = document?.toObject ? document.toObject() : document;
  return getSearchTermsForData(source);
}

function matchesBilingualSearch(document, query) {
  const normalizedQuery = normalizeLookup(query);
  if (!normalizedQuery) return true;
  return getSearchTermsForDocument(document).some((term) => term.includes(normalizedQuery));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCainPackName(pack) {
  return pack?.metadata?.name ?? pack?.collection?.split(".").at(-1);
}

function resolveCompendiumPack(packLike) {
  if (!packLike) return null;
  if (typeof packLike === "string") return game.packs?.get(packLike) ?? null;
  if (packLike.getIndex && packLike.collection) return packLike;
  if (typeof packLike.collection === "string") return game.packs?.get(packLike.collection) ?? null;
  if (packLike.collection?.getIndex) return packLike.collection;
  if (packLike.pack?.getIndex) return packLike.pack;
  return null;
}

function isCainPack(pack) {
  return pack?.collection?.startsWith(`${SYSTEM_ID}.`) || pack?.metadata?.packageName === SYSTEM_ID || pack?.metadata?.package === SYSTEM_ID;
}

async function patchCainCompendiumIndex(pack) {
  pack = resolveCompendiumPack(pack);
  if (!translationState.loaded || !isCainPack(pack)) return;

  const packName = getCainPackName(pack);
  const packMap = translationState.byPackName.get(packName);
  if (!packMap) return;

  let index;
  try {
    index = await pack.getIndex({ fields: Array.from(new Set(["name", "type", "img", ...BILINGUAL_SEARCH_FIELDS])) });
  } catch (error) {
    try {
      index = await pack.getIndex();
    } catch (fallbackError) {
      console.warn(`CAIN RU | Could not read compendium index ${pack.collection}`, fallbackError);
      return;
    }
  }

  for (const entry of index) {
    const originalName = entry.flags?.[MODULE_ID]?.originalName ?? entry.name;
    const record = packMap.get(normalizeLookup(originalName))
      ?? chooseTranslationRecord({ name: originalName }, translationState.byOriginalName.get(normalizeLookup(originalName)) ?? []);
    if (!record?.entry?.name) continue;

    entry.flags ??= {};
    entry.flags[MODULE_ID] ??= {};
    entry.flags[MODULE_ID].originalName ??= originalName;
    entry.flags[MODULE_ID].search = buildBilingualSearchData(entry, record);
    entry.name = record.entry.name;
  }
}

async function patchCainCompendiumIndexes() {
  if (!translationState.loaded) return;
  const packs = Array.from(game.packs ?? []).filter(isCainPack);
  await Promise.all(packs.map((pack) => patchCainCompendiumIndex(pack)));
}

function getJQueryRoot(html) {
  if (typeof jQuery === "undefined") return null;
  if (html instanceof jQuery) return html;
  const element = normalizeElement(html);
  return element ? jQuery(element) : null;
}

function setupBilingualActorSearch(html, actor, config) {
  const root = getJQueryRoot(html);
  if (!root?.length || !actor) return;

  const searchInput = root.find(config.inputSelector);
  const searchResults = root.find(config.resultsSelector);
  if (!searchInput.length || !searchResults.length) return;

  let searchTimeout;
  searchInput.off("input");
  searchInput.on("input.cainRuSearch", (event) => {
    clearTimeout(searchTimeout);
    const query = event.target.value.trim();

    if (query.length < 2) {
      searchResults.removeClass("active").empty();
      return;
    }

    searchTimeout = setTimeout(() => {
      const items = game.items.filter((item) => (
        item.type === config.type
        && matchesBilingualSearch(item, query)
        && (!config.exclude || !config.exclude(item, actor))
      ));

      if (!items.length) {
        searchResults.html(config.emptyHtml);
        searchResults.addClass("active");
        translateElement(searchResults);
        return;
      }

      searchResults.html(items.slice(0, 10).map(config.render).join("")).addClass("active");
      translateElement(searchResults);
    }, 150);
  });
}

function installBilingualActorSearch(app, html) {
  if (!translationState.loaded || app?.actor?.type !== "character") return;

  setupBilingualActorSearch(html, app.actor, {
    inputSelector: ".item-search-input",
    resultsSelector: ".item-search-results",
    type: "item",
    emptyHtml: '<div class="item-search-no-results">Предметы не найдены</div>',
    exclude: (item, actor) => actor.items.has(item.id),
    render: (item) => `
      <div class="item-search-result" data-item-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" />
        <div class="item-search-result-info">
          <div class="item-search-result-name">${escapeHtml(item.name)}</div>
          <div class="item-search-result-type">${escapeHtml(item.system?.type || "Предмет")}</div>
        </div>
      </div>
    `
  });

  setupBilingualActorSearch(html, app.actor, {
    inputSelector: ".agenda-search-input",
    resultsSelector: ".agenda-search-results",
    type: "agenda",
    emptyHtml: '<div class="agenda-search-no-results">Повестки не найдены</div>',
    render: (item) => `
      <div class="agenda-search-result" data-item-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" />
        <div class="agenda-search-result-info">
          <div class="agenda-search-result-name">${escapeHtml(item.name)}</div>
          <div class="agenda-search-result-desc">${escapeHtml(item.system?.agendaName || "")}</div>
        </div>
      </div>
    `
  });

  setupBilingualActorSearch(html, app.actor, {
    inputSelector: ".blasphemy-search-input",
    resultsSelector: ".blasphemy-search-results",
    type: "blasphemy",
    emptyHtml: '<div class="blasphemy-search-no-results">Богохульства не найдены</div>',
    exclude: (item, actor) => actor.system.currentBlasphemies?.includes(item.id),
    render: (item) => `
      <div class="blasphemy-search-result" data-item-id="${escapeHtml(item.id)}">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" />
        <div class="blasphemy-search-result-info">
          <div class="blasphemy-search-result-name">${escapeHtml(item.name)}</div>
          <div class="blasphemy-search-result-desc">${escapeHtml(item.system?.blasphemyName || "")}</div>
        </div>
      </div>
    `
  });
}

function getPackIndexEntries(pack) {
  if (!pack?.index) return [];
  return Array.from(pack.index.values ? pack.index.values() : pack.index);
}

function getCompendiumRowId(row) {
  const dataset = row?.dataset ?? {};
  if (dataset.documentId) return dataset.documentId;
  if (dataset.entryId) return dataset.entryId;
  if (dataset.id) return dataset.id;
  const uuid = dataset.uuid ?? row?.querySelector?.("[data-uuid]")?.dataset?.uuid;
  if (uuid) return String(uuid).split(".").at(-1);
  return row?.querySelector?.("[data-document-id]")?.dataset?.documentId
    ?? row?.querySelector?.("[data-entry-id]")?.dataset?.entryId
    ?? null;
}

function setCompendiumRowVisible(row, visible) {
  row.hidden = false;
  row.classList.remove("hidden");
  row.style.display = visible ? "" : "none";

  if (!visible) return;
  let folder = row.parentElement?.closest?.(".folder");
  while (folder) {
    folder.hidden = false;
    folder.classList.remove("hidden");
    folder.style.display = "";
    folder = folder.parentElement?.closest?.(".folder");
  }
}

function applyBilingualCompendiumFilter(root, pack, query) {
  const normalizedQuery = normalizeLookup(query);
  if (!root || !pack) return;

  const entries = new Map(getPackIndexEntries(pack).map((entry) => [entry._id, entry]));
  const rows = root.querySelectorAll("[data-document-id], [data-entry-id], .directory-item, .compendium-item");

  for (const row of rows) {
    const id = getCompendiumRowId(row);
    const entry = id ? entries.get(id) : null;
    if (!entry && row.classList.contains("folder")) continue;
    if (!entry && !row.textContent?.trim()) continue;

    const terms = entry ? getSearchTermsForData(entry) : [normalizeLookup(row.textContent)];
    const visible = !normalizedQuery || terms.some((term) => term.includes(normalizedQuery));
    setCompendiumRowVisible(row, visible);
  }
}

function installBilingualCompendiumSearch(app, html) {
  if (!translationState.loaded) return;
  const pack = resolveCompendiumPack(app.collection ?? app.document ?? app.pack);
  if (!isCainPack(pack)) return;

  const root = normalizeElement(html) ?? normalizeElement(app.element);
  const jqRoot = getJQueryRoot(root);
  if (!root || !jqRoot?.length) return;

  const searchInput = jqRoot.find("input[type='search'], input[name='search'], .directory-search input, .search input").first();
  if (!searchInput.length) return;

  const apply = () => {
    const query = searchInput.val() ?? "";
    applyBilingualCompendiumFilter(root, pack, query);
  };

  searchInput.off(".cainRuCompendiumSearch");
  searchInput.on("input.cainRuCompendiumSearch keyup.cainRuCompendiumSearch search.cainRuCompendiumSearch", () => {
    setTimeout(apply, 0);
    setTimeout(apply, 80);
    setTimeout(apply, 250);
  });

  apply();
}

function installItemTranslationHooks() {
  if (itemTranslationHooksInstalled) return;
  itemTranslationHooksInstalled = true;

  Hooks.on("preCreateItem", (document) => {
    if (!isCain() || !getSetting(SETTINGS.compendia, true) || !translationState.loaded) return;
    if (document.parent?.documentName === "Actor") applyTranslationToDocument(document);
  });

  Hooks.on("createItem", (document) => {
    if (!isCain() || !getSetting(SETTINGS.compendia, true) || !translationState.loaded) return;
    applyTranslationToDocument(document);
  });

  Hooks.on("renderActorSheet", (app, html) => {
    if (!isCain() || !getSetting(SETTINGS.compendia, true)) return;
    applyRuntimeActorTranslations(app.actor);
    installBilingualActorSearch(app, html);
  });

  Hooks.on("renderItemSheet", (app) => {
    if (!isCain() || !getSetting(SETTINGS.compendia, true)) return;
    applyTranslationToDocument(app.item);
  });

  Hooks.on("renderCompendium", async (app, html) => {
    if (!isCain() || !getSetting(SETTINGS.compendia, true)) return;
    const packLike = app.collection ?? app.document ?? app.pack;
    await patchCainCompendiumIndex(packLike);
    installBilingualCompendiumSearch(app, html);
  });
}

function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.runtime, {
    name: "Переводить статический интерфейс CAIN",
    hint: "Переводит английские подписи, которые в системе CAIN прописаны прямо в шаблонах и диалогах.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: () => window.location.reload()
  });

  game.settings.register(MODULE_ID, SETTINGS.compendia, {
    name: "Переводить библиотеки CAIN",
    hint: "Подключает переводы compendium packs через Babele. Требуется активный модуль Babele.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: () => window.location.reload()
  });

  game.settings.register(MODULE_ID, SETTINGS.showOriginalNames, {
    name: "Показывать оригинальные названия библиотек",
    hint: "Включает настройку Babele showOriginalName, если Babele активен.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: () => window.location.reload()
  });
}

Hooks.once("init", () => {
  if (!isCain()) return;
  registerSettings();
  void applyOwnI18nPriority();
});

Hooks.once("babele.init", (babele) => {
  if (!isCain() || !getSetting(SETTINGS.compendia, true)) return;
  babele.register({
    module: MODULE_ID,
    lang: "ru",
    dir: "compendium/cain"
  });
});

Hooks.once("ready", async () => {
  if (!isCain()) return;

  await applyOwnI18nPriority();

  if (getSetting(SETTINGS.compendia, true) && getSetting(SETTINGS.showOriginalNames, true) && game.modules.get("babele")?.active) {
    try {
      await game.settings.set("babele", "showOriginalName", true);
    } catch (_err) {
      // Babele may not expose the setting on every version.
    }
  }

  if (getSetting(SETTINGS.compendia, true) && !game.modules.get("babele")?.active) {
    ui.notifications?.info("CAIN RU: для перевода библиотек активируйте модуль Babele.");
  }

  if (getSetting(SETTINGS.compendia, true)) {
    try {
      await loadTranslationIndex();
      applyRuntimeItemTranslations();
      installItemTranslationHooks();
      await patchCainCompendiumIndexes();
    } catch (error) {
      console.warn("CAIN RU | Could not initialize runtime item translations", error);
    }
  }

  observeRuntimeText();
});

for (const hook of [
  "renderApplication",
  "renderActorSheet",
  "renderItemSheet",
  "renderDialog",
  "renderChatMessage",
  "renderChatMessageHTML",
  "renderCompendium",
  "renderSidebarTab"
]) {
  Hooks.on(hook, (_app, html) => translateElement(html));
}
