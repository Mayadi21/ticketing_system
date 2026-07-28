// src/utils/email/ticketAssigned.ts

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
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Ticket Assignment</title>
</head>

<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:16px;
overflow:hidden;
box-shadow:0 10px 25px rgba(0,0,0,.08);
">

<!-- HEADER -->
<tr>
<td
style="
background:linear-gradient(135deg,#004098,#0057d9);
padding:30px;
text-align:center;
color:white;
">

<h1 style="margin:0;font-size:28px;">
🏦 Bank Sumut
</h1>

<p style="margin-top:10px;font-size:15px;opacity:.9;">
Enterprise IT Ticketing System
</p>

</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#0f172a;">
Hello, ${engineerName} 👋
</h2>

<p style="font-size:15px;color:#475569;line-height:1.7;">
A new support ticket has been assigned to you.
Please review the issue and begin troubleshooting as soon as possible.
</p>

<!-- BADGE -->
<div style="margin:30px 0;">

<span
style="
background:#dbeafe;
color:#1d4ed8;
padding:8px 18px;
border-radius:999px;
font-size:13px;
font-weight:bold;
">

NEW ASSIGNMENT

</span>

</div>

<!-- CARD -->

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

<h3
style="
margin:0 0 20px 0;
color:#0f172a;
">

Ticket Information

</h3>

<table
width="100%"
style="font-size:15px;"
>

<tr>

<td
style="
padding:8px 0;
color:#64748b;
width:160px;
">

Ticket Number

</td>

<td
style="
font-weight:bold;
color:#0f172a;
">

${ticketNo}

</td>

</tr>

<tr>

<td
style="
padding:8px 0;
color:#64748b;
">

Title

</td>

<td
style="
font-weight:bold;
color:#0f172a;
">

${title}

</td>

</tr>

<tr>

<td
style="
padding:8px 0;
color:#64748b;
vertical-align:top;
">

Description

</td>

<td
style="
line-height:1.7;
color:#334155;
white-space:pre-wrap;
">

${description}

</td>

</tr>

<tr>

<td
style="
padding:8px 0;
color:#64748b;
">

Status

</td>

<td>

<span
style="
display:inline-block;
padding:6px 14px;
background:#fff7ed;
color:#ea580c;
border-radius:999px;
font-weight:bold;
font-size:13px;
">

ASSIGNED

</span>

</td>

</tr>

</table>

</td>

</tr>

</table>

<!-- BUTTON -->

<div
style="
text-align:center;
margin:40px 0;
">

<a
href="${process.env.DEV_APP_URL}/engineer"
style="
display:inline-block;
background:#004098;
color:white;
text-decoration:none;
padding:14px 32px;
border-radius:10px;
font-weight:bold;
font-size:15px;
">

See Ticket

</a>

</div>

<p
style="
font-size:14px;
color:#64748b;
line-height:1.7;
">

Please complete the assigned task according to the applicable SLA.
If you believe this ticket has been assigned incorrectly,
please contact the system administrator immediately.

</p>

</td>
</tr>

<!-- FOOTER -->

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

This is an automated notification from

<strong>

Bank Sumut Enterprise IT Ticketing System

</strong>

</p>

<p
style="
margin-top:8px;
font-size:12px;
color:#94a3b8;
">

© ${new Date().getFullYear()} Bank Sumut.
All rights reserved.

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`,  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email berhasil terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email via Nodemailer:', error);
  }
}