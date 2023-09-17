#!/bin/bash

# Check if an image path argument is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <image_path>"
  exit 1
fi

# Define the URL
URL="http://127.0.0.1:8080/is_drowsy"

# Get the image path from the argument
IMAGE_FILE="$1"

# Check if the file exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "Image file not found: $IMAGE_FILE"
  exit 1
fi

# Encode the image to base64
BASE64_IMAGE=$(base64 -w 0 "$IMAGE_FILE")

# Create a temporary file for the JSON payload
JSON_FILE=$(mktemp)
echo "{\"base64_image\":\"$BASE64_IMAGE\"}" > "$JSON_FILE"

# Send the POST request using curl and the JSON file
curl -X POST -H "Content-Type: application/json" -d "@$JSON_FILE" "$URL"

# Remove the temporary JSON file
rm "$JSON_FILE"
