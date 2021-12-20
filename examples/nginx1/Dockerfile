FROM jonneywu/distributed-nginx:1

COPY dist1 /usr/share/nginx/html
COPY enterpoint.sh /docker-entrypoint.d/enterpoint.sh
RUN chmod +x /docker-entrypoint.d/enterpoint.sh

