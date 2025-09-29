import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { incrementUsageAsync, getUnsubscribeHtmlAsync, getUserEmailProviderAsync } from '../../lib/database';


export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, isTest, isPromotional = false } = await request.json();

    // Validación básica
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Obtener email del usuario desde headers
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email del usuario requerido' }, { status: 400 });
    }

    console.log('🔍 === DEBUGGING SEND-EMAIL ENDPOINT ===');
    console.log('📧 User email:', userEmail);
    console.log('📨 Email details:', { to, subject, hasText: !!text, hasHtml: !!html, isTest });

    // Obtener configuración del proveedor de email
    const emailProviderConfig = await getUserEmailProviderAsync(userEmail);
    
    console.log('🔧 Email provider config from database:', {
      hasConfig: !!emailProviderConfig,
      provider: emailProviderConfig?.provider,
      configKeys: emailProviderConfig?.config ? Object.keys(emailProviderConfig.config) : [],
      fullConfig: emailProviderConfig
    });
    
    if (!emailProviderConfig) {
      console.log('❌ No se encontró configuración de email');
      return NextResponse.json(
        { error: 'No hay configuración de email. Ve a Ajustes y configura tu proveedor de email preferido. 📧 Recomendamos Resend (más fácil) o Gmail SMTP para envío de emails.' },
        { status: 400 }
      );
    }

    console.log('✅ Configuración de email obtenida:', {
      provider: emailProviderConfig.provider,
      configKeys: Object.keys(emailProviderConfig.config || {})
    });

    console.log('📤 === INICIANDO ENVÍO DE EMAIL ===', {
      provider: emailProviderConfig.provider,
      to,
      subject
    });

    let emailResult;

    // Enviar email según el proveedor configurado
    switch (emailProviderConfig.provider) {
      case 'gmail':
        emailResult = await sendWithGmail(to, subject, text, html, emailProviderConfig.config, isPromotional);
        break;
      
      case 'resend':
      default:
        emailResult = await sendWithResend(to, subject, text, html, emailProviderConfig.config, isPromotional);
        break;
    }

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: emailResult.error,
        provider: emailProviderConfig.provider
      }, { status: 500 });
    }

    // Incrementar el uso de correosIA
    try {
      await incrementUsageAsync(userEmail, 'correosIA');
    } catch (error) {
      console.error('Error al incrementar uso:', error instanceof Error ? error.message : error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado exitosamente usando ${emailProviderConfig.provider}`,
      provider: emailProviderConfig.provider,
      messageId: emailResult.messageId || undefined
    });

  } catch (error) {
    console.error('Error al enviar email:', error instanceof Error ? error.message : error);
    return NextResponse.json({ 
      error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }, { status: 500 });
  }
}

// Función para enviar con Gmail SMTP
async function sendWithGmail(to: string, subject: string, text: string, html: string | undefined, config: any, isPromotional: boolean) {
  try {
    const { gmailUser, gmailPassword } = config;
    
    if (!gmailUser || !gmailPassword) {
      return { success: false, error: 'Credenciales de Gmail no configuradas correctamente' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    let finalHtml = html || text.replace(/\n/g, '<br>');
    let finalText = text;

    // Si es promocional, agregar enlace de desuscripción
    if (isPromotional) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const unsubscribeHtml = await getUnsubscribeHtmlAsync(to, baseUrl);
      finalHtml = finalHtml + unsubscribeHtml;
      finalText = text + '\n\n---\n¿No quieres recibir más correos? Visita: ' + baseUrl + '/unsubscribe';
    }

    const mailOptions = {
      from: gmailUser,
      to,
      subject,
      text: finalText,
      html: finalHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending with Gmail:', error);
    return { success: false, error: `Error de Gmail: ${error instanceof Error ? error.message : 'Error desconocido'}` };
  }
}



// Función para enviar con Resend
async function sendWithResend(to: string, subject: string, text: string, html: string | undefined, config: any, isPromotional: boolean) {
  try {
    const { resendApiKey, resendFromEmail } = config;
    
    if (!resendApiKey || !resendFromEmail) {
      return { success: false, error: 'Configuración de Resend incompleta' };
    }

    let finalHtml = html || `<div style="white-space: pre-wrap;">${text.replace(/\n/g, '<br>')}</div>`;
    let finalText = text;

    // Si es promocional, agregar enlace de desuscripción
    if (isPromotional) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const unsubscribeHtml = await getUnsubscribeHtmlAsync(to, baseUrl);
      finalHtml = finalHtml + unsubscribeHtml;
      finalText = text + '\n\n---\n¿No quieres recibir más correos? Visita: ' + baseUrl + '/unsubscribe';
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [to],
        subject: subject,
        text: finalText,
        html: finalHtml
      })
    });

    const data = await response.json();

    if (response.ok && data.id) {
      return { success: true, messageId: data.id };
    } else {
      return { success: false, error: `Error de Resend: ${data.message || JSON.stringify(data)}` };
    }

  } catch (error) {
    console.error('Error sending with Resend:', error);
    return { success: false, error: `Error de Resend: ${error instanceof Error ? error.message : 'Error de conexión'}` };
  }
}