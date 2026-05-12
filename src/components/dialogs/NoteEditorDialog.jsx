import { Dialog, Flex, Text, IconButton, Button, Box, Grid } from "@radix-ui/themes";
import { Cross2Icon, LockClosedIcon, LockOpen2Icon, ImageIcon } from "@radix-ui/react-icons";

export default function NoteEditorDialog({
  open,
  onOpenChange,
  noteColor,
  titleFontSize,
  fontSize,
  editingNoteId,
  isSaving,
  noteTitle,
  handleTitleChange,
  noteContent,
  handleContentChange,
  noteImageUrls,
  handleImageUpload,
  handleRemoveImage,
  labels,
  selectedNoteLabels,
  handleToggleNoteLabel,
  hasPassword,
  onManageLockClick
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content 
        maxWidth="800px" 
        style={{ 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` 
        }}
      >
        <Flex justify="between" align="center" mb="5">
          <Text color="gray" size="2">
            {editingNoteId ? 'Editing Note' : 'New Note'}
            {isSaving && <Text color="cyan" ml="2">Saving...</Text>}
          </Text>
          <Flex gap="3" align="center">
            {editingNoteId && (
              <IconButton 
                variant="ghost" 
                color={hasPassword ? "cyan" : "gray"}
                onClick={onManageLockClick}
                style={{ cursor: 'pointer' }}
                title={hasPassword ? "Manage Lock" : "Lock Note"}
              >
                {hasPassword ? <LockClosedIcon /> : <LockOpen2Icon />}
              </IconButton>
            )}
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" style={{ cursor: 'pointer' }}>
                <Cross2Icon width="20" height="20" />
              </IconButton>
            </Dialog.Close>
          </Flex>
        </Flex>

        <Flex direction="column" gap="4" style={{ flexGrow: 1 }}>
          {labels.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {labels.map(label => (
                <Button
                  key={label.id}
                  variant={selectedNoteLabels.includes(label.id) ? "solid" : "soft"}
                  color="cyan"
                  size="1"
                  onClick={() => handleToggleNoteLabel(label.id)}
                  style={{ cursor: 'pointer', borderRadius: '16px' }}
                >
                  {label.name}
                </Button>
              ))}
            </Flex>
          )}
          <input
            value={noteTitle}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="notion-title-input"
            style={{ fontSize: `${titleFontSize}px` }}
          />
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            value={noteContent}
            onChange={handleContentChange}
            placeholder="Start typing..."
            className="notion-content-input"
            style={{ fontSize: `${fontSize}px` }}
            rows={1}
          />
          
          {noteImageUrls.length > 0 && (
            <Grid columns="3" gap="3" mt="4">
              {noteImageUrls.map((url, idx) => (
                <Box key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-5)' }}>
                  <img src={url} alt={`attachment-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton 
                    size="1" 
                    color="red" 
                    variant="solid" 
                    style={{ position: 'absolute', top: 6, right: 6, cursor: 'pointer', zIndex: 10 }}
                    onClick={() => handleRemoveImage(url)}
                  >
                    <Cross2Icon />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          )}
        </Flex>

        <Flex justify="start" mt="4">
          <input 
            type="file" 
            id="image-upload" 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          <label htmlFor="image-upload">
            <Button asChild variant="soft" color="gray" style={{ cursor: 'pointer' }}>
              <span><ImageIcon /> Add Image</span>
            </Button>
          </label>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
