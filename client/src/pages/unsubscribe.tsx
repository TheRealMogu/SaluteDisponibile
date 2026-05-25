import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Unsubscribe() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const { data, isLoading, error } = useQuery<{ success: boolean; message?: string }>({
    queryKey: ['/api/unsubscribe', token],
    enabled: !!token,
    retry: false,
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Link non valido
            </h2>
            <p className="text-gray-600 mb-6">
              Il link di disiscrizione non è valido o è incompleto.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Torna al sito
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Elaborazione in corso...
            </h2>
            <p className="text-gray-600">
              Stiamo elaborando la tua richiesta di disiscrizione.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Errore
            </h2>
            <p className="text-gray-600 mb-6">
              {data?.message || "Si è verificato un errore durante la disiscrizione. Il link potrebbe essere scaduto o già utilizzato."}
            </p>
            <div className="space-y-3">
              <a 
                href="/" 
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Torna al sito
              </a>
              <p className="text-sm text-gray-500">
                Hai bisogno di aiuto? Scrivi a{" "}
                <a href="mailto:supporto@salutedisponibile.it" className="text-blue-600 hover:underline">
                  supporto@salutedisponibile.it
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Disiscrizione completata
          </h2>
          <p className="text-gray-600 mb-6">
            Ti sei disiscritto con successo da SaluteDisponibile.it. 
            Non riceverai più notifiche sulle visite mediche.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700">
              <strong>Cambiato idea?</strong><br />
              Puoi sempre iscriverti di nuovo visitando il nostro sito.
            </p>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/" 
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Torna al sito
            </a>
            <p className="text-xs text-gray-500">
              Grazie per aver usato SaluteDisponibile.it
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}