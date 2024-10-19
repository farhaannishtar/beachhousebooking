import React from "react";
import { Property } from "@/utils/lib/bookingType";

type PropertyBadgeProps = {
  propertyName: Property;
  handlePropertyChange: (propertyName: Property) => void;
  value: boolean;
};

const PropertyBadge: React.FC<PropertyBadgeProps> = ({ propertyName, handlePropertyChange, value }) => {

  const toggleProperty = () => {
    handlePropertyChange(propertyName)
  };

  const badgeClasses = `badge badge-lg text-center ${value ? '!text-white tablet-down:bg-selectedButton laptop-up:bg-gradient-to-r laptop-up:from-[#0B9AEF] laptop-up:to-[#0B7DC0]' : 'text-black bg-inputBoxbg'
    } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`;

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