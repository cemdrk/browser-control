FROM lscr.io/linuxserver/chromium:latest
USER root

COPY ./conf/autostart /defaults/autostart
RUN chmod +x /defaults/autostart

# install node 22 (current LTS)
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update && apt-get install -y nodejs

# install mcp
RUN mkdir /.app && chown abc:abc /.app

COPY --chown=abc:abc ./mcp/package*.json  /.app

RUN cd /.app && npm install --verbose

COPY --chown=abc:abc ./mcp /.app
