// Kullanıcı Yönetimi
const USER_STORAGE_KEY = 'movision_users';
const CURRENT_USER_KEY = 'current_user';
const API_KEY = '44a3623f88e8e631f4368a5ce760fa57';

// API URL'leri
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Mesaj kutusu oluştur
function showMessage(message, type = 'success') {
    const messageBox = document.createElement('div');
    messageBox.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    messageBox.style.zIndex = '9999';
    messageBox.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

// Kullanıcı verilerini local storage'dan al
function getUsers() {
    const usersJson = localStorage.getItem(USER_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

// Kullanıcı verilerini local storage'a kaydet
function saveUsers(users) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

// Giriş yapmış kullanıcıyı kaydet
function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Giriş yapmış kullanıcıyı al
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// Kullanıcı çıkış yap
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    updateAuthUI();
    showMessage('Başarıyla çıkış yaptınız!');
}

// Kullanıcı arayüzünü güncelle
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    
    if (currentUser) {
        authButtons.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-warning dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                    <div class="avatar me-2">
                        <i class="fas fa-user-circle" style="font-size: 24px;"></i>
                    </div>
                    ${currentUser.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Çıkış Yap
                    </a></li>
                </ul>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-warning me-2" data-bs-toggle="modal" data-bs-target="#loginModal" id="loginButton">Giriş Yap</button>
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#registerModal">Kayıt Ol</button>
        `;
    }
}

// Film ve dizi verilerini çek
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        displayMovies(data.results, 'movie-list');
    } catch (error) {
        console.error('Film verileri çekilirken hata oluştu:', error);
    }
}

async function fetchTrendingTVShows() {
    try {
        const response = await fetch(`${API_BASE_URL}/trending/tv/day?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        displayMovies(data.results, 'tv-show-list', true);
    } catch (error) {
        console.error('Dizi verileri çekilirken hata oluştu:', error);
    }
}

async function fetchUpcomingMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        displayMovies(data.results, 'upcoming-movie-list');
    } catch (error) {
        console.error('Yakında gelecek filmler çekilirken hata oluştu:', error);
    }
}

async function fetchAiringTodayTVShows() {
    try {
        const response = await fetch(`${API_BASE_URL}/tv/airing_today?api_key=${API_KEY}&language=tr-TR`);
        const data = await response.json();
        displayMovies(data.results, 'upcoming-tv-list', true);
    } catch (error) {
        console.error('Bugün yayınlanacak diziler çekilirken hata oluştu:', error);
    }
}

// Film ve dizileri görüntüle
function displayMovies(movies, containerId, isTV = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'card bg-dark text-white';
        card.style.width = '250px';
        card.style.margin = '0 10px';
        card.style.cursor = 'pointer';

        const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/250x375?text=Poster+Yok';
        
        card.innerHTML = `
            <img src="${posterPath}" class="card-img-top" alt="${isTV ? movie.name : movie.title}">
            <div class="card-body">
                <h5 class="card-title">${isTV ? movie.name : movie.title}</h5>
                <p class="card-text">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'Açıklama bulunmuyor.'}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-warning">
                        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                    </span>
                    <button class="btn btn-sm btn-outline-warning" onclick="show${isTV ? 'TV' : 'Movie'}Details(${movie.id})">
                        Detaylar
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Film detaylarını göster
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR`);
        const movie = await response.json();
        
        document.getElementById('movie-poster').src = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=Poster+Yok';
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-overview').textContent = movie.overview;
        document.getElementById('movie-rating').textContent = movie.vote_average.toFixed(1);
        
        const modal = new bootstrap.Modal(document.getElementById('movieModal'));
        modal.show();
    } catch (error) {
        console.error('Film detayları çekilirken hata oluştu:', error);
    }
}

// Dizi detaylarını göster
async function showTVDetails(tvId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=tr-TR`);
        const tvShow = await response.json();
        
        document.getElementById('tv-poster').src = tvShow.poster_path ? `${IMAGE_BASE_URL}${tvShow.poster_path}` : 'https://via.placeholder.com/500x750?text=Poster+Yok';
        document.getElementById('tv-title').textContent = tvShow.name;
        document.getElementById('tv-overview').textContent = tvShow.overview;
        document.getElementById('tv-rating').textContent = tvShow.vote_average.toFixed(1);
        
        const modal = new bootstrap.Modal(document.getElementById('tvModal'));
        modal.show();
    } catch (error) {
        console.error('Dizi detayları çekilirken hata oluştu:', error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Arama işlemleri
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');

    if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    }

    if (searchButton) {
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const selectedType = searchType.value;

        if (searchTerm) {
            window.location.href = `movie-details.html?query=${encodeURIComponent(searchTerm)}&type=${selectedType}`;
        } else {
            showMessage('Lütfen bir arama terimi girin!', 'warning');
        }
    }

    // Giriş formu işleme
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                setCurrentUser(user);
                showMessage('Giriş başarılı! Hoş geldiniz, ' + user.name);
                $('#loginModal').modal('hide');
                updateAuthUI();
            } else {
                showMessage('E-posta veya şifre hatalı!', 'danger');
            }
        });
    }

    // Kayıt formu işleme
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

            if (password !== passwordConfirm) {
                showMessage('Şifreler eşleşmiyor!', 'danger');
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === email)) {
                showMessage('Bu e-posta adresi zaten kayıtlı!', 'warning');
                return;
            }

            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);
            setCurrentUser(newUser);

            showMessage('Kayıt başarılı! Hoş geldiniz, ' + name);
            $('#registerModal').modal('hide');
            updateAuthUI();
        });
    }

    // Giriş yap butonuna tıklandığında kontrol et
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            const users = getUsers();
            if (users.length === 0) {
                e.preventDefault();
                showMessage('Lütfen önce kayıt olun!', 'info');
                $('#registerModal').modal('show');
            }
        });
    }

    // Sayfa yüklendiğinde verileri çek
    fetchTrendingMovies();
    fetchTrendingTVShows();
    fetchUpcomingMovies();
    fetchAiringTodayTVShows();
    updateAuthUI();
});
