import { EmailSetupInstructions } from "@/components/email-setup-instructions"

export default function EmailConfigPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración de Emails</h1>
          <p className="text-muted-foreground">
            Configura los templates de email personalizados para Renove-se en español
          </p>
        </div>

        <EmailSetupInstructions />
      </div>
    </div>
  )
}
