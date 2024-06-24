import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    let phone = formData.get("phone") as string;
    if (!phone.startsWith("+")) {
      phone = "+91" + phone;
    }
    phone = phone.replace(/\s/g, "");
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone
    })
    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }
  };

  const signUp = async (formData: FormData) => {
    "use server";
    let phone = formData.get("phone") as string;
    const otp = formData.get("otp") as string;

    if (!phone.startsWith("+")) {
      phone = "+91" + phone;
    }
    phone = phone.replace(/\s/g, "");
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: 'sms',
    })

    // console.log(session)

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/protected");
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
        />
        <SubmitButton
          formAction={signIn}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
          pendingText="Sending OTP..."
        >
          Send OTP
        </SubmitButton>
        <label className="text-md" htmlFor="password">
          OTP
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="otp"
          placeholder="••••••••"
        />
        <SubmitButton
          formAction={signUp}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
          pendingText="Logging In..."
        >
          Login
        </SubmitButton>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
