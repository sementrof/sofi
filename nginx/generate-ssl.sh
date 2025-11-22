#!/bin/bash

# Create ssl directory if it doesn't exist
mkdir -p nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=RU/ST=State/L=City/O=SOFI/CN=localhost"

echo "SSL certificates generated successfully!"
echo "Certificate: nginx/ssl/cert.pem"
echo "Private key: nginx/ssl/key.pem"
echo ""
echo "Note: This is a self-signed certificate for development."
echo "Your browser will show a security warning. Click 'Advanced' and 'Proceed to localhost' to continue."

