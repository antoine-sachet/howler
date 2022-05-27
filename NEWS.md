# howler devel

* Fix bug preventing track URLs with query parameters from playing. (#4, @antoine-sachet)

* Track titles can now be provided in `howlerPlayer` as the names of the `files` argument.
  If `files` is unnamed, the behaviour stays the same (with better handling of edge cases).
  (#5, @antoine-sachet)
  
  A track title can also be provided when adding a track with `addTrack()`.

# howler 0.1.0

* Added a `NEWS.md` file to track changes to the package.
