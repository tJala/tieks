export function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

export function isToday(date) {
  let activeDate = new Date(date)
  let today = new Date(Date.now())

  if (activeDate.getFullYear() === today.getFullYear() && activeDate.getMonth() === today.getMonth() && activeDate.getDate() === today.getDate()) {
    return true
  } else {
    return false
  }
}

export function isYesterday(date) {
  let activeDate = new Date(date)
  let yesterday = addDays(new Date(), -1)

  if (activeDate.getFullYear() === yesterday.getFullYear() && activeDate.getMonth() === yesterday.getMonth() && activeDate.getDate() === yesterday.getDate()) {
    return true
  } else {
    return false
  }
}

export function getDayValue(date) {
    return ((((date.getDay() - 1) % 7) + 7) % 7)
}

export function isSameWeek(date) {
   return getWeekNumber(date) === getWeekNumber(new Date())
}

export function getEndOfWeek(dateuh)
  {
    var date = new Date(dateuh)
    var lastday = date.getDate() - (date.getDay() - 1) + 6;
    return new Date(date.setDate(lastday));
 
  }

export function getAdjustedDateValue(date) {
  return (((new Date(date).getDay() - 1) % 7) + 7) % 7;
}

  export function getStartOfWeek(dateuh)
  {
    var date = new Date(dateuh)
    var lastday = date.getDate() - (date.getDay() - 1) - 6;
    return new Date(date.setDate(lastday));
 
  }


export function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export function formatDateNoHyphens(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return year + month + day;
}

export function convertDateToUTC(date) { 
  const datex = new Date(date)
  return new Date(datex.getUTCFullYear(), datex.getUTCMonth(), datex.getUTCDate(), datex.getUTCHours(), datex.getUTCMinutes(), datex.getUTCSeconds()); 
}



export function getDateString(date) {
    var options = {
        weekday: 'long',
        year: undefined,
        month: 'long',
        day: 'numeric',
      };

      let dateuh = new Date(date)
      return dateuh.toLocaleDateString('en-US', options);
}


export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function differenceDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return -Math.floor((utc2 - utc1) / _MS_PER_DAY);
 }

 export function differenceDatesMinutes(a, b) {
    const _MS_PER_MINUTE = 1000 * 60;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());
  
    return Math.floor((utc2 - utc1) / _MS_PER_MINUTE);
 }