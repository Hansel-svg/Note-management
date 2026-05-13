import { useState, useEffect } from "react";
import { supabase } from "../lib/SupaBaseClient";
import { 
  Box, IconButton, Text, Popover, Flex, 
  Separator, Button, ScrollArea, Heading 
} from "@radix-ui/themes";
import { BellIcon, EnvelopeOpenIcon, Share2Icon, LockClosedIcon } from "@radix-ui/react-icons";

export default function NotificationBell({ session }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel('notifications-live')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${session.user.id}` 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    // Optionally trigger a scroll to the note or highlight it
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Box style={{ position: 'relative', cursor: 'pointer' }}>
          <IconButton variant="ghost" color="gray" size="2">
            <BellIcon width="18" height="18" />
          </IconButton>
          {unreadCount > 0 && (
            <Box
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--red-9)',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Box>
          )}
        </Box>
      </Popover.Trigger>
      <Popover.Content width="320px" style={{ padding: '0' }}>
        <Flex direction="column">
          <Flex justify="between" align="center" p="3">
            <Heading size="3">Notifications</Heading>
            {unreadCount > 0 && (
              <Button variant="ghost" size="1" color="cyan" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Flex>
          <Separator size="4" />
          <ScrollArea style={{ maxHeight: '400px' }}>
            <Box p="2">
              {notifications.length === 0 ? (
                <Flex direction="column" align="center" py="8" gap="2">
                  <EnvelopeOpenIcon width="24" height="24" style={{ color: 'var(--gray-7)' }} />
                  <Text size="2" color="gray">No notifications yet</Text>
                </Flex>
              ) : (
                notifications.map(notif => {
                  const isUpdate = notif.type === 'permission_updated';
                  return (
                    <Box
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: notif.is_read ? 'transparent' : 'var(--cyan-a2)',
                        transition: 'background-color 0.2s',
                        marginBottom: '4px'
                      }}
                      className="notif-item"
                    >
                      <Flex gap="3" align="start">
                        <Box mt="1">
                          {isUpdate ? (
                            <LockClosedIcon style={{ color: 'var(--amber-9)' }} />
                          ) : (
                            <Share2Icon style={{ color: 'var(--cyan-9)' }} />
                          )}
                        </Box>
                        <Box>
                          <Text as="div" size="2" weight="bold" mb="1">
                            {isUpdate ? 'Permission Updated' : 'Note Shared'}
                          </Text>
                          <Text as="div" size="2" color="gray">
                            <Text weight="bold" color={isUpdate ? 'amber' : 'cyan'}>
                              {notif.content.shared_by_email}
                            </Text> 
                            {isUpdate 
                              ? ` updated your access to "${notif.content.note_title}" to ${notif.content.new_permission}.`
                              : ` shared a note with you: "${notif.content.note_title}"`
                            }
                          </Text>
                          <Text as="div" size="1" color="gray" mt="1">
                            {new Date(notif.created_at).toLocaleString()}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })
              )}
            </Box>
          </ScrollArea>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
