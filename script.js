// 示例歌曲数据
const songs = [
    {
        id: 1,
        title: "夜曲",
        artist: "周杰伦",
        duration: "3:42",
        cover: "./public/night-music-album-cover.png",
        audioSrc: "./music/Xai小爱 - 夜曲.mp3",
        lyricsFile: "./music/夜曲.lrc",
    },
    {
        id: 2,
        title: "稻香",
        artist: "周杰伦",
        duration: "3:43",
        cover: "./public/countryside-music-album-cover.jpg",
        audioSrc: "./music/Lucky小爱 - 稻香(深情版).mp3",
        lyricsFile: "./music/稻香.lrc",
    },
    {
        id: 3,
        title: "晴天",
        artist: "周杰伦",
        duration: "4:29",
        cover: "./public/sunny-day-music-album-cover.jpg",
        audioSrc: "./music/Lucky小爱 - 晴天(深情版).mp3",
        lyricsFile: "./music/晴天.lrc",
    },
    {
        id: 4,
        title: "七里香",
        artist: "周杰伦",
        duration: "5:05",
        cover: "./public/romantic-music-album-cover.jpg",
        audioSrc: "./music/Xai小爱 - 七里香.mp3",
        lyricsFile: "./music/七里香.lrc",
    },
    {
        id: 5,
        title: "青花瓷",
        artist: "周杰伦",
        duration: "3:58",
        cover: "./public/chinese-porcelain-music-album-cover.jpg",
        audioSrc: "./music/刘芳 - 青花瓷.mp3",
        lyricsFile: "./music/青花瓷.lrc",
    },
];

// 全局状态
let currentSongIndex = 0;
let isPlaying = false;
const favorites = new Set();
let currentLyrics = [];

// DOM元素
const audioPlayer = document.getElementById("audioPlayer");
const albumCover = document.getElementById("albumCover");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const playlistContainer = document.getElementById("playlistContainer");
const lyricsContainer = document.getElementById("lyricsContainer");
const btnPlayPause = document.getElementById("btnPlayPause");
const btnPrevious = document.getElementById("btnPrevious");
const btnNext = document.getElementById("btnNext");
const btnFavorites = document.getElementById("btnFavorites");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const progressBar = document.getElementById("progressBar");
const progressFilled = document.getElementById("progressFilled");
const progressThumb = document.getElementById("progressThumb");
const volumeSlider = document.getElementById("volumeSlider");

// 初始化
function init() {
    renderPlaylist();
    loadSong(0);
    setupEventListeners();

    // 设置初始音量
    audioPlayer.volume = volumeSlider.value / 100;
}

// 渲染播放列表
function renderPlaylist() {
    playlistContainer.innerHTML = songs
        .map(
            (song, index) => `
        <div class="playlist-item" data-index="${index}">
            <span class="index">${index + 1}</span>
            <span class="song-name">${song.title}</span>
            <span class="artist">${song.artist}</span>
            <span class="duration">${song.duration}</span>
            <button class="favorite-btn" data-id="${song.id}">
                ${favorites.has(song.id) ? "♥" : "♡"}
            </button>
        </div>
    `
        )
        .join("");
}

// 加载歌曲
function loadSong(index) {
    const song = songs[index];
    currentSongIndex = index;

    console.log("[v0] 正在加载歌曲:", song.title, "索引:", index);
    console.log("[v0] 音频路径:", song.audioSrc);
    console.log("[v0] 歌词路径:", song.lyricsFile);
    console.log("[v0] 封面路径:", song.cover);

    // 更新UI
    albumCover.src = song.cover;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    // 加载音频
    audioPlayer.src = song.audioSrc;

    audioPlayer.onerror = () => {
        console.error("[v0] 音频加载失败:", song.audioSrc);
        console.error("[v0] 错误代码:", audioPlayer.error?.code);
        console.error("[v0] 错误信息:", audioPlayer.error?.message);
    };

    audioPlayer.onloadeddata = () => {
        console.log("[v0] 音频加载成功:", song.title);
    };

    // 从文件加载歌词
    loadLyricsFromFile(song.lyricsFile);

    // 更新播放列表高亮
    updatePlaylistHighlight();
}

// 新函数从.lrc文件加载歌词
async function loadLyricsFromFile(lyricsFile) {
    try {
        console.log("[v0] 正在加载歌词文件:", lyricsFile);
        const response = await fetch(lyricsFile);
        console.log("[v0] 歌词文件响应状态:", response.status);

        if (!response.ok) {
            throw new Error(`歌词文件不存在: ${response.status}`);
        }

        const lrcText = await response.text();
        console.log("[v0] 歌词内容长度:", lrcText.length);
        console.log("[v0] 歌词内容前100字符:", lrcText.substring(0, 100));

        parseLyrics(lrcText);
    } catch (error) {
        console.error("[v0] 加载歌词失败:", error);
        lyricsContainer.innerHTML = '<p class="no-lyrics">暂无歌词</p>';
        currentLyrics = [];
    }
}

