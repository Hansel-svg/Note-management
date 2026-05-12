import { useState, useEffect } from "react";
import { supabase } from "../../lib/SupaBaseClient";
import {
  Dialog, Flex, Text, TextField, Button, Select, Callout,
  Table, Badge, IconButton, Separator, Box, Heading
} from "@radix-ui/themes";
import { Share2Icon, TrashIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";

export default function ShareNoteDialog({ open, onOpenChange, noteId, noteColor }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingShares, setFetchingShares] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchShares = async () => {
    if (!noteId) return;
    setFetchingShares(true);
    const { data, error } = await supabase.rpc('get_note_shares', { p_note_id: noteId });
    if (!error && data) setShares(data);
    setFetchingShares(false);
  };

  useEffect(() => {
    if (open && noteId) {
      setEmail('');
      setPermission('read');
      setMessage(null);
      fetchShares();
    }
  }, [open, noteId]);

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
        style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}
      >
        <Flex align="center" gap="2" mb="1">
          <Share2Icon />
          <Dialog.Title mb="0">Share Note</Dialog.Title>
        </Flex>
        <Dialog.Description size="2" color="gray" mb="4">
          Share this note with others by their registered email address.
        </Dialog.Description>

        {/* Add new share */}
        <Flex gap="2" mb="3" align="end">
          <Box style={{ flexGrow: 1 }}>
            <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
              Recipient Email
            </Text>
            <TextField.Root
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
              autoComplete="off"
            />
          </Box>
          <Box>
            <Text as="label" size="2" weight="bold" mb="1" style={{ display: 'block' }}>
              Permission
            </Text>
            <Select.Root value={permission} onValueChange={setPermission}>
              <Select.Trigger style={{ cursor: 'pointer', minWidth: '110px' }} />
              <Select.Content>
                <Select.Item value="read" style={{ cursor: 'pointer' }}>Read Only</Select.Item>
                <Select.Item value="edit" style={{ cursor: 'pointer' }}>Can Edit</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Button 
            color="cyan" 
            onClick={handleShare} 
            disabled={loading || !email.trim()}
            style={{ cursor: 'pointer' }}
          >
            {loading ? 'Sharing...' : 'Share'}
          </Button>
        </Flex>

        {/* Feedback callout */}
        {message && (
          <Callout.Root 
            color={message.type === 'success' ? 'green' : 'red'} 
            size="1" 
            mb="4"
          >
            <Callout.Icon>
              {message.type === 'success' ? <CheckCircledIcon /> : <CrossCircledIcon />}
            </Callout.Icon>
            <Callout.Text>{message.text}</Callout.Text>
          </Callout.Root>
        )}

        {/* Existing shares list */}
        {shares.length > 0 && (
          <>
            <Separator size="4" mb="3" />
            <Heading size="2" color="gray" mb="3">Shared with</Heading>
            <Flex direction="column" gap="2">
              {shares.map(share => (
                <Flex key={share.share_id} justify="between" align="center" gap="3"
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    backgroundColor: 'var(--gray-a2)'
                  }}
                >
                  <Text size="2" style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {share.email}
                  </Text>
                  <Select.Root 
                    value={share.permission}
                    onValueChange={(val) => handleChangePermission(share.share_id, val, share.email)}
                  >
                    <Select.Trigger style={{ cursor: 'pointer', minWidth: '105px' }} />
                    <Select.Content>
                      <Select.Item value="read" style={{ cursor: 'pointer' }}>Read Only</Select.Item>
                      <Select.Item value="edit" style={{ cursor: 'pointer' }}>Can Edit</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <IconButton 
                    color="red" 
                    variant="soft" 
                    size="1"
                    onClick={() => handleRevoke(share.share_id)}
                    style={{ cursor: 'pointer' }}
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
          <Text size="2" color="gray" align="center">Loading shares...</Text>
        )}

        {!fetchingShares && shares.length === 0 && (
          <Text size="2" color="gray" align="center" mt="2">
            Not shared with anyone yet.
          </Text>
        )}

        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
