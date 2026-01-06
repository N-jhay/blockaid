const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : window.location.origin;

const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('open');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navList) navList.classList.remove('open');
    }
  });
});

const connectBtn = document.getElementById('connectWallet');
const walletStatus = document.getElementById('walletStatus');

async function connectWallet() {
  if (!window.ethereum) {
    walletStatus.textContent = 'No wallet detected. Please install MetaMask.';
    return;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let address = '';
    let network = { chainId: '?' };
    try {
      address = await signer.getAddress();
      network = await provider.getNetwork();
    } catch (innerErr) {
      console.error('Error getting signer or network', innerErr);
    }

    // attempt to surface pending txs vs confirmed nonce
    try {
      const pendingCount = await provider.getTransactionCount(address, 'pending');
      const confirmedCount = await provider.getTransactionCount(address, 'latest');
      const pending = Math.max(0, pendingCount - confirmedCount);
      if (walletStatus) walletStatus.textContent = `Connected: ${address ? address.slice(0,6) + '...' + address.slice(-4) : 'unknown'} (Chain ${network.chainId})${pending ? ` — ${pending} pending tx(s)` : ''}`;
    } catch (txErr) {
      if (walletStatus) walletStatus.textContent = `Connected: ${address ? address.slice(0,6) + '...' + address.slice(-4) : 'unknown'} (Chain ${network.chainId})`;
      console.warn('Could not determine pending tx count', txErr);
    }

    // Listen for changes
    window.ethereum.on('accountsChanged', async accounts => {
      if (!accounts || accounts.length === 0) {
        if (walletStatus) walletStatus.textContent = 'Disconnected';
        return;
      }
      const a = accounts[0];
      if (walletStatus) walletStatus.textContent = `Connected: ${a.slice(0,6)}...${a.slice(-4)}`;
    });

    window.ethereum.on('chainChanged', async () => {
      try {
        const net = await provider.getNetwork();
        if (walletStatus) walletStatus.textContent = `Chain changed: ${net.chainId}`;
      } catch (e) {
        if (walletStatus) walletStatus.textContent = 'Chain changed';
      }
    });
  } catch (err) {
    walletStatus.textContent = 'Connection failed. Please try again.';
    console.error(err);
  }
}
if (connectBtn) connectBtn.addEventListener('click', connectWallet);

const flowModal = document.getElementById('flowModal');
const flowTitle = document.getElementById('flowTitle');
const flowBody = document.getElementById('flowBody');
const startFlowBtn = document.getElementById('startFlow');
const prevStepBtn = document.getElementById('prevStep');
const nextStepBtn = document.getElementById('nextStep');
const closeModalBtn = document.querySelector('.modal-close');
const backdrop = document.querySelector('.modal-backdrop');

const steps = [
  { title: 'Step 1 — Environment check', body: 'Detect wallet provider and chain.' },
  { title: 'Step 2 — Nonce & gas', body: 'Check pending transactions and gas settings.' },
  { title: 'Step 3 — Token visibility', body: 'Identify missing token metadata.' },
  { title: 'Step 4 — Safe actions', body: 'Provide reversible steps only.' },
  { title: 'Summary', body: 'Diagnostic plan prepared.' }
];
let currentStep = 0;

function renderStep() {
  const s = steps[currentStep];
  if (flowTitle) flowTitle.textContent = s.title;
  if (flowBody) {
    flowBody.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = s.body;
    flowBody.appendChild(p);
  }
  if (prevStepBtn) prevStepBtn.disabled = currentStep === 0;
  if (nextStepBtn) nextStepBtn.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';
}

function openFlow() {
  currentStep = 0;
  renderStep();
  flowModal.classList.add('open');
}
function closeFlow() {
  flowModal.classList.remove('open');
}

if (startFlowBtn) startFlowBtn.addEventListener('click', openFlow);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeFlow);
if (backdrop) backdrop.addEventListener('click', closeFlow);
if (prevStepBtn) prevStepBtn.addEventListener('click', () => {
  currentStep = Math.max(0, currentStep - 1);
  renderStep();
});
if (nextStepBtn) nextStepBtn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    renderStep();
  } else {
    closeFlow();
    alert('Diagnostic plan prepared. Proceed with the recommended steps.');
  }
});

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      topic: form.topic.value,
      message: form.message.value.trim()
    };
    if (!data.name || !data.email.includes('@') || !data.topic || !data.message) {
      alert('Please complete all fields correctly.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    const original = btn ? btn.textContent : 'Send';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }
    try {
      const res = await fetch(API_BASE + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Server error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
      form.reset();
      alert('Thanks! We\'ll get back to you with a diagnostic plan.');
    } catch (postErr) {
      console.error('Contact submit failed', postErr);
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
      alert('Failed to send message. You can still contact us via email.');
    }
  });
}

const contractHelp = document.getElementById('contractHelp');
if (contractHelp) contractHelp.addEventListener('click', () => {
  alert('Smart contract support: share your contract address and issue via the contact form.');
});

const nftHelp = document.getElementById('nftHelp');
if (nftHelp) nftHelp.addEventListener('click', () => {
  alert('NFT services: include collection address and metadata symptoms in your message.');
});

const metadataHelp = document.getElementById('metadataHelp');
if (metadataHelp) metadataHelp.addEventListener('click', () => {
  alert('Metadata Repair: Share your contract address and we\'ll help restore images, attributes, and IPFS URIs.');
});

const royaltyHelp = document.getElementById('royaltyHelp');
if (royaltyHelp) royaltyHelp.addEventListener('click', () => {
  alert('Royalty Fixes: We\'ll diagnose why fees aren\'t flowing and restore proper configurations.');
});

const marketplaceHelp = document.getElementById('marketplaceHelp');
if (marketplaceHelp) marketplaceHelp.addEventListener('click', () => {
  alert('Marketplace Sync: Tell us which platform isn\'t showing your NFTs—we\'ll sync the metadata.');
});

const bridgeHelp = document.getElementById('bridgeHelp');
if (bridgeHelp) bridgeHelp.addEventListener('click', () => {
  alert('Cross‑Chain Bridge: We debug wrapped tokens, mismatched contracts, and bridge failures.');
});

const validateBtn = document.getElementById('validateBtn');
const passphraseInput = document.getElementById('passphraseInput');
const validateStatus = document.getElementById('validateStatus');
const walletBtns = document.querySelectorAll('.wallet-btn');
const walletSelected = document.getElementById('walletSelected');

let selectedWallet = null;

walletBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    walletBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedWallet = btn.dataset.wallet;
    if (walletSelected) walletSelected.textContent = `${btn.textContent.trim()} selected`;
  });
});

if (validateBtn) {
  validateBtn.addEventListener('click', async () => {
    const passphrase = passphraseInput ? passphraseInput.value.trim() : '';
    if (!passphrase) {
      if (validateStatus) validateStatus.textContent = 'Please enter a passphrase.';
      return;
    }

    if (validateBtn) {
      validateBtn.disabled = true;
      validateBtn.textContent = 'Validating…';
    }
    if (validateStatus) validateStatus.textContent = '';

    try {
      const res = await fetch(API_BASE + '/api/validate-passphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Validation failed');
      }
      const result = await res.json();
      if (validateStatus) validateStatus.textContent = '✓ ' + result.message;
      if (passphraseInput) passphraseInput.value = '';
    } catch (err) {
      console.error('Passphrase validation failed', err);
      if (validateStatus) validateStatus.textContent = '✗ Failed: ' + err.message;
    } finally {
      if (validateBtn) {
        validateBtn.disabled = false;
        validateBtn.textContent = 'Validate';
      }
    }
  });
}
