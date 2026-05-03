const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

async function generatePDF() {
    console.log('🚀 Démarrage de la génération du document Artisan237 Ultra-Professional...');

    try {
        const templatePath = path.join(__dirname, 'doc-template.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        // Chemins des images
        const docsDir = path.join(__dirname, '../../docs');
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
            logo_fac: toBase64(path.join(imgDir, 'faculté_science_logo.jpeg')),
            diag_arch: toBase64(path.join(docsDir, 'diagramme_d\'architecture.png')),
            diag_deploy: toBase64(path.join(docsDir, 'diagramme_déploiement.png')),
            diag_usecase: toBase64(path.join(docsDir, 'use_case_diagram.png')),
            diag_seq: toBase64(path.join(docsDir, 'diagramme_séquence_recommandation.png')),
            diag_gamification: toBase64(path.join(docsDir, 'd_s_gamification_XP.png'))
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
        const outputPath = path.join(__dirname, '../../Artisan237_Dossier_Technique_Expert.pdf');
        await page.pdf({
            path: outputPath,
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();
        console.log('✅ Document généré avec succès : ' + outputPath);

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
    }
}

generatePDF();
