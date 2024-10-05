import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const currentPath = usePathname();
  return (
    <nav className=" h-[4.5rem] px-4 py-2 flex border-t-[1px] border-typo_light-100 items-center bottom-0 bg-white mt-8 sticky">
      <Link href="/protected/booking/list" className="flex flex-col flex-1 gap-2 justify-between items-center group ">
        <span className={`${currentPath?.includes('/protected/booking') ? '!text-selectedButton' : ''} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}>calendar_month</span>
        <h4 className={`${currentPath?.includes('/protected/booking') ? '!text-selectedButton' : ''} small-text text-link group-hover:!text-selectedButton`}>Booking</h4>
      </Link>
      <Link href="/protected/logs" className="flex flex-col flex-1 gap-2 justify-between items-center group">
        <span className={`${currentPath?.includes('/protected/logs') ? '!text-selectedButton' : ''} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}>update</span>
        <h4 className={`${currentPath?.includes('/protected/logs') ? '!text-selectedButton' : ''} small-text text-link group-hover:!text-selectedButton`}>Logs</h4>
      </Link>
      <Link href="/protected/fullCalendar" className="flex flex-col flex-1 gap-2 justify-between items-center group">
        <span className={`${currentPath?.includes('/protected/fullCalendar') ? '!text-selectedButton' : ''} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}>event</span>
        <h4 className={`${currentPath?.includes('/protected/fullCalendar') ? '!text-selectedButton' : ''} small-text text-link group-hover:!text-selectedButton`}>Calendar</h4>
      </Link>
      <Link href="/protected/settings" className="flex flex-col flex-1 gap-2 justify-between items-center group">
        <span className={`${currentPath?.includes('/protected/settings') ? '!text-selectedButton' : ''} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}>settings</span>
        <h4 className={`${currentPath?.includes('/protected/settings') ? '!text-selectedButton' : ''} small-text text-link group-hover:!text-selectedButton`}>Settings</h4>
      </Link>
    </nav>
  );
}