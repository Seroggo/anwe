# Methodology — Designer.theme.interpret

Этот документ объясняет **КАК** Theme Interpreter принимает дизайнерские решения.
**ЧТО** делать — зафиксировано в `prompts/designer.theme.interpret.json`.

Methodology не дублирует prompt. Здесь раскрывается логика принятия решений по группам:
business context, character extraction, reference adaptation, typography, color, spacing,
shape, effects, capability gaps, quality.

Все правила ниже применяются в рамках универсальных theme capabilities ANWE.
Methodology не описывает конкретные CSS-свойства и не привязывается к конкретным сайтам —
это уровень ThemeSpec contract, который будет спроектирован следующим этапом.

---

## 1. Business-context interpretation

Принятие любого визуального решения начинается с нормализации business context.
Не существует «нейтрального» дизайна — выбор всегда выражает позиционирование.

### Что обязательно зафиксировать перед дизайном

1. **Направление продаж**: B2B или B2C.
   - Уточняет роль доказательности, эмоционального вовлечения, ясности предложения и
     ожидаемой сложности сценария.
   - Не предписывает заранее ни палитру, ни типографику, ни плотность, ни декор.
2. **Характер покупки**: transactional или emotional.
   - Помогает определить, какие свойства интерфейса должны поддерживать принятие решения:
     скорость, сравнение, объяснение, атмосферу, доверие или комбинацию этих задач.
   - Не определяет визуальный стиль самостоятельно.
3. **Экспертность аудитории**: expert или mass.
   - Помогает оценить допустимую информационную сложность, потребность в объяснении и
     способ представления доказательств.
   - Не является готовым правилом для density, typography или shape.
4. **Режим доверия**: trust-first или novelty-first.
   - Уточняет баланс между предсказуемостью, доказательностью, дифференциацией и новизной.
   - Не задаёт автоматически нейтральную палитру, экспериментальную типографику или уровень декора.
5. **Ценовое позиционирование**: premium или accessible.
   - Уточняет, какое ощущение ценности, ясности и доступности должно поддерживать решение.
   - Не предписывает конкретную surface hierarchy, contrast mode или decorative intensity.
6. **Техническая или экспрессивная природа**: technical или expressive.
   - Уточняет, что должно сильнее считываться в сообщении темы: точность, характер,
     ясность, эмоциональная выразительность или их обоснованное сочетание.
   - Не предписывает mono, serif, border-led, rounded или иной готовый язык формы.

### Правило совместной интерпретации

Ни один отдельный признак business context не определяет palette, typography, shape,
density или effects самостоятельно.

Каждое решение выводится из совокупности:

```text
Business_type
+ Audience
+ Desired_character
+ Avoid
+ Brand_constraints
+ Reference
```

Если часть этих данных отсутствует, Interpreter фиксирует DATA_GAP или принимает
обоснованный INTERPRETER_DECISION. Отраслевые ожидания и перечисленные факторы — это
сигналы для интерпретации, а не таблица готовых stylistic mappings.

Запрещено правило вида `If industrial → gray`, `If B2B → restrained` или
`If technical → mono`. Даже согласованные по смыслу признаки должны быть проверены на
соответствие полной совокупности brief и constraints.

---

## 2. Visual character extraction (из reference, если есть)

Цель: получить **наблюдаемые**, а не приписываемые свойства reference.

### Процедура

1. Зафиксировать тип reference (DESIGN.md / URL / Screenshots / Brand guide / Verbal / Existing theme).
2. Просмотреть reference на каждом из уровней character (см. список ниже) и зафиксировать
   только то, что **видно**.
3. Если свойство нельзя подтвердить — DATA_GAP, не догадка.
4. Если свойство неприменимо к reference (например, нет форм — corner language = N_A).

### Уровни character

