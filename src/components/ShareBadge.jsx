import { Flex, Text } from "@radix-ui/themes";
import { Share2Icon } from "@radix-ui/react-icons";

export default function ShareBadge({ permission }) {
  return (
    <Flex 
      align="center" 
      gap="1" 
      style={{ 
        backgroundColor: 'var(--text-h)', 
        color: 'var(--bg)', 
        padding: '2px 10px', 
        borderRadius: 0,
        display: 'inline-flex',
        width: 'fit-content'
      }}
    >
      <Share2Icon width="12" height="12" />
      <Text size="1" style={{ color: 'var(--bg)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {permission === 'edit' ? 'SHARED / EDIT' : 'SHARED / READ'}
      </Text>
    </Flex>
  );
}
