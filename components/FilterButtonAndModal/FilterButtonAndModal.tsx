'use client';

import DateTimePickerInput from "../DateTimePickerInput/DateTimePickerInput";
import styles from './FilterButtonAndModal.module.css';

const FilterButtonAndModal: React.FC = () => {

  return (
    <>
      <button className="btn btn-xs btn-square p-1" onClick={() => (document.getElementById('my_modal_2') as HTMLDialogElement).showModal()}>
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path id="Vector - 0" fill-rule="evenodd" clip-rule="evenodd" d="M4 6.84375V0.75C4 0.335786 3.66421 0 3.25 0C2.83579 0 2.5 0.335786 2.5 0.75V6.84375C1.17256 7.18363 0.244117 8.37974 0.244117 9.75C0.244117 11.1203 1.17256 12.3164 2.5 12.6562V17.25C2.5 17.6642 2.83579 18 3.25 18C3.66421 18 4 17.6642 4 17.25V12.6562C5.32744 12.3164 6.25588 11.1203 6.25588 9.75C6.25588 8.37974 5.32744 7.18363 4 6.84375ZM3.25 11.25C2.42157 11.25 1.75 10.5784 1.75 9.75C1.75 8.92157 2.42157 8.25 3.25 8.25C4.07843 8.25 4.75 8.92157 4.75 9.75C4.75 10.5784 4.07843 11.25 3.25 11.25ZM10.75 2.34375V0.75C10.75 0.335786 10.4142 0 10 0C9.58579 0 9.25 0.335786 9.25 0.75V2.34375C7.92256 2.68363 6.99412 3.87974 6.99412 5.25C6.99412 6.62026 7.92256 7.81637 9.25 8.15625V17.25C9.25 17.6642 9.58579 18 10 18C10.4142 18 10.75 17.6642 10.75 17.25V8.15625C12.0774 7.81637 13.0059 6.62026 13.0059 5.25C13.0059 3.87974 12.0774 2.68363 10.75 2.34375ZM10 6.75C9.17157 6.75 8.5 6.07843 8.5 5.25C8.5 4.42157 9.17157 3.75 10 3.75C10.8284 3.75 11.5 4.42157 11.5 5.25C11.5 6.07843 10.8284 6.75 10 6.75ZM19.75 12.75C19.7487 11.3821 18.8239 10.1876 17.5 9.84375V0.75C17.5 0.335786 17.1642 0 16.75 0C16.3358 0 16 0.335786 16 0.75V9.84375C14.6726 10.1836 13.7441 11.3797 13.7441 12.75C13.7441 14.1203 14.6726 15.3164 16 15.6562V17.25C16 17.6642 16.3358 18 16.75 18C17.1642 18 17.5 17.6642 17.5 17.25V15.6562C18.8239 15.3124 19.7487 14.1179 19.75 12.75ZM16.75 14.25C15.9216 14.25 15.25 13.5784 15.25 12.75C15.25 11.9216 15.9216 11.25 16.75 11.25C17.5784 11.25 18.25 11.9216 18.25 12.75C18.25 13.5784 17.5784 14.25 16.75 14.25Z" fill="#617A8A" />
        </svg>
      </button>
      <dialog id="my_modal_2" className={`modal ${styles.modalBackdrop} z-10 bg-transparent shadow-lg`}>
        <div className="modal-box">
          <div className="w-full text-neutral-900 text-lg font-bold leading-6">
            Filter by
          </div>
          <div>
            <DateTimePickerInput label="Pick Date" />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}

export default FilterButtonAndModal