import fs from 'fs';
const pdf = require('pdf-parse');

async function extractPDF() {
    console.log('Starting extraction...');
    const dataBuffer = fs.readFileSync('Texas_Ethics_Laws_9_edition_10.23.pdf');
    
    try {
        // Many PDF libraries export differently based on environment
        const parse = typeof pdf === 'function' ? pdf : (pdf.PDFParse || pdf.default);
        if (typeof parse !== 'function') {
            console.log('Available keys:', Object.keys(pdf));
            throw new Error('Could not find a valid parse function in pdf-parse');
        }
        
        // Since it's a class constructor, we might need 'new'
        let data;
        try {
            data = await parse(dataBuffer);
        } catch (e) {
            console.log('Function call failed, trying new...');
            const instance = new parse();
            data = await instance.parse(dataBuffer);
        }
        
        // Save the first 10,000 characters to a text file for analysis
        const sampleText = data.text.substring(0, 10000);
        fs.writeFileSync('pdf_sample.txt', sampleText);
        
        console.log('PDF extracted successfully!');
        console.log('Total Pages:', data.numpages);
        console.log('Sample saved to pdf_sample.txt');
    } catch (error) {
        console.error('Error extracting PDF:', error);
    }
}

extractPDF();
