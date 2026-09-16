# Methodology — site.model.build

Этот документ описывает, как SiteModel Builder превращает валидный `SiteContext v0.1` в `SiteModel v0.1`. Контракт задаёт форму output; prompt задаёт обязательные ограничения; здесь описана логика архитектурных решений.

## 1. Readiness SiteContext

Начни с того, что уже известно: entity, offers, audiences, demand situations, positioning, proof, objections, conversion, required messages, restrictions и `data_gaps`. Не ищи внешние сведения и не компенсируй gaps отраслевыми предположениями.

Есть offer, но нет audience, proof и conversion: можно построить literal `partial` страницу с ясным названием offer и несколькими поддержанными statements. Нет ни entity, ни offer: meaningful page обычно невозможна, поэтому `blocked` с critical `DATA_GAP`.

## 2. Single Page Or Multiple Pages

Один SiteContext по умолчанию создаёт одну home page. Отдельная page создаётся только когда offer или demand situation имеет собственный subject, не дублирует home и поддержан `hero` плюс двумя substantive blocks.

Хорошо: два отдельных предложения с разными фактами, аудиториями и proof могут стать `/assembly/` и `/testing/`.

Плохо: создавать `/faq/`, `/advantages/`, `/quality/` или keyword pages, когда это лишь фрагменты одной home page.

Зафиксируй meaningful decision: почему offer стал отдельной page либо остался section home.

## 3. Hero And Message Hierarchy

У substantive page один hero с главным H1. Сначала объясни сущность и предложение; затем важную аудиторию или ситуацию, если она известна и действительно меняет смысл; затем proof и conversion. Hero не должен быть абстрактным slogan.

Хорошо: `SMD-монтаж печатных плат для малых серий` при подтверждённом offer и demand situation.

Плохо: `Будущее начинается здесь`, потому что предложение неясно.

## 4. Page Architecture And Generic Mapping

Выбирай блок по структуре смысла, а не по семантическому имени секции:

| SiteContext meaning | Generic block |
| --- | --- |
| business and positioning | `hero`, `text` |
| offers, audiences, capabilities | `cards`, `split`, `text` |
| actual sequence | `steps` |
| verified numeric proof | `stats` |
| real visual portfolio or visual narrative | `gallery` |
| supported objections and answers | `faq` |
| known conversion purpose | `cta` |
| public contact information | `contacts` |
| navigation | `header`, `footer` |

Не создавай `services`, `features`, `cases`, `contact`, `pricing` или другой semantic component type. Это роли content, а не renderer components.

## 5. Copy Without Hallucination

Copy можно сокращать, объединять, переформулировать и делать яснее, только опираясь на SiteContext. Каждый factual claim должен быть обоснован: offer description, positioning, proof, objection response, required message или constraint. `do_not_claim`, forbidden messages и constraints блокируют противоречащую формулировку.

Хорошо: из `Запуск от 10 штук без setup fee` создать `Производство от 10 штук без setup fee`.

Плохо: из одного факта о SMD-монтаже написать `Серийное контрактное производство для hardware-компаний`.

Все substantial required messages должны попасть хотя бы на одну relevant page. Required terms сохраняются в исходной форме, если они естественно относятся к содержанию, без keyword stuffing.

## 6. Proof And FAQ

`stats` допускается только для подтверждённого числового business fact. Значение `10` из подтверждения минимальной партии подходит; `3 преимущества`, `100% качество` и `1:1 внимание` не подходят без факта.

Используй `faq` только для `content.faq_candidates` с known answer или objection со `supported_response`. Не создавай вопрос, если ответ неизвестен. Не представляй generated equipment image как доказательство фактического оборудования.

## 7. Conversion And Navigation

CTA полезен, только когда известна conversion purpose. Если conversion связан с lead, quote, consultation, contact или request, создай form shell внутри CTA независимо от наличия backend/destination. Form всегда имеет `transport_status: "unwired"` на raw output; backend подключается на QA stage. Если conversion informational/outbound, `form` остаётся `null`.

