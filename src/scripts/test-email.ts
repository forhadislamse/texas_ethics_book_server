// import emailSender from "../shared/emailSender";
import brevoMailSender from "../shared/brevoMailSender";

async function main() {
    try {
        console.log("Sending test email via Brevo...");
        /*
        await emailSender(
            "rforhadewu@gmail.com", 
            "<h1>Test Email</h1><p>This is a test to verify Nodemailer config.</p>",
            "Email Test - Andcates"
        );
        */
        await brevoMailSender(
            "rforhadewu@gmail.com", 
            "<h1>Test Email</h1><p>This is a test to verify Brevo config.</p>",
            "Email Test - Andcates"
        );
        console.log("Test script completed successfully!");
    } catch (error) {
        console.error("Test script failed:", error);
        process.exit(1);
    }
}

main();
