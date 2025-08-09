import Link from "next/link";
import { FiLock, FiMail, FiUser, FiPhone } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";

//internal import
import Layout from "@layout/Layout";
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import useLoginSubmit from "@hooks/useLoginSubmit";
import BottomNavigation from "@components/login/BottomNavigation";

const SignUp = () => {
  const { t } = useTranslation('common');
  const { handleSubmit, submitHandler, register, errors, loading } =
    useLoginSubmit();
  const [verificationMethod, setVerificationMethod] = useState('email'); // 'email' or 'phone'

  // console.log("errors", errors);

  return (
    <Layout title={t('signingUp')} description={t('signingUp')}>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto text-left justify-center rounded-md w-full max-w-lg px-4 py-8 sm:p-10 overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-2x">
              <div className="overflow-hidden mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold font-serif">{t('signingUp')}</h2>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    {t('createAnAccount')}
                  </p>
                  
                  {/* Verification Method Toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('email')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          verificationMethod === 'email'
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <FiMail className="inline mr-2" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationMethod('phone')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          verificationMethod === 'phone'
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <FiPhone className="inline mr-2" />
                        Phone
                      </button>
                    </div>
                  </div>
                </div>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="flex flex-col justify-center mb-6"
                >
                  <div className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                      <InputArea
                        register={register}
                        label={t('name')}
                        name="name"
                        type="text"
                        placeholder={t('fullName')}
                        Icon={FiUser}
                      />
                      <Error errorName={errors.name} />
                    </div>

                    {verificationMethod === 'email' ? (
                    <div className="form-group">
                      <InputArea
                        register={register}
                        label={t('email')}
                        name="email"
                        type="email"
                        placeholder={t('email')}
                        Icon={FiMail}
                      />
                      <Error errorName={errors.email} />
                    </div>
                    ) : (
                      <div className="form-group">
                        <InputArea
                          register={register}
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          placeholder="966501234567"
                          Icon={FiPhone}
                        />
                        <Error errorName={errors.phone} />
                      </div>
                    )}
                    <div className="form-group">
                      <InputArea
                        register={register}
                        label={t('password')}
                        name="password"
                        type="password"
                        placeholder={t('password')}
                        Icon={FiLock}
                        pattern={
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
                        }
                        patternMessage={[
                          "1. Password must be at least 8 characters long.",
                          "2. Password must contain at least one uppercase letter.",
                          "3. Password must contain at least one lowercase letter.",
                          "4. Password must contain at least one number.",
                          "5. Password must contain at least one special character.",
                        ]}
                      />
                      <Error errorName={errors.password} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex ms-auto">
                        <Link
                          href="/auth/login"
                          className="text-end text-sm text-heading ps-3 underline hover:no-underline focus:outline-none"
                        >
                          {t('alreadyHaveAccount')}
                        </Link>
                      </div>
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
                          {t('processing')}
                        </span>
                      </button>
                    ) : (
                      <button
                        disabled={loading}
                        type="submit"
                        className="w-full text-center py-3 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all focus:outline-none my-1"
                      >
                        {t('register')}
                      </button>
                    )}
                  </div>
                </form>
                <BottomNavigation
                  desc
                  route={"/auth/login"}
                  pageName={"Login"}
                  loginTitle="Sign Up"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
