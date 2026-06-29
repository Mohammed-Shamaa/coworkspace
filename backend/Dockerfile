FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY Coworkspace.API.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 \
    libgdiplus \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app .
CMD ["dotnet", "Coworkspace.API.dll"]
