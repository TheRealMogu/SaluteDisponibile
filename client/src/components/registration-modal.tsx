import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Smartphone, Mail, X } from "lucide-react";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  channel: 'whatsapp' | 'email';
}

export default function RegistrationModal({ isOpen, onClose, onSuccess, channel }: RegistrationModalProps) {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      nome: "",
      telefono: "",
      email: "",
      canale: channel,
      regione: "",
      asl: "",
      tipoVisita: "",
    },
  });

  // Reset form when channel changes
  useEffect(() => {
    form.setValue('canale', channel);
    form.clearErrors();
  }, [channel, form]);

  // Fetch regions
  const { data: regions = [] } = useQuery({
    queryKey: ['/api/regions'],
    enabled: isOpen,
  });

  // Fetch ASLs for selected region
  const { data: asls = [] } = useQuery({
    queryKey: ['/api/regions', selectedRegion, 'asl'],
    enabled: !!selectedRegion,
  });

  // Fetch visit types
  const { data: visitTypes = [] } = useQuery({
    queryKey: ['/api/visit-types'],
    enabled: isOpen,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest('POST', '/api/register', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registrazione completata!",
        description: "Riceverai notifiche appena si liberano posti per la tua visita.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella registrazione",
        description: error.message || "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    form.setValue('regione', region);
    form.setValue('asl', ''); // Reset ASL when region changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {channel === 'whatsapp' ? (
              <>
                <Smartphone className="w-6 h-6 text-green-600" />
                <span>Notifiche WhatsApp</span>
              </>
            ) : (
              <>
                <Mail className="w-6 h-6 text-blue-600" />
                <span>Notifiche Email</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci il tuo nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {channel === 'whatsapp' ? (
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero WhatsApp *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">+39</span>
                        </div>
                        <Input 
                          placeholder="333 123 4567" 
                          className="pl-12"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      <Smartphone className="w-4 h-4 inline mr-1" />
                      Riceverai un messaggio di conferma su WhatsApp
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indirizzo Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="esempio@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Riceverai un email di conferma
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="regione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regione *</FormLabel>
                  <Select onValueChange={handleRegionChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona la tua regione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region: any) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="asl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ASL *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={selectedRegion ? "Seleziona la tua ASL" : "Prima seleziona la regione"} 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {asls.map((asl: any) => (
                        <SelectItem key={asl.value} value={asl.value}>
                          {asl.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoVisita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di Visita *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il tipo di visita" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {visitTypes.map((visit: any) => (
                        <SelectItem key={visit.value} value={visit.value}>
                          {visit.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox required />
                <span className="text-sm text-gray-700">
                  Accetto il trattamento dei dati personali secondo la{" "}
                  <a href="#privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  e confermo di voler ricevere notifiche sui posti disponibili.
                </span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                "Registrazione in corso..."
              ) : channel === 'whatsapp' ? (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Attiva Notifiche WhatsApp
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Attiva Notifiche Email
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
