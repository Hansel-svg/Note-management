import { supabase } from "./SupaBaseClient";
import { Container, Flex, Heading, Button, Box, TextField, TextArea, Card, Grid, Text, IconButton, Callout, Avatar, Dialog, AlertDialog } from "@radix-ui/themes";
import { PlusIcon, TrashIcon, ExitIcon, InfoCircledIcon, LockClosedIcon, GearIcon, GridIcon, ListBulletIcon, Pencil1Icon, Cross2Icon, ImageIcon, DrawingPinIcon, DrawingPinFilledIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useLocation } from "wouter";
import { ThemeContext } from "./ThemeProvider";
import "./Home.css";

export default function Home({ session }) {
  const [isVerified, setIsVerified] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [, setLocation] = useLocation();
  const { fontSize, titleFontSize, noteColor, updateFontSize, updateTitleFontSize, updateNoteColor } = useContext(ThemeContext);

  const [notes, setNotes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [noteImageUrls, setNoteImageUrls] = useState([]);

  const currentNoteIdRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const titleRef = useRef('');
  const contentRef = useRef('');
  const imageUrlsRef = useRef([]);

  const fetchNotes = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    } else {
      console.error("Error fetching notes:", error);
    }
  }, [session]);

  const handleTogglePin = async (e, note) => {
    e.stopPropagation();
    const newPinnedAt = note.pinned_at ? null : new Date().toISOString();
    
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(n => n.id === note.id ? { ...n, pinned_at: newPinnedAt } : n);
      return updatedNotes.sort((a, b) => {
        if (a.pinned_at && b.pinned_at) {
          return new Date(b.pinned_at) - new Date(a.pinned_at);
        }
        if (a.pinned_at) return -1;
        if (b.pinned_at) return 1;
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      });
    });

    const { error } = await supabase
      .from('notes')
      .update({ pinned_at: newPinnedAt })
      .eq('id', note.id);
      
    if (error) {
      console.error("Error toggling pin:", error);
      fetchNotes();
    }
  };

  useEffect(() => {
    async function checkVerification() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified, avatar_url, default_font_size, default_title_font_size, default_note_color')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        setIsVerified(data.is_verified === true);
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
        if (data.default_font_size) updateFontSize(data.default_font_size);
        if (data.default_title_font_size) updateTitleFontSize(data.default_title_font_size);
        if (data.default_note_color) updateNoteColor(data.default_note_color);
      }
    }
    
    checkVerification();
    fetchNotes();
  }, [session, fetchNotes]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const openCreateDialog = () => {
    setNoteTitle('');
    setNoteContent('');
    titleRef.current = '';
    contentRef.current = '';
    setNoteImageUrls([]);
    imageUrlsRef.current = [];
    setEditingNoteId(null);
    currentNoteIdRef.current = null;
    setIsDialogOpen(true);
  };

  const handleEditClick = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    titleRef.current = note.title;
    contentRef.current = note.content;
    const urls = note.image_urls || [];
    setNoteImageUrls(urls);
    imageUrlsRef.current = urls;
    setEditingNoteId(note.id);
    currentNoteIdRef.current = note.id;
    setIsDialogOpen(true);
  };

  const autosaveNote = async (title, content, id, imageUrls) => {
    if (!title.trim() && !content.trim() && imageUrls.length === 0) return id;
    if (!session?.user?.id) return id;
    
    isSavingRef.current = true;
    setIsSaving(true);
    let newId = id;
    try {
      if (id) {
        await supabase
          .from('notes')
          .update({ title, content, image_urls: imageUrls, updated_at: new Date().toISOString() })
          .eq('id', id);
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title, content, image_urls: imageUrls, user_id: session.user.id }])
          .select()
          .single();
        if (error) throw error;
        if (data) newId = data.id;
      }
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
    return newId;
  };

  const triggerAutosave = () => {
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        triggerAutosave();
        return;
      }
      const savedId = await autosaveNote(titleRef.current, contentRef.current, currentNoteIdRef.current, imageUrlsRef.current);
      if (savedId !== currentNoteIdRef.current) {
        currentNoteIdRef.current = savedId;
        setEditingNoteId(savedId);
      }
    }, 1000);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setNoteTitle(val);
    titleRef.current = val;
    triggerAutosave();
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    contentRef.current = val;
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    triggerAutosave();
  };

  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        if (!isSavingRef.current) {
          autosaveNote(titleRef.current, contentRef.current, currentNoteIdRef.current, imageUrlsRef.current);
        }
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !session?.user?.id) return;
    
    setIsSaving(true);
    const newUrls = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('note_images')
        .upload(fileName, file);
        
      if (!uploadError) {
        const { data } = supabase.storage.from('note_images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }
    
    if (newUrls.length > 0) {
      const updatedUrls = [...imageUrlsRef.current, ...newUrls];
      setNoteImageUrls(updatedUrls);
      imageUrlsRef.current = updatedUrls;
      triggerAutosave();
    }
    setIsSaving(false);
  };

  const handleRemoveImage = async (urlToRemove) => {
    const updatedUrls = imageUrlsRef.current.filter(url => url !== urlToRemove);
    setNoteImageUrls(updatedUrls);
    imageUrlsRef.current = updatedUrls;
    triggerAutosave();
    
    const fileName = urlToRemove.split('/').pop();
    if (fileName) {
      await supabase.storage.from('note_images').remove([fileName]);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <Container size="3" py="6" px="4">
      {!isVerified && (
        <Box mb="6">
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Your account is not verified. Please verify your email to complete the registration process.
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      <Flex justify="between" align="center" mb="6">
        <Heading size="8" as="h1" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Notes
        </Heading>
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            src={avatarUrl}
            fallback={session?.user?.email?.charAt(0).toUpperCase() || "?"}
            radius="full"
          />
          <Button variant="soft" color="gray" onClick={() => setLocation('/preferences')} style={{ cursor: "pointer" }}>
            <GearIcon />
            Preferences
          </Button>
          <Button variant="soft" color="cyan" onClick={() => setLocation('/forgot-password')} style={{ cursor: "pointer" }}>
            <LockClosedIcon />
            Reset Password
          </Button>
          <Button variant="surface" color="gray" onClick={handleSignOut} style={{ cursor: "pointer" }}>
            <ExitIcon />
            Sign Out
          </Button>
        </Flex>
      </Flex>

      <Flex justify="between" align="center" mb="4">
        <Flex gap="3" align="center">
          <Heading size="6">Recent Notes</Heading>
          <Button onClick={openCreateDialog} color="cyan" variant="solid" style={{ cursor: 'pointer' }}>
            <PlusIcon /> Add Note
          </Button>
        </Flex>
        <Flex gap="2">
          <IconButton 
            variant={viewMode === 'grid' ? 'solid' : 'soft'} 
            color="cyan" 
            onClick={() => setViewMode('grid')}
            style={{ cursor: 'pointer' }}
          >
            <GridIcon />
          </IconButton>
          <IconButton 
            variant={viewMode === 'list' ? 'solid' : 'soft'} 
            color="cyan" 
            onClick={() => setViewMode('list')}
            style={{ cursor: 'pointer' }}
          >
            <ListBulletIcon />
          </IconButton>
        </Flex>
      </Flex>

      {notes.length === 0 ? (
        <Text color="gray" size="3">No notes yet. Click "Add Note" to create one!</Text>
      ) : viewMode === 'grid' ? (
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {notes.map(note => (
            <Card key={note.id} size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={{ display: 'flex', flexDirection: 'column', height: '320px', backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-3)` }}>
              <Heading size="6" mb="2" truncate style={{ flexShrink: 0, fontSize: `${titleFontSize}px`, lineHeight: 1.2 }}>{note.title}</Heading>
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
                <Flex gap="2" onClick={(e) => e.stopPropagation()}>
                  <IconButton variant="soft" color={note.pinned_at ? "cyan" : "gray"} size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer" }}>
                    {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
                  </IconButton>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
                        <TrashIcon />
                      </IconButton>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Delete Note</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <Button variant="soft" color="gray" style={{ cursor: "pointer" }}>Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button variant="solid" color="red" style={{ cursor: "pointer" }} onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>
      ) : (
        <Flex direction="column" gap="4">
          {notes.map(note => (
            <Card key={note.id} size="2" variant="surface" className="note-card-hover" onClick={() => handleEditClick(note)} style={{ backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-3)` }}>
              <Flex justify="between" align="start">
                <Box style={{ flexGrow: 1, minWidth: 0 }}>
                  <Heading size="6" mb="2" truncate style={{ fontSize: `${titleFontSize}px`, lineHeight: 1.2 }}>{note.title}</Heading>
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
                <Flex gap="2" onClick={(e) => e.stopPropagation()} style={{ marginLeft: '16px' }}>
                  <IconButton variant="soft" color={note.pinned_at ? "cyan" : "gray"} size="2" onClick={(e) => handleTogglePin(e, note)} style={{ cursor: "pointer" }}>
                    {note.pinned_at ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
                  </IconButton>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                      <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
                        <TrashIcon />
                      </IconButton>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Delete Note</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <Button variant="soft" color="gray" style={{ cursor: "pointer" }}>Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button variant="solid" color="red" style={{ cursor: "pointer" }} onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogChange}>
        <Dialog.Content maxWidth="800px" style={{ padding: '3rem 4rem', minHeight: '70vh', display: 'flex', flexDirection: 'column', backgroundColor: noteColor === 'surface' ? undefined : `var(--${noteColor}-2)` }}>
          <Dialog.Title style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            {editingNoteId ? 'Edit Note' : 'Add Note'}
          </Dialog.Title>
          <Dialog.Description style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            {editingNoteId ? 'Make changes to your note below.' : 'Create a new note.'}
          </Dialog.Description>

          <Flex justify="between" align="center" mb="5">
            <Text color="gray" size="2">
              {editingNoteId ? 'Editing Note' : 'New Note'}
              {isSaving && <Text color="cyan" ml="2">Saving...</Text>}
            </Text>
            <Dialog.Close>
              <IconButton variant="ghost" color="gray" style={{ cursor: 'pointer' }}>
                <Cross2Icon width="20" height="20" />
              </IconButton>
            </Dialog.Close>
          </Flex>

          <Flex direction="column" gap="4" style={{ flexGrow: 1 }}>
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
    </Container>
  );
}

