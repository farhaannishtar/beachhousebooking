"use client"
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export interface StatsState {
    filter: {
        month: "June" | "July",
        employee: "Prabhu" | "Yasmeen" | "Rafica" | "Nusrath" | null  
        referral: "Google" | "Instagram" | null
    }
    rawReservationsResponse: string,
    rawCheckinsResponse: string
}

const monthConvert = {"June": 6, "July": 7}

export default function StatsView() {
    const supabase = createClient();
    
    useEffect(() => {
        supabase.rpc('get_booking_stats', {month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral}).then(({data, error}) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState( (prevState) => {
                return {
                    ...prevState,
                    rawReservationsResponse: JSON.stringify(data)
                }
            })
        })

        supabase.rpc('get_checkin_stats', {month: monthConvert[formState.filter.month], year: 2024, employee: formState.filter.employee, referral: formState.filter.referral}).then(({data, error}) => {
            if (error) {
                console.log("error ", error);
            }
            setFormState( (prevState) => {
                return {
                    ...prevState,
                    rawCheckinsResponse: JSON.stringify(data)
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
            rawReservationsResponse: "",
            rawCheckinsResponse: ""
        });
  return (
    <div>
        Hello {formState.rawReservationsResponse}
        World {formState.rawCheckinsResponse}
    </div>
  );
}