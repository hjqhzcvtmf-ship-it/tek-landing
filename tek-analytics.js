(function () {
  const endpoint = 'https://us-central1-tek-nightclub-app.cloudfunctions.net/trackWebsiteEvent';
  const visitorKey = 'tekVisitorId';

  function getVisitorId() {
    try {
      let existing = localStorage.getItem(visitorKey);
      if (existing) return existing;
      existing = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(visitorKey, existing);
      return existing;
    } catch (_) {
      return 'anonymous';
    }
  }

  window.trackWebsiteEvent = function trackWebsiteEvent(eventName, properties) {
    try {
      if (!eventName) return;
      const payload = {
        eventName,
        page: (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index',
        path: window.location.pathname || '/',
        referrer: document.referrer || '',
        visitorId: getVisitorId(),
        userId: localStorage.getItem('userId') || '',
        sessionId: localStorage.getItem('sessionId') || '',
        clientTimestamp: Date.now(),
        properties: properties || {},
      };

      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}
  };
})();
