
import { JwtPayload, query, verifyToken } from "@/utils/lib/helper";
import { BookingForm } from "@/utils/lib/bookingType";
import { deleteBooking, mutateBookingState } from "@/utils/lib/booking";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'
import { verifyAndGetPayload } from "@/utils/lib/auth";


export async function POST(request: NextRequest) {  
  console.log('Post request')
    const payload = verifyAndGetPayload(request)
    if (payload instanceof NextResponse) {
      return payload;
    }
    let booking: BookingForm = await request.json()
    let bookingId = await mutateBookingState(booking, payload.email)
    try {
      return new NextResponse(JSON.stringify({bookingId: bookingId}), {
        status: 200,
      });
    } catch (error) {
      return new NextResponse('Error'), {
        status: 500,
      };
    }
}


export async function DELETE(request: NextRequest) {  
  console.log('Delete request')
  const payload = verifyAndGetPayload(request)
  if (payload instanceof NextResponse) {
    return payload;
  }
  let {bookingId} = await request.json()
  console.log('Booking id: ', bookingId)
  await deleteBooking(bookingId)
  try {
    return new NextResponse(JSON.stringify({bookingId: bookingId}), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse('Error'), {
      status: 500,
    };
  }
}