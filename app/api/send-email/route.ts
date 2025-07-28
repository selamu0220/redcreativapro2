import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Obtener credenciales desde el request body (enviadas desde el cliente)
    const { gmailUser, gmailPassword } = await request.json();

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({ error: 'Credenciales de Gmail no configuradas' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const mailOptions = {
      from: gmailUser,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 });
  }
}