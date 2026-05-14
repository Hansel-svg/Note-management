import { Dialog, Flex, Text, IconButton, Button, Box, Grid, Callout, Badge } from "@radix-ui/themes";
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
  onShareClick,
  activeEditors = [],
  ownerEmail = null,
  sharedAt = null,
  isOnline = true
}) {
  const isReadOnly = (!isOwner && sharePermission === 'read') || !isOnline;
  const canEdit = (isOwner || sharePermission === 'edit') && isOnline;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content 
        maxWidth="800px" 
        size="1"
        className="note-editor-dialog-content"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          backgroundColor: noteColor === 'surface' ? 'var(--bg)' : `var(--${noteColor}-2)`,
          borderRadius: 0,
          border: '1.5px solid var(--border)'
        }}
      >
        <Flex justify="between" align="center" mb={{ initial: '0', md: '5' }} pt={{ initial: '1', md: '0' }}>
          <Flex align="center" gap="3">
            <Dialog.Title m="0" size="2" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {editingNoteId ? (isOwner ? 'Editing Note' : 'Shared Note') : 'New Note'}
            </Dialog.Title>
            
            {activeEditors.length > 0 && (
              <Badge color="gray" variant="solid" style={{ borderRadius: 0, backgroundColor: 'var(--text-h)', color: 'var(--bg)', fontWeight: 800 }}>
                <Flex align="center" gap="1">
                  <div style={{ width: 6, height: 6, backgroundColor: 'var(--bg)' }} />
                  {activeEditors.length} OTHER{activeEditors.length > 1 ? 'S' : ''} EDITING
                </Flex>
              </Badge>
            )}

            {isSaving && <Text size="2" style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-h)' }}>Saving...</Text>}
            {!isSaving && activeEditors.length > 0 && <Text size="2" color="gray" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Shared session active</Text>}
            {isReadOnly && (
              <Flex align="center" gap="1" style={{ color: 'var(--text-h)' }}>
                <EyeOpenIcon />
                <Text size="1" style={{ fontWeight: 800, textTransform: 'uppercase' }}>Read Only</Text>
              </Flex>
            )}
          </Flex>
          <Flex gap="3" align="center">
            {editingNoteId && isOwner && onShareClick && (
              <IconButton
                variant="ghost"
                color="gray"
                size={{ initial: '3', md: '2' }}
                onClick={onShareClick}
                style={{ cursor: 'pointer', color: 'var(--text-h)', borderRadius: 0 }}
                title="Share Note"
              >
                <Share2Icon width="20" height="20" />
              </IconButton>
            )}
            {editingNoteId && isOwner && (
              <IconButton 
                variant="ghost" 
                color="gray"
                size={{ initial: '3', md: '2' }}
                onClick={onManageLockClick}
                style={{ cursor: 'pointer', color: 'var(--text-h)', borderRadius: 0 }}
                title={hasPassword ? "Manage Lock" : "Lock Note"}
              >
                {hasPassword ? <LockClosedIcon width="20" height="20" /> : <LockOpen2Icon width="20" height="20" />}
              </IconButton>
            )}
            <Dialog.Close>
              <IconButton 
                variant="ghost" 
                color="gray" 
                size={{ initial: '3', md: '2' }}
                style={{ cursor: 'pointer', color: 'var(--text-h)', borderRadius: 0 }}
              >
                <Cross2Icon width="22" height="22" />
              </IconButton>
            </Dialog.Close>
          </Flex>
        </Flex>

        {!isOwner && (
          <Box mb={{ initial: '2', md: '4' }} p={{ initial: '2', md: '3' }} style={{ border: '1.5px solid var(--border-subtle)', borderRadius: 0 }}>
            <Text size="1" style={{ display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              <strong>Shared by:</strong> {ownerEmail || 'Owner'}
            </Text>
            {sharedAt && (
              <Text size="1" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                <strong>Shared on:</strong> {new Date(sharedAt).toLocaleString()}
              </Text>
            )}
          </Box>
        )}

        {isReadOnly && (
          <Callout.Root color="gray" size="1" mb={{ initial: '2', md: '3' }} style={{ borderRadius: 0, border: '1.5px solid var(--border)' }}>
            <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase' }}>You have read-only access to this note.</Callout.Text>
          </Callout.Root>
        )}

        <Flex direction="column" gap={{ initial: '1', md: '4' }} style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '1rem', minHeight: 0 }}>
          {isOwner && labels.length > 0 && (
            <Flex gap="2" wrap="wrap">
              {labels.map(label => {
                const isSelected = selectedNoteLabels.includes(label.id);
                return (
                  <Button
                    key={label.id}
                    variant={isSelected ? "solid" : "outline"}
                    color="gray"
                    size={{ initial: '2', md: '1' }}
                    onClick={() => handleToggleNoteLabel(label.id)}
                    style={{ 
                      cursor: 'pointer', 
                      borderRadius: 0, 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      borderColor: 'var(--border)',
                      backgroundColor: isSelected ? 'var(--text-h)' : 'transparent',
                      color: isSelected ? 'var(--bg)' : 'var(--text-h)'
                    }}
                  >
                    {label.name}
                  </Button>
                );
              })}
            </Flex>
          )}
          <input
            value={noteTitle}
            onChange={canEdit ? handleTitleChange : undefined}
            readOnly={!canEdit}
            placeholder="UNTITLED"
            className="notion-title-input"
            autoFocus
            style={{ 
              fontSize: `${titleFontSize}px`,
              cursor: !canEdit ? 'default' : undefined,
              opacity: !canEdit ? 0.6 : 1,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--text-h)'
            }}
          />
          <textarea
            value={noteContent}
            onChange={canEdit ? handleContentChange : undefined}
            readOnly={!canEdit}
            placeholder={canEdit ? "START TYPING..." : ""}
            className="notion-content-input"
            style={{ 
              fontSize: `${fontSize}px`,
              cursor: !canEdit ? 'default' : undefined,
              opacity: !canEdit ? 0.8 : 1,
              lineHeight: 1.6,
              color: 'var(--text)',
              flexGrow: 1,
              resize: 'none',
              overflowY: 'auto'
            }}
            rows={1}
          />
          
          {noteImageUrls.length > 0 && (
            <Grid columns="3" gap="3" mt="4">
              {noteImageUrls.map((url, idx) => (
                <Box key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: 0, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                  <img src={url} alt={`attachment-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {canEdit && (
                    <IconButton 
                      size="1" 
                      color="gray" 
                      variant="solid" 
                      style={{ position: 'absolute', top: 6, right: 6, cursor: 'pointer', zIndex: 10, borderRadius: 0, backgroundColor: 'var(--text-h)', color: 'var(--bg)' }}
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

        {canEdit && (
          <Flex justify="start" mt={{ initial: '2', md: '4' }} pt={{ initial: '2', md: '4' }}>
            <input 
              type="file" 
              id="image-upload" 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            <label htmlFor="image-upload">
              <Button asChild variant="outline" color="gray" size={{ initial: '3', md: '2' }} style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', borderColor: 'var(--border)', color: 'var(--text-h)', width: { initial: '100%', md: 'auto' } }}>
                <span><ImageIcon /> ADD IMAGE</span>
              </Button>
            </label>
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
