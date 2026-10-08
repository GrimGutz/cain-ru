import { UI_TRANSLATIONS, translateUiPattern } from "./ui-translations.mjs";

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
  "cain.virtues.json",
  "cain.tables.json",
  "cain.lore.json",
  "cain.opponents.json"
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
  byPackName: new Map(),
  folders: new Map()
};

let originalData = { packs: {}, sins: {} };

const DOMAIN_NAME_ALIASES = {
  "Keeper of the Ludic Menagerie": "The Keeper of the Ludic Menagerie",
  "The Fattening of Rage": "The Fatttening of Rate"
};

let itemTranslationHooksInstalled = false;

const SKILL_TRANSLATIONS = {
  force: "Сила",
  conditioning: "Атлетика",
  coordination: "Координация",
  covert: "Скрытность",
  interfacing: "Техника",
  investigation: "Расследование",
  surveillance: "Наблюдение",
  negotiation: "Переговоры",
  authority: "Авторитет",
  connection: "Связи",
  psyche: "Псионика"
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
  "Skills & Agendas": "Навыки и подходы",
  "XP & Advancements": "Опыт и улучшения",
  "Talismans": "Талисманы",
  "Survival": "Выживание",
  "Did you survive?": "Вы выжили?",
  "Up to 1 from first agenda": "До 1 опыта за первый пункт подхода",
  "You don't seem to have a primary agenda - consider adding one...": "У вас нет основного подхода - стоит добавить его...",
  "Up to 2 from bold agendas": "До 2 опыта за выделенные пункты подхода",
  "Injuries/Afflictions": "Травмы/недуги",
  "Did you take an injury or affliction?": "Вы получили травму или недуг?",
  "Tasks": "Задачи",
  "Abilities": "Способности",
  "Select Item:": "Выберите предмет:",
  "Add Task to Agenda": "Добавить задачу в подход",
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
  "Agenda": "Подход",
  "Blasphemy": "Богохульство",
  "Bond": "Уза",
  "Bond Abilities": "Способности узы",
  "Afflictions": "Недуги",
  "Items": "Предметы",
  "Sin Marks": "Метки греха",
  "Import/Export": "Импорт/экспорт",
  "History": "История",
  "Settings": "Настройки",
  "Create Agenda": "Создать подход",
  "Agenda Name": "Название подхода",
  "Agenda Tasks": "Задачи подхода",
  "Add Task": "Добавить задачу",
  "Agenda Abilities": "Способности подхода",
  "Add Ability": "Добавить способность",
  "CAT Formatting Help": "Справка по форматированию CAT",
  "Syntax:": "Синтаксис:",
  "Valid types:": "Допустимые типы:",
  "Modifier:": "Модификатор:",
  "Operations (optional):": "Операции (необязательно):",
  "Examples:": "Примеры:",
  "Create Blasphemy": "Создать богохульство",
  "Add Power": "Добавить силу",
  "Psyche Burst:": "Психический всплеск:",
  "Uses": "Использует",
  "No-Cost Mode": "Режим без затрат",
  "Multiple": "Несколько",
  "Create Standalone Power": "Создать отдельную силу",
  "Power Name": "Название силы",
  "Is Passive Power": "Пассивная сила",
  "Psyche Burst Options": "Параметры психического всплеска",
  "Uses Psyche Burst": "Тратит психический всплеск",
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
  "Psyche Burst Requirements": "Требования психического всплеска",
  "Requires Psyche Burst": "Требует психический всплеск",
  "Psyche Burst Cost": "Цена в психических всплесках",
  "Set to 0 for \"all remaining Psyche Bursts (minimum 1)\"": "Поставьте 0 для «все оставшиеся психические всплески (минимум 1)».",
  "Create Bond Ability": "Создать способность узы",
  "Create Affliction": "Создать недуг",
  "Affliction Name": "Название недуга",
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
  "Did you follow your first agenda item?": "Вы следовали первому пункту своего подхода?",
  "Did you follow at least one bolded agenda item?": "Вы следовали хотя бы одному выделенному пункту подхода?",
  "Did you follow two or more bolded agenda items?": "Вы следовали двум или более выделенным пунктам подхода?",
  "Did you take an injury or affliction?": "Вы получили травму или недуг?",
  "ACTION ASSESSMENT METRIC": "МЕТРИКА ОЦЕНКИ ДЕЙСТВИЯ",
  "SUCCESS": "УСПЕХ",
  "Admin rolls the risk die": "Админ бросает куб риска",
  "Successes on a 6": "Успехи только на 6",
  "Teamwork (Combine highest bonuses)": "Командная работа (объедините лучшие бонусы)",
  "Setup yourself or another: (+1D, -risk, or -hard)": "Подготовить себя или другого: (+1D, -риск или -сложность)",
  "Spend 1 psyche burst to use your powers (+1D)": "Потратьте 1 психический всплеск, чтобы использовать силы (+1D)",
  "Use your abilities": "Используйте способности",
  "Bargain with the Admin (Gain a hook or tradeoff)": "Торгуйтесь с Админом (получите зацепку или компромисс)",
  "Sin Overflow": "Переполнение греха",
  "Roll Sin Marks": "Бросить метки греха",
  "Clear Sin Marks": "Очистить метки греха",
  "EVOLVE": "ЭВОЛЮЦИЯ",
  "Psyche Burst Charges": "Заряды психического всплеска",
  "No Psyche Burst Data": "Нет данных психического всплеска",
  "Using any blasphemy power requires a psyche burst. Some can spend multiple for extra benefit.": "Любая сила богохульства требует психический всплеск. Некоторые силы могут тратить несколько всплесков ради дополнительного эффекта.",
  "You always start a mission with three psyche bursts.": "Вы всегда начинаете миссию с тремя психическими всплесками.",
  "Drag or search for agenda to add to your sheet.": "Перетащите или найдите подход, чтобы добавить его на лист.",
  "Click \"Add Task\" button below to add custom tasks, or tasks will auto-populate when you add an agenda.": "Нажмите «Добавить задачу», чтобы добавить свою задачу; задачи также заполнятся автоматически при добавлении подхода.",
  "Select abilities from the dropdown below, or they will auto-populate when you add an agenda.": "Выберите способности в списке ниже; они также заполнятся автоматически при добавлении подхода.",
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
  "Afflict a Player": "Наложить недуг на игрока",
  "Use Complication": "Использовать осложнение",
  "Use Threat": "Использовать угрозу",
  "Severe Attack": "Сильная атака",
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
  "Severe Ability Questions": "Вопросы сильной атаки",
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
  "AFFLICT": "НЕДУГ",
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
  "Attacks With": "Атаки с помощью",
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
  "Add Affliction": "Добавить недуг",
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
  "Psyche Roll": "Бросок Псионики",
  "Psyche": "Псионика",
  "Use Psyche Burst": "Использовать психический всплеск",
  "Use Burst": "Использовать всплеск",
  "Print Questions": "Вывести вопросы",
  "Severe Attack Roll": "Бросок сильной атаки",
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
  "Afflict the exorcists": "Наложить недуг на экзорцистов",
  "Start/progress a ticking clock": "Начать или продвинуть таймер",
  "Use a domain": "Использовать домен",
  "Threaten or twist an NPC": "Угрожать НПЦ или исказить его",
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
  "Agendas": "Подходы",
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
  "Roll Psyche": "Бросок Псионики",
  "Roll Psyche (N/A)": "Бросок Псионики (н/д)",
  "Roll your psyche dice": "Бросить кубы психики",
  "You can always spend a psyche burst to add +1 advantage die to any roll (yours or an ally’s) by using your blasphemies in a creative way.": "Вы всегда можете потратить психический всплеск, чтобы добавить +1 куб преимущества к любому броску своему или союзника, творчески используя свои богохульства.",
  "You can recover them by resting during a hunt (see pg. 38) or through the uses of abilities.": "Вы можете восстановить их отдыхом во время охоты или применением способностей.",
  "You can always use psyche for minor effects such as:": "Психику всегда можно использовать для малых эффектов, например:",
  "producing a faint light or aura around something or someone": "создать слабый свет или ауру вокруг предмета или существа",
  "producing minor force at a distance (like a gust of wind)": "создать слабое воздействие на расстоянии, например порыв ветра",
  "making electrical lights or appliances flicker": "заставить электрические лампы или приборы мерцать",
  "warm or cool the surface of your body": "нагреть или охладить поверхность своего тела",
  "Drag new agenda here to swap": "Перетащите новый подход сюда, чтобы заменить текущий",
  "Search world agendas to add to sheet...": "Искать подходы мира для добавления на лист...",
  "Search world blasphemies to add to sheet...": "Искать богохульства мира для добавления на лист...",
  "Search world items to add to sheet...": "Искать предметы мира для добавления на лист...",
  "Agenda Image": "Изображение подхода",
  "Blasphemy Image": "Изображение богохульства",
  "Passive": "Пассивная сила",
  "Passives": "Пассивные силы",
  "Select powers from the dropdown below to add them to your blasphemy.": "Выберите силы из списка ниже, чтобы добавить их к богохульству.",
  "Add More Powers (Click to expand)": "Добавить больше сил (нажмите, чтобы раскрыть)",
  "Keywords": "Ключевые слова",
  "Toggle Animation": "Переключить анимацию",
  "Edit this character's copy": "Редактировать копию этого персонажа",
  "Has no-psyche mode": "Есть режим без психики",
  "Uses psyche burst": "Тратит психический всплеск",
  "Can use multiple bursts": "Можно тратить несколько всплесков",
  "No Psyche": "Без психики",
  "Uses Psyche": "Тратит психику",
  "Plus Psyche": "Доп. псионика",
  "Pick a virtue to bond with at the start of a mission. Surviving missions increases your bond level (max 3). Bond benefits are permanent even when not actively bonding.": "Выберите добродетель для узы в начале миссии. Пережитые миссии повышают уровень узы (макс. 3). Преимущества узы постоянны, даже когда вы не поддерживаете ее активно.",
  "Virtue:": "Добродетель:",
  "Bond Level:": "Уровень узы:",
  "Strictures:": "Запреты:",
  "Lvl": "Ур.",
  "Permanent": "Постоянная",
  "Requires all remaining Psyche Bursts (min 1)": "Требует все оставшиеся психические всплески (мин. 1)",
  "Psyche Burst(s)": "психический всплеск",
  "Spend Psyche Burst": "Потратить психический всплеск",
  "View Full Bond": "Открыть полную узу",
  "No bonds assigned. Drag a Bond item here to add one.": "Узы не назначены. Перетащите предмет узы сюда, чтобы добавить.",
  "A sin mark is a physical manifestation of wild power overflow on your body, evidence of your partial transformation into a sin. You can find a list of sin marks, their effects, and their table, on pg. 86. A sin mark is a new, permanent part of your character. It grants new, beneficial power, and grants you new abilities.": "Метка греха - физическое проявление неконтролируемого переполнения силы на вашем теле, признак частичного превращения в грех. Метка греха становится новой постоянной частью персонажа, дает полезную силу и новые способности.",
  "Add a description of what your marks look like...": "Опишите, как выглядят ваши метки...",
  "Current Marks:": "Текущие метки:",
  "No items found": "Предметы не найдены",
  "No agendas found": "Подходы не найдены",
  "No blasphemies found": "Богохульства не найдены",
  "Requires": "Требует",
  "Remove": "Удалить",
  "Use": "Использовать",
  "Quirk — an optional alternate/additive passive from Games for Freaks": "Особенность - альтернативная или дополнительная пассивная сила из «Игр для уродов»",
  "No more available Abilites": "Больше нет доступных способностей",
  "There are no more selectable powers.": "Больше нет доступных сил для выбора.",
  "None": "Нет",
  "Additional Dice:": "Дополнительные кубы:",
  "Hard Roll (only 6's count as success):": "Сложный бросок (успех только на 6):",
  "No Psyche Burst charges available!": "Нет доступных зарядов психического всплеска!",
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
  "Available Psyche Bursts:": "Доступные психические всплески:",
  "Psyche Burst Used": "Психический всплеск использован",
  "Use:": "Применение:",
  "Description:": "Описание:",
  "Please select a power, common use, or enter a custom use!": "Выберите силу, обычное применение или введите свое применение!",
  "This lets you create a new affliction. If your Admin has an existing one in mind, they should add it from the player overview section or by dragging it to you sheet.": "Здесь можно создать новый недуг. Если у ведущего уже есть готовый недуг, он может добавить его из обзора игроков или перетащить на ваш лист.",
  "This lets you create a new task. If you or your Admin has an existing one in mind, they should add by dragging it to you sheet.": "Здесь можно создать новую задачу. Если у вас или ведущего уже есть готовая задача, добавьте ее перетаскиванием на лист.",
  "Bold Task": "Выделенная задача",
  "Dice Modifier:": "Модификатор кубов:",
  "Add or subtract dice based on the following questions:": "Добавьте или уберите кубы по следующим вопросам:",
  "Affliction Roll": "Бросок недуга",
  "Affliction:": "Недуг:",
"Roll:": "Бросок:",
  "Stats & Advancements": "Характеристики и улучшения",
  "Bio & Bonds": "Биография и узы",
  "Kit and Items": "Снаряжение и предметы",
  "Sin": "Грех",
  "SIN": "ГРЕХ",
  "Psyche": "Псионика",
  "Use Psyche Burst": "Потратить психический всплеск",
  "Available Abilities": "Доступные способности",
  "Available Abilities:": "Доступные способности:",
  "Available Powers": "Доступные силы",
  "Available Powers:": "Доступные силы:",
  "Other Powers": "Прочие силы",
  "Edit this character": "Редактировать этого персонажа",
  "Passives will auto-populate when you add a blasphemy.": "Пассивные силы появятся автоматически при добавлении богохульства.",
  "Did you survive": "Вы выжили",
  "Did you follow your first agenda item": "Вы следовали первому пункту своего подхода",
  "Did you follow at least one bolded agenda item": "Вы следовали хотя бы одному выделенному пункту подхода",
  "Did you follow two or more bolded agenda items": "Вы следовали двум или более выделенным пунктам подхода",
  "Did you take an injury or affliction": "Вы получили травму или недуг",
  "1 Max XP": "1 макс. опыт",
  "Bond Level": "Уровень узы",
  "Virtue": "Добродетель",
  "Current Marks": "Текущие метки",
  "Roll Psyche (d6)": "Бросок Псионики (d6)",
  "You can always use psyche for minor effects such as": "Психику всегда можно использовать для малых эффектов, например",
  "Type:": "Тип:",
  "Form:": "Форма:",
  "Category:": "Категория:",
  "Category": "Категория",
  "Quick Actions": "Быстрые действия",
  "Attack a Player": "Атаковать игрока",
  "Afflict a Player": "Наложить недуг на игрока",
  "Use Complication": "Использовать осложнение",
  "Use Threat": "Использовать угрозу",
  "Severe Attack": "Сильная атака",
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
  "Severe Ability Questions": "Вопросы сильной атаки",
  "Q:": "В:",
  "Add Question": "Добавить вопрос",
  "Roll Affliction": "Бросить недуг",
  "Send to Chat": "Отправить в чат",
  "Remove Domain": "Удалить домен",
  "No domain, drag one here!": "Нет домена, перетащите его сюда.",
  "Domains are separate items. If you don't see any domains, import them from the Domains compendium first, then drag them here.": "Домены являются отдельными предметами. Если вы не видите доменов, сначала импортируйте их из библиотеки доменов, затем перетащите сюда.",
  "Deprecated Actor Type:": "Устаревший тип персонажа:",
  "\"NPC\" has been renamed to \"Sin\". This actor will continue to work, but please use \"Sin\" for new actors.": "\"NPC\" переименован в \"Грех\". Этот персонаж продолжит работать, но для новых персонажей используйте тип \"Грех\".",
  "Ogre": "Огр",
  "Toad": "Жаба",
  "Idol": "Идол",
  "Lord": "Лорд",
  "Hound": "Гончая",
  "Centipede": "Сколопендра",
  "[REDACTED]": "[ЗАСЕКРЕЧЕНО]",
  "Form I/Severed": "Форма I / Отсечённый",
  "Form II/Fused": "Форма II / Слитый",
  "Form III/Bound": "Форма III / Связанный",
  "Opponent Name": "Имя противника",
  "Human": "Человек",
  "Drifter": "Скиталец",
  "Anomaly": "Аномалия",
  "Sin Variant": "Вариант греха",
  "Pseudo-Sin": "Псевдогрех",
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
  "AFFLICT": "НЕДУГ",
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
  "Attacks With": "Атаки с помощью",
  "Batons, firearms, claws...": "Дубинки, огнестрел, когти...",
  "Stress Inflicted": "Наносимый стресс",
  "2 stress, 1d6 stress...": "2 стресса, 1d6 стресса...",
  "Creates Complication": "Создаёт осложнение",
  "Kills lights, triggers alarm...": "Гасит свет, запускает тревогу...",
  "Creates Threat": "Создаёт угрозу",
  "Fires weapon, pins target...": "Стреляет, прижимает цель...",
  "Die Roll Attached": "Привязанный бросок куба",
  "On 1-2: extra effect, On 5+: reduced damage...": "На 1-2: доп. эффект, на 5+: сниженный урон...",
  "Drag afflictions here from compendium": "Перетащите недуги сюда из справочника",
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
  "Apply Affliction": "Применить недуг",
  "Source:": "Источник:",
  "Core p.XX, Games for Freaks p.XX": "Основная книга, стр. XX; «Игры для уродов», стр. XX",
  "+ Add tag": "+ Добавить тег",
  "Description...": "Описание...",
  "Choose an Exorcist to Attack:": "Выберите экзорциста для атаки:",
  "Choose an Exorcist to Afflict:": "Выберите экзорциста для недуга:",
  "Choose an Exorcist:": "Выберите экзорциста:",
  "Choose a Complication:": "Выберите осложнение:",
  "Choose a Threat:": "Выберите угрозу:",
  "Select domain to use": "Выберите домен",
  "Select exorcist to afflict": "Выберите экзорциста для недуга",
  "No afflictions available to roll.": "Нет недугов для броска.",
  "No afflictions defined for this opponent.": "Для этого противника не заданы недуги.",
  "Affliction item not found. It may have been deleted.": "Предмет недуга не найден. Возможно, он был удалён.",
  "Only affliction items can be dropped here.": "Сюда можно перетаскивать только недуги.",
  "This affliction is already added.": "Этот недуг уже добавлен.",
  "Unknown Affliction": "Неизвестный недуг",
  "Affliction": "Недуг",
  "Domain": "Домен",
  "The Redacted": "[ЗАСЕКРЕЧЕНО]",
  "[REDACTED] Domain": "[ЗАСЕКРЕЧЕНО] домен",
  "Select": "Выбрать",
  "Close": "Закрыть",
  "Low Damage": "Низкий урон",
  "Medium Damage": "Средний урон",
  "High Damage": "Высокий урон",
  "Attack Roll": "Бросок атаки",
  "Ability Activation": "Активация способности",
  "Consequences": "Последствия",
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
  "Search world agendas to add to sheet...": "Искать подходы мира для добавления на лист...",
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
  "Quirk - an optional alternate/additive passive from Games for Freaks": "Особенность - альтернативная или дополнительная пассивная сила из «Игр для уродов»"
};

