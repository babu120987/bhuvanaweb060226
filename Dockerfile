FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/* \
    && rm -f /etc/nginx/conf.d/default.conf

COPY frontend/*.html /usr/share/nginx/html/
COPY frontend/perfume.jpg /usr/share/nginx/html/perfume.jpg
COPY frontend/css /usr/share/nginx/html/css
COPY frontend/js /usr/share/nginx/html/js
COPY frontend/img/buva /usr/share/nginx/html/img/buva
COPY admin /usr/share/nginx/html/admin
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
