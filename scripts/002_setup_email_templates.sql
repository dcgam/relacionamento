-- Configurar templates de email personalizados para Renove-se em espanhol
-- Estes templates devem ser configurados no dashboard do Supabase em Auth > Email Templates

-- Template para confirmação de cadastro (Confirm signup)
-- Assunto: ¡Bienvenido a Renove-se! Confirma tu cuenta
-- Corpo:
/*
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirma tu cuenta - Renove-se</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Bienvenido a Renove-se! 🎉</h1>
        <p>Tu plataforma de transformación personal</p>
    </div>
    
    <div class="content">
        <h2>¡Hola!</h2>
        
        <p>Nos emociona tenerte como parte de la comunidad Renove-se. Estás a un paso de comenzar tu viaje de transformación personal.</p>
        
        <p>Para activar tu cuenta y acceder a todas nuestras herramientas de crecimiento personal, simplemente haz clic en el botón de abajo:</p>
        
        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">Confirmar mi cuenta</a>
        </div>
        
        <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
        
        <p><strong>¿Por qué confirmar tu cuenta?</strong></p>
        <ul>
            <li>Acceso completo a todas las funcionalidades</li>
            <li>Personalización de tu experiencia</li>
            <li>Seguridad mejorada para tu cuenta</li>
            <li>Notificaciones importantes sobre tu progreso</li>
        </ul>
        
        <p>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
    </div>
    
    <div class="footer">
        <p>Con cariño,<br><strong>El equipo de Renove-se</strong></p>
        <p><em>"Cada día es una nueva oportunidad para renovarte"</em></p>
    </div>
</body>
</html>
*/

-- Template para recuperación de contraseña (Reset Password)  
-- Assunto: Restablece tu contraseña - Renove-se
-- Corpo:
/*
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Restablece tu contraseña - Renove-se</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Restablece tu contraseña 🔐</h1>
        <p>Renove-se - Tu transformación continúa</p>
    </div>
    
    <div class="content">
        <h2>¡Hola!</h2>
        
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Renove-se.</p>
        
        <p>No te preocupes, esto puede pasar a cualquiera. Para crear una nueva contraseña segura, simplemente haz clic en el botón de abajo:</p>
        
        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">Crear nueva contraseña</a>
        </div>
        
        <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
        
        <div class="security-note">
            <h3>🛡️ Consejos de seguridad:</h3>
            <ul>
                <li>Este enlace expirará en 24 horas por tu seguridad</li>
                <li>Usa una contraseña única y fuerte</li>
                <li>Combina letras, números y símbolos</li>
                <li>No compartas tu contraseña con nadie</li>
            </ul>
        </div>
        
        <p><strong>¿No solicitaste este cambio?</strong></p>
        <p>Si no fuiste tú quien solicitó restablecer la contraseña, puedes ignorar este email de forma segura. Tu cuenta permanece protegida.</p>
        
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
    </div>
    
    <div class="footer">
        <p>Con cariño,<br><strong>El equipo de Renove-se</strong></p>
        <p><em>"Tu seguridad es nuestra prioridad"</em></p>
    </div>
</body>
</html>
*/

-- Nota: Estos templates deben ser configurados manualmente en el dashboard de Supabase
-- Ir a: Proyecto > Authentication > Email Templates
-- Copiar el HTML de arriba en cada template correspondiente
