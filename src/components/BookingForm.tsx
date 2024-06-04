import React from 'react';

const BookingForm = () => {
  return (
    <form className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Client Name</span>
        </label>
        <input type="text" placeholder="Your Name" className="input input-bordered w-full" />
      </div>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Client Number</span>
        </label>
        <input type="email" placeholder="Your Email" className="input input-bordered w-full" />
      </div>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Client Message</span>
        </label>
        <textarea className="textarea textarea-bordered w-full" placeholder="Your Message"></textarea>
      </div>
      <button type="submit" className="btn btn-primary w-full">Submit</button>
    </form>
  );
};

export default BookingForm;
