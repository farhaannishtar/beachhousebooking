"use client";
import {
  BookingDB,
  Property,
  convertDateToIndianDate,
  convertPropertiesForDb,
  printInIndianTime,
  numOfDays,
  organizedByCreatedDate,
  parseProperties,
  parseCreatedBy,
  parseStatus,
} from "@/utils/lib/bookingType";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import { useRouter } from "next/router";

import SearchInput from "./ui/SearchInput";
import LoadingButton from "./ui/LoadingButton";
import DateTimePickerInput from "./DateTimePickerInput/DateTimePickerInput";
import Properties from "./Properties";
import { supabase } from "@/utils/supabase/client";
import BookingFilter, { Filter } from "./BookingFilter";

export interface ListLogsState {
  searchText: string | null;
  date: Date | null;
  dbBookings: BookingDB[];
}

let numOfBookings = 7;

export default function ListLogs() {
  const router = useRouter();
  const query = router.query;
  const latestRequestRef = useRef<number>(0);

  //Scroll smoothely to page section

  const [state, setState] = useState<ListLogsState>({
    searchText: null,
    date: null,
    dbBookings: [],
  });

  const [filterState, setFilterState] = useState<Filter>({
    status: null,
    createdTime: null,
    properties: [],
    starred: null,
    paymentPending: null,
    createdBy: null,
  });

  //Loading data
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingForward, setLoadingForward] = useState<boolean>(false);
  async function fetchData(filters: Filter, searchText?: string) {
    setLoading(true);
    setLoadingForward(true);

    const requestId = new Date().getTime();
    latestRequestRef.current = requestId;
    let bookingsData = supabase.from("bookings").select();

    if (searchText) {
      bookingsData = bookingsData.or(
        `client_name.ilike.%${searchText}%,client_phone_number.ilike.%${searchText}%`
      );
    } else if (
      filters.createdTime ||
      filters.status ||
      (filters.properties?.length ?? 0) > 0 ||
      filters.starred ||
      filters.paymentPending ||
      filters.createdBy
    ) {
      if (filters.createdTime) {
        bookingsData = bookingsData
          .gte(
            "created_at",
            convertDateToIndianDate({ date: new Date(filters.createdTime) })
          )
          .lte(
            "created_at",
            convertDateToIndianDate({
              date: new Date(filters.createdTime),
              addDays: 1,
            })
          );
      }
      if (filters.status) {
        bookingsData = bookingsData.eq(
          "status",
          filters.status.toLocaleLowerCase()
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
      if (filters.createdBy) {
        bookingsData = bookingsData.eq("email", filters.createdBy);
      }
    }

    bookingsData = bookingsData
      .order("created_at", { ascending: false })
      .range(0, numOfBookings);
    let { data: result } = await bookingsData;
    // Check if this is the latest request
    if (latestRequestRef.current !== requestId) return;

    let bookings: BookingDB[] = [];
    result?.forEach((booking: any) => {
      const lastIndex = booking.json.length - 1;
      const lastBooking: BookingDB = booking.json[lastIndex];
      bookings.unshift({
        ...lastBooking,
        bookingId: booking.id,
      });
    });
    setState((prevState) => ({
      ...prevState,
      dbBookings: bookings,
    }));
    //Scroll smoothely to page section
    setTimeout(() => {
      if (query.id) {
        document
          .getElementById(query.id.toString() + "-id")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
    setLoading(false);
    setLoadingForward(false);
    setFilterModalOpened(false);
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
        status: null,
        createdTime: null,
        properties: null,
        starred: null,
        paymentPending: null,
        createdBy: null,
      });
      return;
    }
    console.log("query changed: ", query);

    const {
      searchText,
      createdTime,
      status,
      createdBy,
      properties,
      starred,
      paymentPending,
    } = query;
    if (searchText) {
      setState((prevState) => ({
        ...prevState,
        searchText: searchText ? searchText.toString() : null,
        filter: {
          createdTime: createdTime || null,
          status: status || null,
          createdBy: createdBy || null,
          properties: properties || null,
          starred: starred || null,
          paymentPending: paymentPending || null,
        },
      }));
    }

    setFilterState({
      createdTime: createdTime ? createdTime.toString() : null,
      createdBy: createdBy ? parseCreatedBy(createdBy.toString()) : null,
      status: status ? parseStatus(status.toString()) : null,
      properties: properties ? parseProperties(properties?.toString()) : null,
      starred: !!starred,
      paymentPending: !!paymentPending || null,
    });
    fetchData(
      {
        createdTime: createdTime ? createdTime.toString() : null,
        createdBy: createdBy ? parseCreatedBy(createdBy.toString()) : null,
        status: status ? parseStatus(status.toString()) : null,
        properties: properties ? parseProperties(properties?.toString()) : null,
        starred: !!starred,
        paymentPending: !!paymentPending || null,
      },
      searchText ? searchText.toString() : undefined
    );
  }, [query]);

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
    return Object.keys(organizedByCreatedDate(state.dbBookings)).sort(
      (a, b) => {
        if (a == "Invalid Date") return 1;
        if (b == "Invalid Date") return -1;
        return new Date(a).getTime() - new Date(b).getTime();
      }
    );
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

  const convertTimeToDateTime = (time: string) => {
    // 2024-06-28T18:30:00.000Z to Jun 28, 24
    const date = new Date(time);
    return (
      date.toDateString().slice(4, 10) +
      ", " +
      date.toDateString().slice(11, 15)
    );
  };
  //Filter modal
  const [filterModalOpened, setFilterModalOpened] = useState<boolean>(false);
  const toggleFilterDisplay = () => {
    setFilterModalOpened(!filterModalOpened);
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
        query: { returnTo: "/protected/logs", ...pageQuery },
      },
      undefined,
      { shallow: true }
    );
  };
  return (
    <div className="w-full  ">
      {/* Top Nav */}
      <div className="flex items-center h-[72px]">
        <h1 className="text-lg font-bold leading-6 w-full text-center ">
          Logs
        </h1>

        <span
          className=" material-symbols-outlined cursor-pointer hover:text-selectedButton"
          onClick={() => router.push("/protected/booking/create")}
        >
          add_circle
        </span>
      </div>
      {/* Top Nav */}
      <SearchInput
        value={state.searchText || undefined}
        onChange={handleChangeSearch}
        onFilterClick={toggleFilterDisplay}
        filterIsOn={checkEmptyFilterState()}
      />
      <LoadingButton
        className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
        onClick={() => {
          numOfBookings = numOfBookings + 7;
          fetchData(filterState);
        }}
        loading={loadingForward}
      >
        Load More
      </LoadingButton>

      {dates().map((date) => (
        <React.Fragment key={date}>
          <p className="pl-1 mt-6 text-neutral-900 text-lg font-semibold leading-6">
            {convertDate(date)}
          </p>
          {organizedByCreatedDate(state.dbBookings)[date].map(
            (booking, index) => (
              <div
                className="flex mt-3 w-full justify-between"
                key={booking.bookingId}
                id={`${booking.bookingId}-id`}
                onClick={() => redirectToBookingId(booking.bookingId)}
              >
                <div className="pl-3 flex flex-col gap-0">
                  <label className="flex items-center gap-1">
                    <span className="text-neutral-900 text-base font-medium ">
                      {booking.client.name}
                    </span>{" "}
                    <span className="text-slate-500 text-sm font-normal ">
                      {booking.status}
                    </span>
                    {booking?.starred && (
                      <span className="material-symbols-filled text-2xl">
                        star_rate
                      </span>
                    )}
                  </label>
                  <label>
                    <span className="text-slate-500 text-sm font-normal ">
                      {convertTimeToDateTime(booking.startDateTime)} -{" "}
                      {convertTimeToDateTime(booking.endDateTime)}
                    </span>
                  </label>

                  <label className="text-slate-500 text-sm font-normal ">
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
                  {booking.totalCost > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <label>
                        Rs{" "}
                        {booking.outstanding == 0
                          ? booking.paid.toLocaleString("en-IN")
                          : booking.outstanding.toLocaleString("en-IN")}
                      </label>
                      {booking.status == "Confirmed" && (
                        <div
                          className={`${booking.outstanding == 0 ? " bg-green-500/30" : "bg-error/20"} px-3 rounded-xl`}
                        >
                          {booking.outstanding == 0 ? "Paid" : "Unpaid"}
                        </div>
                      )}
                    </div>
                  )}
                  {booking.updatedBy.name && (
                    <label className="text-slate-500 text-sm font-normal ">
                      @{booking.createdBy.name}{" "}
                      {printInIndianTime(booking.createdDateTime, true)}
                    </label>
                  )}
                </div>
                <div className="w-[84px] flex items-center">
                  <div className="w-[74px] h-6 px-5 bg-gray-100 rounded-[19px] justify-center items-center inline-flex items-center">
                    <div className="w-11 left-[20px] top-[6px] text-center text-sky-500 text-base font-medium leading-normal">
                      {booking.bookingType}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </React.Fragment>
      ))}
      {/* Filter modal */}

      <BookingFilter
        isFiltersOpened={filterModalOpened}
        toggleFilterDisplay={toggleFilterDisplay}
        filtersFor="Logs"
        filterState={filterState}
        setFilterState={setFilterState}
        loading={loading}
        applyFilters={() => refreshPageQueries()}
      />
    </div>
  );
}
