import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiLock, FiArrowLeft, FiMail } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import InputArea from "@components/form/InputArea";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";

const EmailVerification = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      // Get registration data from session storage
      const storedData = sessionStorage.getItem('emailRegistrationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setRegistrationData(data);
      } else {
        // If no data, redirect back to signup
        setError('No registration data found. Please sign up again.');
        setTimeout(() => {
          router.replace('/auth/signup');
        }, 2000);
      }
    } catch (err) {
      console.error('Error loading registration data:', err);
      setError('Error loading registration data. Please sign up again.');
      setTimeout(() => {
        router.replace('/auth/signup');
      }, 2000);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      notifyError("Please enter a valid 6-digit verification code");
      return;
    }

    if (!registrationData) {
      notifyError("Registration data not found. Please try signing up again.");
      return;
    }

    setLoading(true);
    try {
      const response = await CustomerServices.verifyEmailCode({
        email: registrationData.email,
        code: verificationCode,
      });

      notifySuccess("Account created successfully! You can now login.");
      
      // Clear session storage
      sessionStorage.removeItem('emailRegistrationData');
      
      // Redirect to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('Verification error:', error);
      notifyError(error?.response?.data?.message || "Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!registrationData?.email) {
      notifyError("Email not found");
      return;
    }

    setLoading(true);
    try {
      await CustomerServices.verifyEmailAddress({
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
      });
      notifySuccess("Verification code resent to your email!");
    } catch (error) {
      console.error('Resend error:', error);
      notifyError(error?.response?.data?.message || "Failed to resend code!");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    router.push('/auth/signup');
  };

  // Show error state
  if (error) {
    return (
      <Layout title="Email Verification" description="Verify your email address">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <FiMail className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Error
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
              <div className="mt-4">
                <button
                  onClick={handleBackToSignup}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Back to Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show loading state
  if (!registrationData) {
    return (
      <Layout title="Email Verification" description="Verify your email address">
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Email Verification" description="Verify your email address">
      <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <FiMail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Verification
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a verification code to{" "}
              <span className="font-medium text-green-600">
                {registrationData.email}
              </span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <InputArea
                  id="verification-code"
                  name="verificationCode"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  icon={<FiLock />}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Resend Code"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToSignup}
                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-500"
              >
                <FiArrowLeft className="mr-1" />
                Back to Signup
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-green-600 hover:text-green-500 disabled:opacity-50"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailVerification; 