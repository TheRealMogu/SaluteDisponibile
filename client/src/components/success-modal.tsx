import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info, Smartphone, Mail } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: 'whatsapp' | 'email';
}

export default function SuccessModal({ isOpen, onClose, channel }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="p-8">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Notifiche Attivate!</h3>
          
          <p className="text-lg text-slate-600 mb-6">
            {channel === 'whatsapp' 
              ? "Perfetto! Riceverai un messaggio su WhatsApp appena si libera uno slot per la tua visita."
              : "Perfetto! Riceverai un'email appena si libera uno slot per la tua visita."
            }
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-700 flex items-center justify-center">
              <Info className="w-4 h-4 mr-2" />
              Controlliamo la disponibilità ogni 15 minuti, 24 ore su 24.
            </p>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Perfetto!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
