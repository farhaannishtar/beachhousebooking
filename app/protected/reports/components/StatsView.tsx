"use client"
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export interface StatsState {
    filter: {
        month: "June" | "July",
        employee: "Prabhu" | "Yasmeen" | "Rafica" | "Nusrath" | null  
        referral: "Google" | "Instagram" | null
    }
    rawResponse: string
}

const monthConvert = {"June": 6, "July": 7}

export default function StatsView() {
    const supabase = createClient();
    
    useEffect(() => {
        supabase.rpc('get_booking_stats2', {month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral}).then(({data, error}) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState( (prevState) => {
                return {
                    ...prevState,
                    rawResponse: JSON.stringify(data)
                }
            })
        })
    }, []);
    const [formState, setFormState] = useState<StatsState>(
        {
            filter: {
                month: "June",
                employee: null,
                referral: null
            },
            rawResponse: ""
        });
  return (
    <div>
        Hello {formState.rawResponse}
    </div>
  );
}