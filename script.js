// --- Стартовый экран ---
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-portal').classList.remove('hidden');
});

// --- Переключение разделов ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('section-docs').classList.add('hidden');
        document.querySelectorAll('.section-placeholder').forEach(el => el.style.display = 'none');

        const section = btn.dataset.section;
        if (section === 'docs') {
            document.getElementById('section-docs').classList.remove('hidden');
        } else {
            document.getElementById('section-' + section).style.display = 'block';
        }
    });
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
    const docType = docTypeSelect.options[docTypeSelect.selectedIndex].text;

    const incidentDate = document.getElementById('incident-date').value;
    const incidentTime = document.getElementById('incident-time').value;
    const incidentPlace = document.getElementById('incident-place').value;
    const applicantName = document.getElementById('applicant-name').value;
    const checkPosition = document.getElementById('check-position').value;
    const checkRank = document.getElementById('check-rank').value;
    const checkName = document.getElementById('check-name').value;
    const responsiblePosition = document.getElementById('responsible-position').value;
    const responsibleRank = document.getElementById('responsible-rank').value;
    const responsibleName = document.getElementById('responsible-name').value;
    const situation = document.getElementById('situation').value;

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
                : '';

            const htmlContent = `
                <div style="text-align: center; margin-bottom: 10px;">
                    <img src="https://trapkamku-create.github.io/goss-docs/img/i.webp" style="height: 110px;" />
                </div>

                <p style="text-align: center; font-weight: bold; font-size: 13pt; margin: 0;">
                    ГОСУДАРСТВЕННАЯ АВТОМОБИЛЬНАЯ ИНСПЕКЦИЯ<br/>
                    ПО НИЖЕГОРОДСКОЙ ОБЛАСТИ<br/>
                    ОТДЕЛ СОБСТВЕННОЙ БЕЗОПАСНОСТИ
                </p>

                <h1 style="text-align: center; font-size: 16pt; margin: 25px 0;">П О С Т А Н О В Л Е Н И Е</h1>
                <p style="text-align: center; margin-top: -15px;">${docType}</p>

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

                <p>1. Назначить ответственным за проведение служебной проверки
                ${responsiblePosition}, ${responsibleRank}, ${responsibleName}.</p>

                <p>2. Принять меры по обеспечению сохранности и конфиденциальности материалов проверки.</p>

                <p>3. По завершению проведения служебной проверки подготовить заключительный акт
                с полным изложением ситуации, выводами и рекомендациями, также внести соответствующие решения.</p>

                <p>4. Контроль за исполнением настоящего постановления оставляю за собой.</p>

                <p>5. Настоящее постановление вступает в законную силу с момента его подписания и публикации.</p>

                <p style="margin-top: 20px;"><strong>Объяснение ситуации:</strong></p>
                <p style="text-align: justify;">${situation}</p>

                <br/><br/>

                <table style="width: 100%; margin-top: 40px;">
                    <tr>
                        <td style="width: 50%; vertical-align: bottom;">
                            ${responsiblePosition}<br/>
                            ${responsibleRank}
                        </td>
                        <td style="width: 50%; text-align: right; vertical-align: bottom;">
                            ${signatureHtml}<br/>
                            ${responsibleName}
                        </td>
                    </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                    ${stampHtml}
                </div>
            `;

            const fullHtml = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; }
                            p { margin: 6px 0; text-align: justify; }
                            h1 { text-align: center; }
                        </style>
                    </head>
                    <body>${htmlContent}</body>
                </html>
            `;

            const blob = htmlDocx.asBlob(fullHtml, { encoding: 'UTF-8' });
            saveAs(blob, `${docType}.docx`);
        });
});
