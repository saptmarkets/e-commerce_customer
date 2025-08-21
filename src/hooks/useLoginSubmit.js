import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

//internal import
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { UserContext } from "@context/UserContext";
import { setToken, clearToken } from "@services/httpServices";
import { handleUserLogout } from "@lib/auth";

const useLoginSubmit = () => {
  const router = useRouter();
  const { dispatch } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ name, email, password, phone }) => {
    setLoading(true);
    try {
      if (router.pathname === "/auth/login") {
        // First get user data directly from API
        try {
          const userData = await CustomerServices.loginCustomer({
            email,
            password,
          });
          
          if (!userData || !userData.token) {
            setLoading(false);
            notifyError("Login failed! Invalid credentials.");
            return;
          }
          
          // Set token for API requests
          setToken(userData.token);
          
          // Save user info in cookies
          const userInfo = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            token: userData.token,
            address: userData.address,
            phone: userData.phone,
            image: userData.image
          };
          
          Cookies.set("userInfo", JSON.stringify(userInfo), {
            expires: 7,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax"
          });
          
          // Update context
          dispatch({ type: "USER_LOGIN", payload: userInfo });
          
          notifySuccess("Login Successful!");
          
          // Small delay to ensure context is updated before redirect
          setTimeout(() => {
            // Handle redirect immediately without delay
            const redirectUrl = router.query.redirectUrl;
            console.log("Redirect URL from query:", redirectUrl);
            
            if (redirectUrl && redirectUrl !== "undefined") {
              // Remove leading slash if present to avoid double slashes
              const cleanRedirectUrl = redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl;
              console.log("Redirecting to:", `/${cleanRedirectUrl}`);
              
              // Use router.push instead of replace for more reliable navigation
              // Also add a fallback in case the redirect fails
              try {
                router.push(`/${cleanRedirectUrl}`);
              } catch (error) {
                console.error("Router redirect failed, using window.location:", error);
                window.location.href = `/${cleanRedirectUrl}`;
              }
            } else {
              console.log("No redirect URL, going to home");
              router.push("/");
            }
          }, 150); // Increased delay to ensure context update
          
          // Set loading to false after redirect is initiated
          setLoading(false);
          
        } catch (error) {
          console.error("Login error:", error);
          setLoading(false);
          notifyError(error?.response?.data?.message || "Invalid credentials");
          return;
        }
      } else if (router.pathname === "/auth/signup") {
        try {
          // Check if we have email or phone for verification
          if (email) {
            // Email verification flow
          await CustomerServices.verifyEmailAddress({
            name,
            email,
            password,
          });
          
            // Store registration data in session storage for the next step
            sessionStorage.setItem('emailRegistrationData', JSON.stringify({
              name,
              email,
              password
            }));
            
            notifySuccess("Verification code sent to your email!");
            router.replace("/auth/email-verification");
            setLoading(false);
          } else if (phone) {
            // Phone verification flow
            await CustomerServices.verifyPhoneNumber({
              phone,
            });
            
            // Store registration data in session storage for the next step
            sessionStorage.setItem('phoneRegistrationData', JSON.stringify({
              name,
              phone,
              password
            }));
            
            notifySuccess("Verification code sent to your phone!");
            router.replace("/auth/phone-verification");
            setLoading(false);
          } else {
          setLoading(false);
            notifyError("Please provide either email or phone number!");
          }
        } catch (error) {
          setLoading(false);
          notifyError(error?.response?.data?.message || "Registration failed!");
        }
      }
    } catch (err) {
      setLoading(false);
      notifyError(err?.response?.data?.message || err?.message || "Something went wrong!");
    }
  };

  const handleLogout = async () => {
    try {
      notifySuccess("Logging out...");
      
      // Use the centralized logout handler
      await handleUserLogout(dispatch, signOut, true);
    } catch (err) {
      console.error("Logout error:", err);
      // Ensure we still redirect even if there's an error
      window.location.href = "/auth/login";
    }
  };

  return {
    handleSubmit,
    submitHandler,
    handleLogout,
    register,
    errors,
    loading,
  };
};

export default useLoginSubmit; 