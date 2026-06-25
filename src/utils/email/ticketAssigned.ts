import nodemailer from 'nodemailer';

// Konfigurasi Transporter menggunakan Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Email Gmail Anda
    pass: process.env.SMTP_PASS, // 16-karakter App Password Gmail
  },
});

export async function sendTicketAssignmentEmail(
  toEmail: string,
  engineerName: string,
  ticketNo: string,
  title: string,
  description: string
) {
  const mailOptions = {
    from: `"IT Ticketing System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `New Ticket Assigned: ${ticketNo} - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Halo, ${engineerName}!</h2>
        <p>Anda telah ditugaskan untuk menyelesaikan tiket baru oleh Admin.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p><strong>Ticket No:</strong> ${ticketNo}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong></p>
          <p style="white-space: pre-wrap;">${description}</p>
        </div>
        
        <p>Silakan login ke sistem Ticketing untuk melihat detail lebih lanjut dan menindaklanjuti masalah ini.</p>
        <br/>
        <p>Terima kasih,<br/><strong>IT Ticketing System</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email berhasil terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email via Nodemailer:', error);
  }
}