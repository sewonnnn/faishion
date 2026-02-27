<img width="1147" height="270" alt="image" src="https://github.com/user-attachments/assets/17863a83-525e-42fb-9f79-fadebcfe4f83" />


# AI 가상 피팅 쇼핑몰, fAIshion

AI 기반 가상 피팅 기능이 포함된 풀스택 쇼핑몰 프로젝트입니다.  
일반 사용자, 판매자, 관리자 권한에 따라 각각 다른 화면과 기능을 제공합니다.

> 본 프로젝트는 학습 및 포트폴리오 목적의 데모 쇼핑몰입니다.

---

## 📺 시연 영상
👉

[📄 프로젝트 문서 (PDF 보기)](https://github.com/sewonnnn/faishion/blob/master/fAIshion_Team_Project.pdf)


## 📌 주요 기능
- 회원 관리(일반·소셜 로그인, 권한 제어)
- AI 기반 가상 피팅 및 스타일 추천
- 판매자/상품 관리(판매자 회원가입, 상품 등록·수정·삭제)
- 결제·배송 연동(토스페이먼트, 배송 조회 API)
- 관리자 페이지(회원·상품·게시글·신고 관리)

### ✅ 공통 기능
- 메인 페이지: 배너, 추천 상품, 카테고리 기반 상품 목록
- 검색/필터: 키워드 + 가격, 사이즈, 성별 필터
- 상품 상세: 옵션(색상/사이즈), 재고, 예상 배송일, 관심상품 등록
- 리뷰/QnA 게시판: 별점, 이미지 리뷰 / 문의 작성 및 답변
- 장바구니: 수량/옵션 변경, 삭제
- 주문 및 결제: 주문서 작성, 토스페이먼츠 테스트 결제 연동
- 공지사항/QnA 게시판: 관리자/사용자 등록, 수정, 삭제 가능

---

### 🧍‍♂️ 일반 사용자 (회원)
- 회원가입 (이메일 또는 휴대폰 인증)
- 로그인 / 로그아웃
- 마이페이지: 주문 내역, 송장 조회, 관심상품, 계정정보 수정
- 원하는 상품 선택 후 AI 옷 입어보기를 클릭하면 간접적으로 피팅 가능
- 상품 검색 및 구매

---

### 🛒 판매자
- 사업자 인증 기반 회원가입
- 로그인 후 판매자 전용 페이지 접속
- 상품 등록/수정/삭제, 재고 및 가격 관리
- 본인 상품에 대한 주문 현황 및 송장 등록
- QnA 게시판 조회 가능

---

### 🛠️ 관리자
- 관리자 전용 로그인 (별도 경로)
- 추천 상품 관리
- 판매자 목록 및 신고 관리 (영업 종료 처리)
- 쇼핑몰 카테고리 관리
- 공지사항 및 QnA 게시판 관리

---

### 👕 AI 가상 피팅 기능
- 상품 상세 페이지에서 "바로 옷 입어보기" 버튼 클릭 시, 가상의 피팅 기능 제공
- 사용자의 키, 몸무게 입력값 기반으로 옷 착용 시뮬레이션 제공 (간단한 테스트 구현)

---

## ⚙️ 기술 스택

### 🧠 AI
- [Gemini 2.5 Flash Image (가상 피팅, 이미지 생성)]


### 🔑 API
- [인증/보안: 네이버 OAuth2, 카카오 OAuth2]
- [결제/배송: 토스페이먼츠,우편번호 API]
- [회원·사업자 관리: Kakao 주소 API, 국세청 사업자 등록 조회 API]

### 🖥️ Frontend
- HTML5, CSS3, JavaScript 
-  React, React-Bootstarp
- Axios (API 통신)

### 🖥️ Backend
- Java (Spring Boot)
- Spring Security (인증/인가)
- Spring Data JPA (DB 연동)

### 🗄️ Database
- MySQL / JPA

### 🔐 Cloud & Deployment
- AWS (EC2, S3), GitHub, 
IntelliJ IDEA, VSCode

---

---

## 🚀 실행 방법

### 로컬 개발

MySQL만 Docker로 실행하고, 프론트엔드와 백엔드는 직접 실행합니다.

```bash
# 1. MySQL 실행
docker compose -f docker-compose.local.yml up -d

# 2. 백엔드 실행
cd backend
./gradlew bootRun

# 3. 프론트엔드 실행
cd frontend
npm install
npm run dev
```

---

### 서버 배포

**최초 1회 - 서버 세팅**

#### 1. 도메인 설정 (가비아)

새 EC2 인스턴스를 생성한 후, 가비아 DNS 관리 페이지에서 A 레코드를 새 인스턴스의 퍼블릭 IP로 업데이트합니다.

DNS 전파가 완료될 때까지 아래 명령어로 확인합니다.

```bash
# 새 IP로 바뀔 때까지 반복 확인
nslookup 도메인명
```

#### 2. 서버 초기화

DNS가 새 IP로 반영된 것을 확인한 후 SSH로 접속해 init.sh를 실행합니다.
Docker, Swap, SSL 인증서 설치 및 .env 생성까지 자동으로 진행됩니다.

```bash
curl -sSL https://raw.githubusercontent.com/sewonnnn/faishion/master/init.sh -o init.sh
sudo bash init.sh
```

#### 3. 초기 데이터 준비

컨테이너 실행 전, 초기 DB 데이터와 업로드 이미지를 서버에 배치해야 합니다.

```bash
# dump.sql을 /home/ubuntu/mysql-init/ 에 복사 (로컬 → 서버)
scp -i <키파일.pem> dump.sql ubuntu@<서버IP>:/home/ubuntu/mysql-init/dump.sql

# 업로드 이미지 폴더를 /home/ubuntu/upload/ 에 복사 (로컬 → 서버)
scp -i <키파일.pem> -r upload/ ubuntu@<서버IP>:/home/ubuntu/upload/
```

> `dump.sql`은 MySQL 컨테이너 초기화 시 자동으로 실행됩니다.
> `upload/` 폴더는 컨테이너와 bind mount되어 업로드 이미지를 영속적으로 유지합니다.

#### 4. 컨테이너 실행

세팅 완료 후 `/home/ubuntu`로 이동해 컨테이너를 실행합니다.

```bash
# sudo 필요: certbot 인증서(/etc/letsencrypt/)가 root 소유이므로 Docker가 읽으려면 root 권한이 필요합니다.
sudo docker-compose up -d
```

**이후 배포**

`master` 브랜치에 push하면 GitHub Actions가 자동으로 이미지를 빌드해 GHCR에 push합니다.
서버에서 아래 명령어로 최신 이미지를 반영합니다.

```bash
sudo docker-compose pull && sudo docker-compose up -d
```

---

### 📌 개발자 노트

사용자 권한 별 기능을 구분하고, 실제 쇼핑몰과 유사한 흐름을 구현했습니다.

AI 가상 피팅 기능은 추후 고도화 예정입니다.

토스페이먼츠 테스트 결제는 실제 결제 연동 전 테스트용으로 활용하였습니다.

📧 Contact
👤 팀 구성: [박세원, 유부미, 이현호, 권택준]







