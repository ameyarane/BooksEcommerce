# Stage 1: Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Stage 2: Build & Restore
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# (Optional) Uncomment & set if behind a proxy
# ENV HTTP_PROXY=http://yourproxy:yourport
# ENV HTTPS_PROXY=http://yourproxy:yourport

# Copy only the project files for restore
COPY ["Backend/BooksEcommerce.Api/BooksEcommerce.Api.csproj", "BooksEcommerce.Api/"]
COPY ["Backend/BooksEcommerce.Core/BooksEcommerce.Core.csproj", "BooksEcommerce.Core/"]
COPY ["Backend/BooksEcommerce.Data/BooksEcommerce.Data.csproj", "BooksEcommerce.Data/"]

RUN dotnet restore "BooksEcommerce.Api/BooksEcommerce.Api.csproj"

# Copy the rest of the source code
COPY Backend/. .

WORKDIR "/src/BooksEcommerce.Api"
RUN dotnet build "BooksEcommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "BooksEcommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BooksEcommerce.Api.dll"]
