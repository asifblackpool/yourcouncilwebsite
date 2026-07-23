# Razor Page YourCouncil Website

## Requirements

### Visual Studio

* [Visual Studio 2022](https://visualstudio.microsoft.com/vs/#download) with the ASP.NET and web development workload.

### VS Code

* [Visual Studio Code](https://code.visualstudio.com/download)
* [C# for Visual Studio Code (latest version)](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)
* [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

## Run it


Create a `.env` file from this template:

```bash
# Copy this template and replace with your actual values
cat > .env << EOF
PROJECT_API_ID=your_project_api_id_here
ALIAS=your_alias_here
CONTENSIS_CLIENT_ID=your_client_id_here
CONTENSIS_CLIENT_SECRET=your_client_secret_here
ACCESS_TOKEN=your_access_token_here
BLOCK_ID=your_block_id_here
GH_PAT=your_github_pat_here
EOF

Change directory to RazorPageYourCouncilWebsite

```shell
cd RazorYourCouncilWebsite
```

Run with hot reloading

```shell
dotnet watch
```
