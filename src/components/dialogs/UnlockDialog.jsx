import { Dialog, Flex, Button, TextField, Callout } from "@radix-ui/themes";

export default function UnlockDialog({
  open,
  onOpenChange,
  noteColor,
  unlockAction,
  unlockError,
  unlockPassword,
  setUnlockPassword,
  onSubmit
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px" style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}>
        <Dialog.Title>Unlock Note</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          This note is locked. Please enter the password to {unlockAction}.
        </Dialog.Description>
        
        {unlockError && (
          <Callout.Root color="red" size="1" mb="3">
            <Callout.Text>{unlockError}</Callout.Text>
          </Callout.Root>
        )}
        
        <TextField.Root
          type="password"
          placeholder="Password"
          value={unlockPassword}
          onChange={(e) => setUnlockPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
          mb="4"
          autoComplete="new-password"
        />
        
        <Flex justify="end" gap="3">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Cancel</Button>
          </Dialog.Close>
          <Button color="cyan" style={{ cursor: 'pointer' }} onClick={onSubmit}>Unlock</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
