import { Card, Flex, Heading, Text, Box, IconButton } from "@radix-ui/themes";
import { LockClosedIcon, ImageIcon, DrawingPinIcon, DrawingPinFilledIcon, TrashIcon } from "@radix-ui/react-icons";
import ShareBadge from "./ShareBadge";

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
  const isOwner = note.is_owner !== false; // default true for backward compat
  const sharePermission = note.share_permission || null;

  if (viewMode === 'grid') {
    return (
      <Card size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={{ display: 'flex', flexDirection: 'column', height: '320px', backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-3)` }}>
        {isLocked ? (
          <Flex direction="column" align="center" justify="center" style={{ flexGrow: 1, height: '100%' }}>
            <LockClosedIcon width="48" height="48" color="var(--gray-8)" style={{ marginBottom: '16px' }} />
            <Heading size="6" color="gray">Locked Note</Heading>
            <Text size="2" color="gray" mt="2">Click to enter password</Text>
          </Flex>
        ) : (
          <>
            <Flex justify="between" align="start" mb="2" style={{ flexShrink: 0 }}>
              <Heading size="6" truncate style={{ fontSize: `${titleFontSize}px`, lineHeight: 1.2, flexGrow: 1, minWidth: 0 }}>{note.title}</Heading>
            </Flex>
            {!isOwner && (
              <Flex direction="column" gap="1" mb="2" style={{ flexShrink: 0 }}>
                <ShareBadge permission={sharePermission} />
                <Text size="1" color="gray" truncate>
                  Shared by {note.owner_email || 'Owner'}
                  {note.shared_at && ` • ${new Date(note.shared_at).toLocaleDateString()}`}
                </Text>
              </Flex>
            )}
            {note.note_labels && note.note_labels.length > 0 && (
              <Flex gap="1" mb="2" wrap="wrap" style={{ flexShrink: 0 }}>
                {note.note_labels.map(nl => (
                  <Text key={nl.labels.id} size="1" style={{ backgroundColor: 'var(--cyan-3)', color: 'var(--cyan-11)', padding: '2px 6px', borderRadius: '4px' }}>
                    {nl.labels.name}
                  </Text>
                ))}
              </Flex>
            )}
            {note.image_urls && note.image_urls.length > 0 && (
              <Box style={{ flexShrink: 0, height: '120px', width: '100%', marginBottom: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={note.image_urls[0]} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            )}
            <Box style={{ flexGrow: 1, flexShrink: 1, overflow: 'hidden', marginBottom: '1rem' }}>
              <Text as="p" color="gray" className="preview-content-grid" style={{ fontSize: `${fontSize}px` }}>
                {note.content}
              </Text>
            </Box>
            <Flex justify="between" align="center" mt="auto" pt="4" style={{ flexShrink: 0 }}>
              <Flex gap="3" align="center">
                {note.image_urls && note.image_urls.length > 0 && (
                  <Flex gap="1" align="center">
                    <ImageIcon color="gray" />
                    <Text size="1" color="gray">{note.image_urls.length}</Text>
                  </Flex>
                )}
              </Flex>
              {isOwner && (
                <Flex gap="2" onClick={(e) => e.stopPropagation()}>
                  <IconButton variant="soft" color={note.pinned_at ? "cyan" : "gray"} size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer" }}>
                    {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
                  </IconButton>
                  <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }} onClick={(e) => handleDeleteClick(e, note)}>
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
    <Card size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-3)` }}>
      {isLocked ? (
        <Flex align="center" gap="4">
          <LockClosedIcon width="24" height="24" color="var(--gray-8)" />
          <Heading size="6" color="gray">Locked Note</Heading>
          <Text size="2" color="gray">Click to enter password</Text>
          {isOwner && (
            <Flex gap="2" onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
              <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }} onClick={(e) => handleDeleteClick(e, note)}>
                <TrashIcon />
              </IconButton>
            </Flex>
          )}
        </Flex>
      ) : (
        <Flex justify="between" align="start">
          <Box style={{ flexGrow: 1, minWidth: 0 }}>
            <Heading size="6" mb="1" truncate style={{ fontSize: `${titleFontSize}px`, lineHeight: 1.2 }}>{note.title}</Heading>
            {!isOwner && (
              <Flex align="center" gap="3" mb="2">
                <ShareBadge permission={sharePermission} />
                <Text size="1" color="gray">
                  Shared by {note.owner_email || 'Owner'}
                  {note.shared_at && ` • ${new Date(note.shared_at).toLocaleDateString()}`}
                </Text>
              </Flex>
            )}
            {note.note_labels && note.note_labels.length > 0 && (
              <Flex gap="1" mb="2" wrap="wrap" style={{ flexShrink: 0 }}>
                {note.note_labels.map(nl => (
                  <Text key={nl.labels.id} size="1" style={{ backgroundColor: 'var(--cyan-3)', color: 'var(--cyan-11)', padding: '2px 6px', borderRadius: '4px' }}>
                    {nl.labels.name}
                  </Text>
                ))}
              </Flex>
            )}
            <Text as="p" color="gray" mb="2" className="preview-content-list" style={{ fontSize: `${fontSize}px` }}>
              {note.content}
            </Text>
            {note.image_urls && note.image_urls.length > 0 && (
              <Flex gap="1" align="center" mb="2">
                <ImageIcon color="gray" />
                <Text size="1" color="gray">{note.image_urls.length} attachment{note.image_urls.length > 1 ? 's' : ''}</Text>
              </Flex>
            )}
          </Box>
          {note.image_urls && note.image_urls.length > 0 && (
            <Box style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', marginLeft: '16px' }}>
              <img src={note.image_urls[0]} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          )}
          {isOwner ? (
            <Flex gap="2" onClick={(e) => e.stopPropagation()} style={{ marginLeft: '16px' }}>
              <IconButton variant="soft" color={note.pinned_at ? "cyan" : "gray"} size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer" }}>
                {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
              </IconButton>
              <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }} onClick={(e) => handleDeleteClick(e, note)}>
                <TrashIcon />
              </IconButton>
            </Flex>
          ) : (
            <Box style={{ marginLeft: '16px', width: '72px' }} /> /* spacer to align */
          )}
        </Flex>
      )}
    </Card>
  );
}
