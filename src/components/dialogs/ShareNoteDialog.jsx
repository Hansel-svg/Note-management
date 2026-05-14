import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/SupaBaseClient";
import {
  Dialog, Flex, Text, TextField, Button, Select, Callout,
  IconButton, Separator, Box, Heading
} from "@radix-ui/themes";
import { Share2Icon, TrashIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";

export default function ShareNoteDialog({ open, onOpenChange, noteId, noteColor }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShares, setFetchingShares] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchShares = useCallback(async () => {
    if (!noteId) return;
    setFetchingShares(true);
    const { data, error } = await supabase.rpc('get_note_shares', { p_note_id: noteId });
    if (!error && data) setShares(data);
    setFetchingShares(false);
  }, [noteId]);

  useEffect(() => {
    if (open && noteId) {
      setTimeout(() => {
        setEmail('');
        setPermission('read');
        setMessage(null);
        fetchShares();
      }, 0);
    }
  }, [open, noteId, fetchShares]);

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.rpc('share_note', {
      p_note_id: noteId,
      p_recipient_email: email.trim().toLowerCase(),
      p_permission: permission
    });

    if (error || data?.error) {
      setMessage({ type: 'error', text: data?.error || error?.message || 'Something went wrong.' });
    } else {
      setMessage({ type: 'success', text: `Note shared with ${email.trim()}.` });
      setEmail('');
      fetchShares();
    }
    setLoading(false);
  };

  const handleChangePermission = async (shareId, newPermission, recipientEmail) => {
    const { data, error } = await supabase.rpc('share_note', {
      p_note_id: noteId,
      p_recipient_email: recipientEmail,
      p_permission: newPermission
    });
    if (!error && !data?.error) fetchShares();
  };

  const handleRevoke = async (shareId) => {
    await supabase.rpc('revoke_share', { p_share_id: shareId });
    setShares(prev => prev.filter(s => s.share_id !== shareId));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content 
        maxWidth="520px"
        style={{ 
          backgroundColor: 'var(--bg)', 
          borderRadius: 0, 
          border: '1.5px solid var(--border)' 
        }}
      >
        <Flex align="center" gap="2" mb="1" style={{ color: 'var(--text-h)' }}>
          <Share2Icon width="20" height="20" />
          <Dialog.Title mb="0" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share Note</Dialog.Title>
        </Flex>
        <Dialog.Description size="2" color="gray" mb="5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', opacity: 0.6 }}>
          Share this note with others by their registered email address.
        </Dialog.Description>

        <Flex gap="2" mb="4" align="end">
          <Box style={{ flexGrow: 1 }}>
            <Text as="label" size="1" weight="bold" mb="1" style={{ display: 'block', textTransform: 'uppercase', color: 'var(--text-h)' }}>
              Recipient Email
            </Text>
            <TextField.Root
              type="email"
              placeholder="COLLEAGUE@EXAMPLE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
              autoComplete="off"
              style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
            />
          </Box>
          <Box>
            <Text as="label" size="1" weight="bold" mb="1" style={{ display: 'block', textTransform: 'uppercase', color: 'var(--text-h)' }}>
              Permission
            </Text>
            <Select.Root value={permission} onValueChange={setPermission}>
              <Select.Trigger style={{ cursor: 'pointer', minWidth: '110px' }} />
              <Select.Content>
                <Select.Item value="read" style={{ cursor: 'pointer' }}>READ ONLY</Select.Item>
                <Select.Item value="edit" style={{ cursor: 'pointer' }}>CAN EDIT</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Button 
            color="gray" 
            onClick={handleShare} 
            disabled={loading || !email.trim()}
            style={{ 
              cursor: 'pointer', 
              borderRadius: 0, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              backgroundColor: 'var(--text-h)', 
              color: 'var(--bg)' 
            }}
          >
            {loading ? 'SHARING...' : 'SHARE'}
          </Button>
        </Flex>

        {message && (
          <Callout.Root 
            color="gray" 
            size="1" 
            mb="4"
            style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: message.type === 'success' ? 'var(--bg)' : 'var(--bg)' }}
          >
            <Callout.Icon style={{ color: 'var(--text-h)' }}>
              {message.type === 'success' ? <CheckCircledIcon /> : <CrossCircledIcon />}
            </Callout.Icon>
            <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>{message.text}</Callout.Text>
          </Callout.Root>
        )}

        {shares.length > 0 && (
          <>
            <Separator size="4" mb="4" style={{ backgroundColor: 'var(--border)' }} />
            <Heading size="2" color="gray" mb="3" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared with</Heading>
            <Flex direction="column" gap="2">
              {shares.map(share => (
                <Flex key={share.share_id} justify="between" align="center" gap="3"
                  style={{ 
                    padding: '12px', 
                    borderRadius: 0,
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Text size="2" style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {share.email}
                  </Text>
                  <Select.Root 
                    value={share.permission}
                    onValueChange={(val) => handleChangePermission(share.share_id, val, share.email)}
                  >
                    <Select.Trigger style={{ cursor: 'pointer', minWidth: '105px' }} />
                    <Select.Content>
                      <Select.Item value="read" style={{ cursor: 'pointer' }}>READ ONLY</Select.Item>
                      <Select.Item value="edit" style={{ cursor: 'pointer' }}>CAN EDIT</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <IconButton 
                    color="gray" 
                    variant="ghost" 
                    size="1"
                    onClick={() => handleRevoke(share.share_id)}
                    style={{ cursor: 'pointer', color: 'var(--text-h)', borderRadius: 0 }}
                    title="Revoke access"
                  >
                    <TrashIcon />
                  </IconButton>
                </Flex>
              ))}
            </Flex>
          </>
        )}

        {fetchingShares && (
          <Text size="2" color="gray" align="center" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Loading shares...</Text>
        )}

        {!fetchingShares && shares.length === 0 && (
          <Text size="2" color="gray" align="center" mt="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.4 }}>
            Not shared with anyone yet.
          </Text>
        )}

        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
