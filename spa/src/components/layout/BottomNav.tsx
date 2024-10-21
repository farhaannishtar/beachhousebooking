import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const currentPath = usePathname();
  return (
    <nav className=" h-[4.5rem] px-4 py-2 flex border-t-[1px] border-typo_light-100 items-center bottom-0 bg-white mt-8 sticky laptop-up:!top-0 laptop-up:h-full laptop-up:mt-0  laptop-up:block laptop-up:w-56  bottom-nav-shadow laptop-up:min-h-screen laptop-up:z-[60]">
      {/* desktop and laptop nav */}
      <div className="flex items-center justify-center gap-1 h-24 tablet-down:hidden">
        <img src="/logo.png" alt="logo" className="h-7 " />
        <h2 className="!m-0 title text-selectedButton">BEACHHOUSE</h2>
      </div>
      <Link
        href="/protected/booking/list"
        className={`flex flex-col flex-1 gap-2 justify-between items-center group laptop-up:h-14 laptop-up:flex-row laptop-up:w-full laptop-up:justify-start laptop-up:py-2 laptop-up:px-4 laptop-up:rounded-[10px] hover:no-underline ${currentPath?.includes("/protected/booking") ? " laptop-up:!bg-selectedButton !no-underline" : ""}`}
      >
        <span
          className={`${currentPath?.includes("/protected/booking") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}
        >
          calendar_month
        </span>
        <h4
          className={`${currentPath?.includes("/protected/booking") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} small-text text-link group-hover:!text-selectedButton`}
        >
          Booking
        </h4>
      </Link>
      <Link
        href="/protected/logs"
        className={`flex flex-col flex-1 gap-2 justify-between items-center group laptop-up:h-14 laptop-up:flex-row laptop-up:w-full laptop-up:justify-start laptop-up:py-2 laptop-up:px-4 laptop-up:rounded-[10px] hover:no-underline ${currentPath?.includes("/protected/logs") ? " laptop-up:!bg-selectedButton !no-underline" : ""}`}
      >
        <span
          className={`${currentPath?.includes("/protected/logs") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}
        >
          update
        </span>
        <h4
          className={`${currentPath?.includes("/protected/logs") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} small-text text-link group-hover:!text-selectedButton`}
        >
          Logs
        </h4>
      </Link>
      <Link
        href="/protected/fullCalendar"
        className={`flex flex-col flex-1 gap-2 justify-between items-center group laptop-up:h-14 laptop-up:flex-row laptop-up:w-full laptop-up:justify-start laptop-up:py-2 laptop-up:px-4 laptop-up:rounded-[10px] hover:no-underline ${currentPath?.includes("/protected/fullCalendar") ? " laptop-up:!bg-selectedButton !no-underline" : ""}`}
      >
        <span
          className={`${currentPath?.includes("/protected/fullCalendar") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}
        >
          event
        </span>
        <h4
          className={`${currentPath?.includes("/protected/fullCalendar") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} small-text text-link group-hover:!text-selectedButton`}
        >
          Calendar
        </h4>
      </Link>
      <Link
        href="/protected/settings"
        className={`flex flex-col flex-1 gap-2 justify-between items-center group laptop-up:h-14 laptop-up:flex-row laptop-up:w-full laptop-up:justify-start laptop-up:py-2 laptop-up:px-4 laptop-up:rounded-[10px] hover:no-underline ${currentPath?.includes("/protected/settings") ? " laptop-up:!bg-selectedButton !no-underline" : ""}`}
      >
        <span
          className={`${currentPath?.includes("/protected/settings") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} material-symbols-outlined text-typo_light-200 group-hover:!text-selectedButton`}
        >
          settings
        </span>
        <h4
          className={`${currentPath?.includes("/protected/settings") ? "tablet-down:!text-selectedButton  laptop-up:!text-white laptop-up:group-hover:!text-white " : ""} small-text text-link group-hover:!text-selectedButton`}
        >
          Settings
        </h4>
      </Link>
    </nav>
  );
}