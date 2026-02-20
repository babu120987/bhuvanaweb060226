FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default html
RUN rm -rf /usr/share/nginx/html/*

FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 1000

CMD ["nginx", "-g", "daemon off;"]
