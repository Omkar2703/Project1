import nodemailer from 'nodemailer'

export const sendInviteEmail = async ({ toEmail, inviterName, workspaceName, inviteToken, role }) => {

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env')
  }

  // ✅ Create transporter inside function so env vars are loaded
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })

  const inviteLink = `${process.env.CLIENT_URL}/invite/accept?token=${inviteToken}`

  const mailOptions = {
    from: `"CollabFlow" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${inviterName} invited you to "${workspaceName}" on CollabFlow`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Inter, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #6366f1; padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .header p { color: #c7d2fe; margin: 4px 0 0; font-size: 14px; }
          .body { padding: 32px; }
          .body p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
          .workspace-badge { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
          .workspace-badge span { color: #4f46e5; font-weight: 600; font-size: 15px; }
          .role-badge { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 500; display: inline-block; margin-bottom: 20px; }
          .btn { display: block; background: #6366f1; color: white; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }
          .expire { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 14px; color: #c2410c; font-size: 13px; margin-top: 16px; }
          .footer { padding: 16px 32px; border-top: 1px solid #f1f5f9; text-align: center; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CollabFlow</h1>
            <p>Collaborate, organize, deliver.</p>
          </div>
          <div class="body">
            <p>Hi there! 👋</p>
            <p><strong>${inviterName}</strong> has invited you to join their workspace on CollabFlow.</p>
            <div class="workspace-badge">
              <span>📁 ${workspaceName}</span>
            </div>
            <span class="role-badge">Your role: ${role}</span>
            <p>Click the button below to accept the invitation and join the workspace:</p>
            <a href="${inviteLink}" class="btn">Accept Invitation →</a>
            <div class="expire">
              ⏳ This invitation link expires in <strong>24 hours</strong>.
            </div>
          </div>
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p style="margin-top:8px;">© 2026 CollabFlow</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const info = await transporter.sendMail(mailOptions)
  console.log('✅ Invite email sent to:', toEmail, '| Message ID:', info.messageId)
  return info
}