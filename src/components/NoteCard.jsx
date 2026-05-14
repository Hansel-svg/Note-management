import { Card, Flex, Heading, Text, Box, IconButton } from "@radix-ui/themes";
import { LockClosedIcon, ImageIcon, DrawingPinIcon, DrawingPinFilledIcon, TrashIcon, Share2Icon } from "@radix-ui/react-icons";
import ShareBadge from "./ShareBadge";

const StatusIcons = ({ note, isLocked }) => (
  <Flex gap="2" align="center" style={{ color: 'var(--text-h)' }}>
    {note.pinned_at && <DrawingPinFilledIcon color="var(--text-h)" width="16" height="16" />}
    {note.password_hash && <LockClosedIcon color="var(--text-h)" width="16" height="16" />}
    {note.is_shared && <Share2Icon width="16" height="16" color="var(--text-h)" />}
  </Flex>
);

export default function NoteCard({
  note,
  viewMode,
  noteColor,
  titleFontSize,
  fontSize,
  unlockedNotes,
  handleEditClick,
  handleTogglePin,
  handleDeleteClick
}) {
  const isLocked = note.password_hash && !unlockedNotes.includes(note.id);
  const isOwner = note.is_owner !== false;
  const sharePermission = note.share_permission || null;

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: viewMode === 'grid' ? '320px' : 'auto',
    backgroundColor: noteColor === 'surface' ? 'var(--card-bg)' : `var(--${noteColor}-2)`,
    borderRadius: 0,
    border: '1.5px solid var(--border-subtle)',
    cursor: 'pointer'
  };

  if (viewMode === 'grid') {
    return (
      <Card size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={cardStyle}>
        {isLocked ? (
          <Flex direction="column" align="center" justify="center" style={{ flexGrow: 1, height: '100%' }}>
            <LockClosedIcon width="48" height="48" color="var(--text-h)" style={{ marginBottom: '16px', opacity: 0.2 }} />
            <Heading size="6" color="gray" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Locked</Heading>
          </Flex>
        ) : (
          <>
            <Flex justify="between" align="start" mb="3" style={{ flexShrink: 0 }}>
              <Heading size="6" truncate style={{ fontSize: `${titleFontSize}px`, fontWeight: 800, lineHeight: 1.1, flexGrow: 1, minWidth: 0, letterSpacing: '-0.02em' }}>
                {note.title || "Untitled Note"}
              </Heading>
              <Box ml="2">
                <StatusIcons note={note} isLocked={isLocked} />
              </Box>
            </Flex>
            
            {note.note_labels && note.note_labels.length > 0 && (
              <Flex gap="1" mb="3" wrap="wrap" style={{ flexShrink: 0 }}>
                {note.note_labels.map(nl => (
                  <Text key={nl.labels.id} size="1" style={{ border: '1px solid var(--border)', color: 'var(--text-h)', padding: '2px 8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {nl.labels.name}
                  </Text>
                ))}
              </Flex>
            )}

            {note.image_urls && note.image_urls.length > 0 && (
              <Box style={{ flexShrink: 0, height: '100px', width: '100%', marginBottom: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <img src={note.image_urls[0]} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            )}

            <Box style={{ flexGrow: 1, flexShrink: 1, overflow: 'hidden', marginBottom: '1rem' }}>
              <Text as="p" className="preview-content-grid" style={{ color: 'var(--text)', fontSize: `${fontSize}px`, lineHeight: 1.6, opacity: 0.8 }}>
                {note.content}
              </Text>
            </Box>

            <Flex justify="between" align="center" mt="auto" pt="3" style={{ flexShrink: 0, borderTop: '1px solid var(--border-subtle)' }}>
              <Flex gap="3" align="center">
                {!isOwner && <ShareBadge permission={sharePermission} />}
              </Flex>
              {isOwner && (
                <Flex gap="2" onClick={(e) => e.stopPropagation()}>
                  <IconButton variant="ghost" color="gray" size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer", borderRadius: 0, color: 'var(--text-h)' }}>
                    {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
                  </IconButton>
                  <IconButton color="gray" variant="ghost" size="2" style={{ cursor: "pointer", borderRadius: 0, color: 'var(--text-h)' }} onClick={(e) => handleDeleteClick(e, note)}>
                    <TrashIcon />
                  </IconButton>
                </Flex>
              )}
            </Flex>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={cardStyle}>
      {isLocked ? (
        <Flex align="center" gap="4">
          <LockClosedIcon width="24" height="24" color="var(--text-h)" style={{ opacity: 0.2 }} />
          <Heading size="6" color="gray" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Locked Note</Heading>
          {isOwner && (
            <Flex gap="2" onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
              <IconButton color="gray" variant="ghost" size="2" style={{ cursor: "pointer", borderRadius: 0 }} onClick={(e) => handleDeleteClick(e, note)}>
                <TrashIcon />
              </IconButton>
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex justify="between" align="start">
          <Box style={{ flexGrow: 1, minWidth: 0 }}>
            <Flex align="center" gap="2" mb="2">
              <Heading size="6" truncate style={{ fontSize: `${titleFontSize}px`, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{note.title || "Untitled Note"}</Heading>
              <StatusIcons note={note} isLocked={isLocked} />
            </Flex>
            
            {note.note_labels && note.note_labels.length > 0 && (
              <Flex gap="1" mb="2" wrap="wrap">
                {note.note_labels.map(nl => (
                  <Text key={nl.labels.id} size="1" style={{ border: '1px solid var(--border)', color: 'var(--text-h)', padding: '2px 8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {nl.labels.name}
                  </Text>
                ))}
              </Flex>
            )}

            <Text as="p" mb="2" className="preview-content-list" style={{ color: 'var(--text)', fontSize: `${fontSize}px`, lineHeight: 1.6, opacity: 0.8 }}>
              {note.content}
            </Text>

            <Flex align="center" gap="4">
              {!isOwner && <ShareBadge permission={sharePermission} />}
              {note.image_urls && note.image_urls.length > 0 && (
                <Flex gap="1" align="center">
                  <ImageIcon color="gray" />
                  <Text size="1" color="gray" style={{ fontWeight: 600 }}>{note.image_urls.length} ATTACHMENT{note.image_urls.length > 1 ? 'S' : ''}</Text>
                </Flex>
              )}
            </Flex>
          </Box>
          
          {isOwner && (
            <Flex gap="2" onClick={(e) => e.stopPropagation()} style={{ marginLeft: '16px' }}>
              <IconButton variant="ghost" color="gray" size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer", borderRadius: 0, color: 'var(--text-h)' }}>
                {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
              </IconButton>
              <IconButton color="gray" variant="ghost" size="2" style={{ cursor: "pointer", borderRadius: 0, color: 'var(--text-h)' }} onClick={(e) => handleDeleteClick(e, note)}>
                <TrashIcon />
              </IconButton>
            </Flex>
          )}
        </Flex>
      )}
    </Card>
  );
}
