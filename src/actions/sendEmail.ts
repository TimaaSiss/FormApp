'use server';

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import ConfirmationEmail from '@/app/emails/confirmEmail';
import React from 'react';

export async function sendEmail(to: string, subject: string, userName: string) {
  if (!to || !subject || !userName) {
    throw new Error('Champs manquants (email, sujet ou nom)');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // false pour le port 587 (TLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ⬅ ICI : on attend le résultat
  const emailHtml = await render(
    React.createElement(ConfirmationEmail, { userName })
  );

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: emailHtml, // maintenant c'est un string
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email envoyé avec succès' };
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email:', error);
    throw new Error('Échec de l’envoi de l’email');
  }
}
