FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GITHUB_PAT

WORKDIR /src

# Copy the Razor Pages project (includes nuget.config)
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# Set the GitHub Packages credentials for restore
ENV GITHUB_PAT=$GITHUB_PAT

# ?? UPDATE: Update the existing GitHub source with the PAT
RUN dotnet nuget update source github-asifblackpool \
    --username asifblackpool \
    --password $GITHUB_PAT \
    --store-password-in-clear-text

# Restore and publish the project
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