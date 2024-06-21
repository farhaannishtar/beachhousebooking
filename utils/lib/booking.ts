import { User } from "./auth";
import { BookingDB, BookingForm, getProperties, convertPropertiesForDb } from "./bookingType";
import { deleteEvent, insertEvent } from "./calendar";
import { query } from "./helper";

export async function createBooking(booking: BookingDB, name: string): Promise<number> {
    let resp = await query(`
      INSERT INTO bookings(email, json, client_name, client_phone_number, referred_by, status, properties, check_in, check_out, created_at, updated_at, starred, total_cost, paid, outstanding)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`, 
      [
        name, 
        [booking],
        booking.client.name,
        booking.client.phone,
        booking.refferral,
        booking.status.toLocaleLowerCase(),
        convertPropertiesForDb(getProperties(booking)),
        booking.startDateTime,
        booking.endDateTime,
        booking.createdDateTime,
        booking.updatedDateTime,
        booking.starred,
        booking.totalCost,
        booking.paid,
        booking.outstanding
      ]);
    return resp[0].id;
}

export function updateBooking(booking: BookingDB[], id: number) {
  console.log("updateBooking", booking[0].bookingType)
  const lastBooking = booking[booking.length - 1];
  query(`
    UPDATE bookings 
      SET 
        json = $2,
        client_name = $3,
        client_phone_number = $4,
        referred_by = $5,
        status = $6,
        properties = $7,
        updated_at = $8,
        check_in = $9,
        check_out = $10,
        starred = $11,
        total_cost = $12,
        paid = $13,
        outstanding = $14
      WHERE id = $1`, 
      [id, 
        booking, 
        lastBooking.client.name, 
        lastBooking.client.phone, 
        lastBooking.refferral, 
        lastBooking.status.toLocaleLowerCase(), 
        convertPropertiesForDb(getProperties(lastBooking)),
        lastBooking.updatedDateTime,
        lastBooking.startDateTime,
        lastBooking.endDateTime,
        lastBooking.starred,
        lastBooking.totalCost,
        lastBooking.paid,
        lastBooking.outstanding
      ])
}

export async function fetchBooking(id: number): Promise<BookingDB[]> {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result[0].json;
}

function capitalizeString(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
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
    createdDateTime: new Date().toISOString(),
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
  if(newBooking.bookingId) {
    console.log("mutateBookingState modify booking")
    await modifyExistingBooking(newBooking); 
    return newBooking.bookingId
  } else {
    console.log("mutateBookingState create booking")
    let bookingId = createBooking(newBooking, user.displayName ?? user.id)
    // await insertToCalendarIfConfirmed(newBooking);
    return bookingId
  }
}

export async function insertToCalendarIfConfirmed(newBooking: BookingDB): Promise<BookingDB> {
  if (newBooking.status === "Confirmed") {
    for(let i = 0; i < newBooking.events.length; i++) {
      let event = newBooking.events[i];
      newBooking.events[i].calendarIds = {};
      let summary = `${newBooking.client.name}(${newBooking.numberOfGuests} pax) by ${newBooking.createdBy.name}`;
      let description = `
      Total Amount: ${newBooking.totalCost} 
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
  bookings.push(newBooking);
  updateBooking(bookings, newBooking.bookingId!);
}

export async function deleteBooking(bookingId: number) {
  // first fetch
  let bookings = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  if (bookings.length === 0) {
    throw new Error("Booking not found");
  }
  let booking = bookings[0].json[0] as BookingDB;
  // for (let event of booking.events) {
  //   for (let property of event.properties) {
  //     await deleteEvent(process.env.CALENDAR_ID!, event.calendarIds![property]);
  //   }
  // }
  query('DELETE FROM bookings WHERE id = $1', [bookingId]);
}
