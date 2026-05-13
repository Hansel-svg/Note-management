import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/SupaBaseClient";
import { 
  Box, IconButton, Text, Popover, Flex, 
  Separator, Button, ScrollArea, Heading 
} from "@radix-ui/themes";
import { BellIcon, EnvelopeOpenIcon, Share2Icon, LockClosedIcon } from "@radix-ui/react-icons";

export default function NotificationBell({ session, onSelectNote, label }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [instanceId] = useState(() => Math.random().toString(36).substring(7));

  const fetchNotifications = useCallback(async () => {
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
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    setTimeout(() => {
      fetchNotifications();
    }, 0);

    const channel = supabase
      .channel(`notifications-live-${instanceId}`)
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
  }, [session, fetchNotifications]);

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
    if (notif.content?.note_id && onSelectNote) {
      onSelectNote(notif.content.note_id);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Box style={{ cursor: 'pointer', width: label ? '100%' : 'auto' }}>
          <Flex align="center" gap="2" style={{ position: 'relative' }}>
            <IconButton variant="ghost" color="gray" size="2" style={{ color: 'var(--text-h)', pointerEvents: 'none' }}>
              <BellIcon width="20" height="20" />
            </IconButton>
            {label && <Text size="2" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>{label}</Text>}
            {unreadCount > 0 && (
              <Box
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '12px',
                  backgroundColor: 'var(--text-h)',
                  color: 'var(--bg)',
                  borderRadius: 0,
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '900',
                  pointerEvents: 'none',
                  border: '1px solid var(--bg)',
                  zIndex: 1
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Box>
            )}
          </Flex>
        </Box>
      </Popover.Trigger>
      <Popover.Content width="340px" style={{ padding: '0', borderRadius: 0, border: '1.5px solid var(--border)' }}>
        <Flex direction="column">
          <Flex justify="between" align="center" p="3">
            <Heading size="3" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>Notifications</Heading>
            {unreadCount > 0 && (
              <Button variant="ghost" size="1" color="gray" onClick={markAllAsRead} style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)', cursor: 'pointer' }}>
                Mark all as read
              </Button>
            )}
          </Flex>
          <Separator size="4" style={{ backgroundColor: 'var(--border)' }} />
          <ScrollArea style={{ maxHeight: '400px' }}>
            <Box p="2">
              {notifications.length === 0 ? (
                <Flex direction="column" align="center" py="8" gap="2">
                  <EnvelopeOpenIcon width="24" height="24" style={{ color: 'var(--text-h)', opacity: 0.2 }} />
                  <Text size="2" style={{ color: 'var(--text)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.4 }}>Inbox Empty</Text>
                </Flex>
              ) : (
                notifications.map(notif => {
                  const isUpdate = notif.type === 'permission_updated';
                  return (
                    <Box
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '16px',
                        borderRadius: 0,
                        cursor: 'pointer',
                        backgroundColor: notif.is_read ? 'transparent' : 'var(--code-bg)',
                        borderLeft: notif.is_read ? 'none' : '4px solid var(--text-h)',
                        transition: 'background-color 0.2s',
                        marginBottom: '4px',
                        borderBottom: '1px solid var(--border-subtle)'
                      }}
                      className="notif-item"
                    >
                      <Flex gap="3" align="start">
                        <Box mt="1">
                          {isUpdate ? (
                            <LockClosedIcon style={{ color: 'var(--text-h)' }} />
                          ) : (
                            <Share2Icon style={{ color: 'var(--text-h)' }} />
                          )}
                        </Box>
                        <Box>
                          <Text as="div" size="2" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', mb: '1', color: 'var(--text-h)' }}>
                            {isUpdate ? 'Permission Updated' : 'Note Shared'}
                          </Text>
                          <Text as="div" size="2" style={{ color: 'var(--text)', lineHeight: 1.4 }}>
                            <Text weight="bold" style={{ color: 'var(--text-h)' }}>
                              {notif.content.shared_by_email}
                            </Text> 
                            {isUpdate 
                              ? ` updated your access to "${notif.content.note_title}" to ${notif.content.new_permission}.`
                              : ` shared a note with you: "${notif.content.note_title}"`
                            }
                          </Text>
                          <Text as="div" size="1" mt="2" style={{ color: 'var(--text)', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase' }}>
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
