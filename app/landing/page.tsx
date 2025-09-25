"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Target, BookOpen, TrendingUp, Users, Star, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function LandingPage() {
  const t = useTranslations()

  const features = [
    {
      icon: Target,
      title: "Definição de Metas",
      description: "Estabeleça objetivos claros e acompanhe seu progresso de transformação pessoal.",
    },
    {
      icon: BookOpen,
      title: "Módulos de Crescimento",
      description: "Acesse conteúdos exclusivos sobre relacionamentos, autoestima e desenvolvimento pessoal.",
    },
    {
      icon: TrendingUp,
      title: "Análise de Progresso",
      description: "Visualize sua evolução através de gráficos e métricas personalizadas.",
    },
    {
      icon: Heart,
      title: "Reflexões Diárias",
      description: "Cultive o autoconhecimento através de práticas diárias de reflexão e gratidão.",
    },
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      content:
        "O Renove-se transformou completamente minha perspectiva sobre relacionamentos. Hoje me sinto mais confiante e conectada comigo mesma.",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Professora",
      content:
        "As reflexões diárias me ajudaram a desenvolver uma rotina de autocuidado que nunca pensei ser possível. Recomendo para todas as mulheres!",
      rating: 5,
    },
    {
      name: "Carla Mendes",
      role: "Designer",
      content:
        "Os módulos de crescimento são incríveis! Aprendi técnicas práticas que uso no meu dia a dia para melhorar meus relacionamentos.",
      rating: 5,
    },
  ]

  const stats = [
    { number: "10,000+", label: "Mulheres Transformadas" },
    { number: "95%", label: "Taxa de Satisfação" },
    { number: "50+", label: "Módulos de Conteúdo" },
    { number: "24/7", label: "Suporte Disponível" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Renove-se</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Depoimentos
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Começar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-purple opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Plataforma de Transformação Pessoal
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Renove-se e <span className="text-primary">Transforme</span> Sua Vida
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
                  Descubra seu potencial através de um guia personalizado para relacionamentos saudáveis, autoestima
                  elevada e crescimento pessoal contínuo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comece Sua Transformação
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Saiba Mais
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 gradient-purple rounded-3xl transform rotate-6 opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Progresso de Transformação</CardTitle>
                      <Badge variant="secondary">+150%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Autoestima</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Relacionamentos</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "92%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Bem-estar</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span>Crescimento consistente nos últimos 30 dias</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Recursos Principais
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">
              Tudo que Você Precisa para <span className="text-primary">Se Transformar</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Nossa plataforma oferece ferramentas completas para sua jornada de crescimento pessoal e relacionamentos
              saudáveis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center text-pretty">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Users className="w-4 h-4 mr-2" />
              Depoimentos
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">
              Histórias de <span className="text-primary">Transformação</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Veja como outras mulheres transformaram suas vidas com o Renove-se.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-pretty">"{testimonial.content}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-purple opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              <CheckCircle className="w-4 h-4 mr-2" />
              Comece Hoje
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">
              Pronta para <span className="text-primary">Transformar</span> Sua Vida?
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Junte-se a milhares de mulheres que já descobriram o poder da transformação pessoal. Comece sua jornada
              hoje mesmo e veja resultados reais em 30 dias.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar Minha Transformação
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  Já Tenho Conta
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Resultados garantidos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Renove-se</span>
              </div>
              <p className="text-muted-foreground text-pretty">
                Transformando vidas através do autoconhecimento e relacionamentos saudáveis.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Plataforma</h4>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Recursos
                </Link>
                <Link
                  href="#testimonials"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Depoimentos
                </Link>
                <Link href="/register" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Começar
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Suporte</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Central de Ajuda
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacidade
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Conecte-se</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Instagram
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Facebook
                </Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  YouTube
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Renove-se. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
