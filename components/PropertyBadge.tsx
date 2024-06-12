import React, { useState } from "react";
import { Property } from "@/utils/lib/bookingType";

type PropertyBadgeProps = {
  propertyName: Property;
  handlePropertyChange: (propertyName: Property) => void;
};

const PropertyBadge: React.FC<PropertyBadgeProps> = ({ propertyName, handlePropertyChange }) => {
  const [isSelected, setIsSelected] = useState(false);

  const toggleProperty = () => {
    handlePropertyChange(propertyName)
    setIsSelected(!isSelected);
  };

  const badgeClasses = `badge badge-lg text-center ${isSelected ? 'text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
    } text-base font-medium leading-normal p-6`;

  return (
    <div
      className={badgeClasses}
      onClick={toggleProperty}
    >
      {propertyName}
    </div>
  );
};

export default PropertyBadge;