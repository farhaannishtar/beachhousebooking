import ListLogs from "@/components/ListLogs";
import ListLogsDesktop from "@/components/desktop/ListLogs.desktop";

const Logs = () => {



  return (
    <div className="h-full laptop-up:h-[calc(100%-96px)] flex items-start justify-center  w-full ">
      <ListLogs className="laptop-up:hidden" />
      <ListLogsDesktop className="tablet-down:hidden" />
    </div>
  );
}
export default Logs 