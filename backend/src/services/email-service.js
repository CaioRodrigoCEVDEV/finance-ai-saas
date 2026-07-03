const { Resend } = require('resend');
const env = require('../config/env');

let resend = null;

if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey);
}

async function sendVerificationEmail(email, userName, token) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping email send');
    return;
  }

  const verificationUrl = `${env.appUrl}/verificar-email?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Confirme seu e-mail — Finance AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 28px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 32px 32px;">
                      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Confirme seu e-mail</h1>
                      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">Ol&aacute; <strong>${userName}</strong>, obrigado por criar sua conta no Finance AI. Clique no bot&atilde;o abaixo para confirmar seu e-mail e come&ccedil;ar a usar o sistema.</p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background: #059669; border-radius: 16px; padding: 14px 32px;">
                            <a href="${verificationUrl}" target="_blank" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Confirmar e-mail</a>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0;">Se voc&ecirc; n&atilde;o criou esta conta, ignore este e-mail.</p>
                      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 4px 0 0;">O link expira em 24 horas.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 32px 32px; border-top: 1px solid #e2e8f0;">
                      <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0;">Finance AI &mdash; Seu copiloto financeiro pessoal</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });

  if (error) {
    console.error('Failed to send verification email:', error);
  }
}

async function sendVerificationSuccessEmail(email, userName) {
  if (!resend) {
    return;
  }

  const loginUrl = `${env.appUrl}/login`;

  await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'E-mail confirmado — Finance AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 28px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 32px 32px;">
                      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">E-mail confirmado!</h1>
                      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">Ol&aacute; <strong>${userName}</strong>, seu e-mail foi confirmado com sucesso. J&aacute; pode entrar na sua conta.</p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background: #059669; border-radius: 16px; padding: 14px 32px;">
                            <a href="${loginUrl}" target="_blank" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Entrar no Finance AI</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });
}

async function sendPasswordResetEmail(email, userName, token) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured — skipping email send');
    return;
  }

  const resetUrl = `${env.appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Recupere sua senha — Finance AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 28px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 32px 32px;">
                      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Recuperar senha</h1>
                      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">Ol&aacute; <strong>${userName}</strong>, recebemos uma solicita&ccedil;&atilde;o de redefini&ccedil;&atilde;o de senha para sua conta no Finance AI. Clique no bot&atilde;o abaixo para criar uma nova senha.</p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background: #059669; border-radius: 16px; padding: 14px 32px;">
                            <a href="${resetUrl}" target="_blank" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Redefinir senha</a>
                          </td>
                        </tr>
                      </table>
                      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0;">Se voc&ecirc; n&atilde;o solicitou esta altera&ccedil;&atilde;o, ignore este e-mail.</p>
                      <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 4px 0 0;">O link expira em 1 hora.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 32px 32px; border-top: 1px solid #e2e8f0;">
                      <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 24px 0 0;">Finance AI &mdash; Seu copiloto financeiro pessoal</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
  }
}

module.exports = {
  sendVerificationEmail,
  sendVerificationSuccessEmail,
  sendPasswordResetEmail
};
