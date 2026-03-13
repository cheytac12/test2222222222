import nodemailer from 'nodemailer';

let emailTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getEmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }
  return emailTransporter;
}

export async function sendStatusEmail(to: string, complaintId: string, status: string) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn('Gmail credentials not configured; skipping email.');
    return;
  }

  const user = process.env.GMAIL_USER;

  let subject: string;
  let text: string;
  let html: string;

  if (status === 'Registered') {
    subject = `Complaint Registered – ID: ${complaintId}`;
    text = `Your complaint has been successfully registered.\n\nComplaint ID: ${complaintId}\n\nUse this ID to track the status on our platform.`;
    html = `<p>Your complaint has been successfully registered.</p><p><strong>Complaint ID:</strong> ${complaintId}</p><p>Use this ID to track the status on our platform.</p>`;
  } else if (status === 'In Progress') {
    subject = `Complaint Update – ID: ${complaintId}`;
    text = `Your complaint (ID: ${complaintId}) is now In Progress. We are actively working on it and will keep you informed of any further updates.`;
    html = `<p>Your complaint (<strong>ID: ${complaintId}</strong>) is now <strong>In Progress</strong>.</p><p>We are actively working on it and will keep you informed of any further updates.</p>`;
  } else if (status === 'Resolved') {
    subject = `Complaint Resolved – ID: ${complaintId}`;
    text = `Your complaint (ID: ${complaintId}) has been Resolved. Thank you for bringing this to our attention. If you have any further concerns, please don't hesitate to submit a new complaint.`;
    html = `<p>Your complaint (<strong>ID: ${complaintId}</strong>) has been <strong>Resolved</strong>.</p><p>Thank you for bringing this to our attention. If you have any further concerns, please don't hesitate to submit a new complaint.</p>`;
  } else {
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Crime Report Portal" <${user}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to} for complaint ${complaintId} (status: ${status})`);
  } catch (emailErr) {
    console.error('Email send error (non-fatal):', emailErr);
  }
}
