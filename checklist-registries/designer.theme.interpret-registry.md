# Capability Registry — Designer.theme.interpret

Это **канонический список аспектов визуальной темы**, которые Theme Interpreter обязан
рассмотреть при работе. Это не audit checklist и не набор pass/fail-проверок.
Это перечень выразительных аспектов темы, для каждого из которых зафиксировано,
что именно Interpreter должен решить, на основе чего, какой статус может присвоить
и при каких условиях фиксируется gap.

## Статусы

- `REPRESENTABLE` — ANWE способен выразить аспект через стандартную тему.
- `DATA_GAP` — недостаточно входных данных, чтобы уверенно принять решение.
- `N_A` — аспект несущественен для данной темы.
- `THEME_CAPABILITY_GAP` — аспект не выражается текущим theme layer ANWE.

## Группы

- T001–T009 Colors
- T010–T019 Typography
- T020–T029 Spacing & density
- T030–T039 Shape
- T040–T049 Effects
- T050–T059 Surfaces
- T060–T069 Reference adaptation
- T070–T079 Capability gaps

ThemeSpec field mapping будет определён на следующем этапе. Здесь фиксируется только
логика рассмотрения аспекта.

---

## Colors (T001–T009) — canonical format: lowercase `#RRGGBB`; alpha запрещён

### Групповые правила Colors

Эти правила обязательны для всех capabilities группы Colors (T001–T009) и применяются к любому итоговому базовому semantic color.

**Canonical output format.** Каждый итоговый базовый semantic color обязан быть записан в формате `lowercase #RRGGBB`: символ `#` и ровно шесть строчных шестнадцатеричных цифр. Канонический regex: `^#[0-9a-f]{6}$`. Это каноническая форма записи цвета темы. Никакой другой формат не допустим в результате работы skill.

**Допустимые форматы reference.** Reference может использовать любую модель цвета: HEX short/full, RGB, RGBA, HSL, HSLA, CSS named colors, значения из DESIGN.md, значения, визуально извлечённые из reference. Исходный формат reference не должен протекать в итог — Interpreter обязан нормализовать выбранное значение в `#RRGGBB` до формирования результата.

**Alpha запрещён в базовых цветах.** Базовые semantic colors НЕ должны содержать alpha. Запрещено: `rgba(...)`, `hsla(...)`, HEX с alpha (`#RRGGBBAA`, `#RGBA`), `transparent`, 8-символьный hex. Если reference использует прозрачность, базовый цвет нормализуется в `#RRGGBB`, а необходимость прозрачности фиксируется отдельно в decisions или THEME_CAPABILITY_GAP.

**Uppercase запрещён.** `#5645D4` — ЗАПРЕЩЕНО. Правильно: `#5645d4`. Это касается каждого цветового решения в группе.

**Граница между Colors и Effects.** Правило нормализации относится только к semantic color decisions (группы Colors / Surfaces). Оно НЕ запрещает будущим CSS effects (например, box-shadow, gradient stops) иметь собственную opacity-модель. Effects и semantic colors — разные сущности.

