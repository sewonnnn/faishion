# =============================================================
# Stage 1: React 빌드
#   - Node 20 Alpine 이미지로 의존성 설치 및 프로덕션 빌드
#   - 빌드 결과물(dist/)만 다음 스테이지로 전달
# =============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 파일만 먼저 복사해 레이어 캐시 활용
COPY package*.json ./
RUN npm ci

# 소스 복사 후 프로덕션 빌드
COPY . .
RUN npm run build

# =============================================================
# Stage 2: nginx 서빙
#   - 빌드된 정적 파일을 nginx로 서빙
#   - SSL 인증서는 docker-compose에서 볼륨으로 마운트
# =============================================================
FROM nginx:alpine

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# HTTP(80), HTTPS(443) 포트 노출
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
