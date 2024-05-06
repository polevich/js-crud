// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {
  static #list = []

  constructor(name, author, image) {
    this.id = Math.floor(1000 + Math.random() * 9000)
    this.name = name
    this.author = author
    this.image = image
  }

  static create(name, author, image) {
    const newTrack = new Track(name, author, image)
    this.#list.push(newTrack)
    return newTrack
  }

  static getList() {
    return this.#list.reverse()
  }

  static getById(id) {
    return this.#list.find((track) => track.id === id) || null
  }
}

Track.create('Инь Ян', 'MONATIK i ROXOLANA', 'https://picsum.photos/100/100')
Track.create(
  'Baila Conmigo (remix)',
  'Selena Gomez i Rauw Alejandro',
  'https://picsum.photos/100/100',
)
Track.create('Shameless', 'Camila Cabello', 'https://picsum.photos/100/100')
Track.create('DAKITI', 'BAD BUNNY i JHAY', 'https://picsum.photos/100/100')
Track.create('11 PM', 'Maluma', 'https://picsum.photos/100/100')
Track.create('Інша любов', 'Enleo', 'https://picsum.photos/100/100')

console.log(Track.getList())

class Playlist {
  static #list = []

  constructor(name) {
    this.id = Math.floor(1000 + Math.random() * 9000)
    this.name = name
    this.tracks = []
    this.image = 'https://picsum.photos/100/100'
  }
  static create(name) {
    const newPlaylist = new Playlist(name)
    this.#list.push(newPlaylist)
    return newPlaylist
  }
  static getList() {
    return this.#list.reverse()
  }
  static makeMix(playlist) {
    const allTracks = Track.getList()
    let randomTracks = allTracks.sort(() => 0.5 - Math.random()).slice(0, 3)
    playlist.tracks.push(...randomTracks)
  }
  static getById(id) {
    return Playlist.#list.find((playlist) => playlist.id === id) || null
  }
  deleteTrackById(trackId) {
    this.tracks = this.tracks.filter((track) => track.id !== trackId)
  }
  static findListByValue(name) {
    return this.#list.filter((playlist) => playlist.name.toLowerCase().includes(name.toLowerCase()))
  }

  addTrack(track) {
    this.tracks.push(track)
  }
}
Playlist.makeMix(Playlist.create('Test'))
Playlist.makeMix(Playlist.create('Test2'))
Playlist.makeMix(Playlist.create('Test3'))

// ================================================================

router.get('/spotify-choose', function (req, res) {
  // res.render генерує нам HTML сторінку

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('spotify-choose', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'spotify-choose',

    data: {},
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.get('/spotify-create', function (req, res) {
  const isMix = !!req.query.isMix
  console.log(isMix)

  res.render('spotify-create', {
    style: 'spotify-create',
    data: { isMix },
  })
})

// ================================================================

router.post('/spotify-create', function (req, res) {
  const isMix = !!req.query.isMix

  const name = req.body.name

  if (!name) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Введите название плейлиста',
        link: isMix ? `/spotify-create?isMix=true` : '/spotify-create',
      },
    })
  }

  const playlist = Playlist.create(name)

  if (isMix) {
    Playlist.makeMix(playlist)
  }
  console.log(playlist)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',
    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-playlist', function (req, res) {
  const id = Number(req.query.id)
  const playlist = Playlist.getById(id)
  if (!playlist) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Такой плейлист не найден',
        link: `/`,
      },
    })
  }

  res.render('spotify-playlist', {
    style: 'spotify-playlist',
    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-track-delete', function (req, res) {
  const playlistId = Number(req.query.playlistId)
  const trackId = Number(req.query.trackId)
  const playlist = Playlist.getById(playlistId)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Такой плейлист не найден',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  playlist.deleteTrackById(trackId)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',
    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/spotify-search', function (req, res) {
  const value = ''
  const list = Playlist.findListByValue(value)
  console.log(value)

  res.render('spotify-search', {
    style: 'spotify-search',
    data: {
      list: list.map(({ tracks, ...rest }) => ({ ...rest, amount: tracks.length })),
      value,
    },
  })
})

// ================================================================

router.post('/spotify-search', function (req, res) {
  const value = req.body.value || ''
  const list = Playlist.findListByValue(value)
  console.log(value)

  res.render('spotify-search', {
    style: 'spotify-search',
    data: {
      list: list.map(({ tracks, ...rest }) => ({ ...rest, amount: tracks.length })),
      value,
    },
  })
})

// ================================================================

router.get('/spotify-playlist-add', function (req, res) {
  const playlistId = Number(req.query.playlistId)
  const playlist = Playlist.getById(playlistId)
  const allTracks = Track.getList()

  console.log(playlistId, playlist, allTracks)

  res.render('spotify-playlist-add', {
    style: 'spotify-playlist-add',

    data: {
      playlistId: playlist.id,
      tracks: allTracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.post('/spotify-playlist-add', function (req, res) {
  const playlistId = Number(req.body.playlistId)
  const trackId = Number(req.body.trackId)

  const playlist = Playlist.getById(playlistId)

  if (!playlist) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playlist?id=${playlistId}`,
      },
    })
  }

  const trackToAdd = Track.getList().find((track) => track.id === trackId)

  if (!trackToAdd) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Помилка',
        info: 'Такого треку не знайдено',
        link: `/spotify-playlist-add?playlistId=${playlistId}`,
      },
    })
  }

  playlist.tracks.push(trackToAdd)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',
    data: {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      name: playlist.name,
    },
  })
})

// ================================================================

router.get('/', function (req, res) {
  const playlists = Playlist.getList()

  res.render('spotify-index', {
    style: 'spotify-index',
    data: {
      playlists: playlists.map(({ tracks, ...rest }) => ({ ...rest, amount: tracks.length })),
    },
  })
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