**Граница ответственности.** INTERPRETER выбирает цвет и нормализует его в lowercase `#RRGGBB` до формирования результата. THEMESPEC (будущий контракт) валидирует формат записи, но не преобразует значения. COMPILER (будущий) получает уже нормализованные `#RRGGBB` и не выполняет color normalization.

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T001 | Colors | Какой canvas (фон страницы) подходит теме? | Полярность (light/dark/neutral), температура (warm/cool/neutral), базовая насыщенность | Business_type, Desired_character, Audience, Reference canvas polarity | REPRESENTABLE / DATA_GAP / N_A | Не задан ни один источник, дающий указание на полярность — DATA_GAP |
| T002 | Colors | Какой primary акцент уместен? | Характер primary (technical / brand / emotional), насыщенность, контраст к canvas | Desired_character, Brand_constraints, Existing_brand_colors | REPRESENTABLE / DATA_GAP / N_A | Запрет через Avoid[] или невозможность соблюсти контраст — N_A, иначе отсутствие указания — DATA_GAP |
| T003 | Colors | Нужен ли secondary accent? | Присутствие, роль, ограничение использования | Desired_character, бизнес-задача (multi-CTA / mono-CTA) | REPRESENTABLE / DATA_GAP / N_A | Бизнес требует ровно один CTA → N_A |
| T004 | Colors | Как устроены surfaces относительно canvas? | Тональный shift, контраст к canvas, режим (flat / layered) | Reference surface hierarchy, Desired_character | REPRESENTABLE / DATA_GAP / N_A | Плоская тема без surfaces — N_A |
| T005 | Colors | Нужна ли inverse-секция? | Полярность inverse, контраст к canvas | Desired_character, Reference (если есть инвертированные блоки) | REPRESENTABLE / DATA_GAP / N_A | В теме нет ни одной инвертированной секции — N_A |
| T006 | Colors | Какие muted-роли нужны? | Границы, разделители, фоновые подложки, второстепенный текст | Reference border/shadow language, Desired_character | REPRESENTABLE / DATA_GAP / N_A | Тема полностью без границ и подложек — N_A |
| T007 | Colors | Нужны ли semantic-цвета (success/warning/danger)? | Набор ролей, достаточность контраста, согласованность с палитрой | Business_type (например, B2B-кабинеты часто требуют), Site_context | REPRESENTABLE / DATA_GAP / N_A | Лендинг без интерактивных форм — N_A |
| T008 | Colors | Согласованы ли Existing_brand_colors с итоговой палитрой, включая нормализацию формата? | Включение, исключение, замена с INTERPRETER_DECISION; обязательная нормализация всех выбранных значений в lowercase `#RRGGBB` (alpha исключается, short hex расширяется) | Existing_brand_colors, Brand_constraints | REPRESENTABLE / DATA_GAP / THEME_CAPABILITY_GAP | Значение невозможно однозначно нормализовать в `#RRGGBB` из доступного source или содержит существенную alpha-зависимость, которую ANWE не выражает стандартно; конфликт с Desired_character сам по себе решается INTERPRETER_DECISION, а THEME_CAPABILITY_GAP фиксируется только при невыразимой существенной характеристике |
| T009 | Colors | Соответствует ли итоговая палитра контрастным требованиям ANWE? | Минимальный контраст text/canvas и primary/canvas | Решения T001–T008 | REPRESENTABLE / THEME_CAPABILITY_GAP | Контраст ниже допустимого — THEME_CAPABILITY_GAP |

## Typography (T010–T019)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T010 | Typography | Какой display character подходит? | Statement / confident / quiet | Desired_character, Business_type | REPRESENTABLE / DATA_GAP / N_A | — |
| T011 | Typography | Какой display stack выбран? | Категория (geometric / grotesque / humanist / serif / mono), конкретное семейство с учётом open/system policy | T010, Reference, Existing_fonts | REPRESENTABLE / DATA_GAP / THEME_CAPABILITY_GAP | Только proprietary с недоступным fallback — THEME_CAPABILITY_GAP |
| T012 | Typography | Какой body character подходит? | Text-optimized / readable / technical | Audience, Desired_character | REPRESENTABLE / DATA_GAP / N_A | — |
| T013 | Typography | Какой body stack выбран? | Категория и семейство, согласованное с display | T012, T011 | REPRESENTABLE / DATA_GAP / THEME_CAPABILITY_GAP | Аналогично T011 |
| T014 | Typography | Нужен ли mono stack? | Присутствие, роль (code blocks, technical metadata, технические таблицы) | Business_type, Reference | REPRESENTABLE / N_A | Тема без technical/technical-confident character — N_A |
| T015 | Typography | Какой weight scale используется? | Набор весов (например, 400/500/600/700), согласованность с display/body | T011, T013, Desired_character | REPRESENTABLE / DATA_GAP / N_A | — |
| T016 | Typography | Какой tracking policy? | Tracking для display (отрицательный/нейтральный), body (нейтральный), mono (нулевой) | Desired_character, T010 | REPRESENTABLE / DATA_GAP / N_A | — |
| T017 | Typography | Нужны ли кастомные tracking для акцентных элементов (eyebrow, метки, tag)? | Значение, контекст применения | Desired_character | REPRESENTABLE / N_A | Тема без eyebrow/меток — N_A |
| T018 | Typography | Какая fallback policy? | System fallback chain для display/body/mono | T011, T013, T014 | REPRESENTABLE / DATA_GAP / N_A | — |
| T019 | Typography | Все ли proprietary шрифты заменены на safe fallback с INTERPRETER_DECISION? | Наличие записи в decisions для каждого unavailable шрифта | Reference, Existing_fonts | REPRESENTABLE / THEME_CAPABILITY_GAP | Хотя бы один unavailable шрифт остался без замены — THEME_CAPABILITY_GAP |

