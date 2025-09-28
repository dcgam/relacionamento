import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySync() {
  console.log("🔍 Verificando sincronização entre admin e usuário...")

  try {
    // Check modules
    const { data: modules, error: modulesError } = await supabase
      .from("transformation_modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index")

    if (modulesError) {
      console.error("❌ Erro ao carregar módulos:", modulesError)
      return
    }

    console.log(`✅ Encontrados ${modules.length} módulos ativos`)

    // Check sections for each module
    for (const module of modules) {
      const { data: sections, error: sectionsError } = await supabase
        .from("module_sections")
        .select("*")
        .eq("module_id", module.id)
        .eq("is_active", true)
        .order("order_index")

      if (sectionsError) {
        console.error(`❌ Erro ao carregar seções do módulo ${module.title}:`, sectionsError)
        continue
      }

      console.log(`📄 Módulo "${module.title}": ${sections.length} seções`)

      if (sections.length === 0) {
        console.log(`⚠️  Módulo "${module.title}" não tem seções - usuários verão mensagem para configurar no admin`)
      } else {
        sections.forEach((section, index) => {
          const hasContent = section.content && section.content.trim().length > 0
          const hasVideo = section.content && /youtube|vimeo/i.test(section.content)
          const hasLinks = section.content && /\[.*\]$$.*$$/.test(section.content)

          console.log(`  ${index + 1}. ${section.title} (${section.section_type})`)
          console.log(`     📝 Conteúdo: ${hasContent ? "✅" : "❌"}`)
          console.log(`     🎥 Vídeo: ${hasVideo ? "✅" : "❌"}`)
          console.log(`     🔗 Links: ${hasLinks ? "✅" : "❌"}`)
        })
      }
    }

    console.log("\n🎉 Verificação concluída!")
    console.log("\n💡 Para que o conteúdo apareça para os usuários:")
    console.log("1. Certifique-se de que os módulos têm seções criadas no admin")
    console.log("2. Verifique se as seções têm conteúdo preenchido")
    console.log("3. Confirme que is_active = true para módulos e seções")
  } catch (error) {
    console.error("❌ Erro na verificação:", error)
  }
}

verifySync()
