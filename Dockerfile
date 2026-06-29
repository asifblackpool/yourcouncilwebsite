FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

# Set the environment variable for NuGet.Config (it expects %GITHUB_PAT%)
ENV GITHUB_PAT=$GH_PAT

WORKDIR /src

# Copy the Razor Pages project (includes nuget.config)
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# Copy csproj and restore - NuGet.Config will use %GITHUB_PAT%
COPY --link /RazorPageBusinessWebsite/*.csproj .
RUN dotnet restore -a $TARGETARCH

COPY --link /RazorPageBusinessWebsite/. .
RUN dotnet publish --runtime linux-$TARGETARCH --self-contained false --no-restore -o /app/publish

#############################
FROM mcr.microsoft.com/dotnet/aspnet:8.0
ENV ASPNETCORE_URLS=http://*:3001
EXPOSE 3001
WORKDIR /app/publish
COPY --link --from=build /app/publish .
USER app
COPY --link /.env .
COPY ./manifest.json /manifest.json
ENTRYPOINT ["dotnet", "RazorPageBusinessWebsite.dll"]