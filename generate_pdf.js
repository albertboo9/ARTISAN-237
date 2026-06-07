const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        console.log('Lancement de Puppeteer...');
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        
        const filePath = `file://${path.resolve(__dirname, 'rapport_soutenance.html')}`;
        console.log(`Chargement de la page : ${filePath}`);
        
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('Génération du PDF en format A4...');
        await page.pdf({
            path: 'ARTISAN-237_Rapport_Soutenance.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });
        
        await browser.close();
        console.log('PDF généré avec succès : ARTISAN-237_Rapport_Soutenance.pdf');
    } catch (error) {
        console.error('Erreur lors de la génération du PDF :', error);
    }
})();
