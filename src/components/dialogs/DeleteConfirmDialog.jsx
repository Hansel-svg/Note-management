import { AlertDialog, Flex, Button } from "@radix-ui/themes";

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  noteColor, 
  onDelete 
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px" style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}>
        <AlertDialog.Title>Delete Note</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete this note? This action cannot be undone.
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" style={{ cursor: "pointer" }}>Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" style={{ cursor: "pointer" }} onClick={onDelete}>Delete</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
