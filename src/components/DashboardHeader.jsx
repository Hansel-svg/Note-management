import { Flex, Heading, Button, Box, TextField, Avatar, Callout, IconButton } from "@radix-ui/themes";
import { InfoCircledIcon, LockClosedIcon, GearIcon, GridIcon, ListBulletIcon, ExitIcon, PlusIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import NotificationBell from "./NotificationBell";

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
  setViewMode
}) {
  return (
    <>
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
          <NotificationBell session={session} />
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

      <Flex justify="between" align="center" mb="4" wrap="wrap" gap="4">
        <Flex gap="3" align="center">
          <Heading size="6">Recent Notes</Heading>
          <Button onClick={openCreateDialog} color="cyan" variant="solid" style={{ cursor: 'pointer' }}>
            <PlusIcon /> Add Note
          </Button>
        </Flex>
        <Flex gap="3" align="center" style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
          <TextField.Root 
            placeholder="Search notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
            autoComplete="off"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
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
      </Flex>
    </>
  );
}
