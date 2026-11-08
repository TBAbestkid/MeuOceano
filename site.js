/* Shared interactions. No external runtime is required. */
const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  menu?.setAttribute("aria-expanded", "false");
  navigation?.classList.remove("is-open");
}
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
});
document.addEventListener("click", (event) => {
  if (event.target.closest("a[href]")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menu?.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menu.focus();
  }
});
document.querySelectorAll("[data-expand]").forEach((button) =>
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "Recolher imagens" : "Ver mais imagens";
    document.getElementById(button.dataset.expand).hidden = !expanded;
  }),
);
document.querySelectorAll(".carousel").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll(".slide")];
  let index = 0;
  function move(step) {
    slides[index].hidden = true;
    index = (index + step + slides.length) % slides.length;
    slides[index].hidden = false;
    carousel.querySelector(".slide-count").textContent =
      `${index + 1} / ${slides.length}`;
  }
  carousel
    .querySelectorAll("[data-step]")
    .forEach((button) =>
      button.addEventListener("click", () => move(Number(button.dataset.step))),
    );
  carousel.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
});
const reader = document.querySelector("#reader");
let controller,
  requestId = 0,
  readerTrigger;
if (reader) {
  const content = document.querySelector("#reader-content");
  const image = document.querySelector("#reader-image");
  const fallback = document.querySelector("#reader-fallback");
  async function openReading(trigger) {
    controller?.abort();
    controller = new AbortController();
    const id = ++requestId;
    readerTrigger = trigger;
    document.querySelector("#reader-title").textContent = trigger.dataset.title;
    content.replaceChildren();
    content.setAttribute("aria-busy", "true");
    content.textContent = "Carregando leitura…";
    image.hidden = !trigger.dataset.image;
    image.removeAttribute("src");
    if (trigger.dataset.image) {
      image.src = trigger.dataset.image;
      image.alt = `Ilustração de ${trigger.dataset.title}`;
    }
    fallback.hidden = !trigger.dataset.file;
    fallback.removeAttribute("href");
    if (trigger.dataset.file) fallback.href = trigger.dataset.file;
    if (!reader.open) reader.showModal();
    reader.querySelector("[data-close]").focus();
    try {
      let html =
        trigger.dataset.content ||
        "Ainda estou desenvolvendo essa ideia. Volte pra acompanhar as novidades.";
      if (trigger.dataset.file) {
        const response = await fetch(trigger.dataset.file, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Falha na leitura");
        html = await response.text();
      }
      if (id !== requestId || !reader.open) return;
      // Only author-owned local fragments and inline author text are inserted here.
      content.innerHTML = html;
    } catch (error) {
      if (id !== requestId || error.name === "AbortError") return;
      content.textContent =
        "Não consegui carregar o texto. Tente abrir de novo ou use o link para ler em outra página.";
    } finally {
      if (id === requestId) content.setAttribute("aria-busy", "false");
    }
  }
  document
    .querySelectorAll(".read-trigger")
    .forEach((trigger) =>
      trigger.addEventListener("click", () => openReading(trigger)),
    );
  reader.addEventListener("close", () => {
    controller?.abort();
    ++requestId;
    content.replaceChildren();
    content.setAttribute("aria-busy", "false");
    readerTrigger?.focus();
  });
}
const viewer = document.querySelector("#art-viewer");
let artTrigger;
document.querySelectorAll("[data-art]").forEach((button) =>
  button.addEventListener("click", () => {
    artTrigger = button;
    document.querySelector("#art-title").textContent = button.dataset.title;
    const image = document.querySelector("#art-image");
    image.src = button.dataset.art;
    image.alt = button.dataset.title;
    document.querySelector("#art-original").href = button.dataset.art;
    viewer.showModal();
    viewer.querySelector("[data-close]").focus();
  }),
);
viewer?.addEventListener("close", () => {
  document.querySelector("#art-image").removeAttribute("src");
  artTrigger?.focus();
});
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelectorAll("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const b = dialog.getBoundingClientRect();
      if (
        event.clientX < b.left ||
        event.clientX > b.right ||
        event.clientY < b.top ||
        event.clientY > b.bottom
      )
        dialog.close();
    }
  });
});
