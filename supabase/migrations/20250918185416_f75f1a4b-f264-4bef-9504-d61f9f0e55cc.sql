-- Creazione del database completo per il CRM gestionale

-- Enum per i tipi di cliente
CREATE TYPE public.customer_type AS ENUM ('persona_fisica', 'azienda');

-- Enum per i ruoli utenti
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'dipendente', 'viewer');

-- Enum per gli stati dei contratti
CREATE TYPE public.contract_status AS ENUM ('bozza', 'attivo', 'scaduto', 'rinnovato', 'terminato');

-- Enum per i tipi di contratto
CREATE TYPE public.contract_type AS ENUM ('esterno', 'interno');

-- Enum per gli stati delle notifiche
CREATE TYPE public.notification_status AS ENUM ('non_letta', 'letta', 'archiviata');

-- Tabella profili utenti
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'dipendente',
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella anagrafica clienti
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_type customer_type NOT NULL,
  
  -- Dati persona fisica
  first_name TEXT,
  last_name TEXT,
  codice_fiscale TEXT,
  date_of_birth DATE,
  
  -- Dati azienda
  company_name TEXT,
  partita_iva TEXT,
  codice_sdi TEXT,
  legal_form TEXT,
  
  -- Dati comuni
  email TEXT,
  phone TEXT,
  mobile TEXT,
  fax TEXT,
  website TEXT,
  
  -- Indirizzo
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Italia',
  
  -- Dati commerciali
  credit_limit DECIMAL(10,2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30, -- giorni
  discount_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Metadati
  notes TEXT,
  tags TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella categorie prodotti
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella prodotti magazzino
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.product_categories(id),
  
  -- Prezzi e costi
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  
  -- Gestione stock
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  
  -- Unità di misura
  unit_of_measure TEXT DEFAULT 'pz',
  
  -- Serializzazione
  has_serial BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadati
  supplier TEXT,
  brand TEXT,
  model TEXT,
  weight DECIMAL(8,3),
  dimensions TEXT,
  
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella seriali prodotti
CREATE TABLE public.product_serials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  
  -- Status del seriale
  status TEXT NOT NULL DEFAULT 'disponibile', -- disponibile, venduto, difettoso, riparato
  
  -- Tracciabilità
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  supplier_invoice TEXT,
  warranty_expires DATE,
  
  -- Vendita
  sold_to UUID REFERENCES public.customers(id),
  sale_date DATE,
  sale_price DECIMAL(10,2),
  
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(product_id, serial_number)
);

-- Tabella movimenti magazzino
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL, -- entrata, uscita, rettifica, inventario
  quantity INTEGER NOT NULL,
  
  -- Riferimenti
  reference_type TEXT, -- contratto, vendita, acquisto, rettifica
  reference_id UUID,
  
  -- Dati movimento
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella contratti
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  contract_type contract_type NOT NULL,
  
  -- Riferimenti
  customer_id UUID REFERENCES public.customers(id),
  employee_id UUID REFERENCES public.profiles(user_id), -- per contratti interni
  
  -- Dati contratto
  title TEXT NOT NULL,
  description TEXT,
  
  -- Date
  start_date DATE NOT NULL,
  end_date DATE,
  signed_date DATE,
  
  -- Valori economici
  contract_value DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  
  -- Status e alert
  status contract_status NOT NULL DEFAULT 'bozza',
  renewal_notice_days INTEGER DEFAULT 30,
  auto_renewal BOOLEAN DEFAULT false,
  
  -- Documenti
  contract_file_url TEXT,
  
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella preventivi
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  
  -- Dati preventivo
  title TEXT NOT NULL,
  description TEXT,
  
  -- Date
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  
  -- Valori
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 22,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'bozza', -- bozza, inviato, accettato, rifiutato, scaduto
  
  -- Termini
  payment_terms INTEGER DEFAULT 30,
  delivery_terms TEXT,
  
  -- File generato
  pdf_file_url TEXT,
  
  notes TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella righe preventivi
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  
  -- Dati riga
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(12,2) NOT NULL,
  
  -- Ordinamento
  line_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella chat rooms
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL DEFAULT 'group', -- group, direct, support
  
  -- Metadati
  is_private BOOLEAN NOT NULL DEFAULT false,
  max_members INTEGER,
  
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella membri chat
CREATE TABLE public.chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Permessi
  role TEXT NOT NULL DEFAULT 'member', -- admin, moderator, member
  
  -- Status
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(room_id, user_id)
);

