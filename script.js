// 示例歌曲数据
const songs = [
  {
    id: 1,
    title: "夜曲",
    artist: "周杰伦",
    duration: "3:42",
    cover: "/night-music-album-cover.png",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    lyrics: `[00:00.00]夜曲 - 周杰伦
[00:15.50]一群嗜血的蚂蚁
[00:18.00]被腐肉所吸引
[00:20.50]我面无表情
[00:23.00]看孤独的风景
[00:25.50]失去你爱恨开始分明
[00:30.00]失去你还有什么事好关心
[00:35.00]当鸽子不再象征和平
[00:40.00]我终于被提醒
[00:45.00]广场上喂食的是秃鹰`,
  },
  {
    id: 2,
    title: "稻香",
    artist: "周杰伦",
    duration: "3:43",
    cover: "/countryside-music-album-cover.jpg",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    lyrics: `[00:00.00]稻香 - 周杰伦
[00:10.00]对这个世界如果你有太多的抱怨
[00:13.00]跌倒了就不敢继续往前走
[00:16.00]为什么人要这么的脆弱 堕落
[00:20.00]请你打开电视看看
[00:23.00]多少人为生命在努力勇敢的走下去`,
  },
  {
    id: 3,
    title: "晴天",
    artist: "周杰伦",
    duration: "4:29",
    cover: "/sunny-day-music-album-cover.jpg",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    lyrics: `[00:00.00]晴天 - 周杰伦
[00:15.00]故事的小黄花
[00:18.00]从出生那年就飘着
[00:21.00]童年的荡秋千
[00:24.00]随记忆一直晃到现在`,
  },
  {
    id: 4,
    title: "七里香",
    artist: "周杰伦",
    duration: "5:05",
    cover: "/romantic-music-album-cover.jpg",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    lyrics: `[00:00.00]七里香 - 周杰伦
[00:20.00]窗外的麻雀在电线杆上多嘴
[00:24.00]你说这一句很有夏天的感觉
[00:28.00]手中的铅笔在纸上来来回回`,
  },
  {
    id: 5,
    title: "青花瓷",
    artist: "周杰伦",
    duration: "3:58",
    cover: "/chinese-porcelain-music-album-cover.jpg",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    lyrics: `[00:00.00]青花瓷 - 周杰伦
[00:15.00]素胚勾勒出青花笔锋浓转淡
[00:20.00]瓶身描绘的牡丹一如你初妆
[00:25.00]冉冉檀香透过窗心事我了然`,
  },
]

// 全局状态
let currentSongIndex = 0
let isPlaying = false
const favorites = new Set()
let currentLyrics = []

// DOM元素
const audioPlayer = document.getElementById("audioPlayer")
const albumCover = document.getElementById("albumCover")
const songTitle = document.getElementById("songTitle")
const artistName = document.getElementById("artistName")
const playlistContainer = document.getElementById("playlistContainer")
const lyricsContainer = document.getElementById("lyricsContainer")
const btnPlayPause = document.getElementById("btnPlayPause")
const btnPrevious = document.getElementById("btnPrevious")
const btnNext = document.getElementById("btnNext")
const btnFavorites = document.getElementById("btnFavorites")
const currentTime = document.getElementById("currentTime")
const totalTime = document.getElementById("totalTime")
const progressBar = document.getElementById("progressBar")
const progressFilled = document.getElementById("progressFilled")
const progressThumb = document.getElementById("progressThumb")
const volumeSlider = document.getElementById("volumeSlider")

