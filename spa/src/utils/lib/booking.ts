import { User } from "./auth";
import { BookingDB, BookingForm, getProperties, convertPropertiesForDb, Property, getEnvKey } from "./bookingType";
import { deleteEvent, insertEvent, patchEvent } from "./calendar";
import { query } from "./helper";
import format from 'date-fns/format';

export async function createBooking(booking: BookingDB, name: string): Promise<number> {
  let resp = await query(`
      INSERT INTO bookings(email, json, client_name, client_phone_number, referred_by, status, properties, check_in, check_out, created_at, updated_at, starred, total_cost, paid, outstanding, tax, after_tax_total, client_view_id)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
    booking.starred ?? false,
    booking.totalCost ?? 0,
    booking.paid ?? 0,
    booking.outstanding ?? 0,
    booking.tax ?? 0,
    booking.afterTaxTotal ?? 0,
    booking.clientViewId!
  ]);
  return resp[0].id;
}

export async function updateBooking(booking: BookingDB[], id: number) {
  const lastBooking = booking[booking.length - 1];
 
 await query(`
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
        outstanding = $14,
        tax = $15,
        after_tax_total = $16,
        client_view_id = $17,
        created_at = $18
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
    lastBooking.starred ?? false,
    lastBooking.totalCost ?? 0,
    lastBooking.paid ?? 0,
    lastBooking.outstanding ?? 0,
    lastBooking.tax ?? 0,
    lastBooking.afterTaxTotal ?? 0,
    lastBooking.clientViewId,
    lastBooking.createdDateTime
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
    createdDateTime: (booking as BookingDB).createdDateTime || new Date().toISOString(),
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
  if(newBooking.clientViewId === undefined) {
    newBooking.clientViewId = Math.floor(Math.random() * 1000000).toString();
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

export async function addToCalendar(newBooking: BookingDB): Promise<BookingDB> {
  if (newBooking.status === "Confirmed") {
   //Booking type event
   if(newBooking.bookingType=='Event'){
    for(let i = 0; i < newBooking.events.length; i++) {
      console.log("event ",newBooking.events[i].eventName)
      let event = newBooking.events[i];
      //newBooking.events[i].calendarIds = {};
      let summary = `${newBooking.client.name}(${event.numberOfGuests} pax)  ${event.eventName}`;
      let description = `
      Last Modified By: ${newBooking.updatedBy.name}
      Last Modified Date: ${newBooking.updatedDateTime}
      Event Amount: ${event.finalCost}
      Total Amount: ${newBooking.tax?newBooking.afterTaxTotal:newBooking.totalCost} 
      Payment Method: ${newBooking.paymentMethod}
      Paid Amount: ${newBooking.payments.reduce((acc, payment) => acc + payment.amount, 0)}
      `;
     
      
      for (let property of event.properties) { 
        console.log("property ",property)
        if(event.calendarIds && event.calendarIds[property]) {
          if (event.markForDeletion) {
            await deleteEvent(getEnvKey(property), event.calendarIds[property]);
          } else {
            console.log("patch ",property)
            patchEvent(getEnvKey(property), event.calendarIds[property], {
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
          }
        } else {
          try {
            let id = await insertEvent(getEnvKey(property), {
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
            newBooking.events[i].calendarIds={...newBooking.events[i].calendarIds,[property]:id};
          } catch (error) {
            console.log("error ",error)
            console.log("property ",property)
            console.log("data ", {
              summary: summary,
              location: property,
              description: description,
              start: {
                dateTime: event.startDateTime
              },
              end: {
                dateTime: event.endDateTime
              }
            })
          }
        }
      }
      // find properties inside event.calendarIds that are not inside event.properties and delete them
      for (let property in event.calendarIds) {
        if (!event.properties.includes(property as Property)) {
          await deleteEvent(getEnvKey(property as Property), event.calendarIds[property]);
          delete event.calendarIds[property];
        }
      }
      if (event.markForDeletion) {
        newBooking.events.splice(i, 1);
        i--;
      }
    }
   }
    //Booking type stay
    else{
      
      let stay = newBooking;
      //newBooking.events[i].calendarIds = {};
      let summary = `${newBooking.client.name}(${newBooking.numberOfGuests} pax) `;
      let description = `
      Last Modified By: ${newBooking.updatedBy.name}
      Last Modified Date: ${format(new Date(`${newBooking.updatedDateTime || ''}`), "iii LLL d, hh:mmaa")}
      Total Amount: ${newBooking.tax?newBooking.afterTaxTotal:newBooking.totalCost} 
      Payment Method: ${newBooking.paymentMethod}
      Paid Amount: ${newBooking.payments.reduce((acc, payment) => acc + payment.amount, 0)}
      `;
     
      
      for (let property of stay.properties) {
        if(stay.calendarIds && stay.calendarIds[property]) {
          patchEvent(getEnvKey(property), stay.calendarIds[property], {
            summary: summary,
            location: property,
            description: description,
            start: {
              dateTime: stay.startDateTime
            },
            end: {
              dateTime: stay.endDateTime
            }
          });
        } else {
          let id = await insertEvent(getEnvKey(property), {
            summary: summary,
            location: property,
            description: description,
            start: {
              dateTime: stay.startDateTime
            },
            end: {
              dateTime: stay.endDateTime
            }
          });
          newBooking.calendarIds={...newBooking.calendarIds,[property]:id};
        }


      }

      // find properties inside event.calendarIds that are not inside event.properties and delete them
      for (let property in stay.calendarIds) {
        if (!stay.properties.includes(property as Property)) {
          await deleteEvent(getEnvKey(property as Property), stay.calendarIds[property]);
          delete stay.calendarIds[property];
        }
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
 await updateBooking(bookings, newBooking.bookingId!);
}

export async function deleteBooking(bookingId: number) {
  // first fetch
  let bookings = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  if (bookings.length === 0) {
    throw new Error("Booking not found");
  }
  let booking = bookings[0].json[0] as BookingDB;
  if (booking.bookingType=='Event') {
    for (let event of booking.events) {
      for (let property of event.properties) {
        await deleteEvent(getEnvKey(property), event.calendarIds![property]);
      }
    }
  }
  //Booking type stay
  else{
    for (let property of booking.properties) {
      if(booking.calendarIds && booking.calendarIds[property]) {
        await deleteEvent(getEnvKey(property), booking.calendarIds![property]);
      }
    }
  }

  query('DELETE FROM bookings WHERE id = $1', [bookingId]);
}
