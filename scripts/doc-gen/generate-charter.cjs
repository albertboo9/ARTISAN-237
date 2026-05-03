const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

async function generatePDF() {
    console.log('🚀 Démarrage de la génération de la Matrice d\'Envergure Artisan237...');

    try {
        const templatePath = path.join(__dirname, 'charter-template.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        // Chemins des images
        const imgDir = path.join(__dirname, 'img');

        // Fonction pour convertir une image en Base64
        const toBase64 = (filePath) => {
            if (!fs.existsSync(filePath)) {
                console.warn('⚠️ Image manquante : ' + filePath);
                return '';
            }
            const bitmap = fs.readFileSync(filePath);
            const extension = path.extname(filePath).replace('.', '');
            const mimeType = (extension === 'jpeg' || extension === 'jpg') ? 'image/jpeg' : 'image/png';
            return 'data:' + mimeType + ';base64,' + bitmap.toString('base64');
        };

        const data = {
            logo_univ: toBase64(path.join(imgDir, 'université de Douala_logo.jpeg')),
            logo_fac: toBase64(path.join(imgDir, 'faculté_science_logo.jpeg'))
        };

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // Lancement de Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // Définir le contenu HTML
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // Génération du PDF
        const outputPath = path.join(__dirname, '../../Artisan237_Matrice_Envergure.pdf');
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();
        console.log('✅ Matrice d\'Envergure générée avec succès : ' + outputPath);

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
    }
}

generatePDF();
