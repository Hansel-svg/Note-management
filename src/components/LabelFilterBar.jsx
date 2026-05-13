import { Flex, Button } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";

export default function LabelFilterBar({
  labels,
  activeFilterLabels,
  toggleFilterLabel,
  setIsLabelManagerOpen,
  vertical = false
}) {
  return (
    <Flex direction={vertical ? "column" : "row"} gap="2" mb="6" wrap="wrap" align={vertical ? "stretch" : "center"}>
      <Button 
        variant="outline" 
        color="gray" 
        onClick={() => setIsLabelManagerOpen(true)}
        style={{ cursor: 'pointer', borderRadius: 0, fontWeight: 800, borderColor: 'var(--border)', color: 'var(--text-h)', textTransform: 'uppercase', justifyContent: 'flex-start' }}
        size="1"
      >
        <GearIcon /> MANAGE LABELS
      </Button>
      {labels.map(label => {
        const isActive = activeFilterLabels.includes(label.id);
        return (
          <Button 
            key={label.id} 
            variant={isActive ? "solid" : "outline"} 
            color="gray" 
            onClick={() => toggleFilterLabel(label.id)}
            style={{ 
              cursor: 'pointer', 
              borderRadius: 0, 
              fontWeight: 800, 
              borderColor: 'var(--border)',
              backgroundColor: isActive ? 'var(--text-h)' : 'transparent',
              color: isActive ? 'var(--bg)' : 'var(--text-h)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              justifyContent: 'flex-start'
            }}
            size="1"
          >
            {label.name}
          </Button>
        );
      })}
    </Flex>
  );
}
