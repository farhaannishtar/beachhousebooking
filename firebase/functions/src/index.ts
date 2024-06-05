import {onRequest} from "firebase-functions/v2/https";
import * as cors from 'cors';
import * as logger from "firebase-functions/logger";
import { JwtPayload, query, verifyToken } from "./helper";
import { BookingDB, BookingForm } from "../../../shared-types/src/booking";

const corsHandler = cors({origin: true});


export const authenticate = onRequest((request, response) => {
  corsHandler(request, response, () => {
    const header = request.headers.authorization;
    if (!header) {
      response.status(401).send('No token provided');
      return;
    }

    const bearer = header.split(' ');
    const token = bearer[1]; // Assuming the Authorization header contains "Bearer [token]"

    const verifiedToken = verifyToken(token);

    if (verifiedToken == "Invalid token") { // Check if the returned value is the error message
      response.status(403).send('Invalid token')
      return;
    }
    logger.info("😈😈😈😈")  
    const payload = (verifiedToken as JwtPayload)
    let booking: BookingForm = JSON.parse(request.body)
    mutateBookingState(booking, payload.email).then(bookingId => {
      response.json({bookingId: bookingId})
    }).finally(() => {
      response.status(500).send('Error')
    })
  });
});

export async function createBooking(booking: BookingDB, email: string): Promise<number> {
    let resp = await query('INSERT INTO bookings(email, json) VALUES($1, $2)', [email, [booking]]);
    return resp.rows[0].id;
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
    let bookingId = createBooking(newBooking, email)
    if(newBooking.status === "Confirmed") {
      // insert into calendar
    }
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
  newBooking.createdDateTime = oldBooking.createdDateTime;
  // check if status changed to confirmed or cancelled
  if (newBooking.status === "Confirmed" && oldBooking.status !== "Confirmed") {
    // insert into calendar
  } else if (newBooking.status === "Cancelled" && oldBooking.status !== "Cancelled") {
    // delete from calendar
  } else if (oldBooking.status === "Confirmed") { // check if any event dates changed or new event was addded
    for (let i = 0; i < newBooking.events.length; i++) {
      let event = newBooking.events[i];
      if (event.calendarId) {
        let oldEvent = oldBooking.events.find(e => e.calendarId === event.calendarId);
        if (oldEvent && (event.startDateTime !== oldEvent.startDateTime || event.endDateTime !== oldEvent.endDateTime)) {
          // update old event start time and end time
        }
      } else {
        // insert into calendar
      }
    }
    for (let i = 0; i < oldBooking.events.length; i++) {
      let event = oldBooking.events[i];
      if (!newBooking.events.find(e => e.calendarId === event.calendarId)) {
        // delete from calendar
      }
    }
  }
  updateBooking(newBooking, newBooking.bookingId!);
}
