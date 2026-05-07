const LOCAL_KEYS = {
  profile: "borrowLoopProfile",
  flash: "borrowLoopFlash"
};

const FALLBACK_ITEMS = [
  {
    id: "drill-01",
    title: "Cordless Power Drill Set",
    category: "Tools",
    price: 8,
    unit: "day",
    city: "Park Slope",
    distance: 0.6,
    rating: 4.9,
    owner: "Maya R.",
    badge: "Verified owner",
    imageClass: "tools",
    pickup: "Tonight after 6 PM",
    description:
      "Includes two batteries, charger, bit set, and a carrying case for quick home projects.",
    trust: "Deposit required for first-time borrowers.",
    highlights: ["Fast pickup", "Complete bit set", "Popular weekend tool"],
    summary: "Ideal for shelves, curtain rods, and small repairs.",
    source: "default"
  },
  {
    id: "blender-01",
    title: "High-End Blender",
    category: "Kitchen",
    price: 6,
    unit: "day",
    city: "Williamsburg",
    distance: 1.1,
    rating: 5,
    owner: "Daniel T.",
    badge: "Insured listing",
    imageClass: "kitchen blender",
    pickup: "Pickup by arrangement",
    description:
      "Great for smoothies, soups, and weekend meal prep. Sanitized after every return.",
    trust: "Owner responds within 20 minutes on average.",
    highlights: ["Quiet motor", "Easy clean", "Recipe card included"],
    summary: "Perfect for a healthy week without buying a premium appliance.",
    source: "default"
  },
  {
    id: "tent-01",
    title: "Weekend Camping Tent Kit",
    category: "Outdoor",
    price: 9,
    unit: "day",
    city: "Astoria",
    distance: 1.7,
    rating: 4.8,
    owner: "Lina P.",
    badge: "Top lender",
    imageClass: "camping",
    pickup: "Friday evenings",
    description:
      "Four-person tent with stakes, rainfly, and compact lantern for quick trips out of town.",
    trust: "Late-return grace window included.",
    highlights: ["Weather cover", "Family size", "Beginner friendly"],
    summary: "A simple camping setup without the storage burden.",
    source: "default"
  },
  {
    id: "washer-01",
    title: "Electric Pressure Washer",
    category: "Cleaning",
    price: 12,
    unit: "day",
    city: "Jersey City",
    distance: 2.4,
    rating: 4.7,
    owner: "Chris A.",
    badge: "ID verified",
    imageClass: "cleaning",
    pickup: "Next-day pickup",
    description:
      "Good for patios, bikes, fences, and spring cleaning. Hose included with quick-start guide.",
    trust: "Photo check before and after return.",
    highlights: ["Spring favorite", "Hose included", "Easy setup"],
    summary: "Ideal when you want a clean patio without owning bulky equipment.",
    source: "default"
  },
  {
    id: "projector-01",
    title: "Movie Night Projector Kit",
    category: "Events",
    price: 10,
    unit: "day",
    city: "Cobble Hill",
    distance: 0.9,
    rating: 4.9,
    owner: "Sara W.",
    badge: "Neighborhood favorite",
    imageClass: "events",
    pickup: "Ready this weekend",
    description:
      "Projector, compact speaker, HDMI cable, and folding screen for indoor or backyard nights.",
    trust: "Pickup checklist included.",
    highlights: ["Screen included", "Speaker included", "Easy backyard setup"],
    summary: "Turn one evening into an event without buying one more gadget.",
    source: "default"
  },
  {
    id: "trimmer-01",
    title: "Cordless Hedge Trimmer",
    category: "Garden",
    price: 7,
    unit: "day",
    city: "Maplewood",
    distance: 2.9,
    rating: 4.6,
    owner: "Owen H.",
    badge: "Reliable pickup",
    imageClass: "garden",
    pickup: "Morning pickup available",
    description:
      "Battery-powered trimmer with safety gloves included for fast yard cleanup.",
    trust: "Borrower tip sheet included.",
    highlights: ["Battery included", "Safe starter guide", "Good for quick trim jobs"],
    summary: "Great for cleanup weekends when you need it once and not forever.",
    source: "default"
  }
];

