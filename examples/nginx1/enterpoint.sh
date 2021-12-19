#!/bin/sh

set -e

find /usr/share/nginx/html -name '*.js' | xargs sed -i "s BUILD_API_HOST $BUILD_API_HOST g"

echo 'hi hi'
