#!/bin/sh
set -eu
rm -rf 'app/title/[type]' 'app/watch/[type]'
find app/title app/watch -type f -name page.tsx -print
