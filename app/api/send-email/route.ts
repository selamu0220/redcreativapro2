import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { incrementUsage } from '@/app/lib/database';


export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, gmailUser, gmailPassword } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Validar credenciales de Gmail
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

    // Incrementar el uso de correosIA
    const userEmail = request.headers.get('x-user-email');
    if (userEmail) {
      try {
        incrementUsage(userEmail, 'correosIA');
      } catch (error) {
        console.error('Error al incrementar uso:', error);
      }
    }

    return NextResponse.json({ success: true, message: 'Email enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar email:', error);
    return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 });
  }
}