"use server";
import { BookingForm } from "@/utils/lib/bookingType";;
import { createClient } from "@/utils/supabase/server";


export const createBooking = async (bookingForm: BookingForm) => {

  const supabase = createClient();
  let sesh = await supabase.auth.getSession()
  let token = sesh.data.session?.access_token;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/submit`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingForm)
    });
    const data = await response.json(); 
    const bookingId = data.bookingId;
    console.log('Response from Firebase function:', data);

  } catch (error) {
    console.error('Error calling Firebase function:', error);
  }
}