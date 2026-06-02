import nodemailer from 'nodemailer';

/**
 * Utility to send emails via Ethereal (Test) or SMTP (Prod)
 */
export async function sendEmail({ to, subject, html }) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "lillian.hegmann58@ethereal.email",
        pass: "VwGstW4j154xN2c9Kq",
      },
    });

    const mailOptions = {
      from: '"MTU Academic Agent" <academic-agent@mtu.edu.ng>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0d9488; margin-top: 0;">MTU ACADEMIC SYSTEM</h2>
          ${html}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">Sent by the Intelligent University Agent.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error("Email utility error:", error);
    return { success: false, error: error.message };
  }
}
