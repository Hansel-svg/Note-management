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
      <Dialog.Content maxWidth="400px" style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}>
        <Dialog.Title>{hasPassword ? 'Manage Lock' : 'Set Password'}</Dialog.Title>
        
        {manageLockError && (
          <Callout.Root color="red" size="1" mb="3">
            <Callout.Text>{manageLockError}</Callout.Text>
          </Callout.Root>
        )}

        {hasPassword ? (
          <Tabs.Root defaultValue="change" onValueChange={clearForm}>
            <Tabs.List size="1">
              <Tabs.Trigger value="change" style={{ cursor: 'pointer' }}>Change Password</Tabs.Trigger>
              <Tabs.Trigger value="remove" style={{ cursor: 'pointer' }}>Remove Lock</Tabs.Trigger>
            </Tabs.List>
            
            <Box pt="4">
              <Tabs.Content value="change">
                <Flex direction="column" gap="3">
                  <TextField.Root 
                    type="password" 
                    placeholder="Current Password" 
                    value={manageLockCurrentPassword} 
                    onChange={(e) => setManageLockCurrentPassword(e.target.value)} 
                    autoComplete="new-password" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="New Password" 
                    value={manageLockNewPassword} 
                    onChange={(e) => setManageLockNewPassword(e.target.value)} 
                    autoComplete="new-password" 
                  />
                  <TextField.Root 
                    type="password" 
                    placeholder="Confirm New Password" 
                    value={manageLockConfirmPassword} 
                    onChange={(e) => setManageLockConfirmPassword(e.target.value)} 
                    autoComplete="new-password" 
                  />
                  <Flex justify="between" mt="3" align="center">
                    <Dialog.Close>
                      <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Cancel</Button>
                    </Dialog.Close>
                    <Button color="cyan" style={{ cursor: 'pointer' }} onClick={() => onSubmit('change')}>Update Password</Button>
                  </Flex>
                </Flex>
              </Tabs.Content>
              <Tabs.Content value="remove">
                <Flex direction="column" gap="3">
                  <Text size="2" color="gray">Enter your current password to remove the lock.</Text>
                  <TextField.Root 
                    type="password" 
                    placeholder="Current Password" 
                    value={manageLockCurrentPassword} 
                    onChange={(e) => setManageLockCurrentPassword(e.target.value)} 
                    autoComplete="new-password" 
                  />
                  <Flex justify="between" mt="3" align="center">
                    <Dialog.Close>
                      <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Cancel</Button>
                    </Dialog.Close>
                    <Button color="red" variant="soft" style={{ cursor: 'pointer' }} onClick={() => onSubmit('remove')}>Remove Lock</Button>
                  </Flex>
                </Flex>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        ) : (
          <>
            <Dialog.Description size="2" color="gray" mb="4">
              Set a password to lock this note.
            </Dialog.Description>
            <Flex direction="column" gap="3">
              <TextField.Root 
                type="password" 
                placeholder="New Password" 
                value={manageLockNewPassword} 
                onChange={(e) => setManageLockNewPassword(e.target.value)} 
                autoComplete="new-password" 
              />
              <TextField.Root 
                type="password" 
                placeholder="Confirm New Password" 
                value={manageLockConfirmPassword} 
                onChange={(e) => setManageLockConfirmPassword(e.target.value)} 
                autoComplete="new-password" 
              />
            </Flex>
            <Flex justify="end" gap="3" mt="5">
              <Dialog.Close>
                <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Cancel</Button>
              </Dialog.Close>
              <Button color="cyan" style={{ cursor: 'pointer' }} onClick={() => onSubmit('set')}>Set Password</Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
