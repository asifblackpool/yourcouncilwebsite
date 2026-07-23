# Use the official ASP.NET Core runtime as the base image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 443

# Use the SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Define build arguments for secrets (these are passed from GitHub Actions)
ARG GH_PAT
ARG PROJECT_API_ID
ARG ALIAS
ARG CONTENSIS_CLIENT_ID
ARG CONTENSIS_CLIENT_SECRET
ARG ACCESS_TOKEN
ARG BLOCK_ID

# Set environment variables from build arguments
ENV GH_PAT=${GH_PAT} \
    PROJECT_API_ID=${PROJECT_API_ID} \
    ALIAS=${ALIAS} \
    CONTENSIS_CLIENT_ID=${CONTENSIS_CLIENT_ID} \
    CONTENSIS_CLIENT_SECRET=${CONTENSIS_CLIENT_SECRET} \
    ACCESS_TOKEN=${ACCESS_TOKEN} \
    BLOCK_ID=${BLOCK_ID}

WORKDIR /src

# Copy the project file(s) and restore dependencies
COPY RazorPageYourCouncilWebsite/*.csproj ./RazorPageYourCouncilWebsite/
WORKDIR /src/RazorPageYourCouncilWebsite
RUN dotnet restore

# Copy the rest of the application code
COPY RazorPageYourCouncilWebsite/. .

# Publish the application
RUN dotnet publish --runtime linux-amd64 --self-contained false -o /app/publish

# Final stage - copy the published application
FROM base AS final
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Copy the manifest.json if needed
COPY manifest.json /manifest.json

# Set the entry point
ENTRYPOINT ["dotnet", "RazorPageYourCouncilWebsite.dll"]