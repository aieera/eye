import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-in fade-in duration-200">
        <p className="text-8xl font-bold text-muted-foreground/15 select-none leading-none">404</p>
        <p className="text-lg font-medium text-foreground mt-4">Page not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          The page you're looking for doesn't exist.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
