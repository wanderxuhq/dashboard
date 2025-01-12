import Imap from 'imap';
import { simpleParser } from 'mailparser';
import type { FeedItem } from '@/app/types';

interface ImapBox {
  messages: {
    total: number;
  };
}

const imapConfig: Imap.Config = {
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

async function markEmailAsRead(imap: Imap, uid: string): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.addFlags(uid, ['\\Seen'], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getLatestEmails(): Promise<FeedItem[]> {
  return new Promise((resolve, reject) => {
    try {
      const imap = new Imap(imapConfig);
      const emails: FeedItem[] = [];
      let messagesProcessed = 0;
      let totalMessages = 0;

      imap.once('ready', () => {
        imap.openBox('INBOX', false, async (err: Error | null, box: ImapBox) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            if (results.length === 0) {
              imap.end();
              return resolve([]);
            }

            const recentResults = results.slice(-20);
            totalMessages = recentResults.length;

            const fetch = imap.fetch(recentResults, {
              bodies: '',
              struct: true,
              markSeen: false
            });

            fetch.on('message', (msg: Imap.Message, seqno: number) => {
              let uid: string = '';

              msg.once('attributes', (attrs) => {
                uid = attrs.uid.toString();
              });

              msg.on('body', (stream: NodeJS.ReadableStream) => {
                simpleParser(stream, (err, parsed) => {
                  if (err) {
                    return;
                  }

                  const email: FeedItem = {
                    id: parsed.messageId || String(Date.now()),
                    site: 'Email',
                    title: `[未读] ${parsed.subject || '(无主题)'}`,
                    url: '#',
                    time: formatTime(parsed.date || new Date()),
                    from: parsed.from?.text || '未知发件人',
                    content: parsed.text || '',
                    html: parsed.html || undefined,
                    uid
                  };

                  emails.push(email);
                  messagesProcessed++;
                  
                  if (messagesProcessed === totalMessages) {
                    imap.end();
                    resolve(emails);
                  }
                });
              });
            });

            fetch.once('error', (err: Error) => {
              imap.end();
              reject(err);
            });
          });
        });
      });

      imap.once('error', (err: Error) => {
        reject(err);
      });

      imap.connect();
    } catch (err) {
      reject(err);
    }
  });
}

export async function markAsRead(uid: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const imap = new Imap(imapConfig);

      imap.once('ready', () => {
        imap.openBox('INBOX', false, async (err) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          await markEmailAsRead(imap, uid);
          imap.end();
          resolve();
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    } catch (err) {
      reject(err);
    }
  });
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
} 