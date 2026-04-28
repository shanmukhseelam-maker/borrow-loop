
      </div>
    </div>
    <div class="inline-actions">
      <a class="button button-primary" href="./item.html?item=${item.id}">View item</a>
      <a class="button button-primary" href="./index.html?item=${item.id}#item-detail-section">View item</a>
      ${
        options.secondaryButton === "save"
          ? `<button class="button button-secondary" type="button" data-save-item="${item.id}">Save</button>`
          : `<a class="button button-secondary" href="./browse.html?category=${encodeURIComponent(item.category)}">More ${item.category}</a>`
          : `<a class="button button-secondary" href="./index.html?category=${encodeURIComponent(item.category)}#browse-section">More ${item.category}</a>`
      }
    </div>
  `;
        </button>
      </div>
      <div class="message" id="item-feedback">No request sent yet.</div>
      <a class="button button-ghost" href="./browse.html">Back to all items</a>
      <a class="button button-ghost" href="./index.html#browse-section">Back to all items</a>
    </aside>
  `;

  }

  setFlash(message);
  window.location.href = "./dashboard.html";
  window.location.href = "./index.html#dashboard-section";
  return null;
}

          <p>${formatPrice(entry)} • ${entry.city} • ${entry.badge}</p>
        </div>
        <div class="inline-actions">
          <a class="button button-secondary" href="./item.html?item=${entry.id}">View</a>
          <a class="button button-secondary" href="./index.html?item=${entry.id}#item-detail-section">View</a>
          <button class="button button-danger" type="button" data-delete-listing="${entry.id}">Remove</button>
        </div>
      `;
          <p>${formatPrice(entry)} • ${entry.city} • ${entry.distance} mi away</p>
        </div>
        <div class="inline-actions">
          <a class="button button-secondary" href="./item.html?item=${entry.id}">Open</a>
          <a class="button button-secondary" href="./index.html?item=${entry.id}#item-detail-section">Open</a>
          <button class="button button-danger" type="button" data-remove-saved="${entry.id}">Remove</button>
        </div>
      `;
