#### INIT
FROM node:12.16.1 as init

WORKDIR /app
COPY . .
RUN npm install

#### TEST
FROM init as test
# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable

# # run tests
# RUN npm run test
# RUN npm run e2e

#### BUILD
FROM init as build
RUN npm run build

#### DEV
FROM init as dev
EXPOSE 4200
CMD npm start

#### PROD
FROM nginx:1.16.1-alpine as prod

# copy build artifacts from 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
