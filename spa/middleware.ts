import { supabase } from '@/utils/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // Get the user session from the request
    
    const user = (await supabase.auth.getUser()).data.user
  
    // Define the default redirect URLs
    const loginUrl = new URL('/login', request.url);
    const protectedUrl = new URL('/protected', request.url);
  
    // If the user is not authenticated, redirect to the login page
    if (!user) {
      return NextResponse.redirect(loginUrl);
    }
  
    // If the user is authenticated and trying to access the login page, redirect to the protected page
    if (user && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(protectedUrl);
    }
  
    // Allow access to protected routes if the user is authenticated
    if (user && request.nextUrl.pathname.startsWith('/protected')) {
      return NextResponse.next();
    }
  
    // Redirect authenticated users to the protected page by default
    if (user) {
      return NextResponse.redirect(protectedUrl);
    }
  
    return NextResponse.next();
  }

  
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
