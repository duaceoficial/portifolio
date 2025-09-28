
let currentlyPlaying = null;

function togglePlay(audioId) {
    console.log("Função togglePlay chamada para:", audioId);
    
    const audio = document.getElementById(audioId);
    console.log("Audio element:", audio);
    
    if (!audio) {
        console.error("Audio não encontrado:", audioId);
        return;
    }
    
    const playBtn = audio.parentElement.querySelector('.play-btn');
    console.log("Play button:", playBtn);
    
    // Pause all other audios
    document.querySelectorAll('audio').forEach(a => {
        if (a.id !== audioId && !a.paused) {
            a.pause();
            const btn = a.parentElement.querySelector('.play-btn');
            if (btn) btn.innerHTML = '▶';
        }
    });
    
    if (audio.paused) {
        console.log("Tentando dar play...");
        audio.play().then(() => {
            console.log("Play bem-sucedido!");
            playBtn.innerHTML = '⏸';
            currentlyPlaying = audioId;
        }).catch(error => {
            console.error("Erro ao dar play:", error);
            alert("Erro ao reproduzir áudio: " + error.message);
        });
    } else {
        console.log("Pausando áudio...");
        audio.pause();
        playBtn.innerHTML = '▶';
        currentlyPlaying = null;
    }
}

function setVolume(audioId, volume) {
    const audio = document.getElementById(audioId);
    if (audio) {
        audio.volume = volume / 100;
    }
}

function setProgress(event, audioId) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function loadTrack(audioId, title, src, trackNumber) {
    const audio = document.getElementById(audioId);
    const titleElement = document.getElementById(`track-title-${audioId.slice(-1)}`);
    const playBtn = audio.parentElement.querySelector('.play-btn');
    const playlistItem = audio.closest('.playlist-item');
    
    // Update track info
    audio.src = src;
    if (titleElement) titleElement.textContent = title;
    
    // Update active track
    if (playlistItem) {
        playlistItem.querySelectorAll('.track-item').forEach(item => {
            item.classList.remove('active');
        });
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    }
    
    // Reset play button
    if (playBtn) playBtn.innerHTML = '▶';
    
    // Load the new track
    audio.load();
}

// Initialize audio players
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, inicializando players...");
    
    document.querySelectorAll('audio').forEach((audio, index) => {
        const playerNumber = index + 1;
        console.log(`Inicializando audio ${playerNumber}:`, audio.src);
        
        audio.addEventListener('loadedmetadata', function() {
            console.log(`Audio ${playerNumber} metadata carregada`);
            const durationElement = document.getElementById(`duration-${playerNumber}`);
            if (durationElement) {
                durationElement.textContent = formatTime(this.duration);
            }
        });
        
        audio.addEventListener('timeupdate', function() {
            const currentTimeElement = document.getElementById(`current-time-${playerNumber}`);
            const progressElement = document.getElementById(`progress-${playerNumber}`);
            
            if (currentTimeElement && progressElement) {
                currentTimeElement.textContent = formatTime(this.currentTime);
                const percent = (this.currentTime / this.duration) * 100;
                progressElement.style.width = percent + '%';
            }
        });
        
        audio.addEventListener('ended', function() {
            const playBtn = this.parentElement.querySelector('.play-btn');
            if (playBtn) playBtn.innerHTML = '▶';
            currentlyPlaying = null;
        });
        
        audio.addEventListener('error', function(e) {
            console.error(`Erro no audio ${playerNumber}:`, e);
        });
    });
    
    // Animate section header
    const header = document.querySelector('.section-header');
    if (header) {
        setTimeout(() => {
            header.classList.add('animate-in');
        }, 500);
    }
});

console.log("JavaScript carregado com sucesso!");
