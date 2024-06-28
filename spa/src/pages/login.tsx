import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Login = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const sendOTP = async () => {
    setErrorMessage(null);
    let phoneToSend: string = phone;
    if (!phoneToSend.startsWith("+")) {
      phoneToSend = "+91" + phoneToSend;
    }
    phoneToSend = phoneToSend.replace(/\s/g, "");
    console.log(phoneToSend);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneToSend
    })
    if (error) {
      console.log(error);
      setErrorMessage("Could not authenticate user");
    } else {
      console.log(data);
    }
  };

  const confirmOTP = async () => {
    let phoneToSend: string = phone;

    if (!phoneToSend.startsWith("+")) {
      phoneToSend = "+91" + phoneToSend;
    }
    phoneToSend = phoneToSend.replace(/\s/g, "");
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: phoneToSend,
      token: otp,
      type: 'sms',
    })

    // console.log(session)

    if (error) {
      setErrorMessage("Could not authenticate user");
    } else {
      console.log(session);
    }
    return router.push("/protected/logs");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md" htmlFor="email">
          Phone Number
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="phone"
          placeholder="+919841293731"
          required
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            sendOTP();
          }}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Send OTP
        </button>
        <label className="text-md" htmlFor="password">
          OTP
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="otp"
          placeholder="••••••••"
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            confirmOTP();
          }}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Login
        </button>
        {errorMessage && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
};
Login.useNoLayout = true;
export default Login;