-- Tabella messaggi chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Contenuto
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, file, system
  
  -- File attachment
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  
  -- Riferimenti
  reply_to UUID REFERENCES public.chat_messages(id),
  
  -- Metadati
  edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella notifiche
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  
  -- Contenuto notifica
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- contract_expiry, stock_low, new_message, quote_request
  
  -- Riferimenti
  reference_type TEXT,
  reference_id UUID,
  
  -- Status
  status notification_status NOT NULL DEFAULT 'non_letta',
  
  -- Metadati
  priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Trigger per aggiornamento timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Applicazione trigger su tutte le tabelle con updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_serials_updated_at BEFORE UPDATE ON public.product_serials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per creare profilo automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Nome'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Cognome'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger per aggiornamento totali preventivi
CREATE OR REPLACE FUNCTION public.update_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  quote_record RECORD;
  new_subtotal DECIMAL(12,2);
BEGIN
  -- Calcola il nuovo subtotale
  SELECT COALESCE(SUM(line_total), 0) INTO new_subtotal
  FROM public.quote_items 
  WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  -- Aggiorna il preventivo
  UPDATE public.quotes 
  SET 
    subtotal = new_subtotal,
    tax_amount = new_subtotal * (tax_rate / 100),
    total_amount = new_subtotal + (new_subtotal * (tax_rate / 100)) - discount_amount,
    updated_at = now()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_quote_totals_on_items
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_items
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_totals();

-- Trigger per aggiornamento stock prodotti
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna lo stock del prodotto
  UPDATE public.products 
  SET 
    stock_quantity = stock_quantity + 
      CASE 
        WHEN NEW.movement_type = 'entrata' THEN NEW.quantity
        WHEN NEW.movement_type = 'uscita' THEN -NEW.quantity
        WHEN NEW.movement_type = 'rettifica' THEN NEW.quantity
        WHEN NEW.movement_type = 'inventario' THEN NEW.quantity - stock_quantity
        ELSE 0
      END,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_product_stock_on_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- Funzione per controllo scadenze contratti
CREATE OR REPLACE FUNCTION public.check_contract_expiries()
RETURNS void AS $$
DECLARE
  contract_record RECORD;
  days_until_expiry INTEGER;
