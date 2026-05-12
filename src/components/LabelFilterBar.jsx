import { Flex, Button } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";

export default function LabelFilterBar({
  labels,
  activeFilterLabels,
  toggleFilterLabel,
  setIsLabelManagerOpen
}) {
  return (
    <Flex gap="2" mb="4" wrap="wrap" align="center">
      <Button 
        variant="soft" 
        color="gray" 
        onClick={() => setIsLabelManagerOpen(true)}
        style={{ cursor: 'pointer', borderRadius: '16px' }}
        size="1"
      >
        <GearIcon /> Manage Labels
      </Button>
      {labels.map(label => (
        <Button 
          key={label.id} 
          variant={activeFilterLabels.includes(label.id) ? "solid" : "soft"} 
          color="cyan" 
          onClick={() => toggleFilterLabel(label.id)}
          style={{ cursor: 'pointer', borderRadius: '16px' }}
          size="1"
        >
          {label.name}
        </Button>
      ))}
    </Flex>
  );
}
