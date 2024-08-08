
import { User } from "./auth";

import { deleteEvent, listEvents } from "./calendar/calendarApi";
import { addToCalendar, deleteCalendarEvents } from "./calendar/calendarLogic";
import { BookingDB, BookingForm, getCalendarKey, convertIndianTimeToUTC, printInIndianTime } from "./bookingType";
import { createBooking, fetchBooking, updateBooking } from "./db";
import { query } from "./helper";

function capitalizeString(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

// return boolean and error if double booking is detected
export async function checkForDoubleBooking(booking: BookingDB): Promise<{ doubleBooking: boolean, error?: string }> {
  if (booking.bookingType == 'Stay') {
    for (let property of booking.properties) {
      let events = await listEvents(property, booking.startDateTime, booking.endDateTime);
      events = events.filter((e) => {
        return booking.calendarIds
          ? booking.calendarIds[property] !== e.id
          : true;
      });
      
      if (events.length > 0) {
        const summaries = events.map(event => event.summary).join(', ');
        return { doubleBooking: true, error: `Double booking detected(${events.length}) for this ${property} from ${printInIndianTime(booking.startDateTime)} to ${printInIndianTime(booking.endDateTime)}.\n ${summaries} ` };
      }
    }
  } else {
    for (let event of booking.events) {
      for (let property of event.properties) {
        let events = await listEvents(property, event.startDateTime, event.endDateTime);
        events = events.filter((e) => {
          return event.calendarIds
            ? event.calendarIds[property] !== e.id
            : true;
        });
        
        if (events.length > 0) {
          return { doubleBooking: true, error: `Double booking detected for this booking for event ${event.eventName}, property ${property} for dates ${event.startDateTime} to ${event.endDateTime}` };
        }
      }
    }
  }
  return { doubleBooking: false };
}

export async function mutateBookingState(booking: BookingForm, user: User): Promise<number> {
  let newBooking: BookingDB = {
    ...booking,
    startDateTime: booking.startDateTime!,
    endDateTime: booking.endDateTime!,
    client: {
      ...booking.client,
      name: capitalizeString(booking.client.name)
    },
    encodingVersion: 1,
    createdDateTime: (booking as BookingDB).createdDateTime ? convertIndianTimeToUTC((booking as BookingDB).createdDateTime) : new Date().toISOString(),
    createdBy: {
      id: user.id,
      name: user.displayName || "Anonymous",
    },
    updatedDateTime: new Date().toISOString(),
    updatedBy: {
      id: user.id,
      name: user.displayName || "Anonymous",
    },
    payments: booking.payments.map(payment => {
      return {
        ...payment,
        receivedBy: payment.receivedBy || {
          id: user.id,
          name: user.displayName || "Anonymous",
        },
        dateTime: payment.dateTime || new Date().toISOString()
      }
    })
  }
  // TODO: add ids after booking id is generated, to reduce chance of collission
  for (let event of newBooking.events) {
    event.eventId = event.eventId || Math.floor(Math.random() * 1000000);
    for (let cost of event.costs) {
      cost.costId = cost.costId || Math.floor(Math.random() * 1000000);
    }
  }
  for (let payment of newBooking.payments) {
    payment.paymentId = payment.paymentId || Math.floor(Math.random() * 1000000);
  }
  if (newBooking.clientViewId === undefined) {
    newBooking.clientViewId = Math.floor(Math.random() * 1000000).toString();
  }
  if (newBooking.status == "Confirmed" || newBooking.status == "Preconfirmed") {
    let { doubleBooking, error } = await checkForDoubleBooking(newBooking);
    if (doubleBooking) {
      throw new Error(error);
    }
  }

  if(newBooking.bookingId) {
    console.log("mutateBookingState modify booking")
    await addToCalendar(newBooking);

    await modifyExistingBooking(newBooking);
    return newBooking.bookingId
  } else {
    console.log("mutateBookingState create booking")
    await addToCalendar(newBooking);
    let bookingId = createBooking(newBooking, user.displayName ?? user.id)
    return bookingId
  }
}

async function modifyExistingBooking(newBooking: BookingDB) {
  if (!newBooking.bookingId) {
    throw new Error("Booking ID is required");
  }
  let bookings = await fetchBooking(newBooking.bookingId!);
  let oldBooking = bookings[bookings.length - 1];
  newBooking.createdBy = oldBooking.createdBy;

  bookings.push(newBooking);
  await updateBooking(bookings, newBooking.bookingId!);
}

export async function deleteBooking(bookingId: number) {
  // first fetch
  let bookings = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  if (bookings.length === 0) {
    throw new Error("Booking not found");
  }
  let lastIndexOfJson = bookings[0].json.length - 1;
  let booking = bookings[0].json[lastIndexOfJson] as BookingDB;
  await deleteCalendarEvents(booking)
  query('DELETE FROM bookings WHERE id = $1', [bookingId]);
}
