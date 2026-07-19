import React, { useState } from 'react';
import { createErrorReport } from './errorReports';

export default function ErrorReportForm({ initialUrl }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState(initialUrl || window.location.href);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const { data, error } = await createErrorReport({ title, message, url });
    if (error) {
      setStatus('error: ' + error.message);
    } else {
      setStatus('submitted');
      setTitle('');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:480}}>
      <div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div>
        <label>URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div>
        <button type="submit">Send Report</button>
      </div>
      {status && <div style={{marginTop:8}}>Status: {status}</div>}
    </form>
  );
}
