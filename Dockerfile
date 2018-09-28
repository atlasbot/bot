FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# install deps that 
RUN apk add --virtual .gyp \
    python \
    make \
    g++ \
    git \
    && npm install \
    # todo: install git submodules somewhere around here
    # someone smarter then me might have to do that
    && apk del .gyp

# Bundle app source
COPY . .

# EXPOSE 8080
CMD [ "npm", "start" ]