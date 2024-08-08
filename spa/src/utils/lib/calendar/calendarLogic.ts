import { calendar_v3 } from "googleapis";
import format from 'date-fns/format';
import { deleteEvent, getEvent, insertEvent, patchEvent } from "./calendarApi";
import { BookingDB, Event, getCalendarKey, Property } from "../bookingType";

async function handleCalendarEvent(
  calendarKey: string, 
  eventId: string | undefined, 
  { eventData, isDelete }: { 
    eventData?: calendar_v3.Schema$Event, 
    isDelete?: boolean 
  }
) {
  if (eventId) {
    if (isDelete) {
      await deleteEvent(calendarKey, eventId);
    } else {
      let event = await getEvent(calendarKey, eventId);
      if (event.status === 'cancelled') {
        let id = await insertEvent(calendarKey, eventData!);
        return id
      } else {
        await patchEvent(calendarKey, eventId, eventData!);
      }
    }
  } else {
      return await insertEvent(calendarKey, eventData!);
    }
  }
  
  function createEventData(booking: BookingDB, event: Event) {
    const numberOfGuests = booking.bookingType === 'Stay' ? booking.numberOfGuests : event.numberOfGuests;
    const eventName = event.eventName === 'Stay' ? '' : event.eventName;
    const summary = `${booking.client.name}(${numberOfGuests} pax)${eventName}`;
    const description = `
      Last Modified By: ${booking.updatedBy.name}
      Last Modified Date: ${format(new Date(`${booking.updatedDateTime || ''}`), "iii LLL d, hh:mmaa")}
      ${booking.bookingType === 'Event' ? `Event Amount: ${event.finalCost}\n` : ''}
      Total Amount: ${booking.tax ? booking.afterTaxTotal : booking.totalCost} 
      Payment Method: ${booking.paymentMethod}
      Paid Amount: ${booking.payments.reduce((acc, payment) => acc + payment.amount, 0)}
    `;
    return { summary, description };
  }
  
  
  export async function addToCalendar(newBooking: BookingDB): Promise<BookingDB> {
    if (newBooking.status != "Confirmed" && newBooking.status != "Preconfirmed") {
      await deleteCalendarEvents(newBooking)
      return newBooking;
    }
  

    let events = newBooking.events;
    if (newBooking.bookingType === 'Stay') {
      let event: Event = {
        ...newBooking,
        finalCost: newBooking.totalCost,
        djService: false,
        eventName: 'Stay',
        valetService: false,
        kitchenService: false, 
        overNightStay: false, 
        overNightGuests: 0, 
        markForDeletion: false
      };
      events = [event]
    } 
  
    for (let i = 0; i < events.length; i++) {
      const event: any = events[i];
      const { summary, description } = createEventData(newBooking, event);
  
      const properties = event.properties;
      const calendarIds = event.calendarIds;
  
      for (const property of properties) {
        const calendarKey = getCalendarKey(property);
        const eventData: calendar_v3.Schema$Event = {
          summary,
          description,
          location: property,
          start: { dateTime: event.startDateTime },
          end: { dateTime: event.endDateTime },
          colorId: newBooking.status == 'Preconfirmed' ? '5' : null,
        };
  
        const existingId = calendarIds?.[property];
        
        const id = await handleCalendarEvent(calendarKey, existingId, {
          eventData, 
          isDelete: event.markForDeletion}
        );
        
        if(id) {
          if (newBooking.bookingType === 'Stay') {
            newBooking.calendarIds = { ...newBooking.calendarIds, [property]: id };
          } else {
            newBooking.events[i].calendarIds = newBooking.events[i].calendarIds || {};
            newBooking.events[i].calendarIds![property] = id
          }
        } 
      }
  
      // Remove deleted properties from calendarIds
      if (calendarIds) {
        for (const property in calendarIds) {
          if (!properties.includes(property as Property)) {
            await handleCalendarEvent(getCalendarKey(property as Property), calendarIds[property], 
            { isDelete: true });
            delete calendarIds[property];
          }
        }
      }
  
      if (event.markForDeletion) {
        newBooking.events.splice(i, 1);
        i--;
      }
    }
  
    return newBooking;
  }

  
  export async function deleteCalendarEvents(booking: BookingDB) {
    if (booking.bookingType == 'Event') {
      for (let event of booking.events) {
        for (let property of event.properties) {
          if (event.calendarIds?.[property]) {
            await deleteEvent(getCalendarKey(property), event.calendarIds![property]);
          }
        }
        event.calendarIds = {}
      }
    }
    //Booking type stay
    else {
      for (let property of booking.properties) {
        console.log("deleting stay calendar ids", booking.calendarIds)
        if (booking.calendarIds && booking.calendarIds[property]) {
          await deleteEvent(getCalendarKey(property), booking.calendarIds![property]);
        }
      }
      booking.calendarIds = {}
    }
  }