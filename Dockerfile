<<<<<<< HEAD
# Use lightweight NGINX image
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy all website files to nginx web root
COPY . /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Start NGINX in foreground
=======
# Use official lightweight nginx image
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy project HTML/CSS/JS files to nginx web directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx when container runs
>>>>>>> 851c10f (Jenkinsfile added)
CMD ["nginx", "-g", "daemon off;"]
