"use client";

import {
  BookingDB,
  Property,
  convertDateToIndianDate,
  convertPropertiesForDb,
  createDateFromIndianDate,
  numOfDays,
  organizedByStartDate,
  parseProperties,
} from "@/utils/lib/bookingType";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import format from "date-fns/format";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase/client";
import SearchInput from "../ui/SearchInput";
import BookingFilterDesktop, { Filter } from "./BookingFilter.desktop";
import LoadingButton from "../ui/LoadingButton";
import { useSearchParams } from "next/navigation";
import eventEmitter from "@/utils/eventEmitter";

// interface BookingProps {
//   bookingsFromParent: BookingDB[];
// }

interface ListBookingsState {
  searchText: string | null;
  date: Date | null;
  dbBookings: BookingDB[];
  organizedByStartDate: { [key: string]: BookingDB[] };
}
interface ListBookingProps {
  className?: string;
}
let numOfBookingsForward = 7;
let numOfBookingsBackward = 0;
export default function ListBooking({ className }: ListBookingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = router.query;
  const latestRequestRef = useRef<number>(0);
  const filterBlockRef = useRef<any>(null);
  const [state, setState] = useState<ListBookingsState>({
    searchText: null,
    date: null,
    dbBookings: [],
    organizedByStartDate: {},
  });

  const [filterState, setFilterState] = useState<Filter>({
    checkIn: null,
    properties: null,
    starred: null,
    paymentPending: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingForward, setLoadingForward] = useState<boolean>(false);
  const [loadingBackward, setLoadingBackward] = useState<boolean>(false);
  const forwardLoaderRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true); // Indicates if more items can be loaded
  useEffect(() => {
    // Subscribe to the layout button click event
    eventEmitter.on("filterBtnClicked", toggleFilterDisplay);
    eventEmitter.on("searchTextChanged", handleChangeSearch);

    // Cleanup subscription on unmount
    return () => {
      eventEmitter.off("filterBtnClicked", toggleFilterDisplay);
      eventEmitter.off("searchTextChanged", handleChangeSearch);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingForward && hasMore) {
          numOfBookingsForward = numOfBookingsForward + 7;
          setLoadingForward(true);
          fetchData(filterState);
        }
      },
      { threshold: 1.0 }
    );

    if (forwardLoaderRef.current) {
      observer.observe(forwardLoaderRef.current);
    }

    return () => {
      if (forwardLoaderRef.current) {
        observer.unobserve(forwardLoaderRef.current);
      }
    };
  }, [loadingForward]);
  async function fetchData(filters: Filter, searchText?: string) {
    const requestId = new Date().getTime();
    latestRequestRef.current = requestId;
    setLoading(true);
    setLoadingForward(true);
    setLoadingBackward(true);
    setHasMore(false);
    let bookingsData = supabase.from("bookings").select();
    let oldBookingsData = supabase.from("bookings").select();

    if (searchText) {
      bookingsData = bookingsData.or(
        `client_name.ilike.%${searchText}%,client_phone_number.ilike.%${searchText}%`
      );
      //empty oldBookingsData
      oldBookingsData = oldBookingsData.eq(
        "check_in",
        convertDateToIndianDate({ date: new Date("2122-05-20") })
      );
    } else if (
      filters.checkIn ||
      filters.properties ||
      filters.starred ||
      filters.paymentPending
    ) {
      //empty oldBookingsData
      oldBookingsData = oldBookingsData.eq(
        "check_in",
        convertDateToIndianDate({ date: new Date("2122-05-20") })
      );
      if (filters.checkIn) {
        console.log("Filtering by checkIn: ", filters.checkIn);
        bookingsData = bookingsData
          .gte(
            "check_in",
            convertDateToIndianDate({ date: new Date(filters.checkIn) })
          )
          .lte(
            "check_in",
            convertDateToIndianDate({
              date: new Date(filters.checkIn),
              addDays: 1,
            })
          );
      }
      if (filters.properties) {
        bookingsData = bookingsData.contains(
          "properties",
          convertPropertiesForDb(filters.properties)
        );
      }
      if (filters.starred) {
        bookingsData = bookingsData.eq("starred", filters.starred);
      }
      if (filters.paymentPending) {
        bookingsData = bookingsData.gt("outstanding", 0);
      }
    } else {
      bookingsData = bookingsData.gte(
        "check_in",
        new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
      );
      oldBookingsData = oldBookingsData.lte(
        "check_in",
        new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
      );
    }

    let bookingsDataBackward = oldBookingsData
      .eq("status", "confirmed")
      .order("check_in", { ascending: false })
      .range(0, numOfBookingsBackward);
    let bookingsDataForward = bookingsData
      .eq("status", "confirmed")
      .order("check_in", { ascending: true })
      .range(0, numOfBookingsForward);
    console.log(
      requestId,
      " of ",
      filters,
      " request id :",
      latestRequestRef.current
    );

    try {
      let [backwardResults, forwardResults] = await Promise.all([
        bookingsDataBackward,
        bookingsDataForward,
      ]);

      // Check if this is the latest request
      if (latestRequestRef.current !== requestId) return;
      console.log(requestId, "Backward Results:", backwardResults.data);
      console.log(requestId, "Forward Results:", forwardResults.data);

      let bookings: BookingDB[] = [];
      for (const booking of backwardResults.data ?? []) {
        const lastIndex = booking.json.length - 1;
        const lastBooking = booking.json[lastIndex];
        bookings.unshift({
          ...lastBooking,
          bookingId: booking.id,
        });
      }
      for (const booking of forwardResults.data ?? []) {
        const lastIndex = booking.json.length - 1;
        const lastBooking = booking.json[lastIndex];
        bookings.push({
          ...lastBooking,
          bookingId: booking.id,
        });
      }

      console.log("Combined Bookings:", bookings);

      setState((prevState) => ({
        ...prevState,
        dbBookings: bookings,
        organizedByStartDate: organizedByStartDate(bookings),
      }));

      setTimeout(() => {
        if (query.id) {
          document
            .getElementById(query.id.toString() + "-id")
            ?.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
      if (
        bookings.length < numOfBookingsBackward ||
        bookings.length < numOfBookingsForward
      ) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
      setLoadingBackward(false);
      setLoadingForward(false);
      setFilterModalOpened(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }

  //check if filterState is empty
  const checkEmptyFilterState = (): boolean => {
    // Use Object.values to get an array of values from the filterState object
    const values = Object.values(filterState);
    console.log(
      { checkEmptyFilterState: values },
      values.some((value) => !value)
    );

    // Check if there is at least one non-null and non-undefined value
    return values.some((value) => value);
  };
  //Refresh page queries
  const refreshPageQueries = () => {
    function removeNullProperties(filter: Filter): Filter {
      const newFilter: Partial<Filter> = {};

      (Object.keys(filter) as (keyof Filter)[]).forEach((key) => {
        const value = filter[key];
        if (value) {
          newFilter[key] = value as any; // Use type assertion to handle mixed types
        }
      });

      return newFilter as Filter;
    }

    const cleanedFilterState = removeNullProperties(filterState);

    router.push(
      {
        query: { ...cleanedFilterState },
      },
      undefined,
      { shallow: true }
    );
  };
  //Watch router query
  useEffect(() => {
    if (Object.entries(query).length == 0) {
      fetchData({
        checkIn: null,
        properties: null,
        starred: null,
        paymentPending: null,
      });
      return;
    }
    console.log("query changed: ", query);

    const { searchText, checkIn, properties, starred, paymentPending } = query;
    if (searchText) {
      setState((prevState) => ({
        ...prevState,
        searchText: searchText ? searchText.toString() : null,
        filter: {
          checkIn: checkIn || null,
          properties: properties || null,
          starred: starred || null,
          paymentPending: paymentPending || null,
        },
      }));
      eventEmitter.emit("searchTextChangedFromChild", {
        target: {
          name: "searchText",
          value: searchText ? searchText.toString() : null,
        },
      });
    }
    setFilterState({
      checkIn: checkIn ? checkIn.toString() : null,
      properties: properties ? parseProperties(properties?.toString()) : null,
      starred: !!starred,
      paymentPending: !!paymentPending || null,
    });
    fetchData(
      {
        checkIn: checkIn ? checkIn.toString() : null,
        properties: properties ? parseProperties(properties?.toString()) : null,
        starred: !!starred,
        paymentPending: !!paymentPending || null,
      },
      searchText ? searchText.toString() : undefined
    );
  }, [query]);

  // useEffect(() => {
  //   if (state.searchText == null) return;
  //   console.log("Search text has changed:", state);

  //   //fetchData(filterState);
  // }, [state.searchText]);

  const handleChangeSearch = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      searchText: value.length > 0 ? value : "",
    }));
    let pageQuery: {
      searchText?: string;
    };
    pageQuery = { ...query, searchText: value };
    if (!value) {
      delete pageQuery.searchText;
    }

    router.push(
      {
        query: { ...pageQuery },
      },
      undefined,
      { shallow: true }
    );
  };

  const dates = (): string[] => {
    return Object.keys(state.organizedByStartDate).sort((a, b) => {
      if (a == "Invalid Date") return 1;
      if (b == "Invalid Date") return -1;
      return (
        createDateFromIndianDate(a).getTime() -
        createDateFromIndianDate(b).getTime()
      );
    });
  };

  const convertDate = (date: string) => {
    if (new Date(date).toDateString() === new Date().toDateString()) {
      return "Today";
    } else if (
      new Date(date).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
    ) {
      return "Yesterday";
    } else if (
      new Date(date).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()
    ) {
      return "Tomorrow";
    } else {
      return date;
    }
  };
  //Filter modal
  const [filterModalOpened, setFilterModalOpened] = useState<boolean>(false);
  const toggleFilterDisplay = (e?: boolean) => {
    setFilterModalOpened(typeof e == "boolean" ? e : !filterModalOpened);
  };
  //Print return to link
  const redirectToBookingId = (bookingId?: number) => {
    let pageQuery = {};
    if (state.searchText) {
      pageQuery = { ...pageQuery, searchText: state.searchText };
    } else if (
      filterState.checkIn ||
      filterState.properties ||
      filterState.starred ||
      filterState.paymentPending
    ) {
      //empty oldBookingsData

      if (filterState.checkIn) {
        pageQuery = { ...pageQuery, checkIn: filterState.checkIn };
      }
      if (filterState.properties) {
        pageQuery = {
          ...pageQuery,
          properties: filterState.properties,
        };
      }
      if (filterState.starred) {
        pageQuery = { ...pageQuery, starred: filterState.starred };
      }
      if (filterState.paymentPending) {
        pageQuery = {
          ...pageQuery,
          paymentPending: filterState.paymentPending,
        };
      }
    } else {
      pageQuery = {};
    }
    router.push(
      {
        pathname: `/protected/booking/${bookingId}`,
        query: { returnTo: "/protected/booking/list", ...pageQuery },
      },
      undefined,
      { shallow: true }
    );
  };
  // **********************************************************************************************************************************************************************
  // *************************************************************************Html template********************************************************************************
  // **********************************************************************************************************************************************************************
  return (
    <div className={"w-full px-10 pb-4 " + className}>
      {/* Filters */}
      <BookingFilterDesktop
        isFiltersOpened={filterModalOpened}
        toggleFilterDisplay={toggleFilterDisplay}
        filtersFor="Bookings"
        filterState={filterState}
        setFilterState={setFilterState}
        loading={loading}
        applyFilters={() => refreshPageQueries()}
        ref={filterBlockRef}
      />
      {/* Show filters if exists */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {filterState.checkIn && (
          <div className="flex gap-4 items-center rounded-xl border-[1px] border-typo_dark-300 px-4 py-1">
            <label className="label_text ">
              {" "}
              {format(new Date(filterState.checkIn), "iii LLL d")}
            </label>
            <span
              className=" material-symbols-outlined cursor-pointer "
              onClick={() => {
                filterBlockRef.current.handleDateChange("checkIn", null);
                setTimeout(() => {
                  filterBlockRef.current.applyFilters();
                }, 200);
              }}
            >
              close
            </span>
          </div>
        )}
        {filterState.properties &&
          filterState.properties.map((p, index) => {
            return (
              <div
                key={index}
                className="flex gap-4 items-center rounded-xl border-[1px] border-typo_dark-300 px-4 py-1"
              >
                <label className="label_text "> {p}</label>
                <span
                  className=" material-symbols-outlined cursor-pointer "
                  onClick={() => {
                    const clearedProperties = filterState.properties
                      ? filterState.properties.filter((proprety) => {
                        return proprety !== p;
                      })
                      : [];
                    setFilterState((prevState) => ({
                      ...prevState,
                      properties: clearedProperties.length
                        ? [...clearedProperties]
                        : null,
                    }));
                    setTimeout(() => {
                      filterBlockRef.current.applyFilters();
                    }, 200);
                  }}
                >
                  close
                </span>
              </div>
            );
          })}
        {filterState.paymentPending && (
          <div className="flex gap-4 items-center rounded-xl border-[1px] border-typo_dark-300 px-4 py-1">
            <label className="label_text "> Payment pending</label>
            <span
              className=" material-symbols-outlined cursor-pointer "
              onClick={() => {
                filterBlockRef.current.handleDateChange("paymentPending", null);
                setTimeout(() => {
                  filterBlockRef.current.applyFilters();
                }, 200);
              }}
            >
              close
            </span>
          </div>
        )}
        {filterState.starred && (
          <div className="flex gap-4 items-center rounded-xl border-[1px] border-typo_dark-300 px-4 py-1">
            <label className="label_text "> Starred</label>
            <span
              className=" material-symbols-outlined cursor-pointer "
              onClick={() => {
                filterBlockRef.current.handleDateChange("starred", null);
                setTimeout(() => {
                  filterBlockRef.current.applyFilters();
                }, 200);
              }}
            >
              close
            </span>
          </div>
        )}
        {(filterState.checkIn ||
          filterState.properties?.length ||
          filterState.paymentPending ||
          filterState.starred) && (
            <div
              onClick={() => {
                setFilterState({
                  checkIn: null,
                  properties: null,
                  starred: null,
                  paymentPending: null,
                });
                setTimeout(() => {
                  filterBlockRef.current.applyFilters();
                }, 200);
              }}
              className="flex gap-4 items-center rounded-xl border-[1px] border-typo_dark-300 px-4 py-1 cursor-pointer"
            >
              <label className="label_text "> Clear All</label>
              <span className=" material-symbols-outlined  ">
                filter_list_off
              </span>
            </div>
          )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <LoadingButton
          className=" border-[1px] border-selectedButton text-selectedButton my-4  py-3 px-4 w-64 rounded-lg h-12"
          loading={loadingBackward}
          onClick={() => {
            numOfBookingsBackward = numOfBookingsBackward + 7;
            setLoadingBackward(true);
            fetchData(filterState);
          }}
        >
          Load older data
        </LoadingButton>
        <button
          className="flex items-center gap-3 p-3 text-white bg-selectedButton rounded-lg text-sm h-12"
          onClick={() =>
            router.push(
              "/protected/booking/create?returnTo=/protected/booking/list"
            )
          }
        >
          <span className=" material-symbols-outlined cursor-pointer hover:text-selectedButton">
            add
          </span>
          <span>Create booking</span>
        </button>
      </div>
      {dates().map((date) => (
        <React.Fragment key={date}>
          <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6 ">
            {convertDate(date)}
          </p>
          <div className="flex flex-wrap gap-4 mt-3">
            {state.organizedByStartDate[date].map((booking, index) => (
              <div
                className="flex  justify-between w-[calc(25%-12px)] laptop-only:w-[calc(33%-12px)] max-w-72 bg-white p-4 shadow-[0_0_100px_0px_rgba(0,0,0,0.07)] rounded-xl cursor-pointer"
                key={booking.bookingId}
                id={`${booking.bookingId}-id`}
                onClick={() => redirectToBookingId(booking.bookingId)}
              >
                {/* Booking details */}
                <div className=" flex flex-col gap-0 w-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="flex items-center gap-1">
                        <span className="text-neutral-900 text-base  leading-6 font-semibold">
                          {booking.client.name}
                        </span>{" "}
                        {booking?.starred && (
                          <span className="material-symbols-filled text-xl">
                            star_rate
                          </span>
                        )}
                      </label>
                      <label className="text-neutral-900 text-sm font-normal leading-5">
                        {booking.status}
                      </label>
                    </div>
                    {/* Booking type */}
                    <div className="w-[69px] h-7 px-5 bg-gray-100 rounded-[5px] justify-center  inline-flex items-center">
                      <div className="w-11 label_text !font-semibold left-[20px] top-[6px] text-center text-sky-500 text-base  leading-normal">
                        {booking.bookingType}
                      </div>
                    </div>
                  </div>

                  <label className="text-selectedButton text-sm font-normal ">
                    {numOfDays(booking)} days, {booking.numberOfGuests} pax
                  </label>
                  {booking.properties?.length > 0 && (
                    <label className="text-slate-500 text-sm font-normal ">
                      {booking.properties.join(", ")}
                    </label>
                  )}
                  {booking.refferral && (
                    <label className="text-slate-500 text-sm font-normal ">
                      Referral: {booking.refferral}
                    </label>
                  )}
                  {
                    <div className="flex items-center gap-4 text-sm mt-3">
                      <label>
                        Rs{" "}
                        {booking.outstanding == 0
                          ? booking.paid.toLocaleString("en-IN")
                          : booking.outstanding.toLocaleString("en-IN")}
                      </label>
                      {booking.status == "Confirmed" && (
                        <div
                          className={`${booking.outstanding == 0 ? " bg-[#DEF8E0] text-[#09DC44]" : "bg-error/20 text-error"} px-[18px] rounded-[5px] py-1 font-semibold`}
                        >
                          {booking.outstanding == 0 ? "Paid" : "Unpaid"}
                        </div>
                      )}
                    </div>
                  }
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}
      {/* <LoadingButton
        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
        loading={loadingForward}
        onClick={() => {
          numOfBookingsForward = numOfBookingsForward + 7;
          setLoadingForward(true);
          fetchData(filterState);
        }}
      >
        Load More
      </LoadingButton> */}
      {/* Filter modal */}

      <div className="flex items-center justify-center">
        <div
          ref={forwardLoaderRef}
          className={`${loadingForward ? "loading" : ""}`}
        ></div>
      </div>
    </div>
  );
}
