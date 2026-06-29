FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

WORKDIR /src

# Copy the Razor Pages project
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# Debug: Verify GH_PAT is received
RUN echo "=== DEBUG: Checking GH_PAT ===" && \
    echo "GH_PAT length: $(echo ${GH_PAT} | wc -c)" && \
    if [ -z "$GH_PAT" ]; then \
        echo "? ERROR: GH_PAT is empty or not set!" && exit 1; \
    else \
        echo "? SUCCESS: GH_PAT is set"; \
    fi

# Create NuGet.Config with the token embedded (this is the most reliable method)
RUN echo '<?xml version="1.0" encoding="utf-8"?>' > NuGet.Config && \
    echo '<configuration>' >> NuGet.Config && \
    echo '  <packageSources>' >> NuGet.Config && \
    echo '    <add key="github" value="https://nuget.pkg.github.com/asifblackpool/index.json" />' >> NuGet.Config && \
    echo '    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />' >> NuGet.Config && \
    echo '  </packageSources>' >> NuGet.Config && \
    echo '  <packageSourceCredentials>' >> NuGet.Config && \
    echo '    <github>' >> NuGet.Config && \
    echo '      <add key="Username" value="asifblackpool" />' >> NuGet.Config && \
    echo '      <add key="ClearTextPassword" value="'${GH_PAT}'" />' >> NuGet.Config && \
    echo '    </github>' >> NuGet.Config && \
    echo '  </packageSourceCredentials>' >> NuGet.Config && \
    echo '</configuration>' >> NuGet.Config

# Debug: Show NuGet.Config (masking the token for security)
RUN echo "=== DEBUG: NuGet.Config content (token masked) ===" && \
    cat NuGet.Config | sed 's/value="[^"]*"/value="***"/g'

# Debug: Also show the actual token length to verify it was embedded
RUN echo "=== DEBUG: Verifying token was embedded ===" && \
    if grep -q "ClearTextPassword" NuGet.Config; then \
        echo "? ClearTextPassword found in NuGet.Config"; \
    else \
        echo "? ClearTextPassword NOT found in NuGet.Config"; \
        exit 1; \
    fi

# Copy csproj and restore
COPY --link /RazorPageBusinessWebsite/*.csproj .
RUN echo "=== Running dotnet restore ===" && \
    dotnet restore -a $TARGETARCH

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