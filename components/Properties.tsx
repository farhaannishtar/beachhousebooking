import PropertyBadge from "./PropertyBadge";
import { Property } from "@/utils/lib/bookingType";

interface PropertiesProps {
  handlePropertyChange: (propertyName: Property) => void;
  properties: Property[];
}

const Properties: React.FC<PropertiesProps> = ({ handlePropertyChange, properties }) => {

  return (
    <>
      <p className='text-base font-bold leading-normal'>
        Properties
      </p>
      <div className='flex flex-wrap gap-3'>
        <PropertyBadge value={properties.includes(Property.Bluehouse)} propertyName={Property.Bluehouse} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge value={properties.includes(Property.MeadowLane)} propertyName={Property.MeadowLane} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge value={properties.includes(Property.Glasshouse)} propertyName={Property.Glasshouse} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge value={properties.includes(Property.VillaArmati)} propertyName={Property.VillaArmati} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge value={properties.includes(Property.LeChalet)} propertyName={Property.LeChalet} handlePropertyChange={handlePropertyChange}/>
      </div>
    </>
  )
}

export default Properties;