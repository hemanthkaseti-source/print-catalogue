import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const submitEnquiry = (payload) => axios.post(`${API}/enquiries`, payload).then((r) => r.data);

export const trackEvent = (event, meta = {}) =>
  axios.post(`${API}/analytics/events`, { event, meta }).catch(() => null);

let downloading = false;

export const downloadPdf = async () => {
  if (downloading) return;
  downloading = true;
  trackEvent('pdf_download', { path: window.location.pathname });
  const job = axios.get(`${API}/catalogue.pdf`, { responseType: 'blob', timeout: 120000 }).then((r) => {
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sree-Bloomy-Graphics-Catalogue.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
  toast.promise(job, {
    loading: 'Preparing your A4 catalogue PDF…',
    success: 'Catalogue downloaded.',
    error: 'Could not generate the PDF right now. Please try again.',
  });
  try { await job; } catch (e) { /* toast already shown */ } finally { downloading = false; }
};
