FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Coworkspace.API.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
# Port is configured at runtime via Render's PORT env var (handled by Program.cs)
EXPOSE $PORT
ENTRYPOINT ["dotnet", "Coworkspace.API.dll"]
