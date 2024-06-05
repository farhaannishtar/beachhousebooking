import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';

const client: JWT = new JWT({
  email: process.env.CALENDAR_EMAIL,
  key: process.env.CALENDAR_KEY,
  scopes: [ // set the right scope
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ],

});
const calendar = google.calendar({ version: 'v3', auth: client as any });

export async function insertEvent(calendarId: string, event: calendar_v3.Schema$Event): Promise<string> {
  let resp = await calendar.events.insert({
    calendarId: calendarId,
    requestBody: event,
  });
  return resp.data.id!
}

export async function listEvents(calendarId: string, maxResults: number = 10, minTime: string | undefined = undefined): Promise<calendar_v3.Schema$Event[]> {

    const res = await calendar.events.list({
      calendarId: calendarId, // Make sure to replace with your actual email or calendar ID
      timeMin: minTime,
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return res.data.items ?? [];
}


export async function patchEvent(calendarId: string, eventId: string, event: calendar_v3.Schema$Event): Promise<void> {
  await calendar.events.patch({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: event
  });

}

export async function deleteEvent(calendarId: string, eventId: string): Promise<void> {
  await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId
  });
}
