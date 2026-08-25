/**
 * newsletterTemplate.ts
 * Struktur Template Email Standar & Bersih untuk Newsletter DenyutGlobal.
 * 
 * CATATAN PENTING:
 * - File ini hanya mendefinisikan struktur dan rendering HTML/Text template.
 * - Tidak mengirim email nyata / live.
 * - Siap dihubungkan ke Email Service (seperti Resend, Mailgun, dll).
 */

export interface NewsletterArticlePayload {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  namaSumber: string;
  tanggal: string;
  waktu: string;
  readTimeMinutes?: number;
}

export interface NewsletterRecipient {
  email: string;
  unsubscribeToken?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Menghasilkan konten email HTML dan Plain Text untuk Daily Brief / Breaking News
 */
export function generateNewsletterEmail(
  article: NewsletterArticlePayload,
  recipient: NewsletterRecipient,
  baseUrl: string = 'https://denyutglobal.com'
): RenderedEmail {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const articleUrl = `${cleanBaseUrl}/berita/${article.slug || article.id}`;
  const unsubscribeUrl = `${cleanBaseUrl}/api/unsubscribe?token=${encodeURIComponent(recipient.unsubscribeToken || '')}&email=${encodeURIComponent(recipient.email)}`;

  const subject = `[DenyutGlobal Daily Brief] ${article.judul}`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 24px 28px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      DENYUT<span style="color: #f43f5e;">GLOBAL</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Daily Brief & Analisis Berita Dunia
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #f43f5e; color: #ffffff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                      ${escapeHtml(article.kategori || 'Dunia')}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px;">
              <!-- Meta Row -->
              <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
                <span>📅 ${escapeHtml(article.tanggal)} • ${escapeHtml(article.waktu)} WIB</span>
                <span style="margin: 0 6px;">•</span>
                <span style="color: #cbd5e1;">Sumber: <strong>${escapeHtml(article.namaSumber)}</strong></span>
              </div>

              <!-- Article Title -->
              <h1 style="margin: 0 0 16px 0; font-size: 22px; line-height: 1.35; color: #ffffff; font-weight: 700;">
                <a href="${articleUrl}" style="color: #ffffff; text-decoration: none;">
                  ${escapeHtml(article.judul)}
                </a>
              </h1>

              <!-- Editorial Summary -->
              <div style="background-color: #0f172a; border-left: 3px solid #f43f5e; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
                  ${escapeHtml(article.ringkasan)}
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 8px; margin-bottom: 8px;">
                <tr>
                  <td style="border-radius: 10px; background-color: #f43f5e;">
                    <a href="${articleUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      Baca Selengkapnya di DenyutGlobal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="padding: 20px 28px; background-color: #0f172a; border-top: 1px solid #334155; font-size: 11px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 8px 0;">
                Anda menerima email ini karena alamat <strong>${escapeHtml(recipient.email)}</strong> terdaftar pada langganan Daily Brief <strong>DenyutGlobal</strong>.
              </p>
              <p style="margin: 0;">
                Pengirim: <strong>Redaksi DenyutGlobal</strong> • Jurnalisme Berimbang & Akurat.
                <br>
                Jika tidak ingin menerima email ini lagi, Anda dapat <a href="${unsubscribeUrl}" style="color: #38bdf8; text-decoration: underline;">berhenti berlangganan di sini</a> kapan saja.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `DENYUTGLOBAL DAILY BRIEF
--------------------------------------------------
${article.kategori ? `[${article.kategori.toUpperCase()}] ` : ''}${article.judul}
Waktu: ${article.tanggal} • ${article.waktu} WIB
Sumber: ${article.namaSumber}

RINGKASAN:
${article.ringkasan}

Baca selengkapnya di tautan berikut:
${articleUrl}

--------------------------------------------------
Anda menerima email ini karena ${recipient.email} terdaftar di DenyutGlobal.
Berhenti berlangganan: ${unsubscribeUrl}
`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
