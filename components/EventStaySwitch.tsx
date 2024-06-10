import React, { ChangeEvent } from "react";

interface EventStaySwitchProps {
  isOn: boolean;
  handleToggle: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onColor?: string;
}

export const EventStaySwitch: React.FC<EventStaySwitchProps> = ({
  isOn,
  handleToggle,
  onColor = "selectedButton", // Ensure this is a valid CSS color value
}) => (
  <label
    style={{ background: isOn ? `#${onColor}` : "bg-inputBoxbg" }} // Corrected usage of onColor with template literal
    className="relative inline-block w-full h-auto py-4 bg-inputBoxbg cursor-pointer rounded-[30px] transition-colors duration-200"
  >
    <input
      checked={isOn}
      onChange={handleToggle}
      className="absolute opacity-0 w-0 h-0"
      type="checkbox"
    />
    <div
      style={{
        left: isOn ? "0" : "50%", // Dynamically set the left property based on isOn
      }}
      className="absolute z-10 top-[1.5px] w-1/2 h-full bg-selectedButton rounded-full transition-all duration-200 shadow-md" // Assume bg-blue-500 is the slider color
    />
    <div className="relative z-10 flex h-full">
      <span
        className={`flex items-center justify-center w-1/2 h-full z-50 ${
          isOn ? "text-white" : "text-black"
        }`}
      >
        Event
      </span>
      <span
        className={`flex items-center justify-center w-1/2 h-full ${
          isOn ? "text-black" : "text-white"
        }`}
      >
        Stay
      </span>
    </div>
  </label>
);