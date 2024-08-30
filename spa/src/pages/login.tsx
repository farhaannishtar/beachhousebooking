import LoadingButton from '@/components/ui/LoadingButton';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Login = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [reSendWaitingSeconds, setReSendWaitingSeconds] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (reSendWaitingSeconds > 0 && reSendWaitingSeconds <= 30) {
      interval = setInterval(() => {
        setReSendWaitingSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (reSendWaitingSeconds === 0) {
      clearInterval(interval!);

    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reSendWaitingSeconds]);

  const router = useRouter();
  const sendOTP = async () => {
    setLoading(true);
    setErrorMessage(null);
    let phoneToSend: string = phone;

    if (!phoneToSend.startsWith("+")) {
      phoneToSend = "+91" + phoneToSend;
    }
    phoneToSend = phoneToSend.replace(/\s/g, "");

    console.log(phoneToSend);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneToSend,
    });

    if (error) {
      console.log(error);
      setErrorMessage("Could not authenticate user");
    } else {
      console.log(data);
      setReSendWaitingSeconds(30); // Start the resend countdown
    }
    setLoading(false);
  };

  const confirmOTP = async () => {
    setLoading(true)
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
    setLoading(false)
    return router.push("/protected/logs");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md label-text font-semibold" htmlFor="email">
          Phone Number
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-4"
          name="phone"
          placeholder="+919841293731"
          required
          onChange={(e) => setPhone(e.target.value)}
        />
        <LoadingButton
          loading={loading}
          disabled={!!reSendWaitingSeconds}
          onClick={(e) => {
            e.preventDefault();
            sendOTP();
          }}
          className="bg-green-700 rounded-md px-4 py-2 text-white "
        >
          Send OTP
        </LoadingButton>
        <span className={`${reSendWaitingSeconds ? 'visible' : 'invisible'} text-xs `}>Resend again OTP in <strong className='text-green-700 !font-semibold'>{reSendWaitingSeconds} seconds</strong></span>
        <label className="text-md label-text font-semibold" htmlFor="password">
          OTP
        </label>
        <input
          className={`${otp && otp.length < 7 ? 'border-green-700' : ''}${otp && otp.length >= 7 ? 'border-error' : ''} rounded-md px-4 py-2 bg-inherit border mb-6`}
          name="otp"
          placeholder="••••••••"
          type='number'
          onChange={(e) => setOtp(e.target.value)}
        />
        <LoadingButton
          loading={loading}
          onClick={(e) => {
            e.preventDefault();
            confirmOTP();
          }}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground"
        >
          Login
        </LoadingButton>
        <span className={`${errorMessage ? 'visible' : 'invisible'} text-xs text-error`}>{errorMessage}</span>
      </form>
    </div>
  );
};
Login.useNoLayout = true;
export default Login;
