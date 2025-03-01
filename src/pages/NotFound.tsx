
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
      <div className="text-center max-w-md mx-auto glass-card p-8 rounded-lg animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 text-convocation-800">404</h1>
        <p className="text-xl text-convocation-600 mb-6">The page you're looking for doesn't exist</p>
        <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
