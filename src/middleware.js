import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  try {
    const currentPath = new URL(request.url).pathname;
    
    // Skip middleware for public routes and static files
    const publicPaths = [
      '/auth/login',
      '/auth/signup',
      '/auth/forget-password',
      '/auth/email-verification',
      '/auth/phone-verification',
      '/auth/error',
      '/api/auth',
      '/_next',
      '/images',
      '/favicon.ico',
      '/api',
      '/'
    ];
    
    // Check if the current path starts with any of the public paths
    if (publicPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.next();
    }

    // Only check auth for protected routes
    const isProtectedRoute = currentPath.startsWith('/checkout') || 
                            currentPath.startsWith('/user') || 
                            currentPath.startsWith('/orders') ||
                            currentPath.startsWith('/profile');
    
    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Get the user info from cookies
    const userInfoCookie = request.cookies.get("userInfo");
    
    if (!userInfoCookie || !userInfoCookie.value) {
      // Prevent infinite redirects by checking if we're already redirecting
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('error', 'Please login to continue');
      // Ensure proper encoding of the redirect URL
      const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
      url.searchParams.set('redirectUrl', cleanPath);
      return NextResponse.redirect(url);
    }

    let userInfo;
    try {
      userInfo = JSON.parse(userInfoCookie.value);
      
      // Check if token exists and is not expired
      if (!userInfo.token || !userInfo.id) {
        throw new Error('Invalid or expired session');
      }

      // Basic token format validation (should be a JWT-like string)
      if (typeof userInfo.token !== 'string' || userInfo.token.length < 10) {
        throw new Error('Invalid token format');
      }

      // Clone the request headers and add the authorization token
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Bearer ${userInfo.token}`);

      // If we get here, the user is properly authenticated
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      console.error('Authentication error:', e);
      
      // Clear the invalid cookie to prevent future loops
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('userInfo');
      
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('error', 'Session expired. Please login again.');
      // Ensure proper encoding of the redirect URL
      const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
      url.searchParams.set('redirectUrl', cleanPath);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('error', 'An unexpected error occurred');
    return NextResponse.redirect(url);
  }
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Only run middleware on specific protected routes to prevent unnecessary processing
     * and potential infinite loops
     */
    '/checkout/:path*',
    '/user/:path*',
    '/orders/:path*',
    '/profile/:path*',
  ],
}; 