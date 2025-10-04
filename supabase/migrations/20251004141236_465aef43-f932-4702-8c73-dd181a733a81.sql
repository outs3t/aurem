-- Modifica policy per permettere inserimento messaggi di sistema nella chat
DROP POLICY IF EXISTS "Utenti possono inviare messaggi nelle proprie chat" ON public.chat_messages;

CREATE POLICY "Utenti possono inviare messaggi nelle proprie chat"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  -- Permetti messaggi autenticati
  (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_members.room_id = chat_messages.room_id 
    AND chat_members.user_id = auth.uid()
  ))
  OR
  -- Permetti messaggi di sistema (per notifiche automatiche)
  (sender_id = '00000000-0000-0000-0000-000000000000'::uuid)
);