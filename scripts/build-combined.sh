#!/bin/sh
set -eu
cd "$(dirname "$0")/../firebase-academy"
sh build.sh
mkdir -p ../dist/academy
cp -a public/. ../dist/academy/
