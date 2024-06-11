import { JwtPayload, query, verifyToken } from "@/utils/lib/helper";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'


export function verifyAndGetPayload(request: NextRequest): NextResponse<unknown> | JwtPayload {
    const header = headers().get('authorization');
    if (!header) {
      return new NextResponse('No token provided', {
        status: 401,
      });
    }

    const bearer = header.split(' ');
    const token = bearer[1];

    const verifiedToken = verifyToken(token);

    if (verifiedToken == "Invalid token") { 
      return new NextResponse('Invalid token', {
        status: 403,
      });
    }
    return verifiedToken as JwtPayload;
}