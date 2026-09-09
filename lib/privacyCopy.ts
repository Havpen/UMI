export type PrivacySection = {
  id?: string;
  title: string;
  paragraphs: string[];
};

export type PrivacyDoc = {
  kicker: string;
  title: string;
  lead: string;
  law: string;
  operatorPending: string;
  operatorNamed: (name: string, unp: string, address: string) => string;
  hall: string;
  contacts: string;
  sections: PrivacySection[];
};

export const privacyCopy: { ru: PrivacyDoc; en: PrivacyDoc } = {
  ru: {
    kicker: "Редакция от 10.09.2026",
    title: "Политика обработки персональных данных",
    lead:
      "Эта страница описывает, как ресторан UMI обрабатывает данные гостей, которые оставляют заявку на бронь стола или заказ на вынос, и какие технические данные появляются при посещении сайта.",
    law: "Обработка ведётся по Закону Республики Беларусь от 07.05.2021 № 99-З «О защите персональных данных».",
    operatorPending:
      "Полное наименование оператора (юрлицо или ИП) и УНП появятся здесь, как только заказчик их предоставит. До этого оператором по смыслу этой страницы является лицо, которое ведёт ресторан UMI по адресу зала ниже.",
    operatorNamed: (name, unp, address) =>
      `Оператор: ${name}${unp ? `, УНП ${unp}` : ""}${address ? `, юридический адрес: ${address}` : ""}.`,
    hall: "Фактический адрес зала",
    contacts: "По вопросам персональных данных",
    sections: [
      {
        title: "1. Какие данные мы получаем",
        paragraphs: [
          "Заявка на бронь стола: имя, номер телефона, дата и время визита, число гостей, текст комментария.",
          "Заявка на вынос: имя, номер телефона, желаемое время, число персон, комментарий, состав заказа (блюда, количество, сумма).",
          "Технические данные при посещении сайта: адрес страницы, тип браузера и устройства — в том объёме, который передаёт браузер. Сайт размещён на GitHub Pages; журналы обращения (включая IP) может обрабатывать инфраструктура хостинга за пределами Беларуси.",
          "На страницах с картой загружается API Яндекс Карт. Тогда ООО «Яндекс» может получать технические данные визита по своим правилам.",
          "Мы не запрашиваем паспорт, адрес проживания и данные банковской карты. Онлайн-оплаты на сайте нет. Доставка через Яндекс Еду, just-eat.by и clever.by оформляется на их площадках.",
        ],
      },
      {
        title: "2. Зачем обрабатываем",
        paragraphs: [
          "Принять и обработать заявку на стол или на вынос.",
          "Связаться с вами по телефону, чтобы подтвердить заявку.",
          "Передать заявку сотрудникам зала и кухни.",
          "Вести учёт обращений в пределах, нужных для работы ресторана.",
          "Правовое основание обработки заявок — согласие субъекта (ст. 5 Закона). Без двух отметок в форме заявку с сайта отправить нельзя.",
          "Отказ в согласии не мешает смотреть меню и контакты, звонить по телефону +375 29 308-55-56 и бронировать стол звонком.",
        ],
      },
      {
        id: "telegram",
        title: "3. Telegram и передача за пределы Беларуси",
        paragraphs: [
          "Заявки с сайта мы направляем сотрудникам через мессенджер Telegram (Telegram Messenger Inc.). Сообщение содержит указанные вами данные заявки.",
          "Серверы Telegram находятся за пределами Республики Беларусь, в том числе в государствах, которые по оценке уполномоченного органа РБ могут не обеспечивать уровень защиты, сопоставимый с Законом 99-З.",
          "Риски: доступ к данным по праву иностранного государства; иной порядок защиты и обжалования; оператор не полностью контролирует инфраструктуру мессенджера.",
          "Передача в Telegram возможна только если вы дали отдельное согласие в форме. Вы проинформированы об этих рисках до отправки заявки.",
        ],
      },
      {
        title: "4. Кто ещё может увидеть данные",
        paragraphs: [
          "Сотрудники оператора, которым это нужно для брони и выдачи заказа.",
          "Telegram Messenger Inc. — как среда доставки сообщения персоналу.",
          "По закону — государственные органы по их запросу.",
          "При просмотре карты — ООО «Яндекс» как поставщик карт.",
          "Инфраструктура GitHub Pages — технические журналы обращения к сайту.",
          "Агрегаторы доставки получают данные только если вы сами оформляете заказ у них, не через форму UMI.",
        ],
      },
      {
        title: "5. Сколько храним",
        paragraphs: [
          "Заявки на бронь и вынос — до исполнения обращения и 30 дней после даты визита или выдачи заказа, если дольше не требует законодательство.",
          "Настройки языка и темы в cookie браузера — пока вы их не очистите, не дольше срока cookie.",
          "Корзина выноса хранится в sessionStorage браузера и пропадает с закрытием вкладки.",
          "По истечении срока данные удаляем или обезличиваем, если нет иной законной обязанности хранить их.",
        ],
      },
      {
        title: "6. Ваши права",
        paragraphs: [
          "Вы вправе отозвать согласие без объяснения причин; получить информацию об обработке своих данных; требовать изменения неточных данных; требовать прекращения обработки и удаления, если это допускает Закон; обжаловать действия оператора в Национальный центр защиты персональных данных (https://cpd.by) или в суд.",
          "Чтобы отозвать согласие или задать вопрос, позвоните по телефону ресторана. Если на этой странице указана почта — можно написать туда. В обращении укажите телефон, которым пользовались в заявке, и чего хотите: отзыв, уточнение или удаление.",
          "Отзыв согласия не влияет на обработку, уже выполненную до отзыва. Если заявка ещё не исполнена, после отзыва мы можем не продолжить бронь или сбор заказа — об этом сообщим.",
          "Последствия отказа дать согласие на обработку и на передачу в Telegram: заявку с сайта отправить нельзя. Можно позвонить в ресторан.",
        ],
      },
      {
        id: "cookies",
        title: "7. Файлы cookie и локальные данные",
        paragraphs: [
          "Необходимые cookie: язык (umi_lang) и тема оформления (umi_theme). Без них сайт не запомнит выбранный язык и светлую или тёмную тему.",
          "Корзина выноса — в sessionStorage, это не cookie.",
          "Счётчики Яндекс.Метрики и Google Analytics на сайте сейчас не подключаются. Если появятся, аналитические cookie включим только после отдельного согласия.",
        ],
      },
      {
        title: "8. Защита",
        paragraphs: [
          "Доступ к заявкам ограничен сотрудниками, которым это нужно для работы. Переписка в Telegram используется только для обработки обращения. Токены бота и адреса чатов не публикуются на сайте.",
        ],
      },
      {
        title: "9. Изменения",
        paragraphs: [
          "Новая редакция публикуется на этой странице с новой датой. Для уже направленных заявок действует редакция на момент согласия, если Закон не требует иного.",
        ],
      },
    ],
  },
  en: {
    kicker: "Version of 10 September 2026",
    title: "Personal data processing policy",
    lead:
      "This page explains how restaurant UMI processes data of guests who send a table request or a takeaway request, and what technical data appears when you visit the site.",
    law: "Processing follows the Law of the Republic of Belarus of 7 May 2021 No. 99-Z “On personal data protection”.",
    operatorPending:
      "The operator’s full legal name (company or sole trader) and tax ID (UNP) will appear here once the client provides them. Until then, the operator for this page is the person running restaurant UMI at the hall address below.",
    operatorNamed: (name, unp, address) =>
      `Operator: ${name}${unp ? `, UNP ${unp}` : ""}${address ? `, registered address: ${address}` : ""}.`,
    hall: "Hall address",
    contacts: "Personal data enquiries",
    sections: [
      {
        title: "1. What data we receive",
        paragraphs: [
          "Table request: name, phone number, date and time of visit, number of guests, comment.",
          "Takeaway request: name, phone number, preferred time, party size, comment, order (dishes, quantities, total).",
          "Technical data when visiting the site: page address, browser and device type — as sent by the browser. The site is hosted on GitHub Pages; request logs (including IP) may be processed by the hosting infrastructure outside Belarus.",
          "Pages with a map load the Yandex Maps API. Yandex may then receive technical visit data under its own rules.",
          "We do not ask for a passport, home address or bank card details. There is no online payment on this site. Delivery through Yandex Eats, just-eat.by and clever.by is made on their platforms.",
        ],
      },
      {
        title: "2. Why we process it",
        paragraphs: [
          "To receive and handle a table or takeaway request.",
          "To call you and confirm the request.",
          "To pass the request to floor and kitchen staff.",
          "To keep records needed to run the restaurant.",
          "The legal basis for request data is the data subject’s consent (Art. 5 of the Law). Without the two ticks in the form, a request cannot be sent from the site.",
          "Refusing consent does not stop you from viewing the menu and contacts, calling +375 29 308-55-56, or booking by phone.",
        ],
      },
      {
        id: "telegram",
        title: "3. Telegram and transfer outside Belarus",
        paragraphs: [
          "Requests from the site are sent to staff via Telegram (Telegram Messenger Inc.). The message contains the request data you entered.",
          "Telegram servers are outside Belarus, including in states that, in the view of the Belarus authority, may not provide a level of protection comparable to Law 99-Z.",
          "Risks: access under foreign law; a different protection and appeal process; the operator does not fully control the messenger infrastructure.",
          "Transfer via Telegram is possible only if you give a separate consent in the form. You are informed of these risks before sending a request.",
        ],
      },
      {
        title: "4. Who else may see the data",
        paragraphs: [
          "The operator’s staff who need it for the booking or pickup.",
          "Telegram Messenger Inc. — as the channel that delivers the message to staff.",
          "State bodies, where the law requires it.",
          "When you view the map — Yandex as the map provider.",
          "GitHub Pages infrastructure — technical logs of site requests.",
          "Delivery aggregators receive data only if you order with them directly, not through the UMI form.",
        ],
      },
      {
        title: "5. How long we keep it",
        paragraphs: [
          "Table and takeaway requests — until the request is fulfilled and 30 days after the visit or pickup date, unless the law requires longer.",
          "Language and theme cookies — until you clear them, and not beyond the cookie lifetime.",
          "The takeaway cart is kept in the browser’s sessionStorage and disappears when the tab is closed.",
          "After the term we delete or anonymise the data unless another legal duty requires keeping it.",
        ],
      },
      {
        title: "6. Your rights",
        paragraphs: [
          "You may withdraw consent without giving a reason; obtain information about processing; ask for inaccurate data to be corrected; ask for processing to stop and data to be deleted where the Law allows it; appeal to the National Personal Data Protection Centre (https://cpd.by) or to a court.",
          "To withdraw consent or ask a question, call the restaurant. If this page lists an email, you may write there. Give the phone number used in the request and what you want: withdrawal, correction or deletion.",
          "Withdrawal does not undo processing already done. If the request is not yet fulfilled, we may not continue the booking or pickup — we will tell you.",
          "If you refuse consent to processing and to Telegram transfer, a request cannot be sent from the site. You can call the restaurant.",
        ],
      },
      {
        id: "cookies",
        title: "7. Cookies and local data",
        paragraphs: [
          "Necessary cookies: language (umi_lang) and theme (umi_theme). Without them the site cannot remember language or light/dark theme.",
          "The takeaway cart is in sessionStorage, not a cookie.",
          "Yandex Metrica and Google Analytics are not connected. If they appear, analytics cookies will run only after a separate consent.",
        ],
      },
      {
        title: "8. Security",
        paragraphs: [
          "Access to requests is limited to staff who need it for the work. Telegram is used only to handle the request. Bot tokens and chat IDs are not published on the site.",
        ],
      },
      {
        title: "9. Changes",
        paragraphs: [
          "A new version is published on this page with a new date. For requests already sent, the version at the time of consent applies unless the Law requires otherwise.",
        ],
      },
    ],
  },
};
