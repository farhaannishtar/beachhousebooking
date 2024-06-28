import React from "react";
import { Property } from "@/utils/lib/bookingType";
import DateTimePickerInput from "./DateTimePickerInput/DateTimePickerInput";
import Properties from "./Properties";
import LoadingButton from "./ui/LoadingButton";

type BookingFilterProps = {
    filterModalOpened: Boolean;
    showFilterModal: any;
    handleDateChange: any;
    filterChange: any;
    state: any;
    setState: any;
    onClick: any;
    loading: Boolean
};

const BookingFilter: React.FC<BookingFilterProps> = ({ filterModalOpened, showFilterModal, handleDateChange, state, setState, filterChange, onClick, loading }) => {


    return (

        <div className={`${filterModalOpened ? 'top-0' : 'top-[9999px]'} transition-all fixed h-full w-full z-30 top-0 left-0 flex flex-col justify-end`}>
            {/* overlay background */}
            <div className="overlay h-full w-full bg-black/40 absolute z-10" onClick={showFilterModal}></div>
            {/* Filter part  */}
            <div className='bg-white flex flex-col p-4 relative gap-4 z-20 max-h-[80vh] overflow-y-auto'>
                {/* filters */}
                <label className='subheading'>Filters</label>
                <DateTimePickerInput label="Pick Date" name="updatedTime" onChange={handleDateChange} value={state?.filter?.createdTime} className='filterDatePicker' cleanable={true} />
                {/* Referrals */}

                <Properties properties={state.filter.properties ?? []} setLogListState={setState} />
                {/* Booking Types */}
                <label className='subheading'>Booking Types</label>
                <div className='flex items-center flex-wrap gap-4' >
                    <div onClick={() => filterChange({ name: 'status', value: 'Inquiry' })} className={`badge badge-lg text-center w-32 ${state.filter.status == 'Inquiry' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Inquiries</div>
                    <div onClick={() => filterChange({ name: 'status', value: 'Quotation' })} className={`badge badge-lg text-center w-32 ${state.filter.status == 'Quotation' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Quotations</div>
                    <div onClick={() => filterChange({ name: 'status', value: 'Confirmed' })} className={`badge badge-lg text-center w-32 ${state.filter.status == 'Confirmed' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Confirmed</div>

                </div>
                {/* Other */}
                <label className='subheading'>Other</label>
                <div className='flex items-center flex-wrap gap-4' >
                    <div onClick={() => filterChange({ name: 'paymentPending', value: !state.filter.paymentPending })} className={`badge badge-lg text-center w-44 ${state.filter.paymentPending ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Payment Pending</div>
                    <div onClick={() => filterChange({ name: 'starred', value: !state.filter.starred })} className={`badge badge-lg text-center w-32 ${state.filter.starred ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Starred</div>


                </div>
                {/* Employees */}
                <label className='subheading'>Employees</label>
                <div className='flex items-center flex-wrap gap-4' >
                    <div onClick={() => filterChange({ name: 'createdBy', value: 'Nusrat' })} className={`badge badge-lg text-center w-32 ${state.filter.createdBy == 'Nusrat' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Nusrat</div>
                    <div onClick={() => filterChange({ name: 'createdBy', value: 'Prabhu' })} className={`badge badge-lg text-center w-32 ${state.filter.createdBy == 'Prabhu' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Prabhu</div>
                    <div onClick={() => filterChange({ name: 'createdBy', value: 'Yasmeen' })} className={`badge badge-lg text-center w-32 ${state.filter.createdBy == 'Yasmeen' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Yasmeen</div>
                    <div onClick={() => filterChange({ name: 'createdBy', value: 'Rafica' })} className={`badge badge-lg text-center w-32 ${state.filter.createdBy == 'Rafica' ? '!text-white bg-selectedButton' : 'text-black bg-inputBoxbg'
                        } text-base font-medium leading-normal p-4 text-typo_dark-100 h-12 rounded-[20px] cursor-pointer`}>Rafica</div>
                </div>
                {/* Apply filters */}
                <LoadingButton
                    className=" border-[1px] border-selectedButton text-selectedButton my-4 w-full py-2 px-4 rounded-xl"
                    loading={loading}
                    onClick={onClick} >Apply filters</LoadingButton>
            </div>

        </div>

    );
};

export default BookingFilter;