import { Filter } from "./BookingFilter";
import { CreateBookingState } from "./BookingForm";
import { ListLogsState } from "./ListLogs";
import PropertyBadge from "./PropertyBadge";
import { Event, Property } from "@/utils/lib/bookingType";
interface PropertiesProps {
  setFormState?: React.Dispatch<React.SetStateAction<CreateBookingState>> | undefined
  setEventState?: React.Dispatch<React.SetStateAction<Event>> | undefined
  setFilterState?:React.Dispatch<React.SetStateAction<Filter>> | undefined
  properties: Property[];
}

const Properties: React.FC<PropertiesProps> = ({ setFilterState, setFormState, setEventState, properties }) => {
  const handlePropertyChange = (property: Property) => {
    if (setFormState) {
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
    }
    if (setEventState) {
      setEventState((prevEvent) => {
        let updatedValues = [...prevEvent.properties];
        if (updatedValues.includes(property)) {
          updatedValues = updatedValues.filter((item) => item !== property);
        } else {
          updatedValues.push(property);
        }
        return {
          ...prevEvent,
          properties: updatedValues
        };
      })
    }
    if (setFilterState) {
      setFilterState((prevFilter: Filter) => {
        let updatedValues = [...prevFilter?.properties ?? []];
        if (updatedValues.includes(property)) {
          updatedValues = updatedValues.filter((item) => item !== property);
        } else {
          updatedValues.push(property);
        }
        return {
          ...prevFilter,
          properties: updatedValues
        };

      })
    }
  };

  return (
    <>
      <p className="text-base font-bold leading-normal laptop-up:!font-medium">
        Properties
      </p>
      <div className="flex flex-wrap gap-3">
        <PropertyBadge
          value={properties.includes(Property.Bluehouse)}
          propertyName={Property.Bluehouse}
          handlePropertyChange={handlePropertyChange}
        />
        <PropertyBadge
          value={properties.includes(Property.MeadowLane)}
          propertyName={Property.MeadowLane}
          handlePropertyChange={handlePropertyChange}
        />
        <PropertyBadge
          value={properties.includes(Property.Glasshouse)}
          propertyName={Property.Glasshouse}
          handlePropertyChange={handlePropertyChange}
        />
        <PropertyBadge
          value={properties.includes(Property.VillaArmati)}
          propertyName={Property.VillaArmati}
          handlePropertyChange={handlePropertyChange}
        />
        <PropertyBadge
          value={properties.includes(Property.LeChalet)}
          propertyName={Property.LeChalet}
          handlePropertyChange={handlePropertyChange}
        />
        <PropertyBadge
          value={properties.includes(Property.Castle)}
          propertyName={Property.Castle}
          handlePropertyChange={handlePropertyChange}
        />
      </div>
    </>
  );
}

export default Properties;