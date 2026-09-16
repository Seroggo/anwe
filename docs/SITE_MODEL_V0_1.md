# SiteModel v0.1

`SiteModel` описывает render-ready информационную архитектуру сайта ANWE. Он получает факты из `SiteContext` и раскладывает их по страницам и существующей Block Library.

```text
SiteContext: что известно о бизнесе
SiteModel: как этот смысл разложен по страницам и блокам
ThemeSpec: как сайт выглядит
Visual Skill: какие визуалы и иконки нужны
```

Формальный контракт: `contracts/site-model.schema.json`. Поле `schema_version` всегда равно `"0.1"`.

## Top-Level Structure

```json
{
  "schema_version": "0.1",
  "site_id": "example-site",
  "source_context_id": "example-context",
  "title": "Example",
  "description": null,
  "status": "ready",
  "pages": [],
  "decisions": [],
  "issues": []
}
```

`site_id` — stable kebab-case; по умолчанию равен `SiteContext.context_id`. `source_context_id` всегда равен `SiteContext.context_id`. `title` берётся из `business.name`, затем `business.entity_type`, затем `offers[0].name`; новый бренд не придумывается. `description` — краткое фактическое описание или `null`.

Статус детерминированно следует максимальной severity из `issues[]`: хотя бы один `critical` требует `blocked`; при отсутствии `critical`, но наличии `important` требуется `partial`; только `minor` issues или пустой `issues[]` требуют `ready`.

## Pages And Blocks

Страница содержит `id`, `path`, `title`, `description` и `blocks`. Home всегда имеет путь `/`; другие пути имеют форму `/service-name/`. По умолчанию SiteContext становится одной home page. Дополнительная page допустима, только если отдельный offer или demand situation имеет самостоятельный смысл, не повторяет home и поддержан данными для `hero` и минимум двух substantive blocks.

Каждая substantive page имеет ровно один `hero` с непустым H1. `header`, если есть, идёт первым; `footer`, если есть, последним. Идентификаторы blocks semantic и уникальны внутри page.

Разрешённая vocabulary:

| Type | Variants |
| --- | --- |
| `header` | `default`, `transparent` |
| `hero` | `centered`, `split` |
| `text` | `narrow`, `wide` |
| `split` | `media-left`, `media-right` |
| `cards` | `grid`, `horizontal` |
| `steps` | `vertical`, `horizontal` |
| `stats` | `inline`, `grid` |
| `gallery` | `grid`, `featured` |
| `faq` | `stacked` |
| `cta` | `centered`, `split` |
| `contacts` | `default` |
| `footer` | `simple`, `columns` |

`cards.content.columns` задаёт от 1 до 4 колонок, но не является variant. Допустимые semantic surfaces: `default`, `muted`, `accent`, `inverse`. Они выражают смысловой уровень акцента, а не цвет.

## Boundaries

SiteModel использует только приведённые block types. Semantic roles переводятся в generic blocks: offers — `cards`/`split`, process — `steps`, numeric proof — `stats`, FAQ — `faq`, conversion — `cta`, public contacts — `contacts`. Новый component или site-specific block не создаётся. Если нужная механика требует калькулятора, карты, каталога или другого отсутствующего интерактива, фиксируется `BLOCK_LIBRARY_GAP`.

Copy может быть переформулирован и организован, но каждый фактический claim должен выводиться из SiteContext. Нельзя добавлять преимущества, цифры, гарантии, клиентов, сертификаты, географию, сроки или capabilities. `positioning.do_not_claim`, `content.forbidden_messages` и `constraints` имеют приоритет. Все существенные `content.required_messages` должны быть представлены на релевантных pages; `required_terms` используются только по смыслу.

## Actions, Media And Visuals

