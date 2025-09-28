import { useState, useEffect } from 'react';
import { MessageCircle, Users, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useToast } from '@/hooks/use-toast';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  is_private: boolean;
  created_at: string;
  unread_count?: number;
}

export default function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatRooms();
    setupUserInRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_members!inner (user_id)
        `)
        .eq('chat_members.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to remove the nested structure
      const transformedRooms = data?.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        room_type: room.room_type,
        is_private: room.is_private,
        created_at: room.created_at,
        unread_count: 0 // TODO: Calculate actual unread count
      })) || [];

      setRooms(transformedRooms);

      // Seleziona automaticamente la prima room
      if (transformedRooms.length > 0 && !selectedRoom) {
        setSelectedRoom(transformedRooms[0]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le chat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupUserInRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verifica se l'utente è membro delle chat di default
      const { data: membership } = await supabase
        .from('chat_members')
        .select('room_id')
        .eq('user_id', user.id);

      const memberRoomIds = membership?.map(m => m.room_id) || [];

      // Se non è membro di nessuna chat, aggiungilo alle chat pubbliche
      if (memberRoomIds.length === 0) {
        const { data: publicRooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('is_private', false);

        if (publicRooms && publicRooms.length > 0) {
          const memberships = publicRooms.map(room => ({
            room_id: room.id,
            user_id: user.id,
            role: 'member'
          }));

          await supabase
            .from('chat_members')
            .insert(memberships);

          // Ricarica le room
          fetchChatRooms();
        }
      }
    } catch (error) {
      console.error('Error setting up user in rooms:', error);
    }
  };

  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case 'support':
        return '🛠️';
      case 'direct':
        return '👤';
      default:
        return '💬';
    }
  };

  const formatRoomTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Oggi';
    } else if (diffDays === 2) {
      return 'Ieri';
    } else if (diffDays <= 7) {
      return `${diffDays} giorni fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar delle chat */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header della sidebar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Chat Interna</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Input placeholder="Cerca nelle chat..." />
        </div>

        {/* Lista delle chat */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Caricamento...
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="mb-3">Nessuna chat disponibile</p>
              <Button 
                size="sm" 
                onClick={setupUserInRooms}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Crea Chat di Default
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className={`cursor-pointer transition-all hover:bg-accent/50 ${
                    selectedRoom?.id === room.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getRoomIcon(room.room_type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">{room.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatRoomTime(room.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {room.description || 'Nessuna descrizione'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant={room.room_type === 'support' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {room.room_type === 'support' ? 'Supporto' : 
                             room.room_type === 'direct' ? 'Diretto' : 'Gruppo'}
                          </Badge>
                          {room.unread_count && room.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Area principale della chat */}
      <ChatInterface selectedRoom={selectedRoom} />
    </div>
  );
}