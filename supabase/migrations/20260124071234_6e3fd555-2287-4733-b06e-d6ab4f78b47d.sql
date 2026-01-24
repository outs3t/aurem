-- Fix: Allow authenticated users to create workspaces without circular dependency
-- Drop and recreate the INSERT policy to be simpler
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

-- Simple policy: any authenticated user can create a workspace if they set themselves as owner
CREATE POLICY "authenticated_users_create_workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Also need to allow users to SELECT the workspace they just created
-- The current SELECT policy uses is_workspace_member which checks workspace_members table
-- But the workspace_members record is created AFTER the workspace
-- So we need to also allow owners to see their workspaces directly
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;

CREATE POLICY "members_or_owners_view_workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() 
  OR public.is_workspace_member(auth.uid(), id)
);