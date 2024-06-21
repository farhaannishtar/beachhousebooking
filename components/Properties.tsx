import { CreateBookingState } from "./BookingForm";
import PropertyBadge from "./PropertyBadge";
import { Property } from "@/utils/lib/bookingType";

interface PropertiesProps {
  setFormState: React.Dispatch<React.SetStateAction<CreateBookingState>>
  properties: Property[];
}

const Properties: React.FC<PropertiesProps> = ({ setFormState, properties }) => {
  const handlePropertyChange = (property: Property) => {
    setFormState((prevState: CreateBookingState) => {
      const propertyIndex = prevState.form.properties?.findIndex(
        (p) => p === property
      );
      let newProperties = [...(prevState.form.properties ?? [])];
      if (propertyIndex > -1) {
        newProperties.splice(propertyIndex, 1);
      } else {
        newProperties.push(property);
      }
      return {
        ...prevState,
        form: {
          ...prevState.form,
          properties: newProperties,
        },
      };
    });
  };

  return (
    <>
      <p className='text-base font-bold leading-normal'>
        Properties
      </p>
      <div className='flex flex-wrap gap-3'>
        <PropertyBadge value={properties.includes(Property.Bluehouse)} propertyName={Property.Bluehouse} handlePropertyChange={handlePropertyChange} />
        <PropertyBadge value={properties.includes(Property.MeadowLane)} propertyName={Property.MeadowLane} handlePropertyChange={handlePropertyChange} />
        <PropertyBadge value={properties.includes(Property.Glasshouse)} propertyName={Property.Glasshouse} handlePropertyChange={handlePropertyChange} />
        <PropertyBadge value={properties.includes(Property.VillaArmati)} propertyName={Property.VillaArmati} handlePropertyChange={handlePropertyChange} />
        <PropertyBadge value={properties.includes(Property.LeChalet)} propertyName={Property.LeChalet} handlePropertyChange={handlePropertyChange} />
        <PropertyBadge value={properties.includes(Property.Castle)} propertyName={Property.Castle} handlePropertyChange={handlePropertyChange} />
      </div>
    </>
  )
}

export default Properties;