- **Canvas polarity**: light / dark / neutral.
- **Color family**: warm / cool / neutral / accent-tinted.
- **Accent logic**: single-accent / multi-accent / no-accent.
- **Typographic hierarchy**: serif / sans / mono; контраст размеров; ratio.
- **Display character**: statement / confident / quiet.
- **Body character**: text-optimized / readable / technical.
- **Spacing rhythm**: tight / balanced / airy / editorial.
- **Density**: compact / balanced / spacious.
- **Corner language**: square / soft / pill.
- **Border language**: borderless / thin / pronounced.
- **Shadow language**: flat / subtle / pronounced.
- **Surface hierarchy**: flat / layered / strongly layered.
- **Button shape**: rectangular / soft / pill.
- **Visual contrast**: low / medium / high.
- **Decorative intensity**: none / minimal / expressive / heavy.

### Запрет приписывания

Запрещено достраивать свойства reference на основе гипотез. Если на скриншоте не видно
shadow language — это DATA_GAP, а не «предположительно subtle».

---

## 3. Reference adaptation: identity vs literal implementation

Это центральное место для дисциплины REFERENCE ≠ THEME.

### Что такое identity reference

Identity reference — это принципы, которые можно перенести:
- сетка и пропорции;
- типографическая иерархия;
- режим контраста;
- rhythm of spacing;
- характер палитры (warm/cool/neutral, не конкретный hex);
- режим decorative intensity.

### External inspiration и authoritative brand source

Нужно различать происхождение reference и степень его авторитетности.

**External inspiration** — чужой сайт, дизайн или reference для вдохновения. Из него
извлекаются visual principles: сетка, типографическая иерархия, ритм, contrast mode,
цветовой характер и decorative intensity. Его literal brand tokens не копируются
автоматически: конкретные HEX, proprietary fonts, photography, site-specific mechanics
и brand-specific surface treatments требуют отдельного обоснования.

**Owned / authoritative brand source** — собственный brand guide или явно заданные
`Brand_constraints`, `Existing_brand_colors`, `Existing_fonts`. Такие значения могут
быть обязательными design constraints. Например, `Existing_brand_colors.primary =
#e31e24` не заменяется только потому, что это concrete HEX. После принятия значение
нормализуется по правилу `lowercase #RRGGBB`.

Reference сам по себе не считается authoritative brand source, если это прямо не
указано во входе.

### Правило адаптации

1. Извлечь identity-принципы из reference.
2. Подставить business context (Business_type, Audience, Desired_character, Brand_constraints).
3. Если identity-принцип противоречит business context — отбросить или трансформировать,
   зафиксировав решение как INTERPRETER_DECISION.
4. Полученные значения выразить через универсальные theme capabilities ANWE.

Пример: reference — playful pastel SaaS; business — industrial electronics manufacturing.
Interpreter сначала определяет, какие принципы reference поддерживают задачу (например,
clean grid, large typography, simple surfaces), а затем сопоставляет их с полной
совокупностью brief. Palette, density, shape и decorative intensity меняются только при
явном обосновании через audience, desired/avoid character, brand constraints и контекст
покупки; отрасль сама по себе не является причиной конкретной замены.

---

## 4. Typography interpretation

### Что определяется

1. **Display stack** — характер заголовков:
   - geometric sans — один из возможных современных геометрических характеров;
   - grotesque sans — один из возможных нейтральных или уверенных характеров;
   - humanist sans — один из возможных более мягких и читабельных характеров;
   - serif — один из возможных editorial или контрастных характеров;
   - mono — один из возможных акцентных или технических характеров.
2. **Body stack** — читаемость, x-height, line-height-mode (через density).
3. **Mono stack** (если нужен) — технический, neutral.
4. **Weight scale** — набор весов, доступных в production-стеке.
5. **Tracking** — отрицательный для display, нейтральный для body, нулевой для mono.

### Безопасные fallback-категории

Если reference использует proprietary шрифт:
1. Определить character шрифта (geometric / grotesque / humanist / serif / mono).
2. Выбрать ближайший open-source или system fallback:
   - geometric sans → Inter / system-ui sans-serif;
   - grotesque sans → Inter / system-ui sans-serif;
   - humanist sans → Source Sans 3 / system-ui sans-serif;
   - serif → Source Serif 4 / Georgia / system serif;
   - mono → JetBrains Mono / ui-monospace / system monospace.
