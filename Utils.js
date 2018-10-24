export const getData = (url) => {
    return fetch(url);
}

export const convertDataToJson = (data) => {
    return data.json();
}