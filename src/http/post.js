import axios from 'axios';
import qs from 'qs';

/**
 * login POSTs to the given URL with the data and returns a Promise.
 * 
 * @ignore
 * @param {string} url The URL to HTTP-POST to.
 * @param {object} data The form data.
 * @returns Promise
 */
function login( url, data ) {
    return axios.post( url, qs.stringify( data ) );
}

/**
 * resume POSTs to the given URL with the data and returns a Promise.
 * 
 * @ignore
 * @param {string} url The URL to HTTP-POST to.
 * @param {object} data The form data.
 * @returns Promise
 */
function resume( url, data ) {
    return axios.post( url, qs.stringify( data ) );
}

export default { login, resume };