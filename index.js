function openLoader() {
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
}

function closeLoader() {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
}

async function loadTranslations(language) {
    try {
        const response = await fetch(`${language}.json`);
        if (!response.ok) throw new Error('Failed to load translations');

        const translations = await response.json();
        document.querySelectorAll('[data-i18n]').forEach(element => {
            console.log(element)
            const translationKey = element.getAttribute('data-i18n');
            const keys = translationKey.split('.');
            let translatedText = translations;

            keys.forEach(key => {
                translatedText = translatedText[key] || translationKey;
            });

            element.textContent = translatedText;
        });
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

async function initializePreferences() {
    openLoader();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemLanguage = navigator.language.startsWith('pt') ? 'pt' : 'en';

    const storedTheme = localStorage.getItem('theme') || (systemPrefersDark ? 'dark' : 'light');
    const storedLanguage = localStorage.getItem('language') || systemLanguage;

    const logo = document.querySelector('.navbar-brand img');
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        logo.src = 'Branco.png'; 
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        logo.src = 'Preto.png';
    }

    await loadTranslations(storedLanguage);
    document.getElementById('toggle-language').textContent = storedLanguage === 'pt' ? 'EN / PT' : 'PT / EN';
    closeLoader();
}

async function fetchGitHubRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/Ruivalim/repos?sort=updated`);
        if (!response.ok) throw new Error('Failed to fetch repositories');

        const repos = await response.json();
        const randomRepos = repos.sort(() => 0.5 - Math.random()).slice(0, 9);
        const repoList = document.getElementById('repo-list');

        randomRepos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'col-md-4 mb-4';

            repoCard.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || 'No description available.'}</p>
                    </div>
                    <div class="card-footer">
                        <a href="${repo.html_url}" class="btn btn-dark" target="_blank">View on GitHub</a>
                    </div>
                </div>
            `;

            repoList.appendChild(repoCard);
        });
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        const repoList = document.getElementById('repo-list');
        repoList.innerHTML = `<p>Unable to load repositories. Please try again later.</p>`;
    }
}

document.getElementById('toggle-mode').addEventListener('click', function() {
    openLoader();
    const logo = document.querySelector('.navbar-brand img');

    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        logo.src = 'Preto.png';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        logo.src = 'Branco.png'; 
        localStorage.setItem('theme', 'dark');
    }
    closeLoader();
});

document.getElementById('toggle-language').addEventListener('click', function() {
    const currentLanguage = localStorage.getItem('language') || 'en';
    const newLanguage = currentLanguage === 'en' ? 'pt' : 'en';

    this.textContent = newLanguage === 'pt' ? 'EN / PT' : 'PT / EN';

    localStorage.setItem('language', newLanguage);
    loadTranslations(newLanguage);
});

document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetSection = document.querySelector(this.getAttribute('href'));

        const offsetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - document.querySelector('.navbar').offsetHeight - 10;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

async function loadImages() {
    const gallery = document.getElementById('photo-gallery');
    const spinner = document.getElementById('loading-spinner');

    try {
        spinner.style.display = 'block';

        const response = await fetch("/photography.json");
        if (!response.ok) throw new Error('Failed to load images.');

        const images = await response.json();

        if(images.length === 0){
            spinner.style.display = 'none';
            gallery.innerHTML = '<p>No data to display now.</p>';
            return;
        }

        gallery.innerHTML = '';
        spinner.style.display = 'none';

        const randomImages = images.sort(() => 0.5 - Math.random()).slice(0, 9);

        randomImages.forEach(image => {
            const card = document.createElement('div');
            card.className = 'col-md-4';

            card.innerHTML = `
                <div class="gallery-card">
                    <img src="${image.src}" alt="Photography Image" class="card-img-top">
                </div>
            `;

            card.querySelector('img').addEventListener('click', () => openModal(image));
            gallery.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading images:', error);
        spinner.style.display = 'none';
        gallery.innerHTML = '<p>Unable to load images. Please try again later.</p>';
    }
}

function openModal(image) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');
    modalImage.src = image.src;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open'); 
    if(image.description == null){
        modalDescription.classList.add("hidden");
    }else{
        modalDescription.classList.remove("hidden");
        modalDescription.innerText = image.description;
    }
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

document.getElementById('close-modal').addEventListener('click', closeModal);

window.addEventListener('load', async function() {
    await initializePreferences();
    await fetchGitHubRepos();
    await loadImages();
});
