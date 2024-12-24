const convertToISO = (dateString, timeString, timezoneOffset = "-07:00") => {
  // Combine the date and time strings
  const dateTimeString = `${dateString}T${timeString}:00`;

  // Create a Date object
  const date = new Date(dateTimeString);

  // Convert the date to an ISO string and add the desired timezone offset
  const isoStringWithOffset = `${
    date.toISOString().split(".")[0]
  }${timezoneOffset}`;

  return isoStringWithOffset;
};

export default convertToISO;
