import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, deviceType, browser, location, time } = body;

    // We use Ethereal Email for testing (it catches all emails and provides a link to view them).
    // In production, you would swap these out for real SMTP credentials (e.g. Gmail App Password, SendGrid, etc).
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
      from: '"MTU Security System" <security@mtu.edu.ng>',
      to: email,
      subject: 'Security Alert: New Login to MTU Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0d9488; margin-top: 0; text-transform: uppercase;">Security Dispatch</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${name || 'User'},</p>
          <p style="color: #334155; font-size: 16px;">We detected a new login to your Mountain Top University portal account.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f8fafc;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569; width: 120px;">Time:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Device:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${deviceType}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Browser:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${browser}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Location:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${location}</td>
            </tr>
          </table>

          <p style="color: #334155; font-size: 15px;">If this was you, you can safely ignore this email.</p>
          <p style="color: #b91c1c; font-size: 15px; font-weight: bold;">If this wasn't you, please change your password immediately and contact IT support.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message from the MTU Institutional V-LINK Protocol.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", previewUrl);
    
    return new Response(JSON.stringify({ success: true, previewUrl }), { status: 200 });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
