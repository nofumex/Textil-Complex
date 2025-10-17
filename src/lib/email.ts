import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

type MailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

async function getEmailConfig() {
  try {
    const settings = await db.setting.findMany({ where: { key: { in: ['emailSettings', 'fromEmail', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'] } } });
    const map = settings.reduce<Record<string, any>>((acc, s) => {
      acc[s.key] = s.type === 'JSON' ? JSON.parse(s.value) : s.value;
      return acc;
    }, {});

    const email = map.emailSettings || {};
    return {
      host: email.smtpHost || process.env.SMTP_HOST,
      port: Number(email.smtpPort || process.env.SMTP_PORT || 587),
      user: email.smtpUser || process.env.SMTP_USER,
      pass: email.smtpPassword || process.env.SMTP_PASSWORD,
      from: email.fromEmail || process.env.FROM_EMAIL || 'noreply@example.com',
    };
  } catch {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      from: process.env.FROM_EMAIL || 'noreply@example.com',
    };
  }
}

export async function sendMail(options: MailOptions) {
  const cfg = await getEmailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error('SMTP не настроен');
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  return transporter.sendMail({
    from: cfg.from,
    to: Array.isArray(options.to) ? options.to.join(',') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export function renderOrderEmail(order: any) {
  const itemsHtml = (order.items || [])
    .map((it: any) => `<tr><td style="padding:8px;border:1px solid #eee">${it.product.title}</td><td style="padding:8px;border:1px solid #eee">${it.quantity}</td><td style="padding:8px;border:1px solid #eee">${Number(it.price).toFixed(2)}</td><td style="padding:8px;border:1px solid #eee">${Number(it.total).toFixed(2)}</td></tr>`) // basic inline table
    .join('');
  const html = `
  <div style="font-family:Arial,sans-serif;">
    <h2>Ваш заказ № ${order.orderNumber}</h2>
    <p>Спасибо за покупку! Мы свяжемся с вами для подтверждения.</p>
    <h3>Состав заказа</h3>
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Товар</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Кол-во</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Цена</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left">Сумма</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="margin-top:12px">Итого к оплате: <strong>${Number(order.total).toFixed(2)}</strong></p>
  </div>`;
  return html;
}



