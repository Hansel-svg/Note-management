import { Flex, Text } from "@radix-ui/themes";
import { Share2Icon } from "@radix-ui/react-icons";

export default function ShareBadge({ permission }) {
  return (
    <Flex 
      align="center" 
      gap="1" 
      style={{ 
        backgroundColor: 'var(--cyan-3)', 
        color: 'var(--cyan-11)', 
        padding: '2px 8px', 
        borderRadius: '12px',
        display: 'inline-flex',
        width: 'fit-content'
      }}
    >
      <Share2Icon width="10" height="10" />
      <Text size="1" style={{ fontWeight: 500 }}>
        {permission === 'edit' ? 'Shared (Edit)' : 'Shared (Read)'}
      </Text>
    </Flex>
  );
}
