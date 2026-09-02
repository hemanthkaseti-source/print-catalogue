import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const submitEnquiry = (payload) => axios.post(`${API}/enquiries`, payload).then((r) => r.data);

export const trackEvent = (event, meta = {}) =>
  axios.post(`${API}/analytics/events`, { event, meta }).catch(() => null);

export const downloadPdf = () => {
  trackEvent('pdf_download', { path: window.location.pathname });
  window.dispatchEvent(new Event('sbg:print'));
  setTimeout(() => window.print(), 250);
};
