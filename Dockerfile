FROM nginx:1.15-alpine
COPY dist/hypertrace-core-ui /usr/share/nginx/html
