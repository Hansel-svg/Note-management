import { Dialog, Tabs, Box, Flex, TextField, Button, Callout, Text } from "@radix-ui/themes";

export default function ManageLockDialog({
  open,
  onOpenChange,
  noteColor,
  hasPassword,
  manageLockError,
  setManageLockError,
  manageLockCurrentPassword,
  setManageLockCurrentPassword,
  manageLockNewPassword,
  setManageLockNewPassword,
  manageLockConfirmPassword,
  setManageLockConfirmPassword,
  onSubmit
}) {
  const clearForm = () => {
    setManageLockError('');
    setManageLockCurrentPassword('');
    setManageLockNewPassword('');
    setManageLockConfirmPassword('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content 
        maxWidth="400px" 
        style={{ 
          backgroundColor: 'var(--bg)', 
          borderRadius: 0, 
          border: '1.5px solid var(--border)' 
        }}
      >
        <Dialog.Title style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{hasPassword ? 'MANAGE LOCK' : 'SET PASSWORD'}</Dialog.Title>
        
        {manageLockError && (
          <Callout.Root color="gray" size="1" mb="4" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
            <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>{manageLockError}</Callout.Text>
          </Callout.Root>
        )}

        {hasPassword ? (
          <Tabs.Root defaultValue="change" onValueChange={clearForm}>
            <Tabs.List size="1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <Tabs.Trigger value="change" style={{ cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase' }}>Change Password</Tabs.Trigger>
              <Tabs.Trigger value="remove" style={{ cursor: 'pointer', fontWeight: 800, textTransform: 'uppercase' }}>Remove Lock</Tabs.Trigger>
            </Tabs.List>
            
            <Box pt="4">
              <Tabs.Content value="change">
                <Flex direction="column" gap="3">
                  <TextField.Root 
                    type="password" 
                    placeholder="CURRENT PASSWORD" 
                    value={manageLockCurrentPassword} 
                    onChange={(e) => setManageLockCurrentPassword(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('change'); }}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                    autoComplete="new-password" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="NEW PASSWORD" 
                    value={manageLockNewPassword} 
                    onChange={(e) => setManageLockNewPassword(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('change'); }}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                    autoComplete="new-password" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="CONFIRM NEW PASSWORD" 
                    value={manageLockConfirmPassword} 
                    onChange={(e) => setManageLockConfirmPassword(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('change'); }}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                    autoComplete="new-password" 
                  />
                  <Flex justify="between" mt="4" align="center">
                    <Dialog.Close>
                      <Button variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Cancel</Button>
                    </Dialog.Close>
                    <Button 
                      color="gray" 
                      style={{ 
                        cursor: 'pointer', 
                        borderRadius: 0, 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        backgroundColor: 'var(--text-h)', 
                        color: 'var(--bg)' 
                      }} 
                      onClick={() => onSubmit('change')}
                    >
                      Update Password
                    </Button>
                  </Flex>
                </Flex>
              </Tabs.Content>
              <Tabs.Content value="remove">
                <Flex direction="column" gap="3">
                  <Text size="2" color="gray" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>Enter your current password to remove the lock.</Text>
                  <TextField.Root 
                    type="password" 
                    placeholder="CURRENT PASSWORD" 
                    value={manageLockCurrentPassword} 
                    onChange={(e) => setManageLockCurrentPassword(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('remove'); }}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                    autoComplete="new-password" 
                  />
                  <Flex justify="between" mt="4" align="center">
                    <Dialog.Close>
                      <Button variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Cancel</Button>
                    </Dialog.Close>
                    <Button 
                      color="gray" 
                      variant="solid" 
                      style={{ 
                        cursor: 'pointer', 
                        borderRadius: 0, 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        backgroundColor: 'var(--text-h)', 
                        color: 'var(--bg)' 
                      }} 
                      onClick={() => onSubmit('remove')}
                    >
                      Remove Lock
                    </Button>
                  </Flex>
                </Flex>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        ) : (
          <>
            <Dialog.Description size="2" color="gray" mb="5" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>
              Set a password to lock this note.
            </Dialog.Description>
            <Flex direction="column" gap="3">
              <TextField.Root 
                type="password" 
                placeholder="NEW PASSWORD" 
                value={manageLockNewPassword} 
                onChange={(e) => setManageLockNewPassword(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('set'); }}
                style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                autoComplete="new-password" 
              />
              <TextField.Root 
                type="password" 
                placeholder="CONFIRM NEW PASSWORD" 
                value={manageLockConfirmPassword} 
                onChange={(e) => setManageLockConfirmPassword(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') onSubmit('set'); }}
                style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                autoComplete="new-password" 
              />
            </Flex>
            <Flex justify="end" gap="3" mt="6">
              <Dialog.Close>
                <Button variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Cancel</Button>
              </Dialog.Close>
              <Button 
                color="gray" 
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: 0, 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  backgroundColor: 'var(--text-h)', 
                  color: 'var(--bg)' 
                }} 
                onClick={() => onSubmit('set')}
              >
                Set Password
              </Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
