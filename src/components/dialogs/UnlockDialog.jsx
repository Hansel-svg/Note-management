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
      <Dialog.Content 
        maxWidth="400px" 
        style={{ 
          backgroundColor: 'var(--bg)', 
          borderRadius: 0, 
          border: '1.5px solid var(--border)' 
        }}
      >
        <Dialog.Title style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlock Note</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', opacity: 0.6 }}>
          This note is locked. Please enter the password to {unlockAction}.
        </Dialog.Description>
        
        {unlockError && (
          <Callout.Root color="gray" size="1" mb="4" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
            <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>{unlockError}</Callout.Text>
          </Callout.Root>
        )}
        
        <TextField.Root
          type="password"
          placeholder="PASSWORD"
          value={unlockPassword}
          onChange={(e) => setUnlockPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
          style={{ 
            borderRadius: 0, 
            border: '1.5px solid var(--border)', 
            backgroundColor: 'transparent',
            marginBottom: '1.5rem'
          }}
          autoComplete="new-password"
        />
        
        <Flex justify="end" gap="3">
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
            onClick={onSubmit}
          >
            Unlock
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
