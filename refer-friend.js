(function () {
  const endpoint = 'https://us-central1-tek-nightclub-app.cloudfunctions.net/sendWebsiteReferral';
  const allowedPages = ['profile.html', 'events.html', 'tickets.html'];
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const hasWebsiteSession = Boolean(localStorage.getItem('userId') && localStorage.getItem('userData'));

  if (!hasWebsiteSession || !allowedPages.includes(currentPage)) {
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    #referFab {
      all: unset;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 9999;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      border: 1px solid rgba(0, 255, 65, 0.25);
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.82);
      color: #00FF41;
      text-decoration: none;
      font-family: 'Montserrat', 'Orbitron', Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.8px;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: all 0.3s cubic-bezier(.4,0,.2,1);
      cursor: pointer;
    }

    #referFab:hover {
      background: rgba(0, 255, 65, 0.1);
      border-color: rgba(0, 255, 65, 0.5);
      box-shadow: 0 0 30px rgba(0, 255, 65, 0.15);
      transform: translateY(-2px);
    }

    #referFab .refer-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00FF41;
      box-shadow: 0 0 8px rgba(0, 255, 65, 0.6);
      flex: 0 0 auto;
    }

    #referOverlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    #referOverlay.is-open {
      display: flex;
    }

    #referModal {
      width: min(100%, 480px);
      background: linear-gradient(180deg, rgba(20, 20, 20, 0.96), rgba(7, 7, 7, 0.96));
      border: 1px solid rgba(0, 255, 65, 0.18);
      border-radius: 8px;
      box-shadow: 0 20px 70px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 65, 0.08);
      padding: 32px;
      color: #fff;
      font-family: 'Montserrat', Arial, sans-serif;
    }

    #referModal h2 {
      margin: 0 0 12px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #fff;
    }

    #referModal p {
      margin: 0 0 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      line-height: 1.7;
    }

    #referModal .refer-note {
      margin: 0 0 22px;
      padding: 16px 18px;
      border: 1px solid rgba(0, 255, 65, 0.16);
      border-radius: 6px;
      background: rgba(0, 255, 65, 0.05);
    }

    #referModal .refer-note strong {
      display: block;
      margin-bottom: 8px;
      color: #00FF41;
      font-size: 11px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    #referModal .refer-note p {
      margin: 0;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.76);
    }

    #referModal label {
      display: block;
      margin-bottom: 10px;
      color: rgba(255, 255, 255, 0.86);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    #referEmailInput {
      width: 100%;
      padding: 15px 16px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #fff;
      font-size: 15px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    #referEmailInput:focus {
      border-color: rgba(0, 255, 65, 0.55);
      box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.08);
    }

    #referStatus {
      min-height: 20px;
      margin-top: 12px;
      color: rgba(255, 255, 255, 0.78);
      font-size: 13px;
    }

    #referStatus.is-error {
      color: #ff7b7b;
    }

    #referStatus.is-success {
      color: #00FF41;
    }

    .refer-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .refer-action {
      flex: 1;
      min-height: 50px;
      border-radius: 4px;
      font-family: 'Montserrat', Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .refer-action--secondary {
      background: transparent;
      color: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .refer-action--secondary:hover {
      border-color: rgba(255, 255, 255, 0.28);
      background: rgba(255, 255, 255, 0.03);
    }

    .refer-action--primary {
      background: #00FF41;
      color: #000;
      border: 1px solid #00FF41;
    }

    .refer-action--primary:hover {
      background: #26ff5d;
      box-shadow: 0 10px 26px rgba(0, 255, 65, 0.18);
      transform: translateY(-1px);
    }

    .refer-action[disabled] {
      opacity: 0.6;
      cursor: wait;
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 600px) {
      #referFab {
        right: 16px;
        bottom: 16px;
        padding: 11px 16px;
        font-size: 10px;
        letter-spacing: 1.2px;
      }

      #referModal {
        padding: 24px 20px;
      }

      .refer-actions {
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(style);

  // Add bottom padding so the floating button doesn't overlap page content
  document.body.style.paddingBottom = '90px';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'referFab';
  button.innerHTML = '<span class="refer-dot"></span><span>REFER A FRIEND — GET REWARDED</span>';

  const overlay = document.createElement('div');
  overlay.id = 'referOverlay';
  overlay.innerHTML = `
    <div id="referModal" role="dialog" aria-modal="true" aria-labelledby="referTitle">
      <h2 id="referTitle">Refer a Friend</h2>
      <p>Enter your friend's email address and we will send them a TEK invitation with a direct application link.</p>
      <div class="refer-note">
        <strong>Reward milestones</strong>
        <p>Invite 5 friends and you unlock a free drink reward. If all 5 of those invited friends buy a ticket, you unlock a free ticket as well.</p>
      </div>
      <label for="referEmailInput">Friend's email address</label>
      <input id="referEmailInput" type="email" placeholder="friend@email.com" autocomplete="email" />
      <div id="referStatus"></div>
      <div class="refer-actions">
        <button type="button" class="refer-action refer-action--secondary" id="referCancel">Cancel</button>
        <button type="button" class="refer-action refer-action--primary" id="referSubmit">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(overlay);

  const emailInput = overlay.querySelector('#referEmailInput');
  const status = overlay.querySelector('#referStatus');
  const submitButton = overlay.querySelector('#referSubmit');
  const cancelButton = overlay.querySelector('#referCancel');

  function setStatus(message, type) {
    status.textContent = message || '';
    status.className = '';
    if (type) {
      status.classList.add(type === 'error' ? 'is-error' : 'is-success');
    }
  }

  function openModal() {
    overlay.classList.add('is-open');
    setStatus('');
    setTimeout(function () {
      emailInput.focus();
    }, 50);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    setStatus('');
  }

  async function sendReferral() {
    const friendEmail = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(friendEmail)) {
      setStatus('Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    submitButton.disabled = true;
    cancelButton.disabled = true;
    setStatus('Sending invitation...');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendEmail: friendEmail })
      });

      const result = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(result.error || 'Unable to send invitation.');
      }

      setStatus('Invitation sent.', 'success');
      emailInput.value = '';

      if (window.trackWebsiteEvent) {
        window.trackWebsiteEvent('refer_friend_email_sent', {
          destination: 'email'
        });
      }

      setTimeout(closeModal, 1200);
    } catch (error) {
      setStatus(error.message || 'Unable to send invitation.', 'error');
    } finally {
      submitButton.disabled = false;
      cancelButton.disabled = false;
    }
  }

  button.addEventListener('click', openModal);
  cancelButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      closeModal();
    }
  });
  emailInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendReferral();
    }
    if (event.key === 'Escape') {
      closeModal();
    }
  });
  submitButton.addEventListener('click', sendReferral);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
