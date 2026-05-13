import { AlertDialog, Flex, Button } from "@radix-ui/themes";

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  noteColor, 
  onDelete 
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content 
        maxWidth="450px" 
        style={{ 
          backgroundColor: 'var(--bg)', 
          borderRadius: 0, 
          border: '1.5px solid var(--border)' 
        }}
      >
        <AlertDialog.Title style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delete Note</AlertDialog.Title>
        <AlertDialog.Description size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.02em' }}>
          Are you sure you want to delete this note? This action cannot be undone.
        </AlertDialog.Description>
        <Flex gap="3" mt="6" justify="end">
          <AlertDialog.Cancel>
            <Button variant="outline" color="gray" style={{ cursor: "pointer", borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="gray" style={{ cursor: "pointer", borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', backgroundColor: 'var(--text-h)', color: 'var(--bg)' }} onClick={onDelete}>Delete</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
