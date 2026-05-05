# --- builder ---
FROM gradle:8.5-jdk21 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src
RUN gradle bootJar --no-daemon

# --- runtime ---
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java","-XX:+UseContainerSupport","-jar","/app/app.jar"]