3. Зафиксировать замену как INTERPRETER_DECISION с обоснованием.
4. ЗАПРЕЩЕНО утверждать, что proprietary шрифт «доступен как open-source».

---

## 5. Color interpretation

### Роли и иерархия

1. **Canvas** — фон страницы; задаёт тон всего интерфейса (warm / cool / neutral / dark).
2. **Surfaces** — карточки, панели, блоки; отличаются от canvas контрастом, не произвольным цветом.
3. **Primary** — основной акцент действия; не должен быть decorative.
4. **Accent** — вспомогательный акцент; либо используется экономно, либо N_A.
5. **Inverse** — для тёмных секций или контрастного текста.
6. **Muted** — нейтральные тона для границ, разделителей, фоновых подложек.
7. **Semantic** (если задача требует) — success / warning / danger; в общем случае N_A.

### Принципы выбора

- Палитра выводится из business context + Desired_character + Audience + Avoid[] + Brand_constraints.
- Палитра НЕ выводится из названия отрасли.
- Canvas и surfaces должны быть согласованы по температуре (warm/cool) и насыщенности.
- Primary не должен конфликтовать с canvas по контрасту.
- Если заданы Existing_brand_colors — они обязаны быть частью палитры или явно
  отклонены с INTERPRETER_DECISION.


### Нормализация цветовых значений

Все итоговые базовые semantic colors Theme Interpreter обязан представлять в формате:

#RRGGBB

HEX нормализован в lowercase `#RRGGBB`: символ `#` и ровно шесть строчных шестнадцатеричных цифр. Канонический regex: `^#[0-9a-f]{6}$`. Это каноническая форма записи цвета темы.

#### Допустимые форматы reference

Reference может использовать разные модели цвета. Допустимо получать reference colors в любом исходном формате:

