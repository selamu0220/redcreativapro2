import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { incrementUsage, getUnsubscribeHtmlAsync, getUserEmailProviderAsync } from '../../lib/database';


export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, isPromotional = false } = await request.json();

    // Validación de parámetros básicos
    const missingParams = [];
    if (!to) missingParams.push('to (destinatario)');
    if (!subject) missingParams.push('subject (asunto)');
    if (!text) missingParams.push('text (contenido del email)');
    
    if (missingParams.length > 0) {
      return NextResponse.json({ 
        error: `Faltan parámetros requeridos: ${missingParams.join(', ')}`,
        missingParams: missingParams,
        receivedParams: { to: !!to, subject: !!subject, text: !!text }
      }, { status: 400 });
    }

    // Obtener el email del usuario desde los headers
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email del usuario no encontrado en headers',
      }, { status: 400 });
    }

    // Obtener la configuración del proveedor de email del usuario
    console.log(`🔍 Buscando configuración para usuario: ${userEmail}`);
    const emailProviderConfig = await getUserEmailProviderAsync(userEmail);
    
    console.log(`📧 Configuración encontrada:`, {
      hasConfig: !!emailProviderConfig,
      provider: emailProviderConfig?.provider,
      configKeys: emailProviderConfig?.config ? Object.keys(emailProviderConfig.config) : [],
      configValues: emailProviderConfig?.config
    });
    
    if (!emailProviderConfig || !emailProviderConfig.config || Object.keys(emailProviderConfig.config).length === 0) {
      console.log(`❌ No hay configuración válida para ${userEmail}`);
      return NextResponse.json({ 
        error: 'No hay configuración de email. Ve a Ajustes y configura tu proveedor de email preferido.',
        suggestion: 'Recomendamos Web3Forms para configuración súper fácil',
        debug: {
          userEmail,
          hasEmailProviderConfig: !!emailProviderConfig,
          provider: emailProviderConfig?.provider,
          configEmpty: !emailProviderConfig?.config || Object.keys(emailProviderConfig.config).length === 0
        }
      }, { status: 400 });
    }

    console.log(`📧 Enviando email usando proveedor: ${emailProviderConfig.provider}`);

    let emailResult;

    // Enviar email según el proveedor configurado
    switch (emailProviderConfig.provider) {
      case 'web3forms':
        emailResult = await sendWithWeb3Forms(to, subject, text, html, emailProviderConfig.config, isPromotional);
        break;
      
      case 'resend':
        emailResult = await sendWithResend(to, subject, text, html, emailProviderConfig.config, isPromotional);
        break;
      
      case 'gmail':
      default:
        emailResult = await sendWithGmail(to, subject, text, html, emailProviderConfig.config, isPromotional);
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
      incrementUsage(userEmail, 'correosIA');
    } catch (error) {
      console.error('Error al incrementar uso:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado exitosamente usando ${emailProviderConfig.provider}`,
      provider: emailProviderConfig.provider,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Error al enviar email:', error);
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

// Función para enviar con Web3Forms
async function sendWithWeb3Forms(to: string, subject: string, text: string, html: string | undefined, config: any, isPromotional: boolean) {
  try {
    const { web3formsKey, senderEmail } = config;
    
    if (!web3formsKey || !senderEmail) {
      return { success: false, error: 'Configuración de Web3Forms incompleta' };
    }

    // Preparar el contenido del email
    let emailContent = text;
    if (isPromotional) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      emailContent += '\n\n---\n¿No quieres recibir más correos? Visita: ' + baseUrl + '/unsubscribe';
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: web3formsKey,
        name: 'Red Creativa Pro Beta',
        email: senderEmail,
        subject: subject,
        message: `Para: ${to}\n\n${emailContent}`,
        from_name: 'Red Creativa Pro Beta',
        replyto: senderEmail
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, messageId: data.message || 'web3forms-sent' };
    } else {
      return { success: false, error: `Error de Web3Forms: ${data.message || 'Error desconocido'}` };
    }

  } catch (error) {
    console.error('Error sending with Web3Forms:', error);
    return { success: false, error: `Error de Web3Forms: ${error instanceof Error ? error.message : 'Error de conexión'}` };
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