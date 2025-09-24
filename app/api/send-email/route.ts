import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { incrementUsage, getUnsubscribeHtmlAsync } from '../../lib/database';


export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, gmailUser, gmailPassword, isPromotional = false } = await request.json();

    // Validación detallada de parámetros
    const missingParams = [];
    if (!to) missingParams.push('to (destinatario)');
    if (!subject) missingParams.push('subject (asunto)');
    if (!text) missingParams.push('text (contenido del email)');
    
    if (missingParams.length > 0) {
      return NextResponse.json({ 
        error: `Faltan parámetros requeridos: ${missingParams.join(', ')}`,
        missingParams: missingParams,
        receivedParams: { to: !!to, subject: !!subject, text: !!text, gmailUser: !!gmailUser, gmailPassword: !!gmailPassword }
      }, { status: 400 });
    }

    // Validar credenciales de Gmail
    const missingCredentials = [];
    if (!gmailUser) missingCredentials.push('gmailUser (email de Gmail)');
    if (!gmailPassword) missingCredentials.push('gmailPassword (contraseña de aplicación)');
    
    if (missingCredentials.length > 0) {
      return NextResponse.json({ 
        error: `Credenciales de Gmail no configuradas: ${missingCredentials.join(', ')}`,
        missingCredentials: missingCredentials
      }, { status: 400 });
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