const config = window.BORROW_LOOP_CONFIG || {};
const API_BASE = String(config.apiBase || "").replace(/\/$/, "");

const state = {
  apiOnline: true,
  apiError: "",
  items: null,
  profile: readLocalProfile()
};

document.documentElement.classList.add("js-ready");

function readLocalProfile() {
  try {
    const value = localStorage.getItem(LOCAL_KEYS.profile);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function writeLocalProfile(profile) {
  state.profile = profile;
  localStorage.setItem(LOCAL_KEYS.profile, JSON.stringify(profile));
}

function clearLocalProfile() {
  state.profile = null;
  localStorage.removeItem(LOCAL_KEYS.profile);
}

function setFlash(message) {
  sessionStorage.setItem(LOCAL_KEYS.flash, message);
}

function consumeFlash() {
  const value = sessionStorage.getItem(LOCAL_KEYS.flash);
  if (value) {
    sessionStorage.removeItem(LOCAL_KEYS.flash);
  }
  return value;
}

function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(apiUrl(path), {
      ...options,
      headers
    });
  } catch (error) {
    state.apiOnline = false;
    state.apiError =
      "Backend unavailable. Add your API URL inside index.html and deploy the backend service.";
    throw new Error(state.apiError);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    state.apiOnline = false;
    state.apiError = payload.error || "The server returned an error.";
    throw new Error(state.apiError);
  }

  state.apiOnline = true;
  state.apiError = "";
  return payload;
}

async function loadItems() {
  if (state.items) {
    return state.items;
  }

  try {
    const payload = await apiFetch("/api/items");
    state.items = payload.items || [];
  } catch (error) {
    state.items = FALLBACK_ITEMS;
  }

  return state.items;
}

function currentProfile() {
  return state.profile;
}

