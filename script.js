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
    const docType = document.getElementById('doc-type').value;
    const incidentDate = document.getElementById('incident-date').value;
    const incidentTime = document.getElementById('incident-time').value;
    const checkPosition = document.getElementById('check-position').value;
    const checkRank = document.getElementById('check-rank').value;
    const checkName = document.getElementById('check-name').value;
    const responsiblePosition = document.getElementById('responsible-position').value;
    const responsibleRank = document.getElementById('responsible-rank').value;
    const responsibleName = document.getElementById('responsible-name').value;
    const situation = document.getElementById('situation').value;

    const htmlContent = `
        <h1 style="text-align: center;">${docType}</h1>
        <p><strong>Дата инцидента:</strong> ${incidentDate} в ${incidentTime}</p>
        <p><strong>Проверяемый:</strong> ${checkPosition}, ${checkRank}, ${checkName}</p>
        <p><strong>Ответственный:</strong> ${responsiblePosition}, ${responsibleRank}, ${responsibleName}</p>
        <p><strong>Объяснение ситуации:</strong></p>
        <p>${situation}</p>
    `;

    const fullHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Times New Roman', serif; }
                    h1 { text-align: center; }
                </style>
            </head>
            <body>${htmlContent}</body>
        </html>
    `;

    const blob = htmlDocx.asBlob(fullHtml, { encoding: 'UTF-8' });
    saveAs(blob, `document-${Date.now()}.docx`);
});
