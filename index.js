const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Là 1 Thằng Con Trai',
            singer: 'Jack - J97',
            path: './assets/music/La-1-Thang-Con-Trai-Jack-J97.mp3',
            image: './assets/img/La1ThangConTrai.jpg'
        },
        {
            name: 'Đom Đóm',
            singer: 'Jack - J97',
            path: './assets/music/DOM-DOM-J97.mp3',
            image: './assets/img/DomDom.jpg'
        },
        {
            name: 'Ngôi Sao Cô Đơn',
            singer: 'Jack - J97',
            path: './assets/music/Ngoi-Sao-Co-Don-Lofi-Version-Jack-J97.mp3',
            image: './assets/img/NgoiSaoCoDon.jpg'
        },
        {
            name: 'Bước Đều Bước',
            singer: 'Bray',
            path: './assets/music/Buoc-Deu-Buoc-Prod-Masew-B-Ray-Masew.mp3',
            image: './assets/img/BuocDeuBuoc.jpg'
        },
        {
            name: 'Ở Trong Thành Phố',
            singer: 'Bray',
            path: './assets/music/O-Trong-Thanh-Pho-Masew-Mix-B-Ray-Masew.mp3',
            image: './assets/img/OTrongThanhPho.jpg'
        },
        {
            name: 'Đỉnh Núi Tuyết Của Nuối Tiếc',
            singer: 'Datmaniac',
            path: './assets/music/Dinh-Nui-Tuyet-Cua-Nuoi-Tiec-DatManiac.mp3',
            image: './assets/img/DinhNuiTuyetCuaNuoiTiec.jpg'
        },
        {
            name: 'Mấy Con Mèo',
            singer: 'Datmaniac',
            path: './assets/music/May-con-meo-DatManiac.mp3',
            image: './assets/img/MayConMeo.jpg'
        },
        {
            name: 'Ngày Nào',
            singer: 'Datmaniac',
            path: './assets/music/Ngay-Nao-Datmaniac-ft-Ca-Hoi-Hoang.mp3',
            image: './assets/img/NgayNao.jpg'
        },
        {
            name: 'Phi Hành Gia',
            singer: 'Lil Wuyn',
            path: './assets/music/Phi-Hanh-Gia-Renja-Slow-T-Lil-Wuyn-Kain-Sugar-Cane.mp3',
            image: './assets/img/PhiHanhGia.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}');">\
                    </div>
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

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý quay cd
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lý CD 
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        //Khi bài hát được phát
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')  
            cdThumbAnimate.play()
        }

        //Khi bài hát bị dừng
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')      
            cdThumbAnimate.pause()    
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua bài hát
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Khi next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Xử lý bật/tắt random Song
        randomBtn.onclick = function(e) {
            _this.isRandom =!_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Xử lý lập lại Song
        repeatBtn.onclick = function() {
            _this.isRepeat =!_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý Next Song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                //Xử lý khi click vào song               
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                //Xử lý khi click vào song option
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 500)
    },

    loadCurrentSong: function() {  
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length
        }
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

    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Obj
        this.defineProperties()

        //Lắng nghe/Xử lý các sự kiện
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của button Repeat & Random
        randomBtn.classList.toggle('active', _this.isRandom)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }
}
app.start()