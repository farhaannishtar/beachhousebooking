import { BookingForm } from "@/utils/lib/bookingType";
import { supabase } from "@/utils/supabase/client";
;

export const createBooking = async (bookingForm: BookingForm) => {
  console.log('Creating booking: ', bookingForm)
  let sesh = await supabase.auth.getSession()
  let token = sesh.data.session?.access_token;
  let bookingId: string | null = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const body = JSON.stringify(bookingForm);
    const response = await fetch(`${apiUrl}/api/booking`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: body
    });
    const data = await response.json();
    bookingId = data.bookingId;
    console.log('Response from POST function:', data);
    if (data.error) {
      return Promise.reject({ msg: data.message, error: true })
    }
    return bookingId;

  } catch (error) {
    console.error('Error calling POST function:', error);

  }
  return bookingId;
}

export const deleteBooking = async (bookingId: number) => {
  console.log('Deleting booking id: ', bookingId)
  let sesh = await supabase.auth.getSession()
  let token = sesh.data.session?.access_token;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/booking`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId })
    });
    console.log('Deleted id: ', bookingId);

  } catch (error) {
    console.error('Error calling GET function:', error);
  }
}