-- Fix RLS circular dependency on workspace_members insert (first membership)

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Replace overly strict ALL policy that blocks first insert
DROP POLICY IF EXISTS "Owners/admins can manage members" ON public.workspace_members;

-- Allow owners/admins to insert members; explicitly allow the workspace owner to add themselves as first member
CREATE POLICY "Owners/admins can insert members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IS NOT NULL
  AND user_id = auth.uid()
  AND (
    -- First member: user is the owner of the workspace record
    EXISTS (
      SELECT 1
      FROM public.workspaces w
      WHERE w.id = workspace_id
        AND w.owner_id = auth.uid()
    )
    -- Or already an owner (after first membership exists)
    OR public.is_workspace_owner(auth.uid(), workspace_id)
    -- Or has settings admin permission
    OR public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
  )
);

-- Allow owners/settings-admins to update member permissions
CREATE POLICY "Owners/admins can update members"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
)
WITH CHECK (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
);

-- Allow owners/settings-admins to remove members
CREATE POLICY "Owners/admins can delete members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
);
