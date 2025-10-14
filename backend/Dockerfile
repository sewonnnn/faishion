# 1단계: 빌드 환경 설정 (BUILD_IMAGE)
FROM gradle:7.5.1-jdk17 AS build

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# Gradle Wrapper 스크립트와 빌드에 필요한 파일을 개별적으로 복사합니다.
# 이 파일들은 소스 코드보다 변경 빈도가 낮아 캐시 효율을 높일 수 있습니다.
COPY gradlew .
COPY gradlew.bat .
COPY settings.gradle .
COPY build.gradle .
COPY gradle/ gradle/

# gradlew 파일에 실행 권한을 부여합니다.
RUN chmod +x gradlew

# 의존성 다운로드를 먼저 실행하여 캐시를 생성합니다.
# 소스 코드가 변경되어도 이 단계는 재사용될 가능성이 높습니다.
RUN ./gradlew dependencies

# 소스 코드를 복사합니다.
# 이 단계는 소스 코드가 변경될 때마다 재실행됩니다.
COPY src/ src/

# 빌드 명령을 실행합니다.
RUN ./gradlew clean build -x test

# 2단계: 실행 환경 설정 (RUNNER_IMAGE)
FROM openjdk:17-jdk-slim

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# --- 디버깅용: COPY 이전에 /app 디렉토리의 파일 목록을 확인합니다. ---
RUN ls -l /app
# --- 디버깅용 끝 ---

# 1단계에서 빌드된 JAR 파일을 최종 이미지로 복사합니다.
COPY --from=build /app/build/libs/app.jar app.jar

# --- 디버깅용: COPY 이후에 /app 디렉토리의 파일 목록을 확인합니다. ---
RUN ls -l /app
# --- 디버깅용 끝 ---

RUN chmod u+x app.jar

# Docker 컨테이너 실행 시 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]