import { BookingForm } from "@/utils/lib/bookingType";
import { supabase } from "@/utils/supabase/client";
;
export const monthConvertFromNumber: Record<number, string> = {
  1: "january",
  2: "february",
  3: "march",
  4: "april",
  5: "may",
  6: "june",
  7: "july",
  8: "august",
  9: "september",
  10: "october",
  11: "november",
  12: "december"
};
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
export const getDateAvailability = async (properties: string, month: number,year:number,bookingId?:number) => {
  let sesh = await supabase.auth.getSession()
  let token = sesh.data.session?.access_token;
  
  console.log('Fetching dates for propreties: ', properties,' month: ',month,' year : ',year);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; 
    const response = await fetch(`${apiUrl}/api/calendar?properties=${properties}&month=${monthConvertFromNumber[month]}&year=${year}${bookingId?'&bookingId='+bookingId:''}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      },

    });
    const data = await response.json();
   return data

  } catch (error) {
    console.error('Error calling GET function:', error);
  }
}