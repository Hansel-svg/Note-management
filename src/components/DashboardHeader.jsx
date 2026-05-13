import { Flex, Heading, Button, Box, TextField, Avatar, Callout, IconButton } from "@radix-ui/themes";
import { InfoCircledIcon, LockClosedIcon, GearIcon, GridIcon, ListBulletIcon, ExitIcon, PlusIcon, MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import NotificationBell from "./NotificationBell";
import { supabase } from "../lib/SupaBaseClient";

export default function DashboardHeader({
  isVerified,
  avatarUrl,
  session,
  setLocation,
  handleSignOut,
  openCreateDialog,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  onSelectNote
}) {
  return (
    <>
      {!isVerified && (
        <Box mb="6">
          <Callout.Root color="gray" variant="outline" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-h)' }}>
              YOUR ACCOUNT IS NOT VERIFIED. PLEASE VERIFY YOUR EMAIL.
              <Button 
                variant="ghost" 
                size="1" 
                ml="3" 
                onClick={async () => {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: session.user.email
                  });
                  if (!error) alert('VERIFICATION EMAIL RESENT!');
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 900, textTransform: 'uppercase' }}
              >
                RESEND EMAIL
              </Button>
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      <Flex direction={{ initial: 'column', sm: 'row' }} justify="between" align={{ initial: 'stretch', sm: 'center' }} mb="6" gap="4">
        <Heading 
          size={{ initial: '7', sm: '8' }} 
          as="h1" 
          display={{ initial: 'block', md: 'none' }}
          style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase', margin: 0 }}
        >
          MY NOTES
        </Heading>
        <Flex gap="2" align="center" wrap="wrap" justify={{ initial: 'center', sm: 'end' }} display={{ initial: 'flex', md: 'none' }}>
          <NotificationBell session={session} onSelectNote={onSelectNote} />
          <Avatar
            size="3"
            src={avatarUrl}
            fallback={session?.user?.email?.charAt(0).toUpperCase() || "?"}
            radius="none"
            style={{ border: '1.5px solid var(--border)' }}
          />
          <Button variant="outline" color="gray" onClick={() => setLocation('/preferences')} style={{ cursor: "pointer", borderRadius: 0, fontWeight: 800, borderColor: 'var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)', flexGrow: { initial: 1, sm: 0 } }}>
            <GearIcon />
            <Box display={{ initial: 'none', xs: 'inline', sm: 'inline' }}>PREFERENCES</Box>
          </Button>
          <Button variant="outline" color="gray" onClick={() => setLocation('/forgot-password')} style={{ cursor: "pointer", borderRadius: 0, fontWeight: 800, borderColor: 'var(--border)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)', flexGrow: { initial: 1, sm: 0 } }}>
            <LockClosedIcon />
            <Box display={{ initial: 'none', xs: 'inline', sm: 'inline' }}>RESET PASSWORD</Box>
          </Button>
          <Button variant="solid" color="gray" onClick={handleSignOut} style={{ cursor: "pointer", borderRadius: 0, fontWeight: 900, backgroundColor: 'var(--text-h)', color: 'var(--bg)', textTransform: 'uppercase', letterSpacing: '0.1em', flexGrow: { initial: 1, sm: 0 } }}>
            <ExitIcon />
            <Box display={{ initial: 'none', xs: 'inline', sm: 'inline' }}>SIGN OUT</Box>
          </Button>
        </Flex>
      </Flex>

      <Flex justify="between" align={{ initial: 'start', sm: 'center' }} mb="4" wrap="wrap" gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Flex gap="3" align="center" style={{ width: { initial: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
          <Heading size="6" style={{ fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--text-h)' }}>
            {searchTerm ? 'SEARCH RESULTS' : 'RECENT NOTES'}
          </Heading>
          <Box display={{ initial: 'block', md: 'none' }}>
            <Button onClick={openCreateDialog} color="gray" variant="solid" style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 900, backgroundColor: 'var(--text-h)', color: 'var(--bg)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <PlusIcon /> ADD NOTE
            </Button>
          </Box>
        </Flex>
        <Flex gap="3" align="center" style={{ width: '100%', maxWidth: { initial: '100%', sm: '600px' }, flexGrow: 1, justifyContent: 'flex-end' }}>
          <TextField.Root 
            id="search-input"
            placeholder="SEARCH NOTES OR LABELS... (/)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flexGrow: 1, borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
            autoComplete="off"
            size="3"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" color="var(--text-h)" />
            </TextField.Slot>
            {searchTerm && (
              <TextField.Slot>
                <IconButton 
                   size="1" 
                  variant="ghost" 
                  color="gray" 
                  onClick={() => setSearchTerm('')}
                  style={{ cursor: 'pointer' }}
                >
                  <Cross2Icon width="14" height="14" />
                </IconButton>
              </TextField.Slot>
            )}
          </TextField.Root>
          <Flex gap="2">
            <IconButton 
              variant={viewMode === 'grid' ? 'solid' : 'outline'} 
              color="gray" 
              onClick={() => setViewMode('grid')}
              style={{ cursor: 'pointer', borderRadius: 0, borderColor: 'var(--border)' }}
              size="3"
            >
              <GridIcon />
            </IconButton>
            <IconButton 
              variant={viewMode === 'list' ? 'solid' : 'outline'} 
              color="gray" 
              onClick={() => setViewMode('list')}
              style={{ cursor: 'pointer', borderRadius: 0, borderColor: 'var(--border)' }}
              size="3"
            >
              <ListBulletIcon />
            </IconButton>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
