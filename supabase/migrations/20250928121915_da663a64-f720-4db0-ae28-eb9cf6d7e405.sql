-- Fix recursive RLS for chat tables by using SECURITY DEFINER helper functions
-- 1) Drop existing problematic policies
DROP POLICY IF EXISTS "Utenti possono vedere chat pubbliche e proprie" ON public.chat_rooms;
DROP POLICY IF EXISTS "Utenti possono aggiungersi alle chat pubbliche" ON public.chat_members;
DROP POLICY IF EXISTS "Utenti possono vedere membri delle proprie chat" ON public.chat_members;

-- 2) Helper functions (stable, security definer) to avoid recursion
CREATE OR REPLACE FUNCTION public.is_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE room_id = _room_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.room_is_public(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = _room_id AND is_private = false
  );
$$;

CREATE OR REPLACE FUNCTION public.room_is_accessible(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = _room_id
      AND (is_private = false OR created_by = _user_id OR public.is_member(_room_id, _user_id))
  );
$$;

-- 3) Recreate policies using the helper functions
-- chat_rooms: allow users to see public rooms, rooms they created, or rooms they are members of
CREATE POLICY "Utenti possono vedere chat pubbliche e proprie"
ON public.chat_rooms
FOR SELECT
USING (public.room_is_accessible(id, auth.uid()));

-- chat_members: allow users to view members of rooms they can access, or their own membership rows
CREATE POLICY "Utenti possono vedere membri delle proprie chat"
ON public.chat_members
FOR SELECT
USING (auth.uid() = user_id OR public.room_is_accessible(room_id, auth.uid()));

-- chat_members: allow users to add themselves to public rooms only
CREATE POLICY "Utenti possono aggiungersi alle chat pubbliche"
ON public.chat_members
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.room_is_public(room_id));