Action состоит из `label`, `href`, `style`, где style: `primary`, `secondary` или `text`. Contract допускает только `#existing-anchor`, `/existing-page/`, `https://...`, `mailto:...` или `tel:...`; произвольные strings и неизвестные URI schemes запрещены. Semantic validation проверяет target internal links, а provenance external destination остаётся обязанностью skill. `#` и придуманные контакты запрещены. Header содержит максимум одну primary action.

На raw output `site.model.build` media placeholder имеет строго:

```json
{"src": null, "alt": "", "aspect": "4:3", "fit": "cover"}
```

Разрешены только aspects `4:3`, `1:1`, `3:4`. Placeholder обязателен для `hero split`, `split`, `cta split` и каждого gallery item; у `hero centered` и `cta centered` media равно `null`. У Cards media и icon равны `null`; у Steps icon равен `null`. SiteModel не выбирает Lucide names, не генерирует изображения и не определяет ThemeSpec, цвета или шрифты.

## Decisions And Issues

`decisions[]` фиксирует только meaningful structural choices: отдельную page, сохранение offer на home, выбор Stats вместо Cards, отказ от Gallery или осмысленный media split.

`issues[]` имеет `type` (`DATA_GAP` или `BLOCK_LIBRARY_GAP`), `severity` (`critical`, `important`, `minor`), message, context reference и page reference. Неизвестные business data не заполняются отраслевым знанием: вместо этого строится буквальная структура и добавляется `DATA_GAP`.

## Contacts Block

`contacts` block описывает public contact information с поддержкой structural placeholders для production shell.

Минимальная структура:

```json
{
  "id": "contacts",
  "type": "contacts",
  "variant": "default",
  "surface": "default",
  "content": {
    "title": "Контакты",
    "phone": {
      "value": "+7 (000) 000-00-00",
      "href": "tel:+70000000000",
      "status": "placeholder"
    },
    "email": {
      "value": "example@mail.test",
      "href": "mailto:example@mail.test",
      "status": "placeholder"
    },
    "address": null,
    "messengers": [],
    "legal": {
      "name": null,
      "inn": null,
      "ogrn": null
    }
  }
}
```

Phone и email имеют `status`: `confirmed` (real value from SiteContext) или `placeholder` (scaffold). Canonical placeholder values: `+7 (000) 000-00-00` для phone, `example@mail.test` для email. Unknown address остаётся `null`; fake placeholder address не создаётся. Legal INN/OGRN неизвестны → `null`; fake values запрещены.

Messengers array содержит confirmed external messenger links. Placeholder messenger URL не создаётся.

Для commercial site builder создаёт Contacts scaffold по умолчанию даже при отсутствии real contact data; отсутствие данных фиксируется `DATA_GAP`, а не удалением block.

## CTA Form Shell

CTA может содержать optional `form` для lead/quote/consultation conversion. Form либо `null`, либо valid shell:

```json
{
  "form": {
    "id": "request",
    "transport_status": "unwired",
    "fields": [
      {
        "name": "name",
        "type": "text",
        "label": "Имя",
        "placeholder": "Иван",
        "required": true,
        "autocomplete": "name"
      },
      {
        "name": "contact",
        "type": "text",
        "label": "Телефон или email",
        "placeholder": "+7 900 000-00-00 или name@company.ru",
        "required": true,
        "autocomplete": null
      },
      {
        "name": "message",
        "type": "textarea",
        "label": "Сообщение",
        "placeholder": "Опишите задачу",
        "required": false,
        "autocomplete": null
      }
    ],
    "submit_label": "Отправить"
  }
}
```

Supported field types: `text`, `email`, `tel`, `textarea`. Raw SiteModel form всегда имеет `transport_status: "unwired"`; backend подключается на QA/Final Assembly stage. Field names должны быть unique внутри form. Form обязательно содержит минимум одно field и non-empty `submit_label`.

Если conversion goal связан с получением lead/quote/contact/request, builder создаёт form shell независимо от наличия backend/destination; отсутствие transport фиксируется `DATA_GAP`, а не удалением form UI.
