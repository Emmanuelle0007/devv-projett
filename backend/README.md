# IRMA Travel Backend

Backend NestJS separe du frontend pour l'application de reservation d'hotels/voyages.

## Fonctionnalites

- API REST modulaire avec NestJS.
- Base relationnelle SQLite avec TypeORM.
- Entites: utilisateurs, hotels, chambres, reservations.
- CRUD complet sur les ressources principales.
- Authentification JWT.
- RBAC: roles `admin` et `user`.
- DTO avec `class-validator`.
- Routes protegees et codes HTTP NestJS.
- Documentation Swagger: `http://localhost:3000/api/docs`.
- API externe gratuite: REST Countries pour enrichir les destinations.
- Seed automatique: `admin@irma.com / admin123` et quelques hotels/chambres.

## Installation

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

L'API demarre sur `http://localhost:3000/api`.

## Authentification

### Inscription client

`POST /api/auth/register`

```json
{
  "name": "Jean Dupont",
  "email": "jean@irma.com",
  "password": "pass123"
}
```

### Connexion

`POST /api/auth/login`

```json
{
  "email": "admin@irma.com",
  "password": "admin123"
}
```

La reponse contient `accessToken`. Pour les routes protegees:

```http
Authorization: Bearer <accessToken>
```

## Endpoints Principaux

### Hotels

- `GET /api/hotels` public.
- `GET /api/hotels/:id` public.
- `POST /api/hotels` admin.
- `PATCH /api/hotels/:id` admin.
- `DELETE /api/hotels/:id` admin.

Exemple:

```json
{
  "name": "Plaza Athenee",
  "city": "Paris",
  "stars": 5,
  "status": "Actif"
}
```

### Chambres

- `GET /api/rooms` public.
- `GET /api/rooms/:id` public.
- `POST /api/rooms` admin.
- `PATCH /api/rooms/:id` admin.
- `DELETE /api/rooms/:id` admin.

Exemple:

```json
{
  "hotelId": 1,
  "type": "Suite Presidentielle",
  "pricePerNight": 850,
  "available": true
}
```

### Reservations

- `POST /api/reservations` admin ou user.
- `GET /api/reservations` admin.
- `GET /api/reservations/user/:userId` admin ou proprietaire.
- `GET /api/reservations/:id` admin.
- `PATCH /api/reservations/:id` admin.
- `DELETE /api/reservations/:id` admin.

Exemple:

```json
{
  "userId": 2,
  "roomId": 1,
  "arrivalDate": "2026-07-15",
  "departureDate": "2026-07-20"
}
```

### Utilisateurs

Routes reservees admin:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### API externe

Route protegee par JWT:

- `GET /api/external/countries/:countryName`

Exemple: `/api/external/countries/senegal`

## Notes

SQLite est choisi pour faciliter la presentation. Pour une base MySQL ou PostgreSQL, il suffit de modifier la configuration TypeORM dans `src/app.module.ts`.
