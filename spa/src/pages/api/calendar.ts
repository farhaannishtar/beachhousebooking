import { BookingForm, Property, convertStringToProperty } from '@/utils/lib/bookingType';
import { deleteBooking, mutateBookingState } from '@/utils/lib/booking';
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchUser, saveUser, verifyAndGetPayload } from '@/utils/lib/auth';
import { listEvents } from '@/utils/lib/calendar';
import { Month, TimeSlot, generateHourAvailabilityMap, getTimeSlots, monthConvert } from '@/utils/lib/availabilityMap';
import { removeSpacesAndCapitalize } from '@/utils/lib/helper';

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
  const { properties, month, year } = req.query;
  let propertiesInternal = (properties as string).split(',').map((property) => convertStringToProperty(removeSpacesAndCapitalize(property)));
  let internalMonth = (month as string).toLocaleLowerCase() as Month
  let timeSlots: TimeSlot[] = await getTimeSlots(internalMonth, propertiesInternal, year as string);
  res.status(200).json(generateHourAvailabilityMap(timeSlots, monthConvert[internalMonth], parseInt(year as string)));
};

