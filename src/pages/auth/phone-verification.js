import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiLock, FiArrowLeft } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

//internal import
import Layout from "@layout/Layout";
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";

const PhoneVerification = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get registration data from session storage
    const storedData = sessionStorage.getItem('phoneRegistrationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setRegistrationData(data);
    } else {
      // If no data, redirect back to signup
      router.replace('/auth/signup');
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
      const response = await CustomerServices.verifyPhoneCode({
        phone: registrationData.phone,
        code: verificationCode,
        name: registrationData.name,
        email: email, // Optional email for account
        password: registrationData.password,
      });

      notifySuccess("Account created successfully! You can now login.");
      
      // Clear session storage
      sessionStorage.removeItem('phoneRegistrationData');
      
      // Redirect to login
      router.replace('/auth/login');
    } catch (error) {
      notifyError(error?.response?.data?.message || "Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!registrationData?.phone) {
      notifyError("Phone number not found");
      return;
    }

    setLoading(true);
    try {
      await CustomerServices.verifyPhoneNumber({
        phone: registrationData.phone,
      });
      notifySuccess("Verification code resent to your phone!");
    } catch (error) {
      notifyError(error?.response?.data?.message || "Failed to resend code!");
    } finally {
      setLoading(false);
    }
  };

  if (!registrationData) {
    return (
      <Layout title="Phone Verification" description="Verify your phone number">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phone Verification" description="Verify your phone number">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto text-left justify-center rounded-md w-full max-w-lg px-4 py-8 sm:p-10 overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-2x">
              <div className="overflow-hidden mx-auto">
                <div className="text-center mb-6">
                  <button
                    onClick={() => router.back()}
                    className="absolute left-4 top-4 text-gray-600 hover:text-gray-800"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-3xl font-bold font-serif">Phone Verification</h2>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    Enter the 6-digit code sent to your phone
                  </p>
                  <p className="text-sm text-gray-600 mb-6">
                    {registrationData.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col justify-center mb-6">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                      <InputArea
                        label="Verification Code"
                        name="verificationCode"
                        type="text"
                        placeholder="123456"
                        Icon={FiLock}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>

                    <div className="form-group">
                      <InputArea
                        label="Email (Optional)"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Adding an email will help with account recovery
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={loading}
                        className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Resend Code
                      </button>
                    </div>

                    {loading ? (
                      <button
                        disabled={loading}
                        type="submit"
                        className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-emerald-600 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                      >
                        <img
                          src="/loader/spinner.gif"
                          alt="Loading"
                          width={20}
                          height={10}
                        />
                        <span className="font-serif ml-2 font-light">
                          Verifying...
                        </span>
                      </button>
                    ) : (
                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full text-center py-3 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all focus:outline-none my-1"
                      >
                        Verify & Create Account
                      </button>
                    )}
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code? Check your SMS or try resending.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PhoneVerification; 