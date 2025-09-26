import { useState } from "react"
import { ArrowRight, Brain, Zap, Target, Star, CheckCircle, Globe, Shield, Clock, FileText, Gauge, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Header } from "@/components/header"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Generation",
      badge: "Core Feature",
      description: "Advanced AI models ensure perfect flashcard creation with industry-leading accuracy."
    },
    {
      icon: Globe,
      title: "Multi-Subject Support",
      badge: "25+ Subjects",
      description: "Create and study flashcards in over 25 different subjects with specialized AI context."
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      badge: "10x Speed",
      description: "Process hours of content in minutes. Our optimized pipeline delivers results 10x faster than competitors."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      badge: "SOC 2 Compliant",
      description: "Bank-grade encryption and privacy protection. Your study materials are processed securely and never stored."
    },
    {
      icon: Clock,
      title: "Real-Time Generation",
      badge: "Live Processing",
      description: "Watch flashcards appear in real-time as you upload. Perfect for live study sessions and cramming."
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      badge: "Universal Support",
      description: "Export in Anki, Quizlet, PDF, or custom formats. Compatible with all major study platforms."
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$20",
      period: "/month",
      tokens: "Up to 500 flashcards/month",
      description: "Perfect for getting started",
      features: [
        "Up to 500 flashcards/month",
        "20 tokens for uploads/chat",
        "AI chat (basic)",
        "Study mode",
        "Secure storage"
      ],
      monthlyLink: "https://buy.polar.sh/polar_cl_AywFSsUoNMSkjgtN0ymyijKK34LIGtXNwD8ur1mGWGd",
      yearlyLink: "https://buy.polar.sh/polar_cl_ZwBFKnqzzP5wtgjBksgr3EyPotucqeHpYuz9j0UArB7",
      popular: false
    },
    {
      name: "Pro",
      price: "$50",
      period: "/month",
      tokens: "Up to 1,250 flashcards/month",
      description: "Great for serious students",
      features: [
        "Up to 1,250 flashcards/month",
        "50 tokens for uploads/chat",
        "Advanced difficulty levels",
        "Study analytics",
        "Larger uploads"
      ],
      monthlyLink: "https://buy.polar.sh/polar_cl_5igPIFTuvGn9pfZRdS8ri7LtJyJ7MXB5Z1fAb4czLQM",
      yearlyLink: "https://buy.polar.sh/polar_cl_rssq9pFo5YpwHS6U7pbI4z7Fv3WJu6fQuKD860SdItA",
      popular: true
    },
    {
      name: "Premium",
      price: "$100",
      period: "/month", 
      tokens: "Up to 2,500 flashcards/month",
      description: "For maximum power and scale",
      features: [
        "Up to 2,500 flashcards/month",
        "100 tokens for uploads/chat",
        "Unlimited upload size",
        "Extended AI chat",
        "Advanced analytics"
      ],
      monthlyLink: "https://buy.polar.sh/polar_cl_Friuq7vcdALCwiHLnPa1xPDFunAX6sexGY6HO0ejaVC",
      yearlyLink: "https://buy.polar.sh/polar_cl_EAlPVnFk8sxwSWB0sXvmZqb2qpx6GrntPXPrl0HokEA",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 container-padding">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 font-fredoka">
              Transform Learning to{" "}
              <span className="text-foreground">Flashcards</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-Powered Flashcard Generation with Perfect Accuracy
            </p>
            <p className="text-lg text-muted-foreground mb-12">
              Create any study material in a single click
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/dashboard")}
              className="font-fredoka mb-20"
            >
              Try Dashboard
            </Button>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <GlassCard variant="subtle" className="text-center p-8">
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-background" />
                </div>
                <div className="text-3xl font-bold text-foreground font-fredoka mb-2">10x Faster</div>
                <div className="text-muted-foreground">Processing Speed</div>
              </GlassCard>
              <GlassCard variant="subtle" className="text-center p-8">
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-background" />
                </div>
                <div className="text-3xl font-bold text-foreground font-fredoka mb-2">99.5%</div>
                <div className="text-muted-foreground">Accuracy Rate</div>
              </GlassCard>
              <GlassCard variant="subtle" className="text-center p-8">
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-background" />
                </div>
                <div className="text-3xl font-bold text-foreground font-fredoka mb-2">50+</div>
                <div className="text-muted-foreground">Languages</div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container-padding">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-fredoka">
              Powerful AI Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create professional flashcards with the power of artificial intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <GlassCard key={index} variant="subtle" className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-foreground font-fredoka">{feature.title}</h3>
                  <span className="px-3 py-1 bg-foreground text-background text-sm rounded-full font-medium">
                    {feature.badge}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 container-padding">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-fredoka">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with our flexible pricing options designed for every creator's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {pricingPlans.map((plan, index) => (
              <GlassCard 
                key={index} 
                variant={plan.popular ? "strong" : "subtle"} 
                className={`p-8 relative ${plan.popular ? 'ring-2 ring-primary scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2 font-fredoka">{plan.name}</h3>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {plan.price}<span className="text-lg font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-foreground" />
                    <span className="font-semibold text-foreground">{plan.tokens}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <Button 
                    variant={plan.popular ? 'hero' : 'outline'} 
                    className={`w-full font-fredoka ${plan.popular ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                    asChild
                  >
                    <a href={plan.monthlyLink} target="_blank" rel="noopener noreferrer">
                      Monthly
                    </a>
                  </Button>
                  <Button 
                    variant={plan.popular ? 'hero' : 'outline'} 
                    className={`w-full font-fredoka ${plan.popular ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}
                    asChild
                  >
                    <a href={plan.yearlyLink} target="_blank" rel="noopener noreferrer">
                      Yearly
                    </a>
                  </Button>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>

          {/* Custom Plan */}
          <div className="max-w-md mx-auto">
            <GlassCard variant="subtle" className="text-center p-8">
              <h3 className="text-xl font-bold text-foreground mb-4 font-fredoka">Custom</h3>
              <h4 className="text-2xl font-bold text-foreground mb-2">Variable</h4>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-foreground" />
                <span className="font-semibold text-foreground">Variable tokens</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">Tailored for enterprises or high-volume users</p>
              <Button variant="outline" className="w-full font-fredoka" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Token Explanation */}
      <section className="py-12 container-padding">
        <div className="container mx-auto">
          <GlassCard variant="subtle" className="max-w-3xl mx-auto p-8 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4 font-fredoka">How Tokens Work</h3>
            <p className="text-muted-foreground">
              1 token = 10MB of study material processing. Tokens are used for AI flashcard generation and content export. Unused tokens never expire, giving you complete flexibility.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 container-padding">
        <div className="container mx-auto">
          <GlassCard variant="subtle" className="p-12">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground font-fredoka">quizora</span>
              </div>
              <p className="text-muted-foreground">Transform study material to professional flashcards with AI</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
              <div>
                <h4 className="font-semibold text-foreground mb-4 font-fredoka">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4 font-fredoka">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4 font-fredoka">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4 font-fredoka">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Refund Policy</a></li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </footer>
    </div>
  )
}