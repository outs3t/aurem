-- Fix infinite recursion in chat_members RLS policies
DROP POLICY IF EXISTS "Utenti possono vedere membri delle proprie chat" ON public.chat_members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Utenti possono vedere membri delle proprie chat" 
ON public.chat_members 
FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.chat_rooms cr 
  WHERE cr.id = chat_members.room_id 
  AND (cr.is_private = false OR cr.created_by = auth.uid())
));

-- Add missing policies for chat_members
CREATE POLICY "Utenti possono aggiungersi alle chat pubbliche" 
ON public.chat_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.chat_rooms cr 
  WHERE cr.id = room_id 
  AND cr.is_private = false
));

-- Fix chat_rooms policies
DROP POLICY IF EXISTS "Utenti possono vedere chat di cui sono membri" ON public.chat_rooms;

CREATE POLICY "Utenti possono vedere chat pubbliche e proprie" 
ON public.chat_rooms 
FOR SELECT 
USING (is_private = false OR created_by = auth.uid() OR EXISTS (
  SELECT 1 FROM public.chat_members cm 
  WHERE cm.room_id = id AND cm.user_id = auth.uid()
));

-- Create some default chat rooms
INSERT INTO public.chat_rooms (name, description, room_type, is_private, created_by) 
VALUES 
  ('Generale', 'Chat generale per tutti', 'group', false, (SELECT user_id FROM public.profiles LIMIT 1)),
  ('Supporto', 'Canale di supporto tecnico', 'support', false, (SELECT user_id FROM public.profiles LIMIT 1)),
  ('Annunci', 'Canale per annunci importanti', 'announcement', false, (SELECT user_id FROM public.profiles LIMIT 1))
ON CONFLICT DO NOTHING;