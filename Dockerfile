FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

WORKDIR /src

# Copy the Razor Pages project
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# DEBUG: Verify token is set (using simpler syntax)
RUN echo "=== DEBUG: Checking GH_PAT ===" && \
    echo "GH_PAT length: " $(echo ${GH_PAT} | wc -c) && \
    if [ -z "$GH_PAT" ]; then \
        echo "? ERROR: GH_PAT is empty or not set!" && exit 1; \
    else \
        echo "? SUCCESS: GH_PAT is set"; \
    fi

# Copy csproj and restore - use explicit sources
COPY --link /RazorPageBusinessWebsite/*.csproj .

# Restore with explicit sources
RUN echo "=== Restoring with explicit sources ===" && \
    dotnet restore -a $TARGETARCH \
        --source "https://asifblackpool:${GH_PAT}@nuget.pkg.github.com/asifblackpool/index.json" \
        --source "https://api.nuget.org/v3/index.json"

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