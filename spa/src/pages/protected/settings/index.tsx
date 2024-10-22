"use client"
import { useRouter } from "next/router";
import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from "react";
import LoadingButton from "@/components/ui/LoadingButton";



export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      let { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-5 !select-none laptop-up:px-10">
      <div className="flex items-center h-[72px]">
        <h1 className="text-lg font-bold leading-6 w-full text-center">
          Settings
        </h1>
        <span
          className="material-symbols-filled text-2xl cursor-pointer"
          onClick={signOut}
        >
          logout
        </span>
      </div>
      <div className="flex flex-col ">
        <div className="flex flex-col ">
          <h3 className="subheading !my-0">Username </h3>
          <h3 className="label_text text-link !my-0">
            {user.user_metadata.display_name}
          </h3>
          <hr className="!my-4 !border-[#BEBEBE]" />
        </div>
        <div className="flex flex-col ">
          <h3 className="subheading !my-0">Phone Number </h3>
          <h3 className="label_text text-link !my-0">{user.phone}</h3>
          <hr className="!my-4 !border-[#BEBEBE]" />
        </div>
        <LoadingButton
          className=" border-[1px] border-typo_light-200  text-typo_light-200  w-full py-2 px-4 rounded-lg mb-4"
          onClick={() => router.push("/protected/reports")}
        >
          <span className={` material-symbols-outlined text-typo_light-200 `}>
            auto_graph
          </span>

          <span>Reports</span>
        </LoadingButton>
        <LoadingButton
          className=" border-[1px] border-error text-error w-full py-2 px-4 rounded-lg"
          onClick={signOut}
        >
          Logout
        </LoadingButton>
      </div>
    </div>
  );
}