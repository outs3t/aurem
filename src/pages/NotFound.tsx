import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Pagina non trovata</h2>
        <p className="text-muted-foreground max-w-md">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Button asChild className="mt-6">
          <a href="/">Torna al Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