Action создаётся только с реальным destination: existing same-page anchor, existing internal page, exact `https`, `mailto:` или `tel:` из SiteContext. Известный goal без destination означает CTA с form shell без action и `DATA_GAP`, не `href: "#"` или fake action.

Header и footer связывают только existing blocks/pages. Header содержит не более одной action. Anchor никогда не пересекает pages: `#proof` должен существовать на той же page.

## 7a. Contacts Production Shell

Для обычного commercial/business site создавай `contacts` block по умолчанию. Если real contact data неизвестны, используй structural placeholders:

- phone: `{"value": "+7 (000) 000-00-00", "href": "tel:+70000000000", "status": "placeholder"}`
- email: `{"value": "example@mail.test", "href": "mailto:example@mail.test", "status": "placeholder"}`
- address: `null` если неизвестен (не создавай fake address)
- legal INN/OGRN: `null` если неизвестны (не создавай fake numbers)
- messengers: `[]` если неизвестны (не создавай placeholder URLs)

Если real values подтверждены в SiteContext, используй их с `status: "confirmed"`. Отсутствие real data фиксируется `DATA_GAP` important, но не удаляет Contacts block. Contacts обычно располагается перед Footer.

## 7b. Form Shell Structure

Form требует минимум одно field и non-empty `submit_label`. Supported field types: `text`, `email`, `tel`, `textarea`. Field names должны быть unique. Типичный lead form:

```text
name (text, required)
company (text, optional) — для B2B
contact (text/email/tel, required)
message (textarea, optional)
```

Не создавай select, checkbox, radio, file upload, date picker, multi-step или conditional fields без явной задачи. Отсутствие form destination/transport фиксируется `DATA_GAP` important, но не удаляет form shell.

## 8. Media, Icons, Variants And Surfaces

Media slot создаётся, когда он структурно необходим: `hero split`, `split`, `cta split`, gallery item. Initial media всегда `{ "src": null, "alt": "", "aspect": "4:3|1:1|3:4", "fit": "cover" }`. `centered` hero/CTA имеют `media: null`; Cards media/icon и Steps icon имеют `null`.

Не выбирай Lucide names, image prompts, изображения, palette, typography или ThemeSpec. Visual Skill делает это позже.

Выбирай variant из структуры: `cards grid` для обычного набора, `horizontal` для длинных равноправных items; `steps horizontal` для короткой последовательности, `vertical` для развёрнутой; `transparent` header только непосредственно перед hero при смысловой необходимости соединить их. Surface отражает semantic emphasis, не декоративное чередование.

## 9. DATA_GAP And BLOCK_LIBRARY_GAP

`DATA_GAP` означает, что SiteContext не даёт данных для нужной copy, proof, audience, destination или другой важной части. Создай literal structure с placeholders, где это допустимо (contacts, form shell). Status всегда определяется максимальной severity: любой `critical` → `blocked`; иначе любой `important` → `partial`; только `minor` issues или отсутствие issues → `ready`.

`BLOCK_LIBRARY_GAP` означает, что известная необходимая функция не выражается 12 blocks: calculator, interactive configurator, map, complex table, catalog или site-specific mechanic. Не добавляй component/registry entry и не маскируй interactive feature prose-блоком. Если gap делает сайт бессодержательным или критичная функция обязательна, выбери `blocked`.

## 10. Duplicate Prevention And Final Validation

Каждый block делает отдельную смысловую работу. Не повторяй hero claim в Cards, Split и CTA без новой информации. Предпочитай меньше blocks с большей information density.

Перед output проверь:

1. JSON соответствует SiteModel schema; ids и paths unique.
2. Каждая substantive page имеет ровно один hero; header first, footer last.
3. Использованы только vocabulary, variants и surfaces контракта.
4. Internal links имеют реальный target; fake href отсутствует.
5. Stats и FAQ имеют подтверждённую основу.
6. Media and icons соблюдают Visual boundary.
7. Все factual claims выводятся из SiteContext, required messages сохранены, forbidden claims отсутствуют.
8. Status детерминированно соответствует максимальной severity issues: `critical` → `blocked`, иначе `important` → `partial`, иначе `ready`.
