FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY Coworkspace.API.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app -p:PublishReadyToRun=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 \
    libfreetype6 \
    libharfbuzz0b \
    libgdiplus \
    fontconfig \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
ENV DOTNET_EnableDiagnostics=0
WORKDIR /app
COPY --from=build /app .
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
