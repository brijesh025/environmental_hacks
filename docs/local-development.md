# Local development

## What is already available

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health endpoint: `http://localhost:4000/api/health`

## First-time setup

From PowerShell at the repository root:

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Then edit the two local environment files.

### `backend/.env`

```text
PORT=4000
AWS_REGION=the-region-where-your-amazon-location-resources-are-available
AWS_PROFILE=the-local-aws-profile-name
FRONTEND_ORIGIN=http://localhost:3000
```

The backend uses the AWS SDK default credential chain. Set `AWS_PROFILE` if the credentials are in a named local profile; otherwise leave it empty and use the default profile or another safe environment credential mechanism. Do not put secret access keys in this repository or in frontend variables.

### `frontend/.env.local`

```text
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_AMAZON_LOCATION_REGION=the-map-region
NEXT_PUBLIC_AMAZON_LOCATION_API_KEY=restricted-browser-api-key
NEXT_PUBLIC_AMAZON_LOCATION_MAP_STYLE=Standard
```

The browser key is intended for map access only and must be restricted to local/deployed frontend origins when the Amazon Location key is created.

## Start both applications

From the repository root:

```powershell
npm run dev
```

Or use two PowerShell windows:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

## What is needed from the user for real map and route data

1. AWS region for Amazon Location.
2. Safe local AWS credential method for the backend, preferably an AWS profile or an existing environment credential mechanism.
3. Restricted Amazon Location browser API key for the map.
4. First city/geography to use for manual route searches.

AWS CLI and SAM are not required for the current local prototype phase.
