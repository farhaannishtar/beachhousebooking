import { BookingForm } from '@/utils/lib/bookingType';
import { deleteBooking, mutateBookingState } from '@/utils/lib/booking';
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchUser, verifyAndGetPayload } from '@/utils/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await handleGet(req, res);
      break;
    case 'POST':
      await handlePost(req, res);
      break;
    case 'DELETE':
      await handleDelete(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Get request');
  res.status(200).json({ message: "Hello" });
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Post request');
  try {
    const payload = await verifyAndGetPayload(req);
    const booking: BookingForm = req.body;
    const user = await fetchUser(payload.sub);
    const bookingId = await mutateBookingState(booking, user);
    res.status(200).json({ bookingId });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: "Error creating booking", message: (error as Error).message });
  }
}

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Delete request');
  try {
    const payload = await verifyAndGetPayload(req);
    const { bookingId } = req.body
    console.log('Booking id:', bookingId);
    await deleteBooking(bookingId);
    res.status(200).json({ message: "Booking deleted" });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: "Error deleting booking", message: (error as Error).message });
  }
}