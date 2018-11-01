export const getData = (url) => {
    return fetch(url);
}

export const convertDataToJson = (data) => {
    return data.json();
}

export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour24 = date.getHours();
    const unformattedMin = date.getMinutes();
    const unformattedSec = date.getSeconds();

    // Convert hours to 12-hr am/pm
    const amOrPm = hour24 > 11 ? 'pm' : 'am';
    let hour = undefined;
    if (hour24 < 1) {
        hour = 12;
    }
    else if (hour24 > 12) {
        hour = hour24 - 12;
    }
    else {
        hour = hour24;
    }

    // Format minutes and seconds to have leading 0 if needed
    let min = undefined;
    let sec = undefined;
    if (unformattedMin < 10) {
        min = `0${unformattedMin}`;
    }
    else {
        min = unformattedMin.toString();
    }
    if (unformattedSec < 10) {
        sec = `0${unformattedSec}`;
    }
    else {
        sec = unformattedSec.toString();
    }

    return `${month}/${day}/${year} ${hour}:${min}:${sec}${amOrPm}`;
}