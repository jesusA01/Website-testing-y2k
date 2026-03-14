import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

document.addEventListener("DOMContentLoaded", () => {

    const win = document.querySelector(".winamp")
    const bar = document.querySelector(".title-bar")
    const audio = document.getElementById("audio")
    const trackList = document.querySelectorAll("#track-list li")
    const currentTrackDisplay = document.querySelector(".display p")
    const visual = document.getElementById("track-visual")
    const supabaseUrl = 'https://yrtjzfzhfnvallrzyhpe.supabase.co'
    const supabaseKey = 'sb_publishable_vFuFrHpr9aoEiUKLocQglA_75IHrBUr'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const playBtn = document.querySelector(".play")
    const pauseBtn = document.querySelector(".pause")
    const nextBtn = document.querySelector(".next")
    const prevBtn = document.querySelector(".prev")
    const messageForm = document.getElementById('type-message')
    const nameInput = document.getElementById('guest-name')
    const messageInput = document.getElementById('guest-message')
    const messageSection = document.getElementById('message-section')

    let offsetX = 0
    let offsetY = 0
    let dragging = false
    let currentTrack = 0


    // --- Initialize first track ---
    audio.src = trackList[currentTrack].dataset.src
    updateDisplay()


    // --- Dragging window ---
    bar.addEventListener("mousedown", (e) => {
        e.preventDefault()
        dragging = true
        offsetX = e.clientX - win.offsetLeft
        offsetY = e.clientY - win.offsetTop
    })

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return
        win.style.left = e.clientX - offsetX + "px"
        win.style.top = e.clientY - offsetY + "px"
    })

    document.addEventListener("mouseup", () => dragging = false)


    // --- Click track in playlist ---
    trackList.forEach((li, index) => {
        li.addEventListener("click", () => {
            playTrack(index)
        })
    })


    // --- Control buttons ---
    playBtn.addEventListener("click", () => {
        audio.play()
    })

    pauseBtn.addEventListener("click", () => {
        audio.pause()
    })

    nextBtn.addEventListener("click", () => {
        nextTrack()
    })

    prevBtn.addEventListener("click", () => {
        prevTrack()
    })


    // --- Functions ---

    function playTrack(index) {

        currentTrack = index

        const track = trackList[currentTrack]

        audio.src = track.dataset.src
        audio.play()

        currentTrackDisplay.textContent = track.textContent

        visual.src = track.dataset.visual

        trackList.forEach(li => li.classList.remove("current"))
        track.classList.add("current")

    }

    function nextTrack() {
        currentTrack = (currentTrack + 1) % trackList.length
        playTrack(currentTrack)
    }

    function prevTrack() {
        currentTrack = (currentTrack - 1 + trackList.length) % trackList.length
        playTrack(currentTrack)
    }

    function updateDisplay() {
        currentTrackDisplay.textContent = trackList[currentTrack].textContent

        trackList.forEach(li => li.classList.remove("current"))
        trackList[currentTrack].classList.add("current")
    }


    // --- Auto play next track ---
    audio.addEventListener("ended", () => {
        nextTrack()
    })


    //load message function
    async function loadMessages() {
        const { data, error } = await supabase
            .from('message_board')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        messageSection.innerHTML = ''

        data.forEach(msg => {
            const div = document.createElement('div')
            div.classList.add('message')
            div.innerHTML = `
                <b>${msg.name}</b> <small>${new Date(msg.created_at).toLocaleString()}</small>
                <p>${msg.message}</p>
            `

            messageSection.appendChild(div)
        })
    }

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault()

        const name = nameInput.value.trim()
        const message = messageInput.value.trim()

        if (!name || !message) return

        const { data, error } = await supabase
            .from('message_board')
            .insert([{ name, message }])

        if (error) {
            console.error('there was an error submiting the message', error)
            return
        }

        nameInput.value = ''
        messageInput.value = ''

        loadMessages()
    })

    loadMessages()

})