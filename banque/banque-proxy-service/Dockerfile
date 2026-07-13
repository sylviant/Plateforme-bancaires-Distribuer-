FROM eclipse-temurin:21-jdk-jammy
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8079
ENTRYPOINT ["java", "-jar", "app.jar"]