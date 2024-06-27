import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/router";
import ProtectedLayout from "src/layouts/ProtectedLayout";

const ProtectedPage = () => {
    const router = useRouter();
    return (
        <ProtectedLayout>
            <div>
                <h1>Protected Page</h1>
                <p>This content is protected and only visible to authenticated users.</p>
                {/* // log out button */}
                <button
                    onClick={() => {
                        supabase.auth.signOut();
                        router.push("/");
                    }}
                >
          Log out</button>
            </div>
        </ProtectedLayout>

    );
};

export default ProtectedPage;
