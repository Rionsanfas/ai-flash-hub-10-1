import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Brain, BookOpen, MessageCircle, DollarSign } from 'lucide-react';
import { auth } from '@/lib/auth';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    auth.getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/generate-flashcards" className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <span className="font-bold">quizora</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/generate-flashcards">
            <Button variant="ghost">Generate</Button>
          </Link>
          <Link to="/review-flashcards">
            <Button variant="ghost">Review</Button>
          </Link>
          <Link to="/ai-chat">
            <Button variant="ghost">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="ghost">
              <DollarSign className="h-4 w-4 mr-2" />
              Pricing
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="ghost">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;