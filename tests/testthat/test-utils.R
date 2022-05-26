context("Utilities")

test_that("cleanTrackTile handles local files", {
  tracks <- c("track1.mp3",
              "files/track2.wav",
              "/home/user/track3.mp4")

  testthat::expect_equal(cleanTrackTitle(tracks), paste0("track", 1:3))
})

test_that("cleanTrackTile handles URLs", {
  tracks <- c("www.example.com/files/track1.mp3?year=2022",
              "http://www.example.com/track2.wav")

  testthat::expect_equal(cleanTrackTitle(tracks), paste0("track", 1:2))
})

test_that("cleanTrackTile handles `?` and ` ` in file name", {
  tracks <- c("audio/Is this it?.m4a",
              "audio/Is this it?.m4a?a=1&b=2")

  testthat::expect_equal(cleanTrackTitle(tracks), rep("Is this it?", 2))
})


