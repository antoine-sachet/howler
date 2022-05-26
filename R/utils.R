#' Clean file names to get track titles
#'
#' Keeps only the basename without extensions. Handles URLs too.
#'
#' @param files Character vector of files
#'
#' @return Character vector of clean file names
#'
#' @examples
#' tracks <- c("track1.mp3",
#'             "files/track2.wav",
#'             "www.example.com/files/track3.mp3?year=2022",
#'             "files/track4.mp3")
#' cleanTrackTitle(tracks)
#'
cleanTrackTitle <- function(files) {

  # 1. Extract a single basename for each file (or file set)
  filenames <- vapply(files, function(file) {
    basename(file[1])
  }, FUN.VALUE = character(1), USE.NAMES = FALSE)

  # 2. Remove file extension and potential trailing query params
  sub(filenames, pattern = "([^.]+)\\.[[:alnum:]]+(\\?.+)?$", replacement = "\\1")
}
