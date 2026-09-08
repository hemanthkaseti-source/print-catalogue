import axios from 'axios';

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${process.env.REACT_APP_FORMSPREE_ID}`;

export const submitEnquiry = (payload) =>
  axios
    .post(FORMSPREE_ENDPOINT, payload, { headers: { Accept: 'application/json' } })
    .then((r) => r.data);

export const trackEvent = (event, meta = {}) =>
  axios.post('/api/analytics/events', { event, meta }).catch(() => null);

export const downloadPdf = () => {
  trackEvent('pdf_download', { path: window.location.pathname });
  const a = document.createElement('a');
  a.href = '/catalogue.pdf';
  a.download = 'Sree-Bloomy-Graphics-Catalogue.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
};