## Spacing & density (T020–T029)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T020 | Spacing | Какой baseline step выбран? | 4 или 8 (или иное значение, если обосновано) | Desired_character, density-mode | REPRESENTABLE / DATA_GAP / N_A | — |
| T021 | Spacing | Какой spacing scale? | Набор значений, линейность или слабая экспонента | T020, Desired_character | REPRESENTABLE / DATA_GAP / N_A | — |
| T022 | Spacing | Какой density-mode у темы? | Compact / balanced / airy / editorial | Audience, Desired_character, Business_type, Reference | REPRESENTABLE / DATA_GAP / N_A | — |
| T023 | Spacing | Какой section rhythm? | Расстояния между крупными секциями, ритмические паузы | T022, Desired_character, Reference | REPRESENTABLE / DATA_GAP / N_A | — |
| T024 | Spacing | Какой inline rhythm (line-height-mode для body)? | Плотный / нормальный / увеличенный | T022, T012 | REPRESENTABLE / DATA_GAP / N_A | — |
| T025 | Spacing | Нужны ли ритмические метки (oversized numerals, разделители секций)? | Присутствие, частота | Desired_character | REPRESENTABLE / N_A | Тема restrained без expressive элементов — N_A |
| T026 | Spacing | Допустим ли контент-перепад (например, гигантский display рядом с плотным текстом)? | Присутствие, степень | Desired_character | REPRESENTABLE / N_A | — |
| T027 | Spacing | Учитывается ли responsive behaviour spacing-шкалы? | Поведение на узких viewport (сохранение пропорций или сжатие) | Site_context, Audience | REPRESENTABLE / DATA_GAP / N_A | Site_context не задан — DATA_GAP |
| T028 | Spacing | Согласован ли spacing с типографикой? | Проверка: увеличение display не ломает rhythm | T020–T026, T010–T019 | REPRESENTABLE / DATA_GAP / N_A | — |
| T029 | Spacing | Согласован ли spacing с corner language (square vs soft)? | Проверка: square corner + airy spacing не создают ощущение пустоты | T030+ | REPRESENTABLE / DATA_GAP / N_A | — |

## Shape (T030–T039)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T030 | Shape | Какой corner language у темы? | Square / slightly rounded / soft rounded / pill | Desired_character, Reference, Business_type | REPRESENTABLE / DATA_GAP / N_A | — |
| T031 | Shape | Какой card radius (если есть cards)? | Значение в базовых единицах | T030 | REPRESENTABLE / N_A | Тема без cards — N_A |
| T032 | Shape | Какой button shape? | Rectangular / soft / pill; согласованность с T030 | Desired_character, T030 | REPRESENTABLE / DATA_GAP / N_A | — |
| T033 | Shape | Нужны ли элементы с другим radius (например, pills для tags)? | Присутствие, значение | Desired_character, T030 | REPRESENTABLE / N_A | Тема без tag/chip — N_A |
| T034 | Shape | Допустимы ли смешанные формы в одной теме? | Где граница согласованности | T030, T032, T033 | REPRESENTABLE / N_A | — |
| T035 | Shape | Используются ли круги / сильные формы для акцентов? | Присутствие, роль | Desired_character | REPRESENTABLE / N_A | Тема restrained/technical без кругов — N_A |
| T036 | Shape | Согласован ли corner language с density-mode? | Проверка: square + airy; pill + compact и т.п. | T030, T022 | REPRESENTABLE / DATA_GAP / N_A | — |
| T037 | Shape | Согласован ли corner language с visual character? | Проверка: technical → square; friendly → soft; playful → pill | T030, Desired_character | REPRESENTABLE / DATA_GAP / N_A | — |
| T038 | Shape | Требует ли reference нестандартный clipping (organic shapes, SVG masks)? | Присутствие, существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | Нестандартный clipping существенен для character → THEME_CAPABILITY_GAP |
| T039 | Shape | Зафиксирована ли scale corner-radii (не одно значение)? | Набор значений для разных surface-ролей | T030–T035 | REPRESENTABLE / DATA_GAP / N_A | — |

