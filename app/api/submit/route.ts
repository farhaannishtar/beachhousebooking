
import { JwtPayload, query, verifyToken } from "@/utils/lib/helper";
import { BookingForm } from "@/utils/lib/bookingType";
import { mutateBookingState } from "@/utils/lib/booking";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'


export async function POST(request: NextRequest) {  
    const header = headers().get('authorization');
    if (!header) {
      return new NextResponse('No token provided'), {
        status: 401,
      };
    }

    const bearer = header.split(' ');
    const token = bearer[1];

    const verifiedToken = verifyToken(token);

    if (verifiedToken == "Invalid token") { 
      return new NextResponse('Invalid token'), {
        status: 403,
      };
    }
    console.log("😈😈😈")  
    const payload = (verifiedToken as JwtPayload)
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