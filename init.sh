#!/bin/bash

# =============================================================
# Faishion 서버 최초 세팅 스크립트 (Ubuntu 기준)
# 서버에서 실행:
#   sudo bash <(curl -sSL https://raw.githubusercontent.com/sewonnnn/faishion/master/init.sh)
# =============================================================

set -e  # 에러 발생 시 즉시 중단

# ------------------------------------------
# 입력값 받기
# ------------------------------------------
read -p "도메인 (예: example.com): " DOMAIN
read -p "이메일 (SSL 인증서 발급용): " EMAIL
read -p "Swap 크기 (예: 2G, 4G): " SWAP_SIZE
read -p "DB 비밀번호: " DB_PASSWORD
read -p "JWT Secret: " JWT_SECRET
read -p "Google API Key: " GOOGLE_API_KEY
read -p "Naver Client ID: " NAVER_CLIENT_ID
read -p "Naver Client Secret: " NAVER_CLIENT_SECRET
read -p "BIZ API Key: " BIZ_API_KEY

# ------------------------------------------
# 1. 패키지 업데이트
# ------------------------------------------
echo "[1/6] 패키지 업데이트..."
apt-get update -y
apt-get upgrade -y

# ------------------------------------------
# 2. Docker 설치
# ------------------------------------------
echo "[2/6] Docker 설치..."
apt-get install -y docker.io docker-compose-plugin curl
systemctl enable docker
systemctl start docker

# ------------------------------------------
# 3. Swap 설정
# ------------------------------------------
echo "[3/6] Swap 설정 (${SWAP_SIZE})..."
fallocate -l $SWAP_SIZE /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 재부팅 후에도 Swap 유지
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# ------------------------------------------
# 4. SSL 인증서 발급 (certbot)
# ------------------------------------------
echo "[4/6] SSL 인증서 발급..."
apt-get install -y certbot

# 80포트 사용 중인 프로세스 없어야 함
certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  -d $DOMAIN

# ------------------------------------------
# 5. docker-compose.yml 다운로드
# ------------------------------------------
echo "[5/6] docker-compose.yml 다운로드..."
curl -o /home/ubuntu/docker-compose.yml \
  https://raw.githubusercontent.com/sewonnnn/faishion/master/docker-compose.yml

# ------------------------------------------
# 6. .env 파일 생성
# ------------------------------------------
echo "[6/6] .env 파일 생성..."
cat > /home/ubuntu/.env <<EOF
DOMAIN=${DOMAIN}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
NAVER_CLIENT_ID=${NAVER_CLIENT_ID}
NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}
BIZ_API_KEY=${BIZ_API_KEY}
EOF

chmod 600 /home/ubuntu/.env

echo ""
echo "======================================"
echo " 세팅 완료!"
echo " 다음 단계: docker compose up -d"
echo "======================================"
