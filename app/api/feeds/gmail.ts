import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback/google'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function getLatestEmails() {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
      q: 'in:inbox'
    });

    const emails = await Promise.all(
      (response.data.messages || []).map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || '';
        const from = headers?.find(h => h.name === 'From')?.value || '';
        const date = headers?.find(h => h.name === 'Date')?.value;

        return {
          id: message.id!,
          site: 'Gmail',
          title: subject,
          url: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
          time: formatTime(new Date(date || '')),
          from: from.split('<')[0].trim()
        };
      })
    );

    return emails;
  } catch (error) {
    console.error('获取邮件失败:', error);
    throw error;
  }
} 