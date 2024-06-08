import { createClient } from '@/utils/supabase/server';
import { BookingForm, Property } from "../../../../utils/lib/bookingType";
import Form from '@/components/Form';

export default async function Booking() {
  const supabase = createClient();
  const { data: bookings } = await supabase.from("bookings").select();

  const createBooking = async (formData: FormData) => {
    "use server";

    const supabase = createClient();
    let sesh = await supabase.auth.getSession()
    let token = sesh.data.session?.access_token;
    const note = formData.get("content") as string;

    let booking: BookingForm = {
      client: {
        name: formData.get("clientName") as string,
        phone: formData.get("clientPhoneNumber") as string
      },
      bookerName: formData.get("bookerName") as string,
      bookingType: formData.get("bookingType") as "Stay" | "Event",
      notes: formData.get("notes") as string,
      status: formData.get("bookingStatus") as "Inquiry" | "Booking",
      followUpDate: formData.get("followUpDate") as string,
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
          overNightGuests: 10
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
          overNightGuests: 10
        }
      ],
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
      finalCost: 6000,
      payments: [
        {
          dateTime: "2024-06-09T17:00:00-07:00",
          paymentMethod: "Cash",
          amount: 3000
        }
      ],
      paymentMethod: formData.get("paymentMethod") as string,
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/submit`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(booking)
      });
      // const data = await response.json(); 
      // const bookingId = data.bookingId;
      // console.log('Response from Firebase function:', data);

    } catch (error) {
      console.error('Error calling Firebase function:', error);
    }
  }

  return (
    <div className='min-h-screen flex items-start justify-center mt-4 w-full'>
      <div>
        <h1 className='text-xl font-bold w-full text-center'>Create Booking</h1>
        <Form onSubmit={createBooking} />
      </div>
    </div>
  );
}