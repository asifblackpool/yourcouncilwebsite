FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
ARG GH_PAT

WORKDIR /src

# Copy the Razor Pages project
COPY RazorPageBusinessWebsite/ ./RazorPageBusinessWebsite/

# Set working directory to the web project
WORKDIR /src/RazorPageBusinessWebsite

# Debug: Check if GH_PAT is received
RUN echo "=== DEBUG: GH_PAT length ===" && \
    echo ${#GH_PAT}

# Create NuGet.Config from template by replacing the token
RUN if [ -f "NuGet.Config.template" ]; then \
        echo "Found NuGet.Config.template, creating NuGet.Config..."; \
        sed "s/REPLACE_WITH_TOKEN/${GH_PAT}/g" NuGet.Config.template > NuGet.Config; \
        echo "? NuGet.Config created successfully"; \
    else \
        echo "? NuGet.Config.template not found!"; \
        exit 1; \
    fi

# Debug: Show NuGet.Config content (mask token for security)
RUN echo "=== DEBUG: NuGet.Config content (token masked) ===" && \
    cat NuGet.Config | sed 's/value="[^"]*"/value="***"/g'

# Debug: Verify the file was created
RUN echo "=== DEBUG: Verifying NuGet.Config exists ===" && \
    ls -la NuGet.Config

# Copy csproj and restore
COPY --link /RazorPageBusinessWebsite/*.csproj .

# Restore with explicit reference to NuGet.Config
RUN echo "=== Running dotnet restore ===" && \
    dotnet restore -a $TARGETARCH --configfile NuGet.Config

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