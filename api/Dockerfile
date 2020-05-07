#### INIT
FROM node:12.16.1 as init

WORKDIR /app
COPY . .

#### BUILD
FROM init as build

RUN npm install
RUN npm run build

#### PROD
FROM init as prod

# copy build artifacts from 'build' stage
COPY --from=build /app/dist ./dist
RUN npm install --production
EXPOSE 3000
CMD echo "running Api in prod environment" && npm run serve

#### DEV
FROM init as dev

EXPOSE 3000
CMD echo "running Api in dev environment" && npm run start:watch
