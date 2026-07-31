FROM public.ecr.aws/docker/library/node:22-alpine

# Install unzip for extracting the migration artifact downloaded from S3
RUN apk add --no-cache unzip

WORKDIR /app

# Install runtime dependencies during CI/build so they are baked into the image.
# These are NOT installed at deployment time.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --quiet

COPY run-migrations.mjs ./

ENTRYPOINT ["node", "/app/run-migrations.mjs"]
