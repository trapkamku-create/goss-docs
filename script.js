// --- Герб в base64 (загружается один раз) ---
let gerbBase64 = '';

fetch('https://s.fotora.ru/dad9f51f0ff6ab7e.png')
    .then(res => res.blob())
    .then(blob => {
        const reader = new FileReader();
        reader.onload = () => { gerbBase64 = reader.result; };
        reader.readAsDataURL(blob);
    });

// --- Стартовый экран ---
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-portal').classList.remove('hidden');
});

// --- Переключение полей в зависимости от типа документа ---
document.getElementById('doc-type').addEventListener('change', (e) => {
    const value = e.target.value;
    document.querySelectorAll('.fields-group').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('fields-' + value);
    if (target) target.classList.remove('hidden');
});

// --- Переключение разделов ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('section-laws').classList.add('hidden');
        document.getElementById('section-docs').classList.add('hidden');
        document.querySelectorAll('.section-placeholder').forEach(el => el.style.display = 'none');

        const section = btn.dataset.section;

        if (section === 'laws') {
            document.getElementById('section-laws').classList.remove('hidden');
        } else if (section === 'docs') {
            const authTime = sessionStorage.getItem('osb_auth_time');
            const sixHours = 6 * 60 * 60 * 1000;
            const now = Date.now();

            if (authTime && (now - parseInt(authTime)) < sixHours) {
                document.getElementById('section-docs').classList.remove('hidden');
            } else {
                sessionStorage.removeItem('osb_auth_time');
                document.getElementById('password-modal').classList.remove('hidden');
                document.getElementById('password-input').value = '';
                document.getElementById('password-error').classList.add('hidden');
            }
        } else {
            document.getElementById('section-' + section).style.display = 'block';
        }
    });
});

// --- Проверка пароля ---
const CORRECT_PASSWORD = 'OSB-837-D04-2193';

document.getElementById('password-submit').addEventListener('click', () => {
    const input = document.getElementById('password-input').value;
    if (input === CORRECT_PASSWORD) {
        sessionStorage.setItem('osb_auth_time', Date.now().toString());
        document.getElementById('password-modal').classList.add('hidden');
        document.getElementById('section-docs').classList.remove('hidden');
    } else {
        document.getElementById('password-error').classList.remove('hidden');
    }
});

document.getElementById('password-cancel').addEventListener('click', () => {
    document.getElementById('password-modal').classList.add('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-section="laws"]').classList.add('active');
    document.getElementById('section-laws').classList.remove('hidden');
});

document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password-submit').click();
    }
});

// --- Загрузка законов ---
let lawsData = {};

fetch('laws.json')
    .then(res => res.json())
    .then(data => {
        lawsData = data;
        renderLawsList(Object.keys(data));
    });

function renderLawsList(keys) {
    const list = document.getElementById('laws-list');
    list.innerHTML = '';
    keys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'law-item';
        div.textContent = key;
        div.addEventListener('click', () => showLaw(key, div));
        list.appendChild(div);
    });
}

function showLaw(key, el) {
    document.querySelectorAll('.law-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('laws-content').textContent = lawsData[key] || 'Нет данных.';
}

document.getElementById('laws-search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = Object.keys(lawsData).filter(key => key.toLowerCase().includes(query));
    renderLawsList(filtered);
});