// 解析歌词
function parseLyrics(lrcText) {
    if (!lrcText) {
        lyricsContainer.innerHTML = '<p class="no-lyrics">暂无歌词</p>';
        currentLyrics = [];
        return;
    }

    const lines = lrcText.split("\n");
    currentLyrics = [];

    console.log("[v0] 开始解析歌词，总行数:", lines.length);

    lines.forEach((line, index) => {
        // 支持 [mm:ss.xx] 和 [mm:ss.xxx] 格式
        const match =
            line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/) ||
            line.match(/\[(\d{2}):(\d{2})\](.*)/);

        if (match) {
            const minutes = Number.parseInt(match[1]);
            const seconds = Number.parseInt(match[2]);
            const time = minutes * 60 + seconds;
            const text = (match[4] || match[3] || "").trim();

            if (text) {
                currentLyrics.push({ time, text });
                if (index < 3) {
                    console.log("[v0] 解析到歌词:", { time, text });
                }
            }
        }
    });

    console.log("[v0] 解析完成，共", currentLyrics.length, "行歌词");

    // 渲染歌词
    if (currentLyrics.length === 0) {
        lyricsContainer.innerHTML = '<p class="no-lyrics">歌词格式不正确</p>';
    } else {
        lyricsContainer.innerHTML = currentLyrics
            .map(
                (lyric, index) =>
                    `<p class="lyric-line" data-time="${lyric.time}" data-index="${index}">${lyric.text}</p>`
            )
            .join("");
    }
}

// 更新播放列表高亮
function updatePlaylistHighlight() {
    document.querySelectorAll(".playlist-item").forEach((item, index) => {
        item.classList.toggle("active", index === currentSongIndex);
    });
}

// 播放/暂停切换
function togglePlayPause() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

// 播放
function play() {
    audioPlayer.play();
    isPlaying = true;
    albumCover.classList.add("rotating");
    document.querySelector(".play-icon").classList.add("hidden");
    document.querySelector(".pause-icon").classList.remove("hidden");
}

// 暂停
function pause() {
    audioPlayer.pause();
    isPlaying = false;
    albumCover.classList.remove("rotating");
    document.querySelector(".play-icon").classList.remove("hidden");
    document.querySelector(".pause-icon").classList.add("hidden");
}

// 上一首
function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        play();
    }
}

// 下一首
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        play();
    }
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 更新进度条
function updateProgress() {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    if (duration) {
        const percentage = (current / duration) * 100;
        progressFilled.style.width = `${percentage}%`;
        progressThumb.style.left = `${percentage}%`;
        currentTime.textContent = formatTime(current);

        // 更新歌词高亮
        updateLyricsHighlight(current);
    }
}

// 更新歌词高亮
function updateLyricsHighlight(currentTime) {
    const lyricLines = document.querySelectorAll(".lyric-line");
    let activeIndex = -1;

    for (let i = 0; i < currentLyrics.length; i++) {
        if (currentTime >= currentLyrics[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }

    lyricLines.forEach((line, index) => {
        if (index === activeIndex) {
            line.classList.add("active");
            // 自动滚动到当前歌词
            line.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            line.classList.remove("active");
        }
    });
}

// 设置进度
function setProgress(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioPlayer.duration;

    if (!isNaN(newTime)) {
        audioPlayer.currentTime = newTime;
    }
}

// 切换收藏
function toggleFavorite(songId) {
    if (favorites.has(songId)) {
        favorites.delete(songId);
    } else {
        favorites.add(songId);
    }
    renderPlaylist();
}

// 显示收藏夹
function showFavorites() {
    const favoriteSongs = songs.filter((song) => favorites.has(song.id));

    if (favoriteSongs.length === 0) {
        alert("收藏夹为空");
        return;
    }

    playlistContainer.innerHTML = favoriteSongs
        .map((song, index) => {
            const originalIndex = songs.findIndex((s) => s.id === song.id);
            return `
            <div class="playlist-item" data-index="${originalIndex}">
                <span class="index">${index + 1}</span>
                <span class="song-name">${song.title}</span>
                <span class="artist">${song.artist}</span>
                <span class="duration">${song.duration}</span>
                <button class="favorite-btn favorited" data-id="${
                    song.id
                }">♥</button>
            </div>
        `;
        })
        .join("");
}

// 设置事件监听
function setupEventListeners() {
    // 播放控制
    btnPlayPause.addEventListener("click", togglePlayPause);
    btnPrevious.addEventListener("click", previousSong);
    btnNext.addEventListener("click", nextSong);
    btnFavorites.addEventListener("click", () => {
        if (btnFavorites.textContent === "收藏夹") {
            showFavorites();
            btnFavorites.textContent = "全部歌曲";
        } else {
            renderPlaylist();
            btnFavorites.textContent = "收藏夹";
        }
    });

    // 音频事件
    audioPlayer.addEventListener("timeupdate", updateProgress);
    audioPlayer.addEventListener("loadedmetadata", () => {
        totalTime.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener("ended", nextSong);

    // 进度条点击
    progressBar.addEventListener("click", setProgress);

    // 音量控制
    volumeSlider.addEventListener("input", (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    // 播放列表点击
    playlistContainer.addEventListener("click", (e) => {
        const playlistItem = e.target.closest(".playlist-item");
        if (playlistItem) {
            const index = Number.parseInt(playlistItem.dataset.index);
            console.log("[v0] 点击播放列表项，索引:", index);
            loadSong(index);
            play();
        }

        // 收藏按钮
        const favoriteBtn = e.target.closest(".favorite-btn");
        if (favoriteBtn) {
            e.stopPropagation();
            const songId = Number.parseInt(favoriteBtn.dataset.id);
            toggleFavorite(songId);
        }
    });

    // 歌词点击跳转
    lyricsContainer.addEventListener("click", (e) => {
        const lyricLine = e.target.closest(".lyric-line");
        if (lyricLine) {
            const time = Number.parseFloat(lyricLine.dataset.time);
            audioPlayer.currentTime = time;
            if (!isPlaying) {
                play();
            }
        }
    });
}

// 启动应用
init();
