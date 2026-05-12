import { Dialog, Flex, Text, IconButton, Button, Box, Grid, Callout } from "@radix-ui/themes";
import { Cross2Icon, LockClosedIcon, LockOpen2Icon, ImageIcon, Share2Icon, EyeOpenIcon } from "@radix-ui/react-icons";

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
  onManageLockClick,
  isOwner = true,
  sharePermission = null,
  onShareClick
}) {
  const isReadOnly = !isOwner && sharePermission === 'read';
  const canEdit = isOwner || sharePermission === 'edit';

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
          <Flex align="center" gap="3">
            <Dialog.Title m="0" size="2" weight="bold">
              {editingNoteId ? (isOwner ? 'Editing Note' : 'Shared Note') : 'New Note'}
            </Dialog.Title>
            {isSaving && <Text color="cyan" size="2">Saving...</Text>}
            {isReadOnly && (
              <Flex align="center" gap="1" style={{ color: 'var(--gray-10)' }}>
                <EyeOpenIcon />
                <Text size="1" color="gray">Read Only</Text>
              </Flex>
            )}
          </Flex>
          <Flex gap="3" align="center">
            {/* Share button — owners only */}
            {editingNoteId && isOwner && onShareClick && (
              <IconButton
                variant="ghost"
                color="gray"
                onClick={onShareClick}
                style={{ cursor: 'pointer' }}
                title="Share Note"
              >
                <Share2Icon />
              </IconButton>
            )}
            {/* Lock button — owners only */}
            {editingNoteId && isOwner && (
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

        {/* Read-only callout */}
        {isReadOnly && (
          <Callout.Root color="gray" size="1" mb="3">
            <Callout.Text>You have read-only access to this note.</Callout.Text>
          </Callout.Root>
        )}

        <Flex direction="column" gap="4" style={{ flexGrow: 1 }}>
          {/* Label toggles — only for owners */}
          {isOwner && labels.length > 0 && (
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
            onChange={canEdit ? handleTitleChange : undefined}
            readOnly={!canEdit}
            placeholder="Untitled"
            className="notion-title-input"
            style={{ 
              fontSize: `${titleFontSize}px`,
              cursor: !canEdit ? 'default' : undefined,
              opacity: !canEdit ? 0.8 : 1
            }}
          />
          <textarea
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            value={noteContent}
            onChange={canEdit ? handleContentChange : undefined}
            readOnly={!canEdit}
            placeholder={canEdit ? "Start typing..." : ""}
            className="notion-content-input"
            style={{ 
              fontSize: `${fontSize}px`,
              cursor: !canEdit ? 'default' : undefined,
              opacity: !canEdit ? 0.8 : 1
            }}
            rows={1}
          />
          
          {noteImageUrls.length > 0 && (
            <Grid columns="3" gap="3" mt="4">
              {noteImageUrls.map((url, idx) => (
                <Box key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-5)' }}>
                  <img src={url} alt={`attachment-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {canEdit && (
                    <IconButton 
                      size="1" 
                      color="red" 
                      variant="solid" 
                      style={{ position: 'absolute', top: 6, right: 6, cursor: 'pointer', zIndex: 10 }}
                      onClick={() => handleRemoveImage(url)}
                    >
                      <Cross2Icon />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Grid>
          )}
        </Flex>

        {/* Image upload — only for users who can edit */}
        {canEdit && (
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
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
