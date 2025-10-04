import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface NewChatDialogProps {
  onChatCreated: () => void;
}

export function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, user_id')
        .neq('user_id', currentUser.id)
        .order('first_name');

      if (error) throw error;

      // Transform data to match our interface
      const transformedUsers = data?.map(profile => ({
        id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli utenti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (otherUser: User) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      // Check if a direct chat already exists
      const { data: existingRooms } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          chat_members!inner (user_id)
        `)
        .eq('room_type', 'direct')
        .eq('is_private', true);

      // Find a room that has both users
      const existingRoom = existingRooms?.find(room => {
        const memberIds = room.chat_members.map((m: any) => m.user_id);
        return memberIds.includes(currentUser.id) && memberIds.includes(otherUser.id);
      });

      if (existingRoom) {
        toast({
          title: 'Chat già esistente',
          description: `Hai già una chat con ${otherUser.first_name} ${otherUser.last_name}`,
        });
        setOpen(false);
        onChatCreated();
        return;
      }

      // Create new direct chat room
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            name: `${otherUser.first_name} ${otherUser.last_name}`,
            description: 'Chat diretta',
            room_type: 'direct',
            is_private: true,
            created_by: currentUser.id
          }
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      // Add both users as members
      const { error: membersError } = await supabase
        .from('chat_members')
        .insert([
          {
            room_id: newRoom.id,
            user_id: currentUser.id,
            role: 'member'
          },
          {
            room_id: newRoom.id,
            user_id: otherUser.id,
            role: 'member'
          }
        ]);

      if (membersError) throw membersError;

      toast({
        title: 'Chat creata',
        description: `Chat con ${otherUser.first_name} ${otherUser.last_name} creata con successo`,
      });

      setOpen(false);
      onChatCreated();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare la chat',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const getUserInitials = (user: User) => {
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca utente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Caricamento utenti...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessun utente trovato
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => createDirectChat(user)}
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
