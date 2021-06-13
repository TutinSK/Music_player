const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const player = $('.player')
const heading = $('header h2')
const cd = $('.cd')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const repeatBtn = $('.btn-repeat')
const randomBtn = $('.btn-random')
const currentTime = $('.progress-wrap .currentTime')
const duration = $('.progress-wrap .duration')
const progress = $('#progress')
const sound = $('#sound')
const volumeBtn = $$('.sound-section .sound-icon')
const playlist = $('.playlist')
const songTitles = heading.querySelectorAll('.song-title-sub')

const defaultImageUrl = './assets/img/'
const defaultPathUrl = './assets/source/'
const PLAYER_KEY = 'Mark-Han'

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	newTime: 0,
	timeEnd: 0,
	newOffsetProgress: 0,
	currentVolume: 1,
	isMute: false,
	config: JSON.parse(localStorage.getItem(PLAYER_KEY)) || {},
	setConfig: function(key, value) {
		this.config[key] = value
		localStorage.setItem(
			PLAYER_KEY,
			JSON.stringify(this.config)
		)
	},

	songs: [
		{
			name: 'Still D R E',
			singer: 'Snoop Dogg',
			path: `${defaultPathUrl}still-dre.mp3`,
			image: `${defaultImageUrl}still-dre.jpg`
		},
		{
			name: 'Bad Guy',
			singer: 'Eddie Van Der Meer',
			path: `${defaultPathUrl}bad-guy.mp3`,
			image: `${defaultImageUrl}bad-guy.jpg`,
		},
		{
			name: '7 Years',
			singer: 'Lukas Graham',
			path: `${defaultPathUrl}7-years.mp3`,
			image: `${defaultImageUrl}7-year.jpg`,
		},
		{
			name: 'Always Remember us this way',
			singer: 'Benedetta Caretta',
			path: `${defaultPathUrl}always-remember-us-this-way.mp3`,
			image: `${defaultImageUrl}always-remember.jpg`,
		},
		{
			name: 'Bản tình ca chưa hoàn thiện',
			singer: 'Mark Haann',
			path: `${defaultPathUrl}ban-tinh-ca-chua-hoan-thien.mp3`,
			image: `${defaultImageUrl}ban-tinh-ca-k-hoan-thien.jpg`,
		},
		{
			name: 'Beat bản tình ca Lessang',
			singer: 'Lessang',
			path: `${defaultPathUrl}Beat-ban-tinh-ca-k-hoan-thien.mp3`,
			image: `${defaultImageUrl}leessang.jpg`,
		},
		{
			name: 'Halo',
			singer: 'Beyonce',
			path: `${defaultPathUrl}halo.mp3`,
			image: `${defaultImageUrl}halo.jpg`,
		},
		{
			name: 'Love Is Gone',
			singer: 'SLANDER Ft Dylan Mattthew',
			path: `${defaultPathUrl}love-is-gone.mp3`,
			image: `${defaultImageUrl}love-is-gone.jpg`,
		},
		{
			name: 'Mashup 25 Táo',
			singer: 'Nhiều ca sỹ',
			path: `${defaultPathUrl}mashup-25.mp3`,
			image: `${defaultImageUrl}mashup-25.jpg`,
		},
		{
			name: 'Sau Tất Cả (cover)',
			singer: 'Huy vạc',
			path: `${defaultPathUrl}sau-tat-ca.mp3`,
			image: `${defaultImageUrl}sau-tat-ca.jpg`,
		}
	],

	loadCurrentSong: function() {
		const _this = this
		const songList = $$('.song')
		const activeSong = $('.song.active')

		// Load thông tin bài hát hiện tại
		const textHeading = `${this.currentSong.name} - ${this.currentSong.singer}`
		Array.from(songTitles).forEach(songTitle => {
			return songTitle.innerText = textHeading
		})

		this.scrollHeading()
		
		cdThumb.style.backgroundImage =
			this.currentSong.image !== '' ? 
			`url('${this.currentSong.image}')` :
			`url('${defaultImageUrl}logo.png')`

		audio.src = this.currentSong.path

		this.scrollToActiveSong()

		// Lưu vị trí song hiện tại vào localStorage
		this.setConfig('currentIndex', this.currentIndex)
		
		// Xử lý song active không cần render lại
		if(activeSong && songList.length > 0) {
			activeSong.classList.remove('active')

			songList.forEach(song => {
				if(Number(song.dataset.index) === _this.currentIndex)
					song.classList.add('active')
			})
		}
	},

	loadConfig: function() {
		if(Object.entries(this.config).length) {
			this.currentIndex = this.config.currentIndex ? this.config.currentIndex : 0
			this.isRandom = this.config.isRandom ? this.config.isRandom : false
			this.isRepeat = this.config.isRepeat ? this.config.isRepeat : false
			this.newTime = this.config.newTime ? this.config.newTime : 0
			this.timeEnd = this.config.timeEnd ? this.config.timeEnd : 0
			this.currentVolume = this.config.currentVolume ? this.config.currentVolume : 1
		}
	},

	defineProperty: function() {
		Object.defineProperty(this, 'currentSong', {
			get: function () {
				return this.songs[this.currentIndex]
			},
		})
	},

	render: function() {
		const _this = this

		// Render danh sánh bài hát ra view
		const htmls = this.songs.map(function (song, index) {

			return `
				<div data-index="${index}" class="song ${index === _this.currentIndex ? 'active' : ''}">
		            <div
		                class="thumb"
		                style="background-image: url('${song.image ? song.image : defaultImageUrl + 'logo.png'}');"
		            ></div>
		            <div class="body">
		                <h3 class="title">${song.name}</h3>
		                <p class="author">${song.singer}</p>
		            </div>
		            <div class="option">
		                <i class="fas fa-ellipsis-h"></i>
		            </div>
		        </div>
			`
		})

		playlist.innerHTML = htmls.join('')
	},

	handleEvents: function() {
		const _this = this
		const cdWidth = cd.offsetWidth

		// Xử lý height dashbroad
		$('.playlist').style.marginTop = ($('.dashboard').offsetHeight + 30) + 'px'

		// Xử lý CD quay / dừng
		const CDRotate = cdThumb.animate([
			{
				transform: 'rotate(360deg)',
			}
		],
		{
			duration: 10000,
			iterations: Infinity,
		})

		CDRotate.pause()

		// Thu nhỏ / phóng to thumb khi scroll
		document.onscroll = function() {
			const scrollTop = window.scrollY ||
				document.documentElement.scrollTop
			const newCDWidth = cdWidth - scrollTop

			cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0
			cd.style.opacity = newCDWidth / cdWidth
		}

		// play song on click
		playBtn.onclick = function() {
			_this.isPlaying = !_this.isPlaying
			player.classList.toggle('playing', _this.isPlaying)

			if(_this.isPlaying) {
				audio.play()
				CDRotate.play()
			}
			else {
				audio.pause()
				CDRotate.pause()
			}
		}

		// Xử lý sự kiện khi nhấn nút cách (space)
		document.onkeypress = function(e) {
			e.preventDefault()
			if(e.keyCode === 32) {
				if(_this.isPlaying === false) {
					audio.play()
					_this.isPlaying = true
					CDRotate.play()
				}else {
					audio.pause()
					_this.isPlaying = false
					CDRotate.pause()
				}
			}
		}

		// Xử lý sự kiện khi audio play
		audio.onplay = function() {
			_this.isPlaying = true
			player.classList.toggle('playing', _this.isPlaying)
		}

		audio.onloadedmetadata = function () {
			_this.timeEnd = audio.duration
			_this.setConfig('timeEnd', _this.timeEnd)

			const timeList = _this.convertSecToMin(_this.timeEnd)
			const min = Number(timeList[0]) >= 10 ? 
				Number(timeList[0]) : `0${Number(timeList[0])}`
			const sec = Number(timeList[1]) >= 10 ? 
				Number(timeList[1]) : `0${Number(timeList[1])}`

			duration.innerText = `${min}:${sec}`
		}

		// Xử lý sự kiện khi audio pause
		audio.onpause = function() {
			_this.isPlaying = false
			player.classList.toggle('playing', _this.isPlaying)
		}

		// xử lý sự kiện khi audio ended
		audio.onended = function() {
			_this.isRepeat ? audio.play() : nextBtn.click()
		}

		// Xử lý sự kiện khi update audio time current
		audio.ontimeupdate = function() {
			_this.newTime = audio.currentTime / _this.timeEnd * 100
			_this.newTime = _this.newTime ? _this.newTime : 0
			progress.value = _this.newTime
			_this.setConfig('newTime', _this.newTime)

			const timeList = _this.convertSecToMin(audio.currentTime)
			const min = timeList[0] >= 10 ? 
				timeList[0] : `0${timeList[0]}`
			const sec = timeList[1] >= 10 ? 
				timeList[1] : `0${timeList[1]}`

			currentTime.innerText = `${min}:${sec}`
		}

		// Xử lý âm thanh audio
		sound.onchange = function(e) {
			audio.muted = false
			audio.volume = this.value / 100
			_this.currentVolume = audio.volume
			if(Number.parseFloat(_this.currentVolume) === 1) {
				volumeBtn[0].classList.remove('active')
				volumeBtn[1].classList.add('active')
			}else if(Number.parseFloat(_this.currentVolume) === 0) {
				volumeBtn[0].classList.add('active')
				volumeBtn[1].classList.remove('active')
			}else {
				volumeBtn[0].classList.remove('active')
				volumeBtn[1].classList.remove('active')
			}
			_this.setConfig('currentVolume', _this.currentVolume)
		}

		volumeBtn[0].onclick = function() {
			_this.isMute = !_this.isMute
			if(_this.isMute) {
				audio.muted = _this.isMute
				sound.value = 0
				audio.volume = 0
			}else {
				audio.muted = false
				sound.value = _this.currentVolume * 100
				audio.volume = _this.currentVolume
			}
			if(_this.currentVolume === 0) 
				volumeBtn[0].classList.add('active')
			else
				volumeBtn[0].classList.toggle('active', _this.isMute)
			volumeBtn[1].classList.remove('active')
		}

		volumeBtn[1].onclick = function() {
			_this.isMute = false
			audio.muted = _this.isMute
			
			if(audio.volume === 0 || Number(sound.value) < 100) {
				sound.value = 100
				audio.volume = 1
				volumeBtn[1].classList.add('active')
			}else if(Number(sound.value) === 100) {
				audio.volume = _this.currentVolume
				sound.value = _this.currentVolume * 100
				volumeBtn[1].classList.toggle('active', (Number(_this.currentVolume) === 1))
			}
			volumeBtn[0].classList.remove('active')
		}

		progress.onchange = function(e) {
			this.value = e.target.value
			_this.newOffsetProgress = _this.timeEnd / 100 * this.value
			audio.currentTime = _this.newOffsetProgress
		}

		// Xử lý sự kiện khi moving progress
		progress.onmouseup = function(e) {
			this.value = e.layerX / this.offsetWidth * 100
			_this.newOffsetProgress = _this.timeEnd / 100 * this.value
			audio.currentTime = _this.newOffsetProgress
		}

		// Next song on click
		nextBtn.onclick = function() {
			if(_this.isRandom) {
				_this.playRandomSong()
			}else {
				_this.nextSong()
			}
			_this.timeEnd = 0
			audio.play()
		}

		// Prev song on click
		prevBtn.onclick = function() {
			if(_this.isRandom) {
				_this.playRandomSong()
			}else {
				_this.prevSong()
			}
			_this.timeEnd = 0
			audio.play()
		}

		// Repeat song on click
		repeatBtn.onclick = function() {
			_this.isRepeat = !_this.isRepeat
			this.classList.toggle('active', _this.isRepeat)
			_this.setConfig('isRepeat', _this.isRepeat)
		}

		// Random song on click
		randomBtn.onclick = function() {
			_this.isRandom = !_this.isRandom
			this.classList.toggle('active', _this.isRandom)
			_this.setConfig('isRandom', _this.isRandom)
		}

		// Sử lý sự kiện thay đổi active song in play list
		playlist.onclick = function(e) {
			const songActiveNode = e.target.closest('.song.active')
			const songNode = e.target.closest('.song:not(.active)')
			const optionSong = e.target.closest('.option')

			if(songActiveNode !== null) {
				_this.isPlaying = true
				audio.play()
			}

			if(songNode || optionSong) {
				if(songNode) {
					_this.currentIndex = Number(songNode.dataset.index)
					_this.loadCurrentSong()
					audio.play()
					CDRotate.play()
				}
			}

			if(optionSong) {
				console.log("You clicked option!")
			}
		}
	},

	nextSong: function() {
		this.currentIndex++;
	    if (this.currentIndex > this.songs.length - 1) {
	      this.currentIndex = 0
	    }
	    this.loadCurrentSong()
	},

	prevSong: function() {
		this.currentIndex--;
		if (this.currentIndex < 0)
			this.currentIndex = this.songs.length - 1
		this.loadCurrentSong()
	},

	playRandomSong: function() {
		let newIndex

		do {
			newIndex = Math.floor(Math.random() * this.songs.length)
		} while (newIndex === this.currentIndex)
		this.currentIndex = newIndex
		this.loadCurrentSong()
	},

	scrollToActiveSong: function() {
		setTimeout(() => {
			if(this.currentIndex <= 3) {
				$('.song.active').scrollIntoView({
					behavior: 'smooth',
					block: 'end',
				})
			}else {
				$('.song.active').scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, 300)
	},

	convertSecToMin: function(sec) {
		const mins = Math.floor((sec % 3600) / 60)
		const secs = Math.floor(sec % 60)

		return [mins, secs]
	},

	scrollHeading: function() {
		heading.style.transform = ""
		heading.style.transition = ""

		if(songTitles[0].offsetWidth > heading.offsetWidth) {
			songTitles[1].style.display = "inline"
  			songTitles[0].style.marginRight = '30px'
			heading.style.transform = `translateX(-${songTitles[0].offsetWidth + 30}px)`
			heading.style.transition = `transform 5.3s linear 1s`
			heading.style.justifyContent = "flex-start"
		}
		else {
			songTitles[1].style.display = "none"
  			songTitles[0].style.marginRight = '0'
			heading.style.justifyContent = "center"
			heading.style.transform = ""
			heading.style.transition = ""
		}

	},

	start: function() {
		this.defineProperty()
		this.loadConfig()
		this.handleEvents()
		this.loadCurrentSong()
		this.render()
		randomBtn.classList.toggle('active', this.isRandom)
		repeatBtn.classList.toggle('active', this.isRepeat)
		sound.value = (this.currentVolume * 100)
		audio.volume = this.currentVolume
		audio.currentTime = this.timeEnd / 100 * this.newTime

		if(this.currentVolume === 1) {
			volumeBtn[0].classList.remove('active')
			volumeBtn[1].classList.add('active')
		}else if(this.currentVolume === 0) {
			volumeBtn[0].classList.add('active')
			volumeBtn[1].classList.remove('active')
		}
	}
}

app.start()

setInterval(() => {
	app.scrollHeading()
}, 10000)