import { BookingForm, Property, convertStringToProperty } from '@/utils/lib/bookingType';
import { deleteBooking, mutateBookingState } from '@/utils/lib/booking';
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchUser, saveUser, verifyAndGetPayload } from '@/utils/lib/auth';
import { listEvents } from '@/utils/lib/calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case 'GET':
    await handleGet(req, res);
    break;
  default:
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const { property, month, year } = req.query;
  let propertyInternal = convertStringToProperty(property as string)
  type Month = "june" | "july" | "august" | "september" | "october" | "november" | "december" | "january" | "february" | "march" | "april" | "may";
  const monthConvert: { [key in Month]: number } = { "june": 6, "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12, "january": 1, "february": 2, "march": 3, "april": 4, "may": 5 }
  let monthNumber = monthConvert[(month as string).toLocaleLowerCase() as Month];
  let monthString = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
  let events = await listEvents(propertyInternal, `${year}-${monthString}-01T00:00:00Z`, `${year}-${monthString}-31T23:59:59Z`)
  let json = events.map((event) => {
    return {
      start: event.start?.dateTime,
      end: event.end?.dateTime
    }
  })
  res.status(200).json(json);
};

