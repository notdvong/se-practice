type Props = {
  attendees: string;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (item: string) => void;
};

// The two filters of the page: how many people, and which equipment must be present (all of it).
export default function FilterPanel({ attendees, equipmentOptions, selectedEquipment, onAttendeesChange, onEquipmentToggle }: Props) {
  return (
    <section className="panel" aria-labelledby="filter-title">
      <h2 id="filter-title">1. Find a room</h2>
      <label className="field">
        Attendees
        <input type="number" min="1" inputMode="numeric" value={attendees} onChange={e => onAttendeesChange(e.target.value)} />
      </label>
      <fieldset className="equipment">
        <legend>Required equipment (all selected items)</legend>
        {equipmentOptions.map(item => (
          <label key={item} className="inline">
            <input type="checkbox" checked={selectedEquipment.includes(item)} onChange={() => onEquipmentToggle(item)} />
            {item}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