function setElementMessage(element, message, isError = false) {
  if (!element) {
    return;
  }
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function formatPrice(item) {
  return `$${item.price}/${item.unit}`;
}

function createListingCard(item, options = {}) {
  const card = document.createElement("article");
  card.className = "listing-card card";
  card.innerHTML = `
    <div class="listing-visual ${item.imageClass || ""}">
      <div>
        <p class="eyebrow">${item.category}</p>
        <h3>${item.title}</h3>
      </div>
    </div>
    <div>
      <div class="listing-meta-row">
        <span class="price">${formatPrice(item)}</span>
        <span class="rating">${item.rating} • ${item.owner}</span>
      </div>
      <p class="listing-meta">${item.summary}</p>
      <div class="detail-highlights">
        <span class="chip">${item.city}</span>
        <span class="chip">${item.distance} mi away</span>
        <span class="chip">${item.badge}</span>
      </div>
    </div>
    <div class="inline-actions">
      <a class="button button-primary" href="./index.html?item=${item.id}#item-detail-section">View item</a>
      ${
        options.secondaryButton === "save"
          ? `<button class="button button-secondary" type="button" data-save-item="${item.id}">Save</button>`
          : `<a class="button button-secondary" href="./index.html?category=${encodeURIComponent(item.category)}#browse-section">More ${item.category}</a>`
      }
    </div>
  `;
  return card;
}

function createEmptyState(message) {
  const node = document.createElement("div");
  node.className = "empty-state";
  node.textContent = message;
  return node;
}

async function renderFeaturedGrid() {
  const grid = document.getElementById("featured-grid");
  if (!grid) {
    return;
  }

  const items = await loadItems();
  grid.innerHTML = "";
  items.slice(0, 3).forEach((item) => {
    grid.appendChild(createListingCard(item, { secondaryButton: "save" }));
  });
}

async function renderBrowsePage() {
  const grid = document.getElementById("browse-grid");
  if (!grid) {
    return;
  }

  const items = await loadItems();
  const searchInput = document.getElementById("search-input");
  const categoryInput = document.getElementById("category-input");
  const sortInput = document.getElementById("sort-input");
  const resultCount = document.getElementById("result-count");
  const urlParams = new URLSearchParams(window.location.search);

  if (categoryInput && urlParams.get("category")) {
    categoryInput.value = urlParams.get("category");
  }

  function applyFilters() {
    let filtered = [...items];

    if (searchInput && searchInput.value.trim()) {
      const query = searchInput.value.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query)
        );
      });
    }

    if (categoryInput && categoryInput.value) {
      filtered = filtered.filter((item) => item.category === categoryInput.value);
    }

    if (sortInput) {
      switch (sortInput.value) {
        case "price":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "rating":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default:
          filtered.sort((a, b) => a.distance - b.distance);
      }
    }

    grid.innerHTML = "";
    if (resultCount) {
      const suffix = state.apiOnline ? "" : " • demo items shown";
      resultCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} available${suffix}`;
    }

    if (!filtered.length) {
      grid.appendChild(createEmptyState("No items match those filters yet."));
      return;
    }

    filtered.forEach((item) => {
      grid.appendChild(createListingCard(item, { secondaryButton: "save" }));
    });
  }

  [searchInput, categoryInput, sortInput].forEach((element) => {
    if (element) {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    }
  });

  applyFilters();
}

async function renderItemPage() {
  const detailRoot = document.getElementById("item-detail");
  if (!detailRoot) {
    return;
  }

  const items = await loadItems();
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("item") || items[0]?.id;
  const item = items.find((entry) => entry.id === itemId) || items[0];
  const relatedRoot = document.getElementById("related-grid");
  const pageTitle = document.getElementById("item-page-title");

  if (!item) {
    detailRoot.appendChild(createEmptyState("No item found."));
    return;
  }

  if (pageTitle) {
    pageTitle.textContent = item.title;
  }

  detailRoot.innerHTML = `
    <section class="detail-main">
      <div class="detail-gallery ${item.imageClass || ""}">
        <p class="eyebrow">${item.category}</p>
        <p class="display">${item.title}</p>
      </div>
      <div class="detail-block">
        <div class="listing-meta-row">
          <span class="price">${formatPrice(item)}</span>
          <span class="rating">${item.rating} stars • ${item.badge}</span>
        </div>
        <p class="lead">${item.description}</p>
        <div class="detail-highlights">
          ${item.highlights.map((highlight) => `<span class="chip">${highlight}</span>`).join("")}
        </div>
      </div>
      <div class="detail-block">
        <h3>Pickup and trust</h3>
        <div class="detail-list">
          <span><strong>Owner:</strong> ${item.owner}</span>
          <span><strong>Area:</strong> ${item.city}</span>
          <span><strong>Distance:</strong> ${item.distance} miles away</span>
          <span><strong>Pickup:</strong> ${item.pickup}</span>
          <span><strong>Policy:</strong> ${item.trust}</span>
        </div>
      </div>
    </section>
    <aside class="detail-sidebar">
      <div>
        <p class="eyebrow">Quick action</p>
        <h3>Reserve this item</h3>
        <p class="muted">Request it now and keep the details saved in your dashboard.</p>
      </div>
      <div class="item-actions">
        <button class="button button-primary" type="button" id="book-item-button" data-item-id="${item.id}">
          Request borrow
        </button>
        <button class="button button-secondary" type="button" data-save-item="${item.id}">
          Save item
        </button>
      </div>
      <div class="message" id="item-feedback">No request sent yet.</div>
      <a class="button button-ghost" href="./index.html#browse-section">Back to all items</a>
    </aside>
  `;

  if (relatedRoot) {
    relatedRoot.innerHTML = "";
    items
      .filter((entry) => entry.id !== item.id)
      .slice(0, 3)
      .forEach((entry) => {
        relatedRoot.appendChild(createListingCard(entry));
      });
  }

  const button = document.getElementById("book-item-button");
  const feedback = document.getElementById("item-feedback");
  if (!button || !feedback) {
    return;
  }

  button.addEventListener("click", async () => {
    const profile = await ensureProfile("Create or load your account before requesting an item.");
    if (!profile) {
      return;
    }

    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          profileId: profile.id,
          itemId: item.id
        })
      });
      setElementMessage(feedback, `${item.title} was added to your dashboard requests.`);
    } catch (error) {
      setElementMessage(feedback, error.message, true);
    }
  });
}

async function ensureProfile(message) {
  if (currentProfile()) {
    return currentProfile();
  }

  setFlash(message);
  window.location.href = "./index.html#dashboard-section";
  return null;
}

function renderDashboardGroup(rootId, entries, mode) {
  const root = document.getElementById(rootId);
  if (!root) {
    return;
  }

  root.innerHTML = "";
  if (!entries.length) {
    root.appendChild(createEmptyState("Nothing here yet. Use the marketplace to get started."));
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("article");
    row.className = "table-row";

    if (mode === "booking") {
      row.innerHTML = `
        <div>
          <h3>${entry.title}</h3>
          <p>${entry.price} • ${entry.city} • ${entry.pickup}</p>
        </div>
        <div class="inline-actions">
          <span class="chip">${entry.status}</span>
          <button class="button button-danger" type="button" data-cancel-booking="${entry.itemId}">Cancel</button>
        </div>
      `;
    } else if (mode === "listing") {
      row.innerHTML = `
        <div>
          <h3>${entry.title}</h3>
          <p>${formatPrice(entry)} • ${entry.city} • ${entry.badge}</p>
        </div>
        <div class="inline-actions">
          <a class="button button-secondary" href="./index.html?item=${entry.id}#item-detail-section">View</a>
          <button class="button button-danger" type="button" data-delete-listing="${entry.id}">Remove</button>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div>
          <h3>${entry.title}</h3>
          <p>${formatPrice(entry)} • ${entry.city} • ${entry.distance} mi away</p>
        </div>
        <div class="inline-actions">
          <a class="button button-secondary" href="./index.html?item=${entry.id}#item-detail-section">Open</a>
          <button class="button button-danger" type="button" data-remove-saved="${entry.id}">Remove</button>
        </div>
      `;
    }

    root.appendChild(row);
  });
}

function renderCurrentAccount() {
  const root = document.getElementById("current-account");
  if (!root) {
    return;
  }

  const profile = currentProfile();
  if (!profile) {
    root.innerHTML = `<div class="empty-state">No account connected yet.</div>`;
    return;
  }

  root.innerHTML = `
    <div class="detail-list">
      <span><strong>${profile.name}</strong></span>
      <span><strong>Email:</strong> ${profile.email}</span>
      <span><strong>ZIP:</strong> ${profile.zip || "Not set"}</span>
    </div>
  `;
}

async function renderDashboard() {
  const summaryRoot = document.getElementById("dashboard-summary");
  if (!summaryRoot) {
    return;
  }

  renderCurrentAccount();
  const profile = currentProfile();
  summaryRoot.innerHTML = "";

  if (!profile) {
    summaryRoot.appendChild(
      createEmptyState("Create or load an account to sync saved items, borrow requests, and your listings.")
    );
    renderDashboardGroup("saved-items", [], "saved");
    renderDashboardGroup("bookings", [], "booking");
    renderDashboardGroup("your-listings", [], "listing");
    return;
  }

  try {
    const payload = await apiFetch(`/api/profiles/${profile.id}/dashboard`);
    const dashboard = payload.dashboard;

    summaryRoot.innerHTML = `
      <div class="metric-grid">
        <div class="metric"><strong>${dashboard.savedItems.length}</strong> saved items</div>
        <div class="metric"><strong>${dashboard.bookings.length}</strong> active requests</div>
        <div class="metric"><strong>${dashboard.listings.length}</strong> community listings</div>
      </div>
    `;

    renderDashboardGroup("saved-items", dashboard.savedItems, "saved");
    renderDashboardGroup("bookings", dashboard.bookings, "booking");
    renderDashboardGroup("your-listings", dashboard.listings, "listing");
  } catch (error) {
    summaryRoot.appendChild(createEmptyState(error.message));
  }
}

function setupAccountForm() {
  const form = document.getElementById("account-form");
  const feedback = document.getElementById("account-feedback");
  const signOutButton = document.getElementById("sign-out-button");
  if (!form) {
    return;
  }

  const profile = currentProfile();
  if (profile) {
    const nameField = form.elements.namedItem("name");
    const emailField = form.elements.namedItem("email");
    const zipField = form.elements.namedItem("zip");
    if (nameField instanceof HTMLInputElement) {
      nameField.value = profile.name || "";
    }
    if (emailField instanceof HTMLInputElement) {
      emailField.value = profile.email || "";
    }
    if (zipField instanceof HTMLInputElement) {
      zipField.value = profile.zip || "";
    }
  }

  const flash = consumeFlash();
  if (flash && feedback) {
    setElementMessage(feedback, flash, true);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const zip = String(data.get("zip") || "").trim();

    if (!name || !email) {
      if (feedback) {
        setElementMessage(feedback, "Name and email are required to load your account.", true);
      }
      return;
    }

    try {
      const payload = await apiFetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify({ name, email, zip })
      });
      writeLocalProfile(payload.profile);
      if (feedback) {
        setElementMessage(feedback, "Account connected. Your shared dashboard is ready.");
      }
      renderCurrentAccount();
      renderDashboard();
    } catch (error) {
      if (feedback) {
        setElementMessage(feedback, error.message, true);
      }
    }
  });

  if (signOutButton) {
    signOutButton.addEventListener("click", () => {
      clearLocalProfile();
      if (feedback) {
        setElementMessage(feedback, "You signed out of the shared account.");
      }
      renderCurrentAccount();
      renderDashboard();
      form.reset();
    });
  }
}

function setupListingForm() {
  const form = document.getElementById("listing-form");
  const feedback = document.getElementById("listing-feedback");
  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const profile = await ensureProfile("Create or load your account before publishing a listing.");
    if (!profile) {
      return;
    }

    const data = new FormData(form);
    const payload = {
      profileId: profile.id,
      title: String(data.get("title") || "").trim(),
      category: String(data.get("category") || "").trim(),
      price: Number(data.get("price") || 0),
      city: String(data.get("city") || "").trim(),
      pickup: String(data.get("pickup") || "").trim(),
      description: String(data.get("description") || "").trim()
    };

    if (!payload.title || !payload.category || !payload.price || !payload.city || !payload.pickup || !payload.description) {
      setElementMessage(feedback, "Please fill in every field before publishing.", true);
      return;
    }

    try {
      await apiFetch("/api/items", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.items = null;
      setElementMessage(feedback, `${payload.title} is now live in the marketplace.`);
      form.reset();
    } catch (error) {
      setElementMessage(feedback, error.message, true);
    }
  });
}

function setupSupportForm() {
  const form = document.getElementById("support-form");
  const feedback = document.getElementById("support-feedback");
  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      topic: String(data.get("topic") || "").trim(),
      message: String(data.get("message") || "").trim()
    };

    if (!payload.name || !payload.email || !payload.topic || !payload.message) {
      setElementMessage(feedback, "Please complete every support field before sending.", true);
      return;
    }

    try {
      await apiFetch("/api/support", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      form.reset();
      setElementMessage(feedback, "Your support message was submitted.");
    } catch (error) {
      setElementMessage(feedback, error.message, true);
    }
  });
}

function setupWaitlistForms() {
  document.querySelectorAll("[data-waitlist-form]").forEach((form) => {
    const note = form.querySelector("[data-form-note]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const emailInput = form.querySelector('input[name="email"]');
      const zipInput = form.querySelector('input[name="zip"]');
      const email = emailInput instanceof HTMLInputElement ? emailInput.value.trim() : "";
      const zip = zipInput instanceof HTMLInputElement ? zipInput.value.trim() : "";

      if (!email) {
        setElementMessage(note, "Add an email address to join the waitlist.", true);
        return;
      }

      try {
        await apiFetch("/api/waitlist", {
          method: "POST",
          body: JSON.stringify({ email, zip })
        });
        form.reset();
        setElementMessage(note, "You are on the Borrow Loop waitlist.");
      } catch (error) {
        setElementMessage(note, error.message, true);
      }
    });
  });
}

function setupSaveButtons() {
  document.addEventListener("click", async (event) => {
    const saveButton = event.target.closest("[data-save-item]");
    const removeSavedButton = event.target.closest("[data-remove-saved]");
    const cancelBookingButton = event.target.closest("[data-cancel-booking]");
    const deleteListingButton = event.target.closest("[data-delete-listing]");

    if (saveButton) {
      const profile = await ensureProfile("Create or load your account before saving items.");
      if (!profile) {
        return;
      }

      try {
        await apiFetch("/api/saved", {
          method: "POST",
          body: JSON.stringify({
            profileId: profile.id,
            itemId: saveButton.getAttribute("data-save-item")
          })
        });
        saveButton.textContent = "Saved";
      } catch (error) {
        saveButton.textContent = "Retry save";
      }
    }

    if (removeSavedButton) {
      const profile = currentProfile();
      if (!profile) {
        return;
      }

      try {
        await apiFetch(
          `/api/saved?profileId=${encodeURIComponent(profile.id)}&itemId=${encodeURIComponent(
            removeSavedButton.getAttribute("data-remove-saved")
          )}`,
          { method: "DELETE" }
        );
        renderDashboard();
      } catch (error) {
        return;
      }
    }

    if (cancelBookingButton) {
      const profile = currentProfile();
      if (!profile) {
        return;
      }

      try {
        await apiFetch(
          `/api/bookings?profileId=${encodeURIComponent(profile.id)}&itemId=${encodeURIComponent(
            cancelBookingButton.getAttribute("data-cancel-booking")
          )}`,
          { method: "DELETE" }
        );
        renderDashboard();
      } catch (error) {
        return;
      }
    }

    if (deleteListingButton) {
      const profile = currentProfile();
      if (!profile) {
        return;
      }

      try {
        await apiFetch(
          `/api/items?profileId=${encodeURIComponent(profile.id)}&itemId=${encodeURIComponent(
            deleteListingButton.getAttribute("data-delete-listing")
          )}`,
          { method: "DELETE" }
        );
        state.items = null;
        renderDashboard();
      } catch (error) {
        return;
      }
    }
  });
}

function setupActiveNav() {
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  if (!navLinks.length) {
    return;
  }

  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      if (!href) {
        return null;
      }

      const section = document.querySelector(href);
      return section ? { link, href, section } : null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    if (!sections.length) {
      return;
    }

    const currentHash = window.location.hash;
    let activeEntry = sections[0];
    const scrollMarker = window.scrollY + 160;

    sections.forEach((entry) => {
      if (entry.section.offsetTop <= scrollMarker) {
        activeEntry = entry;
      }
    });

    if (currentHash) {
      const hashEntry = sections.find((entry) => entry.href === currentHash);
      if (hashEntry) {
        activeEntry = hashEntry;
      }
    }

    navLinks.forEach((link) => link.classList.remove("active"));
    activeEntry.link.classList.add("active");
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("hashchange", updateActiveLink);
  updateActiveLink();
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) {
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    nodes.forEach((node, index) => {
      node.style.transitionDelay = `${index * 60}ms`;
      observer.observe(node);
    });
  } else {
    nodes.forEach((node) => node.classList.add("visible"));
  }
}

function setupRotator() {
  const rotator = document.getElementById("search-rotator");
  if (!rotator) {
    return;
  }

  const labels = ["Power drill", "Projector kit", "Pressure washer", "Weekend tent"];
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % labels.length;
    rotator.textContent = labels[index];
  }, 2400);
}

async function initApp() {
  setupActiveNav();
  setupReveal();
  setupRotator();
  setupAccountForm();
  setupListingForm();
  setupSupportForm();
  setupWaitlistForms();
  setupSaveButtons();
  await Promise.all([renderFeaturedGrid(), renderBrowsePage(), renderItemPage(), renderDashboard()]);
}

initApp();
