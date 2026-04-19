import axios from 'axios';
import config from "../config";

const brevoMailSender = async (email: string, html: string, subject: string) => {
  if (!config.brevoMail.api_key) {
    throw new Error('Missing Brevo API key');
  }

  try {
    const payload = {
      sender: {
        name: config.brevoMail.sender_name || "Andcates Support",
        email: config.brevoMail.email || "i.rforhad@gmail.com",
      },
      to: [
        {
          email: email
        }
      ],
      htmlContent: html,
      subject: subject
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': config.brevoMail.api_key,
        'content-type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Brevo API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    }
    throw new Error(error.response?.data?.message || 'Failed to send email');
  }
};

export default brevoMailSender;
