// src/utils/email/ticketResolved.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTicketResolvedEmail(
  toEmail: string,
  userName: string,
  ticketNo: string,
  title: string,
  solutionNote: string,
) {
  const mailOptions = {
    from: `"IT Ticketing System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Tiket Telah Diselesaikan: ${ticketNo} - ${title}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Tiket Diselesaikan</title>
</head>

<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table
width="650"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:16px;
overflow:hidden;
box-shadow:0 10px 25px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:linear-gradient(135deg, #004098, #003073);
padding:32px;
text-align:center;
color:white;
">

<h1 style="margin:0;font-size:30px;">
✅ Tiket Diselesaikan
</h1>

<p style="margin-top:10px;font-size:15px;opacity:.9;">
Sistem Ticketing IT Bank Sumut
</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#0f172a;">
Halo, ${userName} 👋
</h2>

<p style="font-size:15px;color:#475569;line-height:1.8;">
Kabar baik! Tiket yang Anda laporkan telah berhasil diselesaikan oleh tim Engineer IT kami.
Silakan tinjau catatan solusi di bawah ini.
</p>

<div style="margin:28px 0;">
<span
style="
display:inline-block;
background:#e8f0fe;
color:#004098;
padding:8px 18px;
border-radius:999px;
font-size:13px;
font-weight:bold;
">
✔ SELESAI
</span>
</div>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:12px;
padding:24px;
">

<tr>
<td>

<h3 style="margin:0 0 20px;color:#0f172a;">
Informasi Tiket
</h3>

<table width="100%" style="font-size:15px;">

<tr>
<td style="padding:8px 0;color:#64748b;width:170px;">
Nomor Tiket
</td>

<td style="font-weight:bold;color:#0f172a;">
${ticketNo}
</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748b;">
Judul
</td>

<td style="font-weight:bold;color:#0f172a;">
${title}
</td>
</tr>

<tr>
<td
style="
padding:8px 0;
vertical-align:top;
color:#64748b;
">
Catatan Solusi
</td>

<td
style="
white-space:pre-wrap;
line-height:1.8;
color:#334155;
">
${solutionNote}
</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748b;">
Status
</td>

<td>
<span
style="
display:inline-block;
padding:6px 14px;
background:#e8f0fe;
color:#004098;
border-radius:999px;
font-size:13px;
font-weight:bold;
">
SELESAI (RESOLVED)
</span>
</td>
</tr>

</table>

</td>
</tr>

</table>

<div
style="
margin-top:30px;
padding:18px;
background:#fff4eb;
border-left:5px solid #F58220;
border-radius:8px;
">

<p
style="
margin:0;
font-size:14px;
color:#003073;
line-height:1.8;
">

Jika kendala tersebut memang telah teratasi,
tidak ada tindakan lebih lanjut yang diperlukan.

Namun, jika Anda masih mengalami masalah yang sama,
silakan buat tiket dukungan baru atau hubungi IT Helpdesk kami.

</p>

</div>

<div
style="
text-align:center;
margin:40px 0;
">

<a
href="${process.env.DEV_APP_URL}"
style="
display:inline-block;
padding:14px 34px;
background:#004098;
color:white;
text-decoration:none;
border-radius:10px;
font-size:15px;
font-weight:bold;
">

Lihat Tiket

</a>

</div>

<p
style="
font-size:14px;
color:#64748b;
line-height:1.7;
">

Terima kasih telah menggunakan Sistem Ticketing IT Bank Sumut.

</p>

</td>
</tr>

<tr>

<td
style="
background:#f8fafc;
padding:24px;
text-align:center;
border-top:1px solid #e2e8f0;
">

<p
style="
margin:0;
font-size:13px;
color:#64748b;
">

Email ini dikirim otomatis oleh <strong>Sistem Ticketing IT Bank Sumut</strong>

</p>

<p
style="
margin-top:8px;
font-size:12px;
color:#94a3b8;
">

© ${new Date().getFullYear()} Bank Sumut.
Seluruh hak cipta dilindungi undang-undang.

</p>

</td>

</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email resolved berhasil terkirim ke ${toEmail}`);
  } catch (error) {
    console.error("Gagal mengirim email resolved via Nodemailer:", error);
  }
}