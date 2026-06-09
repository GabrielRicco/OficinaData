# Build unico: compila o frontend (React/Vite), embute no backend (Spring Boot)
# e gera uma imagem que serve a API e o site na mesma origem.

# ---- Stage 1: build do frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: build do backend (jar com o frontend embutido em /static) ----
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /app/dist ./src/main/resources/static
RUN mvn -B -q -DskipTests package

# ---- Stage 3: runtime ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70"
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