## Effects (T040–T049)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T040 | Effects | Какой effect mode выбран? | Border-led / shadow-led / flat | Desired_character, Reference | REPRESENTABLE / DATA_GAP / N_A | — |
| T041 | Effects | Какой border language? | Borderless / thin / pronounced | T040, Desired_character | REPRESENTABLE / N_A | Тема flat без границ — N/A |
| T042 | Effects | Какой shadow language? | Flat / subtle / pronounced | T040, Desired_character | REPRESENTABLE / N/A | Тема flat или border-led — N_A |
| T043 | Effects | Какой visual contrast? | Low / medium / high | Desired_character, Reference, Business_type | REPRESENTABLE / DATA_GAP / N_A | — |
| T044 | Effects | Какой decorative intensity? | None / minimal / expressive / heavy | Desired_character, Reference | REPRESENTABLE / DATA_GAP / N_A | — |
| T045 | Effects | Используются ли oversized numerals / метки как декоративный приём? | Присутствие, роль | Reference, Desired_character | REPRESENTABLE / N_A | Тема restrained без oversized numerals — N_A |
| T046 | Effects | Используются ли тонкие линии / ритмические разделители? | Присутствие, частота | Reference, Desired_character | REPRESENTABLE / N_A | Тема без разделителей — N_A |
| T047 | Effects | Требуется ли scroll animation (parallax, reveal, sticky transforms)? | Присутствие, существенность для character | Reference, Desired_character | REPRESENTABLE / THEME_CAPABILITY_GAP | Любая существенная scroll animation → THEME_CAPABILITY_GAP (текущий theme layer ANWE не поддерживает) |
| T048 | Effects | Требуется ли 3D / WebGL? | Присутствие, существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | 3D/WebGL требуется → THEME_CAPABILITY_GAP |
| T049 | Effects | Требуется ли SVG morphing / complex SVG animation? | Присутствие, существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | SVG morphing требуется → THEME_CAPABILITY_GAP |

## Surfaces (T050–T059)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T050 | Surfaces | Какая иерархия surface-ролей у темы? | Canvas / Surface / Elevated / Overlay / Inverse — какие присутствуют | Desired_character, Reference, Site_context | REPRESENTABLE / DATA_GAP / N_A | — |
| T051 | Surfaces | Как отличается canvas от surface? | Тональный shift / border / shadow | T050, T040 | REPRESENTABLE / N_A | Тема плоская без surface — N_A |
| T052 | Surfaces | Как отличается elevated от surface? | Тень / граница / tonal shift | T050, T040 | REPRESENTABLE / N_A | Тема без elevated — N_A |
| T053 | Surfaces | Нужна ли overlay-роль (затемнение под модальными)? | Присутствие, степень затемнения | Site_context | REPRESENTABLE / N_A | Site_context без модальных окон — N_A |
| T054 | Surfaces | Нужна ли inverse-роль (тёмная секция на светлом сайте)? | Присутствие, контраст | Desired_character, Reference | REPRESENTABLE / N_A | Тема без инвертированных секций — N_A |
| T055 | Surfaces | Согласована ли surface-иерархия с effect mode? | Проверка: flat + flat + flat = валидно; flat + pronounced shadow = противоречие | T040, T050–T054 | REPRESENTABLE / DATA_GAP / N_A | — |
| T056 | Surfaces | Используется ли surface-иерархия как нарратив (например, layered storytelling)? | Присутствие, роль | Desired_character, Reference | REPRESENTABLE / N_A | Тема flat без narrative — N_A |
| T057 | Surfaces | Требуется ли glass / blur (backdrop-filter)? | Присутствие, существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | Backdrop-filter существенен → THEME_CAPABILITY_GAP (если текущий theme layer не поддерживает) |
| T058 | Surfaces | Требуется ли non-standard clipping на surface-ролях? | Присутствие, существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | Аналогично T038 |
| T059 | Surfaces | Согласованы ли surface-роли с corner language? | Проверка: inverse + pill = валидно? square + pill = противоречие | T030, T050–T054 | REPRESENTABLE / DATA_GAP / N_A | — |

