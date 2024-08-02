import { calendar_v3 } from "googleapis";
import format from 'date-fns/format';
import { deleteEvent, insertEvent, patchEvent } from "./calendarApi";
import { BookingDB, getCalendarKey, Property } from "../bookingType";

async function handleCalendarEvent(calendarKey: string, eventId: string | undefined, eventData: calendar_v3.Schema$Event | undefined, isDelete: boolean = false) {
    if (eventId) {
      if (isDelete) {
        await deleteEvent(calendarKey, eventId);
      } else {
        await patchEvent(calendarKey, eventId, eventData!);
      }
    } else {
      return await insertEvent(calendarKey, eventData!);
    }
  }
  
  function createEventData(booking: BookingDB, eventName: string = '', eventAmount: number = 0) {
    const summary = `${booking.client.name}(${booking.numberOfGuests} pax)${eventName ? ' ' + eventName : ''}`;
    const description = `
      Last Modified By: ${booking.updatedBy.name}
      Last Modified Date: ${format(new Date(`${booking.updatedDateTime || ''}`), "iii LLL d, hh:mmaa")}
      ${eventAmount ? `Event Amount: ${eventAmount}\n` : ''}
      Total Amount: ${booking.tax ? booking.afterTaxTotal : booking.totalCost} 
      Payment Method: ${booking.paymentMethod}
      Paid Amount: ${booking.payments.reduce((acc, payment) => acc + payment.amount, 0)}
    `;
    return { summary, description };
  }
  
  
  export async function addToCalendar(newBooking: BookingDB): Promise<BookingDB> {
    if (newBooking.status != "Confirmed" && newBooking.status != "Preconfirmed") return newBooking;
  
    const isEvent = newBooking.bookingType === 'Event';
    const items = isEvent ? newBooking.events : [newBooking];
  
    for (let i = 0; i < items.length; i++) {
      const item: any = items[i];
      const { summary, description } = createEventData(newBooking, isEvent ? item.eventName : '', isEvent ? item.finalCost : 0);
  
      const properties = isEvent ? item.properties : newBooking.properties;
      const calendarIds = isEvent ? item.calendarIds : newBooking.calendarIds;
  
      for (const property of properties) {
        const calendarKey = getCalendarKey(property);
        const eventData: calendar_v3.Schema$Event = {
          summary,
          description,
          location: property,
          start: { dateTime: item.startDateTime },
          end: { dateTime: item.endDateTime },
          colorId: newBooking.status == 'Preconfirmed' ? '5' : null,
        };
  
        const existingId = calendarIds?.[property];
        const id = await handleCalendarEvent(calendarKey, existingId, eventData, item.markForDeletion);
        
        if (id && !existingId) {
          if (isEvent) {
            newBooking.events[i].calendarIds = { ...calendarIds, [property]: id };
          } else {
            newBooking.calendarIds = { ...calendarIds, [property]: id };
          }
        }
      }
  
      // Remove deleted properties from calendarIds
      if (calendarIds) {
        for (const property in calendarIds) {
          if (!properties.includes(property as Property)) {
            await handleCalendarEvent(getCalendarKey(property as Property), calendarIds[property], undefined, true);
            delete calendarIds[property];
          }
        }
      }
  
      if (isEvent && item.markForDeletion) {
        newBooking.events.splice(i, 1);
        i--;
      }
    }
  
    return newBooking;
  }