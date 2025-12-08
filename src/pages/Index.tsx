import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LicenseSelector } from "@/components/LicenseSelector";
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      console.log('Redirecting authenticated user to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while determining auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, show loading while redirect happens
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show license selector for non-logged in users
  const handleSelectLicense = () => {
    navigate('/auth');
  };

  return <LicenseSelector onSelectLicense={handleSelectLicense} />;
};

export default Index;
