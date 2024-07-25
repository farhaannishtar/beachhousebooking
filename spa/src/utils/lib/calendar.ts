import { google, calendar_v3 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Property, getCalendarKey } from './bookingType';



function getCalendar() {
  const client: JWT = new JWT({
    email: process.env.CALENDAR_EMAIL,
    key: process.env.CALENDAR_KEY,
    scopes: [ // set the right scope
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],

  });
  return google.calendar({ version: 'v3', auth: client as any });
}

export async function insertEvent(calendarId: string, event: calendar_v3.Schema$Event): Promise<string> {
  let calendar = getCalendar();
  let resp = await calendar.events.insert({
    calendarId: calendarId,
    requestBody: event,
  });
  return resp.data.id!
}

export async function listEvents(property: Property, minTime: string, maxTime: string): Promise<calendar_v3.Schema$Event[]> {
  let calendar = getCalendar();
  const res = await calendar.events.list({
    calendarId: getCalendarKey(property),
    timeMin: minTime,
    timeMax: maxTime,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items ?? [];
}


export async function patchEvent(calendarId: string, eventId: string, event: calendar_v3.Schema$Event): Promise<void> {
  let calendar = getCalendar();
  console.log('====================================');
  console.log({patchEventEventId:eventId});
  console.log('====================================');
  await calendar.events.patch({
    calendarId: calendarId,
    eventId: eventId,
    requestBody: event
  });

}

export async function deleteEvent(calendarId: string, eventId: string): Promise<void> {
  let calendar = getCalendar();
 try {
  await calendar.events.delete({
    calendarId: calendarId,
    eventId: eventId
  });
 } catch (error) {
  console.log('====================================');
  console.log(error);
  console.log('====================================');
 }
}
