import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Trash2, Mail, Phone } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="text-blue-600 w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900">Privacy Policy</h1>
            </div>
            <a href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
              ← Torna al sito
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            La tua privacy è importante per noi. Ecco come proteggiamo i tuoi dati.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Dati che raccogliamo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dati forniti volontariamente:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Nome (opzionale)</li>
                  <li>Numero di telefono (solo per notifiche WhatsApp)</li>
                  <li>Indirizzo email (solo per notifiche email)</li>
                  <li>Regione e ASL di interesse</li>
                  <li>Tipo di visita medica cercata</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dati tecnici:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Indirizzo IP (per prevenire abusi)</li>
                  <li>Data e ora della registrazione</li>
                  <li>Tipo di dispositivo e browser (per migliorare il servizio)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span>Come usiamo i tuoi dati</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Utilizziamo i tuoi dati esclusivamente per:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Monitorare la disponibilità di visite mediche per la tua ASL</li>
                <li>Inviarti notifiche quando si liberano posti</li>
                <li>Gestire la tua iscrizione e disiscrizione dal servizio</li>
                <li>Prevenire abusi e spam sul nostro sistema</li>
                <li>Migliorare la qualità del servizio (statistiche anonime)</li>
              </ul>
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">
                  🔒 NON vendiamo, affittiamo o condividiamo i tuoi dati con terze parti.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Come proteggiamo i tuoi dati</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Connessioni crittografate HTTPS</li>
                <li>Database protetti con accesso limitato</li>
                <li>Monitoraggio per attività sospette</li>
                <li>Backup sicuri e regolari</li>
                <li>Accesso ai dati solo per personale autorizzato</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>I tuoi diritti</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Hai sempre il diritto di:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Accedere ai tuoi dati personali</li>
                <li>Correggere informazioni inesatte</li>
                <li>Cancellare il tuo account e tutti i dati</li>
                <li>Disiscriverti in qualsiasi momento</li>
                <li>Esportare i tuoi dati</li>
                <li>Opporti al trattamento dei dati</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Come disiscriversi:</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>📧 Email: clicca sul link "Disiscriviti" in fondo al messaggio</li>
                  <li>📱 WhatsApp: rispondi "STOP" a qualsiasi notifica</li>
                  <li>🌐 Sito web: contattaci a privacy@salutedisponibile.it</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Contatti</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Per qualsiasi domanda sulla privacy o per esercitare i tuoi diritti:
              </p>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  <strong>Email:</strong> privacy@salutedisponibile.it
                </p>
                <p className="flex items-center text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-green-600" />
                  <strong>Supporto:</strong> Lun-Ven 9:00-18:00
                </p>
              </div>
            </CardContent>
          </Card>

          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Conformità GDPR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Questo servizio è conforme al Regolamento Generale sulla Protezione dei Dati (GDPR) 
                dell'Unione Europea. La base giuridica per il trattamento dei tuoi dati è il tuo 
                consenso esplicito, che puoi revocare in qualsiasi momento.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna al sito principale
          </a>
        </div>
      </div>
    </div>
  );
}