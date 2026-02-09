# Use lightweight NGINX image
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy website files into nginx
COPY . /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
