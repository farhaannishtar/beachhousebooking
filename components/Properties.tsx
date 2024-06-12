import PropertyBadge from "./PropertyBadge";
import { Property } from "@/utils/lib/bookingType";

interface PropertiesProps {
  handlePropertyChange: (propertyName: Property) => void;
}

const Properties: React.FC<PropertiesProps> = ({ handlePropertyChange }) => {

  return (
    <>
      <p className='text-base font-bold leading-normal'>
        Properties
      </p>
      <div className='flex flex-wrap gap-3'>
        <PropertyBadge propertyName={Property.Bluehouse} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge propertyName={Property.MeadowLane} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge propertyName={Property.Glasshouse} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge propertyName={Property.VillaArmati} handlePropertyChange={handlePropertyChange}/>
        <PropertyBadge propertyName={Property.LeChalet} handlePropertyChange={handlePropertyChange}/>
      </div>
    </>
  )
}

export default Properties;