// 初始化
function init() {
  renderPlaylist()
  loadSong(0)
  setupEventListeners()

  // 设置初始音量
  audioPlayer.volume = volumeSlider.value / 100
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
    `,
    )
    .join("")
}

// 加载歌曲
function loadSong(index) {
  const song = songs[index]
  currentSongIndex = index

  // 更新UI
  albumCover.src = song.cover
  songTitle.textContent = song.title
  artistName.textContent = song.artist

  // 加载音频
  audioPlayer.src = song.audioSrc

  // 解析并显示歌词
  parseLyrics(song.lyrics)

  // 更新播放列表高亮
  updatePlaylistHighlight()
}

// 解析歌词
function parseLyrics(lrcText) {
  if (!lrcText) {
    lyricsContainer.innerHTML = '<p class="no-lyrics">暂无歌词</p>'
    currentLyrics = []
    return
  }

  const lines = lrcText.split("\n")
  currentLyrics = []

  lines.forEach((line) => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/)
    if (match) {
      const minutes = Number.parseInt(match[1])
      const seconds = Number.parseInt(match[2])
      const time = minutes * 60 + seconds
      const text = match[4].trim()
      if (text) {
        currentLyrics.push({ time, text })
      }
    }
  })

  // 渲染歌词
  lyricsContainer.innerHTML = currentLyrics
    .map((lyric, index) => `<p class="lyric-line" data-time="${lyric.time}" data-index="${index}">${lyric.text}</p>`)
    .join("")
}

// 更新播放列表高亮
function updatePlaylistHighlight() {
  document.querySelectorAll(".playlist-item").forEach((item, index) => {
    item.classList.toggle("active", index === currentSongIndex)
  })
}

// 播放/暂停切换
function togglePlayPause() {
  if (isPlaying) {
    pause()
  } else {
    play()
  }
}

// 播放
function play() {
  audioPlayer.play()
  isPlaying = true
  albumCover.classList.add("rotating")
  document.querySelector(".play-icon").classList.add("hidden")
  document.querySelector(".pause-icon").classList.remove("hidden")
}

// 暂停
function pause() {
  audioPlayer.pause()
  isPlaying = false
  albumCover.classList.remove("rotating")
  document.querySelector(".play-icon").classList.remove("hidden")
  document.querySelector(".pause-icon").classList.add("hidden")
}

// 上一首
function previousSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length
  loadSong(currentSongIndex)
  if (isPlaying) {
    play()
  }
}

// 下一首
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length
  loadSong(currentSongIndex)
  if (isPlaying) {
    play()
  }
}

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// 更新进度条
function updateProgress() {
  const current = audioPlayer.currentTime
  const duration = audioPlayer.duration

  if (duration) {
    const percentage = (current / duration) * 100
    progressFilled.style.width = `${percentage}%`
    progressThumb.style.left = `${percentage}%`
    currentTime.textContent = formatTime(current)

    // 更新歌词高亮
    updateLyricsHighlight(current)
  }
}

// 更新歌词高亮
function updateLyricsHighlight(currentTime) {
  const lyricLines = document.querySelectorAll(".lyric-line")
  let activeIndex = -1

  for (let i = 0; i < currentLyrics.length; i++) {
    if (currentTime >= currentLyrics[i].time) {
      activeIndex = i
    } else {
      break
    }
  }

  lyricLines.forEach((line, index) => {
    if (index === activeIndex) {
      line.classList.add("active")
      // 自动滚动到当前歌词
      line.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      line.classList.remove("active")
    }
  })
}

// 设置进度
function setProgress(e) {
  const rect = progressBar.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * audioPlayer.duration

  if (!isNaN(newTime)) {
    audioPlayer.currentTime = newTime
  }
}

// 切换收藏
function toggleFavorite(songId) {
  if (favorites.has(songId)) {
    favorites.delete(songId)
  } else {
    favorites.add(songId)
  }
  renderPlaylist()
}

// 显示收藏夹
function showFavorites() {
  const favoriteSongs = songs.filter((song) => favorites.has(song.id))

  if (favoriteSongs.length === 0) {
    alert("收藏夹为空")
    return
  }

  playlistContainer.innerHTML = favoriteSongs
    .map((song, index) => {
      const originalIndex = songs.findIndex((s) => s.id === song.id)
      return `
            <div class="playlist-item" data-index="${originalIndex}">
                <span class="index">${index + 1}</span>
                <span class="song-name">${song.title}</span>
                <span class="artist">${song.artist}</span>
                <span class="duration">${song.duration}</span>
                <button class="favorite-btn favorited" data-id="${song.id}">♥</button>
            </div>
        `
    })
    .join("")
}

// 设置事件监听
function setupEventListeners() {
  // 播放控制
  btnPlayPause.addEventListener("click", togglePlayPause)
  btnPrevious.addEventListener("click", previousSong)
  btnNext.addEventListener("click", nextSong)
  btnFavorites.addEventListener("click", () => {
    if (btnFavorites.textContent === "收藏夹") {
      showFavorites()
      btnFavorites.textContent = "全部歌曲"
    } else {
      renderPlaylist()
      btnFavorites.textContent = "收藏夹"
    }
  })

  // 音频事件
  audioPlayer.addEventListener("timeupdate", updateProgress)
  audioPlayer.addEventListener("loadedmetadata", () => {
    totalTime.textContent = formatTime(audioPlayer.duration)
  })
  audioPlayer.addEventListener("ended", nextSong)

  // 进度条点击
  progressBar.addEventListener("click", setProgress)

  // 音量控制
  volumeSlider.addEventListener("input", (e) => {
    audioPlayer.volume = e.target.value / 100
  })

  // 播放列表点击
  playlistContainer.addEventListener("click", (e) => {
    const playlistItem = e.target.closest(".playlist-item")
    if (playlistItem) {
      const index = Number.parseInt(playlistItem.dataset.index)
      loadSong(index)
      play()
    }

    // 收藏按钮
    const favoriteBtn = e.target.closest(".favorite-btn")
    if (favoriteBtn) {
      e.stopPropagation()
      const songId = Number.parseInt(favoriteBtn.dataset.id)
      toggleFavorite(songId)
    }
  })

  // 歌词点击跳转
  lyricsContainer.addEventListener("click", (e) => {
    const lyricLine = e.target.closest(".lyric-line")
    if (lyricLine) {
      const time = Number.parseFloat(lyricLine.dataset.time)
      audioPlayer.currentTime = time
      if (!isPlaying) {
        play()
      }
    }
  })
}

// 启动应用
init()
