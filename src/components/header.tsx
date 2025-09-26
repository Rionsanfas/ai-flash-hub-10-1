import { useState, useEffect } from "react"
import { Brain, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { auth } from "@/lib/auth"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  isAuthenticated?: boolean
  user?: { name: string; email: string } | null
}

export function Header({ isAuthenticated = false, user }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await auth.logout()
    navigate("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-smooth">
      <div className={`transition-all duration-500 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="container mx-auto container-padding">
          <GlassCard 
            variant={isScrolled ? "strong" : "subtle"} 
            size="sm"
            className="transition-all duration-500 ease-smooth"
          >
            <div className="flex items-center justify-between">
              {/* Site Name - Clickable to Homepage */}
              <button 
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300 font-fredoka"
              >
                quizora
              </button>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" onClick={() => navigate("/generate-flashcards")} className="font-fredoka">
                      Generate
                    </Button>
                    <Button variant="ghost" onClick={() => navigate("/review-flashcards")} className="font-fredoka">
                      Review
                    </Button>
                    <Button variant="ghost" onClick={() => navigate("/ai-chat")} className="font-fredoka">
                      AI Chat
                    </Button>
                    <Button variant="ghost" onClick={() => navigate("/pricing")} className="font-fredoka">
                      Pricing
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate("/generate-flashcards")} className="font-fredoka">Generate</Button>
                    <Button variant="ghost" onClick={() => navigate("/review-flashcards")} className="font-fredoka">Review</Button>
                    <Button variant="ghost" onClick={() => navigate("/ai-chat")} className="font-fredoka">AI Chat</Button>
                    <Button variant="ghost" onClick={() => navigate("/pricing")} className="font-fredoka">Pricing</Button>
                  </>
                )}
              </nav>

              {/* Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-decorative">
                      Welcome, <span className="font-fredoka font-medium text-foreground">{user.name}</span>
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="hover-glow">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => navigate("/login")} className="font-fredoka">
                      Sign In
                    </Button>
                    <Button variant="hero" onClick={() => navigate("/signup")} className="btn-glow font-fredoka">
                      Get Started
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-3">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hover-glow"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-6 pt-6 border-t border-border/30">
                <div className="flex flex-col space-y-4">
                  {isAuthenticated ? (
                    <>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/generate-flashcards")}>
                        Generate
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/review-flashcards")}>
                        Review
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/ai-chat")}>
                        AI Chat
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/pricing")}>
                        Pricing
                      </Button>
                      {user && (
                        <div className="border-t border-border/30 pt-4">
                          <p className="text-sm text-decorative px-3 pb-3">
                            <span className="font-fredoka font-medium text-foreground">{user.name}</span>
                          </p>
                          <Button 
                            variant="destructive" 
                            className="w-full justify-start font-fredoka"
                            onClick={handleLogout}
                          >
                            Sign Out
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/generate-flashcards")}>
                        Generate
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/review-flashcards")}>
                        Review
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/ai-chat")}>
                        AI Chat
                      </Button>
                      <Button variant="ghost" className="justify-start font-fredoka" onClick={() => navigate("/pricing")}>
                        Pricing
                      </Button>
                      <div className="border-t border-border/30 pt-4 space-y-3">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start font-fredoka" 
                          onClick={() => navigate("/login")}
                        >
                          Sign In
                        </Button>
                        <Button 
                          variant="hero" 
                          className="w-full btn-glow font-fredoka" 
                          onClick={() => navigate("/signup")}
                        >
                          Get Started
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </header>
  )
}