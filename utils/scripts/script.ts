// import { verifyToken } from "./auth";
// import * as dotenv from 'dotenv';
// import { query } from './helper';
import { insertEvent, listEvents, patchEvent } from '../lib/calendar';
import { BookingDB, Property } from '../lib/bookingType';
import { createBooking, insertToCalendarIfConfirmed } from '../lib/booking';

// dotenv.config();

// const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjJFRWZoS0ZUZllTTHl5dXciLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzE3NTMyNDM3LCJpYXQiOjE3MTc1Mjg4MzcsImlzcyI6Imh0dHBzOi8vb2tmcnVxenVsanB4bXp3ZGV5bmouc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImExZWY0NDI0LTMzYWQtNGZjYi1iNDZlLWQwNGRhY2IwZDFkOSIsImVtYWlsIjoibmF0aGlrYXphZEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoibmF0aGlrYXphZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiYTFlZjQ0MjQtMzNhZC00ZmNiLWI0NmUtZDA0ZGFjYjBkMWQ5In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MTc1Mjg4Mzd9XSwic2Vzc2lvbl9pZCI6IjQzMmJiNzgwLWNjNmMtNGQzMi05MDI2LTFkYTkxNjFjOGY0YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.TqvxUYrSakGp5f9HqyUPBoMi1k_sT6sBbHBfxkFAO6c';
// const result = verifyToken(token);
// console.log(result);

// export const note = pgTable("user", {
//     id: serial("id"),
//     name: text("name"),
//     email: text("email"),
//     password: text("password"),
//     role: text("role").$type<"admin" | "customer">(),
//     createdAt: timestamp("created_at"),
//     updatedAt: timestamp("updated_at"),
//   });




async function calendar() {
    // const notes = await query('SELECT * FROM notes');
    // console.log(notes);
    // const notes2 = await query('INSERT INTO notes(text) VALUES($1)', ["Hello"]);
    // console.log(notes2);
    let calendarId = "bluehouseecr@gmail.com"// process.env.CALENDAR_ID!;
    let events = await listEvents(calendarId, 1, (new Date()).toISOString())

    events.forEach((event) => {
        const start = event.start?.dateTime || event.start?.date;
        console.log(`${start} - ${event.summary}`);
        console.log(event)
    });

    // insertEvent(process.env.CALENDAR_ID!, {
    //     summary: 'Google I/O 2022',
    //     location: 'San Francisco',
    //     description: 'A chance to hear more about Google\'s developer products.',
    //     start: {
    //       dateTime: '2024-06-09T09:00:00-07:00',
    //       timeZone: 'America/Los_Angeles',
    //     },
    //     end: {
    //       dateTime: '2024-06-09T17:00:00-07:00',
    //       timeZone: 'America/Los_Angeles'
    //     }
    //   });

    // patchEvent('nathikazad@gmail.com', "c5j3ae1n64q66bb465i32b9k6dh34b9ocks32b9jc5h3gphp65ij8cb2c4",
    //     {
    //         colorId: "11"
    //     })
    // return;
}
// calendar()

async function main() {
  let booking:BookingDB = {
    encodingVersion: 1,
    client: {
      name: "Donald Trump",
      phone: "123456789"
    },
    numberOfEvents: 0,
    numberOfGuests: 2,
    bookingType: "Event",
    startDateTime: "2024-06-09T09:00:00-07:00",
      endDateTime: "2024-06-09T17:00:00-07:00",
    paymentMethod: "Cash",
    notes: "note",
    status: "Confirmed",
    createdDateTime: "2024-06-09T09:00:00-07:00",
    createdBy: {
      id: "xxx",
      name: "Nathik"
    },
    updatedDateTime: "2024-06-09T09:00:00-07:00",
    updatedBy: {
      id: "xxx",
      name: "Nathik"
    },
    followUpDate: "2022-06-09",
    events: [
      {
        eventName: "Mehendi",
        notes: "This is a note",
        startDateTime: "2024-06-09T09:00:00-07:00",
        endDateTime: "2024-06-09T17:00:00-07:00",
        numberOfGuests: 100,
        properties: [Property.Bluehouse, Property.Glasshouse],
        valetService: true,
        djService: true,
        kitchenService: true,
        overNightStay: true,
        overNightGuests: 10,
        costs: [
          {
            name: "Bluehouse",
            amount: 1000
          },
          {
            name: "Cleaning",
            amount: 2000
          },
          {
            name: "EB",
            amount: 3000
          }
        ],
        finalCost: 6000
      },
      {
        eventName: "Wedding",
        notes: "This is a note",
        startDateTime: "2024-06-09T09:00:00-07:00",
        endDateTime: "2024-06-09T17:00:00-07:00",
        numberOfGuests: 100,
        properties: [Property.Bluehouse, Property.Glasshouse],
        valetService: true,
        djService: true,
        kitchenService: true,
        overNightStay: true,
        overNightGuests: 10,
        costs: [
          {
            name: "Bluehouse",
            amount: 1000
          },
          {
            name: "Cleaning",
            amount: 2000
          },
          {
            name: "EB",
            amount: 3000
          }
        ],
        finalCost: 6000
      }
    ],
    finalCost: 3000,
    payments: [
      {
        dateTime: "2024-06-09T17:00:00-07:00",
        paymentMethod: "Cash",
        amount: 3000,
        receivedBy: {
          id: "xxx",
          name: "Nathik"
        },
      }
    ],
    confirmedDateTime: "2024-06-09T17:00:00-07:00",
    confirmedBy: {
      id: "xxx",
      name: "Nathik"
    },
    properties: [Property.Bluehouse, Property.Glasshouse],
    refferral: "Google",
    bookingId: 0,
    starred: false
  }
  // let id = await createBooking(booking, "nathik@gmail.com");
  // console.log(id)
  let bk = await insertToCalendarIfConfirmed(booking);
  console.log(JSON.stringify(bk, null, 2))
}

main()