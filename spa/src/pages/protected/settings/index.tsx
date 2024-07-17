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
    <div className='flex flex-col gap-5 !select-none'>
      <div className='flex items-center h-[72px]'>
        <h1 className='text-lg font-bold leading-6 w-full text-center'>Settings</h1>
        <span className="material-symbols-filled text-2xl cursor-pointer" onClick={signOut}>logout</span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h3 className="subheading">Username :</h3>
          <h3 className="label_text text-selectedButton">{user.user_metadata.display_name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="subheading">Phone : </h3>
          <h3 className="label_text text-selectedButton">{user.phone}</h3>
        </div>
        <LoadingButton
          className=" border-[1px] border-typo_dark-300 text-typo_dark-300 my-4 w-full py-2 px-4 rounded-xl"

          onClick={
            signOut
          } >Logout</LoadingButton>
      </div>
    </div>
  );
}