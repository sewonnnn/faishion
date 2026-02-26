# =============================================================
# Stage 1: Gradle 빌드
#   - JDK 17 Alpine 이미지로 Spring Boot 애플리케이션 빌드
#   - 테스트 스킵(-x test)으로 빌드 속도 향상
#   - 결과물: build/libs/app.jar
# =============================================================
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Gradle Wrapper 및 빌드 스크립트 먼저 복사해 의존성 캐시 활용
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 의존성 미리 다운로드 (소스 변경 시 캐시 재사용)
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

# 소스 복사 후 빌드
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# =============================================================
# Stage 2: 실행
#   - JDK 대신 경량 JRE 이미지 사용으로 이미지 크기 절감
#   - 업로드 파일 저장 디렉토리는 docker-compose에서 볼륨 마운트
# =============================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 업로드 디렉토리 생성
RUN mkdir -p /upload

# 빌드 스테이지에서 JAR만 복사
COPY --from=builder /app/build/libs/app.jar app.jar

# Spring Boot 기본 포트
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
