import { BookingDB, BookingForm } from "../../../utils/types/bookingType";
import { insertEvent } from "./calendar";
import { query } from "./helper";

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
    createdBy: {
      id: email,
      name: email
    },
    updatedDateTime: new Date().toISOString(),
    updatedBy: {
      id: email,
      name: email
    },
    payments: booking.payments.map(payment => {
      return {
        ...payment,
        receivedBy: payment.receivedBy || {
          id: email,
          name: email
        },
        dateTime: payment.dateTime || new Date().toISOString()
      }
    })
  }
  if(newBooking.bookingId) {
    await modifyExistingBooking(newBooking); 
    return newBooking.bookingId
  } else {
    console.log("mutateBookingState create booking")  
    let bookingId = createBooking(newBooking, email)
    await insertToCalendarIfConfirmed(newBooking);
    return bookingId
  }
}

export async function insertToCalendarIfConfirmed(newBooking: BookingDB): Promise<BookingDB> {
  if (newBooking.status === "Confirmed") {
    for(let i = 0; i < newBooking.events.length; i++) {
      let event = newBooking.events[i];
      newBooking.events[i].calendarIds = {};
      let summary = `${newBooking.bookingName} for ${newBooking.client.name}(${event.numberOfGuests} pax) by ${newBooking.createdBy.name}`;
      let description = `
      Total Amount: ${newBooking.finalCost} 
      Payment Method: ${newBooking.paymentMethod}
      Paid Amount: ${newBooking.payments.reduce((acc, payment) => acc + payment.amount, 0)}
      `;

      
      for (let property of event.properties) {
        let id = await insertEvent(process.env.CALENDAR_ID!, {
          summary: summary,
          location: property,
          description: description,
          start: {
            dateTime: event.startDateTime
          },
          end: {
            dateTime: event.endDateTime
          }
        });
        newBooking.events[i].calendarIds![property] = id;
      }
    }
  }
  return newBooking;
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
