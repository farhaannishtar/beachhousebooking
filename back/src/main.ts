import { google } from 'googleapis';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { JWT } from 'google-auth-library';
import credentials from './credentials.json';
// Pinceq-4pebcy-nydsaj
// Path to your credentials JSON file
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Initialize the GoogleAuth client
const authCl = new google.auth.GoogleAuth({
  keyFilename: CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

async function listEvents(): Promise<void> {

    const client = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [ // set the right scope
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
      });

      const calendar = google.calendar({ version: 'v3' });

  // We make a request to Google Calendar API.

    try {
        const res = await calendar.events.insert({
        calendarId: 'nathikazad@gmail.com',
        auth: client,
        requestBody: {
            summary: 'Google I/O 2022',
            location: 'San Francisco',
            description: 'A chance to hear more about Google\'s developer products.',
            start: {
            dateTime: '2024-06-11T09:00:00-07:00',
            timeZone: 'America/Los_Angeles',
            },
            end: {
            dateTime: '2024-06-11T17:00:00-07:00',
            timeZone: 'America/Los_Angeles'
            }
        },
        });
        console.log(res);
    } catch (error) {
        throw new Error(`Could not create event: ${(error as any).message}`);
    }
    
//   const auth: OAuth2Client = (await authCl.getClient()) as OAuth2Client;
//   const calendar = google.calendar({ version: 'v3', auth})

//   try {
//     const res = await calendar.events.list({
//       calendarId: 'nathikazad@gmail.com', // Make sure to replace with your actual email or calendar ID
//     //   timeMin: (new Date()).toISOString(),
//       maxResults: 1,
//       singleEvents: true,
//       orderBy: 'startTime',
//     });

//     const events = res.data.items;
//     if (events?.length) {
//     //   console.log('Upcoming 10 events:');
//       events.forEach((event) => {
//         const start = event.start?.dateTime || event.start?.date;
//         // console.log(`${start} - ${event.summary}`);
//         console.log(event)
//       });
//     } else {
//       console.log('No upcoming events found.');
//     }

    // const response = await calendar.events.patch({
    //     calendarId: 'bluehouseecr@gmail.com',
    //     eventId: "c5j3ae1n64q66bb465i32b9k6dh34b9ocks32b9jc5h3gphp65ij8cb2c4",
    //     auth: auth,
    //     requestBody: {
    //         colorId: "11"
    //     }
    // });
  
    //   console.log(`Updated event color: ${response.data.summary}`);

    // const response = await calendar.events.insert({
    //     auth: auth,
    //     calendarId: 'nathikazad@gmail.com',
    //     requestBody: {
    //         summary: 'Google I/O 2022',
    //         location: 'San Francisco',
    //         description: 'A chance to hear more about Google\'s developer products.',
    //         start: {
    //         dateTime: '2022-05-11T09:00:00-07:00',
    //         timeZone: 'America/Los_Angeles',
    //         },
    //         end: {
    //         dateTime: '2022-05-11T17:00:00-07:00',
    //         timeZone: 'America/Los_Angeles',
    //         },
    //     }
    // });
    // console.log('Event created: %s', response.data);

//   } catch (error) {
//     console.error('Error fetching events:', error);
//   }
}

listEvents().catch(console.error);
