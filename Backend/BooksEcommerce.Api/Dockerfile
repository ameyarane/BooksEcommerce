# Use .NET 6.0 images
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Backend/BooksEcommerce.Api/BooksEcommerce.Api.csproj", "BooksEcommerce.Api/"]
COPY ["Backend/BooksEcommerce.Core/BooksEcommerce.Core.csproj", "BooksEcommerce.Core/"]
COPY ["Backend/BooksEcommerce.Data/BooksEcommerce.Data.csproj", "BooksEcommerce.Data/"]
RUN dotnet restore "BooksEcommerce.Api/BooksEcommerce.Api.csproj"
COPY Backend/. .
WORKDIR "/src/BooksEcommerce.Api"
RUN dotnet build "BooksEcommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "BooksEcommerce.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BooksEcommerce.Api.dll"]
