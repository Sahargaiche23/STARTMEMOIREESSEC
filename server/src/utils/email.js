const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send team invitation email
const sendInvitationEmail = async (to, projectName, inviterName, role, inviteToken = null) => {
  const transporter = createTransporter();
  
  const roleLabels = {
    admin: 'Administrateur',
    member: 'Membre',
    viewer: 'Lecteur'
  };

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // If user has no account, use invite link; otherwise use login link
  const actionUrl = inviteToken 
    ? `${frontendUrl}/invite/${inviteToken}` 
    : `${frontendUrl}/login`;
  const buttonText = inviteToken ? 'Créer mon compte et rejoindre →' : 'Accéder à StartUpLab →';

  const mailOptions = {
    from: `"StartUpLab" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: `🚀 Invitation à rejoindre le projet "${projectName}" sur StartUpLab`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚀 StartUpLab</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Plateforme de création de startups</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Vous êtes invité(e) ! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              <strong>${inviterName}</strong> vous a invité(e) à rejoindre le projet 
              <strong style="color: #6366f1;">"${projectName}"</strong> sur StartUpLab.
            </p>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #6366f1;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Votre rôle :</p>
              <p style="margin: 5px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                ${roleLabels[role] || 'Membre'}
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              En tant que membre de l'équipe, vous pourrez collaborer sur le projet, 
              accéder aux documents et participer à la gestion des tâches.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${actionUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                        color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; 
                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
                ${buttonText}
              </a>
            </div>
            
            ${inviteToken ? `
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              Cliquez sur le bouton ci-dessus pour créer votre compte et rejoindre l'équipe automatiquement.
            </p>
            ` : `
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              Connectez-vous avec cet email pour accéder au projet.
            </p>
            `}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
              © 2026 StartUpLab - Plateforme de création de startups
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInvitationEmail
};
