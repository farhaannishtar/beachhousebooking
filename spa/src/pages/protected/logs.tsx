import ListLogs from "@/components/ListLogs";
import { useRouter } from "next/router";

const ProtectedPage = () => {
  const router = useRouter();
    return (
    <div className='h-full  w-full'>
        <ListLogs />
      </div>
    );
  };
  
  export default ProtectedPage;
  