import { Dialog, Flex, TextField, Button, Text, IconButton } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";

export default function LabelManagerDialog({
  open,
  onOpenChange,
  noteColor,
  newLabelName,
  setNewLabelName,
  onCreateLabel,
  labels,
  onRenameLabel,
  onDeleteLabel
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px" style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}>
        <Dialog.Title>Manage Labels</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Create, rename, or delete labels.
        </Dialog.Description>
        
        <Flex gap="2" mb="5">
          <TextField.Root 
            placeholder="New label name..." 
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            style={{ flexGrow: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter') onCreateLabel(); }}
          />
          <Button onClick={onCreateLabel} color="cyan" style={{ cursor: 'pointer' }}>Add</Button>
        </Flex>

        <Flex direction="column" gap="3">
          {labels.map(label => (
            <Flex key={label.id} justify="between" align="center" gap="3">
              <TextField.Root 
                defaultValue={label.name}
                onBlur={(e) => {
                  if (e.target.value !== label.name) {
                    onRenameLabel(label.id, e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.target.value !== label.name) {
                      onRenameLabel(label.id, e.target.value);
                    }
                    e.target.blur();
                  }
                }}
                style={{ flexGrow: 1 }}
              />
              <IconButton color="red" variant="soft" onClick={() => onDeleteLabel(label.id)} style={{ cursor: 'pointer' }}>
                <TrashIcon />
              </IconButton>
            </Flex>
          ))}
          {labels.length === 0 && (
            <Text size="2" color="gray" align="center">No labels created yet.</Text>
          )}
        </Flex>
        
        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
