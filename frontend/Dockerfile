# Stage 1: 애플리케이션 빌드
FROM node:18-alpine AS build
WORKDIR /app

# 캐시 효율을 높이기 위해 의존성 파일을 먼저 복사합니다.
# package.json, package-lock.json 파일이 변경되지 않으면 이 단계는 캐시를 사용합니다.
COPY package.json ./
COPY package-lock.json ./

# 의존성 설치
RUN npm install

# 모든 소스 코드를 복사합니다. 이 단계는 소스 코드가 변경될 때마다 재실행됩니다.
COPY . .

# React 애플리케이션 빌드
RUN npm run build

# Stage 2: NGINX를 이용해 정적 파일 서빙
FROM nginx:alpine

# 빌드된 파일을 NGINX의 정적 파일 경로로 복사합니다.
COPY --from=build /app/dist /usr/share/nginx/html

# 80 포트를 외부에 노출합니다.
EXPOSE 80

# NGINX 설정 파일을 커스텀하는 경우, 아래 주석을 해제하고 사용합니다.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# NGINX를 백그라운드가 아닌 포그라운드에서 실행합니다.
CMD ["nginx", "-g", "daemon off;"]