import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { incrementUsage, getUnsubscribeHtmlAsync } from '../../lib/database';


export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, gmailUser, gmailPassword, isPromotional = false } = await request.json();

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

    let finalHtml = html || text;
    let finalText = text;

    // Si es un correo promocional, agregar enlace de desuscripción
    if (isPromotional) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const unsubscribeHtml = await getUnsubscribeHtmlAsync(to, baseUrl);
      
      if (html) {
        finalHtml = html + unsubscribeHtml;
      } else {
        // Convertir texto a HTML básico y agregar enlace
        finalHtml = `<div style="white-space: pre-wrap;">${text.replace(/\n/g, '<br>')}</div>` + unsubscribeHtml;
      }
      
      // Agregar texto plano de desuscripción
      finalText = text + '\n\n---\n¿No quieres recibir más correos? Visita: ' + baseUrl + '/unsubscribe';
    }

    const mailOptions = {
      from: gmailUser,
      to,
      subject,
      text: finalText,
      ...(finalHtml && { html: finalHtml }),
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