const SIN_DOSSIER_TRANSLATIONS = {
  ogre: {
    palace: `Выследить огра часто значит найти его носителя или место, где тот сейчас скрывается. Под влиянием огра носитель обычно отдаляется от общества и обрывает связи, поэтому это труднее, чем обычно. Дворец огра часто выглядит как отражение важного для носителя места, но давно сгнившее и разросшееся до норы или лабиринта. Повсюду лежат мусор, хлам и вещи, которые огр собирал. Сам огр обычно едва помещается внутри и вынужден болезненно протискиваться или пригибаться, но это совсем не замедляет его. Типичные дворцы: • заброшенные или полуразрушенные здания • грязные высотки • закрытые школы • пустые рабочие места или офисы. Дворцы огра: темные, сырые, холодные, затхлые, вонючие, грязные.`,
    appearance: `Огры почти всегда огромные, сильные и массивные. Они проявляются как уродливые чудовища, часто из-за низкой самооценки своих носителей. В слиянии с носителем человек может выглядеть как худшая, более "уродливая" версия себя, какой он сам себя считает. Само присутствие огра высасывает из комнаты энергию и жизнь, даже если обычные люди его не видят, и понижает температуру. Огры связаны с морозом, туманом, грязью и дурной погодой. В бою они чудовищно сильны и живучи: быстро заживляют раны, могут разорвать человека пополам и игнорируют даже крайне жестокое наказание.`,
    pressure: `Само присутствие огра заражает местность темной миазмой. Когда огр появляется, погода в округе за несколько дней обычно портится и остается такой, пока огр не достигнет критической массы и не вызовет событие греха или пока его не казнят. Миазма обычно проявляется так: • здания, предметы, дороги и другие конструкции начинают разрушаться, будто годами не получали ухода • облака закрывают солнце, поднимается туман; со временем он густеет и приобретает кислый запах • поверхности покрываются густой белой плесенью • техника, телефонные линии, электричество и интернет работают все хуже, а затем перестают работать совсем • архитектура перестает подчиняться здравому смыслу и становится лабиринтной или бессмысленной • люди, находящиеся в миазматической зоне, перенимают взгляд огра на мир и становятся все более враждебными. Когда экзорцисты прибывают, миазма должна покрывать только часть зоны расследования, например несколько кварталов. Каждый рост давления распространяет миазму на новую область. Когда давление заполняется полностью, ситуация выходит из-под контроля: CAT огра увеличивается на +1, а миазма покрывает всю зону расследования и следует за экзорцистами до конца миссии, даже если они покидают исходную область.`,
    complications: `Гасит свет, вызывает туман, беспрерывно извергает мерзость на кого-то, хоронит экзорциста в грязи, слизи или рвоте, прижимает экзорциста, выпускает едкую вонь, разбивает стены, пол или потолок, отступает во тьму, добавляет свидетеля, использует домен.`,
    threats: `Схватить экзорциста и выдавить из него жизнь. Швырнуть экзорциста сквозь стену. Обрушить архитектуру. Призвать прислужников. Убить свидетелей. Заразить темными пульсирующими венами. Вызвать внезапный потоп или заморозку. Ослепить кого-то в облаке миазмы. Использовать домен. Сделать что-то темное, сокрушающее или мерзкое.`,
    traumaQuestions: [
      "Кто или что столкнуло тебя в эту яму?",
      "Кто или что удерживает тебя от падения за край?",
      "Чего ты больше всего стыдишься?"
    ],
    severeQuestions: [
      "Тебе помогает другой человек?",
      "Можешь ли ты ухватиться за что-то рядом?",
      "Есть ли у тебя источник яркого света или тепла?",
      "Огр отвлечен, ослаблен или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за миссию. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>Тебе помогает другой человек?</li>
        <li>Можешь ли ты ухватиться за что-то рядом?</li>
        <li>Есть ли у тебя источник яркого света или тепла?</li>
        <li>Огр отвлечен, ослаблен или находится под давлением?</li>
      </ul>
      <p>Затем бросьте кубики. Экзорцист и все, кто ему помогает, получают 1 стресс за каждый брошенный кубик независимо от результата.</p>
      <h3>Последствия</h3>
      <p>Если выпала хотя бы одна "1", выбранный экзорцист немедленно получает травму и недуг "искалеченные конечности": вся физическая активность сложна, если ее не подготовил союзник или если персонаж не участвует в командной работе.</p>
      <p>Если выпало две или больше "1", у экзорциста отрывает одну или несколько конечностей. Бросьте 1d3: 1 - рука, 2 - нога, 3 - обе ноги. Бросьте 1d6 для стороны: левая на 1-3, правая на 4-6. Экзорцист получает травму, теряет сознание до конца сцены, а затем вся физическая активность для него сложна без командной работы. После миссии он может приспособиться к инвалидности, и этот эффект перестанет действовать; решите с Админом, как персонаж восстанавливается.</p>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  },
  toad: {
    palace: `Дворец жабы - памятник богатству, часто такому, каким его представляет носитель. Снаружи он может находиться в тесном здании или маленьком жилом блоке, но внутри обычно превращается в роскошное, раскинувшееся великолепие. Дворцы жаб часто принимают форму летних особняков, элитных резиденций, курортов, казино или других мест, где удовольствие смешано с коммерцией. Носитель может хотя бы часть времени жить внутри дворца из-за его простора и удобства. Со временем пространство набивается накопленным богатством почти до разрыва, частично превращаясь в сокровищницы или галереи, где жаба защищает или демонстрирует свою добычу. Дворцы жабы: богатые, безвкусные, блестящие, просторные, чрезмерные, роскошные, удобные.`,
    appearance: `Жабы массивны, но удивительно быстры, и обладают большой ловкостью рук. У них часто есть хватательный язык или конечности с двойными суставами, и они передают эти черты носителям, с которыми сливаются. Они способны протискиваться в крошечные щели и прыгать на большие расстояния. Разинутые пасти жаб расширяют пространство и могут хранить невероятные объемы материальных вещей, иногда размером с несколько комнат. Все жабы источают сильный, но не совсем неприятный запах - что-то между средством для чистки ковров и дорогим одеколоном. В отличие от многих грехов, жабы любят втягивать экзорцистов в разговор, насмехаться и спорить. Они хитры, остры на язык, часто обаятельны и наслаждаются избытком не меньше своих носителей.`,
    pressure: `Главное желание жабы - добыть для носителя как можно больше материального богатства. Она крадет все, что может, разными способами, исходя из желаний носителя, хранит добычу в расширенном пищеводе и позже извергает ее во дворце. Кражи жабы могут начинаться с малого, но со временем ее аппетиты, буквальные и переносные, растут. Носитель, который хотел машину побыстрее, однажды заставит жабу найти самую быструю машину в городе и проглотить ее, затем следующую, и так далее. Со временем объем проглатываемого и алчность жабы неизбежно выходят за пределы реального. Вместо еды для носителя она может проглотить целый ресторан вместе с персоналом. Теоретически жаба достаточно высокой категории со временем проглотит целый город. Жаба получает силу от своей сокровищницы. Каждый рост давления усиливает ее жадность и определяет, что она способна украсть: • 0-2: ценные, но обычные вещи - деньги, машины, оружие, лекарства, еда, мода, искусство • 3-4: невероятные объемы того же • 5+: целые магазины, рестораны, яхты, автобусы, знаменитости. При 6+ CAT жабы увеличивается на +1, и она может красть концептуальные или нематериальные вещи: абстрактное богатство, акции компании, свет, художественный талант или счастье.`,
    complications: `Прыгает на мощных ногах вне досягаемости или протискивается в тесное место. Запутывает в ловушках. Обнаруживает скрытую взрывчатку. Запускает охрану или сигнализацию. Извергает слизь или содержимое желудка. Добавляет свидетеля, использует домен.`,
    threats: `Призвать телохранителей. Украсть что-то у экзорцистов. Обрушить или швырнуть объект окружения. Взорвать бомбу. Ударить кого-то мощными ногами. Проглотить что-то или кого-то целиком. Наложить крючок. Использовать домен. Сделать что-то хитрое, эффектное или шокирующее.`,
    traumaQuestions: [
      "Чего ты заслуживал, но тебе в этом отказали?",
      "Пока ты голодал, кто пировал?",
      "Где для тебя проходит черта?"
    ],
    severeQuestions: [
      "Ты принимаешь свои силы?",
      "Твои союзники достаточно близко, чтобы коснуться тебя кожа к коже?",
      "Готов ли ты расстаться со своим снаряжением?",
      "Жаба отвлечена, ослаблена или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за миссию. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>Ты принимаешь свои силы?</li>
        <li>Твои союзники достаточно близко, чтобы коснуться тебя кожа к коже?</li>
        <li>Готов ли ты расстаться со своим снаряжением? Если да, Жаба отвлекается на кражу всего уже отмеченного снаряжения, а твой КП заполняется. Эти вещи исчезают до поражения Жабы.</li>
        <li>Жаба отвлечена, ослаблена или находится под давлением?</li>
      </ul>
      <p>Затем бросьте кубики. Экзорцист и все, кто ему помогает, получают 1 стресс за каждый брошенный кубик независимо от результата.</p>
      <h3>Последствия</h3>
      <p>Если выпала хотя бы одна "1", Жаба крадет у выбранного экзорциста способность пользоваться психическими силами. Эти силы собираются в психическую тень, которая пытается сбежать. Это грех с талисманом казни 4; его реакции направлены на побег. Если тень уничтожена, поймана или сцена заканчивается, она снова сливается с носителем, прекращая эффект.</p>
      <p>Если выпало две или больше "1", талисман казни тени равен 7.</p>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  },
  idol: {
    palace: `Идолы обычно проявляют дворец там, где находится их культ, чаще всего в населенных местах. У них может быть публичное прикрытие, скрывающее вход во дворец и сам культ: новостная или интернет-программа, группа, концертный зал, религиозное собрание и так далее. Настоящая штаб-квартира культа обычно спрятана лучше и труднее доступна. В центре часто находится вход во дворец; идол может приглашать туда избранных культистов, чтобы окончательно расположить их к себе. В зависимости от устремлений греха интерьер таких дворцов обычно является памятником самовлюбленности и напоминает: • роскошные поместья • ночные клубы или концертные залы • красивые пентхаусы в высотках • религиозные залы или места поклонения. Дворцы идола: роскошные, позолоченные, воздушные, пленительные, впечатляющие, безвкусные, священные.`,
    appearance: `Идолы часто выглядят человекоподобно. Они могут казаться тем, кого желает их носитель: идеальным романтическим партнером, родительской фигурой или лучшим другом. В слиянии с носителями они могут улучшать их до "идеальных", более совершенных версий самих себя, усиливая черты, которые носитель считает желанными, и устраняя то, что кажется ему нежелательным. В них есть божественная, потусторонняя красота, способная ошеломлять людей, особенно безблагодатных. Если идола загнать в угол или если он хочет показать силу, он способен принимать другие, гораздо более страшные формы.`,
    pressure: `Идолы собирают вокруг себя культы и постепенно расширяют их. Это может быть круг обычных поклонников или люди, полностью попавшие под их власть. Идол низкой категории обычно собирает культ из нескольких десятков человек, а высокой категории - из сотен или тысяч. Пока идол жив, культисты полностью и без колебаний преданы ему и его носителю, выполняя приказы и желания верхушки культа без вопросов. Идол способен тайно добавлять НПЦ в культ. Каждый раз, когда давление растет, Админ выбирает НПЦ, которого игроки уже встретили на миссии, и добавляет его в культ. Игрокам не обязательно сразу раскрывать это.`,
    complications: `Взбудоражить толпу, очаровать кого-то, ослепить славой, захлестнуть эмоциями, вытянуть секреты, обезоружить кого-то, исторгнуть галлюцинации, добавить свидетеля, использовать домен.`,
    threats: `Призвать культистов. Причинить парализующую боль. Перегрузить чувства. Заставить экзорцистов чем-то пожертвовать. Обнажить слабость. Очаровать экзорциста. Захватить пленников. Наложить крючок. Использовать домен. Сделать что-то эмоционально сокрушительное, манипулятивное или шокирующее.`,
    traumaQuestions: [
      "О чем ты мечтаешь?",
      "Почему ты отказался от своей мечты?",
      "Почему ты считаешь, что тебя невозможно любить?"
    ],
    severeQuestions: [
      "Ты далеко от идола?",
      "Есть ли в твоей жизни любовь?",
      "Кто-то из помогающих тебе действительно о тебе заботится? Он может описать как.",
      "Идол отвлечен, ослаблен или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за миссию. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>Ты далеко от идола?</li>
        <li>Есть ли в твоей жизни любовь?</li>
        <li>Кто-то из помогающих тебе действительно о тебе заботится? Он может описать как.</li>
        <li>Идол отвлечен, ослаблен или находится под давлением?</li>
      </ul>
      <p>Затем бросьте кубики. Экзорцист и все, кто ему помогает, получают 1 стресс за каждый брошенный кубик независимо от результата.</p>
      <h3>Последствия</h3>
      <p>Если выпала хотя бы одна "1", выбранный экзорцист должен ответить на вопрос: кого из союзников он желает сильнее всего? Ответ может быть платоническим, а идол может дать ему шанс передумать.</p>
      <p>Если ответ "никого" или "себя", идол мгновенно наносит травму и лишает выбранного экзорциста сознания до конца сцены.</p>
      <p>Если ответ - другой союзник, идол насильно сращивает их плоть. Это не имеет немедленных вредных эффектов, но пока они слиты, оба могут действовать только в командной работе друг с другом. После отдыха экзорцисты могут остаться слитыми или насильно разделиться; это наносит каждому травму. Иначе эффект заканчивается после охоты, когда CAIN безопасно разделяет их.</p>
      <p>Если выпало две или больше "1", эффект длится до конца охоты и не может закончиться раньше.</p>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  },
  lord: {
    palace: `Дворец лорда всегда расположен в центре его Королевства, поэтому путь к нему требует пройти через само Королевство. Чаще всего он действительно напоминает дворец по размеру и форме или нечто столь же важное и внушительное: высотный небоскреб, корпоративную штаб-квартиру, правительственное здание или храм. Дворец лорда обычно кипит деятельностью слуг или подчиненных: малых грехов, образов из воображения носителя или плененных людей, втянутых в повествование Королевства. Дворцы лорда: внушительные, грандиозные, величавые, монументальные, каменные, священные.`,
    appearance: `Лорды - могущественные, внушительные фигуры, которые предстают перед носителями как архетипические "защитники". Иногда они проявляются как фигура власти, например солдат или полицейский, а иногда как нечто более божественное: бог или ангел. У них крайне прочная броня, и они превосходные бойцы, способные без труда отражать любые предполагаемые угрозы новому порядку, который навязывают.`,
    pressure: `Архетипический Лорд создает Королевство - паразитическую альтернативную реальность, растущую из дворца и накладывающуюся на наш мир. Лорд и его носитель могут свободно входить в Королевство, а само оно может прятаться в невозможных пространствах: за дверями шкафов, в коридорах, служебных проходах ресторанов и так далее. Со временем Королевство начинает просачиваться наружу и втягивать в себя части реального мира вместе с ничего не подозревающими людьми. Снаружи люди не видят Королевство, даже когда оно пожирает реальность, и могут просто идти по улице, неосознанно переходя в альтернативную реальность. Внутри Королевство может выглядеть как текущий мир, историческая эпоха или даже фантастическое место: футуристический город, сияющие небеса или средневековый замок. Облик зависит от скрытых желаний носителя. Здесь все, что носитель потерял, возвращается к нему и даже больше. Это альтернативная реальность, более удобная и приятная для носителя, соответствующая его убеждениям, потакающая и поддерживающая его. События, история и люди внутри могут быть радикально изменены: те, кто снаружи враждебен носителю, внутри могут стать его друзьями, прошлые ошибки и слабости могут быть замазаны, исправлены или даже воспеты.`,
    complications: `Искажает мир или ландшафт, расширяет Королевство, выдвигает ложные обвинения, сковывает экзорциста цепями, ослепляет палящим светом, наращивает сияющие броневые пластины, поднимает сверкающий щит, добавляет свидетеля, использует домен.`,
    threats: `Карать огнем. Вершить суд с небес. Швырнуть в психическую тюрьму. Заставить экзорциста столкнуться с собственными преступлениями. Схватить бронированной рукой. Пронзить святыми шипами. Наложить крючок. Использовать домен. Сделать что-то праведное, обжигающее или подавляющее.`,
    traumaQuestions: [
      "Что ты потерял?",
      "Что главное ты исправил бы в мире?",
      "О ком ты пожалел, что оставил его позади, когда вознесся в свое Королевство?"
    ],
    severeQuestions: [
      "Ты невиновен в преступлениях?",
      "Ты лжец или мошенник?",
      "Ты жил согласно своим идеалам?",
      "Лорд отвлечен, ослаблен или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за сцену. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Лорд связывает выбранного экзорциста божественными цепями и начинает скорый суд. Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>Ты невиновен в преступлениях?</li>
        <li>Ты лжец или мошенник?</li>
        <li>Ты жил согласно своим идеалам?</li>
        <li>Лорд отвлечен, ослаблен или находится под давлением?</li>
      </ul>
      <p>Затем бросьте кубики, пока Лорд выносит приговор и карает выбранного экзорциста огнем.</p>
      <h3>Последствия</h3>
      <p>Экзорцист и все, кто ему помогает, получают 1 стресс за каждый брошенный кубик независимо от результата.</p>
      <p>За каждую выпавшую "1" выбранный экзорцист вынужден столкнуться со своей несостоятельностью и дополнительно получает 1d6 греха.</p>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  },
  hound: {
    palace: `Дворец гончей обычно крайне прост: едва связный и размытый ландшафт режущего ветра, кипящего дождя, нереального жара и лижущего пламени. В отличие от других дворцов, он часто меняет местоположение вместе с гончей, пока та ведет охоту. Вход обычно находится в заброшенном или дикого вида месте: в пустых зданиях, дренажных каналах, на свалках, в сгоревших машинах или в древесных дуплах. Дворцы гончей: адские, кровавые, пустынные, непригодные для жизни, свирепые, хаотичные. Давление: Злоба.`,
    appearance: `Гончие - активные, постоянно движущиеся грехи, дергающиеся от едва сдерживаемой ярости. Они часто принимают звериную форму и могут вести себя по-звериному: бегать на четвереньках и кусаться, даже если выглядят гуманоидно. Обычно они жилистые, крайне быстрые и сильные. Люди инстинктивно боятся их и чувствуют присутствие гончей, даже если не видят ее. Выжившие жертвы часто описывают первобытный ужас и ощущение, что на них охотится дикое животное.`,
    pressure: `Гончая хранит злобу к конкретному человеку или группе людей. Пока ее цели живы, она всеми силами выслеживает их и убивает жестоко и кроваво. При подготовке миссии Админ должен назначить трех конкретных людей целями злобы гончей; это могут быть цели, выросшие из первоначальной обиды, или представители группы, на которую направлена злоба. Злоба легко перекидывается на невиновных: членов семьи, друзей или коллег виновников. • Когда давление растет, гончая выслеживает одну из своих целей и пытается убить ее. Если экзорцисты рядом, они могут помешать этому в сцене конфликта. Если нет, цель жестоко убита. • Если все цели убиты, гончая выбирает НПЦ, которого экзорцисты уже встретили, и добавляет его к своей злобе как новую цель. Если давление достигает максимума, гончая получает +1 CAT и добавляет к своей злобе всех НПЦ и экзорцистов.`,
    complications: `Двигается быстрее, чем глаз успевает уследить, поджигает все вокруг, источает огромный пар или жар, впадает в ярость, обрастает дополнительными клинками, увеличивается в размере и силе, добавляет свидетеля, использует домен.`,
    threats: `Причинить огромный сопутствующий ущерб. Попытаться разорвать кого-то пополам. Разорвать людей на части. Плюнуть потоками кипящей крови. Швырнуть кого-то сквозь крышу или стену. Нарезать все лентами. Наложить крючок. Использовать домен. Сделать что-то жестокое, уничтожающее или безумное.`,
    traumaQuestions: [
      "Кто причинил тебе зло?",
      "Как именно тебе причинили зло?",
      "Чем ты не готов пожертвовать?"
    ],
    severeQuestions: [
      "У тебя есть меч или что-то похожее?",
      "Ты спокоен, собран и сосредоточен?",
      "У тебя есть щит или что-то похожее?",
      "Гончая отвлечена, ослаблена или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за миссию. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>У тебя есть меч или что-то похожее?</li>
        <li>Ты спокоен, собран и сосредоточен?</li>
        <li>У тебя есть щит или что-то похожее?</li>
        <li>Гончая отвлечена, ослаблена или находится под давлением?</li>
      </ul>
      <p>Затем бросайте кубики по одному. Гончая немедленно отделяет выбранного экзорциста от группы: швыряет в карманное измерение, пробивает им стену, сбрасывает с автострады. Затем она атакует его с неизмеримой яростью, и каждый бросок кубика представляет отдельную атаку.</p>
      <h3>Последствия</h3>
      <p>За каждый брошенный кубик экзорцист и все, кто ему помогает, получают 1 стресс независимо от результата.</p>
      <p>За каждую выпавшую "1" выбранный экзорцист получает 2 дополнительных стресса, а с его тела срезают кусок кожи, оставляя постоянный шрам.</p>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  },
  centipede: {
    palace: `Дворец Сколопендры обычно находится в защищенном месте в центре активности орды, как правило, где-то важном для носителя или рядом с событием, которое все запустило. Внутри дворец часто напоминает тюрьму или подземелье, построенное, чтобы удержать носителя Сколопендры и заставить его смотреть на ужасы, которые он невольно или сознательно выпустил. Эта тюрьма может быть стерильной, холодной и лабораторной или средневековой, полной зазубренных крюков и ржавых цепей. В ней часто проявляются ужасы или ловушки, призванные прогнать, поймать или убить вторгшихся. Дворцы Сколопендры: враждебные, злобные, гротескные, кровавые, тюремные, хтонические.`,
    appearance: `Сколопендры - воплощенные катастрофы, рожденные из самых темных образов психики своих носителей. Они существуют только для того, чтобы причинять такое чудовищное насилие и смерть, что прежние тревоги носителя испаряются. Как следует из названия, они обычно проявляются как насекомоподобные мерзости, воплощая все признаки "монстра". Главная отличительная черта их физиологии - яд, смертельно опасный для человеческой жизни и создающий для экзорцистов очень быстро растущую проблему.`,
    pressure: `Давление: Заражение. Яд Сколопендры, попав в кровоток человека, вызывает катализирующую психобиотическую реакцию. Примерно за час жертва превращается в крайне сильного, агрессивного и жестокого монстра - бездумный зонд под контролем Сколопендры. Такие зараженные вырабатывают собственный яд и могут передавать его через укусы, быстро создавая орду. Человек, зараженный ядом, окукливается, мутирует и трансформируется за 44 минуты. Экзорцист вместо этого получает крючок "Укус Сколопендры". Лекарства от яда нет, но его действие можно задержать; надежный способ остановить заражение - казнить Сколопендру. После ее уничтожения яд теряет трансформирующее действие и испаряется, спасая зараженных экзорцистов и еще не трансформировавшихся жертв. Все уже трансформированные жертвы устраняются при зачистке и считаются погибшими. Каждый раз, когда давление растет, 10% местного населения в затронутой зоне заражается и трансформируется. Если давление достигает максимума, CAT Сколопендры увеличивается на +1, а потери населения возрастают до 90%.`,
    complications: `Зарывается в землю или стены, выплевывает ядовитую паутину, выпускает рои мух, разбрызгивает лужи яда, открывает скрытые норы, обрушивает пол, скрывается во тьме, добавляет свидетеля, использует домен.`,
    threats: `Призвать орду. Разорвать экзорциста. Раскрыть ряды гипнотических глазных пятен. Взорвать едкий нарыв. Растворить что-то кислотой. Устроить резню. Наложить крючок. Использовать домен. Сделать что-то грязное, злобное или пропитанное ядом.`,
    traumaQuestions: [
      "От чего ты пытаешься сбежать?",
      "Что ты больше всего ненавидишь в человечестве?",
      "О чем ты больше всего сожалеешь?"
    ],
    severeQuestions: [
      "Можешь ли ты двигаться быстро и без помех?",
      "Может ли кто-то из помогающих толкнуть или схватить тебя?",
      "Можешь ли ты простить носителя Сколопендры?",
      "Сколопендра отвлечена, ослаблена или находится под давлением?"
    ],
    severeAttackDescription: `<div>
      <h2>Описание</h2>
      <p>Грех может использовать эту способность при результате "1" на броске риска. Он может сделать это только один раз за миссию. Выберите экзорциста целью. Все остальные экзорцисты поблизости должны решить, бросаются ли они ему на помощь. Те, кто не помогает, не могут участвовать.</p>
      <h3>Активация способности</h3>
      <p>Начните с запаса 6d6. Затем уберите по одному кубику за каждый пункт:</p>
      <ul>
        <li>Можешь ли ты двигаться быстро и без помех?</li>
        <li>Может ли кто-то из помогающих толкнуть или схватить тебя?</li>
        <li>Можешь ли ты простить носителя Сколопендры?</li>
        <li>Сколопендра отвлечена, ослаблена или находится под давлением?</li>
      </ul>
      <p>Затем бросьте кубики. Сколопендра стреляет под давлением струей мутагенного яда в выбранного экзорциста, растворяя все препятствия и плоть на пути с невероятной силой.</p>
      <h3>Последствия</h3>
      <p>Экзорцист и все, кто ему помогает, получают 1 стресс за каждый брошенный кубик независимо от результата.</p>
      <p>Если выпала хотя бы одна "1", выбранный экзорцист получает травму и бросает по таблице постоянных шрамов.</p>
      <p>Если выпало две или больше "1", выбранный экзорцист выбирает один вариант:</p>
      <ul>
        <li>мгновенно погибает;</li>
        <li>переживает переполнение греха, чтобы избежать мгновенной смерти;</li>
        <li>получает травму и вместо этого трижды бросает по таблице постоянных шрамов:</li>
        <ul>
          <li>отсутствующий глаз, сросшийся намертво;</li>
          <li>большой обесцвеченный участок кожи;</li>
          <li>пальцы одной руки сплавились вместе;</li>
          <li>отсутствующие волосы, ожоговый шрам на коже головы;</li>
          <li>огромный ожоговый шрам на обеих руках;</li>
          <li>волнистый кислотный ожог от шеи до паха.</li>
        </ul>
      </ul>
    </div>`,
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "3 стресса", highDamage: "1 стресс" }
  },
  redacted: {
    palace: "[ЗАСЕКРЕЧЕНО]",
    appearance: "[ЗАСЕКРЕЧЕНО]",
    pressure: "[ЗАСЕКРЕЧЕНО]",
    complications: "[ЗАСЕКРЕЧЕНО]",
    threats: "[ЗАСЕКРЕЧЕНО]",
    traumaQuestions: ["[ЗАСЕКРЕЧЕНО]", "[ЗАСЕКРЕЧЕНО]", "[ЗАСЕКРЕЧЕНО]"],
    severeQuestions: ["[ЗАСЕКРЕЧЕНО]", "[ЗАСЕКРЕЧЕНО]", "[ЗАСЕКРЕЧЕНО]", "[ЗАСЕКРЕЧЕНО]"],
    severeAttackDescription: "[ЗАСЕКРЕЧЕНО]",
    attackRoll: { lowDamage: "1 стресс", mediumDamage: "2 стресса", highDamage: "3 стресса" }
  }
};

const SIN_DOSSIER_DEFAULT_MARKERS = {
  ogre: {
    palace: "Tracking an ogre down",
    appearance: "Ogres are almost always",
    pressure: "The very presence of an ogre",
    complications: "Kill lights, summon mist",
    threats: "Grab an exorcist and squeeze",
    severeAttackDescription: "mangled limbs affliction"
  },
  toad: {
    palace: "palace represents a monument",
    appearance: "Toads are bulky but surprisingly fast",
    pressure: "main driving desire",
    complications: "Leap out of reach",
    threats: "Summon bodyguards",
    severeAttackDescription: "psychic shadow"
  },
  idol: {
    palace: "Idols tend to manifest",
    appearance: "Idols commonly appear",
    pressure: "dols gather cults",
    complications: "Rile up a crowd",
    threats: "Summon cultists",
    severeAttackDescription: "Who in among their allies"
  },
  lord: {
    palace: "palace is always",
    appearance: "Lords are powerful",
    pressure: "The archetypical Lord creates",
    complications: "Twist the world or landscape",
    threats: "Smite with fire",
    severeAttackDescription: "summary trial"
  },
  hound: {
    palace: "palace is usually",
    appearance: "Hounds are active",
    pressure: "A hound harbors a grudge",
    complications: "Move faster than the eye",
    threats: "Cause massive collateral damage",
    severeAttackDescription: "immeasurable fury"
  },
  centipede: {
    palace: "palace is usually located",
    appearance: "entipedes are manifested catastrophes",
    complications: "Burrow into the ground",
    threats: "Summon the horde",
    severeAttackDescription: "mutagenic venom"
  },
  redacted: {
    palace: "The Redacted",
    appearance: "The Redacted",
    pressure: "The Redacted",
    complications: "The Redacted",
    threats: "The Redacted",
    severeAttackDescription: "The Redacted"
  }
};

const SIN_DOSSIER_DEFAULT_QUESTIONS = {
  ogre: {
    traumaQuestions: [
      "Who or what pushed you into this hole?",
      "Who or what is keeping you from going over the edge?",
      "What are you most ashamed of?"
    ],
    severeQuestions: [
      "Is another person aiding you?",
      "Can you grab on to something nearby?",
      "Do you have a source of bright light or heat?",
      "Is the ogre distracted, hindered, or under duress in some way?"
    ]
  },
  toad: {
    traumaQuestions: [
      "What do you deserve that was denied to you?",
      "While you were starving, who was feasting?",
      "Where do you draw the line?"
    ],
    severeQuestions: [
      "Are you accepting of your powers?",
      "Are your allies close enough to touch you skin to skin?",
      "Are you willing to part with your kit?",
      "Is the Toad hindered, distracted, or under duress in some way?"
    ]
  },
  idol: {
    traumaQuestions: [
      "What is your dream?",
      "Why did you give up on your dream?",
      "Why do you think you are you incapable of being loved?"
    ],
    severeQuestions: [
      "Are you far from the idol?",
      "Do you have love in your life?",
      "Does someone aiding you care about you? They can describe how.",
      "Is the idol hindered, distracted, or under duress in some way?"
    ]
  },
  lord: {
    traumaQuestions: [
      "What did you lose?",
      "What is the main thing you would fix about the world?",
      "Who did you regret leaving behind when you ascended to your Kingdom?"
    ],
    severeQuestions: [
      "Are you innocent of crimes?",
      "Are you a liar or a cheat?",
      "Have you lived a life by your ideals?",
      "Is the Lord hindered, distracted, or under duress in any way?"
    ]
  },
  hound: {
    traumaQuestions: [
      "Who wronged you?",
      "How were you wronged?",
      "What are you unwilling to sacrifice?"
    ],
    severeQuestions: [
      "Do you have a sword (or something like it)?",
      "Are you calm, collected, and focused?",
      "Do you have a shield (or something like it)?",
      "Is the hound hindered, distracted, or under duress in some way?"
    ]
  },
  centipede: {
    traumaQuestions: [
      "What are you trying to escape?",
      "What do you hate the most about humanity?",
      "What do you regret the most?"
    ],
    severeQuestions: [
      "Can you move quickly and unencumbered?",
      "Is someone aiding you able to push or grab you?",
      "Can you forgive the centipede's host?",
      "Is the centipede hindered, distracted, or under duress in some way?"
    ]
  },
  redacted: {
    traumaQuestions: ["The Redacted", "The Redacted", "The Redacted"],
    severeQuestions: ["The Redacted", "The Redacted", "The Redacted", "The Redacted"]
  }
};

const SIN_DOSSIER_DEFAULT_AFFLICTION_PREFIXES = {
  ogre: [
    "White Mold:",
    "Frozen Limbs:",
    "Circling the Drain",
    "Speaking spews out black sludge.",
    "Rotting:",
    "Permanently add to your agenda: die."
  ],
  toad: [
    "Absent Minded:",
    "Wasting Sickness:",
    "Starvation:",
    "Itchy Fingers:",
    "Dreaming Desire:",
    "The Want:"
  ],
  idol: [
    "Infatuated:",
    "Solipsism:",
    "Violet Somnia:",
    "Violent Jealousy:",
    "Narcissi:",
    "The Want:"
  ],
  lord: [
    "Reality Control:",
    "Pain of Loss:",
    "Kingdom infection:",
    "Hitchhiker:",
    "Welcome Home:",
    "Justiciar:"
  ],
  hound: [
    "Blood Rage:",
    "Bleeding Eyes:",
    "Ganglia Fever:",
    "Boiling Resentment:",
    "Blood Scent:",
    "The Urge:"
  ],
  centipede: [
    "Seethe:",
    "Limb Necrosis:",
    "Acid Degradation:",
    "Alienation:",
    "Hive Brain:",
    "Let it End:"
  ],
  redacted: ["The Redacted"]
};

const SIN_AFFLICTION_LINE_OVERRIDES = {
  "Speaking spews out black sludge. All communication that requires speaking is hard": {
    originalName: "Black Lungs",
    fallback: "Черные легкие: Разговор извергает черную грязь. Любое общение, требующее разговора, затруднено."
  },
  "Permanently add to your agenda: die.": {
    originalName: "The Weight",
    fallback: "Тяжесть: Навсегда добавьте в свой подход: умереть."
  },
  "The Want: Permanently add to your agenda: show someone you are worthy of their attention": {
    originalName: "Ring",
    fallback: "Кольцо: Навсегда добавьте в свой подход: покажите кому-то, что вы достойны его внимания."
  }
};

const sinDossierTranslationsInFlight = new Set();

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
  if (rollPsyche) return `Бросок Псионики (${rollPsyche[1]})`;

  const psycheCost = value.match(/^Requires (.+) Psyche Burst\(s\)$/);
  if (psycheCost) return `Требует психических всплесков: ${psycheCost[1]}`;

  const currentMarks = value.match(/^Current Marks: (.+)$/);
  if (currentMarks) return `Текущие метки: ${currentMarks[1]}`;

  const addedToActor = value.match(/^Added (.+) to (.+)$/);
  if (addedToActor) return `Добавлено: ${addedToActor[1]} -> ${addedToActor[2]}`;

  const agendaSet = value.match(/^Set (.+) as current agenda with (.+) tasks$/);
  if (agendaSet) return `Текущий подход: ${agendaSet[1]} (${agendaSet[2]} задач)`;

  const blasphemyAdded = value.match(/^Added (.+) with (.+) passive powers?$/);
  if (blasphemyAdded) return `Добавлено: ${blasphemyAdded[1]} (${blasphemyAdded[2]} пассивных сил)`;

  const alreadyAdded = value.match(/^(.+) is already added to this character$/);
  if (alreadyAdded) return `${alreadyAdded[1]} уже добавлено этому персонажу`;

  const notEnoughBursts = value.match(/^Not enough Psyche Bursts! You only have (.+)\.$/);
  if (notEnoughBursts) return `Недостаточно психических всплесков. Доступно только ${notEnoughBursts[1]}.`;

  const usedBurst = value.match(/^Used (.+) Psyche Bursts? for (.+)$/);
  if (usedBurst) return `Потрачено психических всплесков: ${usedBurst[1]} на ${usedBurst[2]}`;

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
  if (actorAffliction) return `${actorAffliction[1]} - недуг`;

  const qLabel = value.match(/^Q(\d+):$/);
  if (qLabel) return `В${Number(qLabel[1]) + 1}:`;

  const stressAmount = value.match(/^(.+) stress$/i);
  if (stressAmount && !value.includes(":")) return `${stressAmount[1]} ${stressAmount[1] === "1" ? "стресс" : "стресса"}`;

  const damage = value.match(/^(Low|Medium|High) Damage: (.+)$/);
  if (damage) {
    const damageLabel = {
      Low: "Низкий урон",
      Medium: "Средний урон",
      High: "Высокий урон"
    }[damage[1]];
    return `${damageLabel}: ${translateText(damage[2])}`;
  }

  const struckWith = value.match(/^(.+) was struck with (.+)$/);
  if (struckWith) return `${struckWith[1]} получает недуг ${translateText(struckWith[2])}`;

  const attacksTarget = value.match(/^(.+) attacks (.+)!$/);
  if (attacksTarget) return `${attacksTarget[1]} атакует ${attacksTarget[2]}!`;

  const afflictsTarget = value.match(/^(.+) afflicts (.+)!$/);
  if (afflictsTarget) return `${afflictsTarget[1]} накладывает недуг на ${afflictsTarget[2]}!`;

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
    ?? UI_TRANSLATIONS[normalized]
    ?? SKILL_TRANSLATIONS[normalized.toLowerCase()]
    ?? translateDynamic(normalized)
    ?? translateUiPattern(normalized)
    ?? value;
}

function replaceTextNode(node) {
  const original = node.nodeValue;
  const trimmed = normalizeText(original);
  if (!trimmed) return;

  const folderContext = node.parentElement?.closest("select[id*='folder'], .folder-name, .folder-header h3, #export-folders-list");
  const translated = (folderContext && translationState.folders.get(normalizeLookup(trimmed))) || translateText(trimmed);
  if (translated === trimmed || translated === original) return;

  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  node.nodeValue = `${leading}${translated}${trailing}`;
}

function shouldSkipElement(element) {
  if (!element?.closest) return false;
  return Boolean(element.closest("script, style, code, pre, kbd, samp, textarea, [contenteditable='true'], .editor-content, .journal-page-content, .ability-description, .affliction-description"));
}

function translateStructuredText(element) {
  const session = element.matches?.(".session-end-form") ? element : element.querySelector?.(".session-end-form");
  if (!session) return;
  for (const label of session.querySelectorAll("label[for='survival']")) {
    const bold = label.querySelector("b");
    for (const node of label.childNodes) if (node.nodeType === Node.TEXT_NODE && /Did you/.test(node.nodeValue)) node.nodeValue = "Вы ";
    if (bold?.textContent === "survive") bold.textContent = "выжили";
  }
}

function translateAttributes(element) {
  if (!element?.getAttribute) return;
  if (element.closest?.("script, style, code, pre, kbd, samp")) return;
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
  translateAttributes(element);
  element.querySelectorAll?.("*").forEach((child) => {
    translateAttributes(child);
  });
  if (shouldSkipElement(element)) return;
  translateStructuredText(element);

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
      if (mutation.type === "childList") for (const node of mutation.addedNodes) translateElement(node);
      else translateElement(mutation.target);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label", "data-tooltip", "data-label", "alt"]
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

function normalizeComparable(value) {
  return normalizeText(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

function valuesDiffer(left, right) {
  return JSON.stringify(left ?? null) !== JSON.stringify(right ?? null);
}

function setPatchValue(patch, path, current, next) {
  if (next === undefined || !valuesDiffer(current, next)) return false;
  setByPath(patch, path, next);
  return true;
}

function isSinLikeActor(actor) {
  return actor?.documentName === "Actor" && ["sin", "npc"].includes(actor.type);
}

function isDefaultSinDossierText(value, sinType, field) {
  const original = field === "severeAttackDescription"
    ? originalData.sins?.[sinType]?.severeAttack?.description
    : originalData.sins?.[sinType]?.[field];
  if (original !== undefined) return normalizeComparable(stripInlineHtml(value)) === normalizeComparable(stripInlineHtml(original));
  const marker = SIN_DOSSIER_DEFAULT_MARKERS[sinType]?.[field];
  if (!marker) return false;
  const comparable = normalizeComparable(value);
  return Boolean(comparable && comparable.startsWith(normalizeComparable(marker)));
}

function shouldReplaceSinDossierField(value, sinType, field) {
  if (field === "palace" && value === "default") return true;
  if (sinType === "centipede" && field === "pressure" && !normalizeText(value)) return true;
  return isDefaultSinDossierText(value, sinType, field);
}

function shouldReplaceSinBiography(biography, appearance, sinType) {
  if (isDefaultSinDossierText(biography, sinType, "appearance")) return true;
  if (Object.values(SIN_DOSSIER_TRANSLATIONS).some((entry) => entry.appearance === biography)) return true;
  if (normalizeText(biography)) return false;
  return !normalizeText(appearance) || isDefaultSinDossierText(appearance, sinType, "appearance");
}

function translateSinQuestionArray(current, sinType, key) {
  if (!Array.isArray(current)) return null;
  const defaults = SIN_DOSSIER_DEFAULT_QUESTIONS[sinType]?.[key];
  const translated = SIN_DOSSIER_TRANSLATIONS[sinType]?.[key];
  if (!defaults?.length || !translated?.length) return null;

  let changed = false;
  const next = current.map((entry, index) => {
    const currentQuestion = typeof entry === "string" ? entry : entry?.question;
    if (!translated[index] || normalizeComparable(currentQuestion) !== normalizeComparable(defaults[index])) {
      return cloneValue(entry);
    }

    changed = true;
    if (typeof entry === "string") return translated[index];
    return { ...cloneValue(entry), question: translated[index] };
  });

  return changed ? next : null;
}

function getTranslationRecordByPackAndName(packName, name) {
  const key = normalizeLookup(name);
  if (!translationState.loaded || !key) return null;

  const direct = translationState.byPackName.get(packName)?.get(key);
  if (direct) return direct;

  const records = [
    ...(translationState.byOriginalName.get(key) ?? []),
    ...(translationState.byTranslatedName.get(key) ?? [])
  ].filter((record) => record.packName === packName);
  return chooseTranslationRecord({ name }, records);
}

function stripInlineHtml(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTranslatedAfflictionLine(line) {
  const normalized = normalizeText(line);
  if (normalized === "The Redacted") return "[ЗАСЕКРЕЧЕНО]";
  if (!normalized || !/[A-Za-z]{4,}/.test(normalized)) return line;

  const override = SIN_AFFLICTION_LINE_OVERRIDES[normalized];
  const colonIndex = normalized.indexOf(":");
  const originalName = override?.originalName ?? (colonIndex > -1 ? normalized.slice(0, colonIndex).trim() : "");
  if (!originalName) return override?.fallback ?? line;

  const record = getTranslationRecordByPackAndName("afflictions", originalName);
  const name = record?.entry?.afflictionName ?? record?.entry?.name;
  const description = stripInlineHtml(record?.entry?.afflictionDescription ?? record?.entry?.description);

  if (name && description) return `${name}: ${description}`;
  if (name) return name;
  return override?.fallback ?? line;
}

function isDefaultSinAfflictionLine(line, sinType) {
  const normalized = normalizeComparable(line);
  return (SIN_DOSSIER_DEFAULT_AFFLICTION_PREFIXES[sinType] ?? [])
    .some((prefix) => normalized.startsWith(normalizeComparable(prefix)));
}

function buildTranslatedAfflictions(current, sinType) {
  if (!Array.isArray(current)) return null;
  let changed = false;
  const next = current.map((line) => {
    if (!isDefaultSinAfflictionLine(line, sinType)) return line;
    const translated = buildTranslatedAfflictionLine(line);
    if (translated !== line) changed = true;
    return translated;
  });
  return changed ? next : null;
}

function buildTranslatedDomainData(domainData, sinType) {
  if (!domainData || typeof domainData !== "object") return null;

  let changed = false;
  const next = cloneValue(domainData);
  for (const [abilityKey, ability] of Object.entries(next)) {
    if (!ability || typeof ability !== "object") continue;

    if (normalizeText(ability.title) === "The Redacted") {
      ability.title = "[ЗАСЕКРЕЧЕНО]";
      ability.value = "[ЗАСЕКРЕЧЕНО]";
      changed = true;
      continue;
    }

    const record = getTranslationRecordByPackAndName("domains", ability.title);
    if (!record?.entry) continue;

    const title = record.entry.name ?? ability.title;
    const value = record.entry.domainDescription ?? record.entry.description ?? ability.value;
    if (ability.title !== title) {
      next[abilityKey].title = title;
      changed = true;
    }
    const original = record.original?.fields?.["system.domainDescription"];
    const originalDossier = originalData.sins?.[sinType]?.domains?.[abilityKey]?.value;
    if (ability.value !== value && (
      normalizeComparable(stripInlineHtml(ability.value)) === normalizeComparable(stripInlineHtml(original))
      || normalizeComparable(stripInlineHtml(ability.value)) === normalizeComparable(stripInlineHtml(originalDossier))
      || !ability.value
    )) {
      next[abilityKey].value = value;
      changed = true;
    }
  }

  return changed ? next : null;
}

function buildSinDossierPatch(actor) {
  if (!isSinLikeActor(actor)) return null;

  const sinType = normalizeLookup(actor.system?.sinType);
  const translation = SIN_DOSSIER_TRANSLATIONS[sinType];
  if (!translation) return null;

  const system = actor.system ?? {};
  const patch = {};
  const cleared = actor.flags?.[MODULE_ID]?.emptyDossierFields ?? [];

  for (const field of ["palace", "appearance", "pressure", "complications", "threats"]) {
    if (cleared.includes(field) && system[field] === "") continue;
    if (translation[field] && shouldReplaceSinDossierField(system[field], sinType, field)) {
      setPatchValue(patch, `system.${field}`, system[field], translation[field]);
    }
  }

  if (!cleared.includes("biography") && translation.appearance && shouldReplaceSinBiography(system.biography, system.appearance, sinType)) {
    setPatchValue(patch, "system.biography", system.biography, translation.appearance);
  }

  const traumas = translateSinQuestionArray(system.traumas, sinType, "traumaQuestions");
  if (traumas) setPatchValue(patch, "system.traumas", system.traumas, traumas);

  const severeQuestions = translateSinQuestionArray(system.severeAbilityQuestions, sinType, "severeQuestions");
  if (severeQuestions) setPatchValue(patch, "system.severeAbilityQuestions", system.severeAbilityQuestions, severeQuestions);

  if (
    translation.severeAttackDescription
    && shouldReplaceSinDossierField(system.severeAttack?.description, sinType, "severeAttackDescription")
  ) {
    setPatchValue(
      patch,
      "system.severeAttack.description",
      system.severeAttack?.description,
      translation.severeAttackDescription
    );
  }

  for (const [field, value] of Object.entries(translation.attackRoll ?? {})) {
    const current = system.attackRoll?.[field];
    if (typeof current === "string" && /^(?:\d+|\d+d\d+) stress$/i.test(normalizeText(current))) {
      setPatchValue(patch, `system.attackRoll.${field}`, current, value);
    }
  }

  const domains = buildTranslatedDomainData(system.domains, sinType);
  if (domains) setPatchValue(patch, "system.domains", system.domains, domains);

  const afflictions = buildTranslatedAfflictions(system.afflictions, sinType);
  if (afflictions) setPatchValue(patch, "system.afflictions", system.afflictions, afflictions);

  return hasKeys(patch) ? patch : null;
}

async function applySinDossierTranslations(actor) {
  if (!shouldTranslateRuntime() || !isSinLikeActor(actor)) return;

  if (!translationState.loaded) {
    try {
      await loadTranslationIndex();
    } catch (error) {
      console.warn("CAIN RU | Could not load translation index for sin dossier", error);
    }
  }

  const patch = buildSinDossierPatch(actor);
  if (!patch) return;

  const key = actor.uuid ?? actor.id ?? actor.name;
  if (sinDossierTranslationsInFlight.has(key)) return;

  sinDossierTranslationsInFlight.add(key);
  try {
    actor.updateSource(patch);
  } catch (error) {
    console.warn(`CAIN RU | Could not translate sin dossier for ${actor.name}`, error);
  } finally {
    sinDossierTranslationsInFlight.delete(key);
  }
}

async function applyRuntimeSinDossierTranslations() {
  if (!shouldTranslateRuntime()) return;
  for (const actor of game.actors ?? []) {
    await applySinDossierTranslations(actor);
  }
}

async function loadTranslationIndex() {
  if (translationState.loaded) return translationState;
  if (translationState.loadPromise) return translationState.loadPromise;

  translationState.loadPromise = (async () => {
    const originals = await fetch(`modules/${MODULE_ID}/data/originals.json`);
    if (originals.ok) originalData = await originals.json();
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
      for (const [name, translated] of Object.entries(data.folders ?? {})) translationState.folders.set(normalizeLookup(name), translated);

      for (const [originalName, entry] of Object.entries(data.entries ?? {})) {
        if (!entry || typeof entry !== "object") continue;
        const record = { packName, originalName, mapping, entry, original: originalData.packs?.[packName]?.[originalName] };
        const originalKey = normalizeLookup(originalName);
        if (originalKey) {
          packMap.set(originalKey, record);
          addLookupRecord(translationState.byOriginalName, originalKey, record);
        }
        if (packName === "domains") for (const [alias, original] of Object.entries(DOMAIN_NAME_ALIASES)) {
          if (normalizeLookup(original) !== originalKey) continue;
          packMap.set(normalizeLookup(alias), record);
          addLookupRecord(translationState.byOriginalName, normalizeLookup(alias), record);
        }

        for (const [entryKey, value] of Object.entries(entry)) {
          if (!TRANSLATED_LOOKUP_ENTRY_KEYS.has(entryKey)) continue;
          if (typeof value !== "string") continue;
          const translatedKey = normalizeLookup(value);
          addLookupRecord(translationState.byTranslatedName, translatedKey, record);
        }
        for (const [entryKey, value] of Object.entries(record.original?.previous ?? {})) {
          if (TRANSLATED_LOOKUP_ENTRY_KEYS.has(entryKey) && typeof value === "string") addLookupRecord(translationState.byTranslatedName, normalizeLookup(value), record);
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
    .filter((record) => !source.documentName || !record.original?.documentName || record.original.documentName === source.documentName)
    .map((record) => ({ record, score: scoreTranslationRecord(source, record) }))
    .sort((a, b) => b.score - a.score)[0]?.record ?? null;
}

function getTranslationRecordForData(source) {
  if (!translationState.loaded || !source) return null;
  const originalName = source.flags?.[MODULE_ID]?.search?.originalName ?? source.flags?.babele?.originalName;
  if (originalName) {
    const record = chooseTranslationRecord(source, translationState.byOriginalName.get(normalizeLookup(originalName)));
    if (record) return record;
  }
  const provenance = source._stats?.compendiumSource ?? source.flags?.core?.sourceId;
  const match = provenance?.match(/^Compendium\.cain\.([^.]+)\.(?:Item\.)?([^.]+)$/);
  if (match) {
    const record = Array.from(translationState.byPackName.get(match[1])?.values() ?? []).find((candidate) => candidate.original?.id === match[2] || candidate.original?.variants?.some((variant) => variant.id === match[2]));
    if (record) return record;
  }
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
    if (["pages", "results", "text"].includes(targetPath)) continue;
    const current = getByPath(source, targetPath);
    const original = record.original?.fields?.[targetPath];
    const previous = source.flags?.[MODULE_ID]?.applied?.[entryKey];
    const translated = record.entry[entryKey];
    const matchesVariant = record.original?.variants?.some((variant) => !valuesDiffer(current, variant.fields[targetPath]));
    // A matching item name alone is not permission to overwrite a player's changes.
    const previousTranslation = record.original?.previous?.[entryKey];
    if (current !== undefined && !matchesVariant && valuesDiffer(current, original) && valuesDiffer(current, previous) && valuesDiffer(current, previousTranslation) && valuesDiffer(current, translated)) continue;
    setByPath(patch, targetPath, record.entry[entryKey]);
    patch.flags[MODULE_ID].applied ??= {};
    patch.flags[MODULE_ID].applied[entryKey] = cloneValue(translated);
  }
  return hasKeys(patch) ? patch : null;
}

function buildBilingualSearchData(source, record) {
  const terms = new Set();
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.terms);
  addSearchTerm(terms, source?.flags?.[MODULE_ID]?.search?.originalName);
  addSearchTerm(terms, record.originalName);
  if (record.packName === "domains") for (const [alias, original] of Object.entries(DOMAIN_NAME_ALIASES)) {
    if (original === record.originalName) addSearchTerm(terms, alias);
  }

  for (const field of BILINGUAL_SEARCH_FIELDS) addSearchTerm(terms, getByPath(source, field));
  for (const key of TRANSLATED_LOOKUP_ENTRY_KEYS) addSearchTerm(terms, record.entry?.[key]);
  for (const key of ["itemType", "keywords", "blasphemyType"]) addSearchTerm(terms, record.entry?.[key]);

  return {
    originalName: record.originalName,
    terms: Array.from(terms)
  };
}

function applyTranslationToDocument(document) {
  if (!isRussian() || !document?.toObject || !document?.updateSource || !["Item", "RollTable", "JournalEntry"].includes(document.documentName)) return false;
  const source = { ...document.toObject(), documentName: document.documentName };
  const record = getTranslationRecordForData(source);
  const patch = buildTranslationPatch(source);
  if (!patch) return false;

  try {
    if (document.documentName === "RollTable") {
      for (const result of document.results ?? []) {
        const key = result.range?.join("-");
        const translated = record.entry.results?.[key];
        const original = record.original?.fields?.results?.find((entry) => entry._id === result.id);
        const field = "description" in result ? "description" : "text";
        const current = result[field];
        const previous = result.flags?.[MODULE_ID]?.applied;
        if (translated && [original?.[field], previous, record.original?.previous?.results?.[key], translated].includes(current)) result.updateSource({ [field]: translated, [`flags.${MODULE_ID}.applied`]: translated });
      }
    }
    if (document.documentName === "JournalEntry") {
      for (const page of document.pages ?? []) {
        const original = record.original?.fields?.pages?.find((entry) => entry._id === page.id);
        const translated = record.entry.pages?.[original?.name ?? page.name];
        if (!translated) continue;
        const pagePatch = {};
        for (const [field, value] of [["name", translated.name], ["text.content", translated.text]]) {
          const current = getByPath(page.toObject(), field);
          const previous = page.flags?.[MODULE_ID]?.applied?.[field === "name" ? "name" : "content"];
          const oldPage = record.original?.previous?.pages?.[original?.name ?? page.name];
          if (value && [getByPath(original, field), previous, field === "name" ? oldPage?.name : oldPage?.text, value].includes(current)) {
            setByPath(pagePatch, field, value);
            setByPath(pagePatch, `flags.${MODULE_ID}.applied.${field === "name" ? "name" : "content"}`, value);
          }
        }
        if (hasKeys(pagePatch)) page.updateSource(pagePatch);
      }
    }
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
  for (const table of game.tables ?? []) applyTranslationToDocument(table);
  for (const journal of game.journal ?? []) applyTranslationToDocument(journal);
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
    emptyHtml: '<div class="agenda-search-no-results">Подходы не найдены</div>',
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

function setCompendiumRowVisible(row, visible, expandFolders = false) {
  row.hidden = false;
  row.classList.remove("hidden");
  row.style.display = visible ? "" : "none";

  if (!visible) return;
  let folder = row.parentElement?.closest?.(".folder");
  while (folder) {
    folder.hidden = false;
    folder.classList.remove("hidden");
    folder.style.display = "";
    if (expandFolders) {
      folder.classList.add("expanded");
      folder.classList.remove("collapsed");
    }
    folder = folder.parentElement?.closest?.(".folder");
  }
}

function applyBilingualCompendiumFilter(root, pack, query, folderStates) {
  const normalizedQuery = normalizeLookup(query);
  if (!root || !pack) return;
  if (!normalizedQuery) for (const [folder, state] of folderStates ?? []) {
    folder.classList.toggle("expanded", state.expanded);
    folder.classList.toggle("collapsed", state.collapsed);
  }

  const entries = new Map(getPackIndexEntries(pack).map((entry) => [entry._id, entry]));
  const rows = root.querySelectorAll("[data-document-id], [data-entry-id], .directory-item, .compendium-item");

  for (const row of rows) {
    const id = getCompendiumRowId(row);
    const entry = id ? entries.get(id) : null;
    if (!entry && row.classList.contains("folder")) continue;
    if (!entry && !row.textContent?.trim()) continue;

    const terms = entry ? getSearchTermsForData(entry) : [normalizeLookup(row.textContent)];
    const visible = !normalizedQuery || terms.some((term) => term.includes(normalizedQuery));
    setCompendiumRowVisible(row, visible, Boolean(normalizedQuery));
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
  const folderStates = new Map(Array.from(root.querySelectorAll(".folder"), (folder) => [folder, {
    expanded: folder.classList.contains("expanded"),
    collapsed: folder.classList.contains("collapsed")
  }]));
  let wasSearching = false;

  const apply = () => {
    const query = searchInput.val() ?? "";
    const searching = Boolean(normalizeLookup(query));
    if (searching && !wasSearching) {
      folderStates.clear();
      for (const folder of root.querySelectorAll(".folder")) folderStates.set(folder, {
        expanded: folder.classList.contains("expanded"),
        collapsed: folder.classList.contains("collapsed")
      });
    }
    applyBilingualCompendiumFilter(root, pack, query, folderStates);
    wasSearching = searching;
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

  for (const type of ["Item", "RollTable", "JournalEntry"]) {
    Hooks.on(`preCreate${type}`, (document) => {
      if (!shouldTranslateCompendia() || !translationState.loaded) return;
      applyTranslationToDocument(document);
    });
    Hooks.on(`create${type}`, (document) => {
      if (!shouldTranslateCompendia() || !translationState.loaded) return;
      applyTranslationToDocument(document);
    });
  }

  Hooks.on("renderActorSheet", (app, html) => {
    if (!shouldTranslateCompendia()) return;
    applyRuntimeActorTranslations(app.actor);
    installBilingualActorSearch(app, html);
  });

  Hooks.on("renderItemSheet", (app) => {
    if (!shouldTranslateCompendia()) return;
    applyTranslationToDocument(app.item);
  });

  Hooks.on("renderCompendium", async (app, html) => {
    if (!shouldTranslateCompendia()) return;
    const packLike = app.collection ?? app.document ?? app.pack;
    await patchCainCompendiumIndex(packLike);
    installBilingualCompendiumSearch(app, html);
  });
}

function shouldTranslateCompendia() {
  return isCain() && isRussian() && getSetting(SETTINGS.compendia, true);
}

const wrappedReaders = new WeakSet();

function wrapReader(target, key, translate) {
  const original = target?.[key];
  if (typeof original !== "function" || wrappedReaders.has(original)) return;
  const wrapped = async function (...args) {
    const result = await original.apply(this, args);
    if (shouldTranslateCompendia()) translate(result);
    return result;
  };
  wrappedReaders.add(wrapped);
  target[key] = wrapped;
}

async function installSheetDataTranslations() {
  const [{ CainActorSheet }, { CainItemSheet }] = await Promise.all([
    import("/systems/cain/module/sheets/actor-sheet.mjs"),
    import("/systems/cain/module/sheets/item-sheet.mjs")
  ]);
  for (const Sheet of [CainActorSheet, CainItemSheet]) {
    const original = Sheet.prototype.getData;
    if (wrappedReaders.has(original)) continue;
    const wrapped = async function (...args) {
      if (shouldTranslateCompendia()) {
        await loadTranslationIndex();
        if (this.actor) applyRuntimeActorTranslations(this.actor);
        if (this.item) applyTranslationToDocument(this.item);
      }
      if (this.actor) await applySinDossierTranslations(this.actor);
      const data = await original.apply(this, args);
      // The system's bond template asks for abilityName, absent in bondAbility's schema.
      if (shouldTranslateCompendia() && Array.isArray(data.bondAbilities)) {
        data.bondAbilities = data.bondAbilities.map((item) => ({ ...item.toObject(), system: { ...item.system, abilityName: item.name } }));
      }
      return data;
    };
    wrappedReaders.add(wrapped);
    Sheet.prototype.getData = wrapped;
  }
}

function installCompendiumReaders() {
  for (const pack of game.packs ?? []) {
    if (!isCainPack(pack)) continue;
    wrapReader(pack, "getDocument", applyTranslationToDocument);
    wrapReader(pack, "getDocuments", (documents) => documents?.forEach(applyTranslationToDocument));
  }
}

function installSinCreationHooks() {
  Hooks.on("preCreateActor", (actor, data) => {
    if (!shouldTranslateRuntime() || !isSinLikeActor(actor)) return;
    const defaults = originalData.sins?.[actor.system?.sinType];
    if (defaults) {
      const initial = {};
      for (const field of ["palace", "appearance", "traumas", "pressure", "complications", "threats", "attackRoll", "severeAttack", "afflictions", "severeAbilityQuestions", "domains"]) {
        if (defaults[field] !== undefined && (data?.system?.[field] === undefined || !actor.system[field] || ["default", ""].includes(actor.system[field]) || (field === "traumas" && actor.system[field]?.every((entry) => /^Question \d+$/.test(entry.question))))) {
          setByPath(initial, `system.${field}`, defaults[field]);
        }
      }
      actor.updateSource(initial);
    }
    const patch = buildSinDossierPatch(actor);
    if (patch) actor.updateSource(patch);
  });
  Hooks.on("preUpdateActor", (actor, changes) => {
    if (!shouldTranslateRuntime() || !isSinLikeActor(actor)) return;
    const cleared = new Set(actor.flags?.[MODULE_ID]?.emptyDossierFields ?? []);
    for (const field of ["biography", "pressure"]) {
      const key = `system.${field}`;
      if (!Object.hasOwn(changes, key) && !Object.hasOwn(changes.system ?? {}, field)) continue;
      const value = Object.hasOwn(changes, key) ? changes[key] : changes.system[field];
      if (value === "") cleared.add(field);
      else cleared.delete(field);
    }
    setByPath(changes, `flags.${MODULE_ID}.emptyDossierFields`, Array.from(cleared));
    const next = foundry.utils.mergeObject(actor.toObject(), changes, { inplace: false });
    const patch = buildSinDossierPatch({ documentName: "Actor", type: actor.type, system: next.system, flags: next.flags });
    if (patch) foundry.utils.mergeObject(changes, patch);
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
    hint: "Переводит библиотеки и предметы в листах персонажей. Поддерживает интеграцию с Babele.",
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
  installItemTranslationHooks();
  installSinCreationHooks();
  void applyOwnI18nPriority();
});

Hooks.once("setup", async () => {
  if (!isCain() || !isRussian()) return;
  try {
    await loadTranslationIndex();
    await installSheetDataTranslations();
  } catch (error) {
    console.warn("CAIN RU | Could not prepare sheet translations", error);
  }
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
  if (!isCain() || !isRussian()) return;

  await applyOwnI18nPriority();

  if (getSetting(SETTINGS.compendia, true) && getSetting(SETTINGS.showOriginalNames, true) && game.modules.get("babele")?.active) {
    try {
      await game.settings.set("babele", "showOriginalName", true);
    } catch (_err) {
      // Babele may not expose the setting on every version.
    }
  }

  if (getSetting(SETTINGS.compendia, true)) {
    try {
      await loadTranslationIndex();
      applyRuntimeItemTranslations();
      installItemTranslationHooks();
      installCompendiumReaders();
      await patchCainCompendiumIndexes();
    } catch (error) {
      console.warn("CAIN RU | Could not initialize runtime item translations", error);
    }
  }

  await applyRuntimeSinDossierTranslations();
  installCatTextTranslations();
  observeRuntimeText();
});

function installCatTextTranslations() {
  const original = window.formatCatText;
  if (typeof original !== "function" || wrappedReaders.has(original)) return;
  const wrapped = function (...args) {
    const result = original.apply(this, args);
    if (!shouldTranslateRuntime() || typeof result !== "string") return result;
    const holder = document.createElement("div");
    holder.innerHTML = result;
    for (const span of holder.querySelectorAll("span[data-tooltip]")) {
      if (!span.querySelector("img[src*='/assets/CAT/']")) continue;
      const bold = span.querySelector("b");
      if (bold) bold.textContent = translateText(bold.textContent);
      span.dataset.tooltip = span.dataset.tooltip.split(" | ").map((step) => step
        .replace(/^Base CAT:/, "Исходный CAT:")
        .replace(/\(rounded up\)/g, "(округление вверх)")
        .replace(/^Clamped to CAT (\d+) \(min 0, max 7\)$/, "Ограничено до CAT $1 (мин. 0, макс. 7)")
        .replace(/^Result: (.+)$/, (_, value) => `Результат: ${translateText(value)}`)).join(" | ");
    }
    return holder.innerHTML;
  };
  wrappedReaders.add(wrapped);
  window.formatCatText = wrapped;
}

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

Hooks.on("renderActorSheet", (app) => {
  void applySinDossierTranslations(app.actor);
});
