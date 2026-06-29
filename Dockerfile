FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

WORKDIR /src

# Copy the Razor Pages project
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# Add GitHub source with token directly (bypasses NuGet.Config)
RUN dotnet nuget add source https://nuget.pkg.github.com/asifblackpool/index.json \
    --name github-asifblackpool \
    --username asifblackpool \
    --password ${GH_PAT} \
    --store-password-in-clear-text

# Copy csproj and restore
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