"use client";

import React, { useState, ChangeEvent } from 'react';
import { Event } from '@/utils/lib/bookingType';

type StayFormProps = {
    status: string;
  };
const StayFormComponent: React.FC<StayFormProps> = ({ status })=> {
  const [event, setEvent] = useState<Event>({
    eventName: '',
    calendarIds: {},
    notes: '',
    startDateTime: '',
    endDateTime: '',
    numberOfGuests: 0,
    properties: [],
    valetService: false,
    djService: false,
    kitchenService: false,
    overNightStay: false,
    overNightGuests: 0,
    costs: [],
    finalCost: 0,
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  return (
    <div>
      <div>
        <label>
                    Number of Guests:
          <input
            type="number"
            name="numberOfGuests"
            value={event.numberOfGuests}
            onChange={handleChange}
          />
        </label>
      </div>
            
    </div>
  );
};

export default StayFormComponent;