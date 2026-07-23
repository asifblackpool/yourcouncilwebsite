FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Build arguments for secrets
ARG GH_PAT
ARG PROJECT_API_ID
ARG ALIAS
ARG CONTENSIS_CLIENT_ID
ARG CONTENSIS_CLIENT_SECRET
ARG ACCESS_TOKEN
ARG BLOCK_ID

# Set environment variables
ENV GH_PAT=${GH_PAT} \
    PROJECT_API_ID=${PROJECT_API_ID} \
    ALIAS=${ALIAS} \
    CONTENSIS_CLIENT_ID=${CONTENSIS_CLIENT_ID} \
    CONTENSIS_CLIENT_SECRET=${CONTENSIS_CLIENT_SECRET} \
    ACCESS_TOKEN=${ACCESS_TOKEN} \
    BLOCK_ID=${BLOCK_ID}

WORKDIR /src

# Copy project files
COPY RazorPageYourCouncilWebsite/*.csproj ./RazorPageYourCouncilWebsite/

# Add GitHub Packages source
RUN dotnet nuget add source \
    --name github \
    --username asifblackpool \
    --password $GH_PAT \
    --store-password-in-clear-text \
    https://nuget.pkg.github.com/asifblackpool/index.json

# Show sources for debugging
RUN dotnet nuget list source

WORKDIR /src/RazorPageYourCouncilWebsite

# Restore packages (now can find Content.Modelling)
RUN dotnet restore

# Copy rest of code and publish
COPY RazorPageYourCouncilWebsite/. .
RUN dotnet publish --runtime linux-amd64 --self-contained false -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY manifest.json /manifest.json
ENTRYPOINT ["dotnet", "RazorPageYourCouncilWebsite.dll"]