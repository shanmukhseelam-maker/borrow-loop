const borrowItems = [
  "Power drill",
  "High-end blender",
  "Camping tent",
  "Pressure washer",
  "Projector kit"
];

document.documentElement.classList.add("js-ready");

const rotator = document.getElementById("search-rotator");
const revealNodes = document.querySelectorAll(".reveal");
const waitlistForm = document.querySelector(".waitlist-form");
const formNote = document.querySelector(".form-note");

if (rotator) {
  let index = 0;

  window.setInterval(() => {
    index = (index + 1) % borrowItems.length;
    rotator.textContent = borrowItems[index];
  }, 2400);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16
    }
  );

  revealNodes.forEach((node, nodeIndex) => {
    node.style.transitionDelay = `${nodeIndex * 70}ms`;
    revealObserver.observe(node);
  });
} else {
  revealNodes.forEach((node) => {
    node.classList.add("visible");
  });
}

if (waitlistForm && formNote) {
  waitlistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = waitlistForm.elements.namedItem("email");

    if (!(email instanceof HTMLInputElement) || !email.value.trim()) {
      formNote.textContent = "Add an email address to request an invite.";
      return;
    }

    formNote.textContent = "Thanks. You are on the list for early Borrow Loop access.";
    waitlistForm.reset();
  });
}
