// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: file-video;
// share-sheet-inputs: url, plain-text;
let urls = args.urls //from share sheet, this returns web URL
let texts = args.plainTexts //from share sheet, this returns web page title
let videoUrl = ""
let videoTitle = ""

if (texts.length > 0 && urls.length > 0) {
  videoUrl = urls[0].replace("https", "com.apple.tv")
  videoTitle = texts[0].replace(" | Apple TV", "")
  addMovie(videoTitle, videoUrl)
}

// Create the table that holds the watchlist.
let table = new UITable()
table.showSeparators = true
populateTable()
table.present()

// Populates the table with movies on the watchlist. The function can be called repeatedly to update the information displayed in the table.
function populateTable() {
  table.removeAllRows()
  let movies = loadMovies()
  movies.sort(sortMovies)
  for (i = 0; i < movies.length; i++) {
    let movie = movies[i]
    let row = new UITableRow()
    row.dismissOnSelect = false
    row.onSelect = (idx) => {
      let movie = movies[idx]
      openAppleTV(movie.AppleTVId)
    }
    // Shows name of the movie
    let titleCell = row.addText(
      movie.name)
    titleCell.widthWeight = 80
    let watchTitle
    if (movie.watched) {
      watchTitle = "âœ…"
    } else {
      watchTitle = "ðŸ‘€"
    }
    // Button that toggles the movie between watched and unwatched
    let tglBtn = row.addButton(watchTitle)
    tglBtn.widthWeight = 10
    tglBtn.onTap = () => {
      // Toggle the state and populate the table again. We must reload the table after populating it
      toggleWatched(movie.AppleTVId)
      populateTable()
      table.reload()
    }
    // Button that removes the movie from the list.
    let rmvBtn = row.addButton("âŒ")
    rmvBtn.widthWeight = 10
    rmvBtn.onTap = () => {
      promptRemoval(movie)
    }
    table.addRow(row)
  }
}

// Toggles the watched state of the movie with the specified IMDb ID.
function toggleWatched(AppleTVId) {
  let movies = loadMovies()
  for (movie of movies) {
    if (movie.AppleTVId == AppleTVId) {
      movie.watched = !movie.watched
    }
  }
  saveMovies(movies) 
}

// Sorts movies based on their watched state and name.
function sortMovies(a, b) {
  if (a.watched && !b.watched) {
    return 1
  } else if (!a.watched && b.watched) {
    return -1
  } else {
    return a.name < b.name
  }
}

// Opens the Apple TV app
function openAppleTV(appleTVId) {
  Safari.open(appleTVId)
}

// Presents an alert that prompts to confirm that the movie should be removed.
async function promptRemoval(movie) {
  let alert = new Alert()
  alert.title = "Remove from watchlist?"
  alert.message = "Are you sure you want to remove " + movie.name + " from your watchlist?"
  alert.addDestructiveAction("Remove")
  alert.addCancelAction("Cancel")
  let idx = await alert.presentAlert()
  if (idx == 0) {
    // Remove the movie and populate the table again. We must reload the table after populating it.
    removeMovie(movie.AppleTVId)
    populateTable()
    table.reload()
  }
}

// Removes the movie from the watchlist.
function removeMovie(AppleTVId) {
  let movies = loadMovies()
  movies = movies.filter(m => {
    return m.AppleTVId != AppleTVId
  })
  saveMovies(movies)
}

// Loads the movies from a JSON file stored in iCloud Drive.
function loadMovies() {
  let fm = FileManager.iCloud()
  let path = getFilePath()
  if (fm.fileExists(path)) {
    let raw = fm.readString(path)
    return JSON.parse(raw)
  } else {
    return []
  }
}

// Gets path of the file containing the watchlist data. Creates the file if necessary.
function getFilePath() {
  let fm = FileManager.iCloud()
  let dirPath = fm.joinPath(
    fm.documentsDirectory(),
    "data")
  if (!fm.fileExists(dirPath)) {
    fm.createDirectory(dirPath)
  }
  return fm.joinPath(
    dirPath,
    "watchlist.json")
}

// Adds a movie to the watchlist.
function addMovie(name, AppleTVId) {
  let movies = loadMovies()
  let found = movies.find(m => {
    return m.AppleTVId == AppleTVId
  })
  if (found == null) {
    let movie = {
      "name": name,
      "AppleTVId": AppleTVId,
      "watched": false
    }
    movies.push(movie)
    saveMovies(movies)
  }
}

// Saves the movies to a file in iCloud Drive.
function saveMovies(movies) {
  let fm = FileManager.iCloud()
  let path = getFilePath()
  let raw = JSON.stringify(movies)
  fm.writeString(path, raw)
}

// Kreydt
// Bitsrfr.com
