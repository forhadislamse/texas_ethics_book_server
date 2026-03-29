import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const apiKey = process.env.BREVO_API_KEY;

async function checkKey() {
  console.log('Testing key starting with:', apiKey?.substring(0, 10));
  try {
    const response = await axios.get('https://api.brevo.com/v3/account', {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    });
    console.log('Account Info:', response.data);
  } catch (error: any) {
    console.error('Error Status:', error.response?.status);
    console.error('Error Data:', error.response?.data);
  }
}

checkKey();
