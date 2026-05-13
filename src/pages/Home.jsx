import { supabase } from "../lib/SupaBaseClient";
import { Container, Flex, Grid, Text, Box, Heading, Callout, Button, Avatar } from "@radix-ui/themes";
import { Share2Icon, ArchiveIcon, FileTextIcon, PersonIcon, GearIcon, PlusIcon, ExitIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useLocation } from "wouter";
import { ThemeContext } from "../providers/ThemeContext";
import "./Home.css";

import DashboardHeader from "../components/DashboardHeader";
import LabelFilterBar from "../components/LabelFilterBar";
import NoteCard from "../components/NoteCard";
import DeleteConfirmDialog from "../components/dialogs/DeleteConfirmDialog";
import UnlockDialog from "../components/dialogs/UnlockDialog";
import ManageLockDialog from "../components/dialogs/ManageLockDialog";
import LabelManagerDialog from "../components/dialogs/LabelManagerDialog";
import NoteEditorDialog from "../components/dialogs/NoteEditorDialog";
import ShareNoteDialog from "../components/dialogs/ShareNoteDialog";
import NotificationBell from "../components/NotificationBell";
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [labels, setLabels] = useState([]);
  const [activeFilterLabels, setActiveFilterLabels] = useState([]);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedNoteLabels, setSelectedNoteLabels] = useState([]);

  const [unlockedNotes, setUnlockedNotes] = useState([]);
  const [unlockedNotesContent, setUnlockedNotesContent] = useState({});
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockTargetNote, setUnlockTargetNote] = useState(null);
  const [unlockAction, setUnlockAction] = useState(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const [isManageLockOpen, setIsManageLockOpen] = useState(false);
  const [manageLockCurrentPassword, setManageLockCurrentPassword] = useState('');
  const [manageLockNewPassword, setManageLockNewPassword] = useState('');
  const [manageLockConfirmPassword, setManageLockConfirmPassword] = useState('');
  const [manageLockError, setManageLockError] = useState('');

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareTargetNoteId, setShareTargetNoteId] = useState(null);

  const [activeEditors, setActiveEditors] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [isSaving, setIsSaving] = useState(false);
  const [noteImageUrls, setNoteImageUrls] = useState([]);

  const currentNoteIdRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const titleRef = useRef('');
  const contentRef = useRef('');
  const imageUrlsRef = useRef([]);

  const fetchLabels = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.from('labels').select('*').order('name');
    if (!error && data) {
      setLabels(data);
    }
  }, [session]);

  const fetchNotes = useCallback(async () => {
    if (!session?.user?.id) return;
    
    const { data, error } = await supabase.rpc('get_dashboard_notes', { search_query: debouncedSearchTerm || '' });

    if (!error && data) {
      setNotes(data.map(n => unlockedNotesContent[n.id] ? { ...n, ...unlockedNotesContent[n.id] } : n));
    } else {
      console.error("Error fetching notes:", error);
    }
  }, [session, debouncedSearchTerm, unlockedNotesContent]);

  useEffect(() => {
    if (!editingNoteId || !isDialogOpen || !session?.user?.email) return;

    const channel = supabase.channel(`note-sync-${editingNoteId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notes', 
        filter: `id=eq.${editingNoteId}` 
      }, (payload) => {
        const isRemoteChange = payload.new.title !== titleRef.current || 
                               payload.new.content !== contentRef.current;
        
        if (isRemoteChange && !isSavingRef.current) {
          setNoteTitle(payload.new.title);
          setNoteContent(payload.new.content);
          setNoteImageUrls(payload.new.image_urls || []);
          
          titleRef.current = payload.new.title;
          contentRef.current = payload.new.content;
          imageUrlsRef.current = payload.new.image_urls || [];
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map(p => p.user);
        setActiveEditors(users.filter(u => u !== session.user.email));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            user: session.user.email, 
            online_at: new Date().toISOString() 
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setActiveEditors([]);
    };
  }, [editingNoteId, isDialogOpen, session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase.channel('dashboard-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes' 
      }, () => {
        fetchNotes();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'note_shares' 
      }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchNotes]);

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

  const checkVerification = useCallback(async () => {
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
  }, [session, updateFontSize, updateTitleFontSize, updateNoteColor]);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setUnreadNotifications(data);
    }
  }, [session]);

  const openEditorForNote = useCallback((note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    titleRef.current = note.title;
    contentRef.current = note.content;
    const urls = note.image_urls || [];
    setNoteImageUrls(urls);
    imageUrlsRef.current = urls;
    setEditingNoteId(note.id);
    currentNoteIdRef.current = note.id;
    setSelectedNoteLabels(note.note_labels ? note.note_labels.map(nl => nl.labels.id) : []);
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((note) => {
    if (note.password_hash && !unlockedNotes.includes(note.id)) {
      setUnlockTargetNote(note);
      setUnlockAction('edit');
      setUnlockPassword('');
      setUnlockError('');
      setUnlockDialogOpen(true);
      return;
    }
    openEditorForNote(note);
  }, [unlockedNotes, openEditorForNote]);

  const handleNotificationSelect = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      handleEditClick(note);
    } else {
      supabase.from('notes').select('*, note_labels(labels(*))').eq('id', noteId).single()
        .then(({ data }) => {
          if (data) handleEditClick(data);
        });
    }
  }, [notes, handleEditClick]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      checkVerification();
      fetchNotes();
      fetchLabels();
      fetchUnreadNotifications();
    }, 0);
  }, [session, checkVerification, fetchNotes, fetchLabels, fetchUnreadNotifications]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('home-notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${session.user.id}` 
      }, () => {
        fetchUnreadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchUnreadNotifications]);

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
    setSelectedNoteLabels([]);
    setIsDialogOpen(true);
  };



  const handleDeleteClick = (e, note) => {
    e.stopPropagation();
    if (note.password_hash && !unlockedNotes.includes(note.id)) {
      setUnlockTargetNote(note);
      setUnlockAction('delete');
      setUnlockPassword('');
      setUnlockError('');
      setUnlockDialogOpen(true);
      return;
    }
    setDeleteConfirmNoteId(note.id);
  };

  const submitUnlock = async () => {
    const hash = await hashPassword(unlockPassword);
    const { data, error } = await supabase.rpc('unlock_note', { p_note_id: unlockTargetNote.id, p_hash: hash });
    
    if (error || !data || data.length === 0) {
      setUnlockError('Incorrect password.');
      return;
    }

    const realContent = data[0];
    const updatedNote = { 
      ...unlockTargetNote, 
      title: realContent.title, 
      content: realContent.content, 
      image_urls: realContent.image_urls 
    };

    setUnlockedNotesContent(prev => ({ ...prev, [unlockTargetNote.id]: realContent }));
    setNotes(notes.map(n => n.id === unlockTargetNote.id ? updatedNote : n));
    setUnlockedNotes([...unlockedNotes, unlockTargetNote.id]);
    setUnlockDialogOpen(false);

    if (unlockAction === 'edit') {
      openEditorForNote(updatedNote);
    } else if (unlockAction === 'delete') {
      setDeleteConfirmNoteId(unlockTargetNote.id);
    }
  };

  const submitManageLock = async (action) => {
    const currentNote = notes.find(n => n.id === currentNoteIdRef.current);
    if (!currentNote) return;

    if (currentNote.password_hash) {
      const hash = await hashPassword(manageLockCurrentPassword);
      if (hash !== currentNote.password_hash) {
        setManageLockError('Incorrect current password.');
        return;
      }
    }

    if (action === 'set' || action === 'change') {
      if (manageLockNewPassword !== manageLockConfirmPassword) {
        setManageLockError('New passwords do not match.');
        return;
      }
      if (!manageLockNewPassword) {
        setManageLockError('Password cannot be empty.');
        return;
      }
      const newHash = await hashPassword(manageLockNewPassword);
      await supabase.from('notes').update({ password_hash: newHash }).eq('id', currentNote.id);
      setNotes(notes.map(n => n.id === currentNote.id ? { ...n, password_hash: newHash } : n));
      if (!unlockedNotes.includes(currentNote.id)) {
        setUnlockedNotes([...unlockedNotes, currentNote.id]);
      }
    } else if (action === 'remove') {
      await supabase.from('notes').update({ password_hash: null }).eq('id', currentNote.id);
      setNotes(notes.map(n => n.id === currentNote.id ? { ...n, password_hash: null } : n));
    }
    
    setIsManageLockOpen(false);
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const { data, error } = await supabase.from('labels').insert([{ user_id: session.user.id, name: newLabelName.trim() }]).select();
    if (!error && data) {
      setLabels([...labels, ...data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewLabelName('');
    }
  };

  const handleDeleteLabel = async (id) => {
    const { error } = await supabase.from('labels').delete().eq('id', id);
    if (!error) {
      setLabels(labels.filter(l => l.id !== id));
      setActiveFilterLabels(activeFilterLabels.filter(lId => lId !== id));
      setNotes(notes.map(n => ({...n, note_labels: n.note_labels ? n.note_labels.filter(nl => nl.labels.id !== id) : []})));
    }
  };

  const handleRenameLabel = async (id, newName) => {
    if (!newName.trim()) return;
    const { error } = await supabase.from('labels').update({ name: newName.trim() }).eq('id', id);
    if (!error) {
      setLabels(labels.map(l => l.id === id ? { ...l, name: newName.trim() } : l).sort((a, b) => a.name.localeCompare(b.name)));
      setNotes(notes.map(n => ({
        ...n, 
        note_labels: n.note_labels ? n.note_labels.map(nl => nl.labels.id === id ? { ...nl, labels: { ...nl.labels, name: newName.trim() } } : nl) : []
      })));
    }
  };

  const handleToggleNoteLabel = async (labelId) => {
    let noteId = currentNoteIdRef.current;
    if (!noteId) {
      const { data, error } = await supabase.from('notes').insert([{ user_id: session.user.id, title: titleRef.current, content: contentRef.current }]).select().single();
      if (!error && data) {
        noteId = data.id;
        currentNoteIdRef.current = data.id;
        setEditingNoteId(data.id);
        setNotes([data, ...notes]);
      } else {
        return;
      }
    }

    const isAttached = selectedNoteLabels.includes(labelId);
    let newSelected;
    
    if (isAttached) {
      newSelected = selectedNoteLabels.filter(id => id !== labelId);
      await supabase.from('note_labels').delete().match({ note_id: noteId, label_id: labelId });
    } else {
      newSelected = [...selectedNoteLabels, labelId];
      await supabase.from('note_labels').insert([{ note_id: noteId, label_id: labelId }]);
    }
    
    setSelectedNoteLabels(newSelected);
    
    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        if (isAttached) {
          return { ...n, note_labels: n.note_labels ? n.note_labels.filter(nl => nl.labels.id !== labelId) : [] };
        } else {
          const labelObj = labels.find(l => l.id === labelId);
          return { ...n, note_labels: [...(n.note_labels || []), { labels: labelObj }] };
        }
      }
      return n;
    }));
  };

  const toggleFilterLabel = (id) => {
    setActiveFilterLabels(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
  };

  const filteredNotes = notes.filter(note => {
    const noteLabelIds = note.note_labels?.map(nl => nl.labels?.id) || [];
    
    const matchesLabels = activeFilterLabels.length === 0 || activeFilterLabels.every(id => noteLabelIds.includes(id));
    if (!matchesLabels) return false;


    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();
    const titleMatch = note.title?.toLowerCase().includes(searchLower);
    const contentMatch = note.content?.toLowerCase().includes(searchLower);
    const labelMatch = note.note_labels?.some(nl => nl.labels?.name.toLowerCase().includes(searchLower));

    return titleMatch || contentMatch || labelMatch;
  });

  const myNotes = filteredNotes.filter(n => n.is_owner !== false);
  const sharedWithMe = filteredNotes.filter(n => n.is_owner === false);

  const autosaveNote = async (title, content, id, imageUrls) => {
    if (!title?.trim() && !content?.trim() && (!imageUrls || imageUrls.length === 0)) {
      if (!id) return null;
    }
    if (!session?.user?.id) return id;
    
    if (id) {
      const note = notes.find(n => n.id === id);
      const isOwner = note?.is_owner !== false;
      const canEdit = isOwner || note?.share_permission === 'edit';
      if (!canEdit) return id;
    }

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
    const note = notes.find(n => n.id === id);
    if (note && note.is_owner === false) {
      console.error("Non-owners cannot delete shared notes.");
      return;
    }
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
    <div className="home-container">
      <div className="dashboard-layout">
        {/* SIDEBAR - Desktop Only */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <Flex align="center" gap="3" mb="4">
              <Avatar
                size="3"
                src={avatarUrl}
                fallback={session?.user?.email?.charAt(0).toUpperCase() || "?"}
                radius="none"
                style={{ border: '1.5px solid var(--border)' }}
              />
              <Box>
                <Heading size="3" style={{ fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                  {session?.user?.user_metadata?.username || 'USER'}
                </Heading>
              </Box>
            </Flex>

            <Button 
              onClick={openCreateDialog} 
              size="3" 
              variant="solid" 
              style={{ width: '100%', cursor: 'pointer', borderRadius: 0, fontWeight: 900, backgroundColor: 'var(--text-h)', color: 'var(--bg)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              <PlusIcon /> ADD NOTE
            </Button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">NAVIGATION</div>
            <div className="sidebar-nav-item active">
              <FileTextIcon /> ALL NOTES
            </div>
            <div className="sidebar-nav-item" onClick={() => setLocation('/preferences')}>
              <GearIcon /> PREFERENCES
            </div>
            <div className="sidebar-nav-item" onClick={() => setLocation('/forgot-password')}>
              <LockClosedIcon /> RESET PASSWORD
            </div>
            <div className="sidebar-nav-item">
              <NotificationBell 
                session={session} 
                onSelectNote={handleNotificationSelect} 
                label="NOTIFICATIONS"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">LABELS</div>
            <LabelFilterBar 
              labels={labels}
              activeFilterLabels={activeFilterLabels}
              toggleFilterLabel={toggleFilterLabel}
              setIsLabelManagerOpen={setIsLabelManagerOpen}
              vertical={true}
            />
          </div>

          <Box mt="auto">
             <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                color="gray" 
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 0, fontWeight: 800, textTransform: 'uppercase' }}
              >
               <ExitIcon /> SIGN OUT
             </Button>
          </Box>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          <DashboardHeader 
            isVerified={isVerified}
            avatarUrl={avatarUrl}
            session={session}
            setLocation={setLocation}
            handleSignOut={handleSignOut}
            openCreateDialog={openCreateDialog}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSelectNote={handleNotificationSelect}
          />

          {unreadNotifications.length > 0 && (
            <Box mb="6">
              <Callout.Root color="gray" variant="outline" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                <Callout.Icon>
                  <Share2Icon />
                </Callout.Icon>
                <Callout.Text style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                  You have {unreadNotifications.length} new shared {unreadNotifications.length === 1 ? 'note' : 'notes'}. 
                  Check the notification bell for details.
                </Callout.Text>
              </Callout.Root>
            </Box>
          )}

          {/* Label Bar - Only on mobile/tablet */}
          <Box display={{ initial: 'block', md: 'none' }}>
            <LabelFilterBar 
              labels={labels}
              activeFilterLabels={activeFilterLabels}
              toggleFilterLabel={toggleFilterLabel}
              setIsLabelManagerOpen={setIsLabelManagerOpen}
            />
          </Box>

          {notes.length === 0 ? (
            <Text size="3" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.4, color: 'var(--text)' }}>No notes yet. Click "Add Note" to create one!</Text>
          ) : filteredNotes.length === 0 ? (
            <Text size="3" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.4, color: 'var(--text)' }}>
              {debouncedSearchTerm ? `No notes found matching "${debouncedSearchTerm}".` : 'No notes match your selected labels.'}
            </Text>
          ) : (
            <>
              {myNotes.length > 0 && (
                <Box mb="8">
                  <Heading size="4" mb="4" style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    My Notes
                  </Heading>
                  {viewMode === 'grid' ? (
                    <div className="notes-grid">
                      {myNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          viewMode="grid"
                          noteColor={noteColor}
                          titleFontSize={titleFontSize}
                          fontSize={fontSize}
                          unlockedNotes={unlockedNotes}
                          handleEditClick={handleEditClick}
                          handleTogglePin={handleTogglePin}
                          handleDeleteClick={handleDeleteClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <Flex direction="column" gap="4">
                      {myNotes.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          viewMode="list"
                          noteColor={noteColor}
                          titleFontSize={titleFontSize}
                          fontSize={fontSize}
                          unlockedNotes={unlockedNotes}
                          handleEditClick={handleEditClick}
                          handleTogglePin={handleTogglePin}
                          handleDeleteClick={handleDeleteClick}
                        />
                      ))}
                    </Flex>
                  )}
                </Box>
              )}

              {sharedWithMe.length > 0 && (
                <Box mb="6">
                  <Heading size="4" mb="4" style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Shared with Me
                  </Heading>
                  {viewMode === 'grid' ? (
                    <div className="notes-grid">
                      {sharedWithMe.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          viewMode="grid"
                          noteColor={noteColor}
                          titleFontSize={titleFontSize}
                          fontSize={fontSize}
                          unlockedNotes={unlockedNotes}
                          handleEditClick={handleEditClick}
                          handleTogglePin={handleTogglePin}
                          handleDeleteClick={handleDeleteClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <Flex direction="column" gap="4">
                      {sharedWithMe.map(note => (
                        <NoteCard 
                          key={note.id} 
                          note={note} 
                          viewMode="list"
                          noteColor={noteColor}
                          titleFontSize={titleFontSize}
                          fontSize={fontSize}
                          unlockedNotes={unlockedNotes}
                          handleEditClick={handleEditClick}
                          handleTogglePin={handleTogglePin}
                          handleDeleteClick={handleDeleteClick}
                        />
                      ))}
                    </Flex>
                  )}
                </Box>
              )}
            </>
          )}
        </main>
      </div>

      <NoteEditorDialog 
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        noteColor={noteColor}
        titleFontSize={titleFontSize}
        fontSize={fontSize}
        editingNoteId={editingNoteId}
        isSaving={isSaving}
        noteTitle={noteTitle}
        handleTitleChange={handleTitleChange}
        noteContent={noteContent}
        handleContentChange={handleContentChange}
        noteImageUrls={noteImageUrls}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        labels={labels}
        selectedNoteLabels={selectedNoteLabels}
        handleToggleNoteLabel={handleToggleNoteLabel}
        hasPassword={!!notes.find(n => n.id === editingNoteId)?.password_hash}
        isOwner={notes.find(n => n.id === editingNoteId)?.is_owner !== false}
        sharePermission={notes.find(n => n.id === editingNoteId)?.share_permission || null}
        onManageLockClick={() => {
          setManageLockCurrentPassword('');
          setManageLockNewPassword('');
          setManageLockConfirmPassword('');
          setManageLockError('');
          setIsManageLockOpen(true);
        }}
        onShareClick={() => {
          setShareTargetNoteId(editingNoteId);
          setIsShareDialogOpen(true);
        }}
        session={session}
        activeEditors={activeEditors}
        ownerEmail={notes.find(n => n.id === editingNoteId)?.owner_email}
        sharedAt={notes.find(n => n.id === editingNoteId)?.shared_at}
      />

      <LabelManagerDialog 
        open={isLabelManagerOpen}
        onOpenChange={setIsLabelManagerOpen}
        noteColor={noteColor}
        newLabelName={newLabelName}
        setNewLabelName={setNewLabelName}
        onCreateLabel={handleCreateLabel}
        labels={labels}
        onRenameLabel={handleRenameLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      <DeleteConfirmDialog 
        open={!!deleteConfirmNoteId}
        onOpenChange={(open) => !open && setDeleteConfirmNoteId(null)}
        noteColor={noteColor}
        onDelete={() => { handleDeleteNote(deleteConfirmNoteId); setDeleteConfirmNoteId(null); }}
      />

      <UnlockDialog 
        open={unlockDialogOpen}
        onOpenChange={(open) => !open && setUnlockDialogOpen(false)}
        noteColor={noteColor}
        unlockAction={unlockAction}
        unlockError={unlockError}
        unlockPassword={unlockPassword}
        setUnlockPassword={setUnlockPassword}
        onSubmit={submitUnlock}
      />

      <ManageLockDialog 
        open={isManageLockOpen}
        onOpenChange={setIsManageLockOpen}
        noteColor={noteColor}
        hasPassword={!!notes.find(n => n.id === editingNoteId)?.password_hash}
        manageLockError={manageLockError}
        setManageLockError={setManageLockError}
        manageLockCurrentPassword={manageLockCurrentPassword}
        setManageLockCurrentPassword={setManageLockCurrentPassword}
        manageLockNewPassword={manageLockNewPassword}
        setManageLockNewPassword={setManageLockNewPassword}
        manageLockConfirmPassword={manageLockConfirmPassword}
        setManageLockConfirmPassword={setManageLockConfirmPassword}
        onSubmit={submitManageLock}
      />

      <ShareNoteDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        noteId={shareTargetNoteId}
        noteColor={noteColor}
      />

    </div>
  );
}

