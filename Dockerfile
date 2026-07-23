FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

WORKDIR /src

# Copy the Razor Pages project
COPY RazorPageYourCouncilWebsite/ ./RazorPageYourCouncilWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageYourCouncilWebsite

# Debug: Check if GH_PAT is received
RUN echo "=== DEBUG: GH_PAT length ===" && \
    echo ${#GH_PAT}

# Remove any existing GitHub sources
RUN echo "=== Removing existing sources ===" && \
    dotnet nuget remove source github 2>/dev/null || true && \
    dotnet nuget remove source github-asifblackpool 2>/dev/null || true && \
    dotnet nuget remove source github-auth 2>/dev/null || true

# Add the source with the token
RUN echo "=== Adding GitHub source with token ===" && \
    dotnet nuget add source https://nuget.pkg.github.com/asifblackpool/index.json \
        --name github \
        --username asifblackpool \
        --password "${GH_PAT}" \
        --store-password-in-clear-text

# List all sources to verify
RUN echo "=== All NuGet sources ===" && \
    dotnet nuget list source

# Copy csproj and restore
COPY --link /RazorPageYourCouncilWebsite/*.csproj .
RUN echo "=== Running dotnet restore ===" && \
    dotnet restore -a $TARGETARCH

COPY --link /RazorPageYourCouncilWebsite/. .
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
ENTRYPOINT ["dotnet", "RazorPageYourYourCouncilWebsite.dll"]