- HEX short (#FFF) и full (#FFFFFF);
- RGB / RGBA (rgb(86, 69, 212));
- HSL / HSLA (например, `hsl(...)`);
- CSS named colors (white, black, rebeccapurple);
- значения, указанные в DESIGN.md (свободный формат);
- значения, визуально извлечённые из reference.

Исходный формат reference — характеристика источника, а не часть visual identity темы. Он не должен протекать в итоговый контракт темы.

#### Принцип

1. Interpreter принимает дизайнерское решение о самом цвете (canvas / primary / accent / inverse / muted / surface) на основе business context, Desired_character, Audience, Avoid[], Brand_constraints, Reference.
2. После выбора цвета Interpreter нормализует значение в lowercase `#RRGGBB`.
3. Нормализованное значение фиксируется в результате работы skill.

#### Примеры нормализации

- `rgb(86, 69, 212)` → `#5645d4`
- `RGB(10, 21, 48)` → `#0a1530`
- `#FFF` → `#ffffff`
- `white` → `#ffffff`
- `hsl(247, 62%, 55%)` → `#5645d4`
- `rebeccapurple` → `#663399`

Все варианты выше представляют одно дизайнерское решение и дают один и тот же итоговый `#RRGGBB`.

#### Alpha и прозрачность

Базовые semantic colors НЕ должны содержать alpha. Запрещено для базовых цветов:

- `rgba(...)`
- `hsla(...)`
- HEX с alpha (`#RRGGBBAA`, `#RGBA`)
- `transparent`
- 8-символьный hex

Если reference использует прозрачность:

1. определить базовый непрозрачный цвет;
2. сохранить его как `#RRGGBB`;
3. необходимость прозрачности отметить отдельно в decisions;
4. если прозрачность является существенной возможностью, которую текущий ANWE theme layer не умеет выразить стандартным способом — отметить THEME_CAPABILITY_GAP с severity и preservation_strategy.

Alpha не кодируется внутрь базового semantic color. Прозрачность — это свойство эффекта или surface, а не базового color token.

#### Граница между Colors и Effects

Правило нормализации относится к semantic color decisions (группы Colors / Surfaces — там, где хранится сама палитра). Оно НЕ запрещает будущим CSS effects (например, box-shadow, gradient stops) иметь собственную opacity-модель. Effects и semantic colors — разные сущности. На этом этапе CSS не проектируется.

#### Граница ответственности

- INTERPRETER — выбирает цвет и нормализует его в lowercase `#RRGGBB` до формирования результата.
- THEMESPEC (будущий контракт) — валидирует формат записи, но не преобразует значения.
- COMPILER (будущий) — получает уже нормализованные `#RRGGBB`; color normalization не входит в его обязанности.

#### Анти-паттерны нормализации

- primary: "rgb(86, 69, 212)" ЗАПРЕЩЕНО → правильно primary: "#5645d4";
- canvas: "white" ЗАПРЕЩЕНО → правильно canvas: "#ffffff";
- inverse: "#000" ЗАПРЕЩЕНО → правильно inverse: "#000000";
- muted: "rgba(0,0,0,0.4)" ЗАПРЕЩЕНО → базовый цвет нормализовать в #RRGGBB, transparency вынести в decisions и, при необходимости, в THEME_CAPABILITY_GAP;
- primary: "#5645D4" ЗАПРЕЩЕНО (uppercase) → правильно primary: "#5645d4";
- accent: "hsl(247, 62%, 55%)" ЗАПРЕЩЕНО → правильно accent: "#5645d4".
---

## 6. Spacing and density

### Шкала

- Базовая единица (baseline step): обычно 4 или 8.
- Шкала — линейная или слабо-экспоненциальная; не должна быть хаотичной.
- Конкретные значения шкалы — на уровне ThemeSpec; здесь фиксируется density-mode.

### Density-modes

- **Compact** — высокая плотность информации; применима, когда она поддерживает сценарий,
  читаемость и visual character.
- **Balanced** — умеренная плотность; применима, когда ни compact, ни airy не дают
  лучшего обоснованного результата.
- **Airy** — низкая плотность информации; применима, когда пространство поддерживает
  восприятие, иерархию и задачу без ущерба для содержательности.
- **Editorial** — выраженный композиционный ритм и большие паузы; применим, когда это
  обосновано visual character и не мешает целевому сценарию.

### Связь с типографикой

- Compact → уменьшенный line-height, плотный leading, узкие margins.
- Airy → увеличенный line-height, широкие margins.
- Editorial → ритмические пробелы между секциями как часть композиции.

---

## 7. Shape language

### Corner language

- **Square** (0–2px) — строгий геометрический характер, который может поддерживать
  разные visual characters при достаточном обосновании.
- **Slightly rounded** (4–6px) — умеренный геометрический характер без сильного
  стилевого утверждения.
- **Soft rounded** (8–16px) — заметная мягкость формы, применимая при любом business
  type, если она согласована с полным brief.
- **Pill** (full radius) — сильный формальный акцент; может использоваться не только
  в expressive-сценариях и требует явного решения о своей роли.

### Button shape

Согласован с corner language, но не обязан ему следовать:
- Button может быть pill даже при square card language.
- Button может быть square при soft rounded cards — это нормально, если это решение обосновано.

### Surface treatment

- Flat — без теней, только border или tonal shift.
- Subtle — мягкие тени; один из возможных способов выразить layered hierarchy.
- Pronounced — выраженные тени; используются только если их вклад в visual character,
  контраст и hierarchy обоснован, независимо от ярлыков premium, technical или expressive.

---

## 8. Effects

### Border-led vs shadow-led vs flat

- **Border-led** — структура держится на тонких границах.
- **Shadow-led** — структура держится на тенях.
- **Flat** — без границ и теней; только tonal shift.

Ни один effect mode не закреплён за business type, positioning или character label.
Выбор делается по его роли в hierarchy, контрасту, desired/avoid character, constraints
и reference evidence.

### Контраст

- **Low contrast** — accessibility-friendly, мягкий, editorial.
- **Medium contrast** — нейтральный стандарт B2B/B2C.
- **High contrast** — выразительный, energy-driven, акцентный.

### Decorative intensity

- **None** — никаких декоративных элементов.
- **Minimal** — тонкие акценты (small icons, тонкие линии).
- **Expressive** — заметные декоративные элементы (oversized numerals, ритмические метки).
- **Heavy** — декоративная система сама по себе является частью нарратива.

---

## 9. Surfaces (ролевая иерархия)

### Универсальный набор ролей

1. **Canvas** — фон страницы.
2. **Surface** — карточка/панель первого уровня.
3. **Elevated** — карточка/панель над surface (модалка, popover, highlight card).
4. **Overlay** — затемнение/подложка под модальными окнами.
5. **Inverse** — инвертированная секция (тёмная на светлом сайте и наоборот).

Каждая роль имеет согласованный, но отличимый от соседней роли визуальный характер
(контраст к canvas, border, shadow или tonal shift).

### Когда N_A

Если тема плоская (flat) и не использует layered hierarchy — elevated/overlay могут быть N_A
для данной темы. Это нормально и должно быть зафиксировано явно.

---

## 10. Capability gap discipline

### Когда ADAPT

Если reference или задача требуют характеристику, которую ANWE не выражает напрямую,
но общий visual character можно сохранить через другие средства — адаптировать:

- Пример: reference использует parallax; ANWE — нет. Если parallax несущественен для
  character (например, в technical-restrained теме), отбросить без потери character.

### Когда THEME_CAPABILITY_GAP

Если отсутствие характеристики **разрушает character** или **противоречит business context**:

- Пример: reference — expressive playful сайт с rich scroll animation;
  business — premium beauty studio, для которой scroll-driven character критичен;
  ANWE scroll animation не поддерживает → THEME_CAPABILITY_GAP, severity = important,
  preservation_strategy = «сохранить character через типографику, форму и контраст,
  без scroll-mechanics».

### Оформление THEME_CAPABILITY_GAP

Каждый gap описывается:
- characteristic — что не выражается;
- severity — critical / important / minor;
- preservation_strategy — как общий character сохраняется без этой характеристики.

Запрещено «скрыто компенсировать» THEME_CAPABILITY_GAP указанием на «возможный custom CSS».

---

## 11. Quality rule — что значит «хорошая тема»

Хорошая итоговая тема должна быть:

1. **Согласованной** — visual character выдержан во всех шести группах решений.
2. **Соответствующей business context** — тип бизнеса, аудитория, контекст покупки считываются
   в итоговых решениях.
3. **Сохраняющей ключевой visual character** — если reference был technical-restrained,
   итоговая тема не превращается в expressive playful.
4. **Не зависящей от конкретного сайта** — тема применима к reusable Block Library,
   не содержит site-specific decorative mechanics.
5. **Применимой к reusable Block Library** — каждое решение выражено через универсальные
   theme capabilities, без бизнес-специфичных overrides.
6. **Воспроизводимой** — при одинаковом входе структура и coverage совпадают.
7. **Чистой по capability** — все unsupported behaviours оформлены как THEME_CAPABILITY_GAP,
   ни один не реализован тайно через custom CSS.

---

## 12. Анти-методология (чего НЕ делать)

- ❌ Использовать отрасль как источник решения.
- ❌ Требовать proprietary font files.
- ❌ Приписывать reference свойства, которых в нём нет.
- ❌ Делигировать пользователю выбор конкретных значений.
- ❌ Превращать high-level visual character в один-в-один набор hex/font/radius.
- ❌ Скрывать THEME_CAPABILITY_GAP через custom CSS / JS.
- ❌ Смешивать visual character и brand-специфичные decorative mechanics.
- ❌ Использовать reference как готовый рецепт.
- ❌ Применять FALLBACK к CRITICAL-полям.
- ❌ Превращать coverage в формальный отчёт без связи с реальными решениями.