## Reference adaptation (T060–T069)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T060 | Reference adaptation | Reference присутствует? | Да / нет | Reference | REPRESENTABLE / N_A | Reference = None → N/A для всех T061–T068 |
| T061 | Reference adaptation | Какой тип reference? | DESIGN.md / URL / Screenshots / Brand guide / Verbal / Existing theme | Reference | REPRESENTABLE / DATA_GAP | Тип не определён — DATA_GAP |
| T062 | Reference adaptation | Что составляет identity reference (принципы)? | Сетка, иерархия, rhythm, контраст, decorative intensity, цветовой характер | Reference | REPRESENTABLE / DATA_GAP / N_A | Identity не выводится из reference — DATA_GAP |
| T063 | Reference adaptation | Что в reference относится к literal implementation и НЕ переносится? | Hex-коды, proprietary шрифты, photography, site-specific mechanics | Reference | REPRESENTABLE / DATA_GAP / N_A | — |
| T064 | Reference adaptation | Где reference конфликтует с business context? | Список конфликтов | Reference vs Business_type / Audience / Desired_character / Brand_constraints / Avoid | REPRESENTABLE / N_A | Reference согласован → N_A |
| T065 | Reference adaptation | Какая preservation_strategy для каждого конфликта? | Сохраняем принцип / отбрасываем / трансформируем | T064 | REPRESENTABLE / N_A | — |
| T066 | Reference adaptation | Что сохранено из reference (финальный набор identity-принципов)? | Перечень перенесённых принципов | T062, T065 | REPRESENTABLE / N_A | Reference = None → N_A |
| T067 | Reference adaptation | Что отброшено из reference и почему? | Перечень с обоснованием | T063, T064 | REPRESENTABLE / N_A | — |
| T068 | Reference adaptation | Насколько итоговая тема соответствует character reference? | Степень близости, осознанные отклонения | T066, T067 | REPRESENTABLE / DATA_GAP / N_A | — |
| T069 | Reference adaptation | Если reference отсутствует — тема построена из business context самостоятельно? | Полнота построения, наличие INTERPRETER_DECISION записей | Business_type, Audience, Desired_character, Brand_constraints | REPRESENTABLE / DATA_GAP | CRITICAL-полей нет → DATA_GAP; иначе INTERPRETER_DECISION |

## Capability gaps (T070–T079)

| ID | Group | Question | What interpreter must decide | Evidence/source | Possible status | Gap condition |
|----|-------|----------|------------------------------|-----------------|-----------------|---------------|
| T070 | Capability gaps | Какие THEME_CAPABILITY_GAP обнаружены? | Полный список | T038, T047, T048, T049, T057, T058 | REPRESENTABLE / N_A | Если gaps нет — N/A |
| T071 | Capability gaps | Какова severity каждого gap? | Critical / important / minor | T070 | REPRESENTABLE / N_A | — |
| T072 | Capability gaps | Какая preservation_strategy для каждого gap? | Что сохраняем из character; чем компенсируем | T070, T071 | REPRESENTABLE / N_A | — |
| T073 | Capability gaps | Требуется ли scroll animation? | Существенность, возможность адаптации | T047 | REPRESENTABLE / THEME_CAPABILITY_GAP | Существенно → THEME_CAPABILITY_GAP |
| T074 | Capability gaps | Требуется ли 3D / WebGL? | Существенность | T048 | REPRESENTABLE / THEME_CAPABILITY_GAP | — |
| T075 | Capability gaps | Требуется ли SVG morphing? | Существенность | T049 | REPRESENTABLE / THEME_CAPABILITY_GAP | — |
| T076 | Capability gaps | Требуется ли non-standard clipping? | Существенность | T038, T058 | REPRESENTABLE / THEME_CAPABILITY_GAP | — |
| T077 | Capability gaps | Требуется ли backdrop-filter / blur? | Существенность | T057 | REPRESENTABLE / THEME_CAPABILITY_GAP | — |
| T078 | Capability gaps | Требуется ли сложная layered parallax? | Существенность | Reference | REPRESENTABLE / THEME_CAPABILITY_GAP | — |
| T079 | Capability gaps | Требуется ли site-specific decorative mechanics (не выражаемые универсальной темой)? | Существенность, возможность замены | Reference, Desired_character | REPRESENTABLE / THEME_CAPABILITY_GAP | Site-specific механика существенна → THEME_CAPABILITY_GAP |

---

## Использование registry

Registry используется Theme Interpreter как канонический список аспектов, которые
обязаны быть рассмотрены. На уровне run-time он не превращается в pass/fail-проверки —
это coverage по группам, где для каждой группы считаются счётчики
`REPRESENTABLE / DATA_GAP / N_A / THEME_CAPABILITY_GAP`.

Маппинг аспектов registry в поля ThemeSpec contract будет определён на следующем этапе.
Здесь не фиксируется ни одно поле будущего ThemeSpec — только логика рассмотрения.
