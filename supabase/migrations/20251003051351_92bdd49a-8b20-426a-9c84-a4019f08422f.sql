-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('da_fare', 'in_corso', 'completata', 'annullata');

-- Create task priority enum
CREATE TYPE public.task_priority AS ENUM ('bassa', 'media', 'alta', 'urgente');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'da_fare',
  priority task_priority NOT NULL DEFAULT 'media',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks assigned to them or created by them, admins can view all
CREATE POLICY "users_view_own_or_assigned_tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = assigned_to 
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Authenticated users can create tasks
CREATE POLICY "authenticated_users_create_tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

-- Policy: Users can update tasks they created or are assigned to, admins can update all
CREATE POLICY "users_update_own_or_assigned_tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = assigned_to 
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = assigned_to 
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Only creators and admins can delete tasks
CREATE POLICY "creators_and_admins_delete_tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();