// --- Переключение темы ---
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// --- Генерация DOCX ---
document.getElementById('download-btn').addEventListener('click', () => {

    const docTypeSelect = document.getElementById('doc-type');
    const docType = docTypeSelect.value;
    const docTypeText = docTypeSelect.options[docTypeSelect.selectedIndex].text;

    const signatureFile = document.getElementById('signature-upload').files[0];
    const stampFile = document.getElementById('stamp-upload').files[0];

    function readFileAsDataURL(file) {
        return new Promise((resolve) => {
            if (!file) return resolve('');
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    Promise.all([readFileAsDataURL(signatureFile), readFileAsDataURL(stampFile)])
        .then(([signatureData, stampData]) => {

            const signatureHtml = signatureData
                ? `<img src="${signatureData}" style="height: 60px;" />`
                : '_______________________';

            const stampHtml = stampData
                ? `<img src="${stampData}" style="height: 120px;" />`
                : '<p style="color: #999; font-style: italic;">(место для печати)</p>';

            // Маленький герб по центру (серо-белый эффект через filter)
            const gerb = gerbBase64
                ? `<div style="text-align: center; margin-bottom: 5px;">
                    <img src="${gerbBase64}"
                         width="70" height="70"
                         style="width: 70px; height: 70px; object-fit: contain; display: inline-block;" />
                   </div>`
                : '';

            const header = `<p style="text-align: center; font-weight: bold; font-size: 13pt; margin: 0;">
                ГОСУДАРСТВЕННАЯ АВТОМОБИЛЬНАЯ ИНСПЕКЦИЯ<br/>
                ПО НИЖЕГОРОДСКОЙ ОБЛАСТИ<br/>
                ОТДЕЛ СОБСТВЕННОЙ БЕЗОПАСНОСТИ
            </p>`;

            function buildSignatureBlock(position, rank, name) {
                return `
                    <div style="margin-top: 60px; page-break-inside: avoid;">
                        <table style="width: 100%; page-break-inside: avoid;">
                            <tr>
                                <td style="width: 50%; vertical-align: top; page-break-inside: avoid;">
                                    <p style="margin: 0;">${position || '_____________________'}</p>
                                    <p style="margin: 0;">${rank || '_____________________'}</p>
                                </td>
                                <td style="width: 50%; text-align: right; vertical-align: top; page-break-inside: avoid;">
                                    ${signatureHtml}
                                    <p style="margin: 0;">${name || '_____________________'}</p>
                                </td>
                            </tr>
                        </table>
                        <div style="text-align: center; margin-top: 30px;">${stampHtml}</div>
                    </div>
                `;
            }

            let htmlContent = '';

            if (docType === 'postanovlenie') {
                const incidentDate = document.getElementById('incident-date').value;
                const incidentTime = document.getElementById('incident-time').value;
                const incidentPlace = document.getElementById('incident-place').value;
                const applicantName = document.getElementById('applicant-name').value;
                const checkPosition = document.getElementById('check-position').value;
                const checkRank = document.getElementById('check-rank').value;
                const checkName = document.getElementById('check-name').value;
                const inspectorPosition = document.getElementById('inspector-position').value;
                const inspectorRank = document.getElementById('inspector-rank').value;
                const inspectorName = document.getElementById('inspector-name').value;
                const responsiblePosition = document.getElementById('responsible-position').value;
                const responsibleRank = document.getElementById('responsible-rank').value;
                const responsibleName = document.getElementById('responsible-name').value;
                const signerPosition = document.getElementById('signer-position').value;
                const signerRank = document.getElementById('signer-rank').value;
                const signerName = document.getElementById('signer-name').value;
                const situation = document.getElementById('situation').value;

                htmlContent = `
                    ${gerb}
                    ${header}
                    <h1 style="text-align: center; font-size: 16pt; margin: 25px 0;">П О С Т А Н О В Л Е Н И Е</h1>
                    <p style="text-align: center; margin-top: -15px;">${docTypeText}</p>
                    <p style="text-align: justify;">
                        На основании обращения руководства и в соответствии с требованиями действующего законодательства,
                        в целях всестороннего и объективного выяснения обстоятельств, связанных с инцидентом,
                        произошедшим ${incidentDate} в ${incidentTime} по адресу: ${incidentPlace},
                        поступившего от ${applicantName},
                    </p>
                    <h2 style="text-align: center; font-size: 14pt; margin: 25px 0;">П О С Т А Н О В Л Я Ю</h2>
                    <p>1. Начать служебную проверку в отношении ${checkPosition}, ${checkRank}, ${checkName},
                    по факту совершения неправомерных действий ${incidentDate} примерно в ${incidentTime},
                    по адресу: ${incidentPlace}.</p>
                    <p>2. Выявить все обстоятельства происшествия, в том числе:</p>
                    <p style="margin-left: 20px;">- определить мотивы и причины действий проверяемого сотрудника;</p>
                    <p style="margin-left: 20px;">- установить фактические соблюдения внутренних нормативных актов,
                    включая пункт 6 части 1 статьи 8 Дисциплинарного устава полиции.</p>
                    <h3 style="font-size: 13pt; margin-top: 25px;">В рамках проведения проверки:</h3>
                    <p>1. Назначить проверяющим ${inspectorPosition}, ${inspectorRank}, ${inspectorName}.</p>
                    <p>2. Назначить ответственным за проведение служебной проверки
                    ${responsiblePosition}, ${responsibleRank}, ${responsibleName}.</p>
                    <p>3. Принять меры по обеспечению сохранности и конфиденциальности материалов проверки.</p>
                    <p>4. По завершению проведения служебной проверки подготовить заключительный акт
                    с полным изложением ситуации, выводами и рекомендациями, также внести соответствующие решения.</p>
                    <p>5. Контроль за исполнением настоящего постановления оставляю за собой.</p>
                    <p>6. Настоящее постановление вступает в законную силу с момента его подписания и публикации.</p>
                    <p style="margin-top: 20px;"><strong>Объяснение ситуации:</strong></p>
                    <p style="text-align: justify;">${situation}</p>

                    ${buildSignatureBlock(signerPosition, signerRank, signerName)}
                `;

            } else if (docType === 'rezultaty') {
                const checkStartDate = document.getElementById('check-start-date').value;
                const resIncidentDate = document.getElementById('res-incident-date').value;
                const resIncidentTime = document.getElementById('res-incident-time').value;
                const resCheckPosition = document.getElementById('res-check-position').value;
                const resCheckRank = document.getElementById('res-check-rank').value;
                const resCheckName = document.getElementById('res-check-name').value;
                const resSituation = document.getElementById('res-situation').value;
                const resArticle = document.getElementById('res-article').value;
                const resPoint = document.getElementById('res-point').value;
                const resRegulation = document.getElementById('res-regulation').value;
                const resAdditional = document.getElementById('res-additional').value;
                const resConclusion = document.getElementById('res-conclusion').value;
                const resSignerPosition = document.getElementById('res-signer-position').value;
                const resSignerName = document.getElementById('res-signer-name').value;
                const resSignerRank = document.getElementById('res-signer-rank').value;

                htmlContent = `
                    ${gerb}
                    ${header}
                    <h1 style="text-align: center; font-size: 16pt; margin: 25px 0;">Р Е З У Л Ь Т А Т Ы<br/>СЛУЖЕБНОЙ ПРОВЕРКИ</h1>

                    <p style="text-align: justify;">
                        В рамках проведения служебной проверки, начатой ${checkStartDate}, установлены следующие факты и сделаны соответствующие выводы:
                    </p>

                    <p style="margin-top: 20px;"><strong>Обстоятельства инцидента:</strong></p>
                    <p>${resIncidentDate} примерно ${resIncidentTime}, ${resCheckPosition}, ${resCheckRank}, ${resCheckName}, в ходе исполнения служебных обязанностей совершил неправомерные действия в отношении гражданского лица.</p>
                    <p style="text-align: justify;">${resSituation}</p>

                    <p style="margin-top: 20px;"><strong>Установленные нарушения:</strong></p>
                    <p>В результате рассмотрения обстоятельств зафиксировано нарушение статьи ${resArticle} пункта ${resPoint} дисциплинарного устава полиции.</p>
                    <p style="text-align: justify;">${resRegulation}</p>

                    <p style="margin-top: 20px;"><strong>Дополнительные мероприятия и принятые решения:</strong></p>
                    <p style="text-align: justify;">${resAdditional}</p>

                    <p style="margin-top: 20px;"><strong>Вывод:</strong></p>
                    <p style="text-align: justify;">${resConclusion}</p>

                    ${buildSignatureBlock(resSignerPosition, resSignerRank, resSignerName)}
                `;

            } else if (docType === 'akt') {
                const aktDate = document.getElementById('akt-date').value;
                const aktTime = document.getElementById('akt-time').value;
                const aktPlace = document.getElementById('akt-place').value;
                const aktUnit = document.getElementById('akt-unit').value;
                const aktResponsible = document.getElementById('akt-responsible').value;
                const aktOthers = document.getElementById('akt-others').value;
                const aktSubstancesCount = document.getElementById('akt-substances-count').value;
                const aktSubstancesViolators = document.getElementById('akt-substances-violators').value;
                const aktWeaponsCount = document.getElementById('akt-weapons-count').value;
                const aktWeaponsViolators = document.getElementById('akt-weapons-violators').value;
                const aktFinesCount = document.getElementById('akt-fines-count').value;
                const aktFinesViolators = document.getElementById('akt-fines-violators').value;
                const aktDocsCount = document.getElementById('akt-docs-count').value;
                const aktDocsViolators = document.getElementById('akt-docs-violators').value;
                const aktLicensesCount = document.getElementById('akt-licenses-count').value;
                const aktLicensesViolators = document.getElementById('akt-licenses-violators').value;
                const aktSignerPosition = document.getElementById('akt-signer-position').value;
                const aktSignerName = document.getElementById('akt-signer-name').value;
                const aktSignerRank = document.getElementById('akt-signer-rank').value;

                htmlContent = `
                    ${gerb}
                    ${header}
                    <h1 style="text-align: center; font-size: 16pt; margin: 30px 0;">АКТ ПРОВЕДЕНИЯ ПЛАНОВОЙ ПРОВЕРКИ</h1>

                    <p style="margin-top: 25px;"><strong>Состав проверяющих:</strong></p>
                    <p>- ${aktResponsible || '—'} - ответственный</p>
                    <p style="white-space: pre-wrap;">${aktOthers || ''}</p>

                    <p style="margin-top: 25px;"><strong>Выявленные нарушения:</strong></p>

                    <p style="margin-top: 15px;"><strong>1. Запрещенные вещества:</strong></p>
                    <p>${aktSubstancesCount || '—'}</p>
                    <p><strong>Данные нарушителей:</strong></p>
                    <p style="white-space: pre-wrap;">${aktSubstancesViolators || '—'}</p>

                    <p style="margin-top: 15px;"><strong>2. Запрещенное оружие:</strong></p>
                    <p>${aktWeaponsCount || '—'}</p>
                    <p><strong>Данные нарушителей:</strong></p>
                    <p style="white-space: pre-wrap;">${aktWeaponsViolators || '—'}</p>

                    <p style="margin-top: 15px;"><strong>3. Неоплаченные штрафы:</strong></p>
                    <p>${aktFinesCount || '—'}</p>
                    <p><strong>Данные нарушителей:</strong></p>
                    <p style="white-space: pre-wrap;">${aktFinesViolators || '—'}</p>

                    <p style="margin-top: 15px;"><strong>4. Ошибки в документах (трудовая книжка):</strong></p>
                    <p>${aktDocsCount || '—'}</p>
                    <p><strong>Данные нарушителей:</strong></p>
                    <p style="white-space: pre-wrap;">${aktDocsViolators || '—'}</p>

                    <p style="margin-top: 15px;"><strong>5. Просроченные лицензии:</strong></p>
                    <p>${aktLicensesCount || '—'}</p>
                    <p><strong>Данные нарушителей:</strong></p>
                    <p style="white-space: pre-wrap;">${aktLicensesViolators || '—'}</p>

                    ${buildSignatureBlock(
                        (aktSignerPosition ? aktSignerPosition + '<br/>ОСБ ГАИ<br/>по Нижегородской области' : 'ОСБ ГАИ<br/>по Нижегородской области'),
                        aktSignerRank ? aktSignerRank + ' полиции' : '',
                        aktSignerName
                    )}
                `;
            }

            const fullHtml = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; }
                            p { margin: 6px 0; text-align: justify; }
                            h1 { text-align: center; }
                            table { page-break-inside: avoid; }
                            tr, td { page-break-inside: avoid; }
                        </style>
                    </head>
                    <body>${htmlContent}</body>
                </html>
            `;

            const blob = htmlDocx.asBlob(fullHtml, { encoding: 'UTF-8' });
            saveAs(blob, `${docTypeText}.docx`);
        });
});
