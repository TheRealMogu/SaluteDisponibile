import { useState } from "react";
import AdminDashboard from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Bell, Smartphone, FileText, Shield, Clock, MapPin, ThumbsUp, Globe, Users } from "lucide-react";
import RegistrationModal from "@/components/registration-modal";
import SuccessModal from "@/components/success-modal";

export default function Home() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleShowRegistration = (channel: 'whatsapp' | 'email') => {
    setSelectedChannel(channel);
    setIsRegistrationOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistrationOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="text-blue-600 w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900">SaluteDisponibile.it</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#home" className="text-slate-600 hover:text-blue-600 transition-colors">Home</a>
              <a href="#come-funziona" className="text-slate-600 hover:text-blue-600 transition-colors">Come Funziona</a>
              <a href="#privacy" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy</a>
              <button 
                onClick={() => setShowAdmin(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Bell className="w-20 h-20 md:w-24 md:h-24 text-blue-200 mx-auto mb-6" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ti avvisiamo quando si libera una visita medica
          </h1>
          
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Basta ricaricare mille volte il sito della tua ASL. Dicci dove e cosa cerchi, ti scriviamo noi su WhatsApp o via email.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={() => handleShowRegistration('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg h-auto"
            >
              <Smartphone className="w-5 h-5" />
              <span>Notifiche WhatsApp</span>
            </Button>
            
            <Button 
              onClick={() => handleShowRegistration('email')}
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg h-auto"
              variant="secondary"
            >
              <FileText className="w-5 h-5" />
              <span>Notifiche Email</span>
            </Button>
          </div>
          
          <p className="text-sm text-blue-200 mt-6">
            <Shield className="w-4 h-4 inline mr-2" />
            Servizio gratuito e conforme GDPR
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="come-funziona" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Come Funziona</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tre semplici passaggi per ricevere notifiche automatiche sui posti disponibili
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Scegli il Canale</h3>
              <p className="text-slate-600">
                Seleziona se ricevere le notifiche su WhatsApp o via email
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Compila il Modulo</h3>
              <p className="text-slate-600">
                Inserisci i tuoi dati e specifica la visita che ti serve
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Ricevi Notifiche</h3>
              <p className="text-slate-600">
                Ti avvisiamo appena si libera un posto per la tua visita
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perché Scegliere SaluteDisponibile</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Monitoraggio 24/7</h3>
                <p className="text-slate-600">
                  Controlliamo costantemente i portali ASL per trovare nuove disponibilità
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Smartphone className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Notifiche Immediate</h3>
                <p className="text-slate-600">
                  Ricevi un messaggio WhatsApp o email appena si libera un posto
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Completamente Gratuito</h3>
                <p className="text-slate-600">
                  Nessun costo nascosto, servizio sociale per tutti i cittadini
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Privacy Garantita</h3>
                <p className="text-slate-600">
                  I tuoi dati sono protetti e utilizzati solo per le notifiche
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <MapPin className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Regioni Supportate</h3>
                <p className="text-slate-600">
                  Lombardia, Lazio, Piemonte, Veneto - regioni accessibili senza login
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <ThumbsUp className="w-8 h-8 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Facile da Usare</h3>
                <p className="text-slate-600">
                  Interfaccia semplice, adatta a tutti, anche i meno esperti di tecnologia
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Regions Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Regioni Supportate</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Monitoriamo i portali sanitari regionali pubblicamente accessibili, senza bisogno di login o SPID
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lombardia</h3>
                <p className="text-sm text-slate-600 mb-3">ATS Milano, Bergamo, Brescia e altre</p>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Accessibile
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lazio</h3>
                <p className="text-sm text-slate-600 mb-3">ASL Roma 1-6, Latina, Frosinone e altre</p>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Accessibile
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Piemonte</h3>
                <p className="text-sm text-slate-600 mb-3">ASL Torino, Cuneo, Asti e altre</p>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Accessibile
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Veneto</h3>
                <p className="text-sm text-slate-600 mb-3">ULSS 1-9, Serenissima, Scaligera e altre</p>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Accessibile
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-blue-50 p-6 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Perché solo queste regioni?</h3>
              <p className="text-blue-800 mb-4">
                Ci concentriamo sulle regioni i cui portali sanitari sono pubblicamente accessibili senza richiedere login SPID o credenziali speciali.
              </p>
              <p className="text-blue-700 text-sm">
                Stiamo lavorando per aggiungere altre regioni man mano che i loro sistemi diventano più accessibili.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="text-blue-600 w-8 h-8" />
                <h3 className="text-xl font-semibold">SaluteDisponibile.it</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Il servizio gratuito che ti avvisa quando si liberano visite mediche nella tua ASL.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Link Utili</h4>
              <ul className="space-y-2">
                <li><a href="#come-funziona" className="text-gray-400 hover:text-white transition-colors">Come Funziona</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#termini" className="text-gray-400 hover:text-white transition-colors">Termini di Servizio</a></li>
                <li><a href="#contatti" className="text-gray-400 hover:text-white transition-colors">Contatti</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Supporto</h4>
              <p className="text-gray-400 mb-2">
                supporto@salutedisponibile.it
              </p>
              <p className="text-gray-400 mb-4">
                Lun-Ven 9:00-18:00
              </p>
              
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-300">
                  Non siamo affiliati a enti pubblici o sanitari. Servizio informativo gratuito.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SaluteDisponibile.it - Tutti i diritti riservati
            </p>
          </div>
        </div>
      </footer>

      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={handleRegistrationSuccess}
        channel={selectedChannel}
      />
      
      <SuccessModal 
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        channel={selectedChannel}
      />

      {/* Admin Dashboard */}
      {showAdmin && (
        <AdminDashboard />
      )}
    </div>
  );
}
