import { BookingDB, BookingForm } from "../../../shared-types/src/booking";
import { insertEvent } from "./calendar";
import { query } from "./helper";
import * as logger from "firebase-functions/logger";

export async function createBooking(booking: BookingDB, email: string): Promise<number> {
    let resp = await query('INSERT INTO bookings(email, json) VALUES($1, $2) RETURNING id', [email, [booking]]);
    return resp[0].id;
}

export function updateBooking(booking: BookingDB, id: number) {
    query('UPDATE bookings SET json = $1 WHERE id = $2', [[booking], id]);
}

export async function fetchBooking(id: number): Promise<BookingDB[]> {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0];
}

export async function mutateBookingState(booking: BookingForm, email: string): Promise<number> {
  let newBooking: BookingDB = {
    ...booking,
    encodingVersion: 1,
    createdDateTime: new Date().toISOString(),
    createdBy: email,
    updatedDateTime: new Date().toISOString(),
    updatedBy: email,
    payments: booking.payments.map(payment => {
      return {
        ...payment,
        receivedBy: payment.receivedBy || email
      }
    })
  }
  if(newBooking.bookingId) {
    await modifyExistingBooking(newBooking);
    return newBooking.bookingId
  } else {
    logger.info("mutateBookingState create booking")  
    let bookingId = createBooking(newBooking, email)
    // await insertToCalendarIfConfirmed(newBooking);
    return bookingId
  }
}

async function insertToCalendarIfConfirmed(newBooking: BookingDB) {
  if (newBooking.status === "Confirmed") {
    for (let event of newBooking.events) {
      event.calendarIds = {};
      for (let property of event.properties) {
        let id = await insertEvent(process.env.CALENDAR_ID!, {
          summary: newBooking.bookingName,
          location: property,
          description: newBooking.notes,
          start: {
            dateTime: event.startDateTime
          },
          end: {
            dateTime: event.endDateTime
          }
        });
        event.calendarIds[property] = id;
      }
    }
  }
}

async function modifyExistingBooking(newBooking: BookingDB) {
  if (!newBooking.bookingId) {
    throw new Error("Booking ID is required");
  }
  let bookings = await fetchBooking(newBooking.bookingId!);
  let oldBooking = bookings[bookings.length - 1];
  newBooking.createdBy = oldBooking.createdBy;
  newBooking.createdDateTime = oldBooking.createdDateTime;
  updateBooking(newBooking, newBooking.bookingId!);
}