BEGIN
  -- Verifica contratti in scadenza
  FOR contract_record IN 
    SELECT id, contract_number, title, end_date, renewal_notice_days, customer_id, employee_id
    FROM public.contracts 
    WHERE status = 'attivo' 
    AND end_date IS NOT NULL
    AND end_date > CURRENT_DATE
  LOOP
    days_until_expiry := contract_record.end_date - CURRENT_DATE;
    
    -- Se il contratto scade entro i giorni di preavviso
    IF days_until_expiry <= contract_record.renewal_notice_days THEN
      -- Crea notifica per il responsabile
      INSERT INTO public.notifications (
        user_id, title, message, notification_type, reference_type, reference_id, priority
      ) VALUES (
        COALESCE(contract_record.employee_id, (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1)),
        'Contratto in Scadenza',
        format('Il contratto %s "%s" scade tra %s giorni', 
               contract_record.contract_number, 
               contract_record.title, 
               days_until_expiry),
        'contract_expiry',
        'contract',
        contract_record.id,
        CASE WHEN days_until_expiry <= 7 THEN 'urgent' 
             WHEN days_until_expiry <= 15 THEN 'high' 
             ELSE 'normal' END
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Funzione per controllo stock bassi
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS void AS $$
DECLARE
  product_record RECORD;
BEGIN
  -- Verifica prodotti sotto scorta minima
  FOR product_record IN 
    SELECT id, code, name, stock_quantity, min_stock_level
    FROM public.products 
    WHERE active = true 
    AND min_stock_level > 0
    AND stock_quantity <= min_stock_level
  LOOP
    -- Crea notifica per admin/manager
    INSERT INTO public.notifications (
      user_id, title, message, notification_type, reference_type, reference_id, priority
    ) VALUES (
      (SELECT user_id FROM public.profiles WHERE role IN ('admin', 'manager') LIMIT 1),
      'Scorta Bassa',
      format('Il prodotto %s "%s" ha solo %s pezzi (minimo: %s)', 
             product_record.code, 
             product_record.name, 
             product_record.stock_quantity,
             product_record.min_stock_level),
      'stock_low',
      'product',
      product_record.id,
      CASE WHEN product_record.stock_quantity = 0 THEN 'urgent' ELSE 'high' END
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Indici per performance
CREATE INDEX idx_customers_type ON public.customers(customer_type);
CREATE INDEX idx_customers_active ON public.customers(active);
CREATE INDEX idx_products_code ON public.products(code);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_product_serials_serial ON public.product_serials(serial_number);
CREATE INDEX idx_product_serials_status ON public.product_serials(status);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_date ON public.quotes(quote_date);
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);

-- Enable Row Level Security su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_serials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies base per tutti gli utenti autenticati
CREATE POLICY "Utenti possono vedere i propri profili" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utenti possono aggiornare i propri profili" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies per clienti - tutti gli utenti autenticati possono gestire
CREATE POLICY "Utenti autenticati possono vedere clienti" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono creare clienti" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono aggiornare clienti" ON public.customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies per prodotti e magazzino
CREATE POLICY "Utenti autenticati possono vedere categorie" ON public.product_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire categorie" ON public.product_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono vedere prodotti" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire prodotti" ON public.products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono vedere seriali" ON public.product_serials FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire seriali" ON public.product_serials FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono vedere movimenti" ON public.stock_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono creare movimenti" ON public.stock_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies per contratti
CREATE POLICY "Utenti autenticati possono vedere contratti" ON public.contracts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire contratti" ON public.contracts FOR ALL USING (auth.role() = 'authenticated');

-- Policies per preventivi
CREATE POLICY "Utenti autenticati possono vedere preventivi" ON public.quotes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire preventivi" ON public.quotes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utenti autenticati possono vedere righe preventivi" ON public.quote_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Utenti autenticati possono gestire righe preventivi" ON public.quote_items FOR ALL USING (auth.role() = 'authenticated');

-- Policies per chat
CREATE POLICY "Utenti possono vedere chat di cui sono membri" ON public.chat_rooms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members WHERE room_id = chat_rooms.id AND user_id = auth.uid())
);

CREATE POLICY "Utenti possono vedere membri delle proprie chat" ON public.chat_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members cm WHERE cm.room_id = chat_members.room_id AND cm.user_id = auth.uid())
);

CREATE POLICY "Utenti possono vedere messaggi delle proprie chat" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
);

CREATE POLICY "Utenti possono inviare messaggi nelle proprie chat" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
  AND sender_id = auth.uid()
);

-- Policies per notifiche
CREATE POLICY "Utenti vedono solo le proprie notifiche" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Utenti aggiornano solo le proprie notifiche" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Dati di esempio
INSERT INTO public.product_categories (name, description) VALUES
('Elettronica', 'Prodotti elettronici e tecnologici'),
('Ufficio', 'Articoli per ufficio e cancelleria'),
('Software', 'Licenze e servizi software'),
('Servizi', 'Servizi professionali e consulenze');

-- Chat room generale
INSERT INTO public.chat_rooms (name, description, room_type) VALUES
('Generale', 'Chat generale aziendale', 'group'),
('Supporto Tecnico', 'Chat per supporto tecnico interno', 'support');