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
      <Dialog.Content 
        maxWidth="450px" 
        style={{ 
          backgroundColor: 'var(--bg)', 
          borderRadius: 0, 
          border: '1.5px solid var(--border)' 
        }}
      >
        <Dialog.Title style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manage Labels</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', opacity: 0.6 }}>
          Create, rename, or delete labels.
        </Dialog.Description>
        
        <Flex gap="2" mb="5">
          <TextField.Root 
            placeholder="NEW LABEL NAME..." 
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            style={{ flexGrow: 1, borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
            onKeyDown={(e) => { if (e.key === 'Enter') onCreateLabel(); }}
          />
          <Button 
            onClick={onCreateLabel} 
            color="gray" 
            style={{ 
              cursor: 'pointer', 
              borderRadius: 0, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              backgroundColor: 'var(--text-h)', 
              color: 'var(--bg)' 
            }}
          >
            ADD
          </Button>
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
                style={{ flexGrow: 1, borderRadius: 0, border: '1px solid var(--border-subtle)', backgroundColor: 'transparent' }}
              />
              <IconButton 
                color="gray" 
                variant="ghost" 
                onClick={() => onDeleteLabel(label.id)} 
                style={{ cursor: 'pointer', borderRadius: 0, color: 'var(--text-h)' }}
              >
                <TrashIcon />
              </IconButton>
            </Flex>
          ))}
          {labels.length === 0 && (
            <Text size="2" color="gray" align="center" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.4 }}>No labels created yet.</Text>
          )}
        </Flex>
        
        <Flex justify="end" mt="6">
          <Dialog.Close>
            <Button variant="outline" color="gray" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)' }}>Close</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
