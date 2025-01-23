function openLoader() {
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");
}

function closeLoader() {
  const loader = document.getElementById("loader");
  loader.classList.add("hidden");
}

async function loadTranslations(language) {
  try {
    const response = await fetch(`${language}.json`);
    if (!response.ok) throw new Error("Failed to load translations");

    const translations = await response.json();
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const translationKey = element.getAttribute("data-i18n");
      const keys = translationKey.split(".");
      let translatedText = translations;

      keys.forEach((key) => {
        translatedText = translatedText[key] || translationKey;
      });

      element.textContent = translatedText;
    });
  } catch (error) {
    console.error("Error loading translations:", error);
  }
}

async function initializePreferences() {
  openLoader();
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const systemLanguage = navigator.language.startsWith("pt")
    ? "pt"
    : navigator.language.startsWith("de")
      ? "de"
      : "en";

  const storedTheme =
    localStorage.getItem("theme") || (systemPrefersDark ? "dark" : "light");
  const storedLanguage = localStorage.getItem("language") || systemLanguage;

  const logo = document.querySelector(".navbar-brand img");
  const modeToggle = document.getElementById("mode-toggle");
  modeToggle.checked = storedTheme === "dark";
  await applyTheme(storedTheme);

  await setLanguage(storedLanguage);
  document.querySelectorAll(".language-button").forEach((button) => {
    button.classList.toggle("active", button.id === `lang-${storedLanguage}`);
  });

  await loadTranslations(storedLanguage);
  closeLoader();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

async function applyTheme(theme) {
  const navbar = document.querySelector(".navbar");
  const logo = document.querySelector(".navbar-brand img");
  document.body.classList.toggle("dark-mode", theme === "dark");
  document.body.classList.toggle("light-mode", theme === "light");
  navbar.classList.toggle("navbar-dark", theme === "dark");
  navbar.classList.toggle("navbar-light", theme === "light");

  const logoSrc = theme === "dark" ? "Branco.png" : "Preto.png";

  try {
    await loadImage(logoSrc);
    logo.src = logoSrc;
  } catch (error) {
    console.error(error.message);
  }

  localStorage.setItem("theme", theme);
}

document.getElementById("mode-toggle").addEventListener("change", function () {
  openLoader();
  applyTheme(this.checked ? "dark" : "light");
  closeLoader();
});

async function setLanguage(language) {
  localStorage.setItem("language", language);
  await loadTranslations(language);
}

document.querySelectorAll(".language-button").forEach((button) => {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".language-button")
      .forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    setLanguage(this.id.split("-")[1]);
  });
});

async function fetchMediumArticles() {
  const rss_url = "https://dev.to/feed/ruivalim";
  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rss_url}`)
    .then((response) => response.json())
    .then((data) => {
      data.items.forEach((post) => {
        console.log(post);
        document.getElementById("articles").innerHTML += `
        <div class="row">
          <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <div class="card-body">
               <h5 class="card-title">${post.title}</h5>
                <p class="card-text">
                  ${post.description.slice(0, 200)}...
                </p>
                <a
                  href="${post.link}"
                  class="btn btn-dark"
                  target="_blank">
                  Continue Reading
                </a>
            </div>
          </div>
        </div>
      </div>
        `;
      });
    });
}

async function fetchGitHubRepos() {
  try {
    const response = await fetch(
      `https://api.github.com/users/Ruivalim/repos?sort=updated`,
    );
    if (!response.ok) throw new Error("Failed to fetch repositories");

    const repos = await response.json();
    const randomRepos = repos.sort(() => 0.5 - Math.random()).slice(0, 9);
    const repoList = document.getElementById("repo-list");

    randomRepos.forEach((repo) => {
      const repoCard = document.createElement("div");
      repoCard.className = "col-md-4 mb-4";

      repoCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || "No description available."}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${repo.html_url}" class="btn btn-dark" target="_blank">View on GitHub</a>
                    </div>
                </div>
            `;

      repoList.appendChild(repoCard);
    });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = `<p>Unable to load repositories. Please try again later.</p>`;
  }
}

document.querySelectorAll(".nav-link").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetSection = document.querySelector(this.getAttribute("href"));
    const offsetPosition =
      targetSection.getBoundingClientRect().top +
      window.pageYOffset -
      document.querySelector(".navbar").offsetHeight -
      10;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  });
});

window.addEventListener("load", async function () {
  await initializePreferences();
  await fetchMediumArticles();
  await fetchGitHubRepos();
});
